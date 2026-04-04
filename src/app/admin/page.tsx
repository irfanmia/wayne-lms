'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

type StatItem = { label: string; value: string; trend: string; up: boolean };
type EnrollmentItem = { student: string; course: string; date: string; plan: string };
type ActivityItem = { action: string; detail: string; time: string };

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [recentEnrollments, setRecentEnrollments] = useState<EnrollmentItem[]>([]);
  const [activities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getInstructorAnalytics().catch(() => null),
      api.getRevenueStats().catch(() => null),
      api.getUserStats().catch(() => null),
      api.getCourses().catch(() => null),
    ]).then(([analyticsData, revenueData, userStats, coursesData]) => {
      const newStats: StatItem[] = [
        { label: 'Total Students', value: '0', trend: '', up: true },
        { label: 'Total Courses', value: '0', trend: '', up: true },
        { label: 'Active Enrollments', value: '0', trend: '', up: true },
        { label: 'Revenue This Month', value: '$0', trend: '', up: true },
      ];
      if (userStats) {
        const studentCount = userStats.students ?? userStats.total ?? userStats.total_users ?? 0;
        newStats[0] = { ...newStats[0], value: Number(studentCount).toLocaleString() };
      }
      if (coursesData) {
        const count = coursesData.count || (Array.isArray(coursesData) ? coursesData.length : 0);
        if (count) newStats[1] = { ...newStats[1], value: String(count) };
      }
      if (analyticsData) {
        if (analyticsData.total_enrollments !== undefined) newStats[2] = { ...newStats[2], value: Number(analyticsData.total_enrollments).toLocaleString() };
      }
      if (revenueData) {
        if (revenueData.total_revenue !== undefined) newStats[3] = { ...newStats[3], value: `$${Number(revenueData.total_revenue).toLocaleString()}` };
      }
      setStats(newStats);

      // Try to get recent enrollments from orders
      if (coursesData) {
        const list = coursesData.results || coursesData;
        if (Array.isArray(list)) {
          setRecentEnrollments(list.slice(0, 10).map((c: Record<string, unknown>) => ({
            student: (c.instructor as string) || '',
            course: typeof c.title === 'object' && c.title !== null ? ((c.title as Record<string, string>).en || '') : (c.title as string) || '',
            date: (c.updated_at as string) || '',
            plan: (c.is_free as boolean) ? 'Free' : 'Premium',
          })));
        }
      }
    }).catch(err => setError(err.message || 'Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500" /></div>;
  if (error) return <div className="flex items-center justify-center h-64"><div className="text-center"><p className="text-red-500 text-lg mb-2">⚠️ Failed to load dashboard</p><p className="text-gray-500 text-sm">{error}</p></div></div>;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold font-heading">Welcome back, Admin! 👋</h2>
        <p className="text-orange-100 mt-1">Here&apos;s what&apos;s happening on your platform today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{s.value}</p>
            <span className={`text-sm font-medium ${s.up ? 'text-green-600' : 'text-red-500'}`}>
              {s.up ? '↑' : '↓'} {s.trend}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Enrollments */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 font-heading">Recent Enrollments</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Course</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Plan</th>
                </tr>
              </thead>
              <tbody>
                {recentEnrollments.map((e, i) => (
                  <tr key={i} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm text-gray-900 font-medium">{e.student}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{e.course}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{e.date}</td>
                    <td className="px-5 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${e.plan === 'Premium' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>{e.plan}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 font-heading mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/admin/courses" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700">
                <span className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">📚</span>
                Create Course
              </Link>
              <Link href="/admin/users" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700">
                <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">👥</span>
                Add User
              </Link>
              <Link href="/admin/analytics" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700">
                <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">📊</span>
                View Reports
              </Link>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 font-heading mb-4">Activity Feed</h3>
            <div className="space-y-4">
              {activities.map((a, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{a.action}</p>
                    <p className="text-xs text-gray-500">{a.detail}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
