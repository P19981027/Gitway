const express = require('express');
const { body, query } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const walletSvc = require('../services/wallet.service');

const router = express.Router();

router.use(authMiddleware);

router.get('/', (req, res, next) => {
  try {
    const result = walletSvc.getWallet(req.user.id);
    res.json(result);
  } catch (err) { next(err); }
});

router.post('/deposit-request',
  body('usdtAmount').isFloat({ min: 10 }).withMessage('최소 10 USDT 이상 입력해주세요.'),
  body('usdtWalletAddress').notEmpty().withMessage('USDT 지갑 주소를 입력해주세요.'),
  handleValidation,
  (req, res, next) => {
    try {
      const result = walletSvc.createDepositRequest(req.user.id, req.body);
      res.status(201).json(result);
    } catch (err) { next(err); }
  }
);

router.post('/withdraw-request',
  body('krwAmount').isInt({ min: 10000 }).withMessage('최소 10,000원 이상 입력해주세요.'),
  body('usdtWalletAddress').notEmpty().withMessage('USDT 출금 주소를 입력해주세요.'),
  handleValidation,
  (req, res, next) => {
    try {
      const result = walletSvc.createWithdrawalRequest(req.user.id, req.body);
      res.status(201).json(result);
    } catch (err) { next(err); }
  }
);

router.get('/transactions',
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('type').optional(),
  handleValidation,
  (req, res, next) => {
    try {
      const result = walletSvc.getTransactions(req.user.id, req.query.page || 1, req.query.limit || 20, req.query.type);
      res.json(result);
    } catch (err) { next(err); }
  }
);

router.get('/requests', (req, res, next) => {
  try {
    const result = walletSvc.getWalletRequests(req.user.id);
    res.json(result);
  } catch (err) { next(err); }
});

module.exports = router;
