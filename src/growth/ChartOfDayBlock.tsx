import { Card, formatDelta, SourceFooter } from '@zohelo/design';
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

export function ChartOfDayBlock({ pick, sourceName, date, locale, children }: ChartOfDayBlockProps) {
  const d = formatDelta(pick.change_pct, locale, { decimals: 1 });
  return (
    <Card title={locale === 'pl' ? 'Wykres dnia' : 'Chart of the day'}>
      <p className="font-display text-[length:var(--z-size-xl)] text-text">
        {locale === 'pl' ? pick.headline_pl : pick.headline_en}
      </p>
      <p className="z-figures mt-1 text-text-muted">{`${d.text} %`}</p>
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
