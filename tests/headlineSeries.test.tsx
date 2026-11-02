import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { SeriesTable } from '../src/indicators/SeriesTable';
import { headlineSeries, seriesDecimals, tablePoints, xTicks, type SeriesPoint } from '../src/indicators/series';
import { readKpiSeries, type SeriesRow } from '../src/published';

const dir = 'fixtures/published';

const row = (over: Partial<SeriesRow>): SeriesRow => ({
  kpi_key: 'k',
  source_key: 'eurostat',
  measure_key: 'm',
  geography_key: 'PL',
  geography_level: 'country',
  period: '2024',
  period_start: '2024-01-01',
  frequency: 'A',
  value: 1,
  unit_key: 'pct',
  flags: '',
  dims: {},
  ...over,
});

describe('headlineSeries (#389)', () => {
  test('the PL rows of the fixture, oldest first', async () => {
    const s = headlineSeries(await readKpiSeries(dir, 'unemployment_rate'), 'eurostat')!;
    expect(s.source_key).toBe('eurostat');
    expect(s.unit_key).toBe('pct_labour_force');
    expect(s.points.map((p) => p.period)).toEqual(['2023', '2024', '2025']);
    expect(s.points[0]).toEqual({ date: '2023-01-01', period: '2023', value: 2.8 });
  });

  test('keeps national totals of one source and its main measure, one point per period', () => {
    const rows = [
      row({ period: '2023', period_start: '2023-01-01', value: 1 }),
      row({ period: '2024', value: 2 }),
      row({ period: '2024', value: 2.5 }), // a later row of the same period wins
      row({ period: '2024', measure_key: 'other', value: 9 }),
      row({ period: '2024', geography_key: 'PL02', geography_level: 'voivodeship', value: 9 }),
      row({ period: '2024', dims: { sex: 'F' }, value: 9 }),
      row({ period: '2022', period_start: '2022-01-01', source_key: 'gus', value: 9 }),
    ];
    const s = headlineSeries(rows, 'eurostat')!;
    expect(s.measure_key).toBe('m');
    expect(s.points).toEqual([
      { date: '2023-01-01', period: '2023', value: 1 },
      { date: '2024-01-01', period: '2024', value: 2.5 },
    ]);
  });

  test('falls back to the source with the most PL rows; null without national rows', () => {
    const rows = [row({ source_key: 'gus' }), row({ source_key: 'gus', period: '2023', period_start: '2023-01-01' }), row({ source_key: 'eurostat' })];
    expect(headlineSeries(rows, 'missing')!.source_key).toBe('gus');
    expect(headlineSeries(rows, null)!.source_key).toBe('gus');
    expect(headlineSeries([row({ geography_key: 'DE' })], 'eurostat')).toBeNull();
    expect(headlineSeries([], 'eurostat')).toBeNull();
  });
});

describe('tablePoints and SeriesTable', () => {
  const points: SeriesPoint[] = Array.from({ length: 30 }, (_, i) => ({ date: `20${String(i).padStart(2, '0')}-01-01`, period: `20${String(i).padStart(2, '0')}`, value: i }));

  test('a long series shows its first and last 12 periods', () => {
    const { rows, truncated } = tablePoints(points);
    expect(truncated).toBe(true);
    expect(rows).toHaveLength(24);
    expect(rows[0].period).toBe('2000');
    expect(rows[11].period).toBe('2011');
    expect(rows[12].period).toBe('2018');
    expect(rows[23].period).toBe('2029');
    expect(tablePoints(points.slice(0, 5))).toEqual({ rows: points.slice(0, 5), truncated: false });
  });

  test('SeriesTable renders a table behind a toggle with locale figures', () => {
    const html = renderToStaticMarkup(
      <SeriesTable points={[{ date: '2024-01-01', period: '2024', value: 1234.5 }]} unit="%" caption="Test" locale="pl" />,
    );
    expect(html).toContain('<details');
    expect(html).toContain('Tabela danych');
    expect(html).toContain('<caption class="sr-only">Test</caption>');
    expect(html).toContain('Wartość (%)');
    expect(html).toContain('1 234,5');
    expect(html).not.toContain('Pierwsze i ostatnie');
  });

  test('SeriesTable keeps the series precision in every row (#405)', () => {
    const series: SeriesPoint[] = [
      { date: '2026-06-01', period: '2026-06', value: 3.1 },
      { date: '2026-07-01', period: '2026-07', value: 2.9 },
      { date: '2026-08-01', period: '2026-08', value: 3 },
    ];
    const pl = renderToStaticMarkup(<SeriesTable points={series} unit="%" caption="Test" locale="pl" />);
    expect(pl).toContain('>3,0<');
    expect(pl).toContain('>2,9<');
    expect(pl).not.toContain('>3<');
    const en = renderToStaticMarkup(<SeriesTable points={series} unit="%" caption="Test" locale="en" />);
    expect(en).toContain('>3.0<');
    const integers = renderToStaticMarkup(
      <SeriesTable points={[{ date: '2024-01-01', period: '2024', value: 37490000 }]} unit="os." caption="Test" locale="pl" />,
    );
    expect(integers).toContain('>37 490 000<');
  });
});

describe('axis helpers (design review of #397)', () => {
  const pt = (period: string, value: number): SeriesPoint => ({ date: `${period.slice(0, 4)}-${period.length > 4 ? period.slice(5, 7) : '01'}-01`, period, value });

  test('y precision follows the source', () => {
    expect(seriesDecimals([pt('2023', 2.8), pt('2024', 2.9), pt('2025', 3.2)])).toBe(1);
    expect(seriesDecimals([pt('2023', 750000), pt('2024', 845000)])).toBe(0);
    expect(seriesDecimals([pt('2023', 1.25), pt('2024', 1.3)])).toBe(2);
  });

  test('x ticks: one per year for an annual series, months for a monthly one, stepping to the label budget', () => {
    expect(xTicks('A', [pt('2023', 1), pt('2024', 1), pt('2025', 1)], 8)).toEqual({ interval: 'year', step: 1, format: '%Y' });
    expect(xTicks('M', [pt('2026-07', 1), pt('2026-08', 1), pt('2026-09', 1)], 4)).toEqual({ interval: 'month', step: 1, format: '%b %Y' });
    const years = Array.from({ length: 30 }, (_, i) => pt(String(1996 + i), 1));
    expect(xTicks('A', years, 4).step).toBe(8);
    expect(xTicks('A', years, 8).step).toBe(4);
    expect(xTicks('Q', [pt('2025', 1)], 8).interval).toBe('quarter');
  });
});
