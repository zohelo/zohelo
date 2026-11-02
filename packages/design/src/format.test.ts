import { expect, test } from 'bun:test';
import { formatChange, formatCompact, formatDate, formatDelta, formatNumber, isRateUnit } from './format';

test('formatNumber pl and en', () => {
  expect(formatNumber(12345.6, 'pl', { decimals: 1 })).toBe('12 345,6');
  expect(formatNumber(12345.6, 'en', { decimals: 1 })).toBe('12,345.6');
});

test('formatNumber negative numbers', () => {
  expect(formatNumber(-12345.6, 'pl', { decimals: 1 })).toBe('-12 345,6');
  expect(formatNumber(-12345.6, 'en', { decimals: 1 })).toBe('-12,345.6');
});

test('null gives a dash', () => {
  expect(formatNumber(null, 'pl')).toBe('–');
  expect(formatDelta(null, 'en')).toEqual({ text: '–', direction: 'flat' });
});

test('formatDelta direction and sign', () => {
  expect(formatDelta(1.5, 'pl', { decimals: 1 })).toEqual({ text: '+1,5', direction: 'up' });
  expect(formatDelta(-2, 'en', { decimals: 1 })).toEqual({ text: '-2.0', direction: 'down' });
  expect(formatDelta(0, 'en')).toEqual({ text: '0', direction: 'flat' });
});

test('formatCompact folds the scale word of the unit into the value (pl)', () => {
  expect(formatCompact(37490000, 'os.', 'pl')).toEqual({ text: '37,5 mln', unit: 'os.' });
  expect(formatCompact(845000, 'mln EUR', 'pl')).toEqual({ text: '845 mld', unit: 'EUR' });
  expect(formatCompact(3940, 'mld zł', 'pl')).toEqual({ text: '3,9 bln', unit: 'zł' });
  expect(formatCompact(-150000, 'os.', 'pl')).toEqual({ text: '-150 tys.', unit: 'os.' });
});

test('formatCompact uses the short English scale letters (zohelo#406)', () => {
  expect(formatCompact(37490000, 'persons', 'en')).toEqual({ text: '37.5m', unit: 'persons' });
  expect(formatCompact(845000, 'million EUR', 'en')).toEqual({ text: '845bn', unit: 'EUR' });
  expect(formatCompact(3940, 'bn PLN', 'en')).toEqual({ text: '3.9tn', unit: 'PLN' });
  expect(formatCompact(-150000, 'persons', 'en')).toEqual({ text: '-150k', unit: 'persons' });
});

test('formatCompact leaves small levels, rates and null alone', () => {
  expect(formatCompact(12345, 'os.', 'pl')).toEqual({ text: '12 345', unit: 'os.' });
  expect(formatCompact(2.9, '%', 'en')).toEqual({ text: '2.9', unit: '%' });
  expect(formatCompact(null, '%', 'pl')).toEqual({ text: '–', unit: '%' });
});

test('formatChange: percentage points for a rate, the unit for a level, typographic minus (zohelo#388)', () => {
  expect(formatChange(-0.1, '%', 'pl', { decimals: 1 })).toEqual({ text: '\u22120,1 p.p.', direction: 'down' });
  expect(formatChange(0.3, '%', 'en', { decimals: 1 })).toEqual({ text: '+0.3 pp', direction: 'up' });
  expect(formatChange(0, '%', 'pl')).toEqual({ text: '0 p.p.', direction: 'flat' });
  expect(formatChange(95000, 'mln EUR', 'pl')).toEqual({ text: '+95 mld EUR', direction: 'up' });
  expect(formatChange(-150000, 'os.', 'pl')).toEqual({ text: '\u2212150 tys. os.', direction: 'down' });
  expect(formatChange(12, 'os.', 'en')).toEqual({ text: '+12 persons'.replace('persons', 'os.'), direction: 'up' });
  expect(formatChange(null, '%', 'en')).toEqual({ text: '–', direction: 'flat' });
  expect(isRateUnit('p.p.')).toBe(true);
  expect(isRateUnit('mln EUR')).toBe(false);
});

test('formatDate per locale; periods pass through', () => {
  expect(formatDate('2026-01-01T00:00:00Z', 'pl')).toBe('1 sty 2026');
  expect(formatDate('2026-01-01', 'en')).toBe('1 Jan 2026');
  expect(formatDate('2026-10-28T06:00:00Z', 'en')).toBe('28 Oct 2026');
  expect(formatDate('2026-09', 'pl')).toBe('2026-09');
  expect(formatDate('2025', 'en')).toBe('2025');
  expect(formatDate('', 'en')).toBe('');
});
