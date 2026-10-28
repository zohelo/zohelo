import { useLoaderData } from 'react-router';
import { ChangesList } from '../growth/ChangesList';
import { localeOf, localizedPath, useLocale } from '../i18n';
import { publishedDir, readCatalog, readChanges } from '../published';
import { pageMeta } from '../seo';
import { pages } from '../site.config';

const page = pages.find((p) => p.path === '/changes')!;

// Runs at build only (ssr: false), so node:fs in published.ts stays out of the client bundle.
export async function loader() {
  const dir = publishedDir();
  const sources = readCatalog(dir).sources;
  try {
    return { items: readChanges(dir).items, sources };
  } catch (error) {
    // No feed yet is a normal state; any other problem (an invalid feed) fails the build.
    if (error instanceof Error && error.message.startsWith('published file missing')) return { items: [], sources };
    throw error;
  }
}

export function meta({ location }: { location: { pathname: string } }) {
  const locale = localeOf(location.pathname);
  return pageMeta({ path: page.path, locale, title: page.title[locale], description: page.description[locale] });
}

export default function Changes() {
  const { items, sources } = useLoaderData<typeof loader>();
  const locale = useLocale();
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-[length:var(--z-size-display)] font-semibold text-text">{page.title[locale]}</h1>
      <p className="mt-2 font-ui text-[length:var(--z-size-sm)]">
        <a href={localizedPath('/rss.xml', locale)} className="text-brand-teal underline">
          RSS
        </a>
      </p>
      <div className="mt-6">
        <ChangesList items={items} sources={sources} locale={locale} />
      </div>
    </main>
  );
}
