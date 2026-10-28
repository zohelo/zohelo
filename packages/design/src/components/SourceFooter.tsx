import type { Locale } from '../format';

export type Source = { name: string; code?: string; url?: string };
export type SourceFooterProps = {
  sources: Source[];
  /** The data date, e.g. '2026-10-01'. */
  date: string;
  licence?: string;
  locale: Locale;
};

const label: Record<Locale, { source: string; data: string }> = {
  pl: { source: 'Źródło:', data: 'dane z' },
  en: { source: 'Source:', data: 'data as of' },
};

function sourceText({ name, code }: Source) {
  return code ? `${name} (${code})` : name;
}

/**
 * The plain-text source line, e.g. 'Źródło: GUS BDL (P2392), dane z 2026-10-01 · zohelo'.
 * Sources are joined by ' · '; the licence, when given, comes before 'zohelo'.
 */
export function sourceLine({ sources, date, licence, locale }: SourceFooterProps): string {
  const l = label[locale];
  const parts = [`${l.source} ${sources.map(sourceText).join(' · ')}, ${l.data} ${date}`];
  if (licence) parts.push(licence);
  parts.push('zohelo');
  return parts.join(' · ');
}

/** The source line under every chart and table; sources with a url are links. */
export function SourceFooter({ sources, date, licence, locale }: SourceFooterProps) {
  const l = label[locale];
  return (
    <p className="mt-2 font-ui text-[length:var(--z-size-xs)] text-text-faint">
      {l.source}{' '}
      {sources.map((s, i) => (
        <span key={`${s.name}-${s.code ?? i}`}>
          {i > 0 ? ' · ' : null}
          {s.url ? (
            <a href={s.url} className="underline hover:text-text-muted focus-visible:outline-2 focus-visible:outline-focus">
              {sourceText(s)}
            </a>
          ) : (
            sourceText(s)
          )}
        </span>
      ))}
      {`, ${l.data} `}
      <span className="z-figures">{date}</span>
      {licence ? ` · ${licence}` : null}
      {' · zohelo'}
    </p>
  );
}
