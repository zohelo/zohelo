import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { HomeChanges } from '../src/growth/HomeChanges';
import { readCatalog, type ChangeItem } from '../src/published';

const sources = readCatalog('fixtures/published').sources;

const items: ChangeItem[] = Array.from({ length: 12 }, (_, i) => ({
  at: `2026-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`,
  source_key: 'eurostat',
  dataset_key: 'une_rt_a',
  kpi_keys: ['unemployment_rate'],
  title_pl: `pozycja ${i}`,
  title_en: `item ${i}`,
  kind: 'data_update',
}));

describe('HomeChanges', () => {
  test('12 items show 10', () => {
    const html = renderToStaticMarkup(<HomeChanges items={items} sources={sources} locale="pl" />);
    expect(html.match(/<li/g)).toHaveLength(10);
  });

  test('Polish heading and link', () => {
    const html = renderToStaticMarkup(<HomeChanges items={items} sources={sources} locale="pl" />);
    expect(html).toContain('Co się zmieniło');
    expect(html).toContain('href="/changes"');
    expect(html).toContain('webcal://zohelo.com/calendar.ics');
    expect(html).toContain('Subskrybuj kalendarz publikacji');
  });

  test('English heading and link', () => {
    const html = renderToStaticMarkup(<HomeChanges items={items} sources={sources} locale="en" />);
    expect(html).toContain('What changed');
    expect(html).toContain('href="/en/changes"');
    expect(html).toContain('Subscribe to the release calendar');
  });

  test('no items show the empty text', () => {
    const html = renderToStaticMarkup(<HomeChanges items={[]} sources={sources} locale="en" />);
    expect(html).toContain('No changes in the last 30 days.');
  });
});
