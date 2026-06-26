const db = require('../db/connection');
const { sendSMS } = require('./sms.service');
const { sendVerificationEmail } = require('./email.service');
const { generateVerificationCode } = require('../utils/helpers');
const { ValidationError, ConflictError } = require('../utils/errors');

async function sendPhoneCode(phone, purpose) {
  const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
  if (purpose === 'register' && existing) throw new ConflictError('이미 등록된 전화번호입니다.');

  const recentCount = db.prepare(
    "SELECT COUNT(*) as count FROM verification_codes WHERE target = ? AND type = 'phone' AND created_at > datetime('now', '-1 hour')"
  ).get(phone).count;

  if (recentCount >= 5) throw new ValidationError('인증번호 요청 횟수를 초과했습니다. 1시간 후 다시 시도해주세요.');

  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  db.prepare(`
    INSERT INTO verification_codes (target, code, type, purpose, expires_at)
    VALUES (?, ?, 'phone', ?, ?)
  `).run(phone, code, purpose, expiresAt);

  const smsResult = await sendSMS(phone, code);

  const response = { message: '인증번호가 발송되었습니다.', expiresIn: 300 };
  if (smsResult?.devMode) response.devCode = code;
  return response;
}

async function verifyPhoneCode(phone, code, purpose) {
  const record = db.prepare(`
    SELECT * FROM verification_codes
    WHERE target = ? AND type = 'phone' AND purpose = ? AND verified = 0 AND expires_at > datetime('now')
    ORDER BY created_at DESC LIMIT 1
  `).get(phone, purpose);

  if (!record) throw new ValidationError('유효한 인증번호가 없습니다. 다시 발송해주세요.');

  if (record.attempts >= 5) throw new ValidationError('인증 시도 횟수를 초과했습니다. 다시 발송해주세요.');

  db.prepare('UPDATE verification_codes SET attempts = attempts + 1 WHERE id = ?').run(record.id);

  if (record.code !== code) throw new ValidationError('인증번호가 올바르지 않습니다.');

  db.prepare('UPDATE verification_codes SET verified = 1 WHERE id = ?').run(record.id);

  return { verified: true };
}

async function sendEmailCode(email, purpose) {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (purpose === 'register' && existing) throw new ConflictError('이미 등록된 이메일입니다.');

  const recentCount = db.prepare(
    "SELECT COUNT(*) as count FROM verification_codes WHERE target = ? AND type = 'email' AND created_at > datetime('now', '-1 hour')"
  ).get(email).count;

  if (recentCount >= 5) throw new ValidationError('인증번호 요청 횟수를 초과했습니다. 1시간 후 다시 시도해주세요.');

  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  db.prepare(`
    INSERT INTO verification_codes (target, code, type, purpose, expires_at)
    VALUES (?, ?, 'email', ?, ?)
  `).run(email, code, purpose, expiresAt);

  const emailResult = await sendVerificationEmail(email, code);

  const response = { message: '인증번호가 발송되었습니다.', expiresIn: 600 };
  if (emailResult?.devMode) response.devCode = code;
  return response;
}

async function verifyEmailCode(email, code, purpose) {
  const record = db.prepare(`
    SELECT * FROM verification_codes
    WHERE target = ? AND type = 'email' AND purpose = ? AND verified = 0 AND expires_at > datetime('now')
    ORDER BY created_at DESC LIMIT 1
  `).get(email, purpose);

  if (!record) throw new ValidationError('유효한 인증번호가 없습니다. 다시 발송해주세요.');

  if (record.attempts >= 5) throw new ValidationError('인증 시도 횟수를 초과했습니다. 다시 발송해주세요.');

  db.prepare('UPDATE verification_codes SET attempts = attempts + 1 WHERE id = ?').run(record.id);

  if (record.code !== code) throw new ValidationError('인증번호가 올바르지 않습니다.');

  db.prepare('UPDATE verification_codes SET verified = 1 WHERE id = ?').run(record.id);

  return { verified: true };
}

const UPDATE_PURPOSE = 'verify';

async function sendPhoneUpdateCode(userId, phone) {
  const existing = db.prepare('SELECT id FROM users WHERE phone = ? AND id != ?').get(phone, userId);
  if (existing) throw new ConflictError('이미 사용 중인 전화번호입니다.');

  return sendPhoneCode(phone, UPDATE_PURPOSE);
}

async function confirmPhoneUpdate(userId, phone, code) {
  await verifyPhoneCode(phone, code, UPDATE_PURPOSE);
  db.prepare('UPDATE users SET phone = ?, phone_verified = 1, updated_at = datetime(\'now\') WHERE id = ?').run(phone, userId);
  const user = db.prepare('SELECT id, username, email, phone, phone_verified, email_verified, role, cash_balance, withdrawable_cash FROM users WHERE id = ?').get(userId);
  return { verified: true, user };
}

async function sendEmailUpdateCode(userId, email) {
  const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, userId);
  if (existing) throw new ConflictError('이미 사용 중인 이메일입니다.');

  return sendEmailCode(email, UPDATE_PURPOSE);
}

async function confirmEmailUpdate(userId, email, code) {
  await verifyEmailCode(email, code, UPDATE_PURPOSE);
  db.prepare('UPDATE users SET email = ?, email_verified = 1, updated_at = datetime(\'now\') WHERE id = ?').run(email, userId);
  const user = db.prepare('SELECT id, username, email, phone, phone_verified, email_verified, role, cash_balance, withdrawable_cash FROM users WHERE id = ?').get(userId);
  return { verified: true, user };
}

module.exports = {
  sendPhoneCode,
  verifyPhoneCode,
  sendEmailCode,
  verifyEmailCode,
  sendPhoneUpdateCode,
  confirmPhoneUpdate,
  sendEmailUpdateCode,
  confirmEmailUpdate,
};
