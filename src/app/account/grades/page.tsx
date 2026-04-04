'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Grade {
  course_title: string;
  course_id: number;
  lesson_pct: number;
  quiz_avg: number;
  assignment_avg: number;
  overall: number;
}

export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStudentGrades().then(setGrades).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-heading font-bold mb-8">My Grades</h1>

      {grades.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-2">📊</div>
          <p>No grades yet. Complete courses to see your grades.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 font-medium">Course</th>
                <th className="pb-3 font-medium text-center">Lessons</th>
                <th className="pb-3 font-medium text-center">Quizzes</th>
                <th className="pb-3 font-medium text-center">Assignments</th>
                <th className="pb-3 font-medium text-center">Overall</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g, i) => (
                <tr key={i} className="border-b">
                  <td className="py-3 font-medium">{g.course_title}</td>
                  <td className="py-3 text-center">{g.lesson_pct}%</td>
                  <td className="py-3 text-center">{g.quiz_avg}%</td>
                  <td className="py-3 text-center">{g.assignment_avg}%</td>
                  <td className="py-3 text-center">
                    <span className={`font-bold ${g.overall >= 70 ? 'text-green-600' : g.overall >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
                      {g.overall}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
