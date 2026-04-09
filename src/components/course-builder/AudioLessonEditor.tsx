'use client';
import { useState } from 'react';
import api from '@/lib/api';

interface Props {
  title: string;
  courseSlug?: string;
  moduleId?: string;
  lessonId?: string;
  onTitleChange?: (t: string) => void;
}

export default function AudioLessonEditor({ title: initialTitle, courseSlug, moduleId, lessonId, onTitleChange }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [audioUrl, setAudioUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState<'ok' | 'err'>('ok');

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(''), 2500);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.uploadMedia(file, 'audio-lessons');
      const base = (process.env.NEXT_PUBLIC_API_URL || '').replace('/api/v1', '').replace('/api', '');
      setAudioUrl(res.file.startsWith('http') ? res.file : `${base}${res.file}`);
      // Auto-detect duration from audio file
      const audio = new Audio(URL.createObjectURL(file));
      audio.onloadedmetadata = () => {
        const mins = Math.floor(audio.duration / 60);
        const secs = Math.floor(audio.duration % 60);
        setDuration(`${mins}:${secs.toString().padStart(2, '0')}`);
      };
    } catch {
      showToast('Upload failed', 'err');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    const mid = parseInt(moduleId || '');
    const lid = parseInt(lessonId || '');
    if (!courseSlug || !mid || !lid || isNaN(mid) || isNaN(lid)) return;
    setSaving(true);
    try {
      await api.updateLesson(courseSlug, mid, lid, {
        title: { en: title },
        content: { en: description },
        audio_url: audioUrl,
        duration: parseInt(duration) || 0,
        is_free_preview: isPreview,
        lesson_type: 'audio',
      });
      onTitleChange?.(title);
      showToast('✓ Audio lesson saved');
    } catch {
      showToast('✗ Failed to save', 'err');
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
      <div className="flex items-center gap-3 mb-6">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 whitespace-nowrap">🎧 Audio Lesson</span>
        <input
          className="flex-1 text-lg font-heading font-semibold border border-gray-200 rounded-lg px-3 py-2 focus:border-orange-500 focus:outline-none bg-white"
          value={title} onChange={e => setTitle(e.target.value)} placeholder="Lesson name"
        />
        <button onClick={handleSave} disabled={saving}
          className={`ml-2 px-6 py-2 rounded-lg text-sm font-medium transition cursor-pointer bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50`}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Audio upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Audio File</label>
          {audioUrl ? (
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🎵</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 truncate">{audioUrl.split('/').pop()}</p>
                  {duration && <p className="text-xs text-gray-400">Duration: {duration}</p>}
                </div>
                <button onClick={() => setAudioUrl('')} className="text-gray-400 hover:text-red-500 text-sm cursor-pointer">✕ Remove</button>
              </div>
              <audio controls className="w-full" src={audioUrl} />
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-400 transition cursor-pointer">
              <input type="file" accept="audio/*" className="hidden" onChange={handleUpload} />
              {uploading ? (
                <p className="text-sm text-green-500">Uploading…</p>
              ) : (
                <>
                  <span className="text-4xl mb-3">🎧</span>
                  <p className="text-sm font-medium text-gray-600">Click to upload audio file</p>
                  <p className="text-xs text-gray-400 mt-1">MP3, WAV, M4A, OGG · Max 100 MB</p>
                </>
              )}
            </label>
          )}
        </div>

        {/* Or paste URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Or paste audio URL</label>
          <input
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            value={audioUrl} onChange={e => setAudioUrl(e.target.value)}
            placeholder="https://example.com/audio.mp3"
          />
        </div>

        {/* Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
            <input type="number" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 15" />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <div className={`relative w-10 h-5 rounded-full transition ${isPreview ? 'bg-orange-500' : 'bg-gray-300'}`} onClick={() => setIsPreview(!isPreview)}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPreview ? 'translate-x-5' : ''}`} />
              </div>
              <span className="text-sm text-gray-700">Free preview</span>
            </label>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description / Transcript</label>
          <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 min-h-[100px]"
            value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Add lesson description or transcript…" />
        </div>
      </div>
    </div>
  );
}
