'use client';
import { useState, useEffect } from 'react';
import { quizTypeConfig } from '@/data/mockCourseBuilder';
import { useCourseBuilder } from './CourseBuilderLayout';

interface QuizQuestion {
  id: string;
  type: 'single-choice' | 'multiple-choice' | 'true-false' | 'matching' | 'fill-in-the-gap' | 'keywords';
  title: string;
  answers: { id: string; text: string; isCorrect: boolean }[];
  isExpanded: boolean;
}

type QuestionType = QuizQuestion['type'];
const questionTypes: QuestionType[] = ['single-choice', 'multiple-choice', 'true-false', 'matching', 'fill-in-the-gap', 'keywords'];

export default function QuizEditor({ title: initialTitle }: { title: string }) {
  const { courseData } = useCourseBuilder();
  const [title, setTitle] = useState(initialTitle);
  const [activeTab, setActiveTab] = useState<'questions' | 'settings' | 'qa'>('questions');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    if (courseData?.quizQuestions && Array.isArray(courseData.quizQuestions)) {
      setQuestions(courseData.quizQuestions);
    }
  }, [courseData]);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [passingGrade, setPassingGrade] = useState('70');
  const [quizDuration, setQuizDuration] = useState('30');
  const [attempts, setAttempts] = useState('3');
  const [randomize, setRandomize] = useState(false);
  const [showAnswers, setShowAnswers] = useState(true);

  const toggleQuestion = (id: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, isExpanded: !q.isExpanded } : q));
  };

  const addQuestion = (type: QuestionType) => {
    const cfg = quizTypeConfig[type];
    const newQ: QuizQuestion = {
      id: `q-${Date.now()}`, type, title: `New ${cfg.label} Question`, isExpanded: true,
      answers: type === 'true-false'
        ? [{ id: `a-${Date.now()}`, text: 'True', isCorrect: false }, { id: `a-${Date.now() + 1}`, text: 'False', isCorrect: true }]
        : [{ id: `a-${Date.now()}`, text: 'Answer 1', isCorrect: true }, { id: `a-${Date.now() + 1}`, text: 'Answer 2', isCorrect: false }],
    };
    setQuestions([...questions, newQ]);
    setShowAddDropdown(false);
  };

  return (
    <div className="p-6 w-[70%] mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">QUIZ</span>
      </div>
      <input className="w-full text-2xl font-heading font-semibold border-0 border-b-2 border-gray-200 focus:border-orange-500 focus:outline-none pb-2 mb-4 bg-transparent" value={title} onChange={e => setTitle(e.target.value)} />

      <div className="flex gap-4 border-b mb-6">
        <button onClick={() => setActiveTab('questions')} className={`pb-2 text-sm font-medium border-b-2 transition ${activeTab === 'questions' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'}`}>
          Questions ({questions.length})
        </button>
        <button onClick={() => setActiveTab('settings')} className={`pb-2 text-sm font-medium border-b-2 transition ${activeTab === 'settings' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'}`}>
          Settings
        </button>
        <button onClick={() => setActiveTab('qa')} className={`pb-2 text-sm font-medium border-b-2 transition ${activeTab === 'qa' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'}`}>
          Q&A
        </button>
      </div>

      {activeTab === 'questions' && (
        <div className="space-y-3">
          {questions.map((q, idx) => {
            const cfg = quizTypeConfig[q.type];
            return (
              <div key={q.id} className="border rounded-lg overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer" onClick={() => toggleQuestion(q.id)}>
                  <span className="text-gray-300 cursor-grab">⠿</span>
                  <span className="text-xs font-medium text-gray-400">{idx + 1}.</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.color}`}>{cfg.label}</span>
                  <span className="flex-1 text-sm font-medium truncate">{q.title}</span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${q.isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {q.isExpanded && (
                  <div className="p-4 space-y-2">
                    {q.answers.map(a => (
                      <div key={a.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${a.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${a.isCorrect ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                          {a.isCorrect && <span className="text-white text-[10px]">✓</span>}
                        </span>
                        <span className="text-sm">{a.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex gap-2 pt-2">
            <div className="relative">
              <button onClick={() => setShowAddDropdown(!showAddDropdown)} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition">
                ➕ Question
              </button>
              {showAddDropdown && (
                <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-xl border py-1 z-40 w-52">
                  {questionTypes.map(type => {
                    const cfg = quizTypeConfig[type];
                    return (
                      <button key={type} onClick={() => addQuestion(type)} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-left">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${cfg.color}`}>{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
              ➕ Question Bank
            </button>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Passing Grade (%)</label>
            <input type="number" className="w-full px-3 py-2 border rounded-lg text-sm" value={passingGrade} onChange={e => setPassingGrade(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Duration (minutes)</label>
            <input type="number" className="w-full px-3 py-2 border rounded-lg text-sm" value={quizDuration} onChange={e => setQuizDuration(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Max Attempts</label>
            <input type="number" className="w-full px-3 py-2 border rounded-lg text-sm" value={attempts} onChange={e => setAttempts(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded accent-orange-500" checked={randomize} onChange={e => setRandomize(e.target.checked)} />
            <span className="text-sm text-gray-600">Randomize questions</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded accent-orange-500" checked={showAnswers} onChange={e => setShowAnswers(e.target.checked)} />
            <span className="text-sm text-gray-600">Show correct answers after submission</span>
          </label>
          <button className="px-6 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition">Save Settings</button>
        </div>
      )}

      {activeTab === 'qa' && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">💬</p>
          <p className="text-sm">No questions yet.</p>
        </div>
      )}
    </div>
  );
}
