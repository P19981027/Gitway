const bcrypt = require('bcryptjs');
const db = require('./connection');
const { initDatabase } = require('./init');
const config = require('../config');

function seed() {
  initDatabase();

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) {
    console.log('Database already seeded, skipping.');
    return;
  }

  const adminPw = bcrypt.hashSync('admin123!', 12);

  db.prepare(`
    INSERT INTO users (username, email, password_hash, phone, phone_verified, email_verified, role, cash_balance, withdrawable_cash)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('admin', 'admin@giftway.kr', adminPw, '01000000000', 1, 1, 'super_admin', 100000000000, 100000000000);

  db.prepare(`
    INSERT INTO admin_roles (name, permissions) VALUES (?, ?)
  `).run('super_admin', JSON.stringify(['manage_users', 'manage_cash', 'manage_usdt', 'manage_orders', 'manage_pins', 'manage_roles', 'send_notifications']));
  db.prepare(`INSERT INTO admin_roles (name, permissions) VALUES (?, ?)`).run('admin', JSON.stringify(['manage_users', 'manage_cash', 'manage_usdt', 'manage_orders', 'manage_pins']));

  db.prepare(`
    INSERT INTO usdt_settings (receiving_address, exchange_rate, min_deposit, min_withdrawal, payment_timeout_minutes, is_active)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(config.usdt.defaultAddress, config.usdt.defaultExchangeRate, 10, 10, 30, 1);

  const cards = [
    {
      slug: 'jd-e-card', name: 'JD E카드', brand: '京东 JD.com', short_name: 'JD',
      region: '중국', category: '쇼핑', currency: 'KRW',
      tagline: '중국 최대 종합 쇼핑몰 JD.com 전용',
      description: 'JD E카드는 중국 최대 종합 쇼핑몰 JD.com에서 사용할 수 있는 전자 상품권입니다. 모든 상품을 할인가에 구매할 수 있으며, 즉시 결제로 빠른 배송이 가능합니다.',
      highlights: JSON.stringify(['전 상품 사용 가능', '즉시 결제 가능', '회원 포인트 추가 적립']),
      how_to_use: JSON.stringify(['1. JD.com 로그인', '2. 계정 설정 > 상품권 등록', '3. PIN 번호 입력']),
      color_gradient: 'from-[#e53935] to-[#b71c1c]', badge: 'BEST', logo_icon: 'ri-shopping-bag-3-fill',
      image_url: 'https://public.readdy.ai/ai/img_res/edited_22b069a66bbe469de69201f29ba19bce_dda0b3f8.jpg', sort_order: 1,
      variants: [
        { face_value: 113000, discount_normal: 5, price_normal: 107350, daily_limit: 20 },
        { face_value: 226000, discount_normal: 5, price_normal: 214700, daily_limit: 15 },
        { face_value: 452000, discount_normal: 5, price_normal: 429400, daily_limit: 10 },
        { face_value: 1130000, discount_normal: 5, price_normal: 1073500, daily_limit: 5 },
      ]
    },
    {
      slug: 'tmall-card', name: 'T-Mall 카드', brand: '天猫 Tmall', short_name: 'T-Mall',
      region: '중국', category: '쇼핑', currency: 'KRW',
      tagline: '알리바바 그룹 프리미엄 쇼핑몰',
      description: 'T-Mall 카드는 알리바바 그룹의 프리미엄 쇼핑몰 천고를 위한 전자 상품권입니다.',
      highlights: JSON.stringify(['프리미엄 브랜드 전용', '정품 보증', '빠른 배송']),
      how_to_use: JSON.stringify(['1. Tmall.com 접속', '2. 결제 시 상품권 사용']),
      color_gradient: 'from-[#ff5722] to-[#bf360c]', badge: null, logo_icon: 'ri-store-2-fill',
      image_url: 'https://readdy.ai/api/search-image?query=Premium%20luxury%20physical%20gift%20card%20design%20for%20Tmall%20Chinese%20e-commerce%20platform%2C%20identical%20premium%20style%20to%20Netflix%20gift%20card.%20Dark%20warm%20gradient%20background%20with%20dramatic%20cinematic%20lighting.%20The%20card%20is%20displayed%20at%20an%20elegant%203D%20isometric%20perspective%20angle%20with%20realistic%20depth%2C%20soft%20shadows%2C%20and%20subtle%20reflections.%20Card%20surface%20has%20rich%20orange%20to%20deep%20red%20gradient%20with%20clean%20crisp%20white%20TMALL%20text%20prominently%20printed%20in%20sharp%20modern%20sans-serif%20font.%20Small%20silver%20metallic%20chip%20visible%20on%20the%20card.%20High-end%20studio%20product%20photography%2C%20photorealistic%20rendering%2C%20elegant%20premium%20retail%20catalog%20aesthetic%2C%20the%20brand%20text%20must%20be%20perfectly%20legible%20and%20sharp%20with%20no%20blur&width=420&height=265&seq=tmall-premium-netflix-style-2026-06-16&orientation=landscape', sort_order: 2,
      variants: [
        { face_value: 22600, discount_normal: 4, price_normal: 21696, daily_limit: 20 },
        { face_value: 113000, discount_normal: 4, price_normal: 108480, daily_limit: 15 },
        { face_value: 226000, discount_normal: 4, price_normal: 216960, daily_limit: 10 },
      ]
    },
    {
      slug: 'amazon-card', name: '아마존 기프트카드', brand: 'Amazon', short_name: 'Amazon',
      region: '글로벌', category: '쇼핑', currency: 'KRW',
      tagline: '전세계 최대 쇼핑 플랫폼',
      description: '아마존 기프트카드는 전 세계 최대의 쇼핑 플랫폼 Amazon에서 사용할 수 있습니다.',
      highlights: JSON.stringify(['글로벌 사용 가능', '디지털 보납 즉시 처리', '다양한 금액 선택']),
      how_to_use: JSON.stringify(['1. Amazon.com 로그인', '2. Gift Cards > Redeem', '3. 코드 입력']),
      color_gradient: 'from-[#ff9900] to-[#e65100]', badge: 'HOT', logo_icon: 'ri-amazon-fill',
      image_url: 'https://public.readdy.ai/ai/img_res/edited_a141461041ba769d88d85d223b149772_2d94da05.jpg', sort_order: 3,
      variants: [
        { face_value: 76000, discount_normal: 1, price_normal: 75240, daily_limit: 20 },
        { face_value: 152000, discount_normal: 1, price_normal: 150480, daily_limit: 15 },
        { face_value: 304000, discount_normal: 1, price_normal: 300960, daily_limit: 10 },
        { face_value: 760000, discount_normal: 1, price_normal: 752400, daily_limit: 5 },
      ]
    },
    {
      slug: 'uber-card', name: '우버 기프트카드', brand: 'Uber', short_name: 'Uber',
      region: '글로벌', category: '여행/이동', currency: 'KRW',
      tagline: '전세계 차량 호출 & Uber Eats',
      description: '우버 기프트카드는 Uber 차량 호출과 Uber Eats 주문에 사용할 수 있습니다.',
      highlights: JSON.stringify(['Uber & Uber Eats 모두 사용', '글로벌 지역 사용', '즉시 사용 가능']),
      how_to_use: JSON.stringify(['1. Uber 앱 실행', '2. 결제 방법 > 기프트카드', '3. 코드 입력']),
      color_gradient: 'from-[#1a1a1a] to-[#000000]', badge: null, logo_icon: 'ri-taxi-fill',
      image_url: 'https://public.readdy.ai/ai/img_res/edited_edcf3d674a08f6d0dcedc413982a78c7_9785cfae.jpg', sort_order: 4,
      variants: [
        { face_value: 76000, discount_normal: 4, price_normal: 72960, daily_limit: 20 },
        { face_value: 152000, discount_normal: 4, price_normal: 145920, daily_limit: 15 },
        { face_value: 304000, discount_normal: 4, price_normal: 291840, daily_limit: 10 },
      ]
    },
    {
      slug: 'netflix-card', name: '넷플릭스 기프트카드', brand: 'Netflix', short_name: 'Netflix',
      region: '글로벌', category: '엔터테인먼트', currency: 'KRW',
      tagline: '전세계 1위 OTT 스트리밍',
      description: '넷플릭스 기프트카드는 전 세계 1위 OTT 스트리밍 서비스에 사용할 수 있습니다.',
      highlights: JSON.stringify(['모든 콘텐츠 무제한 시청', '4K 화질 지원', '다중 프로필 공유']),
      how_to_use: JSON.stringify(['1. Netflix.com 로그인', '2. 계정 > 결제 정보', '3. 기프트카드 사용']),
      color_gradient: 'from-[#e50914] to-[#b30710]', badge: 'NEW', logo_icon: 'ri-netflix-fill',
      image_url: 'https://public.readdy.ai/ai/img_res/edited_4bf2ee1ba1f6940970ae6623f0c10027_aef826a2.jpg', sort_order: 5,
      variants: [
        { face_value: 76000, discount_normal: 3, price_normal: 73720, daily_limit: 20 },
        { face_value: 152000, discount_normal: 3, price_normal: 147440, daily_limit: 15 },
        { face_value: 304000, discount_normal: 3, price_normal: 294880, daily_limit: 10 },
      ]
    },
    {
      slug: 'costco-card', name: '코스트코 상품권', brand: 'Costco', short_name: 'Costco',
      region: '글로벌', category: '쇼핑', currency: 'KRW',
      tagline: '회원제 창고형 할인매장 1위',
      description: '코스트코 상품권은 회원제 창고형 할인매장 Costco에서 사용할 수 있습니다.',
      highlights: JSON.stringify(['전 매장 사용 가능', '식료조립 구매 가능', '정품 보증']),
      how_to_use: JSON.stringify(['1. Costco 매장 방문', '2. 결제 시 상품권 제시']),
      color_gradient: 'from-[#e31837] to-[#8a0e21]', badge: null, logo_icon: 'ri-shopping-cart-2-fill',
      image_url: 'https://public.readdy.ai/ai/img_res/edited_23cbf32a910db424d7ab98ec64bf50fa_ef5db8cf.jpg', sort_order: 6,
      variants: [
        { face_value: 152000, discount_normal: 2, price_normal: 148960, daily_limit: 20 },
        { face_value: 304000, discount_normal: 2, price_normal: 297920, daily_limit: 15 },
        { face_value: 760000, discount_normal: 2, price_normal: 744800, daily_limit: 5 },
      ]
    },
    {
      slug: 'lazada-card', name: '라자다 상품권', brand: 'Lazada', short_name: 'Lazada',
      region: '동남아시아', category: '쇼핑', currency: 'KRW',
      tagline: '동남아 No.1 종합 쇼핑몰',
      description: '라자다 상품권은 동남아시아 최대 종합 쇼핑몰 Lazada에서 사용할 수 있습니다.',
      highlights: JSON.stringify(['동남아 6개국 사용', '알리바바 그룹 계열', '많은 할인 행사']),
      how_to_use: JSON.stringify(['1. Lazada 앱 실행', '2. 결제 방법 선택', '3. 기프트카드 입력']),
      color_gradient: 'from-[#0f136d] to-[#070942]', badge: null, logo_icon: 'ri-shopping-bag-fill',
      image_url: 'https://public.readdy.ai/ai/img_res/edited_f98f30b290057c3ec42ec40c31cbcdb2_7cee643d.jpg', sort_order: 7,
      variants: [
        { face_value: 59000, discount_normal: 4, price_normal: 56640, daily_limit: 20 },
        { face_value: 118000, discount_normal: 4, price_normal: 113280, daily_limit: 15 },
        { face_value: 236000, discount_normal: 4, price_normal: 226560, daily_limit: 10 },
      ]
    },
  ];

  const insertType = db.prepare(`
    INSERT INTO gift_card_types (slug, name, brand, short_name, region, category, currency, tagline, description, highlights, how_to_use, color_gradient, badge, logo_icon, image_url, sort_order)
    VALUES (@slug, @name, @brand, @short_name, @region, @category, @currency, @tagline, @description, @highlights, @how_to_use, @color_gradient, @badge, @logo_icon, @image_url, @sort_order)
  `);

  const insertVariant = db.prepare(`
    INSERT INTO gift_card_variants (gift_card_type_id, face_value, discount_normal, price_normal, daily_limit, stock)
    VALUES (@gift_card_type_id, @face_value, @discount_normal, @price_normal, @daily_limit, @stock)
  `);

  const insertPin = db.prepare(`
    INSERT INTO gift_card_pins (gift_card_variant_id, pin_number, card_number, status)
    VALUES (?, ?, ?, 'available')
  `);

  for (const card of cards) {
    const { variants, ...typeData } = card;
    const result = insertType.run(typeData);
    const typeId = result.lastInsertRowid;

    for (const v of variants) {
      const vr = insertVariant.run({
        ...v,
        gift_card_type_id: typeId,
        stock: 100,
      });
      const variantId = vr.lastInsertRowid;

      for (let i = 0; i < 10; i++) {
        const pin = `PIN-${card.slug.toUpperCase()}-${String(i + 1).padStart(4, '0')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const cardNum = `CARD-${String(Math.floor(Math.random() * 9000) + 1000)}-****-****-${String(Math.floor(Math.random() * 9000) + 1000)}`;
        insertPin.run(variantId, pin, cardNum);
      }
    }
  }

  console.log('Database seeded successfully!');
  console.log(`- 1 admin user (admin / admin123!)`);
  console.log(`- 7 gift card types with variants`);
  console.log(`- USDT default settings`);
}

seed();
