import type { Config } from '@react-router/dev/config';
import { notFoundPaths, prerenderPaths } from './src/site.config';

// Static site: no server rendering at request time; every page in site.config.ts is pre-rendered,
// plus the not-found page that scripts/not-found.ts turns into 404.html.
export default {
  appDirectory: 'src',
  ssr: false,
  prerender() {
    return [...prerenderPaths(), ...notFoundPaths];
  },
} satisfies Config;
