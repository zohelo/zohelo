import { useLoaderData } from 'react-router';
import App from '../App';
import { localeOf, useLocale } from '../i18n';
import { homeTiles } from '../indicators/home';
import { publishedDir, readCatalog, readChanges, readKpiLatest } from '../published';
import { absoluteUrl, pageMeta } from '../seo';
import { pages, site } from '../site.config';

const page = pages.find((p) => p.path === '/')!;

// Build time only (ssr: false): the today strip's tiles and the change feed from the published layer.
export async function loader({ request }: { request: Request }) {
  const locale = localeOf(new URL(request.url).pathname);
  const dir = publishedDir();
  const catalog = readCatalog(dir);
  const tiles = homeTiles(catalog, (k) => readKpiLatest(dir, k), locale);
  return { tiles, items: readItems(dir), sources: catalog.sources };
}

// No feed yet is a normal state; any other problem (an invalid feed) fails the build, as on /changes.
function readItems(dir: string) {
  try {
    return readChanges(dir).items;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('published file missing')) return [];
    throw error;
  }
}

export function meta({ location }: { location: { pathname: string } }) {
  const locale = localeOf(location.pathname);
  return pageMeta({ path: page.path, locale, title: page.title[locale], description: page.description[locale] });
}

export default function Home() {
  const { tiles, items, sources } = useLoaderData<typeof loader>();
  const locale = useLocale();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: absoluteUrl('/', locale),
    inLanguage: locale,
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <App tiles={tiles} items={items} sources={sources} locale={locale} />
    </>
  );
}
