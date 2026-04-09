'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

type QuestionType = 'single_choice' | 'multi_choice' | 'true_false' | 'fill_blank';

interface Answer { id: string; text: string; isCorrect: boolean; dbId?: number }
interface QuizQuestion {
  id: string; dbId?: number; type: QuestionType; text: string;
  answers: Answer[]; isExpanded: boolean; explanation?: string;
}

const QT_CONFIG: Record<QuestionType, { label: string; color: string; multi: boolean }> = {
  single_choice: { label: 'Single Choice', color: 'bg-blue-100 text-blue-700', multi: false },
  multi_choice:  { label: 'Multiple Choice', color: 'bg-purple-100 text-purple-700', multi: true },
  true_false:    { label: 'True / False', color: 'bg-green-100 text-green-700', multi: false },
  fill_blank:    { label: 'Fill in the Blank', color: 'bg-yellow-100 text-yellow-700', multi: false },
};

interface Props { title: string; courseSlug?: string; moduleId?: string; lessonId?: string; onTitleChange?: (t: string) => void; }

export default function QuizEditor({ title: initialTitle, courseSlug, onTitleChange }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [quizDbId, setQuizDbId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [activeTab, setActiveTab] = useState<'questions' | 'settings'>('questions');
  const [passingGrade, setPassingGrade] = useState('70');
  const [quizDuration, setQuizDuration] = useState('');
  const [maxRetakes, setMaxRetakes] = useState('');
  const [randomize, setRandomize] = useState(false);
  const [showAnswers, setShowAnswers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState<'ok' | 'err'>('ok');

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(''), 2500);
  };

  // Load existing quiz for this course
  useEffect(() => {
    if (!courseSlug) return;
    api.getQuizzes(courseSlug).then((list: Record<string, unknown>[]) => {
      if (!Array.isArray(list) || list.length === 0) return;
      const quiz = list[0] as Record<string, unknown>;
      setQuizDbId(quiz.id as number);
      const t = quiz.title as Record<string, string>;
      setTitle(t?.en || String(quiz.title || ''));
      setPassingGrade(String(quiz.passing_grade || 70));
      setQuizDuration(String(quiz.time_limit || ''));
      setMaxRetakes(String(quiz.max_retakes || ''));
      setRandomize(!!(quiz.randomize_questions));
      setShowAnswers(!!(quiz.show_correct_answers));
      if (Array.isArray(quiz.questions)) {
        setQuestions((quiz.questions as Record<string, unknown>[]).map((q: Record<string, unknown>) => ({
          id: String(q.id), dbId: q.id as number,
          type: (q.question_type as QuestionType) || 'single_choice',
          text: String(q.text || ''), isExpanded: false, explanation: String(q.explanation || ''),
          answers: Array.isArray(q.choices) ? (q.choices as Record<string, unknown>[]).map((c: Record<string, unknown>) => ({
            id: String(c.id), dbId: c.id as number, text: String(c.text || ''), isCorrect: !!(c.is_correct)
          })) : [],
        })));
      }
    }).catch(() => {});
  }, [courseSlug]);

  const addQuestion = (type: QuestionType) => {
    const defaultAnswers: Answer[] = type === 'true_false'
      ? [{ id: `a-${Date.now()}`, text: 'True', isCorrect: true }, { id: `a-${Date.now()+1}`, text: 'False', isCorrect: false }]
      : type === 'fill_blank' ? []
      : [{ id: `a-${Date.now()}`, text: 'Option A', isCorrect: true }, { id: `a-${Date.now()+1}`, text: 'Option B', isCorrect: false }];
    setQuestions(prev => [...prev, {
      id: `q-${Date.now()}`, type, text: 'New Question', isExpanded: true, answers: defaultAnswers
    }]);
  };

  const removeQuestion = (id: string) => setQuestions(prev => prev.filter(q => q.id !== id));
  const toggleQuestion = (id: string) => setQuestions(prev => prev.map(q => q.id === id ? { ...q, isExpanded: !q.isExpanded } : q));
  const updateQ = (id: string, patch: Partial<QuizQuestion>) => setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...patch } : q));

  const toggleCorrect = (qId: string, aId: string, multi: boolean) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId) return q;
      return {
        ...q, answers: q.answers.map(a => multi
          ? (a.id === aId ? { ...a, isCorrect: !a.isCorrect } : a)
          : { ...a, isCorrect: a.id === aId }
        )
      };
    }));
  };

  const addAnswer = (qId: string) => setQuestions(prev => prev.map(q =>
    q.id === qId ? { ...q, answers: [...q.answers, { id: `a-${Date.now()}`, text: 'New option', isCorrect: false }] } : q
  ));

  const removeAnswer = (qId: string, aId: string) => setQuestions(prev => prev.map(q =>
    q.id === qId ? { ...q, answers: q.answers.filter(a => a.id !== aId) } : q
  ));

  const handleSave = async () => {
    if (!courseSlug) return;
    setSaving(true);
    try {
      const quizData = {
        title: { en: title },
        passing_grade: parseInt(passingGrade) || 70,
        time_limit: quizDuration ? parseInt(quizDuration) : null,
        max_retakes: maxRetakes ? parseInt(maxRetakes) : null,
        randomize_questions: randomize,
        show_correct_answers: showAnswers,
      };

      let qId = quizDbId;
      if (!qId) {
        const created = await api.createQuiz(courseSlug, quizData);
        setQuizDbId(created.id);
        qId = created.id;
      } else {
        await api.updateQuiz(courseSlug, qId, quizData);
      }

      // Save questions — create new ones, skip existing (update support coming)
      for (const q of questions) {
        if (!q.dbId) {
          await api.createQuestion(courseSlug, qId!, {
            question_type: q.type,
            text: q.text,
            explanation: q.explanation || '',
            choices: q.answers.map((a, i) => ({ text: a.text, is_correct: a.isCorrect, order: i })),
          });
        } else {
          await api.updateQuestion(courseSlug, qId!, q.dbId, {
            question_type: q.type,
            text: q.text,
            explanation: q.explanation || '',
          });
        }
      }

      onTitleChange?.(title);
      showToast('✓ Quiz saved successfully');
    } catch (e) {
      showToast('✗ Failed to save quiz', 'err');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 w-[70%] mx-auto">
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium text-white ${toastType === 'ok' ? 'bg-green-500' : 'bg-red-500'}`}>{toast}</div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">🧩 Quiz</span>
        <input
          className="flex-1 text-lg font-heading font-semibold border border-gray-200 rounded-lg px-3 py-2 focus:border-orange-500 focus:outline-none"
          value={title} onChange={e => setTitle(e.target.value)} placeholder="Quiz title"
        />
        <button
          onClick={handleSave} disabled={saving}
          className="px-6 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition cursor-pointer"
        >{saving ? 'Saving…' : 'Save Quiz'}</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
        {(['questions', 'settings'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`pb-2 text-sm font-medium border-b-2 transition cursor-pointer ${activeTab === tab ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            {tab === 'questions' ? `Questions (${questions.length})` : 'Settings'}
          </button>
        ))}
      </div>

      {activeTab === 'questions' && (
        <div className="space-y-4">
          {questions.length === 0 && (
            <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-xl">
              <p className="text-4xl mb-2">🧩</p>
              <p className="text-sm">No questions yet. Add one below.</p>
            </div>
          )}

          {questions.map((q, idx) => {
            const cfg = QT_CONFIG[q.type];
            return (
              <div key={q.id} className="border border-gray-200 rounded-xl overflow-hidden">
                {/* Question header */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer" onClick={() => toggleQuestion(q.id)}>
                  <span className="text-gray-300 cursor-grab text-xs">⠿</span>
                  <span className="text-xs font-bold text-gray-400">{idx + 1}.</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.color}`}>{cfg.label}</span>
                  <span className="flex-1 text-sm text-gray-700 truncate">{q.text}</span>
                  <button onClick={e => { e.stopPropagation(); removeQuestion(q.id); }}
                    className="text-gray-300 hover:text-red-500 text-xs px-1 cursor-pointer">✕</button>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${q.isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {q.isExpanded && (
                  <div className="px-4 py-4 space-y-4">
                    {/* Question text */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Question</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                        rows={2} value={q.text}
                        onChange={e => updateQ(q.id, { text: e.target.value })}
                        placeholder="Enter your question…"
                      />
                    </div>

                    {/* Answers */}
                    {q.type !== 'fill_blank' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                          {q.type === 'true_false' ? 'Correct answer' : `Answers ${cfg.multi ? '(multiple correct)' : '(one correct)'}`}
                        </label>
                        <div className="space-y-2">
                          {q.answers.map(a => (
                            <div key={a.id} className={`flex items-center gap-2 p-2.5 rounded-lg border transition ${a.isCorrect ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                              <input
                                type={cfg.multi ? 'checkbox' : 'radio'}
                                checked={a.isCorrect}
                                onChange={() => toggleCorrect(q.id, a.id, cfg.multi)}
                                className="accent-green-500"
                              />
                              {q.type === 'true_false' ? (
                                <span className="text-sm font-medium text-gray-700">{a.text}</span>
                              ) : (
                                <input
                                  className="flex-1 text-sm bg-transparent border-0 outline-none"
                                  value={a.text}
                                  onChange={e => setQuestions(prev => prev.map(qu => qu.id === q.id ? {
                                    ...qu, answers: qu.answers.map(ans => ans.id === a.id ? { ...ans, text: e.target.value } : ans)
                                  } : qu))}
                                  placeholder="Answer option…"
                                />
                              )}
                              {q.type !== 'true_false' && (
                                <button onClick={() => removeAnswer(q.id, a.id)} className="text-gray-300 hover:text-red-400 text-xs cursor-pointer">✕</button>
                              )}
                            </div>
                          ))}
                        </div>
                        {q.type !== 'true_false' && (
                          <button onClick={() => addAnswer(q.id)}
                            className="mt-2 text-xs text-orange-500 hover:text-orange-700 font-medium cursor-pointer">+ Add option</button>
                        )}
                      </div>
                    )}

                    {q.type === 'fill_blank' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Correct answer(s) — comma separated</label>
                        <input
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                          value={q.answers[0]?.text || ''}
                          onChange={e => setQuestions(prev => prev.map(qu => qu.id === q.id ? {
                            ...qu, answers: [{ id: `a-fill`, text: e.target.value, isCorrect: true }]
                          } : qu))}
                          placeholder="answer1, answer 2, alt answer…"
                        />
                      </div>
                    )}

                    {/* Explanation */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Explanation (shown after answer)</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                        rows={2} value={q.explanation || ''}
                        onChange={e => updateQ(q.id, { explanation: e.target.value })}
                        placeholder="Why is this the correct answer…"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add question buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            {(Object.keys(QT_CONFIG) as QuestionType[]).map(type => {
              const cfg = QT_CONFIG[type];
              return (
                <button key={type} onClick={() => addQuestion(type)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition cursor-pointer ${cfg.color} border-current hover:opacity-80`}>
                  + {cfg.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-4 max-w-lg">
          {[
            { label: 'Passing Grade (%)', value: passingGrade, set: setPassingGrade, type: 'number', placeholder: '70' },
            { label: 'Time Limit (minutes, leave blank for unlimited)', value: quizDuration, set: setQuizDuration, type: 'number', placeholder: 'e.g. 30' },
            { label: 'Max Retakes (leave blank for unlimited)', value: maxRetakes, set: setMaxRetakes, type: 'number', placeholder: 'e.g. 3' },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)}
                placeholder={f.placeholder}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
            </div>
          ))}
          {[
            { label: 'Randomize question order', value: randomize, set: setRandomize },
            { label: 'Show correct answers after submission', value: showAnswers, set: setShowAnswers },
          ].map(f => (
            <label key={f.label} className="flex items-center gap-3 cursor-pointer">
              <div className={`relative w-10 h-5 rounded-full transition ${f.value ? 'bg-orange-500' : 'bg-gray-300'}`} onClick={() => f.set(!f.value)}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${f.value ? 'translate-x-5' : ''}`} />
              </div>
              <span className="text-sm text-gray-700">{f.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
