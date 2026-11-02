import { describe, expect, test } from 'bun:test';
import { KpiTile } from '@zohelo/design';
import { renderToStaticMarkup } from 'react-dom/server';

describe('KpiTile layout (#357)', () => {
  test('the value does not break and the unit may wrap', () => {
    const html = renderToStaticMarkup(<KpiTile label="Population" value={36620000} unit="persons" period="2025" locale="en" />);
    expect(html).toContain('flex-wrap');
    expect(html).toContain('whitespace-nowrap');
    expect(html).toContain('36,620,000');
  });

  test('long values step down a size, short ones keep 2xl', () => {
    const long = renderToStaticMarkup(<KpiTile label="Population" value={36620000} unit="os." period="2025" locale="pl" />);
    const short = renderToStaticMarkup(<KpiTile label="Inflacja" value={2.9} unit="%" period="2026-09" locale="pl" />);
    expect(long).toContain('--z-size-lg');
    expect(short).toContain('--z-size-2xl');
  });
});
