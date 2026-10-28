// Client-only (React Router .client module): vega's Node build needs the optional 'canvas'
// package, so the chart must stay out of the server (pre-render) bundle.
import { Chart, lineSpec, type Theme } from '@zohelo/design/visuals';

const sample = Array.from({ length: 12 }, (_, i) => ({
  month: `2025-${String(i + 1).padStart(2, '0')}-01`,
  value: [5.4, 5.3, 5.3, 5.1, 5.0, 5.0, 4.9, 5.0, 5.1, 5.0, 4.9, 4.8][i],
  series: 'PL',
}));
const buildLine = (_theme: Theme) => lineSpec(sample, { x: 'month', y: 'value', series: 'series', yTitle: '%' });

export function SampleChart() {
  return <Chart build={buildLine} label="Sample line chart, 12 monthly points" />;
}
