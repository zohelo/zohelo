import type { VisualizationSpec } from "vega-embed";

// Vega-Lite spec builders: one function per chart type, fed with plain rows.
// Field names are passed in, so the same builders serve every metric.

/** Colours read from the page's CSS tokens, so charts follow light and dark mode. */
export type Theme = { text: string; muted: string; grid: string; accent: string; mutedMark: string; palette: string[] };

export function config(t: Theme) {
  return {
    font: "inherit",
    axis: { labelColor: t.muted, titleColor: t.muted, gridColor: t.grid, domainColor: t.grid, tickColor: t.grid, labelFontSize: 11, titleFontSize: 11, titleFontWeight: 500 },
    legend: { labelColor: t.text, titleColor: t.muted, labelFontSize: 12 },
    view: { stroke: null },
    range: { category: t.palette },
    line: { strokeCap: "round" },
  };
}

export type LineOptions = {
  x: string;
  y: string;
  series: string;
  yTitle: string;
  highlight?: string | null;
};

const base = {
  $schema: "https://vega.github.io/schema/vega-lite/v6.json",
  width: "container",
  autosize: { type: "fit", contains: "padding" },
  background: "transparent",
} as const;

export function lineSpec(rows: object[], o: LineOptions): VisualizationSpec {
  return {
    ...base,
    height: 300,
    data: { values: rows },
    mark: { type: "line", point: rows.length <= 60, strokeWidth: 2, interpolate: "monotone" },
    encoding: {
      x: { field: o.x, type: "temporal", title: null, axis: { tickCount: 7, labelOverlap: true, grid: false } },
      y: { field: o.y, type: "quantitative", title: o.yTitle, scale: { zero: false }, axis: { format: "~s", tickCount: 5 } },
      color: {
        field: o.series,
        type: "nominal",
        title: null,
        legend: { orient: "bottom", direction: "vertical", labelLimit: 420, symbolType: "stroke", symbolStrokeWidth: 3 },
      },
      opacity: o.highlight
        ? { condition: { test: `datum['${o.series}'] === ${JSON.stringify(o.highlight)}`, value: 1 }, value: 0.25 }
        : { value: 1 },
      tooltip: [
        { field: o.series, type: "nominal", title: "Series" },
        { field: o.x, type: "temporal", title: "Period" },
        { field: o.y, type: "quantitative", title: o.yTitle, format: ",.4~f" },
      ],
    },
  } as VisualizationSpec;
}

export type SmallMultiplesOptions = {
  x: string;
  y: string;
  panel: string;
  yTitle: string;
  columns?: number;
};

/** One line panel per member of `panel`, all on the same y scale; at most 16 panels. */
export function smallMultiplesSpec(rows: object[], o: SmallMultiplesOptions): VisualizationSpec {
  const panels = new Set(rows.map((r) => (r as Record<string, unknown>)[o.panel]));
  if (panels.size > 16) throw new Error("max 16 panels");
  return {
    ...base,
    data: { values: rows },
    facet: { field: o.panel, type: "nominal", title: null },
    columns: o.columns ?? 4,
    spec: {
      width: 180,
      height: 120,
      mark: { type: "line", strokeWidth: 1.5 },
      encoding: {
        x: { field: o.x, type: "temporal", title: null },
        y: { field: o.y, type: "quantitative", title: o.yTitle, axis: { format: "~s" } },
      },
    },
    resolve: { scale: { y: "shared" } },
  } as VisualizationSpec;
}

export type BarOptions = {
  category: string;
  value: string;
  valueTitle: string;
  selected?: string | null;
  accent: string;
  mutedMark: string;
};

export function barSpec(rows: object[], o: BarOptions): VisualizationSpec {
  return {
    ...base,
    height: { step: 22 },
    data: { values: rows },
    mark: { type: "bar", cornerRadiusEnd: 3, cursor: "pointer" },
    encoding: {
      y: { field: o.category, type: "nominal", sort: "-x", title: null, axis: { labelLimit: 220 } },
      x: { field: o.value, type: "quantitative", title: o.valueTitle, axis: { format: "~s", tickCount: 5 } },
      color: o.selected
        ? { condition: { test: `datum['${o.category}'] === ${JSON.stringify(o.selected)}`, value: o.accent }, value: o.mutedMark }
        : { value: o.accent },
      tooltip: [
        { field: o.category, type: "nominal", title: "Area" },
        { field: o.value, type: "quantitative", title: o.valueTitle, format: ",.4~f" },
      ],
    },
  } as VisualizationSpec;
}

export type RankingOptions = {
  category: string;
  value: string;
  rank: string;
  valueTitle: string;
  accent: string;
  mutedMark: string;
  selected?: string | null;
};

type BarEncoding = { y: Record<string, unknown>; tooltip: object[] };

/** Pre-ranked rows as bars: barSpec sorted by the rank field (1 first), with the rank in the tooltip. */
export function rankingSpec(rows: object[], o: RankingOptions): VisualizationSpec {
  const spec = barSpec(rows, {
    category: o.category,
    value: o.value,
    valueTitle: o.valueTitle,
    accent: o.accent,
    mutedMark: o.mutedMark,
    selected: o.selected,
  }) as { encoding: BarEncoding };
  return {
    ...spec,
    encoding: {
      ...spec.encoding,
      y: { ...spec.encoding.y, sort: { field: o.rank, order: "ascending" } },
      tooltip: [...spec.encoding.tooltip, { field: o.rank, type: "quantitative", title: "Rank" }],
    },
  } as VisualizationSpec;
}

export type ChoroplethOptions = {
  key: string;
  value: string;
  name: string;
  valueTitle: string;
  colors: [string, string];
  noData: string;
};

/** A region map: geoshapes from a GeoJSON FeatureCollection, coloured by rows joined on `key`. */
export function choroplethSpec(geojson: object, rows: object[], o: ChoroplethOptions): VisualizationSpec {
  return {
    ...base,
    height: 420,
    projection: { type: "mercator" },
    data: { values: geojson, format: { type: "json", property: "features" } },
    transform: [{ lookup: `properties.${o.key}`, from: { data: { values: rows }, key: o.key, fields: [o.value] } }],
    mark: { type: "geoshape", stroke: o.noData, strokeWidth: 0.5 },
    encoding: {
      color: {
        condition: { test: `!isValid(datum['${o.value}'])`, value: o.noData },
        field: o.value,
        type: "quantitative",
        title: o.valueTitle,
        scale: { range: o.colors },
        legend: { orient: "bottom", direction: "horizontal" },
      },
      tooltip: [
        { field: `properties.${o.name}`, type: "nominal", title: "Region" },
        { field: o.value, type: "quantitative", title: o.valueTitle, format: ",.4~f" },
      ],
    },
  } as VisualizationSpec;
}
