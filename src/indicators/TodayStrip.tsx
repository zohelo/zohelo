import { KpiTile } from '@zohelo/design';
import { localizedPath, type Locale } from '../i18n';

/** One headline KPI on the home page's today strip; latestTile() output maps onto these fields. */
export type TodayTile = {
  kpi_key: string;
  label: string;
  value: number | null;
  unit: string;
  delta: number | null;
  period: string;
  provisional: boolean;
};

const heading: Record<Locale, string> = { pl: 'Dziś w danych', en: 'Today in data' };
const provisionalNote: Record<Locale, string> = { pl: 'dane wstępne', en: 'provisional' };

/** Up to six headline KPIs as tiles linking to their indicator pages, in input order; nothing when empty. */
export function TodayStrip({ tiles, locale }: { tiles: TodayTile[]; locale: Locale }) {
  if (tiles.length === 0) return null;
  return (
    <section aria-labelledby="today-strip" className="mx-auto max-w-6xl px-4 py-8">
      <h2 id="today-strip" className="mb-4 font-display text-[length:var(--z-size-xl)] text-text">
        {heading[locale]}
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {tiles.slice(0, 6).map((tile) => (
          <KpiTile
            key={tile.kpi_key}
            label={tile.label}
            value={tile.value}
            unit={tile.unit}
            delta={tile.delta}
            locale={locale}
            href={localizedPath(`/indicators/${tile.kpi_key}`, locale)}
            period={tile.provisional ? `${tile.period}, ${provisionalNote[locale]}` : tile.period}
          />
        ))}
      </div>
    </section>
  );
}
