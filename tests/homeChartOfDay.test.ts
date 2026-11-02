import { describe, expect, test } from "bun:test";
import { chartOfDay } from "../src/growth/chartOfDay";
import { homeChartOfDay } from "../src/growth/homeChartOfDay";
import { readCatalog, readKpiLatest, requiredLatest } from "../src/published";

const dir = "fixtures/published";
const catalog = readCatalog(dir);

describe("homeChartOfDay", () => {
  test("Polish: the chartOfDay pick with a source name and a date", () => {
    const files = requiredLatest(catalog).map((k) => readKpiLatest(dir, k));
    const names = Object.fromEntries(
      catalog.kpis.map((k) => [
        k.kpi_key,
        { name_pl: k.name_pl, name_en: k.name_en },
      ]),
    );
    const result = homeChartOfDay(dir, catalog, "pl")!;
    expect(result).not.toBeNull();
    expect(result.pick.kpi_key).toBe(chartOfDay(files, names)!.kpi_key);
    expect(result.sourceName.length).toBeGreaterThan(0);
    expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test("English: the source name_en", () => {
    const result = homeChartOfDay(dir, catalog, "en")!;
    const source = catalog.sources.find(
      (s) => s.source_key === result.pick.source_key,
    )!;
    expect(result.sourceName).toBe(source.name_en);
  });

  test("no KPIs gives null", () => {
    expect(homeChartOfDay(dir, { ...catalog, kpis: [] }, "pl")).toBeNull();
  });
});
