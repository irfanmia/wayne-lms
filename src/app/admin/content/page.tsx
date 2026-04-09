'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

const tabs = ['Lessons', 'Quizzes', 'Exercises', 'Assignments'] as const;
type Tab = typeof tabs[number];

type ContentItem = { id: number; title: string; type: string; courses: number; created: string };

const emptyContent: Record<Tab, ContentItem[]> = { Lessons: [], Quizzes: [], Exercises: [], Assignments: [] };

const typeColors: Record<string, string> = {
  Video: 'bg-blue-100 text-blue-700', Text: 'bg-green-100 text-green-700', 'Multiple Choice': 'bg-purple-100 text-purple-700',
  Mixed: 'bg-indigo-100 text-indigo-700', Coding: 'bg-orange-100 text-orange-700', Project: 'bg-pink-100 text-pink-700', Document: 'bg-gray-100 text-gray-700',
};

const typeOptions: Record<Tab, string[]> = {
  Lessons: ['Video', 'Text'], Quizzes: ['Multiple Choice', 'Mixed', 'True/False'],
  Exercises: ['Coding', 'Project'], Assignments: ['Project', 'Document', 'Presentation'],
};

export default function ContentLibraryPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Lessons');
  const [search, setSearch] = useState('');
  const [content, setContent] = useState(emptyContent);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<ContentItem | null>(null);
  const [showDelete, setShowDelete] = useState<ContentItem | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [form, setForm] = useState({ title: '', type: '' });

  const items = content[activeTab].filter(i => i.title.toLowerCase().includes(search.toLowerCase()));
  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  useEffect(() => {
    const mapItems = (list: Record<string, unknown>[]): ContentItem[] =>
      list.map((item) => ({
        id: (item.id as number) || Date.now(),
        title: (item.title as string) || (item.name as string) || '',
        type: (item.type as string) || (item.content_type as string) || '',
        courses: (item.courses_count as number) || (item.courses as number) || 0,
        created: (item.created_at as string) || (item.created as string) || '',
      }));

    Promise.all([
      api.getLessons(),
      api.getContentQuizzes(),
      api.getAssignmentsList(),
    ]).then(([lessonsRes, quizzesRes, assignmentsRes]) => {
      const updated = { ...emptyContent };
      if (lessonsRes) {
        const list = lessonsRes.results || lessonsRes;
        if (Array.isArray(list) && list.length > 0) updated.Lessons = mapItems(list);
      }
      if (quizzesRes) {
        const list = quizzesRes.results || quizzesRes;
        if (Array.isArray(list) && list.length > 0) updated.Quizzes = mapItems(list);
      }
      if (assignmentsRes) {
        const list = assignmentsRes.results || assignmentsRes;
        if (Array.isArray(list) && list.length > 0) updated.Assignments = mapItems(list);
      }
      setContent(updated);
    }).catch(err => setPageError(err.message || 'Failed to load content'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => { setEditItem(null); setForm({ title: '', type: typeOptions[activeTab][0] }); setShowCreate(true); };
  const openEdit = (item: ContentItem) => { setEditItem(item); setForm({ title: item.title, type: item.type }); setShowCreate(true); };

  const saveItem = () => {
    if (!form.title) return;
    if (editItem) {
      setContent(prev => ({ ...prev, [activeTab]: prev[activeTab].map(i => i.id === editItem.id ? { ...i, title: form.title, type: form.type } : i) }));
      showSuccess('Item updated!');
    } else {
      const newItem: ContentItem = { id: Date.now(), title: form.title, type: form.type, courses: 0, created: 'Feb 26, 2026' };
      setContent(prev => ({ ...prev, [activeTab]: [newItem, ...prev[activeTab]] }));
      showSuccess('Item created!');
    }
    setShowCreate(false);
  };

  const deleteItem = () => {
    if (showDelete) {
      setContent(prev => ({ ...prev, [activeTab]: prev[activeTab].filter(i => i.id !== showDelete.id) }));
      setShowDelete(null);
      showSuccess('Item deleted.');
    }
  };

  const duplicateItem = (item: ContentItem) => {
    const dup = { ...item, id: Date.now(), title: item.title + ' (Copy)', courses: 0 };
    setContent(prev => ({ ...prev, [activeTab]: [...prev[activeTab], dup] }));
    showSuccess('Duplicated!');
  };

  return (
    <div className="space-y-8">
      {successMsg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">{successMsg}</div>}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 font-heading">Content Library</h2>
        <button onClick={openCreate} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition">➕ Create New {activeTab.slice(0, -1)}</button>
      </div>

      <div className="flex items-center gap-4 border-b border-gray-200">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 px-1 text-sm font-medium transition border-b-2 ${activeTab === tab ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{tab} <span className="text-xs text-gray-400">({content[tab].length})</span></button>
        ))}
      </div>

      <input type="text" placeholder={`Search ${activeTab.toLowerCase()}...`} value={search} onChange={e => setSearch(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-64" />

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wider bg-gray-50">
              <th className="px-5 py-3">Title</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Used in Courses</th><th className="px-5 py-3">Created</th><th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">No {activeTab.toLowerCase()} found.</td></tr>
            ) : items.map(item => (
              <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-5 py-3 text-sm font-medium text-gray-900">{item.title}</td>
                <td className="px-5 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${typeColors[item.type] || 'bg-gray-100 text-gray-600'}`}>{item.type}</span></td>
                <td className="px-5 py-3 text-sm text-gray-600">{item.courses} courses</td>
                <td className="px-5 py-3 text-sm text-gray-500">{item.created}</td>
                <td className="px-5 py-3 flex gap-2">
                  <button onClick={() => openEdit(item)} className="text-xs text-orange-600 hover:underline font-medium">Edit</button>
                  <button onClick={() => duplicateItem(item)} className="text-xs text-gray-500 hover:underline">Duplicate</button>
                  <button onClick={() => setShowDelete(item)} className="text-xs text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900">{editItem ? 'Edit' : 'Create'} {activeTab.slice(0, -1)}</h3>
            <div className="space-y-3">
              <div><label className="text-sm text-gray-600 block mb-1">Title *</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
              <div><label className="text-sm text-gray-600 block mb-1">Type</label><select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">{typeOptions[activeTab].map(t => <option key={t}>{t}</option>)}</select></div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={saveItem} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">Save</button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowDelete(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900">Delete {activeTab.slice(0, -1)}</h3>
            <p className="text-sm text-gray-600">Are you sure you want to delete &ldquo;{showDelete.title}&rdquo;?</p>
            <div className="flex gap-2">
              <button onClick={deleteItem} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">Delete</button>
              <button onClick={() => setShowDelete(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
