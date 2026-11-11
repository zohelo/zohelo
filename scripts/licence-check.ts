// The last build step (zohelo#469): fails the build when anything of a source the licence gate hides
// (src/licenceGate.ts) is in build/client: a page or link of a KPI the gate drops, a /downloads/
// directory, the name of a hidden source or of its licence ("Terms not established"), or one of its
// numbers. Pre-rendered pages carry their loader data, so a hidden number that reached a page is in
// its HTML at full precision; numbers are matched when they have at least MIN_DIGITS significant
// digits, so short values ("3.5") do not match unrelated text.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { gateCatalog } from '../src/licenceGate';
import { publishedDir, readCatalogUngated, readKpiLatestUngated, readKpiSeriesUngated, type Catalog } from '../src/published';

export const MIN_DIGITS = 4;
const TEXT = new Set(['.html', '.data', '.xml', '.ics', '.txt', '.json', '.js', '.csv', '']);

/** What must not be in the build: the hidden KPIs, names and numbers of a catalog as published. */
export type Hidden = { kpis: string[]; names: string[]; values: number[] };

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

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Every leak of `hidden` in the files (path relative to the build root), as readable messages. */
export function findLeaks(files: { path: string; text: string }[], hidden: Hidden): string[] {
  const leaks: string[] = [];
  for (const kpi of hidden.kpis) {
    const page = new RegExp(`(^|/)indicators/${escapeRe(kpi)}(/|$)`);
    for (const f of files) if (page.test(f.path)) leaks.push(`${f.path}: page of hidden KPI ${kpi}`);
  }
  const patterns: { re: RegExp; what: string }[] = [
    ...hidden.kpis.map((k) => ({ re: new RegExp(`/indicators/${escapeRe(k)}(?![A-Za-z0-9_])`), what: `link to hidden KPI ${k}` })),
    ...hidden.names.map((n) => ({ re: new RegExp(escapeRe(n)), what: `hidden source or licence "${n}"` })),
    ...[...new Set(hidden.values.filter((v) => Number.isFinite(v) && significantDigits(v) >= MIN_DIGITS))].flatMap((v) => {
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
  const hidden: Hidden = { ...hiddenOf(catalog), values: await hiddenValues(dir, catalog) };
  const files = filesUnder(out);
  const leaks = findLeaks(files, hidden);
  if (leaks.length > 0) {
    for (const leak of leaks) console.error(`licence-check: ${leak}`);
    if (process.env.GITHUB_ACTIONS === 'true') console.log(`::error title=licence-check::${leaks.length} leak(s) of hidden sources in build/client`);
    process.exit(1);
  }
  console.log(
    `licence-check: ${files.length} files clean of ${hidden.kpis.length} hidden KPI(s), ${hidden.names.length} hidden name(s), ${hidden.values.length} hidden number(s)`,
  );
}
