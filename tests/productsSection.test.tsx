import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { ProductsSection, statusLabel } from '../src/components/ProductsSection';
import { productsList } from '../src/content/productsData';

const render = (path: string) =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <ProductsSection />
    </MemoryRouter>,
  );

describe('ProductsSection (#390)', () => {
  test('status → badge text in both languages', () => {
    expect(statusLabel.pl).toEqual({ concept: 'Koncepcja', building: 'W budowie', live: 'Dostępne' });
    expect(statusLabel.en).toEqual({ concept: 'Concept', building: 'In progress', live: 'Live' });
  });

  test('the live sub-products are the pages that exist, each with a page to link to', () => {
    const live = productsList.filter((p) => p.status === 'live');
    expect(live.map((p) => p.id).sort()).toEqual(['data', 'indicators', 'regions']);
    for (const p of live) expect(p.href).toBeString();
    expect(productsList.filter((p) => p.status === 'concept').map((p) => p.id).sort()).toEqual(['brief', 'portfolio']);
  });

  test('live cards are links to their page in the current language; concept cards are not links', () => {
    const pl = render('/');
    expect(pl).toContain('href="/indicators"');
    expect(pl).toContain('href="/regions"');
    expect(pl).toContain('href="/sources"');
    expect(pl).toContain('>Dostępne<');
    expect(pl).toContain('>Koncepcja<');
    expect(pl).toContain('Zobacz');
    expect(pl).not.toContain('>Live<');
    const en = render('/en');
    expect(en).toContain('href="/en/indicators"');
    expect(en).toContain('href="/en/sources"');
    expect(en).toContain('>Live<');
    expect(en).toContain('>Concept<');
    expect(en).toContain('>Indicators<');
    expect(en).not.toContain('Koncepcja');
    // No Rynki/Markets card while NBP's reuse terms are not established (#469)
    expect(en).not.toContain('Exchange rates and NBP rates');
    expect(pl).not.toContain('Rynki');
  });
});
