'use client';
import { useState, useEffect } from 'react';
import { useCourseBuilder } from './CourseBuilderLayout';
import api from '@/lib/api';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export default function FAQEditor() {
  const { courseData } = useCourseBuilder();
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const faqList = courseData?.faqs || courseData?.faq;
    if (faqList && Array.isArray(faqList)) {
      setFaqs(faqList.map((f: Record<string, string>, i: number) => ({
        id: f.id || `faq-${i}`,
        question: f.question || '',
        answer: f.answer || '',
      })));
    }
  }, [courseData]);

  const updateFaq = (id: string, field: 'question' | 'answer', value: string) => {
    setFaqs(faqs.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const addFaq = () => {
    setFaqs([...faqs, { id: `faq-${Date.now()}`, question: '', answer: '' }]);
  };

  const deleteFaq = (id: string) => {
    setFaqs(faqs.filter(f => f.id !== id));
  };

  return (
    <div className="w-[70%] mx-auto p-8">
      <h3 className="text-xl font-semibold font-heading mb-6">Frequently Asked Questions</h3>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={faq.id} className="border rounded-lg p-4 relative group">
            <div className="flex items-start gap-3">
              <span className="text-sm font-bold text-orange-500 mt-2">{idx + 1}.</span>
              <div className="flex-1 space-y-2">
                <input
                  className="w-full px-3 py-2 border rounded-lg text-sm font-medium"
                  placeholder="Question..."
                  value={faq.question}
                  onChange={e => updateFaq(faq.id, 'question', e.target.value)}
                />
                <textarea
                  className="w-full px-3 py-2 border rounded-lg text-sm min-h-[60px]"
                  placeholder="Answer..."
                  value={faq.answer}
                  onChange={e => updateFaq(faq.id, 'answer', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <button className="text-gray-300 cursor-grab" title="Drag to reorder">⠿</button>
                <button onClick={() => deleteFaq(faq.id)} className="text-gray-300 hover:text-red-500" title="Delete">🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {faqs.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-8">No FAQs yet. Click below to add one.</p>
      )}

      <div className="flex items-center gap-4 mt-6">
        <button onClick={addFaq} className="px-4 py-2 text-sm text-orange-500 hover:bg-orange-50 rounded-lg transition font-medium">
          ➕ Add Question
        </button>
        <button
          disabled={saving}
          onClick={async () => {
            if (!courseData?.slug) return;
            setSaving(true);
            setSaveMsg(null);
            try {
              // Delete existing FAQs and recreate
              const existing = courseData.faqs || courseData.faq || [];
              for (const f of existing) {
                if (f.id && !String(f.id).startsWith('faq-')) {
                  try { await api.delete(`/courses/faqs/${f.id}/`); } catch { /* ignore */ }
                }
              }
              // Create new FAQs
              const faqData = faqs.filter(f => f.question.trim());
              for (let i = 0; i < faqData.length; i++) {
                await api.post('/courses/faqs/', { course: courseData.id, question: faqData[i].question, answer: faqData[i].answer, order: i });
              }
              setSaveMsg({ type: 'success', text: 'FAQs saved successfully!' });
              setTimeout(() => setSaveMsg(null), 3000);
            } catch (err: unknown) {
              setSaveMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save FAQs' });
            } finally {
              setSaving(false);
            }
          }}
          className="px-6 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition disabled:opacity-50"
        >
          {saving ? '⏳ Saving...' : '💾 Save FAQs'}
        </button>
      </div>
      {saveMsg && (
        <div className={`mt-4 px-4 py-3 rounded-lg text-sm font-medium ${saveMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {saveMsg.type === 'success' ? '✅' : '❌'} {saveMsg.text}
        </div>
      )}
    </div>
  );
}
