// Data, formatting and takeaway rules for the Editorial prototype.
// Everything is read from fixtures/published (synthetic values, see FIXTURE.txt). Where a chart needs history that the
// fixture does not have, the series is extended with clearly marked illustrative points (`illustrative: true`), which the
// charts draw dashed and the captions name. Takeaway titles use only the fixture's latest and previous values.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type Lang = 'pl' | 'en';
export type Point = { t: string; v: number; illustrative?: boolean; preliminary?: boolean };

const root = join(import.meta.dir, '../../../fixtures/published');
const read = (p: string) => JSON.parse(readFileSync(join(root, p), 'utf8'));

export const catalog = read('catalog/catalog.json');
export const changes = read('feed/changes.json');
export const latest: Record<string, any> = Object.fromEntries(
  ['inflation', 'unemployment_rate', 'population', 'gdp_current_prices'].map((k) => [k, read(`kpi/${k}/latest.json`)]),
);

export const kpi = (key: string) => catalog.kpis.find((k: any) => k.kpi_key === key);
export const source = (key: string) => catalog.sources.find((s: any) => s.source_key === key);
export const unit = (key: string) => catalog.units.find((u: any) => u.unit_key === key);
export const kpiName = (key: string, lang: Lang) => kpi(key)?.[`name_${lang}`] ?? key;
export const sourceName = (key: string, lang: Lang) => source(key)?.[`name_${lang}`] ?? key;

// Places: the fixture geojson names TERC:12 only; TERC:14 is Mazowieckie in TERYT.
export const places: Record<string, Record<Lang, string>> = {
  PL: { pl: 'Polska', en: 'Poland' },
  'TERC:12': { pl: 'Małopolskie', en: 'Lesser Poland' },
  'TERC:14': { pl: 'Mazowieckie', en: 'Masovian' },
};

// ---------- numbers (research §4 number rules 5, 7, 9) ----------

const NBSP = ' ';
const loc = (lang: Lang) => (lang === 'pl' ? 'pl-PL' : 'en-GB');

/** Full number, PL decimal comma and no-break-space grouping (rule 7). */
export function num(v: number, lang: Lang, decimals = 0): string {
  return new Intl.NumberFormat(loc(lang), {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: 'always' as any,
  })
    .format(v)
    .replace(/[  ]/g, NBSP); // Intl already writes the typographic minus (U+2212); keep it
}

/** Compact level for tiles only (rule 9): 36,6 mln / 36.6m; 845 mld € / €845bn. */
export function compact(v: number, lang: Lang, currency?: string): string {
  const opts: Intl.NumberFormatOptions = { notation: 'compact', maximumFractionDigits: 1 };
  if (currency) Object.assign(opts, { style: 'currency', currency, currencyDisplay: 'narrowSymbol' });
  return new Intl.NumberFormat(loc(lang), opts).format(v).replace(/[  ]/g, NBSP);
}

/** A rate with its unit: 2,9% / 2.9%. Rates are never compact (rule 9). */
export const pct = (v: number, lang: Lang) => `${num(v, lang, 1)}%`;

/** A change in percentage points (rule 2): −0,1 p.p. / −0.1 pp. */
export function pp(d: number, lang: Lang): string {
  const sign = d > 0 ? '+' : d < 0 ? '−' : '±';
  return `${sign}${num(Math.abs(d), lang, 1)}${NBSP}${lang === 'pl' ? 'p.p.' : 'pp'}`;
}

const monthsPl = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'];
const monthsPlIn = ['w styczniu', 'w lutym', 'w marcu', 'w kwietniu', 'w maju', 'w czerwcu', 'w lipcu', 'w sierpniu', 'we wrześniu', 'w październiku', 'w listopadzie', 'w grudniu'];
const monthsPlGen = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Reference period in words: "wrzesień 2026" / "September 2026" / "2025". */
export function period(p: string, lang: Lang, form: 'name' | 'in' = 'name'): string {
  const [y, m] = p.split('-');
  if (!m) return form === 'in' ? (lang === 'pl' ? `w ${y} r.` : `in ${y}`) : y;
  const i = Number(m) - 1;
  if (lang === 'en') return form === 'in' ? `in ${monthsEn[i]} ${y}` : `${monthsEn[i]} ${y}`;
  return form === 'in' ? `${monthsPlIn[i]} ${y}` : `${monthsPl[i]} ${y}`;
}

/** Readable date for provenance lines (principle 2): "1 sty 2026" / "1 Jan 2026". */
export function date(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(loc(lang), { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));
}

export function vs(p: string, lang: Lang): string {
  const [y, m] = p.split('-');
  if (!m) return lang === 'pl' ? `wobec ${y} r.` : `vs ${y}`;
  return lang === 'pl' ? `wobec ${monthsPlGen[Number(m) - 1]} ${y}` : `vs ${monthsEn[Number(m) - 1]} ${y}`;
}

// ---------- takeaway titles (number rule 3: generated, literally true, non-causal) ----------

type Subject = { pl: string; en: string; gender: 'f' | 'm' | 'n' };
const subjects: Record<string, Subject> = {
  inflation: { pl: 'Inflacja HICP', en: 'HICP inflation', gender: 'f' },
  unemployment_rate: { pl: 'Stopa bezrobocia (BAEL)', en: 'The unemployment rate (LFS)', gender: 'f' },
  population: { pl: 'Ludność Polski', en: "Poland's population", gender: 'f' },
};
const verbsPl = { f: ['wzrosła', 'spadła', 'nie zmieniła się'], m: ['wzrósł', 'spadł', 'nie zmienił się'], n: ['wzrosło', 'spadło', 'nie zmieniło się'] };

/** Thresholds: rates move at ≥ 0,1 p.p.; levels at ≥ 0,05% of the value. Below that the title says "unchanged". */
export function takeaway(key: string, lang: Lang, geo = 'PL'): string {
  const v = latest[key].values.find((x: any) => x.geography_key === geo);
  const s = subjects[key];
  const isRate = unit(latest[key].unit_key)?.is_rate;
  const d = v.value - v.previous_value;
  const moved = isRate ? Math.abs(Math.round(d * 10) / 10) >= 0.1 : Math.abs(d / v.previous_value) >= 0.0005;
  const dir = !moved ? 2 : d > 0 ? 0 : 1;
  const shown = isRate ? pct(v.value, lang) : compact(v.value, lang);
  if (lang === 'pl') {
    const verb = verbsPl[s.gender][dir];
    const to = dir === 2 ? `na poziomie ${shown}` : isRate ? `do ${shown}` : `do ${shown}`;
    const verbLevel = !isRate && dir === 1 ? 'zmalała' : verb;
    return `${s.pl} ${verbLevel} ${to} ${period(v.period, lang, 'in')}`;
  }
  const verb = ['rose', 'fell', 'was unchanged'][dir];
  const to = dir === 2 ? `at ${shown}` : `to ${shown}`;
  return `${s.en} ${verb} ${to} ${period(v.period, lang, 'in')}`;
}

// ---------- series for charts ----------

/** Monthly HICP y/y: fixture Aug and Sep 2026; Jan 2024 – Jul 2026 illustrative (deterministic, marked). */
export function inflationSeries(): Point[] {
  const v = latest.inflation.values.find((x: any) => x.source_key === 'eurostat');
  const out: Point[] = [];
  const shape = [3.7, 2.8, 2.0, 2.4, 2.5, 2.6, 4.2, 4.3, 4.9, 5.0, 4.7, 4.7, 4.9, 4.9, 4.9, 4.3, 4.0, 4.1, 3.1, 2.9, 2.9, 2.8, 2.9, 3.0, 3.1, 3.3, 3.2, 3.1, 3.0, 3.1, 3.1];
  for (let i = 0; i < shape.length; i++) {
    const d = new Date(Date.UTC(2024, i, 1));
    out.push({ t: d.toISOString().slice(0, 7), v: shape[i], illustrative: true });
  }
  out.push({ t: v.previous_period, v: v.previous_value });
  out.push({ t: v.period, v: v.value });
  return out;
}

/** Annual CPI (World Bank, a different definition from HICP — rule 6): fixture 2025, earlier illustrative. */
export function inflationWbSeries(): Point[] {
  const v = latest.inflation.values.find((x: any) => x.source_key === 'world_bank_wdi');
  return [
    { t: '2024-07', v: 3.7, illustrative: true },
    { t: v.period + '-07', v: v.value },
  ];
}

export function annualSeries(key: string, geo = 'PL', illustrative: number[] = [], firstYear = 0, div = 1): Point[] {
  const v = latest[key].values.find((x: any) => x.geography_key === geo);
  const pts: Point[] = illustrative.map((val, i) => ({ t: String(firstYear + i), v: val, illustrative: true }));
  pts.push({ t: v.previous_period, v: v.previous_value });
  pts.push({ t: v.period, v: v.value, preliminary: v.flags.includes('p') });
  return pts.map((p) => ({ ...p, v: p.v / div }));
}
