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
    title: { pl: 'zohelo — Polska w danych', en: 'zohelo — Poland in data' },
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
];

/** Every pre-rendered path: each page in Polish and in English. */
export function prerenderPaths(): string[] {
  return pages.flatMap((p) => [p.path, p.path === '/' ? '/en' : `/en${p.path}`]);
}
