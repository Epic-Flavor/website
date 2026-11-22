// Runs before every Netlify deploy. If a content file is broken, the deploy
// fails and the live site stays on the last good version.
import { readFileSync } from 'node:fs';

const errors = [];
function load(path) {
  try { return JSON.parse(readFileSync(path, 'utf8')); }
  catch (e) { errors.push(`${path} is not valid JSON: ${e.message}`); return null; }
}

const menus = load('content/menus.json');
const site = load('content/site.json');

if (menus) {
  if (!Array.isArray(menus.menus)) errors.push('menus.json needs a "menus" list');
  const ids = new Set();
  for (const m of menus.menus || []) {
    if (!m.id || !m.name) errors.push(`A menu is missing "id" or "name": ${JSON.stringify(m).slice(0, 80)}`);
    if (ids.has(m.id)) errors.push(`Two menus share the id "${m.id}"`);
    ids.add(m.id);
    if (!Array.isArray(m.sections)) errors.push(`Menu "${m.id}" needs a "sections" list`);
    if (m.show && (!m.sections || !m.sections.length)) errors.push(`Menu "${m.id}" is set to show but has no sections`);
    for (const s of m.sections || []) {
      if (!s.title) errors.push(`A section in "${m.id}" has no title`);
      if (!Array.isArray(s.items) || !s.items.length) errors.push(`Section "${s.title}" in "${m.id}" has no items`);
      for (const i of s.items || []) if (!i.name) errors.push(`An item in "${s.title}" (${m.id}) has no name`);
    }
  }
  if (site && site.featuredMenu && !ids.has(site.featuredMenu)) {
    errors.push(`site.json featuredMenu "${site.featuredMenu}" does not match any menu id`);
  }
}

if (errors.length) {
  console.error('Content check failed:\n- ' + errors.join('\n- '));
  process.exit(1);
}
console.log('Content check passed.');
