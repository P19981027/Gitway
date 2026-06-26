import { useState, useEffect, useRef, createPortal } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../i18n';
import LanguageSwitcher from '../LanguageSwitcher';
import { notificationApi } from '../../api';

const cardSlugs = [
  { slug: 'jd-e-card', icon: 'ri-shopping-bag-3-fill', color: 'from-[#e53935] to-[#b71c1c]', badge: 'BEST' },
  { slug: 'tmall-card', icon: 'ri-store-2-fill', color: 'from-[#ff5722] to-[#bf360c]', badge: null },
  { slug: 'amazon-card', icon: 'ri-amazon-fill', color: 'from-[#ff9900] to-[#e65100]', badge: 'HOT' },
  { slug: 'uber-card', icon: 'ri-taxi-fill', color: 'from-[#1a1a1a] to-[#000000]', badge: null },
  { slug: 'netflix-card', icon: 'ri-netflix-fill', color: 'from-[#e50914] to-[#b30710]', badge: 'NEW' },
  { slug: 'costco-card', icon: 'ri-shopping-cart-2-fill', color: 'from-[#e31837] to-[#8a0e21]', badge: null },
  { slug: 'lazada-card', icon: 'ri-shopping-bag-fill', color: 'from-[#0f136d] to-[#070942]', badge: null },
];

const formatKRW = (n) => {
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억원`;
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만원`;
  return `${n.toLocaleString('ko-KR')}원`;
};

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [mobileGiftOpen, setMobileGiftOpen] = useState(false);
  const [mobileEventsOpen, setMobileEventsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const giftRef = useRef(null);
  const eventsRef = useRef(null);

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (user) {
      notificationApi.getUnreadCount().then(({ data }) => setUnreadCount(data.count || 0)).catch(() => {});
    } else {
      setUnreadCount(0);
    }
  }, [user, location.pathname]);

  useEffect(() => {
    if (!giftOpen && !eventsOpen) return;
    const handleClick = (e) => {
      if (giftRef.current && !giftRef.current.contains(e.target)) setGiftOpen(false);
      if (eventsRef.current && !eventsRef.current.contains(e.target)) setEventsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [giftOpen, eventsOpen]);

  const headerBg = scrolled || !isHome
    ? 'bg-background-50/85 backdrop-blur-xl border-b border-background-200/50'
    : 'bg-transparent';

  const navLinkClass = (path) => (isActive) => {
    if (isHome) return `px-3 py-2 rounded-lg text-sm font-semibold tracking-wide cursor-pointer transition-colors whitespace-nowrap ${isActive ? 'text-foreground-950' : 'text-foreground-800 hover:text-foreground-950'}`;
    return `px-3 py-2 rounded-lg text-sm font-semibold tracking-wide cursor-pointer transition-colors whitespace-nowrap ${isActive ? 'text-primary-600 bg-primary-50/60' : 'text-foreground-700 hover:text-primary-600 hover:bg-background-100'}`;
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${headerBg}`}>
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-6 md:px-10 md:h-20">
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <img src="https://readdy.ai/api/search-image?query=Luxury%20premium%20gift%20brand%20icon%20with%20elegant%20golden%20gift%20box%20and%20ribbon%20on%20warm%20cream%20background%2C%20sophisticated%20minimalist%20design%2C%20high_end%20branding%20aesthetic%2C%20amber%20orange%20and%20gold%20tones%2C%20clean%20geometric%20composition%2C%20editorial%20quality%20with%20subtle%20shadows%20and%20warm%20lighting&width=200&height=200&seq=giftway-icon-2026-01&orientation=squarish" alt="GiftWay" className="h-10 w-10 md:h-11 md:w-11 rounded-xl object-cover group-hover:scale-105 transition-all duration-500 ring-1 ring-background-200/50" />
          <span className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-heading)' }}>GiftWay</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-2 ml-8">
          <NavLink to="/" end className={navLinkClass('/')}>{t('nav.home')}</NavLink>
          <div ref={giftRef} className="relative">
            <button onClick={() => { setGiftOpen(!giftOpen); setEventsOpen(false); }} onMouseEnter={() => { setGiftOpen(true); setEventsOpen(false); }}
              className={`px-3 py-2 rounded-lg text-sm font-semibold tracking-wide cursor-pointer transition-colors whitespace-nowrap ${!isHome && (location.pathname.startsWith('/giftcards') || giftOpen) ? 'text-primary-600 bg-primary-50/60' : isHome ? 'text-foreground-800 hover:text-foreground-950' : 'text-foreground-700 hover:text-primary-600 hover:bg-background-100'}`}>
              {t('nav.giftcards')}<i className={`ri-arrow-down-s-line text-xs ml-1 transition-transform ${giftOpen ? 'rotate-180' : ''}`}></i>
            </button>
            {giftOpen && (
              <div onMouseLeave={() => setGiftOpen(false)} className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 rounded-xl border border-background-200/70 bg-background-50 py-2 shadow-lg z-50">
                {cardSlugs.map(card => (
                  <Link key={card.slug} to={`/giftcards/${card.slug}`} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground-700 hover:bg-background-100 hover:text-primary-600 transition-colors cursor-pointer whitespace-nowrap">
                    <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${card.color} text-background-50 text-[10px]`}><i className={card.icon}></i></span>
                    {t(`cardNames.${card.slug}`)}
                    {card.badge && <span className="ml-auto rounded-full bg-accent-100 px-1.5 py-0.5 text-[9px] font-bold text-accent-700">{card.badge}</span>}
                  </Link>
                ))}
                <div className="mt-1 border-t border-background-200/70 pt-1">
                  <Link to="/giftcards" className="block px-4 py-2.5 text-sm font-medium text-foreground-500 hover:bg-background-100 hover:text-primary-600 transition-colors cursor-pointer whitespace-nowrap text-center">
                    <i className="ri-grid-fill mr-1.5"></i>{t('home.viewAllCards')}
                  </Link>
                </div>
              </div>
            )}
          </div>
          {user && (
            <>
              <NavLink to="/wallet" className={navLinkClass('/wallet')}>
                <span className="flex items-center gap-1"><i className="ri-wallet-3-line mr-1"></i>{t('nav.wallet')}</span>
              </NavLink>
              <NavLink to="/transactions" className={navLinkClass('/transactions')}>
                <span className="flex items-center gap-1"><i className="ri-file-list-3-line mr-1"></i>{t('nav.transactions')}</span>
              </NavLink>
            </>
          )}
          <div ref={eventsRef} className="relative">
            <button onClick={() => { setEventsOpen(!eventsOpen); setGiftOpen(false); }} onMouseEnter={() => { setEventsOpen(true); setGiftOpen(false); }}
              className={`px-3 py-2 rounded-lg text-sm font-semibold tracking-wide cursor-pointer transition-colors whitespace-nowrap ${!isHome && (location.pathname.startsWith('/events') || eventsOpen) ? 'text-primary-600 bg-primary-50/60' : isHome ? 'text-foreground-800 hover:text-foreground-950' : 'text-foreground-700 hover:text-primary-600 hover:bg-background-100'}`}>
              {t('nav.events')}<i className={`ri-arrow-down-s-line text-xs ml-1 transition-transform ${eventsOpen ? 'rotate-180' : ''}`}></i>
            </button>
            {eventsOpen && (
              <div onMouseLeave={() => setEventsOpen(false)} className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 rounded-xl border border-background-200/70 bg-background-50 py-2 shadow-lg z-50">
                <Link to="/events" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-foreground-700 hover:bg-background-100 hover:text-primary-600 transition-colors cursor-pointer whitespace-nowrap">
                  <span className="flex h-5 w-5 items-center justify-center text-accent-500"><i className="ri-calendar-event-fill"></i></span>{t('home.eventMonthly')}
                </Link>
                <Link to="/events/card-recovery" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-foreground-700 hover:bg-background-100 hover:text-primary-600 transition-colors cursor-pointer whitespace-nowrap">
                  <span className="flex h-5 w-5 items-center justify-center text-accent-500"><i className="ri-bank-card-line"></i></span>{t('home.eventCardRecovery')}
                </Link>
              </div>
            )}
          </div>
          <NavLink to="/faq" className={navLinkClass('/faq')}>{t('nav.faq')}</NavLink>
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <LanguageSwitcher />
          {user ? (
            <>
              <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-all cursor-pointer ${isHome ? 'bg-accent-500/40 text-foreground-900 border border-accent-500/50 hover:bg-accent-500/50' : 'bg-accent-50 border border-accent-200 text-accent-800 hover:bg-accent-100'}`}>
                <span className="flex h-5 w-5 items-center justify-center"><i className="ri-copper-coin-fill text-sm"></i></span>
                <span className="font-mono text-xs">{formatKRW(Number(user.cash_balance || 0))}</span>
              </span>
              <div className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-background-50 text-xs`}><i className="ri-user-fill"></i></span>
                <span className="font-medium whitespace-nowrap">{user.username}</span>
              </div>
              <Link to="/notifications" className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors cursor-pointer ${isHome ? 'text-foreground-800 hover:bg-foreground-900/10' : location.pathname === '/notifications' ? 'text-primary-600 bg-primary-50/60' : 'text-foreground-700 hover:bg-background-100'}`}>
                <i className="ri-notification-3-line text-lg"></i>
                {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent-500 px-1 text-[9px] font-bold text-foreground-950">{unreadCount > 99 ? '99+' : unreadCount}</span>}
              </Link>
              <Link to="/mypage" className="rounded-lg border border-primary-200 bg-primary-50 px-5 py-2.5 text-center text-sm font-semibold text-primary-700 hover:bg-primary-100 transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap">
                <i className="ri-user-line"></i>{t('nav.mypage')}
              </Link>
              {isAdmin && <Link to="/admin" className="text-sm font-medium px-3 py-2 rounded-lg text-accent-700 bg-accent-50 hover:bg-accent-100 transition-colors cursor-pointer">{t('nav.admin')}</Link>}
              <button onClick={() => { logout(); navigate('/'); }} className="rounded-lg border border-background-300 px-4 py-2.5 text-sm font-medium text-foreground-700 hover:bg-background-100 cursor-pointer whitespace-nowrap transition-colors flex items-center justify-center gap-2">
                <i className="ri-logout-box-r-line"></i>{t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${isHome ? 'text-foreground-800 hover:bg-foreground-900/10' : 'text-foreground-700 hover:bg-background-100'}`}>{t('nav.login')}</Link>
              <Link to="/signup" className={`whitespace-nowrap rounded-md bg-primary-500 px-5 py-2 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 cursor-pointer`}>{t('nav.signup')}</Link>
            </>
          )}
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className={`lg:hidden flex h-10 w-10 items-center justify-center rounded-md cursor-pointer ${isHome ? 'text-foreground-800 hover:bg-foreground-900/10' : 'text-foreground-800 hover:bg-background-100'}`}>
          <i className={`text-2xl ${mobileOpen ? 'ri-close-line' : 'ri-menu-line'}`}></i>
        </button>
      </div>

      {mobileOpen && createPortal(
        <>
          <div className="fixed inset-0 z-[9998] bg-foreground-950/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-x-0 top-[72px] md:top-20 z-[9999] bg-background-50 lg:hidden flex flex-col overflow-y-auto animate-fade-in max-h-[calc(100vh-72px)] md:max-h-[calc(100vh-80px)]">
            <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-0.5 px-5 py-5">
              {user && (
                <div className="mb-3 rounded-xl border border-accent-200/70 bg-gradient-to-r from-accent-50 to-background-50 px-4 py-3.5 flex items-center gap-3">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-background-50">
                    <i className="ri-copper-coin-fill text-base"></i>
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium text-foreground-500 tracking-wide uppercase">{t('wallet.cashBalance')}</div>
                    <div className="text-base font-bold text-foreground-900 font-mono tracking-tight">{formatKRW(Number(user.cash_balance || 0))}</div>
                  </div>
                  <Link to="/wallet" onClick={() => setMobileOpen(false)} className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-background-300 bg-background-50 text-foreground-500 hover:text-primary-600 hover:border-primary-300 transition-colors cursor-pointer">
                    <i className="ri-arrow-right-line"></i>
                  </Link>
                </div>
              )}

              <div className="flex flex-col gap-0.5">
                <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-foreground-800 hover:bg-background-100 transition-colors">
                  <i className="ri-home-4-line text-base text-foreground-400"></i>{t('nav.home')}
                </Link>

                <div>
                  <button onClick={() => { setMobileGiftOpen(!mobileGiftOpen); setMobileEventsOpen(false); }}
                    className="w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-foreground-800 hover:bg-background-100 transition-colors">
                    <span className="flex items-center gap-3"><i className="ri-shopping-bag-3-line text-base text-foreground-400"></i>{t('nav.giftcards')}</span>
                    <i className={`ri-arrow-down-s-line text-base text-foreground-300 transition-transform ${mobileGiftOpen ? 'rotate-180' : ''}`}></i>
                  </button>
                  {mobileGiftOpen && (
                    <div className="ml-7 border-l-2 border-primary-200 pl-3 space-y-0.5 py-1">
                      {cardSlugs.map(card => (
                        <Link key={card.slug} to={`/giftcards/${card.slug}`} onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground-600 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                          <i className={`${card.icon} text-xs`}></i>{t(`cardNames.${card.slug}`)}
                          {card.badge && <span className="ml-auto text-[9px] font-bold text-accent-600">{card.badge}</span>}
                        </Link>
                      ))}
                      <Link to="/giftcards" onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-50 transition-colors">
                        <i className="ri-grid-fill text-xs"></i>{t('home.viewAllCards')}
                      </Link>
                    </div>
                  )}
                </div>

                {user && (
                  <>
                    <Link to="/wallet" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-foreground-800 hover:bg-background-100 transition-colors">
                      <i className="ri-wallet-3-line text-base text-foreground-400"></i>{t('nav.wallet')}
                    </Link>
                    <Link to="/transactions" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-foreground-800 hover:bg-background-100 transition-colors">
                      <i className="ri-file-list-3-line text-base text-foreground-400"></i>{t('nav.transactions')}
                    </Link>
                    <Link to="/notifications" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-foreground-800 hover:bg-background-100 transition-colors">
                      <i className="ri-notification-3-line text-base text-foreground-400"></i>{t('nav.notifications')}
                      {unreadCount > 0 && <span className="ml-auto rounded-full bg-accent-500 px-2 py-0.5 text-[10px] font-bold text-foreground-950">{unreadCount}</span>}
                    </Link>
                  </>
                )}

                <div>
                  <button onClick={() => { setMobileEventsOpen(!mobileEventsOpen); setMobileGiftOpen(false); }}
                    className="w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-foreground-800 hover:bg-background-100 transition-colors">
                    <span className="flex items-center gap-3"><i className="ri-calendar-event-line text-base text-foreground-400"></i>{t('nav.events')}</span>
                    <i className={`ri-arrow-down-s-line text-base text-foreground-300 transition-transform ${mobileEventsOpen ? 'rotate-180' : ''}`}></i>
                  </button>
                  {mobileEventsOpen && (
                    <div className="ml-7 border-l-2 border-accent-200 pl-3 space-y-0.5 py-1">
                      <Link to="/events" onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground-600 hover:bg-accent-50 hover:text-accent-600 transition-colors">
                        <i className="ri-calendar-event-fill text-xs"></i>{t('home.eventMonthly')}
                      </Link>
                      <Link to="/events/card-recovery" onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground-600 hover:bg-accent-50 hover:text-accent-600 transition-colors">
                        <i className="ri-bank-card-line text-xs"></i>{t('home.eventCardRecovery')}
                      </Link>
                    </div>
                  )}
                </div>

                <Link to="/faq" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-foreground-800 hover:bg-background-100 transition-colors">
                  <i className="ri-question-line text-base text-foreground-400"></i>{t('nav.faq')}
                </Link>
              </div>

              <div className="mt-3 border-t border-background-200/60 pt-3">
                <div className="py-1"><LanguageSwitcher /></div>
              </div>

              <div className="mt-3 border-t border-background-200/60 pt-3">
                {user ? (
                  <div className="flex flex-col gap-1">
                    <Link to="/mypage" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-foreground-800 hover:bg-background-100 transition-colors">
                      <i className="ri-user-line text-base text-foreground-400"></i>{t('nav.mypage')}
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-accent-700 hover:bg-accent-50 transition-colors">
                        <i className="ri-settings-3-line text-base text-accent-400"></i>{t('nav.admin')}
                      </Link>
                    )}
                    <button onClick={() => { logout(); navigate('/'); setMobileOpen(false); }}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-foreground-600 hover:bg-background-100 transition-colors w-full text-left">
                      <i className="ri-logout-box-r-line text-base text-foreground-400"></i>{t('nav.logout')}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" onClick={() => setMobileOpen(false)}
                      className="flex-1 rounded-xl border border-background-300 py-2.5 text-center text-sm font-semibold text-foreground-700 hover:bg-background-100 transition-colors">
                      {t('nav.login')}
                    </Link>
                    <Link to="/signup" onClick={() => setMobileOpen(false)}
                      className="flex-1 rounded-xl bg-primary-500 py-2.5 text-center text-sm font-semibold text-background-50 hover:bg-primary-600 transition-colors">
                      {t('nav.signup')}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </header>
  );
}
