// Entry point of the bake: fetch the blog posts, turn the notes in data/vault into gear/build pages,
// then write everything into the HTML pages, feeds and sitemap. `bun sync.js --help` lists the flags
import { existsSync, watch } from 'fs';
import { flag, log, DATA_DIR, FETCH_TIMEOUT_MS } from './sync/options.js';
import { syncPosts } from './sync/posts.js';
import { syncNotes } from './sync/notes.js';
import { bakePages } from './sync/bake.js';

// A blog outage must not block a gear update, so the posts block keeps its previous content
const posts = await syncPosts().catch(err => {
  log.warn(`${err.name === 'TimeoutError' ? `RSS timed out after ${FETCH_TIMEOUT_MS}ms` : `RSS unavailable: ${err.message}`}, keeping the posts already on the page`);
  return null;
});
await bakePages(posts, await syncNotes());
log.step('✅ Done');

// --watch: rebuild notes and pages when a note or data file changes (posts stay from the first fetch).
// data/ holds data/vault too, so one watcher covers both
if (flag('watch')) {
  let timer;
  const rebuild = (_, file) => {
    if (!/\.(md|json)$/.test(file ?? '')) return;
    clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        await bakePages(posts, await syncNotes());
        log.ok(`rebuilt after ${file}`);
      } catch (err) {
        log.error(`rebuild failed: ${err.message}`);
      }
    }, 500);
  };
  if (existsSync(DATA_DIR)) watch(DATA_DIR, { recursive: true }, rebuild);
  log.step('👀 Watching for changes');
}
