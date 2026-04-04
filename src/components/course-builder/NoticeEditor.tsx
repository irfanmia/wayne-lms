'use client';
import { useState, useEffect } from 'react';
import { RichTextEditor } from './TextLessonEditor';
import { useCourseBuilder } from './CourseBuilderLayout';
import api from '@/lib/api';

export default function NoticeEditor() {
  const { courseData } = useCourseBuilder();
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Load from notices array (related model)
    const notices = courseData?.notices;
    if (notices && Array.isArray(notices) && notices.length > 0) {
      const latest = notices[notices.length - 1];
      setContent(typeof latest.content === 'string' ? latest.content : '');
    } else if (courseData?.notice) {
      setContent(typeof courseData.notice === 'string' ? courseData.notice.replace(/<[^>]+>/g, '\n').trim() : '');
    }
  }, [courseData]);

  return (
    <div className="w-[70%] mx-auto p-8 space-y-10">
      <div>
        <h3 className="text-xl font-semibold font-heading">Course Notice</h3>
        <p className="text-sm text-gray-400 mt-1">Write announcements visible to enrolled students.</p>
      </div>

      <RichTextEditor
        value={content}
        onChange={setContent}
        minHeight="300px"
        placeholder="Write your announcement here..."
      />

      {saveMsg && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${saveMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {saveMsg.type === 'success' ? '✅' : '❌'} {saveMsg.text}
        </div>
      )}
      <div className="flex justify-end">
        <button
          disabled={saving}
          onClick={async () => {
            if (!courseData?.slug) return;
            setSaving(true);
            setSaveMsg(null);
            try {
              await api.post('/courses/notices/', { course: courseData.id, content, published: true });
              setSaveMsg({ type: 'success', text: 'Notice published!' });
              setTimeout(() => setSaveMsg(null), 3000);
            } catch (err: unknown) {
              setSaveMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to publish notice' });
            } finally {
              setSaving(false);
            }
          }}
          className="px-6 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition cursor-pointer disabled:opacity-50"
        >
          {saving ? '⏳ Publishing...' : '💾 Publish Notice'}
        </button>
      </div>
    </div>
  );
}
