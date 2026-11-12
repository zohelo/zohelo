# Decisions

Decisions that concern only this repository, moved from zohelo/zohelo-data `docs/decisions.md` with their ids and text
unchanged (zohelo-data O39, 12 Nov 2026: each repo documents itself). Ids are shared with zohelo-data and never
renumbered; decisions about the data platform, the published contract and how the project is run stay in
[zohelo-data docs/decisions.md](https://github.com/zohelo/zohelo-data/blob/main/docs/decisions.md).

| id | date | question | decision | by |
|---|---|---|---|---|
| O5 | 2026-10-27 | Analyst portfolio | Analyst portfolio runs under the owner's name. | owner |
| D21 | 2026-10-28 | zohelo.com theme | The site forces the light theme (`data-theme="light"` on `<html>`) until its components use token classes; dark mode arrives with the token adoption. | architect |
| D25 | 2026-10-28 | zohelo.com charts | Pages render @zohelo/design visuals (vega) only through a React Router `.client` module rendered after hydration (vega's Node build needs the optional `canvas` package, which breaks pre-rendering); first use `src/components/SampleChart.client.tsx` (zohelo#182). | architect |
