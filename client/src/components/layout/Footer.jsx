import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n';

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="mt-24 bg-foreground-900 text-background-100">
      <div className="h-px bg-gradient-to-r from-transparent via-accent-400/30 to-transparent" />
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <img src="https://readdy.ai/api/search-image?query=Luxury%20premium%20gift%20brand%20icon%20with%20elegant%20golden%20gift%20box%20and%20ribbon%20on%20warm%20cream%20background%2C%20sophisticated%20minimalist%20design%2C%20high_end%20branding%20aesthetic%2C%20amber%20orange%20and%20gold%20tones%2C%20clean%20geometric%20composition%2C%20editorial%20quality%20with%20subtle%20shadows%20and%20warm%20lighting&width=200&height=200&seq=giftway-icon-2026-01&orientation=squarish" alt="GiftWay" className="h-11 w-11 rounded-xl object-cover ring-1 ring-background-50/10" />
              <span className="text-2xl font-bold tracking-tight text-background-50" style={{ fontFamily: 'var(--font-heading)' }}>GiftWay</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-background-200/70 max-w-xs">{t('footer.desc')}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-background-50/8 backdrop-blur-sm px-3 py-1.5 text-[11px] font-medium text-background-100/60">
                <span className="flex h-4 w-4 items-center justify-center text-accent-400/70"><i className="ri-shield-check-fill text-[10px]"></i></span>{t('footer.sslSecure')}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-background-50/8 backdrop-blur-sm px-3 py-1.5 text-[11px] font-medium text-background-100/60">
                <span className="flex h-4 w-4 items-center justify-center text-accent-400/70"><i className="ri-verified-badge-fill text-[10px]"></i></span>{t('footer.authVerified')}
              </span>
            </div>
            <div className="mt-5 flex items-center gap-2">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-background-50/10 text-background-200/70 hover:bg-accent-500/25 hover:text-accent-300 hover:scale-105 transition-all duration-300"><i className="ri-chat-3-fill text-sm"></i></a>
              <a href="mailto:123458@gmail.com" className="flex h-9 w-9 items-center justify-center rounded-lg bg-background-50/10 text-background-200/70 hover:bg-accent-500/25 hover:text-accent-300 hover:scale-105 transition-all duration-300"><i className="ri-mail-fill text-sm"></i></a>
              <a href="https://pf.kakao.com" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg bg-background-50/10 text-background-200/70 hover:bg-accent-500/25 hover:text-accent-300 hover:scale-105 transition-all duration-300"><i className="ri-kakao-talk-fill text-sm"></i></a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-background-50 mb-5">{t('footer.giftCards')}</h4>
            <ul className="space-y-3 text-sm text-background-200/70">
              <li><Link to="/giftcards/jd-e-card" className="hover:text-accent-400 transition-colors">{t('cardNames.jd-e-card')}</Link></li>
              <li><Link to="/giftcards/tmall-card" className="hover:text-accent-400 transition-colors">{t('cardNames.tmall-card')}</Link></li>
              <li><Link to="/giftcards/amazon-card" className="hover:text-accent-400 transition-colors">{t('cardNames.amazon-card')}</Link></li>
              <li><Link to="/giftcards/uber-card" className="hover:text-accent-400 transition-colors">{t('cardNames.uber-card')}</Link></li>
              <li><Link to="/giftcards/netflix-card" className="hover:text-accent-400 transition-colors">{t('cardNames.netflix-card')}</Link></li>
              <li><Link to="/giftcards/costco-card" className="hover:text-accent-400 transition-colors">{t('cardNames.costco-card')}</Link></li>
              <li><Link to="/giftcards/lazada-card" className="hover:text-accent-400 transition-colors">{t('cardNames.lazada-card')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-background-50 mb-5">{t('footer.support')}</h4>
            <ul className="space-y-3 text-sm text-background-200/70">
              <li><Link to="/faq" className="hover:text-accent-400 transition-colors">{t('footer.faq')}</Link></li>
              <li><Link to="/guide" className="hover:text-accent-400 transition-colors">{t('footer.guide')}</Link></li>
              <li><Link to="/refund-policy" className="hover:text-accent-400 transition-colors">{t('footer.refundPolicy')}</Link></li>
              <li><Link to="/safe-trading" className="hover:text-accent-400 transition-colors">{t('footer.safeTrading')}</Link></li>
              <li><a href="#" onClick={e => e.preventDefault()} className="hover:text-accent-400 transition-colors">{t('footer.inquiry')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-background-50 mb-5">{t('footer.contact')}</h4>
            <ul className="space-y-3.5 text-sm text-background-200/70">
              <li className="flex items-start gap-2.5"><span className="mt-0.5 flex h-4 w-4 items-center justify-center text-accent-400/80"><i className="ri-phone-fill"></i></span>1588-0000</li>
              <li className="flex items-start gap-2.5"><span className="mt-0.5 flex h-4 w-4 items-center justify-center text-accent-400/80"><i className="ri-mail-fill"></i></span>123458@gmail.com</li>
              <li className="flex items-start gap-2.5"><span className="mt-0.5 flex h-4 w-4 items-center justify-center text-accent-400/80"><i className="ri-kakao-talk-fill"></i></span>{t('footer.channelTalk')}</li>
              <li className="flex items-start gap-2.5"><span className="mt-0.5 flex h-4 w-4 items-center justify-center text-accent-400/80"><i className="ri-time-fill"></i></span>{t('footer.consultHours')}</li>
            </ul>
          </div>

          <div className="lg:col-span-1 md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-background-50 mb-5">{t('footer.newsletter')}</h4>
            <p className="text-sm text-background-200/70 mb-4">{t('footer.newsletterDesc')}</p>
            <div className="flex gap-2">
              <input type="email" id="newsletter-footer" placeholder="Email" className="w-full rounded-xl border border-background-50/15 bg-background-50/8 backdrop-blur-sm px-3 py-2.5 text-sm text-background-50 placeholder-background-200/40 outline-none focus:border-accent-400/40 transition-colors" />
              <button className="rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-bold text-foreground-950 hover:bg-accent-400 transition-colors flex-shrink-0"><i className="ri-send-plane-fill"></i></button>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-background-800/40 pt-7 text-xs text-background-300/70 md:flex-row md:items-center md:justify-between">
          <p>{t('footer.companyInfo')}</p>
          <div className="flex flex-wrap items-center gap-5">
            <Link to="/guide" className="hover:text-accent-400 transition-colors">{t('footer.terms')}</Link>
            <Link to="/guide" className="hover:text-accent-400 transition-colors">{t('footer.privacy')}</Link>
            <Link to="/safe-trading" className="hover:text-accent-400 transition-colors">{t('footer.businessInfo')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
