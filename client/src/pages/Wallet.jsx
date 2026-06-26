import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n';
import { walletApi } from '../api';

export default function Wallet() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [tab, setTab] = useState('deposit');
  const [network, setNetwork] = useState('TRC-20');
  const [depositAddress, setDepositAddress] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [changingNetwork, setChangingNetwork] = useState(false);

  useEffect(() => {
    if (!user) return;
    walletApi.getWallet().then(({ data }) => setWallet(data)).catch(() => {});
    walletApi.getTransactions({ limit: 20 }).then(({ data }) => setTransactions(data.transactions)).catch(() => {});
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
      walletApi.getTransactions({ limit: 20 }).then(({ data }) => setTransactions(data.transactions || []));
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
      walletApi.getTransactions({ limit: 20 }).then(({ data }) => setTransactions(data.transactions || []));
      setTab('history');
    } catch (err) { alert(err.response?.data?.message || t('wallet.withdrawRequestFailed')); }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-lock-line text-4xl text-foreground-300 mb-3 block"></i>
          <p className="text-foreground-400 mb-4">{t('wallet.loginRequired')}</p>
          <Link to="/login" className="rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-bold text-background-50 hover:bg-primary-600 transition-colors">{t('nav.login')}</Link>
        </div>
      </div>
    );
  }

  const exchangeRate = wallet?.exchangeRate || 1380;

  return (
    <div className="min-h-screen bg-background-50">
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f1a2e] via-[#132236] to-[#0a1220]">
        <img
          src="https://readdy.ai/api/search-image?query=Cool%20toned%20premium%20fintech%20dashboard%20background%20with%20subtle%20geometric%20grid%20lines%20and%20soft%20teal%20emerald%20accent%20glow%20elements%2C%20sleek%20modern%20banking%20interface%20atmosphere%2C%20deep%20navy%20charcoal%20gradient%20backdrop%2C%20sophisticated%20crypto%20wallet%20visual%20theme%2C%20clean%20minimal%20lines%2C%20luxury%20financial%20aesthetic%2C%20high-end%20dark%20mode%20UI%20feel%2C%20soft%20cyan%20ambient%20light&width=1600&height=350&seq=wallet-hero-bg-v3&orientation=landscape"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-top opacity-28 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f1a2e]/50 to-[#0a1220]"></div>

        <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-10 pt-32 pb-16 md:pt-40 md:pb-20">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-background-100/50">
            <Link to="/" className="transition-colors hover:text-background-100"><i className="ri-home-4-line"></i></Link>
            <i className="ri-arrow-right-s-line text-xs"></i>
            <span className="text-background-100/80">{t('nav.wallet')}</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-background-50" style={{ fontFamily: 'var(--font-heading)' }}>
            {t('nav.wallet')}
          </h1>
          <p className="mt-3 text-sm md:text-base text-background-100/70">
            {t('wallet.heroSubtitle')}
          </p>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-background-300/50 to-transparent" />

      {/* Network Change Processing Overlay */}
      {changingNetwork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 rounded-2xl bg-background-50 p-8 text-center">
            <i className="ri-exchange-line text-4xl text-primary-500 animate-spin block mb-4"></i>
            <h3 className="text-lg font-bold text-foreground-950 mb-2">{t('wallet.changingNetwork')}</h3>
            <p className="text-sm text-foreground-500">{t('wallet.switchingTo', { from: network === 'TRC-20' ? 'ERC-20' : 'TRC-20', to: network })}</p>
          </div>
        </div>
      )}

      {/* ═══ MAIN CONTENT ═══ */}
      <section className="bg-background-50 py-10 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 space-y-8">

          {/* ─── Balance Card ─── */}
          {wallet && (
            <div className="rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 p-6 md:p-8 text-background-50">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-background-100/70">{t('wallet.cashBalance')}</p>
                  <p className="mt-1 text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>₩{wallet.cashBalance?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-background-100/70">{t('wallet.withdrawable')}</p>
                  <p className="mt-1 text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>₩{wallet.withdrawableCash?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-background-100/70">{t('wallet.exchangeRate')}</p>
                  <p className="mt-1 text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{wallet.exchangeRate?.toLocaleString()} KRW/USDT</p>
                </div>
              </div>
            </div>
          )}

          {/* ─── Network Selector ─── */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (network !== 'TRC-20') {
                  setChangingNetwork(true);
                  setTimeout(() => {
                    setNetwork('TRC-20');
                    setDepositAddress('');
                    setWithdrawAddress('');
                    setChangingNetwork(false);
                  }, 1000);
                }
              }}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                network === 'TRC-20'
                  ? 'bg-primary-500 text-background-50 shadow-sm'
                  : 'bg-background-100 text-foreground-600 hover:bg-background-200'
              }`}
            >
              <i className="ri-tron-line mr-1.5"></i>TRC-20
            </button>
            <button
              onClick={() => {
                if (network !== 'ERC-20') {
                  setChangingNetwork(true);
                  setTimeout(() => {
                    setNetwork('ERC-20');
                    setDepositAddress('');
                    setWithdrawAddress('');
                    setChangingNetwork(false);
                  }, 1000);
                }
              }}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                network === 'ERC-20'
                  ? 'bg-primary-500 text-background-50 shadow-sm'
                  : 'bg-background-100 text-foreground-600 hover:bg-background-200'
              }`}
            >
              <i className="ri-ethereum-line mr-1.5"></i>ERC-20
            </button>
            <span className="text-xs text-foreground-400 ml-2">
              {network === 'TRC-20' ? t('wallet.tronNetwork') : t('wallet.ethereumNetwork')}
            </span>
          </div>

          {/* ─── Verification Status Bar ─── */}
          <div className="rounded-2xl border border-background-200/60 bg-background-50 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Phone */}
              <div className="flex items-center gap-2.5">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${user?.phone_verified ? 'bg-green-100 text-green-600' : 'bg-background-100 text-foreground-300'}`}>
                  <i className={`${user?.phone_verified ? 'ri-check-line' : 'ri-close-line'} text-sm`}></i>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground-950">{t('wallet.phoneVerification')}</p>
                  <p className={`text-[11px] ${user?.phone_verified ? 'text-green-600' : 'text-foreground-400'}`}>{user?.phone_verified ? t('wallet.verified') : t('wallet.unverified')}</p>
                </div>
              </div>
              {/* Email */}
              <div className="flex items-center gap-2.5">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${user?.email_verified ? 'bg-green-100 text-green-600' : 'bg-background-100 text-foreground-300'}`}>
                  <i className={`${user?.email_verified ? 'ri-check-line' : 'ri-close-line'} text-sm`}></i>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground-950">{t('wallet.emailVerification')}</p>
                  <p className={`text-[11px] ${user?.email_verified ? 'text-green-600' : 'text-foreground-400'}`}>{user?.email_verified ? t('wallet.verified') : t('wallet.unverified')}</p>
                </div>
              </div>
              {/* Wallet */}
              <div className="flex items-center gap-2.5">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${user?.wallet_verified ? 'bg-green-100 text-green-600' : 'bg-background-100 text-foreground-300'}`}>
                  <i className={`${user?.wallet_verified ? 'ri-check-line' : 'ri-close-line'} text-sm`}></i>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground-950">{t('wallet.walletVerification')}</p>
                  <p className={`text-[11px] ${user?.wallet_verified ? 'text-green-600' : 'text-foreground-400'}`}>{user?.wallet_verified ? t('wallet.verified') : t('wallet.unverified')}</p>
                </div>
              </div>
            </div>
            {!user?.phone_verified || !user?.email_verified ? (
              <div className="mt-3 flex items-center gap-2 text-xs text-amber-600">
                <i className="ri-alert-line"></i>
                <span>{t('wallet.verificationRequired')}</span>
                <Link to="/mypage" className="font-semibold text-primary-600 hover:text-primary-700 ml-1">{t('wallet.goVerify')}</Link>
              </div>
            ) : null}
          </div>

          {/* ─── Grid Layout: Main + Sidebar ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Main content - Left */}
            <div className="lg:col-span-3 space-y-8">

              {/* ─── Tabs ─── */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setTab('deposit')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${tab === 'deposit' ? 'bg-primary-500 text-background-50' : 'bg-background-100 text-foreground-600 hover:bg-background-200'}`}
                >
                  <i className="ri-arrow-down-circle-line mr-1.5"></i>{t('wallet.deposit')}
                </button>
                <button
                  onClick={() => setTab('withdraw')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${tab === 'withdraw' ? 'bg-primary-500 text-background-50' : 'bg-background-100 text-foreground-600 hover:bg-background-200'}`}
                >
                  <i className="ri-arrow-up-circle-line mr-1.5"></i>{t('wallet.withdraw')}
                </button>
                <button
                  onClick={() => setTab('history')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${tab === 'history' ? 'bg-primary-500 text-background-50' : 'bg-background-100 text-foreground-600 hover:bg-background-200'}`}
                >
                  <i className="ri-exchange-line mr-1.5"></i>{t('wallet.transactionHistory')}
                </button>
              </div>

              {/* ─── Deposit Form ─── */}
              {tab === 'deposit' && (
                <form onSubmit={handleDeposit} className="rounded-2xl border border-background-200/60 bg-background-50 p-5 md:p-6 space-y-5">
                  <h3 className="text-lg font-bold text-foreground-950" style={{ fontFamily: 'var(--font-heading)' }}>
                    <i className="ri-arrow-down-circle-line text-primary-500 mr-2"></i>{t('wallet.depositTitle')}
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('wallet.depositUsdtAmount')}</label>
                    <input name="usdtAmount" type="number" step="0.01" min="10" required className="w-full rounded-xl border border-background-300 px-4 py-3 text-sm outline-none focus:border-primary-400 transition-colors" placeholder={t('wallet.usdtMinPlaceholder')} />
                    <p className="mt-1.5 text-xs text-foreground-400">
                      {t('mypage.depositExample', { usdt: '10', krw: Math.round(10 * exchangeRate).toLocaleString() })}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('wallet.myUsdtWalletAddress')}</label>
                    <input name="walletAddress" required value={depositAddress} onChange={e => setDepositAddress(e.target.value)} className="w-full rounded-xl border border-background-300 px-4 py-3 text-sm font-mono outline-none focus:border-primary-400 transition-colors" placeholder={network === 'TRC-20' ? 'T...' : '0x...'} />
                    <p className="mt-1.5 text-xs text-foreground-400">
                      {network === 'TRC-20' ? t('mypage.trc20Hint') : t('mypage.erc20Hint')}
                    </p>
                  </div>
                  <button type="submit" className="w-full rounded-xl bg-primary-500 py-3 text-sm font-bold text-background-50 hover:bg-primary-600 transition-colors">{t('wallet.depositRequest')}</button>
                </form>
              )}

              {/* ─── Withdraw Form ─── */}
              {tab === 'withdraw' && (
                <form onSubmit={handleWithdraw} className="rounded-2xl border border-background-200/60 bg-background-50 p-5 md:p-6 space-y-5">
                  <h3 className="text-lg font-bold text-foreground-950" style={{ fontFamily: 'var(--font-heading)' }}>
                    <i className="ri-arrow-up-circle-line text-primary-500 mr-2"></i>{t('wallet.withdrawTitle')}
                  </h3>
                  {(!user?.phone_verified || !user?.email_verified) && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-center gap-2">
                      <i className="ri-alert-line text-amber-500"></i>
                      <span className="text-xs text-amber-700">{t('mypage.verificationRequired')}</span>
                      <Link to="/mypage" className="text-xs font-semibold text-primary-600 ml-1">{t('mypage.verifyNow')}</Link>
                    </div>
                  )}
                  {wallet && (
                    <div className="rounded-xl bg-background-100 p-3 flex justify-between items-center">
                      <span className="text-xs text-foreground-500">{t('wallet.withdrawableAmount')}</span>
                      <span className="text-sm font-bold text-foreground-950">₩{wallet.withdrawableCash?.toLocaleString()}</span>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('wallet.withdrawAmount')}</label>
                    <input name="krwAmount" type="number" min="10000" required className="w-full rounded-xl border border-background-300 px-4 py-3 text-sm outline-none focus:border-primary-400 transition-colors" placeholder={t('wallet.krwMinPlaceholder')} />
                    <p className="mt-1.5 text-xs text-foreground-400">
                      {t('mypage.withdrawExample', { krw: '100,000', usdt: Math.round(100000 / exchangeRate * 100) / 100 })}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('wallet.withdrawUsdtAddress')}</label>
                    <input name="walletAddress" required value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} className="w-full rounded-xl border border-background-300 px-4 py-3 text-sm font-mono outline-none focus:border-primary-400 transition-colors" placeholder={network === 'TRC-20' ? 'T...' : '0x...'} />
                    <p className="mt-1.5 text-xs text-foreground-400">
                      {network === 'TRC-20' ? t('mypage.trc20Hint') : t('mypage.erc20Hint')}
                    </p>
                  </div>
                  <button type="submit" className="w-full rounded-xl bg-primary-500 py-3 text-sm font-bold text-background-50 hover:bg-primary-600 transition-colors">{t('wallet.withdrawRequest')}</button>
                </form>
              )}

              {/* ─── Transaction History ─── */}
              {tab === 'history' && (
                <div className="rounded-2xl border border-background-200/60 bg-background-50 p-5 md:p-6">
                  <h3 className="text-lg font-bold text-foreground-950 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                    <i className="ri-exchange-line text-primary-500 mr-2"></i>{t('wallet.transactionHistory')}
                  </h3>
                  {transactions.length === 0 ? (
                    <p className="text-sm text-foreground-400 text-center py-8">{t('wallet.noTransactions')}</p>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map(tx => (
                        <div key={tx.id} className="rounded-xl border border-background-200/60 bg-background-50 p-4 flex justify-between items-center hover:border-primary-200/60 transition-colors">
                          <div>
                            <p className="text-sm font-medium text-foreground-950">{tx.description || tx.type}</p>
                            <p className="text-xs text-foreground-400">{new Date(tx.created_at).toLocaleString()}</p>
                          </div>
                          <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>{tx.amount > 0 ? '+' : ''}{tx.amount?.toLocaleString()}{t('common.won')}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar - Right */}
            <div className="lg:col-span-2 space-y-6">
              {/* Exchange Rate Card */}
              <div className="rounded-2xl border border-background-200/60 bg-background-50 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <i className="ri-exchange-line text-primary-500"></i>
                  <h4 className="text-sm font-bold text-foreground-950">{t('wallet.realTimeRate')}</h4>
                </div>
                <div className="text-2xl font-bold text-foreground-950" style={{ fontFamily: 'var(--font-heading)' }}>
                  {exchangeRate?.toLocaleString()} <span className="text-sm font-normal text-foreground-400">KRW/USDT</span>
                </div>
                <p className="text-[10px] text-foreground-300 mt-1">{t('wallet.rateSource', { time: new Date().toLocaleTimeString() })}</p>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-foreground-400">10 USDT</span>
                    <span className="font-medium">{(10 * exchangeRate).toLocaleString()} {t('common.won')}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-foreground-400">100 USDT</span>
                    <span className="font-medium">{(100 * exchangeRate).toLocaleString()} {t('common.won')}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-foreground-400">1,000 USDT</span>
                    <span className="font-medium">{(1000 * exchangeRate).toLocaleString()} {t('common.won')}</span>
                  </div>
                </div>
              </div>

              {/* Usage Guide */}
              <div className="rounded-2xl border border-background-200/60 bg-background-50 p-5">
                <h4 className="text-sm font-bold text-foreground-950 mb-3">{t('wallet.usageGuide')}</h4>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2 text-xs text-foreground-500">
                    <i className="ri-check-line text-green-500 mt-0.5 flex-shrink-0"></i>
                    <span>{t('wallet.guide1')}</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-foreground-500">
                    <i className="ri-check-line text-green-500 mt-0.5 flex-shrink-0"></i>
                    <span>{t('wallet.guide2')}</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-foreground-500">
                    <i className="ri-check-line text-green-500 mt-0.5 flex-shrink-0"></i>
                    <span>{t('wallet.guide3')}</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-foreground-500">
                    <i className="ri-check-line text-green-500 mt-0.5 flex-shrink-0"></i>
                    <span>{t('wallet.guide4')}</span>
                  </li>
                </ul>
              </div>

              {/* Balance Summary (dark card) */}
              {wallet && (
                <div className="rounded-2xl bg-foreground-900 p-5 text-background-50">
                  <h4 className="text-sm font-bold mb-4">{t('wallet.balanceSummary')}</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-background-100/60">{t('wallet.wayCash')}</span>
                      <span className="text-sm font-semibold">₩{wallet.cashBalance?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-background-100/60">{t('wallet.giftedCash')}</span>
                      <span className="text-sm font-semibold text-amber-400">{t('wallet.nonWithdrawable')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-background-100/60">{t('wallet.withdrawableCashLabel')}</span>
                      <span className="text-sm font-semibold">₩{wallet.withdrawableCash?.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-background-50/10 pt-3 flex justify-between items-center">
                      <span className="text-xs text-background-100/60">{t('wallet.usdtEquivalent')}</span>
                      <span className="text-sm font-bold text-primary-400">{wallet.withdrawableCash ? (wallet.withdrawableCash / exchangeRate).toFixed(2) : '0.00'} USDT</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
