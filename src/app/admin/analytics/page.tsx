'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

type KpiItem = { label: string; value: string; trend: string; up: boolean; icon: string };
type ChartBar = { month: string; value: number };
type TopCourse = { name: string; students: number; pct: number };
type CompletionRate = { cat: string; rate: number; color: string };

const dateRanges = ['Last 7 Days', 'Last 30 Days', 'Last 3 Months', 'Last 6 Months', 'This Year', 'Custom'];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('Last 6 Months');
  const [startDate, setStartDate] = useState('2026-02-01');
  const [endDate, setEndDate] = useState('2026-02-26');
  const [kpis, setKpis] = useState<KpiItem[]>([]);
  const [enrollmentData, setEnrollmentData] = useState<ChartBar[]>([]);
  const [revenueData, setRevenueData] = useState<ChartBar[]>([]);
  const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
  const [completionRates, setCompletionRates] = useState<CompletionRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getInstructorAnalytics(),
      api.getRevenueStats(),
      api.getUserStats(),
      api.getAdminChartData().catch(() => null),
    ]).then(([analyticsData, revenueStats, userStats, chartData]) => {
      const newKpis: KpiItem[] = [
        { label: 'Total Enrollments', value: '0', trend: '', up: true, icon: '👥' },
        { label: 'Total Revenue', value: '$0', trend: '', up: true, icon: '💰' },
        { label: 'Completion Rate', value: '0%', trend: '', up: true, icon: '🎯' },
        { label: 'Total Students', value: '0', trend: '', up: true, icon: '⭐' },
      ];
      if (analyticsData) {
        if (analyticsData.total_enrollments !== undefined) newKpis[0] = { ...newKpis[0], value: Number(analyticsData.total_enrollments).toLocaleString() };
        if (analyticsData.total_revenue !== undefined) newKpis[1] = { ...newKpis[1], value: `$${Number(analyticsData.total_revenue).toLocaleString()}` };
        if (analyticsData.completion_rate !== undefined) newKpis[2] = { ...newKpis[2], value: `${analyticsData.completion_rate}%` };
      }
      if (revenueStats && revenueStats.total_revenue !== undefined) {
        newKpis[1] = { ...newKpis[1], value: `$${Number(revenueStats.total_revenue).toLocaleString()}` };
      }
      if (userStats) {
        const studentCount = userStats.students ?? userStats.total ?? 0;
        newKpis[3] = { ...newKpis[3], value: Number(studentCount).toLocaleString() };
      }
      setKpis(newKpis);

      // Chart data
      if (chartData) {
        setEnrollmentData(chartData.enrollment_trend || []);
        setRevenueData(chartData.revenue_trend || []);
        setTopCourses(chartData.top_courses || []);
        setCompletionRates(chartData.completion_rates || []);
      }
    }).catch(err => setError(err.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  const maxEnroll = enrollmentData.length ? Math.max(...enrollmentData.map(d => d.value), 1) : 1;
  const maxRevenue = revenueData.length ? Math.max(...revenueData.map(d => d.value), 1) : 1;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500" /></div>;
  if (error) return <div className="flex items-center justify-center h-64"><p className="text-red-500">⚠️ {error}</p></div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 font-heading">Analytics</h2>
        <div className="flex items-center gap-2">
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
            {dateRanges.map(r => <option key={r}>{r}</option>)}
          </select>
          {dateRange === 'Custom' && (
            <>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <span className="text-gray-400">to</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{k.label}</p>
              <span className="text-2xl">{k.icon}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trend */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Trend</h3>
          {enrollmentData.length > 0 ? (
            <div className="space-y-3">
              {enrollmentData.map(d => (
                <div key={d.month} className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-10">{d.month}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-400 to-orange-500 h-6 rounded-full flex items-center justify-end pr-2 transition-all" style={{ width: `${(d.value / maxEnroll) * 100}%` }}>
                      <span className="text-xs text-white font-medium">{d.value.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">No enrollment data yet</p>
          )}
        </div>

        {/* Revenue */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue</h3>
          {revenueData.length > 0 ? (
            <div className="space-y-3">
              {revenueData.map(d => (
                <div key={d.month} className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-10">{d.month}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-400 to-green-500 h-6 rounded-full flex items-center justify-end pr-2 transition-all" style={{ width: `${(d.value / maxRevenue) * 100}%` }}>
                      <span className="text-xs text-white font-medium">${(d.value / 1000).toFixed(1)}k</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">No revenue data yet</p>
          )}
        </div>

        {/* Top Courses */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Courses by Enrollment</h3>
          {topCourses.length > 0 ? (
            <div className="space-y-4">
              {topCourses.map((c, i) => (
                <div key={c.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 font-medium">{i + 1}. {c.name}</span>
                    <span className="text-xs text-gray-500">{c.students.toLocaleString()} students</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className="bg-orange-500 h-3 rounded-full transition-all" style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">No course data yet</p>
          )}
        </div>

        {/* Completion Rate */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Rate by Category</h3>
          {completionRates.length > 0 ? (
            <div className="space-y-4">
              {completionRates.map(c => (
                <div key={c.cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{c.cat}</span>
                    <span className="text-sm font-semibold text-gray-900">{c.rate}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className={`${c.color} h-3 rounded-full transition-all`} style={{ width: `${c.rate}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">No category data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
