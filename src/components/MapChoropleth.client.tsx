// Client-only (React Router .client module): vega's Node build needs the optional 'canvas'
// package, so the chart must stay out of the server (pre-render) bundle.
import { Chart } from '@zohelo/design/visuals';
import { useCallback } from 'react';
import type { Locale } from '../i18n';
import { mapSpec, type MapRow } from '../regions/mapSpec';

/** The voivodeship map coloured by one KPI; colours come from the design tokens, read when Chart builds. */
export function MapChoropleth({
  geo,
  rows,
  valueTitle,
  locale,
  label,
}: {
  geo: object;
  rows: MapRow[];
  valueTitle: string;
  label: string;
  locale: Locale;
}) {
  const build = useCallback(() => {
    const css = getComputedStyle(document.documentElement);
    const v = (n: string, f: string) => css.getPropertyValue(n).trim() || f;
    return mapSpec(geo, rows, {
      valueTitle,
      locale,
      colors: [v('--z-color-brand-teal-soft', '#EBF5F6'), v('--z-color-brand-teal-strong', '#2C6E76')],
      noData: v('--z-color-border', '#E2E8F0'),
    });
  }, [geo, rows, valueTitle, locale]);
  return <Chart build={build} label={label} />;
}
