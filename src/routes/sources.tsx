import { useLoaderData } from 'react-router';
import { localeOf, useLocale, type Locale } from '../i18n';
import { sourceRows } from '../dataPages/sources';
import { publishedDir, readCatalog } from '../published';
import { pageMeta } from '../seo';
import { pages } from '../site.config';

const page = pages.find((p) => p.path === '/sources')!;

const dict: Record<Locale, { source: string; register: string; licence: string; lastLoaded: string; indicators: string }> = {
  pl: { source: 'Źródło', register: 'Rejestr', licence: 'Licencja', lastLoaded: 'Ostatnie ładowanie', indicators: 'Wskaźniki' },
  en: { source: 'Source', register: 'Register', licence: 'Licence', lastLoaded: 'Last loaded', indicators: 'Indicators' },
};

// Build time only (ssr: false).
export async function loader({ request }: { request: Request }) {
  const locale = localeOf(new URL(request.url).pathname);
  return { rows: sourceRows(readCatalog(publishedDir()), locale) };
}

export function meta({ location }: { location: { pathname: string } }) {
  const locale = localeOf(location.pathname);
  return pageMeta({ path: page.path, locale, title: page.title[locale], description: page.description[locale] });
}

export default function Sources() {
  const { rows } = useLoaderData<typeof loader>();
  const locale = useLocale();
  const t = dict[locale];
  const th = 'px-3 py-2 text-left font-ui font-semibold text-text-muted';
  const td = 'px-3 py-2 align-top';
  return (
    <main className="mx-auto max-w-5xl px-4 py-16 text-text">
      <h1 className="font-display text-[length:var(--z-size-display)] font-semibold">{page.title[locale]}</h1>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full border-collapse text-[length:var(--z-size-sm)]">
          <thead className="border-b border-border">
            <tr>
              <th className={th}>{t.source}</th>
              <th className={th}>{t.register}</th>
              <th className={th}>{t.licence}</th>
              <th className={th}>{t.lastLoaded}</th>
              <th className={th}>{t.indicators}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.source_key} className="border-b border-border">
                <td className={td}>{row.name}</td>
                <td className={`${td} text-text-muted`}>{row.register_id}</td>
                <td className={td}>
                  {row.licence ? (
                    <a href={row.licence.url} className="text-brand-teal underline">
                      {row.licence.name}
                    </a>
                  ) : (
                    '–'
                  )}
                </td>
                <td className={`${td} z-figures`}>{row.last_loaded ? row.last_loaded.slice(0, 10) : '–'}</td>
                <td className={td}>{row.kpis.map((k) => k.name).join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
