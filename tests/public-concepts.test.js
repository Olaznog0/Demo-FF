'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const registry=require('../public-client-config.js'),C=require('../core.js');
const folders={bloom:'salon',brasa:'restaurants',lumen:'dentists',northline:'accountants',brightmove:'movers'};

test('public registry contains five fictional clients and rejects private business IDs',()=>{
 assert.deepEqual(Object.keys(registry.clients).sort(),Object.keys(folders).sort());
 assert.equal(registry.defaultClient,'bloom');
 for(const id of ['ayden','fogon','dental','accounting','moving','ff'])assert.throws(()=>C.resolve(registry,'?client='+id));
 const serialized=JSON.stringify(registry);
 assert(!/Ayden|Fogon|Petit|Axis Administraties|Max Verhuis|Pletterijkade|Van Heutszstraat|ChIJ|googleusercontent|ubereats|\+31\d{8,10}/i.test(serialized));
});

for(const [id,folder] of Object.entries(folders))test(`${id} keeps public data, maps and forms isolated from live business integrations`,()=>{
 const c=registry.clients[id];
 assert.strictEqual(require('../concepts/'+folder+'/config.js'),c);
 assert.equal(c.concept.fictional,true);
 assert.equal(c.proof,null);
 assert.equal(c.google.enabled,false);
 assert.equal(c.google.placeId,'');
 assert.equal(c.google.snapshot,undefined);
 assert.equal(c.google.resolvePlaceId,false);
 assert.equal(c.calendar.mode,'demo');
 assert.equal(c.contact.mode,'demo');
 assert.equal(c.contact.confirmed,false);
 assert.equal(c.business.phone,'');
 assert.equal(c.business.mapsUrl,'');
 assert.equal(c.business.coordinates,null);
 assert.deepEqual(c.sources,[]);
 assert.equal(c.homePage,`concepts/${folder}/index.html`);
 assert.equal(c.map.query,'Peace Palace, Carnegieplein 2, The Hague');
 assert(!c.map.query.includes(c.name));
 assert(c.map.source.startsWith('https://www.vredespaleis.nl/'));
 assert.deepEqual(c.languages,['nl','en']);
 for(const value of [...Object.values(c.copy),...Object.values(c.ui)]){
  assert.equal(typeof value.nl,'string');assert(value.nl.length>0);
  assert.equal(typeof value.en,'string');assert(value.en.length>0);
  assert.deepEqual(Object.keys(value).sort(),['en','nl']);
 }
 for(const lang of c.languages)assert.equal(C.resolve(registry,`?client=${id}&lang=${lang}`).lang,lang);
 assert.equal(C.resolve(registry,`?client=${id}&lang=es`).lang,'nl');
 assert(c.feedback.length>=3);
 for(const person of c.feedback){
  assert(person.initials);assert(person.text.nl);assert(person.text.en);
  assert.equal(person.rating,undefined);assert.equal(person.googleMapsUri,undefined);assert.equal(person.profilePhotoUrl,undefined);
 }
});

test('public hero imagery is distinct, local and available without private URLs',()=>{
 const images=Object.values(registry.clients).map(c=>c.images.hero);
 assert.equal(new Set(images).size,5);
 for(const src of images){
  assert(src.startsWith('/assets/'));assert(!/fogon|ayden|petit|axis/i.test(src));
  assert(fs.existsSync(path.join(__dirname,'..',src.slice(1))));
 }
});

test('restaurant example times remain inside its fictional opening hours',()=>{
 const c=registry.clients.brasa;
 assert.equal(c.calendar.tableReservation,true);
 for(let day=0;day<7;day++)assert.deepEqual(C.demoSlots(c,new Date(Date.UTC(2026,9,4+day,12))),['18:00','19:00','20:00']);
});

test('restaurant contact topics and actions reserve tables rather than individual dishes',()=>{
 const c=registry.clients.brasa;
 assert.deepEqual(c.contact.topics.map(topic=>topic.id),['table','other']);
 const dishIds=new Set(c.services.map(service=>service.id));
 assert(c.contact.topics.every(topic=>!dishIds.has(topic.id)));
 for(const language of c.languages){
  assert.equal(c.ui.learn[language],c.ui.book[language]);
  assert.match(c.ui.contactIntro[language],language==='en'?/table/i:/tafel/i);
  assert(!/appointment|afspraak/i.test(c.ui.contactIntro[language]));
 }
});
