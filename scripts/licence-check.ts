// The last build step (zohelo#469): fails the build when anything of a source the licence gate hides
// (src/licenceGate.ts) is in build/client:
// - a page of a KPI the gate drops, or a link to one;
// - a /downloads/ directory;
// - the name of a hidden source or of its licence ("Terms not established");
// - a hidden source_key or KPI key in /calendar.ics (event UIDs) or in the RSS feeds (item guids);
// - a number of a hidden source.
// The key checks carry production: real NBP calendar events read "NBP: tabela A kursów średnich
// walut" with an api.nbp.pl URL, which no name check catches, and a production build does not fetch
// hidden series, so it has no hidden numbers to look for.
// Numbers: pre-rendered pages carry their loader data, so a hidden number that reached a page is in
// its HTML or .data file at full precision. Only distinctive numbers are matched: a fraction with at
// least MIN_DIGITS significant digits (4.2531) or an integer of at least MIN_INTEGER_DIGITS digits
// (37640000), never a year like 2024, and never a value a shown source also has. Short values, such
// as NBP policy rates (5.75), are not caught by numbers alone; the page, link, name and key checks
// are what keep them out.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { gateCatalog } from '../src/licenceGate';
import {
  publishedDir,
  readCatalog,
  readCatalogUngated,
  readKpiLatest,
  readKpiLatestUngated,
  readKpiSeries,
  readKpiSeriesUngated,
  type Catalog,
} from '../src/published';

export const MIN_DIGITS = 4;
export const MIN_INTEGER_DIGITS = 5;
const TEXT = new Set(['.html', '.data', '.xml', '.ics', '.txt', '.json', '.js', '.csv', '.svg', '']);

/**
 * What must not be in the build: the hidden KPIs (published ones: no page) and every KPI key the gate
 * drops, the hidden source keys, their names, and their numbers.
 */
export type Hidden = { kpis: string[]; droppedKpis: string[]; sources: string[]; names: string[]; values: number[] };

/** The KPI keys, source and licence names the gate hides in `catalog` (names a shown source shares are kept out). */
export function hiddenOf(catalog: Catalog): Omit<Hidden, 'values'> {
  const gated = gateCatalog(catalog);
  const shownSources = new Set(gated.sources.map((s) => s.source_key));
  const shownKpis = new Set(gated.kpis.map((k) => k.kpi_key));
  const shownNames = new Set([
    ...gated.sources.flatMap((s) => [s.name_pl, s.name_en]),
    ...gated.licences.flatMap((l) => [l.name, l.attribution_text]),
  ]);
  const hiddenSources = catalog.sources.filter((s) => !shownSources.has(s.source_key));
  const hiddenLicenceKeys = new Set(hiddenSources.map((s) => s.licence_key));
  const names = [
    ...hiddenSources.flatMap((s) => [s.name_pl, s.name_en]),
    ...catalog.licences.filter((l) => hiddenLicenceKeys.has(l.licence_key)).flatMap((l) => [l.name, l.attribution_text]),
  ].filter((n) => n && !shownNames.has(n));
  return {
    kpis: catalog.kpis.filter((k) => k.status === 'published' && !shownKpis.has(k.kpi_key)).map((k) => k.kpi_key),
    droppedKpis: catalog.kpis.filter((k) => !shownKpis.has(k.kpi_key)).map((k) => k.kpi_key),
    sources: hiddenSources.map((s) => s.source_key),
    names: [...new Set(names)],
  };
}

/** Significant digits of a number as JSON writes it (4.2531 → 5, 37640000 → 4, 0.05 → 1). */
export function significantDigits(value: number): number {
  const digits = String(Math.abs(value)).replace(/e.*$/i, '');
  const [whole, fraction = ''] = digits.split('.');
  const all = (whole + fraction).replace(/^0+/, '');
  return (fraction ? all : all.replace(/0+$/, '')).length;
}

/** A number distinctive enough to look for: a fraction of MIN_DIGITS significant digits or an integer of MIN_INTEGER_DIGITS digits. */
export function distinctive(value: number): boolean {
  if (!Number.isFinite(value)) return false;
  if (Number.isInteger(value)) return String(Math.abs(value)).length >= MIN_INTEGER_DIGITS;
  return significantDigits(value) >= MIN_DIGITS;
}

/** The hidden numbers worth looking for: distinctive, and not also a value of a shown source. */
export function numbersToMatch(hidden: number[], shown: Iterable<number>): number[] {
  const seen = new Set(shown);
  return [...new Set(hidden)].filter((v) => distinctive(v) && !seen.has(v));
}

/** Source and KPI keys of a calendar's event UIDs (`<start>-<source_key>-<kpi_key>@zohelo.com`). */
export function calendarKeys(ics: string): { source: string; kpi: string }[] {
  return [...ics.matchAll(/^UID:[^-\r\n]+-([^-\r\n]+)-([^@\r\n]+)@/gm)].map((m) => ({ source: m[1], kpi: m[2] }));
}

/** Source keys of an RSS feed's item guids (`<source_key>:<dataset_key>:<at>`, src/growth/rss.ts). */
export function rssSourceKeys(xml: string): string[] {
  return [...xml.matchAll(/<guid[^>]*>([^:<]+):/g)].map((m) => m[1]);
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Every leak of `hidden` in the files (path relative to the build root), as readable messages. */
export function findLeaks(files: { path: string; text: string }[], hidden: Hidden): string[] {
  const leaks: string[] = [];
  const sources = new Set(hidden.sources);
  const dropped = new Set(hidden.droppedKpis);
  for (const kpi of hidden.kpis) {
    const page = new RegExp(`(^|/)indicators/${escapeRe(kpi)}(/|$)`);
    for (const f of files) if (page.test(f.path)) leaks.push(`${f.path}: page of hidden KPI ${kpi}`);
  }
  const patterns: { re: RegExp; what: string }[] = [
    ...hidden.kpis.map((k) => ({ re: new RegExp(`/indicators/${escapeRe(k)}(?![A-Za-z0-9_])`), what: `link to hidden KPI ${k}` })),
    ...hidden.names.map((n) => ({ re: new RegExp(escapeRe(n)), what: `hidden source or licence "${n}"` })),
    ...hidden.values.filter(distinctive).flatMap((v) => {
      const dot = String(v);
      return [...new Set([dot, dot.replace('.', ',')])].map((s) => ({
        re: new RegExp(`(?<![0-9][.,]?)${escapeRe(s)}(?![0-9])`),
        what: `number ${dot} of a hidden source`,
      }));
    }),
  ];
  for (const f of files) {
    if (f.path === 'downloads' || f.path.startsWith('downloads/')) leaks.push(`${f.path}: /downloads/ is not built (data export is zohelo-bi's)`);
    for (const p of patterns) if (p.re.test(f.text)) leaks.push(`${f.path}: ${p.what}`);
    if (f.path.endsWith('.ics')) {
      for (const { source, kpi } of calendarKeys(f.text)) {
        if (sources.has(source)) leaks.push(`${f.path}: calendar event of hidden source ${source}`);
        else if (dropped.has(kpi)) leaks.push(`${f.path}: calendar event of hidden KPI ${kpi}`);
      }
    }
    if (/(^|\/)rss\.xml$/.test(f.path)) {
      for (const source of rssSourceKeys(f.text)) if (sources.has(source)) leaks.push(`${f.path}: feed item of hidden source ${source}`);
    }
  }
  return leaks;
}

/** The hidden sources' numbers in the layer at `dir`: their series rows and latest values, where the files exist. */
export async function hiddenValues(dir: string, catalog: Catalog): Promise<number[]> {
  const shown = new Set(gateCatalog(catalog).sources.map((s) => s.source_key));
  const values: number[] = [];
  for (const kpi of catalog.kpis) {
    if (kpi.source_keys.every((k) => shown.has(k))) continue;
    if (existsSync(join(dir, 'kpi', kpi.kpi_key, 'series.parquet'))) {
      for (const r of await readKpiSeriesUngated(dir, kpi.kpi_key)) if (!shown.has(r.source_key)) values.push(r.value);
    }
    if (existsSync(join(dir, 'kpi', kpi.kpi_key, 'latest.json'))) {
      for (const v of readKpiLatestUngated(dir, kpi.kpi_key).values) {
        if (!shown.has(v.source_key)) values.push(v.value, ...(v.previous_value === undefined ? [] : [v.previous_value]));
      }
    }
  }
  return values;
}

/** The numbers of shown sources in the layer at `dir`, through the gated readers: every series row and latest value. */
export async function shownValues(dir: string): Promise<number[]> {
  const values: number[] = [];
  for (const kpi of readCatalog(dir).kpis) {
    if (existsSync(join(dir, 'kpi', kpi.kpi_key, 'series.parquet'))) {
      for (const r of await readKpiSeries(dir, kpi.kpi_key)) values.push(r.value);
    }
    if (existsSync(join(dir, 'kpi', kpi.kpi_key, 'latest.json'))) {
      for (const v of readKpiLatest(dir, kpi.kpi_key).values) values.push(v.value, ...(v.previous_value === undefined ? [] : [v.previous_value]));
    }
  }
  return values;
}

/** Text files under `root` (and directory entries, so an empty downloads/ is seen too). */
function filesUnder(root: string): { path: string; text: string }[] {
  return readdirSync(root, { recursive: true, withFileTypes: true }).flatMap((e) => {
    const path = relative(root, join(e.parentPath, e.name)).split('\\').join('/');
    if (e.isDirectory()) return [{ path, text: '' }];
    return e.isFile() && TEXT.has(extname(e.name)) ? [{ path, text: readFileSync(join(root, path), 'utf8') }] : [{ path, text: '' }];
  });
}

if (import.meta.main) {
  const dir = publishedDir();
  const out = join(import.meta.dir, '..', 'build', 'client');
  const catalog = readCatalogUngated(dir);
  const hidden: Hidden = { ...hiddenOf(catalog), values: numbersToMatch(await hiddenValues(dir, catalog), await shownValues(dir)) };
  const files = filesUnder(out);
  const leaks = findLeaks(files, hidden);
  if (leaks.length > 0) {
    for (const leak of leaks) console.error(`licence-check: ${leak}`);
    if (process.env.GITHUB_ACTIONS === 'true') console.log(`::error title=licence-check::${leaks.length} leak(s) of hidden sources in build/client`);
    process.exit(1);
  }
  console.log(
    `licence-check: ${files.length} files clean of ${hidden.kpis.length} hidden KPI(s), ${hidden.sources.length} hidden source(s), ${hidden.names.length} hidden name(s), ${hidden.values.length} hidden number(s)`,
  );
}
