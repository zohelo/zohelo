# Design research: zohelo.com, zohelo BI, zohelo Data

Step 1 of the design process (owner decision O17, zohelo-data `docs/team.md`, "Design process"). It is the input for the
two or three prototype directions (step 2) and for the review issue that scores them (step 3). Nothing here is a
decision; decisions are recorded as D<n> in zohelo-data `docs/decisions.md`.

Method: the three products were built from `main` on 2 Nov 2026 (zohelo with `fixtures/published`, zohelo-bi with no API
credentials, the data portal with no profile), screenshotted with Chromium at 1440 px and 390 px, and checked with
axe-core 4.10 (WCAG 2.0/2.1/2.2 A and AA rules) plus a horizontal-overflow and target-size script. The live sites were
not reachable from the session, so data-dependent screens show fixtures or empty/error states. Earlier inputs: the
27 Oct product design package (owner's project docs, §1–§5) and the `com/design/design-v1` Epic.

## 1. Who uses zohelo, and for what

| Persona | Main product | Job to be done | Device, language | What the design must make easy |
|---|---|---|---|---|
| Journalist | zohelo.com → BI | "Give me the number and a chart I can cite before the deadline" | phone and laptop, PL | the latest value with period and source in one glance; copy chart / link; plain-language definition |
| Public-sector analyst | BI | compare regions and sources over time, export to Excel | laptop, wide screen, PL | dense, keyboard-friendly matrix; stable links; units and breaks visible |
| Business / bank analyst | zohelo.com + BI | context for decisions: wages, prices, housing, regions | laptop and phone, PL/EN | indicator pages, regional profiles, YoY/index transforms |
| Researcher, student | BI, Data | long series, metadata, licence, citation | laptop, EN often | definitions, methodology, download, cite |
| Release-day analyst (bank, ministry, economics desk) | zohelo.com + BI | "what is the new number, vs last month and last year, and when is the next one" — minutes after a GUS release | laptop, PL | reference period, release date and next release date on every indicator page; y/y and seasonally adjusted m/m side by side |
| Regional / local-government officer | zohelo.com regions + BI | "how does my voivodeship or powiat compare with Poland and its neighbours" | laptop, PL | regional values that name their level, source and year (regional series often lag national ones) |
| Curious citizen | zohelo.com | "what changed in Poland this week?" | phone first, PL | one story per screen, readable charts on 390 px, no jargon |
| Owner, engineers, AI members | Data | where data is, is it fresh, how it was built | desktop | tables, lineage, runs, SQL |

Consequences for design: zohelo.com is phone-first and editorial; BI is desktop-first and dense but must still work on
a phone for reading a shared view; Data is a desktop tool. All three share one header, one footer, one type scale and
one chart style, so moving between them feels like one company (the `design-v1` Epic's "why").

## 2. What the best data products do (benchmarks)

| Product | What to learn | Link |
|---|---|---|
| Our World in Data (Grapher, data pages) | one chart per page with a takeaway title, tabs Chart / Map / Table / Sources & download on the same frame; "Data Insights" = headline + one chart + three lines; data page has "What you should know about this indicator" | https://ourworldindata.org/redesigning-our-interactive-data-visualizations , https://ourworldindata.org/homepage-redesign |
| ONS service manual, data visualisation | chart titles state the finding, direct labels instead of legends, a table alternative for every chart, accessible colour sets | https://service-manual.ons.gov.uk/data-visualisation/guidance |
| UK Analysis Function | colour guidance (≤ 4 series, contrast ≥ 3:1 between adjacent series and background, never rely on colour alone), chart checklist | https://analysisfunction.civilservice.gov.uk/policy-store/data-visualisation-charts |
| Scottish Government design system, charts | chart components inside a full design system with tokens, focus states and responsive rules | https://designsystem.gov.scot/guidance/charts |
| GOV.UK brand, data | brand-level data colours and typography shared across services | https://brand.design-system.service.gov.uk/data |
| London Datastore, City Intelligence guidelines | a city statistics team's house style: one palette, one type ramp, explicit source lines | https://data.london.gov.uk/blog/city-intelligence-data-design-guidelines |
| Eurostat Data Browser | customise-layout pivot (rows, columns, filters) as the analyst's main tool; flags shown as superscripts | https://ec.europa.eu/eurostat/web/user-guides/data-browser/data-selection-display/customise-layout |

Patterns that repeat across all of them: (1) the chart title is the takeaway sentence; (2) every chart has a source
line, a date and a table alternative; (3) one accent colour, everything else grey; (4) the indicator page is the unit
of the site (one URL, one definition, one chart, map, table, download); (5) design system first, pages second.

## 3. Current state, ranked by user impact

Screenshots (1440 and 390 px, PL and EN) were taken of zohelo.com `/`, `/en/`, `/indicators`, `/indicators/inflation`,
`/regions`, `/sources`, `/changes`; zohelo BI `/`, `/catalogue`, `/explore`; zohelo Data `/`.

### zohelo.com

1. **Two sites on one home page.** The new real-data sections ("Dziś w danych" tiles, "Co się zmieniło", the regional
   ranking) sit between the old prototype sections: an English market ticker with S&P 500 ETFs ("The Pulse"),
   "The Vault" with fake Power BI and PDF files, an English "Analytics Solutions & Consulting" block with a contact
   form, and a footer that still says "Tony Stark & Jarvis Model". The header navigation (Dashboardy, Produkty,
   Skarbiec, Doradztwo) points at those old sections, not at the new routes (Wskaźniki, Regiony, Źródła). Removal is
   planned in zohelo#330 (Developer 4 Tasks); the new design should define what replaces them, not just delete them.
2. **The home page has no `h1`** (axe; the indicator and region pages do). 61 contrast failures on the home page,
   mostly in the old ticker.
3. **KPI tiles break numbers.** At 1440 px in a four-column grid "845 000" wraps onto two lines and the unit shows the
   raw key `mln_eur`; population shows "36 620 000 os." wrapping too. Tiles need a value-fit rule (compact notation
   such as "845 mld €" or "36,6 mln") and unit labels from the catalogue, not keys.
4. **Indicator page is a stub.** `/indicators/inflation` shows the title, one tile and a source line; no chart, no
   definition, no table, no download. The source line prints a raw timestamp ("dane z 2026-01-01T00:00:00Z").
   This is the page the 27 Oct package calls "the SEO engine"; it is where the design must start.
5. **`text-faint` fails WCAG AA.** Token `color.text-faint` `#8A9099` gives 3.21:1 on white and 3.07:1 on `#F8FAFC`
   (needs 4.5:1 for small text). It is used for dates and source lines, i.e. exactly the provenance text users must
   read. The `design-v1` done_when ("text colours pass WCAG AA") is therefore not met.
6. **Mobile overflow.** `/en/` at 390 px is 426 px wide (the ticker's buttons); 15 links/buttons below 24 px height
   (WCAG 2.2 target size 2.5.8).
7. **Weight.** The chart chunk is 853 kB and the client entry 220 kB (unminified sizes on disk); the home page loads
   the old ticker code. A text-first page should stay small; charts should load only where a chart is shown.

### zohelo BI

1. **A different brand.** Blue `#1F5FBF` buttons, Inter Tight headings, beige `#F6F6F3` background, its own logo
   tile; nothing ties it visually to zohelo.com (teal, Newsreader, Plus Jakarta Sans). The 27 Oct package retired the
   blue.
2. **Explorer is a form, not a tool.** At 390 px the page is a long stack of pill buttons (measures, filters, shelves
   with "Rows Columns Remove" text links) before any data appears; at 1440 px the matrix sits below the controls. The
   benchmark pattern (Eurostat, OWID) is data first with controls around it.
3. **Mobile overflow.** `/explore` and `/catalogue` are 446 px wide at 390 px: the language toggle in the header and
   the rows table push the page sideways.
4. **Accessibility.** `.view-tabs` has a `tablist` role holding a select and inputs (aria-required-children,
   critical); the footer text is 2.97:1 and its link 1.89:1 against the text (link-in-text-block); the `.badge`
   amber is 4.49:1, just under 4.5:1.
5. **Error state.** Without the API the matrix shows "HTTP 500" in red and an empty table; no human message, no retry,
   no "data from <date>" fallback.

### zohelo Data

1. **A third brand.** The portal is the Duck-UI fork: dark grey, a duck avatar, "Zohelo Data Portal" title, and a
   "Create Profile" modal as the first screen. Nothing of the zohelo identity; the first screen asks for set-up before
   showing anything.
2. It is an internal tool (owner, engineers, agents). The design goal is a light skin (shared header, tokens, type) and
   a useful start page (sources, freshness, tables), not a redesign of the SQL editor.

## 4. Principles for every direction

1. **WCAG 2.2 AA is a requirement.** Text ≥ 4.5:1, large text and chart marks ≥ 3:1, visible focus (2.4.11), targets
   ≥ 24 × 24 px (2.5.8), no information by colour alone, `prefers-reduced-motion`, one `h1` per page, real tables
   behind every chart.
2. **Provenance is part of the number.** Every value shows unit, period and source; every chart has a source line with
   the dataset code and a readable date (`2 lis 2026` / `2 Nov 2026`), and a link to the definition.
3. **The takeaway is the title.** Charts and tiles say what changed ("Inflacja spadła do 2,9%"), the KPI name is the
   subtitle.
4. **One accent, many greys.** Brand teal for the highlighted series and actions; other series grey; status colours
   only with ▲▼ or words.
5. **Numbers are set as numbers.** Tabular figures, PL and EN separators from `Intl.NumberFormat`, compact notation in
   tiles, units from the catalogue (never keys).
6. **Phone first for zohelo.com, desktop first for BI and Data**, each checked at 390 and 1440 px, PL and EN.
7. **One system.** Tokens, header, footer, product switcher and chart style come from `@zohelo/design`; a product never
   defines its own colours.
8. **Small pages.** Text and numbers render without JavaScript (pre-rendered); charts are loaded only where shown.
9. **Sharing is a job.** Every chart and indicator page has a stable URL, a share image (Open Graph: takeaway plus
   chart, with source and date) and copy-chart / copy-link / copy-citation actions. It is the main growth channel
   (Area `com/growth`).

### Number rules (Domain review, economy, 2 Nov)

From the Domain expert's consultation on zohelo#333; they decide whether a professional trusts a page.

1. **Name the transformation in the label**: `r/r` / `y/y`, `m/m`, "wyrównane sezonowo / seasonally adjusted", "ceny
   stałe / constant prices", index base ("2021 = 100"). A bare "+4,6%" is ambiguous.
2. **Rates change in percentage points**: "inflacja spadła o 0,3 p.p. do 2,9%", never "o 0,3%".
3. **Takeaway titles are generated from data, literally true and non-causal.** Rules per domain (Domain expert):
   thresholds for rose / fell / unchanged, which comparison applies (m/m, y/y, previous release), the period in the
   sentence; "szybki szacunek / flash" when it is one; no "because" unless the source says it. Prototypes apply these
   rules to fixture data and never invent a claim.
4. **Reference period ≠ release date.** Show both ("wrzesień 2026 · opublikowano 15 paź 2026") and the next release;
   freshness uses the source's release, not our load time.
5. **Preliminary and revised values** are marked ("dane wstępne", hollow marker); a revision must not look like an error.
6. **Same name, different definition** (CPI vs HICP, LFS vs registered unemployment, usual-residence vs national
   population): when two sources share a chart, the legend names the definition, not only the source.
7. **Precision** follows the source (rates to one decimal); differences are never computed from rounded values; PL uses
   decimal comma and a non-breaking space as thousands separator.
8. **Axes**: bars of levels start at zero; lines of rates may not, but draw zero when values cross it; colour for
   growth only together with sign and words.
9. **Compact notation only for levels** ("3,9 bln zł", "37,5 mln"); rates, p.p. and index values always in full. PL
   scale words: mld = 10⁹, bln = 10¹² — use `Intl.NumberFormat` compact per locale, never translate "bn" as "bln"; the
   full value stays in the tooltip and table.
10. **Headline per indicator**: inflation = CPI y/y (GUS), HICP only in EU comparisons and labelled; GDP = real growth
    y/y (quarterly also s.a. q/q), the current-price level is context; population = date and definition in the tile,
    0,1 mln in tiles, exact count in the table.
11. **"Jak czytać / How to read"**: the indicator page carries a short box drawn from zohelo-data
    `docs/domains/<domain>.md` (methodology traps).

## 5. Brief for step 2 (prototype directions)

Two or three directions, each a clickable HTML prototype in `design/prototypes/<direction>/` of this repo (never
shipped), built with the published fixtures (`fixtures/published`), one Designer run per direction (the prototypes
compare ideas; polish belongs in step 6). Screens, all at 1440 and 390 px in PL: zohelo.com home and indicator page
(`inflation`, also in EN), the BI indicator page `/kpi/<kpi_key>` (zohelo-bi#278), a BI dashboard and the explorer, and
the zohelo Data start page (an internal tool: no table view). Every screen carries the shared header with the product
switcher (zohelo · zohelo BI · zohelo Data).

**One indicator, two pages.** Each direction shows how zohelo.com `/indicators/<slug>` (public, editorial, SEO:
takeaway, chart, plain definition, share) and BI `/kpi/<kpi_key>` (analyst reference: all sources, cuts, citation, open
in explorer) split the work, the links both ways, and which page is canonical, so no two competing indicator pages are
built.

The directions must differ in their idea, not in colour only. Proposed axes:

| Direction | Idea | Type | Density | Chart style |
|---|---|---|---|---|
| A · Editorial | a statistical newspaper: takeaway headlines, one chart per story, lots of white | Newsreader headlines, Plus Jakarta Sans text | low on .com, medium in BI | OWID-like, direct labels, grey context |
| B · Instrument | a calm analytical instrument: numbers first, tiles and tables, sparklines | Plus Jakarta Sans / Inter tabular throughout, no serif | medium on .com, high in BI | small multiples, compact axes, monochrome teal ramp |
| C · Atlas (optional) | Poland as the interface: the map and regions lead, indicators hang off places | sans with serif display | medium | choropleths and rankings first |

Scoring criteria for review round 1 (1–5 each, with reasons), besides those in `docs/team.md` per reviewer. Product
Owner: (a) journalist test — on a 390 px phone the indicator page shows value, period and source without scrolling;
(b) the three products read as one company; (c) the home page says what zohelo is within 5 seconds; (d) the brand
carries the paid products to come (reports, BI tier). All reviewers: (e) sharing — stable URL, share image, copy actions.
Domain expert: the number rules above. Direction fit noted by the Domain expert: B suits release-day and bank analysts,
A journalists and citizens.

Each direction keeps the brand (zohelo, teal, "Polska w danych / Poland in data"; products zohelo, zohelo BI, zohelo Data) but may propose changes to the
`design-v1` choices (fonts, palette, `text-faint`), which are inputs, not fixed (O17 step 4).

## 6. Defects found during this research

Filed as Bugs (shared rules): the failing `text-faint` token (zohelo#332, Developer 4) and the BI mobile overflow and tab
semantics (zohelo-bi#276, Developer 3). The home page's old sections are covered by zohelo#330.
