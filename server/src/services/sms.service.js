const crypto = require('crypto');
const config = require('../config');

// Convert local Korean form (010xxxxxxxx) to E.164 (+8210xxxxxxxx) for Twilio.
function toE164(phone) {
  if (/^\+\d+$/.test(phone)) return phone;
  if (/^010\d{8}$/.test(phone)) return '+82' + phone.slice(1);
  if (/^8201\d{8}$/.test(phone)) return '+82' + phone.slice(2);
  return null;
}

async function sendViaTwilio(phone, code) {
  const twilio = require('twilio');
  const client = twilio(config.twilio.accountSid, config.twilio.authToken);
  const to = toE164(phone);
  if (!to) throw new Error(`Cannot convert phone to E.164: ${phone}`);

  const message = await client.messages.create({
    body: `[GiftWay] 본인확인 인증번호 [${code}]를 입력해주세요. (5분 이내)`,
    from: config.twilio.from,
    to,
  });

  if (message.errorCode) {
    throw new Error(`Twilio send failed: ${message.errorMessage} (code ${message.errorCode})`);
  }

  return { success: true, provider: 'twilio', sid: message.sid };
}

async function sendViaCoolSMS(phone, code) {
  const { apiKey, apiSecret, sender } = config.coolsms;
  const salt = crypto.randomBytes(16).toString('hex');
  const date = new Date().toISOString().slice(0, 19) + 'Z';
  const payload = `${date}${salt}`;
  const signature = crypto.createHmac('sha256', apiSecret).update(payload).digest('hex');

  const body = {
    message: {
      to: phone,
      from: sender,
      text: `[GiftWay] 본인확인 인증번호 [${code}]를 입력해주세요. (5분 이내)`,
      type: 'SMS',
      country: '82',
    },
  };

  const res = await fetch('https://api.coolsms.co.kr/messages/v4/send', {
    method: 'POST',
    headers: {
      Authorization: `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`CoolSMS 전송 실패 (${res.status}): ${text}`);
  }

  const data = await res.json();
  if (data.errorCode && data.errorCode !== '0') {
    throw new Error(`CoolSMS 전송 실패: ${data.errorMessage || data.errorCode}`);
  }

  return { success: true, provider: 'coolsms' };
}

async function sendSMS(phone, code) {
  const hasTwilio = config.twilio.accountSid && config.twilio.authToken && config.twilio.from;
  const hasCoolSMS = config.coolsms.apiKey && config.coolsms.apiSecret && config.coolsms.sender;

  if (hasTwilio) return sendViaTwilio(phone, code);
  if (hasCoolSMS) return sendViaCoolSMS(phone, code);

  console.log(`[SMS DEV MODE] To: ${phone}, Code: ${code}`);
  return { success: true, devMode: true };
}

module.exports = { sendSMS };
