'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import StatsCards from '@/components/instructor/StatsCards';

interface CourseItem {
  id: number;
  slug: string;
  title: Record<string, string>;
  level: string;
}

const mockStats = { total_courses: 8, total_enrollments: 1250, total_revenue: 24500, completion_rate: 67 };
const mockRevenue = { months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], revenue: [1200, 1800, 2400, 2100, 3200, 2800] };

export default function InstructorDashboard() {
  const [stats, setStats] = useState(mockStats);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [revenue, setRevenue] = useState(mockRevenue);

  useEffect(() => {
    api.get('/analytics/instructor/').then(setStats).catch(() => {});
    api.get('/instructor/courses/').then(setCourses).catch(() => {});
    api.get('/analytics/instructor/revenue/').then(setRevenue).catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-heading font-bold mb-8">Instructor Dashboard</h1>

      <StatsCards stats={stats} />

      {/* Revenue Chart (simple bar) */}
      <div className="mt-8 bg-white border rounded-xl p-6">
        <h2 className="font-heading font-bold text-lg mb-4">Monthly Revenue</h2>
        <div className="flex items-end gap-2 h-40">
          {revenue.months.map((m, i) => {
            const max = Math.max(...revenue.revenue);
            const h = (revenue.revenue[i] / max) * 100;
            return (
              <div key={m} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500">${revenue.revenue[i]}</span>
                <div
                  className="w-full bg-orange-500 rounded-t"
                  style={{ height: `${h}%` }}
                />
                <span className="text-xs text-gray-500">{m}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Courses */}
      <div className="mt-8">
        <h2 className="font-heading font-bold text-lg mb-4">Your Courses</h2>
        <div className="space-y-3">
          {courses.map((c) => (
            <Link key={c.id} href={`/instructor/courses/${c.id}/students`}>
              <div className="border rounded-lg p-4 hover:bg-gray-50 transition flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{c.title?.en || Object.values(c.title)[0]}</h3>
                  <p className="text-sm text-gray-500 capitalize">{c.level}</p>
                </div>
                <span className="text-orange-500 text-sm">Manage Students →</span>
              </div>
            </Link>
          ))}
          {courses.length === 0 && (
            <p className="text-gray-400 text-center py-8">No courses found. Stats shown are mock data.</p>
          )}
        </div>
      </div>
    </div>
  );
}
