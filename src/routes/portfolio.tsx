import { Callout, Card } from '@zohelo/design';
import { useLoaderData } from 'react-router';
import { localeOf, localizedPath, useLocale, type Locale } from '../i18n';
import { loadStudies, STUDIES_DIR } from '../portfolio/studies';
import { pageMeta } from '../seo';
import { pages } from '../site.config';

const page = pages.find((p) => p.path === '/portfolio')!;

const dict: Record<
  Locale,
  { heading: string; status: string; intro: string[]; themesHeading: string; themes: string[]; read: string }
> = {
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
    read: 'Czytaj studium',
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
    read: 'Read the case study',
  },
};

// Runs at build only (ssr: false), so node:fs stays out of the client bundle.
export async function loader({ request }: { request: Request }) {
  const locale = localeOf(new URL(request.url).pathname);
  return {
    studies: loadStudies(STUDIES_DIR, locale).map(({ slug, title, summary }) => ({ slug, title, summary })),
  };
}

export function meta({ location }: { location: { pathname: string } }) {
  const locale = localeOf(location.pathname);
  return pageMeta({ path: page.path, locale, title: page.title[locale], description: page.description[locale] });
}

export default function Portfolio() {
  const locale = useLocale();
  const t = dict[locale];
  const { studies } = useLoaderData<typeof loader>();
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-text">
      <h1 className="font-display text-[length:var(--z-size-display)] font-semibold">{t.heading}</h1>
      {studies.length > 0 ? (
        <div className="mt-8 grid gap-4">
          {studies.map((study) => (
            <Card key={study.slug} title={study.title}>
              <p className="text-text-muted">{study.summary}</p>
              <a href={localizedPath(`/portfolio/${study.slug}`, locale)} className="mt-3 inline-block text-brand-teal underline">
                {t.read}
              </a>
            </Card>
          ))}
        </div>
      ) : null}
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
