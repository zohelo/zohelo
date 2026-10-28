import { index, prefix, route, type RouteConfig } from '@react-router/dev/routes';

// Page routes are defined once and registered twice: Polish at /, English under /en (ids '-en').
const pages = (suffix: string) => [
  index('routes/home.tsx', { id: `home${suffix}` }),
  route('portfolio', 'routes/portfolio.tsx', { id: `portfolio${suffix}` }),
  route('design', 'routes/design.tsx', { id: `design${suffix}` }),
  route('indicators', 'routes/indicators.tsx', { id: `indicators${suffix}` }),
  route('regions', 'routes/regions.tsx', { id: `regions${suffix}` }),
];

export default [
  ...pages(''),
  ...prefix('en', pages('-en')),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
