import { useMemo } from 'react';
import { useI18n } from '../../i18n';

const STRENGTH_LEVELS = [
  { max: 25, key: 'password.veryWeak', color: 'bg-red-500', text: 'text-red-500' },
  { max: 50, key: 'password.weak', color: 'bg-orange-500', text: 'text-orange-500' },
  { max: 75, key: 'password.fair', color: 'bg-yellow-500', text: 'text-yellow-500' },
  { max: 100, key: 'password.strong', color: 'bg-green-500', text: 'text-green-500' },
];

function calculateStrength(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 20;
  if (/[a-z]/.test(password)) score += 20;
  if (/[A-Z]/.test(password)) score += 20;
  if (/\d/.test(password)) score += 20;
  if (/[^a-zA-Z0-9]/.test(password)) score += 20;
  return Math.min(score, 100);
}

function getStrengthLevel(score) {
  if (score <= 0) return null;
  return STRENGTH_LEVELS.find((level) => score <= level.max) || STRENGTH_LEVELS[3];
}

export function PasswordStrength({ password }) {
  const { t } = useI18n();
  const score = useMemo(() => calculateStrength(password), [password]);
  const level = getStrengthLevel(score);

  const filledSegments = score <= 0 ? 0 : score <= 25 ? 1 : score <= 50 ? 2 : score <= 75 ? 3 : 4;

  if (!password) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i < filledSegments ? level.color : 'bg-background-200'
            }`}
          />
        ))}
      </div>
      {level && (
        <p className={`text-xs font-medium ${level.text}`}>
          {t(level.key)}
        </p>
      )}
    </div>
  );
}
