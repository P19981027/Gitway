import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n';
import { orderApi, walletApi, userApi, verificationApi } from '../api';

export default function MyPage() {
  const { user, setUser } = useAuth();
  const { t } = useI18n();
  const [orders, setOrders] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [tab, setTab] = useState('deposit');
  const [transactions, setTransactions] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [network, setNetwork] = useState('TRC-20');
  const [depositAddress, setDepositAddress] = useState(user?.usdt_deposit_address || '');
  const [withdrawAddress, setWithdrawAddress] = useState(user?.usdt_withdraw_address || '');
  const [editingDeposit, setEditingDeposit] = useState(false);
  const [editingWithdraw, setEditingWithdraw] = useState(false);

  useEffect(() => {
    if (user) {
      setDepositAddress(user.usdt_deposit_address || '');
      setWithdrawAddress(user.usdt_withdraw_address || '');
    }
  }, [user?.usdt_deposit_address, user?.usdt_withdraw_address]);

  const [phoneInput, setPhoneInput] = useState(user?.phone || '');
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneDevCode, setPhoneDevCode] = useState('');
  const [phoneSending, setPhoneSending] = useState(false);
  const [phoneConfirming, setPhoneConfirming] = useState(false);
  const [phoneMsg, setPhoneMsg] = useState({ type: '', text: '' });

  const [emailInput, setEmailInput] = useState(user?.email || '');
  const [emailCode, setEmailCode] = useState('');
  const [emailDevCode, setEmailDevCode] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailConfirming, setEmailConfirming] = useState(false);
  const [emailMsg, setEmailMsg] = useState({ type: '', text: '' });

  const [addressMsg, setAddressMsg] = useState({ type: '', text: '' });

  const saveDepositAddress = async () => {
    setAddressMsg({ type: '', text: '' });
    try {
      const { data } = await userApi.updateMe({ usdtDepositAddress: depositAddress });
      setUser(data.user);
      setUserInfo(data.user);
      setEditingDeposit(false);
      setAddressMsg({ type: 'success', text: t('mypage.addressSaved') });
    } catch (err) {
      setAddressMsg({ type: 'error', text: err.response?.data?.message || t('mypage.saveFail') });
    }
  };

  const saveWithdrawAddress = async () => {
    setAddressMsg({ type: '', text: '' });
    try {
      const { data } = await userApi.updateMe({ usdtWithdrawAddress: withdrawAddress });
      setUser(data.user);
      setUserInfo(data.user);
      setEditingWithdraw(false);
      setAddressMsg({ type: 'success', text: t('mypage.addressSaved') });
    } catch (err) {
      setAddressMsg({ type: 'error', text: err.response?.data?.message || t('mypage.saveFail') });
    }
  };

  const refreshUser = async () => {
    try {
      const { data } = await userApi.getMe();
      setUserInfo(data);
      setUser(data);
    } catch {}
  };

  const handleSendPhone = async () => {
    setPhoneMsg({ type: '', text: '' });
    setPhoneDevCode('');
    if (!phoneInput) { setPhoneMsg({ type: 'error', text: t('mypage.phoneRequired') }); return; }
    setPhoneSending(true);
    try {
      const { data } = await verificationApi.sendPhoneUpdate(phoneInput);
      setPhoneMsg({ type: 'success', text: data.message || t('mypage.codeSent') });
      if (data.devCode) setPhoneDevCode(data.devCode);
    } catch (err) {
      setPhoneMsg({ type: 'error', text: err.response?.data?.message || t('mypage.sendFail') });
    } finally {
      setPhoneSending(false);
    }
  };

  const handleConfirmPhone = async () => {
    setPhoneMsg({ type: '', text: '' });
    if (!phoneCode) { setPhoneMsg({ type: 'error', text: t('mypage.codeRequired') }); return; }
    setPhoneConfirming(true);
    try {
      const { data } = await verificationApi.confirmPhoneUpdate(phoneInput, phoneCode);
      setPhoneMsg({ type: 'success', text: t('mypage.phoneVerified') });
      setPhoneDevCode('');
      setPhoneCode('');
      if (data.user) { setUser(data.user); setUserInfo(data.user); }
      else await refreshUser();
    } catch (err) {
      setPhoneMsg({ type: 'error', text: err.response?.data?.message || t('mypage.verifyFail') });
    } finally {
      setPhoneConfirming(false);
    }
  };

  const handleSendEmail = async () => {
    setEmailMsg({ type: '', text: '' });
    setEmailDevCode('');
    if (!emailInput) { setEmailMsg({ type: 'error', text: t('mypage.emailRequired') }); return; }
    setEmailSending(true);
    try {
      const { data } = await verificationApi.sendEmailUpdate(emailInput);
      setEmailMsg({ type: 'success', text: data.message || t('mypage.codeSent') });
      if (data.devCode) setEmailDevCode(data.devCode);
    } catch (err) {
      setEmailMsg({ type: 'error', text: err.response?.data?.message || t('mypage.sendFail') });
    } finally {
      setEmailSending(false);
    }
  };

  const handleConfirmEmail = async () => {
    setEmailMsg({ type: '', text: '' });
    if (!emailCode) { setEmailMsg({ type: 'error', text: t('mypage.codeRequired') }); return; }
    setEmailConfirming(true);
    try {
      const { data } = await verificationApi.confirmEmailUpdate(emailInput, emailCode);
      setEmailMsg({ type: 'success', text: t('mypage.emailVerified') });
      setEmailDevCode('');
      setEmailCode('');
      if (data.user) { setUser(data.user); setUserInfo(data.user); }
      else await refreshUser();
    } catch (err) {
      setEmailMsg({ type: 'error', text: err.response?.data?.message || t('mypage.verifyFail') });
    } finally {
      setEmailConfirming(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    orderApi.getAll({ limit: 5 }).then(({ data }) => setOrders(data.orders)).catch(() => {});
    walletApi.getWallet().then(({ data }) => setWallet(data)).catch(() => {});
    walletApi.getTransactions({ limit: 20 }).then(({ data }) => setTransactions(data.transactions || [])).catch(() => {});
    userApi.getMe().then(({ data }) => setUserInfo(data)).catch(() => {});
  }, [user]);

  const handleDeposit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      const { data } = await walletApi.depositRequest({
        usdtAmount: parseFloat(formData.get('usdtAmount')),
        usdtWalletAddress: formData.get('walletAddress'),
      });
      alert(`${t('wallet.depositRequestSubmitted')}\n${data.krwAmount?.toLocaleString()}${t('common.won')} (${data.usdtAmount} USDT)\n${t('wallet.usdtAddress')}: ${data.receivingAddress}`);
      walletApi.getWallet().then(({ data }) => setWallet(data));
      setTab('history');
    } catch (err) { alert(err.response?.data?.message || t('wallet.depositRequestFailed')); }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      const { data } = await walletApi.withdrawRequest({
        krwAmount: parseInt(formData.get('krwAmount')),
        usdtWalletAddress: formData.get('walletAddress'),
      });
      alert(`${t('wallet.withdrawRequestSubmitted')}\n${data.krwAmount?.toLocaleString()}${t('common.won')} → ${data.usdtAmount} USDT`);
      walletApi.getWallet().then(({ data }) => setWallet(data));
      setTab('history');
    } catch (err) { alert(err.response?.data?.message || t('wallet.withdrawRequestFailed')); }
  };

  const exchangeRate = wallet?.exchangeRate || 1380;
  const phoneVerified = userInfo?.phone_verified || user?.phone_verified || false;
  const emailVerified = userInfo?.email_verified || user?.email_verified || false;
  const walletVerified = userInfo?.wallet_verified || user?.wallet_verified || false;
  const allVerified = phoneVerified && emailVerified && walletVerified;

  const totalPurchaseAmount = orders.reduce((sum, o) => sum + (o.total_price || 0), 0);

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
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f1a2e] via-[#132236] to-[#0a1220]">
        <img
          src="https://readdy.ai/api/search-image?query=Soft%20warm%20taupe%20toned%20premium%20dashboard%20background%20with%20subtle%20gentle%20glow%20and%20elegant%20minimal%20geometric%20accents%2C%20personal%20luxury%20account%20atmosphere%2C%20sophisticated%20mypage%20visual%20theme%2C%20warm%20ambient%20gold%20champagne%20light%2C%20clean%20professional%20feel%2C%20high-end%20membership%20card%20aesthetic%2C%20rich%20depth%2C%20refined%20quiet%20luxury%20mood&width=1600&height=400&seq=mypage-banner-bg-v3&orientation=landscape"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-top opacity-28 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f1a2e]/50 to-[#0a1220]"></div>

        <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-10 pt-32 pb-24 md:pt-40 md:pb-28">
          <nav className="mb-6 flex items-center gap-2 text-sm text-background-100/50">
            <Link to="/" className="transition-colors hover:text-background-100"><i className="ri-home-4-line"></i></Link>
            <i className="ri-arrow-right-s-line text-xs"></i>
            <span className="text-background-100/80">{t('nav.mypage')}</span>
          </nav>

          {/* Profile Banner */}
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 md:h-20 md:w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-2xl md:text-3xl font-bold text-background-50">
              {user.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold text-background-50" style={{ fontFamily: 'var(--font-heading)' }}>
                  {t('mypage.userGreeting', { username: user.username })}
                </h1>
                {(phoneVerified && emailVerified) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 border border-green-400/30 px-3 py-1 text-xs font-bold text-green-300">
                    <i className="ri-shield-check-line text-sm"></i>{t('mypage.verifiedMember')}
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-4 text-xs text-background-100/40">
                <span>ID: {user.id || user.username}</span>
                {user.created_at && <span>{t('mypage.joinDate')}: {new Date(user.created_at).toLocaleDateString()}</span>}
              </div>
            </div>
          </div>

          {/* Verification status pills */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${phoneVerified ? 'bg-green-500/15 border border-green-400/30 text-green-300' : 'bg-white/5 border border-white/10 text-background-100/50'}`}>
              <i className={`ri-smartphone-line text-sm`}></i>{t('mypage.phone')}
            </span>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${emailVerified ? 'bg-green-500/15 border border-green-400/30 text-green-300' : 'bg-white/5 border border-white/10 text-background-100/50'}`}>
              <i className={`ri-mail-line text-sm`}></i>{t('mypage.email')}
            </span>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${walletVerified ? 'bg-green-500/15 border border-green-400/30 text-green-300' : 'bg-white/5 border border-white/10 text-background-100/50'}`}>
              <i className={`ri-wallet-3-line text-sm`}></i>{t('mypage.wallet')}
            </span>
          </div>
        </div>
      </section>

      {/* Dashboard Cards - overlapping the hero */}
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 -mt-12 md:-mt-16 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: t('mypage.cashBalance'), value: wallet?.cashBalance || 0, icon: 'ri-wallet-3-fill', color: 'from-primary-500 to-primary-600', delay: '' },
            { label: t('mypage.withdrawable'), value: wallet?.withdrawableCash || 0, icon: 'ri-exchange-dollar-fill', color: 'from-green-500 to-green-600', delay: 'delay-100' },
            { label: t('mypage.totalPurchase'), value: totalPurchaseAmount, icon: 'ri-shopping-bag-3-fill', color: 'from-accent-500 to-accent-600', delay: 'delay-200' },
            { label: t('mypage.orderCount'), value: orders.length, icon: 'ri-receipt-fill', color: 'from-amber-500 to-amber-600', delay: 'delay-300' },
          ].map((card, i) => (
            <div key={i} className={`rounded-2xl bg-white border border-background-200/60 p-4 md:p-5 shadow-lg animate-fade-in ${card.delay}`}>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} text-background-50 mb-3`}>
                <i className={card.icon}></i>
              </div>
              <p className="text-[11px] text-foreground-400 uppercase tracking-wider">{card.label}</p>
              <p className="mt-1 text-xl md:text-2xl font-bold text-foreground-950" style={{ fontFamily: 'var(--font-heading)' }}>₩{card.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-background-300/50 to-transparent mt-8" />

      {/* ═══ MAIN CONTENT ═══ */}
      <section className="bg-background-50 py-10 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 space-y-8">

          {/* ─── USDT Exchange Rate ─── */}
          <div className="rounded-2xl border border-background-200/60 bg-background-50 p-5 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                <i className="ri-exchange-line text-lg"></i>
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground-950" style={{ fontFamily: 'var(--font-heading)' }}>{t('mypage.usdtRate')}</h3>
                <p className="text-xs text-foreground-400">{t('mypage.usdtRateSource')}</p>
              </div>
            </div>

            <div className="rounded-xl bg-background-100/80 p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-foreground-400">{t('mypage.realTimeRate')}</span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground-950" style={{ fontFamily: 'var(--font-heading)' }}>{exchangeRate?.toLocaleString()}</span>
                    <span className="text-sm text-foreground-500">KRW/USDT</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[10px] text-foreground-400">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    {t('mypage.updatedAt')}
                  </span>
                  <p className="mt-1 text-xs text-foreground-400">{new Date().toLocaleTimeString()}</p>
                </div>
              </div>
              <p className="mt-2 text-[10px] text-foreground-300">{t('mypage.usdtRateProvider')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl bg-green-50/50 border border-green-200/30 p-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <i className="ri-arrow-down-circle-line text-green-500 text-sm"></i>
                  <span className="text-[11px] font-medium text-green-600">{t('wallet.deposit')}</span>
                </div>
                <p className="text-sm font-semibold text-foreground-950">
                  {t('mypage.depositExample', { usdt: '10', krw: Math.round(10 * exchangeRate).toLocaleString() })}
                </p>
              </div>
              <div className="rounded-xl bg-blue-50/50 border border-blue-200/30 p-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <i className="ri-arrow-up-circle-line text-blue-500 text-sm"></i>
                  <span className="text-[11px] font-medium text-blue-600">{t('wallet.withdraw')}</span>
                </div>
                <p className="text-sm font-semibold text-foreground-950">
                  {t('mypage.withdrawExample', { krw: '100,000', usdt: Math.round(100000 / exchangeRate * 100) / 100 })}
                </p>
              </div>
            </div>
          </div>

          {/* ─── USDT Policy ─── */}
          <div className="rounded-2xl border border-primary-200/40 bg-primary-50/30 p-5 md:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                <i className="ri-information-line text-lg"></i>
              </div>
              <div>
                <h4 className="text-sm font-bold text-primary-800">{t('mypage.usdtPolicy')}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-primary-700/80">{t('mypage.usdtPolicyDesc')}</p>
              </div>
            </div>
          </div>

          {/* ─── Wallet Address Management ─── */}
          <div className="rounded-2xl border border-background-200/60 bg-background-50 p-5 md:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-100 text-accent-600">
                <i className="ri-wallet-3-line text-lg"></i>
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground-950" style={{ fontFamily: 'var(--font-heading)' }}>{t('mypage.walletAddressMgmt')}</h3>
              </div>
            </div>

            {/* Network selector */}
            <div className="flex items-center gap-2 mb-5">
              <button
                onClick={() => setNetwork('TRC-20')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  network === 'TRC-20' ? 'bg-primary-500 text-background-50' : 'bg-background-100 text-foreground-600 hover:bg-background-200'
                }`}
              >
                <i className="ri-tron-line mr-1.5"></i>TRC-20
              </button>
              <button
                onClick={() => setNetwork('ERC-20')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  network === 'ERC-20' ? 'bg-primary-500 text-background-50' : 'bg-background-100 text-foreground-600 hover:bg-background-200'
                }`}
              >
                <i className="ri-ethereum-line mr-1.5"></i>ERC-20
              </button>
              <span className="text-xs text-foreground-400 ml-2">{network === 'TRC-20' ? 'TRON' : 'Ethereum'}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Deposit Address */}
              <div className="rounded-xl border border-background-200/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground-700">{t('mypage.depositAddress')}</span>
                  {!editingDeposit ? (
                    <button onClick={() => setEditingDeposit(true)} className="text-xs font-semibold text-primary-600 hover:text-primary-700">{t('mypage.changeAddress')}</button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => { setDepositAddress(user?.usdt_deposit_address || ''); setEditingDeposit(false); }} className="text-xs text-foreground-400">{t('common.cancel')}</button>
                      <button onClick={saveDepositAddress} className="text-xs font-semibold text-primary-600">{t('common.save')}</button>
                    </div>
                  )}
                </div>
                {editingDeposit ? (
                  <input
                    type="text"
                    value={depositAddress}
                    onChange={e => setDepositAddress(e.target.value)}
                    placeholder={network === 'TRC-20' ? 'T...' : '0x...'}
                    className="w-full rounded-lg border border-background-300 px-3 py-2 text-sm font-mono outline-none focus:border-primary-400 transition-colors"
                  />
                ) : (
                  <p className="text-sm font-mono text-foreground-500 truncate">
                    {depositAddress || t('mypage.noAddress')}
                  </p>
                )}
                <p className="mt-1.5 text-[10px] text-foreground-300">
                  {network === 'TRC-20' ? t('mypage.trc20Hint') : t('mypage.erc20Hint')}
                </p>
              </div>

              {/* Withdraw Address */}
              <div className="rounded-xl border border-background-200/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground-700">{t('mypage.withdrawAddress')}</span>
                  {!editingWithdraw ? (
                    <button onClick={() => setEditingWithdraw(true)} className="text-xs font-semibold text-primary-600 hover:text-primary-700">{t('mypage.changeAddress')}</button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => { setWithdrawAddress(user?.usdt_withdraw_address || ''); setEditingWithdraw(false); }} className="text-xs text-foreground-400">{t('common.cancel')}</button>
                      <button onClick={saveWithdrawAddress} className="text-xs font-semibold text-primary-600">{t('common.save')}</button>
                    </div>
                  )}
                </div>
                {editingWithdraw ? (
                  <input
                    type="text"
                    value={withdrawAddress}
                    onChange={e => setWithdrawAddress(e.target.value)}
                    placeholder={network === 'TRC-20' ? 'T...' : '0x...'}
                    className="w-full rounded-lg border border-background-300 px-3 py-2 text-sm font-mono outline-none focus:border-primary-400 transition-colors"
                  />
                ) : (
                  <p className="text-sm font-mono text-foreground-500 truncate">
                    {withdrawAddress || t('mypage.noAddress')}
                  </p>
                )}
                {depositAddress && withdrawAddress && depositAddress === withdrawAddress && (
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-green-600">
                    <i className="ri-check-line"></i>{t('mypage.addressMatch')}
                  </div>
                )}
                {depositAddress && withdrawAddress && depositAddress !== withdrawAddress && (
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-red-500">
                    <i className="ri-close-line"></i>{t('mypage.addressMismatch')}
                  </div>
                )}
              </div>
            </div>

            {addressMsg.text && (
              <div className={`mt-3 rounded-lg border px-3 py-2 text-xs ${addressMsg.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>
                {addressMsg.text}
              </div>
            )}
          </div>

          {/* ─── Identity Verification ─── */}
          <div className="rounded-2xl border border-background-200/60 bg-background-50 p-5 md:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-100 text-accent-600">
                <i className="ri-shield-check-line text-lg"></i>
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground-950" style={{ fontFamily: 'var(--font-heading)' }}>{t('mypage.identityVerification')}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {[
                { verified: phoneVerified, label: t('mypage.phoneVerification'), icon: 'ri-smartphone-line' },
                { verified: emailVerified, label: t('mypage.emailVerification'), icon: 'ri-mail-line' },
                { verified: walletVerified, label: t('mypage.walletVerification'), icon: 'ri-wallet-3-line' },
              ].map((item, i) => (
                <div key={i} className={`rounded-xl border p-4 ${item.verified ? 'border-green-200/50 bg-green-50/30' : 'border-background-200/60 bg-background-100/50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <i className={`${item.icon} ${item.verified ? 'text-green-500' : 'text-foreground-300'}`}></i>
                      <span className="text-sm font-medium text-foreground-950">{item.label}</span>
                    </div>
                    {item.verified ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-background-50"><i className="ri-check-line text-xs"></i></span>
                    ) : (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background-200 text-foreground-400"><i className="ri-close-line text-xs"></i></span>
                    )}
                  </div>
                  <p className={`text-xs font-medium ${item.verified ? 'text-green-600' : 'text-foreground-400'}`}>
                    {item.verified ? t('mypage.verificationComplete') : t('mypage.verificationIncomplete')}
                  </p>
                </div>
              ))}
            </div>

            {allVerified && (
              <div className="rounded-xl bg-green-50/50 border border-green-200/40 p-4 flex items-start gap-2.5">
                <i className="ri-checkbox-circle-fill text-green-500 mt-0.5"></i>
                <p className="text-sm text-green-700">{t('mypage.allVerified')}</p>
              </div>
            )}
            {!allVerified && (
              <div className="rounded-xl bg-amber-50/50 border border-amber-200/40 p-4 flex items-start gap-2.5">
                <i className="ri-alert-line text-amber-500 mt-0.5"></i>
                <p className="text-sm text-amber-700">{t('mypage.verificationNotice')}</p>
              </div>
            )}

            {/* Phone verification form */}
            <div className="mt-5 rounded-xl border border-background-200/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-foreground-950"><i className="ri-smartphone-line mr-1.5"></i>{t('mypage.phoneVerification')}</span>
                {phoneVerified && <span className="text-xs font-semibold text-green-600">{t('mypage.verificationComplete')}</span>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 mb-2">
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={e => setPhoneInput(e.target.value)}
                  placeholder="01012345678"
                  disabled={phoneVerified}
                  className="w-full rounded-lg border border-background-300 px-3 py-2 text-sm outline-none focus:border-primary-400 disabled:bg-background-100 disabled:text-foreground-400"
                />
                <button
                  onClick={handleSendPhone}
                  disabled={phoneSending || phoneVerified}
                  className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-bold text-background-50 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {phoneSending ? '...' : t('signup.sendCode')}
                </button>
              </div>
              {!phoneVerified && phoneInput && (
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={phoneCode}
                    onChange={e => setPhoneCode(e.target.value.replace(/\D/g, ''))}
                    placeholder={t('mypage.code6Placeholder')}
                    className="w-full rounded-lg border border-background-300 px-3 py-2 text-sm tracking-widest outline-none focus:border-primary-400"
                  />
                  <button
                    onClick={handleConfirmPhone}
                    disabled={phoneConfirming}
                    className="rounded-lg bg-green-500 px-4 py-2 text-sm font-bold text-background-50 hover:bg-green-600 disabled:opacity-50 transition-colors"
                  >
                    {phoneConfirming ? '...' : t('signup.verify')}
                  </button>
                </div>
              )}
              {phoneDevCode && (
                <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                  {t('mypage.devCodePrefix')} <span className="font-bold tracking-widest">{phoneDevCode}</span> {t('mypage.devCodeSuffixSms')}
                </p>
              )}
              {phoneMsg.text && (
                <p className={`mt-2 text-xs ${phoneMsg.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{phoneMsg.text}</p>
              )}
            </div>

            {/* Email verification form */}
            <div className="mt-3 rounded-xl border border-background-200/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-foreground-950"><i className="ri-mail-line mr-1.5"></i>{t('mypage.emailVerification')}</span>
                {emailVerified && <span className="text-xs font-semibold text-green-600">{t('mypage.verificationComplete')}</span>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 mb-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder="you@example.com"
                  disabled={emailVerified}
                  className="w-full rounded-lg border border-background-300 px-3 py-2 text-sm outline-none focus:border-primary-400 disabled:bg-background-100 disabled:text-foreground-400"
                />
                <button
                  onClick={handleSendEmail}
                  disabled={emailSending || emailVerified}
                  className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-bold text-background-50 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {emailSending ? '...' : t('signup.sendCode')}
                </button>
              </div>
              {!emailVerified && emailInput && (
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={emailCode}
                    onChange={e => setEmailCode(e.target.value.replace(/\D/g, ''))}
                    placeholder={t('mypage.code6Placeholder')}
                    className="w-full rounded-lg border border-background-300 px-3 py-2 text-sm tracking-widest outline-none focus:border-primary-400"
                  />
                  <button
                    onClick={handleConfirmEmail}
                    disabled={emailConfirming}
                    className="rounded-lg bg-green-500 px-4 py-2 text-sm font-bold text-background-50 hover:bg-green-600 disabled:opacity-50 transition-colors"
                  >
                    {emailConfirming ? '...' : t('signup.verify')}
                  </button>
                </div>
              )}
              {emailDevCode && (
                <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                  {t('mypage.devCodePrefix')} <span className="font-bold tracking-widest">{emailDevCode}</span> {t('mypage.devCodeSuffixSmtp')}
                </p>
              )}
              {emailMsg.text && (
                <p className={`mt-2 text-xs ${emailMsg.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{emailMsg.text}</p>
              )}
            </div>
          </div>

          {/* ─── Tabs: Deposit / Withdraw / History ─── */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setTab('deposit')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${tab === 'deposit' ? 'bg-primary-500 text-background-50' : 'bg-background-100 text-foreground-600 hover:bg-background-200'}`}>
              <i className="ri-arrow-down-circle-line mr-1.5"></i>{t('mypage.deposit')}
            </button>
            <button onClick={() => setTab('withdraw')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${tab === 'withdraw' ? 'bg-primary-500 text-background-50' : 'bg-background-100 text-foreground-600 hover:bg-background-200'}`}>
              <i className="ri-arrow-up-circle-line mr-1.5"></i>{t('mypage.withdraw')}
            </button>
            <button onClick={() => setTab('history')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${tab === 'history' ? 'bg-primary-500 text-background-50' : 'bg-background-100 text-foreground-600 hover:bg-background-200'}`}>
              <i className="ri-exchange-line mr-1.5"></i>{t('mypage.history')}
            </button>
          </div>

          {/* ─── Tab Content ─── */}
          {tab === 'deposit' && (
            <form onSubmit={handleDeposit} className="rounded-2xl border border-background-200/60 bg-background-50 p-5 md:p-6 space-y-5">
              <h3 className="text-lg font-bold text-foreground-950" style={{ fontFamily: 'var(--font-heading)' }}>
                <i className="ri-arrow-down-circle-line text-primary-500 mr-2"></i>{t('wallet.depositTitle')}
              </h3>
              <div>
                <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('wallet.depositUsdtAmount')}</label>
                <input name="usdtAmount" type="number" step="0.01" min="10" required className="w-full rounded-xl border border-background-300 px-4 py-3 text-sm outline-none focus:border-primary-400 transition-colors" placeholder={t('wallet.usdtMinPlaceholder')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('wallet.myUsdtWalletAddress')}</label>
                <input name="walletAddress" required className="w-full rounded-xl border border-background-300 px-4 py-3 text-sm font-mono outline-none focus:border-primary-400 transition-colors" placeholder={network === 'TRC-20' ? 'T...' : '0x...'} />
                <p className="mt-1.5 text-xs text-foreground-400">{network === 'TRC-20' ? t('mypage.trc20Hint') : t('mypage.erc20Hint')}</p>
              </div>
              <button type="submit" className="w-full rounded-xl bg-primary-500 py-3 text-sm font-bold text-background-50 hover:bg-primary-600 transition-colors">{t('wallet.depositRequest')}</button>
            </form>
          )}

          {tab === 'withdraw' && (
            <form onSubmit={handleWithdraw} className="rounded-2xl border border-background-200/60 bg-background-50 p-5 md:p-6 space-y-5">
              <h3 className="text-lg font-bold text-foreground-950" style={{ fontFamily: 'var(--font-heading)' }}>
                <i className="ri-arrow-up-circle-line text-primary-500 mr-2"></i>{t('wallet.withdrawTitle')}
              </h3>
              {(!phoneVerified || !emailVerified) && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-center gap-2">
                  <i className="ri-alert-line text-amber-500"></i>
                  <span className="text-xs text-amber-700">{t('mypage.verificationRequired')}</span>
                  <Link to="/mypage" className="text-xs font-semibold text-primary-600 ml-1">{t('mypage.verifyNow')}</Link>
                </div>
              )}
              {wallet && (
                <div className="rounded-xl border border-background-200/60 bg-background-50 p-3 flex items-center justify-between">
                  <span className="text-xs text-foreground-400">{t('mypage.withdrawableCash')}</span>
                  <span className="text-sm font-bold text-foreground-950">₩{wallet.withdrawableCash?.toLocaleString()}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('wallet.withdrawAmount')}</label>
                <input name="krwAmount" type="number" min="10000" required className="w-full rounded-xl border border-background-300 px-4 py-3 text-sm outline-none focus:border-primary-400 transition-colors" placeholder={t('wallet.krwMinPlaceholder')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('wallet.withdrawUsdtAddress')}</label>
                <input name="walletAddress" required className="w-full rounded-xl border border-background-300 px-4 py-3 text-sm font-mono outline-none focus:border-primary-400 transition-colors" placeholder={network === 'TRC-20' ? 'T...' : '0x...'} />
              </div>
              <button type="submit" disabled={!allVerified} className="w-full rounded-xl bg-primary-500 py-3 text-sm font-bold text-background-50 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{t('wallet.withdrawRequest')}</button>
            </form>
          )}

          {tab === 'history' && (
            <div className="rounded-2xl border border-background-200/60 bg-background-50 p-5 md:p-6">
              <h3 className="text-lg font-bold text-foreground-950 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                <i className="ri-exchange-line text-primary-500 mr-2"></i>{t('mypage.history')}
              </h3>
              {transactions.length === 0 ? (
                <p className="text-sm text-foreground-400 text-center py-8">{t('wallet.noTransactions')}</p>
              ) : (
                <div className="space-y-3">
                  {transactions.map(tx => (
                    <div key={tx.id} className="rounded-xl border border-background-200/60 bg-background-50 p-4 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-foreground-950">{tx.description || tx.type}</p>
                        <p className="text-xs text-foreground-400">{new Date(tx.created_at).toLocaleString()}</p>
                      </div>
                      <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>{tx.amount > 0 ? '+' : ''}{tx.amount?.toLocaleString()}{t('common.won')}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 text-center">
                <Link to="/wallet" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                  {t('mypage.viewAll')} <i className="ri-arrow-right-s-line"></i>
                </Link>
              </div>
            </div>
          )}

          {/* ─── Recent Orders ─── */}
          <div className="rounded-2xl border border-background-200/60 bg-background-50 p-5 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-foreground-950" style={{ fontFamily: 'var(--font-heading)' }}>{t('mypage.recentOrders')}</h3>
              <Link to="/transactions" className="text-xs text-primary-600 font-semibold hover:text-primary-700 transition-colors">{t('mypage.viewAll')}</Link>
            </div>
            {orders.length === 0 ? (
              <p className="text-sm text-foreground-400 text-center py-8">{t('mypage.noOrdersYet')}</p>
            ) : (
              <div className="space-y-3">
                {orders.map(o => (
                  <div key={o.id} className="flex justify-between items-center py-3 border-b border-background-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground-950">{o.card_name}</p>
                      <p className="text-xs text-foreground-400">{o.order_number} · {o.quantity}{t('mypage.sheets')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{o.total_price?.toLocaleString()}{t('common.won')}</p>
                      <span className={`text-[10px] font-medium ${o.status === 'completed' ? 'text-green-600' : o.status === 'pending' ? 'text-amber-600' : 'text-foreground-400'}`}>
                        {o.status === 'completed' ? t('mypage.completed') : o.status === 'pending' ? t('mypage.pending') : o.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ─── Quick Links ─── */}
          <div className="grid grid-cols-3 gap-4">
            <Link to="/wallet" className="rounded-xl border border-background-200/60 bg-background-50 p-4 flex items-center gap-3 hover:border-primary-200 transition-colors">
              <i className="ri-wallet-3-line text-xl text-primary-500"></i><span className="text-sm font-medium">{t('mypage.wallet')}</span>
            </Link>
            <Link to="/notifications" className="rounded-xl border border-background-200/60 bg-background-50 p-4 flex items-center gap-3 hover:border-secondary-200 transition-colors">
              <i className="ri-notification-3-line text-xl text-secondary-500"></i><span className="text-sm font-medium">{t('mypage.notifications')}</span>
            </Link>
            <Link to="/giftcards" className="rounded-xl border border-background-200/60 bg-background-50 p-4 flex items-center gap-3 hover:border-primary-200 transition-colors">
              <i className="ri-shopping-bag-3-line text-xl text-primary-500"></i><span className="text-sm font-medium">{t('mypage.giftcardPurchase')}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
