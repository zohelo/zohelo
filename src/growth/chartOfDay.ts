// The chart of the day: the national KPI with the newest release, from kpi/<kpi_key>/latest.json
// files (zohelo-data docs/published.md) — not the largest change (zohelo#410; content standard in
// zohelo-data docs/domains/economy.md, "Chart of the day" and "Freshness"). Pure function.
// A rate (unit '%', unit_key 'pct…') is described by its change in percentage points (zohelo#388), a
// level by the change from the previous value; a provisional row says so in its headline.
import { formatNumber, isRateUnit } from '@zohelo/design';

export type LatestFile = {
  kpi_key: string;
  values: {
    source_key: string;
    geography_key: string;
    period: string;
    value: number;
    previous_value?: number;
    unit_key?: string;
    flags: string[];
  }[];
};

/** Names per KPI; the unit symbols per language ('%', 'mln EUR') when the caller has them. */
export type KpiNames = Record<string, { name_pl: string; name_en: string; unit_pl?: string; unit_en?: string }>;

/** What says a KPI was just released: calendar events (`release_at`) and changes-feed items (`at`). */
export type ReleaseSignals = {
  /** feed/calendar.ics events, one per KPI release (parseCalendar). */
  calendar?: { kpi_key: string; at: string }[];
  /** feed/changes.json items. */
  changes?: { at: string; kpi_keys: string[] }[];
};

export type ChartOfDay = {
  kpi_key: string;
  source_key: string;
  period: string;
  headline_pl: string;
  headline_en: string;
  /** value − previous_value: percentage points for a rate, the unit for a level; null without a previous value. */
  change: number | null;
  /** A rate: the change is shown in p.p., never as a relative %. */
  rate: boolean;
  /** The row is provisional (flag 'p'); the headline says "dane wstępne" / "preliminary". */
  provisional: boolean;
};

/** Headline order for ties (content standard 2 Nov); unknown KPIs follow, by kpi_key. */
export const HEADLINE_ORDER = [
  'inflation',
  'gdp_volume_growth',
  'unemployment_rate',
  'registered_unemployment_rate',
  'average_gross_wage',
  'fx_rate',
  'gdp_current_prices',
  'population',
] as const;

/** Eligibility: the newest period may be at most this many months old (end of period to the build date). */
const MAX_AGE_MONTHS: Record<Frequency, number> = { D: 3, M: 3, Q: 6, A: 18 };
/** A release signal counts when it is at most this old and not in the future. */
const RECENT_DAYS = 7;
const FREQUENCY_RANK: Record<Frequency, number> = { D: 0, M: 1, Q: 2, A: 3 };

type Frequency = 'D' | 'M' | 'Q' | 'A';
type Row = LatestFile['values'][number];

const cmp = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
const utc = (y: number, m: number, d = 1) => new Date(Date.UTC(y, m, d));

/** The frequency and the first instant after the period, from the period's form; null for an unknown form. */
export function periodEnd(period: string): { frequency: Frequency; end: Date } | null {
  let m = /^(\d{4})$/.exec(period);
  if (m) return { frequency: 'A', end: utc(Number(m[1]) + 1, 0) };
  m = /^(\d{4})-Q([1-4])$/.exec(period);
  if (m) return { frequency: 'Q', end: utc(Number(m[1]), Number(m[2]) * 3) };
  m = /^(\d{4})-(\d{2})$/.exec(period);
  if (m) return { frequency: 'M', end: utc(Number(m[1]), Number(m[2])) };
  m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(period);
  if (m) return { frequency: 'D', end: utc(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + 1) };
  return null;
}

/** True when the period ended at most MAX_AGE_MONTHS of its frequency before `now`. */
function fresh(end: Date, frequency: Frequency, now: Date): boolean {
  const limit = new Date(end);
  limit.setUTCMonth(limit.getUTCMonth() + MAX_AGE_MONTHS[frequency]);
  return now.getTime() <= limit.getTime();
}

/** The latest national row (provisional included): latest period end, then higher frequency, then source_key. */
function latestNationalRow(file: LatestFile) {
  const rows = file.values
    .filter((v) => v.geography_key === 'PL' && Number.isFinite(v.value))
    .map((row) => ({ row, p: periodEnd(row.period) }))
    .filter((r): r is { row: Row; p: NonNullable<ReturnType<typeof periodEnd>> } => r.p !== null);
  rows.sort(
    (a, b) =>
      b.p.end.getTime() - a.p.end.getTime() ||
      FREQUENCY_RANK[a.p.frequency] - FREQUENCY_RANK[b.p.frequency] ||
      cmp(a.row.source_key, b.row.source_key),
  );
  return rows[0];
}

/** Short month names, as `timeLocale.shortMonths` of `@zohelo/design/visuals` (the chart axes and tooltips). */
export const SHORT_MONTHS = {
  pl: ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
} as const;
const ROMAN = ['I', 'II', 'III', 'IV'];
const NBSP = '\u00a0';

/**
 * The period in the axis form of its frequency, as the chart tooltip writes it (zohelo#407): '2025',
 * 'III kw. 2026' / 'Q3 2026', 'wrz 2026' / 'Sep 2026', '1 wrz 2026' / '1 Sep 2026'. Unknown forms as given.
 */
export function periodLabel(period: string, lang: 'pl' | 'en'): string {
  let m = /^(\d{4})-Q([1-4])$/.exec(period);
  if (m) return lang === 'pl' ? `${ROMAN[Number(m[2]) - 1]} kw. ${m[1]}` : `Q${m[2]} ${m[1]}`;
  m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(period);
  if (m && Number(m[2]) >= 1 && Number(m[2]) <= 12) {
    const month = `${SHORT_MONTHS[lang][Number(m[2]) - 1]} ${m[1]}`;
    return m[3] ? `${Number(m[3])} ${month}` : month;
  }
  return period;
}

/** '(wrz 2026, dane wstępne)' with no-break spaces, so the group never wraps inside (design review #450). */
function periodGroup(period: string, lang: 'pl' | 'en', provisional: boolean): string {
  const note = provisional ? (lang === 'pl' ? ', dane wstępne' : ', preliminary') : '';
  return `(${periodLabel(period, lang)}${note})`.replace(/ /g, NBSP);
}

function headlines(name: KpiNames[string], row: Row, rate: boolean) {
  const unitPl = name.unit_pl ? ` ${name.unit_pl}` : '';
  const unitEn = name.unit_en ? ` ${name.unit_en}` : '';
  const valPl = `${formatNumber(row.value, 'pl')}${unitPl}`;
  const valEn = `${formatNumber(row.value, 'en')}${unitEn}`;
  const provisional = row.flags.includes('p');
  const pPl = periodGroup(row.period, 'pl', provisional);
  const pEn = periodGroup(row.period, 'en', provisional);
  const prev = row.previous_value;
  if (prev === undefined || prev === null)
    return { headline_pl: `${name.name_pl}: ${valPl} ${pPl}`, headline_en: `${name.name_en}: ${valEn} ${pEn}` };
  const change = row.value - prev;
  if (change === 0)
    return {
      headline_pl: `${name.name_pl}: bez zmian, ${valPl} ${pPl}`,
      headline_en: `${name.name_en}: unchanged at ${valEn} ${pEn}`,
    };
  if (rate) {
    // A rate changes by points: 'wzrost o 0,3 p.p. do 3,2 %' (number rules, zohelo#388).
    const pp = Math.abs(change);
    const [ppPl, ppEn] = [formatNumber(pp, 'pl'), formatNumber(pp, 'en')];
    return change > 0
      ? {
          headline_pl: `${name.name_pl}: wzrost o ${ppPl} p.p. do ${valPl} ${pPl}`,
          headline_en: `${name.name_en}: up ${ppEn} pp to ${valEn} ${pEn}`,
        }
      : {
          headline_pl: `${name.name_pl}: spadek o ${ppPl} p.p. do ${valPl} ${pPl}`,
          headline_en: `${name.name_en}: down ${ppEn} pp to ${valEn} ${pEn}`,
        };
  }
  const [prevPl, prevEn] = [formatNumber(prev, 'pl'), formatNumber(prev, 'en')];
  return change > 0
    ? {
        headline_pl: `${name.name_pl}: wzrost z ${prevPl} do ${valPl} ${pPl}`,
        headline_en: `${name.name_en}: up from ${prevEn} to ${valEn} ${pEn}`,
      }
    : {
        headline_pl: `${name.name_pl}: spadek z ${prevPl} do ${valPl} ${pPl}`,
        headline_en: `${name.name_en}: down from ${prevEn} to ${valEn} ${pEn}`,
      };
}

/** Index in HEADLINE_ORDER; unknown KPIs after all known ones. */
function headlineRank(kpi: string): number {
  const i = (HEADLINE_ORDER as readonly string[]).indexOf(kpi);
  return i === -1 ? HEADLINE_ORDER.length : i;
}

/**
 * The newest release per KPI from one kind of signal: the latest timestamp within the last RECENT_DAYS
 * days up to `now`, or undefined.
 */
function newestSignal(stamps: string[], now: Date): number | undefined {
  const from = now.getTime() - RECENT_DAYS * 86_400_000;
  const times = stamps.map((s) => Date.parse(s)).filter((t) => Number.isFinite(t) && t <= now.getTime() && t >= from);
  return times.length ? Math.max(...times) : undefined;
}

type Candidate = {
  pick: ChartOfDay;
  frequency: Frequency;
  end: number;
  calendar?: number;
  changes?: number;
};

/** Highest signal first; ties by headline order, then kpi_key. */
function byNewest(key: 'calendar' | 'changes') {
  return (a: Candidate, b: Candidate) =>
    (b[key] ?? -Infinity) - (a[key] ?? -Infinity) ||
    headlineRank(a.pick.kpi_key) - headlineRank(b.pick.kpi_key) ||
    cmp(a.pick.kpi_key, b.pick.kpi_key);
}

/**
 * The chart of the day at `now` (the build time). Candidates: the latest national row of each named KPI,
 * provisional included, when its period is fresh (monthly ≤ 3 months, quarterly ≤ 6, annual ≤ 18).
 * Pick: the newest calendar release in the last 7 days; else the newest changes-feed item in the last 7
 * days; else the highest frequency (D > M > Q > A), then the latest period. Ties: HEADLINE_ORDER.
 * Null when no KPI is eligible (the block is then not rendered).
 */
export function chartOfDay(
  files: LatestFile[],
  names: KpiNames,
  now: Date,
  signals: ReleaseSignals = {},
): ChartOfDay | null {
  const candidates: Candidate[] = [];
  for (const file of files) {
    const name = names[file.kpi_key];
    const latest = name ? latestNationalRow(file) : undefined;
    if (!name || !latest || !fresh(latest.p.end, latest.p.frequency, now)) continue;
    const { row } = latest;
    const rate = name.unit_pl ? isRateUnit(name.unit_pl) : (row.unit_key ?? '').startsWith('pct');
    const hasPrev = row.previous_value !== undefined && row.previous_value !== null;
    candidates.push({
      pick: {
        kpi_key: file.kpi_key,
        source_key: row.source_key,
        period: row.period,
        ...headlines(name, row, rate),
        change: hasPrev ? row.value - (row.previous_value as number) : null,
        rate,
        provisional: row.flags.includes('p'),
      },
      frequency: latest.p.frequency,
      end: latest.p.end.getTime(),
      calendar: newestSignal(
        (signals.calendar ?? []).filter((e) => e.kpi_key === file.kpi_key).map((e) => e.at),
        now,
      ),
      changes: newestSignal(
        (signals.changes ?? []).filter((i) => i.kpi_keys.includes(file.kpi_key)).map((i) => i.at),
        now,
      ),
    });
  }
  if (!candidates.length) return null;
  if (candidates.some((c) => c.calendar !== undefined)) return [...candidates].sort(byNewest('calendar'))[0].pick;
  if (candidates.some((c) => c.changes !== undefined)) return [...candidates].sort(byNewest('changes'))[0].pick;
  candidates.sort(
    (a, b) =>
      FREQUENCY_RANK[a.frequency] - FREQUENCY_RANK[b.frequency] ||
      b.end - a.end ||
      headlineRank(a.pick.kpi_key) - headlineRank(b.pick.kpi_key) ||
      cmp(a.pick.kpi_key, b.pick.kpi_key),
  );
  return candidates[0].pick;
}

/**
 * Release events from feed/calendar.ics (zohelo-data warehouse/publish.py `calendar_ics`): the KPI from
 * the UID `<DTSTART>-<source_key>-<kpi_key>@zohelo.com`, the time from DTSTART (`20261109T111500Z`).
 * Events without either are skipped.
 */
export function parseCalendar(text: string): { kpi_key: string; at: string }[] {
  const events: { kpi_key: string; at: string }[] = [];
  for (const block of text.split(/^BEGIN:VEVENT\r?$/m).slice(1)) {
    const uid = /^UID:([^\r\n]*)/m.exec(block)?.[1];
    const start = /^DTSTART:(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/m.exec(block);
    const kpi = uid ? /^[^-]+-[^-]+-([^@]+)@/.exec(uid)?.[1] : undefined;
    if (!kpi || !start) continue;
    const [, y, mo, d, h, mi, s] = start;
    events.push({ kpi_key: kpi, at: `${y}-${mo}-${d}T${h}:${mi}:${s}Z` });
  }
  return events;
}
