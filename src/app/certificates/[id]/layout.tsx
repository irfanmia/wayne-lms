import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Certificate - ${id}`,
    description: `Verify this Wayne LMS course completion certificate.`,
    openGraph: {
      title: `Certificate of Completion | Wayne LMS`,
      description: `Verified certificate of course completion from Wayne LMS.`,
    },
  };
}

export default function CertificateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
