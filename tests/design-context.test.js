'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const registry = require('../public-client-config.js');
const privateRegistry = require('../client-config.js');
const core = require('../core.js');
const i18n = require('../i18n.js');
const source = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const designSource = source('concepts/design-context.js');
const shellSource = source('site-shell.js');
const stateSource = source('confirmation-state.js');
const thanksSource = source('confirmation.js');
const catalog = {
  lumen: {
    D1: ['#176a65', '#e8f2e9', '#f9fcf8'],
    D2: ['#285ca0', '#e8f0fb', '#f7faff'],
    D3: ['#6d5443', '#efe6d8', '#faf6ee'],
    D4: ['#155962', '#deeeec', '#f6faf9'],
    D5: ['#5b5093', '#eeeaf8', '#fcfbff']
  },
  northline: {
    A1: ['#24435a', '#efece1', '#faf7ef'],
    A2: ['#355d4f', '#e5ece0', '#f7f8f2'],
    A3: ['#2455a0', '#e7eff8', '#f6f9fc'],
    A4: ['#70592f', '#f0e8d8', '#fcf8ef'],
    A5: ['#333e66', '#e9ecf7', '#f8f9ff']
  },
  brightmove: {
    M1: ['#214b59', '#e8eee7', '#faf8f1'],
    M2: ['#234ead', '#e9effb', '#f8faff'],
    M3: ['#8a4330', '#f0e3d3', '#fcf6ed'],
    M4: ['#345e43', '#e6eddf', '#f8faf3'],
    M5: ['#514879', '#ede9f4', '#faf8fe']
  }
};

function fixture({client = 'lumen', lang = 'en', design, saved, blocked = false,
  pathname = '/booking.html', href, storage = new Map(), extra = ''} = {}) {
  const nodes = new Map(), styles = new Map(), classes = [], replacements = [], routes = [];
  const node = id => {
    if (!nodes.has(id)) nodes.set(id, {
      innerHTML: '', textContent: '', hidden: true,
      attributes: new Map(), events: new Map(),
      setAttribute(key, value) { this.attributes.set(key, value); },
      addEventListener(name, handler) { this.events.set(name, handler); },
      focus() {}
    });
    return nodes.get(id);
  };
  const params = new URLSearchParams({client, lang});
  if (design !== undefined) params.set('design', design);
  const url = new URL(href || 'https://example.test' + pathname + '?' + params + extra);
  const location = {
    href: url.href, origin: url.origin, pathname: url.pathname, search: url.search, hash: url.hash,
    assign(value) { routes.push(value); }
  };
  const history = {replaceState(_state, _title, value) {
    const target = new URL(String(value), location.href); replacements.push(target.href);
    Object.assign(location, {href: target.href, search: target.search, hash: target.hash});
  }};
  if (saved !== undefined) storage.set('ocimatik-design:' + client, saved);
  const sessionStorage = {
    getItem(key) { if (blocked) throw new Error('Storage unavailable'); return storage.get(key) ?? null; },
    setItem(key, value) { if (blocked) throw new Error('Storage unavailable'); storage.set(key, value); },
    removeItem(key) { if (blocked) throw new Error('Storage unavailable'); storage.delete(key); }
  };
  const document = {
    currentScript: {src: 'https://example.test/confirmation-state.js'},
    documentElement: {dataset: {page: url.pathname.includes('confirmation') ? 'confirmation' : 'booking'},
      style: {setProperty(key, value) { styles.set(key, value); }}, lang: ''},
    body: {classList: {add(value) { classes.push(value); }}},
    title: '', querySelector: () => ({content: ''}), getElementById: node, addEventListener() {}
  };
  const window = {
    PublicClientRegistry: structuredClone(registry), ClientRegistry: structuredClone(privateRegistry),
    SiteCore: core, SiteI18n: i18n, document, location, history, sessionStorage
  };
  const sandbox = {window, document, location, history, sessionStorage, URL, URLSearchParams, Date, Intl};
  const run = code => vm.runInNewContext(code, sandbox);
  return {window, document, location, storage, routes, replacements, nodes, styles, classes, run,
    apply() { run(designSource); }, shell() { run(shellSource); }, state() { run(stateSource); }};
}

function assertDesignUrl(value, client, lang, design, pathname, hash = '') {
  const url = new URL(value, 'https://example.test');
  assert.equal(url.pathname, pathname); assert.equal(url.hash, hash);
  assert.equal(url.searchParams.get('client'), client);
  assert.equal(url.searchParams.get('lang'), lang);
  assert.equal(url.searchParams.get('design'), design);
  return url;
}

test('all 15 public selections apply their palette while keeping language, client identity and other theme settings', () => {
  for (const [client, designs] of Object.entries(catalog)) for (const [design, colors] of Object.entries(designs)) for (const lang of ['nl', 'en']) {
    const f = fixture({client, design, lang, extra: '&service=firstvisit&type=booking#summary'});
    const original = structuredClone(f.window.PublicClientRegistry.clients[client]);
    const business = f.window.PublicClientRegistry.clients[client].business;
    const privateBefore = JSON.stringify(f.window.ClientRegistry);
    f.apply(); f.shell();
    const selected = f.window.Site.config;
    assert.equal(selected.id, client); assert.equal(f.window.Site.lang, lang);
    assert.strictEqual(selected.business, business);
    assert.deepEqual(selected.services, original.services);
    assert.equal(selected.theme.layout, original.theme.layout);
    assert.equal(selected.theme.bodyFont, original.theme.bodyFont);
    assert.equal(selected.theme.designCode, design);
    assert.deepEqual([selected.theme.primary, selected.theme.accent, selected.theme.background], colors);
    const serif = ['D3', 'A1', 'A2', 'A4'].includes(design);
    assert.equal(selected.theme.font, serif ? 'Georgia, Cambria, serif' : 'Arial, Helvetica, sans-serif');
    assert.equal(f.styles.get('--primary'), colors[0]);
    assert.equal(f.styles.get('--accent'), colors[1]);
    assert.equal(f.styles.get('--bg'), colors[2]);
    assert.equal(f.styles.get('--heading-font'), selected.theme.font);
    assert.equal(f.styles.get('--body-font'), original.theme.bodyFont);
    const canonical = assertDesignUrl(f.location.href, client, lang, design, '/booking.html', '#summary');
    assert.equal(canonical.searchParams.get('service'), 'firstvisit');
    assert.equal(canonical.searchParams.get('type'), 'booking');
    assert.equal(JSON.stringify(privateRegistry), privateBefore);
    for (const [id, privateClient] of Object.entries(privateRegistry.clients)) {
      assert.deepEqual(f.window.ClientRegistry.clients[id], privateClient);
    }
    for (const [id, candidate] of Object.entries(registry.clients)) if (id !== client) {
      assert.deepEqual(f.window.PublicClientRegistry.clients[id], candidate);
    }
  }
});

test('shared home, FAQ, booking, service and language links preserve the selected design and their existing parameters', () => {
  for (const [client, designs] of Object.entries(catalog)) for (const design of Object.keys(designs)) for (const lang of ['nl', 'en']) {
    const f = fixture({client, design, lang, extra: '&service=planning&type=enquiry#summary'});
    f.apply(); f.shell();
    const home = '/' + registry.clients[client].homePage;
    assertDesignUrl(f.window.Site.link('index.html'), client, lang, design, home);
    assertDesignUrl(f.window.Site.link('index.html#contact'), client, lang, design, home, '#contact');
    assertDesignUrl(f.window.Site.link('faq.html'), client, lang, design, home, '#faq');
    const booking = assertDesignUrl(f.window.Site.link('booking.html?service=planning'), client, lang, design, '/booking.html');
    assert.equal(booking.searchParams.get('service'), 'planning');
    const header = f.nodes.get('siteHeader').innerHTML;
    const languages = [...header.matchAll(/<a lang="(en|nl)"[^>]*href="([^"]+)"/g)];
    assert.equal(languages.length, 2);
    for (const [, targetLang, href] of languages) {
      const target = assertDesignUrl(href.replaceAll('&amp;', '&'), client, targetLang, design, '/booking.html', '#summary');
      assert.equal(target.searchParams.get('service'), 'planning');
      assert.equal(target.searchParams.get('type'), 'enquiry');
    }
    assert(!header.includes('href="//'));
  }
});

test('invalid and cross-sector query selections leave client data, private clients and saved choices unchanged', () => {
  const invalid = {lumen: ['A1', 'M4', 'D0', 'D6', 'D10', 'd1', 'D1<script>', '__proto__'],
    northline: ['D1', 'M1', 'A0', 'A6'], brightmove: ['A2', 'D3', 'M0', 'M6']};
  for (const [client, designs] of Object.entries(invalid)) for (const design of designs) {
    const f = fixture({client, design, saved: Object.keys(catalog[client])[1]});
    const publicBefore = JSON.stringify(f.window.PublicClientRegistry);
    const privateBefore = JSON.stringify(f.window.ClientRegistry);
    const savedBefore = f.storage.get('ocimatik-design:' + client);
    f.apply();
    assert.equal(JSON.stringify(f.window.PublicClientRegistry), publicBefore);
    assert.equal(JSON.stringify(f.window.ClientRegistry), privateBefore);
    assert.equal(f.replacements.length, 0);
    assert.equal(f.storage.get('ocimatik-design:' + client), savedBefore);
    f.shell(); assert.equal(f.window.Site.config.id, client);
    assert.equal(f.window.Site.config.theme.designCode, undefined);
    const booking = new URL(f.window.Site.link('booking.html'), f.location.href);
    assert.equal(booking.searchParams.get('client'), client); assert(!booking.searchParams.has('design'));
  }
  for (const client of [...Object.keys(privateRegistry.clients), 'unknown', '__proto__', 'constructor', 'bloom', 'brasa']) {
    const f = fixture({client, design: 'D1'}), publicBefore = JSON.stringify(f.window.PublicClientRegistry), privateBefore = JSON.stringify(f.window.ClientRegistry);
    f.apply(); assert.equal(f.replacements.length, 0);
    assert.equal(JSON.stringify(f.window.PublicClientRegistry), publicBefore);
    assert.equal(JSON.stringify(f.window.ClientRegistry), privateBefore);
  }
});

test('session fallback is scoped to the exact public client and an explicit valid query takes precedence', () => {
  for (const [client, designs] of Object.entries(catalog)) {
    const codes = Object.keys(designs), f = fixture({client, saved: codes[3], lang: 'nl'});
    f.storage.set('ocimatik-design:another-client', 'M1'); f.apply(); f.shell();
    assert.equal(f.window.Site.config.theme.designCode, codes[3]);
    assertDesignUrl(f.location.href, client, 'nl', codes[3], '/booking.html');
    const explicit = fixture({client, design: codes[1], saved: codes[3]}); explicit.apply(); explicit.shell();
    assert.equal(explicit.window.Site.config.theme.designCode, codes[1]);
    for (const saved of ['foreign', 'D9', client === 'lumen' ? 'A1' : 'D1']) {
      const invalid = fixture({client, saved}), before = JSON.stringify(invalid.window.PublicClientRegistry);
      invalid.apply(); assert.equal(JSON.stringify(invalid.window.PublicClientRegistry), before); assert.equal(invalid.replacements.length, 0);
    }
    const wrongKey = fixture({client}); wrongKey.storage.set('ocimatik-design:another-client', codes[4]); wrongKey.apply();
    assert.equal(wrongKey.replacements.length, 0);
  }
});

test('blocked session storage does not prevent explicit palette selection, rendering or safe fallback', () => {
  for (const [client, designs] of Object.entries(catalog)) {
    const design = Object.keys(designs)[4], explicit = fixture({client, design, lang: 'nl', blocked: true});
    assert.doesNotThrow(() => { explicit.apply(); explicit.shell(); });
    assert.equal(explicit.window.Site.config.theme.designCode, design);
    assertDesignUrl(explicit.window.Site.link('booking.html'), client, 'nl', design, '/booking.html');
    const fallback = fixture({client, blocked: true});
    assert.doesNotThrow(() => { fallback.apply(); fallback.shell(); });
    assert.equal(fallback.window.Site.config.id, client); assert.equal(fallback.window.Site.config.theme.designCode, undefined);
    fallback.state();
    assert.equal(fallback.window.DemoConfirmation.complete(fallback.window.Site.config, 'en', {type: 'booking'}, 'demo'), false);
    assert.equal(fallback.routes.length, 0);
  }
});

test('a new booking tab with no saved design preserves selection through confirmation and its explicit home return URL', () => {
  for (const [client, designs] of Object.entries(catalog)) for (const lang of ['en', 'nl']) {
    const design = Object.keys(designs)[2], storage = new Map();
    const booking = fixture({client, design, lang, storage}); booking.apply(); booking.shell(); booking.state();
    const c = booking.window.Site.config;
    assert.equal(storage.has('ocimatik-design:' + client), false, 'This route must not rely on opener session data');
    assert(booking.window.DemoConfirmation.complete(c, lang, {type: 'booking', serviceId: c.services[0].id, date: '2026-10-20', time: '10:00', name: 'PRIVATE NAME', email: 'PRIVATE EMAIL'}, 'demo'));
    const route = assertDesignUrl(booking.routes[0], client, lang, design, '/confirmation.html');
    assert.equal(route.searchParams.get('type'), 'booking');
    const summary = storage.get(booking.window.DemoConfirmation.key);
    assert(!summary.includes('PRIVATE')); assert(!summary.includes('designCode'));
    const thanks = fixture({href: route.href, storage}); thanks.apply(); thanks.shell(); thanks.state(); thanks.run(thanksSource);
    assert.equal(thanks.window.Site.config.id, client); assert.equal(thanks.window.Site.lang, lang);
    assert.equal(thanks.window.Site.config.theme.designCode, design);
    assert.deepEqual([thanks.styles.get('--primary'), thanks.styles.get('--accent'), thanks.styles.get('--bg')], designs[design]);
    const href = thanks.nodes.get('main').innerHTML.match(/id="thanksBack" href="([^"]+)"/)[1].replaceAll('&amp;', '&');
    assertDesignUrl(href, client, lang, design, '/' + c.homePage);
    thanks.nodes.get('thanksBack').events.get('click')(); assert.equal(storage.has(thanks.window.DemoConfirmation.key), false);
  }
});

test('confirmation routes accept only client-owned codes, preserve unthemed contracts and reject foreign or malformed designs', () => {
  const cases = [
    {client: 'lumen', query: 'D5', theme: undefined, expected: 'D5'},
    {client: 'northline', query: undefined, theme: 'A3', expected: 'A3'},
    {client: 'brightmove', query: 'M2', theme: 'M5', expected: 'M2'},
    {client: 'lumen', query: 'A3', theme: 'D2', expected: null},
    {client: 'northline', query: 'A9', theme: undefined, expected: null},
    {client: 'brightmove', query: 'M2<script>', theme: undefined, expected: null},
    {client: 'lumen', query: undefined, theme: 'M1', expected: null},
    {client: 'bloom', query: 'D1', theme: 'D1', expected: null},
    {client: 'ayden', query: 'D1', theme: 'D1', expected: null}
  ];
  for (const entry of cases) {
    const f = fixture({client: entry.client, design: entry.query}); f.state();
    const config = f.window.PublicClientRegistry.clients[entry.client] || f.window.ClientRegistry.clients[entry.client];
    if (entry.theme) config.theme.designCode = entry.theme;
    assert(f.window.DemoConfirmation.complete(config, 'en', {type: 'enquiry'}, 'demo'));
    const target = new URL(f.routes[0]);
    assert.equal(target.searchParams.get('client'), entry.client); assert.equal(target.searchParams.get('lang'), 'en');
    assert.equal(target.searchParams.get('type'), 'enquiry'); assert.equal(target.searchParams.get('design'), entry.expected);
    if (!entry.expected) assert.deepEqual([...target.searchParams.keys()], ['client', 'lang', 'type']);
  }
});
