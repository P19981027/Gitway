import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { AnimatedSection } from '../components/base/AnimatedSection';

const FAQ_CATEGORY_KEYS = ['all', 'purchase', 'issue', 'security', 'guide'];

const PAGES = {
  faq: {
    titleKey: 'static.faq',
    sections: [
      { qKey: 'static.faq1Q', aKey: 'static.faq1A', category: 'purchase' },
      { qKey: 'static.faq2Q', aKey: 'static.faq2A', category: 'purchase' },
      { qKey: 'static.faq3Q', aKey: 'static.faq3A', category: 'issue' },
      { qKey: 'static.faq4Q', aKey: 'static.faq4A', category: 'guide' },
      { qKey: 'static.faq5Q', aKey: 'static.faq5A', category: 'purchase' },
      { qKey: 'static.faq6Q', aKey: 'static.faq6A', category: 'guide' },
      { qKey: 'static.faq7Q', aKey: 'static.faq7A', category: 'purchase' },
    ],
  },
  guide: { titleKey: 'static.guide', sections: [] },
  refund: { titleKey: 'static.refundPolicy', sections: [] },
  safe: { titleKey: 'static.safeTrading', sections: [] },
};

const HERO_IMAGES = {
  faq: 'https://readdy.ai/api/search-image?query=Warm%20paper%20textured%20knowledge%20library%20background%20with%20subtle%20book%20spine%20silhouettes%20and%20soft%20cream%20parchment%20glow%2C%20elegant%20learning%20atmosphere%2C%20sophisticated%20editorial%20research%20feel%2C%20gentle%20warm%20sepia%20ambient%20light%2C%20premium%20customer%20support%20visual%20theme%2C%20clean%20modern%20composition%2C%20rich%20depth%2C%20minimal%20scholarly%20aesthetic&width=1600&height=450&seq=faq-hero-bg-v3&orientation=landscape',
  guide: 'https://readdy.ai/api/search-image?query=Elegant%20warm%20golden%20light%20gradient%20background%20with%20subtle%20geometric%20network%20patterns%2C%20refined%20luxury%20texture%2C%20premium%20business%20atmosphere%2C%20soft%20amber%20glow%20accents%2C%20sophisticated%20editorial%20style%2C%20clean%20modern%20professional%20aesthetic%2C%20deep%20charcoal%20with%20warm%20gold%20highlights&width=1600&height=450&seq=guide-hero-2026-v1&orientation=landscape',
  refund: 'https://readdy.ai/api/search-image?query=Elegant%20warm%20bronze%20golden%20gradient%20background%20with%20subtle%20geometric%20circular%20patterns%2C%20refined%20luxury%20texture%2C%20premium%20legal%20document%20aesthetic%2C%20soft%20warm%20glow%20accents%2C%20sophisticated%20editorial%20style%2C%20clean%20modern%20professional%20atmosphere%2C%20deep%20espresso%20with%20warm%20metallic%20highlights&width=1600&height=450&seq=refund-hero-2026-v1&orientation=landscape',
  safe: 'https://readdy.ai/api/search-image?query=Elegant%20warm%20dark%20background%20with%20subtle%20shield%20pattern%20and%20golden%20security%20lock%20motifs%2C%20refined%20premium%20protection%20concept%2C%20soft%20warm%20amber%20glow%2C%20sophisticated%20corporate%20security%20aesthetic%2C%20clean%20modern%20professional%20atmosphere%2C%20deep%20charcoal%20with%20warm%20metallic%20gold%20accents%2C%20trust%20and%20safety%20visual%20theme&width=1600&height=450&seq=safe-hero-2026-v1&orientation=landscape',
};

const GUIDE_STEPS = [
  { icon: 'ri-user-add-fill', titleKey: 'static.guideStep1Title', descKey: 'static.guideStep1Desc', detailKeys: ['static.guideStep1D1', 'static.guideStep1D2', 'static.guideStep1D3'] },
  { icon: 'ri-shopping-bag-3-fill', titleKey: 'static.guideStep2Title', descKey: 'static.guideStep2Desc', detailKeys: ['static.guideStep2D1', 'static.guideStep2D2', 'static.guideStep2D3'] },
  { icon: 'ri-bank-card-fill', titleKey: 'static.guideStep3Title', descKey: 'static.guideStep3Desc', detailKeys: ['static.guideStep3D1', 'static.guideStep3D2'] },
  { icon: 'ri-exchange-dollar-fill', titleKey: 'static.guideStep4Title', descKey: 'static.guideStep4Desc', detailKeys: ['static.guideStep4D1', 'static.guideStep4D2', 'static.guideStep4D3'] },
];

const SAFE_FEATURES = [
  { icon: 'ri-lock-fill', labelKey: 'static.safeFeature1Label', tagKey: 'static.safeFeature1Tag', descKey: 'static.safeFeature1Desc' },
  { icon: 'ri-phone-lock-fill', labelKey: 'static.safeFeature2Label', tagKey: 'static.safeFeature2Tag', descKey: 'static.safeFeature2Desc' },
  { icon: 'ri-file-shield-2-fill', labelKey: 'static.safeFeature3Label', tagKey: 'static.safeFeature3Tag', descKey: 'static.safeFeature3Desc' },
  { icon: 'ri-shield-user-fill', labelKey: 'static.safeFeature4Label', tagKey: 'static.safeFeature4Tag', descKey: 'static.safeFeature4Desc' },
  { icon: 'ri-database-2-fill', labelKey: 'static.safeFeature5Label', tagKey: 'static.safeFeature5Tag', descKey: 'static.safeFeature5Desc' },
  { icon: 'ri-alarm-warning-fill', labelKey: 'static.safeFeature6Label', tagKey: 'static.safeFeature6Tag', descKey: 'static.safeFeature6Desc' },
  { icon: 'ri-scales-3-fill', labelKey: 'static.safeFeature7Label', tagKey: 'static.safeFeature7Tag', descKey: 'static.safeFeature7Desc' },
  { icon: 'ri-shield-keyhole-fill', labelKey: 'static.safeFeature8Label', tagKey: 'static.safeFeature8Tag', descKey: 'static.safeFeature8Desc' },
];

const REFUND_POLICIES = [
  { icon: 'ri-check-double-line', titleKey: 'static.refundPolicy1Title', descKey: 'static.refundPolicy1Desc', color: 'emerald' },
  { icon: 'ri-close-circle-line', titleKey: 'static.refundPolicy2Title', descKey: 'static.refundPolicy2Desc', color: 'rose' },
  { icon: 'ri-time-line', titleKey: 'static.refundPolicy3Title', descKey: 'static.refundPolicy3Desc', color: 'amber' },
  { icon: 'ri-customer-service-2-line', titleKey: 'static.refundPolicy4Title', descKey: 'static.refundPolicy4Desc', color: 'sky' },
  { icon: 'ri-bug-line', titleKey: 'static.refundPolicy5Title', descKey: 'static.refundPolicy5Desc', color: 'orange' },
  { icon: 'ri-file-copy-line', titleKey: 'static.refundPolicy6Title', descKey: 'static.refundPolicy6Desc', color: 'violet' },
];

const REFUND_COLOR_MAP = {
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-200', icon: 'text-rose-600', badge: 'bg-rose-100 text-rose-700' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
  sky: { bg: 'bg-sky-50', border: 'border-sky-200', icon: 'text-sky-600', badge: 'bg-sky-100 text-sky-700' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-600', badge: 'bg-orange-100 text-orange-700' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', icon: 'text-violet-600', badge: 'bg-violet-100 text-violet-700' },
};

export default function StaticPage({ page }) {
  const { t } = useI18n();
  const [faqCategoryKey, setFaqCategoryKey] = useState('all');
  const data = PAGES[page];
  if (!data) return null;

  const bgImage = HERO_IMAGES[page];

  const renderHeroBadge = (icon, textKey) => (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-500/20 border border-primary-400/30 px-3.5 py-1.5 text-xs font-bold text-primary-300 mb-4">
      <i className={icon}></i>
      {t(textKey)}
    </span>
  );

  const renderBreadcrumbs = (label) => (
    <nav className="flex items-center gap-2 text-sm text-background-100/60 mb-4">
      <Link to="/" className="hover:text-background-100 transition-colors">{t('nav.home')}</Link>
      <i className="ri-arrow-right-s-line text-xs"></i>
      <span className="text-background-100/80">{label}</span>
    </nav>
  );

  const renderHeroContent = () => {
    switch (page) {
      case 'faq':
        return (
          <>
            {renderBreadcrumbs(t('static.faq'))}
            {renderHeroBadge('ri-question-line', 'static.customerSupport')}
            <h1 className="text-3xl md:text-4xl font-bold text-background-50" style={{ fontFamily: 'var(--font-heading)' }}>{t('static.faq')}</h1>
            <p className="mt-3 text-background-100/70 text-sm md:text-base max-w-xl leading-relaxed">{t('static.faqHeroDesc')}</p>
          </>
        );
      case 'guide':
        return (
          <>
            {renderBreadcrumbs(t('static.guide'))}
            {renderHeroBadge('ri-guide-fill', 'static.customerSupport')}
            <h1 className="text-3xl md:text-4xl font-bold text-background-50" style={{ fontFamily: 'var(--font-heading)' }}>{t('static.guide')}</h1>
            <p className="mt-3 text-background-100/70 text-sm md:text-base max-w-xl leading-relaxed">{t('static.guideHeroDesc')}</p>
          </>
        );
      case 'refund':
        return (
          <>
            {renderBreadcrumbs(t('static.refundPolicy'))}
            {renderHeroBadge('ri-refund-2-fill', 'static.customerSupport')}
            <h1 className="text-3xl md:text-4xl font-bold text-background-50" style={{ fontFamily: 'var(--font-heading)' }}>{t('static.refundPolicy')}</h1>
            <p className="mt-3 text-background-100/70 text-sm md:text-base max-w-xl leading-relaxed">{t('static.refundHeroDesc')}</p>
          </>
        );
      case 'safe':
        return (
          <>
            {renderBreadcrumbs(t('static.safeTrading'))}
            {renderHeroBadge('ri-secure-payment-line', 'static.customerSupport')}
            <h1 className="text-3xl md:text-4xl font-bold text-background-50" style={{ fontFamily: 'var(--font-heading)' }}>{t('static.safeTrading')}</h1>
            <p className="mt-3 text-background-100/70 text-sm md:text-base max-w-xl leading-relaxed">{t('static.safeHeroDesc')}</p>
          </>
        );
      default:
        return null;
    }
  };

  const renderFaqContent = () => {
    const filtered = faqCategoryKey === 'all'
      ? data.sections
      : data.sections.filter((s) => s.category === faqCategoryKey);

    return (
      <>
        <div className="flex flex-wrap gap-2 mb-8">
          {FAQ_CATEGORY_KEYS.map((catKey) => (
            <button
              key={catKey}
              onClick={() => setFaqCategoryKey(catKey)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                faqCategoryKey === catKey
                  ? 'bg-primary-500 text-background-50'
                  : 'bg-background-100/80 text-foreground-600 hover:bg-background-200'
              }`}
            >
              {t(`static.faqCategory.${catKey}`)}
            </button>
          ))}
        </div>

        {filtered.map((s, i) => (
          <AnimatedSection key={i} delay={i * 60}>
            <div className="mb-4 rounded-2xl border border-background-200/60 bg-background-50 p-6">
              <h3 className="text-sm font-bold text-foreground-950 mb-2 flex items-start gap-2">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-primary-500 text-background-50 text-[10px] font-bold">Q</span>
                {t(s.qKey)}
              </h3>
              <p className="text-sm text-foreground-500 leading-relaxed ml-8">{t(s.aKey)}</p>
            </div>
          </AnimatedSection>
        ))}

        <AnimatedSection delay={200}>
          <div className="mt-12 border-t border-background-200 pt-10">
            <h2 className="text-lg font-bold text-foreground-950 mb-6" style={{ fontFamily: 'var(--font-heading)' }}>{t('static.stillUnresolved')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-background-200/60 bg-background-50 p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                    <i className="ri-chat-1-fill text-xl text-primary-600"></i>
                  </div>
                </div>
                <h4 className="font-bold text-foreground-950 mb-1">{t('static.chatSupport')}</h4>
                <p className="text-sm text-foreground-500">ChannelTalk</p>
              </div>
              <div className="rounded-2xl border border-background-200/60 bg-background-50 p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                    <i className="ri-mail-fill text-xl text-primary-600"></i>
                  </div>
                </div>
                <h4 className="font-bold text-foreground-950 mb-1">{t('static.email')}</h4>
                <p className="text-sm text-foreground-500">123458@gmail.com</p>
              </div>
              <div className="rounded-2xl border border-background-200/60 bg-background-50 p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                    <i className="ri-time-line text-xl text-primary-600"></i>
                  </div>
                </div>
                <h4 className="font-bold text-foreground-950 mb-1">{t('static.supportHours')}</h4>
                <p className="text-sm text-foreground-500">09:00-21:00</p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </>
    );
  };

  const renderGuideContent = () => (
    <>
      <div className="space-y-0">
        {GUIDE_STEPS.map((step, i) => (
          <AnimatedSection key={i} delay={i * 100}>
            <div className="relative">
              {i < GUIDE_STEPS.length - 1 && (
                <div className="absolute left-6 top-20 bottom-0 w-px bg-background-200 hidden md:block"></div>
              )}
              <div className="flex gap-5 pb-10">
                <div className="flex-shrink-0">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-background-50 text-sm font-bold">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="flex-1 rounded-2xl border border-background-200/60 bg-background-50 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-100">
                      <i className={`${step.icon} text-lg text-accent-600`}></i>
                    </div>
                    <h3 className="font-bold text-foreground-950" style={{ fontFamily: 'var(--font-heading)' }}>{t(step.titleKey)}</h3>
                  </div>
                  <p className="text-sm text-foreground-500 leading-relaxed mb-3">{t(step.descKey)}</p>
                  <ul className="space-y-1.5">
                    {step.detailKeys.map((dk, di) => (
                      <li key={di} className="flex items-start gap-2 text-sm text-foreground-600">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500"></span>
                        {t(dk)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>

      <AnimatedSection delay={300}>
        <div className="mt-6 border-t border-background-200 pt-10">
          <h2 className="text-lg font-bold text-foreground-950 mb-6" style={{ fontFamily: 'var(--font-heading)' }}>{t('static.quickLinks')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/faq" className="rounded-2xl border border-background-200/60 bg-background-50 p-6 flex items-center gap-4 hover:border-primary-300 hover:shadow-sm transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                <i className="ri-question-line text-xl text-primary-600"></i>
              </div>
              <div>
                <h4 className="font-bold text-foreground-950 group-hover:text-primary-600 transition-colors">{t('static.faq')}</h4>
                <p className="text-sm text-foreground-500">{t('static.faqQuickDesc')}</p>
              </div>
              <i className="ri-arrow-right-s-line text-foreground-400 ml-auto text-lg"></i>
            </Link>
            <Link to="/refund-policy" className="rounded-2xl border border-background-200/60 bg-background-50 p-6 flex items-center gap-4 hover:border-primary-300 hover:shadow-sm transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                <i className="ri-refund-2-fill text-xl text-primary-600"></i>
              </div>
              <div>
                <h4 className="font-bold text-foreground-950 group-hover:text-primary-600 transition-colors">{t('static.refundPolicy')}</h4>
                <p className="text-sm text-foreground-500">{t('static.refundQuickDesc')}</p>
              </div>
              <i className="ri-arrow-right-s-line text-foreground-400 ml-auto text-lg"></i>
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </>
  );

  const renderRefundContent = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {REFUND_POLICIES.map((policy, i) => {
          const colors = REFUND_COLOR_MAP[policy.color];
          return (
            <AnimatedSection key={i} delay={i * 80}>
              <div className={`rounded-2xl border ${colors.border} ${colors.bg} p-6`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.badge}`}>
                    <i className={`${policy.icon} text-lg`}></i>
                  </div>
                  <h3 className="font-bold text-foreground-950" style={{ fontFamily: 'var(--font-heading)' }}>{t(policy.titleKey)}</h3>
                </div>
                <p className="text-sm text-foreground-600 leading-relaxed">{t(policy.descKey)}</p>
              </div>
            </AnimatedSection>
          );
        })}
      </div>

      <AnimatedSection delay={300}>
        <div className="rounded-2xl bg-accent-50 border border-accent-200 p-6 flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-accent-100">
            <i className="ri-error-warning-fill text-xl text-accent-600"></i>
          </div>
          <div>
            <h4 className="font-bold text-foreground-950 mb-1">{t('static.importantNotice')}</h4>
            <p className="text-sm text-foreground-500 leading-relaxed">{t('static.refundNoticeDetail')}</p>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={400}>
        <div className="mt-10 border-t border-background-200 pt-10">
          <h2 className="text-lg font-bold text-foreground-950 mb-6" style={{ fontFamily: 'var(--font-heading)' }}>{t('static.quickLinks')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/guide" className="rounded-2xl border border-background-200/60 bg-background-50 p-6 flex items-center gap-4 hover:border-primary-300 hover:shadow-sm transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                <i className="ri-guide-fill text-xl text-primary-600"></i>
              </div>
              <div>
                <h4 className="font-bold text-foreground-950 group-hover:text-primary-600 transition-colors">{t('static.guide')}</h4>
                <p className="text-sm text-foreground-500">{t('static.guideQuickDesc')}</p>
              </div>
              <i className="ri-arrow-right-s-line text-foreground-400 ml-auto text-lg"></i>
            </Link>
            <Link to="/faq" className="rounded-2xl border border-background-200/60 bg-background-50 p-6 flex items-center gap-4 hover:border-primary-300 hover:shadow-sm transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                <i className="ri-question-line text-xl text-primary-600"></i>
              </div>
              <div>
                <h4 className="font-bold text-foreground-950 group-hover:text-primary-600 transition-colors">{t('static.faq')}</h4>
                <p className="text-sm text-foreground-500">{t('static.faqQuickDesc')}</p>
              </div>
              <i className="ri-arrow-right-s-line text-foreground-400 ml-auto text-lg"></i>
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </>
  );

  const renderSafeContent = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {SAFE_FEATURES.map((feat, i) => (
          <AnimatedSection key={i} delay={i * 70}>
            <div className="rounded-2xl border border-background-200/60 bg-background-50 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-100">
                    <i className={`${feat.icon} text-lg text-accent-600`}></i>
                  </div>
                  <h3 className="font-bold text-foreground-950" style={{ fontFamily: 'var(--font-heading)' }}>{t(feat.labelKey)}</h3>
                </div>
                <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">{t(feat.tagKey)}</span>
              </div>
              <p className="text-sm text-foreground-500 leading-relaxed">{t(feat.descKey)}</p>
            </div>
          </AnimatedSection>
        ))}
      </div>

      <AnimatedSection delay={300}>
        <div className="rounded-2xl bg-gradient-to-br from-foreground-900 to-foreground-800 p-8 md:p-10 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-500/20 border border-primary-400/30">
              <i className="ri-verified-badge-fill text-3xl text-primary-400"></i>
            </div>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-background-50 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>{t('static.safeTrustTitle')}</h2>
          <p className="text-background-100/70 text-sm md:text-base max-w-lg mx-auto leading-relaxed mb-6">{t('static.safeTrustDesc')}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/guide" className="inline-flex items-center gap-2 rounded-full bg-background-50/10 border border-background-50/20 px-5 py-2.5 text-sm font-medium text-background-100 hover:bg-background-50/20 transition-colors">
              <i className="ri-guide-fill text-base"></i>
              {t('static.guide')}
            </Link>
            <Link to="/faq" className="inline-flex items-center gap-2 rounded-full bg-background-50/10 border border-background-50/20 px-5 py-2.5 text-sm font-medium text-background-100 hover:bg-background-50/20 transition-colors">
              <i className="ri-question-line text-base"></i>
              {t('static.faq')}
            </Link>
            <Link to="/refund-policy" className="inline-flex items-center gap-2 rounded-full bg-background-50/10 border border-background-50/20 px-5 py-2.5 text-sm font-medium text-background-100 hover:bg-background-50/20 transition-colors">
              <i className="ri-refund-2-fill text-base"></i>
              {t('static.refundPolicy')}
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </>
  );

  const renderPageContent = () => {
    switch (page) {
      case 'faq': return renderFaqContent();
      case 'guide': return renderGuideContent();
      case 'refund': return renderRefundContent();
      case 'safe': return renderSafeContent();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-foreground-900 to-foreground-800 py-14 md:py-20">
        <img src={bgImage} alt="" className="absolute inset-0 h-full w-full object-cover object-top opacity-28 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground-900/50 via-foreground-900/30 to-foreground-900/70"></div>
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-10">
          {renderHeroContent()}
        </div>
      </section>

      <div className="mx-auto max-w-[800px] px-6 md:px-10 py-12">
        {renderPageContent()}
      </div>
    </div>
  );
}
