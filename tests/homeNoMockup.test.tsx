import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import App from '../src/App';
import { Footer } from '../src/components/Footer';

// zohelo#451: no mockup scaffolding on the released home page, and no English on the Polish one.
const MOCKUP = [
  'The Hero Section',
  'Client Acquisition',
  'Premium B2B consulting gateway',
  'Analytics Solutions &amp; Consulting',
  '10+ Years',
  'Milestone:',
];

const home = (locale: 'pl' | 'en') =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={[locale === 'pl' ? '/' : '/en']}>
      <App tiles={[]} items={[]} sources={[]} spotlight={null} spotlightMap={null} chartOfDay={null} locale={locale} />
    </MemoryRouter>,
  );

describe('home without mockup text (#451)', () => {
  test('no mockup labels in PL or EN', () => {
    for (const locale of ['pl', 'en'] as const) {
      const html = home(locale);
      for (const text of MOCKUP) expect(html).not.toContain(text);
      expect(html).not.toContain('id="consulting"');
    }
  });

  test('the EN footer heading is "Navigation", not the mockup "Navigation Hub"', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/en']}>
        <Footer />
      </MemoryRouter>,
    );
    expect(html).toContain('>Navigation<');
    expect(html).not.toContain('Navigation Hub');
  });
});
