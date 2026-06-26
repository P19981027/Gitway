const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const db = require('../db/connection');

const router = express.Router();

router.use(authMiddleware);

router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const userId = req.user.id;

  const notifications = db.prepare(`
    SELECT n.*,
      CASE
        WHEN n.user_id IS NULL THEN
          CASE WHEN nr.id IS NULL THEN 0 ELSE 1 END
        ELSE n.is_read
      END AS is_read,
      CASE
        WHEN n.user_id IS NULL THEN
          CASE WHEN nr.id IS NULL THEN 0 ELSE 1 END
        ELSE n.is_read
      END AS read
    FROM notifications n
    LEFT JOIN notification_reads nr ON nr.notification_id = n.id AND nr.user_id = ?
    WHERE (n.user_id = ? OR n.user_id IS NULL)
    ORDER BY n.created_at DESC
    LIMIT ? OFFSET ?
  `).all(userId, userId, limit, offset);

  const unreadCount = db.prepare(`
    SELECT COUNT(*) as count FROM notifications n
    LEFT JOIN notification_reads nr ON nr.notification_id = n.id AND nr.user_id = ?
    WHERE (n.user_id = ? OR n.user_id IS NULL)
      AND (
        (n.user_id IS NULL AND nr.id IS NULL)
        OR (n.user_id IS NOT NULL AND n.is_read = 0)
      )
  `).get(userId, userId).count;

  res.json({ notifications, unreadCount });
});

router.put('/:id/read', (req, res) => {
  const userId = req.user.id;
  const notifId = req.params.id;
  const notif = db.prepare('SELECT * FROM notifications WHERE id = ?').get(notifId);
  if (!notif) return res.status(404).json({ message: '알림을 찾을 수 없습니다.' });
  if (notif.user_id === null) {
    db.prepare('INSERT OR IGNORE INTO notification_reads (user_id, notification_id) VALUES (?, ?)').run(userId, notifId);
  } else if (notif.user_id === userId) {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(notifId, userId);
  } else {
    return res.status(403).json({ message: '접근할 수 없는 알림입니다.' });
  }
  res.json({ message: '읽음 처리되었습니다.' });
});

router.put('/read-all', (req, res) => {
  const userId = req.user.id;
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0').run(userId);
  db.prepare(`
    INSERT OR IGNORE INTO notification_reads (user_id, notification_id)
    SELECT ?, id FROM notifications WHERE user_id IS NULL
  `).run(userId);
  res.json({ message: '모든 알림이 읽음 처리되었습니다.' });
});

router.get('/unread-count', (req, res) => {
  const userId = req.user.id;
  const count = db.prepare(`
    SELECT COUNT(*) as count FROM notifications n
    LEFT JOIN notification_reads nr ON nr.notification_id = n.id AND nr.user_id = ?
    WHERE (n.user_id = ? OR n.user_id IS NULL)
      AND (
        (n.user_id IS NULL AND nr.id IS NULL)
        OR (n.user_id IS NOT NULL AND n.is_read = 0)
      )
  `).get(userId, userId).count;
  res.json({ count });
});

module.exports = router;
