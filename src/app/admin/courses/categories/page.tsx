'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

type Category = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  parent: number | null;
  subcategories: Category[];
};

const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Create category form
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('');

  // Edit category
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');

  // Create subcategory
  const [subParentId, setSubParentId] = useState<number | null>(null);
  const [newSubName, setNewSubName] = useState('');
  const [newSubIcon, setNewSubIcon] = useState('');

  // Edit subcategory
  const [editingSub, setEditingSub] = useState<Category | null>(null);
  const [editSubName, setEditSubName] = useState('');
  const [editSubIcon, setEditSubIcon] = useState('');

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.getCategories();
      const list = res.results || res;
      setCategories(Array.isArray(list) ? list : []);
    } catch (e) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    setSaving(true);
    try {
      await api.createCategory({ name: newCatName.trim(), icon: newCatIcon.trim() });
      setNewCatName('');
      setNewCatIcon('');
      await fetchCategories();
    } catch { setError('Failed to create category'); }
    finally { setSaving(false); }
  };

  const handleUpdateCategory = async (cat: Category) => {
    setSaving(true);
    try {
      await api.put(`/courses/categories/${cat.slug}/`, { name: editName.trim(), icon: editIcon.trim() });
      setEditingCat(null);
      await fetchCategories();
    } catch { setError('Failed to update category'); }
    finally { setSaving(false); }
  };

  const handleCreateSubCategory = async () => {
    if (!newSubName.trim() || !subParentId) return;
    setSaving(true);
    try {
      await api.createCategory({ name: newSubName.trim(), icon: newSubIcon.trim(), parent: subParentId });
      setNewSubName('');
      setNewSubIcon('');
      setSubParentId(null);
      await fetchCategories();
    } catch { setError('Failed to create sub-category'); }
    finally { setSaving(false); }
  };

  const handleUpdateSubCategory = async (sub: Category) => {
    setSaving(true);
    try {
      await api.put(`/courses/categories/${sub.slug}/`, { name: editSubName.trim(), icon: editSubIcon.trim(), parent: sub.parent });
      setEditingSub(null);
      await fetchCategories();
    } catch { setError('Failed to update sub-category'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      // Find slug from categories or subcategories
      let slug = '';
      for (const cat of categories) {
        if (cat.id === deleteTarget.id) { slug = cat.slug; break; }
        for (const sub of cat.subcategories) {
          if (sub.id === deleteTarget.id) { slug = sub.slug; break; }
        }
      }
      if (slug) await api.delete(`/courses/categories/${slug}/`);
      setDeleteTarget(null);
      await fetchCategories();
    } catch { setError('Failed to delete'); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading text-gray-900">Categories</h1>
        <p className="text-sm text-gray-500 mt-1">Manage course categories and sub-categories</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <span>❌</span> {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Create Category */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">➕ New Category</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Category Name <span className="text-red-500">*</span></label>
                <input
                  className={inputCls}
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="e.g. Web Development"
                  onKeyDown={e => e.key === 'Enter' && handleCreateCategory()}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Icon (emoji or code)</label>
                <input
                  className={inputCls}
                  value={newCatIcon}
                  onChange={e => setNewCatIcon(e.target.value)}
                  placeholder="e.g. 🌐"
                />
              </div>
              <button
                onClick={handleCreateCategory}
                disabled={saving || !newCatName.trim()}
                className="w-full py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 transition cursor-pointer"
              >
                {saving ? 'Creating…' : 'Create Category'}
              </button>
            </div>
          </div>

          {/* Create Sub-category */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">➕ New Sub-category</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Parent Category <span className="text-red-500">*</span></label>
                <select
                  className={inputCls}
                  value={subParentId ?? ''}
                  onChange={e => setSubParentId(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Select parent…</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ''}{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Sub-category Name <span className="text-red-500">*</span></label>
                <input
                  className={inputCls}
                  value={newSubName}
                  onChange={e => setNewSubName(e.target.value)}
                  placeholder="e.g. React & Next.js"
                  onKeyDown={e => e.key === 'Enter' && handleCreateSubCategory()}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Icon (emoji or code)</label>
                <input
                  className={inputCls}
                  value={newSubIcon}
                  onChange={e => setNewSubIcon(e.target.value)}
                  placeholder="e.g. ⚛️"
                />
              </div>
              <button
                onClick={handleCreateSubCategory}
                disabled={saving || !newSubName.trim() || !subParentId}
                className="w-full py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 transition cursor-pointer"
              >
                {saving ? 'Creating…' : 'Create Sub-category'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Categories List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">All Categories</h2>
              <span className="text-xs text-gray-400">{categories.length} categories</span>
            </div>

            {loading ? (
              <div className="p-10 text-center text-gray-400 text-sm">Loading…</div>
            ) : categories.length === 0 ? (
              <div className="p-10 text-center text-gray-400 text-sm">No categories yet. Create one on the left.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {categories.map(cat => (
                  <div key={cat.id}>
                    {/* Category row */}
                    <div className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 group">
                      <span className="text-xl w-7 text-center">{cat.icon || '📁'}</span>
                      <div className="flex-1 min-w-0">
                        {editingCat?.id === cat.id ? (
                          <div className="flex gap-2 items-center">
                            <input
                              className="flex-1 px-2 py-1 border border-orange-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-300"
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              autoFocus
                              onKeyDown={e => { if (e.key === 'Enter') handleUpdateCategory(cat); if (e.key === 'Escape') setEditingCat(null); }}
                            />
                            <input
                              className="w-16 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none"
                              value={editIcon}
                              onChange={e => setEditIcon(e.target.value)}
                              placeholder="icon"
                            />
                            <button onClick={() => handleUpdateCategory(cat)} className="text-xs text-orange-600 font-medium hover:text-orange-800 cursor-pointer">Save</button>
                            <button onClick={() => setEditingCat(null)} className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">Cancel</button>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm font-medium text-gray-800">{cat.name}</p>
                            <p className="text-xs text-gray-400">/{cat.slug} · {cat.subcategories.length} sub-categories</p>
                          </div>
                        )}
                      </div>
                      {editingCat?.id !== cat.id && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => { setSubParentId(cat.id); setNewSubName(''); setNewSubIcon(''); }}
                            className="text-xs text-gray-500 hover:text-orange-600 px-2 py-1 rounded hover:bg-orange-50 transition cursor-pointer"
                            title="Add sub-category"
                          >+ Sub</button>
                          <button
                            onClick={() => { setEditingCat(cat); setEditName(cat.name); setEditIcon(cat.icon); }}
                            className="text-xs text-gray-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 transition cursor-pointer"
                          >✏️ Edit</button>
                          <button
                            onClick={() => setDeleteTarget({ id: cat.id, name: cat.name })}
                            className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 transition cursor-pointer"
                          >🗑️</button>
                        </div>
                      )}
                    </div>

                    {/* Subcategory rows */}
                    {cat.subcategories.length > 0 && (
                      <div className="bg-gray-50/60">
                        {cat.subcategories.map(sub => (
                          <div key={sub.id} className="flex items-center gap-3 px-5 py-2.5 pl-14 hover:bg-gray-100/60 group border-t border-gray-100/80">
                            <span className="text-base w-6 text-center">{sub.icon || '📄'}</span>
                            <div className="flex-1 min-w-0">
                              {editingSub?.id === sub.id ? (
                                <div className="flex gap-2 items-center">
                                  <input
                                    className="flex-1 px-2 py-1 border border-orange-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-300"
                                    value={editSubName}
                                    onChange={e => setEditSubName(e.target.value)}
                                    autoFocus
                                    onKeyDown={e => { if (e.key === 'Enter') handleUpdateSubCategory(sub); if (e.key === 'Escape') setEditingSub(null); }}
                                  />
                                  <input
                                    className="w-16 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none"
                                    value={editSubIcon}
                                    onChange={e => setEditSubIcon(e.target.value)}
                                    placeholder="icon"
                                  />
                                  <button onClick={() => handleUpdateSubCategory(sub)} className="text-xs text-orange-600 font-medium hover:text-orange-800 cursor-pointer">Save</button>
                                  <button onClick={() => setEditingSub(null)} className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">Cancel</button>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-700">{sub.name} <span className="text-xs text-gray-400">/{sub.slug}</span></p>
                              )}
                            </div>
                            {editingSub?.id !== sub.id && (
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                <button
                                  onClick={() => { setEditingSub(sub); setEditSubName(sub.name); setEditSubIcon(sub.icon); }}
                                  className="text-xs text-gray-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 transition cursor-pointer"
                                >✏️ Edit</button>
                                <button
                                  onClick={() => setDeleteTarget({ id: sub.id, name: sub.name })}
                                  className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 transition cursor-pointer"
                                >🗑️</button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-xl p-6 w-96 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h4 className="text-base font-semibold mb-2">Delete "{deleteTarget.name}"?</h4>
            <p className="text-sm text-gray-500 mb-5">This will permanently delete the category. Courses assigned to it will not be deleted.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">Cancel</button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 cursor-pointer"
              >{saving ? 'Deleting…' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
