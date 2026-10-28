import { index, prefix, route, type RouteConfig } from '@react-router/dev/routes';
import { loadStudies, STUDIES_DIR } from './portfolio/studies';

// A route with a loader must have pre-rendered pages under ssr: false, so the case-study route is
// registered only for a language that has at least one study (none yet).
const studyRoute = (suffix: string) =>
  loadStudies(STUDIES_DIR, suffix ? 'en' : 'pl').length > 0
    ? [route('portfolio/:slug', 'routes/portfolio-study.tsx', { id: `portfolio-study${suffix}` })]
    : [];

// Page routes are defined once and registered twice: Polish at /, English under /en (ids '-en').
const pages = (suffix: string) => [
  index('routes/home.tsx', { id: `home${suffix}` }),
  route('portfolio', 'routes/portfolio.tsx', { id: `portfolio${suffix}` }),
  ...studyRoute(suffix),
  route('design', 'routes/design.tsx', { id: `design${suffix}` }),
  route('sources', 'routes/sources.tsx', { id: `sources${suffix}` }),
  route('changes', 'routes/changes.tsx', { id: `changes${suffix}` }),
  route('indicators', 'routes/indicators.tsx', { id: `indicators${suffix}` }),
];

export default [
  ...pages(''),
  ...prefix('en', pages('-en')),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
