# personal-website

My personal website. Plain HTML/CSS/JS, no framework.

## Stack

- IBM Plex Mono, black/white ASCII aesthetic
- Native web components for sidebar/footer reuse
- Bun script (`sync.js`) to sync blog posts from RSS and gear notes from Obsidian vault

## Dev

```bash
bun install
bun run sync.js
# serve on localhost:3456 with any static server
```

Set `VAULT_DIR` to override the default Obsidian vault path.

Manual gear entries go in `data/gear/*.md` with frontmatter (see `data/gear/gear.template.md`).

## License

MIT
