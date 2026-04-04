'use client';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type SidebarProps = {
  trackSlug: string;
  trackName: string;
  trackIcon: string;
  activeSection?: string;
};

export default function Sidebar({ trackSlug, trackName, trackIcon, activeSection }: SidebarProps) {
  const links = [
    { label: 'Overview', href: `/tracks/${trackSlug}`, section: 'overview' },
    { label: 'Exercises', href: `/tracks/${trackSlug}#exercises`, section: 'exercises' },
    { label: 'Concepts', href: `/tracks/${trackSlug}#concepts`, section: 'concepts' },
  ];

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen pt-20 px-4">
      <div className="flex items-center gap-3 mb-6 px-2">
        <span className="text-2xl">{trackIcon}</span>
        <span className="text-gray-900 font-semibold">{trackName}</span>
      </div>
      <nav className="space-y-1">
        {links.map(link => (
          <Link
            key={link.section}
            href={link.href}
            className={cn(
              'block px-3 py-2 rounded-lg text-sm transition-colors',
              activeSection === link.section ? 'bg-orange-50 text-orange-700 font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
