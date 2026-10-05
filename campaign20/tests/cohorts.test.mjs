import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { mergeCampaignCohort } from '../merge-cohort.mjs';
import { validateModel, resolveContext, contextUrl, THEME_IDS } from '../model.mjs';

const sourceUrl = new URL('../business-data.json', import.meta.url);
const originalBytes = await fs.readFile(sourceUrl);
const current = JSON.parse(originalBytes);
const legacyCohort = current.cohorts?.find(cohort => cohort.id === 'J1-legacy');
const legacyIds = new Set(legacyCohort?.leadIds || current.businesses.map(business => business.id));
const original = { ...current, businesses: current.businesses.filter(business => legacyIds.has(business.id)) };
delete original.cohorts; delete original.cohortEvidenceSha256;
assert.equal(original.businesses.length, 20, 'The frozen original cohort must remain twenty businesses');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

// Isolated synthetic fixtures are never written to the live campaign model.
function fixture(count = 20, cohortId = 'J2-2026-10-06') {
  const businesses = [], evidence = [];
  for (let index = 0; index < count; index++) {
    const cid = String(1234500000000000n + BigInt(index)), id = 'fixture-J2-' + index;
    const featureId = '0x123456:' + '0x' + BigInt(cid).toString(16);
    const primarySourceUrl = 'https://www.google.com/maps/place/CohortFixture/data=!1s' + featureId;
    const business = {
      id, name: 'Synthetic fixture ' + index, address: 'Fixture Street ' + index,
      locality: 'Fixture', family: index === count - 1 ? 'salon' : 'restaurants',
      defaultTheme: index === count - 1 ? 'B1' : 'R1', groupId: 'fixture',
      actualSector: 'fixture', actualSubtype: 'fixture', confirmedServices: [], tableReservationEnabled: false, phone: null,
      google: { cid, featureId, placeId: null, mapsUrl: 'https://www.google.com/maps/?cid=' + cid, rating: 4.5, reviewCount: 11, observedAt: '2026-10-05T12:00:00Z', identitySourceUrl: primarySourceUrl },
      media: { asset: 'restaurant-cover.webp', attribution: 'design-reference', verifiedBusinessPhoto: false },
    };
    businesses.push(business);
    evidence.push({
      leadId: id, businessName: business.name, cid, primarySourceUrl, observedAt: '2026-10-05T12:00:00Z',
      reviews: Array.from({ length: 5 }, (_, reviewIndex) => ({
        author: 'Fixture author ' + index + '-' + reviewIndex,
        authorUrl: 'https://www.google.com/maps/contrib/' + (1000000 + index * 5 + reviewIndex) + '/reviews',
        photoUrl: null, rating: 5, quote: 'Synthetic fixture quote ' + reviewIndex,
        publishedLabel: 'een week geleden', reviewId: 'fixture-review-' + index + '-' + reviewIndex,
        originalLanguage: 'nl', translation: { isTranslation: true, provider: 'editorial translation', en: 'Synthetic translation ' + reviewIndex },
      })),
    });
  }
  return { schemaVersion: 1, cohortId, expectedCount: count, businesses, reviewEvidence: { schemaVersion: 1, primaryUiObserved: true, businesses: evidence } };
}

test('legacy schema-one still requires exactly the original twenty businesses', () => {
  assert.deepEqual(validateModel(original), []);
  assert.ok(validateModel({ ...original, businesses: original.businesses.slice(1) }).some(issue => issue.includes('Exactly twenty')));
  assert.deepEqual(validateModel(null), ['Invalid campaign model.']);
  assert.deepEqual(validateModel({ schemaVersion: 1, businesses: null }), ['Invalid campaign model.']);
});

test('an explicit 19-food 1-salon addition preserves all original business values and five reviews', async () => {
  const before = JSON.stringify(original), input = fixture(), inputBefore = JSON.stringify(input);
  const merged = mergeCampaignCohort(original, input);
  assert.equal(merged.businesses.length, 40);
  assert.deepEqual(merged.cohorts.map(cohort => [cohort.id, cohort.expectedCount]), [['J1-legacy', 20], ['J2-2026-10-06', 20]]);
  assert.equal(merged.businesses.slice(20).filter(business => business.family === 'restaurants').length, 19);
  assert.equal(merged.businesses.slice(20).filter(business => business.family === 'salon').length, 1);
  assert.equal(JSON.stringify(original), before);
  assert.equal(JSON.stringify(input), inputBefore);
  for (let index = 0; index < 20; index++) {
    assert.strictEqual(merged.businesses[index], original.businesses[index]);
    assert.strictEqual(merged.businesses[index].google.reviewSnapshot, original.businesses[index].google.reviewSnapshot);
  }
  assert.deepEqual(validateModel(merged), []);
  assert.equal(hash(await fs.readFile(sourceUrl)), hash(originalBytes), 'The live file was not rewritten');
});

test('all prior and added routes keep their identity across language and five-theme choices', () => {
  const merged = mergeCampaignCohort(original, fixture());
  for (const business of merged.businesses) for (const theme of THEME_IDS[business.family]) for (const lang of ['en', 'nl']) {
    const context = resolveContext(merged, '?lead=' + business.id + '&theme=' + theme + '&lang=' + lang);
    assert.strictEqual(context.lead, business);
    const url = contextUrl('https://example.test/pitch/', context, 'booking');
    assert.equal(url.searchParams.get('lead'), business.id);
    assert.equal(url.searchParams.get('theme'), theme);
    assert.equal(url.searchParams.get('lang'), lang);
  }
});

test('further cohorts append without changing previous cohorts or their objects', () => {
  const first = mergeCampaignCohort(original, fixture()), next = fixture(1, 'J3-2026-10-07');
  next.businesses[0].id = 'fixture-J3-0';
  next.businesses[0].google.cid = '2234500000000000';
  next.businesses[0].google.featureId = '0x123456:0x' + BigInt(next.businesses[0].google.cid).toString(16);
  next.businesses[0].google.mapsUrl = 'https://www.google.com/maps/?cid=' + next.businesses[0].google.cid;
  const evidence = next.reviewEvidence.businesses[0];
  evidence.leadId = next.businesses[0].id; evidence.cid = next.businesses[0].google.cid;
  evidence.primarySourceUrl = 'https://www.google.com/maps/place/Fixture/data=!1s' + next.businesses[0].google.featureId;
  const second = mergeCampaignCohort(first, next);
  assert.equal(second.businesses.length, 41);
  for (let index = 0; index < 40; index++) assert.strictEqual(second.businesses[index], first.businesses[index]);
  assert.strictEqual(second.cohorts[0], first.cohorts[0]);
  assert.strictEqual(second.cohorts[1], first.cohorts[1]);
  assert.deepEqual(validateModel(second), []);
});

test('explicit cohort metadata rejects gaps, unknown IDs, count changes and repeated membership', () => {
  const merged = mergeCampaignCohort(original, fixture());
  const mutations = [
    value => { value.cohorts = []; },
    value => { value.cohorts = null; },
    value => { value.cohorts[1].id = value.cohorts[0].id; },
    value => { value.cohorts[1].leadIds[0] = value.cohorts[0].leadIds[0]; },
    value => { value.cohorts[1].leadIds[0] = 'unknown'; },
    value => { value.cohorts[1].leadIds.pop(); },
    value => { value.cohorts[1].expectedCount = 19; },
    value => { value.cohorts[1].leadIds[0] = null; },
    value => { delete value.businesses[20].google.reviewSnapshot; },
  ];
  for (const mutation of mutations) { const changed = structuredClone(merged); mutation(changed); assert.ok(validateModel(changed).length); }
});

test('cohort merge cannot replace an existing ID, CID or cohort', () => {
  const sameId = fixture(); sameId.businesses[0].id = original.businesses[0].id;
  assert.throws(() => mergeCampaignCohort(original, sameId), /must not replace/);
  const sameCid = fixture(); sameCid.businesses[0].google.cid = original.businesses[0].google.cid;
  assert.throws(() => mergeCampaignCohort(original, sameCid), /must be unique/);
  const base = mergeCampaignCohort(original, fixture()), again = fixture(1, 'J2-2026-10-06');
  // The duplicate cohort is rejected even if its business would otherwise be new.
  again.businesses[0].id = 'other'; again.reviewEvidence.businesses[0].leadId = 'other';
  again.businesses[0].google.cid = '3234500000000000';
  again.businesses[0].google.featureId = '0x123456:0x' + BigInt(again.businesses[0].google.cid).toString(16);
  again.businesses[0].google.mapsUrl = 'https://www.google.com/maps/?cid=' + again.businesses[0].google.cid;
  again.reviewEvidence.businesses[0].cid = again.businesses[0].google.cid;
  again.reviewEvidence.businesses[0].primarySourceUrl = 'https://www.google.com/maps/place/Fixture/data=!1s' + again.businesses[0].google.featureId;
  assert.throws(() => mergeCampaignCohort(base, again), /cohort ID already exists/);
});

test('new cohorts require complete primary five-review evidence and labelled translations', () => {
  const mutations = [
    value => { value.expectedCount = 21; },
    value => { value.reviewEvidence.primaryUiObserved = false; },
    value => { value.reviewEvidence.businesses.pop(); },
    value => { value.reviewEvidence.businesses[1] = structuredClone(value.reviewEvidence.businesses[0]); },
    value => { value.reviewEvidence.businesses[0].businessName = 'Other business'; },
    value => { value.reviewEvidence.businesses[0].cid = '1'; },
    value => { value.reviewEvidence.businesses[0].primarySourceUrl = value.reviewEvidence.businesses[1].primarySourceUrl; },
    value => { value.reviewEvidence.businesses[0].observedAt = 'invalid'; },
    value => { value.reviewEvidence.businesses[0].reviews.pop(); },
    value => { value.reviewEvidence.businesses[0].reviews[4] = structuredClone(value.reviewEvidence.businesses[0].reviews[0]); },
    value => { value.reviewEvidence.businesses[0].reviews[4].authorUrl = value.reviewEvidence.businesses[0].reviews[0].authorUrl; },
    value => { value.reviewEvidence.businesses[0].reviews[0].translation = { en: 'Unlabelled' }; },
    value => { value.reviewEvidence.businesses[0].reviews[0].rating = 6; },
    value => { value.reviewEvidence.businesses[0].reviews[0].quote = ' '; },
    value => { value.reviewEvidence.businesses[0].reviews[0].authorUrl = 'https://example.test/person'; },
    value => { value.reviewEvidence.businesses[0].reviews[0].photoUrl = 'https://example.test/portrait'; },
  ];
  for (const mutation of mutations) { const changed = fixture(); mutation(changed); assert.throws(() => mergeCampaignCohort(original, changed)); }
});

test('different observed Google contributor profiles may share a display name without becoming a duplicate', () => {
  const input = fixture();
  input.reviewEvidence.businesses[0].reviews[4].author = input.reviewEvidence.businesses[0].reviews[0].author;
  const merged = mergeCampaignCohort(original, input);
  assert.deepEqual(validateModel(merged), []);
  const duplicated = structuredClone(merged);
  duplicated.businesses[20].google.reviewSnapshot.reviews[4].authorUrl = duplicated.businesses[20].google.reviewSnapshot.reviews[0].authorUrl;
  assert.ok(validateModel(duplicated).some(issue => issue.includes('Invalid five-review snapshot')));
});

test('structured review context, original scores and native source identity survive the merge', () => {
  const input = fixture();
  const evidence = input.reviewEvidence.businesses[0];
  // A preceding nearby-building !5s marker must not override the observed !1s business ID.
  evidence.primarySourceUrl = evidence.primarySourceUrl.replace('data=', 'data=!5s0x123:0x456');
  const review = evidence.reviews[0];
  review.author = 'John Vd ham'; review.quote = 'Super leuk dat idee';
  review.quoteContext = { nl: 'Kindvriendelijkheid', en: 'Child friendliness' };
  review.translation.en = 'Child friendliness: Such a nice idea';
  review.nativeReviewId = review.reviewId; review.reviewIdType = 'native-google-review-id';
  evidence.reviews[1].rating = 1;
  const snapshot = mergeCampaignCohort(original, input).businesses[20].google.reviewSnapshot;
  const selected = snapshot.reviews.find(item => item.authorName === 'John Vd ham');
  assert.equal(selected.text, 'Super leuk dat idee');
  assert.equal(selected.displayText, 'Kindvriendelijkheid: Super leuk dat idee');
  assert.deepEqual(selected.quoteContext, review.quoteContext);
  assert.equal(selected.translations.en, 'Child friendliness: Such a nice idea');
  assert.equal(selected.nativeReviewId, review.nativeReviewId);
  assert.equal(selected.sourceAttribution.cid, evidence.cid);
  assert.equal(selected.sourceAttribution.primarySourceUrl, evidence.primarySourceUrl);
  assert.equal(snapshot.reviews.at(-1).rating, 1);
});

test('private email, research, credentials and unlisted public fields cannot enter an expanded payload', () => {
  const mutations = [
    value => { value.businesses[0].email = 'private@example.test'; },
    value => { value.businesses[0].notes = 'Private lead notes'; },
    value => { value.businesses[0].google.secret = 'hidden'; },
    value => { value.businesses[0].google.identitySourceUrl = 'https://example.test/?email=private@example.test'; },
    value => { value.businesses[0].media.asset = 'new-download.webp'; },
    value => { value.reviewEvidence.businesses[0].reviews[0].translation.en = 'RESEND_API_KEY=secret'; },
    value => { value.businesses[0].confirmedServices = [{ value: 'Unproven service' }]; },
  ];
  for (const mutation of mutations) { const changed = fixture(); mutation(changed); assert.throws(() => mergeCampaignCohort(original, changed)); }
});
