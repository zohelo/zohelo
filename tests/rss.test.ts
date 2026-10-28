import { describe, expect, test } from 'bun:test';
import { renderRss, type FeedItem } from '../src/growth/rss';

// The two items of zohelo-data warehouse/published/fixtures/feed/changes.json.
const fixture: FeedItem[] = [
  {
    at: '2026-01-01T00:00:00Z',
    source_key: 'eurostat',
    dataset_key: 'une_rt_a',
    kpi_keys: ['unemployment_rate'],
    title_pl: 'Eurostat: zaktualizowano stopę bezrobocia (przykład)',
    title_en: 'Eurostat: unemployment rate updated (illustrative)',
  },
  {
    at: '2026-01-01T00:00:00Z',
    source_key: 'nbp',
    dataset_key: 'fx_a',
    kpi_keys: ['fx_rate'],
    title_pl: 'NBP: nowa tabela kursów A (przykład)',
    title_en: 'NBP: new table A of exchange rates (illustrative)',
  },
];
const built = '2026-01-02T00:00:00Z';
const links = (xml: string) => [...xml.matchAll(/<item>\n<title>[^\n]*\n<link>([^<]*)<\/link>/g)].map((m) => m[1]);

describe('renderRss', () => {
  test('pl links to the indicator and uses the Polish title', () => {
    const xml = renderRss(fixture, 'pl', built);
    expect(xml).toContain('<link>https://zohelo.com/indicators/unemployment_rate</link>');
    expect(xml).toContain('<title>Eurostat: zaktualizowano stopę bezrobocia (przykład)</title>');
    expect(xml).toContain('<title>zohelo — co się zmieniło</title>');
    expect(xml).toContain('<language>pl</language>');
    expect(xml).toContain('<guid isPermaLink="false">eurostat:une_rt_a:2026-01-01T00:00:00Z</guid>');
    expect(xml).toContain('<pubDate>Thu, 01 Jan 2026 00:00:00 GMT</pubDate>');
    expect(xml).toContain('<lastBuildDate>Fri, 02 Jan 2026 00:00:00 GMT</lastBuildDate>');
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"')).toBe(true);
    expect(xml.endsWith('</channel>\n</rss>')).toBe(true);
  });

  test('en links under https://zohelo.com/en/', () => {
    const xml = renderRss(fixture, 'en', built);
    expect(links(xml)).toEqual(['https://zohelo.com/en/indicators/unemployment_rate', 'https://zohelo.com/en/indicators/fx_rate']);
    expect(xml).toContain('<link>https://zohelo.com/en/changes</link>');
    expect(xml).toContain('<atom:link href="https://zohelo.com/en/rss.xml" rel="self" type="application/rss+xml"/>');
    expect(xml).toContain('<title>Eurostat: unemployment rate updated (illustrative)</title>');
  });

  test('text is escaped', () => {
    const xml = renderRss([{ ...fixture[0], title_pl: `A & B <C> "d" 'e'` }], 'pl', built);
    expect(xml).toContain('<title>A &amp; B &lt;C&gt; &quot;d&quot; &apos;e&apos;</title>');
  });

  test('newer items come first; equal times keep input order', () => {
    const older = { ...fixture[0], at: '2025-12-01T00:00:00Z', kpi_keys: ['old'] };
    expect(links(renderRss([older, ...fixture], 'pl', built))).toEqual([
      'https://zohelo.com/indicators/unemployment_rate',
      'https://zohelo.com/indicators/fx_rate',
      'https://zohelo.com/indicators/old',
    ]);
  });

  test('at most 50 items', () => {
    const many = Array.from({ length: 60 }, (_, i) => ({ ...fixture[0], dataset_key: `d${i}` }));
    expect(renderRss(many, 'pl', built).match(/<item>/g)).toHaveLength(50);
  });

  test('empty kpi_keys link to /changes', () => {
    expect(links(renderRss([{ ...fixture[1], kpi_keys: [] }], 'pl', built))).toEqual(['https://zohelo.com/changes']);
  });
});
