// The licence gate (zohelo#469): no number from a source whose reuse terms are not established
// reaches the public build. A source may be shown only when its licence row in catalog.json exists
// and its licence_key is not `unresolved` ("Terms not established"). `commercial_ok` is not part of
// the rule: false there means commercial reuse is not addressed (e.g. `gus_copyright` for GUS DBW,
// whose terms allow reuse with the source named), and it matters only for paid surfaces, which
// zohelo.com does not have. The rule reads the licence table only, never a source name: when a
// licence row changes in zohelo-data, the site follows without an edit.
// Pure; src/published.ts applies it in every reader, so pages, feeds and the sitemap see gated data.
import type { Catalog, ChangeItem, Changes, KpiLatest, Licence, SeriesRow, Source } from './published';

/** The licence_key zohelo-data gives a source whose reuse terms are not established ("Terms not established"). */
export const UNRESOLVED_LICENCE = 'unresolved';

/** True when a licence lets the site show the numbers of the sources under it: a row exists and is not `unresolved`. */
export function licenceAllows(licence: Licence | undefined): boolean {
  return licence !== undefined && licence.licence_key !== UNRESOLVED_LICENCE;
}

/** The source_keys whose numbers may be shown: a catalog source with an allowing licence row. */
export function shownSourceKeys(catalog: Pick<Catalog, 'sources' | 'licences'>): Set<string> {
  const licences = new Map(catalog.licences.map((l) => [l.licence_key, l]));
  return new Set(catalog.sources.filter((s) => licenceAllows(licences.get(s.licence_key))).map((s) => s.source_key));
}

/**
 * The catalog the site may build from: only shown sources, only the licences they use, each KPI's
 * source_keys cut to shown sources, and no KPI left without a shown source (no page, no listing, no
 * sitemap entry). Idempotent.
 */
export function gateCatalog(catalog: Catalog): Catalog {
  const shown = shownSourceKeys(catalog);
  const sources = catalog.sources.filter((s) => shown.has(s.source_key));
  const licenceKeys = new Set(sources.map((s) => s.licence_key));
  const kpis = catalog.kpis
    .map((k) => ({ ...k, source_keys: k.source_keys.filter((key) => shown.has(key)) }))
    .filter((k) => k.source_keys.length > 0);
  return { ...catalog, sources, licences: catalog.licences.filter((l) => licenceKeys.has(l.licence_key)), kpis };
}

/** The source_keys and kpi_keys the gate lets through (gated or ungated catalog alike). */
function shownKeys(catalog: Catalog): { sources: Set<string>; kpis: Set<string> } {
  const gated = gateCatalog(catalog);
  return { sources: new Set(gated.sources.map((s) => s.source_key)), kpis: new Set(gated.kpis.map((k) => k.kpi_key)) };
}

/** A latest.json with only shown sources' values; none when the KPI is not shown. */
export function gateLatest(catalog: Catalog, latest: KpiLatest): KpiLatest {
  const { sources, kpis } = shownKeys(catalog);
  const values = kpis.has(latest.kpi_key) ? latest.values.filter((v) => sources.has(v.source_key)) : [];
  return { ...latest, values };
}

/** Series rows of shown sources and shown KPIs only. */
export function gateSeries(catalog: Catalog, rows: SeriesRow[]): SeriesRow[] {
  const { sources, kpis } = shownKeys(catalog);
  return rows.filter((r) => sources.has(r.source_key) && kpis.has(r.kpi_key));
}

/** The what-changed feed without items of hidden sources, each item's kpi_keys cut to shown KPIs. */
export function gateChanges(catalog: Catalog, changes: Changes): Changes {
  const { sources, kpis } = shownKeys(catalog);
  const items = changes.items
    .filter((i) => sources.has(i.source_key))
    .map((i): ChangeItem => ({ ...i, kpi_keys: i.kpi_keys.filter((k) => kpis.has(k)) }));
  return { ...changes, items };
}

/**
 * feed/calendar.ics without the events of a hidden source or of a KPI the gate drops (UID
 * `<start>-<source_key>-<kpi_key>@zohelo.com`, zohelo-data warehouse/publish.py). Takes the catalog
 * as published, ungated, to tell hidden keys from keys the catalog does not list; events of unlisted
 * sources and KPIs, and every other line, stay as they are.
 */
export function gateCalendar(catalog: Catalog, ics: string): string {
  const shown = shownKeys(catalog);
  const hiddenSources = new Set(catalog.sources.map((s) => s.source_key).filter((k) => !shown.sources.has(k)));
  const hiddenKpis = new Set(catalog.kpis.map((k) => k.kpi_key).filter((k) => !shown.kpis.has(k)));
  return ics.replace(/BEGIN:VEVENT\r?\n[\s\S]*?END:VEVENT(\r?\n|$)/g, (event) => {
    const uid = /^UID:[^-\r\n]+-([^-\r\n]+)-([^@\r\n]+)@/m.exec(event);
    return uid && (hiddenSources.has(uid[1]) || hiddenKpis.has(uid[2])) ? '' : event;
  });
}

/** The shown sources that feed at least one published KPI, in catalog order (the footer's source list). */
export function feedingSources(catalog: Catalog): Source[] {
  const gated = gateCatalog(catalog);
  const fed = new Set(gated.kpis.filter((k) => k.status === 'published').flatMap((k) => k.source_keys));
  return gated.sources.filter((s) => fed.has(s.source_key));
}
