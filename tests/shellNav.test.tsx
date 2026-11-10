import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { Footer } from '../src/components/Footer';
import { Header } from '../src/components/Header';

describe('shell navigation', () => {
  test('Header links to the four pages in English and marks the current one', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/en/regions']}>
        <Header />
      </MemoryRouter>,
    );
    expect(html).toContain('href="/en/indicators"');
    expect(html).toContain('href="/en/changes"');
    expect(html).toContain('href="/en/sources"');
    expect(html).toContain('POLAND IN DATA');
    expect(html).toMatch(/<a href="\/en\/regions" aria-current="page"/);
  });

  test('Header brand links to the home page of the current language (#385)', () => {
    const en = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/en/indicators/inflation']}>
        <Header />
      </MemoryRouter>,
    );
    expect(en).toMatch(/<a href="\/en" aria-label="[^"]+"/);
    const pl = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/indicators/inflation']}>
        <Header />
      </MemoryRouter>,
    );
    expect(pl).toMatch(/<a href="\/" aria-label="[^"]+"/);
    expect(pl).toMatch(/<a href="\/indicators" aria-current="page"/);
    expect(pl).not.toMatch(/<a href="\/regions" aria-current="page"/);
  });

  test('the logo link and the menu button show a focus ring for the keyboard (#452, WCAG 2.4.7)', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>,
    );
    const ring = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';
    expect(html).toMatch(new RegExp(`<a href="/" aria-label="[^"]*" class="[^"]*${ring}`));
    expect(html).toMatch(new RegExp(`<button[^>]*class="[^"]*${ring}`));
    // focus:outline-none would win over the ring in the cascade (outline-style: none).
    expect(html).not.toContain('focus:outline-none');
  });

  test('Footer links to the pages in Polish without the old credit', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/']}>
        <Footer />
      </MemoryRouter>,
    );
    expect(html).toContain('href="/sources"');
    expect(html).toContain('POLSKA W DANYCH');
    expect(html).not.toContain('Jarvis');
  });

  test('Footer names the catalogue sources after a link to /sources (#footer-sources)', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/']}>
        <Footer sources={['Eurostat', 'Narodowy Bank Polski']} />
      </MemoryRouter>,
    );
    expect(html).toContain('Eurostat, Narodowy Bank Polski');
    expect(html).toMatch(/<a href="\/sources" class="underline[^"]*">Źródła danych:<\/a>/);
    expect(html).not.toContain('RIO');
  });

  test('Footer bottom row meets AA contrast: slate-400 at 12 px, not slate-500 at 11 px (#433)', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/']}>
        <Footer sources={['Eurostat']} />
      </MemoryRouter>,
    );
    expect(html).toMatch(/<div class="pt-6 [^"]*text-xs text-slate-400[^"]*">/);
    expect(html).not.toContain('text-slate-500');
    expect(html).not.toContain('text-[11px]');
  });

  test('Language and footer links have a 24 px target (WCAG 2.5.8)', () => {
    const header = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/en']}>
        <Header />
      </MemoryRouter>,
    );
    // The toggle renders twice (desktop and mobile), two links each.
    expect(header.match(/hrefLang="(pl|en)"[^>]*min-h-6 min-w-6/g)?.length).toBe(4);
    const footer = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/']}>
        <Footer />
      </MemoryRouter>,
    );
    const footerLinks = footer.match(/<li><a /g)?.length ?? 0;
    expect(footerLinks).toBeGreaterThan(0);
    expect(footer.match(/min-h-6/g)?.length).toBe(footerLinks);
  });
});
