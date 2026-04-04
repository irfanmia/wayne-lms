'use client';

export default function DecorativeArcs({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      <svg className="absolute -top-10 -right-20 w-80 h-80 opacity-20" viewBox="0 0 300 300" fill="none">
        <path d="M50 250 Q150 50 250 150" stroke="#F97316" strokeWidth="3" fill="none" />
        <path d="M30 200 Q180 30 270 180" stroke="#F97316" strokeWidth="2" fill="none" opacity="0.5" />
      </svg>
      <svg className="absolute -bottom-10 -left-20 w-64 h-64 opacity-15" viewBox="0 0 250 250" fill="none">
        <path d="M20 200 Q120 20 230 120" stroke="#F97316" strokeWidth="3" fill="none" />
      </svg>
      {/* Toggle pill decorative element */}
      <div className="absolute top-20 right-10 hidden lg:block opacity-20">
        <div className="w-14 h-7 bg-orange-400 rounded-full relative">
          <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full" />
        </div>
      </div>
    </div>
  );
}
