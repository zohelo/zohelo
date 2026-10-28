// Number formatting for zohelo pages: Polish and English conventions, one place.

export type Locale = 'pl' | 'en';
export type FormatOptions = { decimals?: number };
export type Direction = 'up' | 'down' | 'flat';

const DASH = '–';

function formatter(locale: Locale, decimals: number | undefined, signDisplay?: 'exceptZero') {
  // useGrouping 'always' (ES2023 typings) groups 4-digit numbers in Polish too: '1 234'.
  const options = {
    minimumFractionDigits: decimals ?? 0,
    maximumFractionDigits: decimals ?? 2,
    useGrouping: 'always',
    signDisplay,
  } as unknown as Intl.NumberFormatOptions;
  return new Intl.NumberFormat(locale === 'pl' ? 'pl-PL' : 'en-GB', options);
}

/** 12345.6 → '12 345,6' (pl) or '12,345.6' (en); null or NaN → '–'. */
export function formatNumber(value: number | null | undefined, locale: Locale, options: FormatOptions = {}): string {
  if (value === null || value === undefined || Number.isNaN(value)) return DASH;
  // Polish groups with a no-break space; a plain space keeps copy and tests predictable.
  return formatter(locale, options.decimals).format(value).replace(/[  ]/g, ' ').replace('−', '-');
}

/** A change with its sign and direction: 1.5 → { text: '+1,5', direction: 'up' }. */
export function formatDelta(
  value: number | null | undefined,
  locale: Locale,
  options: FormatOptions = {},
): { text: string; direction: Direction } {
  if (value === null || value === undefined || Number.isNaN(value)) return { text: DASH, direction: 'flat' };
  const text = formatter(locale, options.decimals, 'exceptZero')
    .format(value)
    .replace(/[  ]/g, ' ')
    .replace('−', '-');
  const rounded = Number(value.toFixed(options.decimals ?? 2));
  return { text, direction: rounded > 0 ? 'up' : rounded < 0 ? 'down' : 'flat' };
}
