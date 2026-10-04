'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const pitches=require('../pitch-client-config.js'),core=require('../core.js'),root=path.resolve(__dirname,'..');
// Synthetic names and IDs below exist only in test memory, never in a served registry.
const fixture=(slot='salon-a',id='test-pitch-salon')=>({slot,id,name:'Test-only business',address:'Test-only address',city:'Test-only city',mapsUrl:'https://www.google.com/maps?cid=123456789',cid:'123456789',placeId:'test-place-id-123',verification:{checked:'2026-10-04',websiteStatus:'none-confirmed',sources:[{label:'Test-only identity and no-website evidence',url:'https://example.test/evidence'}]}});
test('the ten visual slots remain exactly two variants of each existing family',()=>{
 assert.equal(pitches.slots.length,10);
 for(const family of ['salon','restaurants','dentists','accountants','movers']){
  const slots=pitches.slots.filter(slot=>slot.family===family);assert.deepEqual(slots.map(slot=>slot.variant),['a','b']);
  const [first,second]=slots.map(slot=>pitches.themes[slot.id]);assert.notEqual(first.primary,second.primary);assert.notEqual(first.composition,second.composition);
 }
 const css=fs.readFileSync(path.join(root,'pitches/styles.css'),'utf8');for(const slot of pitches.slots)assert(css.includes('.pitch--'+slot.id),slot.id);
 assert.equal(pitches.readyClients().length,require('../pitch-businesses.js').length);
});
test('unverified businesses, Maps CID substitutions, duplicate assignments and cross-business snapshots cannot become pitches',()=>{
 assert.throws(()=>pitches.createClient({...fixture(),verification:{...fixture().verification,websiteStatus:'inconclusive'}}),/no-website evidence/);
 assert.throws(()=>pitches.createClient({...fixture(),verification:{...fixture().verification,websiteStatus:'broken-confirmed'}}),/normal-browser/);
 assert.throws(()=>pitches.createClient({...fixture(),verification:{...fixture().verification,websiteStatus:'broken-confirmed',normalBrowserVerified:true}}),/normal-browser/);
 const broken=pitches.createClient({...fixture(),verification:{...fixture().verification,websiteStatus:'broken-confirmed',normalBrowserVerified:true,commercialAlternativesNegative:true}});assert.equal(broken.pitch.websiteStatus,'broken-confirmed');
 assert.throws(()=>pitches.createClient({...fixture(),verification:{...fixture().verification,checked:'2026-99-99'}}),/no-website evidence/);
 assert.throws(()=>pitches.createClient({...fixture(),placeId:'123456789123456789'}),/CID/);
 assert.throws(()=>pitches.createClient({...fixture(),placeId:'',coordinates:null}),/Place ID or coordinates/);
 assert.throws(()=>pitches.createClient({...fixture(),id:'accounting'}),/reserved/);
 assert.throws(()=>pitches.buildRegistry([fixture(),{...fixture('salon-b','test-pitch-two')}]),/distinct business/);
 assert.throws(()=>pitches.buildRegistry([fixture(),{...fixture('salon-b','test-pitch-two'),placeId:'another-test-place',mapsUrl:'https://www.google.com/maps?cid=123456789&hl=en'}]),/distinct business/);
 assert.throws(()=>pitches.buildRegistry([fixture(),{...fixture('salon-a','test-pitch-two'),placeId:'another-test-place'}]),/Duplicate/);
 assert.throws(()=>pitches.createClient({...fixture(),snapshot:{clientId:'another-business',checked:'2026-10-04',reviews:[]}}),/different or undated/);
});
test('each assigned pitch starts without fabricated proof, feedback, hours or active writes and remains independently mutable',()=>{
 const first=pitches.createClient(fixture()),second=pitches.createClient({...fixture('salon-b','test-pitch-two'),placeId:'second-test-place'});
 assert.equal(first.proof,null);assert.equal(first.feedback,undefined);assert.equal(first.google.snapshot,undefined);assert.deepEqual(first.hours,[]);
 assert.equal(first.calendar.mode,'demo');assert.equal(first.calendar.confirmed,false);assert.equal(first.contact.mode,'demo');assert.equal(first.contact.confirmed,false);
 assert.deepEqual(first.languages,['nl','en']);assert.equal(first.homePage,'pitches/index.html');assert.equal(first.google.maxPhotos,6);
 first.services[0].title.nl='Test-only mutation';first.calendar.exampleSlots.push('12:45');assert.notEqual(second.services[0].title.nl,first.services[0].title.nl);assert(!second.calendar.exampleSlots.includes('12:45'));
 const coordinateClient=pitches.createClient({...fixture('movers-a','test-coordinate-pitch'),placeId:'',coordinates:{lat:52.1,lng:4.3}});assert.equal(coordinateClient.google.resolvePlaceId,true);
});

test('business-specific enquiries and bilingual FAQ stay separate from availability and integration activation',()=>{
 const faq=[{q:{nl:'Vraag één',en:'Question one'},a:{nl:'Antwoord één',en:'Answer one'}},{q:{nl:'Vraag twee',en:'Question two'},a:{nl:'Antwoord twee',en:'Answer two'}},{q:{nl:'Vraag drie',en:'Question three'},a:{nl:'Antwoord drie',en:'Answer three'}}];
 const business={...fixture('restaurants-a','test-restaurant'),calendar:{tableReservation:false,workingDays:[2,4,6],exampleSlots:['12:15','18:45']},faqContent:faq,ui:{book:{nl:'Plan je bezoek',en:'Plan your visit'},plan:{nl:'Plan je bezoek',en:'Plan your visit'}}};
 const client=pitches.createClient(business);assert.equal(client.calendar.tableReservation,false);assert.equal(client.calendar.mode,'demo');assert.equal(client.calendar.confirmed,false);assert.deepEqual(client.calendar.workingDays,[2,4,6]);assert.deepEqual(client.calendar.exampleSlots,['12:15','18:45']);assert.equal(client.ui.plan.en,'Plan your visit');
 for(const lang of ['nl','en']){assert.deepEqual(core.faqEntries(client,lang),faq.map(item=>({q:item.q[lang],a:item.a[lang]})));assert(core.faqMarkup(client,lang).includes('"inLanguage":"'+lang+'"'));}
 business.calendar.workingDays.push(1);faq[0].a.nl='Mutation';assert.deepEqual(client.calendar.workingDays,[2,4,6]);assert.equal(client.faqContent[0].a.nl,'Antwoord één');
 const table=pitches.createClient({...fixture('restaurants-b','test-table'),calendar:{tableReservation:true}});assert.equal(table.ui.plan.en,'Plan your table');assert.equal(pitches.createClient(fixture('restaurants-a','test-inquiry')).calendar.tableReservation,false);
 for(const calendar of [{mode:'api'},{confirmed:true},{tableReservation:'true'},{workingDays:[]},{workingDays:[7]},{exampleSlots:['25:00']}])assert.throws(()=>pitches.createClient({...fixture(),calendar}),/calendar overrides|tableReservation|workingDays|exampleSlots/);
 assert.throws(()=>pitches.createClient({...fixture(),calendar:{tableReservation:true}}),/restaurant/);assert.throws(()=>pitches.createClient({...fixture(),faqContent:faq.slice(0,2)}),/three questions/);assert.throws(()=>pitches.createClient({...fixture(),faqContent:[...faq.slice(0,2),{q:{nl:'Alleen NL'},a:{nl:'Alleen NL'}}]}),/NL and EN/);assert.throws(()=>pitches.createClient({...fixture(),ui:{plan:{nl:'Alleen NL'}}}),/bilingual/);
});
test('all pitch families retain their identity through language, booking, review and photo requests',async()=>{
 for(const slot of pitches.slots)for(const lang of ['nl','en']){
  const client=pitches.createClient({...fixture(slot.id,'test-'+slot.id),placeId:'test-place-'+slot.id});
  const nodes=new Map();for(const id of ['skip','header','main','footer','reviews','photos'])nodes.set(id,{innerHTML:'',textContent:'',dataset:{},addEventListener(){}});
  const document={documentElement:{dataset:{}},getElementById:id=>nodes.get(id),querySelectorAll:()=>[]};
  const requests=[],placeCallbacks=[];const window={SiteCore:core,addEventListener(){},SalonCarousel:{mount(){return {destroy(){}}}},ContactWidget:{mountAll({client:mounted,lang:locale}){assert.equal(mounted.id,client.id);assert.equal(locale,lang);}}};
  vm.runInNewContext(fs.readFileSync(path.join(root,'sector-site.js'),'utf8'),{window,document,location:{origin:'http://localhost:4174',href:'http://localhost:4174/pitches/index.html'},URL,URLSearchParams,Intl,Date,AbortSignal,fetch(url){requests.push(new URL(url));return Promise.resolve({ok:true,json:async()=>String(url).includes('/api/place')?{address:'API test address',photos:[],hours:[]}:{reviews:[],total:0}});}});
  window.SectorSite.render({client,lang,onPlace:data=>placeCallbacks.push(data)});await new Promise(resolve=>setImmediate(resolve));
  for(const url of requests){assert.equal(url.searchParams.get('client'),client.id);assert.equal(url.searchParams.get('lang'),lang);assert.equal(url.origin,'http://localhost:4174');}
  assert.equal(requests.length,2);assert.equal(placeCallbacks.length,1);assert.equal(placeCallbacks[0].address,'API test address');
  const header=nodes.get('header').innerHTML;assert(header.includes('client='+client.id+'&amp;lang='+lang));assert(header.includes('client='+client.id+'&amp;lang=nl'));assert(header.includes('client='+client.id+'&amp;lang=en'));
  assert(nodes.get('main').innerHTML.includes('booking.html?client='+client.id+'&amp;lang='+lang));assert(!nodes.get('reviews').innerHTML.includes('Test-only business'));
 }
});
test('the pitch renderer and shared contact widget produce one FAQ, schema and navigation link per client and language',()=>{
 for(const slot of pitches.slots)for(const lang of ['nl','en']){
  const client=pitches.createClient({...fixture(slot.id,'test-'+slot.id),placeId:'test-place-'+slot.id});
  // Keep this DOM contract independent of network data and the business snapshots.
  client.google.enabled=false;
  const nodes=new Map(['skip','header','main','footer'].map(id=>[id,{innerHTML:'',textContent:'',dataset:{}}]));
  const main=nodes.get('main'),header=nodes.get('header');
  const contact={insertAdjacentHTML(position,html){assert.equal(position,'beforebegin');main.innerHTML=main.innerHTML.replace(/<section(?=[^>]*\bid="contact")[^>]*>/,html+'$&');}};
  const nav={
   querySelector(selector){assert.equal(selector,'[data-faq-link]');return header.innerHTML.includes('data-faq-link=')?{}:null;},
   append(anchor){this.insertAdjacentHTML('beforeend',`<a href="${core.escape(anchor.href)}" data-faq-link="${core.escape(anchor.dataset.faqLink)}">${core.escape(anchor.textContent)}</a>`);},
   insertAdjacentHTML(position,html){assert.equal(position,'beforeend');header.innerHTML=header.innerHTML.replace('</nav>',html+'</nav>');},
  };
  main.querySelector=selector=>{
   if(selector==='#contact,#visit')return main.innerHTML.includes('id="contact"')?contact:null;
   if(selector==='[data-sector-faq]'){
    const found=/data-sector-faq="([^"]*)" data-faq-language="([^"]*)"/.exec(main.innerHTML);
    return found?{dataset:{sectorFaq:found[1],faqLanguage:found[2]}}:null;
   }
   throw Error('Unexpected main selector: '+selector);
  };
  const document={
   readyState:'loading',body:{classList:{add(){}}},head:{append(){}},
   documentElement:{dataset:{},style:{setProperty(){}}},
   getElementById:id=>id==='contact'?contact:nodes.get(id)||null,
   querySelector:selector=>selector==='meta[name="description"]'?{content:''}:selector==='#header .nav'||selector==='.header-inner .nav,.header-inner .main-nav,.header-inner .header-nav'?nav:null,
   querySelectorAll:()=>[],addEventListener(){},createElement:()=>({dataset:{}}),
  };
  const window={SiteCore:core,PitchClientRegistry:{defaultClient:client.id,clients:{[client.id]:client}},addEventListener(){},LocaleBootstrap:{ready(){}}};
  const context={window,document,location:{origin:'http://localhost:4174',href:`http://localhost:4174/pitches/index.html?client=${client.id}&lang=${lang}`,search:`?client=${client.id}&lang=${lang}`},URL,URLSearchParams,Intl,Date,AbortController,AbortSignal,fetch(){throw Error('No network expected');}};
  for(const file of ['contact-widget.js','sector-site.js','pitches/site.js'])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),context);
  // A second mount must reuse the shared FAQ rather than append another instance.
  window.ContactWidget.mountAll({client,lang});
  assert.equal((main.innerHTML.match(/<section[^>]*\bid="faq"/g)||[]).length,1,slot.id+' '+lang);
  assert.equal((main.innerHTML.match(/id="sectorFaqTitle"/g)||[]).length,1);
  assert.equal((main.innerHTML.match(/"@type":"FAQPage"/g)||[]).length,1);
  assert.equal((main.innerHTML.match(/<summary>/g)||[]).length,3);
  assert.equal((header.innerHTML.match(/href="#faq"/g)||[]).length,1);
  assert(main.innerHTML.includes(`data-sector-faq="${client.id}" data-faq-language="${lang}"`));
  assert.equal(window.PitchSite.client.id,client.id);assert.equal(window.PitchSite.lang,lang);
 }
});
test('a failed Google refresh preserves the same-business review snapshot and its source attribution',async()=>{
 for(const lang of ['nl','en']){
  const business=fixture(),snapshot={clientId:business.id,checked:'2026-10-04',rating:4.8,total:27,reviews:[{authorName:'Test-only review author',authorUri:'https://www.google.com/maps/contrib/test-profile',profilePhotoUrl:'https://example.test/test-avatar.jpg',rating:5,originalText:'Test-only original review',originalLanguage:'en',translations:{nl:'Test-only translated review'},relativeTimes:{nl:'1 maand geleden',en:'1 month ago'},googleMapsUri:'https://www.google.com/maps/reviews/test-review'}],photos:[]};
  const client=pitches.createClient({...business,snapshot});
  const nodes=new Map();for(const id of ['skip','header','main','footer','reviews','photos'])nodes.set(id,{innerHTML:'',textContent:'',dataset:{}});
  const document={documentElement:{dataset:{}},getElementById:id=>nodes.get(id),querySelectorAll:()=>[]};
  const requests=[],window={SiteCore:core,addEventListener(){},ContactWidget:{mountAll(){}},SalonCarousel:{mount(){throw Error('No real DOM carousel expected');}}};
  vm.runInNewContext(fs.readFileSync(path.join(root,'sector-site.js'),'utf8'),{window,document,location:{origin:'http://localhost:4174',href:'http://localhost:4174/pitches/index.html'},URL,URLSearchParams,Intl,Date,AbortSignal,fetch(url){requests.push(new URL(url));return Promise.resolve({ok:false,status:503});}});
  window.SectorSite.render({client,lang});
  const initial=nodes.get('reviews').innerHTML;await new Promise(resolve=>setImmediate(resolve));
  assert.equal(requests.length,2);assert.equal(nodes.get('reviews').innerHTML,initial);
  for(const value of ['Test-only review author','https://www.google.com/maps/contrib/test-profile','https://example.test/test-avatar.jpg','https://www.google.com/maps/reviews/test-review','Google Maps','data-carousel','27'])assert(initial.includes(value),value);
  assert(initial.includes(lang==='nl'?'Test-only translated review':'Test-only original review'));
  assert(initial.includes(new Intl.DateTimeFormat(core.locale(lang),{dateStyle:'medium'}).format(new Date('2026-10-04T12:00:00Z'))));
  assert(!initial.includes('Reviews are unavailable right now.'));assert(!initial.includes('Beoordelingen zijn nu niet beschikbaar.'));
 }
});
test('pitch booking and thank-you navigation retain the client, selected language and return anchors',()=>{
 const i18n=require('../i18n.js');
 for(const slot of pitches.slots)for(const lang of ['nl','en']){
  const client=pitches.createClient({...fixture(slot.id,'test-'+slot.id),placeId:'test-place-'+slot.id,...(slot.family==='restaurants'&&slot.variant==='b'?{calendar:{tableReservation:true}}:{})});
  const nodes=new Map(),node=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',hidden:true,setAttribute(){},addEventListener(){},focus(){}});return nodes.get(id);};
  const document={currentScript:{src:'http://localhost:4174/confirmation-state.js'},body:{classList:{add(){}}},documentElement:{dataset:{page:'booking'},style:{setProperty(){}}},querySelector:()=>({content:''}),getElementById:node,addEventListener(){}};
  const stored=new Map(),routes=[],window={SiteCore:core,SiteI18n:i18n,PitchClientRegistry:{defaultClient:client.id,clients:{[client.id]:client}},document,location:{assign:url=>routes.push(url)},sessionStorage:{setItem:(key,value)=>stored.set(key,value),getItem:key=>stored.get(key),removeItem:key=>stored.delete(key)}};
  const location={origin:'http://localhost:4174',pathname:'/booking.html',search:`?client=${client.id}&lang=${lang}&service=${client.services[0].id}`,hash:''};location.href=location.origin+location.pathname+location.search;
  const context={window,document,location,URL,URLSearchParams,Intl,Date};
  vm.runInNewContext(fs.readFileSync(path.join(root,'site-shell.js'),'utf8'),context);
  assert.equal(window.Site.config.id,client.id);assert.equal(window.Site.lang,lang);
  const home=`/pitches/index.html?client=${client.id}&lang=${lang}`;
  assert.equal(window.Site.link('index.html'),home);assert.equal(window.Site.link('index.html#services'),home+'#information');assert.equal(window.Site.link('faq.html'),home+'#faq');
  const other=lang==='nl'?'en':'nl';assert(node('siteHeader').innerHTML.includes(`/booking.html?client=${client.id}&amp;lang=${other}&amp;service=${client.services[0].id}`));
  vm.runInNewContext(fs.readFileSync(path.join(root,'confirmation-state.js'),'utf8'),context);
  const type=client.calendar.tableReservation?'table':'booking';
  assert(window.DemoConfirmation.complete(client,lang,{type,serviceId:client.services[0].id,date:'2026-10-12',time:'10:00',...(type==='table'?{party:4}:{})},'demo'));
  const target=new URL(routes[0]);assert.equal(target.pathname,'/confirmation.html');assert.equal(target.searchParams.get('client'),client.id);assert.equal(target.searchParams.get('lang'),lang);assert.equal(target.searchParams.get('type'),type);
  // Switching the thank-you language must keep the original client's summary.
  target.searchParams.set('lang',other);Object.assign(location,{pathname:target.pathname,search:target.search,href:target.href});document.documentElement.dataset.page='confirmation';
  vm.runInNewContext(fs.readFileSync(path.join(root,'site-shell.js'),'utf8'),context);
  vm.runInNewContext(fs.readFileSync(path.join(root,'confirmation.js'),'utf8'),context);
  assert.equal(window.Site.config.id,client.id);assert.equal(window.Site.lang,other);
  const markup=node('main').innerHTML;assert(markup.includes(core.escape(`/pitches/index.html?client=${client.id}&lang=${other}`)));assert(markup.includes('10:00'));assert(markup.includes(other==='nl'?'Gegevens nog te bevestigen':'Details await confirmation'));
  assert(node('siteHeader').innerHTML.includes(`/confirmation.html?client=${client.id}&amp;lang=${lang}&amp;type=${type}`));
  assert(!markup.includes('history.back'));assert(!markup.includes(other==='nl'?'Je afspraak is bevestigd.':'Your appointment is confirmed.'));
 }
});
test('private registries are loaded before shared page selection and excluded from public output',()=>{
 for(const page of ['booking.html','confirmation.html']){const html=fs.readFileSync(path.join(root,page),'utf8');assert(html.indexOf('src="pitch-client-config.js"')<html.indexOf('src="site-shell.js"'));assert(html.includes('src="pitch-businesses.js"'));}
 for(const page of ['pitches/index.html','pitch-library/index.html']){const html=fs.readFileSync(path.join(root,page),'utf8');assert(html.includes('<head><script src="../locale-bootstrap.js"></script>'));assert(html.includes('content="noindex,nofollow"'));assert(!html.includes('Test-only'));}
 const publicManifest=require('../scripts/build-showcase.js').manifest,privateManifest=require('../scripts/build-pitch.js').shared;
 for(const file of ['pitch-businesses.js','pitch-client-config.js','pitches/index.html','pitches/site.js','pitches/styles.css']){assert(!publicManifest.includes(file));assert(privateManifest.includes(file));}
 assert(!fs.readFileSync(path.join(root,'pitches/site.js'),'utf8').includes('figcaption'));
});
test('pitch registrations preserve existing businesses and integration secrets never cross client boundaries',async()=>{
 const first=pitches.createClient(fixture()),second=pitches.createClient({...fixture('salon-b','test-pitch-two'),placeId:'second-test-place',mapsUrl:'https://www.google.com/maps?cid=987654321'});
 const legacy={defaultClient:'ff',clients:{ff:{id:'ff',name:'Existing test client',languages:['nl','en']}}},loaded={exports:{}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'business-registry.js'),'utf8'),{module:loaded,require(file){if(file==='./client-config.js')return legacy;if(file==='./pitch-client-config.js')return {clients:{[first.id]:first,[second.id]:second}};const sector={id:file.includes('restaurants')?'fogon':file.includes('dentists')?'dental':file.includes('accountants')?'accounting':'moving'};return sector;}});
 assert.equal(loaded.exports.defaultClient,'ff');assert.equal(loaded.exports.clients.ff.name,'Existing test client');assert.equal(loaded.exports.clients[first.id],first);assert.equal(loaded.exports.clients[second.id],second);
 const integration={exports:{}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'integration-context.js'),'utf8'),{module:integration,require(file){if(file==='node:async_hooks')return require(file);if(file==='./business-registry.js')return loaded.exports;throw Error('No external integration expected');},process:{env:{RESEND_API_KEY:'legacy-test-only',RESEND_API_KEY__TEST_PITCH_SALON:'first-test-only',CONTACT_TO_EMAIL__TEST_PITCH_SALON:'first@example.test'}},URL,Date});
 const {withClient,currentClient,secret}=integration.exports;
 const handler=withClient(async()=>({id:currentClient().id,key:secret('RESEND_API_KEY'),to:secret('CONTACT_TO_EMAIL')}),'contact');
 const firstResult=await handler({queryStringParameters:{client:first.id,lang:'nl'}}),secondResult=await handler({queryStringParameters:{client:second.id,lang:'en'}});
 assert.equal(firstResult.key,'first-test-only');assert.equal(firstResult.to,'first@example.test');assert.equal(secondResult.id,second.id);assert.equal(secondResult.key,undefined);assert.equal(secondResult.to,undefined);
 let called=false;const calendar=withClient(async()=>{called=true;},'calendar');assert.equal((await calendar({queryStringParameters:{client:first.id,lang:'nl'}})).statusCode,503);assert.equal(called,false);
});
