# Lucas' personal website

> My personal website. Plain HTML/CSS/JS, like the aztecs used to do. Check it out at https://lsantos.dev

## Stack

- IBM Plex Mono for all fonts, self-hosted in `fonts/`
- HTML, CSS, JS... That's really it. Some native webcomponents as well (`<site-sidebar>` and `<site-footer>` in `js/components.js`)
- A `sync.js` script that pulls content from my Obsidian vault and the blog, and bakes it into the HTML, so pages don't fetch anything at runtime

## Editing content

- `data/bio.md` is the about text on the homepage
- `data/now.md` is the /now page, the "last updated" date is the file's modified date
- `data/projects.json` is the /projects list, sorted by `status` (`active`, `inactive`, `archived`)
- Gear comes from the vault notes that have a `personalRating`. The /uses category is `x-personal-site-category` (falls back to `other`), and `updatedAt` shows up on the gear detail page. To list an item under another one (a lens under its camera), add `x-personal-site-parent: "[[Parent Note]]"` to the child; it can also be a list of links

After changing any of these, run `bun run sync`. It fetches the latest 3 posts from the blog RSS, generates the gear pages in `gear/` (with covers converted to WebP), and replaces everything between the `<!-- bake:name -->` and `<!-- /bake:name -->` markers in the pages.

## Running locally

```sh
bun install
bun run dev    # browser-sync on http://localhost:3456 with hot reload
bun run sync   # bake content into the pages
```

`sync.js` reads the vault from `~/Documents/Obsidian/Vaults/Default`, override it with `VAULT_DIR` (notes) and `VAULT_ASSETS` (images).

## License

MIT
