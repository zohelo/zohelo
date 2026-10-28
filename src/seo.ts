import type { MetaDescriptor } from 'react-router';
import { localizedPath, type Locale } from './i18n';
import { site } from './site.config';

export type PageMetaInput = { path: string; locale: Locale; title: string; description: string };

const ogLocale: Record<Locale, string> = { pl: 'pl_PL', en: 'en_GB' };

/** The absolute address of a page in a language: https://zohelo.com + '/x' or '/en/x'. */
export function absoluteUrl(path: string, locale: Locale): string {
  return site.url + localizedPath(path, locale);
}

/**
 * Every head tag a page needs from its title and description: title, description, canonical,
 * hreflang alternates (pl, en, x-default → pl), Open Graph and the Twitter card.
 */
export function pageMeta({ path, locale, title, description }: PageMetaInput): MetaDescriptor[] {
  const url = absoluteUrl(path, locale);
  // React Router writes link descriptors' keys verbatim, so the attribute is spelled 'hreflang'.
  const fullTitle = `${title} · ${site.name}`;
  return [
    { title: fullTitle },
    { name: 'description', content: description },
    { tagName: 'link', rel: 'canonical', href: url },
    { tagName: 'link', rel: 'alternate', hreflang: 'pl', href: absoluteUrl(path, 'pl') },
    { tagName: 'link', rel: 'alternate', hreflang: 'en', href: absoluteUrl(path, 'en') },
    { tagName: 'link', rel: 'alternate', hreflang: 'x-default', href: absoluteUrl(path, 'pl') },
    { property: 'og:title', content: fullTitle },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:type', content: 'website' },
    { property: 'og:locale', content: ogLocale[locale] },
    { name: 'twitter:card', content: 'summary' },
  ];
}
