import type { Locale } from '../format';

export type FreshnessBadgeProps = { date: string; locale: Locale };

/** 'dane z 2026-10-01' / 'data as of 2026-10-01' for an ISO date or timestamp. */
export function FreshnessBadge({ date, locale }: FreshnessBadgeProps) {
  const day = date.slice(0, 10);
  return (
    <span className="inline-flex items-center rounded-sm border border-border bg-surface-2 px-2 py-0.5 font-ui text-[length:var(--z-size-xs)] text-text-muted">
      <time dateTime={day}>{locale === 'pl' ? `dane z ${day}` : `data as of ${day}`}</time>
    </span>
  );
}
