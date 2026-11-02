# Direction B · Instrument (prototype)

Step 2 of the design process (owner decision O17, zohelo-data `docs/team.md` "Design process"), brief in
[`docs/design/research.md` §5](../../../docs/design/research.md). A prototype to compare ideas in review round 1 —
**never shipped**, not linked from any product, `noindex` on every page. It shares `data.ts` (fixture reading, number
rules, takeaway generator) with [Direction A · Editorial](../editorial/README.md), so A and B differ in design, not in
what the numbers say.

## Open it

```sh
bun install
bun design/prototypes/instrument/build.ts     # regenerates the HTML and specs/*.vl.json from fixtures/published
python3 -m http.server 4310                   # from the repo root, so the fonts in packages/design resolve
# http://localhost:4310/design/prototypes/instrument/
```

Screens (responsive; check at 1440 and 390 px): `com-home.html` (zohelo.com home), `com-inflation.html` and
`com-inflation-en.html` (`/indicators/inflation`, PL and EN), `bi-kpi.html` (BI `/kpi/inflation`, zohelo-bi#278),
`bi-dashboard.html`, `bi-explorer.html`, `data-start.html` (zohelo Data start page). One 48 px bar on every screen:
wordmark, the product switcher as a segmented control, the product's nav, search, language.

## Idea

**A calm analytical instrument.** The unit of the interface is the *tile*: label and key, the value in tabular figures
with its unit, the change (in p.p. for rates, in the unit for levels) with a direction word, a sparkline, the period
and the source. Tiles form a board; boards sit above panels of charts and tables; everything is on one grey workbench
with white panels and 1 px rules. Nothing is decorative: no hero, no serif, no colour that does not mean something.
The home page is the board of today's numbers; the indicator page is the key figure, a chart with compact axes, small
multiples of the other definitions, the table and the metadata, all on one screen at 1440 px. The voice is the same as
A's (literally true, non-causal, number with period and source), but the takeaway is a panel title, not a headline.

## Type

- **Plus Jakarta Sans** for everything: headings (600, 24/16/14 px), labels, navigation, buttons. No display serif
  (`font.display` unused in B); the product's character comes from the numbers and the grid, not from a typeface.
- **Inter, tabular lining figures** for every number: tile values (24 px, 500), the key figure (56 px, 500, −0.03em),
  table cells, axes, periods and dates (`font.data`).
- Scale: 24 (h1) · 16 (panel title) · 14 (body, tables 13) · 12 (meta, buttons) · 11 (axes, table headers, uppercase
  +0.02em). Body is 14 px, not 16: the instrument is read at arm's length on a laptop. 390 px: h1 20, tile value 22.

## Colour

Workbench `color.bg` `#F4F7F9`, panels `color.surface` white, rules `color.border` `#D9DEE3` (NEW), grid `#E8ECEF`.
One accent, **teal-strong `#2C6E76`** (5.8:1), for the headline series, the selected product, links and the primary
button. A **monochrome teal ramp** `color.ramp.teal` 1–6 (NEW: `#E3EFF0 #B9D5D8 #7FAEB3 #4E8F96 #2C6E76 #1E4F55`) for
everything ordered: the sparkline band (1), selected rows (1), the second series (4), ranking bars (3 and 5), and the
choropleth to come. Context series grey `#868D95` (3.3:1). Text `#24292E`, meta `text-muted` `#5D636B` (6.1:1);
`text-faint` is not used (fails AA, zohelo#332). Direction is never colour alone: ▲▼▬ plus the word
("wzrost / spadek / bez zmian"); no red or green on numbers. Status dots (green/amber) only on the Data start page,
next to their words.

## Density

Medium on zohelo.com (four tiles and three panels above the fold at 1440 px, 2 × 2 tiles at 390 px), high in BI
(tiles, four small multiples, a ranking and a table on one dashboard screen; the explorer's controls are a one-row
toolbar above the matrix, so the data is the first thing on screen, the benchmark pattern of Eurostat and OWID), high
on the Data start page (four status tiles and three tables). Wide tables scroll inside a focusable region
(`role="region"`, `tabindex="0"`) and never widen the page: every screen is 390 px wide at 390 px.

## Chart style

Vega-Lite specs (D25), see `charts.ts` and the exported specs in `specs/`:

- **Sparkline** in every tile: no axes, the lightest ramp step as a band under the real points, a filled last point
  (hollow when preliminary), illustrative history dashed in ramp step 4.
- **Compact line**: 3 ticks, 11 px labels, y-axis on the **right** so the end label sits next to the last value, dotted
  horizontal grid, no y domain line; the value label at the line end is the last value, not the series name (the
  series name is the panel title). Annual series tick once per year.
- **Small multiples instead of multi-series charts**: different definitions (HICP vs World Bank CPI, rule 6) or
  different regions get one small chart each with a shared unit; a chart never holds two colours that mean two
  definitions.
- **Ranking bars** for regions: one colour, the highlighted row in teal-strong, value at the bar end.
- Levels start at zero (rule 8); rates do not; illustrative points dashed and lighter; preliminary hollow (rule 5).
- Two renders per chart (desktop and 390 px) so axis text stays 11 px; the table is the accessible alternative.

## The two indicator pages

- **zohelo.com `/indicators/inflation` is canonical** (`<link rel="canonical">`): key figure (value, p.p. change,
  period, release, next release, source), tabs Chart / Table / Sources / Metadata on one panel, small multiples of the
  other definitions, the table, "Jak czytać" as an open `<details>`, metadata and sources panels, actions (link, PNG,
  cite, CSV, "zohelo BI →").
- **BI `/kpi/inflation`** is the analyst reference: the sources table (definition, dataset code, period, value,
  change, checked, licence), small multiples per source, metadata, citation (copy, BibTeX), dashboards that use the
  KPI; it links back to the canonical page and on to the explorer. No second takeaway page.

## Data honesty in the prototype

All numbers come from `fixtures/published` (synthetic, `FIXTURE.txt`); population is GUS BDL as the fixture says
(#383). The fixture has only the latest and previous value per series, so chart history before them is
**illustrative**: dashed, said so in every caption, "ilustracyjne" in tables. Takeaway sentences use only fixture
values (`../editorial/data.ts` `takeaway()`). Release and next-release dates are not in the fixture and the pages say
so. The home change table repeats the fixture's two items to show the density and says so in each repeated row. The
regions ranking has one voivodeship because the fixture has one; the caption says what appears with full data.

## Tokens and components this direction needs

New tokens: `color.border` (#D9DEE3), `color.ramp.teal` 1–6, `layout.wide` (84rem), `radius.sm` (6px), `space.3`
(12px). Changed use: `teal-strong` is the only text accent; `text-faint` retired for `text-muted`; `font.display`
unused. New components: `AppBar` (wordmark, `ProductSwitcher` segmented control, nav, search, language, menu button),
`Tile` (label, value, change, sparkline, provenance; the one component zohelo.com, BI and Data share), `Board` (tile
grid, columns = tiles), `Panel` (title + meta + body), `KeyFigure`, `Multiples` (grid of small charts with a shared
unit), `Toolbar` (actions and view toggles with `aria-pressed`), `FilterRow` (explorer controls), `RankingBars`,
`StatusDot`, and the `Sparkline`, `CompactLine` and `RankingBars` Vega-Lite spec builders. `formatNumber` in
`@zohelo/design` must keep U+00A0 grouping (rule 7) and gain `compact` for levels (rule 9).

## Fit for the three products

| Product | Fit | Risk |
|---|---|---|
| zohelo.com | the release-day and bank analyst gets every number with change, period and source on the first screen; the tile is the same object a journalist later meets in BI | the home page has no story: citizens and journalists get a board, not a headline; on a phone the first screen is two tiles and the brand line, so the "what is zohelo" panel sits below the fold |
| zohelo BI | strongest: dashboards, KPI reference and explorer are one system of tiles, panels and tables; the explorer's toolbar layout keeps the matrix first; small multiples scale to 16 voivodeships | 14 px body and 11 px axes need the AA checks on every release; the toolbar must collapse to a drawer at 390 px (the prototype shows the row wrapping) |
| zohelo Data | a natural fit: status tiles and tables are what an internal tool is | none beyond the shared bar |
