'use client';
import { useI18n } from '@/lib/i18n';

type Activity = { type: string; exercise: string; track: string; time: string };

const icons: Record<string, string> = {
  completed: '✅',
  started: '▶️',
  submitted: '📤',
  earned_badge: '🏆',
};

export default function ActivityFeed({ activities }: { activities: Activity[] }) {
  const { t } = useI18n();
  return (
    <div className="space-y-3">
      {activities.map((a, i) => (
        <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <span className="text-lg">{icons[a.type] || '📌'}</span>
          <div>
            <p className="text-gray-600 text-sm">
              <span className="capitalize">{a.type.replace('_', ' ')}</span>{' '}
              <span className="text-gray-900 font-medium">{a.exercise}</span>
              {a.track && <span className="text-gray-400"> {t('activityFeed.in')} {a.track}</span>}
            </p>
            <span className="text-gray-400 text-xs">{a.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
