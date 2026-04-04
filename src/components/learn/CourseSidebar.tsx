'use client';
import { useState } from 'react';

interface SidebarLesson {
  id: number;
  title: Record<string, string>;
  lesson_type: string;
  duration: string | number;
  video_duration?: string;
  order: number;
}

interface SidebarModule {
  id: number;
  title: Record<string, string>;
  order: number;
  lessons: SidebarLesson[];
  quiz: { id: number; title: Record<string, string>; questions_count: number } | null;
}

interface CourseSidebarProps {
  courseSlug: string;
  courseTitle: string;
  modules: SidebarModule[];
  completedLessons: number[];
  currentLessonId: number | null;
  currentQuizId: number | null;
  assessment: { id: number; title: Record<string, string>; questions_count: number } | null;
  onSelectLesson: (id: number) => void;
  onSelectQuiz: (id: number) => void;
  isOpen: boolean;
  onClose: () => void;
  locale?: string;
}

const typeIcon: Record<string, string> = {
  video: '▶',
  text: '📄',
  exercise: '💻',
  quiz: '📝',
  assignment: '📋',
  slides: '🖼',
  stream: '🔴',
};

export default function CourseSidebar({
  courseSlug, courseTitle, modules, completedLessons, currentLessonId, currentQuizId,
  assessment, onSelectLesson, onSelectQuiz, isOpen, onClose, locale = 'en',
}: CourseSidebarProps) {
  const [expanded, setExpanded] = useState<number[]>(modules.map(m => m.id));

  const toggleModule = (id: number) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const t = (obj: Record<string, string>) => obj[locale] || obj['en'] || Object.values(obj)[0] || '';

  return (
    <>
      {/* Overlay on mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-80 bg-white border-r border-gray-200 overflow-y-auto z-50 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <a href={`/courses/${courseSlug}`} className="p-1 text-gray-400 hover:text-orange-500 transition-colors shrink-0" title="Back to course">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </a>
              <h2 className="text-sm font-semibold text-gray-900 truncate font-heading">{courseTitle}</h2>
            </div>
            <button onClick={onClose} className="lg:hidden p-1 text-gray-400 hover:text-gray-600 cursor-pointer shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Modules */}
        <div className="p-2">
          {modules.map(module => {
            const completedCount = module.lessons.filter(l => completedLessons.includes(l.id)).length;
            const totalCount = module.lessons.length;
            const isExpanded = expanded.includes(module.id);

            return (
              <div key={module.id} className="mb-1">
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900 truncate">{t(module.title)}</span>
                  </div>
                  <span className={`text-xs shrink-0 ml-2 ${completedCount === totalCount && totalCount > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    {completedCount}/{totalCount}
                  </span>
                </button>

                {isExpanded && (
                  <div className="ml-3 pl-3 border-l border-gray-100">
                    {module.lessons.map((lesson, li) => {
                      const isCurrent = currentLessonId === lesson.id;
                      const isComplete = completedLessons.includes(lesson.id);
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => onSelectLesson(lesson.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                            isCurrent ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50 text-gray-600'
                          }`}
                        >
                          {isComplete ? (
                            <span className="text-green-500 shrink-0">✓</span>
                          ) : (
                            <span className="text-gray-300 shrink-0 text-xs">{typeIcon[lesson.lesson_type] || '○'}</span>
                          )}
                          <span className="text-sm truncate flex-1">{li + 1}. {t(lesson.title)}</span>
                          <span className="text-xs text-gray-400 shrink-0">
                            {lesson.video_duration || lesson.duration || ''}
                          </span>
                        </button>
                      );
                    })}
                    {module.quiz && (
                      <button
                        onClick={() => onSelectQuiz(module.quiz!.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                          currentQuizId === module.quiz.id ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        <span className="text-gray-300 shrink-0 text-xs">📝</span>
                        <span className="text-sm truncate flex-1">{t(module.quiz.title)}</span>
                        <span className="text-xs text-gray-400 shrink-0">{module.quiz.questions_count}q</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Assessment */}
          {assessment && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <button
                onClick={() => onSelectQuiz(assessment.id)}
                className={`w-full flex items-center gap-2.5 p-3 rounded-lg text-left transition-colors cursor-pointer ${
                  currentQuizId === assessment.id ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-50 text-gray-600'
                }`}
              >
                <span className="text-purple-400 shrink-0">🏆</span>
                <span className="text-sm font-medium truncate flex-1">{t(assessment.title)}</span>
                <span className="text-xs text-gray-400 shrink-0">{assessment.questions_count}q</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
