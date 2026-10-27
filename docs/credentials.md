# Credentials register

All credentials live once, at the GitHub organisation **zohelo** (Settings → Secrets and
variables → Actions). Repositories hold none of their own. Organisation secrets work for public
repositories on the free plan; all zohelo repositories are public, and every secret is visible to
all of them (owner's choice, 27 October 2026).

## Naming convention

- Variables (not secret, readable in logs) end in `_URL`, `_NAME` or `_ID`.
- Secrets end in a credential word: `_KEY`, `_TOKEN`, `_PASSWORD`, `_LOGIN`, `_EMAILS`.
- Where both a writer and a reader exist, the name carries `WRITE` or `READ`.
- Prefix = capability: `PLATFORM_` (hosting account and deploys), `STORAGE_` (object storage and
  lakehouse), `ORG_BOT_` (the organisation's GitHub App), `PORTAL_` (sign-in), `SOURCE_<SOURCE>_`
  (a data source's account).
- No provider names. Code reads these names directly; only a tool that insists on its own names
  (wrangler: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`) gets a one-line mapping in its workflow.

## Variables

| Name | Value is | Used by |
|---|---|---|
| `PLATFORM_ACCOUNT_ID` | Cloudflare account ID | all repositories |
| `STORAGE_ENDPOINT_URL` | R2 S3 endpoint `https://<account>.r2.cloudflarestorage.com` | zohelo-data, zohelo-bi check |
| `STORAGE_LANDING_BUCKET_NAME` | `zohelo-landing-prod` | zohelo-data |
| `STORAGE_LAKEHOUSE_BUCKET_NAME` | `zohelo-lakehouse-prod` | zohelo-data, zohelo-bi |
| `STORAGE_LAKEHOUSE_CATALOG_URL` | Iceberg REST URL of the catalog | zohelo-data |
| `STORAGE_LAKEHOUSE_CATALOG_NAME` | catalog warehouse name `<account>_zohelo-lakehouse-prod` | zohelo-data |
| `ORG_BOT_CLIENT_ID` | Client ID of the GitHub App zohelo-automation (app settings page) | workflows (app-token action), scheduler Worker |

## Secrets

| Name | What it is | Where it comes from | Used by | Expires |
|---|---|---|---|---|
| `PLATFORM_DEPLOY_TOKEN` | Cloudflare account token "zohelo-platform-deploy": Workers, Pages, Access, DNS for zohelo.com | Cloudflare → Manage account → Account API tokens | all deploys, scheduler setup | yearly (Oct) |
| `STORAGE_WRITE_ACCESS_KEY` / `_SECRET_KEY` | R2 keys "zohelo-storage-write", read and write on both buckets | Cloudflare → R2 → Manage API tokens | zohelo-data | yearly (Oct) |
| `STORAGE_LAKEHOUSE_READ_ACCESS_KEY` / `_SECRET_KEY` | R2 keys "zohelo-storage-lakehouse-read", read only, lakehouse | same | zohelo-bi | yearly (Oct) |
| `STORAGE_LAKEHOUSE_CATALOG_WRITE_TOKEN` | "zohelo-storage-lakehouse-catalog-write": catalog and R2 SQL, write | same | zohelo-data | yearly (Oct) |
| `STORAGE_LAKEHOUSE_CATALOG_READ_TOKEN` | "zohelo-storage-lakehouse-catalog-read": catalog and R2 SQL, read | same | zohelo-bi | yearly (Oct) |
| `ORG_BOT_PRIVATE_KEY` | private key of the GitHub App zohelo-automation | org Settings → GitHub Apps → zohelo-automation → Private keys | workflows, scheduler Worker | never (rotate on suspicion) |
| `PORTAL_SIGNIN_ALLOWED_EMAILS` | emails allowed into data and bi | written by the owner | Access setup in zohelo-data and zohelo-bi | — |
| `SOURCE_GUS_BDL_API_KEY` | GUS BDL API key (registered: 50,000 requests a week) | api.stat.gov.pl registration | zohelo-data | — |
| `SOURCE_GUS_BDL_WEB_LOGIN` / `_WEB_PASSWORD` | GUS BDL website account (subgroup exports) | bdl.stat.gov.pl account | zohelo-data | — |

Cloudflare tokens that are not organisation secrets and must stay: `[Basin Catalog] Table
Maintenance` and `[R2 SQL Studio]` (created and used by Cloudflare itself).

## Checking that every credential works

Run **Check credentials** in zohelo-bi (Actions → Check credentials → Run workflow). It tries
each variable and secret against its service and prints only lengths and status codes.
