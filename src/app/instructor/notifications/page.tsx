'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface EmailTemplate {
  id: number;
  name: string;
  slug: string;
  subject: string;
  body: string;
  trigger: string;
  is_active: boolean;
}

export default function NotificationsPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [editData, setEditData] = useState({ subject: '', body: '', is_active: true });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getEmailTemplates().then(setTemplates).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const startEdit = (t: EmailTemplate) => {
    setEditing(t.id);
    setEditData({ subject: t.subject, body: t.body, is_active: t.is_active });
  };

  const saveEdit = async (id: number) => {
    try {
      const updated = await api.updateEmailTemplate(id, editData);
      setTemplates(prev => prev.map(t => t.id === id ? updated : t));
      setEditing(null);
    } catch {}
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-heading font-bold mb-2">Email Templates</h1>
      <p className="text-gray-500 mb-8">Manage notification templates. Variables: {'{{student_name}}'}, {'{{course_name}}'}, {'{{date}}'}</p>

      <div className="space-y-4">
        {templates.map(t => (
          <div key={t.id} className="border rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <h3 className="font-medium">{t.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${t.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {t.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <span className="text-xs text-gray-400 capitalize">{t.trigger.replace('_', ' ')}</span>
            </div>

            {editing === t.id ? (
              <div className="space-y-3 mt-3">
                <input value={editData.subject} onChange={e => setEditData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Subject" className="w-full px-3 py-2 border rounded-lg text-sm" />
                <textarea value={editData.body} onChange={e => setEditData(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Body" className="w-full px-3 py-2 border rounded-lg text-sm" rows={4} />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editData.is_active}
                    onChange={e => setEditData(prev => ({ ...prev, is_active: e.target.checked }))} />
                  Active
                </label>
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(t.id)} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm">Save</button>
                  <button onClick={() => setEditing(null)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600"><strong>Subject:</strong> {t.subject}</p>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">{t.body}</p>
                <button onClick={() => startEdit(t)} className="mt-2 text-sm text-orange-500 hover:text-orange-600">Edit →</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
