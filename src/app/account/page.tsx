'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import PointsBadge from '@/components/gamification/PointsBadge';

type Tab = 'courses' | 'settings' | 'wishlist' | 'quizzes' | 'certificates' | 'points' | 'membership';

const mockCourses = [
  { id: 1, course: { title: { en: 'Introduction to Python' }, slug: 'introduction-to-python' }, progress_percent: 65, enrolled_at: '2024-01-15' },
  { id: 2, course: { title: { en: 'Complete Web Development' }, slug: 'complete-web-development' }, progress_percent: 30, enrolled_at: '2024-02-01' },
];

const mockCerts = [
  { id: 1, certificate_id: 'abc-123-def', course_title: 'Python Basics', issued_at: '2024-03-01' },
];

const mockPoints = { total_points: 1850, redeemed_points: 200, available_points: 1650 };
const mockHistory = [
  { id: 1, action: 'lesson_completed', points: 10, description: 'Completed lesson', created_at: '2024-02-20' },
  { id: 2, action: 'quiz_passed', points: 25, description: 'Passed quiz', created_at: '2024-02-21' },
];

export default function AccountPage() {
  const [tab, setTab] = useState<Tab>('courses');
  const [courses, setCourses] = useState(mockCourses);
  const [certs, setCerts] = useState(mockCerts);
  const [points, setPoints] = useState(mockPoints);
  const [pointHistory, setPointHistory] = useState(mockHistory);

  useEffect(() => {
    // Try loading real data
    api.get('/courses/wishlist/').catch(() => {});
    api.get('/points/balance/').then(setPoints).catch(() => {});
    api.get('/points/history/').then(setPointHistory).catch(() => {});
  }, []);

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'courses', label: 'Enrolled Courses', icon: '📚' },
    { key: 'certificates', label: 'Certificates', icon: '🏆' },
    { key: 'points', label: 'Points', icon: '🪙' },
    { key: 'wishlist', label: 'Wishlist', icon: '❤️' },
    { key: 'quizzes', label: 'Quizzes', icon: '❓' },
    { key: 'membership', label: 'Membership', icon: '⭐' },
    { key: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold">
          J
        </div>
        <div>
          <h1 className="text-2xl font-heading font-bold">My Account</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-gray-500">john@example.com</span>
            <PointsBadge points={points.available_points} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-8 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
              tab === t.key ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'courses' && (
        <div className="space-y-4">
          {courses.map((e) => (
            <Link key={e.id} href={`/courses/${e.course.slug}/learn`}>
              <div className="border rounded-lg p-4 hover:bg-gray-50 transition">
                <h3 className="font-medium">{e.course.title.en}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${e.progress_percent}%` }} />
                  </div>
                  <span className="text-sm text-gray-500">{Math.round(e.progress_percent)}%</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {tab === 'certificates' && (
        <div className="space-y-4">
          {certs.map((c) => (
            <Link key={c.id} href={`/certificates/verify/${c.certificate_id}`}>
              <div className="border rounded-lg p-4 hover:bg-gray-50 transition flex items-center gap-4">
                <div className="text-3xl">🏆</div>
                <div>
                  <h3 className="font-medium">{c.course_title}</h3>
                  <p className="text-sm text-gray-500">Issued: {new Date(c.issued_at).toLocaleDateString()}</p>
                </div>
                <span className="ml-auto text-orange-500 text-sm">View →</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {tab === 'points' && (
        <div>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{points.total_points}</div>
              <div className="text-sm text-gray-500">Total Earned</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{points.available_points}</div>
              <div className="text-sm text-gray-500">Available</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{points.redeemed_points}</div>
              <div className="text-sm text-gray-500">Redeemed</div>
            </div>
          </div>
          <h3 className="font-medium mb-3">Recent Activity</h3>
          <div className="space-y-2">
            {pointHistory.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="text-sm">{t.description}</p>
                  <p className="text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`font-medium ${t.points > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {t.points > 0 ? '+' : ''}{t.points} 🪙
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'wishlist' && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-2">❤️</div>
          <p>Your wishlist courses will appear here</p>
          <Link href="/courses" className="text-orange-500 text-sm mt-2 inline-block">Browse Courses →</Link>
        </div>
      )}

      {tab === 'quizzes' && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-2">❓</div>
          <p>Your quiz attempts will appear here</p>
        </div>
      )}

      {tab === 'membership' && (
        <div className="border rounded-xl p-6">
          <h3 className="font-heading font-bold text-lg mb-2">Free Plan</h3>
          <p className="text-gray-500 mb-4">Upgrade to Pro for unlimited access to all courses</p>
          <Link href="/pricing" className="px-6 py-2 bg-orange-500 text-white rounded-lg inline-block hover:bg-orange-600">
            Upgrade to Pro
          </Link>
        </div>
      )}

      {tab === 'settings' && (
        <div className="max-w-md space-y-4">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Display Name</label>
            <input defaultValue="John Doe" className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Email</label>
            <input defaultValue="john@example.com" className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
