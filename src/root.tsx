import '@zohelo/design/fonts.css';
import './index.css';
import type { ReactNode } from 'react';
import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteError } from 'react-router';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl" data-theme="light">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Meta />
        <Links />
      </head>
      <body className="bg-[#F8FAFC] text-[#24292E] font-sans antialiased selection:bg-[#3B8B94]/20 selection:text-[#18484F]">
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
