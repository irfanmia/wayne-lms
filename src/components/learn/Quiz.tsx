'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import type { MockQuestion } from '@/data/mockLearnData';

interface QuizProps {
  quizId: number;
  title: string;
  questionsCount: number;
  questions: MockQuestion[];
  isAssessment?: boolean;
  onComplete?: () => void;
}

type Phase = 'intro' | 'taking' | 'results';

interface Answers {
  [questionId: number]: string | number[] | Record<string, string>;
}

interface Result {
  score: number;
  total: number;
  maxPoints: number;
  earnedPoints: number;
  passed: boolean;
  questionResults: Record<number, boolean>;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function gradeQuestion(q: MockQuestion, answer: string | number[] | Record<string, string> | undefined): boolean {
  if (!answer) return false;

  switch (q.question_type) {
    case 'multiple_choice':
    case 'true_false': {
      const selected = answer as number[];
      return selected.length === 1 && q.correct_choices?.includes(selected[0]) === true;
    }
    case 'multi_select': {
      const selected = answer as number[];
      if (!q.correct_choices) return false;
      return selected.length === q.correct_choices.length && selected.every(id => q.correct_choices!.includes(id));
    }
    case 'fill_blank': {
      const text = (answer as string).trim().toLowerCase();
      return text === q.correct_answer?.toLowerCase();
    }
    case 'matching': {
      const pairs = answer as Record<string, string>;
      if (!q.matching_pairs) return false;
      return q.matching_pairs.every(p => pairs[p.left] === p.right);
    }
    case 'short_answer':
      return (answer as string).trim().length > 10; // Auto-pass if reasonable length
    default:
      return false;
  }
}

export default function Quiz({ quizId, title, questionsCount, questions, isAssessment, onComplete }: QuizProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<Result | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const timeLimit = (questions as unknown as { time_limit?: number }[])?.length
    ? (isAssessment ? 30 : 15) * 60
    : 15 * 60;

  const q = questions[currentIdx];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  const submitQuiz = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    let earned = 0;
    let maxPts = 0;
    const qResults: Record<number, boolean> = {};

    questions.forEach(question => {
      const pts = question.points || 1;
      maxPts += pts;
      const correct = gradeQuestion(question, answers[question.id]);
      qResults[question.id] = correct;
      if (correct) earned += pts;
    });

    const threshold = isAssessment ? 0.7 : 0.5;
    setResult({
      score: Object.values(qResults).filter(Boolean).length,
      total: totalQuestions,
      maxPoints: maxPts,
      earnedPoints: earned,
      passed: (earned / maxPts) >= threshold,
      questionResults: qResults,
    });
    setPhase('results');
  }, [questions, answers, isAssessment, totalQuestions]);

  useEffect(() => {
    if (phase !== 'taking') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          submitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, submitQuiz]);

  const startQuiz = () => {
    setPhase('taking');
    setTimeLeft(timeLimit);
    setCurrentIdx(0);
    setAnswers({});
  };

  const handleRetry = () => {
    setResult(null);
    setAnswers({});
    setCurrentIdx(0);
    setPhase('intro');
  };

  // Answer handlers
  const selectChoice = (choiceId: number) => {
    setAnswers(prev => ({ ...prev, [q.id]: [choiceId] }));
  };

  const toggleChoice = (choiceId: number) => {
    setAnswers(prev => {
      const current = (prev[q.id] as number[]) || [];
      const next = current.includes(choiceId) ? current.filter(id => id !== choiceId) : [...current, choiceId];
      return { ...prev, [q.id]: next };
    });
  };

  const setTextAnswer = (text: string) => {
    setAnswers(prev => ({ ...prev, [q.id]: text }));
  };

  const setMatchingAnswer = (left: string, right: string) => {
    setAnswers(prev => {
      const current = (prev[q.id] as Record<string, string>) || {};
      return { ...prev, [q.id]: { ...current, [left]: right } };
    });
  };

  // ═══════════════════════════════════════
  // INTRO SCREEN
  // ═══════════════════════════════════════
  if (phase === 'intro') {
    const questionTypes = [...new Set(questions.map(qq => qq.question_type))];
    const typeLabels: Record<string, string> = {
      multiple_choice: 'Multiple Choice', true_false: 'True/False', multi_select: 'Multi-Select',
      fill_blank: 'Fill in the Blank', matching: 'Matching', short_answer: 'Short Answer',
    };
    const totalPoints = questions.reduce((sum, qq) => sum + (qq.points || 1), 0);

    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <span className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider ${isAssessment ? 'text-purple-600 bg-purple-50' : 'text-orange-600 bg-orange-50'}`}>
            {isAssessment ? '📋 Assessment' : '📝 Quiz'}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>{title}</h1>
          <p className="text-gray-500">Test your knowledge and track your progress</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{totalQuestions}</p>
              <p className="text-sm text-gray-500">Questions</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{Math.floor(timeLimit / 60)} min</p>
              <p className="text-sm text-gray-500">Time Limit</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{totalPoints}</p>
              <p className="text-sm text-gray-500">Total Points</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{isAssessment ? '70%' : '50%'}</p>
              <p className="text-sm text-gray-500">Pass Threshold</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Question Types</p>
            <div className="flex flex-wrap gap-2">
              {questionTypes.map(t => (
                <span key={t} className="text-xs px-2.5 py-1 bg-orange-50 text-orange-700 rounded-full">
                  {typeLabels[t] || t}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">📋 Rules</p>
            <ul className="text-sm text-gray-500 space-y-1.5">
              <li>• One question at a time — navigate freely</li>
              <li>• Timer counts down — quiz auto-submits when time runs out</li>
              <li>• You can change answers before submitting</li>
              <li>• Unanswered questions score zero points</li>
              {isAssessment && <li>• <strong>Assessment:</strong> You need 70% to pass</li>}
            </ul>
          </div>
        </div>

        <button
          onClick={startQuiz}
          className="w-full py-4 bg-orange-500 text-white font-semibold text-lg rounded-xl hover:bg-orange-600 transition-colors cursor-pointer"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          Start {isAssessment ? 'Assessment' : 'Quiz'} →
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // RESULTS SCREEN
  // ═══════════════════════════════════════
  if (phase === 'results' && result) {
    const pct = Math.round((result.earnedPoints / result.maxPoints) * 100);

    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${result.passed ? 'bg-green-100' : 'bg-red-100'}`}>
            <span className="text-4xl">{result.passed ? '🎉' : '😔'}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {result.passed ? 'Congratulations!' : 'Keep Practicing!'}
          </h1>
          <p className="text-gray-500">{title}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="text-center mb-4">
            <p className="text-5xl font-bold text-gray-900 mb-1">{pct}%</p>
            <p className="text-gray-500">{result.earnedPoints}/{result.maxPoints} points • {result.score}/{result.total} correct</p>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ${result.passed ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Question Review */}
        <div className="space-y-4 mb-8">
          {questions.map((question, i) => {
            const correct = result.questionResults[question.id];
            return (
              <div key={question.id} className={`border rounded-xl p-5 ${correct ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
                <div className="flex items-start gap-3 mb-3">
                  <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {correct ? '✓' : '✗'}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{i + 1}. {question.text}</p>
                    <span className="text-xs text-gray-400 capitalize">{question.question_type.replace('_', ' ')} • {question.points || 1} pt{(question.points || 1) > 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Show correct answer info */}
                {question.question_type === 'fill_blank' && (
                  <div className="ml-10 text-sm">
                    <p className="text-gray-500">Your answer: <strong>{(answers[question.id] as string) || '(empty)'}</strong></p>
                    <p className="text-green-600">Correct: <strong>{question.correct_answer}</strong></p>
                  </div>
                )}

                {(question.question_type === 'multiple_choice' || question.question_type === 'true_false') && question.choices && (
                  <div className="ml-10 space-y-1">
                    {question.choices.map(c => {
                      const selected = ((answers[question.id] as number[]) || []).includes(c.id);
                      const isCorrect = question.correct_choices?.includes(c.id);
                      let cls = 'text-gray-400';
                      if (selected && isCorrect) cls = 'text-green-600 font-medium';
                      else if (selected && !isCorrect) cls = 'text-red-600 line-through';
                      else if (isCorrect) cls = 'text-green-600 font-medium';
                      return (
                        <p key={c.id} className={`text-sm ${cls}`}>
                          {selected ? (isCorrect ? '✓' : '✗') : (isCorrect ? '✓' : '○')} {c.text}
                        </p>
                      );
                    })}
                  </div>
                )}

                {question.question_type === 'multi_select' && question.choices && (
                  <div className="ml-10 space-y-1">
                    {question.choices.map(c => {
                      const selected = ((answers[question.id] as number[]) || []).includes(c.id);
                      const isCorrect = question.correct_choices?.includes(c.id);
                      let cls = 'text-gray-400';
                      if (selected && isCorrect) cls = 'text-green-600 font-medium';
                      else if (selected && !isCorrect) cls = 'text-red-600 line-through';
                      else if (isCorrect) cls = 'text-green-600 font-medium';
                      return (
                        <p key={c.id} className={`text-sm ${cls}`}>
                          {selected ? (isCorrect ? '☑' : '☒') : (isCorrect ? '☑' : '☐')} {c.text}
                        </p>
                      );
                    })}
                  </div>
                )}

                {question.explanation && (
                  <p className="ml-10 mt-2 text-xs text-gray-500 italic bg-gray-50 rounded-lg p-2">💡 {question.explanation}</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button onClick={handleRetry} className="flex-1 py-3 text-sm font-medium border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
            🔄 Try Again
          </button>
          {result.passed && onComplete && (
            <button onClick={onComplete} className="flex-1 py-3 text-sm font-medium bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors cursor-pointer">
              Continue →
            </button>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // TAKING PHASE — One question at a time
  // ═══════════════════════════════════════
  const isLowTime = timeLeft < 60;
  const progressPct = ((currentIdx + 1) / totalQuestions) * 100;

  const renderQuestion = () => {
    if (!q) return null;

    switch (q.question_type) {
      case 'multiple_choice':
      case 'true_false':
        return (
          <div className="space-y-3">
            {q.choices?.map(c => {
              const selected = ((answers[q.id] as number[]) || []).includes(c.id);
              return (
                <label
                  key={c.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={selected}
                    onChange={() => selectChoice(c.id)}
                    className="accent-orange-500 w-4 h-4"
                  />
                  <span className="text-gray-700">{c.text}</span>
                </label>
              );
            })}
          </div>
        );

      case 'multi_select':
        return (
          <div className="space-y-3">
            <p className="text-sm text-gray-400 mb-1">Select all that apply</p>
            {q.choices?.map(c => {
              const selected = ((answers[q.id] as number[]) || []).includes(c.id);
              return (
                <label
                  key={c.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleChoice(c.id)}
                    className="accent-orange-500 w-4 h-4 rounded"
                  />
                  <span className="text-gray-700">{c.text}</span>
                </label>
              );
            })}
          </div>
        );

      case 'fill_blank':
        return (
          <div>
            <p className="text-sm text-gray-400 mb-3">Type your answer below</p>
            <input
              type="text"
              value={(answers[q.id] as string) || ''}
              onChange={e => setTextAnswer(e.target.value)}
              placeholder="Your answer..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-gray-700 text-lg"
              autoFocus
            />
          </div>
        );

      case 'matching':
        return (
          <div>
            <p className="text-sm text-gray-400 mb-3">Match each item on the left with the correct option on the right</p>
            <div className="space-y-3">
              {q.matching_pairs?.map(pair => {
                const currentMatch = (answers[q.id] as Record<string, string>)?.[pair.left] || '';
                const rightOptions = q.matching_pairs!.map(p => p.right);
                return (
                  <div key={pair.left} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                    <span className="font-mono font-semibold text-gray-900 min-w-[100px]">{pair.left}</span>
                    <span className="text-gray-400">→</span>
                    <select
                      value={currentMatch}
                      onChange={e => setMatchingAnswer(pair.left, e.target.value)}
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-gray-700 bg-white cursor-pointer"
                    >
                      <option value="">Select...</option>
                      {rightOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'short_answer':
        return (
          <div>
            <p className="text-sm text-gray-400 mb-3">Write your answer (minimum 10 characters)</p>
            <textarea
              value={(answers[q.id] as string) || ''}
              onChange={e => setTextAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-gray-700 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {((answers[q.id] as string) || '').length} characters
            </p>
          </div>
        );

      default:
        return <p className="text-gray-500">Unknown question type</p>;
    }
  };

  const typeLabels: Record<string, string> = {
    multiple_choice: 'Multiple Choice', true_false: 'True / False', multi_select: 'Multi-Select',
    fill_blank: 'Fill in the Blank', matching: 'Matching', short_answer: 'Short Answer',
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header: Timer + Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Question {currentIdx + 1} of {totalQuestions}
        </span>
        <span className={`text-sm font-mono font-bold px-3 py-1 rounded-lg ${
          isLowTime ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-700'
        }`}>
          ⏱ {formatTime(timeLeft)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-8">
        <div
          className="h-2 rounded-full bg-orange-500 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs px-2.5 py-1 bg-orange-50 text-orange-700 rounded-full font-medium">
            {typeLabels[q.question_type] || q.question_type}
          </span>
          <span className="text-xs text-gray-400">{q.points || 1} point{(q.points || 1) > 1 ? 's' : ''}</span>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
          {q.text}
        </h2>

        {renderQuestion()}
      </div>

      {/* Question Navigator Dots */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {questions.map((qq, i) => {
          const answered = answers[qq.id] !== undefined;
          const isCurrent = i === currentIdx;
          return (
            <button
              key={qq.id}
              onClick={() => setCurrentIdx(i)}
              className={`w-9 h-9 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-orange-500 text-white ring-2 ring-orange-300 ring-offset-2'
                  : answered
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
          className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
        >
          ← Previous
        </button>

        {currentIdx < totalQuestions - 1 ? (
          <button
            onClick={() => setCurrentIdx(i => Math.min(totalQuestions - 1, i + 1))}
            className="px-6 py-2.5 text-sm font-medium bg-gray-900 text-white rounded-xl hover:bg-gray-800 cursor-pointer"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={submitQuiz}
            className="px-6 py-3 text-sm font-semibold bg-orange-500 text-white rounded-xl hover:bg-orange-600 cursor-pointer"
          >
            Submit Quiz ({answeredCount}/{totalQuestions} answered)
          </button>
        )}
      </div>
    </div>
  );
}
