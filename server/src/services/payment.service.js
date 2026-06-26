const QRCode = require('qrcode');
const db = require('../db/connection');
const { NotFoundError, ValidationError } = require('../utils/errors');

async function getUSDTPaymentDetails(userId, orderId) {
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(orderId, userId);
  if (!order) throw new NotFoundError('주문을 찾을 수 없습니다.');
  if (order.payment_status !== 'pending' && order.payment_status !== 'awaiting_confirmation') {
    throw new ValidationError('결제 대기 상태가 아닙니다.');
  }

  if (new Date(order.payment_expires_at) < new Date()) {
    db.prepare("UPDATE orders SET status = 'expired', payment_status = 'expired', updated_at = datetime('now') WHERE id = ?").run(orderId);
    db.prepare("UPDATE gift_card_pins SET status = 'available', reserved_at = NULL, order_id = NULL WHERE order_id = ? AND status = 'reserved'").run(orderId);
    throw new ValidationError('결제 시간이 만료되었습니다.');
  }

  const qrData = `tron:${order.usdt_address}?amount=${order.usdt_amount}`;
  const qrCodeDataUrl = await QRCode.toDataURL(qrData, { width: 256, margin: 2 });

  const expiresAt = new Date(order.payment_expires_at);
  const countdownSeconds = Math.max(0, Math.floor((expiresAt - new Date()) / 1000));

  return {
    orderId: order.id,
    orderNumber: order.order_number,
    totalPrice: order.total_price,
    usdtAddress: order.usdt_address,
    usdtAmount: order.usdt_amount,
    exchangeRate: order.usdt_exchange_rate,
    qrCodeDataUrl,
    expiresAt: order.payment_expires_at,
    countdownSeconds,
    paymentStatus: order.payment_status,
  };
}

function confirmPayment(userId, orderId) {
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(orderId, userId);
  if (!order) throw new NotFoundError('주문을 찾을 수 없습니다.');
  if (order.payment_status !== 'pending') throw new ValidationError('결제 확인 요청이 불가능한 상태입니다.');

  db.prepare("UPDATE orders SET payment_status = 'awaiting_confirmation', updated_at = datetime('now') WHERE id = ?").run(orderId);

  db.prepare(`
    INSERT INTO notifications (user_id, type, title, content)
    VALUES (?, 'order', '결제 확인 요청', ?)
  `).run(userId, `주문 ${order.order_number}의 결제 확인 요청이 접수되었습니다. 관리자 확인 후 PIN 번호가 발급됩니다.`);

  return { message: '결제 확인 요청이 접수되었습니다. 관리자 확인 후 PIN 번호가 발급됩니다.' };
}

function getPaymentStatus(userId, orderId) {
  const order = db.prepare('SELECT id, payment_status, status FROM orders WHERE id = ? AND user_id = ?').get(orderId, userId);
  if (!order) throw new NotFoundError('주문을 찾을 수 없습니다.');
  return { paymentStatus: order.payment_status, orderStatus: order.status };
}

module.exports = { getUSDTPaymentDetails, confirmPayment, getPaymentStatus };
