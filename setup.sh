#!/bin/bash
set -e

echo "===== 1/8 apt update ====="
export DEBIAN_FRONTEND=noninteractive
apt update -y
apt upgrade -y

echo "===== 2/8 base packages ====="
apt install -y curl git ufw sqlite3 build-essential ca-certificates gnupg software-properties-common

echo "===== 3/8 Node.js 20 ====="
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

echo "===== 4/8 PM2 + Caddy ====="
npm install -g pm2
rm -f /etc/apt/sources.list.d/caddy-stable.list
rm -f /etc/apt/keyrings/caddy-stable-archive-keyring.gpg
if ! command -v caddy >/dev/null 2>&1; then
  curl -fsSL "https://github.com/caddyserver/caddy/releases/download/v2.8.4/caddy_2.8.4_linux_amd64.tar.gz" -o /tmp/caddy.tar.gz
  tar -xzf /tmp/caddy.tar.gz -C /usr/bin caddy
  chmod +x /usr/bin/caddy
  rm -f /tmp/caddy.tar.gz
  mkdir -p /etc/caddy
  cat > /etc/systemd/system/caddy.service <<'SVC_EOF'
[Unit]
Description=Caddy
After=network.target

[Service]
ExecStart=/usr/bin/caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
ExecReload=/usr/bin/caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
Restart=always
User=root
LimitNOFILE=1048576

[Install]
WantedBy=multi-user.target
SVC_EOF
  systemctl daemon-reload
  systemctl enable caddy
fi

echo "===== 5/8 firewall ====="
ufw --force reset
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "===== 6/8 clone repo ====="
mkdir -p /var/www
cd /var/www
if [ ! -d giftway ]; then
  git clone https://github.com/P19981027/Gitway.git giftway
fi
cd giftway

echo "===== 7/8 install deps + build client ====="
cd server && npm install --production
cd ../client && npm install && npm run build

echo "===== 8/8 generate .env ====="
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")
JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")
cat > /var/www/giftway/server/.env << ENV_EOF
PORT=3001
NODE_ENV=production
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM=

COOLSMS_API_KEY=
COOLSMS_API_SECRET=
COOLSMS_SENDER=

SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=b00560001@smtp-brevo.com
SMTP_PASS=REPLACE_ME_AFTER_SETUP

DB_PATH=./data/giftway.db
CLIENT_URL=http://158.247.195.44

DEFAULT_USDT_ADDRESS=TN2YqTv5i2ZMciKTNXBGwUUcaLzS4bVqBZ
DEFAULT_EXCHANGE_RATE=1350
ENV_EOF

echo "===== DONE ====="
echo "Setup complete. All packages installed, repo cloned, .env generated."
