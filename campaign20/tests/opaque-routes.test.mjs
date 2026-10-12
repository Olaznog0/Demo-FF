import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createOpaqueRegistry, validateOpaqueRegistry, compactOpaqueRegistry, makeLeadLinks, opaqueBootstrap, renderOpaqueHtml} from '../opaque-routes.mjs';
import {resolveContext, contextUrl, THEME_IDS, confirmationSummary, readConfirmation} from '../model.mjs';
const model = JSON.parse(await fs.readFile(new URL('../business-data.json', import.meta.url), 'utf8'));
const registry = JSON.parse(await fs.readFile(new URL('../opaque-routes.json', import.meta.url), 'utf8'));
const html = await fs.readFile(new URL('../index.html', import.meta.url), 'utf8');
const sent = new Set(model.cohorts.slice(0, 2).flatMap(item => item.leadIds));

test('only 20 ready future businesses have routes; all 100 future leads have unique 144-bit reservations outside the 40 sent clients', () => {
  assert.strictEqual(validateOpaqueRegistry(registry, model), registry);
  assert.equal(registry.reservations.length, 100);
  assert.equal(registry.reservations.filter(item => item.ready).length, 20);
  assert.equal(registry.reservations.filter(item => !item.ready).length, 80);
  const tokens = new Set(registry.records.map(item => item.token));
  for (const item of registry.reservations) {
    assert(!sent.has(item.leadId));
    for (const token of Object.values(item.homeTokens)) {
      assert.match(token, /^[A-Za-z0-9_-]{24}$/); assert.equal(Buffer.from(token, 'base64url').length, 18);
      tokens.add(token);
    }
    if (!item.ready) assert(!registry.records.some(route => route.leadId === item.leadId));
  }
  assert.equal(tokens.size, registry.records.length + 160);
  const summary = makeLeadLinks(registry, model);
  for (const item of summary.records) for (const lang of ['en', 'nl']) {
    const url = new URL(item.urls[lang]); assert.equal(url.origin, 'https://ocimatik.com');
    assert.match(url.pathname, /^\/start\/[A-Za-z0-9_-]{24}$/); assert.equal(url.search, ''); assert.equal(url.hash, '');
    assert(!url.href.includes(item.leadId)); assert.equal(item.ready, !!model.businesses.find(lead => lead.id === item.leadId));
  }
});

test('regeneration is stable and activating a reserved public model reuses both prepared home tokens', () => {
  const ids = registry.reservations.map(item => item.leadId);
  const regenerated = createOpaqueRegistry(model, ids, registry);
  assert.deepEqual(regenerated, registry);
  const pending = registry.reservations.find(item => !item.ready), expanded = structuredClone(model);
  const sample = structuredClone(model.businesses.find(lead => registry.records.some(route => route.leadId === lead.id)));
  sample.id = pending.leadId; sample.google.cid = '9876543210123456789';
  sample.google.mapsUrl = 'https://www.google.com/maps?cid=' + sample.google.cid;
  sample.google.reviewSnapshot.cid = sample.google.cid;
  expanded.businesses.push(sample); expanded.cohorts.push({id: 'future-fixture', expectedCount: 1, leadIds: [sample.id]});
  const activated = createOpaqueRegistry(expanded, ids, registry);
  assert(activated.reservations.find(item => item.leadId === sample.id).ready);
  for (const lang of ['en', 'nl']) assert.equal(activated.records.find(route => route.leadId === sample.id && route.theme === sample.defaultTheme && route.lang === lang && route.view === 'home').token, pending.homeTokens[lang]);
  assert.deepEqual(activated.records.filter(route => route.leadId !== sample.id), registry.records);
  assert.deepEqual(activated.reservations.filter(item => item.leadId !== sample.id), registry.reservations.filter(item => item.leadId !== sample.id));
  assert.throws(() => createOpaqueRegistry(model, ids.slice(1), registry), /Never discard/);
});

test('every ready theme, language, service, FAQ and confirmation resolves its own business with no query identifiers', () => {
  for (const route of registry.records) {
    const bootstrap = opaqueBootstrap(registry, route.token), address = 'https://ocimatik.com/start/' + route.token;
    assert(bootstrap.routes.every(item => item.leadId === route.leadId));
    const context = resolveContext(model, address + '?lead=wrong&theme=B9&lang=xx&view=bad', bootstrap);
    assert.equal(context.lead.id, route.leadId); assert.equal(context.theme, route.theme); assert.equal(context.lang, route.lang);
    assert.equal(context.view, route.view); assert.equal(context.serviceId, route.serviceId);
    for (const view of ['home', 'booking', 'faq', 'thanks']) {
      const destination = contextUrl(address + '?email=private@example.test#old', context, view);
      assert.equal(destination.search, ''); assert.equal(destination.hash, ''); assert(!destination.href.includes(route.leadId));
      const next = resolveContext(model, destination.href, bootstrap);
      assert.strictEqual(next.lead, context.lead); assert.equal(next.theme, context.theme); assert.equal(next.lang, context.lang); assert.equal(next.view, view);
      if (view !== 'booking') assert.equal(next.serviceId, null);
    }
    for (const theme of THEME_IDS[context.lead.family]) for (const lang of ['en', 'nl']) {
      const destination = contextUrl(address, {...context, theme, lang}, 'home'), next = resolveContext(model, destination, bootstrap);
      assert.equal(next.theme, theme); assert.equal(next.lang, lang); assert.equal(next.lead.id, route.leadId);
    }
  }
});

test('unknown addresses, invalid mappings and unavailable opaque states fail closed instead of exposing a legacy URL', () => {
  const valid = registry.records[0], bootstrap = opaqueBootstrap(registry, valid.token);
  assert.throws(() => resolveContext(model, 'https://ocimatik.com/start/xxxxxxxxxxxxxxxxxxxxxxxx', bootstrap), /Unknown opaque/);
  assert.throws(() => resolveContext(model, 'https://ocimatik.com/pitch/index.html?lead=' + valid.leadId, bootstrap), /Unknown opaque/);
  assert.throws(() => contextUrl('https://ocimatik.com/start/' + valid.token, {...resolveContext(model, 'https://ocimatik.com/start/' + valid.token, bootstrap), opaqueRoutes: []}), /navigation is unavailable/);
  for (const mutation of [
    copy => copy.records.push({...copy.records[0]}),
    copy => copy.records[0].theme = 'invalid',
    copy => copy.records[0].leadId = model.businesses.find(lead => sent.has(lead.id)).id,
    copy => copy.records[0].token = 'short',
    copy => copy.records[0].email = 'private@example.test',
    copy => copy.reservations.find(item => !item.ready).ready = true,
    copy => copy.reservations[1].homeTokens.en = copy.reservations[0].homeTokens.en
  ]) {const copy = structuredClone(registry); mutation(copy); assert.throws(() => validateOpaqueRegistry(copy, model));}
});

test('opaque bootstrap preserves ordinary section anchors, versioned runtime assets and privacy-bound confirmation identity', () => {
  const route = registry.records.find(item => item.view === 'booking' && item.serviceId), bootstrap = opaqueBootstrap(registry, route.token);
  const output = renderOpaqueHtml(html.replace('./styles.css', './styles.css?v=abc'), bootstrap);
  assert(output.includes('href="/start/_assets/styles.css?v=abc"')); assert(output.includes('src="/start/_assets/app.js"'));
  assert(!output.includes('<base')); assert(output.includes('href="#main-content"'));
  const data = JSON.parse(output.match(/id="campaign-route-context">([^]*?)<\/script>/)[1]);
  assert(data.routes.every(item => item.leadId === route.leadId));
  const context = resolveContext(model, 'https://ocimatik.com/start/' + route.token, data), now = Date.now();
  const summary = confirmationSummary(context, {leadId: route.leadId, cid: context.lead.google.cid, serviceId: route.serviceId, date: '2026-10-20', time: '10:00', name: 'PRIVATE'}, now);
  assert(!JSON.stringify(summary).includes('PRIVATE'));
  const thanks = resolveContext(model, contextUrl('https://ocimatik.com/start/' + route.token, context, 'thanks'), data);
  assert.deepEqual(readConfirmation(thanks, JSON.stringify(summary), now), summary);
  const other = model.businesses.find(lead => lead.id !== route.leadId);
  assert.equal(readConfirmation({...thanks, lead: other}, JSON.stringify(summary), now), null);
});

test('all 40 already-sent clients keep their exact legacy query behavior and are absent from opaque runtime rows', () => {
  const rows = compactOpaqueRegistry(registry, model);
  assert(rows.every(row => !sent.has(row[1])));
  for (const lead of model.businesses.filter(item => sent.has(item.id))) for (const theme of THEME_IDS[lead.family]) for (const lang of ['en', 'nl']) {
    const context = resolveContext(model, '?lead=' + lead.id + '&theme=' + theme + '&lang=' + lang);
    const url = contextUrl('https://ocimatik.com/pitch/index.html', context);
    assert.equal(url.pathname, '/pitch/index.html'); assert.equal(url.searchParams.get('lead'), lead.id);
    assert.equal(url.searchParams.get('theme'), theme); assert.equal(url.searchParams.get('lang'), lang);
    assert.equal(context.opaqueRoutes, undefined);
  }
});
