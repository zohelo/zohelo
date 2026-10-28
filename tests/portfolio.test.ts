import { afterAll, describe, expect, test } from 'bun:test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadStudies } from '../src/portfolio/studies';

const temp = mkdtempSync(join(tmpdir(), 'portfolio-'));
afterAll(() => rmSync(temp, { recursive: true, force: true }));

describe('loadStudies', () => {
  test('the fixture loads with its HTML', () => {
    const studies = loadStudies('tests/fixtures/portfolio', 'pl');
    expect(studies).toHaveLength(1);
    expect(studies[0].slug).toBe('sample');
    expect(studies[0].skills).toEqual(['Power BI', 'DAX']);
    expect(studies[0].html).toContain('<h2>');
    expect(loadStudies('tests/fixtures/portfolio', 'en')).toEqual([]);
  });

  test('a study without dashboard_url throws naming the file', () => {
    writeFileSync(
      join(temp, 'broken.pl.md'),
      '---\ntitle: T\nsummary: S\ndataset: D\nlicence: L\nskills:\n  - SQL\n---\n\nBody\n',
    );
    expect(() => loadStudies(temp, 'pl')).toThrow(/broken\.pl\.md/);
    expect(() => loadStudies(temp, 'pl')).toThrow(/dashboard_url/);
  });

  test('a missing directory gives no studies', () => {
    expect(loadStudies(join(temp, 'missing'), 'pl')).toEqual([]);
  });
});
