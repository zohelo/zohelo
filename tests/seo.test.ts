import { describe, expect, test } from 'bun:test';
import { absoluteUrl, pageMeta } from '../src/seo';
import { pages, site } from '../src/site.config';

const home = pages.find((p) => p.path === '/')!;

function ogTitle(meta: ReturnType<typeof pageMeta>) {
  return meta.find((d) => 'property' in d && d.property === 'og:title');
}

describe('page titles', () => {
  test('no page title contains the brand', () => {
    for (const page of pages) {
      for (const locale of ['pl', 'en'] as const) {
        expect(page.title[locale].toLowerCase()).not.toContain(site.name);
      }
    }
  });

  test('home title in Polish', () => {
    const meta = pageMeta({ path: '/', locale: 'pl', title: home.title.pl, description: home.description.pl });
    expect(meta[0]).toEqual({ title: 'Polska w danych · zohelo' });
    expect(ogTitle(meta)).toMatchObject({ content: 'Polska w danych · zohelo' });
  });

  test('home title in English', () => {
    const meta = pageMeta({ path: '/', locale: 'en', title: home.title.en, description: home.description.en });
    expect(meta[0]).toEqual({ title: 'Poland in data · zohelo' });
    expect(ogTitle(meta)).toMatchObject({ content: 'Poland in data · zohelo' });
  });
});

describe('page URLs', () => {
  const href = (meta: ReturnType<typeof pageMeta>, rel: string, lang?: string) =>
    meta.find((d) => 'rel' in d && d.rel === rel && (lang === undefined || d.hreflang === lang)) as
      | { href: string }
      | undefined;

  test('every page URL ends with a slash, the form Pages serves without a redirect', () => {
    expect(absoluteUrl('/', 'pl')).toBe('https://zohelo.com/');
    expect(absoluteUrl('/', 'en')).toBe('https://zohelo.com/en/');
    expect(absoluteUrl('/portfolio', 'pl')).toBe('https://zohelo.com/portfolio/');
    expect(absoluteUrl('/portfolio', 'en')).toBe('https://zohelo.com/en/portfolio/');
    expect(absoluteUrl('/en/design', 'en')).toBe('https://zohelo.com/en/design/');
  });

  test('canonical and hreflang use the slash URL', () => {
    const meta = pageMeta({ path: '/design', locale: 'en', title: 'Design system', description: 'd' });
    expect(href(meta, 'canonical')?.href).toBe('https://zohelo.com/en/design/');
    expect(href(meta, 'alternate', 'pl')?.href).toBe('https://zohelo.com/design/');
    expect(href(meta, 'alternate', 'en')?.href).toBe('https://zohelo.com/en/design/');
    expect(href(meta, 'alternate', 'x-default')?.href).toBe('https://zohelo.com/design/');
  });
});
