import { Card, formatChange, formatDelta, SourceFooter } from '@zohelo/design';
import type { ReactNode } from 'react';
import { localizedPath, type Locale } from '../i18n';
import type { ChartOfDay } from './chartOfDay';

// The chart-of-the-day home block. The chart itself comes in as children: charts render only
// after hydration from a .client module (D25).

export type ChartOfDayBlockProps = {
  pick: ChartOfDay;
  sourceName: string;
  date: string;
  locale: Locale;
  children?: ReactNode;
};

const previousPeriod: Record<Locale, string> = { pl: 'vs poprzedni okres', en: 'vs previous period' };

export function ChartOfDayBlock({ pick, sourceName, date, locale, children }: ChartOfDayBlockProps) {
  // A rate changes in percentage points, a level relatively (zohelo#388).
  const change = pick.rate
    ? formatChange(pick.change, '%', locale, { decimals: 1 }).text
    : `${formatDelta(pick.change_pct, locale, { decimals: 1 }).text.replace(/^-/, '\u2212')} %`;
  return (
    <Card title={locale === 'pl' ? 'Wykres dnia' : 'Chart of the day'}>
      <p className="font-display text-[length:var(--z-size-xl)] text-text">
        {locale === 'pl' ? pick.headline_pl : pick.headline_en}
      </p>
      <p className="z-figures mt-1 text-text-muted">
        {change} <span className="font-ui text-text-faint">{previousPeriod[locale]}</span>
      </p>
      {children ? <div className="mt-4">{children}</div> : null}
      <SourceFooter sources={[{ name: sourceName }]} date={date} locale={locale} />
      <a
        href={localizedPath(`/indicators/${pick.kpi_key}`, locale)}
        className="mt-3 inline-block font-ui text-brand-teal underline"
      >
        {locale === 'pl' ? 'Zobacz wskaźnik' : 'See the indicator'}
      </a>
    </Card>
  );
}
