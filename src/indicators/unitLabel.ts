import type { Locale } from '../i18n';
import type { Unit } from '../published';

// The unit shown next to a value, in the page language; never a raw unit_key (Bug #357).
// The catalogue has one symbol per unit, written for Polish ('os.', 'zł'); English pages replace those.

const enSymbol: Record<string, string> = { 'os.': 'persons', zł: 'PLN', 'tys.': 'thousand', mld: 'bn' };

// Units missing from the catalogue (e.g. 'mln_eur'): scale word plus an upper-case currency or code.
const scale: Record<string, Record<Locale, string>> = {
  tys: { pl: 'tys.', en: 'thousand' },
  mln: { pl: 'mln', en: 'mln' },
  mld: { pl: 'mld', en: 'bn' },
  pct: { pl: '%', en: '%' },
};

/** 'persons' → 'os.' (pl) / 'persons' (en); 'mln_eur' (not in the catalogue) → 'mln EUR'. */
export function unitLabel(units: Unit[], unitKey: string, locale: Locale): string {
  const unit = units.find((u) => u.unit_key === unitKey);
  if (unit) return locale === 'en' ? (enSymbol[unit.symbol] ?? unit.symbol) : unit.symbol;
  return unitKey
    .split('_')
    .filter(Boolean)
    .map((part) => scale[part]?.[locale] ?? part.toUpperCase())
    .join(' ');
}
