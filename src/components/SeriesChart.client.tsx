// Client-only (React Router .client module, D25): vega's Node build needs the optional 'canvas'
// package, so the chart stays out of the pre-render bundle; the shell renders first, the chart after
// hydration (#389). The style is @zohelo/design's line spec as it is today; it changes with the design
// decision, the presence of the chart does not.
import { Chart, lineSpec } from '@zohelo/design/visuals';
import { useCallback } from 'react';
import type { Locale } from '../i18n';
import type { SeriesPoint } from '../indicators/series';

const seriesName: Record<Locale, string> = { pl: 'Polska', en: 'Poland' };

/** The headline series as a line chart; `label` is the takeaway sentence (the chart's aria-label). */
export function SeriesChart({ points, unit, label, locale }: { points: SeriesPoint[]; unit: string; label: string; locale: Locale }) {
  const build = useCallback(() => {
    const rows = points.map((p) => ({ date: p.date, value: p.value, series: seriesName[locale] }));
    return lineSpec(rows, { x: 'date', y: 'value', series: 'series', yTitle: unit });
  }, [points, unit, locale]);
  return <Chart build={build} label={label} locale={locale} />;
}
