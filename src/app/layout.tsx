import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { LayoutShell } from "@/components/layout/LayoutShell";
import ClientProviders from "@/components/layout/ClientProviders";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://wayne-lms.example.com'),
  title: {
    default: 'Wayne LMS - Master Programming Through Practice',
    template: '%s | Wayne LMS'
  },
  description: 'Learn to code with hands-on exercises, earn certificates, and level up your programming skills. Free and paid courses in AI, Web Development, DevOps, and 50+ programming languages.',
  keywords: ['coding', 'programming', 'learn to code', 'online courses', 'coding exercises', 'python', 'javascript', 'web development', 'AI courses', 'certificates', 'wayne'],
  authors: [{ name: 'Wayne LMS', url: 'https://wayne-lms.example.com' }],
  creator: 'Wayne LMS',
  publisher: 'Wayne LMS',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://wayne-lms.example.com',
    siteName: 'Wayne LMS',
    title: 'Wayne LMS - Master Programming Through Practice',
    description: 'Learn to code with hands-on exercises, earn certificates, and level up your programming skills.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Wayne LMS LMS' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wayne LMS - Master Programming Through Practice',
    description: 'Learn to code with hands-on exercises and earn certificates.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large' as const, 'max-snippet': -1 },
  },
  alternates: {
    canonical: 'https://wayne-lms.example.com',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700;800&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased min-h-screen bg-white text-gray-900">
        <OrganizationJsonLd />
        <ClientProviders>
          <LayoutShell navbar={<Navbar />} footer={<Footer />}>
            {children}
          </LayoutShell>
        </ClientProviders>
      </body>
    </html>
  );
}
