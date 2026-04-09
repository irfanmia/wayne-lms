'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem =
  | { href: string; label: string; icon: string; children?: undefined }
  | { href: string; label: string; icon: string; children: { href: string; label: string }[] };

const navItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: '🏠' },
  {
    href: '/admin/courses',
    label: 'Courses',
    icon: '📚',
    children: [
      { href: '/admin/courses', label: 'All Courses' },
      { href: '/admin/courses/categories', label: 'Categories' },
    ],
  },
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
  const [openMenus, setOpenMenus] = useState<string[]>(['/admin/courses']);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    if (href === '/admin/courses') return pathname === '/admin/courses';
    return pathname.startsWith(href);
  };

  const isParentActive = (item: NavItem) => {
    if (!item.children) return isActive(item.href);
    return item.children.some(c => pathname.startsWith(c.href));
  };

  const toggleMenu = (href: string) => {
    setOpenMenus(prev =>
      prev.includes(href) ? prev.filter(h => h !== href) : [...prev, href]
    );
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
          {navItems.map((item) => {
            const isOpen = openMenus.includes(item.href);
            const parentActive = isParentActive(item);

            if (item.children && !collapsed) {
              return (
                <div key={item.href}>
                  <button
                    onClick={() => toggleMenu(item.href)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      parentActive
                        ? 'border-l-4 border-orange-500 text-orange-500 bg-gray-800/50'
                        : 'hover:text-white hover:bg-gray-800/30'
                    }`}
                  >
                    <span className="text-lg shrink-0">{item.icon}</span>
                    <span className="flex-1 text-left">{item.label}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="ml-9 mt-0.5 space-y-0.5">
                      {item.children.map(child => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            isActive(child.href)
                              ? 'text-orange-400 bg-gray-800/60'
                              : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // Collapsed with children: just show icon linking to parent
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  parentActive
                    ? 'border-l-4 border-orange-500 text-orange-500 bg-gray-800/50'
                    : 'hover:text-white hover:bg-gray-800/30'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <span className="text-lg shrink-0">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
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
