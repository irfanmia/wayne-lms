'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Assignment from './Assignment';

interface Props {
  assignmentId: number;
  onComplete?: () => void;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function AssignmentLoader({ assignmentId, onComplete }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getAssignment(assignmentId)
      .then((d: any) => {
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
      title={data.title}
      description={data.description}
      submissionType={data.submission_type}
      answerType={data.answer_type}
      points={data.points}
      dueDate={data.due_date}
      programmingLanguage={data.programming_language}
      starterCode={data.starter_code}
      testCode={data.test_code}
      rubric={data.rubric}
      maxAttempts={data.max_attempts}
      autoGrade={data.auto_grade}
      allowedExtensions={data.allowed_extensions}
      maxFileSize={data.max_file_size}
      submission={data.submission || null}
      attemptsUsed={data.attempts_used || 0}
    />
  );
}
