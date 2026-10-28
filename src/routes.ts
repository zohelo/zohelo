import { index, prefix, route, type RouteConfig } from '@react-router/dev/routes';

// Page routes are defined once and registered twice: Polish at /, English under /en (ids '-en').
const pages = (suffix: string) => [index('routes/home.tsx', { id: `home${suffix}` })];

export default [
  ...pages(''),
  ...prefix('en', pages('-en')),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
