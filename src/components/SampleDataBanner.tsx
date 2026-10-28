import { AlertCircle } from 'lucide-react';
import type { Locale } from '../i18n';
import { en } from '../i18n/en';
import { pl } from '../i18n/pl';

/** Shown on every page of a build made from the fixture set, so synthetic values never read as real. */
export function SampleDataBanner({ locale }: { locale: Locale }) {
  const text = (locale === 'en' ? en : pl).sample.banner;
  return (
    <div
      role="note"
      data-sample-data
      className="flex items-start gap-2 border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}
