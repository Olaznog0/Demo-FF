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
  return { lead, theme, lang: LANGUAGES.includes(query.get('lang')) ? query.get('lang') : 'nl', view: query.get('view') === 'thanks' ? 'thanks' : 'home' };
}

export function contextUrl(base, context, view = 'home') {
  const url = new URL(base);
  url.search = '';
  url.hash = '';
  url.searchParams.set('lead', context.lead.id);
  url.searchParams.set('theme', context.theme);
  url.searchParams.set('lang', context.lang);
  if (view !== 'home') url.searchParams.set('view', view);
  return url;
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
    for (const key of ['contact', 'publicEmails', 'email', 'marketingPermission', 'inventory']) {
      if (Object.hasOwn(business, key)) issues.push('Private campaign metadata must not be bundled: ' + key);
    }
  }
  return issues;
}
