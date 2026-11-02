import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { ChartOfDayBlock } from '../src/growth/ChartOfDayBlock';
import { chartOfDay } from '../src/growth/chartOfDay';
import { readCatalog, readKpiLatest } from '../src/published';

const dir = 'fixtures/published';
const names = Object.fromEntries(readCatalog(dir).kpis.map((k) => [k.kpi_key, { name_pl: k.name_pl, name_en: k.name_en }]));
const pick = chartOfDay([readKpiLatest(dir, 'unemployment_rate')], names)!;

// Strips tags until nothing changes, so no nested remainder of a tag survives.
const text = (html: string) => {
  let t = html;
  let prev: string;
  do {
    prev = t;
    t = t.replace(/<[^>]*>/g, '');
  } while (t !== prev);
  return t;
};

const render = (locale: 'pl' | 'en', children?: React.ReactNode) =>
  renderToStaticMarkup(
    <ChartOfDayBlock pick={pick} sourceName="Eurostat" date="2026-01-01" locale={locale}>
      {children}
    </ChartOfDayBlock>,
  );

describe('ChartOfDayBlock', () => {
  test('Polish block', () => {
    const html = render('pl');
    expect(html).toContain('Wykres dnia');
    expect(html).toContain('Stopa bezrobocia (BAEL): wzrost z 2,9 do 3,2 (2025)');
    expect(html).toContain('+10,3 %');
    expect(html).toContain('href="/indicators/unemployment_rate"');
    expect(html).toContain('Zobacz wskaźnik');
    expect(text(html)).toContain('Źródło: Eurostat, dane z 1 sty 2026');
  });

  test('English block', () => {
    const html = render('en');
    expect(html).toContain('Chart of the day');
    expect(html).toContain('Unemployment rate (LFS): up from 2.9 to 3.2 (2025)');
    expect(html).toContain('+10.3 %');
    expect(html).toContain('href="/en/indicators/unemployment_rate"');
  });

  test('a rate shows its change in percentage points, a level the relative change (#388)', () => {
    const rate = renderToStaticMarkup(
      <ChartOfDayBlock pick={{ ...pick, rate: true, change: 0.3 }} sourceName="Eurostat" date="2026-01-01" locale="pl" />,
    );
    expect(rate).toContain('+0,3 p.p.');
    expect(rate).not.toContain('+10,3 %');
    expect(rate).toContain('vs poprzedni okres');
    const level = renderToStaticMarkup(
      <ChartOfDayBlock pick={{ ...pick, rate: false, change: -1, change_pct: -12.66 }} sourceName="GUS" date="2026-01-01" locale="en" />,
    );
    expect(level).toContain('\u221212.7 %');
    expect(level).toContain('vs previous period');
  });

  test('renders the chart passed as children', () => {
    expect(render('pl', <span>chart</span>)).toContain('<div class="mt-4"><span>chart</span></div>');
    expect(render('pl')).not.toContain('class="mt-4"');
  });
});
