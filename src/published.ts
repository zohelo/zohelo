// Typed readers for the published layer (06_published/v1, contract: zohelo-data docs/published.md).
// The site reads these files at build time only; each reader takes the directory holding a copy
// of the layer (.published/ in the build, fixtures/published in tests).
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

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
  previous_period?: string;
  previous_value?: number;
  flags: string[];
  checked_at: string;
};

export type KpiLatest = { kpi_key: string; unit_key: string; generated_at: string; values: LatestValue[] };

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

export function readCatalog(dir: string): Catalog {
  const path = join(dir, 'catalog', 'catalog.json');
  const data = readJson(path) as Catalog;
  if (data?.version !== 1 || !Array.isArray(data.kpis)) throw invalid(path);
  return data;
}

export function readKpiLatest(dir: string, kpiKey: string): KpiLatest {
  const path = join(dir, 'kpi', kpiKey, 'latest.json');
  const data = readJson(path) as KpiLatest;
  if (data?.kpi_key !== kpiKey || !Array.isArray(data.values)) throw invalid(path);
  return data;
}

export function readChanges(dir: string): Changes {
  const path = join(dir, 'feed', 'changes.json');
  const data = readJson(path) as Changes;
  if (!Array.isArray(data?.items)) throw invalid(path);
  return data;
}

export function readGeo(dir: string, level: string): GeoCollection {
  const path = join(dir, 'geo', `${level}.geojson`);
  const data = readJson(path) as GeoCollection;
  if (!Array.isArray(data?.features)) throw invalid(path);
  return data;
}
