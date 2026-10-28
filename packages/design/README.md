# @zohelo/design

The zohelo design system: design tokens, fonts, chart specs and shared React components for
zohelo.com, zohelo BI and zohelo Data, so every product looks and reads the same. It is built here,
in the zohelo repository, and shipped as a GitHub Release tarball (decision D3).

## Install

```bash
bun add https://github.com/zohelo/zohelo/releases/download/design-v<version>/zohelo-design-<version>.tgz
```

Inside this repository the site uses it as a workspace dependency (`"@zohelo/design": "workspace:*"`).

## Exports

| Export | What it is |
|---|---|
| `DESIGN_VERSION` | The package version as a string, e.g. `'1.0.0'` |
