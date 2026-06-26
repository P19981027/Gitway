import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import { notificationApi } from '../api';

const NOTIF_TYPE_CONFIG = {
  announcement: { icon: 'ri-megaphone-fill', bg: 'bg-primary-100', text: 'text-primary-600', labelKey: 'notifications.typeAnnounce' },
  event: { icon: 'ri-calendar-event-fill', bg: 'bg-accent-100', text: 'text-accent-600', labelKey: 'notifications.typeEvent' },
  system: { icon: 'ri-settings-3-fill', bg: 'bg-foreground-100', text: 'text-foreground-500', labelKey: 'notifications.typeSystem' },
  promotion: { icon: 'ri-price-tag-3-fill', bg: 'bg-secondary-100', text: 'text-secondary-600', labelKey: 'notifications.typePromotion' },
  reward: { icon: 'ri-copper-coin-fill', bg: 'bg-amber-100', text: 'text-amber-600', labelKey: 'notifications.typeReward' },
  pin_push: { icon: 'ri-key-2-fill', bg: 'bg-emerald-100', text: 'text-emerald-600', labelKey: 'notifications.typePinPush' },
};

const SYS_TYPE_CONFIG = {
  reward_credited: { icon: 'ri-copper-coin-fill', bg: 'bg-green-100', text: 'text-green-600' },
  system_refund: { icon: 'ri-refund-2-fill', bg: 'bg-rose-100', text: 'text-rose-600' },
  event: { icon: 'ri-calendar-event-fill', bg: 'bg-accent-100', text: 'text-accent-600' },
  promotion: { icon: 'ri-price-tag-3-fill', bg: 'bg-amber-100', text: 'text-amber-600' },
  system: { icon: 'ri-information-fill', bg: 'bg-foreground-100', text: 'text-foreground-500' },
  pin_push: { icon: 'ri-key-2-fill', bg: 'bg-emerald-100', text: 'text-emerald-600' },
};

export default function Notifications() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedAnnounce, setExpandedAnnounce] = useState(null);
  const [serverUnread, setServerUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    notificationApi.getAll()
      .then(({ data }) => {
        setNotifications(data.notifications || data || []);
        setServerUnread(data.unreadCount || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleMarkRead = async (notifId) => {
    try {
      await notificationApi.markRead(notifId);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: 1 } : n));
      setServerUnread(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setServerUnread(0);
    } catch {}
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-notification-off-line text-4xl text-foreground-300 mb-3 block"></i>
          <p className="text-foreground-400 mb-4">{t('notifications.loginRequired')}</p>
          <Link to="/login" className="rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-bold text-background-50 hover:bg-primary-600 transition-colors">{t('notifications.login')}</Link>
        </div>
      </div>
    );
  }

  const unreadCount = serverUnread;

  const announcements = notifications.filter(n => n.type === 'announcement' || n.type === 'event' || n.type === 'promotion' || n.category === 'announce');
  const systemNotifications = notifications.filter(n => !announcements.includes(n));

  const getTabCount = (tab) => {
    switch (tab) {
      case 'all': return unreadCount;
      case 'announce': return announcements.filter(n => !n.is_read).length;
      case 'system': return systemNotifications.filter(n => !n.is_read).length;
      default: return 0;
    }
  };

  const tabs = [
    { key: 'all', label: t('notifications.tabAll'), icon: 'ri-notification-3-line' },
    { key: 'announce', label: t('notifications.tabAnnounce'), icon: 'ri-megaphone-line' },
    { key: 'system', label: t('notifications.tabSystem'), icon: 'ri-user-line' },
  ];

  return (
    <div className="min-h-screen bg-background-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1a1f2e] via-[#1e2335] to-[#151928]">
        <img
          src="https://readdy.ai/api/search-image?query=Clean%20modern%20notification%20center%20background%20with%20subtle%20slate%20gray%20gradient%20and%20soft%20coral%20accent%20dot%20patterns%2C%20elegant%20alert%20bell%20silhouettes%20in%20minimal%20style%2C%20sophisticated%20tech%20communication%20visual%20theme%2C%20gentle%20warm%20coral%20glow%20elements%2C%20premium%20app%20notification%20aesthetic%2C%20clean%20uncluttered%20atmosphere%2C%20high-end%20mobile%20app%20style&width=1600&height=380&seq=noti-hero-bg-v3&orientation=landscape"
          className="absolute inset-0 h-full w-full object-cover object-top opacity-28 mix-blend-overlay"
          alt=""
        />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, var(--color-accent-500) 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-accent-500/8 blur-[80px] pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-secondary-500/6 blur-[60px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1a1f2e]/50 to-[#151928]"></div>
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-10 pt-32 pb-16 md:pt-40 md:pb-20">
          <nav className="flex items-center gap-2 text-sm text-background-100/60 mb-6">
            <Link to="/" className="hover:text-background-50 transition-colors"><i className="ri-home-4-line"></i></Link>
            <i className="ri-arrow-right-s-line text-xs"></i>
            <span className="text-background-100/80">{t('nav.notifications')}</span>
          </nav>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-500/20 border border-primary-400/30 px-3.5 py-1.5 text-xs font-bold text-primary-300 mb-4">
            <i className="ri-notification-3-line"></i>{t('notifications.center')}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-background-50" style={{ fontFamily: 'var(--font-heading)' }}>{t('notifications.title')}</h1>
          <p className="mt-3 text-sm md:text-base text-background-100/70">{t('notifications.subtitle')}</p>

          <div className="mt-6 grid grid-cols-2 gap-4 max-w-md">
            <div className="rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm p-4">
              <p className="text-[11px] text-background-100/50 uppercase tracking-wider">{t('notifications.unreadLabel')}</p>
              <p className="mt-1 text-2xl font-bold text-accent-400" style={{ fontFamily: 'var(--font-heading)' }}>{unreadCount}</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm p-4">
              <p className="text-[11px] text-background-100/50 uppercase tracking-wider">{t('notifications.totalLabel')}</p>
              <p className="mt-1 text-2xl font-bold text-green-400" style={{ fontFamily: 'var(--font-heading)' }}>{notifications.length}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-[72px] md:top-20 z-30 bg-background-50/95 backdrop-blur-md border-b border-background-200/60">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="flex gap-1 -mb-px overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'text-primary-600 border-primary-500'
                    : 'text-foreground-400 border-transparent hover:text-foreground-600'
                }`}
              >
                <i className={tab.icon}></i>
                {tab.label}
                {getTabCount(tab.key) > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    activeTab === tab.key ? 'bg-primary-500 text-background-50' : 'bg-background-200 text-foreground-500'
                  }`}>{getTabCount(tab.key)}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-10 md:py-14 space-y-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-foreground-400">{t('common.loading')}</div>
          </div>
        ) : (
          <>
            {/* Announcements */}
            {(activeTab === 'all' || activeTab === 'announce') && announcements.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <i className="ri-megaphone-line text-xl text-primary-500"></i>
                  <h2 className="text-lg font-bold text-foreground-950" style={{ fontFamily: 'var(--font-heading)' }}>{t('notifications.announcements')}</h2>
                  {announcements.filter(n => !n.read).length > 0 && (
                    <span className="rounded-full bg-primary-500 px-2.5 py-0.5 text-xs font-bold text-background-50">{announcements.filter(n => !n.read).length}</span>
                  )}
                </div>
                <div className="space-y-2">
                  {announcements.map(notif => {
                    const config = NOTIF_TYPE_CONFIG[notif.type] || NOTIF_TYPE_CONFIG.system;
                    const isExpanded = expandedAnnounce === notif.id;
                    return (
                      <div key={notif.id} className={`rounded-2xl border p-5 md:p-6 transition-colors ${notif.is_read ? 'border-background-200/60 bg-background-50' : 'border-primary-200/50 bg-primary-50/20'}`}>
                        <button
                          onClick={() => { setExpandedAnnounce(isExpanded ? null : notif.id); if (!notif.is_read) handleMarkRead(notif.id); }}
                          className="w-full flex items-start gap-4 text-left"
                        >
                          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${config.bg} ${config.text}`}>
                            <i className={`${config.icon} text-lg`}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${config.bg} ${config.text}`}>{t(config.labelKey)}</span>
                              {notif.important && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">{t('notifications.important')}</span>}
                              {!notif.is_read && <span className="flex h-2 w-2 rounded-full bg-accent-500 animate-pulse"></span>}
                              <span className="ml-auto text-[10px] text-foreground-300 flex-shrink-0">{notif.created_at ? new Date(notif.created_at).toLocaleDateString() : ''}</span>
                            </div>
                            <h3 className={`text-sm font-semibold ${notif.is_read ? 'text-foreground-600' : 'text-foreground-950'}`}>{notif.title}</h3>
                          </div>
                          <i className={`ri-arrow-down-s-line text-foreground-300 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}></i>
                        </button>
                        {isExpanded && (
                          <div className="mt-4 ml-14 text-sm text-foreground-500 leading-relaxed whitespace-pre-line">
                            <p>{notif.content || notif.body}</p>
                            {notif.link && <Link to={notif.link} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700">{t('notifications.viewDetails')} <i className="ri-arrow-right-s-line"></i></Link>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* System Notifications */}
            {(activeTab === 'all' || activeTab === 'system') && systemNotifications.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <i className="ri-notification-3-line text-xl text-primary-500"></i>
                    <h2 className="text-lg font-bold text-foreground-950" style={{ fontFamily: 'var(--font-heading)' }}>{t('notifications.myNotifications')}</h2>
                    {systemNotifications.filter(n => !n.read).length > 0 && (
                      <span className="rounded-full bg-primary-500 px-2.5 py-0.5 text-xs font-bold text-background-50">{systemNotifications.filter(n => !n.read).length}</span>
                    )}
                  </div>
                  {systemNotifications.some(n => !n.read) && (
                    <button onClick={handleMarkAllRead} className="rounded-lg bg-background-100 px-4 py-2 text-xs font-semibold text-foreground-600 hover:bg-background-200 transition-colors">
                      {t('notifications.markAllRead')}
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {systemNotifications.map(notif => {
                    const sysConfig = SYS_TYPE_CONFIG[notif.type] || SYS_TYPE_CONFIG.system;
                    return (
                      <div
                        key={notif.id}
                        onClick={() => { if (!notif.is_read) handleMarkRead(notif.id); }}
                        className={`rounded-2xl border p-5 md:p-6 transition-colors cursor-pointer ${
                          notif.is_read
                            ? 'border-background-200/60 bg-background-50'
                            : 'border-amber-200/60 bg-amber-50/20'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${sysConfig.bg} ${sysConfig.text}`}>
                            <i className={`${sysConfig.icon} text-lg`}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {!notif.is_read && <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>}
                              <h3 className={`text-sm font-semibold ${notif.is_read ? 'text-foreground-600' : 'text-foreground-950'}`}>{notif.title}</h3>
                              <span className="ml-auto text-[10px] text-foreground-300 flex-shrink-0">{notif.created_at ? new Date(notif.created_at).toLocaleDateString() : ''}</span>
                            </div>
                            <p className="mt-1 text-sm text-foreground-500 line-clamp-2 whitespace-pre-line">{notif.content || notif.body}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty state for active tab */}
            {!loading && (
              (activeTab === 'announce' && announcements.length === 0) ||
              (activeTab === 'system' && systemNotifications.length === 0) ||
              (activeTab === 'all' && notifications.length === 0)
            ) && (
              <div className="rounded-2xl border border-background-200/60 bg-background-50 p-8 md:p-12 text-center">
                <i className="ri-notification-off-line text-4xl text-foreground-200 mb-3 block"></i>
                <p className="text-sm text-foreground-400">{t('notifications.noNotifications')}</p>
              </div>
            )}

            {/* Quick Links */}
            <div>
              <h2 className="text-lg font-bold text-foreground-950 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>{t('notifications.quickLinks')}</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <Link to="/giftcards" className="rounded-2xl border border-background-200/60 bg-background-50 p-4 flex items-center gap-3 hover:border-primary-200 transition-colors group">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 group-hover:scale-105 transition-transform">
                    <i className="ri-shopping-bag-3-line text-lg"></i>
                  </div>
                  <span className="text-sm font-medium text-foreground-700">{t('nav.giftcards')}</span>
                </Link>
                <Link to="/wallet" className="rounded-2xl border border-background-200/60 bg-background-50 p-4 flex items-center gap-3 hover:border-primary-200 transition-colors group">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-100 text-accent-600 group-hover:scale-105 transition-transform">
                    <i className="ri-wallet-3-line text-lg"></i>
                  </div>
                  <span className="text-sm font-medium text-foreground-700">{t('nav.wallet')}</span>
                </Link>
                <Link to="/mypage" className="rounded-2xl border border-background-200/60 bg-background-50 p-4 flex items-center gap-3 hover:border-primary-200 transition-colors group">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background-100 text-foreground-600 group-hover:scale-105 transition-transform">
                    <i className="ri-user-line text-lg"></i>
                  </div>
                  <span className="text-sm font-medium text-foreground-700">{t('nav.mypage')}</span>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
