import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { ChangesList } from '../src/growth/ChangesList';
import { readCatalog, readChanges, type ChangeItem } from '../src/published';

const dir = 'fixtures/published';
const items = readChanges(dir).items;
const sources = readCatalog(dir).sources;

const item = (over: Partial<ChangeItem>): ChangeItem => ({
  at: '2026-01-02T00:00:00Z',
  source_key: 'eurostat',
  dataset_key: 'une_rt_a',
  kpi_keys: ['unemployment_rate'],
  title_pl: 'pozycja',
  title_en: 'item',
  kind: 'data_update',
  ...over,
});

describe('ChangesList', () => {
  test('Polish markup with titles, links and source lines', () => {
    const html = renderToStaticMarkup(<ChangesList items={items} sources={sources} locale="pl" />);
    expect(html).toContain('Eurostat: zaktualizowano stopę bezrobocia (przykład)');
    expect(html).toContain('href="/indicators/unemployment_rate"');
    expect(html).toContain('Narodowy Bank Polski · fx_a');
    expect(html).toContain('dateTime="2026-01-01T00:00:00Z"');
  });

  test('English links', () => {
    const html = renderToStaticMarkup(<ChangesList items={items} sources={sources} locale="en" />);
    expect(html).toContain('href="/en/indicators/fx_rate"');
  });

  test('limit', () => {
    const html = renderToStaticMarkup(<ChangesList items={items} sources={sources} locale="pl" limit={1} />);
    expect(html.split('<li').length - 1).toBe(1);
  });

  test('newest first without mutating the items', () => {
    const inline = [item({ at: '2026-01-02T00:00:00Z', title_pl: 'drugi' }), item({ at: '2026-01-03T00:00:00Z', title_pl: 'trzeci' })];
    const html = renderToStaticMarkup(<ChangesList items={inline} sources={sources} locale="pl" />);
    expect(html.indexOf('trzeci')).toBeLessThan(html.indexOf('drugi'));
    expect(inline[0].title_pl).toBe('drugi');
  });

  test('no link without KPI keys; unknown source shows its key', () => {
    const html = renderToStaticMarkup(
      <ChangesList items={[item({ kpi_keys: [], source_key: 'other' })]} sources={sources} locale="pl" />,
    );
    expect(html).not.toContain('<a');
    expect(html).toContain('other · une_rt_a');
  });

  test('empty list text', () => {
    const html = renderToStaticMarkup(<ChangesList items={[]} sources={sources} locale="pl" />);
    expect(html).toContain('Brak zmian w ostatnich 30 dniach.');
    expect(html).not.toContain('<ol');
  });
});
