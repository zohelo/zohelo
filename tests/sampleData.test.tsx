import { describe, expect, test } from 'bun:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { SampleDataBanner } from '../src/components/SampleDataBanner';
import { FIXTURE_MARKER, isFixtureLayer } from '../src/published';

describe('isFixtureLayer', () => {
  test('the fixture set carries the marker', () => {
    expect(isFixtureLayer('fixtures/published')).toBe(true);
    expect(FIXTURE_MARKER).toBe('FIXTURE.txt');
  });

  test('a layer without the marker is real', () => {
    const dir = mkdtempSync(join(tmpdir(), 'layer-'));
    try {
      expect(isFixtureLayer(dir)).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('SampleDataBanner', () => {
  test('pl says the values are synthetic', () => {
    const html = renderToStaticMarkup(<SampleDataBanner locale="pl" />);
    expect(html).toContain('Dane przykładowe');
    expect(html).toContain('role="note"');
  });

  test('en says the values are synthetic', () => {
    expect(renderToStaticMarkup(<SampleDataBanner locale="en" />)).toContain('Sample data');
  });
});
