'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import StudentTable from '@/components/instructor/StudentTable';

const mockStudents = [
  { user_id: 1, username: 'alice', email: 'alice@example.com', progress: 75, enrolled_at: '2024-01-15T10:00:00Z' },
  { user_id: 2, username: 'bob', email: 'bob@example.com', progress: 45, enrolled_at: '2024-02-01T10:00:00Z' },
  { user_id: 3, username: 'charlie', email: 'charlie@example.com', progress: 100, enrolled_at: '2024-01-20T10:00:00Z' },
  { user_id: 4, username: 'diana', email: 'diana@example.com', progress: 20, enrolled_at: '2024-02-10T10:00:00Z' },
];

export default function StudentManagement() {
  const { id } = useParams();
  const [students, setStudents] = useState(mockStudents);
  const [email, setEmail] = useState('');

  useEffect(() => {
    api.get(`/instructor/courses/${id}/students/`).then(setStudents).catch(() => {});
  }, [id]);

  const addStudent = async () => {
    if (!email) return;
    try {
      await api.post(`/instructor/courses/${id}/students/add/`, { email });
      setEmail('');
      api.get(`/instructor/courses/${id}/students/`).then(setStudents).catch(() => {});
    } catch {
      alert('Could not add student');
    }
  };

  const removeStudent = async (userId: number) => {
    try {
      await api.delete(`/instructor/courses/${id}/students/`, { user_id: userId });
      setStudents(students.filter((s) => s.user_id !== userId));
    } catch {
      setStudents(students.filter((s) => s.user_id !== userId));
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-heading font-bold mb-2">Student Management</h1>
      <p className="text-gray-500 mb-8">Course ID: {id}</p>

      {/* Add student */}
      <div className="flex gap-3 mb-8">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Student email"
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button
          onClick={addStudent}
          className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          Add Student
        </button>
      </div>

      <StudentTable students={students} onRemove={removeStudent} />
    </div>
  );
}
