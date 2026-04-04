'use client';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import Button from '@/components/ui/Button';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();
  const { user, isAuthenticated, logout, loading, isDemoMode } = useAuth();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      {/* Top bar */}
      <div className="bg-gray-900 text-gray-300 text-xs hidden md:block relative z-[60]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-8 overflow-visible">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-white transition-colors">{t('nav.home')}</Link>
            <Link href="#" className="hover:text-white transition-colors">{t('nav.collaborate')}</Link>
            <Link href="#" className="hover:text-white transition-colors">{t('nav.sponsorship')}</Link>
            <Link href="#" className="hover:text-white transition-colors">{t('nav.events')}</Link>
            <Link href="#" className="hover:text-white transition-colors">{t('nav.contactUs')}</Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <a href="#" className="hover:text-white transition-colors">𝕏</a>
              <a href="#" className="hover:text-white transition-colors">in</a>
              <a href="#" className="hover:text-white transition-colors">▶</a>
              <a href="#" className="hover:text-white transition-colors">📷</a>
            </div>
            <div className="border-l border-gray-700 pl-4 relative">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">M</div>
                <span className="text-gray-900 font-bold text-lg font-heading">Wayne LMS</span>
              </Link>
              <div className="hidden md:flex items-center gap-5">
                <Link href="/courses" className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium nav-link-hover">{t('nav.courses')}</Link>
                <Link href="/tracks" className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium nav-link-hover">{t('nav.codingTracks')}</Link>
                <Link href="/pricing" className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium nav-link-hover">{t('nav.pricing')}</Link>
                <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium nav-link-hover">{t('nav.dashboard')}</Link>
                <Link href="#" className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium nav-link-hover">{t('nav.becomeInstructor')}</Link>
                <Link href="#" className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium nav-link-hover">{t('nav.forEnterprise')}</Link>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              {!loading && isAuthenticated && user ? (
                <div className="relative" ref={profileRef}>
                  <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 cursor-pointer">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {user.username[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">{user.username}</span>
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                      {isDemoMode && <div className="px-4 py-1.5 text-xs text-amber-600 bg-amber-50">🎮 Demo Mode</div>}
                      <Link href={`/profile/${user.username}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setProfileOpen(false)}>Profile</Link>
                      <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setProfileOpen(false)}>Dashboard</Link>
                      <Link href="/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setProfileOpen(false)}>❤️ Wishlist</Link>
                      <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setProfileOpen(false)}>Account</Link>
                      <hr className="my-1 border-gray-100" />
                      <button onClick={() => { logout(); setProfileOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 cursor-pointer">Logout</button>
                    </div>
                  )}
                </div>
              ) : !loading ? (
                <>
                  <Link href="/login"><Button variant="ghost" size="sm">{t('nav.logIn')}</Button></Link>
                  <Link href="/signup"><Button size="sm">{t('nav.signUpFree')}</Button></Link>
                </>
              ) : null}
            </div>
            <div className="md:hidden flex items-center gap-1">
              <LanguageSwitcher compact />
              <button className="text-gray-500 p-1" onClick={() => setMobileOpen(!mobileOpen)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4 space-y-3">
            <Link href="/courses" className="block text-gray-600 hover:text-gray-900 py-2" onClick={() => setMobileOpen(false)}>{t('nav.courses')}</Link>
            <Link href="/tracks" className="block text-gray-600 hover:text-gray-900 py-2" onClick={() => setMobileOpen(false)}>{t('nav.codingTracks')}</Link>
            <Link href="/pricing" className="block text-gray-600 hover:text-gray-900 py-2" onClick={() => setMobileOpen(false)}>{t('nav.pricing')}</Link>
            <Link href="/dashboard" className="block text-gray-600 hover:text-gray-900 py-2" onClick={() => setMobileOpen(false)}>{t('nav.dashboard')}</Link>
            <Link href="#" className="block text-gray-600 hover:text-gray-900 py-2">{t('nav.becomeInstructor')}</Link>
            <Link href="#" className="block text-gray-600 hover:text-gray-900 py-2">{t('nav.forEnterprise')}</Link>
            <div className="flex gap-3 pt-3 border-t border-gray-200">
              {!loading && isAuthenticated && user ? (
                <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
              ) : (
                <>
                  <Link href="/login"><Button variant="ghost" size="sm">{t('nav.logIn')}</Button></Link>
                  <Link href="/signup"><Button size="sm">{t('nav.signUpFree')}</Button></Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
