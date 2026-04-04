'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Assignment from './Assignment';

interface Props {
  assignmentId: number;
  onComplete?: () => void;
}

export default function AssignmentLoader({ assignmentId, onComplete }: Props) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getAssignment(assignmentId)
      .then((d: Record<string, unknown>) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setData(null);
        setLoading(false);
      });
  }, [assignmentId]);

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-2/3" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-64 bg-gray-100 rounded-xl" />
    </div>
  );
  if (!data) return <div className="text-red-500 p-4 bg-red-50 rounded-lg">Failed to load assignment</div>;

  return (
    <Assignment
      assignmentId={assignmentId}
      title={data.title as string}
      description={data.description as string}
      submissionType={data.submission_type as string}
      answerType={data.answer_type as string}
      points={data.points as number}
      dueDate={data.due_date as string}
      programmingLanguage={data.programming_language as string}
      starterCode={data.starter_code as string}
      testCode={data.test_code as string}
      rubric={data.rubric as string}
      maxAttempts={data.max_attempts as number}
      autoGrade={data.auto_grade as boolean}
      allowedExtensions={data.allowed_extensions as string}
      maxFileSize={data.max_file_size as number}
    />
  );
}
