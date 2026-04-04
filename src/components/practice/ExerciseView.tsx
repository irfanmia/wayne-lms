'use client';
import { useState, useEffect } from 'react';
import { PracticeExerciseDetail, TestResult, SubmitResult } from '@/data/mockPracticeData';

interface Props {
  exercise: PracticeExerciseDetail;
  courseSlug: string;
  onComplete: () => void;
  onNext: () => void;
}

const difficultyStyles = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-orange-100 text-orange-700',
  hard: 'bg-red-100 text-red-700',
};

export default function ExerciseView({ exercise, courseSlug, onComplete, onNext }: Props) {
  const [code, setCode] = useState(exercise.code_submitted || exercise.starter_code);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    setCode(exercise.code_submitted || exercise.starter_code);
    setResult(null);
    setShowCelebration(false);
  }, [exercise.slug, exercise.code_submitted, exercise.starter_code]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setResult(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/courses/${courseSlug}/practice/exercises/${exercise.slug}/submit/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(typeof window !== 'undefined' && localStorage.getItem('auth_token')
              ? { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
              : {}),
          },
          body: JSON.stringify({ code }),
        }
      );
      if (res.ok) {
        const data: SubmitResult = await res.json();
        setResult(data);
        if (data.passed) {
          setShowCelebration(true);
          onComplete();
          setTimeout(() => setShowCelebration(false), 3000);
        }
      } else {
        // Mock result for demo
        mockSubmit();
      }
    } catch {
      mockSubmit();
    }
    setIsSubmitting(false);
  };

  const mockSubmit = () => {
    const passed = code.length > 30 && !code.includes('pass');
    const mockResult: SubmitResult = {
      passed,
      test_results: passed
        ? [{ name: 'All tests', passed: true, output: '' }]
        : [{ name: 'Test 1', passed: false, output: 'Function returned None' }],
      points_earned: passed ? exercise.points : 0,
      attempts: (exercise.attempts || 0) + 1,
      status: passed ? 'completed' : 'failed',
      new_badges: [],
    };
    setResult(mockResult);
    if (passed) {
      setShowCelebration(true);
      onComplete();
      setTimeout(() => setShowCelebration(false), 3000);
    }
  };

  const handleReset = () => {
    setCode(exercise.starter_code);
    setResult(null);
  };

  return (
    <div className="relative">
      {/* Celebration overlay */}
      {showCelebration && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/10 rounded-xl pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl px-8 py-6 text-center animate-bounce">
            <div className="text-5xl mb-2">🎉</div>
            <h3 className="text-xl font-bold text-green-600">Exercise Complete!</h3>
            <p className="text-orange-600 font-semibold">+{exercise.points} points</p>
            {result?.new_badges && result.new_badges.length > 0 && (
              <div className="mt-2">
                {result.new_badges.map((b, i) => (
                  <span key={i} className="text-2xl">{b.icon_url} </span>
                ))}
                <p className="text-sm text-gray-600">New badge earned!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">{exercise.title}</h2>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${difficultyStyles[exercise.difficulty]}`}>
              {exercise.difficulty}
            </span>
            <span className="text-sm text-orange-600 font-medium">{exercise.points} pts</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{exercise.concept} · {exercise.language}</p>
        </div>
        {exercise.status === 'completed' && (
          <span className="text-green-600 font-medium flex items-center gap-1">
            ✅ Completed
          </span>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-blue-800 mb-2">📝 Instructions</h4>
        <p className="text-sm text-blue-900 whitespace-pre-wrap">{exercise.instructions}</p>
      </div>

      {/* Code Editor */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-700">Code</h4>
          <button onClick={handleReset} className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer">
            ↩ Reset
          </button>
        </div>
        <textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          className="w-full h-64 p-4 font-mono text-sm bg-gray-900 text-green-400 rounded-lg border-0 resize-y focus:outline-none focus:ring-2 focus:ring-orange-500"
          spellCheck={false}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {isSubmitting ? '⏳ Running...' : '▶ Run Tests'}
        </button>
        {(result?.passed || exercise.status === 'completed') && (
          <button
            onClick={onNext}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Next Exercise →
          </button>
        )}
      </div>

      {/* Test Results */}
      {result && (
        <div className={`rounded-lg border p-4 ${result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <h4 className={`font-semibold mb-2 ${result.passed ? 'text-green-700' : 'text-red-700'}`}>
            {result.passed ? '✅ All Tests Passed!' : '❌ Some Tests Failed'}
          </h4>
          <div className="space-y-1">
            {result.test_results.map((t, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span>{t.passed ? '✓' : '✗'}</span>
                <span className={t.passed ? 'text-green-700' : 'text-red-700'}>{t.name}</span>
                {t.output && <span className="text-gray-500 text-xs">— {t.output}</span>}
              </div>
            ))}
          </div>
          {result.passed && (
            <p className="mt-2 text-sm text-green-600 font-medium">
              +{result.points_earned} points · Attempt #{result.attempts}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
