// Copies the published release calendar (feed/calendar.ics) to build/client/calendar.ics after the
// build, byte for byte. The layer's directory is PUBLISHED_DIR, default .published/; when the
// calendar is not there the build goes on without it. public/_headers serves it as text/calendar.
import { copyFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.env.PUBLISHED_DIR ?? '.published';
const src = join(dir, 'feed', 'calendar.ics');
const out = join(import.meta.dir, '..', 'build', 'client');

if (!existsSync(src)) {
  console.log(`calendar: ${dir}/feed/calendar.ics missing, no calendar written`);
  process.exit(0);
}

const text = readFileSync(src, 'utf8');
if (!text.startsWith('BEGIN:VCALENDAR')) throw new Error(`calendar: ${src} is not an iCalendar file`);
copyFileSync(src, join(out, 'calendar.ics'));
const events = (text.match(/^BEGIN:VEVENT/gm) ?? []).length;
console.log(`calendar: ${events} events written to build/client/calendar.ics`);
