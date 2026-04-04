'use client';
import { useState, useEffect } from 'react';
import { lessonTypeConfig } from '@/data/mockCourseBuilder';
import api from '@/lib/api';

type LessonType = 'text' | 'video' | 'audio' | 'slides' | 'stream' | 'quiz' | 'assignment' | 'exercise';

interface Material {
  id: string;
  type: LessonType;
  title: string;
  course: string;
}

export default function SearchMaterialsModal({ onClose, onAdd }: { onClose: () => void; onAdd: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.getLessons()
      .then(res => {
        const list = res.results || res;
        if (Array.isArray(list)) {
          setMaterials(list.map((item: Record<string, unknown>) => ({
            id: String(item.id || ''),
            type: ((item.lesson_type as string) || (item.type as string) || 'text') as LessonType,
            title: typeof item.title === 'object' && item.title !== null ? ((item.title as Record<string, string>).en || Object.values(item.title as Record<string, string>)[0] || '') : (item.title as string) || '',
            course: (item.course_title as string) || (item.course_name as string) || '',
          })));
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = materials.filter(m =>
    m.title.toLowerCase().includes(query.toLowerCase()) || m.course.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold font-heading">Search Materials</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <input
            type="text"
            placeholder="Search lessons, quizzes across all courses..."
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500" /></div>
          ) : error ? (
            <p className="text-center text-red-500 py-8 text-sm">⚠️ {error}</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No materials found</p>
          ) : (
            filtered.map(m => {
              const cfg = lessonTypeConfig[m.type] || lessonTypeConfig['text'];
              return (
                <button
                  key={m.id}
                  onClick={() => { onAdd(m.id); onClose(); }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-left transition"
                >
                  <span className="text-lg">{cfg.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.title}</p>
                    <p className="text-xs text-gray-400">{m.course}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
