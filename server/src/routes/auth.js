const express = require('express');
const { body } = require('express-validator');
const authSvc = require('../services/auth.service');
const { authMiddleware } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const { normalizePhone } = require('../utils/helpers');

const router = express.Router();

const PHONE_KR = /^(\+82|0)[\s-]*1\d[\s-]*\d{3,4}[\s-]*\d{4}$/;

router.post('/register',
  body('username').trim().isLength({ min: 3, max: 20 }).withMessage('사용자명은 3-20자여야 합니다.'),
  body('email').isEmail().withMessage('유효한 이메일을 입력해주세요.'),
  body('password').isLength({ min: 6 }).withMessage('비밀번호는 6자 이상이어야 합니다.'),
  body('phone').matches(PHONE_KR).withMessage('올바른 한국 휴대전화 번호를 입력해주세요. (예: 01012345678)'),
  handleValidation,
  (req, _res, next) => {
    const normalized = normalizePhone(req.body.phone);
    if (normalized) req.body.phone = normalized;
    next();
  },
  (req, res, next) => {
    try {
      const result = authSvc.register(req.body);
      res.status(201).json(result);
    } catch (err) { next(err); }
  }
);

router.post('/login',
  body('username').trim().notEmpty().withMessage('사용자명을 입력해주세요.'),
  body('password').notEmpty().withMessage('비밀번호를 입력해주세요.'),
  handleValidation,
  (req, res, next) => {
    try {
      const result = authSvc.login(req.body.username, req.body.password);
      res.json(result);
    } catch (err) { next(err); }
  }
);

router.post('/refresh', (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: '리프레시 토큰이 필요합니다.' });
    const result = authSvc.refreshToken(refreshToken);
    res.json(result);
  } catch (err) { next(err); }
});

router.post('/logout', authMiddleware, (req, res, next) => {
  try {
    authSvc.logout(req.user.id, req.body.refreshToken);
    res.json({ message: '로그아웃되었습니다.' });
  } catch (err) { next(err); }
});

module.exports = router;
