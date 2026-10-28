import type { ReactNode } from 'react';

export type CardProps = { title?: ReactNode; children: ReactNode; className?: string };

/** A surface panel: large radius, border token and the card shadow (none in dark mode). */
export function Card({ title, children, className }: CardProps) {
  return (
    <section
      className={[
        'rounded-lg border border-border bg-surface p-6 text-text shadow-[var(--z-shadow-card)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {title ? <h3 className="mb-3 font-ui text-[length:var(--z-size-lg)] font-semibold">{title}</h3> : null}
      {children}
    </section>
  );
}
