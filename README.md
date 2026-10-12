# Lucas' personal website

> My personal website. Plain HTML/CSS/JS, like the aztecs used to do. Check it out at https://lsantos.dev

## Stack

- IBM Plex Mono for all fonts, self-hosted in `fonts/`
- HTML, CSS, JS... That's really it. Some native webcomponents as well (`<site-sidebar>` and `<site-footer>` in `js/components.js`)
- A `sync.js` script that pulls content from my Obsidian vault and the blog, and bakes it into the HTML, so pages don't fetch anything at runtime

## Editing content

- `data/bio.md` is the about text on the homepage
- `data/now.md` is the /now page, the "last updated" date is the file's modified date
- `data/ai-usage.md` is the text of the /ai-usage page, linked as "[AI usage policy]" under the theme toggle
- `data/friends.md` is the /friends page
- `data/projects.json` is the software on /projects. Its `status` picks the section: `active` and `in-progress` go under Active, `done`, `inactive` and `archived` under Done, next to the builds
- Vault notes reach the site through `x-personal-site-export-type`, which is `uses`, `build` or a list of both (`[uses, build]`). Notes with `private: true` stay off the site, and `> [!private]` callouts and `%% %%` comments are stripped from the page
- Gear (`uses`) also needs an `x-personal-site-category`, the /uses section it goes under; `personalRating` is optional, and `updatedAt` shows up on the gear detail page. To list an item under another one (a lens under its camera), add `x-personal-site-parent: "[[Parent Note]]"` to the child; it can also be a list of links
- Builds (`build`) are listed in the builds section of /projects with a `status` badge (`planned`, `in-progress` or `built`). A build that is also gear keeps its page in `gear/`, the others get one in `builds/`

After changing any of these, run `bun run sync`. It fetches the latest 3 posts from the blog RSS, generates the note pages in `gear/` and `builds/` (with covers converted to WebP), and replaces everything between the `<!-- bake:name -->` and `<!-- /bake:name -->` markers in the pages.

It also writes the RSS feeds, the latest 20 items each: `now.xml` has one item per commit to `data/now.md`, `uses.xml` one per gear note dated by its `updatedAt` (or `createdAt`), `projects.xml` one per project added or changed in the `data/projects.json` history plus the builds, and `feed.xml` merges the three. Blog posts stay in the blog's own feed.

## Running locally

```sh
bun install
bun run dev         # quiet sync, then browser-sync on http://localhost:3456 with hot reload
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
