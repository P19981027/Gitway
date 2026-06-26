import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { giftcardApi } from '../api';
import { useI18n } from '../i18n';
import { useAuth } from '../contexts/AuthContext';

const regionKeyMap = {
  '중국': { '쇼핑': 'home.regionChina' },
  '글로벌': { '쇼핑': 'home.regionGlobalShopping', '여행/이동': 'home.regionGlobalTravel', '엔터테인먼트': 'home.regionGlobalEnt' },
  '동남아시아': { '쇼핑': 'home.regionSEA' },
};

function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-background-200/60 bg-background-50 animate-pulse">
      <div className="aspect-[4/3] w-full bg-background-200" />
      <div className="flex flex-1 flex-col gap-3 p-4 md:p-5">
        <div className="h-4 w-3/4 rounded bg-background-200" />
        <div className="mt-auto flex items-end justify-between border-t border-background-200/60 pt-4">
          <div className="h-5 w-20 rounded bg-background-200" />
          <div className="h-5 w-14 rounded-full bg-background-200" />
        </div>
      </div>
    </div>
  );
}

export default function GiftCards() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [region, setRegion] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('popular');
  const gridRef = useRef(null);

  const categories = [
    { key: 'all', label: t('giftcards.allCards') },
    { key: '쇼핑', label: t('giftcards.shopCards') },
    { key: '여행/이동', label: t('giftcards.travelCards') },
    { key: '엔터테인먼트', label: t('giftcards.entCards') },
  ];
  const regions = [
    { key: 'all', label: t('giftcards.allCards') },
    { key: '글로벌', label: t('home.regionGlobalShopping').split('·')[0].trim() },
    { key: '중국', label: t('home.regionChina').split('·')[0].trim() },
    { key: '동남아시아', label: t('home.regionSEA').split('·')[0].trim() },
  ];

  useEffect(() => {
    giftcardApi.getAll().then(({ data }) => { setCards(data.cards); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || !gridRef.current) return;
    const items = gridRef.current.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    items.forEach((item, i) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(24px)';
      item.style.transition = `opacity 500ms ease-out ${i * 80}ms, transform 500ms ease-out ${i * 80}ms`;
      observer.observe(item);
    });
    return () => observer.disconnect();
  }, [loading, cards, category, region, search, sort]);

  let filtered = cards;
  if (category !== 'all') filtered = filtered.filter(c => c.category === category);
  if (region !== 'all') filtered = filtered.filter(c => c.region === region);
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(c => c.name?.toLowerCase().includes(q) || c.brand?.toLowerCase().includes(q));
  }
  if (sort === 'discount') {
    filtered = [...filtered].sort((a, b) => {
      const maxA = Math.max(...(a.variants?.map(v => v.discountNormal) || [0]));
      const maxB = Math.max(...(b.variants?.map(v => v.discountNormal) || [0]));
      return maxB - maxA;
    });
  } else if (sort === 'price') {
    filtered = [...filtered].sort((a, b) => {
      const minA = a.variants?.length ? Math.min(...a.variants.map(v => v.priceNormal)) : 0;
      const minB = b.variants?.length ? Math.min(...b.variants.map(v => v.priceNormal)) : 0;
      return minA - minB;
    });
  }

  return (
    <div className="min-h-screen bg-background-50">
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden border-b border-background-200/60">
        <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(circle, var(--color-foreground-900) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="absolute -top-20 right-0 h-64 w-64 rounded-full bg-accent-100/30 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 left-0 h-48 w-48 rounded-full bg-primary-100/20 blur-3xl pointer-events-none"></div>
        <div className="relative mx-auto max-w-[1400px] px-6 py-12 md:px-10 md:py-16">
          <nav className="flex items-center gap-2 text-sm text-foreground-400 mb-6">
            <Link to="/" className="hover:text-primary-600 transition-colors">{t('nav.home')}</Link>
            <i className="ri-arrow-right-s-line text-xs"></i>
            <span className="text-foreground-700">{t('nav.giftcards')}</span>
          </nav>
          <h1 className="text-3xl font-bold tracking-tight text-foreground-950 md:text-4xl" style={{ fontFamily: 'var(--font-heading)' }}>{t('giftcards.title')}</h1>
          <p className="mt-3 text-sm text-foreground-500 md:text-base">{t('giftcards.subtitle')}</p>
          {user && (
            <div className="mt-6 flex items-center gap-3 rounded-xl bg-gradient-to-r from-accent-50 to-background-50 border border-accent-200/50 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-background-50 text-xs font-bold">
                <i className="ri-wallet-3-fill text-sm"></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-foreground-500">{t('mypage.cashBalance')}</div>
                <div className="text-sm font-bold text-foreground-950">₩{(user.cash_balance ?? 0).toLocaleString()}</div>
              </div>
              <Link to="/wallet" className="rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-bold text-background-50 hover:bg-primary-600 transition-colors">{t('giftcards.topUpCash')}</Link>
            </div>
          )}
        </div>
      </section>

      {/* ═══ FILTER BAR (sticky) ═══ */}
      <div className="sticky top-[72px] md:top-20 z-30 -mx-6 md:-mx-10 px-6 md:px-10 py-4 backdrop-blur-md bg-background-50/90 border-b border-background-200/50">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            {/* Category pills */}
            <div className="flex items-center gap-1 bg-background-100/70 p-1 rounded-full">
              {categories.map(c => (
                <button key={c.key} onClick={() => setCategory(c.key)}
                  className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${category === c.key ? 'bg-foreground-900 text-background-50 shadow-sm' : 'text-foreground-600 hover:bg-background-200/50'}`}>
                  {c.label}
                </button>
              ))}
            </div>
            {/* Region pills */}
            <div className="flex items-center gap-1 bg-background-100/70 p-1 rounded-full">
              {regions.map(r => (
                <button key={r.key} onClick={() => setRegion(r.key)}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${region === r.key ? 'bg-secondary-500 text-background-50 shadow-sm' : 'text-foreground-500 hover:bg-background-200/50'}`}>
                  {r.label}
                </button>
              ))}
            </div>
            <div className="flex-1" />
            {/* Search */}
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-foreground-300 text-sm"></i>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('giftcards.search')}
                className="w-full md:w-48 rounded-lg border border-background-200 bg-background-50 pl-9 pr-3 py-2 text-sm outline-none focus:border-primary-400 transition-colors" />
            </div>
            {/* Sort */}
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="rounded-lg border border-background-200 bg-background-50 px-3 py-2 text-sm outline-none focus:border-primary-400 cursor-pointer">
              <option value="popular">{t('giftcards.sortPopular')}</option>
              <option value="discount">{t('giftcards.sortDiscount')}</option>
              <option value="price">{t('giftcards.sortPrice')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* ═══ CARD GRID ═══ */}
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 pb-20">
        {/* Card count */}
        {!loading && (
          <div className="mt-6 mb-4 text-sm text-foreground-500">
            {t('giftcards.count', { n: filtered.length })}
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4" ref={gridRef}>
            {filtered.map(card => {
              const minPrice = card.variants?.length ? Math.min(...card.variants.map(v => v.priceNormal)) : 0;
              const maxDiscount = card.variants?.length ? Math.max(...card.variants.map(v => v.discountNormal)) : 0;
              const regionI18nKey = regionKeyMap[card.region]?.[card.category];
              return (
                <Link key={card.id} to={`/giftcards/${card.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-background-200/60 bg-background-50 hover:-translate-y-1.5 hover:border-primary-300/60 transition-all duration-500" data-reveal>
                  <div className={`relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br ${card.color_gradient}`}>
                    <img alt={card.name} className="absolute inset-0 h-full w-full object-cover object-top opacity-35 mix-blend-overlay group-hover:scale-105 group-hover:opacity-45 transition-all duration-700" src={card.image_url} />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground-950/50 via-foreground-950/10 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-background-50/5 via-transparent to-transparent"></div>
                    {card.badge && <span className="absolute right-3 top-3 md:right-4 md:top-4 rounded-full bg-accent-500/95 px-3 py-1 text-[10px] font-bold text-foreground-950 backdrop-blur-sm shadow-sm">{card.badge}</span>}
                    <div className="absolute left-3 top-3 md:left-4 md:top-4 flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg bg-background-50/95 text-foreground-900 ring-1 ring-background-50/10 backdrop-blur-sm"><i className={`${card.logo_icon} text-lg`}></i></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                      <div className="mb-1 text-[10px] font-medium uppercase tracking-[0.12em] text-background-100/70">{regionI18nKey ? t(regionI18nKey) : `${card.region} · ${card.category}`}</div>
                      <div className="text-lg md:text-xl font-bold tracking-tight text-background-50">{card.name}</div>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-4 md:p-5">
                    <p className="text-xs line-clamp-2 md:text-sm text-foreground-500">{card.brand}</p>
                    <div className="mt-auto flex items-end justify-between border-t border-background-200/60 pt-4">
                      <div>
                        <div className="text-[10px] font-medium uppercase tracking-wider text-foreground-400">{t('home.lowestPrice')}</div>
                        <div className="text-lg font-bold tracking-tight text-foreground-950 md:text-xl">{minPrice.toLocaleString()}{t('common.won')}<span className="ml-1 text-xs font-medium text-foreground-400">~</span></div>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent-100/80 px-2.5 py-1 text-[11px] font-bold text-accent-800 border border-accent-200/50">
                        <i className="ri-coupon-3-fill text-[10px]"></i>{t('home.upTo')} {maxDiscount}%
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div className="mt-16 text-center text-foreground-400">
            <i className="ri-search-eye-line text-4xl mb-3 block"></i>
            <p>{t('giftcards.noResults')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
