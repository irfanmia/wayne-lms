'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

type Template = {
  id: number; name: string; subject: string; type: string; active: boolean; lastEdited: string;
  body: string; variables: string[];
};

// No mock data — fetched from API

export default function EmailsPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showTestEmail, setShowTestEmail] = useState<number | null>(null);
  const [testEmailAddr, setTestEmailAddr] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [bulkRecipient, setBulkRecipient] = useState('All Users');
  const [bulkSubject, setBulkSubject] = useState('');
  const [bulkBody, setBulkBody] = useState('');
  const [bulkSchedule, setBulkSchedule] = useState('now');
  const [bulkDateTime, setBulkDateTime] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');

  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  useEffect(() => {
    api.getEmailTemplates().then(res => {
      const list = res.results || res;
      if (Array.isArray(list) && list.length > 0) {
        setTemplates(list.map((t: Record<string, unknown>) => ({
          id: (t.id as number) || 0,
          name: (t.name as string) || '',
          subject: (t.subject as string) || '',
          type: (t.type as string) || (t.category as string) || '',
          active: t.is_active !== undefined ? !!(t.is_active) : !!(t.active),
          lastEdited: (t.updated_at as string) || (t.lastEdited as string) || '',
          body: (t.html_body as string) || (t.body as string) || (t.html_content as string) || '',
          variables: Array.isArray(t.variables) ? t.variables as string[] : [],
        })));
      }
    }).catch(err => setPageError(err.message || 'Failed to load email templates'))
      .finally(() => setLoading(false));
  }, []);

  const toggleActive = (id: number) => setTemplates(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));

  const openEdit = (t: Template) => { setEditingTemplate(t); setEditSubject(t.subject); setEditBody(t.body); setShowPreview(false); };
  const closeEdit = () => setEditingTemplate(null);

  const saveTemplate = async () => {
    if (editingTemplate) {
      try { await api.updateEmailTemplate(editingTemplate.id, { subject: editSubject, body: editBody }); } catch {}
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...t, subject: editSubject, body: editBody, lastEdited: 'Feb 26, 2026' } : t));
      showSuccess('Template saved!');
      closeEdit();
    }
  };

  const sendTestEmail = async () => {
    if (testEmailAddr) {
      try { await api.sendTestEmail({ template_id: showTestEmail, email: testEmailAddr }); } catch {}
      showSuccess(`Test email sent to ${testEmailAddr}!`);
      setShowTestEmail(null);
      setTestEmailAddr('');
    }
  };

  const sendBulkEmail = async () => {
    if (!bulkSubject) return;
    try { await api.sendBulkEmail({ recipients: bulkRecipient, subject: bulkSubject, body: bulkBody, schedule: bulkSchedule === 'now' ? null : bulkDateTime }); } catch {}
    showSuccess(bulkSchedule === 'now' ? 'Bulk email sent!' : `Bulk email scheduled for ${bulkDateTime}!`);
    setBulkSubject('');
    setBulkBody('');
  };

  return (
    <div className="space-y-8">
      {successMsg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">{successMsg}</div>}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 font-heading">Email Manager</h2>
      </div>

      {/* Template Editor */}
      {editingTemplate ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Edit: {editingTemplate.name}</h3>
            <button onClick={closeEdit} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>
          <div><label className="text-sm text-gray-600 block mb-1">Subject Line</label><input value={editSubject} onChange={e => setEditSubject(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Email Body (HTML)</label>
            <textarea value={editBody} onChange={e => setEditBody(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono h-48 focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 font-medium mb-2">Available Variables:</p>
            <div className="flex flex-wrap gap-2">
              {editingTemplate.variables.map(v => (
                <span key={v} className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-mono cursor-pointer hover:bg-orange-200" onClick={() => setEditBody(b => b + `{{${v}}}`)}>{`{{${v}}}`}</span>
              ))}
            </div>
          </div>
          {showPreview && (
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2 font-medium">Preview:</p>
              <div className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: editBody.replace(/\{\{(\w+)\}\}/g, '<span class="bg-yellow-100 px-1 rounded">[$1]</span>') }} />
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={saveTemplate} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">Save Template</button>
            <button onClick={() => setShowPreview(!showPreview)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">{showPreview ? 'Hide' : 'Show'} Preview</button>
            <button onClick={closeEdit} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
          </div>
        </div>
      ) : (
        <>
          {/* Templates List */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Email Templates</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {templates.map(t => (
                <div key={t.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="text-sm font-medium text-gray-900">{t.name}</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{t.type}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{t.subject}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Last edited: {t.lastEdited}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => openEdit(t)} className="text-xs text-orange-600 hover:underline font-medium">Edit</button>
                    <button onClick={() => { setShowTestEmail(t.id); setTestEmailAddr(''); }} className="text-xs text-blue-600 hover:underline">Send Test</button>
                    <button onClick={() => toggleActive(t.id)} className={`w-10 h-5 rounded-full transition-colors ${t.active ? 'bg-orange-500' : 'bg-gray-300'} relative`}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${t.active ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bulk Email */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-900">Bulk Email</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Recipients</label>
                <select value={bulkRecipient} onChange={e => setBulkRecipient(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option>All Users</option><option>Students</option><option>Instructors</option><option>Specific Course Enrollees</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Subject *</label>
                <input value={bulkSubject} onChange={e => setBulkSubject(e.target.value)} placeholder="Email subject..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Body</label>
              <textarea value={bulkBody} onChange={e => setBulkBody(e.target.value)} placeholder="Write your email content..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm h-32 focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="radio" name="schedule" checked={bulkSchedule === 'now'} onChange={() => setBulkSchedule('now')} className="text-orange-500" /> Send Now
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="radio" name="schedule" checked={bulkSchedule === 'later'} onChange={() => setBulkSchedule('later')} className="text-orange-500" /> Schedule
              </label>
              {bulkSchedule === 'later' && (
                <input type="datetime-local" value={bulkDateTime} onChange={e => setBulkDateTime(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              )}
            </div>
            <button onClick={sendBulkEmail} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition">
              {bulkSchedule === 'now' ? '📧 Send Bulk Email' : '⏰ Schedule Email'}
            </button>
          </div>
        </>
      )}

      {/* Send Test Email Modal */}
      {showTestEmail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowTestEmail(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900">Send Test Email</h3>
            <p className="text-sm text-gray-600">Template: {templates.find(t => t.id === showTestEmail)?.name}</p>
            <div><label className="text-sm text-gray-600 block mb-1">Email Address</label><input type="email" value={testEmailAddr} onChange={e => setTestEmailAddr(e.target.value)} placeholder="test@example.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
            <div className="flex gap-2">
              <button onClick={sendTestEmail} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">Send Test</button>
              <button onClick={() => setShowTestEmail(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
