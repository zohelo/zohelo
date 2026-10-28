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
2. **Citable vintages.** Each release copies the panel files into an immutable `07_research/<dataset>/<vintage>/`
   prefix and deposits them on Zenodo, so official sources' silent revisions no longer change what a paper cited.
   (Iceberg snapshots cannot do this: the catalog keeps one snapshot per table and expires older ones after 1 h.)
3. **Provenance.** Every value traces back to its Landing receipt (source file, SHA-256, download time); the receipt
   stays after Archive retention removes the file. That is rare and valued in replication packages.
4. **One column, one definition.** "Harmonised" means conformed keys and units, never GUS and Eurostat values
   blended in one series: every panel row keeps `source_system` and `measure_key`.

## What it does

- **Research datasets.** Curated panels published as Parquet and CSV with a codebook in Polish and English. In
  order of readiness (Domain expert, economy): (1) powiat labour & population, 380 powiats + 16 voivodeships ×
  2002–, from GUS BDL KPIs we already load; (2) voivodeship / NUTS 2 macro (needs regional GDP and LFS-by-NUTS 2
  KPIs); (3) Poland in the EU NUTS 2 comparison (Eurostat Bronze, no KPI yet); (4) gmina/powiat public finance
  (not loaded). Each one is versioned, carries a DOI from Zenodo (free) and a ready citation.
- **Client libraries.** Thin Python and R packages ("list datasets and vintages, download, cache, read", about 200
  lines each) that read the vintage files from Zenodo's public URLs (`zohelo.panel("powiat-labour",
  vintage="2026-11")`). They read files only, with no server cost and no credentials; R2 stays private (D7).
- **Methods notes.** One per panel plus a shared geography note, reviewed by the Domain expert: territory (as-of vs
  constant boundaries with a published concordance, city vs land powiats, PL91 + PL92 for Mazowieckie, changes
  cited from TERYT change lists), breaks as a flag column (NSP 2011 and 2021, LFS 2021, ESA 2010, NACE Rev. 2),
  coverage (powiat wages cover entities with more than 9 employees; registered vs LFS unemployment), denominators,
  deflation, suppressed cells kept missing with a status column, and the source release dates in each vintage.
  They double as teaching material.
- **Analysis notebooks.** Worked examples (convergence of voivodeships, labour-market slack by powiat). They show
  the data in use and feed zohelo-journal stories.

## How it uses zohelo data

- Built only on `06_published/v1` (contract D5): `catalog.json`, `kpi/*/series.parquet`, `geo/<level>.geojson`.
  Research panels are new published artefacts written by `gold.publish`, so the single-writer rule holds.
- Vintages: a write-once `research.release` activity (its own prefix `07_research/`, so `gold.publish` stays the
  sole writer of `06_published/`) copies the panel files with a SHA-256 manifest and deposits them on Zenodo
  (Architect consultation on zohelo#249). It fails if the vintage exists; errata get a new vintage. A panel is a
  few MB, so even 10 panels × 4 vintages a year stay under 1 GB/year. The exact prefix and writer are settled by
  the Architect when the Tasks are written.
- Contract first: a panel is a new artefact type, so it gets a JSON Schema and a `catalog.json` entry in zohelo-data
  before any reader is written (as D24).
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
| v0 | One panel (powiat labour & population: population, working-age share, registered unemployment, average gross wage, births, deaths, net migration, density) as Parquet/CSV + PL/EN codebook, `research.release`, one vintage, a Zenodo DOI (sandbox first), a `/research` page on zohelo.com; about 6–8 S/M Tasks | 1–2 weeks after `data/published/published-v1` |
| v1 | Python package (about 3 Tasks); the voivodeship / NUTS 2 macro panel once regional GDP is loaded; methods notes reviewed by the Domain expert | 3–4 weeks |
| v2 | R package via r-universe (about 3 Tasks); notebooks; quarterly vintages on a schedule | after v1 has its first external users |

## Risks

- **Dependency.** Everything waits for the published layer (Epic `data/published/published-v1`, target January
  2027). Before that only the brief and the dataset designs can move.
- **Correctness.** A citable dataset with a harmonisation error spreads into papers. Mitigations: the Domain
  expert reviews every methods note, the Quality Engineer cross-checks values against the sources, and errata
  come with a new vintage, never an overwrite.
- **Licences (not legal advice).** Redistributing source data in bulk is stricter than showing it. The licence
  register must say "redistribution allowed" for each source in a panel; the licence seed has no such field yet
  (a `data/` Task for Developer 1 after approval). The NBP terms question is still open.
- **Irreversible DOIs.** Zenodo files cannot be deleted after publishing, so the release job runs the Quality
  Engineer's checks first and the first deposits are manual.
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
4. A Zenodo account and token (and later PyPI/r-universe accounts), and keeping research vintages forever (a new
   retention rule).

## Consultation

- Domain expert (economy): approved with changes on zohelo#249 (v0 = powiat labour & population panel, since we
  load no regional GDP; methods-note checklist; audience ranked; PL/EN codebook).
- Architect: answered on zohelo#249 (vintages as write-once copies in `07_research/`, Zenodo deposit from the release
  job, readers reading Zenodo files; cost negligible).
