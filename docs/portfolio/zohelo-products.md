# zohelo-products — discovery brief

Status: draft, Product Owner, 28 Oct 2026. Discovery Epic `com/portfolio/products`. No Developer time until the owner
approves (docs/team.md in zohelo-data, decision O13).

Proposed name: **zohelo Reports** (repo `zohelo-reports`), "Polska w danych" as ready documents. Alternatives: zohelo
Studio, zohelo Docs. The owner picks the name.

## Who it is for

1. **Local governments (JST) writing the annual report on their state.** Since the 2018 amendments every gmina
   executive presents a *raport o stanie gminy* to the council by 31 May (art. 28aa of the Act on gmina
   self-government); powiats and voivodeships have the same duty. The law sets only a minimum; Fundacja Batorego's
   guidance asks for trends over time and comparisons with neighbouring or similar gminas, and lists errors,
   outdated figures and data overload as the usual problems. 2,477 gminas, 380 powiats and 16 voivodeships write
   one every spring, mostly by hand in Word.
2. **Analysts, teachers and presenters** who need a current, sourced chart for a slide: "Poland's inflation vs the
   euro area", "my voivodeship's unemployment" — today they screenshot GUS or Eurostat pages.
3. **Journalists and NGOs** who want a one-page fact sheet of a place or a topic before writing (shared audience
   with zohelo-journal, which writes the stories; this product ships the documents).

## The gap it fills

- GUS's *Statystyczne Vademecum Samorządowca* is free and per gmina, but it is a fixed multi-page PDF on GUS's
  calendar: no choice of peers, no editable charts, no powiat/voivodeship view in the same layout, and it lags the
  report season.
- Local reports are assembled by office staff from BDL tables. Nobody ships a **ready, editable, sourced data annex**
  ("the state of the gmina in numbers") with peer comparisons, in time for May.
- Slide-ready national charts with a stable source line and a download in PowerPoint do not exist for Polish data.

## What it does

- **Place reports.** A data annex per gmina, powiat and voivodeship: population and its structure, migration,
  labour market, wages, public finance, housing, education, environment; each indicator as a trend, a peer
  comparison (powiat, voivodeship, similar-size units) and a one-line plain reading. Formats: PDF (free) and
  editable DOCX/PPTX with the charts as native objects.
- **Topic packs.** A monthly "Poland in data" slide pack (prices, labour, rates, growth, trade; PL and EN) built the
  day after the release calendar's main releases, plus single-chart downloads (PNG/SVG/PPTX) from any zohelo BI
  tile.
- **Every page carries its sources** (provider, table, release date) and the zohelo vintage, so a council member can
  check a number.
- Later: a report builder where the JST picks indicators and peers, or loads the indicator list its council adopted
  by resolution.

## How it uses zohelo data

- Reads only `06_published/v1` (contract D5): `catalog.json`, `kpi/*/series.parquet`, `kpi/*/latest.json`,
  `geo/<level>.geojson`. Charts use @zohelo/design (D3, D4), so a report chart and a site chart are the same chart.
- Today the published layer holds country and voivodeship values (D22). Place reports need powiat and gmina values:
  GUS BDL publishes them and zohelo-data already loads BDL (subgroup refresh, #889); exposing them is a published-layer
  extension that zohelo-research's powiat panel also needs, so one zohelo-data Epic serves both.
- Generation runs in GitHub Actions (free): one job renders all ~2,900 place PDFs per data vintage; files go to R2
  (a few hundred kB each, about 1 GB per yearly vintage) and are served through the site. No server, no user data.
- Licences: GUS terms allow copying and own analyses with the source given (D23); each document states its sources.
  A paid tier sells the work (layout, peers, editable files), never the source data.

## How it could earn money

All of it is an owner decision, and the most concrete revenue idea in the portfolio so far.

1. **Paid editable annex for JST.** Free PDF; paid DOCX/PPTX with the unit's own peers and branding, priced per
   report (an order of magnitude of a few hundred złoty). Purchases of this size sit far below the public
   procurement threshold, so a gmina can order by invoice. Needs a business entity that invoices (owner).
2. **Subscription for analysts and teachers**: the monthly slide pack in PPTX and unlimited chart downloads.
3. **Sponsored or partner editions** (a regional development agency, a bank's regional desk), clearly credited.
4. Indirect: every free PDF is a sourced zohelo document in a council session, which is reach for zohelo BI and the
   owner's analyst portfolio (O5).

## First roadmap (after approval)

| Step | Scope | Effort guess |
|---|---|---|
| v0 | Voivodeship reports (16 PDFs) and the monthly national slide pack from today's published KPIs; a `/reports` page on zohelo.com; about 6–8 S/M Tasks | 1–2 weeks after `data/published/published-v1` |
| v1 | Powiat and gmina reports after the published-layer extension; peer groups (same powiat, same voivodeship, similar population and type: urban, rural, urban-rural); DOCX/PPTX export | 4–6 weeks, ready before the March–May report season of 2027 |
| v2 | Paid tier (owner decisions below), report builder with council-chosen indicators | after v1 has users |

## Risks

- **Timing.** The report season is March–May. Missing spring 2027 moves real use to 2028. Annual BDL data for the
  previous year are often not out by May, so reports may show year N-2 for some indicators; the Domain expert
  checks which indicators are current in time.
- **Correctness and liability.** A wrong number read out in a council session hurts the zohelo name. Mitigations:
  Quality Engineer checks against BDL for a sample of units per vintage, the Domain expert reviews the indicator set
  and the plain readings, every page shows sources and vintage.
- **Competition.** GUS's free Vademecum is good enough for many gminas; the edge has to be editability, peers and
  timing, not data alone.
- **Selling to JST.** Invoices, VAT and public-sector buying need a business entity and some sales effort; without
  them the product stays free (still useful as reach).
- **Generated text.** One-line readings must stay factual ("rose 3.1% in 2025, faster than the powiat") with no
  judgements on the executive's record; the report is part of a vote of confidence.
- **Dependency.** v0 waits for the published layer (target January 2027); v1 for powiat/gmina values in it.

## What the owner must decide

1. Whether zohelo Reports becomes a product, with its own repo and Developer, or a `/reports` section of zohelo plus
   published-layer Tasks in zohelo-data (the Product Owner suggests the latter for v0, a repo from v1).
2. The name (zohelo Reports, Studio or Docs).
3. Whether to sell to local governments at all: a business entity that invoices, prices, and how this sits with the
   owner's employment (overlap with zohelo-consulting).
4. Whether the free tier covers all units (every gmina) or only voivodeships and powiats.

## Consultation

- Domain expert (finance, population, labour): pending — indicator set for place reports, which
  BDL annual indicators are published before May, peer-group method, wording of the one-line readings.
- Architect: pending — powiat/gmina values in `06_published/v1`, PDF/DOCX/PPTX rendering in Actions with
  @zohelo/design, storage and serving of ~2,900 files per vintage within the free tier.

Sources: [Fundacja Batorego, Raport o stanie gminy](https://www.batory.org.pl/wp-content/uploads/2021/07/Raport-o-stanie-gminy_ver.6.pdf),
[GUS Statystyczne Vademecum Samorządowca](https://kleszczow.pl/?p=27604).
