import { formatDelta, formatNumber, type Direction, type Locale } from '../format';

export type KpiTileProps = {
  label: string;
  value: number | null;
  unit: string;
  delta?: number | null;
  period: string;
  locale: Locale;
  href?: string;
  /** When given, a delta in this direction is shown in the ok colour and the opposite in danger. */
  goodDirection?: 'up' | 'down';
  decimals?: number;
};

const arrow: Record<Direction, string> = { up: '▲', down: '▼', flat: '' };
const words: Record<Locale, Record<Direction, string>> = {
  pl: { up: 'wzrost', down: 'spadek', flat: 'bez zmian' },
  en: { up: 'up', down: 'down', flat: 'no change' },
};

function deltaColour(direction: Direction, good?: 'up' | 'down') {
  if (!good || direction === 'flat') return 'text-text-muted';
  return direction === good ? 'text-ok' : 'text-danger';
}

/** One headline figure with its unit, period and change; direction is told by arrow and text, never colour alone. */
export function KpiTile({ label, value, unit, delta, period, locale, href, goodDirection, decimals }: KpiTileProps) {
  const d = delta === undefined ? null : formatDelta(delta, locale, { decimals });
  const body = (
    <>
      <div className="font-ui text-[length:var(--z-size-sm)] text-text-muted">{label}</div>
      <div className="mt-1 flex items-baseline gap-1 text-text">
        <span className="z-figures text-[length:var(--z-size-2xl)] font-semibold">{formatNumber(value, locale, { decimals })}</span>
        <span className="font-ui text-[length:var(--z-size-sm)] text-text-muted">{unit}</span>
      </div>
      {d ? (
        <div className={`z-figures mt-1 text-[length:var(--z-size-sm)] ${deltaColour(d.direction, goodDirection)}`}>
          {arrow[d.direction] ? <span aria-hidden="true">{arrow[d.direction]} </span> : null}
          {d.text} <span className="font-ui">({words[locale][d.direction]})</span>
        </div>
      ) : null}
      <div className="mt-2 font-ui text-[length:var(--z-size-xs)] text-text-faint">{period}</div>
    </>
  );
  const box = 'block rounded-lg border border-border bg-surface p-4 shadow-[var(--z-shadow-card)]';
  return href ? (
    <a href={href} className={`${box} hover:border-brand-teal focus-visible:outline-2 focus-visible:outline-focus`}>
      {body}
    </a>
  ) : (
    <div className={box}>{body}</div>
  );
}
