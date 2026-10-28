import type { ReactNode } from 'react';

export type CalloutTone = 'info' | 'warn' | 'danger';
export type CalloutProps = { tone: CalloutTone; children: ReactNode };

const border: Record<CalloutTone, string> = {
  info: 'border-l-brand-azure',
  warn: 'border-l-warn',
  danger: 'border-l-danger',
};

/** A note set apart by a left border in the tone's colour; no icon. */
export function Callout({ tone, children }: CalloutProps) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'note'}
      className={`rounded-sm border border-border border-l-4 ${border[tone]} bg-surface-2 px-4 py-3 text-text`}
    >
      {children}
    </div>
  );
}
