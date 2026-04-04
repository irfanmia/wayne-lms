'use client';

type Concept = {
  slug: string;
  name: string;
  x: number;
  y: number;
  prerequisites: string[];
  status: string;
};

const statusColors: Record<string, { fill: string; stroke: string; text: string }> = {
  completed: { fill: '#10B981', stroke: '#059669', text: '#ffffff' },
  'in-progress': { fill: '#F97316', stroke: '#EA580C', text: '#ffffff' },
  available: { fill: '#3B82F6', stroke: '#2563EB', text: '#ffffff' },
  locked: { fill: '#F3F4F6', stroke: '#D1D5DB', text: '#9CA3AF' },
};

export default function ConceptTree({ concepts }: { concepts: Concept[] }) {
  const conceptMap = Object.fromEntries(concepts.map(c => [c.slug, c]));

  const lines: { x1: number; y1: number; x2: number; y2: number; locked: boolean }[] = [];
  for (const c of concepts) {
    for (const pre of c.prerequisites) {
      const parent = conceptMap[pre];
      if (parent) {
        lines.push({ x1: parent.x, y1: parent.y + 20, x2: c.x, y2: c.y - 20, locked: c.status === 'locked' });
      }
    }
  }

  return (
    <div className="overflow-x-auto">
      <svg width="800" height="620" className="mx-auto">
        {lines.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke={l.locked ? '#D1D5DB' : '#F97316'} strokeWidth="2" strokeDasharray={l.locked ? '4' : '0'} opacity={l.locked ? 0.4 : 0.5} />
        ))}
        {concepts.map(c => {
          const col = statusColors[c.status] || statusColors.locked;
          return (
            <g key={c.slug}>
              <rect x={c.x - 60} y={c.y - 18} width="120" height="36" rx="8"
                fill={col.fill} stroke={col.stroke} strokeWidth="1.5" opacity={c.status === 'locked' ? 0.6 : 1} />
              <text x={c.x} y={c.y + 5} textAnchor="middle" fill={col.text} fontSize="12" fontWeight="500">{c.name}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
