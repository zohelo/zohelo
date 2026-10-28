// Site-wide names and the list of pre-rendered pages. Routes, pre-rendering and the sitemap read
// this file, so adding a page to `pages` is the only step needed to pre-render it.

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
];
