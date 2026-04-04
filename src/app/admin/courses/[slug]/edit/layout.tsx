'use client';
import CourseBuilderLayout from '@/components/course-builder/CourseBuilderLayout';
import { useParams } from 'next/navigation';

export default function EditLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const slug = params.slug as string;
  return <CourseBuilderLayout slug={slug}>{children}</CourseBuilderLayout>;
}
