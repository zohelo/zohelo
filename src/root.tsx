import '@zohelo/design/fonts.css';
import './index.css';
import type { ReactNode } from 'react';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { SampleDataBanner } from './components/SampleDataBanner';
import { localeOf, useLocale, useT } from './i18n';
import { warsawStamp } from './dataAsOf';
import { feedingSources } from './licenceGate';
import { isFixtureLayer, publishedDir, readCatalog } from './published';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  useRouteLoaderData,
} from 'react-router';
import { CONTAINER } from './components/container';

// Runs at build only (ssr: false): a build from fixtures/published marks every page as sample data,
// and the footer names, in the page language, the shown sources that feed a published KPI (zohelo#469).
export async function loader({ request }: { request: Request }) {
  const dir = publishedDir();
  const locale = localeOf(new URL(request.url).pathname);
  const catalog = readCatalog(dir);
  const sources = feedingSources(catalog).map((s) => (locale === 'pl' ? s.name_pl : s.name_en));
  return { sample: isFixtureLayer(dir), sources, dataAsOf: warsawStamp(catalog.generated_at, locale) };
}

export function Layout({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const t = useT();
  const root = useRouteLoaderData<typeof loader>('root');
  const sample = root?.sample ?? false;
  const sources = root?.sources ?? [];
  const dataAsOf = root?.dataAsOf ?? '';
  return (
    <html lang={locale} data-theme="light">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#24292E] font-sans antialiased selection:bg-[#3B8B94]/20 selection:text-[#18484F]">
        {/* The first focusable element on every page: skips the header to the content (WCAG 2.4.1). */}
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-[#24292E] focus:shadow"
        >
          {t.common.skip}
        </a>
        {sample && <SampleDataBanner locale={locale} />}
        {/* The shell (header with navigation and language switch, footer) on every route, once (#385). */}
        <Header />
        {/* A block, not a flex container: a flex column would shrink-wrap the routes' `mx-auto` <main>. */}
        {/* scroll-mt-20: the sticky 80 px header must not cover the first lines after the skip link (WCAG 2.4.11). */}
        <div id="content" tabIndex={-1} className="flex-1 scroll-mt-20 focus:outline-none">
          {children}
        </div>
        <Footer sources={sources} dataAsOf={dataAsOf} />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Unknown error';
  return (
    <main className={`${CONTAINER} py-16`}>
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-slate-600">{message}</p>
      <a className="mt-4 inline-block text-[#2C6E76] underline" href="/">
        zohelo.com
      </a>
    </main>
  );
}
