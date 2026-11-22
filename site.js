// Mobile menu
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Close' : 'Menu';
  });
}

async function loadJSON(path) {
  const res = await fetch(path, { cache: 'no-cache' });
  if (!res.ok) throw new Error('Could not load ' + path);
  return res.json();
}

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Season banner (content/site.json)
(async () => {
  const banner = document.querySelector('.season');
  if (!banner) return;
  try {
    const site = await loadJSON('/content/site.json');
    if (site.showSeasonBanner && site.seasonBanner) {
      banner.innerHTML = esc(site.seasonBanner) + ' <a href="/menus.html">See the menu</a>';
      banner.hidden = false;
    }
  } catch (e) { /* banner stays hidden */ }
})();

// Menus page (content/menus.json)
(async () => {
  const root = document.getElementById('menus');
  if (!root) return;
  let data, site;
  try {
    [data, site] = await Promise.all([loadJSON('/content/menus.json'), loadJSON('/content/site.json')]);
  } catch (e) {
    root.innerHTML = '<p>The menu could not load. Call or email us and we will send it over.</p>';
    return;
  }
  const menus = data.menus.filter((m) => m.show && m.sections && m.sections.length);
  if (!menus.length) {
    root.innerHTML = '<p>New menus are coming soon. Get in touch to plan your event.</p>';
    return;
  }
  const fromHash = location.hash.slice(1);
  let current = menus.find((m) => m.id === fromHash) || menus.find((m) => m.id === site.featuredMenu) || menus[0];

  const tabs = document.createElement('div');
  tabs.className = 'tabs';
  tabs.setAttribute('role', 'tablist');
  const body = document.createElement('div');

  function render() {
    tabs.innerHTML = '';
    if (menus.length > 1) {
      menus.forEach((m) => {
        const b = document.createElement('button');
        b.className = 'tab';
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-selected', String(m.id === current.id));
        b.textContent = m.name;
        b.addEventListener('click', () => { current = m; history.replaceState(null, '', '#' + m.id); render(); });
        tabs.appendChild(b);
      });
    }
    const hasPrices = current.sections.some((s) => s.items.some((i) => i.price));
    body.className = '';
    body.innerHTML =
      (current.intro ? `<p class="menu-intro">${esc(current.intro)}</p>` : '') +
      (hasPrices ? '<button type="button" class="btn btn-dark price-toggle" aria-pressed="false">View pricing</button>' : '') +
      current.sections.map((s, n) => {
        const items = s.style === 'compact'
          ? `<ul class="compact-items">${s.items.map((i) => `<li>${esc(i.name)}${i.price ? ` <span class="price">${esc(i.price)}</span>` : ''}</li>`).join('')}</ul>`
          : `<ul class="menu-items">
            ${s.items.map((i) => `
              <li>
                <div class="row"><span class="name">${esc(i.name)}</span>${i.price ? `<span class="price">${esc(i.price)}</span>` : ''}</div>
                ${i.description ? `<div class="desc">${esc(i.description)}</div>` : ''}
              </li>`).join('')}
          </ul>`;
        const head = `<h2>${esc(s.title)}</h2>${s.note ? `<p class="menu-note">${esc(s.note)}</p>` : ''}`;
        const cls = ['menu-section', s.style ? 'is-' + s.style : '', s.image ? 'has-image' : '', n % 2 ? 'flip' : ''].join(' ');
        return `<section class="${cls}">
          ${s.image ? `<img class="menu-photo" src="${esc(s.image)}" alt="${esc(s.imageAlt || '')}" loading="lazy">` : ''}
          <div class="menu-body">${head}${items}</div>
        </section>`;
      }).join('');
    const pt = body.querySelector('.price-toggle');
    if (pt) {
      pt.addEventListener('click', () => {
        const on = body.classList.toggle('show-prices');
        pt.setAttribute('aria-pressed', String(on));
        pt.textContent = on ? 'Hide pricing' : 'View pricing';
      });
    }
  }
  root.innerHTML = '';
  root.append(tabs, body);
  render();
})();
