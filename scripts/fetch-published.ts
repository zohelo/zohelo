// Fills the build's copy of the published layer (PUBLISHED_DIR, default .published/) before
// `react-router build`: downloads what the site reads from 06_published/v1/ (zohelo-data
// docs/published.md) with the lakehouse read key, or copies fixtures/published/ when the key is
// absent, so PR checks need no credentials. `--require` (deploy) fails instead of using fixtures.
import { S3Client } from 'bun';
import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { NO_LATEST, publishedDir, readCatalog, requiredLatest } from '../src/published';

type Env = Record<string, string | undefined>;

const fixtures = join(import.meta.dir, '..', 'fixtures', 'published');
const prefix = '06_published/v1/';
const credentialVars = [
  'STORAGE_LAKEHOUSE_READ_ACCESS_KEY',
  'STORAGE_LAKEHOUSE_READ_SECRET_KEY',
  'STORAGE_ENDPOINT_URL',
  'STORAGE_LAKEHOUSE_BUCKET_NAME',
] as const;
const optional = ['feed/changes.json', 'feed/calendar.ics', 'geo/voivodeship.geojson'];

function filesUnder(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => join(e.parentPath, e.name))
    .sort();
}

/** Writes the layer to `out` and returns the paths written. */
export async function fetchPublished(out: string, env: Env, opts: { require: boolean }): Promise<string[]> {
  if (credentialVars.some((name) => !env[name])) {
    if (opts.require) throw new Error('fetch-published: lakehouse read credentials missing');
    rmSync(out, { recursive: true, force: true });
    cpSync(fixtures, out, { recursive: true });
    console.log('fetch-published: no credentials, using fixtures/published');
    return filesUnder(out);
  }

  const client = new S3Client({
    accessKeyId: env.STORAGE_LAKEHOUSE_READ_ACCESS_KEY,
    secretAccessKey: env.STORAGE_LAKEHOUSE_READ_SECRET_KEY,
    endpoint: env.STORAGE_ENDPOINT_URL,
    bucket: env.STORAGE_LAKEHOUSE_BUCKET_NAME,
  });
  rmSync(out, { recursive: true, force: true });
  const written: string[] = [];

  // Bytes are written unchanged; returns false when the object does not exist.
  async function download(path: string): Promise<boolean> {
    const file = client.file(prefix + path);
    if (!(await file.exists())) return false;
    const target = join(out, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, await file.bytes());
    written.push(target);
    return true;
  }

  async function required(path: string) {
    if (!(await download(path))) throw new Error(`fetch-published: ${prefix}${path} missing`);
  }

  await required('catalog/catalog.json');
  const catalog = readCatalog(out);
  for (const key of requiredLatest(catalog)) {
    await required(`kpi/${key}/latest.json`);
  }
  // Published KPIs without latest.json by contract (NO_LATEST): fetched when present, never required.
  const extra = catalog.kpis
    .filter((k) => k.status === 'published' && NO_LATEST.includes(k.kpi_key))
    .map((k) => `kpi/${k.kpi_key}/latest.json`);
  for (const path of [...extra, ...optional]) {
    if (!(await download(path))) console.log(`fetch-published: ${prefix}${path} missing, skipped`);
  }
  readCatalog(out);
  return written;
}

if (import.meta.main) {
  const out = publishedDir();
  try {
    const written = await fetchPublished(out, process.env, { require: process.argv.includes('--require') });
    console.log(`fetch-published: ${written.length} files in ${relative(process.cwd(), out) || out}`);
  } catch (error) {
    // Messages name paths and variable names only, never a credential value.
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
