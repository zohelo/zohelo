// Writes the published release calendar (feed/calendar.ics) to build/client/calendar.ics after the
// build, without the events of sources or KPIs the licence gate hides (src/licenceGate.ts); every
// other line is copied unchanged. The layer's directory is PUBLISHED_DIR, default .published/; when
// the calendar is not there the build goes on without it. public/_headers serves it as text/calendar.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { gateCalendar } from '../src/licenceGate';
import { readCatalogUngated } from '../src/published';

const dir = process.env.PUBLISHED_DIR ?? '.published';
const src = join(dir, 'feed', 'calendar.ics');
const out = join(import.meta.dir, '..', 'build', 'client');

if (!existsSync(src)) {
  console.log(`calendar: ${dir}/feed/calendar.ics missing, no calendar written`);
  process.exit(0);
}

const published = readFileSync(src, 'utf8');
if (!published.startsWith('BEGIN:VCALENDAR')) throw new Error(`calendar: ${src} is not an iCalendar file`);
const text = gateCalendar(readCatalogUngated(dir), published);
writeFileSync(join(out, 'calendar.ics'), text);
const count = (s: string) => (s.match(/^BEGIN:VEVENT/gm) ?? []).length;
console.log(`calendar: ${count(text)} events written to build/client/calendar.ics (${count(published) - count(text)} hidden by the licence gate)`);
