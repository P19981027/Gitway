const express = require('express');
const { body } = require('express-validator');
const verificationSvc = require('../services/verification.service');
const { handleValidation } = require('../middleware/validate');
const { authMiddleware } = require('../middleware/auth');
const { normalizePhone } = require('../utils/helpers');

const router = express.Router();

const PHONE_KR = /^(\+82|0)[\s-]*1\d[\s-]*\d{3,4}[\s-]*\d{4}$/;

const normalizePhoneBody = (req, _res, next) => {
  if (req.body && typeof req.body.phone === 'string') {
    const normalized = normalizePhone(req.body.phone);
    if (normalized) req.body.phone = normalized;
  }
  next();
};

router.post('/phone/send',
  body('phone').matches(PHONE_KR).withMessage('올바른 한국 휴대전화 번호를 입력해주세요. (예: 01012345678)'),
  body('purpose').isIn(['register', 'login', 'reset_password']).withMessage('유효한 목적을 선택해주세요.'),
  handleValidation,
  normalizePhoneBody,
  async (req, res, next) => {
    try {
      const result = await verificationSvc.sendPhoneCode(req.body.phone, req.body.purpose);
      res.json(result);
    } catch (err) { next(err); }
  }
);

router.post('/phone/verify',
  body('phone').matches(PHONE_KR).withMessage('올바른 한국 휴대전화 번호를 입력해주세요. (예: 01012345678)'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('6자리 인증번호를 입력해주세요.'),
  body('purpose').isIn(['register', 'login', 'reset_password']).withMessage('유효한 목적을 선택해주세요.'),
  handleValidation,
  normalizePhoneBody,
  async (req, res, next) => {
    try {
      const result = await verificationSvc.verifyPhoneCode(req.body.phone, req.body.code, req.body.purpose);
      res.json(result);
    } catch (err) { next(err); }
  }
);

router.post('/email/send',
  body('email').isEmail().withMessage('유효한 이메일을 입력해주세요.'),
  body('purpose').isIn(['register', 'login', 'reset_password']).withMessage('유효한 목적을 선택해주세요.'),
  handleValidation,
  async (req, res, next) => {
    try {
      const result = await verificationSvc.sendEmailCode(req.body.email, req.body.purpose);
      res.json(result);
    } catch (err) { next(err); }
  }
);

router.post('/email/verify',
  body('email').isEmail().withMessage('유효한 이메일을 입력해주세요.'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('6자리 인증번호를 입력해주세요.'),
  body('purpose').isIn(['register', 'login', 'reset_password']).withMessage('유효한 목적을 선택해주세요.'),
  handleValidation,
  async (req, res, next) => {
    try {
      const result = await verificationSvc.verifyEmailCode(req.body.email, req.body.code, req.body.purpose);
      res.json(result);
    } catch (err) { next(err); }
  }
);

router.post('/phone/send-update',
  authMiddleware,
  body('phone').matches(PHONE_KR).withMessage('올바른 한국 휴대전화 번호를 입력해주세요. (예: 01012345678)'),
  handleValidation,
  normalizePhoneBody,
  async (req, res, next) => {
    try {
      const result = await verificationSvc.sendPhoneUpdateCode(req.user.id, req.body.phone);
      res.json(result);
    } catch (err) { next(err); }
  }
);

router.post('/phone/confirm-update',
  authMiddleware,
  body('phone').matches(PHONE_KR).withMessage('올바른 한국 휴대전화 번호를 입력해주세요. (예: 01012345678)'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('6자리 인증번호를 입력해주세요.'),
  handleValidation,
  normalizePhoneBody,
  async (req, res, next) => {
    try {
      const result = await verificationSvc.confirmPhoneUpdate(req.user.id, req.body.phone, req.body.code);
      res.json(result);
    } catch (err) { next(err); }
  }
);

router.post('/email/send-update',
  authMiddleware,
  body('email').isEmail().withMessage('유효한 이메일을 입력해주세요.'),
  handleValidation,
  async (req, res, next) => {
    try {
      const result = await verificationSvc.sendEmailUpdateCode(req.user.id, req.body.email);
      res.json(result);
    } catch (err) { next(err); }
  }
);

router.post('/email/confirm-update',
  authMiddleware,
  body('email').isEmail().withMessage('유효한 이메일을 입력해주세요.'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('6자리 인증번호를 입력해주세요.'),
  handleValidation,
  async (req, res, next) => {
    try {
      const result = await verificationSvc.confirmEmailUpdate(req.user.id, req.body.email, req.body.code);
      res.json(result);
    } catch (err) { next(err); }
  }
);

module.exports = router;
