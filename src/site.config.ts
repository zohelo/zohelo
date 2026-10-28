// Site-wide names and the list of pre-rendered pages. Routes, pre-rendering and the sitemap read
// this file, so adding a page to `pages` is the only step needed to pre-render it (in Polish at
// its path and in English under /en).

export type Localized = { pl: string; en: string };
export type Page = { path: string; title: Localized; description: Localized };

const description: Localized = {
  pl: 'Dane publiczne o Polsce i świecie — wskaźniki, regiony i źródła, aktualizowane automatycznie.',
  en: 'Public data on Poland and the world — indicators, regions and sources, updated automatically.',
};

export const site = {
  name: 'zohelo',
  url: 'https://zohelo.com',
  description,
};

export const pages: Page[] = [
  {
    path: '/',
    title: { pl: 'Polska w danych', en: 'Poland in data' },
    description,
  },
  {
    path: '/portfolio',
    title: { pl: 'Portfolio', en: 'Portfolio' },
    description: {
      pl: 'Portfolio dashboardów na demonstracyjnych danych przedsiębiorstwa — w przygotowaniu.',
      en: 'A portfolio of dashboards on demo enterprise data — in preparation.',
    },
  },
  {
    path: '/design',
    title: { pl: 'System projektowy', en: 'Design system' },
    description: {
      pl: 'Tokeny i komponenty systemu projektowego zohelo: kolory, typografia, odstępy i komponenty.',
      en: 'Tokens and components of the zohelo design system: colours, typography, spacing and components.',
    },
  },
  {
    path: '/changes',
    title: { pl: 'Co się zmieniło', en: 'What changed' },
    description: {
      pl: 'Najnowsze aktualizacje zbiorów danych i wskaźników, które się zmieniły.',
      en: 'The latest dataset updates and the indicators they changed.',
    },
  },
  {
    path: '/indicators',
    title: { pl: 'Wskaźniki', en: 'Indicators' },
    description: {
      pl: 'Najważniejsze wskaźniki o Polsce z najnowszą wartością, źródłem i datą.',
      en: 'Headline indicators on Poland with the latest value, source and date.',
    },
  },
];

/** Every pre-rendered path: each page in Polish and in English. */
export function prerenderPaths(): string[] {
  return pages.flatMap((p) => [p.path, p.path === '/' ? '/en' : `/en${p.path}`]);
}

/**
 * The not-found page, pre-rendered once per language and moved to 404.html and en/404.html after the
 * build (scripts/not-found.ts). Cloudflare Pages serves the nearest 404.html with HTTP 404 for every
 * unknown URL; without it Pages treats the site as a single-page app and answers 200 with the home page.
 */
export const notFoundPaths = ['/404', '/en/404'];
