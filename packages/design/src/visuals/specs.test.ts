import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { numberLocale, timeLocale, TIME_FORMAT, TOOLTIP_FORMAT, VALUE_FORMAT } from "./locale";
import { config } from "./specs";
import { barSpec, choroplethSpec, config, fixedFormat, lineSpec, rankingSpec, smallMultiplesSpec, withBand, type ChoroplethOptions } from "./specs";

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
    expect(timeLocale.pl.months[1]).toBe("luty");
    expect(timeLocale.pl.months[7]).toBe("sierpień");
    expect(numberLocale.en.decimal).toBe(".");
    expect(timeLocale.en.shortMonths[6]).toBe("Jul");
  });
});

describe("lineSpec axes (zohelo#389)", () => {
  const rows = [{ date: "2023-01-01", value: 2.8, series: "PL" }, { date: "2024-01-01", value: 2.9, series: "PL" }];

  test("the line is linear between observations", () => {
    const spec = lineSpec(rows, { x: "date", y: "value", series: "series", yTitle: "%" }) as any;
    expect(spec.mark.interpolate).toBe("linear");
    expect(spec.encoding.x.axis.labelOverlap).toBe("parity");
  });

  test("ticks and precision follow the options", () => {
    const spec = lineSpec(rows, { x: "date", y: "value", series: "series", yTitle: "%", xTicks: { interval: "year", step: 1 }, xFormat: "%Y", yDecimals: 1 }) as any;
    expect(spec.encoding.x.axis.tickCount).toEqual({ interval: "year", step: 1 });
    expect(spec.encoding.x.axis.format).toBe("%Y");
    expect(spec.encoding.y.axis.format).toBe(",.1f");
    expect(spec.encoding.y.axis.tickMinStep).toBeCloseTo(0.1, 10);
  });

  test("the tooltip period has the axis format of the frequency, else the fallback date (zohelo#407)", () => {
    const annual = lineSpec(rows, { x: "date", y: "value", series: "series", yTitle: "%", xFormat: "%Y" }) as any;
    expect(annual.encoding.tooltip[1]).toEqual({ field: "date", type: "temporal", title: "Period", format: "%Y" });
    const monthly = lineSpec(rows, { x: "date", y: "value", series: "series", yTitle: "%", xFormat: "%b %Y", locale: "pl" }) as any;
    expect(monthly.encoding.tooltip[1].format).toBe("%b %Y");
    const unknown = lineSpec(rows, { x: "date", y: "value", series: "series", yTitle: "%" }) as any;
    expect(unknown.encoding.tooltip[1].format).toBeUndefined();
  });

  test("the tooltip value keeps the series' decimals, trimmed only when the precision is unknown (zohelo#414)", () => {
    const valueTip = (spec: any) => spec.encoding.tooltip.find((t: any) => t.field === "value");
    const oneDecimal = lineSpec(rows, { x: "date", y: "value", series: "series", yTitle: "%", yDecimals: 1 }) as any;
    expect(valueTip(oneDecimal).format).toBe(",.1f");
    expect(oneDecimal.encoding.y.axis.format).toBe(",.1f");
    const integers = lineSpec(rows, { x: "date", y: "value", series: "series", yTitle: "os.", yDecimals: 0 }) as any;
    expect(valueTip(integers).format).toBe(",.0f");
    const unknown = lineSpec(rows, { x: "date", y: "value", series: "series", yTitle: "%" }) as any;
    expect(valueTip(unknown).format).toBe(TOOLTIP_FORMAT);
  });

  test("an invalid yDecimals falls back to the trimmed formats on axis and tooltip instead of a broken chart", () => {
    for (const bad of [-1, 1.5, Number.NaN, 21]) {
      const spec = lineSpec(rows, { x: "date", y: "value", series: "series", yTitle: "%", yDecimals: bad }) as any;
      expect(spec.encoding.y.axis.format).toBe(VALUE_FORMAT);
      expect(spec.encoding.y.axis.tickMinStep).toBeUndefined();
      expect(spec.encoding.tooltip.find((t: any) => t.field === "value").format).toBe(TOOLTIP_FORMAT);
    }
    expect(fixedFormat(2)).toBe(",.2f");
    expect(fixedFormat(undefined)).toBeUndefined();
  });
});

describe("tooltip titles and dates per page language (zohelo#399)", () => {
  const line = [{ date: "2024-01-01", value: 2.8, series: "PL" }];

  test("Polish titles on Polish pages, English by default", () => {
    const pl = lineSpec(line, { x: "date", y: "value", series: "series", yTitle: "%", locale: "pl" }) as any;
    expect(pl.encoding.tooltip.map((t: any) => t.title)).toEqual(["Seria", "Okres", "%"]);
    const en = lineSpec(line, { x: "date", y: "value", series: "series", yTitle: "%" }) as any;
    expect(en.encoding.tooltip.map((t: any) => t.title)).toEqual(["Series", "Period", "%"]);
    const map = choroplethSpec(geojson, rows, { ...options, locale: "pl" }) as any;
    expect(map.encoding.tooltip[0].title).toBe("Region");
    const bar = barSpec([{ area: "A", value: 1 }], { category: "area", value: "value", valueTitle: "V", accent: "#000", mutedMark: "#ccc", locale: "pl" }) as any;
    expect(bar.encoding.tooltip[0].title).toBe("Obszar");
  });

  test("the fallback date format is day month year in both languages; no long month in a combined date", () => {
    expect(TIME_FORMAT).toBe("%e %b %Y");
    const theme = { text: "#000", muted: "#555", grid: "#eee", accent: "#00f", mutedMark: "#ccc", palette: ["#000"] };
    expect((config(theme, "pl") as any).timeFormat).toBe(TIME_FORMAT);
    expect(timeLocale.pl.dateTime).not.toContain("%B");
    expect(timeLocale.pl.date).not.toContain("%B");
  });
});

describe("withBand (zohelo#412)", () => {
  const rows = [
    { date: "2026-07-01", value: 3.1, series: "Polska" },
    { date: "2026-09-01", value: 2.9, series: "Polska" },
  ];
  const line = lineSpec(rows, { x: "date", y: "value", series: "series", yTitle: "%", yDecimals: 1 }) as any;
  const spec = withBand(line, { low: 1.5, high: 3.5, label: "Cel NBP" }) as any;

  test("the band and its label are layers behind the unchanged line", () => {
    expect(spec.layer).toHaveLength(3);
    expect(spec.layer[0].mark.type).toBe("rect");
    expect(spec.layer[0].encoding.y).toMatchObject({ datum: 1.5, type: "quantitative" });
    expect(spec.layer[0].encoding.y2).toEqual({ datum: 3.5 });
    expect(spec.layer[1].mark.type).toBe("text");
    expect(spec.layer[1].encoding.text).toEqual({ value: "Cel NBP" });
    // Drawn once: a band per series row would stack its opacity.
    expect(spec.layer[0].data).toEqual({ values: [{}] });
    expect(spec.layer[1].data).toEqual({ values: [{}] });
    expect(spec.layer[2].mark).toEqual(line.mark);
    expect(spec.layer[2].encoding).toEqual(line.encoding);
  });

  test("data, size and the shared y scale stay; no top-level mark or encoding", () => {
    expect(spec.data).toEqual(line.data);
    expect(spec.height).toBe(line.height);
    expect(spec.width).toBe("container");
    expect(spec.mark).toBeUndefined();
    expect(spec.encoding).toBeUndefined();
    expect(spec.layer[0].encoding.y.scale).toEqual({ zero: false });
  });

  test("the band takes the accent colour and its label the muted colour from the theme", () => {
    const c = config({ text: "#111", muted: "#555", grid: "#ddd", accent: "#2c6e76", mutedMark: "#aaa", palette: ["#000"] }) as any;
    expect(c.rect).toEqual({ color: "#2c6e76" });
    expect(c.text).toEqual({ color: "#555" });
  });
});
