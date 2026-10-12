import { existsSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';
import { debug, log, FETCH_TIMEOUT_MS, fetchWithTimeout } from './options.js';

export const COVER_DIR = './img/gear/covers';

export async function optimizeImage(input, outputPath) {
  try {
    await sharp(input).resize({ width: 600, withoutEnlargement: true }).webp({ quality: 80 }).toFile(outputPath);
    return true;
  } catch { return false; }
}

export async function fetchCover(url, slug) {
  const dest = join(COVER_DIR, `${slug}.webp`);
  if (existsSync(dest)) {
    debug.covers('%s: cached', slug);
    return `/img/gear/covers/${slug}.webp`;
  }
  try {
    debug.covers('%s: fetching %s', slug, url);
    const res = await fetchWithTimeout(url);
    if (!res.ok) {
      log.warn(`${slug}: cover HTTP ${res.status}, keeping remote URL`);
      return url;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (!await optimizeImage(buf, dest)) {
      log.warn(`${slug}: cover could not be converted, keeping remote URL`);
      return url;
    }
    debug.covers('%s: saved %d bytes source -> %s', slug, buf.length, dest);
    return `/img/gear/covers/${slug}.webp`;
  } catch (err) {
    log.warn(`${slug}: cover ${err.name === 'TimeoutError' ? `timed out after ${FETCH_TIMEOUT_MS}ms` : err.message}, keeping remote URL`);
    return url;
  }
}
