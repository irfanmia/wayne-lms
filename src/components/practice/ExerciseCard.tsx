'use client';
import { PracticeExercise } from '@/data/mockPracticeData';

interface Props {
  exercise: PracticeExercise;
  isActive: boolean;
  onClick: () => void;
}

const difficultyStyles = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-orange-100 text-orange-700',
  hard: 'bg-red-100 text-red-700',
};

const statusIcons: Record<string, string> = {
  completed: '✅',
  in_progress: '🔄',
  failed: '❌',
  not_started: '',
};

export default function ExerciseCard({ exercise, isActive, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
        isActive
          ? 'border-orange-500 bg-orange-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm">{statusIcons[exercise.status]}</span>
          <span className={`text-sm font-medium truncate ${
            exercise.status === 'completed' ? 'text-green-700' : 'text-gray-800'
          }`}>
            {exercise.title}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyStyles[exercise.difficulty]}`}>
            {exercise.difficulty}
          </span>
          <span className="text-xs text-gray-500">{exercise.points}pts</span>
        </div>
      </div>
    </button>
  );
}
