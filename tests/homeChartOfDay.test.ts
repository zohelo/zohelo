import { describe, expect, test } from 'bun:test';
import { cpSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chartOfDay } from '../src/growth/chartOfDay';
import { homeChartOfDay } from '../src/growth/homeChartOfDay';
import { readCatalog, readKpiLatest, requiredLatest } from '../src/published';

const dir = 'fixtures/published';
const catalog = readCatalog(dir);

describe('homeChartOfDay', () => {
  test('Polish: the chartOfDay pick with a source name and a date', () => {
    const files = requiredLatest(catalog).map((k) => readKpiLatest(dir, k));
    const names = Object.fromEntries(
      catalog.kpis.map((k) => [
        k.kpi_key,
        { name_pl: k.name_pl, name_en: k.name_en },
      ]),
    );
    const now = new Date('2026-11-03T00:00:00Z');
    const result = homeChartOfDay(dir, catalog, 'pl', now)!;
    expect(result).not.toBeNull();
    expect(result.pick.kpi_key).toBe(chartOfDay(files, names, now)!.kpi_key);
    expect(result.sourceName.length).toBeGreaterThan(0);
    expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('fixtures on 3 Nov 2026: monthly inflation 2026-09 beats annual unemployment 2025 (#410)', () => {
    const result = homeChartOfDay(dir, catalog, 'pl', new Date('2026-11-03T00:00:00Z'))!;
    expect(result.pick.kpi_key).toBe('inflation');
    expect(result.pick.period).toBe('2026-09');
    expect(result.pick.source_key).toBe('eurostat');
  });

  test('a release in feed/calendar.ics within 7 days decides the pick (#410)', () => {
    const layer = mkdtempSync(join(tmpdir(), 'zohelo-layer-'));
    cpSync(dir, layer, { recursive: true });
    const ics = [
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'UID:20261102T100000Z-eurostat-unemployment_rate@zohelo.com',
      'DTSTART:20261102T100000Z',
      'END:VEVENT',
      'END:VCALENDAR',
      '',
    ].join('\r\n');
    writeFileSync(join(layer, 'feed', 'calendar.ics'), ics);
    const result = homeChartOfDay(layer, catalog, 'en', new Date('2026-11-03T00:00:00Z'))!;
    expect(result.pick.kpi_key).toBe('unemployment_rate');
    expect(result.pick.period).toBe('2025');
  });

  test('nothing fresh gives null (the block is not rendered)', () => {
    expect(homeChartOfDay(dir, catalog, 'pl', new Date('2030-01-01T00:00:00Z'))).toBeNull();
  });

  test('English: the source name_en', () => {
    const result = homeChartOfDay(dir, catalog, 'en')!;
    const source = catalog.sources.find(
      (s) => s.source_key === result.pick.source_key,
    )!;
    expect(result.sourceName).toBe(source.name_en);
  });

  test('no KPIs gives null', () => {
    expect(homeChartOfDay(dir, { ...catalog, kpis: [] }, 'pl')).toBeNull();
  });
});
