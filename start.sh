#!/bin/bash
set -e

SERVER_IP="158.247.195.44"

echo "===== 1/5 Seeding database (creates admin user) ====="
cd /var/www/giftway/server
npm run seed 2>&1 | tail -5 || echo "seed already done"

echo "===== 2/5 Starting backend with PM2 ====="
if ! pm2 list 2>/dev/null | grep -q giftway-server; then
  pm2 start src/index.js --name giftway-server
fi
pm2 save
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u root --hp /root 2>&1 | tail -3 || true

echo "===== 3/5 Creating Caddyfile ====="
mkdir -p /etc/caddy
cat > /etc/caddy/Caddyfile <<CADDY_EOF
:80 {
    root * /var/www/giftway/client/dist
    try_files {path} /index.html
    file_server

    reverse_proxy /api/* 127.0.0.1:3001
}
CADDY_EOF

echo "===== 4/5 Restarting Caddy ====="
systemctl restart caddy
sleep 2
systemctl is-active caddy

echo "===== 5/5 Done ====="
echo "Site URL:  http://${SERVER_IP}/"
echo "Admin URL: http://${SERVER_IP}/admin"
echo "Admin login: admin / admin123!"
echo "NOTE: Change admin password after first login!"
