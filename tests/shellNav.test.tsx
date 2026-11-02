import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { Footer } from '../src/components/Footer';
import { Header } from '../src/components/Header';

describe('shell navigation', () => {
  test('Header links to the four pages in English and marks the current one', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/en/regions']}>
        <Header activeSection="top" onNavigate={() => {}} />
      </MemoryRouter>,
    );
    expect(html).toContain('href="/en/indicators"');
    expect(html).toContain('href="/en/changes"');
    expect(html).toContain('href="/en/sources"');
    expect(html).toContain('POLAND IN DATA');
    expect(html).toMatch(/<a href="\/en\/regions" aria-current="page"/);
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
});
