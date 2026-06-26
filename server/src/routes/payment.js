const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const paymentSvc = require('../services/payment.service');

const router = express.Router();

router.use(authMiddleware);

router.get('/:orderId/usdt', async (req, res, next) => {
  try {
    const result = await paymentSvc.getUSDTPaymentDetails(req.user.id, req.params.orderId);
    res.json(result);
  } catch (err) { next(err); }
});

router.post('/:orderId/confirm', (req, res, next) => {
  try {
    const result = paymentSvc.confirmPayment(req.user.id, req.params.orderId);
    res.json(result);
  } catch (err) { next(err); }
});

router.get('/:orderId/status', (req, res, next) => {
  try {
    const result = paymentSvc.getPaymentStatus(req.user.id, req.params.orderId);
    res.json(result);
  } catch (err) { next(err); }
});

module.exports = router;
