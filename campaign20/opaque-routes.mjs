// Private build-time registry. This file and its JSON are never public assets.
import { randomBytes } from 'node:crypto';
import { THEME_IDS, LANGUAGES, bookingServices, validateModel } from './model.mjs';

export const OPAQUE_PREFIX = '/start/';
export const TOKEN_BYTES = 18;
export const TOKEN_PATTERN = /^[A-Za-z0-9_-]{24}$/;
const VIEWS = ['home', 'booking', 'faq', 'thanks'];
const keys = new Set(['token', 'leadId', 'theme', 'lang', 'view', 'serviceId']);
const fail = message => { throw new Error(message); };
export const routeKey = route => JSON.stringify([route.leadId ?? route.lead?.id, route.theme, route.lang, route.view || 'home', route.view === 'booking' ? route.serviceId || null : null]);

function contexts(lead) {
  const routes = [];
  for (const theme of THEME_IDS[lead.family]) for (const lang of LANGUAGES) for (const view of VIEWS) {
    routes.push({leadId: lead.id, theme, lang, view, serviceId: null});
    if (view === 'booking') for (const service of bookingServices(lead)) routes.push({leadId: lead.id, theme, lang, view, serviceId: service.id});
  }
  return routes;
}

export function validateOpaqueRegistry(registry, model) {
  if (!registry || registry.schemaVersion !== 1 || registry.tokenBytes !== TOKEN_BYTES || registry.pathPrefix !== OPAQUE_PREFIX || !Array.isArray(registry.records) || !Array.isArray(registry.reservations)) fail('Invalid opaque campaign registry.');
  const businesses = new Map(model.businesses.map(lead => [lead.id, lead])), reserved = new Map(), used = new Set();
  for (const item of registry.reservations) {
    if (!item || typeof item.leadId !== 'string' || !item.leadId.trim() || reserved.has(item.leadId) || typeof item.ready !== 'boolean' || Object.keys(item).some(key => !['leadId', 'ready', 'homeTokens'].includes(key))) fail('Invalid or duplicate opaque reservation.');
    if (!item.homeTokens || Object.keys(item.homeTokens).sort().join(',') !== 'en,nl') fail('Every reservation needs both language tokens.');
    for (const token of Object.values(item.homeTokens)) {
      if (!TOKEN_PATTERN.test(token) || used.has(token)) fail('Invalid or duplicate opaque token.');
      used.add(token);
    }
    if (item.ready !== businesses.has(item.leadId)) fail('Reservation readiness must match an existing public business model.');
    reserved.set(item.leadId, item);
  }
  const seen = new Set(), tokenRecords = new Set(), expected = new Map();
  for (const [id, reservation] of reserved) if (reservation.ready) for (const route of contexts(businesses.get(id))) expected.set(routeKey(route), route);
  for (const record of registry.records) {
    if (!record || Object.keys(record).some(key => !keys.has(key)) || Object.keys(record).length !== keys.size || !TOKEN_PATTERN.test(record.token) || tokenRecords.has(record.token)) fail('Invalid or duplicate opaque route.');
    const key = routeKey(record), allowed = expected.get(key), lead = businesses.get(record.leadId), reservation = reserved.get(record.leadId);
    if (!allowed || !lead || !reservation?.ready || seen.has(key) || record.serviceId !== allowed.serviceId) fail('Unknown, duplicate or mismatched opaque context.');
    const reservedHome = record.view === 'home' && record.theme === lead.defaultTheme;
    if (reservedHome ? record.token !== reservation.homeTokens[record.lang] : used.has(record.token)) fail('An opaque token must identify exactly one campaign context.');
    seen.add(key); tokenRecords.add(record.token);
    if (!reservedHome) used.add(record.token);
  }
  if (seen.size !== expected.size) fail('Opaque registry must cover every active context.');
  return registry;
}

export function createOpaqueRegistry(model, leadIds, previous = null, generateToken = () => randomBytes(TOKEN_BYTES).toString('base64url')) {
  const issues = validateModel(model); if (issues.length) fail('A validated campaign model is required: ' + issues.join('; '));
  if (!Array.isArray(leadIds) || new Set(leadIds).size !== leadIds.length || leadIds.some(id => typeof id !== 'string' || !id.trim())) fail('Explicit, unique future campaign IDs are required.');
  if (previous) {
    // Validate its state against its own ready subset, then permit reservations
    // to become ready when new evidence-backed models have been appended.
    const ready = new Set(previous.reservations.filter(item => item.ready).map(item => item.leadId));
    validateOpaqueRegistry(previous, {...model, businesses: model.businesses.filter(lead => ready.has(lead.id))});
    if (previous.reservations.some(item => !leadIds.includes(item.leadId))) fail('Never discard an existing opaque reservation.');
  }
  const businesses = new Map(model.businesses.map(lead => [lead.id, lead]));
  const oldReservations = new Map((previous?.reservations || []).map(item => [item.leadId, item]));
  const oldRoutes = new Map((previous?.records || []).map(record => [routeKey(record), record]));
  const used = new Set([...(previous?.records || []).map(record => record.token), ...(previous?.reservations || []).flatMap(item => Object.values(item.homeTokens))]);
  const token = () => {
    for (let attempt = 0; attempt < 20; attempt++) {
      const value = generateToken(); if (!TOKEN_PATTERN.test(value)) fail('The token generator must provide 144-bit base64url tokens.');
      if (!used.has(value)) { used.add(value); return value; }
    }
    fail('The token generator repeatedly returned collisions.');
  };
  const reservations = [], records = [];
  for (const leadId of leadIds) {
    const lead = businesses.get(leadId), old = oldReservations.get(leadId);
    const item = {leadId, ready: !!lead, homeTokens: old ? {...old.homeTokens} : {en: token(), nl: token()}};
    reservations.push(item);
    if (!lead) continue;
    for (const context of contexts(lead)) {
      const existing = oldRoutes.get(routeKey(context));
      const selected = context.view === 'home' && context.theme === lead.defaultTheme ? item.homeTokens[context.lang] : existing?.token || token();
      records.push({token: selected, ...context});
    }
  }
  return validateOpaqueRegistry({schemaVersion: 1, tokenBytes: TOKEN_BYTES, pathPrefix: OPAQUE_PREFIX, reservations, records}, model);
}

export function findOpaqueRoute(registry, context) {
  return registry.records.find(record => routeKey(record) === routeKey(context)) || null;
}

export function makeLeadLinks(registry, model, origin = 'https://ocimatik.com') {
  validateOpaqueRegistry(registry, model);
  const target = new URL(origin); if (!['https:', 'http:'].includes(target.protocol) || target.username || target.password) fail('Invalid link origin.');
  const businesses = new Map(model.businesses.map(lead => [lead.id, lead]));
  return {schemaVersion: 1, records: registry.reservations.map(item => ({leadId: item.leadId, ready: item.ready, theme: businesses.get(item.leadId)?.defaultTheme || null,
    urls: Object.fromEntries(LANGUAGES.map(lang => [lang, new URL(OPAQUE_PREFIX + item.homeTokens[lang], target.origin).href]))}))};
}

export function compactOpaqueRegistry(registry, model) {
  validateOpaqueRegistry(registry, model);
  return registry.records.map(({token, leadId, theme, lang, view, serviceId}) => [token, leadId, theme, lang, view, serviceId]);
}

export function opaqueBootstrap(registry, token) {
  const current = registry.records.find(record => record.token === token); if (!current) return null;
  return {schemaVersion: 1, pathPrefix: OPAQUE_PREFIX, routes: registry.records.filter(record => record.leadId === current.leadId)};
}

export function renderOpaqueHtml(html, bootstrap) {
  const json = JSON.stringify(bootstrap).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return html.replace('<head>', '<head>\n<script type="application/json" id="campaign-route-context">' + json + '</script>')
    .replace(/\b(src|href)="\.\/([a-z0-9-]+\.(?:js|mjs|css)(?:\?[^"<>]*)?)"/g, (_all, name, file) => name + '="/start/_assets/' + file + '"');
}
