import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { giftcardApi, orderApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n';

const TABS = ['cardDetail.description', 'cardDetail.howToUse', 'cardDetail.notice'];

export default function CardDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  useEffect(() => {
    giftcardApi.getBySlug(slug).then(({ data }) => {
      setCard(data.card);
      if (data.card.variants?.length) setSelectedVariant(data.card.variants[0]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  const unitPrice = selectedVariant ? selectedVariant.priceNormal : 0;
  const totalPrice = unitPrice * quantity;

  const isVerified = user ? (user.phone_verified && user.email_verified) : false;
  const needsVerification = user && !isVerified;

  const todayPurchased = selectedVariant?.todayPurchased || 0;
  const dailyLimit = selectedVariant?.dailyLimit || 20;
  const remainingLimit = Math.max(0, dailyLimit - todayPurchased);
  const limitReached = todayPurchased >= dailyLimit;

  const cashBalance = user?.cash_balance || 0;
  const insufficientCash = totalPrice > cashBalance;

  const savings = selectedVariant ? (selectedVariant.faceValue - unitPrice) * quantity : 0;
  const totalFaceValue = selectedVariant ? selectedVariant.faceValue * quantity : 0;

  const handlePurchase = async () => {
    if (!user) { setShowAuthModal(true); return; }
    if (!isVerified) { setShowVerifyModal(true); return; }
    if (!selectedVariant) return;
    setPurchasing(true);
    setShowProcessing(true);
    try {
      const { data } = await orderApi.create({ variantId: selectedVariant.id, quantity, paymentMethod: 'usdt' });
      setShowProcessing(false);
      navigate(`/payment/${data.order.id}`);
    } catch (err) {
      setShowProcessing(false);
      alert(err.response?.data?.message || t('common.error'));
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) return <div className="min-h-screen pt-24 flex items-center justify-center text-foreground-400">{t('common.loading')}</div>;
  if (!card) return <div className="min-h-screen pt-24 flex items-center justify-center text-foreground-400">{t('common.notFound')}</div>;

  const regionKeyMap = {
    '중국': { '쇼핑': 'home.regionChina' },
    '글로벌': { '쇼핑': 'home.regionGlobalShopping', '여행/이동': 'home.regionGlobalTravel', '엔터테인먼트': 'home.regionGlobalEnt' },
    '동남아시아': { '쇼핑': 'home.regionSEA' },
  };
  const regionI18nKey = regionKeyMap[card.region]?.[card.category];

  return (
    <div className="min-h-screen bg-background-50 pt-24 pb-20">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-foreground-400 mb-6">
          <Link to="/" className="hover:text-primary-600 transition-colors">{t('nav.home')}</Link>
          <i className="ri-arrow-right-s-line text-xs"></i>
          <Link to="/giftcards" className="hover:text-primary-600 transition-colors">{t('nav.giftcards')}</Link>
          <i className="ri-arrow-right-s-line text-xs"></i>
          <span className="text-foreground-700">{card.name}</span>
        </nav>

        {/* Verification notice banner */}
        {needsVerification && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-center gap-3 mb-6">
            <i className="ri-error-warning-line text-amber-500"></i>
            <span className="text-sm text-amber-700">{t('cardDetail.verificationBanner')}</span>
            <Link to="/mypage" className="text-sm font-semibold text-primary-600 hover:text-primary-700">{t('cardDetail.verifyLink')}</Link>
          </div>
        )}

        {/* Trust badges row */}
        <div className="mt-6 flex flex-wrap gap-3">
          {[
            { icon: 'ri-coupon-3-fill', text: t('cardDetail.trustDiscount') },
            { icon: 'ri-flashlight-fill', text: t('cardDetail.trustInstant') },
            { icon: 'ri-shield-check-fill', text: t('cardDetail.trustRefund') },
            { icon: 'ri-customer-service-2-fill', text: t('cardDetail.trustConsult') },
          ].map((badge, i) => (
            <span key={i} className="rounded-full bg-primary-50 border border-primary-200/60 px-3 py-1.5 text-xs font-medium text-primary-700 flex items-center gap-1.5">
              <i className={badge.icon}></i>
              {badge.text}
            </span>
          ))}
        </div>

        {/* Hero + Purchase split */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-8 lg:gap-12 mt-6">
          {/* Left column */}
          <div>
            {/* Card visual mockup */}
            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.color_gradient} p-8 md:p-10`}>
              <div className="absolute inset-0 bg-gradient-to-t from-foreground-950/40 to-transparent"></div>
              <img alt={card.name} className="absolute inset-0 h-full w-full object-cover object-top opacity-20 mix-blend-overlay" src={card.image_url} />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-background-50/15 px-3 py-1 text-xs font-medium text-background-100/80 backdrop-blur-sm">
                    <i className={`${card.logo_icon}`}></i>{card.brand}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent-500/20 border border-accent-400/30 px-3 py-1 text-xs font-semibold text-accent-300 backdrop-blur-sm">
                    <i className="ri-coupon-3-fill text-[10px]"></i>{t('home.upTo')} {Math.max(...(card.variants?.map(v => v.discountNormal) || [0]))}%
                  </span>
                </div>
                <div className="mb-1 text-[10px] font-medium uppercase tracking-[0.12em] text-background-100/60">{regionI18nKey ? t(regionI18nKey) : `${card.region} · ${card.category}`}</div>
                <h1 className="text-3xl md:text-4xl font-bold text-background-50" style={{ fontFamily: 'var(--font-heading)' }}>{card.name}</h1>
                <p className="mt-3 text-sm text-background-100/70 max-w-lg">{card.tagline}</p>
              </div>
            </div>

            {/* Info tabs */}
            <div className="mt-8">
              <div className="flex border-b border-background-200/60">
                {TABS.map((tab, i) => (
                  <button key={i} onClick={() => setActiveTab(i)}
                    className={`px-5 py-3 text-sm font-semibold transition-colors relative ${activeTab === i ? 'text-primary-600' : 'text-foreground-400 hover:text-foreground-700'}`}>
                    {t(tab)}
                    {activeTab === i && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />}
                  </button>
                ))}
              </div>
              <div className="py-6">
                {activeTab === 0 && (
                  <div>
                    <p className="text-sm text-foreground-600 leading-relaxed">{card.description}</p>
                    {card.highlights?.length > 0 && (
                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {card.highlights.map((h, i) => (
                          <div key={i} className="flex items-center gap-2.5 rounded-xl border border-background-200/60 bg-background-50 p-3">
                            <i className="ri-check-double-line text-primary-500"></i>
                            <span className="text-sm text-foreground-700">{h}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 1 && (
                  <div>
                    <p className="text-sm text-foreground-600 leading-relaxed mb-4">{t('cardDetail.usageGuide', { name: card.name })}</p>
                    {card.how_to_use?.length > 0 ? (
                      <ol className="space-y-4">
                        {card.how_to_use.map((s, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-background-50 mt-0.5">{i + 1}</span>
                            <span className="text-sm text-foreground-600 leading-relaxed pt-1">{s}</span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-sm text-foreground-400">{t('cardDetail.howToUse')} - Coming soon</p>
                    )}
                  </div>
                )}
                {activeTab === 2 && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5 text-sm text-foreground-600"><i className="ri-error-warning-line text-amber-500 mt-0.5"></i>{t('cardDetail.noticeItems.limit')}</div>
                    <div className="flex items-start gap-2.5 text-sm text-foreground-600"><i className="ri-error-warning-line text-amber-500 mt-0.5"></i>{t('cardDetail.noticeItems.noRefund')}</div>
                    <div className="flex items-start gap-2.5 text-sm text-foreground-600"><i className="ri-error-warning-line text-amber-500 mt-0.5"></i>{t('cardDetail.noticeItems.expiry')}</div>
                    <div className="flex items-start gap-2.5 text-sm text-foreground-600"><i className="ri-error-warning-line text-amber-500 mt-0.5"></i>{t('cardDetail.noticeItems.ownAccount')}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column - Purchase panel */}
          <div>
            <div className="sticky top-24 rounded-2xl border border-background-200/60 bg-background-50 p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color_gradient} text-background-50`}><i className={`${card.logo_icon} text-lg`}></i></div>
                <div>
                  <h3 className="font-bold text-foreground-950">{card.name}</h3>
                  <p className="text-xs text-foreground-400">{card.brand}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-700 mb-2">{t('cardDetail.faceValue')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {card.variants?.map(v => {
                    const isPopular = v.popular || v.is_popular;
                    const isOutOfStock = v.stock === 0 || v.outOfStock;
                    const discount = v.discountNormal;
                    return (
                      <button key={v.id} onClick={() => { if (!isOutOfStock) { setSelectedVariant(v); setQuantity(1); } }}
                        className={`rounded-xl border p-3 text-left text-sm transition-all relative ${isOutOfStock ? 'opacity-50 cursor-not-allowed border-background-200' : selectedVariant?.id === v.id ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200/50' : 'border-background-200 hover:border-primary-200'}`}>
                        {isPopular && !isOutOfStock && (
                          <span className="absolute top-2 right-2 rounded-full bg-primary-500 px-2 py-0.5 text-[10px] font-bold text-background-50">{t('cardDetail.popular')}</span>
                        )}
                        {isOutOfStock && (
                          <span className="absolute top-2 right-2 rounded-full bg-foreground-400 px-2 py-0.5 text-[10px] font-bold text-background-50">{t('cardDetail.todayLimitExhausted')}</span>
                        )}
                        {discount >= 6 && !isOutOfStock && (
                          <span className="absolute top-2 left-2 rounded-full bg-accent-500 px-1.5 py-0.5 text-[9px] font-bold text-foreground-950">{t('cardDetail.popular')}</span>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">{v.faceValue.toLocaleString()}{t('common.won')}</span>
                          <span className="text-xs text-accent-600 font-bold">{discount}%</span>
                        </div>
                        <div className="mt-1 text-xs text-foreground-400">
                          <span className="line-through text-foreground-300">{v.priceNormal.toLocaleString()}{t('common.won')}</span>
                        </div>
                        <div className="mt-0.5 text-xs font-bold text-foreground-950">
                          {v.priceNormal.toLocaleString()}{t('common.won')}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-700 mb-2">{t('cardDetail.quantity')}</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 rounded-lg border border-background-200 flex items-center justify-center hover:bg-background-100 transition-colors"><i className="ri-subtract-line"></i></button>
                  <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(20, q + 1))} className="w-10 h-10 rounded-lg border border-background-200 flex items-center justify-center hover:bg-background-100 transition-colors"><i className="ri-add-line"></i></button>
                </div>
                {selectedVariant && (
                  <p className="mt-1 text-xs text-foreground-400">{t('cardDetail.todayPurchased', { purchased: todayPurchased, remaining: remainingLimit })}</p>
                )}
              </div>

              {/* Price breakdown */}
              <div className="border-t border-background-200/60 pt-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-foreground-500">{t('cardDetail.originalPrice')}</span><span className="text-foreground-400 line-through">{totalFaceValue.toLocaleString()}{t('common.won')}</span></div>
                <div className="flex justify-between text-sm"><span className="text-foreground-500">{t('cardDetail.faceValue')}</span><span className="font-semibold">{totalFaceValue.toLocaleString()}{t('common.won')}</span></div>
                <div className="flex justify-between text-sm"><span className="text-foreground-500">{t('cardDetail.unitPrice')}</span><span className="font-semibold">{unitPrice.toLocaleString()}{t('common.won')}</span></div>
                <div className="flex justify-between text-sm"><span className="text-foreground-500">{t('cardDetail.quantity')}</span><span>{t('cardDetail.sheets', { n: quantity })}</span></div>
                <div className="flex justify-between text-sm text-accent-600"><span>{t('cardDetail.savings', { n: '' })}</span><span className="font-bold">{savings.toLocaleString()}{t('common.won')}</span></div>
                <div className="flex justify-between mt-3 pt-3 border-t border-background-200/60">
                  <span className="font-bold text-foreground-950">{t('cardDetail.totalPrice')}</span>
                  <span className="text-xl font-bold text-primary-600">{totalPrice.toLocaleString()}{t('common.won')}</span>
                </div>
              </div>

              {/* Cash balance display */}
              {user && (
                <div className="rounded-xl border border-background-200/60 bg-background-50 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <i className="ri-wallet-3-line text-foreground-500"></i>
                    <span className="text-sm text-foreground-600">{t('cardDetail.cashBalance')}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${insufficientCash ? 'text-red-500' : 'text-foreground-950'}`}>{cashBalance.toLocaleString()}{t('common.won')}</span>
                    {insufficientCash && (
                      <span className="block text-xs text-red-500">{t('cardDetail.insufficientCash')}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Charge cash link */}
              {user && insufficientCash && (
                <Link to="/wallet" className="block text-center text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                  {t('cardDetail.chargeCash')}
                </Link>
              )}

              {/* Purchase button - different states */}
              {!user ? (
                <button onClick={() => setShowAuthModal(true)}
                  className="group relative w-full overflow-hidden rounded-xl bg-primary-500 py-4 text-sm font-bold text-background-50 hover:bg-primary-600 transition-colors flex items-center justify-center gap-2">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-background-50/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <i className="ri-shopping-cart-2-line relative z-10"></i>
                  <span className="relative z-10">{t('cardDetail.purchase')}</span>
                </button>
              ) : !isVerified ? (
                <button onClick={() => setShowVerifyModal(true)}
                  className="w-full rounded-xl bg-amber-500 py-4 text-sm font-bold text-background-50 hover:bg-amber-600 transition-colors flex items-center justify-center gap-2">
                  <i className="ri-shield-check-line"></i>
                  <span>{t('cardDetail.verificationRequired')}</span>
                </button>
              ) : limitReached ? (
                <button disabled
                  className="w-full rounded-xl bg-foreground-300 py-4 text-sm font-bold text-background-50 cursor-not-allowed flex items-center justify-center gap-2">
                  <i className="ri-time-line"></i>
                  <span>{t('cardDetail.limitExhausted')}</span>
                </button>
              ) : (
                <button onClick={handlePurchase} disabled={!selectedVariant || purchasing}
                  className="group relative w-full overflow-hidden rounded-xl bg-primary-500 py-4 text-sm font-bold text-background-50 hover:bg-primary-600 disabled:opacity-60 transition-colors flex flex-col items-center justify-center gap-0.5">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-background-50/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <div className="flex items-center gap-2 relative z-10">
                    <i className="ri-shopping-cart-2-line"></i>
                    <span>{purchasing ? t('cardDetail.creatingOrder') : t('cardDetail.purchase')}</span>
                  </div>
                  <span className="relative z-10 text-[10px] font-normal text-background-50/80">{t('cardDetail.purchaseSubtitle')}</span>
                </button>
              )}

              {!user && (
                <p className="text-xs text-center text-foreground-400">
                  {t('cardDetail.loginRequired').split(t('nav.login'))[0]}
                  <Link to="/login" className="text-primary-600 font-semibold">{t('nav.login')}</Link>
                  {t('cardDetail.loginRequired').split(t('nav.login'))[1]}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Auth modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-foreground-950/60 backdrop-blur-sm" onClick={() => setShowAuthModal(false)}></div>
          <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl bg-background-50 border border-background-200/60 p-8 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100">
                <i className="ri-lock-line text-2xl text-primary-600"></i>
              </div>
              <h2 className="text-xl font-bold text-foreground-950 mb-2">{t('cardDetail.loginRequiredTitle')}</h2>
              <p className="text-sm text-foreground-500 mb-6">{t('cardDetail.loginRequiredDesc')}</p>
              <div className="space-y-3">
                <Link to="/login" className="block w-full rounded-xl bg-primary-500 py-3 text-sm font-bold text-background-50 hover:bg-primary-600 transition-colors text-center">{t('nav.login')}</Link>
                <Link to="/signup" className="block w-full rounded-xl border border-primary-200 bg-primary-50 py-3 text-sm font-bold text-primary-600 hover:bg-primary-100 transition-colors text-center">{t('nav.signup')}</Link>
              </div>
              <button onClick={() => setShowAuthModal(false)} className="mt-4 text-sm text-foreground-400 hover:text-foreground-600 transition-colors">{t('cardDetail.loginLater')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Verification modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-foreground-950/60 backdrop-blur-sm" onClick={() => setShowVerifyModal(false)}></div>
          <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl bg-background-50 border border-background-200/60 p-8 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
                <i className="ri-shield-check-line text-2xl text-amber-600"></i>
              </div>
              <h2 className="text-xl font-bold text-foreground-950 mb-2">{t('cardDetail.verificationRequired')}</h2>
              <p className="text-sm text-foreground-500 mb-4">{t('cardDetail.verificationDesc')}</p>

              {/* Verification status list */}
              <div className="space-y-2 mb-4 text-left">
                <div className="flex items-center justify-between rounded-xl border border-background-200/60 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <i className={`text-lg ${user?.phone_verified ? 'ri-checkbox-circle-fill text-green-500' : 'ri-close-circle-fill text-red-400'}`}></i>
                    <span className="text-sm font-medium text-foreground-700">{t('cardDetail.phoneVerified')}</span>
                  </div>
                  <span className={`text-xs font-semibold ${user?.phone_verified ? 'text-green-600' : 'text-red-500'}`}>{user?.phone_verified ? t('cardDetail.verified') : t('cardDetail.unverified')}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-background-200/60 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <i className={`text-lg ${user?.email_verified ? 'ri-checkbox-circle-fill text-green-500' : 'ri-close-circle-fill text-red-400'}`}></i>
                    <span className="text-sm font-medium text-foreground-700">{t('cardDetail.emailVerified')}</span>
                  </div>
                  <span className={`text-xs font-semibold ${user?.email_verified ? 'text-green-600' : 'text-red-500'}`}>{user?.email_verified ? t('cardDetail.verified') : t('cardDetail.unverified')}</span>
                </div>
              </div>

              {/* PIN notice */}
              {user?.email && (
                <p className="text-xs text-foreground-400 mb-4 text-left">{t('cardDetail.emailPinNotice', { email: user.email })}</p>
              )}

              <Link to="/mypage" className="block w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-background-50 hover:bg-amber-600 transition-colors text-center">{t('cardDetail.goVerify')}</Link>
              <button onClick={() => setShowVerifyModal(false)} className="mt-3 text-sm text-foreground-400 hover:text-foreground-600 transition-colors">{t('cardDetail.loginLater')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Processing Modal */}
      {showProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-foreground-950/80 backdrop-blur-sm"></div>
          <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl bg-background-50 border border-background-200/60 p-8 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100">
                <i className="ri-shield-check-line text-2xl text-primary-600 animate-spin"></i>
              </div>
              <h2 className="text-xl font-bold text-foreground-950 mb-6">{t('cardDetail.processingTitle')}</h2>
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3 rounded-xl border border-background-200/60 px-4 py-3">
                  <i className="ri-check-line text-lg text-green-500"></i>
                  <span className="text-sm font-medium text-foreground-700">{t('cardDetail.processingStep1')}</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-background-200/60 px-4 py-3">
                  <i className="ri-check-line text-lg text-green-500"></i>
                  <span className="text-sm font-medium text-foreground-700">{t('cardDetail.processingStep2')}</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-background-200/60 px-4 py-3">
                  <i className="ri-loader-4-line text-lg text-primary-500 animate-spin"></i>
                  <span className="text-sm font-medium text-foreground-700">{t('cardDetail.processingStep3')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && orderResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-foreground-950/80 backdrop-blur-sm"></div>
          <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl bg-background-50 border border-background-200/60 p-8 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500">
                <i className="ri-check-line text-2xl text-background-50"></i>
              </div>
              <h2 className="text-xl font-bold text-foreground-950 mb-4">{t('cardDetail.orderComplete')}</h2>
              <div className="space-y-2 text-left text-sm mb-4">
                <div className="flex justify-between px-1 py-1.5">
                  <span className="text-foreground-500">{t('cardDetail.orderNumber')}</span>
                  <span className="font-semibold text-foreground-950">{orderResult.order_number}</span>
                </div>
                <div className="flex justify-between px-1 py-1.5">
                  <span className="text-foreground-500">{t('cardDetail.paymentAmount')}</span>
                  <span className="font-semibold text-foreground-950">{totalPrice.toLocaleString()}{t('common.won')}</span>
                </div>
                <div className="flex justify-between px-1 py-1.5">
                  <span className="text-foreground-500">{t('cardDetail.paymentMethod')}</span>
                  <span className="font-semibold text-foreground-950">{t('cardDetail.giftwayCash')}</span>
                </div>
                <div className="flex justify-between px-1 py-1.5">
                  <span className="text-foreground-500">{t('cardDetail.transactionTime')}</span>
                  <span className="font-semibold text-foreground-950">{new Date().toLocaleString()}</span>
                </div>
                <div className="flex justify-between px-1 py-1.5">
                  <span className="text-foreground-500">{t('cardDetail.product')}</span>
                  <span className="font-semibold text-foreground-950">{card.name} {selectedVariant?.faceValue?.toLocaleString()}{t('common.won')}</span>
                </div>
                <div className="flex justify-between px-1 py-1.5">
                  <span className="text-foreground-500">{t('cardDetail.pinDispatch')}</span>
                  <span className="font-semibold text-foreground-950">{t('cardDetail.pinDispatchDetail')}</span>
                </div>
              </div>
              <div className="rounded-xl bg-blue-50 border border-blue-200/60 p-3 mb-6">
                <p className="text-xs text-blue-600">{t('cardDetail.orderEmailNotice')}</p>
              </div>
              <div className="space-y-3">
                <button onClick={() => { setShowSuccess(false); navigate('/transactions'); }}
                  className="w-full rounded-xl bg-primary-500 py-3 text-sm font-bold text-background-50 hover:bg-primary-600 transition-colors">
                  {t('cardDetail.confirm')}
                </button>
                <button onClick={() => { setShowSuccess(false); navigate('/transactions'); }}
                  className="w-full rounded-xl border border-primary-200 bg-primary-50 py-3 text-sm font-bold text-primary-600 hover:bg-primary-100 transition-colors">
                  {t('cardDetail.viewTransactions')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Checkout Bar (mobile only) */}
      {user && selectedVariant && (
        <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background-50/95 backdrop-blur-md border-t border-background-200/60 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 mr-3">
              <p className="text-sm font-semibold text-foreground-950 truncate">{card.name}</p>
              <p className="text-xs text-foreground-400">{unitPrice.toLocaleString()}{t('common.won')} x {quantity}</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-base font-bold text-primary-600">{totalPrice.toLocaleString()}{t('common.won')}</span>
                {savings > 0 && <span className="text-[10px] font-semibold text-accent-600">{t('cardDetail.savings', { n: '' })} {savings.toLocaleString()}{t('common.won')}</span>}
              </div>
            </div>
            {!isVerified ? (
              <button onClick={() => setShowVerifyModal(true)}
                className="flex-shrink-0 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-background-50 hover:bg-amber-600 transition-colors flex items-center gap-1.5">
                <i className="ri-shield-check-line"></i>
                <span>{t('cardDetail.verificationRequired')}</span>
              </button>
            ) : limitReached ? (
              <button disabled
                className="flex-shrink-0 rounded-xl bg-foreground-300 px-5 py-3 text-sm font-bold text-background-50 cursor-not-allowed flex items-center gap-1.5">
                <i className="ri-time-line"></i>
                <span>{t('cardDetail.limitExhausted')}</span>
              </button>
            ) : (
              <button onClick={handlePurchase} disabled={purchasing}
                className="flex-shrink-0 rounded-xl bg-primary-500 px-5 py-3 text-sm font-bold text-background-50 hover:bg-primary-600 disabled:opacity-60 transition-colors flex items-center gap-1.5">
                <i className="ri-shopping-cart-2-line"></i>
                <span>{purchasing ? t('cardDetail.creatingOrder') : t('cardDetail.purchase')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
