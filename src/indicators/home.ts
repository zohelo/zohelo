import type { Locale } from '../i18n';
import { NO_LATEST, type Catalog, type KpiLatest } from '../published';
import type { TodayTile } from './TodayStrip';
import { latestTile } from './tile';

// The home page's today strip: a fixed list of headline KPIs, in this order. Pure apart from `read`,
// which the caller passes (readKpiLatest over the build's published directory).

export const HOME_KPIS = ['inflation', 'unemployment_rate', 'gdp_current_prices', 'population'] as const;

/** One tile per HOME_KPIS key that is published and has a latest.json (not in NO_LATEST). */
export function homeTiles(catalog: Catalog, read: (kpiKey: string) => KpiLatest, locale: Locale): TodayTile[] {
  return HOME_KPIS.flatMap((key) => {
    const kpi = catalog.kpis.find((k) => k.kpi_key === key && k.status === 'published');
    if (!kpi || NO_LATEST.includes(key)) return [];
    const { label, value, unit, delta, period, provisional } = latestTile(kpi, read(key), catalog.units, locale);
    return [{ kpi_key: key, label, value, unit, delta, period, provisional }];
  });
}
