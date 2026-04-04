'use client';
import { useState } from 'react';
import { lessonTypeConfig } from '@/data/mockCourseBuilder';

type LessonType = 'text' | 'video' | 'audio' | 'slides' | 'stream' | 'quiz' | 'assignment' | 'exercise';

interface LessonItem {
  id: string;
  type: LessonType;
  title: string;
  duration?: string;
  isPreview?: boolean;
  isDrip?: boolean;
}

interface Section {
  id: string;
  title: string;
  isExpanded: boolean;
  items: LessonItem[];
}
import SearchMaterialsModal from './SearchMaterialsModal';

interface Props {
  sections: Section[];
  setSections: (s: Section[]) => void;
  selectedItemId: string | null;
  onSelectItem: (id: string, type: LessonType) => void;
}

const lessonTypes: LessonType[] = ['text', 'video', 'audio', 'slides', 'stream', 'quiz', 'assignment', 'exercise'];

export default function CurriculumSidebar({ sections, setSections, selectedItemId, onSelectItem }: Props) {
  const [showSearch, setShowSearch] = useState(false);
  const [addDropdownSection, setAddDropdownSection] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [allCollapsed, setAllCollapsed] = useState(false);

  const toggleSection = (id: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, isExpanded: !s.isExpanded } : s));
  };

  const collapseAll = () => {
    const newState = !allCollapsed;
    setSections(sections.map(s => ({ ...s, isExpanded: !newState })));
    setAllCollapsed(newState);
  };

  const addLesson = (sectionId: string, type: LessonType) => {
    const cfg = lessonTypeConfig[type];
    const newItem = { id: `item-${Date.now()}`, type, title: `New ${cfg.label}`, duration: '0 min' };
    setSections(sections.map(s => s.id === sectionId ? { ...s, items: [...s.items, newItem], isExpanded: true } : s));
    setAddDropdownSection(null);
    onSelectItem(newItem.id, type);
  };

  const addSection = () => {
    const newSection: Section = { id: `sec-${Date.now()}`, title: 'New Section', isExpanded: true, items: [] };
    setSections([...sections, newSection]);
  };

  const renameSection = (id: string, title: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, title } : s));
  };

  const deleteSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const deleteItem = (sectionId: string, itemId: string) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, items: s.items.filter(i => i.id !== itemId) } : s));
  };

  return (
    <>
      <div className="w-[380px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-lg font-semibold font-heading">Curriculum</h2>
          <button onClick={collapseAll} className="text-gray-400 hover:text-gray-600 text-sm" title={allCollapsed ? 'Expand all' : 'Collapse all'}>
            {allCollapsed ? '⊞' : '⊟'}
          </button>
        </div>

        {/* Sections */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {sections.map(section => (
            <div key={section.id} className="bg-gray-50 rounded-lg border border-gray-200">
              {/* Section Header */}
              <div className="flex items-center gap-2 px-3 py-2.5 cursor-pointer group" onClick={() => toggleSection(section.id)}>
                <span className="text-gray-300 cursor-grab" title="Drag to reorder">⠿</span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${section.isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {editingSectionId === section.id ? (
                  <input
                    className="flex-1 text-sm font-medium bg-white px-2 py-0.5 rounded border"
                    defaultValue={section.title}
                    onBlur={e => { renameSection(section.id, e.target.value); setEditingSectionId(null); }}
                    onKeyDown={e => { if (e.key === 'Enter') { renameSection(section.id, e.currentTarget.value); setEditingSectionId(null); } }}
                    onClick={e => e.stopPropagation()}
                    autoFocus
                  />
                ) : (
                  <span className="flex-1 text-sm font-medium text-gray-800 truncate">{section.title}</span>
                )}
                <div className="hidden group-hover:flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setEditingSectionId(section.id)} className="text-gray-400 hover:text-blue-500 text-xs" title="Rename">✏️</button>
                  <button onClick={() => deleteSection(section.id)} className="text-gray-400 hover:text-red-500 text-xs" title="Delete">🗑️</button>
                </div>
              </div>

              {/* Items */}
              {section.isExpanded && (
                <div className="px-2 pb-2 space-y-0.5">
                  {section.items.map(item => {
                    const cfg = lessonTypeConfig[item.type];
                    const isSelected = selectedItemId === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => onSelectItem(item.id, item.type)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer group transition ${
                          isSelected ? 'bg-blue-50 border-l-3 border-blue-500' : 'hover:bg-white'
                        }`}
                      >
                        <span className="text-gray-300 cursor-grab text-xs">⠿</span>
                        <span className="text-sm">{cfg.icon}</span>
                        <span className="flex-1 text-sm text-gray-700 truncate">{item.title}</span>
                        {item.duration && <span className="text-xs text-gray-400">{item.duration}</span>}
                        <button
                          onClick={e => { e.stopPropagation(); deleteItem(section.id, item.id); }}
                          className="hidden group-hover:block text-gray-300 hover:text-red-500 text-xs"
                        >✕</button>
                      </div>
                    );
                  })}

                  {/* Add Lesson + Search */}
                  <div className="flex gap-1 pt-1 px-1">
                    <div className="relative flex-1">
                      <button
                        onClick={e => { e.stopPropagation(); setAddDropdownSection(addDropdownSection === section.id ? null : section.id); }}
                        className="w-full text-xs text-gray-400 hover:text-orange-500 py-1.5 rounded hover:bg-orange-50 transition flex items-center justify-center gap-1"
                      >
                        ➕ Add a lesson
                      </button>
                      {addDropdownSection === section.id && (
                        <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-xl border py-1 z-40 w-48">
                          {lessonTypes.map(type => {
                            const cfg = lessonTypeConfig[type];
                            return (
                              <button
                                key={type}
                                onClick={() => addLesson(section.id, type)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50 text-left"
                              >
                                <span>{cfg.icon}</span>
                                <span>{cfg.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setShowSearch(true)}
                      className="text-xs text-gray-400 hover:text-orange-500 py-1.5 px-2 rounded hover:bg-orange-50 transition"
                    >
                      🔍
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* New Section Button */}
        <div className="p-3 border-t border-gray-100">
          <button onClick={addSection} className="w-full py-2 text-sm text-orange-500 hover:bg-orange-50 rounded-lg transition font-medium">
            ➕ New section
          </button>
        </div>
      </div>

      {showSearch && <SearchMaterialsModal onClose={() => setShowSearch(false)} onAdd={(_id) => { /* TODO: implement add material handler */ }} />}
    </>
  );
}
