# Epic Flavor website: rules for Claude

This is the website for Epic Flavor, Chef William Slade's catering business in Hampton Roads, Virginia. The owner is a chef, not a developer. He will ask for changes in plain English. Keep changes small, keep the site looking the way it does, and explain what you changed in one or two plain sentences.

## Where things live

- `content/menus.json`: seasonal menus (Holiday, Thanksgiving, and any new ones). Dishes, descriptions and prices go here, never in HTML. The chef has no standing menu; clients tell him what they want. Only seasonal menus live here, and the featured one shows on `holiday.html`, reached from the red "Holiday Menu" button with lights in the header.
- `content/site.json`: which menu is featured, the banner text at the top of each page, and whether the banner shows.
- `holiday.html`: the festive seasonal menu page. Its content comes from `content/menus.json`.
- `index.html`, `services.html`, `about.html`, `gallery.html`, `order.html`, `thanks.html`: page text. The header and footer are repeated in every page, so a change to either must be made in all of them.
- `styles.css`: colors and fonts. Do not change unless asked.
- `images/`: photos.

## Common requests

- **New seasonal menu**: add a menu to `content/menus.json` with a unique `id`, set `"show": true`, then set `featuredMenu` in `content/site.json` to that id and update `seasonBanner`. If the chef sends a photo or PDF of his menu, type it in exactly; ask before changing any wording or price.
- **Switch seasons**: change `featuredMenu` and `seasonBanner`. Set an old menu to `"show": false` to hide it without deleting it. If the new season is not a holiday, also rename the "Holiday Menu" button text in every page header.
- **Use the chef's wording.** Section and dish names like "Merry Mains" and "Belly up to the Bar" are his. Keep his phrasing; only fix obvious typos.
- **Change a price or dish**: edit that item in `content/menus.json`.
- **New photo**: resize to at most 1600px on the long side, save as a .jpg in `images/`, and add it with a short, specific alt text.
- **Service prices** live in `services.html` inside the `.price` spans.

## Rules

- Prices stay hidden until a visitor clicks "View pricing". Never show prices by default.
- Never remove or rename the order form fields in `order.html`, or the `data-netlify` attribute. That is how inquiries reach the chef's email.
- Keep the existing colors (forest green, linen, walnut) and fonts (Libre Caslon, Albert Sans).
- Do not invent reviews, awards, prices or facts about the chef.
- No em dashes in site text.
- After editing JSON, run `node scripts/check-content.mjs` and fix anything it reports. Netlify runs the same check before publishing, and a failing check blocks the update.
- If a request is unclear, ask one short question before changing anything.
