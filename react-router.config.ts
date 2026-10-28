import type { Config } from '@react-router/dev/config';
import { pages } from './src/site.config';

// Static site: no server rendering at request time; every page in site.config.ts is pre-rendered.
export default {
  appDirectory: 'src',
  ssr: false,
  prerender() {
    return pages.map((p) => p.path);
  },
} satisfies Config;
