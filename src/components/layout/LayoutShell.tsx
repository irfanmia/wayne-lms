'use client';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

/** Hides the main Navbar + Footer on /admin routes (admin has its own layout) */
export function LayoutShell({ navbar, footer, children }: { navbar: ReactNode; footer: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      {navbar}
      <main>{children}</main>
      {footer}
    </>
  );
}
