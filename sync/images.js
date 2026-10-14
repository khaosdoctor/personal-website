import { existsSync } from 'fs';
import { readdir, rm } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import { debug, log, GEAR_IMG, FETCH_TIMEOUT_MS, fetchWithTimeout } from './options.js';

export const COVER_DIR = './img/gear/covers';

// Deletes the images in img/gear and img/gear/covers that no note page uses any more.
// Each folder is skipped when nothing in it is in use, so a run that found no notes deletes nothing
export async function pruneImages(embeds, covers) {
  const unused = [];
  if (embeds.size) {
    const files = await readdir(GEAR_IMG, { withFileTypes: true });
    unused.push(...files.filter(f => f.isFile() && !embeds.has(f.name)).map(f => join(GEAR_IMG, f.name)));
  }
  if (covers.size) unused.push(...(await readdir(COVER_DIR)).filter(f => !covers.has(f)).map(f => join(COVER_DIR, f)));
  for (const f of unused) await rm(f);
  if (unused.length) log.info(`${unused.length} unused images removed: ${unused.join(', ')}`);
}

export async function optimizeImage(input, outputPath) {
  try {
    await sharp(input).resize({ width: 600, withoutEnlargement: true }).webp({ quality: 80 }).toFile(outputPath);
    return true;
  } catch { return false; }
}

// Returns { src, downloaded }: src is the local WebP, or the remote URL when the download failed
export async function fetchCover(url, slug) {
  const dest = join(COVER_DIR, `${slug}.webp`);
  const local = `/img/gear/covers/${slug}.webp`;
  if (existsSync(dest)) {
    debug.covers('%s: cached', slug);
    return { src: local, downloaded: false };
  }
  try {
    debug.covers('%s: fetching %s', slug, url);
    const res = await fetchWithTimeout(url);
    if (!res.ok) {
      log.warn(`${slug}: cover HTTP ${res.status}, keeping remote URL`);
      return { src: url, downloaded: false };
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (!await optimizeImage(buf, dest)) {
      log.warn(`${slug}: cover could not be converted, keeping remote URL`);
      return { src: url, downloaded: false };
    }
    debug.covers('%s: saved %d bytes source -> %s', slug, buf.length, dest);
    return { src: local, downloaded: true };
  } catch (err) {
    log.warn(`${slug}: cover ${err.name === 'TimeoutError' ? `timed out after ${FETCH_TIMEOUT_MS}ms` : err.message}, keeping remote URL`);
    return { src: url, downloaded: false };
  }
}
