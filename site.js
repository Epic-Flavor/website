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
      banner.innerHTML = esc(site.seasonBanner) + ' <a href="/holiday.html">See the holiday menu</a>';
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
    root.innerHTML = '<p>There is no seasonal menu right now. Every event is cooked to order, so get in touch to plan yours.</p>';
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
    // A string of lights: bulbs hang from a curved wire. Positions are computed so every bulb sits on the wire.
    const COLORS = ['#f2c14e', '#e2463f', '#4fb562', '#5f97ef'];
    const lightString = (count, cls) => {
      const sag = 22, top = 4;
      let bulbs = '';
      for (let k = 0; k < count; k++) {
        const x = (k + 0.5) / count;
        const y = top + sag * 4 * x * (1 - x);
        bulbs += `<i style="left:${(x * 100).toFixed(2)}%;top:${y.toFixed(1)}px;--c:${COLORS[k % 4]};--dl:${((k * 0.7) % 2.6).toFixed(1)}s"></i>`;
      }
      return `<div class="light-string ${cls || ''}" aria-hidden="true"><svg viewBox="0 0 100 ${sag + top + 2}" preserveAspectRatio="none"><path d="M0 ${top} Q50 ${top + sag * 2} 100 ${top}" vector-effect="non-scaling-stroke"/></svg>${bulbs}</div>`;
    };
    const flakes = (n) => Array.from({ length: n }, (_, k) => `<span style="--x:${(k * 37) % 100}%;--d:${6 + (k % 5) * 1.3}s;--s:${0.6 + (k % 4) * 0.25}rem;--t:${(k % 7) * -1.1}s">❄</span>`).join('');
    const snow = `<div class="snow" aria-hidden="true">${flakes(26)}</div>`;
    body.innerHTML =
      `<section class="holiday-hero">${lightString(22, 'is-hero')}${snow}<div class="wrap">` +
      (current.title ? `<h1 class="holiday-title">${esc(current.title)}</h1>` : `<h1>${esc(current.name)}</h1>`) +
      (current.intro ? `<div class="menu-intro">${[].concat(current.intro).map((t) => `<p>${esc(t)}</p>`).join('')}</div>` : '') +
      (hasPrices ? '<button type="button" class="btn price-toggle" aria-pressed="false">View pricing</button>' : '') +
      `</div></section><div class="wrap holiday-menu">` +
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
        return (n === 1 || n === 2 ? lightString(16, 'is-divider') : '') + `<section class="${cls}">
          ${s.image ? `<img class="menu-photo" src="${esc(s.image)}" alt="${esc(s.imageAlt || '')}" loading="lazy">` : ''}
          <div class="menu-body">${head}${items}</div>
        </section>`;
      }).join('') + '</div>';
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

// Preselect "Holiday order" when arriving from the holiday page
(() => {
  const sel = document.getElementById('f-type');
  if (sel && new URLSearchParams(location.search).get('type') === 'holiday') sel.value = 'Holiday order';
})();
