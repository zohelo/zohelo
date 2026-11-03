## Unreleased

- `KpiTile` — optional `notes`: lines under the period, in order (a benchmark verdict, the source name) (zohelo#411).
- `KpiTile` — the value never breaks inside the number (`white-space: nowrap`), the unit wraps below it when the tile is narrow, and values longer than 7 characters use `size-lg` so they fit a 2-column phone grid and the 6-column desktop strip (zohelo#357).
- `./visuals` — `choroplethSpec` for region maps.
- `DataTable` — a column's `format` also receives the row.
- Tokens — `color.text-faint` (light) is `#686E76` instead of `#8A9099`, so small text passes WCAG AA (≥ 4.5:1) on `surface`, `bg` and `surface-2`.

## 1.0.0

First release of `@zohelo/design`. Exports:

- `.` — `DESIGN_VERSION`, `tokens`, components (`Card`, `Callout`, `FreshnessBadge`, `KpiTile`) and formatters (`formatNumber`, `formatDelta`)
- `./tokens.css` — design tokens as CSS variables, light and dark
- `./theme.css` — Tailwind 4 `@theme` mapping the tokens
- `./fonts.css` — the font set (Plus Jakarta Sans, Newsreader, JetBrains Mono, Inter Variable) and `.z-figures`
- `./visuals` — `Chart`, `lineSpec`, `barSpec`, `config`, `themeFromMode`
