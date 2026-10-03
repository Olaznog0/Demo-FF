'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const core=require('../core.js');
const sectors=[{folder:'dentists',file:'dental.js',global:'DentistConfig',id:'dental'},{folder:'accountants',file:'accounting.js',global:'AccountantConfig',id:'accounting'},{folder:'movers',file:'moving.js',global:'MovingConfig',id:'moving'}];
test('private and public brands share sector SVG symbols without stars or emoji',()=>{const pairs=[['ayden','bloom'],['dental','lumen'],['accounting','northline'],['moving','brightmove'],['fogon','brasa']];const icons=pairs.map(([privateId,publicId])=>{const icon=core.brandIcon({id:privateId});assert.equal(icon,core.brandIcon({id:publicId}));assert(icon.includes('viewBox="0 0 36 36"'));assert(icon.includes('aria-hidden="true"'));assert(!icon.includes('★'));return icon;});assert.equal(new Set(icons).size,5);});
test('all five Dutch business concepts expose only NL/EN with the same theme and two-line hero titles',()=>{
 const clients=[require('../client-config.js').clients.ayden,...sectors.map(sector=>require(`../sectors/${sector.folder}/config.js`)),require('../sectors/restaurants/el-fogon-latino/config.js')];
 for(const client of clients){
  assert.deepEqual(client.languages,['nl','en']);assert.equal(client.defaultLanguage,'nl');
  assert.equal(core.resolve({defaultClient:client.id,clients:{[client.id]:client}},'?client='+client.id+'&lang=es').lang,'nl');
  for(const lang of client.languages)assert.equal(client.copy.heroTitle[lang].split('\n').filter(Boolean).length,2);
  for(const value of Object.values(client.theme))assert.equal(typeof value,'string');
 }
});
test('business language controls show EN before NL without changing the default or registry',()=>{
 const registries=[require('../client-config.js'),require('../public-client-config.js')];
 for(const registry of registries)for(const client of Object.values(registry.clients)){
  const original=[...client.languages],defaultLanguage=client.defaultLanguage;
  const displayed=core.languageOrder(client.languages);
  if(displayed.includes('en')&&displayed.includes('nl'))assert(displayed.indexOf('en')<displayed.indexOf('nl'));
  assert.deepEqual(client.languages,original);assert.equal(client.defaultLanguage,defaultLanguage);
 }
});
for(const sector of sectors){
 const config=require(`../sectors/${sector.folder}/config.js`);
 test(`${sector.id} keeps its own identity and unconnected calendar/contact separate`,()=>{
  assert.equal(config.id,sector.id);assert.equal(config.calendar.mode,'demo');assert.equal(config.calendar.confirmed,false);assert.equal(config.contact.mode,'demo');assert.equal(config.whatsapp.enabled,false);assert(config.homePage.includes(sector.folder));
  if(config.business.address){assert(config.business.phone);assert(Number.isFinite(config.business.coordinates.lat));assert.equal(config.proof.checked,'2026-10-03');}
  for(const lang of config.languages){for(const value of Object.values(config.copy))assert(value[lang]);for(const service of config.services){assert(service.title[lang]);assert(service.description[lang]);assert.equal(service.durationMinutes,undefined);}}
 });
 test(`${sector.id} renders both locales with correctly scoped map, calendar and contact`,async()=>{
  for(const lang of ['nl','en']){
   const nodes=new Map();for(const id of ['skip','header','main','footer','reviews','photos'])nodes.set(id,{innerHTML:'',textContent:'',dataset:{},addEventListener(){}});
   const document={documentElement:{},getElementById:id=>nodes.get(id),querySelectorAll:()=>[]};
   const window={[sector.global]:structuredClone(config),SiteCore:core,addEventListener(){},SalonCarousel:{mount(){return {destroy(){}}}},ContactWidget:{mountAll({client,lang:locale}){assert.equal(client.id,sector.id);assert.equal(locale,lang);}}};
   const requests=[];
   const context=vm.createContext({window,document,location:{search:'?lang='+lang,origin:'http://localhost:4174'},URLSearchParams,URL,Intl,Date,AbortSignal,fetch(url){requests.push(String(url));return Promise.resolve({ok:false,status:503});}});
   vm.runInContext(fs.readFileSync(path.join(__dirname,'../sector-site.js'),'utf8'),context);
   vm.runInContext(fs.readFileSync(path.join(__dirname,'../sectors',sector.folder,sector.file),'utf8'),context);
   await new Promise(resolve=>setImmediate(resolve));
    const markup=nodes.get('main').innerHTML,header=nodes.get('header').innerHTML;
    assert(header.indexOf('lang="en"')<header.indexOf('lang="nl"'));
   assert.equal(document.documentElement.lang,lang);assert(markup.includes(core.escape(config.copy.heroIntro[lang])));assert(markup.includes('data-contact-widget'));assert(markup.includes('booking.html?client='+sector.id+'&amp;lang='+lang));assert(!markup.includes('visit-section'));assert(!markup.includes('F&F'));assert(!markup.includes('Kapsalon Ayden'));
   if(config.business.address){assert(markup.includes('<iframe'));assert(markup.includes(encodeURIComponent(config.business.coordinates.lat+','+config.business.coordinates.lng)));}else assert(!markup.includes('<iframe'));
   if(config.google.snapshot?.reviews?.length){const reviews=nodes.get('reviews').innerHTML;assert(reviews.includes(config.google.snapshot.reviews[0].authorName));assert(reviews.includes('Google Maps ·'));if(lang==='en')assert(!reviews.includes('geleden'));}
   for(const url of requests){assert.equal(new URL(url).searchParams.get('client'),sector.id);assert.equal(new URL(url).searchParams.get('lang'),lang);}
  }
 });
}
test('a dated review snapshot remains scoped and uses the original language without double translation',()=>{
 const c={id:'test',google:{snapshot:{clientId:'test',checked:'2026-10-03',rating:5,total:1,reviews:[{authorName:'Test fixture',text:'Good visit',language:'en',originalText:'Good visit',originalLanguage:'en',translations:{nl:'Goed bezoek'}}]}}};
 const nl=core.snapshotData(c,'nl');assert.equal(core.reviewCopy(nl.reviews[0],'nl').text,'Goed bezoek');assert.equal(core.reviewCopy(nl.reviews[0],'nl').translated,true);
 const en=core.snapshotData(c,'en');assert.equal(core.reviewCopy(en.reviews[0],'en').text,'Good visit');assert.equal(core.reviewCopy(en.reviews[0],'en').translated,false);
 c.id='another-business';assert.equal(core.snapshotData(c,'en'),null);
});
test('the moving route starter transfers bounded preferences to the existing contact form without sending',()=>{
 const config=structuredClone(require('../sectors/movers/config.js'));config.google.enabled=false;
 const handlers=new Map(),scrolled=[],focused=[],nodes=new Map();
 for(const id of ['skip','header','main','footer','reviews','photos','routeFrom','routeTo','routeDate'])nodes.set(id,{innerHTML:'',textContent:'',dataset:{},value:'',addEventListener(){}});
 nodes.set('contact',{scrollIntoView:options=>scrolled.push(options)});
 const tomorrow=core.futureDays({workingDays:[0,1,2,3,4,5,6]},new Date(),config.timeZone)[0].toISOString().slice(0,10);
 nodes.get('routeFrom').value='  Den Haag  ';nodes.get('routeTo').value='D'.repeat(110);nodes.get('routeDate').value=tomorrow;
 let valid=true;nodes.get('routeDate').reportValidity=()=>valid;
 const fields={movingFrom:{value:''},movingTo:{value:''},movingDate:{value:''},name:{focus:options=>focused.push(options)}};
 const form={elements:{namedItem:name=>fields[name]}},start={addEventListener:(event,handler)=>handlers.set(event,handler)};
 const document={documentElement:{dataset:{}},getElementById:id=>nodes.get(id),querySelectorAll:()=>[],querySelector:selector=>selector==='.route-start-button'?start:selector==='[data-contact-widget] form'?form:null};
 let requests=0;const window={SiteCore:core,addEventListener(){},matchMedia:()=>({matches:true}),SalonCarousel:{mount(){return {destroy(){}}}},ContactWidget:{mountAll(){}}};
 const context=vm.createContext({window,document,location:{origin:'http://localhost:4174'},URLSearchParams,URL,Intl,Date,AbortSignal,fetch(){requests++;throw Error('No request expected');}});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../sector-site.js'),'utf8'),context);window.SectorSite.render({client:config,lang:'en'});
 assert.equal(nodes.get('routeDate').min,tomorrow);assert.equal(nodes.get('main').innerHTML.match(/data-contact-widget/g).length,1);assert(!nodes.get('main').innerHTML.includes('<form'));
 handlers.get('click')();assert.equal(fields.movingFrom.value,'Den Haag');assert.equal(fields.movingTo.value.length,90);assert.equal(fields.movingDate.value,tomorrow);assert.equal(scrolled[0].behavior,'auto');assert.equal(focused.length,1);assert.equal(requests,0);
 valid=false;nodes.get('routeDate').value='2020-01-01';handlers.get('click')();assert.equal(scrolled.length,1);assert.equal(fields.movingDate.value,tomorrow);assert.equal(requests,0);
});
