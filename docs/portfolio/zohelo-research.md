# zohelo-research — discovery brief

Status: draft, Product Owner, 28 Oct 2026. Discovery Epic `com/portfolio/research`. No Developer time until the owner
approves (docs/team.md in zohelo-data, decision O13).

## Who it is for

- Researchers and students who use Polish official statistics in empirical work: economics and regional science
  departments, public-policy and sociology theses, think tanks (PIE, CASE, IBS, WiseEuropa), analysts at
  local-government offices.
- Data scientists who want ready, tidy panels of Poland, its voivodeships and its powiats, without writing one
  scraper per source.

## The gap it fills

Today a researcher stitches Poland together source by source. There is one API wrapper per source: the `bdl` R
package and `pyBDL` for GUS BDL, the rOpenGov `eurostat` package for Eurostat, `wbstats` for the World Bank. Each
uses its own codes, units, territorial vintages and totals conventions. Nothing gives the researcher three things:

1. **Harmonised panels.** One geography key (TERYT/NUTS), conformed axes (sex, age, currency) and one unit list
   across GUS BDL, GUS DBW, Eurostat, NBP and the World Bank. zohelo-data already builds these in Gold
   (dim_series, conformed dimensions, map_geography).
2. **Citable vintages.** Iceberg snapshots mean a dataset can be frozen as "the panel as of 2026-11-01" and
   cited. Official sources revise silently, so the snapshot is what makes the research reproducible.
3. **Provenance.** Every value traces back to its Landing receipt (source file, SHA-256, download time). That is
   rare and valued in replication packages.

## What it does

- **Research datasets.** Curated panels published as Parquet and CSV with a codebook. Examples: voivodeship macro
  panel 2000–2025, powiat labour market, regional prices, Poland vs EU-27 comparators. Each one is versioned,
  carries a DOI from Zenodo (free) and a ready citation.
- **Client libraries.** Thin Python and R packages that read the published layer
  (`zohelo.panel("voivodeship-macro", vintage="2026-11")`). They read files only; there is no server cost.
- **Methods notes.** Short notes per dataset: breaks in series, territorial reforms (1999, the 2002 and 2021
  powiat changes), deflation, seasonal adjustment. Written with the Domain expert, they double as teaching
  material.
- **Analysis notebooks.** Worked examples (convergence of voivodeships, labour-market slack by powiat). They show
  the data in use and feed zohelo-journal stories.

## How it uses zohelo data

- Built only on `06_published/v1` (contract D5): `catalog.json`, `kpi/*/series.parquet`, `geo/<level>.geojson`.
  Research panels are new published artefacts written by `gold.publish`, so the single-writer rule holds.
- Vintages: a release job copies the panel files to `research/<dataset>/<vintage>/` (R2 storage, within the free
  tier for tens of MB per release) and deposits the same files on Zenodo.
- Licences: each dataset inherits its sources' terms (the licence seed; D23 for GUS DBW). A dataset is published
  only when every source permits redistribution with attribution.

## How it could earn money

Modest and mostly indirect; all of it is an owner decision.

1. Reputation and citations for zohelo and the owner's analyst portfolio (O5). Citations are the currency that
   brings academic users to zohelo BI.
2. Research grants and calls that fund open data infrastructure (for example NCN or EU programme calls, or
   foundations funding open data). These need an applicant institution or a partner, so they depend on the
   owner's situation.
3. Paid custom extracts or panels for think tanks and consultancies. This overlaps zohelo-consulting and the
   owner's own job, so it is the owner's call only.
4. Sponsorship of the free datasets by an institution, with a clearly marked credit.

## First roadmap (after approval)

| Step | Scope | Effort guess |
|---|---|---|
| v0 | One panel (voivodeship macro: GDP per capita, unemployment, population, wages) as Parquet/CSV + codebook from published-v1, one vintage, a Zenodo DOI, a `/research` page on zohelo.com | 1–2 weeks after `data/published/published-v1` |
| v1 | Python package reading panels and vintages; three more panels; methods notes reviewed by the Domain expert | 3–4 weeks |
| v2 | R package; notebooks; quarterly vintages on a schedule | after v1 has its first external users |

## Risks

- **Dependency.** Everything waits for the published layer (Epic `data/published/published-v1`, target January
  2027). Before that only the brief and the dataset designs can move.
- **Correctness.** A citable dataset with a harmonisation error spreads into papers. Mitigations: the Domain
  expert reviews every methods note, the Quality Engineer cross-checks values against the sources, and errata
  come with a new vintage, never an overwrite.
- **Licences (not legal advice).** Redistributing source data in bulk is stricter than showing it. The licence
  register must say "redistribution allowed" for each source in a panel. The NBP terms question is still open.
- **Maintenance.** Packages and vintages create a promise to users. Keep the surface small: files plus thin
  readers, no API server.
- **Adoption is slow.** Academic users arrive over terms, not weeks. Success in the first 6 months means
  downloads and one or two citations, not revenue.

## What the owner must decide

1. Whether zohelo-research becomes a product: its own repo (`zohelo-research`) and Developer, or a `/research`
   section of zohelo plus published-layer Tasks in zohelo-data (the Product Owner suggests the latter for v0).
2. Whether datasets carry the owner's name as author or "zohelo" as the creator on Zenodo (an account the owner
   must create).
3. Whether to pursue grants or institutional partners at all, given the owner's employment.

## Consultation

- Domain expert: pending (dataset choice, methods notes, how researchers use these panels).
- Architect: pending (vintage storage, Zenodo deposit from Actions, packages within the free platform).
