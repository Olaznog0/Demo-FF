import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { validateModel } from './model.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const packet = path.resolve(here, '../../deliverables/leads/campaign-pitches-20-2026-10-04');
const [rawManifest, rawDirections] = await Promise.all([fs.readFile(path.join(packet, 'manifest.json'), 'utf8'), fs.readFile(path.join(packet, 'visual-review/directions.json'), 'utf8')]);
const manifest = JSON.parse(rawManifest), directions = JSON.parse(rawDirections);
const configured = directions.directions.flatMap(direction => direction.businesses.map(lead => ({ ...lead, family: direction.sector === 'food' ? 'restaurants' : 'salon', defaultTheme: direction.id })));
const businesses = [];
for (const record of manifest.records) {
  const lead = configured.find(item => item.id === record.id);
  if (!lead || record.googleCidDecimal !== lead.google.cid) throw new Error('Manifest and direction identity differ: ' + record.id);
  const brief = JSON.parse(await fs.readFile(path.join(packet, record.briefFile), 'utf8'));
  businesses.push({ id: lead.id, name: lead.name, address: lead.address, locality: lead.locality, family: lead.family, defaultTheme: lead.defaultTheme, groupId: lead.groupId, actualSector: lead.actualSector, actualSubtype: lead.actualSubtype, confirmedServices: lead.confirmedServices.map(item => ({ value: item.value, sourceUrl: item.sourceUrl, observedAt: item.observedAt })), tableReservationEnabled: false, phone: brief.business.publicPhoneCandidates.find(item => item.verified)?.number || null, google: { cid: lead.google.cid, featureId: record.googleFeatureId, placeId: record.googlePlaceId, mapsUrl: `https://www.google.com/maps/?cid=${lead.google.cid}`, rating: lead.google.rating, reviewCount: lead.google.reviewCount, observedAt: lead.google.observedAt, identitySourceUrl: brief.google.identifierEvidence.sourceUrl }, media: { asset: lead.groupId === 'ice-cream' ? null : lead.family === 'salon' ? lead.id === 'NLEX100N-119' ? 'salon-scene.webp' : 'hair-inspiration.webp' : ['NLEX100N-156', 'NLEZ1-359', 'NLE100S-115'].includes(lead.id) ? 'de-happertjes-kibbeling-concept.webp' : 'restaurant-cover.webp', attribution: 'design-reference', verifiedBusinessPhoto: false } });
}
let reviewSnapshotSha256 = null;
try {
  const rawReviews = await fs.readFile(path.join(here, 'reviews-data.js'), 'utf8');
  const match = rawReviews.match(/window\.CAMPAIGN_REVIEWS\s*=\s*(\{[\s\S]*\})\s*;\s*$/);
  if (!match) throw new Error('The review snapshot must be a plain JSON assignment.');
  const snapshot = JSON.parse(match[1]);
  for (const lead of businesses) {
    const observed = snapshot.businesses?.[lead.id];
    if (!observed || observed.cid !== lead.google.cid) throw new Error('Review snapshot identity mismatch: ' + lead.id);
    lead.google.rating = observed.rating;
    lead.google.reviewCount = observed.reviewCount;
    lead.google.observedAt = observed.observedAt;
    lead.google.summarySourceUrl = observed.sourceUrl;
  }
  reviewSnapshotSha256 = createHash('sha256').update(rawReviews).digest('hex');
} catch (error) { if (error.code !== 'ENOENT') throw error; }
let reviewExtensionSha256 = null;
try {
  const rawExtension = await fs.readFile(path.join(packet, 'review-evidence-extension-2026-10-05.json'), 'utf8');
  const extension = JSON.parse(rawExtension);
  if (extension.schemaVersion !== 1 || extension.primaryUiObserved !== true || !Array.isArray(extension.businesses)) throw new Error('Review extensions require primary UI evidence.');
  const seen = new Set();
  const googleUrl = (value, kind) => {
    const url = new URL(value);
    if (url.protocol !== 'https:' || (kind === 'photo' ? !url.hostname.endsWith('.googleusercontent.com') : url.hostname !== 'www.google.com' || !url.pathname.startsWith('/maps/'))) throw new Error('Unexpected review evidence URL.');
    return value;
  };
  for (const record of extension.businesses) {
    const lead = businesses.find(item => item.id === record.leadId);
    if (!lead || seen.has(record.leadId) || lead.name !== record.businessName || lead.google.cid !== record.cid) throw new Error('Review extension business identity mismatch.');
    seen.add(record.leadId);
    const feature = googleUrl(record.primarySourceUrl).match(/!1s0x[a-f0-9]+:(0x[a-f0-9]+)/i);
    if (!feature || BigInt(feature[1]).toString() !== record.cid || !Number.isFinite(Date.parse(record.observedAt))) throw new Error('Review extension source does not prove the Google identity.');
    if (!Array.isArray(record.reviews) || !record.reviews.length) throw new Error('A review extension must contain observed comments.');
    lead.google.reviewExtension = { cid: record.cid, reviews: record.reviews.map(review => {
      if (!review.author || !review.quote || !review.publishedLabel || !review.reviewId || review.originalLanguage !== 'nl' || !Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) throw new Error('Invalid observed review extension.');
      if (review.translation?.isTranslation !== true || review.translation?.provider !== 'editorial translation' || !review.translation?.en) throw new Error('Review extension requires an attributed translation.');
      if (review.excerpt && !review.quote.startsWith(review.excerpt)) throw new Error('Review excerpt must preserve the original words.');
      const dateEn = review.publishedLabel.replace(/^Bewerkt: /, 'Edited: ').replace(/een jaar geleden$/, '1 year ago').replace(/(\d+) jaar geleden$/, '$1 years ago');
      return { authorName: review.author, authorUrl: googleUrl(review.authorUrl), photoUrl: review.photoUrl ? googleUrl(review.photoUrl, 'photo') : null, rating: review.rating, text: review.quote, displayText: review.excerpt || review.quote, originalLanguage: review.originalLanguage, translations: { en: review.translation.en }, translationProvider: review.translation.provider, publishedLabel: review.publishedLabel, publishedLabels: { nl: review.publishedLabel, en: dateEn }, reviewId: review.reviewId, isExcerpt: review.isExcerpt === true, sourceUrl: record.primarySourceUrl, observedAt: record.observedAt };
    }) };
  }
  reviewExtensionSha256 = createHash('sha256').update(rawExtension).digest('hex');
} catch (error) { if (error.code !== 'ENOENT') throw error; }
// Keep the earlier evidence immutable; a complete new selection is versioned
// separately and is authoritative only when both ten-business cohorts exist.
const fiveSources = ['google-five-food-2026-10-05.json', 'google-five-beauty-2026-10-05.json'];
const fiveReads = await Promise.allSettled(fiveSources.map(file => fs.readFile(path.join(packet, file), 'utf8')));
const fiveReviewSourceSha256 = {};
if (fiveReads.some(result => result.status === 'fulfilled')) {
  if (fiveReads.some(result => result.status === 'rejected')) throw new Error('Both complete five-review cohorts are required before regenerating the campaign.');
  const seenBusinesses = new Set();
  const relativeEnglish = value => value.replace(/^Bewerkt: /, 'Edited: ').replace(/\b(een|\d+) (jaar|jaren|maand|maanden|week|weken|dag|dagen|uur|uren|minuut|minuten) geleden\b/g, (_, amount, unit) => {
    const count = amount === 'een' ? 1 : Number(amount);
    const translated = { jaar: 'year', jaren: 'year', maand: 'month', maanden: 'month', week: 'week', weken: 'week', dag: 'day', dagen: 'day', uur: 'hour', uren: 'hour', minuut: 'minute', minuten: 'minute' }[unit];
    return count + ' ' + translated + (count === 1 ? '' : 's') + ' ago';
  }).replace(/^gisteren$/i, 'Yesterday').replace(/^vandaag$/i, 'Today');
  const googleEvidenceUrl = (value, kind) => {
    const url = new URL(value);
    const allowed = kind === 'photo' ? url.hostname.endsWith('.googleusercontent.com') : url.hostname === 'www.google.com' && url.pathname.startsWith(kind === 'author' ? '/maps/contrib/' : '/maps/');
    if (url.protocol !== 'https:' || !allowed) throw new Error('Unexpected five-review evidence URL.');
    return value;
  };
  for (let sourceIndex = 0; sourceIndex < fiveSources.length; sourceIndex++) {
    const raw = fiveReads[sourceIndex].value, source = JSON.parse(raw);
    if (source.schemaVersion !== 1 || source.primaryUiObserved !== true || !Array.isArray(source.businesses) || source.businesses.length !== 10) throw new Error('Five-review cohorts need ten businesses observed in primary UI.');
    fiveReviewSourceSha256[fiveSources[sourceIndex]] = createHash('sha256').update(raw).digest('hex');
    for (const record of source.businesses) {
      const lead = businesses.find(item => item.id === record.leadId);
      if (!lead || seenBusinesses.has(record.leadId) || lead.name !== record.businessName || lead.google.cid !== record.cid) throw new Error('Five-review business identity mismatch.');
      if (lead.family !== (sourceIndex === 0 ? 'restaurants' : 'salon')) throw new Error('Five-review cohort family mismatch.');
      seenBusinesses.add(record.leadId);
      const feature = googleEvidenceUrl(record.primarySourceUrl, 'source').match(/!1s0x[a-f0-9]+:(0x[a-f0-9]+)/i);
      if (!feature || BigInt(feature[1]).toString() !== record.cid || !Number.isFinite(Date.parse(record.observedAt))) throw new Error('Five-review source does not prove its business identity.');
      if (!Array.isArray(record.reviews) || record.reviews.length !== 5) throw new Error('Each current selection must have exactly five observed comments.');
      const reviewIds = new Set();
      const reviews = record.reviews.map(review => {
        if (!review.author || !review.quote || !review.publishedLabel || !review.reviewId || reviewIds.has(review.reviewId) || !['nl', 'en'].includes(review.originalLanguage) || !Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) throw new Error('Invalid five-review primary observation.');
        reviewIds.add(review.reviewId);
        const target = review.originalLanguage === 'nl' ? 'en' : 'nl';
        if (review.translation?.isTranslation !== true || review.translation?.provider !== 'editorial translation' || !review.translation[target]) throw new Error('Five-review observations need a labelled translation.');
        if (review.excerpt && !review.quote.startsWith(review.excerpt)) throw new Error('Five-review excerpts must preserve the original words.');
        return { authorName: review.author, authorUrl: googleEvidenceUrl(review.authorUrl, 'author'), photoUrl: review.photoUrl ? googleEvidenceUrl(review.photoUrl, 'photo') : null, rating: review.rating, text: review.quote, displayText: review.excerpt || review.quote, originalLanguage: review.originalLanguage, translations: { [target]: review.translation[target] }, translationProvider: review.translation.provider, publishedLabel: review.publishedLabel, publishedLabels: { nl: review.publishedLabels?.nl || review.publishedLabel, en: review.publishedLabels?.en || relativeEnglish(review.publishedLabel) }, reviewId: review.reviewId, isExcerpt: review.isExcerpt === true, sourceUrl: record.primarySourceUrl, observedAt: record.observedAt };
      });
      // Feature the strongest observed scores first without changing or hiding
      // any of the five selected reviews; preserve source order for tied scores.
      reviews.sort((a, b) => b.rating - a.rating);
      lead.google.reviewSnapshot = { cid: record.cid, observedAt: record.observedAt, selectionOrder: 'rating-descending-stable', reviews };
    }
  }
  if (seenBusinesses.size !== 20) throw new Error('The five-review selection must cover all twenty campaign businesses.');
} else {
  for (const result of fiveReads) if (result.reason?.code !== 'ENOENT') throw result.reason;
}
const model = { schemaVersion: 1, generatedAt: Object.keys(fiveReviewSourceSha256).length ? '2026-10-05' : '2026-10-04', manifestSha256: createHash('sha256').update(rawManifest).digest('hex'), reviewSnapshotSha256, reviewExtensionSha256, fiveReviewSourceSha256, businesses };
const errors = validateModel(model); if (errors.length) throw new Error(errors.join('\n'));
await fs.writeFile(path.join(here, 'business-data.json'), JSON.stringify(model, null, 2) + '\n');
console.log(JSON.stringify({ businesses: businesses.length, families: businesses.reduce((counts, lead) => ({ ...counts, [lead.family]: (counts[lead.family] || 0) + 1 }), {}), publicContactEmailIncluded: false, privateCampaignFilesCopied: false }));
