'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const core=require('../core.js');
const publicClients=Object.values(require('../public-client-config.js').clients);
const realClients=['dentists','accountants','movers'].map(folder=>require('../sectors/'+folder+'/config.js'));
const sectorSource=fs.readFileSync(require.resolve('../sector-site.js'),'utf8');
const restaurantSource=fs.readFileSync(require.resolve('../sectors/restaurants/el-fogon-latino/restaurant.js'),'utf8');

function bookingLinks(markup,client,lang){
 const links=[...markup.matchAll(/<a\b[^>]*href="([^"]*booking\.html[^"]*)"[^>]*>/g)];
 assert(links.length>=3,client.id+' exposes booking calls to action');
 for(const [anchor,href]of links){
  const url=new URL(href.replaceAll('&amp;','&'),'https://example.test/nested/site/index.html');
  assert.equal(url.pathname,'/booking.html');assert.equal(url.searchParams.get('client'),client.id);assert.equal(url.searchParams.get('lang'),lang);
  assert.match(anchor,/target="_blank"/);assert.match(anchor,/rel="noopener noreferrer"/);
  if(url.searchParams.has('service'))assert(client.services.some(service=>service.id===url.searchParams.get('service')&&service.bookingEligible!==false));
 }
 assert(!markup.includes('reservationForm'));assert(!markup.includes('bookingForm'));
}
function faq(markup,client,lang){
 assert.equal((markup.match(/<section[^>]*id="faq"/g)||[]).length,1);
 assert(markup.includes('data-sector-faq="'+client.id+'"'));assert(markup.includes('data-faq-language="'+lang+'"'));
 for(const entry of core.faqEntries(client,lang)){assert(markup.includes(core.escape(entry.q)));assert(markup.includes(core.escape(entry.a)));}
}

test('sector templates keep business, language and service-specific bookings separate from FAQs and contact-only topics',()=>{
 for(const original of [...realClients,...publicClients])for(const lang of ['en','nl']){
  const client=structuredClone(original);client.google.enabled=false;delete client.google.snapshot;
  const nodes=new Map(['skip','header','main','footer','reviews','photos','routeDate'].map(id=>[id,{innerHTML:'',textContent:'',dataset:{}}]));
  const document={documentElement:{dataset:{}},getElementById:id=>nodes.get(id)||null,querySelectorAll:()=>[]};
  const window={SiteCore:core,addEventListener(){}};
  vm.runInNewContext(sectorSource,{window,document,location:{origin:'https://example.test'},URL,URLSearchParams,Intl,Date});
  window.SectorSite.render({client,lang});
  const main=nodes.get('main').innerHTML,header=nodes.get('header').innerHTML;
  bookingLinks(header+main,client,lang);faq(main,client,lang);
  assert.equal((header.match(/data-faq-link="true"/g)||[]).length,1);
  assert(main.indexOf('id="faq"')<main.indexOf('id="contact"'));
  for(const service of client.services.filter(service=>service.bookingEligible===false))assert(!main.includes('&amp;service='+encodeURIComponent(service.id)));
 }
});

test('the real restaurant replaces its inline table form with the shared independent reservation flow in both languages',()=>{
 for(const lang of ['en','nl']){
  const client=structuredClone(require('../sectors/restaurants/el-fogon-latino/config.js'));client.google.enabled=false;
  const nodes=new Map();
  const node=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',dataset:{},addEventListener(){},setAttribute(){},getAttribute:()=>null});return nodes.get(id);};
  const toggle={dataset:{},setAttribute(){},getAttribute:()=>null,addEventListener(){}};
  const nav={classList:{remove(){}},querySelectorAll:()=>[]};
  const document={documentElement:{style:{setProperty(){}}},querySelectorAll:()=>[],getElementById:id=>id==='top'?null:node(id),
   querySelector:selector=>selector==='.menu-toggle'?toggle:selector==='.header-nav'?nav:selector==='[data-contact-widget]'?null:{content:'',textContent:''},
   addEventListener(){},dispatchEvent(){}};
  const window={SiteCore:core,RestaurantConfig:client,addEventListener(){},LocaleBootstrap:{ready(){}}};
  vm.runInNewContext(restaurantSource,{window,document,location:{search:'?lang='+lang,origin:'https://example.test'},URL,URLSearchParams,Intl,Date,Event});
  const markup=node('restaurant').innerHTML;
  bookingLinks(markup,client,lang);faq(markup,client,lang);
  assert(markup.includes('href="https://ocimatik.com/">Demo Ocimatik</a>'));
  assert.equal((markup.match(/data-faq-link="true"/g)||[]).length,1);
  assert(!markup.includes('type="date"'));assert(!markup.includes('data-slot='));
  assert(markup.includes(lang==='en'?'Reserve a table':'Reserveer een tafel'));
 }
});
