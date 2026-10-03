'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const registry=require('../public-client-config.js'),core=require('../core.js'),i18n=require('../i18n.js');
const stateSource=fs.readFileSync(path.join(__dirname,'../confirmation-state.js'),'utf8');
function setup(){const storage=new Map(),routes=[];const window={document:{currentScript:{src:'http://localhost:4174/confirmation-state.js'}},sessionStorage:{setItem:(k,v)=>storage.set(k,v),getItem:k=>storage.get(k),removeItem:k=>storage.delete(k)},location:{assign:url=>routes.push(url)}};vm.runInNewContext(stateSource,{window,URL,URLSearchParams,Date});return {api:window.DemoConfirmation,storage,routes};}
test('demo thank-you stores only a bounded non-personal summary and scopes its URL to business, language and intent',()=>{
 const {api,storage,routes}=setup(),c=registry.clients.brightmove;
 assert(api.complete(c,'en',{type:'enquiry',topicId:'planning',movingDate:'2026-10-12',name:'PRIVATE NAME',email:'private@example.test',phone:'0612345678',message:'PRIVATE MESSAGE',movingFrom:'PRIVATE ADDRESS'},'demo'));
 const raw=storage.get(api.key),data=JSON.parse(raw),url=new URL(routes[0]);assert.equal(data.topicId,'planning');assert.equal(data.movingDate,'2026-10-12');assert.equal(data.status,'demo');assert(!raw.includes('PRIVATE'));assert(!raw.includes('private@'));assert.deepEqual([...url.searchParams.keys()],['client','lang','type']);assert.equal(url.pathname,'/confirmation.html');assert.equal(url.searchParams.get('client'),'brightmove');
});
test('API thank-you requires an actual provider receipt and never accepts ok alone',()=>{
 const {api,routes}=setup(),c=registry.clients.bloom,summary={type:'booking',serviceId:'cut',date:'2026-10-12',time:'10:00'};
 for(const receipt of [null,{ok:true},{ok:false,eventId:'event'}, {ok:true,id:'email-only'}])assert.throws(()=>api.complete(c,'en',summary,'api',receipt),/Receipt not confirmed/);
 assert.equal(routes.length,0);assert(api.complete(c,'en',summary,'api',{ok:true,eventId:'event'}));assert.equal(api.read(c,'booking').status,'confirmed');
 assert.throws(()=>api.complete(c,'en',{type:'enquiry'},'api',{ok:true,eventId:'event'}),/Receipt not confirmed/);
 assert(api.complete(c,'en',{type:'enquiry'},'api',{ok:true,id:'message'}));
});
test('summary rejects foreign clients, invalid fields and expired state, and supports a language switch',()=>{
 const {api,storage}=setup(),c=registry.clients.brasa;
 const data=api.payload(c,'en',{type:'table',date:'2026-02-30',time:'25:90',party:99,serviceId:'unknown'},'demo',null,1000);storage.set(api.key,JSON.stringify({...data,name:'malicious personal field'}));
 const checked=api.read(c,'table',1001);assert.equal(checked.date,'');assert.equal(checked.time,'');assert.equal(checked.party,null);assert.equal(checked.serviceId,'');assert(!('name'in checked));assert.equal(checked.lang,'en');assert.equal(api.read(registry.clients.bloom,'table',1001),null);assert.equal(api.read(c,'booking',1001),null);assert.equal(api.read(c,'table',1000+api.ttl+1),null);assert.equal(storage.size,0);
});
test('blocked session storage stays local and never redirects to a false confirmation',()=>{const routes=[],window={document:{currentScript:{src:'http://local/confirmation-state.js'}},location:{assign:url=>routes.push(url)},sessionStorage:{setItem(){throw new Error('blocked');}}};vm.runInNewContext(stateSource,{window,URL,URLSearchParams,Date});assert.equal(window.DemoConfirmation.complete(registry.clients.bloom,'en',{type:'booking'},'demo'),false);assert.equal(routes.length,0);});
function shell(clientId,lang,pathname='/booking.html',query='',absoluteCore=false){
 const nodes=new Map();function node(id){if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',hidden:true,setAttribute(){},addEventListener(){},focus(){}});return nodes.get(id);}
 for(const id of ['main','skip','siteHeader','siteFooter','mobileMenuBtn','mobileMenu'])node(id);
 const document={documentElement:{dataset:{page:pathname.includes('confirmation')?'confirmation':'booking'},style:{setProperty(){}},lang:''},title:'',querySelector:()=>({content:''}),getElementById:node,addEventListener(){}};
 const search='?client='+clientId+'&lang='+lang+query,window={SiteCore:absoluteCore?{...core,link:(...args)=>'/'+core.link(...args)}:core,SiteI18n:i18n,PublicClientRegistry:structuredClone(registry)};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../site-shell.js'),'utf8'),{window,document,location:{href:'http://local'+pathname+search,pathname,search,hash:'',origin:'http://local'},URL,URLSearchParams});return {window,nodes,document};
}
test('public shared calendar and thanks resolve all five public clients without private data, keep sector home and preserve language query',()=>{
 for(const c of Object.values(registry.clients))for(const lang of ['nl','en']){
  const fixture=shell(c.id,lang,'/confirmation.html','&type=table');assert.equal(fixture.window.Site.config.id,c.id);assert.equal(fixture.window.Site.link('index.html'),'/'+c.homePage+'?client='+c.id+'&lang='+lang);const header=fixture.nodes.get('siteHeader').innerHTML;assert(header.includes('/confirmation.html?client='+c.id+'&amp;lang='+(lang==='en'?'nl':'en')+'&amp;type=table'));assert(!header.includes('<small>'));assert(header.includes('<svg class="brand-symbol"'));assert(!header.includes('Ayden'));
 }
 const nested=shell('bloom','en','/concepts/salon/index.html','',true);assert(nested.nodes.get('siteHeader').innerHTML.includes('/concepts/salon/index.html?client=bloom&amp;lang=nl'));assert.equal(nested.window.Site.link('booking.html'),'/booking.html?client=bloom&lang=en');assert(!nested.nodes.get('siteHeader').innerHTML.includes('href="//'));
});
test('themed table thank-you preserves guests, date and time across NL/EN and returns to its explicit sector page',()=>{
 const {api,storage}=setup(),c=registry.clients.brasa;storage.set(api.key,JSON.stringify(api.payload(c,'en',{type:'table',date:'2026-10-20',time:'19:00',party:4})));
 for(const lang of ['nl','en']){
  const f=shell('brasa',lang,'/confirmation.html','&type=table');f.window.DemoConfirmation=api;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../confirmation.js'),'utf8'),{window:f.window,document:{title:'',getElementById:id=>{if(!f.nodes.has(id))f.nodes.set(id,{addEventListener(){}});return f.nodes.get(id);}},location:{search:'?client=brasa&lang='+lang+'&type=table'},URLSearchParams,Intl,Date});
  const markup=f.nodes.get('main').innerHTML;assert(markup.includes('19:00'));assert(markup.includes('<dd>4</dd>'));assert(markup.includes(lang==='nl'?'Personen':'Guests'));assert(markup.includes(lang==='nl'?'Niets verzonden':'Nothing sent'));assert(!markup.includes('Contact enquiry'));assert(!markup.includes('Crispy chicken'));assert(markup.includes('/concepts/restaurants/index.html?client=brasa&amp;lang='+lang));assert(!markup.includes('history.back'));
 }
});
