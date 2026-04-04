'use client';
import { LanguageProvider } from '@/lib/i18n';
import { AuthProvider } from '@/lib/auth';
import SessionProvider from '@/components/auth/SessionProvider';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <AuthProvider>{children}</AuthProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}
