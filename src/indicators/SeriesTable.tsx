import { formatNumber } from '@zohelo/design';
import type { Locale } from '../i18n';
import { seriesDecimals, tablePoints, type SeriesPoint } from './series';

// The accessible alternative to the series chart (#389): the points as a <table> behind a
// "Tabela / Table" toggle, server-rendered, so the values are readable without the chart.

const text: Record<Locale, { toggle: string; period: string; value: string; truncated: string }> = {
  pl: { toggle: 'Tabela danych', period: 'Okres', value: 'Wartość', truncated: 'Pierwsze i ostatnie 12 okresów.' },
  en: { toggle: 'Data table', period: 'Period', value: 'Value', truncated: 'First and last 12 periods.' },
};

export function SeriesTable({ points, unit, caption, locale }: { points: SeriesPoint[]; unit: string; caption: string; locale: Locale }) {
  const t = text[locale];
  const { rows, truncated } = tablePoints(points);
  // Every row keeps the series' precision (the source's, capped by unit): a one-decimal rate reads 3,0, not 3
  // (#405); an unrounded WDI rate reads 14,43, not 14,4290 (#408 domain review).
  const decimals = seriesDecimals(points, unit);
  return (
    <details className="mt-3 font-ui text-[length:var(--z-size-sm)] text-text">
      <summary className="cursor-pointer text-brand-teal underline">{t.toggle}</summary>
      <table className="mt-2 border-collapse">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-border">
          <tr>
            <th scope="col" className="py-1 pr-6 text-left font-semibold text-text-muted">{t.period}</th>
            <th scope="col" className="py-1 text-right font-semibold text-text-muted">{`${t.value} (${unit})`}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.period} className="border-b border-border">
              <th scope="row" className="py-1 pr-6 text-left font-normal">{p.period}</th>
              <td className="z-figures py-1 text-right">{formatNumber(p.value, locale, { decimals })}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {truncated ? <p className="mt-1 text-text-faint">{t.truncated}</p> : null}
    </details>
  );
}
