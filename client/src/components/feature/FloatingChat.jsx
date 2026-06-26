import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../i18n';

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const { t } = useI18n();
  const location = useLocation();

  // Hide on admin pages
  if (location.pathname.startsWith('/admin')) return null;

  const phoneVerified = user?.phone_verified || false;
  const emailVerified = user?.email_verified || false;
  const walletVerified = user?.wallet_verified || false;

  const handleSend = () => {
    if (!message.trim()) return;
    setMessage('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="w-80 max-h-[480px] rounded-2xl bg-background-50 shadow-2xl border border-background-200/60 flex flex-col animate-slide-in-bottom overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-background-200/60 bg-background-50">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-500 text-background-50">
                <i className="ri-chat-1-fill text-sm"></i>
              </span>
              <h3 className="text-sm font-bold text-foreground-950">{t('chat.title')}</h3>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-foreground-400 hover:text-foreground-600 hover:bg-background-100 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <i className="ri-close-line text-lg"></i>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-background-200/60">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2.5 text-sm font-semibold text-center transition-colors cursor-pointer ${
                activeTab === 'chat'
                  ? 'text-primary-600 border-b-2 border-primary-500'
                  : 'text-foreground-400 hover:text-foreground-600'
              }`}
            >
              {t('chat.tabChat')}
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`flex-1 py-2.5 text-sm font-semibold text-center transition-colors cursor-pointer ${
                activeTab === 'verification'
                  ? 'text-primary-600 border-b-2 border-primary-500'
                  : 'text-foreground-400 hover:text-foreground-600'
              }`}
            >
              {t('chat.tabVerification')}
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'chat' ? (
              <div className="flex flex-col h-full">
                {/* Business Hours */}
                <div className="px-4 pt-4 pb-2">
                  <div className="rounded-xl bg-background-100/80 border border-background-200/60 px-3 py-2.5 flex items-center gap-2">
                    <i className="ri-time-line text-foreground-400 text-sm"></i>
                    <span className="text-xs text-foreground-500">
                      {t('chat.businessHours')} <span className="font-semibold text-foreground-700">09:00 - 21:00</span>
                    </span>
                  </div>
                </div>

                {/* Chat Messages Area */}
                <div className="flex-1 px-4 py-3">
                  <div className="rounded-xl bg-primary-50 border border-primary-200/40 px-3.5 py-3 max-w-[85%]">
                    <p className="text-sm text-foreground-700 leading-relaxed">
                      {t('chat.welcomeMessage')}
                    </p>
                    <span className="block mt-1.5 text-[10px] text-foreground-400">{t('chat.justNow')}</span>
                  </div>
                </div>

                {/* Chat Input */}
                <div className="px-4 pb-4 pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder={t('chat.inputPlaceholder')}
                      className="flex-1 rounded-xl border border-background-200/80 bg-background-50 px-3.5 py-2.5 text-sm text-foreground-900 placeholder:text-foreground-300 focus:outline-none focus:border-primary-300 focus:ring-1 focus:ring-primary-200 transition-colors"
                    />
                    <button
                      onClick={handleSend}
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-500 text-background-50 hover:bg-primary-600 transition-colors cursor-pointer"
                      aria-label="Send"
                    >
                      <i className="ri-send-plane-fill text-sm"></i>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4">
                {user ? (
                  <>
                    {/* Verification Items */}
                    <div className="space-y-2.5">
                      {/* Phone */}
                      <div className={`rounded-xl border p-3 ${phoneVerified ? 'border-green-200/50 bg-green-50/30' : 'border-background-200/60 bg-background-100/50'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <i className={`ri-smartphone-line ${phoneVerified ? 'text-green-500' : 'text-foreground-300'}`}></i>
                            <span className="text-sm font-medium text-foreground-950">{t('chat.phoneVerification')}</span>
                          </div>
                          {phoneVerified ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-background-50">
                              <i className="ri-check-line text-xs"></i>
                            </span>
                          ) : (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background-200 text-foreground-400">
                              <i className="ri-close-line text-xs"></i>
                            </span>
                          )}
                        </div>
                        <p className={`text-xs font-medium mt-1 ${phoneVerified ? 'text-green-600' : 'text-foreground-400'}`}>
                          {phoneVerified ? t('chat.verified') : t('chat.unverified')}
                        </p>
                      </div>

                      {/* Email */}
                      <div className={`rounded-xl border p-3 ${emailVerified ? 'border-green-200/50 bg-green-50/30' : 'border-background-200/60 bg-background-100/50'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <i className={`ri-mail-line ${emailVerified ? 'text-green-500' : 'text-foreground-300'}`}></i>
                            <span className="text-sm font-medium text-foreground-950">{t('chat.emailVerification')}</span>
                          </div>
                          {emailVerified ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-background-50">
                              <i className="ri-check-line text-xs"></i>
                            </span>
                          ) : (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background-200 text-foreground-400">
                              <i className="ri-close-line text-xs"></i>
                            </span>
                          )}
                        </div>
                        <p className={`text-xs font-medium mt-1 ${emailVerified ? 'text-green-600' : 'text-foreground-400'}`}>
                          {emailVerified ? t('chat.verified') : t('chat.unverified')}
                        </p>
                      </div>

                      {/* Wallet */}
                      <div className={`rounded-xl border p-3 ${walletVerified ? 'border-green-200/50 bg-green-50/30' : 'border-background-200/60 bg-background-100/50'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <i className={`ri-wallet-3-line ${walletVerified ? 'text-green-500' : 'text-foreground-300'}`}></i>
                            <span className="text-sm font-medium text-foreground-950">{t('chat.walletVerification')}</span>
                          </div>
                          {walletVerified ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-background-50">
                              <i className="ri-check-line text-xs"></i>
                            </span>
                          ) : (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background-200 text-foreground-400">
                              <i className="ri-close-line text-xs"></i>
                            </span>
                          )}
                        </div>
                        <p className={`text-xs font-medium mt-1 ${walletVerified ? 'text-green-600' : 'text-foreground-400'}`}>
                          {walletVerified ? t('chat.verified') : t('chat.unverified')}
                        </p>
                      </div>
                    </div>

                    {/* Notice */}
                    <div className="mt-3 rounded-xl bg-amber-50/50 border border-amber-200/40 p-3 flex items-start gap-2">
                      <i className="ri-alert-line text-amber-500 mt-0.5 text-sm"></i>
                      <p className="text-xs text-amber-700 leading-relaxed">
                        {t('chat.verificationNotice')}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl bg-background-100/80 border border-background-200/60 p-6 text-center">
                    <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-background-200/60 text-foreground-300 mb-3">
                      <i className="ri-lock-line text-xl"></i>
                    </div>
                    <p className="text-sm text-foreground-500">{t('chat.loginRequired')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="h-14 w-14 rounded-full bg-primary-500 text-background-50 shadow-lg hover:scale-110 transition flex items-center justify-center cursor-pointer"
          aria-label="Open chat"
        >
          <i className="ri-chat-1-fill text-xl"></i>
        </button>
      )}
    </div>
  );
}
