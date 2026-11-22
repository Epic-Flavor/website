# Epic Flavor

Website for [Epic Flavor](https://github.com/Epic-Flavor/website), the catering business of Chef William Slade in Hampton Roads, Virginia.

The site is built so a non-technical owner can maintain it by talking to Claude instead of using a site builder.

## How it works

```
Chef asks Claude for a change  →  Claude edits this repo (branch + pull request)
        →  Netlify builds a preview  →  Chef merges  →  live site updates
```

- **Content as data.** Menus and seasonal settings live in `content/menus.json` and `content/site.json`. Pages render them in the browser, so swapping Thanksgiving for Christmas is a one-line change, not a redesign.
- **Standing rules for the AI.** `CLAUDE.md` tells Claude where everything lives, what it may and may not change, and how to handle common requests. Every editing session starts from those rules, so the site stays consistent after many edits.
- **Guardrail before publish.** `scripts/check-content.mjs` runs as the Netlify build step. A malformed menu fails the build, so a bad edit never reaches the live site.
- **One-click rollback.** Every deploy is kept by Netlify, and any earlier version can be republished instantly.
- **No backend.** Plain HTML, CSS and a small script. Inquiries go through Netlify Forms to the chef's email.

## Structure

| Path | What it is |
| --- | --- |
| `content/menus.json` | All menus, sections, dishes and prices |
| `content/site.json` | Featured menu and banner text |
| `*.html` | Pages |
| `styles.css`, `site.js` | Design and menu rendering |
| `scripts/check-content.mjs` | Pre-deploy content check |
| `CLAUDE.md` | Rules for Claude when editing |

## Local preview

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

Built by Gavin Cake.
