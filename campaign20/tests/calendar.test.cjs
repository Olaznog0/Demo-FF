'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'calendar-ui.js'), 'utf8');

// A small DOM surface executes the unchanged production module. It parses the
// real mounted HTML and records events; no browser, disk output or provider is used.
class Element {
  constructor(tag, doc) {
    this.tagName = tag.toLowerCase(); this.ownerDocument = doc;
    this.children = []; this.parentElement = null; this.attrs = {};
    this.dataset = {}; this.listeners = new Map(); this.value = '';
    this.disabled = false; this.className = ''; this._text = '';
    this.classList = { add: value => { this.className += ' ' + value; } };
  }
  setAttribute(name, value) {
    this.attrs[name] = String(value);
    if (name === 'class') this.className = String(value);
    if (name === 'disabled') this.disabled = true;
    if (name.startsWith('data-')) this.dataset[name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = String(value);
  }
  getAttribute(name) {
    if (name === 'class') return this.className;
    if (name.startsWith('data-')) return this.dataset[name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())];
    return this.attrs[name];
  }
  get name() { return this.attrs.name || ''; }
  get id() { return this.attrs.id; }
  set id(value) { this.attrs.id = value; }
  get type() { return this.attrs.type; }
  set type(value) { this.attrs.type = value; }
  get textContent() { return this._text + this.children.map(child => child.textContent).join(''); }
  set textContent(value) { this._text = String(value); this.children = []; }
  append(child) { child.parentElement = this; this.children.push(child); }
  replaceChildren(...children) { this.children = []; this._text = ''; children.forEach(child => this.append(child)); }
  set innerHTML(html) {
    this.replaceChildren();
    const stack = [this];
    for (const token of html.match(/<\/?[^>]+>|[^<]+/g) || []) {
      if (token.startsWith('</')) { stack.pop(); continue; }
      if (!token.startsWith('<')) { stack.at(-1)._text += token; continue; }
      const match = token.match(/^<([\w-]+)([^>]*)>/), node = new Element(match[1], this.ownerDocument);
      for (const attribute of match[2].matchAll(/([\w:-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"'>=]+)))?/g)) node.setAttribute(attribute[1], attribute[2] ?? attribute[3] ?? attribute[4] ?? '');
      stack.at(-1).append(node);
      if (!['input', 'br', 'img'].includes(node.tagName)) stack.push(node);
    }
  }
  matches(selector) {
    if (selector.includes(':not(:disabled)')) {
      if (this.disabled) return false;
      selector = selector.replace(':not(:disabled)', '');
    }
    const tag = selector.match(/^[a-z][\w-]*/i)?.[0];
    if (tag && tag !== this.tagName) return false;
    for (const match of selector.matchAll(/\.([\w-]+)/g)) if (!this.className.split(/\s+/).includes(match[1])) return false;
    for (const match of selector.matchAll(/\[([\w-]+)(?:="([^"]*)")?\]/g)) {
      const value = this.getAttribute(match[1]);
      if (value === undefined || (match[2] !== undefined && value !== match[2])) return false;
    }
    return true;
  }
  querySelectorAll(selector) {
    const selectors = selector.split(/\s+/), last = selectors.pop(), found = [];
    const visit = node => {
      for (const child of node.children) {
        if (child.matches(last)) {
          let parent = child.parentElement, index = selectors.length - 1;
          while (parent && index >= 0) { if (parent.matches(selectors[index])) index--; parent = parent.parentElement; }
          if (index < 0) found.push(child);
        }
        visit(child);
      }
    };
    visit(this); return found;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  closest(selector) { for (let node = this; node; node = node.parentElement) if (node.matches(selector)) return node; return null; }
  get elements() { return Object.fromEntries(this.querySelectorAll('[name]').map(node => [node.name, node])); }
  addEventListener(type, callback) { const list = this.listeners.get(type) || []; list.push(callback); this.listeners.set(type, list); }
  removeEventListener(type, callback) { this.listeners.set(type, (this.listeners.get(type) || []).filter(item => item !== callback)); }
  async emit(type, event = {}) { for (const callback of this.listeners.get(type) || []) await callback({ preventDefault() {}, target: this, ...event }); }
  focus() { this.ownerDocument.activeElement = this; }
}

function fixture(instant = '2026-10-04T12:00:00Z') {
  const doc = { activeElement: null };
  doc.head = new Element('head', doc); doc.body = new Element('body', doc);
  doc.createElement = tag => new Element(tag, doc);
  doc.getElementById = id => [...doc.head.querySelectorAll('[id]'), ...doc.body.querySelectorAll('[id]')].find(node => node.id === id) || null;
  const clock = { instant: Date.parse(instant) }, requests = [];
  class ControlledDate extends Date { constructor(...args) { super(...(args.length ? args : [clock.instant])); } }
  const blockedRequest = (...args) => { requests.push(args); throw Error('The demo calendar must not access a provider.'); };
  const window = { document: doc, fetch: blockedRequest, navigator: { sendBeacon: blockedRequest } };
  const context = vm.createContext({ window, document: doc, Date: ControlledDate, Intl, fetch: blockedRequest, XMLHttpRequest: class { constructor() { blockedRequest('XMLHttpRequest'); } } });
  vm.runInContext(source, context);
  return { api: window.CampaignCalendar, doc, clock, requests,
    mount(options) { const container = doc.createElement('section'); doc.body.append(container); return { container, mounted: window.CampaignCalendar.mount(container, options) }; }
  };
}

const lead = (leadId = 'lead-a', cid = '11493941908394015326', extra = {}) => ({ leadId, cid, businessName: 'Verified business', family: 'salon', lang: 'en', ...extra });
const plain = value => JSON.parse(JSON.stringify(value));
async function fill(calendar, values) {
  const form = calendar.container.querySelector('form');
  for (const [name, value] of Object.entries(values)) { form.elements[name].value = value; await form.emit('input', { target: form.elements[name] }); }
}
async function choose(calendar, date) {
  const day = calendar.container.querySelectorAll('[data-day]').find(node => node.dataset.day === date);
  assert(day && !day.disabled, 'The selected date must be rendered and selectable');
  await calendar.container.emit('click', { target: day });
}
const appointmentOptions = () => [{ id: 'appointment', title: { en: 'An appointment', nl: 'Een afspraak' } }, { id: 'consultation', title: { en: 'Discuss my wishes', nl: 'Mijn wensen bespreken' } }];
async function choosePreference(calendar, field, value) {
  const button = calendar.container.querySelectorAll('[data-'+field+']').find(node => node.dataset[field] === value);
  assert(button && !button.disabled, 'The preference must be selectable');
  await calendar.container.emit('click', { target: button });
}

test('Amsterdam day follows local midnight and both DST clock changes independently of host timezone', () => {
  const { localDay } = fixture().api.helpers;
  for (const [instant, expected] of [
    ['2026-03-28T23:30:00Z', '2026-03-29'],
    ['2026-03-29T00:30:00Z', '2026-03-29'],
    ['2026-03-29T01:30:00Z', '2026-03-29'],
    ['2026-03-29T22:30:00Z', '2026-03-30'],
    ['2026-10-24T22:30:00Z', '2026-10-25'],
    ['2026-10-25T00:30:00Z', '2026-10-25'],
    ['2026-10-25T01:30:00Z', '2026-10-25'],
    ['2026-10-25T22:30:00Z', '2026-10-25'],
    ['2026-10-25T23:30:00Z', '2026-10-26']
  ]) assert.equal(localDay(new Date(instant)), expected, instant);
});

test('the booking horizon includes today through exactly 90 calendar days across DST, year and leap boundaries', () => {
  const h = fixture().api.helpers;
  for (const today of ['2026-03-01', '2026-10-04', '2026-12-20', '2028-02-01']) {
    assert.equal(h.validDay(h.addDays(today, -1), today), false);
    for (let day = 0; day <= 90; day++) assert.equal(h.validDay(h.addDays(today, day), today), true, `${today} + ${day}`);
    assert.equal(h.validDay(h.addDays(today, 91), today), false);
  }
  assert.equal(h.addDays('2028-02-28', 1), '2028-02-29');
  assert.equal(h.addDays('2028-02-29', 1), '2028-03-01');
  assert.equal(h.moveMonth('2026-01-31', 1), '2026-02-01');
  assert.equal(h.moveMonth('2026-12-20', 1), '2027-01-01');
});

test('malformed and impossible dates are rejected rather than normalized or allowed to throw', () => {
  const h = fixture().api.helpers, data = { time: '10:00', name: 'Example', email: 'example@example.test' };
  for (const date of ['', null, undefined, 'not-a-date', '2026-1-01', '2026-00-01', '2026-13-01', '2026-10-00', '2026-10-32', '2026-02-29', '2026-02-30']) {
    assert.equal(h.validDay(date, '2026-01-01'), false, String(date));
    assert.equal(h.validateRequest({ ...data, date }, '2026-01-01'), 'required', String(date));
  }
  assert.equal(h.validDay('2028-02-29', '2028-02-01'), true);
});

test('request validation refuses unlisted times, empty details and invalid email while accepting a complete request', () => {
  const { validateRequest } = fixture().api.helpers;
  const data = { date: '2026-10-06', time: '11:30', name: ' Example ', email: ' example@example.test ' };
  assert.equal(validateRequest(data, '2026-10-04'), '');
  for (const change of [{ time: '03:00' }, { time: '' }, { name: '  ' }, { email: '  ' }]) assert.equal(validateRequest({ ...data, ...change }, '2026-10-04'), 'required');
  for (const email of ['bad', 'a@b', 'a b@example.test', 'a@@example.test']) assert.equal(validateRequest({ ...data, email }, '2026-10-04'), 'invalid');
});

test('rendered month navigation and keyboard movement cannot cross today or the 90-day horizon', async () => {
  const f = fixture(), calendar = f.mount(lead()), { container } = calendar;
  const previous = container.querySelector('[data-cal-month="-1"]'), next = container.querySelector('[data-cal-month="1"]');
  assert.equal(previous.disabled, true);
  assert.equal(container.querySelector('[data-day="2026-10-03"]').disabled, true);
  assert.equal(container.querySelector('[data-day="2026-10-04"]').getAttribute('aria-current'), 'date');
  assert.equal(container.querySelector('.cal-days').children.slice(0, 3).every(node => node.tagName === 'span'), true, 'October 2026 begins on Thursday in a Monday-first grid');
  const grid = container.querySelector('.cal-days');
  await grid.emit('keydown', { target: container.querySelector('[data-day="2026-10-04"]'), key: 'ArrowLeft' });
  assert.equal(f.api.helpers.stateFor(lead(), '2026-10-04').date, '');
  await grid.emit('keydown', { target: container.querySelector('[data-day="2026-10-04"]'), key: 'ArrowRight' });
  assert.equal(f.doc.activeElement.dataset.day, '2026-10-05');
  assert.equal(f.api.helpers.stateFor(lead(), '2026-10-04').date, '', 'Arrow navigation moves focus and does not silently choose a date');
  for (let month = 0; month < 3; month++) await container.emit('click', { target: next });
  assert.equal(f.api.helpers.stateFor(lead(), '2026-10-04').month, '2027-01-01');
  assert.equal(next.disabled, true);
  assert.equal(container.querySelector('[data-day="2027-01-02"]').disabled, false);
  assert.equal(container.querySelector('[data-day="2027-01-03"]').disabled, true);
  await container.emit('click', { target: next });
  assert.equal(f.api.helpers.stateFor(lead(), '2026-10-04').month, '2027-01-01');
  await choose(calendar, '2027-01-02');
  await grid.emit('keydown', { target: container.querySelector('[data-day="2027-01-02"]'), key: 'ArrowRight' });
  assert.equal(f.doc.activeElement.dataset.day, '2027-01-02');
  assert.equal(f.api.helpers.stateFor(lead(), '2026-10-04').date, '2027-01-02');
});

test('drafts remain isolated by both lead and CID; expired selection resets without discarding the enquiry', () => {
  const h = fixture().api.helpers, options = lead();
  const state = h.stateFor(options, '2026-10-04');
  Object.assign(state, { date: '2026-10-05', time: '14:00', name: 'Example', email: 'example@example.test', message: 'Please contact me.' });
  const differentLead = h.stateFor(lead('lead-b'), '2026-10-04');
  const differentCid = h.stateFor(lead('lead-a', '123456789'), '2026-10-04');
  assert.notEqual(state, differentLead); assert.notEqual(state, differentCid);
  assert.equal(differentLead.name, ''); assert.equal(differentCid.message, '');
  assert.equal(h.stateFor(options, '2026-10-04'), state);
  h.stateFor(options, '2026-10-06');
  assert.equal(state.date, ''); assert.equal(state.time, '');
  assert.equal(state.name, 'Example'); assert.equal(state.message, 'Please contact me.');
  for (const invalid of [lead('', '123'), lead('lead-a', ''), lead('lead-a', '00123'), lead('lead-a', 'not-a-cid')]) assert.throws(() => h.identity(invalid), /verified business identity/);
});

test('language switches preserve selection and all user input while translating dates, controls and labels', async () => {
  const f = fixture(), calendar = f.mount(lead());
  await fill(calendar, { time: '15:30', name: 'Example', email: 'example@example.test', message: 'A retained enquiry.' });
  await choose(calendar, '2026-10-06');
  const original = plain(f.api.helpers.stateFor(lead(), '2026-10-04'));
  const form = calendar.container.querySelector('form');
  for (const lang of ['nl', 'en', 'nl']) {
    calendar.mounted.update({ lang });
    assert.deepEqual(plain(f.api.helpers.stateFor(lead(), '2026-10-04')), original);
    assert.equal(form.elements.name.value, original.name); assert.equal(form.elements.email.value, original.email);
    assert.equal(form.elements.message.value, original.message); assert.equal(form.elements.time.value, '15:30');
    assert.equal(calendar.container.querySelector('h2').textContent, lang === 'nl' ? 'Je volgende afspraak' : 'Your next appointment');
    assert.equal(calendar.container.querySelector('[data-cal-month="1"]').getAttribute('aria-label'), lang === 'nl' ? 'Volgende maand' : 'Next month');
    assert.equal(calendar.container.querySelector('[data-day="2026-10-06"]').getAttribute('aria-pressed'), 'true');
    assert.match(calendar.container.querySelector('.cal-selected').textContent, lang === 'nl' ? /6 oktober 2026/ : /6 October 2026/);
  }
});

test('CID-only identity update is refused before mutation, and another mounted business cannot inherit the draft', async () => {
  const f = fixture(), confirmations = [];
  const options = lead('lead-a', '11493941908394015326', { onSuccess: data => confirmations.push(plain(data)) });
  const calendar = f.mount(options);
  await fill(calendar, { time: '10:00', name: 'Example', email: 'example@example.test', message: 'Only business A.' });
  await choose(calendar, '2026-10-06');
  for (const change of [{ cid: '123456789' }, { leadId: 'lead-b' }, { cid: '', lang: 'nl' }]) assert.throws(() => calendar.mounted.update(change), /business identity/);
  const other = f.mount(lead('lead-b', '123456789'));
  assert.equal(other.container.querySelector('form').elements.name.value, '');
  assert.equal(other.container.querySelector('.cal-selected').textContent, '');
  await calendar.container.querySelector('form').emit('submit');
  assert.equal(confirmations.length, 1); assert.equal(confirmations[0].leadId, options.leadId); assert.equal(confirmations[0].cid, options.cid);
  assert.equal(calendar.container.querySelector('h2').textContent, 'Your next appointment', 'A refused update must not apply its other fields');
});

test('demo submission confirms only through the supplied happy path, with no fetch, POST, beacon or XHR', async () => {
  const f = fixture(), confirmations = [], options = lead('lead-restaurant', '123456789', { family: 'restaurants', onSuccess: data => confirmations.push(plain(data)) });
  const calendar = f.mount(options);
  await fill(calendar, { time: '14:00', name: ' Example ', email: ' example@example.test ', message: ' Table enquiry ' });
  await choose(calendar, '2026-10-06');
  await calendar.container.querySelector('form').emit('submit');
  assert.deepEqual(confirmations, [{ leadId: options.leadId, cid: options.cid, businessName: options.businessName, date: '2026-10-06', time: '14:00', name: 'Example', email: 'example@example.test', message: 'Table enquiry', intent: 'visit-request', mode: 'demo', timeZone: 'Europe/Amsterdam' }]);
  assert.deepEqual(f.requests, []);
  assert.equal(calendar.container.querySelector('[type="submit"]').disabled, false);
  assert.equal(calendar.container.querySelector('.cal-error').textContent, '');
});

test('invalid or unconfirmed requests retain their draft and never falsely confirm a reservation', async () => {
  const f = fixture(), calendar = f.mount(lead()), form = calendar.container.querySelector('form');
  await form.emit('submit');
  assert.match(calendar.container.querySelector('.cal-error').textContent, /Choose a date and time/);
  assert.equal(f.doc.activeElement.dataset.day, '2026-10-04');
  await fill(calendar, { time: '17:00', name: 'Example', email: 'example@example.test', message: 'Retained after failure.' });
  await choose(calendar, '2026-10-06');
  await form.emit('submit');
  assert.match(calendar.container.querySelector('.cal-error').textContent, /could not be completed/);
  assert.equal(form.elements.name.value, 'Example');
  assert.equal(form.elements.message.value, 'Retained after failure.');
  assert.equal(f.api.helpers.stateFor(lead(), '2026-10-04').date, '2026-10-06');
  assert.deepEqual(f.requests, []);
  calendar.mounted.update({ lang: 'nl' });
  assert.match(calendar.container.querySelector('.cal-error').textContent, /niet worden afgerond/);
});

test('submission rechecks Amsterdam today instead of allowing a date that expired since the page opened', async () => {
  const f = fixture('2026-10-24T21:59:00Z'), confirmations = [], calendar = f.mount(lead('late-request', '123', { onSuccess: data => confirmations.push(data) }));
  await fill(calendar, { time: '10:00', name: 'Example', email: 'example@example.test' });
  await choose(calendar, '2026-10-24');
  f.clock.instant = Date.parse('2026-10-24T22:01:00Z');
  await calendar.container.querySelector('form').emit('submit');
  assert.equal(confirmations.length, 0);
  assert.match(calendar.container.querySelector('.cal-error').textContent, /Choose a date and time/);
  assert.equal(f.api.helpers.stateFor(lead('late-request', '123'), '2026-10-25').date, '');
  assert.equal(calendar.container.querySelector('form').elements.time.value, '');
  assert.equal(calendar.container.querySelector('[data-day="2026-10-24"]').disabled, true);
  assert.equal(calendar.container.querySelector('[data-day="2026-10-25"]').getAttribute('aria-current'), 'date');
  assert.equal(f.doc.activeElement.dataset.day, '2026-10-25', 'An expired date focuses the refreshed day control instead of an already valid email');
  assert.deepEqual(f.requests, []);
});

test('configured appointment choices are required and preferred-time buttons update the live summary before demo completion', async () => {
  const f = fixture(), confirmations = [], services = appointmentOptions(), calendar = f.mount(lead('choices', '123', { services, onSuccess: data => confirmations.push(plain(data)) })), form = calendar.container.querySelector('form');
  assert.equal(calendar.container.querySelectorAll('[data-service]').length, 2);
  assert(calendar.container.querySelectorAll('[data-service]').every(button => button.type === 'button' && button.getAttribute('aria-pressed') === 'false'));
  assert(calendar.container.querySelectorAll('[data-time]').every(button => button.disabled));
  await form.emit('submit'); assert.match(calendar.container.querySelector('.cal-error').textContent, /Choose an option/); assert.equal(f.doc.activeElement.dataset.service, 'appointment');
  await fill(calendar, { name: 'Example', email: 'example@example.test', message: 'A preference, please.' });
  await choose(calendar, '2026-10-06'); assert(calendar.container.querySelectorAll('[data-time]').every(button => button.disabled));
  await choosePreference(calendar, 'service', 'consultation');
  await choosePreference(calendar, 'time', '14:00');
  assert.equal(calendar.container.querySelector('[data-cal-value="service"]').textContent, 'Discuss my wishes');
  assert.match(calendar.container.querySelector('[data-cal-value="date"]').textContent, /6 October 2026/);
  assert.equal(calendar.container.querySelector('[data-cal-value="time"]').textContent, '14:00');
  assert.equal(calendar.container.querySelector('[data-time="14:00"]').getAttribute('aria-pressed'), 'true');
  assert.match(calendar.container.querySelector('.cal-time-hint').textContent, /preference/);
  await form.emit('submit'); assert.equal(confirmations.length, 1); assert.equal(confirmations[0].serviceId, 'consultation'); assert.equal(confirmations[0].serviceTitle, 'Discuss my wishes'); assert.equal(confirmations[0].mode, 'demo');
  assert.deepEqual(f.requests, []);
});

test('language and theme updates retain service IDs, viewed month, contact fields and focus while translating the summary', async () => {
  const f = fixture(), options = lead('preserved-options', '123', { services: appointmentOptions() }), calendar = f.mount(options);
  await choosePreference(calendar, 'service', 'appointment'); await choose(calendar, '2026-10-06'); await choosePreference(calendar, 'time', '15:30');
  await fill(calendar, { name: 'Example', email: 'example@example.test', message: 'Keep this draft.' });
  await calendar.container.emit('click', { target: calendar.container.querySelector('[data-cal-month="1"]') });
  const before = plain(f.api.helpers.stateFor(options, '2026-10-04'));
  for (const lang of ['nl', 'en']) {
    calendar.container.querySelector('[data-service="appointment"]').focus(); calendar.mounted.update({ lang, theme: 'B3' });
    assert.deepEqual(plain(f.api.helpers.stateFor(options, '2026-10-04')), before);
    assert.equal(f.doc.activeElement.dataset.service, 'appointment');
    assert.equal(f.doc.activeElement.children[0].textContent, lang === 'nl' ? 'Een afspraak' : 'An appointment');
    assert.equal(calendar.container.querySelector('[data-cal-value="service"]').textContent, lang === 'nl' ? 'Een afspraak' : 'An appointment');
    assert.match(calendar.container.querySelector('[data-cal-value="date"]').textContent, lang === 'nl' ? /6 oktober 2026/ : /6 October 2026/);
    assert.equal(calendar.container.querySelector('[data-cal-value="time"]').textContent, '15:30');
    assert.equal(calendar.container.querySelector('form').elements.message.value, 'Keep this draft.');
  }
  calendar.mounted.update({ services: appointmentOptions().reverse().map(service => ({ ...service, title: { en: service.title.en + ' updated', nl: service.title.nl + ' aangepast' } })) });
  assert.equal(calendar.container.querySelector('[data-cal-value="service"]').textContent, 'An appointment updated');
  assert.equal(calendar.container.querySelector('[data-service="appointment"]').getAttribute('aria-pressed'), 'true');
  calendar.mounted.update({ services: [appointmentOptions()[1]] });
  assert.equal(f.api.helpers.stateFor(options, '2026-10-04').serviceId, '');
  assert.equal(calendar.container.querySelector('[data-cal-value="service"]').textContent, '—');
  assert.equal(calendar.container.querySelector('[data-cal-value="time"]').textContent, '15:30');
  await calendar.container.querySelector('form').emit('submit'); assert.match(calendar.container.querySelector('.cal-error').textContent, /Choose an option/);
  const other = f.mount(lead('other-focused-calendar', '124', { services: appointmentOptions() })), otherChoice = other.container.querySelector('[data-service="appointment"]');
  otherChoice.focus(); calendar.mounted.update({ lang: 'nl' }); assert.equal(f.doc.activeElement, otherChoice, 'An update must not steal focus from another mounted business');
});

test('valid initial service IDs preselect only an empty draft and cannot replace an existing choice', async () => {
  const f = fixture(), services = appointmentOptions(), options = lead('preselected', '123', { services, serviceId: 'consultation' }), calendar = f.mount(options);
  assert.equal(calendar.container.querySelector('[data-service="consultation"]').getAttribute('aria-pressed'), 'true');
  await choosePreference(calendar, 'service', 'appointment'); calendar.mounted.destroy();
  const remounted = f.mount(options); assert.equal(remounted.container.querySelector('[data-service="appointment"]').getAttribute('aria-pressed'), 'true');
  const unknown = f.mount(lead('unknown-choice', '124', { services, serviceId: 'unknown' }));
  assert(unknown.container.querySelectorAll('[data-service]').every(button => button.getAttribute('aria-pressed') === 'false'));
});

test('malformed service options are rejected before mount or update can mutate a draft, and titles render as plain text', async () => {
  const f = fixture(), options = lead('safe-options', '123', { services: appointmentOptions() }), calendar = f.mount(options);
  await choosePreference(calendar, 'service', 'consultation'); await fill(calendar, { name: 'Example', email: 'example@example.test' });
  const before = plain(f.api.helpers.stateFor(options, '2026-10-04')), sparse = Array(2); sparse[0] = appointmentOptions()[0];
  for (const services of [null, {}, sparse, [appointmentOptions()[0], appointmentOptions()[0]], [{ id: '', title: { en: 'Example', nl: 'Voorbeeld' } }], [{ id: 'example', title: { en: 'Example', nl: '' } }]]) {
    assert.throws(() => calendar.mounted.update({ services, lang: 'nl' }), /Services must/);
    assert.deepEqual(plain(f.api.helpers.stateFor(options, '2026-10-04')), before);
    assert.equal(calendar.container.querySelector('h2').textContent, 'Your next appointment');
    assert.throws(() => f.mount(lead('invalid-options', '125', { services })), /Services must/);
  }
  calendar.mounted.update({ services: [{ id: 'plain-text', title: { en: '<img src=x onerror=alert(1)>', nl: '<b>Voorbeeld</b>' } }] });
  assert.equal(calendar.container.querySelector('[data-service]').children[0].textContent, '<img src=x onerror=alert(1)>');
  assert.equal(calendar.container.querySelector('img'), null);
});

test('food enquiries use the configured visit topic without inventing table size, policy, price or availability', async () => {
  const f = fixture(), confirmations = [], calendar = f.mount(lead('food-choice', '123', { family: 'restaurants', services: [{ id: 'visit', title: { en: 'Ask about a visit', nl: 'Een vraag over je bezoek' } }], serviceId: 'visit', onSuccess: data => confirmations.push(plain(data)) }));
  await choose(calendar, '2026-10-06'); await choosePreference(calendar, 'time', '17:00'); await fill(calendar, { name: 'Example', email: 'example@example.test' });
  calendar.mounted.update({ lang: 'nl' }); await calendar.container.querySelector('form').emit('submit');
  assert.equal(confirmations[0].intent, 'visit-request'); assert.equal(confirmations[0].serviceId, 'visit'); assert.equal(confirmations[0].serviceTitle, 'Een vraag over je bezoek');
  for (const key of ['party', 'price', 'duration', 'availability', 'reservationId']) assert.equal(confirmations[0][key], undefined);
  assert.deepEqual(f.requests, []);
});

test('pending completion prevents duplicate requests through language updates and cleanup removes all listeners', async () => {
  const f = fixture(), confirmations = []; let complete;
  const calendar = f.mount(lead('pending-choice', '123', { services: appointmentOptions(), serviceId: 'appointment', onSuccess(data) { confirmations.push(data); return new Promise(resolve => { complete = resolve; }); } })), form = calendar.container.querySelector('form');
  await choose(calendar, '2026-10-06'); await choosePreference(calendar, 'time', '10:00'); await fill(calendar, { name: 'Example', email: 'example@example.test' });
  const pending = form.emit('submit'); assert.equal(confirmations.length, 1); calendar.mounted.update({ lang: 'nl' });
  assert.equal(form.querySelector('[type="submit"]').disabled, true); assert(calendar.container.querySelectorAll('[data-time]').every(button => button.disabled));
  await form.emit('submit'); assert.equal(confirmations.length, 1);
  const grid = calendar.container.querySelector('.cal-days'); calendar.mounted.destroy(); complete(); await pending;
  assert.equal(calendar.container.__campaignCalendar, undefined);
  for (const [node, event] of [[form, 'input'], [form, 'change'], [form, 'submit'], [calendar.container, 'click'], [grid, 'keydown']]) assert.equal(node.listeners.get(event).length, 0);
  assert.deepEqual(f.requests, []);
});
