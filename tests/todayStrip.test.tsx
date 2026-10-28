import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { TodayStrip, type TodayTile } from '../src/indicators/TodayStrip';

const tile: TodayTile = {
  kpi_key: 'unemployment_rate',
  label: 'Stopa bezrobocia (BAEL)',
  value: 3.2,
  unit: '%',
  delta: 0.3,
  period: '2025',
  provisional: false,
};

const render = (tiles: TodayTile[], locale: 'pl' | 'en') => renderToStaticMarkup(<TodayStrip tiles={tiles} locale={locale} />);

describe('TodayStrip', () => {
  test('Polish strip', () => {
    const html = render([tile], 'pl');
    expect(html).toContain('Dziś w danych');
    expect(html).toContain('href="/indicators/unemployment_rate"');
    expect(html).toContain('3,2');
    expect(html).toContain('+0,3');
    expect(html).toContain('aria-labelledby="today-strip"');
  });

  test('English strip', () => {
    const html = render([tile], 'en');
    expect(html).toContain('Today in data');
    expect(html).toContain('href="/en/indicators/unemployment_rate"');
    expect(html).toContain('3.2');
  });

  test('provisional period', () => {
    expect(render([{ ...tile, provisional: true }], 'pl')).toContain('2025, dane wstępne');
    expect(render([{ ...tile, provisional: true }], 'en')).toContain('2025, provisional');
    expect(render([tile], 'en')).not.toContain('provisional');
  });

  test('the first six tiles in input order', () => {
    const tiles = Array.from({ length: 7 }, (_, i) => ({ ...tile, kpi_key: `k${i + 1}` }));
    const html = render(tiles, 'pl');
    const hrefs = html.match(/href="\/indicators\/k\d"/g) ?? [];
    expect(hrefs).toHaveLength(6);
    expect(hrefs).toEqual([1, 2, 3, 4, 5, 6].map((n) => `href="/indicators/k${n}"`));
  });

  test('no tiles render nothing', () => {
    expect(render([], 'pl')).toBe('');
  });
});
