'use client';
import { PracticeProgress, PracticeBadge } from '@/data/mockPracticeData';

interface Props {
  progress: PracticeProgress;
  badges: PracticeBadge[];
}

export default function PracticeStats({ progress, badges }: Props) {
  const pct = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
  const earnedBadges = badges.filter(b => b.earned);
  const unearnedBadges = badges.filter(b => !b.earned);

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-gray-800">{pct}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-orange-500 h-2.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-orange-50 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-orange-600">{progress.points}</div>
          <div className="text-[10px] text-gray-500">Points</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-blue-600">{progress.completed}/{progress.total}</div>
          <div className="text-[10px] text-gray-500">Exercises</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-purple-600">{progress.streak}</div>
          <div className="text-[10px] text-gray-500">Streak</div>
        </div>
        <div className="bg-green-50 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-green-600">{progress.badges_earned}</div>
          <div className="text-[10px] text-gray-500">Badges</div>
        </div>
      </div>

      {/* All badges — earned in color, unearned faded */}
      {badges.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Earned Badges</h4>
          <div className="flex flex-wrap gap-3">
            {earnedBadges.map(b => (
              <div key={b.id} className="flex flex-col items-center gap-1" title={b.name}>
                <span className="text-4xl">{b.icon_url}</span>
                <span className="text-[10px] text-gray-600 font-medium">{b.name}</span>
              </div>
            ))}
            {unearnedBadges.map(b => (
              <div key={b.id} className="flex flex-col items-center gap-1 opacity-30" title={`${b.name} (locked)`}>
                <span className="text-4xl grayscale">{b.icon_url}</span>
                <span className="text-[10px] text-gray-400 font-medium">{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
