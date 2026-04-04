'use client';
import { useState } from 'react';
import { PracticeConcept, PracticeProgress, PracticeBadge } from '@/data/mockPracticeData';
import PracticeStats from './PracticeStats';
import ExerciseCard from './ExerciseCard';

interface Props {
  courseTitle: string;
  concepts: PracticeConcept[];
  progress: PracticeProgress;
  badges: PracticeBadge[];
  currentExerciseSlug: string | null;
  onSelectExercise: (conceptSlug: string, exerciseSlug: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function PracticeSidebar({
  courseTitle, concepts, progress, badges,
  currentExerciseSlug, onSelectExercise, isOpen, onClose,
}: Props) {
  const [expandedConcepts, setExpandedConcepts] = useState<Set<string>>(
    new Set(concepts.map(c => c.slug))
  );

  const toggleConcept = (slug: string) => {
    setExpandedConcepts(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-80 bg-white border-r border-gray-200 z-50
        overflow-y-auto flex-shrink-0 transition-transform lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4">
          {/* Close button (mobile) */}
          <button onClick={onClose} className="lg:hidden absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer">
            ✕
          </button>

          {/* Course title */}
          <h2 className="font-bold text-gray-900 text-sm mb-4">{courseTitle}</h2>

          {/* Stats */}
          <PracticeStats progress={progress} badges={badges} />

          {/* Concept list */}
          <div className="mt-6 space-y-2">
            {concepts.map(concept => {
              const isExpanded = expandedConcepts.has(concept.slug);
              return (
                <div key={concept.id}>
                  <button
                    onClick={() => toggleConcept(concept.slug)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span>{concept.icon}</span>
                      <span className="text-sm font-medium text-gray-800">{concept.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {concept.completed_count}/{concept.exercise_count}
                      </span>
                      <span className="text-xs text-gray-400">{isExpanded ? '▼' : '▶'}</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="ml-2 space-y-1 mt-1">
                      {concept.exercises.map(ex => (
                        <ExerciseCard
                          key={ex.id}
                          exercise={ex}
                          isActive={ex.slug === currentExerciseSlug}
                          onClick={() => onSelectExercise(concept.slug, ex.slug)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}
