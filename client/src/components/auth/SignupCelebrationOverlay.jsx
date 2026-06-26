import { useEffect, useState, useMemo } from 'react';
import { useI18n } from '../../i18n';

const PARTICLE_COLORS = [
  'bg-primary-400',
  'bg-accent-400',
  'bg-amber-400',
  'bg-orange-400',
  'bg-green-400',
  'bg-secondary-400',
  'bg-rose-400',
  'bg-yellow-400',
  'bg-emerald-400',
  'bg-cyan-400',
];

export function SignupCelebrationOverlay({ show, onClose, username }) {
  const { t } = useI18n();
  const [progress, setProgress] = useState(0);

  const particles = useMemo(() => {
    const seed = Date.now();
    return Array.from({ length: 10 }, (_, i) => ({
      id: i,
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      left: `${10 + ((seed * (i + 1)) % 80)}%`,
      top: `${10 + ((seed * (i + 3)) % 70)}%`,
      size: 6 + (i % 4) * 2,
      delay: `${i * 200}ms`,
      duration: `${2 + (i % 3)}s`,
    }));
  }, [show]);

  useEffect(() => {
    if (!show) {
      setProgress(0);
      return;
    }

    const duration = 3000;
    const startTime = Date.now();

    const frame = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (pct < 100) requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-950/80 backdrop-blur-sm">
      {/* Confetti particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className={`absolute rounded-full ${p.color} animate-float-y opacity-70`}
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}

      {/* Center content */}
      <div className="animate-scale-in relative z-10 flex flex-col items-center gap-4 px-8 text-center">
        {/* Check circle */}
        <i className="ri-checkbox-circle-fill text-6xl text-green-500" />

        {/* Heading */}
        <h2
          className="text-2xl md:text-3xl font-bold text-background-50"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {t('signup.celebrationTitle')}
        </h2>

        {/* Subtitle */}
        <p className="text-base text-background-200">
          {t('signup.celebrationSubtitle', { username })}
        </p>

        {/* Progress bar */}
        <div className="mt-2 w-64 overflow-hidden rounded-full bg-foreground-800/60">
          <div
            className="h-1.5 rounded-full bg-gradient-to-r from-accent-400 to-primary-500 transition-[width] duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Helper text */}
        <p className="text-xs text-background-400">
          {t('signup.celebrationHelper')}
        </p>
      </div>
    </div>
  );
}
