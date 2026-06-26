import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import { walletApi } from '../api';
import Pagination from '../components/Pagination';
import CopyButton from '../components/base/CopyButton';

export default function Transactions() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 20;
  const [activeTab, setActiveTab] = useState('purchases');
  const [dateFilter, setDateFilter] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const fetchTransactions = (p = 1) => {
    setLoading(true);
    walletApi.getTransactions({ page: p, limit: perPage })
      .then(({ data }) => {
        setTransactions(data.transactions || data || []);
        setTotalPages(data.totalPages || Math.ceil((data.total || 0) / perPage) || 1);
        setLoading(false);
      })
      .catch(() => {
        setTransactions([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!user) return;
    fetchTransactions(page);
  }, [user, page]);

  const handlePage = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const typeLabel = (type) => {
    const map = {
      deposit: t('wallet.depositType'),
      withdrawal: t('wallet.withdrawalType'),
      purchase: t('wallet.purchaseType'),
      gift_sent: t('wallet.giftSentType'),
      gift_received: t('wallet.giftReceivedType'),
      admin_adjust: t('wallet.adminAdjustType'),
    };
    return map[type] || type;
  };

  const statusLabel = (status) => {
    const map = {
      completed: t('mypage.completed'),
      pending: t('mypage.pending'),
      cancelled: t('mypage.cancelled'),
      expired: t('mypage.expired'),
    };
    return map[status] || status;
  };

  const statusColor = (status) => {
    const map = {
      completed: 'text-green-600 bg-green-50',
      pending: 'text-amber-600 bg-amber-50',
      cancelled: 'text-red-500 bg-red-50',
      expired: 'text-foreground-400 bg-background-100',
    };
    return map[status] || 'text-foreground-400 bg-background-100';
  };

  const tabFiltered = activeTab === 'purchases'
    ? transactions.filter(tx => tx.type === 'purchase' || tx.type === 'gift_sent')
    : transactions.filter(tx => tx.type === 'deposit' || tx.type === 'withdrawal');

  const dateFiltered = (() => {
    if (dateFilter === 'all') return tabFiltered;
    const now = new Date();
    let start;
    if (dateFilter === '3d') start = new Date(now - 3 * 86400000);
    else if (dateFilter === '7d') start = new Date(now - 7 * 86400000);
    else if (dateFilter === '30d') start = new Date(now - 30 * 86400000);
    else if (dateFilter === 'custom' && customStart) start = new Date(customStart);
    else return tabFiltered;
    const end = dateFilter === 'custom' && customEnd ? new Date(customEnd + 'T23:59:59') : now;
    return tabFiltered.filter(tx => {
      const d = new Date(tx.created_at);
      return d >= start && d <= end;
    });
  })();

  const filtered = search.trim()
    ? dateFiltered.filter(tx =>
        (tx.card_number || tx.pin || tx.order_number || tx.description || '').toLowerCase().includes(search.toLowerCase())
      )
    : dateFiltered;

  if (!user) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-lock-line text-4xl text-foreground-300 mb-3 block"></i>
          <p className="text-foreground-400 mb-4">{t('mypage.loginRequired')}</p>
          <Link to="/login" className="rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-bold text-background-50 hover:bg-primary-600 transition-colors">{t('nav.login')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        <img
          src="https://readdy.ai/api/search-image?query=Elegant%20minimal%20transaction%20tracking%20dashboard%20background%20with%20subtle%20slate%20navy%20gradient%20and%20soft%20emerald%20accent%20glow%20dots%2C%20clean%20modern%20receipt%20and%20document%20icon%20silhouettes%20in%20refined%20style%2C%20sophisticated%20financial%20tracking%20visual%20theme%2C%20premium%20fintech%20aesthetic%2C%20clean%20uncluttered%20atmosphere%2C%20high-end%20dashboard%20style&width=1600&height=380&seq=transactions-hero-v1&orientation=landscape"
          className="absolute inset-0 h-full w-full object-cover object-top opacity-28 mix-blend-overlay"
          alt=""
        />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, var(--color-accent-500) 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-emerald-500/8 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-accent-500/6 blur-[60px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f172a]/50 to-[#0f172a]"></div>
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-10 pt-32 pb-16 md:pt-40 md:pb-20">
          <nav className="flex items-center gap-2 text-sm text-background-100/60 mb-6">
            <Link to="/" className="hover:text-background-50 transition-colors"><i className="ri-home-4-line"></i></Link>
            <i className="ri-arrow-right-s-line text-xs"></i>
            <span className="text-background-100/80">{t('nav.transactions')}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-background-50" style={{ fontFamily: 'var(--font-heading)' }}>{t('transactions.title')}</h1>
          <p className="mt-3 text-sm md:text-base text-background-100/70">{t('transactions.subtitle')}</p>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-10 md:py-14 space-y-6">
        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setActiveTab('purchases'); setPage(1); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'purchases' ? 'bg-primary-500 text-background-50' : 'bg-background-100 text-foreground-600 hover:bg-background-200'
            }`}
          >
            <i className="ri-shopping-bag-3-line"></i>
            {t('transactions.tabPurchases')}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${activeTab === 'purchases' ? 'bg-primary-400 text-background-50' : 'bg-background-200 text-foreground-500'}`}>{transactions.filter(tx => tx.type === 'purchase' || tx.type === 'gift_sent').length}</span>
          </button>
          <button
            onClick={() => { setActiveTab('wallet'); setPage(1); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'wallet' ? 'bg-primary-500 text-background-50' : 'bg-background-100 text-foreground-600 hover:bg-background-200'
            }`}
          >
            <i className="ri-wallet-3-line"></i>
            {t('transactions.tabWallet')}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${activeTab === 'wallet' ? 'bg-primary-400 text-background-50' : 'bg-background-200 text-foreground-500'}`}>{transactions.filter(tx => tx.type === 'deposit' || tx.type === 'withdrawal').length}</span>
          </button>
        </div>

        {/* Stats Cards */}
        {activeTab === 'purchases' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: t('transactions.statAll'), count: tabFiltered.length, color: 'bg-primary-100 text-primary-700' },
              { label: t('transactions.statCompleted'), count: tabFiltered.filter(t => t.status === 'completed').length, color: 'bg-green-100 text-green-700' },
              { label: t('transactions.statPending'), count: tabFiltered.filter(t => t.status === 'pending').length, color: 'bg-amber-100 text-amber-700' },
              { label: t('transactions.statCancelled'), count: tabFiltered.filter(t => t.status === 'cancelled' || t.status === 'expired').length, color: 'bg-red-100 text-red-700' },
            ].map((stat, i) => (
              <div key={i} className="rounded-xl border border-background-200/60 bg-background-50 p-4">
                <p className="text-xs text-foreground-400">{stat.label}</p>
                <p className={`mt-1 text-xl font-bold ${stat.color.split(' ')[1]}`} style={{ fontFamily: 'var(--font-heading)' }}>{stat.count}</p>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'wallet' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: t('transactions.statAll'), count: tabFiltered.length, color: 'bg-primary-100 text-primary-700' },
              { label: t('transactions.statApproved'), count: tabFiltered.filter(t => t.status === 'completed').length, color: 'bg-green-100 text-green-700' },
              { label: t('transactions.statPending'), count: tabFiltered.filter(t => t.status === 'pending').length, color: 'bg-amber-100 text-amber-700' },
              { label: t('transactions.statCancelled'), count: tabFiltered.filter(t => t.status === 'cancelled').length, color: 'bg-red-100 text-red-700' },
            ].map((stat, i) => (
              <div key={i} className="rounded-xl border border-background-200/60 bg-background-50 p-4">
                <p className="text-xs text-foreground-400">{stat.label}</p>
                <p className={`mt-1 text-xl font-bold ${stat.color.split(' ')[1]}`} style={{ fontFamily: 'var(--font-heading)' }}>{stat.count}</p>
              </div>
            ))}
          </div>
        )}

        {/* Date Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: t('transactions.filterAll') },
            { key: '3d', label: t('transactions.filter3d') },
            { key: '7d', label: t('transactions.filter7d') },
            { key: '30d', label: t('transactions.filter30d') },
            { key: 'custom', label: t('transactions.filterCustom') },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setDateFilter(f.key)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                dateFilter === f.key ? 'bg-primary-500 text-background-50' : 'bg-background-100 text-foreground-500 hover:bg-background-200'
              }`}
            >
              {f.label}
            </button>
          ))}
          {dateFilter === 'custom' && (
            <div className="flex items-center gap-2">
              <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="rounded-lg border border-background-200 px-3 py-1.5 text-xs" />
              <span className="text-xs text-foreground-400">~</span>
              <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="rounded-lg border border-background-200 px-3 py-1.5 text-xs" />
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-foreground-300"></i>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('transactions.search')}
            className="w-full rounded-xl border border-background-200 bg-background-50 pl-11 pr-4 py-3 text-sm outline-none focus:border-primary-400 transition-colors"
          />
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-background-200/60 bg-background-50 overflow-hidden hidden md:block">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-foreground-400">{t('common.loading')}</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <i className="ri-file-list-3-line text-4xl text-foreground-200 mb-3 block"></i>
              <p className="text-sm text-foreground-400">{t('transactions.noResults')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-background-200/60 bg-background-100/50">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-foreground-400">{t('transactions.id')}</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-foreground-400">{t('transactions.date')}</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-foreground-400">{t('transactions.type')}</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-foreground-400">{t('transactions.amount')}</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-foreground-400">{t('transactions.status')}</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-foreground-400">{t('transactions.note')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-background-200/40">
                  {filtered.map(tx => (
                    <tr key={tx.id} className="hover:bg-background-100/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-foreground-500">{tx.order_number || `#${tx.id}`}</span>
                          <CopyButton text={tx.order_number || String(tx.id)} />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-foreground-600 whitespace-nowrap">{tx.created_at ? new Date(tx.created_at).toLocaleString() : '-'}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-background-100 px-2.5 py-0.5 text-xs font-medium text-foreground-700">
                          {typeLabel(tx.type)}
                        </span>
                      </td>
                      <td className={`px-5 py-4 text-right font-semibold whitespace-nowrap ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount?.toLocaleString()}{t('common.won')}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(tx.status)}`}>
                          {statusLabel(tx.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-foreground-400 text-xs max-w-[200px] truncate">{tx.description || tx.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-foreground-400">{t('common.loading')}</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <i className="ri-file-list-3-line text-4xl text-foreground-200 mb-3 block"></i>
              <p className="text-sm text-foreground-400">{t('transactions.noResults')}</p>
            </div>
          ) : (
            filtered.map(tx => (
              <div key={tx.id} className="rounded-xl border border-background-200/60 bg-background-50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(tx.status)}`}>
                    {statusLabel(tx.status)}
                  </span>
                  <span className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount?.toLocaleString()}{t('common.won')}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground-950">{tx.description || tx.type}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-foreground-400">{tx.created_at ? new Date(tx.created_at).toLocaleString() : ''}</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-[10px] text-foreground-300">{tx.order_number || `#${tx.id}`}</span>
                    <CopyButton text={tx.order_number || String(tx.id)} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center pt-4">
            <Pagination currentPage={page} totalPages={totalPages} onPage={handlePage} />
          </div>
        )}
      </div>
    </div>
  );
}
