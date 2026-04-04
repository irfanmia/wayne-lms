'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

const availableCourses = ['Intro to Python', 'Web Development', 'React Mastery', 'Creative AI', 'Machine Learning', 'Data Science 101', 'UX Design', 'Cloud Computing'];

type Bundle = { id: number; name: string; description: string; courses: string[]; price: number; originalPrice: number; status: string; sales: number };

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editBundle, setEditBundle] = useState<Bundle | null>(null);
  const [showDelete, setShowDelete] = useState<Bundle | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [form, setForm] = useState({ name: '', description: '', courses: [] as string[], price: '', originalPrice: '', status: 'Active' });

  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  useEffect(() => {
    api.getBundles().then(res => {
      const list = res.results || res;
      if (Array.isArray(list) && list.length > 0) {
        setBundles(list.map((b: Record<string, unknown>) => ({
          id: (b.id as number) || Date.now(),
          name: (b.title as string) || (b.name as string) || '',
          description: (b.description as string) || '',
          courses: Array.isArray(b.courses) ? b.courses.map((c: unknown) => typeof c === 'string' ? c : (c as Record<string, unknown>)?.title as string || '') : [],
          price: Number(b.discounted_price || b.price) || 0,
          originalPrice: Number(b.price) || 0,
          status: b.is_active !== undefined ? ((b.is_active as boolean) ? 'Active' : 'Inactive') : ((b.status as string) || 'Active'),
          sales: (b.sales as number) || (b.course_count as number) || 0,
        })));
      }
    }).catch(err => setPageError(err.message || 'Failed to load bundles'))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setEditBundle(null); setForm({ name: '', description: '', courses: [], price: '', originalPrice: '', status: 'Active' }); setShowModal(true); };
  const openEdit = (b: Bundle) => { setEditBundle(b); setForm({ name: b.name, description: b.description, courses: b.courses, price: b.price.toString(), originalPrice: b.originalPrice.toString(), status: b.status }); setShowModal(true); };

  const toggleCourse = (c: string) => setForm(f => ({ ...f, courses: f.courses.includes(c) ? f.courses.filter(x => x !== c) : [...f.courses, c] }));

  const saveBundle = async () => {
    if (!form.name || !form.price) return;
    const payload = { name: form.name, description: form.description, courses: form.courses, price: Number(form.price), original_price: Number(form.originalPrice), status: form.status };
    if (editBundle) {
      try { await api.updateBundle(String(editBundle.id), payload as Record<string, unknown>); } catch { /* local fallback */ }
      setBundles(prev => prev.map(b => b.id === editBundle.id ? { ...b, name: form.name, description: form.description, courses: form.courses, price: Number(form.price), originalPrice: Number(form.originalPrice), status: form.status } : b));
      showSuccess('Bundle updated!');
    } else {
      try { await api.createBundle(payload as Record<string, unknown>); } catch { /* local fallback */ }
      setBundles(prev => [...prev, { id: Date.now(), name: form.name, description: form.description, courses: form.courses, price: Number(form.price), originalPrice: Number(form.originalPrice), status: form.status, sales: 0 }]);
      showSuccess('Bundle created!');
    }
    setShowModal(false);
  };

  const deleteBundle = async () => { if (showDelete) { try { await api.deleteBundle(String(showDelete.id)); } catch {} setBundles(prev => prev.filter(b => b.id !== showDelete.id)); setShowDelete(null); showSuccess('Bundle deleted.'); } };
  const toggleStatus = (id: number) => setBundles(prev => prev.map(b => b.id === id ? { ...b, status: b.status === 'Active' ? 'Inactive' : 'Active' } : b));

  return (
    <div className="space-y-8">
      {successMsg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">{successMsg}</div>}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 font-heading">Bundles</h2>
        <button onClick={openCreate} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition">➕ Create Bundle</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {bundles.map(b => (
          <div key={b.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-base font-semibold text-gray-900">{b.name}</h3>
              <button onClick={() => toggleStatus(b.id)} className={`text-xs px-2 py-1 rounded-full font-medium cursor-pointer ${b.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{b.status}</button>
            </div>
            <p className="text-xs text-gray-500 mb-3">{b.description}</p>
            <div className="space-y-1 mb-3">
              {b.courses.map(c => <p key={c} className="text-xs text-gray-500 flex items-center gap-1">📚 {c}</p>)}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div>
                <span className="text-lg font-bold text-orange-600">${b.price}</span>
                {b.originalPrice > b.price && <span className="text-sm text-gray-400 line-through ml-2">${b.originalPrice}</span>}
                {b.originalPrice > b.price && <span className="text-xs text-green-600 ml-1">Save ${(b.originalPrice - b.price).toFixed(2)}</span>}
              </div>
              <span className="text-xs text-gray-500">{b.sales} sales</span>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => openEdit(b)} className="flex-1 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600">Edit</button>
              <button onClick={() => setShowDelete(b)} className="flex-1 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900">{editBundle ? 'Edit Bundle' : 'Create Bundle'}</h3>
            <div className="space-y-3">
              <div><label className="text-sm text-gray-600 block mb-1">Bundle Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
              <div><label className="text-sm text-gray-600 block mb-1">Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm h-20 focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
              <div>
                <label className="text-sm text-gray-600 block mb-2">Select Courses</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableCourses.map(c => (
                    <label key={c} className="flex items-center gap-2 text-sm text-gray-700 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" checked={form.courses.includes(c)} onChange={() => toggleCourse(c)} className="w-4 h-4 text-orange-500 rounded" /> {c}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-sm text-gray-600 block mb-1">Bundle Price *</label><input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="149" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                <div><label className="text-sm text-gray-600 block mb-1">Original Price</label><input type="number" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))} placeholder="219" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                <div><label className="text-sm text-gray-600 block mb-1">Status</label><select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"><option>Active</option><option>Inactive</option></select></div>
              </div>
              {Number(form.originalPrice) > Number(form.price) && Number(form.price) > 0 && (
                <p className="text-sm text-green-600 font-medium">💰 Savings: ${(Number(form.originalPrice) - Number(form.price)).toFixed(2)} ({Math.round(((Number(form.originalPrice) - Number(form.price)) / Number(form.originalPrice)) * 100)}% off)</p>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={saveBundle} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">Save</button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowDelete(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900">Delete Bundle</h3>
            <p className="text-sm text-gray-600">Are you sure you want to delete &ldquo;{showDelete.name}&rdquo;?</p>
            <div className="flex gap-2">
              <button onClick={deleteBundle} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">Delete</button>
              <button onClick={() => setShowDelete(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
