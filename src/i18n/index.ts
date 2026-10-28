import { useLocation } from 'react-router';
import { en } from './en';
import { pl, type Dict } from './pl';

export type Locale = 'pl' | 'en';
export type { Dict };

const dictionaries: Record<Locale, Dict> = { pl, en };

/** The locale of a pathname: English under /en, Polish everywhere else. */
export function localeOf(pathname: string): Locale {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'pl';
}

export function useLocale(): Locale {
  return localeOf(useLocation().pathname);
}

export function useT(): Dict {
  return dictionaries[useLocale()];
}

/** The same page in another language: '/x' ↔ '/en/x'. */
export function localizedPath(path: string, locale: Locale): string {
  const bare = localeOf(path) === 'en' ? path.slice(3) || '/' : path;
  if (locale === 'pl') return bare;
  return bare === '/' ? '/en' : `/en${bare}`;
}
