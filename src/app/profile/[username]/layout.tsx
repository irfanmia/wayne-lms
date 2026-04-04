import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username}'s Profile`,
    description: `View ${username}'s coding profile, achievements, and progress on Wayne LMS.`,
    robots: { index: false, follow: false },
  };
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
