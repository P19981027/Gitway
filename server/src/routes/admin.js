const express = require('express');
const { body, query } = require('express-validator');
const bcrypt = require('bcryptjs');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const db = require('../db/connection');
const orderSvc = require('../services/order.service');
const { sendPinEmail } = require('../services/email.service');
const { generateOrderNumber } = require('../utils/helpers');

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get('/dashboard', (req, res) => {
  try {
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role NOT IN ('admin', 'super_admin')").get().count;
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const totalRevenue = db.prepare("SELECT COALESCE(SUM(total_price), 0) as total FROM orders WHERE status = 'completed'").get().total;
    const pendingOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending' OR payment_status = 'awaiting_confirmation'").get().count;
    res.json({ totalUsers, totalOrders, totalRevenue, pendingOrders });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: err.message });
  }
});

router.get('/users', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  let query = 'SELECT id, username, email, phone, role, cash_balance, withdrawable_cash, is_active, phone_verified, email_verified, created_at FROM users WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (username LIKE ? OR email LIKE ? OR phone LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const total = db.prepare(`SELECT COUNT(*) as count FROM (${query})`).get(...params).count;
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const users = db.prepare(query).all(...params);
  res.json({ users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

router.put('/users/:id', (req, res, next) => {
  try {
    const { role, is_active, cash_balance, withdrawable_cash } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    if (user.username === 'admin' && req.body.role && req.body.role !== 'super_admin') {
      return res.status(400).json({ message: '최고 관리자의 권한을 변경할 수 없습니다.' });
    }

    if (role !== undefined) db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
    if (is_active !== undefined) db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(is_active ? 1 : 0, req.params.id);
    if (cash_balance !== undefined) db.prepare('UPDATE users SET cash_balance = ? WHERE id = ?').run(cash_balance, req.params.id);
    if (withdrawable_cash !== undefined) db.prepare('UPDATE users SET withdrawable_cash = ? WHERE id = ?').run(withdrawable_cash, req.params.id);

    db.prepare("UPDATE users SET updated_at = datetime('now') WHERE id = ?").run(req.params.id);
    res.json({ message: '사용자 정보가 업데이트되었습니다.' });
  } catch (err) { next(err); }
});

router.get('/orders', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const status = req.query.status;

  let query = `
    SELECT o.*, u.username, t.name as card_name
    FROM orders o
    JOIN users u ON o.user_id = u.id
    JOIN gift_card_types t ON o.gift_card_type_id = t.id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    query += ' AND o.status = ?';
    params.push(status);
  }

  query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, (page - 1) * limit);

  const orders = db.prepare(query).all(...params);
  res.json({ orders });
});

router.put('/orders/:id/status', (req, res, next) => {
  try {
    const { status } = req.body;
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ message: '주문을 찾을 수 없습니다.' });

    if (status === 'completed' && order.payment_status !== 'confirmed') {
      const result = orderSvc.confirmOrderPayment(req.params.id);

      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(order.user_id);
      if (user.email_verified && user.email) {
        const card = db.prepare('SELECT name FROM gift_card_types WHERE id = ?').get(order.gift_card_type_id);
        sendPinEmail(user.email, { orderNumber: order.order_number, productName: card.name, quantity: order.quantity }, result.pinNumbers).catch(() => {});
      }

      return res.json({ message: '주문이 확인되고 PIN 번호가 발급되었습니다.', pins: result.pinNumbers });
    }

    db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, req.params.id);
    res.json({ message: '주문 상태가 업데이트되었습니다.' });
  } catch (err) { next(err); }
});

router.post('/cash/send',
  body('userId').isInt(),
  body('amount').isInt({ min: 1 }),
  body('description').optional().trim(),
  handleValidation,
  (req, res, next) => {
    try {
      const { userId, amount, description } = req.body;
      const target = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      if (!target) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });

      db.prepare('UPDATE users SET cash_balance = cash_balance + ?, withdrawable_cash = withdrawable_cash + ? WHERE id = ?').run(amount, amount, userId);
      const updated = db.prepare('SELECT cash_balance, withdrawable_cash FROM users WHERE id = ?').get(userId);

      db.prepare(`
        INSERT INTO wallet_transactions (user_id, type, amount, balance_after, withdrawable_after, description)
        VALUES (?, 'admin_adjust', ?, ?, ?, ?)
      `).run(userId, amount, updated.cash_balance, updated.withdrawable_cash, description || `관리자 캐시 지급: ${amount.toLocaleString()}원`);

      res.json({ message: '캐시가 지급되었습니다.' });
    } catch (err) { next(err); }
  }
);

router.get('/usdt/settings', (req, res) => {
  const settings = db.prepare("SELECT * FROM usdt_settings WHERE is_active = 1 ORDER BY id DESC LIMIT 1").get();
  res.json({ settings });
});

router.put('/usdt/settings',
  body('receivingAddress').matches(/^T[A-HJ-NP-Za-km-z1-9]{33}$/).withMessage('유효한 TRC-20 주소를 입력해주세요. (T로 시작, 34자)'),
  body('exchangeRate').isFloat({ min: 1 }).withMessage('환율은 1 이상이어야 합니다.'),
  body('minDeposit').optional().isFloat({ min: 1 }),
  body('minWithdrawal').optional().isFloat({ min: 1 }),
  body('paymentTimeoutMinutes').optional().isInt({ min: 5, max: 120 }),
  handleValidation,
  (req, res, next) => {
    try {
      const { receivingAddress, exchangeRate, minDeposit, minWithdrawal, paymentTimeoutMinutes } = req.body;

      db.prepare("UPDATE usdt_settings SET is_active = 0 WHERE is_active = 1").run();

      db.prepare(`
        INSERT INTO usdt_settings (receiving_address, exchange_rate, min_deposit, min_withdrawal, payment_timeout_minutes, is_active, updated_by)
        VALUES (?, ?, ?, ?, ?, 1, ?)
      `).run(receivingAddress, exchangeRate, minDeposit || 10, minWithdrawal || 10, paymentTimeoutMinutes || 30, req.user.id);

      res.json({ message: 'USDT 설정이 업데이트되었습니다.' });
    } catch (err) { next(err); }
  }
);

router.get('/pins', (req, res) => {
  const variantId = req.query.variantId;
  let query = `
    SELECT p.*, v.face_value, t.name as card_name
    FROM gift_card_pins p
    JOIN gift_card_variants v ON p.gift_card_variant_id = v.id
    JOIN gift_card_types t ON v.gift_card_type_id = t.id
  `;
  const params = [];

  if (variantId) {
    query += ' WHERE p.gift_card_variant_id = ?';
    params.push(variantId);
  }

  query += ' ORDER BY p.created_at DESC LIMIT 100';
  const pins = db.prepare(query).all(...params);
  res.json({ pins });
});

router.post('/pins/batch',
  body('variantId').isInt(),
  body('pins').isArray({ min: 1 }),
  handleValidation,
  (req, res, next) => {
    try {
      const { variantId, pins } = req.body;
      const insert = db.prepare('INSERT INTO gift_card_pins (gift_card_variant_id, pin_number, card_number, status) VALUES (?, ?, ?, ?)');

      const insertMany = db.transaction((items) => {
        for (const item of items) {
          insert.run(variantId, item.pinNumber, item.cardNumber || null, 'available');
        }
      });

      insertMany(pins);
      res.status(201).json({ message: `${pins.length}개의 PIN이 등록되었습니다.` });
    } catch (err) { next(err); }
  }
);

router.post('/pins/push',
  body('userId').isInt(),
  body('variantId').isInt(),
  body('pinNumber').trim().notEmpty(),
  body('cardNumber').optional().trim(),
  body('note').optional().trim(),
  handleValidation,
  (req, res, next) => {
    try {
      const { userId, variantId, pinNumber, cardNumber, note } = req.body;

      const target = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      if (!target) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });

      const variant = db.prepare(`
        SELECT v.*, t.name as card_name, t.slug as card_slug
        FROM gift_card_variants v
        JOIN gift_card_types t ON v.gift_card_type_id = t.id
        WHERE v.id = ?
      `).get(variantId);
      if (!variant) return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });

      const orderNumber = generateOrderNumber();
      const pushTx = db.transaction(() => {
        const orderResult = db.prepare(`
          INSERT INTO orders (order_number, user_id, gift_card_type_id, variant_id, face_value, quantity, unit_price, total_price, payment_method, payment_status, status, payment_confirmed_at)
          VALUES (?, ?, ?, ?, ?, 1, 0, 0, 'admin_push', 'confirmed', 'completed', datetime('now'))
        `).run(orderNumber, userId, variant.gift_card_type_id, variantId, variant.face_value);
        const orderId = orderResult.lastInsertRowid;

        const pinResult = db.prepare(
          'INSERT INTO gift_card_pins (gift_card_variant_id, pin_number, card_number, status, sold_at, order_id) VALUES (?, ?, ?, ?, datetime(\'now\'), ?)'
        ).run(variantId, pinNumber, cardNumber || null, 'sold', orderId);
        const pinId = pinResult.lastInsertRowid;

        const pinNumbers = [{ card_number: cardNumber || null, pin_number: pinNumber }];
        db.prepare("UPDATE orders SET pin_numbers = ? WHERE id = ?").run(JSON.stringify(pinNumbers), orderId);

        const title = `카드 발급: ${variant.card_name}`;
        const content = `관리자 발급\n카드: ${variant.card_name} (₩${variant.face_value.toLocaleString()})\n카드번호: ${cardNumber || '-'}\nPIN: ${pinNumber}${note ? `\n비고: ${note}` : ''}`;
        db.prepare('INSERT INTO notifications (user_id, type, title, content, metadata) VALUES (?, ?, ?, ?, ?)').run(
          userId, 'pin_push', title, content,
          JSON.stringify({ orderId, pinId, variantId, cardNumber: cardNumber || null, pinNumber, note: note || '' })
        );

        return { orderId, pinId };
      });

      const { orderId } = pushTx();

      if (target.email_verified && target.email) {
        sendPinEmail(target.email,
          { orderNumber, productName: variant.card_name, quantity: 1 },
          [{ card_number: cardNumber || null, pin_number: pinNumber }]
        ).catch(() => {});
      }

      res.status(201).json({ message: '카드 번호가 발송되었습니다.', orderNumber, orderId });
    } catch (err) { next(err); }
  }
);

router.get('/wallet/requests', (req, res) => {
  const requests = db.prepare(`
    SELECT wr.*, u.username
    FROM wallet_requests wr
    JOIN users u ON wr.user_id = u.id
    WHERE wr.status = 'pending'
    ORDER BY wr.created_at DESC
  `).all();
  res.json({ requests });
});

router.put('/wallet/requests/:id',
  body('status').isIn(['approved', 'rejected']),
  body('adminNote').optional().trim(),
  handleValidation,
  (req, res, next) => {
    try {
      const { status, adminNote } = req.body;
      const request = db.prepare('SELECT * FROM wallet_requests WHERE id = ?').get(req.params.id);
      if (!request) return res.status(404).json({ message: '요청을 찾을 수 없습니다.' });

      db.prepare("UPDATE wallet_requests SET status = ?, admin_note = ?, reviewed_by = ?, reviewed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?")
        .run(status, adminNote || '', req.user.id, req.params.id);

      if (status === 'approved' && request.type === 'deposit') {
        db.prepare('UPDATE users SET cash_balance = cash_balance + ?, withdrawable_cash = withdrawable_cash + ?, wallet_verified = 1 WHERE id = ?').run(request.krw_amount, request.krw_amount, request.user_id);
        const updated = db.prepare('SELECT cash_balance, withdrawable_cash FROM users WHERE id = ?').get(request.user_id);
        db.prepare(`
          INSERT INTO wallet_transactions (user_id, type, amount, balance_after, withdrawable_after, description)
          VALUES (?, 'deposit', ?, ?, ?, ?)
        `).run(request.user_id, request.krw_amount, updated.cash_balance, updated.withdrawable_cash, `USDT 입금: ${request.amount} USDT`);
      }

      if (status === 'rejected' && request.type === 'withdrawal') {
        db.prepare('UPDATE users SET withdrawable_cash = withdrawable_cash + ? WHERE id = ?').run(request.krw_amount, request.user_id);
      }

      res.json({ message: `요청이 ${status === 'approved' ? '승인' : '거절'}되었습니다.` });
    } catch (err) { next(err); }
  }
);

router.post('/notifications/broadcast',
  body('title').trim().notEmpty(),
  body('content').trim().notEmpty(),
  handleValidation,
  (req, res, next) => {
    try {
      db.prepare('INSERT INTO notifications (user_id, type, title, content) VALUES (NULL, ?, ?, ?)').run('announcement', req.body.title, req.body.content);
      res.status(201).json({ message: '공지가 발송되었습니다.' });
    } catch (err) { next(err); }
  }
);

router.get('/notifications', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const rows = db.prepare(`
    SELECT n.*, u.username AS target_username
    FROM notifications n
    LEFT JOIN users u ON n.user_id = u.id
    ORDER BY n.created_at DESC
    LIMIT ? OFFSET ?
  `).all(limit, offset);
  const total = db.prepare('SELECT COUNT(*) AS c FROM notifications').get().c;
  res.json({ notifications: rows, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

router.delete('/notifications/:id', (req, res, next) => {
  try {
    const result = db.prepare('DELETE FROM notifications WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ message: '알림을 찾을 수 없습니다.' });
    db.prepare('DELETE FROM notification_reads WHERE notification_id = ?').run(req.params.id);
    res.json({ message: '삭제되었습니다.' });
  } catch (err) { next(err); }
});

router.get('/transactions', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;
  const type = req.query.type;
  let query = `
    SELECT wt.*, u.username, u.email, o.order_number
    FROM wallet_transactions wt
    JOIN users u ON wt.user_id = u.id
    LEFT JOIN orders o ON wt.order_id = o.id
    WHERE 1=1
  `;
  const params = [];
  if (type) { query += ' AND wt.type = ?'; params.push(type); }
  query += ' ORDER BY wt.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  const rows = db.prepare(query).all(...params);
  const countQuery = type
    ? "SELECT COUNT(*) AS c FROM wallet_transactions WHERE type = ?"
    : "SELECT COUNT(*) AS c FROM wallet_transactions";
  const total = db.prepare(countQuery).get(...(type ? [type] : [])).c;
  res.json({ transactions: rows, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

// --- Gift card management (CRUD for types + variants) ---

router.get('/giftcards', (req, res) => {
  const types = db.prepare(`
    SELECT t.*,
      (SELECT COUNT(*) FROM gift_card_variants v WHERE v.gift_card_type_id = t.id AND v.is_active = 1) AS variant_count,
      (SELECT COUNT(*) FROM gift_card_pins p JOIN gift_card_variants v ON p.gift_card_variant_id = v.id WHERE v.gift_card_type_id = t.id AND p.status = 'available') AS available_pins
    FROM gift_card_types t
    ORDER BY t.sort_order, t.id
  `).all();
  const variantsByType = {};
  const allVariants = db.prepare('SELECT * FROM gift_card_variants ORDER BY id').all();
  for (const v of allVariants) {
    if (!variantsByType[v.gift_card_type_id]) variantsByType[v.gift_card_type_id] = [];
    variantsByType[v.gift_card_type_id].push(v);
  }
  const cards = types.map(t => ({ ...t, variants: variantsByType[t.id] || [] }));
  res.json({ cards });
});

router.post('/giftcards',
  body('slug').matches(/^[a-z0-9-]+$/).withMessage('slug은 소문자/숫자/하이픈만 가능합니다.'),
  body('name').trim().notEmpty(),
  body('brand').trim().notEmpty(),
  body('shortName').trim().notEmpty(),
  body('region').trim().notEmpty(),
  body('category').trim().notEmpty(),
  body('tagline').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('currency').optional().trim(),
  body('highlights').optional().isArray(),
  body('howToUse').optional().isArray(),
  body('colorGradient').optional().trim(),
  body('badge').optional().trim(),
  body('logoIcon').optional().trim(),
  body('imageUrl').optional().trim(),
  body('sortOrder').optional().isInt(),
  handleValidation,
  (req, res, next) => {
    try {
      const b = req.body;
      const result = db.prepare(`
        INSERT INTO gift_card_types (slug, name, brand, short_name, region, category, currency, tagline, description, highlights, how_to_use, color_gradient, badge, logo_icon, image_url, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        b.slug, b.name, b.brand, b.shortName, b.region, b.category, b.currency || 'KRW',
        b.tagline, b.description,
        JSON.stringify(b.highlights || []),
        JSON.stringify(b.howToUse || []),
        b.colorGradient || null, b.badge || null, b.logoIcon || null, b.imageUrl || null, b.sortOrder || 0
      );
      res.status(201).json({ message: '상품권이 등록되었습니다.', id: result.lastInsertRowid });
    } catch (err) {
      if (err.message.includes('UNIQUE')) return res.status(409).json({ message: '이미 사용 중인 slug입니다.' });
      next(err);
    }
  }
);

router.put('/giftcards/:id',
  body('name').optional().trim().notEmpty(),
  body('brand').optional().trim().notEmpty(),
  body('shortName').optional().trim().notEmpty(),
  body('tagline').optional().trim(),
  body('description').optional().trim(),
  body('highlights').optional().isArray(),
  body('howToUse').optional().isArray(),
  body('colorGradient').optional().trim(),
  body('badge').optional().trim(),
  body('logoIcon').optional().trim(),
  body('imageUrl').optional().trim(),
  body('sortOrder').optional().isInt(),
  body('isActive').optional().isBoolean(),
  handleValidation,
  (req, res, next) => {
    try {
      const existing = db.prepare('SELECT * FROM gift_card_types WHERE id = ?').get(req.params.id);
      if (!existing) return res.status(404).json({ message: '상품권을 찾을 수 없습니다.' });
      const b = req.body;
      db.prepare(`
        UPDATE gift_card_types SET
          name = ?, brand = ?, short_name = ?, tagline = ?, description = ?,
          highlights = ?, how_to_use = ?, color_gradient = ?, badge = ?, logo_icon = ?,
          image_url = ?, sort_order = ?, is_active = ?
        WHERE id = ?
      `).run(
        b.name ?? existing.name,
        b.brand ?? existing.brand,
        b.shortName ?? existing.short_name,
        b.tagline ?? existing.tagline,
        b.description ?? existing.description,
        JSON.stringify(b.highlights ?? JSON.parse(existing.highlights || '[]')),
        JSON.stringify(b.howToUse ?? JSON.parse(existing.how_to_use || '[]')),
        b.colorGradient ?? existing.color_gradient,
        b.badge ?? existing.badge,
        b.logoIcon ?? existing.logo_icon,
        b.imageUrl ?? existing.image_url,
        b.sortOrder ?? existing.sort_order,
        b.isActive === undefined ? existing.is_active : (b.isActive ? 1 : 0),
        req.params.id
      );
      res.json({ message: '업데이트되었습니다.' });
    } catch (err) { next(err); }
  }
);

router.delete('/giftcards/:id', (req, res, next) => {
  try {
    const pins = db.prepare(`
      SELECT COUNT(*) AS c FROM gift_card_pins p
      JOIN gift_card_variants v ON p.gift_card_variant_id = v.id
      WHERE v.gift_card_type_id = ? AND p.status = 'sold'
    `).get(req.params.id).c;
    if (pins > 0) return res.status(400).json({ message: '이미 판매된 PIN이 있어 삭제할 수 없습니다. 비활성화만 가능합니다.' });
    const result = db.prepare('UPDATE gift_card_types SET is_active = 0 WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ message: '상품권을 찾을 수 없습니다.' });
    db.prepare('UPDATE gift_card_variants SET is_active = 0 WHERE gift_card_type_id = ?').run(req.params.id);
    res.json({ message: '비활성화되었습니다. (판매 이력이 없는 경우에만 영구 삭제 가능합니다.)' });
  } catch (err) { next(err); }
});

router.post('/giftcards/:id/variants',
  body('faceValue').isInt({ min: 1 }),
  body('discountNormal').isFloat({ min: 0, max: 100 }),
  body('priceNormal').isInt({ min: 0 }),
  body('dailyLimit').optional().isInt({ min: 0 }),
  body('stock').optional().isInt({ min: 0 }),
  handleValidation,
  (req, res, next) => {
    try {
      const type = db.prepare('SELECT id FROM gift_card_types WHERE id = ?').get(req.params.id);
      if (!type) return res.status(404).json({ message: '상품권을 찾을 수 없습니다.' });
      const b = req.body;
      const result = db.prepare(`
        INSERT INTO gift_card_variants (gift_card_type_id, face_value, discount_normal, price_normal, daily_limit, stock)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(req.params.id, b.faceValue, b.discountNormal, b.priceNormal, b.dailyLimit ?? 20, b.stock ?? 999);
      res.status(201).json({ message: '옵션이 추가되었습니다.', id: result.lastInsertRowid });
    } catch (err) { next(err); }
  }
);

router.put('/giftcards/variants/:id',
  body('faceValue').optional().isInt({ min: 1 }),
  body('discountNormal').optional().isFloat({ min: 0, max: 100 }),
  body('priceNormal').optional().isInt({ min: 0 }),
  body('dailyLimit').optional().isInt({ min: 0 }),
  body('stock').optional().isInt({ min: 0 }),
  body('isActive').optional().isBoolean(),
  handleValidation,
  (req, res, next) => {
    try {
      const existing = db.prepare('SELECT * FROM gift_card_variants WHERE id = ?').get(req.params.id);
      if (!existing) return res.status(404).json({ message: '옵션을 찾을 수 없습니다.' });
      const b = req.body;
      db.prepare(`
        UPDATE gift_card_variants SET
          face_value = ?, discount_normal = ?, price_normal = ?, daily_limit = ?, stock = ?, is_active = ?
        WHERE id = ?
      `).run(
        b.faceValue ?? existing.face_value,
        b.discountNormal ?? existing.discount_normal,
        b.priceNormal ?? existing.price_normal,
        b.dailyLimit ?? existing.daily_limit,
        b.stock ?? existing.stock,
        b.isActive === undefined ? existing.is_active : (b.isActive ? 1 : 0),
        req.params.id
      );
      res.json({ message: '업데이트되었습니다.' });
    } catch (err) { next(err); }
  }
);

router.delete('/giftcards/variants/:id', (req, res, next) => {
  try {
    const sold = db.prepare("SELECT COUNT(*) AS c FROM gift_card_pins WHERE gift_card_variant_id = ? AND status = 'sold'").get(req.params.id).c;
    if (sold > 0) return res.status(400).json({ message: '이미 판매된 PIN이 있어 삭제할 수 없습니다.' });
    const result = db.prepare('UPDATE gift_card_variants SET is_active = 0 WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ message: '옵션을 찾을 수 없습니다.' });
    res.json({ message: '비활성화되었습니다.' });
  } catch (err) { next(err); }
});

// --- Events ---

router.get('/events', (req, res) => {
  const rows = db.prepare(`
    SELECT e.*,
      (SELECT COUNT(*) FROM event_rewards r WHERE r.event_id = e.id) AS reward_count,
      (SELECT COALESCE(SUM(r.reward_amount), 0) FROM event_rewards r WHERE r.event_id = e.id) AS total_distributed
    FROM events e
    ORDER BY e.created_at DESC
  `).all();
  rows.forEach(r => {
    try { r.reward_rules = JSON.parse(r.reward_rules || 'null'); } catch {}
  });
  res.json({ events: rows });
});

router.post('/events',
  body('slug').matches(/^[a-z0-9-]+$/).withMessage('slug은 소문자/숫자/하이픈만 가능합니다.'),
  body('title').trim().notEmpty(),
  body('type').isIn(['monthly_purchase', 'pin_register', 'manual']).withMessage('유효한 이벤트 유형을 선택하세요.'),
  body('startAt').isISO8601(),
  body('endAt').isISO8601(),
  body('description').optional().trim(),
  body('rewardRules').optional(),
  body('imageUrl').optional().trim(),
  body('isActive').optional().isBoolean(),
  handleValidation,
  (req, res, next) => {
    try {
      const b = req.body;
      if (new Date(b.endAt) <= new Date(b.startAt)) {
        return res.status(400).json({ message: '종료일은 시작일 이후여야 합니다.' });
      }
      const result = db.prepare(`
        INSERT INTO events (slug, title, description, type, start_at, end_at, reward_rules, image_url, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        b.slug, b.title, b.description || null, b.type,
        b.startAt, b.endAt,
        b.rewardRules ? JSON.stringify(b.rewardRules) : null,
        b.imageUrl || null,
        b.isActive === false ? 0 : 1
      );
      res.status(201).json({ message: '이벤트가 생성되었습니다.', id: result.lastInsertRowid });
    } catch (err) {
      if (err.message.includes('UNIQUE')) return res.status(409).json({ message: '이미 사용 중인 slug입니다.' });
      next(err);
    }
  }
);

router.put('/events/:id',
  body('title').optional().trim().notEmpty(),
  body('type').optional().isIn(['monthly_purchase', 'pin_register', 'manual']),
  body('startAt').optional().isISO8601(),
  body('endAt').optional().isISO8601(),
  body('status').optional().isIn(['active', 'ended', 'cancelled']),
  body('description').optional().trim(),
  body('rewardRules').optional(),
  body('imageUrl').optional().trim(),
  body('isActive').optional().isBoolean(),
  handleValidation,
  (req, res, next) => {
    try {
      const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
      if (!existing) return res.status(404).json({ message: '이벤트를 찾을 수 없습니다.' });
      const b = req.body;
      if (b.startAt && b.endAt && new Date(b.endAt) <= new Date(b.startAt)) {
        return res.status(400).json({ message: '종료일은 시작일 이후여야 합니다.' });
      }
      db.prepare(`
        UPDATE events SET
          title = ?, description = ?, type = ?, start_at = ?, end_at = ?,
          status = ?, reward_rules = ?, image_url = ?, is_active = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `).run(
        b.title ?? existing.title,
        b.description ?? existing.description,
        b.type ?? existing.type,
        b.startAt ?? existing.start_at,
        b.endAt ?? existing.end_at,
        b.status ?? existing.status,
        b.rewardRules !== undefined ? JSON.stringify(b.rewardRules) : existing.reward_rules,
        b.imageUrl ?? existing.image_url,
        b.isActive === undefined ? existing.is_active : (b.isActive ? 1 : 0),
        req.params.id
      );
      res.json({ message: '업데이트되었습니다.' });
    } catch (err) { next(err); }
  }
);

router.delete('/events/:id', (req, res, next) => {
  try {
    const rewards = db.prepare('SELECT COUNT(*) AS c FROM event_rewards WHERE event_id = ?').get(req.params.id).c;
    if (rewards > 0) return res.status(400).json({ message: '이미 보상이 지급된 이벤트는 삭제할 수 없습니다. 취소 상태로 변경하세요.' });
    const result = db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ message: '이벤트를 찾을 수 없습니다.' });
    res.json({ message: '삭제되었습니다.' });
  } catch (err) { next(err); }
});

router.get('/events/:id/participants', (req, res, next) => {
  try {
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!event) return res.status(404).json({ message: '이벤트를 찾을 수 없습니다.' });

    let rows = [];
    if (event.type === 'monthly_purchase') {
      rows = db.prepare(`
        SELECT u.id, u.username, u.email,
          COUNT(o.id) AS order_count,
          COALESCE(SUM(o.total_price), 0) AS total_spent,
          MAX(o.created_at) AS last_order_at,
          er.id AS reward_id, er.reward_amount, er.status AS reward_status, er.created_at AS rewarded_at
        FROM users u
        LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'completed'
          AND o.created_at >= ? AND o.created_at <= ?
        LEFT JOIN event_rewards er ON er.user_id = u.id AND er.event_id = ?
        WHERE u.role NOT IN ('admin', 'super_admin') AND u.is_active = 1
        GROUP BY u.id
        HAVING order_count > 0 OR reward_id IS NOT NULL
        ORDER BY total_spent DESC
        LIMIT 200
      `).all(event.start_at, event.end_at, event.id).map(r => ({ ...r, total_spent: Number(r.total_spent) }));
    } else {
      rows = db.prepare(`
        SELECT u.id, u.username, u.email,
          er.id AS reward_id, er.reward_amount, er.status AS reward_status, er.created_at AS rewarded_at,
          er.metadata
        FROM event_rewards er
        JOIN users u ON er.user_id = u.id
        WHERE er.event_id = ?
        ORDER BY er.created_at DESC
      `).all(event.id);
    }
    res.json({ event, participants: rows });
  } catch (err) { next(err); }
});

router.post('/events/:id/reward',
  body('userId').isInt(),
  body('amount').isInt({ min: 1 }),
  body('rewardType').optional().isIn(['cash', 'cashback']),
  body('note').optional().trim(),
  handleValidation,
  (req, res, next) => {
    try {
      const { userId, amount, rewardType, note } = req.body;
      const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
      if (!event) return res.status(404).json({ message: '이벤트를 찾을 수 없습니다.' });
      const target = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      if (!target) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });

      const tx = db.transaction(() => {
        const existing = db.prepare('SELECT id FROM event_rewards WHERE event_id = ? AND user_id = ?').get(event.id, userId);
        if (existing) throw new Error('이미 보상이 지급되었습니다.');

        db.prepare(`
          INSERT INTO event_rewards (event_id, user_id, reward_amount, reward_type, metadata)
          VALUES (?, ?, ?, ?, ?)
        `).run(event.id, userId, amount, rewardType || 'cash', JSON.stringify({ note: note || '', granted_by: req.user.id }));

        db.prepare('UPDATE users SET cash_balance = cash_balance + ?, withdrawable_cash = withdrawable_cash + ? WHERE id = ?').run(amount, amount, userId);
        const updated = db.prepare('SELECT cash_balance, withdrawable_cash FROM users WHERE id = ?').get(userId);
        db.prepare(`
          INSERT INTO wallet_transactions (user_id, type, amount, balance_after, withdrawable_after, description)
          VALUES (?, 'event_reward', ?, ?, ?, ?)
        `).run(userId, amount, updated.cash_balance, updated.withdrawable_cash, `이벤트 보상: ${event.title}`);

        db.prepare('INSERT INTO notifications (user_id, type, title, content) VALUES (?, ?, ?, ?)').run(
          userId, 'event_reward', '이벤트 보상 지급', `${event.title} 이벤트 보상으로 ${amount.toLocaleString()}원이 지급되었습니다.`
        );
      });

      try {
        tx();
      } catch (e) {
        return res.status(409).json({ message: e.message });
      }

      res.status(201).json({ message: '보상이 지급되었습니다.' });
    } catch (err) { next(err); }
  }
);

// --- Message templates ---

router.get('/templates', (req, res) => {
  const rows = db.prepare('SELECT * FROM message_templates ORDER BY channel, code').all();
  rows.forEach(r => {
    try { r.variables = JSON.parse(r.variables || '[]'); } catch {}
  });
  res.json({ templates: rows });
});

router.post('/templates',
  body('code').matches(/^[a-z0-9_]+$/).withMessage('code는 소문자/숫자/언더스코어만 가능합니다.'),
  body('name').trim().notEmpty(),
  body('channel').isIn(['sms', 'email', 'notification']),
  body('subject').optional().trim(),
  body('body').trim().notEmpty(),
  body('variables').optional().isArray(),
  handleValidation,
  (req, res, next) => {
    try {
      const b = req.body;
      const result = db.prepare(`
        INSERT INTO message_templates (code, name, channel, subject, body, variables, is_active)
        VALUES (?, ?, ?, ?, ?, ?, 1)
      `).run(b.code, b.name, b.channel, b.subject || null, b.body, JSON.stringify(b.variables || []));
      res.status(201).json({ message: '템플릿이 생성되었습니다.', id: result.lastInsertRowid });
    } catch (err) {
      if (err.message.includes('UNIQUE')) return res.status(409).json({ message: '이미 사용 중인 code입니다.' });
      next(err);
    }
  }
);

router.put('/templates/:id',
  body('name').optional().trim().notEmpty(),
  body('channel').optional().isIn(['sms', 'email', 'notification']),
  body('subject').optional().trim(),
  body('body').optional().trim().notEmpty(),
  body('variables').optional().isArray(),
  body('isActive').optional().isBoolean(),
  handleValidation,
  (req, res, next) => {
    try {
      const existing = db.prepare('SELECT * FROM message_templates WHERE id = ?').get(req.params.id);
      if (!existing) return res.status(404).json({ message: '템플릿을 찾을 수 없습니다.' });
      const b = req.body;
      db.prepare(`
        UPDATE message_templates SET
          name = ?, channel = ?, subject = ?, body = ?, variables = ?, is_active = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `).run(
        b.name ?? existing.name,
        b.channel ?? existing.channel,
        b.subject ?? existing.subject,
        b.body ?? existing.body,
        JSON.stringify(b.variables ?? JSON.parse(existing.variables || '[]')),
        b.isActive === undefined ? existing.is_active : (b.isActive ? 1 : 0),
        req.params.id
      );
      res.json({ message: '업데이트되었습니다.' });
    } catch (err) { next(err); }
  }
);

router.delete('/templates/:id', (req, res, next) => {
  try {
    const result = db.prepare('DELETE FROM message_templates WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ message: '템플릿을 찾을 수 없습니다.' });
    res.json({ message: '삭제되었습니다.' });
  } catch (err) { next(err); }
});

// Card recovery review
router.get('/recovery',
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'duplicate']),
  handleValidation,
  (req, res) => {
    const where = req.query.status ? 'WHERE r.status = ?' : '';
    const params = req.query.status ? [req.query.status] : [];
    const rows = db.prepare(`
      SELECT r.*, u.username, u.email
      FROM card_recoveries r
      JOIN users u ON r.user_id = u.id
      ${where}
      ORDER BY (r.status = 'pending') DESC, r.created_at DESC
    `).all(...params);
    res.json({ recoveries: rows });
  }
);

router.post('/recovery/:id/approve',
  body('rewardAmount').optional().isInt({ min: 0 }),
  handleValidation,
  (req, res, next) => {
    try {
      const recovery = db.prepare('SELECT * FROM card_recoveries WHERE id = ?').get(req.params.id);
      if (!recovery) return res.status(404).json({ message: '회수 신청을 찾을 수 없습니다.' });
      if (recovery.status === 'approved') return res.status(400).json({ message: '이미 승인되었습니다.' });

      const rewardAmount = parseInt(req.body.rewardAmount ?? 700);

      const approve = db.transaction(() => {
        db.prepare("UPDATE card_recoveries SET status = 'approved', reward_amount = ?, processed_at = datetime('now') WHERE id = ?")
          .run(rewardAmount, recovery.id);
        if (rewardAmount > 0) {
          db.prepare('UPDATE users SET cash_balance = cash_balance + ?, withdrawable_cash = withdrawable_cash + ?, wallet_verified = 1 WHERE id = ?')
            .run(rewardAmount, rewardAmount, recovery.user_id);
          const updated = db.prepare('SELECT cash_balance, withdrawable_cash FROM users WHERE id = ?').get(recovery.user_id);
          db.prepare(`
            INSERT INTO wallet_transactions (user_id, type, amount, balance_after, withdrawable_after, description)
            VALUES (?, 'admin_adjust', ?, ?, ?, ?)
          `).run(recovery.user_id, rewardAmount, updated.cash_balance, updated.withdrawable_cash, `상품권 회수 보상 (RC-${String(recovery.id).padStart(3, '0')})`);
          db.prepare("INSERT INTO notifications (user_id, type, title, content) VALUES (?, 'system', ?, ?)")
            .run(recovery.user_id, '회수 보상 지급', `상품권 회수 보상으로 ${rewardAmount.toLocaleString()}원이 적립되었습니다.`);
        }
      });
      approve();
      res.json({ message: `승인 및 ${rewardAmount.toLocaleString()}원 지급 완료` });
    } catch (err) { next(err); }
  }
);

router.post('/recovery/:id/reject',
  body('adminNote').optional().trim(),
  handleValidation,
  (req, res, next) => {
    try {
      const recovery = db.prepare('SELECT * FROM card_recoveries WHERE id = ?').get(req.params.id);
      if (!recovery) return res.status(404).json({ message: '회수 신청을 찾을 수 없습니다.' });
      if (recovery.status === 'approved') return res.status(400).json({ message: '이미 승인된 건입니다.' });

      db.prepare("UPDATE card_recoveries SET status = 'rejected', admin_note = ?, processed_at = datetime('now') WHERE id = ?")
        .run(req.body.adminNote || '', recovery.id);
      db.prepare("INSERT INTO notifications (user_id, type, title, content) VALUES (?, 'system', ?, ?)")
        .run(recovery.user_id, '회수 신청 반려', `회수 신청(RC-${String(recovery.id).padStart(3, '0')})이 반려되었습니다.${req.body.adminNote ? ' 사유: ' + req.body.adminNote : ''}`);
      res.json({ message: '반려 처리되었습니다.' });
    } catch (err) { next(err); }
  }
);

module.exports = router;
