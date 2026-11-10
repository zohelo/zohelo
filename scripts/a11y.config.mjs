// zohelo.com pages for the accessibility check (scripts/a11y.mjs, zohelo-data#2499): the pre-rendered
// build in build/client, every route in Polish and English, the 404 page and the mobile menu.
// No portfolio case study is pre-rendered yet: add `/portfolio/<slug>` and its EN page with the first one.
const routes = [
  '/',
  '/indicators',
  '/indicators/inflation',
  '/regions',
  '/regions/14',
  '/sources',
  '/changes',
  '/portfolio',
  '/design',
];

export default {
  root: 'build/client',
  spa: false,
  ready: 'main',
  failText: ['Something went wrong', 'Nie ma takiej strony', 'Page not found'],
  pages: [
    ...routes.map((path) => ({ path })),
    ...routes.map((path) => ({ path: path === '/' ? '/en' : `/en${path}` })),
    { path: '/a11y-missing-page', name: '404', status: 404, failText: ['Something went wrong'] },
    { path: '/en/a11y-missing-page', name: '/en 404', status: 404, failText: ['Something went wrong'] },
    { path: '/', name: '/ (menu open)', widths: [390], open: 'header button[aria-label]' },
    { path: '/en', name: '/en (menu open)', widths: [390], open: 'header button[aria-label]' },
  ],
};
