// Editorial chart style as Vega-Lite specs (D25: the site renders the same specs client-side; the prototype renders
// them to static SVG at build time). Rules: one accent series, context in grey, direct labels at the line end instead
// of a legend, horizontal grid only, no chart title inside the SVG (the takeaway is the HTML heading), illustrative
// points dashed and lighter, preliminary points hollow (number rule 5).

import { createRequire } from 'node:module';
import { join } from 'node:path';
// vega and vega-lite are dependencies of @zohelo/design; resolve them from there.
const req = createRequire(join(import.meta.dir, '../../../packages/design/package.json'));
const vega = await import(req.resolve('vega'));
const vl = await import(req.resolve('vega-lite'));
import type { Lang, Point } from './data';

export const C = {
  text: '#24292E',
  muted: '#5D636B',
  grid: '#E8ECEF',
  accent: '#2C6E76', // teal-strong: 5.8:1 on white, so the direct label can be text-sized
  context: '#868D95', // 3.3:1 on white: the lightest grey a meaningful mark may use (WCAG 1.4.11)
};

const locales = {
  pl: {
    number: { decimal: ',', thousands: ' ', grouping: [3], currency: ['', ' zł'] },
    time: {
      dateTime: '%A, %e %B %Y, %X', date: '%d.%m.%Y', time: '%H:%M:%S', periods: ['', ''],
      days: ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'],
      shortDays: ['nie', 'pon', 'wto', 'śro', 'czw', 'pią', 'sob'],
      months: ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'],
      shortMonths: ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'],
    },
  },
  en: {
    number: { decimal: '.', thousands: ',', grouping: [3], currency: ['£', ''] },
    time: {
      dateTime: '%a %e %b %X %Y', date: '%d/%m/%Y', time: '%H:%M:%S', periods: ['AM', 'PM'],
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    },
  },
};

export type Series = { label: string; role: 'accent' | 'context'; points: Point[]; step?: boolean };

export type LineOpts = {
  series: Series[];
  lang: Lang;
  width: number;
  height: number;
  monthly?: boolean;
  yFormat?: string; // d3 format, e.g. '.1f' or ',.1~s'
  ySuffix?: string; // '%' etc., appended in labelExpr
  zero?: boolean; // levels start at zero (rule 8)
  compact?: boolean; // small multiples: fewer ticks
};

/** The Vega-Lite spec. Exported so reviewers can see what the site would ship (specs/*.vl.json). */
export function lineSpec(o: LineOpts): any {
  const rows = o.series.flatMap((s, si) =>
    s.points.map((p, i) => ({
      s: s.label, role: s.role, si, t: p.t, v: p.v,
      ill: !!p.illustrative,
      // the first real point also closes the dashed (illustrative) segment
      joint: !p.illustrative && i > 0 && !!s.points[i - 1].illustrative,
      prelim: !!p.preliminary,
      last: i === s.points.length - 1,
    })),
  );
  const color = { field: 'role', type: 'nominal', scale: { domain: ['accent', 'context'], range: [C.accent, C.context] }, legend: null };
  const x = {
    field: 't', type: 'temporal', title: null,
    axis: {
      format: o.monthly ? '%b %Y' : '%Y', labelColor: C.muted, tickColor: C.grid, domainColor: C.muted,
      tickCount: o.monthly ? (o.compact ? 3 : 4) : { interval: 'year', step: 1 }, labelFlush: true, grid: false, labelFontSize: o.compact ? 11 : 12,
    },
  };
  const y = {
    field: 'v', type: 'quantitative', title: null,
    scale: { zero: !!o.zero, nice: true },
    axis: {
      format: o.yFormat ?? '.1f', labelColor: C.muted, gridColor: C.grid, domain: false, ticks: false,
      tickCount: o.compact ? 3 : 5, labelPadding: 6, labelFontSize: o.compact ? 11 : 12,
      ...(o.ySuffix ? { labelExpr: `datum.label + '${o.ySuffix}'` } : {}),
    },
  };
  const interp = { mark: { type: 'line', strokeWidth: 2.25, interpolate: 'linear' as string } };
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
    width: o.width, height: o.height, padding: { left: 0, right: 0, top: 8, bottom: 0 },
    data: { values: rows },
    config: {
      font: 'Plus Jakarta Sans', view: { stroke: null },
      axis: { labelFont: 'Inter Variable, Plus Jakarta Sans, sans-serif' },
    },
    encoding: { x, y, color },
    layer: [
      { transform: [{ filter: 'datum.ill || datum.joint' }], mark: { type: 'line', strokeWidth: 1.5, strokeDash: [3, 3], opacity: 0.7 }, encoding: { detail: { field: 's' } } },
      { transform: [{ filter: '!datum.ill' }], ...interp, encoding: { detail: { field: 's' }, strokeWidth: { condition: { test: "datum.role === 'context'", value: 1.75 }, value: 2.5 } } },
      { transform: [{ filter: 'datum.last' }], mark: { type: 'point', filled: false, size: 46, opacity: 1, strokeWidth: 2 }, encoding: { fill: { condition: [{ test: 'datum.prelim', value: 'white' }, { test: "datum.role === 'accent'", value: C.accent }], value: C.context } } },
      {
        transform: [{ filter: 'datum.last' }, { calculate: `datum.s + '  ' + format(datum.v, '${o.yFormat ?? '.1f'}') + '${o.ySuffix ?? ''}'`, as: 'lab' }],
        mark: { type: 'text', align: 'left', dx: 8, fontSize: o.compact ? 11.5 : 13, fontWeight: 600, font: 'Plus Jakarta Sans' },
        encoding: { text: { field: 'lab' }, color: { condition: { test: "datum.role === 'accent'", value: C.accent }, value: C.muted } },
      },
    ],
  };
}

export async function svg(spec: any, lang: Lang): Promise<string> {
  const view = new vega.View(vega.parse(vl.compile(spec).spec), { renderer: 'none', locale: locales[lang] } as any);
  const out = await view.toSVG();
  view.finalize();
  // make it scale with its box; the SVG keeps its own aspect ratio
  return out
    .replace(/<svg ([^>]*?)width="(\d+)" height="(\d+)"/, (_m, a, w, h) => `<svg ${a}width="${w}" height="${h}" style="max-width:100%;height:auto" role="img" aria-hidden="true" focusable="false"`)
    .replace(/<rect width="\d+" height="\d+" fill="white"[^>]*><\/rect>/, '');
}

/** Two renders, one per breakpoint, so axis text stays 11–13 px at 390 and 1440 px. */
export async function responsive(o: Omit<LineOpts, 'width' | 'height'>, d: [number, number], m: [number, number]) {
  const dSpec = lineSpec({ ...o, width: d[0], height: d[1], compact: o.compact ?? d[1] < 200 });
  const mSpec = lineSpec({ ...o, width: m[0], height: m[1], compact: true });
  return {
    spec: dSpec,
    html: `<div class="chart chart-d">${await svg(dSpec, o.lang)}</div><div class="chart chart-m">${await svg(mSpec, o.lang)}</div>`,
  };
}
