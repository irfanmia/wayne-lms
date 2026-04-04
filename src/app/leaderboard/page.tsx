'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Leaderboard from '@/components/gamification/Leaderboard';

const mockEntries = [
  { username: 'sarah_chen', display_name: 'Sarah Chen', total_points: 4850 },
  { username: 'alice', display_name: 'Alice Johnson', total_points: 3920 },
  { username: 'bob', display_name: 'Bob Smith', total_points: 3100 },
  { username: 'charlie', display_name: 'Charlie Brown', total_points: 2750 },
  { username: 'diana', display_name: 'Diana Prince', total_points: 2200 },
  { username: 'student', display_name: 'John Doe', total_points: 1850 },
  { username: 'instructor', display_name: 'Instructor', total_points: 1500 },
  { username: 'eve', display_name: 'Eve Wilson', total_points: 1200 },
];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState(mockEntries);

  useEffect(() => {
    api.get('/points/leaderboard/').then((data) => {
      if (data && data.length > 0) setEntries(data);
    }).catch(() => {});
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-heading font-bold mb-2">Leaderboard</h1>
      <p className="text-gray-500 mb-8">Top learners by coins earned</p>
      <Leaderboard entries={entries} />
    </div>
  );
}
