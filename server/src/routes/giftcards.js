const express = require('express');
const db = require('../db/connection');
const { optionalAuth } = require('../middleware/auth');
const { NotFoundError } = require('../utils/errors');

const router = express.Router();

router.get('/', optionalAuth, (req, res) => {
  const cards = db.prepare(`
    SELECT t.*,
      GROUP_CONCAT(
        json_object(
          'id', v.id,
          'faceValue', v.face_value,
          'discountNormal', v.discount_normal,
          'priceNormal', v.price_normal,
          'dailyLimit', v.daily_limit,
          'stock', v.stock
        )
      ) as variants_json
    FROM gift_card_types t
    LEFT JOIN gift_card_variants v ON t.id = v.gift_card_type_id AND v.is_active = 1
    WHERE t.is_active = 1
    GROUP BY t.id
    ORDER BY t.sort_order
  `).all();

  const result = cards.map(card => {
    let variants = [];
    try {
      if (card.variants_json) {
        variants = JSON.parse(`[${card.variants_json}]`);
      }
    } catch {}
    const { variants_json, ...cardData } = card;
    cardData.highlights = JSON.parse(cardData.highlights || '[]');
    cardData.how_to_use = JSON.parse(cardData.how_to_use || '[]');
    return { ...cardData, variants };
  });

  res.json({ cards: result });
});

router.get('/:slug', optionalAuth, (req, res, next) => {
  try {
    const card = db.prepare('SELECT * FROM gift_card_types WHERE slug = ? AND is_active = 1').get(req.params.slug);
    if (!card) throw new NotFoundError('상품을 찾을 수 없습니다.');

    const rawVariants = db.prepare(
      'SELECT id, face_value, discount_normal, price_normal, daily_limit, stock FROM gift_card_variants WHERE gift_card_type_id = ? AND is_active = 1 ORDER BY face_value'
    ).all(card.id);

    const variants = rawVariants.map(v => ({
      id: v.id,
      faceValue: v.face_value,
      discountNormal: v.discount_normal,
      priceNormal: v.price_normal,
      dailyLimit: v.daily_limit,
      stock: v.stock,
    }));

    card.highlights = JSON.parse(card.highlights || '[]');
    card.how_to_use = JSON.parse(card.how_to_use || '[]');

    res.json({ card: { ...card, variants } });
  } catch (err) { next(err); }
});

module.exports = router;
