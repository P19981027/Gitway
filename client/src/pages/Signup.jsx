import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { verificationApi } from '../api';
import { useI18n } from '../i18n';
import { AuthLayout } from '../components/auth/AuthLayout';
import { PasswordStrength } from '../components/auth/PasswordStrength';
import { SignupCelebrationOverlay } from '../components/auth/SignupCelebrationOverlay';

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [phoneCode, setPhoneCode] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneSent, setPhoneSent] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1=info, 2=verify, 3=done
  const [showCelebration, setShowCelebration] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  const heroImage = 'https://readdy.ai/api/search-image?query=Premium%20warm%20editorial%20portrait%20background%20with%20beautifully%20wrapped%20golden%20gift%20box%20and%20silk%20ribbon%20on%20elegant%20cream%20marble%20surface%2C%20soft%20diffused%20natural%20lighting%20creating%20gentle%20warm%20highlights%2C%20minimal%20composition%20with%20scattered%20golden%20confetti%2C%20warm%20champagne%20and%20amber%20tones%2C%20refined%20luxury%20mood%2C%20no%20people%2C%20clean%20modern%20aesthetic%20with%20subtle%20bokeh%20highlights%2C%20high-end%20product%20photography%20style%2C%20soft%20organic%20shadows%20and%20rich%20depth&width=1200&height=1600&seq=auth-side-signup-2026-v4&orientation=portrait';

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const sendPhone = async () => {
    try {
      await verificationApi.sendPhoneCode(form.phone, 'register');
      setPhoneSent(true);
      setError('');
    } catch (err) { setError(err.response?.data?.message || t('signup.phoneSendFail')); }
  };

  const verifyPhone = async () => {
    try {
      const { data } = await verificationApi.verifyPhoneCode(form.phone, phoneCode, 'register');
      if (data.verified) { setPhoneVerified(true); setError(''); }
    } catch (err) { setError(err.response?.data?.message || t('signup.phoneVerifyFail')); }
  };

  const sendEmail = async () => {
    try {
      await verificationApi.sendEmailCode(form.email, 'register');
      setEmailSent(true);
      setError('');
    } catch (err) { setError(err.response?.data?.message || t('signup.emailSendFail')); }
  };

  const verifyEmail = async () => {
    try {
      const { data } = await verificationApi.verifyEmailCode(form.email, emailCode, 'register');
      if (data.verified) { setEmailVerified(true); setError(''); }
    } catch (err) { setError(err.response?.data?.message || t('signup.emailVerifyFail')); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) { setError(t('signup.passwordMismatch')); return; }
    if (!emailVerified) { setError(t('signup.emailVerifyRequired')); return; }
    if (!form.phone) { setError(t('signup.phoneRequired')); return; }
    if (!phoneVerified) { setError(t('signup.phoneVerifyRequired')); return; }

    setLoading(true);
    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        phone: form.phone,
      });
      setShowCelebration(true);
    } catch (err) {
      setError(err.response?.data?.message || t('signup.fail'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthLayout heroImage={heroImage} imageBadge={t('signup.imageBadge')}>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground-950" style={{ fontFamily: 'var(--font-heading)' }}>{t('signup.title')}</h1>
        <p className="mt-2 text-sm text-foreground-500">{t('signup.subtitle')}</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('signup.username')}</label>
            <input type="text" value={form.username} onChange={e => update('username', e.target.value)} required minLength={3} maxLength={20}
              className="w-full rounded-xl border border-background-300 bg-background-50 px-4 py-3 text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-colors" placeholder={t('signup.usernamePlaceholder')} />
          </div>

          {/* Email with verification */}
          <div>
            <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('signup.email')} <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <input type="email" value={form.email} onChange={e => { update('email', e.target.value); setEmailVerified(false); setEmailSent(false); }} required
                className="flex-1 rounded-xl border border-background-300 bg-background-50 px-4 py-3 text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-colors" placeholder={t('signup.emailPlaceholder')} disabled={emailVerified} />
              {!emailVerified && (
                <button type="button" onClick={sendEmail} disabled={!form.email || emailVerified}
                  className="whitespace-nowrap rounded-xl bg-primary-500 px-4 py-3 text-xs font-bold text-background-50 hover:bg-primary-600 disabled:opacity-40 transition-colors">
                  {emailSent ? t('signup.resendCode') : t('signup.sendCode')}
                </button>
              )}
            </div>
            {emailVerified && <p className="mt-1 text-xs text-green-600"><i className="ri-check-line"></i> {t('signup.emailVerified')}</p>}
            {emailSent && !emailVerified && (
              <div className="flex gap-2 mt-2">
                <input type="text" value={emailCode} onChange={e => setEmailCode(e.target.value)} maxLength={6} placeholder={t('signup.codePlaceholder')}
                  className="flex-1 rounded-xl border border-background-300 bg-background-50 px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 tracking-widest text-center transition-colors" />
                <button type="button" onClick={verifyEmail} disabled={emailCode.length !== 6}
                  className="rounded-xl bg-accent-500 px-4 py-2.5 text-xs font-bold text-foreground-950 hover:bg-accent-400 disabled:opacity-40 transition-colors">{t('signup.verify')}</button>
              </div>
            )}
          </div>

          {/* Phone with verification */}
          <div>
            <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('signup.phone')} <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <input type="tel" value={form.phone} onChange={e => { update('phone', e.target.value); setPhoneVerified(false); setPhoneSent(false); }} required pattern="(\+82|0)?[\s-]*1\d[\s-]*\d{3,4}[\s-]*\d{4}" title="010-0000-0000"
                className="flex-1 rounded-xl border border-background-300 bg-background-50 px-4 py-3 text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-colors" placeholder={t('signup.phonePlaceholder')} disabled={phoneVerified} />
              {!phoneVerified && form.phone && (
                <button type="button" onClick={sendPhone}
                  className="whitespace-nowrap rounded-xl bg-primary-500 px-4 py-3 text-xs font-bold text-background-50 hover:bg-primary-600 disabled:opacity-40 transition-colors">
                  {phoneSent ? t('signup.resendCode') : t('signup.sendCode')}
                </button>
              )}
            </div>
            {phoneVerified && <p className="mt-1 text-xs text-green-600"><i className="ri-check-line"></i> {t('signup.phoneVerified')}</p>}
            {phoneSent && !phoneVerified && (
              <div className="flex gap-2 mt-2">
                <input type="text" value={phoneCode} onChange={e => setPhoneCode(e.target.value)} maxLength={6} placeholder={t('signup.codePlaceholder')}
                  className="flex-1 rounded-xl border border-background-300 bg-background-50 px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 tracking-widest text-center transition-colors" />
                <button type="button" onClick={verifyPhone} disabled={phoneCode.length !== 6}
                  className="rounded-xl bg-accent-500 px-4 py-2.5 text-xs font-bold text-foreground-950 hover:bg-accent-400 disabled:opacity-40 transition-colors">{t('signup.verify')}</button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('signup.password')}</label>
            <input type="password" value={form.password} onChange={e => update('password', e.target.value)} required minLength={6}
              className="w-full rounded-xl border border-background-300 bg-background-50 px-4 py-3 text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-colors" placeholder={t('signup.passwordPlaceholder')} />
            <PasswordStrength password={form.password} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t('signup.confirmPassword')}</label>
            <input type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required
              className="w-full rounded-xl border border-background-300 bg-background-50 px-4 py-3 text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-colors" placeholder={t('signup.confirmPasswordPlaceholder')} />
          </div>

          <button type="submit" disabled={loading || !emailVerified || !phoneVerified}
            className="w-full rounded-xl bg-primary-500 py-3 text-sm font-bold text-background-50 hover:bg-primary-600 disabled:opacity-60 transition-colors">
            {loading ? `${t('signup.submit')}...` : t('signup.submit')}
          </button>
          {(!emailVerified || !phoneVerified) && <p className="text-xs text-center text-foreground-400">{t('signup.emailRequired')}</p>}
        </form>

        <p className="mt-6 text-center text-sm text-foreground-500">
          {t('signup.hasAccount')} <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">{t('signup.loginLink')}</Link>
        </p>
      </AuthLayout>

      <SignupCelebrationOverlay show={showCelebration} onClose={() => { setShowCelebration(false); navigate('/'); }} username={form.username} />
    </>
  );
}
