import { describe, expect, test } from 'bun:test';
import { citation, type CitationInput } from '../src/dataPages/citation';

const en: CitationInput = {
  kpiName: 'Unemployment rate (LFS)',
  sourceName: 'Eurostat',
  datasetCode: 'une_rt_a',
  accessed: '2026-10-28T09:00:00Z',
};

describe('citation', () => {
  test('English', () => {
    expect(citation(en, 'en')).toBe('zohelo (2026), Unemployment rate (LFS), source Eurostat (une_rt_a), accessed 2026-10-28');
  });

  test('Polish', () => {
    expect(citation({ ...en, kpiName: 'Stopa bezrobocia (BAEL)' }, 'pl')).toBe(
      'zohelo (2026), Stopa bezrobocia (BAEL), źródło Eurostat (une_rt_a), dostęp 2026-10-28',
    );
  });

  test('without a dataset code and with a plain date', () => {
    const input = { kpiName: 'Inflation', sourceName: 'Eurostat', accessed: '2026-10-28' };
    expect(citation(input, 'en')).toBe('zohelo (2026), Inflation, source Eurostat, accessed 2026-10-28');
    expect(citation(input, 'pl')).not.toContain('(une');
  });

  test('pure', () => {
    const before = JSON.stringify(en);
    citation(en, 'pl');
    expect(JSON.stringify(en)).toBe(before);
  });
});
