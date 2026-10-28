# Home page and region profiles from published data (product owner, 28 Oct 2026)

Source for Tasks `com/site/indicators/home/home-strip`, `com/site/regions/profiles/profile-route` and
`com/site/regions/home/home-spotlight`. Fixture values come from zohelo-data `.github/backlog/assets/latest-fixtures.md`.

## homeTiles (Task home-strip)

`src/indicators/home.ts`:

- `export const HOME_KPIS = ['inflation', 'unemployment_rate', 'gdp_current_prices', 'population'] as const`
- `export function homeTiles(catalog: Catalog, read: (kpiKey: string) => KpiLatest, locale: Locale): TodayTile[]`:
  for each key of HOME_KPIS in that order, skip it when the catalog has no KPI with that kpi_key and status
  `published`, or when `NO_LATEST` includes it; otherwise build `{ kpi_key, label, value, unit, delta, period,
  provisional }` from `latestTile(kpi, read(key), catalog.units, locale)`.
- Imports: types `Catalog`, `KpiLatest` and the value `NO_LATEST` from `../published`; `latestTile` from `./tile`;
  `TodayTile` from `./TodayStrip`; `Locale` from `../i18n`.

Tests (`tests/homeTiles.test.ts`, bun:test, files read from `fixtures/published` with readCatalog/readKpiLatest):
pl gives kpi_keys `['inflation', 'unemployment_rate', 'gdp_current_prices', 'population']` and unemployment_rate
value 3.2; en labels equal the catalog `name_en`; a catalog copy where inflation has status `draft` gives 3 tiles.

## Voivodeship names (Task profile-route)

`src/regions/profile.ts`: `export const VOIVODESHIP_NAMES: Record<string, string>`, Polish names by TERYT, used when
the geo file has no feature for the region:

| TERYT | name | TERYT | name |
|---|---|---|---|
| 02 | Dolnośląskie | 18 | Podkarpackie |
| 04 | Kujawsko-pomorskie | 20 | Podlaskie |
| 06 | Lubelskie | 22 | Pomorskie |
| 08 | Lubuskie | 24 | Śląskie |
| 10 | Łódzkie | 26 | Świętokrzyskie |
| 12 | Małopolskie | 28 | Warmińsko-mazurskie |
| 14 | Mazowieckie | 30 | Wielkopolskie |
| 16 | Opolskie | 32 | Zachodniopomorskie |

`regionName(geo: GeoCollection, teryt: string, locale: Locale): string` (also in profile.ts, type-only import of
GeoCollection): the `name_pl` / `name_en` of the feature whose `geography_key` is `geographyKeyOf(teryt)`, else
`VOIVODESHIP_NAMES[teryt]`. The home spotlight uses the same function.

## Profile page (Task profile-route)

`src/routes/region.tsx`:

- `loader({ params, request })`: a teryt not in VOIVODESHIP_TERYT → `throw new Response('Not Found', { status: 404 })`.
  `dir = publishedDir()`, `catalog = readCatalog(dir)`, `options = regionalKpis(catalog, locale)`, rankings = the
  non-null `rankRegions(readKpiLatest(dir, o.kpi_key))` of each option; return `{ teryt, name: regionName(readGeo(dir,
  'voivodeship'), teryt, locale), rows }` where rows = `regionProfile(geographyKeyOf(teryt), rankings)`, each with the
  `name` and `unit` of its option.
- `meta({ data, location })`: `pageMeta` with path `/regions/<teryt>`, title the name, description pl
  "Województwo <name>: wskaźniki na tle Polski i miejsce wśród 16 województw.", en "<name>: indicators compared with
  Poland and the rank among the 16 voivodeships."
- Component: `<main className="mx-auto max-w-5xl px-4 py-12">`, `<h1>` name, a link to `localizedPath('/regions')`
  "Wszystkie regiony" / "All regions". No rows → `<p>` "Brak danych regionalnych." / "No regional data.". Otherwise a
  grid (`grid gap-4 sm:grid-cols-2 lg:grid-cols-3`): per row a `KpiTile` (label name, value, unit, period, locale, href
  `/indicators/<kpi_key>` localized) and under it `<p>` "<rank>. miejsce z <of>" / "rank <rank> of <of>", plus, when
  national is not null, " · Polska: " / " · Poland: " and the number formatted with `Intl.NumberFormat('pl-PL' |
  'en-GB')` followed by the unit.
- `site.config.ts`: `export function regionPaths(): string[]` = for each TERYT `/regions/<t>` and `/en/regions/<t>`;
  `react-router.config.ts` `prerender()` adds `...regionPaths()`. `routes.ts` `pages()`: `route('regions/:teryt',
  'routes/region.tsx', { id: \`region${suffix}\` })`.

Tests (`tests/regionRoute.test.ts`, bun:test, `PUBLISHED_DIR=fixtures/published`): teryt 12 pl gives name
"Małopolskie" and en "Lesser Poland", an unemployment_rate row with value 2.6, rank 1 of 1, and a population row with
rank 2 of 2; teryt 14 gives "Mazowieckie"; teryt 99 throws a Response with status 404; `regionPaths()` has 32 entries
including `/en/regions/32`.

## Home spotlight (Task home-spotlight)

`src/regions/HomeSpotlight.tsx`:

- `export type SpotRow = { teryt: string; name: string; value: number; rank: number }` and `export type SpotlightData =
  { kpi_key: string; name: string; unit: string; period: string; top: SpotRow[]; bottom: SpotRow[] }`.
- `HomeSpotlight({ data, locale }: { data: SpotlightData | null; locale: Locale })`: null → nothing. Otherwise
  `<section aria-labelledby="spotlight" className="mx-auto max-w-6xl px-4 py-8">` with `<h2 id="spotlight">`
  "Regiony: <name> (<period>)" / "Regions: <name> (<period>)"; an `<h3>` "Najwyżej" / "Highest" with an `<ol>` of top;
  when bottom is not empty an `<h3>` "Najniżej" / "Lowest" with an `<ol>` of bottom. Each `<li>`: "<rank>. ", a link
  `regionPath(teryt, locale)` with the name, a space and the value (`Intl.NumberFormat`, as on the profile page) with
  the unit. Then a link to `localizedPath('/regions')` "Mapa wszystkich województw" / "Map of all voivodeships".

Home loader: `spotlight` is null unless `regionalKpis(catalog, locale)` lists `unemployment_rate`; then ranking =
`rankRegions(readKpiLatest(dir, 'unemployment_rate'))`, null → null; otherwise `spotlight(ranking)` with each region
mapped to a SpotRow (teryt = `terytOf(geography_key)`, rows with null skipped; name = `regionName(geo, teryt, locale)`
with `geo = readGeo(dir, 'voivodeship')`), and the option's name and unit.

Tests (`tests/homeSpotlight.test.tsx`, bun:test, `renderToStaticMarkup`, inline data with 3 top and 3 bottom rows):
pl has "Najwyżej", "Najniżej" and `href="/regions/12"`; en has "Highest" and `href="/en/regions/12"`; bottom `[]`
renders no "Najniżej"; data null renders "".
