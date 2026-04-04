'use client';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check if user is logged in (demo mode or session)
    const isDemo = typeof window !== 'undefined' && localStorage.getItem('demo_mode') === 'true';
    const isLoggedIn = typeof window !== 'undefined' && (
      localStorage.getItem('auth_token') ||
      localStorage.getItem('user') ||
      isDemo
    );

    if (!isLoggedIn) {
      // Redirect to login with return URL
      router.replace('/login?redirect=/admin');
      return;
    }

    // Check admin role (mock: demo users are admin)
    const userStr = typeof window !== 'undefined' && localStorage.getItem('user');
    let isAdmin = isDemo; // demo mode = admin access
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        isAdmin = user.role === 'admin' || user.is_staff || isDemo;
      } catch {
        isAdmin = isDemo;
      }
    }

    if (!isAdmin) {
      setChecking(false);
      setAuthorized(false);
      return;
    }

    setAuthorized(true);
    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-5xl mb-4">🔒</p>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-500 mb-6">You do not have admin privileges.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-5 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition cursor-pointer"
          >
            Go to Student Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
