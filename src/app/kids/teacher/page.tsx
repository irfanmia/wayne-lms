'use client';

import { useState, useEffect } from 'react';
import kidsApi from '@/lib/kids-api';

interface ClassroomData {
  id: number;
  name: string;
  slug: string;
  join_code: string;
  student_count: number;
  assignment_count: number;
  is_active: boolean;
}

export default function TeacherDashboard() {
  const [classrooms, setClassrooms] = useState<ClassroomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    kidsApi.getTeacherDashboard()
      .then(data => { setClassrooms(data.classrooms || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const createClassroom = async () => {
    if (!newName.trim()) return;
    try {
      const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await kidsApi.createClassroom({ name: newName, slug, description: '' });
      setNewName('');
      setShowCreate(false);
      // Refresh
      const data = await kidsApi.getTeacherDashboard();
      setClassrooms(data.classrooms || []);
    } catch (e) {
      console.error('Create classroom failed:', e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-6xl animate-pulse">👩‍🏫</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-[Manrope]">👩‍🏫 Teacher Dashboard</h1>
          <p className="text-gray-600">Manage your coding classrooms</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-5 rounded-xl transition-colors"
        >
          + New Classroom
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white rounded-2xl p-6 border-2 border-orange-200 mb-6">
          <h3 className="font-bold mb-3">Create Classroom</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Classroom name..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 focus:border-orange-400 focus:outline-none"
            />
            <button onClick={createClassroom} className="bg-orange-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-orange-600">
              Create
            </button>
          </div>
        </div>
      )}

      {/* Classrooms */}
      {classrooms.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-4">🏫</div>
          <h3 className="text-xl font-bold mb-2">No Classrooms Yet</h3>
          <p className="text-gray-500">Create your first classroom to get started!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {classrooms.map(c => (
            <div key={c.id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-orange-300 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold">{c.name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {c.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <div className="text-xl font-bold">{c.student_count}</div>
                  <div className="text-xs text-gray-500">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{c.assignment_count}</div>
                  <div className="text-xs text-gray-500">Assignments</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-mono font-bold bg-orange-100 text-orange-600 px-2 py-1 rounded">{c.join_code}</div>
                  <div className="text-xs text-gray-500">Join Code</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 text-sm bg-orange-50 text-orange-600 py-2 rounded-xl hover:bg-orange-100 font-medium transition-colors">
                  📋 Assign Challenge
                </button>
                <button className="flex-1 text-sm bg-gray-50 text-gray-600 py-2 rounded-xl hover:bg-gray-100 font-medium transition-colors">
                  📊 View Progress
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick guide */}
      <div className="mt-10 bg-purple-50 rounded-2xl p-6 border border-purple-100">
        <h3 className="font-bold text-lg mb-3">📚 Quick Guide</h3>
        <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
          <li>Create a classroom and share the <strong>Join Code</strong> with students</li>
          <li>Students join using the code from their dashboard</li>
          <li>Assign challenges from the curriculum to your classroom</li>
          <li>Track each student&apos;s progress, points, and completion</li>
        </ol>
      </div>
    </div>
  );
}
