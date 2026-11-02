import { formatCompact, formatDelta, formatNumber, type Direction, type Locale } from '../format';

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
  /** Levels in compact notation ('37,5 mln os.'); the exact value stays in the title. Default true. */
  compact?: boolean;
};

const RATE_UNITS = new Set(['%', 'p.p.', 'pp', 'pkt', 'pkt.', 'index']);

/** The value as the tile shows it: compact for levels (number rules 9–10), in full for rates and when compact is off. */
export function tileValue(value: number | null, unit: string, locale: Locale, compact: boolean, decimals?: number) {
  const text = formatNumber(value, locale, { decimals });
  const full = `${text} ${unit}`.trim();
  if (!compact || RATE_UNITS.has(unit.trim())) return { text, unit, full, compacted: false };
  const c = formatCompact(value, unit, locale);
  return { text: c.text, unit: c.unit, full, compacted: c.text !== text };
}

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
export function KpiTile({ label, value, unit, delta, period, locale, href, goodDirection, decimals, compact = true }: KpiTileProps) {
  const d = delta === undefined ? null : formatDelta(delta, locale, { decimals });
  // Every tile has one value size: long levels are written compactly ('37,5 mln') instead of stepping
  // down a size (zohelo#387, replaces the #357 rule); the exact value is the title.
  const v = tileValue(value, unit, locale, compact, decimals);
  const body = (
    <>
      <div className="font-ui text-[length:var(--z-size-sm)] text-text-muted">{label}</div>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-1 text-text" title={v.compacted ? v.full : undefined}>
        <span className="z-figures whitespace-nowrap text-[length:var(--z-size-2xl)] font-semibold">{v.text}</span>
        <span className="font-ui text-[length:var(--z-size-sm)] text-text-muted">{v.unit}</span>
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
  const box = 'block min-w-0 rounded-lg border border-border bg-surface p-4 shadow-[var(--z-shadow-card)]';
  return href ? (
    <a href={href} className={`${box} hover:border-brand-teal focus-visible:outline-2 focus-visible:outline-focus`}>
      {body}
    </a>
  ) : (
    <div className={box}>{body}</div>
  );
}
