import { Callout } from '@zohelo/design';
import { localeOf, useLocale, type Locale } from '../i18n';
import { pages } from '../site.config';

const page = pages.find((p) => p.path === '/portfolio')!;

const dict: Record<Locale, { heading: string; status: string; intro: string[]; themesHeading: string; themes: string[] }> = {
  pl: {
    heading: 'Portfolio',
    status: 'W przygotowaniu — planowane na I kwartał 2027',
    intro: [
      'W drugiej fazie projektu powstanie portfolio dashboardów na demonstracyjnych danych przedsiębiorstwa.',
      'Każdy dashboard pokaże typowy problem biznesowy rozwiązany w Power BI i w zohelo BI.',
      'Do czasu publikacji ta strona opisuje tylko plan — nie ma tu jeszcze żadnych dashboardów.',
    ],
    themesHeading: 'Planowane tematy',
    themes: ['Sprzedaż', 'Finanse', 'Kadry (HR)', 'Łańcuch dostaw', 'CRM', 'Księgowość MŚP'],
  },
  en: {
    heading: 'Portfolio',
    status: 'In preparation — planned for Q1 2027',
    intro: [
      'The project’s second phase adds a portfolio of dashboards built on demo enterprise data.',
      'Each dashboard shows a typical business question answered in Power BI and in zohelo BI.',
      'Until then this page only describes the plan — there are no dashboards here yet.',
    ],
    themesHeading: 'Planned themes',
    themes: ['Sales', 'Finance', 'HR', 'Supply chain', 'CRM', 'SME accounting'],
  },
};

export function meta({ location }: { location: { pathname: string } }) {
  const locale = localeOf(location.pathname);
  return [{ title: `${page.title[locale]} · zohelo` }, { name: 'description', content: page.description[locale] }];
}

export default function Portfolio() {
  const t = dict[useLocale()];
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-text">
      <h1 className="font-display text-[length:var(--z-size-display)] font-semibold">{t.heading}</h1>
      <div className="mt-6">
        <Callout tone="info">{t.status}</Callout>
      </div>
      <p className="mt-6 leading-relaxed text-text-muted">{t.intro.join(' ')}</p>
      <h2 className="mt-10 font-ui text-[length:var(--z-size-lg)] font-semibold">{t.themesHeading}</h2>
      <ul className="mt-3 list-disc space-y-1 pl-6 text-text-muted">
        {t.themes.map((theme) => (
          <li key={theme}>{theme}</li>
        ))}
      </ul>
    </main>
  );
}
