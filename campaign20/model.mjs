export const LANGUAGES = ['en', 'nl'];
export const THEME_IDS = { restaurants: ['R1', 'R2', 'R3', 'R4', 'R5'], salon: ['B1', 'B2', 'B3', 'B4', 'B5'] };

export function resolveContext(model, search) {
  const query = search instanceof URLSearchParams ? search : new URLSearchParams(search);
  const requestedLead = query.get('lead');
  const lead = requestedLead ? model.businesses.find(item => item.id === requestedLead) : model.businesses[0];
  if (requestedLead && !lead) throw new Error('Unknown campaign business ID.');
  if (!lead) throw new Error('The campaign has no configured business.');
  const allowed = THEME_IDS[lead.family];
  const theme = allowed.includes(query.get('theme')) ? query.get('theme') : lead.defaultTheme;
  return { lead, theme, lang: LANGUAGES.includes(query.get('lang')) ? query.get('lang') : 'nl', view: ['booking', 'faq', 'thanks'].includes(query.get('view')) ? query.get('view') : 'home', serviceId: bookingServices(lead).some(service => service.id === query.get('service')) ? query.get('service') : null };
}

export function contextUrl(base, context, view = 'home') {
  const url = new URL(base);
  url.search = '';
  url.hash = '';
  url.searchParams.set('lead', context.lead.id);
  url.searchParams.set('theme', context.theme);
  url.searchParams.set('lang', context.lang);
  if (view !== 'home') url.searchParams.set('view', view);
  if (view === 'booking' && bookingServices(context.lead).some(service => service.id === context.serviceId)) url.searchParams.set('service', context.serviceId);
  return url;
}

// These are request intentions rather than invented treatments, table policies,
// prices or availability. Specific variants use the preserved business evidence.
export function bookingServices(lead) {
  if (lead.family === 'salon') return [
    { id: 'appointment', title: { en: lead.id === 'NLEX100N-119' ? 'Barber appointment' : 'Hair appointment', nl: 'Kappersafspraak' } },
    { id: 'consultation', title: { en: 'Discuss my wishes', nl: 'Mijn wensen bespreken' } }
  ];
  if (lead.id === 'NLEX100N-156') return [{ id: 'visit', title: { en: 'Visit the fish kiosk', nl: 'De viskiosk bezoeken' } }];
  if (lead.id === 'NLE100S-058') return [
    { id: 'visit', title: { en: 'Visit the café', nl: 'Het café bezoeken' } },
    { id: 'event-visit', title: { en: 'Visit for live music', nl: 'Bezoek voor livemuziek' } }
  ];
  if (lead.groupId === 'ice-cream') return [{ id: 'visit', title: { en: lead.id === 'NLEZ2-201' ? 'Visit the seasonal stall' : 'Visit for ice cream', nl: lead.id === 'NLEZ2-201' ? 'De seizoenskraam bezoeken' : 'Langskomen voor ijs' } }];
  return [{ id: 'visit', title: { en: 'Plan a visit', nl: 'Een bezoek plannen' } }];
}

export const CONFIRMATION_TTL = 15 * 60 * 1000;
export function confirmationKey(context) { return 'ocimatik-campaign-request-v1:' + context.lead.id + ':' + context.lead.google.cid; }
const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && Number.isFinite(Date.parse(value + 'T12:00:00Z')) && new Date(value + 'T12:00:00Z').toISOString().slice(0, 10) === value;
export function confirmationSummary(context, data, now = Date.now()) {
  if (data?.leadId !== context.lead.id || data?.cid !== context.lead.google.cid || !['booking', 'enquiry'].includes(data.kind || 'booking')) throw new Error('Invalid business request summary.');
  const kind = data.kind || 'booking';
  if (kind === 'booking' && (!validDate(data.date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(data.time || '') || !bookingServices(context.lead).some(service => service.id === data.serviceId))) throw new Error('Invalid business request summary.');
  return { version: 1, leadId: context.lead.id, cid: context.lead.google.cid, kind, date: kind === 'booking' ? data.date : null, time: kind === 'booking' ? data.time : null, serviceId: kind === 'booking' ? data.serviceId : null, createdAt: now };
}
export function readConfirmation(context, raw, now = Date.now()) {
  try {
    const data = JSON.parse(raw);
    if (data?.version !== 1 || !Number.isFinite(data.createdAt) || now < data.createdAt || now - data.createdAt > CONFIRMATION_TTL) return null;
    return confirmationSummary(context, data, data.createdAt);
  } catch { return null; }
}

export function validateModel(model) {
  const issues = [];
  if (model.schemaVersion !== 1 || model.businesses.length !== 20) issues.push('Exactly twenty campaign businesses are required.');
  const ids = new Set(), cids = new Set();
  for (const business of model.businesses) {
    if (ids.has(business.id)) issues.push('Duplicate business ID: ' + business.id);
    if (cids.has(business.google.cid)) issues.push('Duplicate Google CID: ' + business.id);
    ids.add(business.id); cids.add(business.google.cid);
    if (!/^[1-9]\d+$/.test(business.google.cid || '')) issues.push('Missing decimal CID: ' + business.id);
    if (!business.name || !business.address || !business.google.mapsUrl) issues.push('Missing public identity: ' + business.id);
    if (!(business.google.reviewCount > 10) || !(business.google.rating > 0 && business.google.rating <= 5)) issues.push('Missing corroborated Google summary: ' + business.id);
    if (!THEME_IDS[business.family]?.includes(business.defaultTheme)) issues.push('Theme-family mismatch: ' + business.id);
    if (!Array.isArray(business.confirmedServices)) issues.push('Missing service provenance: ' + business.id);
    if (business.tableReservationEnabled !== false) issues.push('Do not introduce unconfirmed table reservations: ' + business.id);
    const extension = business.google.reviewExtension;
    if (extension) {
      if (extension.cid !== business.google.cid || !Array.isArray(extension.reviews) || !extension.reviews.length) issues.push('Review extension identity mismatch: ' + business.id);
      for (const review of Array.isArray(extension.reviews) ? extension.reviews : []) {
        if (!review.authorName || !review.text || !review.sourceUrl || !review.observedAt || !Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) issues.push('Invalid review extension: ' + business.id);
      }
    }
    const snapshot = business.google.reviewSnapshot;
    if (snapshot) {
      if (snapshot.cid !== business.google.cid || !Array.isArray(snapshot.reviews) || snapshot.reviews.length !== 5 || !Number.isFinite(Date.parse(snapshot.observedAt))) issues.push('Five-review snapshot identity mismatch: ' + business.id);
      const unique = new Set();
      for (const review of Array.isArray(snapshot.reviews) ? snapshot.reviews : []) {
        const target = review.originalLanguage === 'nl' ? 'en' : 'nl';
        if (!review.authorName || !review.text || !review.sourceUrl || !review.reviewId || unique.has(review.reviewId) || !['en', 'nl'].includes(review.originalLanguage) || !review.translations?.[target] || !Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) issues.push('Invalid five-review snapshot: ' + business.id);
        unique.add(review.reviewId);
      }
    }
    for (const key of ['contact', 'publicEmails', 'email', 'marketingPermission', 'inventory']) {
      if (Object.hasOwn(business, key)) issues.push('Private campaign metadata must not be bundled: ' + key);
    }
  }
  return issues;
}
