import { useLoaderData } from 'react-router';
import { localeOf, localizedPath, useLocale, type Locale } from '../i18n';
import { loadStudies, STUDIES_DIR } from '../portfolio/studies';
import { pageMeta } from '../seo';

const dict: Record<Locale, { skills: string; dashboard: string; back: string }> = {
  pl: { skills: 'Umiejętności', dashboard: 'Otwórz dashboard', back: 'Wszystkie studia' },
  en: { skills: 'Skills', dashboard: 'Open the dashboard', back: 'All case studies' },
};

// Runs at build only (ssr: false): reads content/portfolio/<slug>.<locale>.md.
export async function loader({ request, params }: { request: Request; params: { slug?: string } }) {
  const locale = localeOf(new URL(request.url).pathname);
  const study = loadStudies(STUDIES_DIR, locale).find((s) => s.slug === params.slug);
  if (!study) throw new Response('Not found', { status: 404 });
  return { study };
}

export function meta({ data, location }: { data?: Awaited<ReturnType<typeof loader>>; location: { pathname: string } }) {
  if (!data) return [];
  const locale = localeOf(location.pathname);
  return pageMeta({
    path: `/portfolio/${data.study.slug}`,
    locale,
    title: data.study.title,
    description: data.study.summary,
  });
}

export default function PortfolioStudy() {
  const { study } = useLoaderData<typeof loader>();
  const locale = useLocale();
  const t = dict[locale];
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-text">
      <a href={localizedPath('/portfolio', locale)} className="font-ui text-[length:var(--z-size-sm)] text-brand-teal underline">
        {t.back}
      </a>
      <h1 className="mt-4 font-display text-[length:var(--z-size-display)] font-semibold">{study.title}</h1>
      <p className="mt-2 font-ui text-[length:var(--z-size-sm)] text-text-muted">
        {study.dataset} · {study.licence}
      </p>
      <h2 className="mt-6 font-ui text-[length:var(--z-size-lg)] font-semibold">{t.skills}</h2>
      <ul className="mt-2 list-disc space-y-1 pl-6 text-text-muted">
        {study.skills.map((skill) => (
          <li key={skill}>{skill}</li>
        ))}
      </ul>
      <p className="mt-6">
        <a href={study.dashboard_url} className="text-brand-teal underline" rel="noopener">
          {t.dashboard}
        </a>
      </p>
      <article className="mt-8 leading-relaxed" dangerouslySetInnerHTML={{ __html: study.html }} />
    </main>
  );
}
