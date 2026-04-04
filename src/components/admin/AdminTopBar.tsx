'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/courses': 'Course Management',
  '/admin/content': 'Content Library',
  '/admin/users': 'User Management',
  '/admin/analytics': 'Analytics',
  '/admin/coupons': 'Coupons',
  '/admin/bundles': 'Bundles',
  '/admin/certificates': 'Certificates',
  '/admin/payments': 'Payments & Revenue',
  '/admin/emails': 'Email Manager',
  '/admin/settings': 'Platform Settings',
};

export default function AdminTopBar() {
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const title = Object.entries(pageTitles).find(([k]) => pathname.startsWith(k) && (k === '/admin' ? pathname === '/admin' : true))?.[1] || 'Admin';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-xl font-semibold text-gray-900 font-heading">{title}</h1>

      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative text-gray-400 hover:text-gray-600 transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">3</span>
        </button>

        <div className="relative">
          <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">A</div>
            <span className="text-sm font-medium text-gray-700">Admin</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
              <Link href="/admin/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
              <Link href="/admin/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Settings</Link>
              <hr className="my-1" />
              <Link href="/login" className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Logout</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
