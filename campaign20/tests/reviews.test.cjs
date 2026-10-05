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
    this.attrs = {}; this.dataset = {}; this.style = { setProperty(name, value) { this[name] = value; } }; this.listeners = new Map();
    this.className = ''; this._text = ''; this.hidden = false;
    this.scrollLeft = 0; this.scrollCalls = [];
    this.classList = { toggle: (value, enabled) => {
      const classes = new Set(this.className.split(/\s+/).filter(Boolean));
      if (enabled) classes.add(value); else classes.delete(value);
      this.className = [...classes].join(' ');
    } };
  }
  setAttribute(name, value) { this.attrs[name] = String(value); }
  getAttribute(name) { return this.attrs[name]; }
  get clientWidth() { return this.ownerDocument?.layout?.width || 620; }
  get clientHeight() { return this.measurement ? (this.className.split(/\s+/).includes('is-collapsed') ? Math.min(this.measurement.height, this.measurement.fullHeight) : this.measurement.fullHeight) : undefined; }
  get scrollHeight() { return this.measurement?.fullHeight; }
  get offsetLeft() { return Math.max(0, this.parentElement?.children.indexOf(this) || 0) * ((this.ownerDocument?.layout?.cardWidth || 560) + (this.ownerDocument?.layout?.gap || 20)); }
  get scrollWidth() { const classes = this.className.split(/\s+/), gap = this.ownerDocument?.layout?.gap || 20; return classes.includes('cr-carousel') ? Math.max(this.clientWidth, this.children.length * ((this.ownerDocument.layout.cardWidth || 560) + gap) - gap + (classes.includes('has-page-tail') ? parseFloat(this.style['--cr-page-tail']) + gap : 0)) : this.clientWidth; }
  getBoundingClientRect() { return { width: this.className.split(/\s+/).includes('cr-card') ? this.ownerDocument.layout.cardWidth : this.clientWidth }; }
  scrollTo(options) {
    this.scrollCalls.push(options);
    const left = Math.max(0, Math.min(this.scrollWidth - this.clientWidth, options.left));
    if (options.behavior === 'smooth' && this.ownerDocument.deferSmooth) { this.pendingScroll = left; return; }
    this.scrollLeft = left; this.emit('scroll');
  }
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

function fixture({ reducedMotion = false, width = 620, cardWidth = 560, deferSmooth = false } = {}) {
  const doc = new Element('document'); doc.hidden = false;
  doc.layout = { width, cardWidth, gap: 20 };
  doc.deferSmooth = deferSmooth;
  doc.head = new Element('head', doc); doc.body = new Element('body', doc); doc.append(doc.head, doc.body);
  doc.createElement = tag => new Element(tag, doc);
  doc.createTextNode = value => { const node = new Element('#text', doc); node.textContent = value; return node; };
  doc.getElementById = id => doc.querySelectorAll('style').find(node => node.id === id) || null;
  const motion = new Element('media', doc); motion.matches = reducedMotion;
  let nextTimer = 0; const timers = new Map();
  const observers = [];
  const window = { document: doc, matchMedia: () => motion,
    ResizeObserver: class { constructor(callback) { this.callback = callback; this.disconnected = false; this.targets = []; observers.push(this); } observe(target) { this.targets.push(target); } disconnect() { this.disconnected = true; } },
    setTimeout: (callback, ms) => { timers.set(++nextTimer, { callback, ms }); return nextTimer; },
    clearTimeout: id => timers.delete(id)
  };
  const context = vm.createContext({ window, document: doc, URL, Intl });
  vm.runInContext(snapshotSource, context); vm.runInContext(source, context);
  const container = doc.createElement('section'); doc.body.append(container);
  return { doc, window, motion, timers, container, observers,
    mount(id = 'NLEZ2-029', lang = 'nl', reviewExtension, reviewSnapshot) {
      const business = window.CAMPAIGN_REVIEWS.businesses[id];
      return { business, controller: window.CampaignReviews.mount(container, { leadId: id, cid: business.cid, lang, reviewExtension, reviewSnapshot }) };
    },
    resize(width, cardWidth) { doc.layout = { width, cardWidth, gap: 20 }; for (const observer of observers) if (!observer.disconnected) observer.callback(); },
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

test('Native scrolling keeps every review accessible and advances actual scroll offsets; single sources have no useless controls', () => {
  const view = fixture(); const { controller } = view.mount();
  const cards = view.container.querySelectorAll('.cr-card'), track = view.container.querySelector('.cr-carousel');
  assert.equal(view.timers.size, 1); assert.equal([...view.timers.values()][0].ms, 7200);
  assert.equal(track.tabIndex, 0);
  assert(cards.every(card => !card.inert && card.getAttribute('aria-hidden') !== 'true'));
  view.advance(); assert.equal(controller.getState().index, 1);
  assert.equal(track.scrollLeft, track.scrollWidth - track.clientWidth);
  assert.equal(track.scrollCalls.at(-1).behavior, 'smooth');
  view.advance(); assert.equal(controller.getState().index, 0); assert.equal(track.scrollLeft, 0);
  assert(cards.every(card => !card.inert && card.getAttribute('aria-hidden') !== 'true'));
  view.mount('NLEZ1-389'); assert.equal(view.timers.size, 0);
  assert.equal(view.container.querySelector('.cr-control-group').hidden, true);
});

test('Arrow, Home and End navigation scrolls the native track and clamps at the ends instead of hiding cards', () => {
  const view = fixture(); view.mount(); const track = view.container.querySelector('.cr-carousel');
  let prevented = 0;
  const key = value => track.emit('keydown', { key: value, preventDefault() { prevented++; } });
  key('ArrowRight'); assert(track.scrollLeft > 0);
  assert.equal(view.container.querySelectorAll('.cr-button')[1].disabled, true);
  key('ArrowRight'); assert.equal(track.scrollLeft, track.scrollWidth - track.clientWidth);
  key('Home'); assert.equal(track.scrollLeft, 0);
  key('End'); assert(track.scrollLeft > 0);
  key('ArrowLeft'); assert.equal(track.scrollLeft, 0);
  assert.equal(prevented, 5);
  const cardLink = view.container.querySelector('.cr-author');
  track.emit('keydown', { target: cardLink, key: 'ArrowRight', preventDefault() { throw new Error('Do not capture descendant keys'); } });
  assert.equal(track.scrollLeft, 0);
});

test('In-flight smooth navigation retains its intended stop across immediate language changes, repeated arrows and resize', () => {
  const view = fixture({ deferSmooth: true });
  const id = 'NLEZ1-389', business = view.window.CAMPAIGN_REVIEWS.businesses[id];
  const extra = ['Second fixture author', 'Third fixture author'].map((authorName, index) => ({ authorName, text: 'Attributed fixture review ' + index, rating: 5, originalLanguage: 'nl' }));
  const { controller } = view.mount(id, 'nl', { cid: business.cid, reviews: extra });
  const track = view.container.querySelector('.cr-carousel'), buttons = view.container.querySelectorAll('.cr-button');
  buttons[1].emit('click'); assert.equal(controller.getState().index, 1);
  track.scrollLeft = 100; track.emit('scroll'); assert.equal(controller.getState().index, 1);
  controller.update({ lang: 'en' }); assert.equal(view.container.querySelector('.cr-position').textContent, '2 of 3');
  assert.equal(track.scrollLeft, 100);
  buttons[1].emit('click'); assert.equal(controller.getState().index, 2);
  assert.equal(track.pendingScroll, track.scrollWidth - track.clientWidth);
  track.emit('keydown', { key: 'ArrowLeft', preventDefault() {} }); assert.equal(controller.getState().index, 1);
  assert.equal(track.pendingScroll, 580);
  view.resize(390, 358); assert.equal(track.pendingScroll, 378); assert.equal(controller.getState().index, 1);
  track.scrollLeft = track.pendingScroll; track.emit('scroll');
  assert.equal(controller.getState().index, 1);
  track.scrollLeft = 0; track.emit('scroll'); assert.equal(controller.getState().index, 0); // Target cleared on arrival.
  buttons[1].emit('click'); assert.equal(controller.getState().index, 1);
  track.emit('scrollend'); assert.equal(controller.getState().index, 0); // Interrupted programmatic scroll.
  buttons[1].emit('click'); track.emit('pointerdown'); assert.equal(controller.getState().index, 0);
  assert.equal(view.timers.size, 0);
  track.scrollLeft = 378; track.emit('scroll'); assert.equal(controller.getState().index, 1);
  track.emit('pointerup'); assert.equal(view.timers.size, 1);
  track.emit('keydown', { key: 'End', preventDefault() {} }); assert.equal(controller.getState().index, 2);
  track.emit('wheel'); assert.equal(controller.getState().index, 1);
  controller.destroy(); assert.equal(view.timers.size, 0);
  assert.equal((track.listeners.get('scrollend') || []).length, 0); assert.equal((track.listeners.get('wheel') || []).length, 0);
});

test('Touch scrolling updates the carousel position; pointer interaction, language changes and original-copy preference preserve the cards', () => {
  const view = fixture(); const { controller } = view.mount('NLEZ2-029', 'en');
  const track = view.container.querySelector('.cr-carousel'), cards = view.container.querySelectorAll('.cr-card');
  cards[1].querySelector('.cr-original').emit('click');
  track.emit('pointerdown'); assert.equal(view.timers.size, 0);
  track.scrollLeft = track.scrollWidth - track.clientWidth; track.emit('scroll');
  assert.equal(controller.getState().index, 1); assert.equal(view.timers.size, 0);
  track.emit('pointerup'); assert.equal(view.timers.size, 1);
  const beforeScroll = track.scrollLeft;
  const same = view.mount('NLEZ2-029', 'nl'); assert.strictEqual(same.controller, controller);
  assert.equal(track.scrollLeft, beforeScroll); assert.strictEqual(view.container.querySelectorAll('.cr-card')[1], cards[1]);
  controller.update({ lang: 'en' });
  assert.equal(cards[1].querySelector('.cr-quote').lang, 'nl');
  assert.equal(cards[1].querySelector('.cr-original').getAttribute('aria-pressed'), 'true');
});

test('Resizing from two fully visible desktop cards to a mobile scroll track enables controls and autoplay without rebuilding reviews', () => {
  const view = fixture({ width: 1040, cardWidth: 510 }); const { controller } = view.mount();
  const cards = view.container.querySelectorAll('.cr-card'), track = view.container.querySelector('.cr-carousel');
  assert.equal(view.timers.size, 0); assert.equal(view.container.querySelector('.cr-control-group').hidden, true);
  assert.equal(view.container.querySelector('.cr-position').textContent, '1–2 van 2');
  view.resize(390, 358); assert.equal(view.timers.size, 1); assert.equal(view.container.querySelector('.cr-control-group').hidden, false);
  assert.strictEqual(view.container.querySelectorAll('.cr-card')[0], cards[0]);
  view.advance(); assert(track.scrollLeft > 0);
  controller.destroy(); assert(view.observers.every(observer => observer.disconnected));
  assert.equal((track.listeners.get('scroll') || []).length, 0); assert.equal((track.listeners.get('keydown') || []).length, 0);
  assert.equal(view.timers.size, 0);
});

test('Verified same-business supplements add attributed reviews without mutating frozen snapshots or admitting mismatched identities', () => {
  const view = fixture(); const id = 'NLEZ1-389'; const business = view.window.CAMPAIGN_REVIEWS.businesses[id];
  const frozenBefore = JSON.stringify(business);
  const extra = { authorName: 'Fixture reviewer', text: 'Original English fixture.', rating: 4, originalLanguage: 'en', translations: { nl: 'Nederlandse fixturevertaling.' }, publishedLabel: '3 weeks ago' };
  const duplicate = { ...business.reviews[0] };
  const { controller } = view.mount(id, 'nl', { cid: business.cid, reviews: [extra, duplicate, { ...extra, rating: 6 }, { ...extra, authorName: '' }, { ...extra, text: '' }] });
  assert.equal(controller.getState().count, 2); assert.equal(JSON.stringify(business), frozenBefore);
  const card = view.container.querySelectorAll('.cr-card')[1];
  assert.equal(card.querySelector('.cr-quote').textContent, extra.translations.nl);
  assert.equal(card.querySelector('.cr-quote').lang, 'nl');
  assert.equal(card.querySelector('.cr-translation').textContent.startsWith('Vertaald uit het Engels'), true);
  controller.update({ lang: 'en' });
  assert.equal(card.querySelector('.cr-quote').textContent, extra.text); assert.equal(card.querySelector('.cr-original').hidden, true);
  controller.destroy();
  const mismatched = view.mount(id, 'nl', { cid: '999', reviews: [extra] });
  assert.equal(mismatched.controller.getState().count, 1); assert.equal(JSON.stringify(business), frozenBefore);
});

test('The responsive stylesheet uses native scroll snap and individual cards rather than a stacked or hidden slideshow', () => {
  assert.match(source, /overflow-x:auto/); assert.match(source, /scroll-snap-type:x mandatory/);
  assert.match(source, /min-width:720px/); assert.match(source, /flex-basis:calc\(\(100% - 20px\)\/2\)/);
  assert.match(source, /min-width:900px/); assert.match(source, /flex-basis:calc\(\(100% - 40px\)\/3\)/); assert.match(source, /flex-basis:92%/);
  assert.doesNotMatch(source, /grid-area:1\/1|visibility:hidden|pointer-events:none|\.inert\s*=/);
});

function fiveReviewSnapshot(view, id = 'NLEZ2-029') {
  return { cid: view.window.CAMPAIGN_REVIEWS.businesses[id].cid, observedAt: '2026-10-05T12:00:00Z', reviews: Array.from({ length: 5 }, (_, index) => ({ authorName: 'Fresh fixture author ' + index, text: 'Originele fixturetekst ' + index, rating: index + 1, originalLanguage: 'nl', translations: { en: 'Translated fixture text ' + index } })) };
}

test('An authoritative same-business five-review snapshot selects exactly five fresh reviews and preserves every actual rating', () => {
  const view = fixture(), snapshot = fiveReviewSnapshot(view), frozenBefore = JSON.stringify(view.window.CAMPAIGN_REVIEWS);
  const extra = { authorName: 'Legacy supplement fixture', text: 'Supplement must not enter the fresh selection.', rating: 5 };
  view.mount(); // The fresh selection may replace an already mounted legacy view.
  const { controller } = view.mount('NLEZ2-029', 'en', { cid: snapshot.cid, reviews: [extra] }, snapshot);
  const cards = view.container.querySelectorAll('.cr-card');
  assert.equal(controller.getState().count, 5); assert.equal(cards.length, 5);
  cards.forEach((card, index) => { assert.equal(card.querySelector('.cr-author').textContent, snapshot.reviews[index].authorName); assert.equal(card.querySelector('.cr-stars').textContent, '★'.repeat(index + 1) + '☆'.repeat(4 - index)); assert.equal(card.querySelector('.cr-quote').textContent, snapshot.reviews[index].translations.en); });
  assert.equal(JSON.stringify(view.window.CAMPAIGN_REVIEWS), frozenBefore);
  assert.strictEqual(view.mount('NLEZ2-029', 'nl', undefined, snapshot).controller, controller);
  assert.strictEqual(view.container.querySelectorAll('.cr-card')[0], cards[0]);
  assert.equal(cards[0].querySelector('.cr-quote').textContent, snapshot.reviews[0].text);
});

test('A supplied mismatched or malformed five-review snapshot clears prior cards instead of silently displaying legacy or another business reviews', () => {
  const view = fixture(), valid = fiveReviewSnapshot(view);
  const invalid = [{ ...valid, cid: '999' }, { ...valid, reviews: valid.reviews.slice(0, 4) }, { ...valid, reviews: null }, ...[{ rating: 6 }, { rating: 0 }, { rating: 2.5 }, { text: ' ' }, { authorName: '' }, { authorName: valid.reviews[0].authorName }].map(change => ({ ...valid, reviews: valid.reviews.map((review, index) => index === 4 ? { ...review, ...change } : review) }))];
  for (const snapshot of invalid) { view.mount(); assert.throws(() => view.mount('NLEZ2-029', 'nl', undefined, snapshot), /five-review snapshot.*identity/); assert.equal(view.container.querySelectorAll('.cr-card').length, 0); assert.equal(view.timers.size, 0); }
});

test('An array with five slots and a missing review cannot bypass exact-five snapshot validation', () => {
  const view = fixture(), valid = fiveReviewSnapshot(view), sparse = valid.reviews.slice();
  delete sparse[2];
  assert.equal(sparse.length, 5);
  view.mount('NLEZ2-029', 'en', undefined, valid);
  assert.throws(() => view.mount('NLEZ2-029', 'en', undefined, { ...valid, reviews: sparse }), /five-review snapshot.*identity/);
  assert.equal(view.container.querySelectorAll('.cr-card').length, 0); assert.equal(view.timers.size, 0);
});

test('Five wide-screen reviews page from 1–3 directly to 4–5, wrap with autoplay and retain the intended page while smooth scrolling and switching language', () => {
  const view = fixture({ width: 1040, cardWidth: 1000 / 3, deferSmooth: true }), snapshot = fiveReviewSnapshot(view);
  const { controller } = view.mount('NLEZ2-029', 'en', undefined, snapshot), track = view.container.querySelector('.cr-carousel'), buttons = view.container.querySelectorAll('.cr-button');
  assert.equal(view.container.querySelector('.cr-position').textContent, '1–3 of 5');
  assert.equal([...view.timers.values()][0].ms, 7200);
  view.advance(); assert.equal(controller.getState().index, 3); assert.equal(view.container.querySelector('.cr-position').textContent, '4–5 of 5');
  assert.equal(track.pendingScroll, 3 * (1000 / 3 + 20)); assert.equal(buttons[1].disabled, true);
  track.scrollLeft = 200; track.emit('scroll'); controller.update({ lang: 'nl' });
  assert.equal(controller.getState().index, 3); assert.equal(view.container.querySelector('.cr-position').textContent, '4–5 van 5');
  buttons[1].emit('click'); assert.equal(controller.getState().index, 3);
  view.resize(390, 358); assert.equal(controller.getState().index, 3); assert.equal(track.pendingScroll, 1134);
  assert.equal(view.container.querySelector('.cr-position').textContent, '4 van 5');
  track.scrollLeft = track.pendingScroll; track.emit('scroll');
  view.resize(1040, 1000 / 3); assert.equal(controller.getState().index, 3); assert.equal(view.container.querySelector('.cr-position').textContent, '4–5 van 5');
  track.scrollLeft = track.pendingScroll; track.emit('scroll');
  view.advance(); assert.equal(controller.getState().index, 0); assert.equal(track.pendingScroll, 0);
  assert.equal(view.container.querySelectorAll('.cr-card').length, 5);
});

test('Medium-width review pages advance by two and narrow native swipes retain one-card positions', () => {
  const view = fixture({ width: 740, cardWidth: 360 }), snapshot = fiveReviewSnapshot(view);
  const { controller } = view.mount('NLEZ2-029', 'en', undefined, snapshot), track = view.container.querySelector('.cr-carousel');
  assert.equal(view.container.querySelector('.cr-position').textContent, '1–2 of 5');
  view.advance(); assert.equal(track.scrollLeft, 760); assert.equal(view.container.querySelector('.cr-position').textContent, '3–4 of 5');
  view.advance(); assert.equal(track.scrollLeft, 1520); assert.equal(view.container.querySelector('.cr-position').textContent, '5 of 5');
  view.resize(390, 358); track.emit('pointerdown'); track.scrollLeft = 378; track.emit('scroll');
  assert.equal(controller.getState().index, 1); assert.equal(view.container.querySelector('.cr-position').textContent, '2 of 5');
  assert.equal(view.timers.size, 0); track.emit('pointerup'); assert.equal(view.timers.size, 1);
});

test('Long quotes expand reversibly without shortening the attributed text or resetting translation and scroll state', () => {
  const view = fixture(); const id = 'NLEZ1-389', business = view.window.CAMPAIGN_REVIEWS.businesses[id];
  const originalText = 'Een uitvoerige persoonlijke beoordeling. '.repeat(10);
  const translatedText = 'An extensive personal review. '.repeat(12);
  const { controller } = view.mount(id, 'en', { cid: business.cid, reviews: [{ authorName: 'Long fixture reviewer', text: originalText, rating: 5, originalLanguage: 'nl', translations: { en: translatedText } }] });
  const card = view.container.querySelectorAll('.cr-card')[1], quote = card.querySelector('.cr-quote'), expand = card.querySelector('.cr-expand');
  assert.equal(quote.textContent, translatedText); assert(quote.className.includes('is-collapsed'));
  assert.equal(expand.textContent, 'Read more'); assert.equal(expand.hidden, false);
  expand.emit('click'); assert.equal(expand.getAttribute('aria-expanded'), 'true'); assert.equal(quote.className.includes('is-collapsed'), false);
  card.querySelector('.cr-original').emit('click'); assert.equal(quote.textContent, originalText); assert.equal(quote.className.includes('is-collapsed'), false);
  controller.update({ lang: 'nl' }); assert.equal(expand.textContent, 'Minder tonen');
  expand.emit('click'); assert.equal(quote.textContent, originalText); assert(quote.className.includes('is-collapsed'));
  assert.equal(view.container.querySelector('.cr-card').querySelector('.cr-expand').hidden, true);
});

test('Read more follows measured six-line overflow rather than character length, and remeasures on font or card resizing', () => {
  const view = fixture(); const id = 'NLEZ1-389', business = view.window.CAMPAIGN_REVIEWS.businesses[id];
  const shortOriginal = 'Een kortere tekst die bij smalle kaarten toch meer dan zes regels nodig heeft.';
  const longTranslation = 'A considerably longer review which fits the wider desktop card. '.repeat(5);
  const { controller } = view.mount(id, 'nl', { cid: business.cid, reviews: [{ authorName: 'Measured fixture reviewer', text: shortOriginal, rating: 5, originalLanguage: 'nl', translations: { en: longTranslation } }] });
  const track = view.container.querySelector('.cr-carousel'), card = view.container.querySelectorAll('.cr-card')[1];
  const quote = card.querySelector('.cr-quote'), expand = card.querySelector('.cr-expand');
  assert.equal(expand.getAttribute('aria-controls'), quote.id);
  assert.equal(card.querySelector('.cr-original').getAttribute('aria-controls'), quote.id);
  assert.equal(expand.hidden, true); // No layout data: conservative fallback.
  quote.measurement = { height: 180, fullHeight: 340 };
  view.resize(390, 358);
  assert.equal(expand.hidden, false); assert(quote.className.includes('is-collapsed'));
  assert.equal(quote.textContent, shortOriginal);
  assert(view.observers[0].targets.includes(track)); assert(view.observers[0].targets.includes(quote));
  expand.emit('click'); assert.equal(quote.className.includes('is-collapsed'), false);
  track.scrollLeft = track.scrollWidth - track.clientWidth; track.emit('scroll'); const scrollBefore = track.scrollLeft;
  quote.measurement = { height: 180, fullHeight: 120 };
  controller.update({ lang: 'en' });
  assert.equal(quote.textContent, longTranslation); assert.equal(expand.hidden, true);
  assert.equal(expand.getAttribute('aria-expanded'), 'true'); assert.equal(track.scrollLeft, scrollBefore);
  quote.measurement = { height: 180, fullHeight: 370 }; view.resize(390, 358);
  assert.equal(expand.hidden, false); assert.equal(expand.textContent, 'Show less');
  assert.equal(quote.className.includes('is-collapsed'), false);
  expand.emit('click'); assert(quote.className.includes('is-collapsed')); assert.equal(quote.textContent, longTranslation);
  card.querySelector('.cr-original').emit('click'); assert.equal(quote.textContent, shortOriginal);
  assert.equal(expand.getAttribute('aria-expanded'), 'false');
  controller.destroy(); assert(view.observers.every(observer => observer.disconnected));
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
