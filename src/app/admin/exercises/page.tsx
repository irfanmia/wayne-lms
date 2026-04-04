'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

const tracks = ['All Tracks', 'Python', 'JavaScript', 'TypeScript', 'Java', 'Go', 'Rust', 'C++', 'Ruby', 'Swift', 'Kotlin', 'SQL'];
const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const types = ['All', 'Practice', 'Tutorial', 'Challenge'];

type ExerciseItem = { id: string; name: string; track: string; difficulty: string; type: string; concept: string; completions: number; status: string };

const trackLogos: Record<string, string> = {
  Python: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
  JavaScript: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
  TypeScript: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
  Java: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
  Go: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg',
  Rust: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-original.svg',
  'C++': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',
  Ruby: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg',
  Swift: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg',
  Kotlin: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg',
  SQL: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg',
};

export default function ExercisesPage() {
  const [search, setSearch] = useState('');
  const [trackFilter, setTrackFilter] = useState('All Tracks');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.get('/exercises/').then(res => {
      const list = res.results || res;
      if (Array.isArray(list)) {
        const allExercises: ExerciseItem[] = [];
        list.forEach((e: Record<string, unknown>) => {
          const title = typeof e.title === 'object' && e.title !== null ? ((e.title as Record<string, string>).en || '') : (e.name as string) || (e.title as string) || '';
          const trackSlug = (e.trackSlug as string) || '';
          const trackName = trackSlug ? trackSlug.charAt(0).toUpperCase() + trackSlug.slice(1) : '';
          allExercises.push({
            id: String(e.id || e.slug || ''),
            name: (e.name as string) || title,
            track: trackName,
            difficulty: ((e.difficulty as string) || (e.difficultyKey as string) || 'Beginner'),
            type: (e.type as string) || 'Practice',
            concept: (e.concept as string) || '',
            completions: (e.completions as number) || 0,
            status: (e.status as string) || 'published',
          });
        });
        setExercises(allExercises);
      }
    }).catch(err => setError(err.message || 'Failed to load exercises'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = exercises.filter(e => {
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (trackFilter !== 'All Tracks' && e.track !== trackFilter) return false;
    if (difficultyFilter !== 'All' && e.difficulty !== difficultyFilter) return false;
    if (typeFilter !== 'All' && e.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-heading">Exercises</h2>
          <p className="text-sm text-gray-400 mt-1">Manage coding exercises across all tracks</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-5 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition cursor-pointer"
        >
          ➕ Create Exercise
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Exercises</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{exercises.length}</p>
          <p className="text-xs text-green-600 mt-1">↑ 3 this week</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Published</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{exercises.filter(e => e.status === 'published').length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Drafts</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{exercises.filter(e => e.status === 'draft').length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Completions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{exercises.reduce((s, e) => s + e.completions, 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Create Exercise Form */}
      {showCreate && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
          <h3 className="font-semibold text-gray-900 font-heading">New Exercise</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Exercise Name</label>
              <input placeholder="e.g., Two Fer" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Track</label>
              <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:outline-none cursor-pointer">
                {tracks.filter(t => t !== 'All Tracks').map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Difficulty</label>
              <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:outline-none cursor-pointer">
                {difficulties.filter(d => d !== 'All').map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Type</label>
              <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:outline-none cursor-pointer">
                {types.filter(t => t !== 'All').map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Concept</label>
              <input placeholder="e.g., Strings, Arrays" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Points</label>
              <input type="number" placeholder="10" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
            <textarea placeholder="Exercise description and instructions..." className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm min-h-[100px] focus:border-orange-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Starter Code</label>
            <textarea placeholder="def solution():\n    pass" className="w-full px-4 py-3 border border-gray-700 rounded-lg text-sm font-mono min-h-[120px] bg-gray-900 text-green-400 focus:border-orange-500 focus:outline-none leading-relaxed" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Test Code</label>
            <textarea placeholder="def test_solution():\n    assert solution() is not None" className="w-full px-4 py-3 border border-gray-700 rounded-lg text-sm font-mono min-h-[120px] bg-gray-900 text-green-400 focus:border-orange-500 focus:outline-none leading-relaxed" />
          </div>
          <div className="flex gap-2">
            <button className="px-5 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition cursor-pointer">Create Exercise</button>
            <button className="px-5 py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition cursor-pointer">Save as Draft</button>
            <button onClick={() => setShowCreate(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition cursor-pointer">Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
            placeholder="Search exercises..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:outline-none cursor-pointer"
          value={trackFilter}
          onChange={e => setTrackFilter(e.target.value)}
        >
          {tracks.map(t => <option key={t}>{t}</option>)}
        </select>
        <select
          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:outline-none cursor-pointer"
          value={difficultyFilter}
          onChange={e => setDifficultyFilter(e.target.value)}
        >
          {difficulties.map(d => <option key={d}>{d}</option>)}
        </select>
        <select
          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:outline-none cursor-pointer"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          {types.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* Exercises Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wider bg-gray-50">
              <th className="px-5 py-3">Exercise</th>
              <th className="px-5 py-3">Track</th>
              <th className="px-5 py-3">Difficulty</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Concept</th>
              <th className="px-5 py-3">Completions</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(e => (
              <tr key={e.id} className="hover:bg-gray-50 transition">
                <td className="px-5 py-3">
                  <span className="text-sm font-medium text-gray-900">{e.name}</span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    {trackLogos[e.track] && (
                      <img src={trackLogos[e.track]} alt={e.track} className="w-5 h-5" />
                    )}
                    <span className="text-sm text-gray-700">{e.track}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    e.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                    e.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>{e.difficulty}</span>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    e.type === 'Tutorial' ? 'bg-amber-100 text-amber-700' :
                    e.type === 'Challenge' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{e.type}</span>
                </td>
                <td className="px-5 py-3 text-sm text-gray-500">{e.concept}</td>
                <td className="px-5 py-3 text-sm text-gray-700 font-medium">{e.completions.toLocaleString()}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    e.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>{e.status === 'published' ? 'Published' : 'Draft'}</span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button className="text-xs text-orange-600 hover:underline font-medium cursor-pointer">Edit</button>
                    <button className="text-xs text-blue-600 hover:underline font-medium cursor-pointer">Preview</button>
                    <button className="text-xs text-red-500 hover:underline cursor-pointer">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm text-gray-400">No exercises match your filters</p>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <p>Showing {filtered.length} of {exercises.length} exercises</p>
        <p>Exercises are shared across courses via the Content Library</p>
      </div>
    </div>
  );
}
