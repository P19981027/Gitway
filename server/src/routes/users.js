const express = require('express');
const { body } = require('express-validator');
const bcrypt = require('bcryptjs');
const { authMiddleware } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const db = require('../db/connection');

const router = express.Router();

router.use(authMiddleware);

router.get('/me', (req, res) => {
  res.json({ user: req.user });
});

router.put('/me',
  body('email').optional().isEmail(),
  body('phone').optional().matches(/^(\+?\d{10,15})$/),
  body('usdtDepositAddress').optional().isString().trim(),
  body('usdtWithdrawAddress').optional().isString().trim(),
  handleValidation,
  (req, res, next) => {
    try {
      const { email, phone, usdtDepositAddress, usdtWithdrawAddress } = req.body;
      if (email) {
        db.prepare('UPDATE users SET email = ?, updated_at = datetime("now") WHERE id = ?').run(email, req.user.id);
      }
      if (phone) {
        db.prepare('UPDATE users SET phone = ?, updated_at = datetime("now") WHERE id = ?').run(phone, req.user.id);
      }
      if (usdtDepositAddress !== undefined) {
        db.prepare('UPDATE users SET usdt_deposit_address = ?, updated_at = datetime("now") WHERE id = ?').run(usdtDepositAddress, req.user.id);
      }
      if (usdtWithdrawAddress !== undefined) {
        db.prepare('UPDATE users SET usdt_withdraw_address = ?, updated_at = datetime("now") WHERE id = ?').run(usdtWithdrawAddress, req.user.id);
      }
      const user = db.prepare('SELECT id, username, email, role, phone, phone_verified, email_verified, wallet_verified, cash_balance, withdrawable_cash, usdt_deposit_address, usdt_withdraw_address FROM users WHERE id = ?').get(req.user.id);
      res.json({ user });
    } catch (err) { next(err); }
  }
);

router.put('/password',
  body('currentPassword').notEmpty().withMessage('현재 비밀번호를 입력해주세요.'),
  body('newPassword').isLength({ min: 6 }).withMessage('새 비밀번호는 6자 이상이어야 합니다.'),
  handleValidation,
  (req, res, next) => {
    try {
      const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
      if (!bcrypt.compareSync(req.body.currentPassword, user.password_hash)) {
        return res.status(400).json({ message: '현재 비밀번호가 올바르지 않습니다.' });
      }
      const newHash = bcrypt.hashSync(req.body.newPassword, 12);
      db.prepare('UPDATE users SET password_hash = ?, updated_at = datetime("now") WHERE id = ?').run(newHash, req.user.id);
      res.json({ message: '비밀번호가 변경되었습니다.' });
    } catch (err) { next(err); }
  }
);

module.exports = router;
