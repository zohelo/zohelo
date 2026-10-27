# Runbooks

## Deploy

| Product | How |
|---|---|
| zohelo.com | Merge to `main` in zohelo/zohelo → workflow **Deploy zohelo.com**. A manual run on a branch deploys a preview. |
| data.zohelo.com | Merge to `main` touching `portal/` in zohelo-data → **Deploy portal**. Manual run on a branch → preview `<branch>.zohelo-data.pages.dev`. |
| bi.zohelo.com | Every push in zohelo-bi → **Deploy portal**; `main` is production, other branches are previews. |
| Scheduler Worker | zohelo-data → Actions → **Ops · ad-hoc**, script `scheduler_trigger`, args `deploy` (also `status`, `pause`, `resume`). |

Each deploy checks itself: the site answers, the API answers, sign-in is enforced.

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
