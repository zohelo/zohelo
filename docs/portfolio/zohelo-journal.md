# zohelo-journal — product brief (discovery)

Status: draft, 28 Oct 2026, Product Owner. Discovery Epic `com/portfolio/zohelo-journal` (Area `com/portfolio`).
Not approved: no Developer time until the owner approves (docs/team.md, decision O13).
Consultations: Domain expert (business value, data) and Architect (feasibility, cost) — answers on the PR or
issue that carries this brief.

## In one sentence

Short, data-first news about Poland — "what the new numbers say" — written within hours of each GUS, NBP and
Eurostat release, every claim linked to a live zohelo indicator page, in Polish and English.

## Who it is for

1. **People who follow the Polish economy but do not read GUS releases**: analysts, controllers, small-business
   owners, journalists, students. They want the number, the trend and one sentence of context, fast.
2. **Regional readers**: local media, municipal and voivodeship staff, regional developers. National outlets rarely
   say what a release means for Podkarpackie or Opolskie; zohelo already holds voivodeship (and later powiat) data.
3. **English-speaking readers of Poland** (investors, researchers, expats): bank research comments are mostly Polish
   or behind client logins.

Not for: breaking political news, opinion journalism, market tips.

## What it does

- **Release notes** (core format, 150–300 words): one per significant release — CPI, wages and employment, industrial
  production, retail sales, unemployment, NBP rate decisions, GDP flash, population. Headline number, change vs previous
  period and year, the longest-run comparison that is true ("highest since…"), the regional spread, one chart, a link to
  the indicator page and the source release. Triggered by the release calendar and the pipeline's `feed/changes.json`.
- **Regional angle**: a ranking or map paragraph in every release note where the data has voivodeship detail.
- **Weekly digest**: the week's releases in one page and one e-mail — the same channel the newsletter Epic
  (`com/growth/newsletter`) plans; the journal supplies its content.
- **Explainers** (later): evergreen pages on how an indicator is built (HICP vs CPI, registered vs LFS unemployment),
  drawn from the Domain expert's knowledge files (`docs/domains/`).
- **Sharing**: each note has an OG image (the chart), a stable URL, RSS (already built: `rss.xml`) and a short social
  text the owner can post. Posting on social accounts stays an owner action (docs/team.md, shared rules).

How it is written: generated from the published data by a template + LLM step, then **reviewed by a human before
publication** (see Risks: AI Act, press law). Numbers are filled from `kpi/<kpi_key>/latest.json` and `series`, never
typed by the model; the model writes only connecting sentences, and a check rejects any number in the text that is not
in the data.

## How it uses zohelo data

| Needs | Exists today | Gap |
|---|---|---|
| KPI values, previous period, series | `kpi/<kpi_key>/latest.json` (D22), Gold v1 | 40-KPI list (catalogue-v1 `kpis-40`) |
| What changed and when | `feed/changes.json` contract; what-changed Epic | publish step writing it |
| Release dates | — | release calendar (zohelo-data release-scheduling `calendar` todo) |
| Regional detail | voivodeship values in latest.json | powiat level later |
| Indicator pages to link to | `/indicators/:kpi` Tasks in progress (com/site/indicators) | pages live |
| Charts | @zohelo/design visuals via `.client` modules (D25); OG images (site-v1 `og` todo) | OG generator |

The journal is therefore a **consumer** of Phase 1 work already in the backlog; it adds no new source. Its first
release can only ship after indicator pages and `feed/changes.json` are live.

## Builds on the site's placeholders

zohelo.com already has a "The Chronicles" section (`src/components/ChroniclesSection.tsx`, `ArticleModal.tsx`,
`src/content/articlesData.ts`, search in `CommandPalette.tsx`) with 4 invented sample articles. The journal replaces
that data with real notes loaded from `content/journal/<date>-<slug>.md` at build; the card and modal layout can stay.
The samples carry invented bylines today — filed as Bug zohelo#212 for Developer 4, independent of this brief.

## How it could earn money

Honest expectation: little in year one; the journal's main value is **traffic and return visits** for zohelo and
zohelo BI. Options, in order of realism:

1. **Newsletter sponsorship** once the digest has a few thousand subscribers (sponsorship is now the dominant
   newsletter model; paid subscriptions remain a small minority — InboxReads 2025: 77% of newsletters open to sponsors,
   2% paid). Fits a B2B audience (accounting software, banks, recruitment).
2. **Paid regional briefs** (later, with zohelo-products): a monthly PDF per voivodeship or powiat for municipalities and
   regional business groups.
3. **Licensing of release notes** to regional portals (text + chart, attributed).
4. Display ads: not recommended (low CPM in Polish, hurts trust and page weight).

Anything paid or any account (newsletter provider, ad network) is an owner decision.

## First roadmap (after approval)

| Step | Outcome | Depends on |
|---|---|---|
| J0 | Editorial rules: formats, tone, number-check rule, correction policy, AI disclosure text (PL/EN) | owner decisions below |
| J1 | `/journal` index and `/journal/:slug` pages from Markdown at build; Chronicles section switched to real notes | indicator pages live |
| J2 | Release-note generator: one KPI release → Markdown draft as a PR in the zohelo repo (human review = PR review by the owner) | 40 KPIs published, `feed/changes.json` |
| J3 | Number check in CI: every number in a note matches `latest.json`/`series` | J2 |
| J4 | Weekly digest page + newsletter content (with `com/growth/newsletter`) | newsletter provider decision |
| J5 | OG images and share texts per note | site-v1 `og` |

Proposed placement: J1 and J3 in the zohelo repo (Developer 4 or the journal's own Developer); J2's generator either
in zohelo or a new `zohelo-journal` repo — Architect's call (see consultation).

## Risks

- **Press law.** A website that publishes periodically under a stable title to inform the public may count as press
  (Prawo prasowe art. 7; Supreme Court ruling on internet press). Registration at the district court (40 zł) needs a
  named editor-in-chief who is a Polish citizen with full public rights; publishing unregistered press risks a fine.
  A human editor is legally responsible for content. → owner decision 1.
- **EU AI Act art. 50(4)** (applies from 2 Aug 2026): AI-generated text published to inform the public on matters of
  public interest must be disclosed as AI-generated, **unless** it has had substantive human review and a person holds
  editorial responsibility. Either way the journal needs a named human reviewer or a visible AI label. → owner decision 2.
- **Wrong numbers** destroy trust fast. Mitigation: numbers only from data, CI number check, Quality Engineer review,
  correction notes.
- **Review load on the owner**: one note per significant release is roughly 15–25 notes a month. If the owner cannot
  review that, the cadence must drop or the AI label route is taken.
- **Speed**: bank economists comment within minutes of a release; zohelo cannot win on speed, only on regional depth,
  bilingual pages and the link to explorable data.
- **Source terms**: GUS and NBP require the source to be named (D23); every note names and links its source.
- **Overlap with the owner's job** (decision O13 on consulting): commentary that reads as investment or business advice
  stays out of scope.

## What the owner must decide

1. **Editor and registration**: who is the named editor (the owner?) and whether zohelo-journal is registered as a
   press title or kept as non-periodic "notes" (lower obligations, weaker brand).
2. **AI route**: every note reviewed by a human before publication (no AI label needed, review load on the owner), or
   published with a visible "written with AI from official data" label and post-publication review.
3. **Approve the product** with roadmap J0–J5, and whether it gets its own repo and Developer now or starts inside the
   zohelo repo under Developer 4 until J2.
