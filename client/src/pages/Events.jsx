import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

export default function Events() {
  const { t } = useI18n();

  const notices = [
    t('events.notice1'),
    t('events.notice2'),
    t('events.notice3'),
    t('events.notice4'),
    t('events.notice5'),
    t('events.notice6'),
  ];

  const calcExamples = [
    { label: t('events.calcSilverLabel'), threshold: t('events.calcSilverThreshold'), rate: t('events.calcSilverRate'), reward: t('events.calcSilverReward') },
    { label: t('events.calcGoldLabel'), threshold: t('events.calcGoldThreshold'), rate: t('events.calcGoldRate'), reward: t('events.calcGoldReward') },
    { label: t('events.calcAgencyLabel'), threshold: t('events.calcAgencyThreshold'), rate: t('events.calcAgencyRate'), reward: t('events.calcAgencyReward') },
  ];

  return (
    <div className="min-h-screen bg-background-50">
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1f1638] via-[#251d40] to-[#150f28]">
        <img
          src="https://readdy.ai/api/search-image?query=Energetic%20deep%20plum%20festival%20background%20with%20vibrant%20multicolor%20confetti%20sparkles%20and%20elegant%20celebration%20ribbons%2C%20dynamic%20party%20atmosphere%2C%20sophisticated%20event%20visual%20theme%2C%20electric%20amber%20and%20magenta%20accent%20particles%2C%20premium%20festive%20aesthetic%2C%20high%20energy%20mood%2C%20luxurious%20celebration%20composition%2C%20dramatic%20lighting%2C%20rich%20dark%20backdrop&width=1600&height=550&seq=events-hero-bg-v3&orientation=landscape"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-top opacity-28 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-dot-pattern opacity-[0.03]" />

        <div className="relative z-10 mx-auto max-w-[1400px] px-6 pt-32 pb-20 md:px-10 md:pt-40 md:pb-28">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-background-100/50">
            <Link to="/" className="transition-colors hover:text-background-100">{t('nav.home')}</Link>
            <i className="ri-arrow-right-s-line text-xs" />
            <span className="text-background-100/80">{t('nav.events')}</span>
          </nav>

          <span className="inline-flex items-center gap-2 rounded-full bg-green-500/20 px-4 py-1.5 text-xs font-semibold text-green-400 border border-green-400/20">
            <span className="flex h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            {t('events.badge')}
          </span>

          <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-background-50 md:text-5xl lg:text-6xl" style={{ fontFamily: 'var(--font-heading)' }}>
            {t('events.title')}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-background-100/60 md:text-lg">
            {t('events.desc')}
          </p>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-background-300/50 to-transparent" />

      {/* ═══ MAIN CONTENT ═══ */}
      <section className="bg-background-50 py-16 md:py-24">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-10">

            {/* ─── Left Column ─── */}
            <div className="lg:col-span-8 space-y-10">

              {/* Reward Tiers */}
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground-950 md:text-3xl" style={{ fontFamily: 'var(--font-heading)' }}>
                  {t('events.rewardCalc')}
                </h2>
                <p className="mt-2 text-sm text-foreground-500">{t('events.rewardCalcDesc')}</p>

                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* Silver Tier */}
                  <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:-translate-y-1 hover:border-white/20 transition-all duration-500">
                    <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-gray-400/10 blur-xl" />
                    <div className="pointer-events-none absolute -bottom-10 -left-10 h-20 w-20 rounded-full bg-gray-400/10 blur-xl" />
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-300/20">
                          <i className="ri-shield-star-line text-xl text-gray-300" />
                        </div>
                        <div>
                          <div className="text-xs font-medium uppercase tracking-wider text-foreground-400">{t('events.silverTier')}</div>
                        </div>
                      </div>
                      <div className="text-sm text-foreground-500 mb-2">{t('events.silverThreshold')}</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold tracking-tight text-foreground-950" style={{ fontFamily: 'var(--font-heading)' }}>{t('events.silverRate')}</span>
                        <span className="text-sm text-foreground-500">{t('events.rewardLabel')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Gold Tier */}
                  <div className="group relative overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6 backdrop-blur-sm hover:-translate-y-1 hover:border-amber-500/30 transition-all duration-500">
                    <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-amber-400/10 blur-xl" />
                    <div className="pointer-events-none absolute -bottom-10 -left-10 h-20 w-20 rounded-full bg-amber-400/10 blur-xl" />
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/20">
                          <i className="ri-vip-crown-2-line text-xl text-amber-400" />
                        </div>
                        <div>
                          <div className="text-xs font-medium uppercase tracking-wider text-amber-300/80">{t('events.goldTier')}</div>
                        </div>
                      </div>
                      <div className="text-sm text-foreground-500 mb-2">{t('events.goldThreshold')}</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold tracking-tight text-amber-400" style={{ fontFamily: 'var(--font-heading)' }}>{t('events.goldRate')}</span>
                        <span className="text-sm text-foreground-500">{t('events.rewardLabel')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agency Privilege */}
              <div className="rounded-2xl border border-background-200/60 bg-background-50 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                    <i className="ri-key-2-line text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground-950" style={{ fontFamily: 'var(--font-heading)' }}>{t('events.agencyPrivilege')}</h3>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                  <div className="rounded-xl bg-background-100/80 p-4">
                    <div className="text-[11px] font-medium uppercase tracking-wider text-foreground-400 mb-1">{t('events.thresholdLabel')}</div>
                    <div className="text-base font-bold text-foreground-950">{t('events.agencyThreshold')}</div>
                  </div>
                  <div className="rounded-xl bg-background-100/80 p-4">
                    <div className="text-[11px] font-medium uppercase tracking-wider text-foreground-400 mb-1">{t('events.extraRateLabel')}</div>
                    <div className="text-base font-bold text-foreground-950">{t('events.agencyRate')}</div>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-foreground-500">{t('events.agencyDesc')}</p>
              </div>

              {/* Reward Calculation Examples */}
              <div className="rounded-2xl border border-background-200/60 bg-background-50 p-6 md:p-8">
                <h3 className="text-lg font-bold text-foreground-950 mb-6" style={{ fontFamily: 'var(--font-heading)' }}>{t('events.rewardCalc')}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-background-200/60">
                        <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-400">{t('events.colTier')}</th>
                        <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-400">{t('events.colThreshold')}</th>
                        <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-400">{t('events.colRate')}</th>
                        <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-foreground-400">{t('events.colExpectedReward')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calcExamples.map((ex, i) => (
                        <tr key={i} className="border-b border-background-100/60 last:border-0">
                          <td className="py-4 font-semibold text-foreground-950">{ex.label}</td>
                          <td className="py-4 text-foreground-600">{ex.threshold}</td>
                          <td className="py-4 text-foreground-600">{ex.rate}</td>
                          <td className="py-4 text-right font-bold text-primary-600">{ex.reward}{t('common.won')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 text-xs text-foreground-400">{t('events.calcDisclaimer')}</p>
              </div>

              {/* Event Notices */}
              <div className="rounded-2xl border border-background-200/60 bg-background-50 p-6 md:p-8">
                <h3 className="text-lg font-bold text-foreground-950 mb-6" style={{ fontFamily: 'var(--font-heading)' }}>{t('events.notices')}</h3>
                <ul className="space-y-3">
                  {notices.map((notice, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-xs font-bold text-primary-600">
                        {i + 1}
                      </span>
                      <span className="text-sm leading-relaxed text-foreground-600 pt-0.5">{notice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ─── Right Column (Sidebar) ─── */}
            <div className="lg:col-span-4 space-y-6">

              {/* Current Events */}
              <div className="rounded-2xl border border-background-200/60 bg-background-50 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground-500">{t('events.sidebarTitle')}</span>
                </div>

                {/* Calendar */}
                <div className="mb-5 rounded-xl bg-background-100/80 p-4 text-center">
                  <i className="ri-calendar-event-fill text-2xl text-primary-500 mb-1 block" />
                  <div className="text-base font-bold text-foreground-950" style={{ fontFamily: 'var(--font-heading)' }}>{t('events.calendarMonth')}</div>
                </div>

                {/* Event Card */}
                <div className="group rounded-xl border border-primary-200/40 bg-primary-50/50 p-4 hover:border-primary-300/60 transition-colors duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-bold text-green-600">
                      <span className="flex h-1 w-1 rounded-full bg-green-500" />
                      {t('events.badge')}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground-950 leading-snug">{t('events.eventCardTitle')}</h4>
                  <Link
                    to="/events"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    {t('events.viewRewards')}
                    <i className="ri-arrow-right-s-line text-sm" />
                  </Link>
                </div>

                {/* Card Recovery Link */}
                <Link
                  to="/card-recovery"
                  className="mt-4 flex items-center gap-3 rounded-xl border border-background-200/60 bg-background-50 p-4 hover:border-accent-300/50 hover:bg-accent-50/30 transition-colors duration-300"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-100 text-accent-600">
                    <i className="ri-recycle-line text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground-950 truncate">{t('events.cardRecoveryLink')}</div>
                    <div className="text-[11px] text-foreground-400">{t('events.cardRecoveryReward')}</div>
                  </div>
                  <i className="ri-arrow-right-s-line text-foreground-300 text-lg" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
