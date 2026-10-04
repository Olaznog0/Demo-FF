'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'reviews-ui.js'), 'utf8');
const snapshotSource = fs.readFileSync(path.join(__dirname, '..', 'reviews-data.js'), 'utf8');
const components = fs.readFileSync(path.join(__dirname, '..', 'components.css'), 'utf8');

// Execute the production carousel with its real attributed snapshots. This
// surface records DOM state and timers without a browser, requests or renders.
class Element {
  constructor(tag, doc) {
    this.tagName = tag; this.ownerDocument = doc; this.children = [];
    this.attrs = {}; this.dataset = {}; this.style = {}; this.listeners = new Map();
    this.className = ''; this._text = ''; this.hidden = false;
    this.classList = { toggle: (value, enabled) => {
      const classes = new Set(this.className.split(/\s+/).filter(Boolean));
      if (enabled) classes.add(value); else classes.delete(value);
      this.className = [...classes].join(' ');
    } };
  }
  setAttribute(name, value) { this.attrs[name] = String(value); }
  getAttribute(name) { return this.attrs[name]; }
  get textContent() { return this._text + this.children.map(child => child.textContent).join(''); }
  set textContent(value) { this._text = String(value); this.children = []; }
  append(...children) { for (const child of children) { child.parentElement = this; this.children.push(child); } }
  replaceChildren(...children) { this.children = []; this._text = ''; this.append(...children); }
  contains(target) { return target === this || this.children.some(child => child.contains(target)); }
  querySelectorAll(selector) {
    const found = [], matches = node => selector[0] === '.'
      ? node.className.split(/\s+/).includes(selector.slice(1))
      : node.tagName === selector;
    const visit = node => { for (const child of node.children) { if (matches(child)) found.push(child); visit(child); } };
    visit(this); return found;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  addEventListener(event, handler) { const handlers = this.listeners.get(event) || []; handlers.push(handler); this.listeners.set(event, handlers); }
  removeEventListener(event, handler) { this.listeners.set(event, (this.listeners.get(event) || []).filter(value => value !== handler)); }
  emit(event, detail = {}) { for (const handler of this.listeners.get(event) || []) handler({ target: this, ...detail }); }
}

function fixture({ reducedMotion = false } = {}) {
  const doc = new Element('document'); doc.hidden = false;
  doc.head = new Element('head', doc); doc.body = new Element('body', doc); doc.append(doc.head, doc.body);
  doc.createElement = tag => new Element(tag, doc);
  doc.createTextNode = value => { const node = new Element('#text', doc); node.textContent = value; return node; };
  doc.getElementById = id => doc.querySelectorAll('style').find(node => node.id === id) || null;
  const motion = new Element('media', doc); motion.matches = reducedMotion;
  let nextTimer = 0; const timers = new Map();
  const window = { document: doc, matchMedia: () => motion,
    setTimeout: (callback, ms) => { timers.set(++nextTimer, { callback, ms }); return nextTimer; },
    clearTimeout: id => timers.delete(id)
  };
  const context = vm.createContext({ window, document: doc, URL, Intl });
  vm.runInContext(snapshotSource, context); vm.runInContext(source, context);
  const container = doc.createElement('section'); doc.body.append(container);
  return { doc, window, motion, timers, container,
    mount(id = 'NLEZ2-029', lang = 'nl') {
      const business = window.CAMPAIGN_REVIEWS.businesses[id];
      return { business, controller: window.CampaignReviews.mount(container, { leadId: id, cid: business.cid, lang }) };
    },
    advance() { const timer = timers.values().next().value; assert(timer); timers.clear(); timer.callback(); }
  };
}

test('All 41 original review texts, authors, 40 portraits and actual scores stay bound to their business in both languages', () => {
  let quotes = 0, portraits = 0;
  for (const lang of ['nl', 'en']) {
    const view = fixture();
    for (const [id, business] of Object.entries(view.window.CAMPAIGN_REVIEWS.businesses)) {
      view.mount(id, lang);
      const cards = view.container.querySelectorAll('.cr-card');
      assert.equal(cards.length, business.reviews.length);
      assert.equal(view.container.querySelector('.campaign-reviews').dataset.googleCid, business.cid);
      cards.forEach((card, index) => {
        const review = business.reviews[index];
        assert.equal(card.querySelector('.cr-author').textContent, review.authorName);
        assert.equal(card.querySelector('.cr-date').textContent, review.publishedLabels[lang]);
        assert.equal(card.querySelector('.cr-stars').textContent, '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating));
        assert.equal(card.querySelector('.cr-stars').getAttribute('aria-label'), review.rating + (lang === 'nl' ? ' van 5' : ' out of 5'));
        assert.equal(card.querySelector('.cr-score').textContent, review.rating + ' / 5');
        assert.equal(card.querySelector('.cr-quote').textContent, lang === 'en' && review.translations?.en ? review.translations.en : review.displayText || review.text);
        assert.equal(new URL(card.querySelector('.cr-source').href).searchParams.get('cid'), business.cid);
        const image = card.querySelector('img');
        if (image) { assert.equal(image.src, review.photoUrl); assert(image.alt.includes(review.authorName)); if (lang === 'nl') portraits++; }
        if (lang === 'nl') quotes++;
      });
    }
  }
  assert.equal(quotes, 41); assert.equal(portraits, 40);
});

test('The summary reflects fractional Google ratings rather than displaying five filled stars for every business', () => {
  const view = fixture(); const { business, controller } = view.mount();
  const summary = view.container.querySelector('.cr-aggregate');
  assert.equal(summary.querySelector('strong').textContent, '4,6');
  assert.equal(summary.querySelector('.cr-aggregate-star-fill').style.width, '92%');
  assert.equal(summary.querySelector('.cr-aggregate-count').textContent, business.reviewCount + ' beoordelingen');
  assert(summary.getAttribute('aria-label').includes('4,6 van 5'));
  controller.update({ lang: 'en' });
  assert.equal(summary.querySelector('strong').textContent, '4.6');
  assert(summary.getAttribute('aria-label').includes('4.6 out of 5'));
});

test('Original and translated copies toggle reversibly, without replacing faces or mixing author attribution', () => {
  const view = fixture(); const { business, controller } = view.mount('NLEZ2-029', 'en');
  const card = view.container.querySelector('.cr-card'), image = card.querySelector('img');
  const original = card.querySelector('.cr-original'), quote = card.querySelector('.cr-quote');
  assert.equal(original.hidden, false); assert.equal(quote.lang, 'en');
  original.emit('click'); assert.equal(quote.textContent, business.reviews[0].displayText); assert.equal(quote.lang, 'nl');
  original.emit('click'); assert.equal(quote.textContent, business.reviews[0].translations.en);
  controller.update({ lang: 'nl' });
  assert.equal(original.hidden, true); assert.equal(quote.lang, 'nl'); assert.strictEqual(card.querySelector('img'), image);
  assert.equal(card.querySelector('.cr-translation').textContent.startsWith('Originele beoordeling'), true);
});

test('A missing or failed source portrait uses initials, never another reviewer or invented stock portrait', () => {
  const view = fixture(); const id = Object.keys(view.window.CAMPAIGN_REVIEWS.businesses).find(key => view.window.CAMPAIGN_REVIEWS.businesses[key].reviews.some(review => !review.photoUrl));
  const { business } = view.mount(id);
  const missingIndex = business.reviews.findIndex(review => !review.photoUrl);
  const missing = view.container.querySelectorAll('.cr-card')[missingIndex].querySelector('.cr-avatar');
  assert.equal(missing.querySelector('img'), null); assert.match(missing.textContent, /^[A-Z.]{1,2}$/);
  view.mount('NLEZ2-029');
  const avatar = view.container.querySelector('.cr-avatar'); avatar.querySelector('img').emit('error');
  assert.equal(avatar.querySelector('img'), null); assert.equal(avatar.textContent, 'MV');
});

test('Identity mismatches clear the prior review carousel and never expose another business snapshots', () => {
  const view = fixture(); const { business } = view.mount();
  assert.throws(() => view.window.CampaignReviews.mount(view.container, { leadId: 'NLEZ1-389', cid: business.cid, lang: 'nl' }), /identity/);
  assert.equal(view.container.children.length, 0); assert.equal(view.timers.size, 0);
  const fresh = view.mount();
  assert.throws(() => fresh.controller.update({ cid: '1' }), /different business/);
});

test('Multiple reviews autoplay with one accessible active card, while one review hides all slideshow controls', () => {
  const view = fixture(); const { controller } = view.mount();
  let cards = view.container.querySelectorAll('.cr-card');
  assert.equal(view.timers.size, 1); assert.equal([...view.timers.values()][0].ms, 7200);
  assert.equal(cards[0].inert, false); assert.equal(cards[1].inert, true);
  view.advance(); assert.equal(controller.getState().index, 1);
  assert.equal(cards[0].getAttribute('aria-hidden'), 'true'); assert.equal(cards[1].getAttribute('aria-hidden'), 'false');
  view.mount('NLEZ1-389'); assert.equal(view.timers.size, 0);
  assert.equal(view.container.querySelector('.cr-control-group').hidden, true);
});

test('Hover, keyboard focus, hidden documents and reduced-motion pause automatic rotation', () => {
  const view = fixture(); const { controller } = view.mount(); const wrapper = view.container.querySelector('.campaign-reviews');
  wrapper.emit('mouseenter'); assert.equal(view.timers.size, 0);
  wrapper.emit('mouseleave'); assert.equal(view.timers.size, 1);
  wrapper.emit('focusin'); assert.equal(view.timers.size, 0);
  wrapper.emit('focusout', { relatedTarget: view.container }); assert.equal(view.timers.size, 1);
  view.doc.hidden = true; view.doc.emit('visibilitychange'); assert.equal(view.timers.size, 0);
  view.doc.hidden = false; view.doc.emit('visibilitychange'); assert.equal(view.timers.size, 1);
  view.motion.matches = true; view.motion.emit('change'); assert.equal(view.timers.size, 0);
  assert.equal(controller.getState().autoplay, false);
  assert.equal(view.container.querySelectorAll('.cr-button')[2].hidden, true);
  const reduced = fixture({ reducedMotion: true }); reduced.mount(); assert.equal(reduced.timers.size, 0);
});

test('The pause control persists through language updates and carousel cleanup releases all timer work', () => {
  const view = fixture(); const { controller } = view.mount();
  const pause = view.container.querySelectorAll('.cr-button')[2]; pause.emit('click');
  assert.equal(view.timers.size, 0); controller.update({ lang: 'en' });
  assert.equal(pause.getAttribute('aria-label'), 'Play reviews automatically'); assert.equal(view.timers.size, 0);
  pause.emit('click'); assert.equal(view.timers.size, 1);
  controller.destroy(); assert.equal(view.timers.size, 0); assert.equal(view.container.children.length, 0);
});

test('Every restaurant and beauty review palette keeps body and secondary text at WCAG AA and gold stars at least 3:1', () => {
  const luminance = color => {
    const hex = color.slice(1), bytes = hex.length === 3 ? [...hex].map(v => parseInt(v + v, 16)) : [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16));
    const values = bytes.map(byte => { const value = byte / 255; return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4; });
    return values[0] * .2126 + values[1] * .7152 + values[2] * .0722;
  };
  const ratio = (a, b) => { const aa = luminance(a), bb = luminance(b); return (Math.max(aa, bb) + .05) / (Math.min(aa, bb) + .05); };
  for (const family of ['R', 'B']) for (let index = 1; index <= 5; index++) {
    const id = family + index;
    const block = components.match(new RegExp('\\.theme-' + id + ' \\.campaign-reviews\\{([^}]*)'))[1];
    const tokens = Object.fromEntries([...block.matchAll(/--cr-([a-z]+):(#[a-f0-9]{3,6})/gi)].map(match => [match[1], match[2]]));
    assert.ok(ratio(tokens.ink, tokens.paper) >= 4.5, id + ' review text');
    assert.ok(ratio(tokens.muted, tokens.paper) >= 4.5, id + ' date, rating and translation');
    assert.ok(ratio('#966500', tokens.paper) >= 3, id + ' rating stars');
  }
});
