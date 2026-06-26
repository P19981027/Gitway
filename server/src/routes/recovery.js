const express = require('express');
const { body, query } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const db = require('../db/connection');

const router = express.Router();

router.use(authMiddleware);

router.post('/',
  body('cardNumber').trim().notEmpty().withMessage('카드번호를 입력해주세요.'),
  body('pinNumber').trim().notEmpty().withMessage('PIN 번호를 입력해주세요.'),
  body('cardType').optional().isString().trim(),
  handleValidation,
  (req, res, next) => {
    try {
      const { cardNumber, pinNumber, cardType } = req.body;

      const dup = db.prepare('SELECT id FROM card_recoveries WHERE user_id = ? AND card_number = ? AND pin_number = ? AND status != ?')
        .get(req.user.id, cardNumber, pinNumber, 'duplicate');
      if (dup) {
        const result = db.prepare(`
          INSERT INTO card_recoveries (user_id, card_number, pin_number, card_type, status, reward_amount)
          VALUES (?, ?, ?, ?, 'duplicate', 0)
        `).run(req.user.id, cardNumber, pinNumber, cardType || null);
        return res.status(201).json({
          id: result.lastInsertRowid,
          status: 'duplicate',
          rewardAmount: 0,
          message: '이미 등록된 카드/PIN 입니다.',
        });
      }

      const result = db.prepare(`
        INSERT INTO card_recoveries (user_id, card_number, pin_number, card_type, status, reward_amount)
        VALUES (?, ?, ?, ?, 'pending', 0)
      `).run(req.user.id, cardNumber, pinNumber, cardType || null);

      res.status(201).json({
        id: result.lastInsertRowid,
        status: 'pending',
        rewardAmount: 0,
        message: '회수 신청이 접수되었습니다. 관리자 검토 후 결과가 통보됩니다.',
      });
    } catch (err) { next(err); }
  }
);

router.get('/',
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  handleValidation,
  (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const rows = db.prepare(`
        SELECT id, card_number, pin_number, card_type, status, reward_amount, admin_note, processed_at, created_at
        FROM card_recoveries WHERE user_id = ?
        ORDER BY created_at DESC LIMIT ? OFFSET ?
      `).all(req.user.id, limit, offset);

      const masked = rows.map(r => ({
        ...r,
        card_number_masked: r.card_number && r.card_number.length >= 4
          ? '*'.repeat(Math.max(0, r.card_number.length - 4)) + r.card_number.slice(-4)
          : r.card_number,
        card_number: undefined,
        pin_number: undefined,
      }));

      const total = db.prepare('SELECT COUNT(*) AS c FROM card_recoveries WHERE user_id = ?').get(req.user.id).c;
      res.json({
        recoveries: masked,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    } catch (err) { next(err); }
  }
);

module.exports = router;
