import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing & Membership Plans',
  description: 'Choose the perfect plan to accelerate your coding journey. Free and premium membership options with certificates, mentorship, and more.',
  openGraph: {
    title: 'Pricing & Membership Plans | Wayne LMS',
    description: 'Choose the perfect plan to accelerate your coding journey.',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
