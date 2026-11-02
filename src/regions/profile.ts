// Helpers for the /regions/<teryt> profile pages: TERYT codes of the 16 voivodeships, their
// geography keys ('TERC:<code>', zohelo-data docs/published.md) and the region's row in each KPI
// ranking. Pure: computed at build, never mutates its input.
import { localizedPath, type Locale } from '../i18n';
import type { GeoCollection } from '../published';
import type { RegionRanking } from './ranking';

export const VOIVODESHIP_TERYT = [
  '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22', '24', '26', '28', '30', '32',
] as const;

/** Polish names by TERYT, used when the geo file has no feature for the region. */
export const VOIVODESHIP_NAMES: Record<string, string> = {
  '02': 'Dolnośląskie',
  '04': 'Kujawsko-pomorskie',
  '06': 'Lubelskie',
  '08': 'Lubuskie',
  '10': 'Łódzkie',
  '12': 'Małopolskie',
  '14': 'Mazowieckie',
  '16': 'Opolskie',
  '18': 'Podkarpackie',
  '20': 'Podlaskie',
  '22': 'Pomorskie',
  '24': 'Śląskie',
  '26': 'Świętokrzyskie',
  '28': 'Warmińsko-mazurskie',
  '30': 'Wielkopolskie',
  '32': 'Zachodniopomorskie',
};

export function geographyKeyOf(teryt: string): string {
  return `TERC:${teryt}`;
}

/** The voivodeship TERYT code of a geography key, or null for anything that is not a voivodeship. */
export function terytOf(geographyKey: string): string | null {
  if (!geographyKey.startsWith('TERC:')) return null;
  const code = geographyKey.slice('TERC:'.length);
  return (VOIVODESHIP_TERYT as readonly string[]).includes(code) ? code : null;
}

// Land borders between voivodeships (TERYT codes); fixed, not computed from geometry.
export const VOIVODESHIP_NEIGHBOURS: Record<string, readonly string[]> = {
  '02': ['08', '16', '30'],
  '04': ['10', '14', '22', '28', '30'],
  '06': ['14', '18', '20', '26'],
  '08': ['02', '30', '32'],
  '10': ['04', '14', '16', '24', '26', '30'],
  '12': ['18', '24', '26'],
  '14': ['04', '06', '10', '20', '26', '28'],
  '16': ['02', '10', '24', '30'],
  '18': ['06', '12', '26'],
  '20': ['06', '14', '28'],
  '22': ['04', '28', '30', '32'],
  '24': ['10', '12', '16', '26'],
  '26': ['06', '10', '12', '14', '18', '24'],
  '28': ['04', '14', '20', '22'],
  '30': ['02', '04', '08', '10', '16', '22', '32'],
  '32': ['08', '22', '30'],
};

/** The neighbouring voivodeships of a TERYT code (a copy), or [] for an unknown code. */
export function neighbours(teryt: string): string[] {
  return [...(VOIVODESHIP_NEIGHBOURS[teryt] ?? [])];
}

/** The region's name from its geo feature in the locale, else VOIVODESHIP_NAMES. */
export function regionName(geo: GeoCollection, teryt: string, locale: Locale): string {
  const key = geographyKeyOf(teryt);
  const props = geo.features.find((f) => f.properties.geography_key === key)?.properties;
  if (props) return locale === 'pl' ? props.name_pl : props.name_en;
  return VOIVODESHIP_NAMES[teryt];
}

export function regionPath(teryt: string, locale: Locale): string {
  return localizedPath(`/regions/${teryt}`, locale);
}

export type ProfileRow = {
  kpi_key: string;
  source_key: string;
  period: string;
  value: number;
  rank: number;
  of: number;
  national: number | null;
  provisional: boolean;
};

/** One row per ranking that includes the region, in input order; rankings without it are skipped. */
export function regionProfile(geographyKey: string, rankings: RegionRanking[]): ProfileRow[] {
  const rows: ProfileRow[] = [];
  for (const ranking of rankings) {
    const region = ranking.regions.find((r) => r.geography_key === geographyKey);
    if (!region) continue;
    rows.push({
      kpi_key: ranking.kpi_key,
      source_key: ranking.source_key,
      period: ranking.period,
      value: region.value,
      rank: region.rank,
      of: ranking.regions.length,
      national: ranking.national,
      provisional: region.provisional,
    });
  }
  return rows;
}
