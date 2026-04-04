'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface BadgeItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon_url: string;
  criteria_type: string;
  earned?: boolean;
}

export default function BadgesPage() {
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBadges().then(setBadges).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-heading font-bold mb-2">Badges</h1>
      <p className="text-gray-500 mb-8">Complete challenges to earn badges and showcase your achievements.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {badges.map(b => (
          <div key={b.id} className={`border rounded-xl p-5 text-center transition ${b.earned ? 'bg-orange-50 border-orange-200' : 'opacity-50 grayscale'}`}>
            <div className="text-4xl mb-3">{b.icon_url || '🏅'}</div>
            <h3 className="font-medium text-sm">{b.name}</h3>
            <p className="text-xs text-gray-400 mt-1">{b.description}</p>
            {b.earned && <span className="inline-block mt-2 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">Earned ✓</span>}
          </div>
        ))}
      </div>

      {badges.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-2">🏅</div>
          <p>No badges available yet.</p>
        </div>
      )}
    </div>
  );
}
