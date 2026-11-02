import { expect, test } from 'bun:test';
import { formatCompact, formatDelta, formatNumber } from './format';

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

test('formatCompact uses long scale words in English', () => {
  expect(formatCompact(37490000, 'persons', 'en')).toEqual({ text: '37.5 million', unit: 'persons' });
  expect(formatCompact(845000, 'million EUR', 'en')).toEqual({ text: '845 billion', unit: 'EUR' });
  expect(formatCompact(3940, 'bn PLN', 'en')).toEqual({ text: '3.9 trillion', unit: 'PLN' });
});

test('formatCompact leaves small levels, rates and null alone', () => {
  expect(formatCompact(12345, 'os.', 'pl')).toEqual({ text: '12 345', unit: 'os.' });
  expect(formatCompact(2.9, '%', 'en')).toEqual({ text: '2.9', unit: '%' });
  expect(formatCompact(null, '%', 'pl')).toEqual({ text: '–', unit: '%' });
});
