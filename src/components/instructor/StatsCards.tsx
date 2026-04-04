'use client';

interface StatsCardsProps {
  stats: {
    total_courses: number;
    total_enrollments: number;
    total_revenue: number;
    completion_rate: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    { label: 'Courses', value: stats.total_courses, icon: '📚', color: 'bg-blue-50 text-blue-700' },
    { label: 'Students', value: stats.total_enrollments, icon: '👥', color: 'bg-green-50 text-green-700' },
    { label: 'Revenue', value: `$${stats.total_revenue.toLocaleString()}`, icon: '💰', color: 'bg-orange-50 text-orange-700' },
    { label: 'Completion Rate', value: `${stats.completion_rate}%`, icon: '🎯', color: 'bg-purple-50 text-purple-700' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className={`rounded-xl p-5 ${c.color}`}>
          <div className="text-2xl mb-2">{c.icon}</div>
          <div className="text-2xl font-bold">{c.value}</div>
          <div className="text-sm opacity-70">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
