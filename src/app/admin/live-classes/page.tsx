'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface LiveClass {
  id: number;
  title: string;
  description: string;
  course: number;
  course_title: string;
  course_slug: string;
  instructor: number;
  instructor_name: string;
  platform: string;
  meeting_url: string;
  meeting_id: string;
  recording_url: string;
  scheduled_at: string;
  duration: number;
  max_attendees: number;
  status: string;
  timezone: string;
  attendee_count: number;
}

interface CourseOption {
  id: number;
  title: string | Record<string, string>;
  slug: string;
}

import PlatformBadge from '@/components/ui/PlatformBadge';

const STATUS_STYLES: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  live: 'bg-red-100 text-red-700 animate-pulse',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

const DURATIONS = [
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
  { value: 90, label: '90 min' },
  { value: 120, label: '120 min' },
];

export default function AdminLiveClassesPage() {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterCourse, setFilterCourse] = useState('');

  // Form state
  const [form, setForm] = useState({
    title: '', description: '', course: '', platform: 'google_meet',
    meeting_url: '', scheduled_at: '', duration: 60, timezone: 'UTC', max_attendees: 100,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;
      if (filterPlatform) params.platform = filterPlatform;
      if (filterCourse) params.course = filterCourse;
      const query = Object.keys(params).length ? '?' + new URLSearchParams(params).toString() : '';
      const data = await api.getLiveClasses(filterCourse || undefined);
      const list = Array.isArray(data) ? data : data?.results || [];
      // Apply additional filters client-side
      let filtered = list;
      if (filterStatus) filtered = filtered.filter((lc: LiveClass) => lc.status === filterStatus);
      if (filterPlatform) filtered = filtered.filter((lc: LiveClass) => lc.platform === filterPlatform);
      setLiveClasses(filtered);
    } catch { setLiveClasses([]); }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    api.getCourses?.()
      .then((data: unknown) => {
        const list = Array.isArray(data) ? data : (data as { results?: CourseOption[] })?.results || [];
        setCourses(list);
      })
      .catch(() => {});
  }, [filterStatus, filterPlatform, filterCourse]);

  const resetForm = () => {
    setForm({ title: '', description: '', course: '', platform: 'google_meet', meeting_url: '', scheduled_at: '', duration: 60, timezone: 'UTC', max_attendees: 100 });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, course: Number(form.course) };
    try {
      if (editingId) {
        await api.updateLiveClass(editingId, payload);
      } else {
        await api.createLiveClass(payload);
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error('Failed to save live class:', err);
    }
  };

  const handleEdit = (lc: LiveClass) => {
    setForm({
      title: lc.title, description: lc.description || '', course: String(lc.course),
      platform: lc.platform, meeting_url: lc.meeting_url || '', duration: lc.duration,
      scheduled_at: lc.scheduled_at ? new Date(lc.scheduled_at).toISOString().slice(0, 16) : '',
      timezone: lc.timezone || 'UTC', max_attendees: lc.max_attendees || 100,
    });
    setEditingId(lc.id);
    setShowModal(true);
  };

  const handleAction = async (id: number, action: 'start' | 'end' | 'cancel' | 'delete') => {
    try {
      if (action === 'start') await api.startLiveClass(id);
      else if (action === 'end') await api.endLiveClass(id);
      else if (action === 'cancel') await api.cancelLiveClass(id);
      else if (action === 'delete') await api.deleteLiveClass(id);
      fetchData();
    } catch (err) {
      console.error(`Failed to ${action} live class:`, err);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const getCourseTitle = (c: CourseOption) => typeof c.title === 'string' ? c.title : c.title?.en || Object.values(c.title)[0] || '';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-manrope)]">📡 Live Classes</h1>
          <p className="text-sm text-gray-500 mt-1">Schedule and manage live sessions</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
        >
          + Schedule Class
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white">
          <option value="">All Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="live">Live</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white">
          <option value="">All Platforms</option>
          <option value="google_meet">Google Meet</option>
          <option value="zoom">Zoom</option>
          <option value="microsoft_teams">Microsoft Teams</option>
        </select>
        <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white">
          <option value="">All Courses</option>
          {courses.map(c => <option key={c.id} value={c.slug}>{getCourseTitle(c)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Course</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Platform</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date & Time</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : liveClasses.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No live classes found</td></tr>
              ) : liveClasses.map(lc => (
                <tr key={lc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{lc.title}</div>
                    <div className="text-xs text-gray-500">{lc.duration} min · {lc.attendee_count || 0} attendees</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{lc.course_title}</td>
                  <td className="px-4 py-3">
                    <PlatformBadge platform={lc.platform} />
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatDate(lc.scheduled_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold capitalize ${STATUS_STYLES[lc.status] || ''}`}>
                      {lc.status === 'live' ? '🔴 ' : ''}{lc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button onClick={() => handleEdit(lc)} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer">Edit</button>
                      {lc.status === 'scheduled' && (
                        <>
                          <button onClick={() => handleAction(lc.id, 'start')} className="text-xs px-2 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700 cursor-pointer">Start</button>
                          <button onClick={() => handleAction(lc.id, 'cancel')} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-500 cursor-pointer">Cancel</button>
                        </>
                      )}
                      {lc.status === 'live' && (
                        <button onClick={() => handleAction(lc.id, 'end')} className="text-xs px-2 py-1 rounded bg-green-100 hover:bg-green-200 text-green-700 cursor-pointer">End</button>
                      )}
                      <button onClick={() => { if (confirm('Delete this live class?')) handleAction(lc.id, 'delete'); }} className="text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 font-[family-name:var(--font-manrope)]">
                {editingId ? 'Edit Live Class' : 'Schedule Live Class'}
              </h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                  <select required value={form.course} onChange={e => setForm({ ...form, course: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="">Select course</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{getCourseTitle(c)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                  <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="google_meet">Google Meet</option>
                    <option value="zoom">Zoom</option>
                    <option value="microsoft_teams">Microsoft Teams</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting URL</label>
                <input type="url" value={form.meeting_url} onChange={e => setForm({ ...form, meeting_url: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="https://meet.google.com/..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                  <input type="datetime-local" required value={form.scheduled_at} onChange={e => setForm({ ...form, scheduled_at: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <select value={form.duration} onChange={e => setForm({ ...form, duration: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                    {DURATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  <input type="text" value={form.timezone} onChange={e => setForm({ ...form, timezone: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Attendees</label>
                  <input type="number" value={form.max_attendees} onChange={e => setForm({ ...form, max_attendees: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 cursor-pointer">Cancel</button>
                <button type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer">
                  {editingId ? 'Update' : 'Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
