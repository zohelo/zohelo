// The citation shown with every /data download:
// 'zohelo (<year>), <KPI>, source <source dataset>, accessed <date>'. Pure.

export type CitationInput = {
  kpiName: string;
  sourceName: string;
  datasetCode?: string;
  /** ISO date or timestamp. */
  accessed: string;
};

export function citation(input: CitationInput, locale: 'pl' | 'en'): string {
  const year = input.accessed.slice(0, 4);
  const date = input.accessed.slice(0, 10);
  const source = input.datasetCode ? `${input.sourceName} (${input.datasetCode})` : input.sourceName;
  return locale === 'pl'
    ? `zohelo (${year}), ${input.kpiName}, źródło ${source}, dostęp ${date}`
    : `zohelo (${year}), ${input.kpiName}, source ${source}, accessed ${date}`;
}
