import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createOpaqueRegistry, makeLeadLinks } from './opaque-routes.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const model = JSON.parse(await fs.readFile(path.join(here, 'business-data.json'), 'utf8'));
const inventory = JSON.parse(await fs.readFile(path.resolve(here, '../../deliverables/leads/leads-acumulados.json'), 'utf8'));
const leadIds = inventory.campaignStock?.uncontactedIds;
if (!Array.isArray(leadIds) || leadIds.length !== 100) throw new Error('The approved future campaign contains exactly 100 inventory IDs.');
const contacted = new Set((inventory.records || []).filter(item => item.campaignPreviouslyContacted === true).map(item => item.id));
if (leadIds.some(id => contacted.has(id))) throw new Error('Sent campaign businesses must retain their legacy URLs.');
const filename = path.join(here, 'opaque-routes.json');
let previous = null;
try { previous = JSON.parse(await fs.readFile(filename, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const registry = createOpaqueRegistry(model, leadIds, previous);
await fs.writeFile(filename, JSON.stringify(registry, null, 2) + '\n', {flag: previous ? 'w' : 'wx'});
await fs.writeFile(path.join(here, 'lead-links.json'), JSON.stringify(makeLeadLinks(registry, model), null, 2) + '\n');
console.log(JSON.stringify({futureLeads: registry.reservations.length, active: registry.reservations.filter(item => item.ready).length,
  reserved: registry.reservations.filter(item => !item.ready).length, routes: registry.records.length, tokensPreserved: !!previous}));
