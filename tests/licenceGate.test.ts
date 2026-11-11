import { afterAll, describe, expect, test } from 'bun:test';
import { readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import config from '../react-router.config';
import { findLeaks, hiddenOf, hiddenValues, significantDigits, type Hidden } from '../scripts/licence-check';
import { sitemapPaths } from '../scripts/sitemap';
import { renderRss } from '../src/growth/rss';
import {
  feedingSources,
  gateCalendar,
  gateCatalog,
  gateChanges,
  gateLatest,
  gateSeries,
  licenceAllows,
  shownSourceKeys,
} from '../src/licenceGate';
import {
  readCatalog,
  readCatalogUngated,
  readChanges,
  readKpiSeriesUngated,
  type Licence,
  type SeriesRow,
} from '../src/published';
import { loader as rootLoader } from '../src/root';
import { loader as changesLoader } from '../src/routes/changes';
import { loader as homeLoader } from '../src/routes/home';
import { loader as indicatorLoader } from '../src/routes/indicator';
import { loader as indicatorsLoader } from '../src/routes/indicators';
import { loader as regionLoader } from '../src/routes/region';
import { loader as regionsLoader } from '../src/routes/regions';
import { loader as sourcesLoader } from '../src/routes/sources';
import { FIXTURES, licensedLayer } from './licensedLayer';

const previous = process.env.PUBLISHED_DIR;
const layers: string[] = [];
afterAll(() => {
  if (previous === undefined) delete process.env.PUBLISHED_DIR;
  else process.env.PUBLISHED_DIR = previous;
  for (const dir of layers) rmSync(dir, { recursive: true, force: true });
});

const raw = readCatalogUngated(FIXTURES);
const licence = (over: Partial<Licence>): Licence => ({
  licence_key: 'x',
  name: 'X',
  url: 'https://example.invalid',
  attribution_text: 'Source: X',
  commercial_ok: true,
  ...over,
});

describe('licenceAllows (the rule reads the licence row only)', () => {
  test('established and commercial_ok: shown', () => {
    expect(licenceAllows(licence({}))).toBe(true);
  });
  test('unresolved ("Terms not established"), even with commercial_ok: hidden', () => {
    expect(licenceAllows(licence({ licence_key: 'unresolved', commercial_ok: true }))).toBe(false);
  });
  test('commercial_ok false: hidden', () => {
    expect(licenceAllows(licence({ commercial_ok: false }))).toBe(false);
  });
  test('no licence row: hidden', () => {
    expect(licenceAllows(undefined)).toBe(false);
  });
  test('a source pointing at a missing licence row is hidden', () => {
    const copy = structuredClone(raw);
    copy.sources.find((s) => s.source_key === 'eurostat')!.licence_key = 'nope';
    expect([...shownSourceKeys(copy)].sort()).toEqual(['gus_bdl', 'world_bank_wdi']);
  });
});

describe('gateCatalog on the fixtures (NBP: licence unresolved)', () => {
  const gated = gateCatalog(raw);
  test('no NBP source, no unresolved licence, no fx_rate', () => {
    expect(gated.sources.map((s) => s.source_key).sort()).toEqual(['eurostat', 'gus_bdl', 'world_bank_wdi']);
    expect(gated.licences.map((l) => l.licence_key).sort()).toEqual(['cc_by_4_0', 'gus_terms']);
    expect(gated.kpis.map((k) => k.kpi_key)).not.toContain('fx_rate');
    expect(gated.kpis).toHaveLength(4);
  });
  test('a KPI with a shown and a hidden source keeps the shown one', () => {
    const copy = structuredClone(raw);
    copy.kpis.find((k) => k.kpi_key === 'inflation')!.source_keys = ['nbp', 'eurostat'];
    expect(gateCatalog(copy).kpis.find((k) => k.kpi_key === 'inflation')!.source_keys).toEqual(['eurostat']);
  });
  test('idempotent and the input is not mutated', () => {
    const before = JSON.stringify(raw);
    expect(gateCatalog(gated)).toEqual(gated);
    expect(JSON.stringify(raw)).toBe(before);
  });
  test('readCatalog is the gated catalog', () => {
    expect(readCatalog(FIXTURES)).toEqual(gated);
  });
  test('the footer lists only sources that feed a shown KPI', () => {
    const copy = structuredClone(raw);
    copy.kpis.find((k) => k.kpi_key === 'population')!.status = 'draft';
    expect(feedingSources(copy).map((s) => s.source_key)).toEqual(['eurostat', 'world_bank_wdi']);
  });
});

describe('gated values, series, feeds and calendar', () => {
  const row = (over: Partial<SeriesRow>): SeriesRow => ({
    kpi_key: 'inflation',
    source_key: 'eurostat',
    measure_key: 'm',
    geography_key: 'PL',
    geography_level: 'country',
    period: '2026-01',
    period_start: '2026-01-01',
    frequency: 'M',
    value: 1,
    unit_key: 'pct',
    flags: '',
    dims: {},
    ...over,
  });
  test('series rows of a hidden source are dropped', () => {
    const rows = [row({}), row({ source_key: 'nbp', value: 9.8765 })];
    expect(gateSeries(raw, rows).map((r) => r.source_key)).toEqual(['eurostat']);
  });
  test('latest values of a hidden source are dropped; a hidden KPI has none', () => {
    const v = { geography_key: 'PL', geography_level: 'country', period: '2026', value: 1, flags: [], checked_at: '' };
    const latest = { kpi_key: 'inflation', unit_key: 'pct', generated_at: '', values: [{ ...v, source_key: 'eurostat' }, { ...v, source_key: 'nbp' }] };
    expect(gateLatest(raw, latest).values.map((x) => x.source_key)).toEqual(['eurostat']);
    expect(gateLatest(raw, { ...latest, kpi_key: 'fx_rate' }).values).toEqual([]);
  });
  test('changes: the NBP item is dropped, kpi_keys cut to shown KPIs', () => {
    const changes = readChanges(FIXTURES);
    expect(changes.items.map((i) => i.source_key)).toEqual(['eurostat']);
    const mixed = { generated_at: '', items: [{ ...changes.items[0], kpi_keys: ['unemployment_rate', 'fx_rate'] }] };
    expect(gateChanges(raw, mixed).items[0].kpi_keys).toEqual(['unemployment_rate']);
  });
  test('calendar: NBP events go, others and unlisted KPIs stay, line ends kept', () => {
    const ics = readFileSync(join(FIXTURES, 'feed', 'calendar.ics'), 'utf8');
    const gated = gateCalendar(raw, ics);
    expect(gated).toContain('UID:20260115T100000Z-eurostat-inflation@zohelo.com');
    expect(gated).not.toContain('nbp');
    expect(gated).not.toContain('fx_rate');
    expect(gated.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(gated.endsWith('END:VEVENT\r\nEND:VCALENDAR\r\n')).toBe(true);
    const unlisted = ics.replace('eurostat-inflation', 'eurostat-gdp_volume_growth');
    expect(gateCalendar(raw, unlisted)).toContain('eurostat-gdp_volume_growth');
  });
});

/** Every page model and feed the build makes from the layer at `dir`, as one JSON string per output. */
async function buildModels(dir: string): Promise<{ path: string; text: string }[]> {
  process.env.PUBLISHED_DIR = dir;
  const out: { path: string; text: string }[] = [];
  const put = (path: string, data: unknown) => out.push({ path, text: typeof data === 'string' ? data : JSON.stringify(data) });
  const req = (path: string) => new Request(`http://x${path}`);
  const catalog = readCatalog(dir);
  for (const prefix of ['', '/en']) {
    put(`${prefix}/root`, await rootLoader({ request: req(`${prefix}/`) }));
    put(`${prefix}/`, await homeLoader({ request: req(`${prefix}/`) }));
    put(`${prefix}/indicators`, await indicatorsLoader({ request: req(`${prefix}/indicators`) }));
    put(`${prefix}/regions`, await regionsLoader({ request: req(`${prefix}/regions`) }));
    put(`${prefix}/regions/12`, await regionLoader({ params: { teryt: '12' }, request: req(`${prefix}/regions/12`) }));
    put(`${prefix}/sources`, await sourcesLoader({ request: req(`${prefix}/sources`) }));
    for (const kpi of catalog.kpis.filter((k) => k.status === 'published')) {
      const path = `${prefix}/indicators/${kpi.kpi_key}`;
      put(path, await indicatorLoader({ request: req(path), params: { kpi: kpi.kpi_key } }));
    }
  }
  put('/changes', await changesLoader());
  put('prerender', await config.prerender!({ getStaticPaths: () => [] } as never));
  put('sitemap.xml', sitemapPaths(catalog));
  const items = readChanges(dir).items;
  put('rss.xml', renderRss(items, 'pl', '2026-01-01T00:00:00Z'));
  put('en/rss.xml', renderRss(items, 'en', '2026-01-01T00:00:00Z'));
  put('calendar.ics', gateCalendar(readCatalogUngated(dir), readFileSync(join(dir, 'feed', 'calendar.ics'), 'utf8')));
  return out;
}

const nbpValues = async (dir: string) => (await readKpiSeriesUngated(dir, 'fx_rate')).map((r) => r.value);

describe('the build from fixtures with an nbp series (#469)', () => {
  test('no NBP number, no fx_rate page or link, no "Terms not established" in any page model or feed', async () => {
    const models = await buildModels(FIXTURES);
    const values = await nbpValues(FIXTURES);
    expect(values).toEqual([4.2531, 4.2618, 3.6642, 3.6519]);
    const all = models.map((m) => m.text).join('\n');
    for (const v of values) {
      expect(all).not.toContain(String(v));
      expect(all).not.toContain(String(v).replace('.', ','));
    }
    expect(all).not.toContain('fx_rate');
    expect(all).not.toContain('Terms not established');
    expect(all).not.toContain('Narodowy Bank Polski');
    expect(all).not.toContain('National Bank of Poland');
    expect(all).not.toMatch(/"source_key":"nbp"/);
    // The build's own check (scripts/licence-check.ts) finds nothing either.
    const hidden: Hidden = { ...hiddenOf(raw), values: await hiddenValues(FIXTURES, raw) };
    expect(hidden.kpis).toEqual(['fx_rate']);
    expect(hidden.values).toEqual(values);
    expect(findLeaks(models, hidden)).toEqual([]);
  });

  test('with NBP licence flipped in the catalog, fx_rate appears with no site change', async () => {
    const layer = licensedLayer();
    layers.push(layer);
    const models = await buildModels(layer);
    const text = (path: string) => models.find((m) => m.path === path)!.text;
    expect(text('/indicators')).toContain('"kpi_key":"fx_rate"');
    expect(text('/en/indicators/fx_rate')).toContain('National Bank of Poland');
    expect(text('prerender')).toContain('"/indicators/fx_rate"');
    expect(text('sitemap.xml')).toContain('"/indicators/fx_rate"');
    expect(text('rss.xml')).toContain('https://zohelo.com/indicators/fx_rate');
    expect(text('calendar.ics')).toContain('nbp-fx_rate');
    expect(text('/root')).toContain('Narodowy Bank Polski');
    expect(hiddenOf(readCatalogUngated(layer))).toEqual({ kpis: [], names: [] });
  });
});

describe('scripts/licence-check findLeaks', () => {
  const hidden: Hidden = { kpis: ['fx_rate'], names: ['Terms not established'], values: [4.2531, 3.5] };
  test('a hidden KPI page, a link to it, a downloads directory, a hidden name and a hidden number', () => {
    const leaks = findLeaks(
      [
        { path: 'indicators/fx_rate', text: '' },
        { path: 'en/indicators/fx_rate/index.html', text: '' },
        { path: 'sitemap.xml', text: '<loc>https://zohelo.com/indicators/fx_rate/</loc>' },
        { path: 'downloads', text: '' },
        { path: 'sources/index.html', text: 'Terms not established' },
        { path: 'x/index.html', text: '"value":4.2531,' },
        { path: 'y/index.html', text: 'kurs 4,2531 zł' },
      ],
      hidden,
    );
    expect(leaks).toEqual([
      'indicators/fx_rate: page of hidden KPI fx_rate',
      'en/indicators/fx_rate/index.html: page of hidden KPI fx_rate',
      'sitemap.xml: link to hidden KPI fx_rate',
      'downloads: /downloads/ is not built (data export is zohelo-bi\'s)',
      'sources/index.html: hidden source or licence "Terms not established"',
      'x/index.html: number 4.2531 of a hidden source',
      'y/index.html: number 4.2531 of a hidden source',
    ]);
  });
  test('no false hits: other KPIs, longer numbers, short numbers', () => {
    const files = [
      { path: 'indicators/fx_rate_eur/index.html', text: '/indicators/fx_rate_eur 14.25311 3.5 4.25310' },
      { path: 'indicators/inflation/index.html', text: 'Cel NBP 2,5 % ± 1 p.p.' },
    ];
    expect(findLeaks(files, hidden)).toEqual([]);
  });
  test('significant digits', () => {
    expect(significantDigits(4.2531)).toBe(5);
    expect(significantDigits(37640000)).toBe(4);
    expect(significantDigits(0.05)).toBe(1);
    expect(significantDigits(3.5)).toBe(2);
  });
});

