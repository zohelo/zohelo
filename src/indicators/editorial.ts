import type { Locale } from '../i18n';

// What a KPI card says about its number (content standard 2 Nov, "KPI card anatomy"; zohelo#411): a short
// name, the measure, which direction is good and an optional benchmark. A stand-in keyed by kpi_key until
// the catalogue carries these fields (Product inbox proposal); KPIs not listed keep the catalogue name.

export type HigherIs = 'good' | 'bad' | 'neutral';

export type Benchmark = { label_pl: string; label_en: string; low: number; high: number };

export type Editorial = {
  short_pl: string;
  short_en: string;
  measure_pl: string;
  measure_en: string;
  higher_is: HigherIs;
  benchmark?: Benchmark;
};

export const EDITORIAL: Record<string, Editorial> = {
  inflation: {
    short_pl: 'Inflacja HICP',
    short_en: 'HICP inflation',
    measure_pl: '% r/r',
    measure_en: '% y/y',
    higher_is: 'bad',
    benchmark: { label_pl: 'Cel NBP 2,5 % ± 1 p.p.', label_en: 'NBP target 2.5% ± 1 pp', low: 1.5, high: 3.5 },
  },
  unemployment_rate: {
    short_pl: 'Stopa bezrobocia (BAEL)',
    short_en: 'Unemployment rate (LFS)',
    measure_pl: '% aktywnych zawodowo',
    measure_en: '% of labour force',
    higher_is: 'bad',
  },
  gdp_current_prices: {
    short_pl: 'PKB, ceny bieżące',
    short_en: 'GDP, current prices',
    measure_pl: 'mld EUR, nominalnie',
    measure_en: 'EUR bn, nominal',
    higher_is: 'good',
  },
  population: {
    short_pl: 'Ludność',
    short_en: 'Population',
    measure_pl: 'osoby',
    measure_en: 'persons',
    higher_is: 'neutral',
  },
};

/** The tile label: 'Inflacja HICP · % r/r'; the catalogue name when the KPI has no editorial entry. */
export function tileLabel(kpiKey: string, catalogName: string, locale: Locale): string {
  const e = EDITORIAL[kpiKey];
  if (!e) return catalogName;
  return locale === 'pl' ? `${e.short_pl} · ${e.measure_pl}` : `${e.short_en} · ${e.measure_en}`;
}

/** KpiTile's goodDirection from higher_is: bad → down is good, good → up is good, neutral → no colour. */
export function goodDirection(kpiKey: string): 'up' | 'down' | undefined {
  const h = EDITORIAL[kpiKey]?.higher_is;
  return h === 'good' ? 'up' : h === 'bad' ? 'down' : undefined;
}

const verdicts: Record<Locale, Record<'below' | 'within' | 'above', string>> = {
  pl: { below: 'poniżej celu', within: 'w celu', above: 'powyżej celu' },
  en: { below: 'below target', within: 'within target', above: 'above target' },
};

/** Where a value sits against the band [low, high], bounds inclusive. */
export function benchmarkVerdict(value: number, b: Benchmark): 'below' | 'within' | 'above' {
  return value < b.low ? 'below' : value > b.high ? 'above' : 'within';
}

/** 'Cel NBP 2,5 % ± 1 p.p.: w celu'; null without a benchmark or a value. */
export function benchmarkLine(kpiKey: string, value: number | null, locale: Locale): string | null {
  const b = EDITORIAL[kpiKey]?.benchmark;
  if (!b || value === null || !Number.isFinite(value)) return null;
  return `${locale === 'pl' ? b.label_pl : b.label_en}: ${verdicts[locale][benchmarkVerdict(value, b)]}`;
}

const MONTHS: Record<Locale, string[]> = {
  pl: ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
const ROMAN = ['I', 'II', 'III', 'IV'];

/**
 * A period in words: '2026-09' → 'wrzesień 2026' / 'September 2026', '2026-Q2' → 'II kw. 2026' / 'Q2 2026',
 * '2025' → '2025', '2026-09-15' → '15 września 2026' / '15 September 2026'. Any other form comes back as is.
 */
export function periodInWords(period: string, locale: Locale): string {
  let m = /^(\d{4})-(\d{2})$/.exec(period);
  if (m) {
    const name = MONTHS[locale][Number(m[2]) - 1];
    return name ? `${name} ${m[1]}` : period;
  }
  m = /^(\d{4})-Q([1-4])$/.exec(period);
  if (m) return locale === 'pl' ? `${ROMAN[Number(m[2]) - 1]} kw. ${m[1]}` : `Q${m[2]} ${m[1]}`;
  m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(period);
  if (m) {
    const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
    if (Number.isNaN(date.getTime())) return period;
    return new Intl.DateTimeFormat(locale === 'pl' ? 'pl-PL' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
  }
  return period;
}

/** The comparison under a change: 'vs sierpień 2026' / 'vs August 2026'; undefined without a previous period. */
export function comparisonLine(previousPeriod: string | null | undefined, locale: Locale): string | undefined {
  return previousPeriod ? `vs ${periodInWords(previousPeriod, locale)}` : undefined;
}
