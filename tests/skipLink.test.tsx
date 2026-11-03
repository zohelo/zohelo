import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRoutesStub } from 'react-router';
import { Layout } from '../src/root';

// The skip link is the first focusable element of every page and lands on #content (#424).
function render(path: string, sample: boolean) {
  const Stub = createRoutesStub([
    {
      id: 'root',
      path: '/*',
      loader: () => ({ sample, sources: ['Eurostat'] }),
      Component: () => (
        <Layout>
          <main>
            <h1>Page</h1>
          </main>
        </Layout>
      ),
      HydrateFallback: () => null,
    },
  ]);
  return renderToStaticMarkup(<Stub initialEntries={[path]} hydrationData={{ loaderData: { root: { sample, sources: ['Eurostat'] } } }} />);
}

describe('skip-to-content link', () => {
  test.each([
    ['/', false, 'Przejdź do treści'],
    ['/', true, 'Przejdź do treści'],
    ['/en/indicators', false, 'Skip to content'],
    ['/en/indicators', true, 'Skip to content'],
  ])('%s (sample banner %p): the first <a> in <body> skips to #content', (path, sample, label) => {
    const html = render(path, sample);
    const body = html.slice(html.indexOf('<body'));
    const firstLink = /<a [^>]*>/.exec(body)?.[0] ?? '';
    expect(firstLink).toContain('href="#content"');
    expect(body).toContain(`>${label}</a>`);
    expect(body).toMatch(/<div id="content" tabindex="-1" class="[^"]*scroll-mt-20[^"]*">/);
    expect(body.includes('Sample data') || body.includes('Dane przykładowe')).toBe(sample);
  });
});
