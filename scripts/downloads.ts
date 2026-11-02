// Writes build/client/downloads/<kpi_key>.parquet (the published series.parquet, exact bytes) and
// <kpi_key>.csv for every published KPI after the build; a file over DOWNLOAD_LIMIT is skipped.
import { copyFileSync, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DOWNLOAD_LIMIT, seriesCsv } from '../src/dataPages/downloads';
import { publishedDir, readCatalog, readKpiSeries } from '../src/published';

const dir = publishedDir();
const out = join(import.meta.dir, '..', 'build', 'client', 'downloads');
mkdirSync(out, { recursive: true });
let written = 0;
for (const kpi of readCatalog(dir).kpis.filter((k) => k.status === 'published')) {
  const src = join(dir, 'kpi', kpi.kpi_key, 'series.parquet');
  if (!existsSync(src)) {
    console.log(`downloads: kpi/${kpi.kpi_key}/series.parquet missing, skipped`);
    continue;
  }
  if (statSync(src).size > DOWNLOAD_LIMIT) {
    console.log(`downloads: kpi/${kpi.kpi_key}/series.parquet over ${DOWNLOAD_LIMIT} bytes, skipped`);
    continue;
  }
  copyFileSync(src, join(out, `${kpi.kpi_key}.parquet`));
  written += 1;
  const csv = seriesCsv(await readKpiSeries(dir, kpi.kpi_key));
  if (Buffer.byteLength(csv) > DOWNLOAD_LIMIT) {
    console.log(`downloads: ${kpi.kpi_key}.csv over ${DOWNLOAD_LIMIT} bytes, skipped`);
    continue;
  }
  writeFileSync(join(out, `${kpi.kpi_key}.csv`), csv);
  written += 1;
}
console.log(`downloads: ${written} files written to build/client/downloads`);
