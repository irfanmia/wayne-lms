'use client';

import { useState, useEffect } from 'react';
import kidsApi from '@/lib/kids-api';

interface DashboardData {
  profile: { display_name: string; avatar_type: string; current_level: number };
  streak: { current_streak: number; longest_streak: number };
  recent_achievements: { id: number; badge_type: string; title: string; icon_emoji: string; earned_at: string }[];
  recent_progress: { id: number; challenge_title: string; completed: boolean; points_earned: number }[];
  stats: { total_points: number; current_level: number; challenges_completed: number; total_challenges: number; badges_earned: number };
}

interface CourseData {
  id: number;
  title: string;
  slug: string;
  icon_emoji: string;
  age_group: string;
  color: string;
  challenge_count: number;
  lesson_count: number;
}

const AVATAR_EMOJIS: Record<string, string> = {
  robot: '🤖', cat: '🐱', dog: '🐶', unicorn: '🦄', dragon: '🐉',
  astronaut: '👨‍🚀', ninja: '🥷', wizard: '🧙',
};

const LEVEL_TITLES = ['Beginner', 'Explorer', 'Builder', 'Creator', 'Inventor', 'Master', 'Legend'];

export default function KidDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Try to load dashboard (requires auth + kid profile)
    Promise.allSettled([
      kidsApi.getDashboard(),
      kidsApi.getCourses(),
    ]).then(([dashResult, coursesResult]) => {
      if (dashResult.status === 'fulfilled' && dashResult.value?.stats) {
        setData(dashResult.value);
      } else {
        setIsGuest(true);
      }
      if (coursesResult.status === 'fulfilled') {
        setCourses(coursesResult.value?.results || []);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl animate-pulse mb-2">📊</div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const totalChallenges = courses.reduce((sum, c) => sum + c.challenge_count, 0);
  const totalLessons = courses.reduce((sum, c) => sum + c.lesson_count, 0);

  // Guest dashboard (not logged in or no kid profile)
  if (isGuest || !data) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-3xl p-8 text-white mb-8 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="text-6xl">🤖</div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-[Manrope]">Welcome, Young Coder!</h1>
              <p className="opacity-90">Start coding and track your amazing progress here!</p>
            </div>
          </div>
        </div>

        {/* Platform stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Courses', value: courses.length, emoji: '📚' },
            { label: 'Lessons', value: totalLessons, emoji: '📝' },
            { label: 'Challenges', value: totalChallenges, emoji: '🎯' },
            { label: 'Age Groups', value: '5-13', emoji: '👧' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 text-center shadow-sm">
              <div className="text-3xl mb-1">{s.emoji}</div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Available courses */}
        <h2 className="text-xl font-bold font-[Manrope] mb-4">📚 Available Courses</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {courses.map(course => (
            <a key={course.id} href={`/kids/challenges?course=${course.slug}`}
              className="bg-white rounded-2xl p-5 border-2 border-gray-100 hover:border-orange-300 transition-all shadow-sm hover:shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{course.icon_emoji}</span>
                <div>
                  <h3 className="font-bold">{course.title}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Ages {course.age_group}</span>
                </div>
              </div>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>📝 {course.lesson_count} lessons</span>
                <span>🎯 {course.challenge_count} challenges</span>
              </div>
            </a>
          ))}
        </div>

        {/* How it works */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8">
          <h3 className="font-bold text-lg mb-4 text-blue-800">🚀 How It Works</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Pick a Challenge', desc: 'Choose from beginner to advanced coding challenges', emoji: '🎯' },
              { step: '2', title: 'Drag & Drop Code', desc: 'Use colorful blocks to write code — no typing needed!', emoji: '🧩' },
              { step: '3', title: 'Watch It Run!', desc: 'Press Run and see your code come to life on the game stage', emoji: '🎮' },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="text-4xl mb-2">{s.emoji}</div>
                <div className="font-bold text-sm">{s.title}</div>
                <p className="text-xs text-gray-600 mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Badges preview */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-8">
          <h3 className="font-bold text-lg mb-4">🏅 Badges to Earn</h3>
          <div className="flex flex-wrap gap-4">
            {[
              { emoji: '🎉', title: 'First Code', desc: 'Complete your first challenge' },
              { emoji: '🔥', title: '3-Day Streak', desc: 'Code 3 days in a row' },
              { emoji: '💪', title: 'Week Warrior', desc: 'Code 7 days in a row' },
              { emoji: '💯', title: 'Century Club', desc: 'Earn 100 points' },
              { emoji: '⚡', title: 'Super Coder', desc: 'Earn 500 points' },
              { emoji: '🏆', title: 'Course Master', desc: 'Complete a full course' },
              { emoji: '🌟', title: 'Perfect Score', desc: 'Finish all challenges in a lesson' },
              { emoji: '🎨', title: 'Artist', desc: 'Complete all creative coding challenges' },
            ].map(b => (
              <div key={b.title} className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2 opacity-60">
                <span className="text-2xl grayscale">{b.emoji}</span>
                <div>
                  <p className="font-semibold text-xs">{b.title}</p>
                  <p className="text-[10px] text-gray-500">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <a href="/kids/challenges" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-2xl text-lg transition-all inline-block shadow-md">
            🎯 Start Coding Now!
          </a>
        </div>
      </div>
    );
  }

  // ─── Authenticated dashboard with real progress ───
  const { profile, streak, stats, recent_achievements, recent_progress } = data;
  const progressPercent = stats.total_challenges > 0 ? Math.round((stats.challenges_completed / stats.total_challenges) * 100) : 0;
  const levelTitle = LEVEL_TITLES[Math.min(stats.current_level - 1, LEVEL_TITLES.length - 1)] || 'Coder';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-3xl p-8 text-white mb-8 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="text-6xl">{AVATAR_EMOJIS[profile.avatar_type] || '🤖'}</div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-[Manrope]">{profile.display_name}</h1>
            <p className="opacity-90">Level {stats.current_level} {levelTitle} ⚡</p>
          </div>
          <div className="ml-auto text-right hidden md:block">
            <div className="text-4xl font-bold">{stats.total_points}</div>
            <div className="text-sm opacity-80">Total Points ⭐</div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Points', value: stats.total_points, emoji: '⭐' },
          { label: 'Streak', value: `${streak.current_streak} days`, emoji: '🔥' },
          { label: 'Challenges Done', value: `${stats.challenges_completed}/${stats.total_challenges}`, emoji: '✅' },
          { label: 'Badges Earned', value: stats.badges_earned, emoji: '🏅' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 text-center shadow-sm">
            <div className="text-3xl mb-1">{s.emoji}</div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-8">
        <div className="flex justify-between mb-2">
          <span className="font-semibold">Overall Progress</span>
          <span className="text-orange-500 font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full bg-orange-100 rounded-full h-4">
          <div className="bg-orange-500 h-4 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
        <p className="text-sm text-gray-500 mt-1">{stats.challenges_completed} of {stats.total_challenges} challenges completed</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Achievements */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="font-bold text-lg mb-4">🏅 Recent Badges</h3>
          {recent_achievements.length === 0 ? (
            <p className="text-gray-400 text-sm">Complete challenges to earn badges!</p>
          ) : (
            <div className="space-y-3">
              {recent_achievements.map(a => (
                <div key={a.id} className="flex items-center gap-3 bg-orange-50 rounded-xl p-3">
                  <span className="text-2xl">{a.icon_emoji}</span>
                  <div>
                    <p className="font-semibold text-sm">{a.title}</p>
                    <p className="text-xs text-gray-500">{new Date(a.earned_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="font-bold text-lg mb-4">📝 Recent Activity</h3>
          {recent_progress.length === 0 ? (
            <p className="text-gray-400 text-sm">Start a challenge to see your activity!</p>
          ) : (
            <div className="space-y-3">
              {recent_progress.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <span>{p.completed ? '✅' : '🔄'}</span>
                    <span className="text-sm font-medium">{p.challenge_title}</span>
                  </div>
                  {p.completed && <span className="text-orange-500 text-sm font-bold">+{p.points_earned}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <a href="/kids/challenges" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-2xl text-lg transition-all inline-block">
          🎯 Continue Coding!
        </a>
      </div>
    </div>
  );
}
