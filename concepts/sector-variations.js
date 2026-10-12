(function () {
  'use strict';
  const catalog = {
    dentists: ['D', ['Lumen split', 'Azure panorama', 'Sand editorial', 'Teal cover', 'Lilac modern']],
    accountants: ['A', ['Ledger rail', 'Sage balance', 'Cobalt cover', 'Brass editorial', 'Ink studio']],
    movers: ['M', ['Route panorama', 'Cobalt dispatch', 'Terracotta cover', 'Green neighbourhood', 'Indigo editorial']]
  };
  const folder = location.pathname.match(/\/concepts\/(dentists|accountants|movers)\//)?.[1];
  if (!folder || !document.body.classList.contains('public-concept')) return;
  const [prefix, names] = catalog[folder], language = document.documentElement.lang === 'nl' ? 'nl' : 'en';
  const clientId = {dentists: 'lumen', accountants: 'northline', movers: 'brightmove'}[folder];
  const storageKey = 'ocimatik-design:' + clientId;
  let saved;
  try { saved = sessionStorage.getItem(storageKey); } catch {}
  const requested = new URLSearchParams(location.search).get('design') || saved;
  const valid = value => new RegExp('^' + prefix + '[1-5]$').test(value || '');
  let selected = valid(requested) ? requested : prefix + '1';
  const toolbar = document.createElement('nav'); toolbar.className = 'design-toolbar';
  toolbar.setAttribute('aria-label', language === 'nl' ? 'Kies een websiteontwerp' : 'Choose a website design');
  const deploymentBase = location.pathname.startsWith('/demos/') ? '/demos' : '';
  const library = document.createElement('a'); library.href = ['localhost','127.0.0.1'].includes(location.hostname) ? '/design-review/index.html' : deploymentBase + '/sectors/index.html?lang=' + language;
  library.textContent = language === 'nl' ? 'Alle ontwerpen ↗' : 'All designs ↗'; toolbar.append(library);
  const group = document.createElement('div'); group.className = 'design-options'; toolbar.append(group);
  const buttons = names.map((name, index) => {
    const button = document.createElement('button'); button.type = 'button'; button.dataset.design = prefix + (index + 1);
    button.textContent = name; button.title = button.dataset.design + ' · ' + name; button.setAttribute('aria-label', button.title); button.addEventListener('click', () => apply(button.dataset.design)); group.append(button); return button;
  });
  document.querySelector('.public-portfolio')?.replaceWith(toolbar);
  if (!toolbar.isConnected) document.body.prepend(toolbar);
  // A meaningful location preview is visible even before the visitor loads the external map.
  const iframe = document.querySelector('.location-grid .map iframe');
  if (iframe) {
    const poster = document.createElement('div'); poster.className = 'public-map-poster';
    const drawing = document.createElement('div'); drawing.className = 'public-map-drawing'; drawing.setAttribute('aria-hidden', 'true');
    drawing.innerHTML = '<svg viewBox="0 0 480 250" fill="none"><path d="M-20 55 500 190M-20 160 490 55M100-20 195 280M340-20 245 280" stroke="currentColor" stroke-width="24"/><path d="M-20 55 500 190M-20 160 490 55M100-20 195 280M340-20 245 280" stroke="white" stroke-width="12"/><path d="M240 151s-30-31-30-49a30 30 0 0 1 60 0c0 18-30 49-30 49Z" fill="currentColor"/><circle cx="240" cy="102" r="10" fill="white"/></svg>';
    const label = document.createElement('strong'); label.textContent = iframe.title;
    const button = document.createElement('button'); button.type = 'button'; button.className = 'button'; button.textContent = language === 'nl' ? 'Bekijk de kaart' : 'View the map';
    button.addEventListener('click', () => { poster.replaceWith(iframe); iframe.loading = 'eager'; });
    poster.append(drawing, label, button); iframe.replaceWith(poster);
  }
  const header = document.querySelector('#header .header-inner'), nav = header?.querySelector('.nav');
  if (header && nav) {
    nav.id = 'concept-navigation';
    const toggle = document.createElement('button'); toggle.type = 'button'; toggle.className = 'design-menu';
    toggle.textContent = 'Menu'; toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-controls', nav.id);
    const close = () => { nav.classList.remove('design-nav-open'); toggle.setAttribute('aria-expanded', 'false'); };
    toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; nav.classList.toggle('design-nav-open', open); toggle.setAttribute('aria-expanded', String(open)); });
    nav.addEventListener('click', close); document.addEventListener('keydown', event => { if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { close(); toggle.focus(); } });
    header.append(toggle);
  }
  function apply(design) {
    if (!valid(design)) return;
    selected = design; document.body.dataset.design = selected;
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.design === selected));
    const url = new URL(location.href); url.searchParams.set('design', selected); history.replaceState(null, '', url);
    try { sessionStorage.setItem(storageKey, selected); } catch {}
    document.querySelectorAll('a[href]').forEach(link => {
      const target = new URL(link.href, location.href);
      if (target.origin !== location.origin) return;
      if (target.pathname.includes('/concepts/' + folder + '/') || (target.pathname.endsWith('/booking.html') && target.searchParams.get('client') === clientId)) {
        target.searchParams.set('design', selected); link.href = target.href;
      }
    });
  }
  apply(selected);
})();
