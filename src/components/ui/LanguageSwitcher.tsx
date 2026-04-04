'use client';
import { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';

const languages = [
  { code: 'en' as const, label: '🇺🇸 English', flag: '🇺🇸' },
  { code: 'ar' as const, label: '🇸🇦 العربية', flag: '🇸🇦' },
  { code: 'es' as const, label: '🇪🇸 Español', flag: '🇪🇸' },
];

interface Props {
  compact?: boolean;
}

export default function LanguageSwitcher({ compact }: Props) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = languages.find(l => l.code === locale) || languages[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={compact
          ? "flex items-center justify-center w-8 h-8 text-lg hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          : "flex items-center gap-1.5 text-xs text-white hover:text-orange-400 transition-colors cursor-pointer font-medium"
        }
      >
        {compact ? (
          current.flag
        ) : (
          <>
            {current.label}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </>
        )}
      </button>
      {open && (
        <div className="absolute top-full mt-2 right-0 rtl:right-auto rtl:left-0 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-[100] min-w-[160px]">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => { setLocale(lang.code); setOpen(false); }}
              className={`w-full text-left rtl:text-right px-3 py-2 text-sm hover:bg-orange-50 hover:text-orange-600 transition-colors cursor-pointer ${locale === lang.code ? 'text-orange-600 font-medium' : 'text-gray-700'}`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
