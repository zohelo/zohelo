import { expect, test } from 'bun:test';
import { formatDelta, formatNumber } from './format';

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
