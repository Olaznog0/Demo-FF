import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { THEME_IDS, resolveContext, contextUrl, validateModel } from './model.mjs';
const root = path.dirname(fileURLToPath(import.meta.url));
const model = JSON.parse(await fs.readFile(path.join(root, 'business-data.json'), 'utf8'));
const manifest = JSON.parse(await fs.readFile(path.resolve(root, '../../deliverables/leads/campaign-pitches-20-2026-10-04/manifest.json'), 'utf8'));

test('Every public business matches the primary campaign CID and original manifest', () => {
  assert.deepEqual(validateModel(model), []);
  assert.deepEqual(new Set(model.businesses.map(lead => lead.id)), new Set(manifest.records.map(lead => lead.id)));
  for (const lead of model.businesses) {
    const source = manifest.records.find(record => record.id === lead.id);
    assert.equal(lead.google.cid, source.googleCidDecimal);
    assert.equal(lead.name, source.name);
    assert.equal(lead.google.featureId, source.googleFeatureId);
    assert.equal(lead.google.placeId, source.googlePlaceId);
    assert.equal(new URL(lead.google.mapsUrl).searchParams.get('cid'), source.googleCidDecimal);
  }
});
test('Public Google summaries use the newest CID-matched primary snapshots', async () => {
  const raw = await fs.readFile(path.join(root, 'reviews-data.js'), 'utf8');
  const snapshot = JSON.parse(raw.match(/window\.CAMPAIGN_REVIEWS\s*=\s*(\{[\s\S]*\})\s*;\s*$/)[1]);
  for (const lead of model.businesses) {
    const observed = snapshot.businesses[lead.id];
    assert.equal(lead.google.cid, observed.cid);
    assert.equal(lead.google.rating, observed.rating);
    assert.equal(lead.google.reviewCount, observed.reviewCount);
    assert.equal(lead.google.observedAt, observed.observedAt);
    assert.equal(lead.google.summarySourceUrl, observed.sourceUrl);
  }
});
test('All 200 business, theme and language combinations preserve the requested identity', () => {
  const combinations = [];
  for (const lead of model.businesses) for (const theme of THEME_IDS[lead.family]) for (const lang of ['en', 'nl']) {
    const context = resolveContext(model, `?lead=${lead.id}&theme=${theme}&lang=${lang}`);
    assert.strictEqual(context.lead, lead); assert.equal(context.theme, theme); assert.equal(context.lang, lang);
    const url = contextUrl('https://example.test/campaign20/index.html?old=discard#faq', context);
    assert.equal(url.searchParams.get('lead'), lead.id); assert.equal(url.searchParams.get('theme'), theme); assert.equal(url.searchParams.get('lang'), lang); assert.equal(url.hash, ''); assert.equal(url.searchParams.has('old'), false);
    combinations.push(url.href);
  }
  assert.equal(new Set(combinations).size, 200);
});

test('All twenty carousels have multiple genuine reviews, preserving frozen snapshots and primary extension attribution', async () => {
  const raw = await fs.readFile(path.join(root, 'reviews-data.js'), 'utf8');
  const baseline = JSON.parse(raw.match(/window\.CAMPAIGN_REVIEWS\s*=\s*(\{[\s\S]*\})\s*;\s*$/)[1]);
  const rawEvidence = await fs.readFile(path.resolve(root, '../../deliverables/leads/campaign-pitches-20-2026-10-04/review-evidence-extension-2026-10-05.json'), 'utf8');
  const evidence = JSON.parse(rawEvidence);
  assert.equal(model.reviewExtensionSha256, createHash('sha256').update(rawEvidence).digest('hex'));
  assert.equal(model.reviewSnapshotSha256, createHash('sha256').update(raw).digest('hex'));
  let added = 0;
  for (const lead of model.businesses) {
    const original = baseline.businesses[lead.id];
    const extra = lead.google.reviewExtension?.reviews || [];
    assert.ok(original.reviews.length + extra.length >= 2, lead.name + ' must have a real multi-review carousel');
    if (!extra.length) continue;
    const source = evidence.businesses.find(record => record.leadId === lead.id);
    assert.equal(source.cid, lead.google.cid);
    assert.equal(lead.google.reviewExtension.cid, lead.google.cid);
    assert.equal(source.businessName, lead.name);
    const feature = source.primarySourceUrl.match(/!1s0x[a-f0-9]+:(0x[a-f0-9]+)/i);
    assert.equal(BigInt(feature[1]).toString(), lead.google.cid);
    for (const review of extra) {
      const observed = source.reviews.find(item => item.reviewId === review.reviewId);
      assert.equal(review.authorName, observed.author);
      assert.equal(review.authorUrl, observed.authorUrl);
      assert.equal(review.photoUrl, observed.photoUrl);
      assert.equal(review.text, observed.quote);
      assert.equal(review.rating, observed.rating);
      assert.equal(review.publishedLabel, observed.publishedLabel);
      assert.equal(review.translations.en, observed.translation.en);
      assert.equal(review.translationProvider, 'editorial translation');
      assert.equal(review.sourceUrl, source.primarySourceUrl);
      assert.ok(!original.reviews.some(item => item.authorName === review.authorName && item.text === review.text), 'Do not duplicate a quote to manufacture carousel slides');
      added++;
    }
  }
  assert.equal(added, 6);
  const invalid = structuredClone(model);
  const changed = invalid.businesses.find(lead => lead.google.reviewExtension);
  changed.google.reviewExtension.cid = '1';
  assert.ok(validateModel(invalid).some(issue => issue.includes('Review extension identity mismatch')));
});
test('Thank-you and return URLs retain business identity with no personal details', () => {
  for (const lead of model.businesses) {
    const context = resolveContext(model, `?lead=${lead.id}&lang=en`);
    const thanks = contextUrl('https://example.test/campaign20/index.html', context, 'thanks');
    assert.equal(resolveContext(model, thanks.search).view, 'thanks');
    assert.deepEqual([...thanks.searchParams.keys()].sort(), ['lang', 'lead', 'theme', 'view']);
    const back = contextUrl(thanks, context, 'home'); assert.equal(back.searchParams.has('view'), false); assert.equal(back.searchParams.get('lead'), lead.id);
  }
});
test('A restaurant cannot select a beauty style, and an unknown language safely defaults', () => {
  const food = model.businesses.find(lead => lead.family === 'restaurants'), beauty = model.businesses.find(lead => lead.family === 'salon');
  assert.equal(resolveContext(model, `lead=${food.id}&theme=B1&lang=es`).theme, food.defaultTheme);
  assert.equal(resolveContext(model, `lead=${beauty.id}&theme=R1&lang=es`).theme, beauty.defaultTheme);
  assert.equal(resolveContext(model, `lead=${food.id}&lang=es`).lang, 'nl');
  assert.throws(() => resolveContext(model, '?lead=unrelated-business'), /Unknown campaign business/);
});
test('Public preview payload excludes email lists and private workflow information', async () => {
  const raw = await fs.readFile(path.join(root, 'business-data.json'), 'utf8');
  assert.doesNotMatch(raw, /"publicEmails"|"marketingPermission"|"contactReady"|"strictRank"|"sourceBrief"|"sourceFile"|deliverables\//);
  assert.doesNotMatch(raw, /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  assert.equal(model.businesses.filter(lead => lead.family === 'restaurants').length, 10);
  assert.equal(model.businesses.filter(lead => lead.family === 'salon').length, 10);
  assert.equal(model.businesses.filter(lead => lead.tableReservationEnabled !== false).length, 0);
});
test('Language and palette changes update content without rebuilding product or calling providers', async () => {
  const app = await fs.readFile(path.join(root, 'app.js'), 'utf8');
  const setTheme = app.slice(app.indexOf('function setTheme('), app.indexOf("window.addEventListener('campaign20:reviews-ready'"));
  assert.doesNotMatch(setTheme, /replaceChildren|renderHome|mountModules|\.src\s*=/);
  const language = app.slice(app.indexOf('function setLanguage('), app.indexOf('function setTheme('));
  assert.doesNotMatch(language, /replaceChildren|renderHome|\.src\s*=/);
  assert.doesNotMatch(app, /method:\s*['"]POST|\/api\/bookings|\/api\/contact|mailto:|RESEND_API_KEY|GOOGLE_PLACES_API_KEY/);
});
test('Readable body text and primary calls to action meet WCAG AA across all ten palettes', async () => {
  const css = await fs.readFile(path.join(root, 'styles.css'), 'utf8');
  const luminance = color => {
    const hex = color.slice(1); const channels = hex.length === 3 ? [...hex].map(value => parseInt(value + value, 16)) : [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16));
    const linear = channels.map(value => { const c = value / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
    return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
  };
  const ratio = (a, b) => { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  for (const id of [...THEME_IDS.restaurants, ...THEME_IDS.salon]) {
    const values = { paper: '#faf5eb', ink: '#2d2922', accent: '#9f4829', 'accent-text': '#fff', muted: '#685f51' };
    const block = css.match(new RegExp('\\.theme-' + id + '\\{([^}]*)'))?.[1] || '';
    for (const [, key, value] of block.matchAll(/--([a-z-]+):\s*(#[a-f0-9]{3,6})/gi)) values[key] = value;
    assert.ok(ratio(values.ink, values.paper) >= 4.5, id + ' main text');
    assert.ok(ratio(values.muted, values.paper) >= 4.5, id + ' secondary text');
    assert.ok(ratio(values['accent-text'], values.accent) >= 4.5, id + ' action text');
  }
});
test('The preview server serves only explicit public assets and separate local launcher files', async () => {
  const { server } = await import('./server.cjs').then(module => module.default);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const route of ['/campaign20/index.html', '/campaign20/launcher.html', '/campaign20/business-data.json', '/assets/restaurant-cover.webp', '/demos/assets/hair-inspiration.webp']) assert.equal((await fetch(base + route)).status, 200, route);
    for (const route of ['/campaign20/.env', '/campaign20/build-data.mjs', '/campaign20/../package.json', '/deliverables/leads/leads-acumulados.json', '/campaign20/server.cjs']) assert.equal((await fetch(base + route)).status, 404, route);
    assert.equal((await fetch(base + '/campaign20/index.html', { method: 'POST' })).status, 405);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
test('The public release is an exact allowlist and never exports launcher, tests or campaign research', async () => {
  const { getCampaignFiles, PUBLIC_ENTRY_FILES, PUBLIC_ASSETS } = await import('./release-files.mjs');
  const files = await getCampaignFiles();
  assert.equal(files.length, 13);
  assert.deepEqual(new Set(files.map(file => file.destinationPath)), new Set([...PUBLIC_ENTRY_FILES.map(file => 'pitch/' + file), ...PUBLIC_ASSETS.map(file => 'demos/assets/' + file)]));
  for (const file of files) {
    assert.match(file.sha256, /^[a-f0-9]{64}$/);
    assert.ok(file.size > 0);
    assert.doesNotMatch(file.destinationPath, /launcher|test|audit|build-|README|\.env|manifest|deliverables/);
  }
});
