import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { recoveryApi } from '../api';
import Pagination from '../components/Pagination';

const STATUS_TO_RESULT_KEY = {
  approved: 'resultCompleted',
  pending: 'resultPending',
  rejected: 'resultInvalid',
  duplicate: 'resultDuplicate',
};
const STATUS_TO_RESULT_LABEL = {
  approved: '회수완료',
  pending: '검토중',
  rejected: '유효하지않음',
  duplicate: '중복',
};

const ITEMS_PER_PAGE = 10;

export default function CardRecovery() {
  const { t } = useI18n();
  const [cardNumber, setCardNumber] = useState('');
  const [pinNumber, setPinNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [submitResult, setSubmitResult] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [history, setHistory] = useState([]);
  const [total, setTotal] = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState('');

  const fetchHistory = (page = 1) => {
    setLoadingHistory(true);
    setHistoryError('');
    recoveryApi.list({ page, limit: 100 })
      .then(({ data }) => {
        setHistory(data.recoveries || []);
        setTotal(data.pagination?.total || 0);
      })
      .catch((err) => setHistoryError(err.response?.data?.message || t('cardRecovery.loadError')))
      .finally(() => setLoadingHistory(false));
  };

  useEffect(() => { fetchHistory(1); }, []);

  const totalPages = Math.max(1, Math.ceil(history.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedHistory = history.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const completedCount = history.filter((h) => h.status === 'approved').length;
  const totalReward = history.reduce((sum, h) => sum + (h.reward_amount || 0), 0);

  const handleNumberInput = (setter) => (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setter(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cardNumber || !pinNumber) return;

    setProcessing(true);
    setProcessingStep(0);
    setSubmitResult(null);

    const stepTimers = [
      setTimeout(() => setProcessingStep(1), 400),
      setTimeout(() => setProcessingStep(2), 900),
    ];

    try {
      const { data } = await recoveryApi.submit({ cardNumber, pinNumber });
      setProcessingStep(3);
      setSubmitResult(data);
      setTimeout(() => {
        setProcessing(false);
        setShowConfirm(true);
        fetchHistory(1);
        setCurrentPage(1);
      }, 500);
    } catch (err) {
      setProcessing(false);
      setSubmitResult({
        status: 'error',
        message: err.response?.data?.message || t('cardRecovery.submitFail'),
      });
      setShowConfirm(true);
    } finally {
      stepTimers.forEach(clearTimeout);
    }
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    setCardNumber('');
    setPinNumber('');
    setSubmitResult(null);
  };

  const scrollToForm = () => {
    document.getElementById('card-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background-50">
      {/* ═══ HERO SECTION ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-foreground-900 via-foreground-800 to-foreground-900">
        <img
          src="https://readdy.ai/api/search-image?query=Elegant%20dark%20luxury%20background%20with%20floating%20used%20gift%20cards%20and%20golden%20sparkle%20particles%2C%20warm%20ambient%20glow%2C%20premium%20atmosphere%2C%20refined%20golden%20accents%2C%20sophisticated%20editorial%20photography%20style%2C%20rich%20deep%20charcoal%20backdrop%2C%20subtle%20metallic%20sheen%2C%20clean%20modern%20composition&width=1600&height=500&seq=card-recovery-hero-2026&orientation=landscape"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-top opacity-28 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground-950/40 via-foreground-900/30 to-foreground-950/60 pointer-events-none" />
        <div className="pointer-events-none absolute top-1/4 left-[15%] h-64 w-64 rounded-full bg-accent-500/8 blur-[80px]" />
        <div className="pointer-events-none absolute bottom-1/4 right-[10%] h-80 w-80 rounded-full bg-accent-400/6 blur-[100px]" />

        <div className="relative z-10 mx-auto max-w-[1400px] px-6 pt-32 pb-20 md:px-10 md:pt-40 md:pb-28">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-background-100/50 mb-6">
            <Link to="/" className="hover:text-accent-400 transition-colors">{t('nav.home')}</Link>
            <i className="ri-arrow-right-s-line text-xs"></i>
            <Link to="/events" className="hover:text-accent-400 transition-colors">{t('nav.events')}</Link>
            <i className="ri-arrow-right-s-line text-xs"></i>
            <span className="text-accent-400/80">{t('cardRecovery.title')}</span>
          </nav>

          {/* Badge */}
          <span className="inline-flex items-center gap-2 rounded-full bg-accent-500/20 px-4 py-1.5 text-xs font-semibold text-accent-400 border border-accent-400/20">
            <span className="flex h-1.5 w-1.5 rounded-full bg-accent-400 animate-pulse"></span>
            {t('cardRecovery.badge')}
          </span>

          {/* Title */}
          <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-background-50 md:text-5xl" style={{ fontFamily: 'var(--font-heading)' }}>
            {t('cardRecovery.title')}
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-xl font-semibold text-accent-400 md:text-2xl">
            {t('cardRecovery.subtitle')}
          </p>

          {/* Description */}
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-background-100/60 md:text-base">
            {t('cardRecovery.desc')}
          </p>

          {/* CTA */}
          <button
            onClick={scrollToForm}
            className="mt-8 group relative overflow-hidden rounded-2xl bg-accent-500 px-8 py-4 text-sm font-bold text-foreground-950 hover:bg-accent-400 hover:scale-[1.03] shadow-lg shadow-accent-500/20 transition-all duration-300 inline-flex items-center gap-2.5"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-background-50/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <i className="ri-gift-2-line text-base relative z-10"></i>
            <span className="relative z-10">{t('cardRecovery.registerNow')}</span>
          </button>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-background-300/50 to-transparent" />

      {/* ═══ CARD REGISTRATION FORM ═══ */}
      <section id="card-form" className="bg-background-50 py-16 md:py-24">
        <div className="mx-auto max-w-[600px] px-6 md:px-10">
          <div className="rounded-2xl border border-background-200/60 bg-background-50 p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-100 text-accent-600">
                <i className="ri-bank-card-2-fill text-lg"></i>
              </div>
              <h2 className="text-lg font-bold text-foreground-950" style={{ fontFamily: 'var(--font-heading)' }}>
                {t('cardRecovery.registerNow')}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-foreground-700 mb-2">
                  {t('cardRecovery.cardNumber')}
                </label>
                <div className="relative">
                  <i className="ri-bank-card-line absolute left-4 top-1/2 -translate-y-1/2 text-foreground-400"></i>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={handleNumberInput(setCardNumber)}
                    maxLength={16}
                    placeholder={t('cardRecovery.cardNumberPlaceholder')}
                    className="w-full rounded-xl border border-background-300 bg-background-50 pl-11 pr-4 py-3.5 text-sm outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100 transition-all"
                  />
                </div>
                <p className="mt-1.5 text-xs text-foreground-400">{t('cardRecovery.cardNumberHint')}</p>
              </div>

              {/* PIN Number */}
              <div>
                <label className="block text-sm font-medium text-foreground-700 mb-2">
                  {t('cardRecovery.pinNumber')}
                </label>
                <div className="relative">
                  <i className="ri-key-2-line absolute left-4 top-1/2 -translate-y-1/2 text-foreground-400"></i>
                  <input
                    type="text"
                    value={pinNumber}
                    onChange={handleNumberInput(setPinNumber)}
                    maxLength={8}
                    placeholder={t('cardRecovery.pinPlaceholder')}
                    className="w-full rounded-xl border border-background-300 bg-background-50 pl-11 pr-4 py-3.5 text-sm outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100 transition-all"
                  />
                </div>
                <p className="mt-1.5 text-xs text-foreground-400">{t('cardRecovery.pinHint')}</p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!cardNumber || !pinNumber || processing}
                className="w-full rounded-xl bg-accent-500 py-3.5 text-sm font-bold text-foreground-950 hover:bg-accent-400 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center gap-2"
              >
                <i className="ri-upload-2-line"></i>
                {t('cardRecovery.submit')}
              </button>
            </form>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-background-300/50 to-transparent" />

      {/* ═══ RECOVERY HISTORY TABLE ═══ */}
      <section className="bg-background-100/50 py-16 md:py-24">
        <div className="mx-auto max-w-[1200px] px-6 md:px-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between mb-8">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-accent-100/80 px-3.5 py-1.5 text-xs font-semibold text-accent-800 border border-accent-200/50">
                <i className="ri-history-fill text-accent-600"></i>
                {t('cardRecovery.historyTitle')}
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground-950 md:text-3xl" style={{ fontFamily: 'var(--font-heading)' }}>
                {t('cardRecovery.totalRecovered', { amount: totalReward.toLocaleString() })}
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 border border-primary-200/50 px-3.5 py-1.5 text-xs font-medium text-primary-700">
                <i className="ri-file-list-3-line text-primary-500"></i>
                {t('cardRecovery.showingCount', { total: history.length, showing: paginatedHistory.length })}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200/50 px-3.5 py-1.5 text-xs font-medium text-green-700">
                <i className="ri-checkbox-circle-fill text-green-500"></i>
                {t('cardRecovery.recoveredCount', { n: completedCount })}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 border border-accent-200/50 px-3.5 py-1.5 text-xs font-medium text-accent-700">
                <i className="ri-coin-fill text-accent-500"></i>
                {t('cardRecovery.rewardSum', { amount: totalReward.toLocaleString() })}
              </span>
            </div>
          </div>

          {historyError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{historyError}</div>
          )}

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-background-200/60 bg-background-50 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-background-200/60 bg-background-100/80">
                  <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-foreground-500">ID</th>
                  <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-foreground-500">{t('transactions.date', '일시')}</th>
                  <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-foreground-500">{t('cardRecovery.cardNumber', '카드번호')}</th>
                  <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-foreground-500">{t('transactions.status', '상태')}</th>
                  <th className="whitespace-nowrap px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-foreground-500">{t('wallet.amount', '금액')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-background-200/40">
                {loadingHistory ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-foreground-400">{t('common.loading')}</td></tr>
                ) : paginatedHistory.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-foreground-400">{t('cardRecovery.noHistory')}</td></tr>
                ) : paginatedHistory.map((item) => {
                  const status = item.status || 'pending';
                  const resultKey = STATUS_TO_RESULT_KEY[status] || 'resultPending';
                  const resultLabel = STATUS_TO_RESULT_LABEL[status] || status;
                  return (
                    <tr key={item.id} className="hover:bg-background-100/40 transition-colors">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-medium text-foreground-700">RC-{String(item.id).padStart(3, '0')}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-foreground-500">{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-foreground-500">{item.card_number_masked || '****'}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <ResultBadge result={resultLabel} resultKey={resultKey} t={t} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-foreground-700">
                        {item.reward_amount > 0 ? `+${item.reward_amount.toLocaleString()}` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPage={setCurrentPage}
            />
          </div>
        </div>
      </section>

      {/* ═══ CONFIRMATION DIALOG ═══ */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground-950/60 backdrop-blur-sm" onClick={handleConfirm} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-background-200/60 bg-background-50 p-6 md:p-8 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl mb-4 ${submitResult?.status === 'error' ? 'bg-red-100 text-red-600' : submitResult?.status === 'duplicate' ? 'bg-amber-100 text-amber-600' : submitResult?.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                <i className={`text-3xl ${submitResult?.status === 'error' ? 'ri-close-circle-fill' : submitResult?.status === 'duplicate' ? 'ri-error-warning-fill' : submitResult?.status === 'approved' ? 'ri-checkbox-circle-fill' : 'ri-time-line'}`}></i>
              </div>
              <h3 className="text-lg font-bold text-foreground-950" style={{ fontFamily: 'var(--font-heading)' }}>
                {submitResult?.status === 'error' ? t('cardRecovery.submitFailTitle') :
                 submitResult?.status === 'duplicate' ? t('cardRecovery.resultDuplicate') :
                 submitResult?.status === 'approved' ? t('cardRecovery.confirmTitle') :
                 t('cardRecovery.pendingTitle')}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground-500">
                {submitResult?.message || t('cardRecovery.pendingDesc')}
              </p>
              <div className="mt-6 flex w-full gap-3">
                <button
                  onClick={handleConfirm}
                  className="flex-1 rounded-xl bg-accent-500 py-3 text-sm font-bold text-foreground-950 hover:bg-accent-400 transition-colors"
                >
                  {t('common.confirm')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PROCESSING OVERLAY ═══ */}
      {processing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground-950/60 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-background-200/60 bg-background-50 p-6 md:p-8 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-100 text-accent-600 mb-4 animate-pulse">
                <i className="ri-loader-4-line text-3xl animate-spin"></i>
              </div>
              <h3 className="text-lg font-bold text-foreground-950" style={{ fontFamily: 'var(--font-heading)' }}>
                {t('cardRecovery.processing')}
              </h3>
              <p className="mt-2 text-sm text-foreground-400">{t('cardRecovery.pleaseWait')}</p>

              <div className="mt-6 w-full space-y-3">
                <ProcessingStep label={t('cardRecovery.stepValidate')} done={processingStep >= 1} />
                <ProcessingStep label={t('cardRecovery.stepPin')} done={processingStep >= 2} />
                <ProcessingStep label={t('cardRecovery.stepCheck')} done={processingStep >= 3} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProcessingStep({ label, done }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-300 ${done ? 'border-green-200/60 bg-green-50/50' : 'border-background-200/60 bg-background-100/30'}`}>
      <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 ${done ? 'bg-green-500 text-background-50' : 'bg-background-200 text-foreground-400'}`}>
        {done ? <i className="ri-check-line text-xs"></i> : <span className="text-[10px] font-bold">-</span>}
      </div>
      <span className={`text-sm font-medium transition-colors duration-300 ${done ? 'text-green-700' : 'text-foreground-400'}`}>
        {label}
      </span>
    </div>
  );
}

function ResultBadge({ result, resultKey, t }) {
  const styles = {
    '회수완료': 'bg-green-50 text-green-700 border-green-200/50',
    '검토중': 'bg-blue-50 text-blue-700 border-blue-200/50',
    '미사용': 'bg-yellow-50 text-yellow-700 border-yellow-200/50',
    '유효하지않음': 'bg-red-50 text-red-700 border-red-200/50',
    '중복': 'bg-orange-50 text-orange-700 border-orange-200/50',
    '미활성화': 'bg-gray-50 text-gray-600 border-gray-200/50',
  };

  const icons = {
    '회수완료': 'ri-checkbox-circle-fill',
    '검토중': 'ri-time-line',
    '미사용': 'ri-error-warning-fill',
    '유효하지않음': 'ri-close-circle-fill',
    '중복': 'ri-file-copy-fill',
    '미활성화': 'ri-forbid-fill',
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${styles[result] || 'bg-gray-50 text-gray-600'}`}>
      <i className={`${icons[result] || 'ri-question-fill'} text-[10px]`}></i>
      {t(`cardRecovery.${resultKey}`)}
    </span>
  );
}