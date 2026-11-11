import { SubscribeCalendar } from '../components/SubscribeCalendar';
import { localizedPath, type Locale } from '../i18n';
import type { ChangeItem, Source } from '../published';
import { ChangesList } from './ChangesList';
import { CONTAINER } from '../components/container';

// The home page's "what changed" block: the 10 latest feed items, a link to /changes and, while the
// release calendar has events (`calendar`), its subscribe links.

const heading: Record<Locale, string> = { pl: 'Co się zmieniło', en: 'What changed' };
const all: Record<Locale, string> = { pl: 'Wszystkie zmiany', en: 'All changes' };

export function HomeChanges({
  items,
  sources,
  calendar = false,
  locale,
}: {
  items: ChangeItem[];
  sources: Source[];
  calendar?: boolean;
  locale: Locale;
}) {
  return (
    <section aria-labelledby="what-changed" className={`${CONTAINER} py-8`}>
      <h2 id="what-changed" className="mb-4 font-display text-[length:var(--z-size-xl)] text-text">
        {heading[locale]}
      </h2>
      <ChangesList items={items} sources={sources} locale={locale} limit={10} />
      <p className="mt-4">
        <a className="text-brand-teal underline" href={localizedPath('/changes', locale)}>
          {all[locale]}
        </a>
      </p>
      {calendar ? (
        <div className="mt-2">
          <SubscribeCalendar locale={locale} />
        </div>
      ) : null}
    </section>
  );
}
