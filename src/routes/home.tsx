import App from '../App';
import { localeOf, useLocale } from '../i18n';
import { absoluteUrl, pageMeta } from '../seo';
import { pages, site } from '../site.config';

const page = pages.find((p) => p.path === '/')!;

export function meta({ location }: { location: { pathname: string } }) {
  const locale = localeOf(location.pathname);
  return pageMeta({ path: page.path, locale, title: page.title[locale], description: page.description[locale] });
}

export default function Home() {
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
      <App />
    </>
  );
}
