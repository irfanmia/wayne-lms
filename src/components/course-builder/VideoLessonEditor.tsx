'use client';
import { useState } from 'react';

export default function VideoLessonEditor({ title: initialTitle }: { title: string }) {
  const [title, setTitle] = useState(initialTitle);
  const [activeTab, setActiveTab] = useState<'lesson' | 'qa'>('lesson');
  const [duration, setDuration] = useState('15');
  const [isPreview, setIsPreview] = useState(false);
  const [sourceType, setSourceType] = useState('youtube');
  const [videoUrl, setVideoUrl] = useState('');
  const [content, setContent] = useState('');

  return (
    <div className="p-6 w-[70%] mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">VIDEO LESSON</span>
      </div>
      <input className="w-full text-2xl font-heading font-semibold border-0 border-b-2 border-gray-200 focus:border-orange-500 focus:outline-none pb-2 mb-4 bg-transparent" value={title} onChange={e => setTitle(e.target.value)} />

      <div className="flex gap-4 border-b mb-6">
        {(['lesson', 'qa'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-2 text-sm font-medium transition border-b-2 ${activeTab === tab ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'}`}>
            {tab === 'lesson' ? 'Lesson' : 'Q&A'}
          </button>
        ))}
      </div>

      {activeTab === 'lesson' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Source Type</label>
              <select className="w-full px-3 py-2 border rounded-lg text-sm" value={sourceType} onChange={e => setSourceType(e.target.value)}>
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
                <option value="upload">Upload</option>
                <option value="external">External URL</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Duration (minutes)</label>
              <input type="number" className="w-full px-3 py-2 border rounded-lg text-sm" value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
          </div>

          {sourceType === 'upload' ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <p className="text-3xl mb-2">📁</p>
              <p className="text-sm text-gray-500">Drag & drop video file or click to browse</p>
              <button className="mt-3 px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition">Choose File</button>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Video URL</label>
              <input type="url" className="w-full px-3 py-2 border rounded-lg text-sm" placeholder={`Enter ${sourceType} URL...`} value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded accent-orange-500" checked={isPreview} onChange={e => setIsPreview(e.target.checked)} />
            <span className="text-sm text-gray-600">Allow preview</span>
          </label>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <textarea className="w-full px-3 py-2 border rounded-lg text-sm min-h-[150px]" value={content} onChange={e => setContent(e.target.value)} placeholder="Lesson description..." />
          </div>

          <button className="px-6 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition">Save Lesson</button>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">💬</p>
          <p className="text-sm">No questions yet.</p>
        </div>
      )}
    </div>
  );
}
