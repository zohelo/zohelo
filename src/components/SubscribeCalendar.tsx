import { site } from '../site.config';

// Links to the release calendar feed: subscribe (webcal://) or download the .ics file.

export function calendarLinks(): { webcal: string; https: string } {
  return { webcal: site.url.replace(/^https:/, 'webcal:') + '/calendar.ics', https: site.url + '/calendar.ics' };
}

const labels = {
  pl: { subscribe: 'Subskrybuj kalendarz publikacji', download: 'Pobierz plik .ics' },
  en: { subscribe: 'Subscribe to the release calendar', download: 'Download the .ics file' },
};

export function SubscribeCalendar({ locale }: { locale: 'pl' | 'en' }) {
  const { webcal, https } = calendarLinks();
  const t = labels[locale];
  return (
    <p className="font-ui text-[length:var(--z-size-sm)] text-text-muted">
      <a href={webcal} className="text-text underline">
        {t.subscribe}
      </a>
      {' · '}
      <a href={https} download className="underline">
        {t.download}
      </a>
    </p>
  );
}
