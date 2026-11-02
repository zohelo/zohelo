// Builds the Editorial prototype: `bun design/prototypes/editorial/build.ts` (after `bun install`).
// Writes static HTML next to this file and the Vega-Lite specs to specs/. Prototype only — never shipped.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { responsive, type Series } from './charts';
import {
  annualSeries, catalog, changes, compact, date, inflationSeries, inflationWbSeries, kpiName, latest, num, period,
  places, pct, pp, sourceName, takeaway, unit, vs, type Lang,
} from './data';

const here = import.meta.dir;
mkdirSync(join(here, 'specs'), { recursive: true });
const saveSpec = (name: string, spec: any) => writeFileSync(join(here, 'specs', `${name}.vl.json`), JSON.stringify(spec, null, 2));

const T = {
  pl: {
    tagline: 'Polska w danych', skip: 'Przejdź do treści', fixture: 'Dane przykładowe (fixture): wartości, daty i licencje nie są prawdziwe.',
    nav: ['Wskaźniki', 'Regiony', 'Kalendarz', 'Źródła'], bi: ['Pulpity', 'Eksplorator', 'Wskaźniki', 'Katalog'], data: ['Start', 'Tabele', 'Przebiegi', 'SQL'],
    source: 'Źródło', period: 'Okres', published: 'Publikacja', next: 'Następna publikacja', loaded: 'Sprawdzono',
    notInFixture: 'brak w danych fixture', chart: 'Wykres', table: 'Tabela', sources: 'Źródła i pobieranie',
    copyLink: 'Kopiuj link', copyChart: 'Kopiuj wykres (PNG)', cite: 'Cytuj', csv: 'Pobierz CSV',
    illustrative: 'linia przerywana: przebieg ilustracyjny (fixture ma tylko dwa ostatnie okresy)', prelim: 'pusty znacznik: dane wstępne',
    footer: 'zohelo — otwarte dane publiczne o Polsce. Dane: Eurostat, GUS, Bank Światowy, NBP; licencje przy każdej liczbie.',
  },
  en: {
    tagline: 'Poland in data', skip: 'Skip to content', fixture: 'Sample data (fixture): values, dates and licences are not real.',
    nav: ['Indicators', 'Regions', 'Calendar', 'Sources'], bi: ['Dashboards', 'Explorer', 'Indicators', 'Catalogue'], data: ['Start', 'Tables', 'Runs', 'SQL'],
    source: 'Source', period: 'Period', published: 'Released', next: 'Next release', loaded: 'Checked',
    notInFixture: 'not in the fixture data', chart: 'Chart', table: 'Table', sources: 'Sources & download',
    copyLink: 'Copy link', copyChart: 'Copy chart (PNG)', cite: 'Cite', csv: 'Download CSV',
    illustrative: 'dashed line: illustrative history (the fixture has only the last two periods)', prelim: 'hollow marker: preliminary',
    footer: 'zohelo — open public data about Poland. Data: Eurostat, Statistics Poland, World Bank, NBP; licence shown with every number.',
  },
};

type Product = 'com' | 'bi' | 'data';
const productLinks: Record<Product, string> = { com: 'com-home.html', bi: 'bi-dashboard.html', data: 'data-start.html' };

function shell(o: { lang: Lang; product: Product; title: string; nav: number; body: string; alt?: string; canonical?: string }) {
  const t = T[o.lang];
  const navItems = o.product === 'com' ? t.nav : o.product === 'bi' ? t.bi : t.data;
  const navHref: Record<Product, string[]> = {
    com: ['com-inflation.html', '#', '#', '#'],
    bi: ['bi-dashboard.html', 'bi-explorer.html', 'bi-kpi.html', '#'],
    data: ['data-start.html', '#', '#', '#'],
  };
  const name = { com: 'zohelo', bi: 'zohelo BI', data: 'zohelo Data' };
  const switcher = (['com', 'bi', 'data'] as Product[])
    .map((p) => `<a href="${productLinks[p]}"${p === o.product ? ' aria-current="page"' : ''}>${name[p]}</a>`)
    .join('');
  const langLink = o.alt ? `<a class="lang" href="${o.alt}" hreflang="${o.lang === 'pl' ? 'en' : 'pl'}">${o.lang === 'pl' ? 'English' : 'Polski'}</a>` : `<a class="lang" href="#" aria-disabled="true">${o.lang === 'pl' ? 'EN' : 'PL'}</a>`;
  return `<!doctype html>
<html lang="${o.lang}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${o.title} · ${name[o.product]}</title>
${o.canonical ? `<link rel="canonical" href="${o.canonical}">` : ''}
<link rel="stylesheet" href="style.css">
</head>
<body class="${o.product}">
<a class="skip" href="#main">${t.skip}</a>
<header>
  <div class="fixture" role="note">${t.fixture} <a href="index.html">Prototyp A · Editorial</a></div>
  <div class="switcher"><nav class="wrap" aria-label="${o.lang === 'pl' ? 'Produkty zohelo' : 'zohelo products'}">${switcher}${langLink}</nav></div>
  <div class="masthead"><div class="wrap">
    <a class="brand" href="${productLinks[o.product]}">${name[o.product]}<small>${t.tagline}</small></a>
    <nav aria-label="${o.lang === 'pl' ? 'Główna' : 'Main'}">${navItems.map((n, i) => `<a href="${navHref[o.product][i]}"${i === o.nav ? ' aria-current="page"' : ''}>${n}</a>`).join('')}</nav>
  </div></div>
</header>
<main id="main">
${o.body}
</main>
<footer class="site"><div class="wrap"><p class="col">${t.footer}</p><p><a href="#">${o.lang === 'pl' ? 'Licencje i cytowanie' : 'Licences and citation'}</a> · <a href="#">${o.lang === 'pl' ? 'Metodologia' : 'Methodology'}</a> · <a href="#">RSS</a></p></div></footer>
</body>
</html>
`;
}

const inf = latest.inflation.values.find((v: any) => v.source_key === 'eurostat');
const infWb = latest.inflation.values.find((v: any) => v.source_key === 'world_bank_wdi');
const une = latest.unemployment_rate.values.find((v: any) => v.geography_key === 'PL');
const uneMal = latest.unemployment_rate.values.find((v: any) => v.geography_key === 'TERC:12');
const pop = latest.population.values.find((v: any) => v.geography_key === 'PL');
const gdp = latest.gdp_current_prices.values.find((v: any) => v.source_key === 'eurostat');
const gdpWb = latest.gdp_current_prices.values.find((v: any) => v.source_key === 'world_bank_wdi');

const infSeries = (lang: Lang): Series[] => [
  { label: lang === 'pl' ? 'HICP r/r' : 'HICP y/y', role: 'accent', points: inflationSeries() },
  { label: lang === 'pl' ? 'CPI średnio w roku (BŚ)' : 'CPI annual avg (WB)', role: 'context', points: inflationWbSeries() },
];

function provenance(lang: Lang, v: any, extra = '') {
  const t = T[lang];
  return `<p class="meta">${t.period}: <b>${period(v.period, lang)}</b> · ${t.published}: <i>${t.notInFixture}</i> · ${t.next}: <i>${t.notInFixture}</i> · ${t.source}: <b>${sourceName(v.source_key, lang)}</b>${extra}</p>`;
}

async function comHome(): Promise<string> {
  const lang: Lang = 'pl';
  const ch = await responsive({ series: infSeries(lang), lang, monthly: true, ySuffix: '%' }, [520, 260], [230, 190]);
  saveSpec('home-inflation', ch.spec);
  const une3 = await responsive({ series: [{ label: 'Polska', role: 'accent', points: annualSeries('unemployment_rate', 'PL', [3.4, 3.0], 2021) }], lang, ySuffix: '%' }, [250, 120], [250, 130]);
  const popCh = await responsive({ series: [{ label: 'Polska', role: 'accent', points: annualSeries('population', 'PL', [37.9e6, 37.7e6, 36.85e6], 2021, 1e6) }], lang, yFormat: '.1f', ySuffix: ' mln' }, [250, 120], [250, 130]);
  const changesHtml = changes.items
    .map((c: any) => `<li><span class="meta fig">${date(c.at, lang)}</span><span><a href="#">${c.title_pl}</a><br><span class="meta">${sourceName(c.source_key, lang)} · ${c.dataset_key}</span></span></li>`)
    .join('');
  const body = `
<div class="wrap">
  <h1 class="sr">zohelo — Polska w danych</h1>
  <section class="lead" aria-labelledby="lead-title">
    <div>
      <p class="kicker">${kpiName('inflation', lang)} · ${period(inf.period, lang)}</p>
      <h2 id="lead-title" style="font-size:inherit"><a href="com-inflation.html" style="color:inherit;text-decoration:none;font-size:clamp(32px,4vw,46px)">${takeaway('inflation', lang)}</a></h2>
      <p class="dek">${pp(inf.value - inf.previous_value, lang)} ${vs(inf.previous_period, lang)} (${pct(inf.previous_value, lang)}). HICP, zmiana rok do roku.</p>
      <div class="chart-frame">${ch.html}</div>
      <p class="caption"><span class="legend-key"><i></i>${T.pl.illustrative}</span><br>Źródło: Eurostat (prc_hicp_manr), Bank Światowy (WDI) · sprawdzono ${date(inf.checked_at, lang)} · <a href="com-inflation.html">Cały wskaźnik →</a></p>
    </div>
    <div class="about">
      <p><b>zohelo</b> zbiera dane publiczne o Polsce — GUS, Eurostat, NBP, Bank Światowy — i pokazuje, co się zmieniło, z liczbą, okresem i źródłem przy każdym zdaniu.</p>
      <p class="meta" style="font-family:var(--ui)">Dla dziennikarzy, analityków i ciekawych. Analizy i przekroje: <a href="bi-dashboard.html">zohelo BI</a>.</p>
    </div>
  </section>
  <h2 class="section-title">Liczby, które się zmieniły</h2>
  <div class="stories">
    <article class="story">
      <p class="kicker">Rynek pracy · ${period(une.period, lang)}</p>
      <h3><a href="#">${takeaway('unemployment_rate', lang)}</a></h3>
      <p class="meta">${pp(une.value - une.previous_value, lang)} ${vs(une.previous_period, lang)} · BAEL, Eurostat</p>
      <div class="chart-frame">${une3.html}</div>
    </article>
    <article class="story">
      <p class="kicker">Ludność · ${period(pop.period, lang)}</p>
      <h3><a href="#">${takeaway('population', lang)}</a></h3>
      <p class="meta"><span class="fig">${num(pop.value, lang)}</span> os. · −${num(pop.previous_value - pop.value, lang)} ${vs(pop.previous_period, lang)} · Eurostat, stan na 1 stycznia</p>
      <div class="chart-frame">${popCh.html}</div>
    </article>
    <article class="story">
      <p class="kicker">Regiony · ${period(uneMal.period, lang)}</p>
      <h3><a href="#">W Małopolsce bezrobocie wyniosło ${pct(uneMal.value, lang)} <span class="flag" title="dane wstępne">wstępne</span></a></h3>
      <p class="meta">Polska: ${pct(une.value, lang)} w tym samym roku · BAEL, Eurostat · województwo (NUTS 2)</p>
      <p class="meta" style="margin-top:12px">Mapa i ranking województw pojawią się, gdy fixture będzie mieć wszystkie 16 regionów.</p>
    </article>
  </div>
  <div class="split">
    <section aria-labelledby="ch-title"><h2 id="ch-title" class="section-title">Co się zmieniło w danych</h2><ul class="changes">${changesHtml}</ul>
      <p style="margin-top:12px"><a href="#">Kalendarz publikacji</a> · <a href="#">Subskrybuj (.ics)</a></p></section>
    <section aria-labelledby="ctx-title"><h2 id="ctx-title" class="section-title">Kontekst</h2>
      <div class="story" style="padding-right:0"><p class="kicker">Gospodarka · ${period(gdp.period, lang)}</p>
      <h3 style="font-size:20px">PKB w cenach bieżących: ${compact(gdp.value * 1e6, lang, 'EUR')} w ${gdp.period} r. <span class="flag">wstępne</span></h3>
      <p class="meta">Poziom w cenach bieżących to kontekst; nagłówkiem PKB jest wzrost realny r/r — ${T.pl.notInFixture}. Eurostat.</p></div>
    </section>
  </div>
</div>`;
  return shell({ lang, product: 'com', title: 'Polska w danych', nav: -1, body });
}

async function comInflation(lang: Lang): Promise<string> {
  const t = T[lang];
  const ch = await responsive({ series: infSeries(lang), lang, monthly: true, ySuffix: '%' }, [540, 300], [230, 210]);
  saveSpec(`indicator-inflation-${lang}`, ch.spec);
  const pl = lang === 'pl';
  const rows = inflationSeries().slice(-6).reverse()
    .map((p) => `<tr><td>${period(p.t, lang)}</td><td class="n">${pct(p.v, lang)}</td><td>${p.illustrative ? (pl ? 'ilustracyjne' : 'illustrative') : 'Eurostat'}</td></tr>`).join('');
  const other = pl ? 'inflation.html' : '../inflation.html';
  const body = `
<div class="wrap">
  <p class="crumbs"><a href="com-home.html">zohelo</a> › <a href="#">${pl ? 'Wskaźniki' : 'Indicators'}</a> › <a href="#">${pl ? 'Ceny' : 'Prices'}</a></p>
  <div class="split" style="padding-top:8px">
    <article>
      <header class="ind-head">
        <p class="kicker">${kpiName('inflation', lang)}</p>
        <h1>${takeaway('inflation', lang)}</h1>
        <p class="dek">${pl ? 'Ceny towarów i usług konsumpcyjnych (HICP) były o' : 'Consumer prices (HICP) were'} ${pct(inf.value, lang)} ${pl ? 'wyższe niż rok wcześniej. Miesiąc wcześniej' : 'higher than a year earlier. A month earlier the rate was'} ${pct(inf.previous_value, lang)}.</p>
      </header>
      <div class="keyline">
        <p class="figure-big">${pct(inf.value, lang)}<small>${pl ? 'r/r' : 'y/y'}</small></p>
        <p class="meta"><b>${pp(inf.value - inf.previous_value, lang)}</b> ${vs(inf.previous_period, lang)}<br>${t.period}: <b>${period(inf.period, lang)}</b> · ${t.source}: <b>Eurostat</b></p>
        <p class="meta">${t.published}: <i>${t.notInFixture}</i><br>${t.next}: <i>${t.notInFixture}</i></p>
      </div>
      <nav class="tabs" aria-label="${pl ? 'Widok' : 'View'}"><a href="#" aria-current="page">${t.chart}</a><a href="#tabela">${t.table}</a><a href="#zrodla">${t.sources}</a></nav>
      <figure class="chart-frame" style="margin:0">
        <figcaption class="sr">${takeaway('inflation', lang)}. ${pl ? 'Tabela danych poniżej.' : 'Data table below.'}</figcaption>
        ${ch.html}
        <p class="caption"><span class="legend-key"><i></i>${t.illustrative}</span><br>
        ${pl ? 'HICP (Eurostat, miesięcznie) i CPI (Bank Światowy, średnia roczna) to różne definicje — dlatego linia BŚ jest szara i podpisana.' : 'HICP (Eurostat, monthly) and CPI (World Bank, annual average) are different definitions — hence the grey, labelled World Bank line.'}<br>
        ${t.source}: Eurostat prc_hicp_manr, ${pl ? 'Bank Światowy' : 'World Bank'} FP.CPI.TOTL.ZG · ${t.loaded} ${date(inf.checked_at, lang)} · CC BY 4.0</p>
      </figure>
      <div class="actions"><button class="btn" type="button">${t.copyLink}</button><button class="btn" type="button">${t.copyChart}</button><button class="btn" type="button">${t.cite}</button><a class="btn" href="#">${t.csv}</a></div>
      <section class="howto" aria-labelledby="howto"><h2 id="howto">${pl ? 'Jak czytać' : 'How to read'}</h2><ul>
        <li>${pl ? 'Inflacja to zmiana cen <b>rok do roku</b>: 2,9% znaczy, że koszyk kosztuje o 2,9% więcej niż we wrześniu rok temu — nie, że ceny wzrosły o 2,9% w miesiąc.' : 'Inflation is the <b>year-on-year</b> change in prices: 2.9% means the basket costs 2.9% more than a year earlier — not that prices rose 2.9% in a month.'}</li>
        <li>${pl ? 'Spadek inflacji to wolniejszy wzrost cen, nie spadek cen. Zmiany stopy podajemy w <b>punktach procentowych</b> (p.p.).' : 'Falling inflation means prices rise more slowly, not that they fall. Changes in the rate are in <b>percentage points</b> (pp).'}</li>
        <li>${pl ? 'W Polsce nagłówkiem jest <b>CPI GUS</b>; HICP (Eurostat) służy do porównań w UE. Fixture ma tylko HICP i CPI BŚ.' : 'The Polish headline is <b>Statistics Poland CPI</b>; HICP (Eurostat) is for EU comparisons. The fixture has only HICP and World Bank CPI.'}</li>
      </ul></section>
      <h2 id="tabela" style="font-size:22px;margin:24px 0 8px">${t.table}</h2>
      <div class="table-wrap" tabindex="0" role="region" aria-label="${t.table}"><table><thead><tr><th>${t.period}</th><th class="n">HICP ${pl ? 'r/r' : 'y/y'}</th><th>${t.source}</th></tr></thead><tbody>${rows}</tbody></table></div>
    </article>
    <aside>
      <div class="aside-card"><h2>${pl ? 'Dla analityków' : 'For analysts'}</h2>
        <p class="meta">${pl ? 'Wszystkie źródła, przekroje, kraje UE i cytowanie — w zohelo BI.' : 'All sources, breakdowns, EU countries and citation — in zohelo BI.'}</p>
        <p><a class="btn primary" href="bi-kpi.html">${pl ? 'Inflacja w zohelo BI' : 'Inflation in zohelo BI'} →</a></p></div>
      <div class="aside-card" id="zrodla"><h2>${t.sources}</h2><dl class="facts">
        <dt>HICP</dt><dd>Eurostat · prc_hicp_manr · ${pl ? 'miesięcznie' : 'monthly'}</dd>
        <dt>CPI</dt><dd>${pl ? 'Bank Światowy' : 'World Bank'} · ${pct(infWb.value, lang)} (${infWb.period}) · ${pl ? 'rocznie' : 'annual'}</dd>
        <dt>${pl ? 'Licencja' : 'Licence'}</dt><dd>CC BY 4.0</dd>
        <dt>URL</dt><dd><span class="fig">zohelo.com/${pl ? '' : 'en/'}indicators/inflation</span></dd></dl></div>
      <div class="aside-card"><h2>${pl ? 'Powiązane' : 'Related'}</h2><p><a href="#">${kpiName('unemployment_rate', lang)}</a><br><a href="#">${pl ? 'Kursy walut NBP' : 'NBP exchange rates'}</a></p></div>
    </aside>
  </div>
</div>`;
  void other;
  return shell({
    lang, product: 'com', title: kpiName('inflation', lang), nav: 0, body,
    alt: pl ? 'com-inflation-en.html' : 'com-inflation.html',
    canonical: `https://zohelo.com/${pl ? '' : 'en/'}indicators/inflation`,
  });
}

async function biKpi(): Promise<string> {
  const lang: Lang = 'pl';
  const ch = await responsive({ series: infSeries(lang), lang, monthly: true, ySuffix: '%' }, [560, 240], [230, 190]);
  saveSpec('bi-kpi-inflation', ch.spec);
  const rows = latest.inflation.values.map((v: any) => `<tr><td>${sourceName(v.source_key, lang)}</td><td>${v.source_key === 'eurostat' ? 'HICP, r/r, miesięcznie' : 'CPI, średnia roczna'}</td><td>${places[v.geography_key][lang]}</td><td>${period(v.period, lang)}</td><td class="n">${pct(v.value, lang)}</td><td class="n">${v.previous_value != null ? pp(v.value - v.previous_value, lang) : '–'}</td><td>${date(v.checked_at, lang)}</td></tr>`).join('');
  const body = `
<div class="wrap">
  <p class="crumbs"><a href="bi-dashboard.html">zohelo BI</a> › <a href="#">Wskaźniki</a> › Ceny</p>
  <header class="ind-head"><p class="kicker">Wskaźnik · kpi_key <span class="fig">inflation</span></p><h1 style="font-size:36px">${kpiName('inflation', 'pl')}</h1>
  <p class="dek" style="font-size:16px">${takeaway('inflation', lang)} (HICP, Eurostat). Strona referencyjna dla analityków: wszystkie źródła, definicje i cytowanie. Publiczne omówienie: <a href="com-inflation.html">zohelo.com/indicators/inflation</a> (kanoniczna).</p></header>
  <div class="actions"><a class="btn primary" href="bi-explorer.html">Otwórz w eksploratorze</a><button class="btn" type="button">${T.pl.cite}</button><button class="btn" type="button">Kopiuj link</button><a class="btn" href="#">CSV</a><a class="btn" href="#">XLSX</a></div>
  <h2 style="font-size:22px;margin-top:24px">Wszystkie źródła, ostatnie wartości</h2>
  <div class="table-wrap" tabindex="0" role="region" aria-label="Ostatnie wartości"><table><thead><tr><th>Źródło</th><th>Definicja</th><th>Obszar</th><th>Okres</th><th class="n">Wartość</th><th class="n">Zmiana</th><th>Sprawdzono</th></tr></thead><tbody>${rows}</tbody></table></div>
  <div class="split" style="margin-top:24px">
    <section><h2 style="font-size:22px">Przebieg według źródła</h2><div class="chart-frame">${ch.html}</div><p class="caption"><span class="legend-key"><i></i>${T.pl.illustrative}</span></p></section>
    <aside><div class="aside-card"><h2>Metadane</h2><dl class="facts">
      <dt>Jednostka</dt><dd>${unit('pct').name_pl} (${unit('pct').symbol})</dd><dt>Częstotliwość</dt><dd>miesięcznie (M)</dd>
      <dt>Dziedzina</dt><dd>Gospodarka › Ceny › Ceny konsumpcyjne</dd><dt>Zakres</dt><dd>${period(catalog.kpis.find((k: any) => k.kpi_key === 'inflation').first_period, lang)} – ${period(inf.period, lang)}</dd>
      <dt>Przekroje</dt><dd>obszar (kraj)</dd><dt>Cytowanie</dt><dd class="meta">zohelo (2026). Inflacja, HICP r/r. Eurostat prc_hicp_manr. zohelo.com/indicators/inflation</dd></dl></div></aside>
  </div>
</div>`;
  return shell({ lang, product: 'bi', title: kpiName('inflation', 'pl'), nav: 2, body });
}

async function biDashboard(): Promise<string> {
  const lang: Lang = 'pl';
  const size: [number, number] = [420, 170];
  const m: [number, number] = [240, 150];
  const a = await responsive({ series: infSeries(lang), lang, monthly: true, ySuffix: '%' }, size, m);
  const b = await responsive({ series: [{ label: 'Polska', role: 'accent', points: annualSeries('unemployment_rate', 'PL', [3.4, 3.0], 2021) }], lang, ySuffix: '%' }, size, m);
  const c = await responsive({ series: [{ label: 'Polska', role: 'accent', points: annualSeries('population', 'PL', [37.9e6, 37.7e6, 36.85e6], 2021, 1e6) }], lang, yFormat: '.1f', ySuffix: ' mln' }, size, m);
  const gdpPts = [
    { t: '2021', v: 576, illustrative: true }, { t: '2022', v: 655, illustrative: true },
    { t: gdp.previous_period, v: gdp.previous_value / 1e3 }, { t: gdp.period, v: gdp.value / 1e3, preliminary: true },
  ];
  const d = await responsive({ series: [{ label: 'Eurostat', role: 'accent', points: gdpPts }], lang, yFormat: ',.0f', ySuffix: ' mld €', zero: true }, size, m);
  saveSpec('bi-dashboard-gdp', d.spec);
  const card = (kicker: string, title: string, meta: string, html: string, href = 'bi-kpi.html') =>
    `<article class="card"><p class="kicker">${kicker}</p><h2>${title}</h2><p class="meta">${meta}</p><div class="chart-frame">${html}</div><p class="meta"><a href="${href}">Wskaźnik</a> · <a href="bi-explorer.html">Eksploruj</a> · <a href="#">CSV</a></p></article>`;
  const body = `
<div class="wrap">
  <header class="ind-head" style="padding-top:28px"><p class="kicker">Pulpit</p><h1 style="font-size:36px">Polska: ceny, praca, ludność</h1>
  <p class="dek" style="font-size:16px">Cztery wskaźniki z ostatnich publikacji. Tytuł każdej karty to wniosek z danych; nazwa wskaźnika jest nad nim. <span class="legend-key"><i></i>${T.pl.illustrative}</span> <span class="legend-key">○ ${T.pl.prelim}</span></p></header>
  <div class="cards">
    ${card('Inflacja HICP r/r · ' + period(inf.period, lang), takeaway('inflation', lang), `${pp(inf.value - inf.previous_value, lang)} ${vs(inf.previous_period, lang)} · Eurostat, Bank Światowy`, a.html)}
    ${card('Stopa bezrobocia (BAEL) · ' + une.period, takeaway('unemployment_rate', lang), `${pp(une.value - une.previous_value, lang)} ${vs(une.previous_period, lang)} · Eurostat`, b.html)}
    ${card('Ludność · ' + pop.period, takeaway('population', lang), `${num(pop.value, lang)} os. · Eurostat`, c.html)}
    ${card('PKB w cenach bieżących · ' + gdp.period, `PKB w cenach bieżących: ${compact(gdp.value * 1e6, lang, 'EUR')} w ${gdp.period} r.`, `dane wstępne · oś od zera · Bank Światowy: ${compact(gdpWb.value, lang, 'USD')}`, d.html)}
  </div>
</div>`;
  return shell({ lang, product: 'bi', title: 'Pulpit', nav: 0, body });
}

async function biExplorer(): Promise<string> {
  const lang: Lang = 'pl';
  const vals = latest.population.values;
  const years = [...new Set(vals.flatMap((v: any) => [v.previous_period, v.period]))].sort() as string[];
  const rowsHtml = vals.map((v: any) => {
    const cells = years.map((y) => {
      const x = y === v.period ? v.value : y === v.previous_period ? v.previous_value : null;
      return `<td class="n">${x == null ? '<span class="meta">–</span>' : num(x, lang)}</td>`;
    }).join('');
    return `<tr><th scope="row" style="text-transform:none;letter-spacing:0;font-size:14px;color:var(--text);border-bottom:1px solid var(--rule)">${places[v.geography_key][lang]}</th><td>${sourceName(v.source_key, lang)}</td>${cells}</tr>`;
  }).join('');
  const ch = await responsive({
    series: [
      { label: 'Mazowieckie', role: 'accent', points: annualSeries('population', 'TERC:14', [], 0, 1e6) },
      { label: 'Małopolskie', role: 'context', points: annualSeries('population', 'TERC:12', [], 0, 1e6) },
    ], lang, yFormat: '.1f', ySuffix: ' mln', zero: true,
  }, [440, 200], [220, 170]);
  saveSpec('bi-explorer-population', ch.spec);
  const body = `
<div class="wrap">
  <div class="explorer">
    <form class="controls" aria-label="Ustawienia widoku" onsubmit="return false">
      <fieldset><legend>Miara</legend><select aria-label="Miara">${catalog.kpis.map((k: any) => `<option${k.kpi_key === 'population' ? ' selected' : ''}>${k.name_pl}</option>`).join('')}</select></fieldset>
      <fieldset><legend>Źródło</legend>${['eurostat', 'gus_bdl', 'world_bank_wdi'].map((s) => `<label><input type="checkbox" ${s !== 'world_bank_wdi' ? 'checked' : ''}> ${sourceName(s, lang)}</label>`).join('')}</fieldset>
      <fieldset><legend>Obszar</legend><label><input type="radio" name="g"> Kraj</label><label><input type="radio" name="g" checked> Kraj i województwa</label></fieldset>
      <fieldset><legend>Układ</legend><label>Wiersze: obszar, źródło</label><label>Kolumny: okres</label><button class="btn" type="button">Zamień wiersze i kolumny</button></fieldset>
      <fieldset><legend>Przekształcenie</legend><select aria-label="Przekształcenie"><option>Wartości</option><option>Zmiana r/r</option><option>Indeks (rok bazowy = 100)</option></select></fieldset>
    </form>
    <section aria-labelledby="ex-title">
      <p class="kicker">Eksplorator · ${kpiName('population', lang)}</p>
      <h1 id="ex-title" style="font-size:32px">Ludność według obszaru i źródła</h1>
      <div class="mobile-filters"><button class="btn" type="button" aria-haspopup="dialog">Filtry (3)</button><span class="chip">Eurostat, GUS</span><span class="chip">Kraj i województwa</span></div>
      <div class="chips" aria-label="Aktywne filtry"><span class="chip">Źródło: Eurostat, GUS ×</span><span class="chip">Obszar: kraj i województwa ×</span><span class="chip">Okres: wszystkie ×</span></div>
      <div class="actions" style="margin-top:0"><button class="btn" aria-pressed="true" type="button">Macierz</button><button class="btn" aria-pressed="false" type="button">Wykres</button><span style="flex:1"></span><button class="btn" type="button">Zapisz widok</button><button class="btn" type="button">CSV</button><button class="btn" type="button">XLSX</button></div>
      <div class="table-wrap" tabindex="0" role="region" aria-label="Macierz"><table><thead><tr><th>Obszar</th><th>Źródło</th>${years.map((y) => `<th class="n">${y}</th>`).join('')}</tr></thead><tbody>${rowsHtml}</tbody></table></div>
      <p class="caption">Liczba osób. Eurostat: stan na 1 stycznia; GUS BDL: stan na 31 grudnia — różne daty, więc wartości kraju i sumy województw nie muszą się zgadzać. Sprawdzono ${date(vals[0].checked_at, lang)}.</p>
      <h2 style="font-size:20px;margin-top:24px">Województwa w fixture (GUS)</h2>
      <div class="chart-frame">${ch.html}</div>
    </section>
  </div>
</div>`;
  return shell({ lang, product: 'bi', title: 'Eksplorator', nav: 1, body });
}

function dataStart(): string {
  const lang: Lang = 'pl';
  const freq: Record<string, string> = { A: 'rocznie', Q: 'kwartalnie', M: 'miesięcznie', D: 'dziennie' };
  const short = (k: string) => ({ eurostat: 'Eurostat', world_bank_wdi: 'Bank Światowy', gus_bdl: 'GUS BDL', nbp: 'NBP' } as Record<string, string>)[k] ?? k;
  const rows = catalog.kpis.map((k: any) => `<tr><td><b>${k.name_pl}</b><br><span class="meta fig">${k.kpi_key}</span></td><td>${k.source_keys.map(short).join(', ')}</td><td>${freq[k.frequency_default] ?? k.frequency_default}</td><td class="n">${k.first_period.slice(0, 4)}–${k.last_period.slice(0, 7)}</td><td style="white-space:nowrap"><span class="status-dot" style="background:${k.status === 'published' ? '#15803d' : '#b45309'}"></span>${k.status === 'published' ? 'opublikowany' : k.status}</td><td style="white-space:nowrap">${date(k.loaded_at, lang)}</td></tr>`).join('');
  const src = catalog.sources.map((s: any) => `<tr><td>${s.name_pl}</td><td class="fig" style="white-space:nowrap">${s.register_id}</td><td>${catalog.licences.find((l: any) => l.licence_key === s.licence_key)?.name ?? s.licence_key}</td></tr>`).join('');
  const body = `
<div class="wrap">
  <header class="ind-head" style="padding-top:28px"><p class="kicker">Narzędzie wewnętrzne</p><h1 style="font-size:36px">Stan danych</h1>
  <p class="dek" style="font-size:16px">Co jest opublikowane, skąd i jak świeże. Bez konfiguracji profilu: start pokazuje dane, edytor SQL jest pod „SQL”.</p></header>
  <div style="margin-top:16px">
    <section><h2 style="font-size:22px;margin-bottom:8px">Wskaźniki w warstwie published</h2>
      <div class="table-wrap" tabindex="0" role="region" aria-label="Wskaźniki"><table><thead><tr><th>Wskaźnik</th><th>Źródła</th><th>Częst.</th><th class="n">Zakres</th><th>Status</th><th>Wczytano</th></tr></thead><tbody>${rows}</tbody></table></div></section>
    <div class="cards"><div class="card"><h2>Ostatnie zmiany</h2><ul class="changes">${changes.items.map((c: any) => `<li style="grid-template-columns:1fr;gap:2px"><span>${c.title_pl}</span><span class="meta">${date(c.at, lang)} · <span class="fig">${c.dataset_key}</span></span></li>`).join('')}</ul></div>
      <div class="card"><h2>Źródła</h2><div class="table-wrap"><table><thead><tr><th>Źródło</th><th>Rejestr</th><th>Licencja</th></tr></thead><tbody>${src}</tbody></table></div></div></div>
  </div>
</div>`;
  return shell({ lang, product: 'data', title: 'Stan danych', nav: 0, body });
}

function index(): string {
  const screens = [
    ['com-home.html', 'zohelo.com — strona główna (PL)'], ['com-inflation.html', 'zohelo.com — /indicators/inflation (PL, kanoniczna)'],
    ['com-inflation-en.html', 'zohelo.com — /en/indicators/inflation (EN)'], ['bi-kpi.html', 'zohelo BI — /kpi/inflation (PL)'],
    ['bi-dashboard.html', 'zohelo BI — pulpit (PL)'], ['bi-explorer.html', 'zohelo BI — eksplorator (PL)'], ['data-start.html', 'zohelo Data — start (PL)'],
  ];
  return `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Prototyp A · Editorial</title><link rel="stylesheet" href="style.css"></head>
<body><main class="wrap" style="padding-top:32px"><p class="kicker">zohelo · design process O17 · krok 2</p><h1>Kierunek A · Editorial</h1>
<p class="dek col">Statystyczna gazeta: wniosek w tytule, jeden wykres na historię, dużo bieli. Prototyp, nigdy nie wdrażany; dane z <code>fixtures/published</code> (syntetyczne).</p>
<ul class="changes col">${screens.map(([h, l]) => `<li style="grid-template-columns:1fr"><a href="${h}">${l}</a></li>`).join('')}</ul></main></body></html>`;
}

const pages: Record<string, string> = {
  'index.html': index(),
  'com-home.html': await comHome(),
  'com-inflation.html': await comInflation('pl'),
  'com-inflation-en.html': await comInflation('en'),
  'bi-kpi.html': await biKpi(),
  'bi-dashboard.html': await biDashboard(),
  'bi-explorer.html': await biExplorer(),
  'data-start.html': dataStart(),
};
for (const [f, html] of Object.entries(pages)) writeFileSync(join(here, f), html);
console.log('built', Object.keys(pages).join(', '));
