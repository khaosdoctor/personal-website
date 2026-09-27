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
- Gear comes from the vault notes that have both a `personalRating` and an `x-personal-site-category` (the /uses section it goes under); notes missing either stay off the site, and `updatedAt` shows up on the gear detail page. To list an item under another one (a lens under its camera), add `x-personal-site-parent: "[[Parent Note]]"` to the child; it can also be a list of links

After changing any of these, run `bun run sync`. It fetches the latest 3 posts from the blog RSS, generates the gear pages in `gear/` (with covers converted to WebP), and replaces everything between the `<!-- bake:name -->` and `<!-- /bake:name -->` markers in the pages.

## Running locally

```sh
bun install
bun run dev         # browser-sync on http://localhost:3456 with hot reload
bun run sync        # bake content into the pages, verbose
bun run sync:quiet  # same, summary lines only
bun run sync:watch  # rebuild on every vault or data change
```

`sync.js` finds the vault through Obsidian's own registry (`obsidian.json`), picking the first vault whose folder name contains `--vault=<name>`, so the path can differ between machines. `bun sync.js --help` lists every flag; each one also reads an environment variable, and the flag wins:

| Flag | Environment variable | Default |
|---|---|---|
| `--vault=<name>` | `VAULT_NAME` | `default` |
| `--vault-dir=<path>` | `VAULT_DIR` | `<vault>/notes` |
| `--vault-assets=<path>` | `VAULT_ASSETS` | `<vault>/internal/assets` |
| `--timeout=<ms>` | `FETCH_TIMEOUT_MS` | `15000` |
| `--debug` | `DEBUG=sync:*` | off |

Verbose output goes through the `debug` package on stderr, split into `sync:vault`, `sync:covers`, `sync:gear` and `sync:bake`, so `DEBUG=sync:covers bun sync.js` narrows it to one stage.

## License

MIT
