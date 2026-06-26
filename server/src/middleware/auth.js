const jwt = require('jsonwebtoken');
const config = require('../config');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');
const db = require('../db/connection');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('로그인이 필요합니다.'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = db.prepare('SELECT id, username, email, role, phone, phone_verified, email_verified, wallet_verified, cash_balance, withdrawable_cash, usdt_deposit_address, usdt_withdraw_address FROM users WHERE id = ? AND is_active = 1').get(decoded.sub);
    if (!user) {
      return next(new UnauthorizedError('사용자를 찾을 수 없습니다.'));
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('토큰이 만료되었습니다.'));
    }
    return next(new UnauthorizedError('유효하지 않은 토큰입니다.'));
  }
}

function adminMiddleware(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: '인증이 필요합니다.' });
  }
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
  }
  next();
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = db.prepare('SELECT id, username, email, role, phone, phone_verified, email_verified, wallet_verified, cash_balance, withdrawable_cash, usdt_deposit_address, usdt_withdraw_address FROM users WHERE id = ? AND is_active = 1').get(decoded.sub);
      if (user) req.user = user;
    } catch {}
  }
  next();
}

module.exports = { authMiddleware, adminMiddleware, optionalAuth };
