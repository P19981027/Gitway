const express = require('express');
const { body, query } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const orderSvc = require('../services/order.service');
const paymentSvc = require('../services/payment.service');

const router = express.Router();

router.use(authMiddleware);

router.post('/',
  body('variantId').isInt({ min: 1 }).withMessage('상품을 선택해주세요.'),
  body('quantity').isInt({ min: 1, max: 20 }).withMessage('수량은 1-20장입니다.'),
  body('paymentMethod').optional().isIn(['usdt', 'cash_balance']).withMessage('결제 방법을 선택해주세요.'),
  handleValidation,
  (req, res, next) => {
    try {
      const { order, cardName } = orderSvc.createOrder(req.user.id, req.body);
      res.status(201).json({ order, cardName });
    } catch (err) { next(err); }
  }
);

router.get('/',
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  handleValidation,
  (req, res, next) => {
    try {
      const result = orderSvc.getUserOrders(req.user.id, req.query.page || 1, req.query.limit || 20);
      res.json(result);
    } catch (err) { next(err); }
  }
);

router.get('/:id', (req, res, next) => {
  try {
    const order = orderSvc.getOrder(req.user.id, req.params.id);
    if (order.pin_numbers) {
      try { order.pins = JSON.parse(order.pin_numbers); } catch { order.pins = []; }
    }
    res.json({ order });
  } catch (err) { next(err); }
});

router.post('/:id/cancel', (req, res, next) => {
  try {
    const result = orderSvc.cancelOrder(req.user.id, req.params.id);
    res.json(result);
  } catch (err) { next(err); }
});

module.exports = router;
