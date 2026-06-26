const db = require('../db/connection');
const { NotFoundError, ValidationError } = require('../utils/errors');

function getWallet(userId) {
  const user = db.prepare('SELECT cash_balance, withdrawable_cash FROM users WHERE id = ?').get(userId);
  if (!user) throw new NotFoundError('사용자를 찾을 수 없습니다.');

  const usdtSettings = db.prepare("SELECT * FROM usdt_settings WHERE is_active = 1 ORDER BY id DESC LIMIT 1").get();

  return {
    cashBalance: user.cash_balance,
    withdrawableCash: user.withdrawable_cash,
    exchangeRate: usdtSettings?.exchange_rate || 1350,
    usdtAddress: usdtSettings?.receiving_address || '',
  };
}

function createDepositRequest(userId, { usdtAmount, usdtWalletAddress }) {
  const usdtSettings = db.prepare("SELECT * FROM usdt_settings WHERE is_active = 1 ORDER BY id DESC LIMIT 1").get();
  if (!usdtSettings) throw new NotFoundError('USDT 설정이 없습니다.');

  if (usdtAmount < usdtSettings.min_deposit) {
    throw new ValidationError(`최소 입금액은 ${usdtSettings.min_deposit} USDT입니다.`);
  }

  const krwAmount = Math.floor(usdtAmount * usdtSettings.exchange_rate);

  const result = db.prepare(`
    INSERT INTO wallet_requests (user_id, type, amount, krw_amount, exchange_rate, usdt_wallet_address, status)
    VALUES (?, 'deposit', ?, ?, ?, ?, 'pending')
  `).run(userId, usdtAmount, krwAmount, usdtSettings.exchange_rate, usdtWalletAddress);

  return {
    requestId: result.lastInsertRowid,
    usdtAmount,
    krwAmount,
    exchangeRate: usdtSettings.exchange_rate,
    receivingAddress: usdtSettings.receiving_address,
  };
}

function createWithdrawalRequest(userId, { krwAmount, usdtWalletAddress }) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (krwAmount > user.withdrawable_cash) {
    throw new ValidationError('출금 가능 금액을 초과했습니다.');
  }

  const usdtSettings = db.prepare("SELECT * FROM usdt_settings WHERE is_active = 1 ORDER BY id DESC LIMIT 1").get();
  if (!usdtSettings) throw new NotFoundError('USDT 설정이 없습니다.');

  const usdtAmount = Math.floor((krwAmount / usdtSettings.exchange_rate) * 100) / 100;

  if (usdtAmount < usdtSettings.min_withdrawal) {
    throw new ValidationError(`최소 출금액은 ${usdtSettings.min_withdrawal} USDT입니다.`);
  }

  const result = db.prepare(`
    INSERT INTO wallet_requests (user_id, type, amount, krw_amount, exchange_rate, usdt_wallet_address, status)
    VALUES (?, 'withdrawal', ?, ?, ?, ?, 'pending')
  `).run(userId, usdtAmount, krwAmount, usdtSettings.exchange_rate, usdtWalletAddress);

  db.prepare('UPDATE users SET withdrawable_cash = withdrawable_cash - ? WHERE id = ?').run(krwAmount, userId);

  return { requestId: result.lastInsertRowid, usdtAmount, krwAmount };
}

function getTransactions(userId, page = 1, limit = 20, type = null) {
  const offset = (page - 1) * limit;
  let query = 'SELECT * FROM wallet_transactions WHERE user_id = ?';
  const params = [userId];

  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const transactions = db.prepare(query).all(...params);
  const total = db.prepare('SELECT COUNT(*) as count FROM wallet_transactions WHERE user_id = ?').get(userId).count;

  return { transactions, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

function getWalletRequests(userId) {
  return db.prepare('SELECT * FROM wallet_requests WHERE user_id = ? ORDER BY created_at DESC').all(userId);
}

module.exports = { getWallet, createDepositRequest, createWithdrawalRequest, getTransactions, getWalletRequests };
