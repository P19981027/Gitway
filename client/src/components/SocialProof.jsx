import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

const NAMES = [
  '김민수', '이서연', '박지훈', '최하은', '정도윤',
  '강수빈', '조현우', '윤채원', '장민서', '임지우',
  '예나', '한결', '신윤서', '서준', '권지민',
];

const AMOUNTS = [1, 2, 3, 5, 7, 10, 15, 20];

const CARDS = ['jd-e-card', 'tmall-card', 'amazon-card', 'uber-card', 'netflix-card', 'costco-card', 'lazada-card'];

const EVENT_TYPES = [
  { type: 'purchase', weight: 7 },
  { type: 'signup', weight: 2 },
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickWeightedType() {
  const total = EVENT_TYPES.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  for (const e of EVENT_TYPES) {
    r -= e.weight;
    if (r <= 0) return e.type;
  }
  return 'purchase';
}

function getEventContent(t, eventType, name, cardSlug, amount) {
  const cardName = t(`cardNames.${cardSlug}`);
  switch (eventType) {
    case 'purchase':
      return { icon: 'ri-shopping-bag-3-fill', iconBg: 'bg-primary-100 text-primary-600', text: <><span className="font-semibold">{name}</span>{t('social.justBought')}</>, sub: <Link to={`/giftcards/${cardSlug}`} className="text-xs text-primary-600 hover:text-primary-700 font-medium truncate block">{cardName} {t('social.won10k', { n: amount })}</Link> };
    case 'signup':
      return { icon: 'ri-user-add-fill', iconBg: 'bg-accent-100 text-accent-600', text: <><span className="font-semibold">{name}</span>{t('social.signedUp')}</>, sub: <span className="text-xs text-accent-600 font-medium">{t('social.welcomeJoin')}</span> };
    default:
      return { icon: 'ri-shopping-bag-3-fill', iconBg: 'bg-primary-100 text-primary-600', text: <span className="font-semibold">{name}</span>, sub: null };
  }
}

export default function SocialProof() {
  const { t } = useI18n();
  const [notification, setNotification] = useState(null);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef(null);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      setNotification(null);
      setExiting(false);
    }, 300);
  }, []);

  const showNext = useCallback(() => {
    const name = pickRandom(NAMES);
    const cardSlug = pickRandom(CARDS);
    const amount = pickRandom(AMOUNTS);
    const eventType = pickWeightedType();

    setNotification({ name, cardSlug, amount, eventType });
    setExiting(false);
    setVisible(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(dismiss, 5000);
  }, [dismiss]);

  useEffect(() => {
    const scheduleNext = () => {
      const delay = 30000 + Math.random() * 60000;
      return setTimeout(showNext, delay);
    };

    const initialTimer = scheduleNext();
    let loopTimer = null;

    const handleVisibility = () => {
      if (document.hidden) return;
      if (loopTimer) clearTimeout(loopTimer);
      loopTimer = scheduleNext();
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearTimeout(initialTimer);
      if (loopTimer) clearTimeout(loopTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [showNext]);

  if (!notification) return null;

  const content = getEventContent(t, notification.eventType, notification.name, notification.cardSlug, notification.amount);

  return (
    <div className={`fixed bottom-20 left-4 z-[55] md:bottom-24 md:left-6 transition-all duration-300 ${visible && !exiting ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}>
      <div className="flex items-center gap-3 rounded-xl border border-background-200/60 bg-background-50/95 backdrop-blur-md px-4 py-3 shadow-lg max-w-[320px] md:max-w-[360px]">
        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${content.iconBg}`}>
          <i className={`${content.icon} text-sm`}></i>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground-800 leading-snug truncate">{content.text}</p>
          {content.sub}
        </div>
        <button onClick={dismiss} className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-md text-foreground-400 hover:text-foreground-600 hover:bg-foreground-900/5 transition-colors" aria-label="Dismiss">
          <i className="ri-close-line text-sm"></i>
        </button>
      </div>
    </div>
  );
}
