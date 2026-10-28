import '@zohelo/design/fonts.css';
import './index.css';
import type { ReactNode } from 'react';
import { SampleDataBanner } from './components/SampleDataBanner';
import { useLocale } from './i18n';
import { isFixtureLayer, publishedDir } from './published';
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

// Runs at build only (ssr: false): a build from fixtures/published marks every page as sample data.
export async function loader() {
  return { sample: isFixtureLayer(publishedDir()) };
}

export function Layout({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const sample = useRouteLoaderData<typeof loader>('root')?.sample ?? false;
  return (
    <html lang={locale} data-theme="light">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Meta />
        <Links />
      </head>
      <body className="bg-[#F8FAFC] text-[#24292E] font-sans antialiased selection:bg-[#3B8B94]/20 selection:text-[#18484F]">
        {sample && <SampleDataBanner locale={locale} />}
        {children}
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
    <main className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-slate-600">{message}</p>
      <a className="mt-4 inline-block text-[#2C6E76] underline" href="/">
        zohelo.com
      </a>
    </main>
  );
}
