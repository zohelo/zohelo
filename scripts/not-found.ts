// Moves the pre-rendered not-found pages (src/site.config.ts notFoundPaths) to build/client/404.html
// and build/client/en/404.html after the build. Cloudflare Pages answers every unknown URL with the
// nearest 404.html and HTTP 404, so English addresses get the English page.
import { existsSync, renameSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { notFoundPaths } from '../src/site.config';

const out = join(import.meta.dir, '..', 'build', 'client');

for (const path of notFoundPaths) {
  const rendered = join(out, path, 'index.html');
  if (!existsSync(rendered)) throw new Error(`not-found: ${rendered} missing; is ${path} pre-rendered?`);
  const target = join(out, dirname(path), '404.html');
  renameSync(rendered, target);
  rmSync(join(out, path), { recursive: true, force: true });
  console.log(`not-found: ${path} -> ${target.slice(out.length + 1)}`);
}
