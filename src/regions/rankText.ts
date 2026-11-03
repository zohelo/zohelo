import type { Locale } from '../i18n';

// How a voivodeship's rank is written (zohelo#413): only against all 16 voivodeships, with the direction
// at the ends, so "1. miejsce z 1" never appears and "1." is never read as "best".

export const VOIVODESHIPS = 16;

/**
 * '1. miejsce z 16 (najwyższa wartość)' / 'rank 1 of 16 (highest value)'; the last rank says
 * 'najniższa wartość' / 'lowest value'. Null when fewer than 16 voivodeships have a value.
 */
export function rankText(rank: number, of: number, locale: Locale): string | null {
  if (of < VOIVODESHIPS) return null;
  const end = rank === 1 ? 'top' : rank === of ? 'bottom' : null;
  if (locale === 'pl') {
    const note = end === 'top' ? ' (najwyższa wartość)' : end === 'bottom' ? ' (najniższa wartość)' : '';
    return `${rank}. miejsce z ${of}${note}`;
  }
  const note = end === 'top' ? ' (highest value)' : end === 'bottom' ? ' (lowest value)' : '';
  return `rank ${rank} of ${of}${note}`;
}

/** Spotlight list titles that name the measure; the PL adjective agrees with the KPI's noun. */
const PL_TITLES: Record<string, { top: string; bottom: string }> = {
  unemployment_rate: { top: 'Najwyższa stopa bezrobocia (BAEL)', bottom: 'Najniższa stopa bezrobocia (BAEL)' },
};

/**
 * 'Najwyższa stopa bezrobocia (BAEL), 2025' / 'Highest unemployment rate (LFS), 2025'. A KPI without a
 * PL title falls back to 'Najwyższe wartości: <name>, <period>'.
 */
export function spotlightTitles(kpiKey: string, name: string, period: string, locale: Locale) {
  if (locale === 'en') {
    const lower = name.charAt(0).toLowerCase() + name.slice(1);
    return { top: `Highest ${lower}, ${period}`, bottom: `Lowest ${lower}, ${period}` };
  }
  const t = PL_TITLES[kpiKey];
  return t
    ? { top: `${t.top}, ${period}`, bottom: `${t.bottom}, ${period}` }
    : { top: `Najwyższe wartości: ${name}, ${period}`, bottom: `Najniższe wartości: ${name}, ${period}` };
}
