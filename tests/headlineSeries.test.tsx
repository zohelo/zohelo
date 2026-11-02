import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { SeriesTable } from '../src/indicators/SeriesTable';
import { headlineSeries, tablePoints, type SeriesPoint } from '../src/indicators/series';
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
});
