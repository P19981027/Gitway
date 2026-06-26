import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-50 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-[200px] md:text-[300px] font-bold text-background-200/40 tracking-tighter" style={{ fontFamily: 'var(--font-heading)' }}>404</span>
      </div>
      <div className="relative z-10 text-center px-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-100/80 px-4 py-2 text-xs font-semibold text-primary-700 border border-primary-200/50 mb-6">
          <i className="ri-error-warning-line"></i>{t('notfound.badge')}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground-950 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          {t('notfound.title')}
        </h1>
        <p className="text-sm text-foreground-500 mb-8 max-w-md mx-auto">
          {t('notfound.desc')}
        </p>
        <Link to="/" className="inline-flex items-center gap-2 rounded-2xl bg-primary-500 px-8 py-4 text-sm font-bold text-background-50 hover:bg-primary-600 hover:scale-[1.03] transition-all duration-300">
          <i className="ri-home-4-line"></i>{t('notfound.backHome')}
        </Link>
      </div>
    </div>
  );
}
