import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { validateModel } from './model.mjs';

const fields = new Set(['id', 'name', 'address', 'locality', 'family', 'defaultTheme', 'groupId', 'actualSector', 'actualSubtype', 'confirmedServices', 'tableReservationEnabled', 'phone', 'google', 'media']);
const googleFields = new Set(['cid', 'featureId', 'placeId', 'mapsUrl', 'rating', 'reviewCount', 'observedAt', 'identitySourceUrl', 'summarySourceUrl', 'reviewSnapshot']);
const assets = new Set(['restaurant-cover.webp', 'de-happertjes-kibbeling-concept.webp', 'salon-scene.webp', 'hair-inspiration.webp']);
const text = value => typeof value === 'string' && !!value.trim();
const sha256 = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const validTime = value => typeof value === 'string' && Number.isFinite(Date.parse(value));

function publicOnly(value) {
  const serialized = JSON.stringify(value);
  assert.doesNotMatch(serialized, /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/, 'Email addresses must stay in the private packet');
  assert.doesNotMatch(serialized, /\bre_[A-Za-z0-9_]{24,}|\bsk_(?:live|test)_[A-Za-z0-9]+|RESEND_API_KEY/, 'Credentials must never enter a campaign payload');
  const privateKeys = new Set(['contact', 'publicEmails', 'email', 'marketingPermission', 'inventory', 'contactReady', 'strictRank', 'sourceBrief', 'sourceFile']);
  function visit(item) {
    if (!item || typeof item !== 'object') return;
    for (const [key, child] of Object.entries(item)) {
      assert(!privateKeys.has(key), 'Private campaign metadata must not be published: ' + key);
      visit(child);
    }
  }
  visit(value);
}

function googleUrl(value, kind) {
  assert(text(value), 'A Google evidence URL is required');
  const url = new URL(value);
  assert.equal(url.protocol, 'https:');
  assert(!url.username && !url.password, 'Evidence URLs cannot contain credentials');
  if (kind === 'photo') assert(url.hostname.endsWith('.googleusercontent.com'), 'Unexpected portrait source');
  else {
    assert.equal(url.hostname, 'www.google.com', 'Evidence must be an attributable primary Google URL');
    assert(url.pathname.startsWith(kind === 'author' ? '/maps/contrib/' : '/maps/'), 'Unexpected Google evidence path');
  }
  return value;
}

function featureCid(value) {
  // Nearby buildings may appear as !5s before the business's own !1s identity.
  const feature = value.match(/!1s0x[a-f0-9]+:(0x[a-f0-9]+)/i) || value.match(/^0x[a-f0-9]+:(0x[a-f0-9]+)$/i);
  assert(feature, 'Canonical Maps evidence must include the observed feature ID');
  return BigInt(feature[1]).toString();
}

function englishDate(value) {
  return value.replace(/^Bewerkt: /, 'Edited: ').replace(/\b(een|\d+) (jaar|jaren|maand|maanden|week|weken|dag|dagen|uur|uren|minuut|minuten) geleden\b/g, (_, amount, unit) => {
    const count = amount === 'een' ? 1 : Number(amount);
    const translated = { jaar: 'year', jaren: 'year', maand: 'month', maanden: 'month', week: 'week', weken: 'week', dag: 'day', dagen: 'day', uur: 'hour', uren: 'hour', minuut: 'minute', minuten: 'minute' }[unit];
    return count + ' ' + translated + (count === 1 ? '' : 's') + ' ago';
  }).replace(/^gisteren$/i, 'Yesterday').replace(/^vandaag$/i, 'Today');
}

function snapshotFromEvidence(business, evidence) {
  assert(evidence && evidence.leadId === business.id && evidence.businessName === business.name, 'Review evidence business identity differs: ' + business.id);
  assert.equal(evidence.cid, business.google.cid, 'Review evidence CID differs');
  googleUrl(evidence.primarySourceUrl, 'source');
  assert.equal(featureCid(evidence.primarySourceUrl), evidence.cid, 'Canonical evidence belongs to another Google business');
  assert(validTime(evidence.observedAt), 'Review evidence needs its observed timestamp');
  assert(Array.isArray(evidence.reviews) && evidence.reviews.length === 5, 'Each new business needs exactly five attributable reviews');
  const ids = new Set(), authors = new Set();
  const reviews = evidence.reviews.map(review => {
    assert(review && text(review.author) && text(review.quote) && text(review.publishedLabel) && text(review.reviewId), 'Incomplete attributed review');
    const authorUrl = googleUrl(review.authorUrl, 'author');
    const author = 'google:' + new URL(authorUrl).pathname.match(/^\/maps\/contrib\/(\d+)(?:\/|$)/)?.[1];
    assert(author !== 'google:undefined', 'An observed Google contributor identity is required');
    assert(!ids.has(review.reviewId) && !authors.has(author), 'Duplicate review ID or author');
    ids.add(review.reviewId); authors.add(author);
    assert(Number.isInteger(review.rating) && review.rating >= 1 && review.rating <= 5, 'Invalid observed review score');
    assert(['en', 'nl'].includes(review.originalLanguage), 'Review language must be explicitly identified');
    const target = review.originalLanguage === 'nl' ? 'en' : 'nl';
    assert(review.translation?.isTranslation === true && review.translation.provider === 'editorial translation' && text(review.translation[target]), 'A labelled translation of the original review is required');
    if (review.excerpt !== undefined && review.excerpt !== null) assert(text(review.excerpt) && review.quote.startsWith(review.excerpt), 'Excerpt must retain the original words');
    if (review.observedAt !== undefined) assert(validTime(review.observedAt), 'Invalid review observed timestamp');
    const quoteContext = review.quoteContext;
    if (quoteContext !== undefined) assert(quoteContext && text(quoteContext.nl) && text(quoteContext.en), 'A structured review field needs bilingual context');
    const nativeReviewId = review.nativeReviewId;
    if (nativeReviewId !== undefined) assert(text(nativeReviewId) && nativeReviewId === review.reviewId && review.reviewIdType === 'native-google-review-id', 'Native review identity must retain its observed type');
    const displayText = review.excerpt || review.quote;
    return {
      authorName: review.author, authorUrl,
      photoUrl: review.photoUrl ? googleUrl(review.photoUrl, 'photo') : null,
      rating: review.rating, text: review.quote, displayText: quoteContext ? quoteContext[review.originalLanguage] + ': ' + displayText : displayText,
      originalLanguage: review.originalLanguage, translations: { [target]: review.translation[target] },
      translationProvider: review.translation.provider, publishedLabel: review.publishedLabel,
      publishedLabels: { nl: review.publishedLabels?.nl || review.publishedLabel, en: review.publishedLabels?.en || englishDate(review.publishedLabel) },
      reviewId: review.reviewId, isExcerpt: !!review.excerpt,
      sourceUrl: evidence.primarySourceUrl, observedAt: review.observedAt || evidence.observedAt,
      ...(quoteContext ? { quoteContext: { nl: quoteContext.nl, en: quoteContext.en } } : {}),
      ...(nativeReviewId ? { nativeReviewId, reviewIdType: review.reviewIdType } : {}),
      sourceAttribution: { provider: 'Google Maps', primarySourceUrl: evidence.primarySourceUrl, cid: evidence.cid, observedAt: review.observedAt || evidence.observedAt, reviewId: review.reviewId, reviewIdType: review.reviewIdType || 'evidence-identifier' },
    };
  });
  reviews.sort((a, b) => b.rating - a.rating);
  return { cid: business.google.cid, observedAt: evidence.observedAt, selectionOrder: 'rating-descending-stable', reviews };
}

// This operation only appends public presentation data. It never changes a
// prior business object, its selected reviews, or the URLs already emailed.
export function mergeCampaignCohort(base, input) {
  assert.deepEqual(validateModel(base), [], 'The existing release must be valid before expansion');
  publicOnly(base);
  assert(input?.schemaVersion === 1, 'Unsupported campaign addition schema');
  assert(text(input.cohortId) && /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(input.cohortId), 'A stable cohort ID is required');
  assert(Number.isInteger(input.expectedCount) && input.expectedCount > 0 && Array.isArray(input.businesses) && input.businesses.length === input.expectedCount, 'New cohort count differs from its explicit target');
  const evidence = input.reviewEvidence;
  assert(evidence?.schemaVersion === 1 && evidence.primaryUiObserved === true && Array.isArray(evidence.businesses) && evidence.businesses.length === input.expectedCount, 'A complete primary-UI review cohort is required');
  publicOnly(input.businesses); publicOnly(evidence);
  const before = base.businesses.map(sha256);
  const priorIds = new Set(base.businesses.map(business => business.id));
  const priorCids = new Set(base.businesses.map(business => business.google.cid));
  const addedIds = new Set(), addedCids = new Set();
  const evidenceById = new Map(evidence.businesses.map(record => [record?.leadId, record]));
  assert.equal(evidenceById.size, evidence.businesses.length, 'Duplicate review evidence business ID');
  const additions = input.businesses.map(business => {
    assert(business && Object.keys(business).every(key => fields.has(key)), 'Unlisted public business field');
    assert(business.google && Object.keys(business.google).every(key => googleFields.has(key)), 'Unlisted public Google field');
    assert(text(business.id) && !priorIds.has(business.id) && !addedIds.has(business.id), 'New business ID must not replace or duplicate a prior identity');
    assert(typeof business.google.cid === 'string' && /^[1-9]\d+$/.test(business.google.cid) && !priorCids.has(business.google.cid) && !addedCids.has(business.google.cid), 'New Google CID must be unique');
    addedIds.add(business.id); addedCids.add(business.google.cid);
    assert(/^0x[a-f0-9]+:0x[a-f0-9]+$/i.test(business.google.featureId || ''), 'The new business needs its observed Google feature ID');
    assert.equal(featureCid(business.google.featureId), business.google.cid, 'Observed feature ID and CID differ');
    googleUrl(business.google.mapsUrl, 'source');
    const maps = new URL(business.google.mapsUrl);
    assert((maps.searchParams.get('cid') || featureCid(business.google.mapsUrl)) === business.google.cid, 'Business Maps URL has another identity');
    assert(Number.isInteger(business.google.reviewCount) && business.google.reviewCount > 10 && Number.isFinite(business.google.rating), 'New Google summary must be corroborated numeric data');
    assert(validTime(business.google.observedAt), 'New Google summary needs its observed timestamp');
    if (business.media) {
      assert(Object.keys(business.media).every(key => ['asset', 'attribution', 'verifiedBusinessPhoto'].includes(key)), 'Unlisted media field');
      assert(business.media.asset === null || assets.has(business.media.asset), 'Reuse an existing audited campaign asset');
    }
    assert(Array.isArray(business.confirmedServices), 'Service provenance is required');
    for (const service of business.confirmedServices) assert(text(service.value) && text(service.sourceUrl) && validTime(service.observedAt), 'A claimed service must retain its observed source');
    const snapshot = snapshotFromEvidence(business, evidenceById.get(business.id));
    if (Object.hasOwn(business.google, 'reviewSnapshot')) assert.deepEqual(business.google.reviewSnapshot, snapshot, 'Do not replace an unexpected supplied review snapshot');
    return { ...business, google: { ...business.google, reviewSnapshot: snapshot } };
  });
  const cohorts = Object.hasOwn(base, 'cohorts') ? [...base.cohorts] : [{ id: 'J1-legacy', expectedCount: base.businesses.length, leadIds: [...priorIds] }];
  assert(!cohorts.some(cohort => cohort.id === input.cohortId), 'Campaign cohort ID already exists');
  cohorts.push({ id: input.cohortId, expectedCount: additions.length, leadIds: additions.map(business => business.id) });
  const merged = { ...base, cohorts, cohortEvidenceSha256: { ...base.cohortEvidenceSha256, [input.cohortId]: sha256(evidence) }, businesses: [...base.businesses, ...additions] };
  assert.deepEqual(validateModel(merged), [], 'Expanded campaign model is invalid');
  publicOnly(merged);
  assert.deepEqual(base.businesses.map(sha256), before, 'A previous business changed during expansion');
  assert.deepEqual(merged.businesses.slice(0, base.businesses.length).map(sha256), before, 'Previous business values must remain exactly preserved');
  return merged;
}

export async function runCohortMerge(argv) {
  const options = new Map();
  for (let i = 0; i < argv.length; i += 2) {
    assert(['--base', '--addition', '--output'].includes(argv[i]) && argv[i + 1] && !options.has(argv[i]), 'Use --base <model> --addition <private-input> [--output <model>]');
    options.set(argv[i], path.resolve(argv[i + 1]));
  }
  assert(options.has('--base') && options.has('--addition'), 'Base and addition files are required');
  const [baseBytes, inputBytes] = await Promise.all([fs.readFile(options.get('--base'), 'utf8'), fs.readFile(options.get('--addition'), 'utf8')]);
  const base = JSON.parse(baseBytes), input = JSON.parse(inputBytes);
  const merged = mergeCampaignCohort(base, input);
  if (options.has('--output')) {
    assert(options.get('--output') !== options.get('--base') && options.get('--output') !== options.get('--addition'), 'Write a separate candidate model, never overwrite a source');
    await fs.writeFile(options.get('--output'), JSON.stringify(merged, null, 2) + '\n', { flag: 'wx' });
  }
  return { previousBusinesses: base.businesses.length, addedBusinesses: input.businesses.length, totalBusinesses: merged.businesses.length, cohortId: input.cohortId, previousBusinessValuesPreserved: true, written: options.has('--output'), messagesSent: 0, deployments: 0 };
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  console.log(JSON.stringify(await runCohortMerge(process.argv.slice(2))));
}
