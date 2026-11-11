// The footer's "Dane z …" / "Data as of …": the catalog's generated_at as a Warsaw date and time (zohelo#470).
export function warsawStamp(iso: string, locale: 'pl' | 'en'): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const parts = new Intl.DateTimeFormat(locale === 'pl' ? 'pl-PL' : 'en-GB', {
    timeZone: 'Europe/Warsaw',
    day: '2-digit',
    month: locale === 'pl' ? '2-digit' : 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(d);
  const p = (type: string) => parts.find((x) => x.type === type)?.value ?? '';
  const time = `${p('hour')}:${p('minute')}`;
  return locale === 'pl'
    ? `${p('day')}.${p('month')}.${p('year')} ${time}`
    : `${p('day')} ${p('month')} ${p('year')}, ${time}`;
}
