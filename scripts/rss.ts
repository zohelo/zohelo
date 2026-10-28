// Writes build/client/rss.xml (pl) and build/client/en/rss.xml after the build from the published
// what-changed feed (feed/changes.json). The layer's directory is PUBLISHED_DIR, default .published/;
// when the feed is not there the build goes on without a feed.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderRss } from '../src/growth/rss';
import { readChanges } from '../src/published';

const dir = process.env.PUBLISHED_DIR ?? '.published';
const out = join(import.meta.dir, '..', 'build', 'client');

function main() {
  if (!existsSync(join(dir, 'feed', 'changes.json'))) {
    console.log(`rss: ${dir}/feed/changes.json missing, no feed written`);
    return;
  }
  const changes = readChanges(dir);
  // The feed's own timestamp, not the clock, so the same feed gives the same file.
  const builtAt = changes.generated_at;
  mkdirSync(join(out, 'en'), { recursive: true });
  writeFileSync(join(out, 'rss.xml'), renderRss(changes.items, 'pl', builtAt));
  writeFileSync(join(out, 'en', 'rss.xml'), renderRss(changes.items, 'en', builtAt));
  console.log(`rss: ${changes.items.length} items written to build/client/rss.xml and build/client/en/rss.xml`);
}

main();
