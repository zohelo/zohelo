import { useLoaderData } from 'react-router';
import App from '../App';
import { localeOf, useLocale } from '../i18n';
import { homeTiles } from '../indicators/home';
import { publishedDir, readCatalog, readKpiLatest } from '../published';
import { absoluteUrl, pageMeta } from '../seo';
import { pages, site } from '../site.config';

const page = pages.find((p) => p.path === '/')!;

// Build time only (ssr: false): the today strip's tiles from the published layer.
export async function loader({ request }: { request: Request }) {
  const locale = localeOf(new URL(request.url).pathname);
  const dir = publishedDir();
  const catalog = readCatalog(dir);
  return { tiles: homeTiles(catalog, (k) => readKpiLatest(dir, k), locale) };
}

export function meta({ location }: { location: { pathname: string } }) {
  const locale = localeOf(location.pathname);
  return pageMeta({ path: page.path, locale, title: page.title[locale], description: page.description[locale] });
}

export default function Home() {
  const { tiles } = useLoaderData<typeof loader>();
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
      <App tiles={tiles} locale={locale} />
    </>
  );
}
