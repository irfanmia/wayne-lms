'use client';
import { useState, useEffect, use } from 'react';
import api from '@/lib/api';

interface StudentGrade {
  student_name: string;
  student_id: number;
  lesson_pct: number;
  quiz_avg: number;
  assignment_avg: number;
  overall: number;
}

export default function GradebookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const courseId = parseInt(id);
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCourseGradebook(courseId).then(setGrades).catch(() => {}).finally(() => setLoading(false));
  }, [courseId]);

  const exportCSV = () => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/gradebook/course/${courseId}/export/`, '_blank');
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-heading font-bold">Gradebook</h1>
        <button onClick={exportCSV} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600">
          📥 Export CSV
        </button>
      </div>

      {grades.length === 0 ? (
        <p className="text-gray-400 text-center py-16">No students enrolled yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 font-medium">Student</th>
                <th className="pb-3 font-medium text-center">Lesson %</th>
                <th className="pb-3 font-medium text-center">Quiz Avg</th>
                <th className="pb-3 font-medium text-center">Assignment Avg</th>
                <th className="pb-3 font-medium text-center">Overall</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium">{g.student_name}</td>
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
