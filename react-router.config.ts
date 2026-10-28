import type { Config } from '@react-router/dev/config';
import { loadStudies, STUDIES_DIR } from './src/portfolio/studies';
import { notFoundPaths, prerenderPaths } from './src/site.config';

// Static site: no server rendering at request time; every page in site.config.ts is pre-rendered,
// plus one page per portfolio case study and language, and the not-found page that
// scripts/not-found.ts turns into 404.html.
export default {
  appDirectory: 'src',
  ssr: false,
  prerender() {
    const studies = [
      ...loadStudies(STUDIES_DIR, 'pl').map((s) => `/portfolio/${s.slug}`),
      ...loadStudies(STUDIES_DIR, 'en').map((s) => `/en/portfolio/${s.slug}`),
    ];
    return [...prerenderPaths(), ...studies, ...notFoundPaths];
  },
} satisfies Config;
