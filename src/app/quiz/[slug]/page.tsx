'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface QuizQuestion {
  id: number;
  text: string;
  choices: { id: number; text: string }[];
}

interface QuizData {
  id: number;
  title: Record<string, string>;
  questions: QuizQuestion[];
}

interface QuizResult {
  score: number;
  total: number;
  passed: boolean;
  course_slug: string | null;
  results: { question_id: number; is_correct: boolean }[];
}

export default function PublicQuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getPublicQuiz(slug).then(setQuiz).catch(() => setError('Quiz not found')).finally(() => setLoading(false));
  }, [slug]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.submitPublicQuiz(slug, answers);
      setResult(res);
    } catch {
      setError('Failed to submit');
    }
    setSubmitting(false);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500" /></div>;
  if (error) return <div className="max-w-2xl mx-auto px-4 py-20 text-center"><h1 className="text-xl font-bold text-gray-900">{error}</h1></div>;
  if (!quiz) return null;

  const title = quiz.title?.en || Object.values(quiz.title)[0] || 'Quiz';

  if (result) {
    const pct = Math.round(result.score / result.total * 100);
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="text-6xl mb-4">{result.passed ? '🎉' : '😔'}</div>
          <h1 className="text-3xl font-heading font-bold mb-2">{result.passed ? 'Congratulations!' : 'Keep Trying!'}</h1>
          <p className="text-gray-500 mb-6">You scored {result.score}/{result.total} ({pct}%)</p>
          <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${result.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {result.passed ? 'PASSED' : 'NOT PASSED'}
          </div>
          {result.course_slug && (
            <div className="mt-8 p-6 bg-orange-50 rounded-xl">
              <p className="font-medium mb-2">Want to learn more?</p>
              <Link href={`/courses/${result.course_slug}`} className="text-orange-600 hover:text-orange-700 font-medium">
                Enroll in the full course →
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-heading font-bold mb-2">{title}</h1>
      <p className="text-gray-500 mb-8">{quiz.questions.length} questions</p>

      <div className="space-y-6">
        {quiz.questions.map((q, qi) => (
          <div key={q.id} className="border rounded-xl p-5">
            <p className="font-medium mb-3">{qi + 1}. {q.text}</p>
            <div className="space-y-2">
              {q.choices.map(c => (
                <label key={c.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${answers[String(q.id)] === c.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name={`q-${q.id}`} checked={answers[String(q.id)] === c.id}
                    onChange={() => setAnswers(prev => ({ ...prev, [String(q.id)]: c.id }))}
                    className="text-orange-500" />
                  <span className="text-sm">{c.text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleSubmit} disabled={submitting || Object.keys(answers).length < quiz.questions.length}
        className="mt-8 w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition">
        {submitting ? 'Submitting...' : 'Submit Quiz'}
      </button>
    </div>
  );
}
