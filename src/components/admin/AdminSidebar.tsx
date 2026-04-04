'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '🏠' },
  { href: '/admin/courses', label: 'Courses', icon: '📚' },
  { href: '/admin/exercises', label: 'Exercises', icon: '💻' },
  { href: '/admin/content', label: 'Content Library', icon: '📝' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📊' },
  { href: '/admin/coupons', label: 'Coupons', icon: '🎟️' },
  { href: '/admin/bundles', label: 'Bundles', icon: '📦' },
  { href: '/admin/live-classes', label: 'Live Classes', icon: '📡' },
  { href: '/admin/certificates', label: 'Certificates', icon: '🏆' },
  { href: '/admin/payments', label: 'Payments & Revenue', icon: '💰' },
  { href: '/admin/emails', label: 'Email Manager', icon: '📧' },
  { href: '/admin/settings', label: 'Platform Settings', icon: '⚙️' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen bg-gray-900 text-gray-300 flex flex-col transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-[260px]'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-800 shrink-0">
          {!collapsed && (
            <>
              <span className="text-xl font-bold text-white font-heading">Wayne LMS</span>
              <span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded font-semibold uppercase">Admin</span>
            </>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`text-gray-400 hover:text-white transition ${collapsed ? 'mx-auto' : 'ml-auto'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {collapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
              )}
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'border-l-4 border-orange-500 text-orange-500 bg-gray-800/50'
                  : 'hover:text-white hover:bg-gray-800/30'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <span className="text-lg shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User info */}
        <div className="border-t border-gray-800 p-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold shrink-0">A</div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">Admin User</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
