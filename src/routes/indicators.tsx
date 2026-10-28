import { KpiTile } from '@zohelo/design';
import { useLoaderData } from 'react-router';
import { localeOf, useLocale } from '../i18n';
import { indicatorGroups } from '../indicators/groups';
import { latestTile, type LatestTile } from '../indicators/tile';
import { NO_LATEST, publishedDir, readCatalog, readKpiLatest } from '../published';
import { pageMeta } from '../seo';
import { pages } from '../site.config';

const page = pages.find((p) => p.path === '/indicators')!;

// Build time only (ssr: false): every published KPI gets its tile from kpi/<kpi_key>/latest.json, so a
// missing file fails the build. KPIs in NO_LATEST have no latest.json by contract (D26): label, unit and
// link only.
export async function loader({ request }: { request: Request }) {
  const locale = localeOf(new URL(request.url).pathname);
  const dir = publishedDir();
  const catalog = readCatalog(dir);
  const groups = indicatorGroups(catalog, locale).map((group) => ({
    ...group,
    kpis: group.kpis.map((link) => {
      const kpi = catalog.kpis.find((k) => k.kpi_key === link.kpi_key)!;
      const tile: LatestTile = NO_LATEST.includes(kpi.kpi_key)
        ? { label: link.name, value: null, unit: link.unit, delta: null, period: '', sourceKey: null, checkedAt: null, provisional: false }
        : latestTile(kpi, readKpiLatest(dir, kpi.kpi_key), catalog.units, locale);
      return { ...link, tile };
    }),
  }));
  return { groups };
}

export function meta({ location }: { location: { pathname: string } }) {
  const locale = localeOf(location.pathname);
  return pageMeta({ path: page.path, locale, title: page.title[locale], description: page.description[locale] });
}

export default function Indicators() {
  const { groups } = useLoaderData<typeof loader>();
  const locale = useLocale();
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 text-text">
      <h1 className="font-display text-[length:var(--z-size-display)] font-semibold">{page.title[locale]}</h1>
      {groups.map((group) => (
        <section key={group.domain_key} className="mt-10">
          <h2 className="font-ui text-[length:var(--z-size-lg)] font-semibold">{group.name}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.kpis.map(({ kpi_key, href, tile }) => (
              <KpiTile
                key={kpi_key}
                label={tile.label}
                value={tile.value}
                unit={tile.unit}
                delta={tile.delta ?? undefined}
                period={tile.period}
                locale={locale}
                href={href}
              />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
