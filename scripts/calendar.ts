// Writes the published release calendar (feed/calendar.ics) to build/client/calendar.ics after the
// build, without the events of sources or KPIs the licence gate hides (src/licenceGate.ts, through
// readCalendar); every other line is copied unchanged. The layer's directory is PUBLISHED_DIR, default
// .published/; when the calendar is not there the build goes on without it. public/_headers serves it
// as text/calendar. The subscribe links are shown only while the calendar has events.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { calendarEvents, publishedDir, readCalendar } from '../src/published';

const dir = publishedDir();
const out = join(import.meta.dir, '..', 'build', 'client');

const text = readCalendar(dir);
if (text === null) {
  console.log(`calendar: ${dir}/feed/calendar.ics missing, no calendar written`);
  process.exit(0);
}
writeFileSync(join(out, 'calendar.ics'), text);
console.log(`calendar: ${calendarEvents(text)} events written to build/client/calendar.ics`);
