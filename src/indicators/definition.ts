import type { Locale } from '../i18n';

// What an indicator page says about its measure (content standard 2 Nov; zohelo-data
// docs/domains/economy.md §3; zohelo#412): the definition paragraph, the dataset codes behind the
// drawn series, and an optional target band drawn behind the line. Keyed by kpi_key, a stand-in until
// the catalogue carries these fields.

export type TargetBand = { low: number; high: number; label_pl: string; label_en: string };

export type IndicatorNote = {
  definition_pl: string;
  definition_en: string;
  /** Dataset code per source_key, shown after the source name ('Eurostat (prc_hicp_manr)'). */
  datasets?: Record<string, string>;
  /** Drawn behind the line only when the chart shows the source it is defined for. */
  band?: TargetBand & { source_key: string };
};

export const INDICATOR_NOTES: Record<string, IndicatorNote> = {
  inflation: {
    definition_pl:
      'Zharmonizowany wskaźnik cen konsumpcyjnych (HICP, Eurostat): zmiana cen w porównaniu z tym samym miesiącem poprzedniego roku. HICP służy do porównań w UE i może różnić się o kilka dziesiątych punktu od wskaźnika CPI publikowanego przez GUS. Cel inflacyjny NBP: 2,5 % ± 1 p.p. (dla CPI).',
    definition_en:
      'Harmonised index of consumer prices (HICP, Eurostat): change in prices on the same month a year earlier. HICP is the EU-comparable measure and can differ by a few tenths of a point from the CPI published by Statistics Poland (GUS). NBP inflation target: 2.5% ± 1 pp (for CPI).',
    datasets: { eurostat: 'prc_hicp_manr' },
    band: { source_key: 'eurostat', low: 1.5, high: 3.5, label_pl: 'Cel NBP', label_en: 'NBP target' },
  },
};

/** The definition paragraph in the page language; null for a KPI without one. */
export function definitionOf(kpiKey: string, locale: Locale): string | null {
  const note = INDICATOR_NOTES[kpiKey];
  return note ? (locale === 'pl' ? note.definition_pl : note.definition_en) : null;
}

/** The band to draw for the series of `sourceKey`, with its label in the page language; null otherwise. */
export function bandOf(kpiKey: string, sourceKey: string | null | undefined, locale: Locale) {
  const band = INDICATOR_NOTES[kpiKey]?.band;
  if (!band || band.source_key !== sourceKey) return null;
  return { low: band.low, high: band.high, label: locale === 'pl' ? band.label_pl : band.label_en };
}

/** The dataset code of a KPI's source, when known ('prc_hicp_manr'). */
export function datasetOf(kpiKey: string, sourceKey: string): string | undefined {
  return INDICATOR_NOTES[kpiKey]?.datasets?.[sourceKey];
}
