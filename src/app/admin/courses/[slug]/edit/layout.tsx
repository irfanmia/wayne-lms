'use client';
import CourseBuilderLayout from '@/components/course-builder/CourseBuilderLayout';
import { useParams } from 'next/navigation';

export default function EditLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const slug = params.slug as string;
  // -m-6 escapes the admin layout's p-6, overflow-y-auto creates a new scroll
  // context so sticky top-0 works inside this pane
  return (
    <div className="-m-6 h-[calc(100vh-4rem)] overflow-y-auto flex flex-col">
      <CourseBuilderLayout slug={slug}>{children}</CourseBuilderLayout>
    </div>
  );
}
