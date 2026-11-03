import { KpiTile } from '@zohelo/design';
import { localizedPath, type Locale } from '../i18n';
import { CONTAINER } from '../components/container';

/** One headline KPI on the home page's today strip; latestTile() output maps onto these fields. */
export type TodayTile = {
  kpi_key: string;
  label: string;
  value: number | null;
  unit: string;
  delta: number | null;
  /** The period in words, with the provisional note when flagged (home.ts cardTile). */
  period: string;
  provisional: boolean;
  /** 'vs sierpień 2026'; KpiTile's default when absent. */
  comparison?: string;
  goodDirection?: 'up' | 'down';
  /** Benchmark verdict and source name, in order. */
  notes?: string[];
};

// As many columns as tiles at lg, so the row is full (#387); Tailwind needs the literal classes.
const columns = ['', 'lg:grid-cols-1', 'lg:grid-cols-2', 'lg:grid-cols-3', 'lg:grid-cols-4', 'lg:grid-cols-5', 'lg:grid-cols-6'];

const heading: Record<Locale, string> = { pl: 'Dziś w danych', en: 'Today in data' };

/** Up to six headline KPIs as tiles linking to their indicator pages, in input order; nothing when empty. */
export function TodayStrip({ tiles, locale }: { tiles: TodayTile[]; locale: Locale }) {
  if (tiles.length === 0) return null;
  return (
    <section aria-labelledby="today-strip" className={`${CONTAINER} py-8`}>
      <h2 id="today-strip" className="mb-4 font-display text-[length:var(--z-size-xl)] text-text">
        {heading[locale]}
      </h2>
      <div className={`grid grid-cols-2 gap-4 sm:grid-cols-2 ${columns[Math.min(tiles.length, 6)]}`}>
        {tiles.slice(0, 6).map((tile) => (
          <KpiTile
            key={tile.kpi_key}
            label={tile.label}
            value={tile.value}
            unit={tile.unit}
            delta={tile.delta}
            locale={locale}
            href={localizedPath(`/indicators/${tile.kpi_key}`, locale)}
            period={tile.period}
            comparison={tile.comparison}
            goodDirection={tile.goodDirection}
            notes={tile.notes}
          />
        ))}
      </div>
    </section>
  );
}
