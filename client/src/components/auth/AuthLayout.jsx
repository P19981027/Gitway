import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n';

const LOGO_URL =
  'https://readdy.ai/api/search-image?query=Luxury%20premium%20gift%20brand%20icon%20with%20elegant%20golden%20gift%20box%20and%20ribbon%20on%20warm%20cream%20background%2C%20sophisticated%20minimalist%20design%2C%20high_end%20branding%20aesthetic%2C%20amber%20orange%20and%20gold%20tones%2C%20clean%20geometric%20composition%2C%20editorial%20quality%20with%20subtle%20shadows%20and%20warm%20lighting&width=200&height=200&seq=giftway-icon-2026-01&orientation=squarish';

const TRUST_ITEMS = [
  { icon: 'ri-shield-check-fill', key: 'auth.trustAuthentic' },
  { icon: 'ri-flashlight-fill', key: 'auth.trustInstant' },
  { icon: 'ri-lock-fill', key: 'auth.trustSsl' },
];

export function AuthLayout({ heroImage, imageBadge, children }) {
  const { t } = useI18n();
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_1.05fr]">
      {/* Left column - hero image (hidden on mobile) */}
      <div className="relative hidden lg:block overflow-hidden">
        {/* Hero image */}
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-foreground-900/80 via-foreground-900/60 to-foreground-900/80" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-foreground-900/90 to-transparent" />

        {/* Dot pattern */}
        <div className="absolute inset-0 bg-dot-pattern opacity-[0.03]" />

        {/* Grain texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          }}
        />

        {/* Bottom-left content */}
        <div className="absolute bottom-0 left-0 right-0 p-10 xl:p-14">
          {/* Logo + brand */}
          <div className="flex items-center gap-3 mb-6">
            <img
              src={LOGO_URL}
              alt="GiftWay"
              className="h-10 w-10 rounded-xl object-cover ring-1 ring-white/10"
            />
            <span
              className="text-2xl font-extrabold tracking-tight text-gradient-warm"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              GiftWay
            </span>
          </div>

          {/* Image badge */}
          {imageBadge && (
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-400/20 px-4 py-2 mb-6">
              <i className="ri-vip-crown-fill text-accent-400 animate-pulse" />
              <span className="text-sm font-semibold text-accent-200">
                {imageBadge}
              </span>
            </div>
          )}

          {/* Trust items */}
          <div className="flex items-center gap-6 text-background-300/80">
            {TRUST_ITEMS.map((item) => (
              <div key={item.key} className="flex items-center gap-1.5">
                <i className={`${item.icon} text-sm`} />
                <span className="text-xs font-medium">{t(item.key)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right column - form content */}
      <div className="relative flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-background-200/50">
          <div className="flex items-center gap-2.5">
            <img
              src={LOGO_URL}
              alt="GiftWay"
              className="h-9 w-9 rounded-xl object-cover ring-1 ring-background-200/50"
            />
            <span
              className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              GiftWay
            </span>
          </div>
          <Link
            to="/"
            className="text-sm font-medium text-foreground-500 hover:text-foreground-700 transition-colors"
          >
            {t('auth.backToHome')}
          </Link>
        </div>

        {/* Form children */}
        <div className="flex-1 flex items-center justify-center px-6 py-10 md:px-12 lg:px-16">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
