'use client';
import { useState, useEffect, use } from 'react';
import api from '@/lib/api';

interface AutoGradeResult {
  tests: { name: string; passed: boolean }[];
  passed: number;
  total: number;
  all_passed: boolean;
  output: string;
  errors: string;
}

interface Submission {
  id: number;
  user: number;
  user_name: string;
  text_content: string;
  url: string;
  code_content: string;
  code_language: string;
  auto_grade_result: AutoGradeResult | null;
  attempt_number: number;
  status: string;
  grade: number | null;
  feedback: string;
  submitted_at: string;
  file: string | null;
}

interface AssignmentData {
  id: number;
  title: string;
  submission_type: string;
  answer_type: string;
  points: number;
  rubric: string;
  auto_grade: boolean;
  programming_language: string;
}

export default function InstructorAssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const assignmentId = parseInt(id);
  const [assignment, setAssignment] = useState<AssignmentData | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [grading, setGrading] = useState<number | null>(null);
  const [gradeValue, setGradeValue] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showRubric, setShowRubric] = useState(false);

  useEffect(() => {
    api.getAssignment(assignmentId).then(setAssignment).catch(() => {});
    api.getAssignmentSubmissions(assignmentId).then(setSubmissions).catch(() => {});
  }, [assignmentId]);

  const handleGrade = async (subId: number) => {
    try {
      const updated = await api.gradeSubmission(assignmentId, subId, { grade: parseInt(gradeValue), feedback });
      setSubmissions(prev => prev.map(s => s.id === subId ? updated : s));
      setGrading(null);
      setGradeValue('');
      setFeedback('');
    } catch { /* ignore */ }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold">{assignment?.title || 'Assignment Submissions'}</h1>
          {assignment && (
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
              <span className="capitalize px-2 py-0.5 bg-gray-100 rounded-full text-xs">{assignment.submission_type.replace('_', ' ')}</span>
              <span className="capitalize px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs">{assignment.answer_type.replace('_', ' ')}</span>
              <span className="text-orange-500 font-bold">{assignment.points} pts</span>
              {assignment.auto_grade && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs">Auto-graded</span>}
            </div>
          )}
        </div>
        {assignment?.rubric && (
          <button onClick={() => setShowRubric(!showRubric)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
            📋 {showRubric ? 'Hide' : 'Show'} Rubric
          </button>
        )}
      </div>

      {/* Rubric panel */}
      {showRubric && assignment?.rubric && (
        <div className="mb-6 border border-orange-200 bg-orange-50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-orange-700 mb-2">Grading Rubric</h3>
          <div className="text-sm text-gray-700 whitespace-pre-wrap">{assignment.rubric}</div>
        </div>
      )}

      {submissions.length === 0 ? (
        <p className="text-gray-400 text-center py-16">No submissions yet.</p>
      ) : (
        <div className="space-y-4">
          {submissions.map(s => (
            <div key={s.id} className="border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium">{s.user_name}</h3>
                  <p className="text-xs text-gray-400">
                    {new Date(s.submitted_at).toLocaleString()}
                    {s.attempt_number > 1 && ` · Attempt ${s.attempt_number}`}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  s.status === 'graded' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {s.status === 'graded' ? `Grade: ${s.grade}/${assignment?.points || '?'}` : 'Pending'}
                </span>
              </div>

              {/* Text content */}
              {s.text_content && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Text Response:</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{s.text_content}</p>
                </div>
              )}

              {/* Code content */}
              {s.code_content && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-medium text-gray-500">Code:</p>
                    {s.code_language && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-mono">{s.code_language}</span>
                    )}
                  </div>
                  <pre className="bg-[#1e1e2e] text-green-300 font-mono text-sm p-4 rounded-xl overflow-x-auto max-h-80">
                    {s.code_content}
                  </pre>
                </div>
              )}

              {/* URL */}
              {s.url && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">URL:</p>
                  <a href={s.url} className="text-sm text-orange-500 hover:underline" target="_blank" rel="noopener noreferrer">{s.url}</a>
                </div>
              )}

              {/* File */}
              {s.file && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">File:</p>
                  <a href={s.file} className="inline-flex items-center gap-2 text-sm text-orange-500 hover:underline" target="_blank" rel="noopener noreferrer">
                    📄 Download file
                  </a>
                </div>
              )}

              {/* Auto-grade results */}
              {s.auto_grade_result && (
                <div className="mb-3 border rounded-lg overflow-hidden">
                  <div className={`px-3 py-2 text-xs font-medium ${s.auto_grade_result.all_passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    Auto-grade: {s.auto_grade_result.passed}/{s.auto_grade_result.total} tests passed
                  </div>
                  <div className="p-3 space-y-1">
                    {s.auto_grade_result.tests.map((t, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span>{t.passed ? '✅' : '❌'}</span>
                        <span>{t.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grade form */}
              {grading === s.id ? (
                <div className="mt-3 space-y-2 border-t pt-3">
                  <input type="number" placeholder={`Grade (out of ${assignment?.points || 100})`} value={gradeValue} onChange={e => setGradeValue(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm" min={0} max={assignment?.points || 100} />
                  <textarea placeholder="Feedback for student" value={feedback} onChange={e => setFeedback(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} />
                  <div className="flex gap-2">
                    <button onClick={() => handleGrade(s.id)} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600">Save Grade</button>
                    <button onClick={() => setGrading(null)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setGrading(s.id)} className="mt-3 text-sm text-orange-500 hover:text-orange-600">
                  {s.status === 'graded' ? 'Update Grade →' : 'Grade →'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
