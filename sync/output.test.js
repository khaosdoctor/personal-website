// Smoke test of the baked site: run `bun test` after `bun sync.js`. CI runs it between the bake and the
// commit, so a bake that breaks a page, a feed or an image link fails the build instead of going live.
// Only real breakage fails it; content choices (an empty list, a second h1 in a note) are left to the bake's warnings
import { test, expect } from 'bun:test';
import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const htmlIn = dir => readdirSync(dir).filter(f => f.endsWith('.html')).map(f => join(dir, f));
const rootPages = htmlIn('.');
const notePages = [...htmlIn('gear'), ...htmlIn('builds')];
const read = f => readFileSync(f, 'utf-8');

// An empty block can be correct (no planned builds), so only a lost closing marker counts as broken
test('every bake marker is closed', () => {
  for (const file of rootPages) {
    const html = read(file);
    for (const [, name] of html.matchAll(/<!-- bake:([\w-]+) -->/g)) {
      expect(html.includes(`<!-- /bake:${name} -->`), `${file}: bake:${name} has no closing marker`).toBe(true);
    }
  }
});

// No XML parser in Bun, so this checks what breaks a feed reader: every tag closed in order, no bare &
function xmlProblem(xml) {
  const body = xml.replace(/<!\[CDATA\[[\s\S]*?\]\]>|<\?[\s\S]*?\?>|<!--[\s\S]*?-->/g, '');
  const open = [];
  let roots = 0;
  for (const [, slash, name, selfClosing] of body.matchAll(/<(\/?)([\w:.-]+)[^>]*?(\/?)>/g)) {
    if (!slash && !open.length) roots++;
    if (selfClosing) continue;
    if (!slash) {
      open.push(name);
      continue;
    }
    const last = open.pop();
    if (last !== name) return `</${name}> closes <${last}>`;
  }
  if (open.length) return `<${open.at(-1)}> is never closed`;
  if (roots !== 1) return `${roots} root elements, expected 1`;
  if (/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[\da-f]+);)/i.test(body)) return 'bare & outside CDATA';
  return '';
}

test('sitemap and feeds are well-formed XML', () => {
  for (const file of readdirSync('.').filter(f => f.endsWith('.xml'))) {
    expect(xmlProblem(read(file)), file).toBe('');
  }
});

// Remote images (a cover whose download failed keeps its URL) are not checked
test('every local image a page uses exists', () => {
  for (const file of [...rootPages, ...notePages]) {
    for (const [, src] of read(file).matchAll(/<img[^>]*?\ssrc="(\/[^"#?]*)/g)) {
      expect(existsSync(`.${decodeURIComponent(src)}`), `${file}: ${src} is missing`).toBe(true);
    }
  }
});
