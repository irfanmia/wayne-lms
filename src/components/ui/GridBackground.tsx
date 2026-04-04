'use client';
import { ReactNode } from 'react';

export default function GridBackground({ children, className = '', orange = false }: { children: ReactNode; className?: string; orange?: boolean }) {
  return (
    <div className={`relative ${className}`}>
      <div className={`absolute inset-0 pointer-events-none ${orange ? 'bg-grid-orange' : 'bg-grid'}`} />
      <div className="relative">{children}</div>
    </div>
  );
}
