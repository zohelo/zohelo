import { useLocation } from 'react-router';
import { localeOf } from '../i18n';
import { pageMeta } from '../seo';

export function meta({ location }: { location: { pathname: string } }) {
  const locale = localeOf(location.pathname);
  const en = locale === 'en';
  return [
    ...pageMeta({
      path: '/',
      locale,
      title: en ? 'Page not found' : 'Nie ma takiej strony',
      description: en ? 'This address does not exist on zohelo.com.' : 'Ten adres nie istnieje w serwisie zohelo.com.',
    }).filter((d) => !('rel' in d)),
    { name: 'robots', content: 'noindex' },
  ];
}

export default function NotFound() {
  const { pathname } = useLocation();
  const en = pathname === '/en' || pathname.startsWith('/en/');
  return (
    <main className="max-w-3xl mx-auto px-4 py-24 text-center">
      <p className="font-mono-code text-sm text-slate-500">404</p>
      <h1 className="mt-2 text-3xl font-semibold">{en ? 'Page not found' : 'Nie ma takiej strony'}</h1>
      <p className="mt-4 text-slate-600">
        {en ? 'This address does not exist on zohelo.com.' : 'Ten adres nie istnieje w serwisie zohelo.com.'}
      </p>
      <a href={en ? '/en' : '/'} className="mt-6 inline-block text-[#2C6E76] underline">
        {en ? 'Back to the home page' : 'Wróć na stronę główną'}
      </a>
    </main>
  );
}
