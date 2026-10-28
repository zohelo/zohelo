import { describe, expect, test } from 'bun:test';
import { pageMeta } from '../src/seo';
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
