import type { Config } from '@react-router/dev/config';
import { loadStudies, STUDIES_DIR } from './src/portfolio/studies';
import { publishedDir, readCatalog } from './src/published';
import { notFoundPaths, prerenderPaths, regionPaths } from './src/site.config';

// Static site: no server rendering at request time; every page in site.config.ts is pre-rendered,
// plus one page per portfolio case study, published KPI and voivodeship in each language, and the
// not-found page that scripts/not-found.ts turns into 404.html.
export default {
  appDirectory: 'src',
  ssr: false,
  prerender() {
    const studies = [
      ...loadStudies(STUDIES_DIR, 'pl').map((s) => `/portfolio/${s.slug}`),
      ...loadStudies(STUDIES_DIR, 'en').map((s) => `/en/portfolio/${s.slug}`),
    ];
    const kpis = readCatalog(publishedDir())
      .kpis.filter((k) => k.status === 'published')
      .flatMap((k) => [`/indicators/${k.kpi_key}`, `/en/indicators/${k.kpi_key}`]);
    return [...prerenderPaths(), ...studies, ...kpis, ...regionPaths(), ...notFoundPaths];
  },
} satisfies Config;
