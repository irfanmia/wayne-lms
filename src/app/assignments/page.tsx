'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface Assignment {
  id: number;
  title: string;
  description: string;
  course_title: string;
  submission_type: string;
  points: number;
  due_date: string | null;
  submission: { status: string; grade: number | null } | null;
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAssignments().then(setAssignments).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-heading font-bold mb-8">My Assignments</h1>
      {assignments.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-2">📝</div>
          <p>No assignments yet. Enroll in a course to get started.</p>
          <Link href="/courses" className="text-orange-500 text-sm mt-2 inline-block">Browse Courses →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map(a => (
            <div key={a.id} className="border rounded-xl p-5 hover:bg-gray-50 transition">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-lg">{a.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{a.course_title}</p>
                  <p className="text-sm text-gray-400 mt-2 line-clamp-2">{a.description}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <span className="text-orange-500 font-bold">{a.points} pts</span>
                  {a.due_date && <p className="text-xs text-gray-400 mt-1">Due: {new Date(a.due_date).toLocaleDateString()}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  a.submission?.status === 'graded' ? 'bg-green-100 text-green-700' :
                  a.submission?.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {a.submission?.status === 'graded' ? `Graded: ${a.submission.grade}/${a.points}` :
                   a.submission?.status === 'submitted' ? 'Submitted' : 'Not submitted'}
                </span>
                <span className="text-xs text-gray-400 capitalize">{a.submission_type.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
