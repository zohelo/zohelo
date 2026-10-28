import { KpiTile } from '@zohelo/design';
import { useLoaderData } from 'react-router';
import { localeOf, localizedPath, useLocale, type Locale } from '../i18n';
import { publishedDir, readCatalog, readGeo, readKpiLatest } from '../published';
import { regionalKpis } from '../regions/kpiOptions';
import { geographyKeyOf, regionName, regionProfile, VOIVODESHIP_TERYT } from '../regions/profile';
import { rankRegions, type RegionRanking } from '../regions/ranking';
import { pageMeta } from '../seo';

// One profile page per voivodeship, built at build time only (ssr: false): every regional KPI with
// the region's value, its rank among the voivodeships and the national value.
export async function loader({ params, request }: { params: { teryt?: string }; request: Request }) {
  const teryt = params.teryt ?? '';
  if (!(VOIVODESHIP_TERYT as readonly string[]).includes(teryt)) throw new Response('Not Found', { status: 404 });
  const locale = localeOf(new URL(request.url).pathname);
  const dir = publishedDir();
  const catalog = readCatalog(dir);
  const options = regionalKpis(catalog, locale);
  const rankings = options
    .map((o) => rankRegions(readKpiLatest(dir, o.kpi_key)))
    .filter((r): r is RegionRanking => r !== null);
  const rows = regionProfile(geographyKeyOf(teryt), rankings).map((row) => {
    const option = options.find((o) => o.kpi_key === row.kpi_key)!;
    return { ...row, name: option.name, unit: option.unit };
  });
  return { teryt, name: regionName(readGeo(dir, 'voivodeship'), teryt, locale), rows };
}

const texts = {
  pl: {
    description: (name: string) => `Województwo ${name}: wskaźniki na tle Polski i miejsce wśród 16 województw.`,
    all: 'Wszystkie regiony',
    none: 'Brak danych regionalnych.',
    rank: (rank: number, of: number) => `${rank}. miejsce z ${of}`,
    national: ' · Polska: ',
  },
  en: {
    description: (name: string) => `${name}: indicators compared with Poland and the rank among the 16 voivodeships.`,
    all: 'All regions',
    none: 'No regional data.',
    rank: (rank: number, of: number) => `rank ${rank} of ${of}`,
    national: ' · Poland: ',
  },
};

const numberLocale: Record<Locale, string> = { pl: 'pl-PL', en: 'en-GB' };

export function meta({ data, location }: { data?: { teryt: string; name: string }; location: { pathname: string } }) {
  const locale = localeOf(location.pathname);
  const name = data?.name ?? '';
  return pageMeta({
    path: `/regions/${data?.teryt ?? ''}`,
    locale,
    title: name,
    description: texts[locale].description(name),
  });
}

export default function Region() {
  const { name, rows } = useLoaderData<typeof loader>();
  const locale = useLocale();
  const t = texts[locale];
  const format = new Intl.NumberFormat(numberLocale[locale]);
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 text-text">
      <h1 className="font-display text-[length:var(--z-size-display)] font-semibold">{name}</h1>
      <a href={localizedPath('/regions', locale)} className="mt-2 inline-block font-ui text-brand-teal underline">
        {t.all}
      </a>
      {rows.length === 0 ? (
        <p className="mt-6 text-text-muted">{t.none}</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <div key={row.kpi_key}>
              <KpiTile
                label={row.name}
                value={row.value}
                unit={row.unit}
                period={row.period}
                locale={locale}
                href={localizedPath(`/indicators/${row.kpi_key}`, locale)}
              />
              <p className="mt-2 font-ui text-[length:var(--z-size-sm)] text-text-muted">
                {t.rank(row.rank, row.of)}
                {row.national !== null ? `${t.national}${format.format(row.national)} ${row.unit}` : null}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
