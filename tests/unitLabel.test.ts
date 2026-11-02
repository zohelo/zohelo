import { describe, expect, test } from 'bun:test';
import { unitLabel } from '../src/indicators/unitLabel';
import { readCatalog } from '../src/published';

const units = readCatalog('fixtures/published').units;

describe('unitLabel', () => {
  test('catalogue symbol in Polish', () => {
    expect(unitLabel(units, 'persons', 'pl')).toBe('os.');
    expect(unitLabel(units, 'pct', 'pl')).toBe('%');
  });

  test('English replaces Polish symbols', () => {
    expect(unitLabel(units, 'persons', 'en')).toBe('persons');
    expect(unitLabel(units, 'pln_per_unit', 'en')).toBe('PLN');
    expect(unitLabel(units, 'pct', 'en')).toBe('%');
  });

  test('a unit missing from the catalogue is never shown as its key', () => {
    expect(unitLabel(units, 'mln_eur', 'pl')).toBe('mln EUR');
    expect(unitLabel(units, 'mln_eur', 'en')).toBe('mln EUR');
    expect(unitLabel(units, 'usd', 'en')).toBe('USD');
  });
});
