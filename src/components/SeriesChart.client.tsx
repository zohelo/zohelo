// Client-only (React Router .client module, D25): vega's Node build needs the optional 'canvas'
// package, so the chart stays out of the pre-render bundle; the shell renders first, the chart after
// hydration (#389). The style is @zohelo/design's line spec as it is today; it changes with the design
// decision, the presence of the chart does not.
import { Chart, lineSpec, withBand, type Band } from '@zohelo/design/visuals';
import { useCallback } from 'react';
import type { Locale } from '../i18n';
import { seriesDecimals, xTicks, type SeriesPoint } from '../indicators/series';

const seriesName: Record<Locale, string> = { pl: 'Polska', en: 'Poland' };

/** The headline series as a line chart; `label` is the takeaway sentence (the chart's aria-label). */
export function SeriesChart({
  points,
  unit,
  frequency,
  label,
  locale,
  band,
}: {
  points: SeriesPoint[];
  unit: string;
  /** 'A', 'Q', 'M' or 'D': the x ticks follow it (one per year for an annual series). */
  frequency: string;
  label: string;
  locale: Locale;
  /** A target band drawn behind the line ('Cel NBP' 1.5–3.5 for HICP inflation, zohelo#412). */
  band?: Band | null;
}) {
  const build = useCallback(() => {
    const rows = points.map((p) => ({ date: p.date, value: p.value, series: seriesName[locale] }));
    // 3–4 labels on a phone, up to 8 on a desktop; ticks at the series frequency, y in the source's precision.
    const ticks = xTicks(frequency, points, window.innerWidth < 640 ? 4 : 8);
    const spec = lineSpec(rows, {
      x: 'date',
      y: 'value',
      series: 'series',
      yTitle: unit,
      xTicks: { interval: ticks.interval, step: ticks.step },
      xFormat: ticks.format,
      yDecimals: seriesDecimals(points, unit),
      locale,
    });
    return band ? withBand(spec, band) : spec;
  }, [points, unit, frequency, locale, band]);
  return <Chart build={build} label={label} locale={locale} />;
}
