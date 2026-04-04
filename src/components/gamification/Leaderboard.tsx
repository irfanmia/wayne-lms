'use client';

interface LeaderboardEntry {
  username: string;
  display_name: string;
  avatar?: string;
  total_points: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export default function Leaderboard({ entries }: LeaderboardProps) {
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="bg-white rounded-xl border">
      <div className="p-4 border-b">
        <h3 className="font-heading font-bold text-lg">🏆 Leaderboard</h3>
      </div>
      <div className="divide-y">
        {entries.map((e, i) => (
          <div key={e.username} className={`flex items-center gap-4 p-4 ${i < 3 ? 'bg-orange-50/50' : ''}`}>
            <div className="w-8 text-center font-bold text-lg">
              {i < 3 ? medals[i] : <span className="text-gray-400">{i + 1}</span>}
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
              {e.display_name[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="font-medium">{e.display_name}</div>
              <div className="text-sm text-gray-500">@{e.username}</div>
            </div>
            <div className="font-bold text-orange-600">
              🪙 {e.total_points.toLocaleString()}
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <div className="p-8 text-center text-gray-400">No leaderboard data yet</div>
        )}
      </div>
    </div>
  );
}
