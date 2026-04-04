'use client';
import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { ConceptMapNode, ConceptMapEdge } from '@/data/mockPracticeData';

interface Props {
  nodes: ConceptMapNode[];
  edges: ConceptMapEdge[];
  onSelectConcept: (slug: string) => void;
}

const statusColors = {
  completed: { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-700', ring: 'ring-green-200', arrow: '#22c55e' },
  in_progress: { bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-700', ring: 'ring-orange-200', arrow: '#f97316' },
  not_started: { bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-700', ring: 'ring-gray-100', arrow: '#9CA3AF' },
  locked: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-400', ring: 'ring-gray-50', arrow: '#D1D5DB' },
};

const NODE_W = 180;
const NODE_H = 72;
const ROW_GAP = 100;
const TOP_PAD = 50;

export default function ConceptMap({ nodes, edges, onSelectConcept }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(600);

  const updateWidth = useCallback(() => {
    if (containerRef.current) {
      setContainerW(containerRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [updateWidth]);

  // Auto-compute layout from edges (topological sort into rows)
  const layout = useMemo(() => {
    const result: Record<number, { row: number; col: number; totalCols: number }> = {};
    const inDegree: Record<number, number> = {};
    const children: Record<number, number[]> = {};

    // Initialize
    nodes.forEach(n => { inDegree[n.id] = 0; children[n.id] = []; });
    edges.forEach(e => {
      inDegree[e.to] = (inDegree[e.to] || 0) + 1;
      if (!children[e.from]) children[e.from] = [];
      children[e.from].push(e.to);
    });

    // BFS to assign rows
    const rowNodes: number[][] = [];
    const assigned = new Set<number>();
    let queue = nodes.filter(n => !inDegree[n.id] || inDegree[n.id] === 0).map(n => n.id);

    while (queue.length > 0) {
      rowNodes.push([...queue]);
      queue.forEach(id => assigned.add(id));
      const nextQueue: number[] = [];
      queue.forEach(id => {
        (children[id] || []).forEach(childId => {
          if (!assigned.has(childId) && !nextQueue.includes(childId)) {
            // Check all parents are assigned
            const allParentsAssigned = edges
              .filter(e => e.to === childId)
              .every(e => assigned.has(e.from));
            if (allParentsAssigned) nextQueue.push(childId);
          }
        });
      });
      // Safety: if nothing was added but unassigned nodes remain
      if (nextQueue.length === 0) {
        const remaining = nodes.filter(n => !assigned.has(n.id)).map(n => n.id);
        if (remaining.length > 0) {
          nextQueue.push(...remaining);
        }
      }
      queue = nextQueue;
      if (rowNodes.length > 20) break; // safety
    }

    // Assign positions
    rowNodes.forEach((row, rowIdx) => {
      row.forEach((id, colIdx) => {
        result[id] = { row: rowIdx, col: colIdx, totalCols: row.length };
      });
    });

    return result;
  }, [nodes, edges]);

  const getNodeCenter = (id: number) => {
    const l = layout[id];
    if (!l) return { x: 0, y: 0 };
    const usableW = Math.max(containerW - 40, 300);
    const colWidth = usableW / l.totalCols;
    const x = 20 + colWidth * l.col + colWidth / 2;
    const y = TOP_PAD + l.row * ROW_GAP + NODE_H / 2;
    return { x, y };
  };

  const totalRows = Math.max(...Object.values(layout).map(l => l.row), 0) + 1;
  const totalH = TOP_PAD + totalRows * ROW_GAP + 20;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-heading font-bold text-gray-800 mb-4">🗺️ Concept Map</h3>
      <div
        ref={containerRef}
        className="relative bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto"
        style={{ minHeight: `${totalH}px` }}
      >
        {/* SVG arrows */}
        <svg
          className="absolute inset-0 w-full pointer-events-none"
          style={{ height: `${totalH}px`, zIndex: 0 }}
        >
          <defs>
            <marker id="arrow-green" markerWidth="12" markerHeight="10" refX="10" refY="5" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
            <marker id="arrow-orange" markerWidth="12" markerHeight="10" refX="10" refY="5" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
            <marker id="arrow-gray" markerWidth="12" markerHeight="10" refX="10" refY="5" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
            <marker id="arrow-light" markerWidth="12" markerHeight="10" refX="10" refY="5" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
            <marker id="dot-green" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="3" fill="#22c55e" />
            </marker>
            <marker id="dot-orange" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="3" fill="#f97316" />
            </marker>
            <marker id="dot-gray" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="3" fill="#9CA3AF" />
            </marker>
            <marker id="dot-light" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="3" fill="#D1D5DB" />
            </marker>
          </defs>
          {edges.map((edge, i) => {
            const from = getNodeCenter(edge.from);
            const to = getNodeCenter(edge.to);
            if (!from.x || !to.x) return null;

            const fromNode = nodes.find(n => n.id === edge.from);
            const arrowColor = fromNode ? statusColors[fromNode.status]?.arrow || '#9CA3AF' : '#9CA3AF';
            const markerId = arrowColor === '#22c55e' ? 'arrow-green'
              : arrowColor === '#f97316' ? 'arrow-orange'
              : arrowColor === '#D1D5DB' ? 'arrow-light' : 'arrow-gray';
            const dotId = markerId.replace('arrow-', 'dot-');

            const startY = from.y + NODE_H / 2;
            const endY = to.y - NODE_H / 2 - 10;
            const midY = (startY + endY) / 2;
            const radius = Math.min(16, Math.abs(endY - startY) / 4, Math.abs(to.x - from.x) / 2 || 999);

            const isSameCol = Math.abs(from.x - to.x) < 10;
            const d = isSameCol
              ? `M ${from.x} ${startY} L ${from.x} ${endY}`
              : `M ${from.x} ${startY} L ${from.x} ${midY - radius} Q ${from.x} ${midY}, ${from.x + (to.x > from.x ? radius : -radius)} ${midY} L ${to.x - (to.x > from.x ? radius : -radius)} ${midY} Q ${to.x} ${midY}, ${to.x} ${midY + radius} L ${to.x} ${endY}`;

            return (
              <path
                key={i}
                d={d}
                fill="none"
                stroke={arrowColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={fromNode?.status === 'locked' ? '6 4' : 'none'}
                markerStart={`url(#${dotId})`}
                markerEnd={`url(#${markerId})`}
                opacity={0.8}
              />
            );
          })}
        </svg>

        {/* Node cards */}
        {nodes.map(node => {
          const center = getNodeCenter(node.id);
          if (!center.x) return null;
          const colors = statusColors[node.status];
          const isActive = node.status === 'in_progress' || node.status === 'completed';

          return (
            <button
              key={node.id}
              onClick={() => node.status !== 'locked' && onSelectConcept(node.slug)}
              className={`absolute ${colors.bg} ${colors.border} border-2 rounded-xl px-3 py-2.5
                ${node.status !== 'locked' ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : 'cursor-default opacity-70'}
                transition-all duration-200 text-left ${isActive ? `ring-4 ${colors.ring}` : ''}`}
              style={{
                left: `${center.x}px`,
                top: `${center.y}px`,
                transform: 'translate(-50%, -50%)',
                width: `${NODE_W}px`,
                minHeight: `${NODE_H}px`,
                zIndex: 1,
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{node.icon}</span>
                <span className={`font-semibold text-sm ${colors.text} truncate`}>{node.title}</span>
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-gray-500">
                  {node.completed}/{node.total} exercises
                </span>
                {node.total > 0 && (
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${node.status === 'completed' ? 'bg-green-400' : 'bg-orange-400'}`}
                      style={{ width: `${(node.completed / node.total) * 100}%` }}
                    />
                  </div>
                )}
              </div>
              {node.status === 'completed' && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">✓</span>
              )}
              {node.status === 'locked' && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-300 text-white rounded-full flex items-center justify-center text-xs shadow-sm">🔒</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
