import type { Locale } from '../i18n';
import { NO_LATEST, type Catalog, type KpiLatest } from '../published';
import { benchmarkLine, comparisonLine, goodDirection, periodInWords, tileLabel } from './editorial';
import type { TodayTile } from './TodayStrip';
import { latestTile } from './tile';

// The home page's today strip: a fixed list of headline KPIs, in this order. Pure apart from `read`,
// which the caller passes (readKpiLatest over the build's published directory).

export const HOME_KPIS = ['inflation', 'unemployment_rate', 'gdp_current_prices', 'population'] as const;

const provisionalNote: Record<Locale, string> = { pl: 'dane wstępne', en: 'preliminary' };

/**
 * One tile per HOME_KPIS key that is published and has a latest.json (not in NO_LATEST), in the card
 * anatomy of zohelo#411: short name · measure, value, period in words, change vs the named period with
 * the colour of its meaning, the benchmark verdict and the source name.
 */
export function homeTiles(catalog: Catalog, read: (kpiKey: string) => KpiLatest, locale: Locale): TodayTile[] {
  return HOME_KPIS.flatMap((key) => {
    const kpi = catalog.kpis.find((k) => k.kpi_key === key && k.status === 'published');
    if (!kpi || NO_LATEST.includes(key)) return [];
    return [cardTile(catalog, kpi, read(key), locale)];
  });
}

/** A KPI's national tile in the card anatomy (zohelo#411), for the home strip and /indicators. */
export function cardTile(catalog: Catalog, kpi: Catalog['kpis'][number], latest: KpiLatest, locale: Locale): TodayTile {
  const t = latestTile(kpi, latest, catalog.units, locale);
  const words = periodInWords(t.period, locale);
  const source = catalog.sources.find((s) => s.source_key === t.sourceKey);
  const notes = [
    benchmarkLine(kpi.kpi_key, t.value, locale),
    source ? (locale === 'pl' ? source.name_pl : source.name_en) : null,
  ].filter((n): n is string => n !== null);
  return {
    kpi_key: kpi.kpi_key,
    label: tileLabel(kpi.kpi_key, t.label, locale),
    value: t.value,
    unit: t.unit,
    delta: t.delta,
    period: t.provisional ? `${words}, ${provisionalNote[locale]}` : words,
    provisional: t.provisional,
    comparison: comparisonLine(t.previousPeriod, locale),
    goodDirection: goodDirection(kpi.kpi_key),
    notes,
  };
}
