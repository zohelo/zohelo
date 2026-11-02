import { describe, expect, test } from 'bun:test';
import { KpiTile } from '@zohelo/design';
import { renderToStaticMarkup } from 'react-dom/server';

describe('KpiTile layout (#357)', () => {
  test('the value does not break and the unit may wrap', () => {
    const html = renderToStaticMarkup(<KpiTile label="Population" value={36620000} unit="persons" period="2025" locale="en" />);
    expect(html).toContain('flex-wrap');
    expect(html).toContain('whitespace-nowrap');
    expect(html).toContain('>36.6 million<');
    expect(html).toContain('title="36,620,000 persons"');
  });

  test('long levels are compact at the same size as short ones; the exact value is the title (#387)', () => {
    const long = renderToStaticMarkup(<KpiTile label="Ludność" value={37490000} unit="os." period="2024" locale="pl" />);
    const short = renderToStaticMarkup(<KpiTile label="Inflacja" value={2.9} unit="%" period="2026-09" locale="pl" />);
    expect(long).toContain('>37,5 mln<');
    expect(long).toContain('title="37 490 000 os."');
    expect(long).not.toContain('--z-size-lg');
    expect(long).toContain('--z-size-2xl');
    expect(short).toContain('>2,9<');
    expect(short).toContain('--z-size-2xl');
    expect(short).not.toContain('title=');
  });

  test('a scale word in the unit folds into the compact value, in both languages', () => {
    const pl = renderToStaticMarkup(<KpiTile label="PKB" value={845000} unit="mln EUR" period="2024" locale="pl" />);
    const en = renderToStaticMarkup(<KpiTile label="GDP" value={845000} unit="million EUR" period="2024" locale="en" />);
    expect(pl).toContain('>845 mld<');
    expect(pl).toContain('>EUR<');
    expect(en).toContain('>845 billion<');
    expect(en).toContain('>EUR<');
  });

  test('compact={false} keeps the exact value (indicator page)', () => {
    const html = renderToStaticMarkup(<KpiTile label="Ludność" value={37490000} unit="os." period="2024" locale="pl" compact={false} />);
    expect(html).toContain('>37 490 000<');
  });
});

describe('KpiTile change text (#388)', () => {
  test('a rate change is in percentage points with the comparison named, in both languages', () => {
    const pl = renderToStaticMarkup(<KpiTile label="Inflacja" value={2.9} unit="%" delta={-0.1} decimals={1} period="2026-09" locale="pl" />);
    expect(pl).toContain('\u22120,1 p.p.');
    expect(pl).toContain('(spadek)');
    expect(pl).toMatch(/<span class="block [^"]*">vs poprzedni okres<\/span>/);
    expect(pl).not.toContain('-0,1 ');
    const en = renderToStaticMarkup(<KpiTile label="Unemployment" value={3.2} unit="%" delta={0.3} decimals={1} period="2025" locale="en" />);
    expect(en).toContain('+0.3 pp');
    expect(en).toContain('vs previous period');
  });

  test('a level change is in the unit, compact when large', () => {
    const pl = renderToStaticMarkup(<KpiTile label="PKB" value={845000} unit="mln EUR" delta={95000} period="2024" locale="pl" />);
    expect(pl).toContain('+95 mld EUR');
    const en = renderToStaticMarkup(<KpiTile label="Population" value={37490000} unit="persons" delta={-150000} period="2024" locale="en" comparison="vs 2023" />);
    expect(en).toContain('\u2212150 thousand persons');
    expect(en).toContain('vs 2023');
  });
});
