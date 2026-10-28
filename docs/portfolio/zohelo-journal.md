# zohelo-journal — discovery brief

Status: draft, Product Owner, 28 Oct 2026. Discovery Epic `com/portfolio/journal`. No Developer time until the owner
approves (docs/team.md in zohelo-data, decision O13).

## Who it is for

- Polish readers who follow the economy but do not read statistical releases: business journalists, analysts,
  students, owners of small firms, staff of local government.
- Secondary: English-speaking readers who want Poland's numbers explained (investors, researchers, expats).

## What it does

Short, sourced stories driven by data releases. "Polska w danych" in words: what changed, why it matters, one chart.
The journal has three jobs:

1. **Collecting.** It watches the release calendar and the platform's feed of changed values. A story starts when
   a release arrives (CPI flash, registered unemployment, GDP flash, an NBP rate decision, a Eurostat comparison) or
   when a regional ranking moves.
2. **Writing.** A Claude session drafts the story from published data only. Every number links to its KPI page and
   source. The Domain expert's editorial rules apply: real vs nominal, seasonal adjustment, breaks, comparability.
   The Quality Engineer checks the numbers against the source before the story is published.
3. **Sharing.** Stories appear on zohelo.com at `/journal`. They also go into the RSS feed (the pure RSS writer
   already exists in zohelo), the weekly brief and newsletter (Epic `com/growth/newsletter`), and social posts.
   Social posts are an owner action.

Story types, first to last: release note (≤ 300 words, on release day); regional angle (voivodeship ranking and map);
weekly brief (the five changes that mattered); evergreen explainer (how to read an indicator).

## How it uses zohelo data

- `06_published/v1/feed/changes.json` and the release calendar pick the story.
- `kpi/<kpi_key>/latest.json` and `series.parquet` provide the numbers and the chart.
- `catalog.json` provides definitions, units, sources and licences.
- Charts are @zohelo/design visuals (decision D25 for client-only rendering).
- Built on what exists in zohelo today:
  - `src/components/ChroniclesSection.tsx` with `src/content/articlesData.ts` is the home-page placeholder for this
    product. Its articles are illustrative: invented figures, an invented co-author and a "peer-reviewed" label.
    Epic `com/site/real-content` is removing them. The journal fills the section with real stories.
  - The `brief` item ("Brief i kalendarz") in `src/content/productsData.ts` is the closest product card. The journal
    either becomes that card or a new `journal` card (owner decision 2).
  - The what-changed feed, the RSS writer and the chart-of-the-day rule (Epics `com/growth/*`) are the journal's
    first building blocks.

## How it could earn money

Indirect first, direct later. All of these are owner decisions.

1. Traffic and trust for zohelo BI and the data portal, and a public track record for the owner's analyst portfolio
   (O5).
2. Sponsorship of the weekly brief: one sponsor slot, clearly marked.
3. A paid newsletter tier (deeper regional or sector notes) once the free newsletter has a steady audience.
   Platforms such as Substack and Beehiiv show paid data newsletters work in niches. Polish data journalism
   exists mainly inside large media (Gazeta Wyborcza's data desk, Business Insider Polska, Bankier.pl), plus
   institutional outlets (Obserwator Finansowy of NBP, Tygodnik PIE).
4. Syndication: licensed stories or charts for regional media.

No advertising networks: they cost page weight and trust, and they would need an owner decision.

## First roadmap (after approval)

| Step | Scope | Effort guess |
|---|---|---|
| v0 | `/journal` and `/journal/:slug` routes in zohelo, stories as Markdown in the repo, written by hand by the journal Developer for 4 release types; the home Chronicles section lists the latest 3 | 1–2 weeks |
| v1 | On release day a scheduled session opens a draft-story PR from `feed/changes.json`; Domain expert review and QE number check before merge; stories in the RSS feed | 2–3 weeks, after `data/published/published-v1` (target Jan 2027) |
| v2 | Weekly brief through the newsletter; EN versions; regional stories with maps | after `com/growth/newsletter` and `com/site/regions` |

## Risks

- **Accuracy and trust.** AI-written stories with a wrong number hurt the whole brand. Mitigations: numbers only
  from the published layer, a QE check against the source, and an AI-assistance note on every story.
- **Dependency.** v1 needs the published layer, which is targeted for January 2027. v0 can start before it, with
  hand-written stories built on today's fixtures and live sources.
- **Usage cost.** Daily drafting sessions use the same Claude usage limit that stopped three Developer runs on
  28 Oct. Write one story per major release, not one per change.
- **Press law (not legal advice).** A website that publishes periodically under a stable title to inform the
  public may count as press (Prawo prasowe art. 7; Polish courts have applied this to online publications). A press
  title is registered at the regional court and needs a named editor-in-chief, who is legally responsible for the
  content; publishing an unregistered press title risks a fine. Non-periodic "notes" carry fewer obligations but a
  weaker brand. → owner decision 3. This needs the owner's or a lawyer's check before launch.
- **EU AI Act art. 50(4)** (transparency duties apply from 2 Aug 2026): AI-generated text published to inform the
  public on matters of public interest must be disclosed as AI-generated, unless it has had human review or
  editorial control and a person holds editorial responsibility. Either every story is reviewed by a named person
  before publication, or it carries a visible AI label. → owner decision 2.
- **Review load.** Human review of one note per significant release is roughly 15–25 notes a month. If the owner
  cannot review that, the cadence drops or the AI-label route is taken.
- **Source terms.** Attribution as each source requires: GUS DBW under D23; NBP terms are still open (see the NBP
  licence question).
- **Owner's job.** Commentary under the owner's name could touch his employment or consulting contract (the same
  concern as zohelo-consulting).

## What the owner must decide

1. Approve zohelo-journal as a product: its own repo `zohelo-journal` with its own Developer, or a section of the
   zohelo repo built by Developer 4. The Architect's view is recorded below.
2. Byline and disclosure: "zohelo" as editorial team, or the owner's name; and the AI route: every story reviewed by
   a named person before publication (no AI label needed under art. 50(4)), or published with a visible
   "written with AI from official data" label and reviewed after publication.
   Also whether the journal takes the "Brief i kalendarz" card or gets a new card.
3. The press-law question: register the title or not, and who is named as editor.
4. Language: PL first with EN later (proposed), or both from v0.
5. Money: no direct revenue until v2 (proposed), or a sponsor slot from the first weekly brief.

## Consultation

- Domain expert (business value, story types, editorial rules): requested 28 Oct 2026; answer pending.
- Architect (feasibility, repo choice, cost within free tiers, reuse of `feed/changes.json`): requested
  28 Oct 2026; answer pending.
