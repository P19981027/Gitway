function generateOrderNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `GW-${date}-${rand}`;
}

function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function formatKRW(amount) {
  return new Intl.NumberFormat('ko-KR').format(amount);
}

// Korean mobile number normalization. Accepts local (010xxxxxxxx / 010-xxxx-xxxx)
// or international (+82 10xxxxxxxx / 8210xxxxxxxx) forms; returns the local
// 11-digit form (010xxxxxxxx). Returns null for invalid input.
function normalizePhone(input) {
  if (typeof input !== 'string') return null;
  const digits = input.replace(/[^\d+]/g, '');
  let d = digits.replace(/^\+/, '');
  if (d.startsWith('8210')) d = '0' + d.slice(2);
  else if (d.startsWith('82')) d = '0' + d.slice(2);
  else if (d.startsWith('10') && d.length === 10) d = '0' + d;
  if (!/^010\d{8}$/.test(d)) return null;
  return d;
}

module.exports = { generateOrderNumber, generateVerificationCode, formatKRW, normalizePhone };
