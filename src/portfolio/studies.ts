// Portfolio case studies: Markdown files <dir>/<slug>.<locale>.md with frontmatter, validated at
// build. Runs at build only (route loaders and react-router.config.ts), never in the browser.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { z } from 'zod';
import type { Locale } from '../i18n';

/** Where the case studies live (none yet: /portfolio then shows only the plan). */
export const STUDIES_DIR = 'content/portfolio';

const frontmatter = z.object({
  title: z.string(),
  summary: z.string(),
  dataset: z.string(),
  licence: z.string(),
  dashboard_url: z.url(),
  skills: z.array(z.string()).min(1),
});

export type Study = z.infer<typeof frontmatter> & { slug: string; locale: Locale; html: string };

/** The studies of one language, sorted by slug; a missing directory gives none. Invalid frontmatter throws naming the file. */
export function loadStudies(dir: string, locale: Locale): Study[] {
  if (!existsSync(dir)) return [];
  const suffix = `.${locale}.md`;
  return readdirSync(dir)
    .filter((name) => name.endsWith(suffix))
    .sort()
    .map((name) => {
      const path = join(dir, name);
      const { data, content } = matter(readFileSync(path, 'utf8'));
      const parsed = frontmatter.safeParse(data);
      if (!parsed.success) {
        const problems = parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ');
        throw new Error(`portfolio study invalid: ${path}: ${problems}`);
      }
      return {
        ...parsed.data,
        slug: name.slice(0, -suffix.length),
        locale,
        html: String(remark().use(html).processSync(content)),
      };
    });
}
