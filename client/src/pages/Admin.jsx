import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { adminApi } from '../api';
import { Navigate } from 'react-router-dom';
import { useI18n } from '../i18n';

const TABS = [
  { id: 'dashboard', labelKey: 'admin.dashboard', icon: 'ri-dashboard-line' },
  { id: 'users', labelKey: 'admin.users', icon: 'ri-user-line' },
  { id: 'orders', labelKey: 'admin.orders', icon: 'ri-shopping-bag-line' },
  { id: 'giftcards', labelKey: 'admin.giftcards', icon: 'ri-gift-line' },
  { id: 'pins', labelKey: 'admin.pins', icon: 'ri-key-2-line' },
  { id: 'wallet', labelKey: 'admin.wallet', icon: 'ri-wallet-3-line' },
  { id: 'cash', labelKey: 'admin.cash', icon: 'ri-money-dollar-circle-line' },
  { id: 'transactions', labelKey: 'admin.transactions', icon: 'ri-exchange-line' },
  { id: 'events', labelKey: 'admin.events', icon: 'ri-trophy-line' },
  { id: 'notifications', labelKey: 'admin.notifications', icon: 'ri-notification-3-line' },
  { id: 'templates', labelKey: 'admin.templates', icon: 'ri-file-text-line' },
  { id: 'usdt', labelKey: 'admin.usdt', icon: 'ri-coin-line' },
  { id: 'recovery', labelKey: 'admin.recovery', icon: 'ri-recycle-line' },
];

const EVENT_TYPES = [
  { value: 'monthly_purchase', labelKey: 'admin.eventTypeMonthly' },
  { value: 'pin_register', labelKey: 'admin.eventTypePinRegister' },
  { value: 'manual', labelKey: 'admin.eventTypeManual' },
];

const TEMPLATE_CHANNELS = [
  { value: 'sms', labelKey: 'admin.templateChannelSms' },
  { value: 'email', labelKey: 'admin.templateChannelEmail' },
  { value: 'notification', labelKey: 'admin.templateChannelNotif' },
];

const ROLE_OPTIONS = ['member', 'admin', 'super_admin'];

const EVENT_TYPE_LABEL_KEY = {
  monthly_purchase: 'admin.eventTypeMonthly',
  pin_register: 'admin.eventTypePin_register',
  manual: 'admin.eventTypeManual',
};
const EVENT_STATUS_LABEL_KEY = {
  active: 'admin.eventStatusActive',
  ended: 'admin.eventStatusEnded',
  cancelled: 'admin.eventStatusCancelled',
};
const eventLabel = (map, val) => map[val] || val;

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const { t } = useI18n();
  const [tab, setTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usdtSettings, setUsdtSettings] = useState(null);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cards, setCards] = useState([]);
  const [pinList, setPinList] = useState([]);
  const [walletRequests, setWalletRequests] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [notifList, setNotifList] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventParticipants, setEventParticipants] = useState(null);
  const [viewingEvent, setViewingEvent] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [recoveries, setRecoveries] = useState([]);

  // push-pin user search state
  const [userQuery, setUserQuery] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [userSearching, setUserSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userSearchRef = useRef(null);

  useEffect(() => {
    if (!isAdmin) return;
    adminApi.getDashboard().then(({ data }) => setDashboard(data)).catch(() => {});
    loadTab(tab);
  }, [isAdmin]);

  const loadTab = (next) => {
    setMsg(''); setErrorMsg('');
    if (next === 'users') adminApi.getUsers({ search }).then(({ data }) => setUsers(data.users)).catch(() => {});
    if (next === 'orders') adminApi.getOrders().then(({ data }) => setOrders(data.orders)).catch(() => {});
    if (next === 'usdt') adminApi.getUSDTSettings().then(({ data }) => setUsdtSettings(data.settings)).catch(() => {});
    if (next === 'pins') {
      adminApi.getGiftcards().then(({ data }) => setCards(data.cards)).catch(() => {});
      adminApi.getPins({}).then(({ data }) => setPinList(data.pins)).catch(() => {});
    }
    if (next === 'giftcards') adminApi.getGiftcards().then(({ data }) => setCards(data.cards)).catch(() => {});
    if (next === 'wallet') adminApi.getWalletRequests().then(({ data }) => setWalletRequests(data.requests)).catch(() => {});
    if (next === 'transactions') adminApi.getTransactions({ limit: 100 }).then(({ data }) => setTransactions(data.transactions)).catch(() => {});
    if (next === 'notifications') adminApi.getNotifications({ limit: 50 }).then(({ data }) => setNotifList(data.notifications)).catch(() => {});
    if (next === 'events') adminApi.getEvents().then(({ data }) => setEvents(data.events)).catch(() => {});
    if (next === 'templates') adminApi.getTemplates().then(({ data }) => setTemplates(data.templates)).catch(() => {});
    if (next === 'recovery') adminApi.getRecoveries().then(({ data }) => setRecoveries(data.recoveries)).catch(() => {});
  };

  useEffect(() => {
    if (!userQuery.trim() || selectedUser) return;
    const q = userQuery.trim();
    const timer = setTimeout(() => {
      setUserSearching(true);
      adminApi.getUsers({ search: q, limit: 10 })
        .then(({ data }) => setUserResults(data.users || []))
        .catch(() => setUserResults([]))
        .finally(() => setUserSearching(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [userQuery, selectedUser]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (userSearchRef.current && !userSearchRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleTabChange = (t) => { setTab(t); loadTab(t); };

  const flash = (m, isErr = false) => { if (isErr) setErrorMsg(m); else setMsg(m); };

  const confirmOrder = async (orderId) => {
    try {
      await adminApi.updateOrderStatus(orderId, { status: 'completed' });
      flash(t('admin.orderConfirmed', { orderId }));
      loadTab('orders');
    } catch (err) { flash(err.response?.data?.message || t('admin.errorOccurred'), true); }
  };

  const saveUSDT = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await adminApi.updateUSDTSettings({
        receivingAddress: formData.get('receivingAddress'),
        exchangeRate: parseFloat(formData.get('exchangeRate')),
        minDeposit: parseFloat(formData.get('minDeposit')),
        minWithdrawal: parseFloat(formData.get('minWithdrawal')),
        paymentTimeoutMinutes: parseInt(formData.get('paymentTimeoutMinutes')),
      });
      flash(t('admin.usdtSaved'));
    } catch (err) { flash(err.response?.data?.message || t('admin.saveFail'), true); }
  };

  const sendCash = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await adminApi.sendCash({ userId: parseInt(formData.get('userId')), amount: parseInt(formData.get('amount')), description: formData.get('description') });
      flash(t('admin.cashSent'));
      e.target.reset();
    } catch (err) { flash(err.response?.data?.message || t('admin.sendFail'), true); }
  };

  const broadcastNotif = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await adminApi.broadcast({ title: formData.get('title'), content: formData.get('content') });
      flash(t('admin.notifSent'));
      e.target.reset();
      loadTab('notifications');
    } catch (err) { flash(err.response?.data?.message || t('admin.broadcastFail'), true); }
  };

  const pushPin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const variantId = parseInt(formData.get('variantId'));
    if (!variantId) { flash(t('admin.pinPushSelectVariant'), true); return; }
    if (!selectedUser) { flash(t('admin.pinPushSelectUser'), true); return; }
    try {
      const { data } = await adminApi.pushPin({
        userId: selectedUser.id,
        variantId,
        pinNumber: formData.get('pinNumber'),
        cardNumber: formData.get('cardNumber') || undefined,
        note: formData.get('note') || undefined,
      });
      flash(t('admin.pinPushed', { orderNumber: data.orderNumber }));
      e.target.reset();
      setSelectedUser(null);
      setUserQuery('');
      setUserResults([]);
    } catch (err) { flash(err.response?.data?.message || t('admin.pinPushFail'), true); }
  };

  const batchUploadPins = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const variantId = parseInt(formData.get('variantId'));
    const raw = formData.get('pins').trim();
    if (!variantId || !raw) { flash(t('admin.batchFillRequired'), true); return; }
    const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const pins = lines.map(line => {
      const [pinNumber, cardNumber] = line.split(/[,\t]/).map(s => s?.trim());
      return { pinNumber, cardNumber: cardNumber || undefined };
    }).filter(p => p.pinNumber);
    if (pins.length === 0) { flash(t('admin.batchNoPins'), true); return; }
    try {
      const { data } = await adminApi.batchPins({ variantId, pins });
      flash(t('admin.batchUploaded', { n: pins.length }));
      e.target.reset();
      loadTab('pins');
    } catch (err) { flash(err.response?.data?.message || t('admin.batchFail'), true); }
  };

  const reviewWallet = async (id, status) => {
    try {
      await adminApi.reviewWalletRequest(id, { status });
      flash(t(status === 'approved' ? 'admin.walletApproved' : 'admin.walletRejected'));
      loadTab('wallet');
    } catch (err) { flash(err.response?.data?.message || t('admin.errorOccurred'), true); }
  };

  const deleteNotif = async (id) => {
    if (!confirm(t('admin.confirmDeleteNotif'))) return;
    try {
      await adminApi.deleteNotification(id);
      flash(t('admin.deleted'));
      loadTab('notifications');
    } catch (err) { flash(err.response?.data?.message || t('admin.errorOccurred'), true); }
  };

  const saveUserEdit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      role: formData.get('role'),
      is_active: formData.get('is_active') === 'on',
      cash_balance: parseInt(formData.get('cash_balance')) || 0,
      withdrawable_cash: parseInt(formData.get('withdrawable_cash')) || 0,
    };
    try {
      await adminApi.updateUser(editingUser.id, data);
      flash(t('admin.userUpdated'));
      setEditingUser(null);
      loadTab('users');
    } catch (err) { flash(err.response?.data?.message || t('admin.saveFail'), true); }
  };

  const createGiftcard = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const payload = {
      slug: f.get('slug'),
      name: f.get('name'),
      brand: f.get('brand'),
      shortName: f.get('shortName'),
      region: f.get('region'),
      category: f.get('category'),
      tagline: f.get('tagline'),
      description: f.get('description'),
      highlights: (f.get('highlights') || '').split('\n').map(s => s.trim()).filter(Boolean),
      howToUse: (f.get('howToUse') || '').split('\n').map(s => s.trim()).filter(Boolean),
      colorGradient: f.get('colorGradient') || undefined,
      badge: f.get('badge') || undefined,
      logoIcon: f.get('logoIcon') || undefined,
      imageUrl: f.get('imageUrl') || undefined,
      sortOrder: parseInt(f.get('sortOrder')) || 0,
    };
    try {
      await adminApi.createGiftcard(payload);
      flash(t('admin.giftcardCreated'));
      e.target.reset();
      loadTab('giftcards');
    } catch (err) { flash(err.response?.data?.message || t('admin.saveFail'), true); }
  };

  const toggleGiftcardActive = async (c) => {
    try {
      await adminApi.updateGiftcard(c.id, { isActive: !c.is_active });
      loadTab('giftcards');
    } catch (err) { flash(err.response?.data?.message || t('admin.errorOccurred'), true); }
  };

  const createEvent = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    let rewardRules = null;
    const rawRules = f.get('rewardRules').trim();
    if (rawRules) {
      try { rewardRules = JSON.parse(rawRules); }
      catch { flash(t('admin.eventRulesInvalid'), true); return; }
    }
    try {
      await adminApi.createEvent({
        slug: f.get('slug'),
        title: f.get('title'),
        type: f.get('type'),
        startAt: f.get('startAt'),
        endAt: f.get('endAt'),
        description: f.get('description') || undefined,
        rewardRules,
        imageUrl: f.get('imageUrl') || undefined,
      });
      flash(t('admin.eventCreated'));
      e.target.reset();
      loadTab('events');
    } catch (err) { flash(err.response?.data?.message || t('admin.saveFail'), true); }
  };

  const toggleEventActive = async (ev) => {
    try {
      await adminApi.updateEvent(ev.id, { isActive: !ev.is_active });
      loadTab('events');
    } catch (err) { flash(err.response?.data?.message || t('admin.errorOccurred'), true); }
  };

  const endEvent = async (ev) => {
    if (!confirm(t('admin.eventConfirmEnd'))) return;
    try {
      await adminApi.updateEvent(ev.id, { status: 'ended' });
      flash(t('admin.eventEnded'));
      loadTab('events');
    } catch (err) { flash(err.response?.data?.message || t('admin.errorOccurred'), true); }
  };

  const deleteEvent = async (ev) => {
    if (!confirm(t('admin.eventConfirmDelete'))) return;
    try {
      await adminApi.deleteEvent(ev.id);
      flash(t('admin.deleted'));
      loadTab('events');
    } catch (err) { flash(err.response?.data?.message || t('admin.errorOccurred'), true); }
  };

  const viewParticipants = async (ev) => {
    try {
      const { data } = await adminApi.getEventParticipants(ev.id);
      setEventParticipants(data.participants);
      setViewingEvent(data.event);
    } catch (err) { flash(err.response?.data?.message || t('admin.errorOccurred'), true); }
  };

  const grantReward = async (eventId, userId) => {
    const amountStr = prompt(t('admin.eventRewardPrompt'));
    if (!amountStr) return;
    const amount = parseInt(amountStr);
    if (!amount || amount <= 0) { flash(t('admin.eventRewardInvalid'), true); return; }
    try {
      await adminApi.grantEventReward(eventId, { userId, amount, rewardType: 'cash' });
      flash(t('admin.eventRewardGranted'));
      if (viewingEvent) viewParticipants(viewingEvent);
    } catch (err) { flash(err.response?.data?.message || t('admin.errorOccurred'), true); }
  };

  const saveTemplate = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const payload = {
      code: f.get('code'),
      name: f.get('name'),
      channel: f.get('channel'),
      subject: f.get('subject') || undefined,
      body: f.get('body'),
      variables: (f.get('variables') || '').split(',').map(s => s.trim()).filter(Boolean),
      isActive: f.get('isActive') === 'on',
    };
    try {
      if (editingTemplate) {
        await adminApi.updateTemplate(editingTemplate.id, payload);
        flash(t('admin.templateUpdated'));
      } else {
        await adminApi.createTemplate(payload);
        flash(t('admin.templateCreated'));
      }
      setEditingTemplate(null);
      loadTab('templates');
    } catch (err) { flash(err.response?.data?.message || t('admin.saveFail'), true); }
  };

  const deleteTemplate = async (tmpl) => {
    if (!confirm(t('admin.templateConfirmDelete'))) return;
    try {
      await adminApi.deleteTemplate(tmpl.id);
      flash(t('admin.deleted'));
      loadTab('templates');
    } catch (err) { flash(err.response?.data?.message || t('admin.errorOccurred'), true); }
  };

  const approveRecovery = async (r) => {
    const amountStr = prompt(t('admin.recoveryRewardPrompt', { default: 700 }), '700');
    if (amountStr === null) return;
    const reward = parseInt(amountStr);
    if (isNaN(reward) || reward < 0) { flash(t('admin.recoveryRewardInvalid'), true); return; }
    try {
      await adminApi.approveRecovery(r.id, { rewardAmount: reward });
      flash(t('admin.recoveryApproved', { amount: reward.toLocaleString() }));
      loadTab('recovery');
    } catch (err) { flash(err.response?.data?.message || t('admin.errorOccurred'), true); }
  };

  const rejectRecovery = async (r) => {
    const note = prompt(t('admin.recoveryRejectNotePrompt'), '');
    try {
      await adminApi.rejectRecovery(r.id, { adminNote: note || '' });
      flash(t('admin.recoveryRejected'));
      loadTab('recovery');
    } catch (err) { flash(err.response?.data?.message || t('admin.errorOccurred'), true); }
  };

  const addVariant = async (giftcardId, e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    try {
      await adminApi.createVariant(giftcardId, {
        faceValue: parseInt(f.get('faceValue')),
        discountNormal: parseFloat(f.get('discountNormal')),
        priceNormal: parseInt(f.get('priceNormal')),
        dailyLimit: parseInt(f.get('dailyLimit')) || 20,
        stock: parseInt(f.get('stock')) || 999,
      });
      flash(t('admin.variantCreated'));
      e.target.reset();
      loadTab('giftcards');
    } catch (err) { flash(err.response?.data?.message || t('admin.saveFail'), true); }
  };

  if (!isAdmin) return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-background-50 pt-24 pb-20">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <h1 className="text-2xl font-bold text-foreground-950 mb-6" style={{ fontFamily: 'var(--font-heading)' }}>{t('admin.title')}</h1>

        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map(tabDef => (
            <button key={tabDef.id} onClick={() => handleTabChange(tabDef.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${tab === tabDef.id ? 'bg-primary-500 text-background-50' : 'bg-background-100 text-foreground-600 hover:bg-primary-50'}`}>
              <i className={tabDef.icon}></i><span className="hidden sm:inline">{t(tabDef.labelKey)}</span>
            </button>
          ))}
        </div>

        {msg && <div className="mb-4 rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-700">{msg}</div>}
        {errorMsg && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{errorMsg}</div>}

        {/* Dashboard */}
        {tab === 'dashboard' && dashboard && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: t('admin.totalUsers'), val: dashboard.totalUsers, icon: 'ri-user-line', color: 'primary' },
              { label: t('admin.totalOrders'), val: dashboard.totalOrders, icon: 'ri-shopping-bag-line', color: 'accent' },
              { label: t('admin.totalRevenue'), val: `₩${dashboard.totalRevenue.toLocaleString()}`, icon: 'ri-money-dollar-circle-line', color: 'secondary' },
              { label: t('admin.pendingOrders'), val: dashboard.pendingOrders, icon: 'ri-time-line', color: 'primary' },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl border border-background-200/60 bg-background-50 p-5">
                <i className={`${s.icon} text-xl text-${s.color}-500`}></i>
                <p className="mt-3 text-2xl font-bold text-foreground-950">{s.val}</p>
                <p className="text-xs text-foreground-400">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div>
            <div className="flex gap-2 mb-4">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('admin.search')} className="flex-1 rounded-xl border border-background-200 px-4 py-2.5 text-sm" />
              <button onClick={() => loadTab('users')} className="px-4 py-2.5 rounded-xl bg-primary-500 text-background-50 text-sm font-bold">{t('admin.searchBtn')}</button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-background-200/60">
              <table className="w-full text-sm">
                <thead className="bg-background-100"><tr>
                  <th className="px-4 py-3 text-left font-semibold text-foreground-600">{t('admin.id')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground-600">{t('admin.username')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground-600">{t('admin.emailCol')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground-600">{t('admin.phoneCol')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground-600">{t('admin.roleCol')}</th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground-600">{t('admin.statusCol')}</th>
                  <th className="px-4 py-3 text-right font-semibold text-foreground-600">{t('admin.balance')}</th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground-600">{t('admin.action')}</th>
                </tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-t border-background-100">
                      <td className="px-4 py-3">{u.id}</td>
                      <td className="px-4 py-3 font-medium">{u.username}</td>
                      <td className="px-4 py-3 text-foreground-500">{u.email}</td>
                      <td className="px-4 py-3 text-foreground-500 font-mono text-xs">{u.phone || '-'}</td>
                      <td className="px-4 py-3"><span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">{u.role}</span></td>
                      <td className="px-4 py-3 text-center">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.is_active ? t('admin.active') : t('admin.inactive')}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{u.cash_balance?.toLocaleString()}{t('common.won')}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => setEditingUser(u)} className="px-3 py-1 rounded-lg bg-background-200 text-foreground-700 text-xs font-bold hover:bg-background-300">{t('admin.edit')}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders */}
        {tab === 'orders' && (
          <div className="overflow-x-auto rounded-xl border border-background-200/60">
            <table className="w-full text-sm">
              <thead className="bg-background-100"><tr>
                <th className="px-4 py-3 text-left font-semibold text-foreground-600">{t('admin.orderNumber')}</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground-600">{t('admin.user')}</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground-600">{t('admin.product')}</th>
                <th className="px-4 py-3 text-right font-semibold text-foreground-600">{t('admin.amountCol')}</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground-600">{t('admin.paymentStatus')}</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground-600">{t('admin.action')}</th>
              </tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-t border-background-100">
                    <td className="px-4 py-3 font-mono text-xs">{o.order_number}</td>
                    <td className="px-4 py-3">{o.username}</td>
                    <td className="px-4 py-3">{o.card_name}</td>
                    <td className="px-4 py-3 text-right font-mono">{o.total_price?.toLocaleString()}{t('common.won')}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${o.payment_status === 'awaiting_confirmation' ? 'bg-amber-100 text-amber-700' : o.payment_status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-background-100 text-foreground-600'}`}>
                        {o.payment_status === 'pending' ? t('admin.pending') : o.payment_status === 'awaiting_confirmation' ? t('admin.awaitingConfirmation') : o.payment_status === 'confirmed' ? t('admin.confirmed') : o.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {o.payment_status === 'awaiting_confirmation' && (
                        <button onClick={() => confirmOrder(o.id)} className="px-3 py-1 rounded-lg bg-green-500 text-white text-xs font-bold hover:bg-green-600">{t('admin.confirmPayment')}</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Gift card management */}
        {tab === 'giftcards' && (
          <div className="space-y-6">
            <form onSubmit={createGiftcard} className="rounded-2xl border border-background-200/60 bg-background-50 p-6 space-y-4">
              <h3 className="font-bold text-foreground-950 flex items-center gap-2"><i className="ri-gift-line text-primary-500"></i>{t('admin.giftcardCreateTitle')}</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground-600 mb-1">{t('admin.gcSlug')}</label>
                  <input name="slug" required pattern="[a-z0-9-]+" className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm font-mono" placeholder="amazon-us" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-600 mb-1">{t('admin.gcName')}</label>
                  <input name="name" required className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-600 mb-1">{t('admin.gcBrand')}</label>
                  <input name="brand" required className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-600 mb-1">{t('admin.gcShortName')}</label>
                  <input name="shortName" required className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-600 mb-1">{t('admin.gcRegion')}</label>
                  <input name="region" required className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm" placeholder="US" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-600 mb-1">{t('admin.gcCategory')}</label>
                  <input name="category" required className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm" placeholder="shopping" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-600 mb-1">{t('admin.gcTagline')}</label>
                  <input name="tagline" required className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-600 mb-1">{t('admin.gcBadge')}</label>
                  <input name="badge" className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm" placeholder="BEST" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-foreground-600 mb-1">{t('admin.gcDescription')}</label>
                  <textarea name="description" required rows={2} className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-600 mb-1">{t('admin.gcHighlights')}</label>
                  <textarea name="highlights" rows={3} className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm" placeholder={t('admin.gcHighlightsHint')} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-600 mb-1">{t('admin.gcHowToUse')}</label>
                  <textarea name="howToUse" rows={3} className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm" placeholder={t('admin.gcHighlightsHint')} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-600 mb-1">{t('admin.gcColorGradient')}</label>
                  <input name="colorGradient" className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm font-mono" placeholder="from-amber-400 to-orange-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-600 mb-1">{t('admin.gcLogoIcon')}</label>
                  <input name="logoIcon" className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm font-mono" placeholder="ri-amazon-line" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-600 mb-1">{t('admin.gcImageUrl')}</label>
                  <input name="imageUrl" className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-600 mb-1">{t('admin.gcSortOrder')}</label>
                  <input name="sortOrder" type="number" defaultValue={0} className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm" />
                </div>
              </div>
              <button type="submit" className="rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-bold text-background-50 hover:bg-primary-600">{t('admin.gcCreate')}</button>
            </form>

            <div className="space-y-3">
              {cards.map(c => (
                <div key={c.id} className="rounded-xl border border-background-200/60 bg-background-50 p-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <i className={`${c.logo_icon || 'ri-gift-line'} text-2xl text-primary-500`}></i>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground-950">{c.name} <span className="text-xs font-mono text-foreground-400">/{c.slug}</span></p>
                        <p className="text-xs text-foreground-500">{c.brand} · {c.region} · {c.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-foreground-400">{t('admin.gcVariantCount', { n: c.variant_count })}</span>
                      <span className="text-xs text-foreground-400">{t('admin.gcAvailablePins', { n: c.available_pins })}</span>
                      <button onClick={() => toggleGiftcardActive(c)} className={`px-3 py-1 rounded-lg text-xs font-bold ${c.is_active ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{c.is_active ? t('admin.deactivate') : t('admin.activate')}</button>
                    </div>
                  </div>

                  <form onSubmit={(e) => addVariant(c.id, e)} className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-2 items-end border-t border-background-100 pt-3">
                    <div>
                      <label className="block text-[10px] text-foreground-500">{t('admin.gcFaceValue')}</label>
                      <input name="faceValue" type="number" required className="w-full rounded-lg border border-background-300 px-2 py-1.5 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-foreground-500">{t('admin.gcDiscount')}</label>
                      <input name="discountNormal" type="number" step="0.1" required className="w-full rounded-lg border border-background-300 px-2 py-1.5 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-foreground-500">{t('admin.gcPrice')}</label>
                      <input name="priceNormal" type="number" required className="w-full rounded-lg border border-background-300 px-2 py-1.5 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-foreground-500">{t('admin.gcDailyLimit')}</label>
                      <input name="dailyLimit" type="number" defaultValue={20} className="w-full rounded-lg border border-background-300 px-2 py-1.5 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-foreground-500">{t('admin.gcStock')}</label>
                      <input name="stock" type="number" defaultValue={999} className="w-full rounded-lg border border-background-300 px-2 py-1.5 text-xs" />
                    </div>
                    <button type="submit" className="rounded-lg bg-primary-500 text-background-50 text-xs font-bold py-1.5">{t('admin.gcAddVariant')}</button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pins: push + batch + list */}
        {tab === 'pins' && (
          <div className="space-y-6">
            <form onSubmit={pushPin} className="rounded-2xl border border-background-200/60 bg-background-50 p-6 max-w-lg space-y-5">
              <h3 className="font-bold text-foreground-950 flex items-center gap-2"><i className="ri-key-2-line text-primary-500"></i>{t('admin.pinPushTitle')}</h3>
              <p className="text-xs text-foreground-400 -mt-2">{t('admin.pinPushHint')}</p>
              <div>
                <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('admin.targetUserId')}</label>
                <div ref={userSearchRef} className="relative">
                  {selectedUser ? (
                    <div className="flex items-center justify-between rounded-xl border border-primary-300 bg-primary-50/50 px-4 py-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-background-50 text-xs font-bold">{selectedUser.username?.[0]?.toUpperCase()}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground-950 truncate">{selectedUser.username} <span className="text-xs font-normal text-foreground-400">#{selectedUser.id}</span></p>
                          <p className="text-xs text-foreground-500 truncate">{selectedUser.email}</p>
                        </div>
                        <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-bold text-primary-700">{selectedUser.role}</span>
                      </div>
                      <button type="button" onClick={() => { setSelectedUser(null); setUserQuery(''); setUserResults([]); setUserDropdownOpen(true); }} className="ml-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-foreground-400 hover:bg-foreground-900/5 hover:text-foreground-600">
                        <i className="ri-close-line"></i>
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        value={userQuery}
                        onChange={(e) => { setUserQuery(e.target.value); setUserDropdownOpen(true); }}
                        onFocus={() => setUserDropdownOpen(true)}
                        placeholder={t('admin.pinPushUserPlaceholder')}
                        className="w-full rounded-xl border border-background-300 px-4 py-3 text-sm focus:outline-none focus:border-primary-400"
                      />
                      {userDropdownOpen && userQuery.trim() && (
                        <div className="absolute z-20 mt-1 w-full rounded-xl border border-background-200 bg-background-50 shadow-lg max-h-72 overflow-y-auto">
                          {userSearching ? (
                            <div className="px-4 py-3 text-sm text-foreground-400">{t('common.loading')}</div>
                          ) : userResults.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-foreground-400">{t('admin.pinPushNoUser')}</div>
                          ) : (
                            userResults.map(u => (
                              <button key={u.id} type="button"
                                onClick={() => { setSelectedUser(u); setUserDropdownOpen(false); setUserQuery(''); setUserResults([]); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-primary-50 transition-colors border-b border-background-100 last:border-b-0">
                                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-background-200 text-foreground-600 text-xs font-bold">{u.username?.[0]?.toUpperCase()}</span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-foreground-950 truncate">{u.username} <span className="text-xs font-normal text-foreground-400">#{u.id}</span></p>
                                  <p className="text-xs text-foreground-500 truncate">{u.email}</p>
                                </div>
                                <span className="rounded-full bg-background-100 px-2 py-0.5 text-[10px] font-bold text-foreground-600 flex-shrink-0">{u.role}</span>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('admin.pinPushVariant')}</label>
                <select name="variantId" required defaultValue="" className="w-full rounded-xl border border-background-300 px-4 py-3 text-sm focus:outline-none focus:border-primary-400 bg-background-50">
                  <option value="" disabled>{t('admin.pinPushSelectVariant')}</option>
                  {cards.map(c => c.variants?.map(v => (
                    <option key={v.id} value={v.id}>{c.name} — ₩{v.faceValue.toLocaleString()}</option>
                  )))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('admin.pinPushCardNumber')}</label>
                <input name="cardNumber" className="w-full rounded-xl border border-background-300 px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary-400" placeholder={t('admin.pinPushCardNumberPlaceholder')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('admin.pinPushPinNumber')}</label>
                <input name="pinNumber" required className="w-full rounded-xl border border-background-300 px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('admin.reason')}</label>
                <input name="note" className="w-full rounded-xl border border-background-300 px-4 py-3 text-sm focus:outline-none focus:border-primary-400" placeholder={t('admin.reasonOptional')} />
              </div>
              <button type="submit" className="w-full rounded-xl bg-primary-500 py-3 text-sm font-bold text-background-50 hover:bg-primary-600 transition-colors">{t('admin.pinPushSend')}</button>
            </form>

            <form onSubmit={batchUploadPins} className="rounded-2xl border border-background-200/60 bg-background-50 p-6 space-y-4">
              <h3 className="font-bold text-foreground-950 flex items-center gap-2"><i className="ri-upload-2-line text-primary-500"></i>{t('admin.batchTitle')}</h3>
              <p className="text-xs text-foreground-400 -mt-2">{t('admin.batchHint')}</p>
              <div>
                <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('admin.pinPushVariant')}</label>
                <select name="variantId" required defaultValue="" className="w-full rounded-xl border border-background-300 px-4 py-3 text-sm bg-background-50">
                  <option value="" disabled>{t('admin.pinPushSelectVariant')}</option>
                  {cards.map(c => c.variants?.map(v => (
                    <option key={v.id} value={v.id}>{c.name} — ₩{v.faceValue.toLocaleString()}</option>
                  )))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('admin.batchPinsLabel')}</label>
                <textarea name="pins" required rows={6} className="w-full rounded-xl border border-background-300 px-4 py-3 text-sm font-mono" placeholder={t('admin.batchPinsPlaceholder')}></textarea>
              </div>
              <button type="submit" className="rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-bold text-background-50 hover:bg-primary-600">{t('admin.batchUpload')}</button>
            </form>

            <div className="rounded-2xl border border-background-200/60 bg-background-50 p-4">
              <h3 className="font-bold text-foreground-950 mb-3 flex items-center gap-2"><i className="ri-list-check text-primary-500"></i>{t('admin.pinListTitle')}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-background-100"><tr>
                    <th className="px-3 py-2 text-left">ID</th>
                    <th className="px-3 py-2 text-left">{t('admin.product')}</th>
                    <th className="px-3 py-2 text-right">{t('admin.gcFaceValue')}</th>
                    <th className="px-3 py-2 text-left">{t('admin.pinPushCardNumber')}</th>
                    <th className="px-3 py-2 text-left">PIN</th>
                    <th className="px-3 py-2 text-center">{t('admin.pinStatus')}</th>
                    <th className="px-3 py-2 text-left">{t('admin.createdAt')}</th>
                  </tr></thead>
                  <tbody>
                    {pinList.map(p => (
                      <tr key={p.id} className="border-t border-background-100">
                        <td className="px-3 py-2">{p.id}</td>
                        <td className="px-3 py-2">{p.card_name}</td>
                        <td className="px-3 py-2 text-right">₩{p.face_value?.toLocaleString()}</td>
                        <td className="px-3 py-2 font-mono">{p.card_number || '-'}</td>
                        <td className="px-3 py-2 font-mono">{p.pin_number}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] ${p.status === 'available' ? 'bg-green-100 text-green-700' : p.status === 'sold' ? 'bg-foreground-200 text-foreground-700' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span>
                        </td>
                        <td className="px-3 py-2 text-foreground-500">{p.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Wallet requests */}
        {tab === 'wallet' && (
          <div className="overflow-x-auto rounded-xl border border-background-200/60">
            <table className="w-full text-sm">
              <thead className="bg-background-100"><tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">{t('admin.user')}</th>
                <th className="px-4 py-3 text-center">{t('admin.walletType')}</th>
                <th className="px-4 py-3 text-right">USDT</th>
                <th className="px-4 py-3 text-right">KRW</th>
                <th className="px-4 py-3 text-left">{t('admin.walletAddress')}</th>
                <th className="px-4 py-3 text-left">{t('admin.createdAt')}</th>
                <th className="px-4 py-3 text-center">{t('admin.action')}</th>
              </tr></thead>
              <tbody>
                {walletRequests.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-foreground-400">{t('admin.walletNoRequests')}</td></tr>
                )}
                {walletRequests.map(r => (
                  <tr key={r.id} className="border-t border-background-100">
                    <td className="px-4 py-3">{r.id}</td>
                    <td className="px-4 py-3">{r.username}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${r.type === 'deposit' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{r.type === 'deposit' ? t('admin.walletDeposit') : t('admin.walletWithdraw')}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{r.amount}</td>
                    <td className="px-4 py-3 text-right font-mono">₩{r.krw_amount?.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.usdt_wallet_address || '-'}</td>
                    <td className="px-4 py-3 text-foreground-500 text-xs">{r.created_at}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => reviewWallet(r.id, 'approved')} className="px-2 py-1 rounded-lg bg-green-500 text-white text-xs font-bold mr-1">{t('admin.approve')}</button>
                      <button onClick={() => reviewWallet(r.id, 'rejected')} className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-bold">{t('admin.reject')}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Cash send */}
        {tab === 'cash' && (
          <form onSubmit={sendCash} className="rounded-2xl border border-background-200/60 bg-background-50 p-6 max-w-lg space-y-5">
            <h3 className="font-bold text-foreground-950 flex items-center gap-2"><i className="ri-money-dollar-circle-line text-primary-500"></i>{t('admin.cashSend')}</h3>
            <div>
              <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('admin.targetUserId')}</label>
              <input name="userId" type="number" required className="w-full rounded-xl border border-background-300 px-4 py-3 text-sm focus:outline-none focus:border-primary-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('admin.sendAmount')}</label>
              <input name="amount" type="number" required className="w-full rounded-xl border border-background-300 px-4 py-3 text-sm focus:outline-none focus:border-primary-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('admin.reason')}</label>
              <input name="description" className="w-full rounded-xl border border-background-300 px-4 py-3 text-sm focus:outline-none focus:border-primary-400" placeholder={t('admin.reasonOptional')} />
            </div>
            <button type="submit" className="w-full rounded-xl bg-primary-500 py-3 text-sm font-bold text-background-50 hover:bg-primary-600">{t('admin.send')}</button>
          </form>
        )}

        {/* Transactions */}
        {tab === 'transactions' && (
          <div className="overflow-x-auto rounded-xl border border-background-200/60">
            <table className="w-full text-sm">
              <thead className="bg-background-100"><tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">{t('admin.user')}</th>
                <th className="px-4 py-3 text-center">{t('admin.txType')}</th>
                <th className="px-4 py-3 text-right">{t('admin.amountCol')}</th>
                <th className="px-4 py-3 text-right">{t('admin.balance')}</th>
                <th className="px-4 py-3 text-left">{t('admin.txDesc')}</th>
                <th className="px-4 py-3 text-left">{t('admin.createdAt')}</th>
              </tr></thead>
              <tbody>
                {transactions.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-foreground-400">{t('admin.noTransactions')}</td></tr>
                )}
                {transactions.map(tx => (
                  <tr key={tx.id} className="border-t border-background-100">
                    <td className="px-4 py-3">{tx.id}</td>
                    <td className="px-4 py-3">{tx.username}</td>
                    <td className="px-4 py-3 text-center"><span className="rounded-full bg-background-200 px-2 py-0.5 text-xs">{tx.type}</span></td>
                    <td className="px-4 py-3 text-right font-mono">{tx.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-foreground-500">{tx.balance_after?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs">{tx.description}</td>
                    <td className="px-4 py-3 text-foreground-500 text-xs">{tx.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Notifications: broadcast + list/delete */}
        {tab === 'notifications' && (
          <div className="space-y-6">
            <form onSubmit={broadcastNotif} className="rounded-2xl border border-background-200/60 bg-background-50 p-6 max-w-lg space-y-5">
              <h3 className="font-bold text-foreground-950 flex items-center gap-2"><i className="ri-notification-3-line text-primary-500"></i>{t('admin.broadcastTitle')}</h3>
              <div>
                <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('admin.broadcastTitleLabel')}</label>
                <input name="title" required className="w-full rounded-xl border border-background-300 px-4 py-3 text-sm focus:outline-none focus:border-primary-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('admin.broadcastContent')}</label>
                <textarea name="content" required rows={4} className="w-full rounded-xl border border-background-300 px-4 py-3 text-sm focus:outline-none focus:border-primary-400" />
              </div>
              <button type="submit" className="w-full rounded-xl bg-primary-500 py-3 text-sm font-bold text-background-50 hover:bg-primary-600">{t('admin.broadcast')}</button>
            </form>

            <div className="rounded-2xl border border-background-200/60 bg-background-50 p-4">
              <h3 className="font-bold text-foreground-950 mb-3 flex items-center gap-2"><i className="ri-list-check text-primary-500"></i>{t('admin.notifListTitle')}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-background-100"><tr>
                    <th className="px-3 py-2 text-left">ID</th>
                    <th className="px-3 py-2 text-left">{t('admin.notifType')}</th>
                    <th className="px-3 py-2 text-left">{t('admin.broadcastTitleLabel')}</th>
                    <th className="px-3 py-2 text-left">{t('admin.targetUser')}</th>
                    <th className="px-3 py-2 text-left">{t('admin.createdAt')}</th>
                    <th className="px-3 py-2 text-center">{t('admin.action')}</th>
                  </tr></thead>
                  <tbody>
                    {notifList.map(n => (
                      <tr key={n.id} className="border-t border-background-100">
                        <td className="px-3 py-2">{n.id}</td>
                        <td className="px-3 py-2"><span className="rounded-full bg-background-200 px-2 py-0.5 text-[10px]">{n.type}</span></td>
                        <td className="px-3 py-2">{n.title}</td>
                        <td className="px-3 py-2">{n.user_id === null ? <span className="text-primary-600 font-bold">{t('admin.notifBroadcast')}</span> : n.target_username || `#${n.user_id}`}</td>
                        <td className="px-3 py-2 text-foreground-500">{n.created_at}</td>
                        <td className="px-3 py-2 text-center">
                          <button onClick={() => deleteNotif(n.id)} className="px-2 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-bold hover:bg-red-200">{t('admin.delete')}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* USDT settings */}
        {tab === 'usdt' && usdtSettings && (
          <form onSubmit={saveUSDT} className="rounded-2xl border border-background-200/60 bg-background-50 p-6 max-w-lg space-y-5">
            <h3 className="font-bold text-foreground-950 flex items-center gap-2"><i className="ri-coin-line text-primary-500"></i>{t('admin.usdtSettings')}</h3>
            <div>
              <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('admin.receivingAddress')}</label>
              <input name="receivingAddress" defaultValue={usdtSettings.receiving_address} required
                className="w-full rounded-xl border border-background-300 px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary-400" placeholder={t('admin.addressPlaceholder')} />
              <p className="mt-1 text-xs text-foreground-400">{t('admin.addressHint')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('admin.exchangeRateLabel')}</label>
              <input name="exchangeRate" type="number" step="0.01" defaultValue={usdtSettings.exchange_rate} required
                className="w-full rounded-xl border border-background-300 px-4 py-3 text-sm focus:outline-none focus:border-primary-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('admin.minDeposit')}</label>
                <input name="minDeposit" type="number" step="0.01" defaultValue={usdtSettings.min_deposit} required
                  className="w-full rounded-xl border border-background-300 px-4 py-3 text-sm focus:outline-none focus:border-primary-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('admin.minWithdrawal')}</label>
                <input name="minWithdrawal" type="number" step="0.01" defaultValue={usdtSettings.min_withdrawal} required
                  className="w-full rounded-xl border border-background-300 px-4 py-3 text-sm focus:outline-none focus:border-primary-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('admin.paymentTimeout')}</label>
              <input name="paymentTimeoutMinutes" type="number" defaultValue={usdtSettings.payment_timeout_minutes} required
                className="w-full rounded-xl border border-background-300 px-4 py-3 text-sm focus:outline-none focus:border-primary-400" />
            </div>
            <button type="submit" className="w-full rounded-xl bg-primary-500 py-3 text-sm font-bold text-background-50 hover:bg-primary-600 transition-colors">{t('admin.save')}</button>
          </form>
        )}

        {/* Events management */}
        {tab === 'events' && (
          <div className="space-y-6">
            <form onSubmit={createEvent} className="rounded-2xl border border-background-200/60 bg-background-50 p-6 space-y-4">
              <h3 className="font-bold text-foreground-950 flex items-center gap-2"><i className="ri-trophy-line text-primary-500"></i>{t('admin.eventCreateTitle')}</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground-600 mb-1">{t('admin.eventSlug')}</label>
                  <input name="slug" required pattern="[a-z0-9-]+" className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm font-mono" placeholder="2026-summer" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-600 mb-1">{t('admin.eventTitle')}</label>
                  <input name="title" required className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-600 mb-1">{t('admin.eventType')}</label>
                  <select name="type" required defaultValue="" className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm bg-background-50">
                    <option value="" disabled>{t('admin.eventTypeSelect')}</option>
                    {EVENT_TYPES.map(et => <option key={et.value} value={et.value}>{t(et.labelKey)}</option>)}
                  </select>
                </div>
                <div></div>
                <div>
                  <label className="block text-xs font-medium text-foreground-600 mb-1">{t('admin.eventStart')}</label>
                  <input name="startAt" type="datetime-local" required className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-600 mb-1">{t('admin.eventEnd')}</label>
                  <input name="endAt" type="datetime-local" required className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-foreground-600 mb-1">{t('admin.eventDesc')}</label>
                  <textarea name="description" rows={2} className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-foreground-600 mb-1">{t('admin.eventRules')}</label>
                  <textarea name="rewardRules" rows={3} className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm font-mono" placeholder={t('admin.eventRulesHint')}></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-foreground-600 mb-1">{t('admin.gcImageUrl')}</label>
                  <input name="imageUrl" className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm" />
                </div>
              </div>
              <button type="submit" className="rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-bold text-background-50 hover:bg-primary-600">{t('admin.eventCreate')}</button>
            </form>

            <div className="space-y-3">
              {events.length === 0 && <p className="text-center text-foreground-400 py-8">{t('admin.eventNone')}</p>}
              {events.map(ev => (
                <div key={ev.id} className="rounded-xl border border-background-200/60 bg-background-50 p-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <i className="ri-trophy-line text-2xl text-primary-500"></i>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground-950">{ev.title} <span className="text-xs font-mono text-foreground-400">/{ev.slug}</span></p>
                        <p className="text-xs text-foreground-500">
                          <span className="rounded-full bg-background-200 px-2 py-0.5 mr-1">{t(eventLabel(EVENT_TYPE_LABEL_KEY, ev.type))}</span>
                          {ev.start_at?.slice(0,10)} ~ {ev.end_at?.slice(0,10)}
                          <span className={`ml-2 rounded-full px-2 py-0.5 ${ev.status === 'active' ? 'bg-green-100 text-green-700' : ev.status === 'ended' ? 'bg-foreground-200 text-foreground-700' : 'bg-red-100 text-red-700'}`}>{t(eventLabel(EVENT_STATUS_LABEL_KEY, ev.status))}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-foreground-400">{t('admin.eventRewardsCount', { n: ev.reward_count })}</span>
                      <span className="text-foreground-400">{t('admin.eventTotalDistributed', { n: Number(ev.total_distributed || 0).toLocaleString() })}</span>
                      <button onClick={() => viewParticipants(ev)} className="px-3 py-1 rounded-lg bg-background-200 text-foreground-700 font-bold hover:bg-background-300">{t('admin.eventParticipants')}</button>
                      <button onClick={() => toggleEventActive(ev)} className={`px-3 py-1 rounded-lg font-bold ${ev.is_active ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{ev.is_active ? t('admin.deactivate') : t('admin.activate')}</button>
                      {ev.status === 'active' && <button onClick={() => endEvent(ev)} className="px-3 py-1 rounded-lg bg-foreground-200 text-foreground-700 font-bold">{t('admin.eventEnd')}</button>}
                      <button onClick={() => deleteEvent(ev)} className="px-3 py-1 rounded-lg bg-red-100 text-red-700 font-bold hover:bg-red-200">{t('admin.delete')}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {viewingEvent && eventParticipants && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setViewingEvent(null); setEventParticipants(null); }}>
                <div className="bg-background-50 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-foreground-950 text-lg">{t('admin.eventParticipantsTitle')} - {viewingEvent.title}</h3>
                    <button onClick={() => { setViewingEvent(null); setEventParticipants(null); }} className="text-foreground-400 hover:text-foreground-600"><i className="ri-close-line text-2xl"></i></button>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-background-100"><tr>
                      <th className="px-3 py-2 text-left">{t('admin.user')}</th>
                      {viewingEvent.type === 'monthly_purchase' && <>
                        <th className="px-3 py-2 text-right">{t('admin.eventOrderCount')}</th>
                        <th className="px-3 py-2 text-right">{t('admin.eventTotalSpent')}</th>
                      </>}
                      <th className="px-3 py-2 text-right">{t('admin.eventRewardAmount')}</th>
                      <th className="px-3 py-2 text-center">{t('admin.action')}</th>
                    </tr></thead>
                    <tbody>
                      {eventParticipants.length === 0 && <tr><td colSpan={5} className="px-3 py-6 text-center text-foreground-400">{t('admin.eventNoParticipants')}</td></tr>}
                      {eventParticipants.map(p => (
                        <tr key={p.id} className="border-t border-background-100">
                          <td className="px-3 py-2">{p.username}<br/><span className="text-xs text-foreground-400">{p.email}</span></td>
                          {viewingEvent.type === 'monthly_purchase' && <>
                            <td className="px-3 py-2 text-right">{p.order_count}</td>
                            <td className="px-3 py-2 text-right font-mono">₩{Number(p.total_spent || 0).toLocaleString()}</td>
                          </>}
                          <td className="px-3 py-2 text-right font-mono">
                            {p.reward_id ? <span className="text-green-600">+₩{Number(p.reward_amount).toLocaleString()}</span> : <span className="text-foreground-400">-</span>}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {p.reward_id ? (
                              <span className="text-xs text-green-600">{t('admin.eventRewarded')}</span>
                            ) : (
                              <button onClick={() => grantReward(viewingEvent.id, p.id)} className="px-2 py-1 rounded-lg bg-primary-500 text-background-50 text-xs font-bold">{t('admin.eventGrantReward')}</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Templates management */}
        {tab === 'templates' && (
          <div className="space-y-6">
            <form onSubmit={saveTemplate} className="rounded-2xl border border-background-200/60 bg-background-50 p-6 space-y-4" key={editingTemplate?.id || 'new'}>
              <h3 className="font-bold text-foreground-950 flex items-center gap-2">
                <i className="ri-file-text-line text-primary-500"></i>
                {editingTemplate ? t('admin.templateEditTitle') : t('admin.templateCreateTitle')}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground-600 mb-1">{t('admin.templateCode')}</label>
                  <input name="code" required pattern="[a-z0-9_]+" defaultValue={editingTemplate?.code} disabled={!!editingTemplate}
                    className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm font-mono disabled:opacity-50" placeholder="sms_verify_phone" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-600 mb-1">{t('admin.templateName')}</label>
                  <input name="name" required defaultValue={editingTemplate?.name} className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-600 mb-1">{t('admin.templateChannel')}</label>
                  <select name="channel" required defaultValue={editingTemplate?.channel || ''} className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm bg-background-50">
                    <option value="" disabled>{t('admin.templateChannelSelect')}</option>
                    {TEMPLATE_CHANNELS.map(tc => <option key={tc.value} value={tc.value}>{t(tc.labelKey)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-600 mb-1">{t('admin.templateActive')}</label>
                  <label className="flex items-center gap-2 px-4 py-2.5">
                    <input type="checkbox" name="isActive" defaultChecked={editingTemplate ? editingTemplate.is_active : true} className="rounded" />
                    <span className="text-sm">{t('admin.templateActiveHint')}</span>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-foreground-600 mb-1">{t('admin.templateSubject')} <span className="text-foreground-400">({t('admin.templateEmailOnly')})</span></label>
                  <input name="subject" defaultValue={editingTemplate?.subject || ''} className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-foreground-600 mb-1">{t('admin.templateBody')}</label>
                  <textarea name="body" required rows={5} defaultValue={editingTemplate?.body} className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm font-mono" placeholder={t('admin.templateBodyHint')}></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-foreground-600 mb-1">{t('admin.templateVars')}</label>
                  <input name="variables" defaultValue={(editingTemplate?.variables || []).join(', ')} className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm font-mono" placeholder="code, username, orderNumber" />
                  <p className="mt-1 text-xs text-foreground-400">{t('admin.templateVarsHint')}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-bold text-background-50 hover:bg-primary-600">{editingTemplate ? t('admin.save') : t('admin.templateCreate')}</button>
                {editingTemplate && <button type="button" onClick={() => setEditingTemplate(null)} className="rounded-xl bg-background-200 px-5 py-2.5 text-sm font-bold">{t('admin.cancel')}</button>}
              </div>
            </form>

            <div className="space-y-2">
              {templates.map(tmpl => (
                <div key={tmpl.id} className="rounded-xl border border-background-200/60 bg-background-50 p-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <i className={`text-2xl ${tmpl.channel === 'sms' ? 'ri-message-3-line text-amber-500' : tmpl.channel === 'email' ? 'ri-mail-line text-primary-500' : 'ri-notification-3-line text-accent-500'}`}></i>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground-950">{tmpl.name} <span className="text-xs font-mono text-foreground-400">[{tmpl.code}]</span></p>
                        <p className="text-xs text-foreground-500 font-mono truncate max-w-2xl">{tmpl.body}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`rounded-full px-2 py-0.5 ${tmpl.is_active ? 'bg-green-100 text-green-700' : 'bg-foreground-200 text-foreground-600'}`}>{tmpl.is_active ? t('admin.active') : t('admin.inactive')}</span>
                      <span className="rounded-full bg-background-200 px-2 py-0.5">{tmpl.channel}</span>
                      <button onClick={() => setEditingTemplate(tmpl)} className="px-3 py-1 rounded-lg bg-background-200 text-foreground-700 font-bold hover:bg-background-300">{t('admin.edit')}</button>
                      <button onClick={() => deleteTemplate(tmpl)} className="px-3 py-1 rounded-lg bg-red-100 text-red-700 font-bold hover:bg-red-200">{t('admin.delete')}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Card recovery review */}
        {tab === 'recovery' && (
          <div className="overflow-x-auto rounded-xl border border-background-200/60">
            <table className="w-full text-sm">
              <thead className="bg-background-100"><tr>
                <th className="px-4 py-3 text-left font-semibold text-foreground-600">ID</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground-600">{t('admin.user')}</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground-600">{t('admin.pinPushCardNumber')}</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground-600">PIN</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground-600">{t('admin.createdAt')}</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground-600">{t('admin.pinStatus')}</th>
                <th className="px-4 py-3 text-right font-semibold text-foreground-600">{t('admin.amountCol')}</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground-600">{t('admin.action')}</th>
              </tr></thead>
              <tbody>
                {recoveries.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-foreground-400">{t('admin.recoveryNone')}</td></tr>
                )}
                {recoveries.map(r => (
                  <tr key={r.id} className="border-t border-background-100">
                    <td className="px-4 py-3 font-mono text-xs">RC-{String(r.id).padStart(3, '0')}</td>
                    <td className="px-4 py-3">{r.username}<br/><span className="text-xs text-foreground-400">{r.email}</span></td>
                    <td className="px-4 py-3 font-mono text-xs">{r.card_number}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.pin_number}</td>
                    <td className="px-4 py-3 text-foreground-500 text-xs">{r.created_at}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${r.status === 'pending' ? 'bg-amber-100 text-amber-700' : r.status === 'approved' ? 'bg-green-100 text-green-700' : r.status === 'duplicate' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{r.reward_amount > 0 ? `+${r.reward_amount.toLocaleString()}` : '-'}</td>
                    <td className="px-4 py-3 text-center">
                      {r.status === 'pending' && (
                        <>
                          <button onClick={() => approveRecovery(r)} className="px-3 py-1 rounded-lg bg-green-500 text-white text-xs font-bold mr-1 hover:bg-green-600">{t('admin.recoveryApprove')}</button>
                          <button onClick={() => rejectRecovery(r)} className="px-3 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-bold hover:bg-red-200">{t('admin.recoveryReject')}</button>
                        </>
                      )}
                      {r.admin_note && <div className="text-[10px] text-foreground-400 mt-1">{r.admin_note}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User edit modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditingUser(null)}>
          <form onSubmit={saveUserEdit} onClick={e => e.stopPropagation()} className="bg-background-50 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-foreground-950 text-lg">{t('admin.userEditTitle')} - {editingUser.username}</h3>
            <div>
              <label className="block text-sm font-medium text-foreground-700 mb-1">{t('admin.roleCol')}</label>
              <select name="role" defaultValue={editingUser.role} className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm bg-background-50">
                {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground-700">
                <input type="checkbox" name="is_active" defaultChecked={editingUser.is_active} className="rounded" />
                {t('admin.activeUser')}
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-700 mb-1">{t('admin.cashBalance')}</label>
              <input name="cash_balance" type="number" defaultValue={editingUser.cash_balance} className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-700 mb-1">{t('admin.withdrawableCash')}</label>
              <input name="withdrawable_cash" type="number" defaultValue={editingUser.withdrawable_cash} className="w-full rounded-xl border border-background-300 px-4 py-2.5 text-sm" />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setEditingUser(null)} className="flex-1 rounded-xl bg-background-200 py-2.5 text-sm font-bold">{t('admin.cancel')}</button>
              <button type="submit" className="flex-1 rounded-xl bg-primary-500 py-2.5 text-sm font-bold text-background-50">{t('admin.save')}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
