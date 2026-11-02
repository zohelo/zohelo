import { formatNumber } from '@zohelo/design';
import type { Locale } from '../i18n';

// The meta description of an indicator page: the latest value with its unit and period, then the sources.

/** 'Stopa bezrobocia (BAEL): 3,2 % (2025). Źródła: Eurostat.'; without a value 'X: najnowsze dane i źródła.' */
export function indicatorDescription(
  name: string,
  tile: { value: number | null; unit: string; period: string },
  sourceNames: string[],
  locale: Locale,
): string {
  const head =
    tile.value !== null && tile.period !== ''
      ? `${name}: ${formatNumber(tile.value, locale)} ${tile.unit} (${tile.period}).`
      : locale === 'pl'
        ? `${name}: najnowsze dane i źródła.`
        : `${name}: latest data and sources.`;
  if (sourceNames.length === 0) return head;
  return `${head} ${locale === 'pl' ? 'Źródła' : 'Sources'}: ${sourceNames.join(', ')}.`;
}
