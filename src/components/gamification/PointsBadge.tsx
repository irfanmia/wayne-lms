'use client';

interface PointsBadgeProps {
  points: number;
}

export default function PointsBadge({ points }: PointsBadgeProps) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm font-medium">
      <span>🪙</span>
      <span>{points.toLocaleString()}</span>
    </div>
  );
}
