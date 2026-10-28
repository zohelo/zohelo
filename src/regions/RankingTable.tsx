import { DataTable, formatNumber, type DataTableColumn } from '@zohelo/design';
import type { Locale } from '../i18n';
import type { GeoCollection } from '../published';
import type { RegionRanking } from './ranking';

// The voivodeship ranking of one KPI as a sortable table, with the national value under it.
// published.ts reads files with node:fs, so only its types are imported here.

export type RankingRow = { rank: number; region: string; value: number; note: string };

const labels: Record<
  Locale,
  { caption: string; region: string; value: (unit: string) => string; note: string; provisional: string; national: string }
> = {
  pl: {
    caption: 'Ranking województw',
    region: 'Województwo',
    value: (unit) => `Wartość (${unit})`,
    note: 'Uwagi',
    provisional: 'dane wstępne',
    national: 'Polska',
  },
  en: {
    caption: 'Voivodeship ranking',
    region: 'Voivodeship',
    value: (unit) => `Value (${unit})`,
    note: 'Notes',
    provisional: 'provisional',
    national: 'Poland',
  },
};

/** Table rows: region names from the GeoJSON in the page language, the key when a region is unknown. */
export function rankingRows(ranking: RegionRanking, geo: GeoCollection, locale: Locale): RankingRow[] {
  const names = new Map(geo.features.map((f) => [f.properties.geography_key, f.properties]));
  return ranking.regions.map((r) => {
    const props = names.get(r.geography_key);
    return {
      rank: r.rank,
      region: props ? (locale === 'pl' ? props.name_pl : props.name_en) : r.geography_key,
      value: r.value,
      note: r.provisional ? labels[locale].provisional : '',
    };
  });
}

export type RankingTableProps = { ranking: RegionRanking; geo: GeoCollection; unit: string; locale: Locale };

export function RankingTable({ ranking, geo, unit, locale }: RankingTableProps) {
  const t = labels[locale];
  const columns: DataTableColumn<RankingRow>[] = [
    { key: 'rank', label: '#' },
    { key: 'region', label: t.region },
    { key: 'value', label: t.value(unit), align: 'right', format: (v) => formatNumber(v as number, locale) },
    { key: 'note', label: t.note },
  ];
  return (
    <div>
      <DataTable columns={columns} rows={rankingRows(ranking, geo, locale)} sortable caption={t.caption} />
      {ranking.national !== null ? (
        <p className="mt-2 font-ui text-text-muted">{`${t.national}: ${formatNumber(ranking.national, locale)} ${unit}`}</p>
      ) : null}
    </div>
  );
}
