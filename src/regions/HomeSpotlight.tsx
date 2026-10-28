import { localizedPath, type Locale } from '../i18n';
import { regionPath } from './profile';

// The home regional spotlight: the highest and lowest voivodeships of one KPI, linking to their profiles.

export type SpotRow = { teryt: string; name: string; value: number; rank: number };

export type SpotlightData = { kpi_key: string; name: string; unit: string; period: string; top: SpotRow[]; bottom: SpotRow[] };

const texts = {
  pl: { heading: 'Regiony', top: 'Najwyżej', bottom: 'Najniżej', map: 'Mapa wszystkich województw' },
  en: { heading: 'Regions', top: 'Highest', bottom: 'Lowest', map: 'Map of all voivodeships' },
};

const numberLocale: Record<Locale, string> = { pl: 'pl-PL', en: 'en-GB' };

export function HomeSpotlight({ data, locale }: { data: SpotlightData | null; locale: Locale }) {
  if (!data) return null;
  const t = texts[locale];
  const format = new Intl.NumberFormat(numberLocale[locale]);
  const list = (rows: SpotRow[]) => (
    <ol className="mt-2 space-y-1">
      {rows.map((row) => (
        <li key={row.teryt}>
          {`${row.rank}. `}
          <a href={regionPath(row.teryt, locale)} className="text-brand-teal underline">
            {row.name}
          </a>{' '}
          <span className="z-figures">{`${format.format(row.value)} ${data.unit}`}</span>
        </li>
      ))}
    </ol>
  );
  return (
    <section aria-labelledby="spotlight" className="mx-auto max-w-6xl px-4 py-8">
      <h2 id="spotlight" className="mb-4 font-display text-[length:var(--z-size-xl)] text-text">
        {`${t.heading}: ${data.name} (${data.period})`}
      </h2>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="font-ui font-semibold text-text">{t.top}</h3>
          {list(data.top)}
        </div>
        {data.bottom.length > 0 ? (
          <div>
            <h3 className="font-ui font-semibold text-text">{t.bottom}</h3>
            {list(data.bottom)}
          </div>
        ) : null}
      </div>
      <p className="mt-4">
        <a href={localizedPath('/regions', locale)} className="text-brand-teal underline">
          {t.map}
        </a>
      </p>
    </section>
  );
}
