import { localizedPath, type Locale } from '../i18n';
import type { ChangeItem, Source } from '../published';
import { ChangesList } from './ChangesList';

// The home page's "what changed" block: the 10 latest feed items and a link to /changes.

const heading: Record<Locale, string> = { pl: 'Co się zmieniło', en: 'What changed' };
const all: Record<Locale, string> = { pl: 'Wszystkie zmiany', en: 'All changes' };

export function HomeChanges({ items, sources, locale }: { items: ChangeItem[]; sources: Source[]; locale: Locale }) {
  return (
    <section aria-labelledby="what-changed" className="mx-auto max-w-6xl px-4 py-8">
      <h2 id="what-changed" className="mb-4 font-display text-[length:var(--z-size-xl)] text-text">
        {heading[locale]}
      </h2>
      <ChangesList items={items} sources={sources} locale={locale} limit={10} />
      <p className="mt-4">
        <a className="text-brand-teal underline" href={localizedPath('/changes', locale)}>
          {all[locale]}
        </a>
      </p>
    </section>
  );
}
