import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentApi, orderApi } from '../api';
import { useI18n } from '../i18n';

export default function USDTPayment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [payment, setPayment] = useState(null);
  const [status, setStatus] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    paymentApi.getUSDTPayment(orderId).then(({ data }) => {
      setPayment(data);
      setTimeLeft(data.countdownSeconds);
    }).catch(err => {
      if (err.response?.data?.message?.includes('만료')) setExpired(true);
      else setError(err.response?.data?.message || t('payment.loadError'));
    });
  }, [orderId]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { setExpired(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (expired) return;
    const poll = setInterval(async () => {
      try {
        const { data } = await paymentApi.getPaymentStatus(orderId);
        setStatus(data);
        if (data.orderStatus === 'completed') {
          clearInterval(poll);
          navigate(`/mypage?order=${orderId}&status=completed`);
        }
        if (data.orderStatus === 'expired' || data.orderStatus === 'cancelled') {
          clearInterval(poll);
          setExpired(true);
        }
      } catch {}
    }, 15000);
    return () => clearInterval(poll);
  }, [orderId, navigate, expired]);

  const copyAddress = useCallback(() => {
    if (payment?.usdtAddress) {
      navigator.clipboard.writeText(payment.usdtAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [payment]);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await paymentApi.confirmPayment(orderId);
      setStatus(prev => ({ ...prev, paymentStatus: 'awaiting_confirmation' }));
    } catch (err) {
      alert(err.response?.data?.message || t('payment.confirmFail'));
    } finally {
      setConfirming(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (error) return (
    <div className="min-h-screen pt-24 flex items-center justify-center px-4">
      <div className="text-center">
        <i className="ri-error-warning-line text-5xl text-red-400"></i>
        <p className="mt-4 text-foreground-600">{error}</p>
        <button onClick={() => navigate('/giftcards')} className="mt-4 px-6 py-2 rounded-xl bg-primary-500 text-background-50 text-sm font-bold">{t('payment.backToList')}</button>
      </div>
    </div>
  );

  if (!payment) return <div className="min-h-screen pt-24 flex items-center justify-center text-foreground-400">{t('payment.loading')}</div>;

  return (
    <div className="min-h-screen bg-background-50 pt-24 pb-20">
      <div className="mx-auto max-w-lg px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary-50 text-primary-600 mb-4">
            <i className="ri-coin-line text-3xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-foreground-950" style={{ fontFamily: 'var(--font-heading)' }}>{t('payment.title')}</h1>
          <p className="mt-2 text-sm text-foreground-500">{t('payment.subtitle')}</p>
        </div>

        {/* Countdown */}
        <div className={`rounded-2xl p-5 mb-6 text-center ${expired ? 'bg-red-50 border border-red-200' : timeLeft < 300 ? 'bg-red-50 border border-red-200' : 'bg-primary-50 border border-primary-200'}`}>
          {expired ? (
            <div>
              <i className="ri-time-line text-3xl text-red-400"></i>
              <p className="mt-2 font-bold text-red-600">{t('payment.expired')}</p>
              <button onClick={() => navigate('/giftcards')} className="mt-3 px-6 py-2 rounded-xl bg-primary-500 text-background-50 text-sm font-bold">{t('payment.backToList')}</button>
            </div>
          ) : (
            <>
              <p className="text-xs font-medium text-foreground-500 mb-1">{t('payment.timeLeft')}</p>
              <p className={`text-3xl font-bold font-mono ${timeLeft < 300 ? 'text-red-600' : 'text-primary-600'}`}>{formatTime(timeLeft)}</p>
              {timeLeft < 300 && <p className="mt-1 text-xs text-red-500">{t('payment.expiringSoon')}</p>}
            </>
          )}
        </div>

        {/* Order Summary */}
        <div className="rounded-2xl border border-background-200/60 bg-background-50 p-5 mb-6">
          <h3 className="text-sm font-bold text-foreground-950 mb-3">{t('payment.orderInfo')}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-foreground-500">{t('payment.orderNumber')}</span><span className="font-mono text-foreground-700">{payment.orderNumber}</span></div>
            <div className="flex justify-between"><span className="text-foreground-500">{t('payment.paymentAmount')}</span><span className="font-bold text-foreground-950">{payment.totalPrice.toLocaleString()}{t('common.won')}</span></div>
            <div className="flex justify-between"><span className="text-foreground-500">{t('payment.exchangeRate')}</span><span>{payment.exchangeRate.toLocaleString()} KRW/USDT</span></div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="rounded-2xl border-2 border-primary-200 bg-primary-50/30 p-6 mb-6">
          <h3 className="text-sm font-bold text-primary-800 mb-4 flex items-center gap-2"><i className="ri-coin-line"></i>{t('payment.paymentInfo')}</h3>

          {/* USDT Amount */}
          <div className="text-center mb-6">
            <p className="text-xs font-medium text-foreground-500 mb-1">{t('payment.usdtAmount')}</p>
            <p className="text-4xl font-bold text-primary-600">{payment.usdtAmount} <span className="text-lg">USDT</span></p>
            <p className="text-xs text-foreground-400 mt-1">{t('payment.trc20Network')}</p>
          </div>

          {/* Wallet Address */}
          <div className="rounded-xl bg-background-50 p-4 mb-4">
            <p className="text-xs font-medium text-foreground-500 mb-2">{t('payment.receivingAddress')}</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono break-all text-foreground-800 select-all">{payment.usdtAddress}</code>
              <button onClick={copyAddress} className="flex-shrink-0 h-8 w-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 hover:bg-primary-200 transition-colors">
                <i className={copied ? 'ri-check-line text-green-600' : 'ri-file-copy-line'}></i>
              </button>
            </div>
            {copied && <p className="mt-1 text-xs text-green-600">{t('payment.addressCopied')}</p>}
          </div>

          {/* QR Code */}
          <div className="rounded-xl bg-white p-4 flex flex-col items-center">
            <p className="text-xs font-medium text-foreground-500 mb-3">{t('payment.scanQR')}</p>
            <img src={payment.qrCodeDataUrl} alt="USDT Payment QR" className="w-48 h-48" />
            <p className="mt-2 text-[10px] text-foreground-400">{t('payment.scanQRDesc')}</p>
          </div>
        </div>

        {/* Warning */}
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-6">
          <div className="flex items-start gap-2">
            <i className="ri-error-warning-line text-amber-500 mt-0.5"></i>
            <div className="text-xs text-amber-700 leading-relaxed">
              <p className="font-bold mb-1">{t('payment.warning')}</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>{t('payment.warning1')}</li>
                <li>{t('payment.warning2', { amount: payment.usdtAmount })}</li>
                <li>{t('payment.warning3')}</li>
                <li>{t('payment.warning4')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        {status?.paymentStatus === 'awaiting_confirmation' ? (
          <div className="rounded-2xl bg-blue-50 border border-blue-200 p-5 text-center">
            <i className="ri-time-line text-2xl text-blue-500"></i>
            <p className="mt-2 font-bold text-blue-700">{t('payment.awaitingConfirm')}</p>
            <p className="mt-1 text-xs text-blue-600">{t('payment.awaitingConfirmDesc')}</p>
          </div>
        ) : (
          <button onClick={handleConfirm} disabled={confirming || expired}
            className="w-full rounded-xl bg-primary-500 py-4 text-sm font-bold text-background-50 hover:bg-primary-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
            <i className="ri-check-double-line"></i>
            {confirming ? t('payment.processing') : t('payment.confirmPayment')}
          </button>
        )}

        <div className="mt-6 text-center">
          <button onClick={() => navigate('/giftcards')} className="text-sm text-foreground-400 hover:text-foreground-600">{t('payment.backToListShort')}</button>
        </div>
      </div>
    </div>
  );
}
