// Typed readers for the published layer (06_published/v1, contract: zohelo-data docs/published.md).
// The site reads these files at build time only; each reader takes the directory holding a copy
// of the layer (.published/ in the build, fixtures/published in tests). Every reader of the catalog,
// values, series and feeds passes its result through the licence gate (src/licenceGate.ts, zohelo#469):
// a source whose reuse terms are not established never reaches a page, feed or file of the build.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parquetReadObjects } from 'hyparquet';
import { compressors } from 'hyparquet-compressors';
import { gateCalendar, gateCatalog, gateChanges, gateLatest, gateSeries } from './licenceGate';

export type KpiDimension = { dimension_key: string; member_count: number; levels: string[] };

export type CatalogKpi = {
  kpi_key: string;
  name_pl: string;
  name_en: string;
  unit_key: string;
  frequency_default: string;
  subgroup_key: string;
  domain_path: string[];
  source_keys: string[];
  geo_levels: string[];
  first_period: string;
  last_period: string;
  dimensions: KpiDimension[];
  loaded_at: string;
  status: string;
};

export type Domain = {
  domain_key: string;
  level: string;
  parent_key: string | null;
  name_en: string;
  name_pl: string;
  csa_code: string;
  sort: number;
};

export type Unit = { unit_key: string; symbol: string; name_en: string; name_pl: string; is_rate: boolean };

export type Source = { source_key: string; name_pl: string; name_en: string; licence_key: string; register_id: string };

export type Licence = {
  licence_key: string;
  name: string;
  url: string;
  attribution_text: string;
  commercial_ok: boolean;
};

export type Catalog = {
  version: 1;
  generated_at: string;
  kpis: CatalogKpi[];
  domains: Domain[];
  units: Unit[];
  sources: Source[];
  licences: Licence[];
};

export type LatestValue = {
  source_key: string;
  geography_key: string;
  geography_level: string;
  period: string;
  value: number;
  // unit of this value; absent in files written before zohelo-data#2148
  unit_key?: string;
  previous_period?: string;
  previous_value?: number;
  flags: string[];
  checked_at: string;
};

export type KpiLatest = { kpi_key: string; unit_key: string; generated_at: string; values: LatestValue[] };

/** One row of kpi/<kpi_key>/series.parquet; `dims` holds the dim_<dimension_key> columns ('_T' = total). */
export type SeriesRow = {
  kpi_key: string;
  source_key: string;
  measure_key: string;
  geography_key: string;
  geography_level: string;
  period: string;
  // first day of the period, 'YYYY-MM-DD'
  period_start: string;
  frequency: string;
  value: number;
  unit_key: string;
  flags: string;
  dims: Record<string, string>;
};

export type ChangeItem = {
  at: string;
  source_key: string;
  dataset_key: string;
  kpi_keys: string[];
  title_pl: string;
  title_en: string;
  kind: string;
};

export type Changes = { generated_at: string; items: ChangeItem[] };

export type GeoProperties = { geography_key: string; name_pl: string; name_en: string; level: string; parent_key?: string };

export type GeoCollection = { type: 'FeatureCollection'; features: { properties: GeoProperties }[] };

/** The directory holding the build's copy of the layer: PUBLISHED_DIR, default .published/. */
export function publishedDir(): string {
  return process.env.PUBLISHED_DIR ?? '.published';
}

/**
 * The file that marks a copy of the layer as the synthetic fixture set (fixtures/published), never
 * present in 06_published/v1: a build from fixtures shows the sample-data banner on every page.
 */
export const FIXTURE_MARKER = 'FIXTURE.txt';

/** True when `dir` holds the fixture set rather than the published layer. */
export function isFixtureLayer(dir: string): boolean {
  return existsSync(join(dir, FIXTURE_MARKER));
}

/**
 * Published KPIs that have no kpi/<kpi_key>/latest.json by contract. Mirrors SKIP in zohelo-data
 * warehouse/publish.py (docs/published.md, decision D26); keep the two lists equal.
 */
export const NO_LATEST: readonly string[] = ['fx_rate'];

/** The kpi_keys whose latest.json the build must have: published KPIs not in NO_LATEST. Pure. */
export function requiredLatest(catalog: Catalog): string[] {
  return catalog.kpis.filter((k) => k.status === 'published' && !NO_LATEST.includes(k.kpi_key)).map((k) => k.kpi_key);
}

function readJson(path: string): unknown {
  if (!existsSync(path)) throw new Error(`published file missing: ${path}`);
  return JSON.parse(readFileSync(path, 'utf8'));
}

function invalid(path: string): Error {
  return new Error(`published file invalid: ${path}`);
}

const catalogCache = new Map<string, { stamp: string; catalog: Catalog }>();

/**
 * catalog.json as published, before the licence gate. Only for the gate itself and the build's
 * licence check (scripts/licence-check.ts); pages and feeds read readCatalog.
 */
export function readCatalogUngated(dir: string): Catalog {
  const path = join(dir, 'catalog', 'catalog.json');
  // Every gated reader needs the catalog; parse it once per file version.
  const stamp = existsSync(path) ? `${statSync(path).mtimeMs}:${statSync(path).size}` : '';
  const cached = catalogCache.get(path);
  // A copy each time: a caller that edits its catalog never changes the next caller's.
  if (cached && stamp && cached.stamp === stamp) return structuredClone(cached.catalog);
  const data = readJson(path) as Catalog;
  if (data?.version !== 1 || !Array.isArray(data.kpis)) throw invalid(path);
  catalogCache.set(path, { stamp, catalog: structuredClone(data) });
  return data;
}

/** The catalog after the licence gate: only shown sources, their licences and KPIs with a shown source. */
export function readCatalog(dir: string): Catalog {
  return gateCatalog(readCatalogUngated(dir));
}

/** latest.json as published, before the licence gate (see readCatalogUngated). */
export function readKpiLatestUngated(dir: string, kpiKey: string): KpiLatest {
  const path = join(dir, 'kpi', kpiKey, 'latest.json');
  const data = readJson(path) as KpiLatest;
  if (data?.kpi_key !== kpiKey || !Array.isArray(data.values)) throw invalid(path);
  return data;
}

/** A KPI's latest.json with only the values of shown sources (none for a KPI the gate drops). */
export function readKpiLatest(dir: string, kpiKey: string): KpiLatest {
  const latest = readKpiLatestUngated(dir, kpiKey);
  return gateLatest(readCatalogUngated(dir), latest);
}

/**
 * feed/calendar.ics without the events of hidden sources and KPIs, as the build writes it to
 * /calendar.ics; null when the layer has no calendar. Throws when the file is not an iCalendar file.
 */
export function readCalendar(dir: string): string | null {
  const path = join(dir, 'feed', 'calendar.ics');
  if (!existsSync(path)) return null;
  const text = readFileSync(path, 'utf8');
  if (!text.startsWith('BEGIN:VCALENDAR')) throw invalid(path);
  return gateCalendar(readCatalogUngated(dir), text);
}

/** The number of events in an iCalendar text. Pure. */
export function calendarEvents(ics: string | null): number {
  return ics === null ? 0 : (ics.match(/^BEGIN:VEVENT/gm) ?? []).length;
}

/** The what-changed feed without the items of hidden sources. */
export function readChanges(dir: string): Changes {
  const path = join(dir, 'feed', 'changes.json');
  const data = readJson(path) as Changes;
  if (!Array.isArray(data?.items)) throw invalid(path);
  return gateChanges(readCatalogUngated(dir), data);
}

export function readGeo(dir: string, level: string): GeoCollection {
  const path = join(dir, 'geo', `${level}.geojson`);
  const data = readJson(path) as GeoCollection;
  if (!Array.isArray(data?.features)) throw invalid(path);
  return data;
}

const SERIES_COLUMNS = ['kpi_key', 'source_key', 'measure_key', 'geography_key', 'geography_level', 'period', 'period_start', 'frequency', 'value', 'unit_key', 'flags'] as const;

/** Rows of kpi/<kpiKey>/series.parquet of shown sources only (none for a KPI the gate drops). */
export async function readKpiSeries(dir: string, kpiKey: string): Promise<SeriesRow[]> {
  const rows = await readKpiSeriesUngated(dir, kpiKey);
  return gateSeries(readCatalogUngated(dir), rows);
}

/**
 * Rows of kpi/<kpiKey>/series.parquet (zstd as gold.publish writes it, or snappy as the fixtures), before
 * the licence gate (see readCatalogUngated).
 */
export async function readKpiSeriesUngated(dir: string, kpiKey: string): Promise<SeriesRow[]> {
  const path = join(dir, 'kpi', kpiKey, 'series.parquet');
  if (!existsSync(path)) throw new Error(`published file missing: ${path}`);
  const bytes = readFileSync(path);
  const file = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  let records: Record<string, unknown>[];
  try {
    records = await parquetReadObjects({ file, compressors });
  } catch {
    throw invalid(path);
  }
  return records.map((r) => {
    if (r.kpi_key !== kpiKey || SERIES_COLUMNS.some((c) => r[c] === undefined || r[c] === null)) throw invalid(path);
    const start = r.period_start instanceof Date ? r.period_start.toISOString().slice(0, 10) : String(r.period_start);
    const dims: Record<string, string> = {};
    for (const [key, value] of Object.entries(r)) if (key.startsWith('dim_')) dims[key.slice(4)] = String(value);
    return {
      kpi_key: kpiKey,
      source_key: String(r.source_key),
      measure_key: String(r.measure_key),
      geography_key: String(r.geography_key),
      geography_level: String(r.geography_level),
      period: String(r.period),
      period_start: start,
      frequency: String(r.frequency),
      value: Number(r.value),
      unit_key: String(r.unit_key),
      flags: String(r.flags),
      dims,
    };
  });
}
