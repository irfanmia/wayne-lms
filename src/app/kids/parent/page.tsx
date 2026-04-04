'use client';

import { useState, useEffect } from 'react';
import kidsApi from '@/lib/kids-api';

interface ChildData {
  profile: { display_name: string; avatar_type: string; current_level: number; total_points: number };
  challenges_completed: number;
  total_points: number;
  badges_earned: number;
  current_streak: number;
}

export default function ParentDashboard() {
  const [children, setChildren] = useState<ChildData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    kidsApi.getParentDashboard()
      .then(data => { setChildren(data.children || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-6xl animate-pulse">👨‍👩‍👧</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold font-[Manrope] mb-2">👨‍👩‍👧 Parent Dashboard</h1>
        <p className="text-gray-600">Track your child&apos;s coding progress</p>
      </div>

      {children.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-4">👶</div>
          <h3 className="text-xl font-bold mb-2">No Children Linked</h3>
          <p className="text-gray-500 mb-4">Link your child&apos;s account to see their progress here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {children.map((child, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">🤖</div>
                <div>
                  <h3 className="text-xl font-bold">{child.profile.display_name}</h3>
                  <p className="text-gray-500 text-sm">Level {child.profile.current_level}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Points', value: child.total_points, emoji: '⭐' },
                  { label: 'Challenges', value: child.challenges_completed, emoji: '✅' },
                  { label: 'Badges', value: child.badges_earned, emoji: '🏅' },
                  { label: 'Streak', value: `${child.current_streak} days`, emoji: '🔥' },
                ].map(stat => (
                  <div key={stat.label} className="bg-orange-50 rounded-xl p-4 text-center">
                    <div className="text-2xl">{stat.emoji}</div>
                    <div className="text-xl font-bold">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips section */}
      <div className="mt-10 bg-blue-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="font-bold text-lg mb-3">💡 Tips for Parents</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✅ Encourage your child to code a little every day — even 15 minutes helps!</li>
          <li>✅ Celebrate their badges and achievements together</li>
          <li>✅ Ask them to show you what they built — it boosts confidence</li>
          <li>✅ Set a daily time limit that works for your family</li>
        </ul>
      </div>
    </div>
  );
}
