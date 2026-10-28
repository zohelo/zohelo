import type { Config } from '@react-router/dev/config';

// Static site: no server rendering at request time; pages are pre-rendered at build.
export default {
  appDirectory: 'src',
  ssr: false,
  prerender: ['/'],
} satisfies Config;
