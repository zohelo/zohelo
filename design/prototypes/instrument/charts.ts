// Instrument chart style as Vega-Lite specs (D25: the site renders the same specs client-side; the prototype renders
// them to static SVG at build time through the Editorial renderer). Rules of this direction: a monochrome teal ramp
// (the darkest step is the headline series, lighter steps are the other series, grey is context), sparklines without
// axes inside tiles, compact axes (3 ticks, 11 px) on every other chart, small multiples instead of multi-series
// charts, value labels at the line end, the takeaway in the HTML above the chart — never a title inside the SVG.
// Illustrative points are dashed and lighter, preliminary points hollow (number rule 5).

import { svg } from '../editorial/charts';
import type { Lang, Point } from '../editorial/data';

/** Monochrome teal ramp (light → dark). Marks that carry meaning use steps ≥ 3 (≥ 3:1 on white, WCAG 1.4.11). */
export const RAMP = ['#E3EFF0', '#B9D5D8', '#7FAEB3', '#4E8F96', '#2C6E76', '#1E4F55'];
export const C = {
  text: '#24292E',
  muted: '#5D636B',
  grid: '#E8ECEF',
  border: '#D9DEE3',
  accent: RAMP[4], // teal-strong, 5.8:1 on white: text-safe, the headline series
  second: RAMP[3], // 4.0:1 on white: a second series, label in text colour
  context: '#868D95', // grey context series, 3.3:1
};

export type Series = { label: string; role: 'accent' | 'second' | 'context'; points: Point[] };
const roleColour: Record<Series['role'], string> = { accent: C.accent, second: C.second, context: C.context };

const FONT = 'Inter Variable, Plus Jakarta Sans, sans-serif';

function rows(series: Series[]) {
  return series.flatMap((s) =>
    s.points.map((p, i) => ({
      s: s.label, role: s.role, t: p.t, v: p.v,
      ill: !!p.illustrative,
      joint: !p.illustrative && i > 0 && !!s.points[i - 1].illustrative,
      prelim: !!p.preliminary,
      last: i === s.points.length - 1,
    })),
  );
}

const colour = (series: Series[]) => ({
  field: 'role', type: 'nominal', legend: null,
  scale: { domain: [...new Set(series.map((s) => s.role))], range: [...new Set(series.map((s) => roleColour[s.role]))] },
});

export type SparkOpts = { points: Point[]; width: number; height: number; zero?: boolean };

/** Sparkline: no axes, no grid, a filled last point, the band of the series in the lightest ramp step. */
export function sparkSpec(o: SparkOpts): any {
  const pts: Series[] = [{ label: '', role: 'accent', points: o.points }];
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
    width: o.width, height: o.height, padding: 2,
    data: { values: rows(pts) },
    config: { view: { stroke: null }, font: FONT },
    encoding: {
      x: { field: 't', type: 'temporal', axis: null },
      y: { field: 'v', type: 'quantitative', axis: null, scale: { zero: !!o.zero, nice: false } },
    },
    layer: [
      { transform: [{ filter: '!datum.ill' }], mark: { type: 'area', color: RAMP[0], opacity: 1, line: false } },
      { transform: [{ filter: 'datum.ill || datum.joint' }], mark: { type: 'line', strokeWidth: 1.25, strokeDash: [2, 2], color: C.second } },
      { transform: [{ filter: '!datum.ill' }], mark: { type: 'line', strokeWidth: 1.75, color: C.accent } },
      { transform: [{ filter: 'datum.last' }], mark: { type: 'point', filled: true, size: 28, strokeWidth: 1.5 }, encoding: { fill: { condition: { test: 'datum.prelim', value: 'white' }, value: C.accent }, stroke: { value: C.accent } } },
    ],
  };
}

export type LineOpts = {
  series: Series[];
  lang: Lang;
  width: number;
  height: number;
  monthly?: boolean;
  yFormat?: string;
  ySuffix?: string;
  zero?: boolean;
  label?: boolean; // value label at the line end (default on)
};

/** Compact line chart: 3 y ticks, light grid, 11 px labels, y-axis on the right so the label sits next to the value. */
export function lineSpec(o: LineOpts): any {
  const fmt = o.yFormat ?? '.1f';
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
    width: o.width, height: o.height, padding: { left: 0, right: 0, top: 6, bottom: 0 },
    data: { values: rows(o.series) },
    config: { font: FONT, view: { stroke: null }, axis: { labelFont: FONT, labelFontSize: 11, labelColor: C.muted } },
    encoding: {
      x: {
        field: 't', type: 'temporal', title: null,
        axis: { format: o.monthly ? '%b %Y' : '%Y', tickCount: o.monthly ? 3 : { interval: 'year', step: 1 }, tickColor: C.border, domainColor: C.border, grid: false, labelFlush: true },
      },
      y: {
        field: 'v', type: 'quantitative', title: null, scale: { zero: !!o.zero, nice: true },
        axis: { format: fmt, orient: 'right', gridColor: C.grid, gridDash: [1, 3], domain: false, ticks: false, tickCount: 3, labelPadding: 4, ...(o.ySuffix ? { labelExpr: `datum.label + '${o.ySuffix}'` } : {}) },
      },
      color: colour(o.series),
    },
    layer: [
      { transform: [{ filter: 'datum.ill || datum.joint' }], mark: { type: 'line', strokeWidth: 1.25, strokeDash: [2, 3], opacity: 0.7 }, encoding: { detail: { field: 's' } } },
      { transform: [{ filter: '!datum.ill' }], mark: { type: 'line', strokeWidth: 2 }, encoding: { detail: { field: 's' } } },
      { transform: [{ filter: 'datum.last' }], mark: { type: 'point', filled: true, size: 34, strokeWidth: 1.5 }, encoding: { fill: { condition: { test: 'datum.prelim', value: 'white' }, field: 'role', type: 'nominal', scale: { domain: [...new Set(o.series.map((s) => s.role))], range: [...new Set(o.series.map((s) => roleColour[s.role]))] }, legend: null } } },
      ...(o.label === false ? [] : [{
        transform: [{ filter: 'datum.last' }, { calculate: `format(datum.v, '${fmt}') + '${o.ySuffix ?? ''}'`, as: 'lab' }],
        mark: { type: 'text', align: 'right', baseline: 'bottom', dy: -7, fontSize: 11, fontWeight: 600, font: FONT },
        encoding: { text: { field: 'lab' }, color: { condition: { test: "datum.role === 'context'", value: C.muted }, value: C.text } },
      }]),
    ],
  };
}

/** Horizontal ranking bars (regions, sources): one colour, value label at the bar end, no axis but the labels. */
export function barSpec(o: { rows: { name: string; v: number; hi?: boolean }[]; width: number; height: number; fmt?: string; suffix?: string }): any {
  const fmt = o.fmt ?? '.1f';
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
    width: o.width, height: o.height, padding: { left: 0, right: 36, top: 0, bottom: 0 },
    data: { values: o.rows.map((r, i) => ({ ...r, i })) },
    config: { font: FONT, view: { stroke: null }, axis: { labelFont: FONT, labelFontSize: 11, labelColor: C.text } },
    encoding: {
      y: { field: 'name', type: 'nominal', sort: { field: 'i' }, title: null, axis: { domain: false, ticks: false, labelPadding: 8, labelLimit: 140 } },
      x: { field: 'v', type: 'quantitative', title: null, axis: null, scale: { zero: true } },
    },
    layer: [
      { mark: { type: 'bar', height: 12, cornerRadiusEnd: 2 }, encoding: { color: { condition: { test: 'datum.hi', value: C.accent }, value: RAMP[2] } } },
      { transform: [{ calculate: `format(datum.v, '${fmt}') + '${o.suffix ?? ''}'`, as: 'lab' }], mark: { type: 'text', align: 'left', dx: 6, fontSize: 11, font: FONT, fontWeight: 600, color: C.text }, encoding: { text: { field: 'lab' } } },
    ],
  };
}

const render = async (spec: any, lang: Lang, cls: string) => `<div class="chart ${cls}">${await svg(spec, lang)}</div>`;

/** One render per breakpoint (desktop, 390 px), as the Editorial prototype does. */
export async function responsive(o: Omit<LineOpts, 'width' | 'height'>, d: [number, number], m: [number, number]) {
  const dSpec = lineSpec({ ...o, width: d[0], height: d[1] });
  return { spec: dSpec, html: (await render(dSpec, o.lang, 'chart-d')) + (await render(lineSpec({ ...o, width: m[0], height: m[1] }), o.lang, 'chart-m')) };
}

export async function spark(points: Point[], lang: Lang, zero = false, w = 112, h = 28) {
  const spec = sparkSpec({ points, width: w, height: h, zero });
  return { spec, html: await render(spec, lang, 'spark') };
}

export async function bars(o: Parameters<typeof barSpec>[0], lang: Lang) {
  const spec = barSpec(o);
  return { spec, html: await render(spec, lang, 'chart-any') };
}
