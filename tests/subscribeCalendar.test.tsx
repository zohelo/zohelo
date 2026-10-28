import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { SubscribeCalendar, calendarLinks } from '../src/components/SubscribeCalendar';

describe('SubscribeCalendar', () => {
  test('calendar links', () => {
    expect(calendarLinks()).toEqual({ webcal: 'webcal://zohelo.com/calendar.ics', https: 'https://zohelo.com/calendar.ics' });
  });

  test('Polish markup', () => {
    const html = renderToStaticMarkup(<SubscribeCalendar locale="pl" />);
    expect(html).toContain('href="webcal://zohelo.com/calendar.ics"');
    expect(html).toContain('href="https://zohelo.com/calendar.ics"');
    expect(html).toContain('Subskrybuj kalendarz publikacji');
    expect(html).toContain('Pobierz plik .ics');
    expect(html).toContain(' · ');
  });

  test('English markup', () => {
    const html = renderToStaticMarkup(<SubscribeCalendar locale="en" />);
    expect(html).toContain('Subscribe to the release calendar');
    expect(html).toContain('Download the .ics file');
  });
});
