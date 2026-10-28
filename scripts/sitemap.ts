// Writes build/client/sitemap.xml and robots.txt after the build: one <url> per page and language
// (the pre-rendered paths from src/site.config.ts, at their trailing-slash URL), each with its hreflang alternates.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { absoluteUrl } from '../src/seo';
import { pages, site } from '../src/site.config';

type Lang = 'pl' | 'en';
const out = join(import.meta.dir, '..', 'build', 'client');

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// The same URL as the pages' canonical and hreflang tags (src/seo.ts).
const url = (path: string, lang: Lang) => escape(absoluteUrl(path, lang));

const entries = pages.flatMap((page) =>
  (['pl', 'en'] as const).map((lang) =>
    [
      '  <url>',
      `    <loc>${url(page.path, lang)}</loc>`,
      `    <xhtml:link rel="alternate" hreflang="pl" href="${url(page.path, 'pl')}"/>`,
      `    <xhtml:link rel="alternate" hreflang="en" href="${url(page.path, 'en')}"/>`,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${url(page.path, 'pl')}"/>`,
      '  </url>',
    ].join('\n'),
  ),
);

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ...entries,
  '</urlset>',
  '',
].join('\n');

writeFileSync(join(out, 'sitemap.xml'), sitemap);
writeFileSync(join(out, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
console.log(`sitemap: ${entries.length} urls written to build/client/sitemap.xml; robots.txt written`);
