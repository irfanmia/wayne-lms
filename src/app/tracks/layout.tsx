import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Programming Language Tracks',
  description: 'Master 50+ programming languages with structured learning tracks. Practice coding exercises in Python, JavaScript, Java, TypeScript, Go, Rust, and more.',
  openGraph: {
    title: 'Programming Language Tracks | Wayne LMS',
    description: 'Master 50+ programming languages with structured learning tracks and coding exercises.',
  },
};

export default function TracksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
