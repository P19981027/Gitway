const db = require('../db/connection');
const { generateOrderNumber } = require('../utils/helpers');
const { NotFoundError, ValidationError, ConflictError } = require('../utils/errors');

function createOrder(userId, { variantId, quantity, paymentMethod = 'usdt' }) {
  const variant = db.prepare(`
    SELECT v.*, t.name as card_name, t.slug as card_slug
    FROM gift_card_variants v
    JOIN gift_card_types t ON v.gift_card_type_id = t.id
    WHERE v.id = ? AND v.is_active = 1
  `).get(variantId);

  if (!variant) throw new NotFoundError('상품을 찾을 수 없습니다.');

  const unitPrice = variant.price_normal;
  const totalPrice = unitPrice * quantity;

  const today = new Date().toISOString().slice(0, 10);
  const todayPurchases = db.prepare(`
    SELECT SUM(quantity) as total FROM orders
    WHERE user_id = ? AND variant_id = ? AND DATE(created_at) = ? AND status != 'cancelled'
  `).get(userId, variantId, today);
  if ((todayPurchases?.total || 0) + quantity > variant.daily_limit) {
    throw new ValidationError(`일일 구매 한도(${variant.daily_limit}장)를 초과했습니다.`);
  }

  const availablePins = db.prepare(
    "SELECT * FROM gift_card_pins WHERE gift_card_variant_id = ? AND status = 'available' LIMIT ?"
  ).all(variantId, quantity);

  if (availablePins.length < quantity) {
    throw new ConflictError('재고가 부족합니다.');
  }

  const usdtSettings = db.prepare("SELECT * FROM usdt_settings WHERE is_active = 1 ORDER BY id DESC LIMIT 1").get();
  if (!usdtSettings) throw new NotFoundError('USDT 설정이 없습니다.');

  const usdtAmount = Math.ceil((totalPrice / usdtSettings.exchange_rate) * 100) / 100;
  const orderNumber = generateOrderNumber();
  const paymentExpiresAt = new Date(Date.now() + usdtSettings.payment_timeout_minutes * 60 * 1000).toISOString();

  const orderResult = db.prepare(`
    INSERT INTO orders (order_number, user_id, gift_card_type_id, variant_id, face_value, quantity, unit_price, total_price, payment_method, usdt_amount, usdt_address, usdt_exchange_rate, payment_expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(orderNumber, userId, variant.gift_card_type_id, variantId, variant.face_value, quantity, unitPrice, totalPrice, paymentMethod, usdtAmount, usdtSettings.receiving_address, usdtSettings.exchange_rate, paymentExpiresAt);

  const orderId = orderResult.lastInsertRowid;

  for (const pin of availablePins) {
    db.prepare("UPDATE gift_card_pins SET status = 'reserved', reserved_at = datetime('now'), order_id = ? WHERE id = ?").run(orderId, pin.id);
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  return { order, cardName: variant.card_name };
}

function getOrder(userId, orderId) {
  const order = db.prepare(`
    SELECT o.*, t.name as card_name, t.slug as card_slug
    FROM orders o
    JOIN gift_card_types t ON o.gift_card_type_id = t.id
    WHERE o.id = ? AND o.user_id = ?
  `).get(orderId, userId);
  if (!order) throw new NotFoundError('주문을 찾을 수 없습니다.');
  return order;
}

function getUserOrders(userId, page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  const orders = db.prepare(`
    SELECT o.*, t.name as card_name, t.slug as card_slug
    FROM orders o
    JOIN gift_card_types t ON o.gift_card_type_id = t.id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?
  `).all(userId, limit, offset);

  const total = db.prepare('SELECT COUNT(*) as count FROM orders WHERE user_id = ?').get(userId).count;

  return { orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

function cancelOrder(userId, orderId) {
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(orderId, userId);
  if (!order) throw new NotFoundError('주문을 찾을 수 없습니다.');
  if (order.status !== 'pending') throw new ValidationError('대기 중인 주문만 취소할 수 있습니다.');

  db.prepare("UPDATE gift_card_pins SET status = 'available', reserved_at = NULL, order_id = NULL WHERE order_id = ? AND status = 'reserved'").run(orderId);
  db.prepare("UPDATE orders SET status = 'cancelled', payment_status = 'cancelled', updated_at = datetime('now') WHERE id = ?").run(orderId);

  return { message: '주문이 취소되었습니다.' };
}

function confirmOrderPayment(orderId) {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  if (!order) throw new NotFoundError('주문을 찾을 수 없습니다.');

  db.prepare("UPDATE orders SET status = 'completed', payment_status = 'confirmed', payment_confirmed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?").run(orderId);

  const pins = db.prepare("SELECT * FROM gift_card_pins WHERE order_id = ?").all(orderId);
  const pinNumbers = [];
  for (const pin of pins) {
    db.prepare("UPDATE gift_card_pins SET status = 'sold', sold_at = datetime('now') WHERE id = ?").run(pin.id);
    pinNumbers.push({ card_number: pin.card_number, pin_number: pin.pin_number });
  }

  db.prepare("UPDATE orders SET pin_numbers = ? WHERE id = ?").run(JSON.stringify(pinNumbers), orderId);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(order.user_id);
  db.prepare(`
    INSERT INTO wallet_transactions (user_id, type, amount, balance_after, withdrawable_after, order_id, description)
    VALUES (?, 'purchase', ?, ?, ?, ?, ?)
  `).run(order.user_id, -order.total_price, user.cash_balance, user.withdrawable_cash, orderId, `상품권 구매: ${order.order_number}`);

  db.prepare(`
    INSERT INTO notifications (user_id, type, title, content)
    VALUES (?, 'order', 'PIN 번호 발급 완료', ?)
  `).run(order.user_id, `주문 ${order.order_number}의 PIN 번호가 발급되었습니다.`);

  return { pinNumbers };
}

module.exports = { createOrder, getOrder, getUserOrders, cancelOrder, confirmOrderPayment };
