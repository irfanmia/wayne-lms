'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

type CourseItem = { slug: string; title: string; category: string; level: string; instructor: string; status: string; students: number; rating: number; modified: string; thumbnail: string; description: string; lessons: number; modules: number; certificates: boolean; coupons: number; assignments: number };

const statusColor: Record<string, string> = {
  Published: 'bg-green-100 text-green-700',
  Draft: 'bg-amber-100 text-amber-700',
  Archived: 'bg-gray-100 text-gray-600',
};

const categories = ['Programming', 'AI & ML', 'Data Science', 'Web Dev', 'Design', 'DevOps'];
const levels = ['Beginner', 'Intermediate', 'Advanced'];

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'table' | 'cards'>('table');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const [form, setForm] = useState({ title: '', category: 'Programming', level: 'Beginner', instructor: '', thumbnail: '', description: '' });

  useEffect(() => {
    setLoading(true);
    api.getCourses().then(res => {
      const list = res.results || res;
      if (Array.isArray(list)) {
        setCourses(list.map((c: Record<string, unknown>) => ({
          slug: (c.slug as string) || '',
          title: typeof c.title === 'object' && c.title !== null ? ((c.title as Record<string, string>).en || Object.values(c.title as Record<string, string>)[0] || '') : (c.title as string) || '',
          category: (c.category as string) || 'Programming',
          level: (c.level as string) || 'Beginner',
          instructor: (c.instructor as string) || (c.instructor_name as string) || '',
          status: ((c.status as string) || 'published').charAt(0).toUpperCase() + ((c.status as string) || 'published').slice(1),
          students: (c.enrolled_count as number) || (c.students as number) || 0,
          rating: (c.average_rating as number) || (c.rating as number) || 0,
          modified: (c.updated_at as string) || (c.modified as string) || '',
          thumbnail: (c.thumbnail as string) || '',
          description: typeof c.description === 'object' && c.description !== null ? ((c.description as Record<string, string>).en || '') : (c.description as string) || '',
          lessons: (c.lessons_count as number) || (c.lessons as number) || (c.duration as number) || 0,
          modules: (c.module_count as number) || (c.modules_count as number) || (c.modules as number) || 0,
          certificates: !!(c.certificates),
          coupons: (c.coupons as number) || 0,
          assignments: (c.assignments_count as number) || (c.assignments as number) || 0,
        })));
      }
    }).catch(err => setError(err.message || 'Failed to load courses'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter(c =>
    (statusFilter === 'All' || c.status === statusFilter) &&
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (slug: string) => setSelected(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(c => c.slug));

  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const createCourse = async () => {
    if (!form.title) return;
    const slug = generateSlug(form.title);
    try {
      await api.createCourse({ title: form.title, category: form.category, level: form.level, description: form.description, thumbnail: form.thumbnail });
    } catch { /* continue with local state */ }
    setCourses(prev => [{ ...form, slug, status: 'Draft', students: 0, rating: 0, modified: 'Feb 26, 2026', lessons: 0, modules: 0, certificates: false, coupons: 0, assignments: 0 }, ...prev]);
    setShowCreate(false);
    setForm({ title: '', category: 'Programming', level: 'Beginner', instructor: '', thumbnail: '', description: '' });
    showSuccess('Course created! Redirecting to editor...');
  };

  const duplicateCourse = (slug: string) => {
    const c = courses.find(x => x.slug === slug);
    if (!c) return;
    const newSlug = c.slug + '-copy-' + Date.now();
    setCourses(prev => [...prev, { ...c, slug: newSlug, title: c.title + ' (Copy)', status: 'Draft', students: 0, rating: 0 }]);
    showSuccess('Course duplicated!');
  };

  const toggleArchive = (slug: string) => {
    setCourses(prev => prev.map(c => c.slug === slug ? { ...c, status: c.status === 'Archived' ? 'Draft' : 'Archived' } : c));
  };

  const deleteCourse = async () => {
    if (showDelete) {
      try { await api.deleteCourse(showDelete); } catch { /* continue with local */ }
      setCourses(prev => prev.filter(c => c.slug !== showDelete));
      setSelected(prev => prev.filter(s => s !== showDelete));
      setShowDelete(null);
      showSuccess('Course deleted.');
    }
  };

  const bulkAction = (action: string) => {
    if (action === 'delete') {
      setCourses(prev => prev.filter(c => !selected.includes(c.slug)));
      showSuccess(`${selected.length} courses deleted.`);
    } else if (action === 'publish') {
      setCourses(prev => prev.map(c => selected.includes(c.slug) ? { ...c, status: 'Published' } : c));
      showSuccess(`${selected.length} courses published.`);
    } else if (action === 'archive') {
      setCourses(prev => prev.map(c => selected.includes(c.slug) ? { ...c, status: 'Archived' } : c));
      showSuccess(`${selected.length} courses archived.`);
    }
    setSelected([]);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500" /></div>;
  if (error) return <div className="flex items-center justify-center h-64"><div className="text-center"><p className="text-red-500 text-lg mb-2">⚠️ Failed to load courses</p><p className="text-gray-500 text-sm">{error}</p></div></div>;

  return (
    <div className="space-y-8">
      {successMsg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">{successMsg}</div>}

      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900 font-heading">Courses</h2><p className="text-sm text-gray-500">{courses.length} total courses</p></div>
        <button onClick={() => { const slug = 'new-course-' + Date.now(); router.push(`/admin/courses/${slug}/edit/settings`); }} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition cursor-pointer">➕ Create New Course</button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input type="text" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-64" />
        {['All', 'Published', 'Draft', 'Archived'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${statusFilter === s ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{s}</button>
        ))}
        <div className="ml-auto flex gap-1">
          <button onClick={() => setView('table')} className={`p-2 rounded ${view === 'table' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>☰</button>
          <button onClick={() => setView('cards')} className={`p-2 rounded ${view === 'cards' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>▦</button>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2">
          <span className="text-sm font-medium text-orange-700">{selected.length} selected</span>
          <button onClick={() => bulkAction('publish')} className="text-sm text-orange-600 hover:underline">Publish</button>
          <button onClick={() => bulkAction('archive')} className="text-sm text-orange-600 hover:underline">Archive</button>
          <button onClick={() => bulkAction('delete')} className="text-sm text-red-600 hover:underline">Delete</button>
        </div>
      )}

      {view === 'table' ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider bg-gray-50">
                <th className="px-5 py-3"><input type="checkbox" onChange={toggleAll} checked={selected.length === filtered.length && filtered.length > 0} /></th>
                <th className="px-5 py-3">Course</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Students</th><th className="px-5 py-3">Rating</th><th className="px-5 py-3">Modified</th><th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.slug} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-3"><input type="checkbox" checked={selected.includes(c.slug)} onChange={() => toggleSelect(c.slug)} /></td>
                  <td className="px-5 py-3"><div className="flex items-center gap-3">{c.thumbnail ? <img src={c.thumbnail} alt="" className="w-8 h-8 object-contain shrink-0" /> : <div className="w-8 h-8 bg-gray-200 rounded shrink-0" />}<div><span className="text-sm font-medium text-gray-900">{c.title}</span><p className="text-xs text-gray-400">{c.lessons} lessons · {c.modules} modules</p></div></div></td>
                  <td className="px-5 py-3 text-sm text-gray-500">{c.category}</td>
                  <td className="px-5 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[c.status] || 'bg-gray-100 text-gray-600'}`}>{c.status}</span></td>
                  <td className="px-5 py-3 text-sm text-gray-600">{c.students.toLocaleString()}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{c.rating > 0 ? `⭐ ${c.rating}` : '—'}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{c.modified}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/courses/${c.slug}/edit/settings`} className="text-xs text-orange-600 hover:underline font-medium">Edit</Link>
                      <button onClick={() => duplicateCourse(c.slug)} className="text-xs text-gray-500 hover:underline">Duplicate</button>
                      <button onClick={() => toggleArchive(c.slug)} className="text-xs text-gray-500 hover:underline">{c.status === 'Archived' ? 'Unarchive' : 'Archive'}</button>
                      <button onClick={() => setShowDelete(c.slug)} className="text-xs text-red-500 hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(c => (
            <div key={c.slug} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:border-orange-300 transition">
              <div className="h-32 bg-gray-100 flex items-center justify-center">{c.thumbnail ? <img src={c.thumbnail} alt="" className="w-16 h-16 object-contain" /> : <span className="text-4xl">📚</span>}</div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[c.status] || 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
                  <span className="text-xs text-gray-400">{c.category}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">{c.title}</h3>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{c.students.toLocaleString()} students</span>
                  <span>{c.rating > 0 ? `⭐ ${c.rating}` : '—'}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <Link href={`/admin/courses/${c.slug}/edit/settings`} className="flex-1 text-center py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600">Edit</Link>
                  <button onClick={() => duplicateCourse(c.slug)} className="flex-1 text-center py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200">Duplicate</button>
                  <button onClick={() => setShowDelete(c.slug)} className="py-1.5 px-2 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100">🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Course Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900">Create New Course</h3>
            <div className="space-y-3">
              <div><label className="text-sm text-gray-600 block mb-1">Course Name *</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
              <div><label className="text-sm text-gray-600 block mb-1">Slug</label><input value={generateSlug(form.title)} readOnly className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm text-gray-600 block mb-1">Category</label><select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">{categories.map(c => <option key={c}>{c}</option>)}</select></div>
                <div><label className="text-sm text-gray-600 block mb-1">Level</label><select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">{levels.map(l => <option key={l}>{l}</option>)}</select></div>
              </div>
              <div><label className="text-sm text-gray-600 block mb-1">Instructor</label><input value={form.instructor} onChange={e => setForm(f => ({ ...f, instructor: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
              <div><label className="text-sm text-gray-600 block mb-1">Thumbnail URL</label><input value={form.thumbnail} onChange={e => setForm(f => ({ ...f, thumbnail: e.target.value }))} placeholder="https://..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
              <div><label className="text-sm text-gray-600 block mb-1">Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm h-20 focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={createCourse} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">Create Course</button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowDelete(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900">Delete Course</h3>
            <p className="text-sm text-gray-600">Are you sure you want to delete this course? This action cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={deleteCourse} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">Delete</button>
              <button onClick={() => setShowDelete(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
