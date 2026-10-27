// Cloudflare side of zohelo.com, idempotent; run by .github/workflows/deploy.yml before each deploy.
//
// - Pages project `zohelo` and its runtime secret FINNHUB_API_KEY (when the organisation secret
//   SOURCE_FINNHUB_API_KEY exists; without it the market-data section shows its fallback quotes).
// - With --switch-dns (main only): attach zohelo.com and www.zohelo.com to the project and point
//   their DNS records at it, replacing the record to the old Google Cloud VM. The old values are
//   printed for a rollback. Mail records (MX, SPF, DKIM, DMARC) are never touched.
//
// Env: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, optional FINNHUB_API_KEY.

const PROJECT = "zohelo";
const ZONE = "zohelo.com";
const HOSTS = ["zohelo.com", "www.zohelo.com"];

function env(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`missing env ${name}`);
  return v;
}

const account = env("CLOUDFLARE_ACCOUNT_ID");
const token = env("CLOUDFLARE_API_TOKEN");
const a = `/accounts/${account}`;

async function cf<T>(method: string, path: string, body?: unknown, allow404 = false): Promise<T | null> {
  const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (allow404 && response.status === 404) return null;
  const json = (await response.json()) as { success: boolean; result: T; errors?: unknown };
  if (!json.success) throw new Error(`${method} ${path}: ${response.status} ${JSON.stringify(json.errors)}`);
  return json.result;
}

const notice = (title: string, message: string) => console.log(`::notice title=${title}::${message}`);

type Project = { name: string; subdomain: string };
let project = await cf<Project>("GET", `${a}/pages/projects/${PROJECT}`, undefined, true);
if (!project) {
  project = (await cf<Project>("POST", `${a}/pages/projects`, { name: PROJECT, production_branch: "main" }))!;
  notice("pages project", `created ${PROJECT} (${project.subdomain})`);
}

const key = process.env.FINNHUB_API_KEY?.trim();
const runtime = {
  compatibility_date: "2026-10-01",
  env_vars: key ? { FINNHUB_API_KEY: { type: "secret_text", value: key } } : {},
};
await cf("PATCH", `${a}/pages/projects/${PROJECT}`, { deployment_configs: { production: runtime, preview: runtime } });
notice("pages project", `${PROJECT}: market-data key ${key ? "set" : "not available (fallback quotes)"}`);

if (process.argv.includes("--switch-dns")) {
  const target = project.subdomain;
  const attached = (await cf<{ name: string }[]>("GET", `${a}/pages/projects/${PROJECT}/domains`)) ?? [];
  for (const host of HOSTS) {
    if (!attached.some((d) => d.name === host)) {
      await cf("POST", `${a}/pages/projects/${PROJECT}/domains`, { name: host });
      notice("domain", `${host} attached to ${PROJECT}`);
    }
  }
  const zone = ((await cf<{ id: string }[]>("GET", `/zones?name=${ZONE}`)) ?? [])[0]?.id;
  if (!zone) throw new Error(`zone ${ZONE} not visible to the token`);
  type Record = { id: string; type: string; name: string; content: string; proxied?: boolean };
  for (const host of HOSTS) {
    const records = ((await cf<Record[]>("GET", `/zones/${zone}/dns_records?name=${host}`)) ?? []).filter((r) =>
      ["A", "AAAA", "CNAME"].includes(r.type),
    );
    if (records.length === 1 && records[0]!.type === "CNAME" && records[0]!.content === target) continue;
    const record = { type: "CNAME", name: host, content: target, proxied: true, comment: "zohelo.com (Pages)" };
    for (const r of records) notice("dns rollback value", `${host} was ${r.type} ${r.content} (proxied=${r.proxied})`);
    // Rewrite the first record in place (no gap in answers), drop any others.
    if (records[0]) await cf("PUT", `/zones/${zone}/dns_records/${records[0].id}`, record);
    else await cf("POST", `/zones/${zone}/dns_records`, record);
    for (const r of records.slice(1)) await cf("DELETE", `/zones/${zone}/dns_records/${r.id}`);
    notice("dns", `${host} now CNAME ${target} (proxied)`);
  }
  const status = ((await cf<{ name: string; status: string }[]>("GET", `${a}/pages/projects/${PROJECT}/domains`)) ?? [])
    .map((d) => `${d.name}: ${d.status}`)
    .join(", ");
  notice("domains", status);
}
