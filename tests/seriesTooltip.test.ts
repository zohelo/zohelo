import { describe, expect, test } from 'bun:test';
import { lineSpec } from '@zohelo/design/visuals';
import { seriesDecimals, type SeriesPoint } from '../src/indicators/series';

// The series chart tooltip shows the value in the series' capped precision (#414, #408 domain review):
// unrounded World Bank WDI values read 14,43 and 811 229 294 570, not 14,4290 and 811 229 294 570,3840.

const pt = (period: string, value: number): SeriesPoint => ({ date: `${period}-01-01`, period, value });

function tooltipFormat(points: SeriesPoint[], unit: string): string | undefined {
  const rows = points.map((p) => ({ date: p.date, value: p.value, series: 'Polska' }));
  const spec = lineSpec(rows, { x: 'date', y: 'value', series: 'series', yTitle: unit, yDecimals: seriesDecimals(points, unit), locale: 'pl' }) as {
    encoding: { tooltip: { field: string; format?: string }[] };
  };
  return spec.encoding.tooltip.find((t) => t.field === 'value')?.format;
}

describe('series tooltip precision with WDI-like values (#414)', () => {
  test('a rate keeps 2 decimals, a US$ level none, an exchange rate 4', () => {
    expect(tooltipFormat([pt('2022', 14.4290163), pt('2023', 3.6625)], '%')).toBe(',.2f');
    expect(tooltipFormat([pt('2022', 688176613255.1234), pt('2023', 811229294570.384)], 'USD')).toBe(',.0f');
    expect(tooltipFormat([pt('2026', 4.27), pt('2027', 4.2654)], 'zł')).toBe(',.4f');
    expect(tooltipFormat([pt('2025', 3.1), pt('2026', 3)], '%')).toBe(',.1f');
  });
});
