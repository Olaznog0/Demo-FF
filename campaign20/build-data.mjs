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
const model = { schemaVersion: 1, generatedAt: '2026-10-04', manifestSha256: createHash('sha256').update(rawManifest).digest('hex'), reviewSnapshotSha256, businesses };
const errors = validateModel(model); if (errors.length) throw new Error(errors.join('\n'));
await fs.writeFile(path.join(here, 'business-data.json'), JSON.stringify(model, null, 2) + '\n');
console.log(JSON.stringify({ businesses: businesses.length, families: businesses.reduce((counts, lead) => ({ ...counts, [lead.family]: (counts[lead.family] || 0) + 1 }), {}), publicContactEmailIncluded: false, privateCampaignFilesCopied: false }));
