import type { ReactNode } from 'react';
import { localizedPath, type Locale } from '../i18n';
import { regionPath } from './profile';
import { spotlightTitles, VOIVODESHIPS } from './rankText';
import { CONTAINER } from '../components/container';

// The home regional spotlight: the highest and lowest voivodeships of one KPI, linking to their profiles.

export type SpotRow = { teryt: string; name: string; value: number; rank: number };

export type SpotlightData = {
  kpi_key: string;
  name: string;
  unit: string;
  period: string;
  /** Voivodeships with a value; ranks are shown only when all 16 have one (zohelo#413). Default 16. */
  of?: number;
  top: SpotRow[];
  bottom: SpotRow[];
};

const texts = {
  pl: { heading: 'Regiony', map: 'Mapa wszystkich województw' },
  en: { heading: 'Regions', map: 'Map of all voivodeships' },
};

const numberLocale: Record<Locale, string> = { pl: 'pl-PL', en: 'en-GB' };

export function HomeSpotlight({
  data,
  locale,
  children,
}: {
  data: SpotlightData | null;
  locale: Locale;
  children?: ReactNode;
}) {
  if (!data) return null;
  const t = texts[locale];
  // The list titles name the measure and its direction (zohelo#413): "Najwyżej" alone read as "best".
  const titles = spotlightTitles(data.kpi_key, data.name, data.period, locale);
  const ranked = (data.of ?? VOIVODESHIPS) >= VOIVODESHIPS;
  const format = new Intl.NumberFormat(numberLocale[locale]);
  const list = (rows: SpotRow[]) => (
    <ol className={`mt-2 space-y-1${ranked ? '' : ' list-none'}`}>
      {rows.map((row) => (
        <li key={row.teryt}>
          {ranked ? `${row.rank}. ` : null}
          <a href={regionPath(row.teryt, locale)} className="text-brand-teal underline">
            {row.name}
          </a>{' '}
          <span className="z-figures">{`${format.format(row.value)} ${data.unit}`}</span>
        </li>
      ))}
    </ol>
  );
  return (
    <section aria-labelledby="spotlight" className={`${CONTAINER} py-8`}>
      <h2 id="spotlight" className="mb-4 font-display text-[length:var(--z-size-xl)] text-text">
        {`${t.heading}: ${data.name} (${data.period})`}
      </h2>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="font-ui font-semibold text-text">{titles.top}</h3>
          {list(data.top)}
        </div>
        {data.bottom.length > 0 ? (
          <div>
            <h3 className="font-ui font-semibold text-text">{titles.bottom}</h3>
            {list(data.bottom)}
          </div>
        ) : null}
      </div>
      {children !== null && children !== undefined ? <div className="mt-6 min-h-[300px]">{children}</div> : null}
      <p className="mt-4">
        <a href={localizedPath('/regions', locale)} className="text-brand-teal underline">
          {t.map}
        </a>
      </p>
    </section>
  );
}
