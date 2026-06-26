const db = require('./connection');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      phone TEXT UNIQUE,
      phone_verified INTEGER DEFAULT 0,
      email_verified INTEGER DEFAULT 0,
      wallet_verified INTEGER DEFAULT 0,
      role TEXT NOT NULL DEFAULT 'member',
      cash_balance INTEGER DEFAULT 0,
      withdrawable_cash INTEGER DEFAULT 0,
      usdt_deposit_address TEXT,
      usdt_withdraw_address TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS verification_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      target TEXT NOT NULL,
      code TEXT NOT NULL,
      type TEXT NOT NULL,
      purpose TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      verified INTEGER DEFAULT 0,
      attempts INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS gift_card_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      short_name TEXT NOT NULL,
      region TEXT NOT NULL,
      category TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'KRW',
      tagline TEXT NOT NULL,
      description TEXT NOT NULL,
      highlights TEXT,
      how_to_use TEXT,
      color_gradient TEXT,
      badge TEXT,
      logo_icon TEXT,
      image_url TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS gift_card_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gift_card_type_id INTEGER NOT NULL REFERENCES gift_card_types(id),
      face_value INTEGER NOT NULL,
      discount_normal REAL NOT NULL,
      price_normal INTEGER NOT NULL,
      daily_limit INTEGER DEFAULT 20,
      stock INTEGER DEFAULT 999,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS gift_card_pins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gift_card_variant_id INTEGER NOT NULL REFERENCES gift_card_variants(id),
      pin_number TEXT NOT NULL,
      card_number TEXT,
      status TEXT DEFAULT 'available',
      reserved_at TEXT,
      sold_at TEXT,
      order_id INTEGER REFERENCES orders(id),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id),
      gift_card_type_id INTEGER NOT NULL REFERENCES gift_card_types(id),
      variant_id INTEGER NOT NULL REFERENCES gift_card_variants(id),
      face_value INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price INTEGER NOT NULL,
      total_price INTEGER NOT NULL,
      payment_method TEXT DEFAULT 'usdt',
      payment_status TEXT DEFAULT 'pending',
      usdt_amount REAL,
      usdt_address TEXT,
      usdt_exchange_rate REAL,
      payment_expires_at TEXT,
      payment_confirmed_at TEXT,
      pin_numbers TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      balance_after INTEGER NOT NULL,
      withdrawable_after INTEGER NOT NULL,
      order_id INTEGER REFERENCES orders(id),
      related_user_id INTEGER REFERENCES users(id),
      description TEXT,
      metadata TEXT,
      status TEXT DEFAULT 'completed',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS wallet_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      krw_amount INTEGER NOT NULL,
      exchange_rate REAL NOT NULL,
      usdt_wallet_address TEXT,
      status TEXT DEFAULT 'pending',
      admin_note TEXT,
      reviewed_by INTEGER REFERENCES users(id),
      reviewed_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS usdt_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receiving_address TEXT NOT NULL,
      exchange_rate REAL NOT NULL,
      min_deposit REAL DEFAULT 10,
      min_withdrawal REAL DEFAULT 10,
      payment_timeout_minutes INTEGER DEFAULT 30,
      is_active INTEGER DEFAULT 1,
      updated_by INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      metadata TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notification_reads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      notification_id INTEGER NOT NULL REFERENCES notifications(id),
      read_at TEXT DEFAULT (datetime('now')),
      UNIQUE (user_id, notification_id)
    );

    CREATE TABLE IF NOT EXISTS admin_roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      permissions TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL DEFAULT 'manual',
      start_at TEXT NOT NULL,
      end_at TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      reward_rules TEXT,
      image_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS event_rewards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL REFERENCES events(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      reward_amount INTEGER NOT NULL,
      reward_type TEXT NOT NULL DEFAULT 'cash',
      status TEXT DEFAULT 'distributed',
      metadata TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE (event_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS message_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      channel TEXT NOT NULL,
      subject TEXT,
      body TEXT NOT NULL,
      variables TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      refresh_token TEXT UNIQUE NOT NULL,
      device_info TEXT,
      ip_address TEXT,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
    CREATE INDEX IF NOT EXISTS idx_verification_target ON verification_codes(target, type, purpose);
    CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user ON wallet_transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_wallet_requests_user ON wallet_requests(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
    CREATE INDEX IF NOT EXISTS idx_notification_reads_user ON notification_reads(user_id, notification_id);
    CREATE INDEX IF NOT EXISTS idx_gift_card_pins_variant_status ON gift_card_pins(gift_card_variant_id, status);
    CREATE INDEX IF NOT EXISTS idx_events_status ON events(status, is_active);
    CREATE INDEX IF NOT EXISTS idx_event_rewards_event ON event_rewards(event_id, user_id);
    CREATE INDEX IF NOT EXISTS idx_message_templates_code ON message_templates(code, is_active);

    CREATE TABLE IF NOT EXISTS card_recoveries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      card_number TEXT NOT NULL,
      pin_number TEXT NOT NULL,
      card_type TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      reward_amount INTEGER DEFAULT 0,
      admin_note TEXT,
      processed_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_card_recoveries_user ON card_recoveries(user_id, status);
  `);

  // Migrations for existing databases (CREATE TABLE IF NOT EXISTS won't add columns)
  const addColumnIfMissing = (table, col, def) => {
    const cols = db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name);
    if (!cols.includes(col)) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
    }
  };
  addColumnIfMissing('users', 'wallet_verified', 'INTEGER DEFAULT 0');
  addColumnIfMissing('users', 'usdt_deposit_address', 'TEXT');
  addColumnIfMissing('users', 'usdt_withdraw_address', 'TEXT');

  console.log('Database schema initialized.');

  const tmplCount = db.prepare('SELECT COUNT(*) AS c FROM message_templates').get().c;
  if (tmplCount === 0) {
    const insert = db.prepare(`
      INSERT INTO message_templates (code, name, channel, subject, body, variables, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);
    insert.run(
      'sms_verify_phone',
      'SMS 휴대폰 인증번호',
      'sms',
      null,
      '[GiftWay] 본인확인 인증번호 [{{code}}]를 입력해주세요. (5분 이내)',
      JSON.stringify(['code'])
    );
    insert.run(
      'email_verify_code',
      '이메일 인증번호',
      'email',
      '[GiftWay] 이메일 인증번호',
      '<p>GiftWay 이메일 인증번호입니다.</p><p style="font-size:32px;font-weight:bold;letter-spacing:8px;">{{code}}</p><p style="color:#888;font-size:12px;">유효시간: 10분</p>',
      JSON.stringify(['code'])
    );
    insert.run(
      'email_pin_delivery',
      '상품권 PIN 발송',
      'email',
      '[GiftWay] 상품권 PIN 번호 발급 - {{orderNumber}}',
      '<p>주문번호: {{orderNumber}}</p><p>상품: {{productName}}</p><p>수량: {{quantity}}장</p><p>PIN: {{pins}}</p>',
      JSON.stringify(['orderNumber', 'productName', 'quantity', 'pins'])
    );
    insert.run(
      'notif_welcome',
      '가입 환영 알림',
      'notification',
      null,
      '{{username}}님, GiftWay 회원가입을 환영합니다!',
      JSON.stringify(['username'])
    );
    console.log('Seeded default message templates.');
  }
}

module.exports = { initDatabase };
