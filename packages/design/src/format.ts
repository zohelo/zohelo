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

const MINUS = '\u2212';

/** Units whose changes are percentage points, not relative: '%', 'p.p.', index points. */
export function isRateUnit(unit: string): boolean {
  const u = unit.trim().toLowerCase();
  return u === '%' || u === 'p.p.' || u === 'pp' || u === 'pkt' || u === 'pkt.' || u === 'index' || u.startsWith('% ');
}

const pointsUnit: Record<Locale, string> = { pl: 'p.p.', en: 'pp' };

/**
 * A change of a KPI with its unit (number rules, zohelo#388): for a rate the change in percentage points
 * ('−0,1 p.p.' / '−0.1 pp'), for a level in the unit, compact from 100 000 ('+95 mld EUR'); the minus is the
 * typographic minus. `unit` is the value's unit as shown ('%', 'mln EUR', 'os.').
 */
export function formatChange(
  value: number | null | undefined,
  unit: string,
  locale: Locale,
  options: FormatOptions = {},
): { text: string; direction: Direction } {
  const d = formatDelta(value, locale, options);
  if (d.text === DASH) return d;
  const sign = d.text.startsWith('-') ? MINUS : d.text.startsWith('+') ? '+' : '';
  if (isRateUnit(unit)) return { text: `${sign}${d.text.replace(/^[-+]/, '')} ${pointsUnit[locale]}`, direction: d.direction };
  const c = formatCompact(value, unit, locale);
  const number = c.text.startsWith('-') ? c.text.slice(1) : c.text;
  return { text: `${sign}${number}${c.unit ? ` ${c.unit}` : ''}`, direction: d.direction };
}

/**
 * A date per locale, never an ISO string: '2026-01-01T00:00:00Z' or '2026-01-01' → '1 sty 2026' (pl) /
 * '1 Jan 2026' (en). Anything that is not a calendar date (a period '2026-09', '2025', '') comes back as is.
 */
export function formatDate(value: string, locale: Locale): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!m) return value;
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === 'pl' ? 'pl-PL' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
    .format(date)
    .replace(/[\u00a0\u202f]/g, ' ')
    .replace(/\.$/, '');
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

// Scale words a unit label may start with ('mln EUR', 'tys. os.', 'billion EUR'): the value is in that
// multiple of the unit that follows. Polish and English words from unitLabel() and the catalogue.
const SCALE: Record<string, number> = {
  'tys.': 1e3,
  thousand: 1e3,
  mln: 1e6,
  million: 1e6,
  mld: 1e9,
  bn: 1e9,
  billion: 1e9,
  bln: 1e12,
  trillion: 1e12,
};

/** Compact notation starts here: '12 345 os.' stays, '37 490 000 os.' becomes '37,5 mln os.'. */
export const COMPACT_FROM = 1e5;

/**
 * A level in compact notation per locale (number rules 9–10): 37490000 'os.' → '37,5 mln' + 'os.' (pl),
 * '37.5 million' + 'persons' (en); 845000 'mln EUR' → '845 mld' + 'EUR'. A scale word at the start of the
 * unit is folded into the value and dropped from the unit. Values below COMPACT_FROM (after the scale) and
 * rates keep formatNumber(); the caller decides what is a level (unit not '%', 'p.p.' or an index).
 */
export function formatCompact(
  value: number | null | undefined,
  unit: string,
  locale: Locale,
): { text: string; unit: string } {
  if (value === null || value === undefined || Number.isNaN(value)) return { text: DASH, unit };
  const [first, ...rest] = unit.trim().split(/\s+/);
  const scale = first && first in SCALE ? SCALE[first] : 1;
  const scaled = value * scale;
  if (Math.abs(scaled) < COMPACT_FROM) return { text: formatNumber(value, locale), unit };
  const text = new Intl.NumberFormat(locale === 'pl' ? 'pl-PL' : 'en-GB', {
    notation: 'compact',
    compactDisplay: locale === 'pl' ? 'short' : 'long',
    maximumFractionDigits: 1,
  })
    .format(scaled)
    .replace(/[\u00a0\u202f]/g, ' ')
    .replace('−', '-');
  return { text, unit: scale === 1 ? unit : rest.join(' ') };
}
