// Builds the Instrument prototype: `bun design/prototypes/instrument/build.ts` (after `bun install`).
// Writes static HTML next to this file and the Vega-Lite specs to specs/. Prototype only — never shipped.
// Data, number formatting and takeaway rules are shared with the Editorial prototype (../editorial/data.ts), so the
// two directions differ in design, not in what the numbers say.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { bars, responsive, spark } from './charts';
import {
  annualSeries, catalog, changes, compact, date, inflationSeries, inflationWbSeries, kpiName, latest, num, period,
  places, pct, pp, sourceName, takeaway, unit, vs, type Lang,
} from '../editorial/data';

const here = import.meta.dir;
mkdirSync(join(here, 'specs'), { recursive: true });
const saveSpec = (name: string, spec: any) => writeFileSync(join(here, 'specs', `${name}.vl.json`), JSON.stringify(spec, null, 2));

const T = {
  pl: {
    tagline: 'Polska w danych', skip: 'Przejdź do treści', fixture: 'Dane przykładowe (fixture): wartości, daty i licencje nie są prawdziwe.',
    nav: ['Wskaźniki', 'Regiony', 'Kalendarz', 'Źródła'], bi: ['Pulpity', 'Eksplorator', 'Wskaźniki', 'Katalog'], data: ['Start', 'Tabele', 'Przebiegi', 'SQL'],
    search: 'Szukaj wskaźnika, regionu…', source: 'Źródło', period: 'Okres', published: 'Publikacja', next: 'Następna', loaded: 'Sprawdzono',
    notInFixture: 'brak w fixture', chart: 'Wykres', table: 'Tabela', sources: 'Źródła', meta: 'Metadane',
    copyLink: 'Link', copyChart: 'PNG', cite: 'Cytuj', csv: 'CSV', vsPrev: 'wobec poprzedniego okresu',
    illustrative: 'przerywana: przebieg ilustracyjny (fixture ma dwa ostatnie okresy)', prelim: 'pusty punkt: dane wstępne',
    footer: 'zohelo — otwarte dane publiczne o Polsce. Eurostat, GUS, Bank Światowy, NBP; licencja przy każdej liczbie.',
    menu: 'Menu',
  },
  en: {
    tagline: 'Poland in data', skip: 'Skip to content', fixture: 'Sample data (fixture): values, dates and licences are not real.',
    nav: ['Indicators', 'Regions', 'Calendar', 'Sources'], bi: ['Dashboards', 'Explorer', 'Indicators', 'Catalogue'], data: ['Start', 'Tables', 'Runs', 'SQL'],
    search: 'Search indicators, regions…', source: 'Source', period: 'Period', published: 'Released', next: 'Next', loaded: 'Checked',
    notInFixture: 'not in fixture', chart: 'Chart', table: 'Table', sources: 'Sources', meta: 'Metadata',
    copyLink: 'Link', copyChart: 'PNG', cite: 'Cite', csv: 'CSV', vsPrev: 'vs previous period',
    illustrative: 'dashed: illustrative history (the fixture has the last two periods)', prelim: 'hollow point: preliminary',
    footer: 'zohelo — open public data about Poland. Eurostat, Statistics Poland, World Bank, NBP; licence with every number.',
    menu: 'Menu',
  },
};

type Product = 'com' | 'bi' | 'data';
const productLinks: Record<Product, string> = { com: 'com-home.html', bi: 'bi-dashboard.html', data: 'data-start.html' };
const name = { com: 'zohelo', bi: 'zohelo BI', data: 'zohelo Data' };

function shell(o: { lang: Lang; product: Product; title: string; nav: number; body: string; alt?: string; canonical?: string }) {
  const t = T[o.lang];
  const navItems = o.product === 'com' ? t.nav : o.product === 'bi' ? t.bi : t.data;
  const navHref: Record<Product, string[]> = {
    com: ['com-inflation.html', '#', '#', '#'],
    bi: ['bi-dashboard.html', 'bi-explorer.html', 'bi-kpi.html', '#'],
    data: ['data-start.html', '#', '#', '#'],
  };
  const switcher = (['com', 'bi', 'data'] as Product[])
    .map((p) => `<a href="${productLinks[p]}"${p === o.product ? ' aria-current="page"' : ''}>${name[p]}</a>`)
    .join('');
  const langLink = o.alt
    ? `<a class="lang" href="${o.alt}" hreflang="${o.lang === 'pl' ? 'en' : 'pl'}">${o.lang === 'pl' ? 'EN' : 'PL'}</a>`
    : `<a class="lang" href="#" aria-disabled="true">${o.lang === 'pl' ? 'EN' : 'PL'}</a>`;
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
<div class="fixture" role="note">${t.fixture} <a href="index.html">Prototyp B · Instrument</a></div>
<header class="bar"><div class="wrap">
  <a class="brand" href="${productLinks[o.product]}">${name[o.product]}<small>${t.tagline}</small></a>
  <nav class="switch" aria-label="${o.lang === 'pl' ? 'Produkty zohelo' : 'zohelo products'}">${switcher}</nav>
  <nav class="main" aria-label="${o.lang === 'pl' ? 'Główna' : 'Main'}">${navItems.map((n, i) => `<a href="${navHref[o.product][i]}"${i === o.nav ? ' aria-current="page"' : ''}>${n}</a>`).join('')}</nav>
  <div class="tools"><div class="search" role="search"><span>${t.search}</span><kbd>/</kbd></div>${langLink}<button class="btn menu-btn" type="button" aria-expanded="false" aria-label="${t.menu}">☰</button></div>
</div></header>
<main id="main" class="wrap">
${o.body}
</main>
<footer class="site"><div class="wrap"><p>${t.footer}</p><p><a href="#">${o.lang === 'pl' ? 'Licencje i cytowanie' : 'Licences and citation'}</a> · <a href="#">${o.lang === 'pl' ? 'Metodologia' : 'Methodology'}</a> · <a href="#">RSS</a> · <a href="#">API</a></p></div></footer>
</body>
</html>
`;
}

const inf = latest.inflation.values.find((v: any) => v.source_key === 'eurostat');
const infWb = latest.inflation.values.find((v: any) => v.source_key === 'world_bank_wdi');
const une = latest.unemployment_rate.values.find((v: any) => v.geography_key === 'PL');
const uneMal = latest.unemployment_rate.values.find((v: any) => v.geography_key === 'TERC:12');
const pop = latest.population.values.find((v: any) => v.geography_key === 'PL');
const popMal = latest.population.values.find((v: any) => v.geography_key === 'TERC:12');
const popMaz = latest.population.values.find((v: any) => v.geography_key === 'TERC:14');
const gdp = latest.gdp_current_prices.values.find((v: any) => v.source_key === 'eurostat');
const gdpWb = latest.gdp_current_prices.values.find((v: any) => v.source_key === 'world_bank_wdi');
const gdpPts = [
  { t: '2021', v: 576, illustrative: true }, { t: '2022', v: 655, illustrative: true },
  { t: gdp.previous_period, v: gdp.previous_value / 1e3 }, { t: gdp.period, v: gdp.value / 1e3, preliminary: true },
];
const uneSeries = () => annualSeries('unemployment_rate', 'PL', [3.4, 3.0], 2021);
const popSeries = () => annualSeries('population', 'PL', [37.9e6, 37.7e6, 36.85e6], 2021, 1e6);

const arrow = (d: number, lang: Lang) => (d > 0 ? `<span class="arrow">▲</span> ${lang === 'pl' ? 'wzrost' : 'up'}` : d < 0 ? `<span class="arrow">▼</span> ${lang === 'pl' ? 'spadek' : 'down'}` : `<span class="arrow">▬</span> ${lang === 'pl' ? 'bez zmian' : 'unchanged'}`);

type TileOpts = { key: string; lang: Lang; v: any; isRate: boolean; unitLabel: string; sparkPts: any[]; zero?: boolean; href?: string; def?: string; src: string; scale?: number; currency?: string };

/** The tile: label + key, value + unit, change (p.p. for rates, unit for levels) + direction word, sparkline, period + source. */
async function tile(o: TileOpts): Promise<string> {
  const t = T[o.lang];
  const sp = await spark(o.sparkPts, o.lang, !!o.zero);
  const d = o.v.previous_value != null ? o.v.value - o.v.previous_value : null;
  const value = o.isRate ? num(o.v.value, o.lang, 1) : compact(o.v.value * (o.scale ?? 1), o.lang, o.currency);
  const change = d == null ? `<span class="meta">${t.vsPrev}: ${t.notInFixture}</span>`
    : o.isRate ? `<b>${pp(d, o.lang)}</b> ${arrow(d, o.lang)} <span class="meta">${vs(o.v.previous_period, o.lang)}</span>`
      : `<b>${d > 0 ? '+' : '−'}${compact(Math.abs(d) * (o.scale ?? 1), o.lang, o.currency)}</b> ${arrow(d, o.lang)} <span class="meta">${vs(o.v.previous_period, o.lang)}</span>`;
  const prelim = (o.v.flags ?? []).includes('p') ? ` <span class="flag">${o.lang === 'pl' ? 'wstępne' : 'prelim.'}</span>` : '';
  return `<a class="tile" href="${o.href ?? '#'}" title="${o.isRate ? '' : num(o.v.value, o.lang) + ' ' + o.unitLabel}">
  <span class="label"><span>${kpiName(o.key, o.lang)}${o.def ? ` · ${o.def}` : ''}</span><span class="k">${o.key}</span></span>
  <span class="value">${value}<small>${o.isRate ? (o.currency ? '' : o.unitLabel) : o.currency ? '' : o.unitLabel}</small>${prelim}</span>
  <span class="change">${change}</span>
  <span class="spark">${sp.html}</span>
  <span class="prov"><span class="fig">${period(o.v.period, o.lang)}</span><span>${o.src}</span></span>
</a>`;
}

async function board(lang: Lang): Promise<string> {
  const pl = lang === 'pl';
  return [
    await tile({ key: 'inflation', lang, v: inf, isRate: true, unitLabel: '%', sparkPts: inflationSeries(), href: pl ? 'com-inflation.html' : 'com-inflation-en.html', def: pl ? 'HICP r/r' : 'HICP y/y', src: 'Eurostat' }),
    await tile({ key: 'unemployment_rate', lang, v: une, isRate: true, unitLabel: '%', sparkPts: uneSeries(), def: pl ? 'BAEL' : 'LFS', src: 'Eurostat' }),
    await tile({ key: 'population', lang, v: pop, isRate: false, unitLabel: pl ? 'os.' : 'persons', sparkPts: popSeries(), def: pl ? '31 grudnia' : '31 December', src: 'GUS BDL' }),
    await tile({ key: 'gdp_current_prices', lang, v: gdp, isRate: false, unitLabel: 'EUR', sparkPts: gdpPts, zero: true, scale: 1e6, currency: 'EUR', def: pl ? 'ceny bieżące' : 'current prices', src: 'Eurostat' }),
  ].join('');
}

function changesTable(lang: Lang, n = 6): string {
  const items = [...changes.items, ...changes.items, ...changes.items].slice(0, n);
  return `<div class="table-wrap"><table><thead><tr><th>${lang === 'pl' ? 'Data' : 'Date'}</th><th>${T[lang].source}</th><th>${lang === 'pl' ? 'Zbiór' : 'Dataset'}</th><th>${lang === 'pl' ? 'Co się zmieniło' : 'What changed'}</th></tr></thead><tbody>${items
    .map((c: any, i: number) => `<tr><td class="fig" style="white-space:nowrap">${date(c.at, lang)}</td><td>${sourceName(c.source_key, lang)}</td><td class="fig">${c.dataset_key}</td><td><a href="#">${lang === 'pl' ? c.title_pl : c.title_en}</a>${i >= changes.items.length ? ` <span class="meta">(${lang === 'pl' ? 'powtórzone dla gęstości' : 'repeated for density'})</span>` : ''}</td></tr>`)
    .join('')}</tbody></table></div>`;
}

async function comHome(): Promise<string> {
  const lang: Lang = 'pl';
  const t = T.pl;
  const ch = await responsive({ series: [{ label: 'HICP r/r', role: 'accent', points: inflationSeries() }], lang, monthly: true, ySuffix: '%' }, [620, 200], [330, 170]);
  saveSpec('home-inflation', ch.spec);
  const rk = await bars({ rows: [
    { name: 'Małopolskie', v: uneMal.value, hi: true }, { name: 'Polska', v: une.value },
  ], width: 300, height: 52, suffix: '%' }, lang);
  saveSpec('home-regions', rk.spec);
  const body = `
<div class="head"><div><h1>Dziś w danych</h1><p class="meta">Ostatnie wartości czterech wskaźników z publikacji GUS, Eurostatu, NBP i Banku Światowego · ${t.loaded} <span class="fig">${date(inf.checked_at, lang)}</span></p></div>
<div class="toolbar"><a class="btn" href="#">Kalendarz publikacji</a><a class="btn" href="#">RSS</a><a class="btn" href="bi-dashboard.html">zohelo BI →</a></div></div>
<p class="sr">zohelo — Polska w danych</p>
<section aria-label="Tablica wskaźników" class="board">${await board(lang)}</section>
<div class="grid-3">
  <section class="panel" aria-labelledby="lead"><h2 id="lead"><span>${takeaway('inflation', lang)}</span><span class="meta">HICP r/r · Eurostat</span></h2>
    <p class="meta">${pp(inf.value - inf.previous_value, lang)} ${vs(inf.previous_period, lang)} (${pct(inf.previous_value, lang)}). ${t.published}: ${t.notInFixture} · ${t.next}: ${t.notInFixture}.</p>
    <div style="margin-top:8px">${ch.html}</div>
    <p class="caption"><span class="legend-key"><i></i>${t.illustrative}</span> · Źródło: Eurostat prc_hicp_manr · <a href="com-inflation.html">Cały wskaźnik: definicja, tabela, pobieranie →</a></p>
  </section>
  <div class="stack">
    <section class="panel" aria-labelledby="reg"><h2 id="reg"><span>Regiony: bezrobocie (BAEL)</span><span class="meta fig">${une.period}</span></h2>
      ${rk.html}
      <p class="caption">Województwa (NUTS 2) w fixture: jedno. Pełna lista 16 regionów i mapa pojawią się z danymi. Małopolskie: <span class="flag">wstępne</span></p>
      <p class="meta" style="margin-top:6px"><a href="#">Wszystkie regiony →</a></p></section>
    <section class="panel" aria-labelledby="about"><h2 id="about">Co to jest zohelo</h2>
      <p style="font-size:13px">Dane publiczne o Polsce — GUS, Eurostat, NBP, Bank Światowy — w jednym miejscu, z okresem, źródłem i licencją przy każdej liczbie. Wskaźniki i regiony na zohelo.com; przekroje, porównania i eksport w <a href="bi-dashboard.html">zohelo BI</a>; tabele i API w <a href="data-start.html">zohelo Data</a>.</p></section>
  </div>
</div>
<section class="panel" style="margin-top:12px" aria-labelledby="chg"><h2 id="chg"><span>Ostatnie publikacje i zmiany w danych</span><span class="meta"><a href="#">Wszystkie zmiany</a> · <a href="#">Subskrybuj .ics</a></span></h2>
  ${changesTable(lang)}
</section>`;
  return shell({ lang, product: 'com', title: 'Polska w danych', nav: -1, body });
}

async function comInflation(lang: Lang): Promise<string> {
  const t = T[lang];
  const pl = lang === 'pl';
  const ch = await responsive({ series: [{ label: pl ? 'HICP r/r' : 'HICP y/y', role: 'accent', points: inflationSeries() }], lang, monthly: true, ySuffix: '%' }, [760, 240], [330, 190]);
  saveSpec(`indicator-inflation-${lang}`, ch.spec);
  const wb = await responsive({ series: [{ label: 'CPI WB', role: 'second', points: inflationWbSeries() }], lang, ySuffix: '%' }, [240, 90], [330, 90]);
  const hicp = await responsive({ series: [{ label: 'HICP', role: 'accent', points: inflationSeries().slice(-13) }], lang, monthly: true, ySuffix: '%' }, [240, 90], [330, 90]);
  const rows = inflationSeries().slice(-8).reverse()
    .map((p, i) => `<tr${i === 0 ? ' class="hi"' : ''}><td class="fig">${period(p.t, lang)}</td><td class="n">${pct(p.v, lang)}</td><td class="n">${i < 7 ? pp(p.v - inflationSeries().slice(-8).reverse()[i + 1].v, lang) : '–'}</td><td>${p.illustrative ? `<span class="meta">${pl ? 'ilustracyjne' : 'illustrative'}</span>` : 'Eurostat'}</td></tr>`).join('');
  const d = inf.value - inf.previous_value;
  const body = `
<p class="crumbs"><a href="com-home.html">zohelo</a> › <a href="#">${pl ? 'Wskaźniki' : 'Indicators'}</a> › <a href="#">${pl ? 'Ceny' : 'Prices'}</a></p>
<div class="head"><div><p class="meta">${kpiName('inflation', lang)} · <span class="fig">inflation</span> · HICP ${pl ? 'r/r' : 'y/y'} · Eurostat</p><h1>${takeaway('inflation', lang)}</h1></div>
<div class="toolbar" role="group" aria-label="${pl ? 'Akcje' : 'Actions'}"><button class="btn" type="button">${t.copyLink}</button><button class="btn" type="button">${t.copyChart}</button><button class="btn" type="button">${t.cite}</button><a class="btn" href="#">${t.csv}</a><a class="btn primary" href="bi-kpi.html">zohelo BI →</a></div></div>
<div class="grid-3" style="margin-top:0">
  <section class="panel" aria-labelledby="key-h"><h2 id="key-h" class="sr">${pl ? 'Wartość' : 'Value'}</h2>
    <div class="key"><p class="big">${num(inf.value, lang, 1)}<small>% ${pl ? 'r/r' : 'y/y'}</small></p>
      <p class="change" style="font-size:14px"><b class="fig">${pp(d, lang)}</b> ${arrow(d, lang)} <span class="meta">${vs(inf.previous_period, lang)} (${pct(inf.previous_value, lang)})</span></p>
      <dl class="facts"><dt>${t.period}</dt><dd class="fig">${period(inf.period, lang)}</dd><dt>${t.published}</dt><dd><i>${t.notInFixture}</i></dd><dt>${t.next}</dt><dd><i>${t.notInFixture}</i></dd><dt>${t.source}</dt><dd>Eurostat · prc_hicp_manr · CC BY 4.0</dd></dl></div>
    <nav class="tabs" aria-label="${pl ? 'Widok' : 'View'}"><a href="#" aria-current="page">${t.chart}</a><a href="#tabela">${t.table}</a><a href="#zrodla">${t.sources}</a><a href="#meta">${t.meta}</a></nav>
    <figure style="margin:0"><figcaption class="sr">${takeaway('inflation', lang)}. ${pl ? 'Tabela danych poniżej.' : 'Data table below.'}</figcaption>${ch.html}
      <p class="caption"><span class="legend-key"><i></i>${t.illustrative}</span> · ${t.loaded} ${date(inf.checked_at, lang)}</p></figure>
    <h3 style="margin-top:12px">${pl ? 'Ten sam wskaźnik, inne definicje' : 'Same indicator, other definitions'}</h3>
    <div class="multiples" style="margin-top:6px">
      <div class="m"><h3><span>HICP ${pl ? 'r/r, miesięcznie' : 'y/y, monthly'}</span><span class="n">${pct(inf.value, lang)}</span></h3>${hicp.html}<p class="caption">Eurostat · ${period(inf.period, lang)}</p></div>
      <div class="m"><h3><span>CPI ${pl ? 'średnio w roku' : 'annual avg'}</span><span class="n">${pct(infWb.value, lang)}</span></h3>${wb.html}<p class="caption">${pl ? 'Bank Światowy' : 'World Bank'} · ${infWb.period}</p></div>
      <div class="m"><h3><span>CPI GUS ${pl ? 'r/r' : 'y/y'}</span><span class="n">–</span></h3><p class="meta" style="padding:24px 0">${pl ? 'Nagłówek krajowy (reguła 10) — brak w fixture.' : 'The Polish headline (rule 10) — not in the fixture.'}</p></div>
    </div>
    <h2 id="tabela" style="margin-top:14px">${t.table}</h2>
    <div class="table-wrap" tabindex="0" role="region" aria-label="${t.table}" style="margin-top:6px"><table><thead><tr><th>${t.period}</th><th class="n">HICP ${pl ? 'r/r' : 'y/y'}</th><th class="n">${pl ? 'Zmiana m/m' : 'Change m/m'}</th><th>${t.source}</th></tr></thead><tbody>${rows}</tbody></table></div>
  </section>
  <div class="stack">
    <details open><summary>${pl ? 'Jak czytać' : 'How to read'}</summary><div><ul style="margin:0;padding-left:18px">
      <li>${pl ? 'Zmiana cen <b>rok do roku</b>: koszyk kosztuje o 2,9% więcej niż rok wcześniej, nie w miesiąc.' : '<b>Year-on-year</b> change: the basket costs 2.9% more than a year earlier, not in a month.'}</li>
      <li>${pl ? 'Spadek inflacji = wolniejszy wzrost cen. Zmiany stopy w <b>p.p.</b>' : 'Falling inflation = prices rise more slowly. Rate changes in <b>pp</b>.'}</li>
      <li>${pl ? 'Nagłówek krajowy to <b>CPI GUS</b>; HICP służy do porównań w UE.' : 'The Polish headline is <b>Statistics Poland CPI</b>; HICP is for EU comparisons.'}</li></ul></div></details>
    <section class="panel" id="meta" aria-labelledby="meta-h"><h2 id="meta-h">${t.meta}</h2><dl class="facts">
      <dt>kpi_key</dt><dd class="fig">inflation</dd><dt>${pl ? 'Jednostka' : 'Unit'}</dt><dd>${unit('pct')[pl ? 'name_pl' : 'name_en']} (%)</dd><dt>${pl ? 'Częstotliwość' : 'Frequency'}</dt><dd>${pl ? 'miesięcznie' : 'monthly'} (M)</dd>
      <dt>${pl ? 'Zakres' : 'Range'}</dt><dd class="fig">${period(catalog.kpis.find((k: any) => k.kpi_key === 'inflation').first_period, lang)} – ${period(inf.period, lang)}</dd>
      <dt>${pl ? 'Dziedzina' : 'Domain'}</dt><dd>${pl ? 'Gospodarka › Ceny' : 'Economy › Prices'}</dd><dt>URL</dt><dd class="fig">zohelo.com/${pl ? '' : 'en/'}indicators/inflation</dd></dl></section>
    <section class="panel" id="zrodla" aria-labelledby="src-h"><h2 id="src-h">${t.sources}</h2>
      <div class="table-wrap"><table><thead><tr><th>${t.source}</th><th class="n">${pl ? 'Wartość' : 'Value'}</th><th>${t.period}</th></tr></thead><tbody>
        <tr class="hi"><td>Eurostat · HICP</td><td class="n">${pct(inf.value, lang)}</td><td class="fig">${period(inf.period, lang)}</td></tr>
        <tr><td>${pl ? 'Bank Światowy' : 'World Bank'} · CPI</td><td class="n">${pct(infWb.value, lang)}</td><td class="fig">${infWb.period}</td></tr></tbody></table></div>
      <p class="caption">${pl ? 'Cytuj: zohelo (2026). Inflacja, HICP r/r. Eurostat prc_hicp_manr.' : 'Cite: zohelo (2026). Inflation, HICP y/y. Eurostat prc_hicp_manr.'}</p></section>
    <section class="panel" aria-labelledby="rel-h"><h2 id="rel-h">${pl ? 'Powiązane' : 'Related'}</h2><p style="font-size:13px"><a href="#">${kpiName('unemployment_rate', lang)}</a><br><a href="#">${pl ? 'Kursy walut NBP' : 'NBP exchange rates'}</a><br><a href="bi-explorer.html">${pl ? 'Porównaj kraje UE w eksploratorze' : 'Compare EU countries in the explorer'}</a></p></section>
  </div>
</div>`;
  return shell({
    lang, product: 'com', title: kpiName('inflation', lang), nav: 0, body,
    alt: pl ? 'com-inflation-en.html' : 'com-inflation.html',
    canonical: `https://zohelo.com/${pl ? '' : 'en/'}indicators/inflation`,
  });
}

async function biKpi(): Promise<string> {
  const lang: Lang = 'pl';
  const t = T.pl;
  const a = await responsive({ series: [{ label: 'HICP', role: 'accent', points: inflationSeries() }], lang, monthly: true, ySuffix: '%' }, [300, 110], [330, 110]);
  const b = await responsive({ series: [{ label: 'CPI WB', role: 'second', points: inflationWbSeries() }], lang, ySuffix: '%' }, [300, 110], [330, 110]);
  saveSpec('bi-kpi-inflation', a.spec);
  const rows = latest.inflation.values.map((v: any, i: number) => `<tr${i === 0 ? ' class="hi"' : ''}><td>${sourceName(v.source_key, lang)}</td><td>${v.source_key === 'eurostat' ? 'HICP, r/r, miesięcznie' : 'CPI, średnia roczna'}</td><td class="fig">${v.source_key === 'eurostat' ? 'prc_hicp_manr' : 'FP.CPI.TOTL.ZG'}</td><td>${places[v.geography_key][lang]}</td><td class="fig">${period(v.period, lang)}</td><td class="n">${pct(v.value, lang)}</td><td class="n">${v.previous_value != null ? pp(v.value - v.previous_value, lang) : '–'}</td><td class="fig">${date(v.checked_at, lang)}</td><td>CC BY 4.0</td></tr>`).join('');
  const body = `
<p class="crumbs"><a href="bi-dashboard.html">zohelo BI</a> › <a href="#">Wskaźniki</a> › Ceny</p>
<div class="head"><div><p class="meta">Strona referencyjna · <span class="fig">kpi_key = inflation</span> · kanoniczna strona publiczna: <a href="com-inflation.html">zohelo.com/indicators/inflation</a></p><h1>${kpiName('inflation', 'pl')}</h1></div>
<div class="toolbar"><a class="btn primary" href="bi-explorer.html">Otwórz w eksploratorze</a><button class="btn" type="button">${t.cite}</button><button class="btn" type="button">${t.copyLink}</button><a class="btn" href="#">CSV</a><a class="btn" href="#">XLSX</a><a class="btn" href="#">API</a></div></div>
<div class="grid-3" style="margin-top:0">
  <div class="stack">
    <section class="panel"><h2><span>Źródła i ostatnie wartości</span><span class="meta">${takeaway('inflation', lang)}</span></h2>
      <div class="table-wrap" tabindex="0" role="region" aria-label="Ostatnie wartości"><table><thead><tr><th>Źródło</th><th>Definicja</th><th>Zbiór</th><th>Obszar</th><th>Okres</th><th class="n">Wartość</th><th class="n">Zmiana</th><th>Sprawdzono</th><th>Licencja</th></tr></thead><tbody>${rows}</tbody></table></div></section>
    <section class="panel"><h2>Przebieg według źródła <span class="meta">małe wielokrotności, wspólna oś %</span></h2>
      <div class="multiples cols-2">
        <div class="m"><h3><span>Eurostat · HICP r/r</span><span class="n">${pct(inf.value, lang)}</span></h3>${a.html}</div>
        <div class="m"><h3><span>Bank Światowy · CPI średnio w roku</span><span class="n">${pct(infWb.value, lang)}</span></h3>${b.html}</div>
      </div><p class="caption"><span class="legend-key"><i></i>${t.illustrative}</span> · różne definicje nie są łączone na jednym wykresie (reguła 6)</p></section>
  </div>
  <div class="stack">
    <section class="panel"><h2>Metadane</h2><dl class="facts">
      <dt>Jednostka</dt><dd>${unit('pct').name_pl} (${unit('pct').symbol})</dd><dt>Częstotliwość</dt><dd>miesięcznie (M)</dd>
      <dt>Dziedzina</dt><dd>Gospodarka › Ceny › Ceny konsumpcyjne</dd><dt>Zakres</dt><dd class="fig">${period(catalog.kpis.find((k: any) => k.kpi_key === 'inflation').first_period, lang)} – ${period(inf.period, lang)}</dd>
      <dt>Przekroje</dt><dd>obszar (kraj); kraje UE w eksploratorze</dd><dt>Status</dt><dd><span class="dot" style="background:#15803d"></span>opublikowany</dd>
      <dt>Publikacja</dt><dd><i>${t.notInFixture}</i></dd><dt>Następna</dt><dd><i>${t.notInFixture}</i></dd></dl></section>
    <section class="panel"><h2>Cytowanie</h2><p class="meta" style="font-family:var(--fig)">zohelo (2026). Inflacja, HICP r/r [inflation]. Eurostat prc_hicp_manr, Bank Światowy FP.CPI.TOTL.ZG. https://zohelo.com/indicators/inflation</p><p style="margin-top:8px"><button class="btn" type="button">Kopiuj cytat</button> <button class="btn" type="button">BibTeX</button></p></section>
    <section class="panel"><h2>Pulpity z tym wskaźnikiem</h2><p style="font-size:13px"><a href="bi-dashboard.html">Polska: ceny, praca, ludność</a></p></section>
  </div>
</div>`;
  return shell({ lang, product: 'bi', title: kpiName('inflation', 'pl'), nav: 2, body });
}

async function biDashboard(): Promise<string> {
  const lang: Lang = 'pl';
  const t = T.pl;
  const size: [number, number] = [300, 120];
  const m: [number, number] = [330, 120];
  const a = await responsive({ series: [{ label: 'HICP', role: 'accent', points: inflationSeries() }], lang, monthly: true, ySuffix: '%' }, size, m);
  const b = await responsive({ series: [{ label: 'Polska', role: 'accent', points: uneSeries() }], lang, ySuffix: '%' }, size, m);
  const c = await responsive({ series: [{ label: 'Polska', role: 'accent', points: popSeries() }], lang, yFormat: '.1f', ySuffix: ' mln' }, size, m);
  const d = await responsive({ series: [{ label: 'Eurostat', role: 'accent', points: gdpPts }], lang, yFormat: ',.0f', ySuffix: ' mld €', zero: true }, size, m);
  saveSpec('bi-dashboard-gdp', d.spec);
  const rk = await bars({ rows: [
    { name: 'Mazowieckie', v: popMaz.value / 1e6, hi: true }, { name: 'Małopolskie', v: popMal.value / 1e6 },
  ], width: 300, height: 52, suffix: ' mln' }, lang);
  const mult = (title: string, val: string, meta: string, html: string) => `<div class="m"><h3><span>${title}</span><span class="n">${val}</span></h3><p class="meta">${meta}</p>${html}</div>`;
  const body = `
<div class="head"><div><p class="meta">Pulpit · 4 wskaźniki · ${t.loaded} <span class="fig">${date(inf.checked_at, lang)}</span></p><h1>Polska: ceny, praca, ludność</h1></div>
<div class="toolbar"><label class="meta">Okres <select class="btn" aria-label="Okres"><option>ostatnie 3 lata</option><option>5 lat</option><option>10 lat</option></select></label><label class="meta">Obszar <select class="btn" aria-label="Obszar"><option>Polska</option><option>Województwa</option></select></label><button class="btn" type="button">Zapisz widok</button><button class="btn" type="button">${t.copyLink}</button><a class="btn" href="#">CSV</a></div></div>
<section aria-label="Tablica wskaźników" class="board">${await board(lang)}</section>
<section class="panel" style="margin-top:12px"><h2><span>Przebiegi</span><span class="meta"><span class="legend-key"><i></i>${t.illustrative}</span> · ${t.prelim}</span></h2>
  <div class="multiples cols-4">
    ${mult('Inflacja HICP r/r', pct(inf.value, lang), `${takeaway('inflation', lang)} · ${pp(inf.value - inf.previous_value, lang)}`, a.html)}
    ${mult('Stopa bezrobocia (BAEL)', pct(une.value, lang), `${takeaway('unemployment_rate', lang)} · ${pp(une.value - une.previous_value, lang)}`, b.html)}
    ${mult('Ludność', compact(pop.value, lang), `${takeaway('population', lang)} · −${num(pop.previous_value - pop.value, lang)}`, c.html)}
    ${mult('PKB w cenach bieżących', compact(gdp.value * 1e6, lang, 'EUR'), `oś od zera (reguła 8) · dane wstępne · BŚ: ${compact(gdpWb.value, lang, 'USD')}`, d.html)}
  </div></section>
<div class="grid-2">
  <section class="panel"><h2><span>Województwa: ludność</span><span class="meta fig">${popMaz.period} · GUS BDL</span></h2>${rk.html}<p class="caption">Fixture ma 2 z 16 województw. Mapa w tej samej skali teal (ramp 1–6) pojawi się z pełnymi danymi.</p></section>
  <section class="panel"><h2><span>Tabela pulpitu</span><span class="meta"><a href="#">CSV</a> · <a href="#">XLSX</a></span></h2>
    <div class="table-wrap"><table><thead><tr><th>Wskaźnik</th><th>Okres</th><th class="n">Wartość</th><th class="n">Zmiana</th><th>Źródło</th></tr></thead><tbody>
      <tr><td><a href="bi-kpi.html">Inflacja HICP r/r</a></td><td class="fig">${period(inf.period, lang)}</td><td class="n">${pct(inf.value, lang)}</td><td class="n">${pp(inf.value - inf.previous_value, lang)}</td><td>Eurostat</td></tr>
      <tr><td>Stopa bezrobocia (BAEL)</td><td class="fig">${une.period}</td><td class="n">${pct(une.value, lang)}</td><td class="n">${pp(une.value - une.previous_value, lang)}</td><td>Eurostat</td></tr>
      <tr><td>Ludność</td><td class="fig">${pop.period}</td><td class="n">${num(pop.value, lang)}</td><td class="n">−${num(pop.previous_value - pop.value, lang)}</td><td>GUS BDL</td></tr>
      <tr><td>PKB w cenach bieżących (mln EUR)</td><td class="fig">${gdp.period} <span class="flag">wstępne</span></td><td class="n">${num(gdp.value, lang)}</td><td class="n">+${num(gdp.value - gdp.previous_value, lang)}</td><td>Eurostat</td></tr>
    </tbody></table></div></section>
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
    const d = v.value - v.previous_value;
    return `<tr${v.geography_key === 'PL' ? ' class="hi"' : ''}><td>${places[v.geography_key][lang]}</td><td>${sourceName(v.source_key, lang)}</td>${cells}<td class="n">${d > 0 ? '+' : '−'}${num(Math.abs(d), lang)}</td><td class="n">${num((d / v.previous_value) * 100, lang, 2)}%</td></tr>`;
  }).join('');
  const sm = await Promise.all(vals.map((v: any) => responsive({ series: [{ label: places[v.geography_key][lang], role: v.geography_key === 'PL' ? 'accent' : 'second', points: annualSeries('population', v.geography_key, [], 0, 1e6) }], lang, yFormat: '.2f', ySuffix: ' mln', zero: true }, [300, 100], [330, 100])));
  saveSpec('bi-explorer-population', sm[0].spec);
  const body = `
<div class="head" style="padding-bottom:4px"><div><p class="meta">Eksplorator · <span class="fig">population</span> · GUS BDL</p><h1>Ludność według obszaru i okresu</h1></div>
<div class="toolbar"><button class="btn" aria-pressed="true" type="button">Macierz</button><button class="btn" aria-pressed="false" type="button">Małe wielokrotności</button><button class="btn" aria-pressed="false" type="button">Mapa</button><span style="width:8px"></span><button class="btn" type="button">Zapisz widok</button><button class="btn" type="button">Link</button><a class="btn" href="#">CSV</a><a class="btn" href="#">XLSX</a><a class="btn" href="#">API</a></div></div>
<section class="panel" aria-label="Ustawienia widoku" style="padding:4px 14px">
  <form class="filters" onsubmit="return false">
    <label>Miara <select aria-label="Miara">${catalog.kpis.map((k: any) => `<option${k.kpi_key === 'population' ? ' selected' : ''}>${k.name_pl}</option>`).join('')}</select></label>
    <label>Źródło <select aria-label="Źródło"><option>GUS BDL</option><option>Eurostat</option><option>wszystkie</option></select></label>
    <label>Obszar <select aria-label="Obszar"><option>kraj i województwa</option><option>kraj</option><option>powiaty</option></select></label>
    <label>Okres <select aria-label="Okres"><option>2023–2024</option><option>10 lat</option><option>wszystko</option></select></label>
    <label>Przekształcenie <select aria-label="Przekształcenie"><option>wartości</option><option>zmiana r/r</option><option>indeks (2020 = 100)</option></select></label>
    <span class="chip">wiersze: <b>obszar, źródło</b></span><span class="chip">kolumny: <b>okres</b></span><button class="btn" type="button">⇄ zamień</button>
  </form>
</section>
<div class="grid-3" style="margin-top:12px">
  <section class="panel" aria-labelledby="mx"><h2 id="mx"><span>Macierz</span><span class="meta">${vals.length} wiersze · ${years.length} kolumny · liczba osób, stan na 31 grudnia</span></h2>
    <div class="table-wrap" tabindex="0" role="region" aria-label="Macierz"><table><thead><tr><th>Obszar</th><th>Źródło</th>${years.map((y) => `<th class="n">${y}</th>`).join('')}<th class="n">Zmiana</th><th class="n">Zmiana %</th></tr></thead><tbody>${rowsHtml}</tbody></table></div>
    <p class="caption">GUS BDL: stan na 31 grudnia. Eurostat (stan na 1 stycznia) różni się definicją — przy obu źródłach legenda nazywa definicję (reguła 6). ${T.pl.loaded} ${date(vals[0].checked_at, lang)}.</p></section>
  <div class="stack">
    <section class="panel" aria-labelledby="sm-h"><h2 id="sm-h"><span>Małe wielokrotności</span><span class="meta">mln os., oś od zera</span></h2>
      <div class="multiples cols-1">${vals.map((v: any, i: number) => `<div class="m"><h3><span>${places[v.geography_key][lang]}</span><span class="n">${compact(v.value, lang)}</span></h3>${sm[i].html}</div>`).join('')}</div></section>
  </div>
</div>`;
  return shell({ lang, product: 'bi', title: 'Eksplorator', nav: 1, body });
}

function dataStart(): string {
  const lang: Lang = 'pl';
  const freq: Record<string, string> = { A: 'rocznie', Q: 'kwartalnie', M: 'miesięcznie', D: 'dziennie' };
  const short = (k: string) => ({ eurostat: 'Eurostat', world_bank_wdi: 'Bank Światowy', gus_bdl: 'GUS BDL', nbp: 'NBP' } as Record<string, string>)[k] ?? k;
  const rows = catalog.kpis.map((k: any) => `<tr><td><b>${k.name_pl}</b><br><span class="meta fig">${k.kpi_key}</span></td><td>${k.source_keys.map(short).join(', ')}</td><td>${freq[k.frequency_default] ?? k.frequency_default}</td><td class="n">${k.first_period.slice(0, 4)}–${k.last_period.slice(0, 7)}</td><td style="white-space:nowrap"><span class="dot" style="background:${k.status === 'published' ? '#15803d' : '#b45309'}"></span>${k.status === 'published' ? 'opublikowany' : k.status}</td><td class="fig" style="white-space:nowrap">${date(k.loaded_at, lang)}</td><td><a href="#">SQL</a> · <a href="#">parquet</a></td></tr>`).join('');
  const src = catalog.sources.map((s: any) => `<tr><td>${s.name_pl}</td><td class="fig" style="white-space:nowrap">${s.register_id}</td><td>${catalog.licences.find((l: any) => l.licence_key === s.licence_key)?.name ?? s.licence_key}</td><td class="fig">${date(changes.items[0].at, lang)}</td><td><span class="dot" style="background:#15803d"></span>ok</td></tr>`).join('');
  const body = `
<div class="head"><div><p class="meta">Narzędzie wewnętrzne · warstwa <span class="fig">06_published/v1</span></p><h1>Stan danych</h1></div>
<div class="toolbar"><a class="btn primary" href="#">SQL</a><a class="btn" href="#">Tabele</a><a class="btn" href="#">Przebiegi</a><a class="btn" href="#">Katalog JSON</a></div></div>
<div class="board">
  <div class="tile" style="min-height:auto"><span class="label">Wskaźniki opublikowane</span><span class="value">${catalog.kpis.filter((k: any) => k.status === 'published').length}<small>z ${catalog.kpis.length}</small></span><span class="prov"><span>katalog</span><span class="fig">${date(changes.items[0].at, lang)}</span></span></div>
  <div class="tile" style="min-height:auto"><span class="label">Źródła</span><span class="value">${catalog.sources.length}</span><span class="prov"><span>rejestr</span><span>wszystkie ok</span></span></div>
  <div class="tile" style="min-height:auto"><span class="label">Ostatni przebieg pipeline</span><span class="value"><span class="status-ok">zielony</span></span><span class="prov"><span>gold.publish</span><span class="fig">${date(changes.items[0].at, lang)}</span></span></div>
  <div class="tile" style="min-height:auto"><span class="label">Najstarsze dane</span><span class="value">${period(pop.period, lang)}<small>ludność</small></span><span class="prov"><span>GUS BDL</span><span>rocznie</span></span></div>
</div>
<section class="panel" style="margin-top:12px"><h2><span>Wskaźniki w warstwie published</span><span class="meta"><a href="#">catalog.json</a></span></h2>
  <div class="table-wrap" tabindex="0" role="region" aria-label="Wskaźniki"><table><thead><tr><th>Wskaźnik</th><th>Źródła</th><th>Częst.</th><th class="n">Zakres</th><th>Status</th><th>Wczytano</th><th>Otwórz</th></tr></thead><tbody>${rows}</tbody></table></div></section>
<div class="grid-2">
  <section class="panel"><h2>Źródła i świeżość</h2><div class="table-wrap"><table><thead><tr><th>Źródło</th><th>Rejestr</th><th>Licencja</th><th>Ostatnie ładowanie</th><th>Stan</th></tr></thead><tbody>${src}</tbody></table></div></section>
  <section class="panel"><h2>Ostatnie zmiany</h2>${changesTable(lang, 4)}</section>
</div>`;
  return shell({ lang, product: 'data', title: 'Stan danych', nav: 0, body });
}

function index(): string {
  const screens = [
    ['com-home.html', 'zohelo.com — strona główna (PL)'], ['com-inflation.html', 'zohelo.com — /indicators/inflation (PL, kanoniczna)'],
    ['com-inflation-en.html', 'zohelo.com — /en/indicators/inflation (EN)'], ['bi-kpi.html', 'zohelo BI — /kpi/inflation (PL)'],
    ['bi-dashboard.html', 'zohelo BI — pulpit (PL)'], ['bi-explorer.html', 'zohelo BI — eksplorator (PL)'], ['data-start.html', 'zohelo Data — start (PL)'],
  ];
  return `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Prototyp B · Instrument</title><link rel="stylesheet" href="style.css"></head>
<body><main class="wrap" style="padding-top:32px"><p class="meta">zohelo · design process O17 · krok 2</p><h1>Kierunek B · Instrument</h1>
<p class="lead" style="margin:8px 0 16px">Spokojny instrument analityczny: liczby najpierw, kafelki i tabele, sparkline'y, małe wielokrotności, jedna skala teal. Prototyp, nigdy nie wdrażany; dane z <code>fixtures/published</code> (syntetyczne).</p>
<div class="panel" style="max-width:40rem"><ul style="margin:0;padding-left:18px;line-height:1.9">${screens.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join('')}</ul></div></main></body></html>`;
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

