import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Courses',
  description: 'Explore our comprehensive library of coding courses in AI, Web Development, DevOps, Python, and more. Learn at your own pace with hands-on exercises.',
  openGraph: {
    title: 'Browse Courses | Wayne LMS',
    description: 'Explore our comprehensive library of coding courses in AI, Web Development, DevOps, Python, and more.',
  },
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
