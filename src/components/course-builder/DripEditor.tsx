'use client';
import { useState, useEffect } from 'react';
import { lessonTypeConfig } from '@/data/mockCourseBuilder';
import { useCourseBuilder } from './CourseBuilderLayout';
import api from '@/lib/api';

export default function DripEditor() {
  const { courseData } = useCourseBuilder();
  const [sections, setSections] = useState<{ id: string; title: string; items: { id: string; type: string; title: string }[] }[]>([]);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (courseData?.sections) {
      setSections(courseData.sections);
    }
  }, [courseData]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [dependencies, setDependencies] = useState<Record<string, string[]>>({
    'item-5': ['item-4'],
    'item-9': ['item-8'],
  });

  const allItems = sections.flatMap(s => s.items.map(i => ({ ...i, section: s.title })));

  const handleSave = async () => {
    if (!courseData?.slug) return;
    setSaving(true);
    setFeedback(null);
    try {
      // Save drip dependencies — each entry maps a lesson to its prerequisites
      const schedules = Object.entries(dependencies).map(([itemId, deps]) => ({
        lesson_id: itemId,
        prerequisites: deps,
      }));
      await api.post(`/courses/drip-schedules/`, {
        course_slug: courseData.slug,
        schedules,
      } as Record<string, unknown>);
      setFeedback({ type: 'success', message: 'Drip settings saved successfully!' });
    } catch (err: unknown) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save drip settings' });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Left: Curriculum Tree */}
      <div className="w-[340px] flex-shrink-0 bg-white border-r overflow-y-auto p-4">
        <h3 className="text-lg font-semibold font-heading mb-4">Curriculum</h3>
        {sections.map(section => (
          <div key={section.id} className="mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">{section.title}</p>
            {section.items.map(item => {
              const cfg = lessonTypeConfig[item.type as keyof typeof lessonTypeConfig];
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left text-sm transition ${
                    selectedItem === item.id ? 'bg-blue-50 border-l-3 border-blue-500' : 'hover:bg-gray-50'
                  }`}
                >
                  <span>{cfg.icon}</span>
                  <span className="truncate">{item.title}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Right: Dependency Builder */}
      <div className="flex-1 p-6 overflow-y-auto"><div className="w-[70%] mx-auto">
        {selectedItem ? (
          <div>
            <h3 className="text-lg font-semibold font-heading mb-2">
              Dependencies for: {allItems.find(i => i.id === selectedItem)?.title}
            </h3>
            <p className="text-sm text-gray-400 mb-4">Select which items must be completed before this item unlocks.</p>

            <div className="space-y-2">
              {allItems.filter(i => i.id !== selectedItem).map(item => {
                const cfg = lessonTypeConfig[item.type as keyof typeof lessonTypeConfig];
                const isDependent = dependencies[selectedItem]?.includes(item.id);
                return (
                  <label key={item.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition ${isDependent ? 'border-orange-300 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="checkbox"
                      className="accent-orange-500"
                      checked={isDependent}
                      onChange={e => {
                        const deps = dependencies[selectedItem] || [];
                        setDependencies({
                          ...dependencies,
                          [selectedItem]: e.target.checked ? [...deps, item.id] : deps.filter(d => d !== item.id),
                        });
                      }}
                    />
                    <span>{cfg.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-gray-400">{item.section}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Save button */}
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Drip Settings'}
              </button>
              {feedback && (
                <span className={`text-sm ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {feedback.message}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center text-gray-400">
            <div>
              <p className="text-5xl mb-3">🔗</p>
              <p className="text-sm">Select an item from the curriculum to set up drip dependencies</p>
            </div>
          </div>
        )}
      </div></div>
    </div>
  );
}
