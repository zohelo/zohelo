import { useEffect, useState } from 'react';
import { useLoaderData } from 'react-router';
import { MapChoropleth } from '../components/MapChoropleth.client';
import { localeOf, useLocale } from '../i18n';
import { publishedDir, readCatalog, readGeo, readKpiLatest } from '../published';
import { regionalKpis } from '../regions/kpiOptions';
import { RankingTable } from '../regions/RankingTable';
import { rankRegions } from '../regions/ranking';
import { pageMeta } from '../seo';
import { pages } from '../site.config';

const page = pages.find((p) => p.path === '/regions')!;

// Build time only (ssr: false): the voivodeship geometry and a ranking for every published KPI with
// voivodeship data; KPIs without a voivodeship row are left out.
export async function loader({ request }: { request: Request }) {
  const locale = localeOf(new URL(request.url).pathname);
  const dir = publishedDir();
  const options = regionalKpis(readCatalog(dir), locale);
  const kpis = options.flatMap((option) => {
    const ranking = rankRegions(readKpiLatest(dir, option.kpi_key));
    return ranking ? [{ ...option, ranking }] : [];
  });
  return { geo: readGeo(dir, 'voivodeship'), kpis };
}

export function meta({ location }: { location: { pathname: string } }) {
  const locale = localeOf(location.pathname);
  return pageMeta({ path: page.path, locale, title: page.title[locale], description: page.description[locale] });
}

const texts = {
  pl: { select: 'Wskaźnik', none: 'Brak danych regionalnych.' },
  en: { select: 'Indicator', none: 'No regional data.' },
};

export default function Regions() {
  const { geo, kpis } = useLoaderData<typeof loader>();
  const locale = useLocale();
  const t = texts[locale];
  const [selected, setSelected] = useState(
    () => (kpis.find((k) => k.kpi_key === 'unemployment_rate') ?? kpis[0])?.kpi_key,
  );
  // The map renders only after hydration (D25): vega stays out of the pre-render.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const kpi = kpis.find((k) => k.kpi_key === selected);

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 text-text">
      <h1 className="font-display text-[length:var(--z-size-display)] font-semibold">{page.title[locale]}</h1>
      {kpi ? (
        <>
          <label className="mt-6 block font-ui text-text-muted" htmlFor="regions-kpi">
            {t.select}
          </label>
          <select
            id="regions-kpi"
            className="mt-1 rounded-md border border-border bg-surface px-3 py-2 font-ui text-text focus-visible:outline-2 focus-visible:outline-focus"
            value={kpi.kpi_key}
            onChange={(e) => setSelected(e.target.value)}
          >
            {kpis.map((k) => (
              <option key={k.kpi_key} value={k.kpi_key}>
                {k.name}
              </option>
            ))}
          </select>
          <div className="mt-6 min-h-[300px]">
            {mounted ? (
              <MapChoropleth geo={geo} rows={kpi.ranking.regions} valueTitle={kpi.unit} locale={locale} label={kpi.name} />
            ) : null}
          </div>
          <div className="mt-6">
            <RankingTable ranking={kpi.ranking} geo={geo} unit={kpi.unit} locale={locale} />
          </div>
        </>
      ) : (
        <p className="mt-6 text-text-muted">{t.none}</p>
      )}
    </main>
  );
}
