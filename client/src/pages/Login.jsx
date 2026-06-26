import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n';
import { AuthLayout } from '../components/auth/AuthLayout';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  const heroImage = 'https://readdy.ai/api/search-image?query=Premium%20warm%20editorial%20portrait%20background%20with%20cascading%20golden%20gift%20cards%20arranged%20artistically%20on%20deep%20crimson%20fabric%2C%20soft%20cinematic%20studio%20lighting%2C%20clean%20composition%2C%20elegant%20gold%20foil%20accents%2C%20rich%20texture%2C%20luxurious%20mood%2C%20no%20people%2C%20warm%20amber%20glow&width=1200&height=1600&seq=auth-side-login-2026-v2&orientation=portrait';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || t('login.fail'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout heroImage={heroImage} imageBadge={t('login.imageBadge')}>
      <h1 className="text-3xl md:text-4xl font-bold text-foreground-950" style={{ fontFamily: 'var(--font-heading)' }}>{t('login.title')}</h1>
      <p className="mt-2 text-sm text-foreground-500">{t('login.subtitle')}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('login.username')}</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            className="w-full rounded-xl border border-background-300 bg-background-50 px-4 py-3 text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-colors"
            placeholder={t('login.username')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('login.password')}</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-background-300 bg-background-50 px-4 py-3 pr-11 text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-colors"
              placeholder={t('login.password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-400 hover:text-foreground-600 transition-colors"
              aria-label={t('login.showPassword')}
            >
              <i className={showPassword ? 'ri-eye-off-line text-lg' : 'ri-eye-line text-lg'}></i>
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-background-300 text-primary-500 focus:ring-primary-400"
            />
            <span className="text-sm text-foreground-600">{t('login.rememberMe')}</span>
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary-500 py-3 text-sm font-bold text-background-50 hover:bg-primary-600 disabled:opacity-60 transition-colors"
        >
          {loading ? `${t('login.submit')}...` : t('login.submit')}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-foreground-500">
        {t('login.noAccount')} <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">{t('login.signupLink')}</Link>
      </p>
    </AuthLayout>
  );
}
