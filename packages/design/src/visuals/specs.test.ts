import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { choroplethSpec, lineSpec, smallMultiplesSpec, type ChoroplethOptions } from "./specs";

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
