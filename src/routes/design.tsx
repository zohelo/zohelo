import { Callout, Card, DataTable, FreshnessBadge, KpiTile, SourceFooter } from '@zohelo/design';
import { useEffect, useState, type ReactNode } from 'react';
import { tokens } from '../../packages/design/src/generated/tokens';
import { SampleChart } from '../components/SampleChart.client';
import { localeOf, useLocale } from '../i18n';
import { pageMeta } from '../seo';
import { pages } from '../site.config';

// A visual test page of the design system: every token and every component with sample props.
// Not linked from the navigation.

const page = pages.find((p) => p.path === '/design')!;

export function meta({ location }: { location: { pathname: string } }) {
  const locale = localeOf(location.pathname);
  return pageMeta({ path: page.path, locale, title: page.title[locale], description: page.description[locale] });
}

type Mode = 'light' | 'dark';

/** WCAG 2 contrast ratio of two #RRGGBB colours. */
function contrast(a: string, b: string): number {
  const luminance = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const colourNames = Object.keys(tokens.light) as (keyof typeof tokens.light)[];

const rows = [
  { region: 'Mazowieckie', value: 3.1 },
  { region: 'Łódzkie', value: 4.6 },
  { region: 'Podkarpackie', value: 7.2 },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="font-display text-[length:var(--z-size-2xl)] font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ValueList({ group, values }: { group: string; values: Record<string, unknown> }) {
  return (
    <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-1 font-mono text-[length:var(--z-size-sm)]">
      {Object.entries(values).map(([name, value]) => (
        <div key={name} className="contents">
          <dt className="text-text-muted">{`${group}.${name}`}</dt>
          <dd className="break-all">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function Design() {
  const locale = useLocale();
  const [mode, setMode] = useState<Mode>('light');
  // The chart module is client-only; render it after hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const toggle = () => {
    const next: Mode = mode === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    setMode(next);
  };

  return (
    <main className="mx-auto max-w-[var(--z-layout-content-max)] bg-bg px-4 py-12 text-text">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-[length:var(--z-size-display)] font-semibold">zohelo design</h1>
        <button
          type="button"
          onClick={toggle}
          className="rounded-md border border-border bg-surface px-4 py-2 font-ui text-[length:var(--z-size-sm)] focus-visible:outline-2 focus-visible:outline-focus"
        >
          {mode === 'light' ? 'Dark theme' : 'Light theme'}
        </button>
      </div>

      <Section title="Colours">
        <p className="mb-4 text-text-muted">Light and dark value of every colour token, with its contrast ratio against surface.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {colourNames.map((name) => (
            <div key={name} className="rounded-md border border-border bg-surface p-3">
              <div className="font-mono text-[length:var(--z-size-sm)]">{`color.${name}`}</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(['light', 'dark'] as const).map((m) => (
                  <div key={m}>
                    <div className="h-10 rounded-sm border border-border" style={{ background: tokens[m][name] }} />
                    <div className="mt-1 font-mono text-[length:var(--z-size-xs)] text-text-muted">
                      {`${m} ${tokens[m][name]} · ${contrast(tokens[m][name], tokens[m].surface).toFixed(2)}:1`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        {Object.entries(tokens.font).map(([name, stack]) => (
          <p key={name} className="mb-2" style={{ fontFamily: `var(--z-font-${name})` }}>
            <span className="font-mono text-[length:var(--z-size-xs)] text-text-muted">{`font.${name} `}</span>
            {`Polska w danych — ${stack.join(', ')} 0123456789`}
          </p>
        ))}
        <div className="mt-6">
          {Object.entries(tokens.size).map(([name, size]) => (
            <p key={name} className="mb-1" style={{ fontSize: size, lineHeight: tokens.lineHeight.heading }}>
              <span className="font-mono text-[length:var(--z-size-xs)] text-text-muted">{`size.${name} ${size} `}</span>
              Stopa bezrobocia
            </p>
          ))}
        </div>
        <div className="mt-6">
          <ValueList group="line-height" values={tokens.lineHeight} />
        </div>
      </Section>

      <Section title="Spacing & radius">
        <div className="space-y-2">
          {Object.entries(tokens.space).map(([name, size]) => (
            <div key={name} className="flex items-center gap-3">
              <span className="w-24 font-mono text-[length:var(--z-size-xs)] text-text-muted">
                {`space.${name} ${size}`}
              </span>
              <span className="h-3 bg-brand-teal" style={{ width: size }} />
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-4">
          {Object.entries(tokens.radius).map(([name, r]) => (
            <div key={name} className="flex h-20 w-28 items-center justify-center border border-border bg-surface-2" style={{ borderRadius: r }}>
              <span className="font-mono text-[length:var(--z-size-xs)]">
                {`radius.${name} ${r}`}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-4">
          {Object.entries(tokens.shadow).map(([name, s]) => (
            <div key={name} className="h-20 w-40 rounded-md bg-surface p-3" style={{ boxShadow: `var(--z-shadow-${name})` }}>
              <span className="font-mono text-[length:var(--z-size-xs)]">{`shadow.${name}`}</span>
              <div className="font-mono text-[length:var(--z-size-xs)] text-text-faint">{`dark: ${s.dark}`}</div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <ValueList group="shadow" values={tokens.shadow} />
          <ValueList group="layout" values={tokens.layout} />
        </div>
      </Section>

      <Section title="Components">
        <div className="grid gap-4 md:grid-cols-2">
          <KpiTile
            label="Stopa bezrobocia (BAEL)"
            value={3.2}
            unit="%"
            delta={0.3}
            period="2025"
            locale={locale}
            goodDirection="down"
            decimals={1}
          />
          <Card title="Card">
            <p className="text-text-muted">A surface panel with the card shadow.</p>
            <div className="mt-3">
              <FreshnessBadge date="2026-10-01" locale={locale} />
            </div>
          </Card>
          <Callout tone="info">Callout · info</Callout>
          <Callout tone="warn">Callout · warn</Callout>
          <Callout tone="danger">Callout · danger</Callout>
        </div>
        <div className="mt-6 rounded-lg border border-border bg-surface p-4">
          <DataTable
            caption="Sample regional values"
            sortable
            columns={[
              { key: 'region', label: 'Region' },
              { key: 'value', label: 'Value', align: 'right', format: (v) => String(v).replace('.', locale === 'pl' ? ',' : '.') },
            ]}
            rows={rows}
          />
          <SourceFooter sources={[{ name: 'GUS BDL', code: 'P2392' }]} date="2026-10-01" locale={locale} />
        </div>
        <div className="mt-6 rounded-lg border border-border bg-surface p-4">
          {mounted ? <SampleChart /> : <div className="h-[300px]" aria-hidden="true" />}
        </div>
      </Section>
    </main>
  );
}
