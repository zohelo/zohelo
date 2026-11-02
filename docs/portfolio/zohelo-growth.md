# zohelo growth and commercialisation — discovery brief

Status: draft, Product Owner, 2 Nov 2026. Discovery Epic `com/portfolio/growth`. Area `com/growth` already holds the
on-site return features (analytics, what-changed, chart of the day, calendar subscription, newsletter); this brief
covers what those Epics leave out: being found (search), being shared (social channels), and earning money. No
Developer time beyond the existing `com/growth` Epics until the owner approves (docs/team.md in zohelo-data, O13).

This is not a separate product with its own repo. It is a programme across zohelo.com, zohelo BI and zohelo Data, so
the brief proposes Epics in the existing repos rather than a new Developer.

## Who it is for

1. **People who search for a Polish number** ("inflacja październik 2026", "bezrobocie województwo lubelskie",
   "kurs euro NBP"). Search is how most of them arrive; today zohelo.com has no indicator pages indexed with the
   number in the title, so it cannot win these queries.
2. **People who follow Polish economics on social media** — analysts, journalists, students, policy people on
   LinkedIn, X and Bluesky — who share a clear chart on release day.
3. **Organisations that would pay** for something beyond the free site: local governments (see zohelo-products),
   NGOs and researchers (see zohelo-research), companies that need a clean, sourced data feed.

## The gap it fills

- The free on-site features make visitors come back, but nothing yet brings the first visit: no search-ready
  indicator pages, no Dataset structured data, no presence where the audience already reads.
- GUS, NBP and Eurostat publish the numbers but not in a form people share: a release is a PDF or a table, not a
  chart with a one-line reading. Release-day charts with a stable source line are the shareable unit zohelo can own.
- zohelo has no answer yet to "who pays for this": the platform runs on free tiers (R2 storage is already at about
  150 GB, slightly above the free 10 GB, per the Operator's week-45 cost comment on zohelo-data#2075).

## What it does

**Search (no owner action needed, all inside the repos)**
- Indicator and region pages (Epics `com/site/indicators`, `com/site/regions`) carry the latest value and period in
  the `<title>` and description, `schema.org/Dataset` markup with `distribution` (DataDownload) and `temporalCoverage`,
  and a sitemap with `lastmod` from the data vintage, so Google Search and Google Dataset Search can list them.
  Several of these are already Tasks in zohelo#352 (meta-description, breadcrumb-jsonld, sitemap-lastmod); the
  Dataset markup and data.zohelo.com catalogue entries are the missing part.
- Stable, human URLs in PL and EN (`/wskazniki/inflacja` / `/en/indicators/inflation`) are a design question for the
  Designer and Developer 4 before the indicator pages ship.

**Social distribution (owner action: accounts)**
- On every main release in the release calendar, an automatically generated release card: one chart (PNG and SVG,
  @zohelo/design), the value, the change, a factual one-line reading, the source and a link to the indicator page.
  The team generates the cards in the repos; **posting them is an owner action** (docs/team.md shared rules: anything
  published outside the repos under the zohelo name). v0 is a `/press` or `/cards` page where the owner picks a card
  and posts it by hand.
- Later, with the owner's approval of accounts and tokens, an Actions job could post the cards to the chosen
  channels; that needs a decision per channel and credentials only the owner can create.

**Commercialisation (owner decisions)**
Ordered from least to most effort:
1. **Voluntary support** — a "support zohelo" link (Patronite or Buy Me a Coffee, Polish-friendly), the model that
   free public-data sites use (Our World in Data is funded mostly by donations and grants). Low revenue, no
   obligation, needs an account and tax handling by the owner.
2. **Sponsored editions** — the Monday brief or a regional page "supported by" a clearly credited partner; editorial
   content stays independent and generated from the published layer.
3. **Paid data access** — a keyed API or bulk download with a service level for companies (the free site and the
   published files stay free); priced per month. Needs billing, terms and support.
4. **Paid documents** — the editable place reports for local governments (zohelo-products brief, zohelo#284).
5. **Display advertising** — not recommended: low revenue at this traffic, harms trust and page weight, and needs a
   cookie consent banner, which the cookieless analytics Epic avoids on purpose.

## How it uses zohelo data

- Only the published layer (`06_published/v1`, contract D5): `catalog.json` for Dataset markup and sitemaps,
  `kpi/*/latest.json` for titles and release cards, `kpi/*/series.parquet` for the card charts, the release
  calendar for timing.
- Cards are rendered in GitHub Actions after the publish run (free), stored once per release in R2 (a few kB each).
- Licences: GUS, NBP and Eurostat allow reuse with the source given (D23); every card and Dataset entry names the
  provider and release date. Paid tiers sell the service (formatting, feed, support), never the source data itself.

## How it could earn money

See "Commercialisation" above. Realistic order of magnitude: voluntary support and sponsorship are small (tens to
low hundreds of złoty a month at early traffic); paid data access and paid reports are the only items that could
cover more than the platform's own cost, and both need a business entity that invoices (owner).

## First roadmap (after approval)

| Step | Scope | Effort guess |
|---|---|---|
| v0 | Dataset structured data and search-ready titles on indicator and region pages; catalogue entries on data.zohelo.com; Search Console verification (owner action: Google account) | 4–6 S Tasks for Developers 4 and 1, alongside `com/site/indicators` |
| v1 | Release cards generated after each publish, a `/cards` page for the owner to post by hand; a "support zohelo" link if approved | 1–2 weeks after the release calendar is published |
| v2 | Paid data access (keyed API on Cloudflare Workers, free tier first) or sponsorship, depending on the owner's decisions and measured traffic | after 3 months of analytics data |

## Risks

- **Traffic is unknown.** Without the analytics Epic live, every revenue estimate is a guess; v2 waits for data.
- **Owner time.** Every external channel needs the owner (accounts, posting, invoicing). The design keeps the
  team's part inside the repos and asks the owner for minutes per release, not hours.
- **Credibility.** A wrong number on a shared card spreads fast. Cards are generated only from published, checked
  values; the Quality Engineer checks cards like pages; readings stay factual, no political judgement.
- **Employment and conflicts.** Selling data services overlaps the owner's job and contract (as with
  zohelo-consulting); the owner decides what is allowed.
- **Platform terms.** Automated posting depends on each network's API terms and prices, which change often; v0 does
  not depend on them.

## What the owner must decide

1. Which channels zohelo should be on (LinkedIn, X, Bluesky, none yet) and whether the owner posts by hand or allows
   automated posting with tokens the owner creates.
2. Whether to accept voluntary support (and which platform), and whether sponsorship is acceptable.
3. Whether to pursue paid data access or paid reports at all, given the owner's employment; a business entity that
   invoices is a precondition.
4. Search Console and Dataset Search: verify zohelo.com with the owner's Google account (a few minutes).

## Consultation

- Domain expert: pending — which releases deserve a card, the wording template of the one-line reading, and which
  indicators people search for most per domain.
- Architect: pending — Dataset markup generated from `catalog.json`, card rendering in Actions with @zohelo/design,
  storage of cards in R2, and the cost and security of a keyed API on Cloudflare Workers within the free tier.

Sources: [Google, Dataset structured data](https://developers.google.com/search/docs/data-types/dataset),
[Our World in Data, funding](https://ourworldindata.org/funding),
[ifirma, rozliczanie Patronite](https://www.ifirma.pl/blog/aktualnosci/patronite/).
