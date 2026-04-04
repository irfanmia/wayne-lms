'use client';
import { useI18n } from '@/lib/i18n';

export default function StreakCounter({ streak }: { streak: number }) {
  const { t } = useI18n();
  const days = t('streakCounter.days') as unknown as string[];
  const dayLabels = Array.isArray(days) ? days : ['M','T','W','T','F','S','S'];

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-center">
      <div className="text-4xl mb-2 animate-flame">🔥</div>
      <div className="text-3xl font-bold text-gray-900">{streak}</div>
      <div className="text-gray-500 text-sm">{t('streakCounter.dayStreak')}</div>
      <div className="flex justify-center gap-1 mt-3">
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            className={`w-6 h-6 rounded-md text-xs flex items-center justify-center ${i < streak % 7 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}
          >
            {dayLabels[i]}
          </div>
        ))}
      </div>
    </div>
  );
}
