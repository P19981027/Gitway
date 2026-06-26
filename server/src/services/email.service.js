const nodemailer = require('nodemailer');
const config = require('../config');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!config.smtp.user || !config.smtp.pass) {
    console.log('[EMAIL DEV MODE] SMTP not configured, emails will be logged to console.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });

  return transporter;
}

async function sendVerificationEmail(email, code) {
  const transport = getTransporter();

  if (!transport) {
    console.log(`[EMAIL DEV MODE] To: ${email}, Verification Code: ${code}`);
    return { success: true, devMode: true };
  }

  await transport.sendMail({
    from: `"GiftWay" <${config.smtp.user}>`,
    to: email,
    subject: '[GiftWay] 이메일 인증번호',
    html: `
      <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 440px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #b45309; font-size: 24px; margin: 0;">GiftWay</h1>
        </div>
        <div style="background: #fffbeb; border-radius: 16px; padding: 30px; text-align: center;">
          <h2 style="color: #92400e; font-size: 18px; margin-bottom: 20px;">이메일 인증번호</h2>
          <div style="font-size: 36px; font-weight: bold; color: #d97706; letter-spacing: 8px; margin: 20px 0;">${code}</div>
          <p style="color: #78716c; font-size: 13px;">유효시간: 10분</p>
        </div>
        <p style="color: #a8a29e; font-size: 12px; text-align: center; margin-top: 20px;">
          본 인증번호는 GiftWay 회원가입을 위한 것입니다.<br>
          직접 요청하지 않은 경우 이 이메일을 무시하세요.
        </p>
      </div>
    `,
  });

  return { success: true };
}

async function sendPinEmail(email, orderInfo, pins) {
  const transport = getTransporter();

  if (!transport) {
    console.log(`[EMAIL DEV MODE] To: ${email}, PIN codes sent:`, pins);
    return { success: true, devMode: true };
  }

  const pinRows = pins.map(p => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #f5f5f4; font-family: monospace;">${p.card_number || '-'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #f5f5f4; font-family: monospace; color: #d97706; font-weight: bold;">${p.pin_number}</td>
    </tr>
  `).join('');

  await transport.sendMail({
    from: `"GiftWay" <${config.smtp.user}>`,
    to: email,
    subject: `[GiftWay] 상품권 PIN 번호 발급 - ${orderInfo.orderNumber}`,
    html: `
      <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #b45309; font-size: 24px; margin: 0;">GiftWay</h1>
          <p style="color: #78716c; font-size: 14px;">상품권 PIN 번호가 발급되었습니다</p>
        </div>
        <div style="background: #fff; border: 1px solid #e7e5e4; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <p><strong>주문번호:</strong> ${orderInfo.orderNumber}</p>
          <p><strong>상품:</strong> ${orderInfo.productName}</p>
          <p><strong>수량:</strong> ${orderInfo.quantity}장</p>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #fffbeb;">
              <th style="padding: 10px; text-align: left; font-size: 13px; color: #92400e;">카드번호</th>
              <th style="padding: 10px; text-align: left; font-size: 13px; color: #92400e;">PIN 번호</th>
            </tr>
          </thead>
          <tbody>${pinRows}</tbody>
        </table>
      </div>
    `,
  });

  return { success: true };
}

module.exports = { sendVerificationEmail, sendPinEmail };
