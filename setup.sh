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
install -m 0755 -d /etc/apt/keyrings
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor --yes -o /etc/apt/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install -y caddy

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
