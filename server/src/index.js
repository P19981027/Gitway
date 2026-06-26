const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { initDatabase } = require('./db/init');
const { AppError } = require('./utils/errors');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json({ limit: '1mb' }));

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false });
app.use('/api/', apiLimiter);

// API routes - MUST come before static files
app.use('/api/auth', require('./routes/auth'));
app.use('/api/verification', require('./routes/verification'));
app.use('/api/giftcards', require('./routes/giftcards'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/recovery', require('./routes/recovery'));

// Static files + SPA fallback - only for non-API routes
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.use('/api/*', (req, res) => res.status(404).json({ message: 'API endpoint not found' }));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  res.status(500).json({ message: '서버 오류가 발생했습니다.' });
});

function start() {
  if (config.nodeEnv === 'production') {
    const missing = [];
    const hasTwilio = config.twilio.accountSid && config.twilio.authToken && config.twilio.from;
    const hasCoolSMS = config.coolsms.apiKey && config.coolsms.apiSecret && config.coolsms.sender;
    if (!hasTwilio && !hasCoolSMS) {
      missing.push('SMS provider (set either TWILIO_ACCOUNT_SID/AUTH_TOKEN/FROM or COOLSMS_API_KEY/API_SECRET/SENDER)');
    }
    if (!config.smtp.user || !config.smtp.pass) {
      missing.push('SMTP_USER / SMTP_PASS');
    }
    if (!config.jwt.secret || config.jwt.secret.startsWith('dev-secret')) {
      missing.push('JWT_SECRET');
    }
    if (!config.jwt.refreshSecret || config.jwt.refreshSecret.startsWith('dev-refresh')) {
      missing.push('JWT_REFRESH_SECRET');
    }
    if (missing.length) {
      console.error(`[FATAL] Production environment is missing required credentials:\n  - ${missing.join('\n  - ')}\nRefusing to start in production without real credentials (would silently fall back to dev mode).`);
      process.exit(1);
    }
  }

  initDatabase();
  app.listen(config.port, () => {
    console.log(`GiftWay server running on port ${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
  });
}

start();
