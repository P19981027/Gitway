const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/connection');
const config = require('../config');
const { ConflictError, UnauthorizedError, ValidationError } = require('../utils/errors');
const { normalizePhone } = require('../utils/helpers');

function generateTokens(user) {
  const payload = { sub: user.id, username: user.username, role: user.role };
  const accessToken = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.accessExpiry });
  const refreshToken = jwt.sign({ sub: user.id, type: 'refresh' }, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiry });
  return { accessToken, refreshToken };
}

function register({ username, email, password, phone, phoneVerified, emailVerified }) {
  if (!phone) throw new ValidationError('휴대전화 번호는 필수입니다.');
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) throw new ValidationError('올바른 한국 휴대전화 번호를 입력해주세요.');

  const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
  if (existing) {
    throw new ConflictError('이미 사용 중인 사용자명 또는 이메일입니다.');
  }

  const existingPhone = db.prepare('SELECT id FROM users WHERE phone = ?').get(normalizedPhone);
  if (existingPhone) throw new ConflictError('이미 등록된 전화번호입니다.');

  // Server-side verification check
  const emailVerifiedRecord = db.prepare(
    "SELECT id FROM verification_codes WHERE target = ? AND type = 'email' AND purpose = 'register' AND verified = 1 ORDER BY created_at DESC LIMIT 1"
  ).get(email);
  if (!emailVerifiedRecord) throw new ValidationError('이메일 인증이 완료되지 않았습니다.');

  const phoneVerifiedRecord = db.prepare(
    "SELECT id FROM verification_codes WHERE target = ? AND type = 'phone' AND purpose = 'register' AND verified = 1 ORDER BY created_at DESC LIMIT 1"
  ).get(normalizedPhone);
  if (!phoneVerifiedRecord) throw new ValidationError('전화번호 인증이 완료되지 않았습니다.');

  const passwordHash = bcrypt.hashSync(password, 12);

  const result = db.prepare(`
    INSERT INTO users (username, email, password_hash, phone, phone_verified, email_verified, role)
    VALUES (?, ?, ?, ?, ?, ?, 'member')
  `).run(username, email, passwordHash, normalizedPhone, 1, 1);

  const user = db.prepare('SELECT id, username, email, role, phone, phone_verified, email_verified, wallet_verified, cash_balance, withdrawable_cash, usdt_deposit_address, usdt_withdraw_address FROM users WHERE id = ?').get(result.lastInsertRowid);

  const tokens = generateTokens(user);

  db.prepare(`
    INSERT INTO user_sessions (user_id, refresh_token, ip_address, expires_at)
    VALUES (?, ?, ?, datetime('now', '+7 days'))
  `).run(user.id, tokens.refreshToken, '');

  db.prepare(`
    INSERT INTO notifications (user_id, type, title, content)
    VALUES (?, 'system', '회원가입 완료', ?)
  `).run(user.id, `${username}님, GiftWay 회원가입을 환영합니다!`);

  return { user, ...tokens };
}

function login(username, password) {
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1').get(username);
  if (!user) throw new UnauthorizedError('사용자명 또는 비밀번호가 올바르지 않습니다.');
  if (!bcrypt.compareSync(password, user.password_hash)) {
    throw new UnauthorizedError('사용자명 또는 비밀번호가 올바르지 않습니다.');
  }

  const tokens = generateTokens(user);

  db.prepare(`
    INSERT INTO user_sessions (user_id, refresh_token, ip_address, expires_at)
    VALUES (?, ?, ?, datetime('now', '+7 days'))
  `).run(user.id, tokens.refreshToken, '');

  const safeUser = {
    id: user.id, username: user.username, email: user.email, role: user.role,
    phone: user.phone,
    phone_verified: user.phone_verified, email_verified: user.email_verified, wallet_verified: user.wallet_verified,
    cash_balance: user.cash_balance, withdrawable_cash: user.withdrawable_cash,
    usdt_deposit_address: user.usdt_deposit_address, usdt_withdraw_address: user.usdt_withdraw_address,
  };

  return { user: safeUser, ...tokens };
}

function refreshToken(oldRefreshToken) {
  const session = db.prepare('SELECT * FROM user_sessions WHERE refresh_token = ? AND expires_at > datetime("now")').get(oldRefreshToken);
  if (!session) throw new UnauthorizedError('유효하지 않은 리프레시 토큰입니다.');

  const user = db.prepare('SELECT id, username, email, role, phone, phone_verified, email_verified, wallet_verified, cash_balance, withdrawable_cash, usdt_deposit_address, usdt_withdraw_address FROM users WHERE id = ? AND is_active = 1').get(session.user_id);
  if (!user) throw new UnauthorizedError('사용자를 찾을 수 없습니다.');

  db.prepare('DELETE FROM user_sessions WHERE refresh_token = ?').run(oldRefreshToken);

  const tokens = generateTokens(user);

  db.prepare(`
    INSERT INTO user_sessions (user_id, refresh_token, ip_address, expires_at)
    VALUES (?, ?, ?, datetime('now', '+7 days'))
  `).run(user.id, tokens.refreshToken, '');

  return { user, ...tokens };
}

function logout(userId, refreshToken) {
  if (refreshToken) {
    db.prepare('DELETE FROM user_sessions WHERE refresh_token = ? AND user_id = ?').run(refreshToken, userId);
  } else {
    db.prepare('DELETE FROM user_sessions WHERE user_id = ?').run(userId);
  }
}

module.exports = { register, login, refreshToken, logout, generateTokens };
