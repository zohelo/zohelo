import { localizedPath, type Locale } from '../i18n';
import type { ChangeItem, Source } from '../published';

// The what-changed list: newest first, for the /changes page and the home block.
// Only types come from published.ts, which reads files with node:fs.

export type ChangesListProps = { items: ChangeItem[]; sources: Source[]; locale: Locale; limit?: number };

const empty: Record<Locale, string> = {
  pl: 'Brak zmian w ostatnich 30 dniach.',
  en: 'No changes in the last 30 days.',
};

export function ChangesList({ items, sources, locale, limit }: ChangesListProps) {
  // Array.prototype.sort is stable, so equal timestamps keep their input order.
  const shown = [...items].sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0)).slice(0, limit);
  if (shown.length === 0) return <p className="text-text-muted">{empty[locale]}</p>;

  return (
    <ol className="divide-y divide-border">
      {shown.map((item, i) => {
        const source = sources.find((s) => s.source_key === item.source_key);
        const name = source ? (locale === 'pl' ? source.name_pl : source.name_en) : item.source_key;
        const title = locale === 'pl' ? item.title_pl : item.title_en;
        return (
          <li key={`${item.at}-${i}`} className="py-3">
            <time dateTime={item.at} className="font-ui text-[length:var(--z-size-xs)] text-text-muted">
              {item.at.slice(0, 10)}
            </time>{' '}
            {item.kpi_keys.length > 0 ? (
              <a href={localizedPath(`/indicators/${item.kpi_keys[0]}`, locale)}>{title}</a>
            ) : (
              <span>{title}</span>
            )}
            <div className="font-mono text-[length:var(--z-size-xs)] text-text-muted">{`${name} · ${item.dataset_key}`}</div>
          </li>
        );
      })}
    </ol>
  );
}
