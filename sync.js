import { existsSync, watch } from 'fs';
import { flag, log, VAULT_DIR, DATA_DIR, FETCH_TIMEOUT_MS } from './sync/options.js';
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

// --watch: rebuild notes and pages when a vault note or data file changes (posts stay from the first fetch)
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
  for (const dir of [VAULT_DIR, DATA_DIR].filter(existsSync)) watch(dir, { recursive: true }, rebuild);
  log.step('👀 Watching for changes');
}
