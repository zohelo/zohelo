import { KpiTile, SourceFooter } from '@zohelo/design';
import { useLoaderData } from 'react-router';
import { SubscribeCalendar } from '../components/SubscribeCalendar';
import { localeOf, useLocale } from '../i18n';
import { indicatorDescription } from '../indicators/description';
import { footerProps, kpiSources } from '../indicators/sources';
import { latestTile, type LatestTile } from '../indicators/tile';
import { unitLabel } from '../indicators/unitLabel';
import { NO_LATEST, publishedDir, readCatalog, readGeo, readKpiLatest } from '../published';
import { RankingTable } from '../regions/RankingTable';
import { rankRegions } from '../regions/ranking';
import { breadcrumbJsonLd, datasetJsonLd, pageMeta } from '../seo';
import { pages, site } from '../site.config';
import { CONTAINER } from '../components/container';

// One page per published KPI, built at build time only (ssr: false). KPIs in NO_LATEST have no
// latest.json by contract (D26): a tile without value, no regional table; any other missing
// latest.json fails the build.
export async function loader({ request, params }: { request: Request; params: { kpi?: string } }) {
  const locale = localeOf(new URL(request.url).pathname);
  const dir = publishedDir();
  const catalog = readCatalog(dir);
  const kpi = catalog.kpis.find((k) => k.kpi_key === params.kpi);
  if (!kpi) throw new Response('Not found', { status: 404 });
  const name = locale === 'pl' ? kpi.name_pl : kpi.name_en;
  const sources = footerProps(kpiSources(catalog, kpi.kpi_key, locale));
  const jsonLd = datasetJsonLd(kpi, catalog, locale);
  const breadcrumb = breadcrumbJsonLd(
    [
      { name: site.name, path: '/' },
      { name: pages.find((p) => p.path === '/indicators')!.title[locale], path: '/indicators' },
      { name, path: `/indicators/${kpi.kpi_key}` },
    ],
    locale,
  );

  if (NO_LATEST.includes(kpi.kpi_key)) {
    const unit = unitLabel(catalog.units, kpi.unit_key, locale);
    const tile: LatestTile = { label: name, value: null, unit, delta: null, period: '', sourceKey: null, checkedAt: null, provisional: false };
    const description = indicatorDescription(name, tile, sources.sources.map((s) => s.name), locale);
    return { tile, sources, ranking: null, geo: null, jsonLd, breadcrumb, name, lastPeriod: kpi.last_period, description };
  }

  const latest = readKpiLatest(dir, kpi.kpi_key);
  const ranking = rankRegions(latest);
  const tile = latestTile(kpi, latest, catalog.units, locale);
  return {
    tile,
    sources,
    ranking,
    geo: ranking ? readGeo(dir, 'voivodeship') : null,
    jsonLd,
    breadcrumb,
    name,
    lastPeriod: kpi.last_period,
    description: indicatorDescription(name, tile, sources.sources.map((s) => s.name), locale),
  };
}

export function meta({
  data,
  params,
  location,
}: {
  data?: { name: string; description: string };
  params: { kpi?: string };
  location: { pathname: string };
}) {
  const locale = localeOf(location.pathname);
  const name = data?.name ?? params.kpi ?? '';
  return pageMeta({ path: `/indicators/${params.kpi}`, locale, title: name, description: data?.description ?? `${name} — zohelo` });
}

export default function Indicator() {
  const { tile, sources, ranking, geo, jsonLd, breadcrumb, name, lastPeriod } = useLoaderData<typeof loader>();
  const locale = useLocale();
  return (
    <main className={`${CONTAINER} py-12 text-text`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <h1 className="font-display text-[length:var(--z-size-display)] font-semibold">{name}</h1>
      <div className="mt-6 max-w-sm">
        <KpiTile label={tile.label} value={tile.value} unit={tile.unit} delta={tile.delta ?? undefined} period={tile.period} locale={locale} />
      </div>
      {ranking && geo ? (
        <section className="mt-10">
          <h2 className="font-ui text-[length:var(--z-size-lg)] font-semibold">{locale === 'pl' ? 'Województwa' : 'Voivodeships'}</h2>
          <div className="mt-4">
            <RankingTable ranking={ranking} geo={geo} unit={tile.unit} locale={locale} />
          </div>
        </section>
      ) : null}
      <div className="mt-10">
        <SourceFooter {...sources} date={tile.checkedAt ?? (tile.period || lastPeriod)} locale={locale} />
      </div>
      <div className="mt-4">
        <SubscribeCalendar locale={locale} />
      </div>
    </main>
  );
}
