# Runbooks

## Deploy

| Product | How |
|---|---|
| zohelo.com | Merge to `main` in zohelo/zohelo → workflow **Deploy zohelo.com**. A manual run on a branch deploys a preview. |
| data.zohelo.com | Merge to `main` touching `portal/` in zohelo-data → **Deploy portal**. Manual run on a branch → preview `<branch>.zohelo-data.pages.dev`. |
| bi.zohelo.com | Merge to `main` in zohelo-bi → **Deploy portal**; a manual run on a branch deploys a preview. |
| Scheduler Worker | zohelo-data → Actions → **Ops · ad-hoc**, script `scheduler_trigger`, args `deploy` (also `status`, `pause`, `resume`). |

### Scheduled rebuild of zohelo.com

**Deploy zohelo.com** also runs on a schedule (05:40, 09:40, 13:40 and 18:40 UTC), so the numbers follow the published layer without a merge. A scheduled run is a run on `main` and does exactly what a push does: install, type check, fetch the published layer (`--require`), build, deploy, check the site answers. It does not create a release: a scheduled rebuild adds no code (the run log's `deployed` notice records it). The footer of every page shows "Dane z" (EN "Data as of") the catalogue's `generated_at` in Warsaw time, so you can see which publication a deploy carries.

- A failed fetch or build fails the run before the deploy step and leaves the previous deploy live. Nothing is half-published. Read the failed run, fix the cause (credential, layer, code); the next scheduled run, or a manual run on `main`, retries. An unchanged layer is not an error: the run succeeds and redeploys the same numbers.
- GitHub pauses scheduled workflows in a repository after 60 days without repository activity (GitHub emails a warning first). Merges and pushes count as activity. If the schedule has paused, re-enable it under Actions → Deploy zohelo.com. The fallback while it is paused is a dispatch of the workflow from the zohelo-data scheduler (Ops `scheduler_trigger deploy`, see the table above).

Each deploy checks itself. zohelo.com: the site answers. data and bi: sign-in is enforced; bi also runs a smoke test against the lakehouse before deploying.

## Rotate a credential

1. Create the replacement where the register says it comes from ([credentials.md](credentials.md)), same name, same permissions, one-year expiry.
2. Paste it into the organisation secret of the same name (Edit; the old value is replaced).
3. Run **Check credentials** in zohelo-bi.
4. For `ORG_BOT_PRIVATE_KEY` or `ORG_BOT_CLIENT_ID`: also run Ops `scheduler_trigger deploy` so the Worker gets it.
5. For `PORTAL_SIGNIN_ALLOWED_EMAILS`: redeploy data and bi (manual run of their deploy workflows on `main`) so Access picks it up.
6. Delete the old token in Cloudflare.

## Give someone access to data or bi

Add their email to `PORTAL_SIGNIN_ALLOWED_EMAILS` (comma separated), then redeploy data and bi
(step 5 above). They sign in with a one-time code sent to that email.

## Start the scheduler now (instead of waiting for :17 or :47)

Set the Worker's cron to every minute for two or three minutes, then back:
Cloudflare → Workers & Pages → zohelo-scheduler → Settings → Triggers → edit the cron to `* * * * *`,
wait for one firing, restore `17,47 * * * *`. Or run Pipeline `platform · scheduler: dispatch due runs` by hand.
Extra firings are harmless: the scheduler only dispatches runs that are due.

## Add a new product

1. Create repository `zohelo/zohelo-<name>` (public, so organisation secrets reach it).
2. Copy zohelo-bi's `ops/ensure-platform.ts` and `.github/workflows/deploy.yml`; change the project name and domain.
3. First push deploys a preview; merge to `main` attaches `<name>.zohelo.com`.
4. Add the product to [architecture.md](architecture.md) and [infrastructure.md](infrastructure.md).

## A site is down

1. Cloudflare → Workers & Pages → the project → Deployments: the latest production deployment should be green. If not, **Rollback** to the previous deployment (one click).
2. DNS: the site's record must be a proxied CNAME to `<project>.pages.dev`; the project's Custom domains tab must show it Active.
3. Signed-in sites: `/api/health` (data) shows whether the API sees your sign-in.

## The data portal says "Sign in" but you are signed in

An old copy of the portal is cached on that device. Chrome → Settings → Site settings → zohelo.com
→ Delete data (and remove an installed portal app), then reload.

Last verified: 2026-10-28
