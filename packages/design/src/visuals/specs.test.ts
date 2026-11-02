import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { numberLocale, timeLocale, TOOLTIP_FORMAT, VALUE_FORMAT } from "./locale";
import { barSpec, choroplethSpec, lineSpec, rankingSpec, smallMultiplesSpec, type ChoroplethOptions } from "./specs";

const geojson = JSON.parse(
  readFileSync(join(import.meta.dir, "../../../../fixtures/published/geo/voivodeship.geojson"), "utf8"),
) as object;
const rows = [{ geography_key: "TERC:12", value: 5.1 }];
const options: ChoroplethOptions = {
  key: "geography_key",
  value: "value",
  name: "name_pl",
  valueTitle: "Unemployment rate (%)",
  colors: ["#e8f1fb", "#1f4e8c"],
  noData: "#cccccc",
};

describe("choroplethSpec", () => {
  test("draws geoshapes joined on the key", () => {
    const spec = choroplethSpec(geojson, rows, options) as any;
    expect(spec.mark.type).toBe("geoshape");
    expect(spec.data.values).toBe(geojson);
    expect(spec.transform[0].lookup).toBe("properties.geography_key");
    expect(spec.transform[0].from.key).toBe("geography_key");
    expect(spec.transform[0].from.fields).toEqual(["value"]);
    expect(spec.transform[0].from.data.values).toBe(rows);
  });

  test("colours with the given range and names regions in the tooltip", () => {
    const spec = choroplethSpec(geojson, rows, options) as any;
    expect(spec.encoding.color.scale.range).toEqual(["#e8f1fb", "#1f4e8c"]);
    expect(spec.encoding.color.condition.value).toBe("#cccccc");
    expect(spec.encoding.tooltip[0].field).toBe("properties.name_pl");
  });

  test("does not mutate its inputs", () => {
    const geoBefore = JSON.stringify(geojson);
    const rowsBefore = JSON.stringify(rows);
    const optionsBefore = JSON.stringify(options);
    choroplethSpec(geojson, rows, options);
    expect(JSON.stringify(geojson)).toBe(geoBefore);
    expect(JSON.stringify(rows)).toBe(rowsBefore);
    expect(JSON.stringify(options)).toBe(optionsBefore);
  });
});

describe("smallMultiplesSpec", () => {
  const sm = { x: "period", y: "value", panel: "region", yTitle: "Value" };

  test("facets on the panel field", () => {
    const spec = smallMultiplesSpec([{ period: "2025-01-01", value: 1, region: "A" }], sm) as { facet: { field: string } };
    expect(spec.facet.field).toBe("region");
  });

  test("more than 16 panels throws", () => {
    const many = Array.from({ length: 17 }, (_, i) => ({ period: "2025-01-01", value: i, region: `R${i}` }));
    expect(() => smallMultiplesSpec(many, sm)).toThrow("max 16 panels");
  });

  test("lineSpec encoding keys are unchanged", () => {
    const spec = lineSpec([], { x: "period", y: "value", series: "s", yTitle: "Value" }) as { encoding: object };
    expect(Object.keys(spec.encoding)).toEqual(["x", "y", "color", "opacity", "tooltip"]);
  });
});

describe("rankingSpec", () => {
  const rk = { category: "name", value: "value", rank: "rank", valueTitle: "Value", accent: "#111111", mutedMark: "#cccccc" };
  const bar = { category: "name", value: "value", valueTitle: "Value", accent: "#111111", mutedMark: "#cccccc" };
  const data = [{ name: "A", value: 2, rank: 1 }];
  type Enc = { encoding: { y: { sort: unknown }; tooltip: { field: string; title: string }[] } };

  test("y is sorted by the rank field ascending", () => {
    const spec = rankingSpec(data, rk) as Enc;
    expect(spec.encoding.y.sort).toEqual({ field: "rank", order: "ascending" });
  });

  test("the tooltip has the Rank entry", () => {
    const spec = rankingSpec(data, rk) as Enc;
    expect(spec.encoding.tooltip).toContainEqual({ field: "rank", type: "quantitative", title: "Rank" });
  });

  test("barSpec output is unchanged", () => {
    const before = JSON.stringify(barSpec(data, bar));
    rankingSpec(data, rk);
    const spec = barSpec(data, bar) as Enc;
    expect(JSON.stringify(spec)).toBe(before);
    expect(spec.encoding.y.sort).toBe("-x");
    expect(spec.encoding.tooltip.map((t) => t.title)).toEqual(["Area", "Value"]);
  });
});

describe("number and time formats (zohelo#384)", () => {
  test("legend labels are rounded and grouped, tooltips keep the published precision", () => {
    const spec = choroplethSpec(geojson, rows, options) as any;
    expect(spec.encoding.color.legend.format).toBe(VALUE_FORMAT);
    expect(spec.encoding.tooltip[1].format).toBe(TOOLTIP_FORMAT);
    expect(VALUE_FORMAT).toBe(",.2~f");
  });

  test("axes use grouped plain numbers, never SI prefixes", () => {
    const line = lineSpec([{ month: "2025-01-01", value: 845000, series: "PL" }], { x: "month", y: "value", series: "series", yTitle: "mln EUR" }) as any;
    expect(line.encoding.y.axis.format).toBe(VALUE_FORMAT);
    expect(JSON.stringify(line)).not.toContain('"~s"');
  });

  test("the Polish locale uses a decimal comma, a no-break space and Polish months", () => {
    expect(numberLocale.pl.decimal).toBe(",");
    expect(numberLocale.pl.thousands).toBe("\u00a0");
    expect(timeLocale.pl.shortMonths[6]).toBe("lip");
    expect(numberLocale.en.decimal).toBe(".");
    expect(timeLocale.en.shortMonths[6]).toBe("Jul");
  });
});
