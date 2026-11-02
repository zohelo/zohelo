import { formatNumber } from '@zohelo/design';
import type { Locale } from '../i18n';

// The meta description of an indicator page: the latest value with its unit and period, then the sources.

/**
 * The takeaway sentence of an indicator page, without a final dot: 'Stopa bezrobocia (BAEL): 3,2 % (2025)';
 * without a value 'X: najnowsze dane i źródła'. The chart's heading, aria-label and table caption (#389),
 * and the first sentence of the meta description.
 */
export function indicatorTakeaway(name: string, tile: { value: number | null; unit: string; period: string }, locale: Locale): string {
  return tile.value !== null && tile.period !== ''
    ? `${name}: ${formatNumber(tile.value, locale)} ${tile.unit} (${tile.period})`
    : locale === 'pl'
      ? `${name}: najnowsze dane i źródła`
      : `${name}: latest data and sources`;
}

/** 'Stopa bezrobocia (BAEL): 3,2 % (2025). Źródła: Eurostat.'; without a value 'X: najnowsze dane i źródła.' */
export function indicatorDescription(
  name: string,
  tile: { value: number | null; unit: string; period: string },
  sourceNames: string[],
  locale: Locale,
): string {
  const head = `${indicatorTakeaway(name, tile, locale)}.`;
  if (sourceNames.length === 0) return head;
  return `${head} ${locale === 'pl' ? 'Źródła' : 'Sources'}: ${sourceNames.join(', ')}.`;
}
