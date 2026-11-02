# Direction A · Editorial (prototype)

Step 2 of the design process (owner decision O17, zohelo-data `docs/team.md` "Design process"), brief in
[`docs/design/research.md` §5](../../../docs/design/research.md). A prototype to compare ideas in review round 1 —
**never shipped**, not linked from any product, `noindex` on every page.

## Open it

```sh
bun install
bun design/prototypes/editorial/build.ts      # regenerates the HTML and specs/*.vl.json from fixtures/published
python3 -m http.server 4310                   # from the repo root, so the fonts in packages/design resolve
# http://localhost:4310/design/prototypes/editorial/
```

Screens (all responsive; check at 1440 and 390 px): `com-home.html` (zohelo.com home), `com-inflation.html` and
`com-inflation-en.html` (`/indicators/inflation`, PL and EN), `bi-kpi.html` (BI `/kpi/inflation`, zohelo-bi#278),
`bi-dashboard.html`, `bi-explorer.html`, `data-start.html` (zohelo Data start page). The shared header links the three
products; the product nav links the screens.

## Idea

**A statistical newspaper.** Every unit of content is a *story*: a kicker with the indicator and the reference period,
a headline that states what the data says ("Inflacja HICP spadła do 2,9% we wrześniu 2026"), one line with the change
and the comparison, one chart, a source line. Lots of white, hairline rules between stories, a double rule under the
masthead and above the footer. The voice is a careful statistics desk: literally true, non-causal, numbers with unit,
period and source in the same glance (research §4).

## Type

- **Newsreader 600** for headlines, story titles and the masthead (`font.display`); italic Newsreader for the tagline
  "Polska w danych". The serif is what makes zohelo.com read as a publication, not a SaaS dashboard.
- **Plus Jakarta Sans** for text, navigation, buttons, kickers (`font.ui`).
- **Inter, tabular lining figures** for every number in tables, big figures and chart axes (`font.data`).
- Scale: 46/44 (h1) · 30 · 22 · 18 (dek) · 16 (body) · 14 (tables) · 13 (meta) · 12 (kickers, uppercase +0.08em);
  on 390 px h1 drops to 32.

## Colour

White page (`color.surface`), not the grey-blue `color.bg`; `color.bg` only for the "Jak czytać" box. One accent:
**teal-strong `#2C6E76`** (5.8:1 on white) for the highlighted series, the big figure, links and the primary button —
the lighter `teal` `#3B8B94` (4.0:1) is not text-safe, so Editorial uses teal-strong everywhere text is involved. Context
series in grey `#868D95` (3.3:1, the lightest a meaningful mark may be). Text grey is `text-muted` `#5D636B` (6.1:1) for
all meta and provenance lines; `text-faint` is not used (fails AA, zohelo#332). No status colours on numbers: change is
written with sign and words ("−0,1 p.p. wobec sierpnia 2026").

## Density

Low on zohelo.com (one lead story, three stories, changes list, one context story); medium in BI (two-column cards on
the dashboard, a full table of sources on the KPI page, a controls column in the explorer); the Data start page is a
plain status table. The same masthead, rules and type in all three, so they read as one company with three sections
of one paper.

## Chart style

Vega-Lite specs (D25), see `charts.ts` and the exported specs in `specs/`:

- OWID-like line: no legend, **direct label** at the line end ("HICP r/r 2,9%"), no chart title inside the graphic —
  the takeaway is the HTML heading above it.
- Horizontal grid only, no y-axis line, x-axis with month or year ticks in the page language (`sty 2024`, `Jan 2024`).
- One accent series, everything else grey (number rule 6: when two definitions share a chart — HICP and World Bank
  CPI — the grey one is labelled with its definition and a caption says why).
- **Illustrative points dashed and lighter**; **preliminary points hollow** (rule 5). Levels start at zero (rule 8:
  GDP, voivodeship population); rates do not.
- Two renders per chart (desktop and 390 px) so axis text stays 11–13 px; the table under the chart is the accessible
  alternative (`figure` with a screen-reader caption, `table-wrap` focusable region).

## The two indicator pages

- **zohelo.com `/indicators/inflation` is canonical** (`<link rel="canonical">`): the public story — takeaway h1, plain
  dek, big figure with period, source, release and next release, Chart / Table / Sources tabs on one frame, share
  actions (copy link, copy chart, cite, CSV), "Jak czytać / How to read", a short table, and a box "Dla analityków"
  linking to BI.
- **BI `/kpi/inflation`** is the analyst reference: kpi_key, every source's latest value with definition and change,
  chart by source, metadata (unit, frequency, domain path, range, cuts) and a citation; it links back to the canonical
  page and on to the explorer with the KPI preselected. No second takeaway page.

## Data honesty in the prototype

All numbers come from `fixtures/published` (synthetic, see `FIXTURE.txt`). The fixture has only the latest and previous
value per series, so chart history before them is **illustrative**: drawn dashed, said so in every caption, and marked
"ilustracyjne" in tables. Takeaway titles use only fixture values (`data.ts` `takeaway()`: rates move at ≥ 0,1 p.p.,
levels at ≥ 0,05%; otherwise "nie zmieniła się"). Release and next-release dates are not in the fixture and the pages
say so instead of inventing them. Inflation is labelled HICP (Eurostat) because that is what the fixture holds; the
"Jak czytać" box says the Polish headline is GUS CPI (rule 10).

## Tokens and components this direction needs

New tokens: `color.rule` (#D9DEE3, hairlines), `layout.measure` (40rem), `layout.wide` (72rem). Changed use:
`teal-strong` becomes the text accent; `text-faint` retired in favour of `text-muted`. New components: `ProductSwitcher`
(shared header row), `Masthead`, `Story` (kicker, takeaway, change line, chart, source), `KeyFigure` (big figure + period
+ release + source), `ChartFrame` (tabs Chart / Table / Sources, caption, actions), `HowToRead`, and a `takeaway()` rule
set per domain (Domain expert). `formatNumber` in `@zohelo/design` replaces the no-break space with a plain space; the
prototype keeps U+00A0 as number rule 7 asks.

## Fit for the three products

| Product | Fit | Risk |
|---|---|---|
| zohelo.com | strongest: journalist and citizen read a headline, a number with period and source, and a chart on a phone first screen | needs a takeaway generator per domain; stories without a change ("unchanged") read flat |
| zohelo BI | dashboards become pages of findings; KPI page is a clean reference | serif headings and generous spacing cost density for the release-day analyst; the explorer keeps a classic controls column |
| zohelo Data | the masthead and type make the internal tool clearly zohelo | an editorial skin adds little to an engineering tool; kept to header, type and tables |
