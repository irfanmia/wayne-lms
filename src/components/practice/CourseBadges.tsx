'use client';
import { PracticeBadge } from '@/data/mockPracticeData';

interface Props {
  badges: PracticeBadge[];
}

export default function CourseBadges({ badges }: Props) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">🏆 Course Badges</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {badges.map(badge => (
          <div
            key={badge.id}
            className={`rounded-xl border p-4 text-center transition-all ${
              badge.earned
                ? 'bg-white border-orange-200 shadow-sm'
                : 'bg-gray-50 border-gray-200 opacity-60'
            }`}
          >
            <div className={`text-4xl mb-2 ${badge.earned ? '' : 'grayscale'}`}>
              {badge.icon_url}
            </div>
            <h4 className={`text-sm font-semibold ${badge.earned ? 'text-gray-800' : 'text-gray-500'}`}>
              {badge.name}
            </h4>
            <p className="text-xs text-gray-400 mt-1">{badge.description}</p>
            {badge.earned && badge.earned_at && (
              <p className="text-xs text-orange-500 mt-1">
                {new Date(badge.earned_at).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
