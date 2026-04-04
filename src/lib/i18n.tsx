'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
import es from '@/locales/es.json';

type Locale = 'en' | 'ar' | 'es';

const translations: Record<Locale, Record<string, unknown>> = { en, ar, es };

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  setLocale: () => {},
  t: (key: string) => key,
});

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return path;
    }
  }
  if (typeof current === 'string') return current;
  if (Array.isArray(current)) return current as unknown as string;
  return path;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale | null;
    if (saved && translations[saved]) {
      setLocaleState(saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('locale', l);
    document.documentElement.lang = l;
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  };

  const t = (key: string): string => {
    return getNestedValue(translations[locale] as Record<string, unknown>, key);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

/**
 * Extract localized content from a multilingual field.
 * Accepts either a plain string or { en, ar, es } object.
 * Falls back to English, then returns the raw value.
 */
export function tContent(field: unknown, locale: string): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object' && field !== null) {
    const obj = field as Record<string, string>;
    return obj[locale] || obj['en'] || Object.values(obj)[0] || '';
  }
  return String(field);
}

/**
 * For arrays of multilingual strings.
 */
export function tContentArray(arr: unknown[], locale: string): string[] {
  if (!Array.isArray(arr)) return [];
  return arr.map(item => tContent(item, locale));
}
