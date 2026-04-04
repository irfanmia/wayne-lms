'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface MediaItem {
  id: number;
  filename: string;
  file: string;
  file_type: string;
  mime_type: string;
  size_bytes: number;
  folder: string;
  created_at: string;
}

const typeIcons: Record<string, string> = { image: '🖼️', video: '🎬', document: '📄', audio: '🎵' };

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function MediaPage() {
  const [files, setFiles] = useState<MediaItem[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const loadFiles = () => {
    const params: Record<string, string> = {};
    if (filter) params.type = filter;
    api.getMediaFiles(params).then(setFiles).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadFiles(); }, [filter]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this file?')) return;
    try {
      await api.deleteMediaFile(id);
      setFiles(prev => prev.filter(f => f.id !== id));
    } catch {}
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-heading font-bold">Media Manager</h1>
        <div className="flex items-center gap-3">
          <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
            <option value="">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="document">Documents</option>
            <option value="audio">Audio</option>
          </select>
          <div className="flex border rounded-lg">
            <button onClick={() => setViewMode('grid')} className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-orange-50 text-orange-600' : ''}`}>⊞</button>
            <button onClick={() => setViewMode('list')} className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-orange-50 text-orange-600' : ''}`}>☰</button>
          </div>
        </div>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-2">📁</div>
          <p>No media files yet.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {files.map(f => (
            <div key={f.id} className="border rounded-xl p-4 hover:bg-gray-50 transition group">
              <div className="text-3xl text-center mb-2">{typeIcons[f.file_type] || '📁'}</div>
              <p className="text-sm font-medium truncate">{f.filename}</p>
              <p className="text-xs text-gray-400">{formatSize(f.size_bytes)}</p>
              {f.folder && <p className="text-xs text-gray-400">📂 {f.folder}</p>}
              <button onClick={() => handleDelete(f.id)}
                className="mt-2 text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition">
                Delete
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {files.map(f => (
            <div key={f.id} className="flex items-center gap-4 border rounded-lg p-3 hover:bg-gray-50 transition group">
              <span className="text-xl">{typeIcons[f.file_type] || '📁'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{f.filename}</p>
                <p className="text-xs text-gray-400">{formatSize(f.size_bytes)} · {f.folder || 'Root'} · {new Date(f.created_at).toLocaleDateString()}</p>
              </div>
              <button onClick={() => handleDelete(f.id)} className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
