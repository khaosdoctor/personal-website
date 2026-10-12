import { log, RSS_URL, fetchWithTimeout } from './options.js';

const ENTITY_MAP = { '&apos;': "'", '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"' };
const RE_RSS_ITEM = /<item>([\s\S]*?)<\/item>/g;
const RE_ENTITY = /&(?:apos|amp|lt|gt|quot);/g;
const RSS_RE = Object.fromEntries(['title', 'link', 'pubDate'].map(t =>
  [t, new RegExp(`<${t}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|<${t}>([^<]*)</${t}>`)]));

const rssTag = (b, tag) => { const m = b.match(RSS_RE[tag]); return m?.[1] ?? m?.[2] ?? ''; };

export async function syncPosts() {
  log.step('📡 Fetching blog RSS');
  const res = await fetchWithTimeout(RSS_URL);
  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
  const xml = await res.text();
  const items = [...xml.matchAll(RE_RSS_ITEM)].map(([, b]) => {
    const d = rssTag(b, 'pubDate');
    return {
      title: rssTag(b, 'title').replace(RE_ENTITY, m => ENTITY_MAP[m]),
      link: rssTag(b, 'link'),
      date: d ? new Date(d).toISOString().split('T')[0] : '',
    };
  });
  log.ok(`${Math.min(items.length, 3)} posts fetched`);
  return items.slice(0, 3);
}
