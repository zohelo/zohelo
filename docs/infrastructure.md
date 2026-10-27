# Infrastructure

## Hosting and domains

The domain `zohelo.com` is registered at Cloudflare and its DNS is managed there.

| Address | Cloudflare Pages project | Server-side parts (Pages Functions) | Sign-in |
|---|---|---|---|
| zohelo.com, www.zohelo.com | `zohelo` | `/api/stocks/quote`: Finnhub proxy (key on the server) | public |
| data.zohelo.com | `zohelo-data` | `/api/*`: R2 file index, catalogue, signed downloads (R2 bindings `LANDING`, `LAKEHOUSE`) | Access app `zohelo-data-portal` |
| bi.zohelo.com | `zohelo-bi` | `/api/*`: semantic manifest, measure catalogue, metric series over R2 SQL | Access app `zohelo-bi` |

Every project also answers on `<project>.pages.dev` and on preview addresses
`<branch>.<project>.pages.dev`; the Access apps cover those too.

Mail for zohelo.com is Zoho Mail (MX, SPF, DKIM and DMARC records in the zone); no automation touches them.

## Sign-in (Cloudflare Access)

- Identity: one-time e-mail code. Allowed addresses: organisation secret `PORTAL_SIGNIN_ALLOWED_EMAILS`
  (comma separated), applied through the shared reusable policy **zohelo portal sign-in**.
- Session: 24 hours.
- The data portal's API checks the signed-in email itself as well: it verifies the Access token
  (`Cf-Access-Jwt-Assertion` header or `CF_Authorization` cookie) against the team's public keys.
  `https://data.zohelo.com/api/health` shows what the API sees of your sign-in (no data).

## Setup as code

Each deploy runs its repository's setup script before deploying. The scripts are idempotent:
they create what is missing and correct what drifted.

| Repository | Script | What it manages |
|---|---|---|
| zohelo | `scripts/cloudflare-setup.ts` | Pages project `zohelo`, its Finnhub secret; on main: domains zohelo.com and www, their DNS records |
| zohelo-data | `portal/cloudflare_setup.py` | Pages project `zohelo-data` (R2 bindings, signing key, allowed emails, Access team domain), Access app; on main: domain data.zohelo.com and its DNS |
| zohelo-bi | `ops/ensure-platform.ts` | Pages project `zohelo-bi` (R2 SQL read token), Access app, domain bi.zohelo.com and its DNS |
| zohelo-data | `ops/scheduler_trigger.py` (Ops workflow) | Worker `zohelo-scheduler`: code, cron, app credentials |

DNS is changed only by runs from `main`. Each change prints the previous value in the run log.

## Workers

| Worker | Purpose |
|---|---|
| `zohelo-scheduler` | Cron `17,47 * * * *`: dispatches the zohelo-data Pipeline run "scheduler: dispatch due runs" as the GitHub App. GitHub's own schedule in the Pipeline stays as the backup. |

## Storage and lakehouse

| Resource | Name | Notes |
|---|---|---|
| R2 bucket | `zohelo-landing-prod` | raw downloads (Landing) and the Landing Archive |
| R2 bucket | `zohelo-lakehouse-prod` | Iceberg tables (Bronze, Silver, Gold), portal index and catalogue files |
| R2 Data Catalog | on `zohelo-lakehouse-prod` | Iceberg REST catalog; Cloudflare runs table maintenance with its own token `[Basin Catalog] Table Maintenance` (do not delete) |
| R2 SQL | same catalog | used by the portal and BI APIs and some pipeline checks |

## Costs (October 2026)

R2 storage is the only paid item: about 161 GB stored against the 10 GB free allowance, roughly
$2.40 a month; reads and egress are free. Pages, Workers, Access (up to 50 users), DNS and GitHub
(public repositories) run on free tiers. Domain renewal is billed yearly by Cloudflare Registrar.

## Previous values (for a rollback)

| Record | Before 27 Oct 2026 |
|---|---|
| zohelo.com | A 35.237.146.44 (Google Cloud VM, deleted) |
| www.zohelo.com | CNAME zohelo.com |
| data.zohelo.com | CNAME rutkala.github.io (GitHub Pages, switched off) |

The old targets no longer exist; a rollback now means redeploying, not repointing.
