'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),bootstrap=fs.readFileSync(path.join(root,'locale-bootstrap.js'),'utf8');
function fixture({search='',saved=null,scope='business',blocked=false}={}){
 const attrs=new Map(),events=new Map(),timers=new Map(),html={lang:'nl',dataset:{localeScope:scope},setAttribute:(key,value)=>attrs.set(key,value),removeAttribute:key=>attrs.delete(key)};
 const document={documentElement:html,head:{append(){}},readyState:'loading',createElement:()=>({}),addEventListener:(type,handler)=>events.set(type,handler)};
 const values=new Map([[scope==='agency'?'ocimatik-language-v2':'ocimatik-business-language-v1',saved]]);
 const window={document,location:{search},localStorage:{getItem:key=>{if(blocked)throw Error('blocked');return values.get(key);},setItem:(key,value)=>{if(blocked)throw Error('blocked');values.set(key,value);}},setTimeout:(handler,ms)=>{assert.equal(ms,2000);timers.set(1,handler);return 1;},clearTimeout:id=>timers.delete(id)};
 vm.runInNewContext(bootstrap,{window,URLSearchParams});
 return {window,html,attrs,events,timers,values,document};
}
test('locale is selected before rendering; explicit query wins and invalid query uses the page default',()=>{
 assert.equal(fixture({search:'?lang=en',saved:'nl'}).html.lang,'en');
 assert.equal(fixture({saved:'en'}).html.lang,'en');
 assert.equal(fixture({search:'?lang=invalid',saved:'en'}).html.lang,'nl');
 assert.equal(fixture({scope:'agency',saved:'nl'}).html.lang,'nl');
 assert.equal(fixture({scope:'agency',search:'?lang=invalid',saved:'nl'}).html.lang,'en');
 assert.equal(fixture({search:'?lang=en',blocked:true}).html.lang,'en');
 assert.equal(fixture({blocked:true}).html.lang,'nl');
});
test('translation completion releases existing dimensions without waiting for providers, with bounded fail-open',()=>{
 const f=fixture({search:'?lang=en'});assert(f.attrs.has('data-locale-pending'));
 f.events.get('DOMContentLoaded')();assert(f.attrs.has('data-locale-pending'));
 f.document.readyState='interactive';f.window.LocaleBootstrap.ready();assert(!f.attrs.has('data-locale-pending'));assert.equal(f.timers.size,0);
 const early=fixture();early.window.LocaleBootstrap.ready();assert(early.attrs.has('data-locale-pending'));early.events.get('DOMContentLoaded')();assert(!early.attrs.has('data-locale-pending'));
 const failure=fixture();failure.timers.get(1)();assert(!failure.attrs.has('data-locale-pending'));
});
test('business language capabilities stay separate from the trilingual agency preference',()=>{
 const f=fixture({scope:'agency',search:'?lang=es'});assert.equal(f.html.lang,'es');assert.equal(f.values.get('ocimatik-language-v2'),'es');
 const business=fixture({saved:'en'});assert.equal(business.window.LocaleBootstrap.resolve(['nl','en'],'nl','es'),'nl');assert(!business.values.has('ocimatik-language-v2'));
});
test('all current home and appointment pages load the bootstrap before deferred rendering; both packages include it',()=>{
 const pages=['index.html','booking.html','confirmation.html','sectors/index.html','sectors/dentists/index.html','sectors/accountants/index.html','sectors/movers/index.html','sectors/restaurants/el-fogon-latino/index.html',...['salon','restaurants','dentists','accountants','movers'].map(sector=>'concepts/'+sector+'/index.html')];
 for(const page of pages){const html=fs.readFileSync(path.join(root,page),'utf8'),match=html.match(/<head><script src="([^"]*locale-bootstrap\.js)"><\/script>/);assert(match,page);assert.equal(path.resolve(root,path.dirname(page),match[1]),path.join(root,'locale-bootstrap.js'));assert(html.includes('<noscript>')||page==='sectors/index.html',page);}
 assert(require('../scripts/build-showcase.js').manifest.includes('locale-bootstrap.js'));assert(require('../scripts/build-pitch.js').shared.includes('locale-bootstrap.js'));
 const gallery=fs.readFileSync(path.join(root,'sectors/index.html'),'utf8');assert(gallery.includes('data-locales="en,nl,es"'));for(const lang of ['en','nl','es'])assert(gallery.includes('hreflang="'+lang+'"'));
});
test('gallery translates all three agency locales and routes only supported business languages',()=>{
 const html=fs.readFileSync(path.join(root,'sectors/index.html'),'utf8'),source=fs.readFileSync(path.join(root,'sectors/gallery.js'),'utf8');
 function element(attrs={}){return {dataset:attrs,attributes:new Map(),events:new Map(),textContent:'',innerHTML:'',getAttribute(key){return this.attributes.get(key);},setAttribute(key,value){this.attributes.set(key,value);},removeAttribute(key){this.attributes.delete(key);},addEventListener(type,handler){this.events.set(type,handler);},classList:{remove(){},toggle(){}}};}
 for(const lang of ['en','es','nl']){
  const nodes=new Map(),copy=[...html.matchAll(/data-copy="([^"]+)"/g)].map(match=>element({copy:match[1]})),alts=['accountants','restaurants','movers','salon','dentists'].map(name=>element({alt:name}));
  const languages=[...html.matchAll(/<a data-language="([^"]+)"[^>]*>(.*?)<\/a>/g)].map(match=>{const node=element({language:match[1]});Object.defineProperty(node,'innerHTML',{get:()=>match[2],set:()=>{throw Error('Existing language flags must not be recreated');}});return node;});
  assert.deepEqual(languages.map(link=>link.dataset.language),['en','nl','es']);
  const cards=['northline','brasa','brightmove','bloom','lumen'].map((id,index)=>{const card=element();card.href='/concepts/'+['accountants','restaurants','movers','salon','dentists'][index]+'/index.html?client='+id+'&lang=en';card.getAttribute=()=>card.href;card.querySelector=()=>({textContent:id});return card;});
  const agencyLinks=['inicio','soluciones','negocios','faq','contacto'].map(agencyLink=>element({agencyLink}));
  const query=selector=>{if(!nodes.has(selector))nodes.set(selector,element());return nodes.get(selector);};
  const document={documentElement:{dataset:{agencyOrigin:'https://ocimatik.com'}},title:'',querySelector:query,getElementById:query,addEventListener(){},querySelectorAll:selector=>({'[data-copy]':copy,'[data-alt]':alts,'[data-language]':languages,'[data-agency-link]':agencyLinks,'.brand':[element()],'.grid>.card':cards,'link[rel=alternate][hreflang]':['en','es','nl'].map(hreflang=>({hreflang}))}[selector]||[])};
  const location={search:'?lang='+lang,href:'https://ocimatik.com/sectors/index.html?lang='+lang,hostname:'ocimatik.com',protocol:'https:'};
  let ready=false,remembered=null,replaced=null;vm.runInNewContext(source,{document,window:{PublicConceptSEO:require('../concepts/seo.js'),PublicClientRegistry:require('../public-client-config.js'),LocaleBootstrap:{resolve:()=>lang,ready:()=>ready=true,remember:value=>remembered=value},history:{replaceState(_state,_title,target){replaced=target;location.href=new URL(target,location.href).href;}}},location,URL,URLSearchParams});
  assert(ready);assert.equal(document.documentElement.lang,lang);assert(copy.every(node=>node.textContent),lang);assert(alts.every(image=>image.alt),lang);assert(languages.every(link=>link.innerHTML.includes('<svg')));assert(languages.find(link=>link.dataset.language===lang).attributes.has('aria-current'));
  for(const card of cards)assert.equal(new URL(card.href,'https://ocimatik.com').searchParams.get('lang'),lang==='nl'?'nl':'en');
  for(const link of agencyLinks)assert.equal(new URL(link.href).searchParams.get('lang'),lang);
  const schema=JSON.parse(query('gallerySchema').textContent);assert.equal(schema.inLanguage,lang);assert.equal(schema.mainEntity.itemListElement.length,5);assert(schema.mainEntity.itemListElement[0].name.includes('Northline'));assert(schema.mainEntity.itemListElement[0].url.startsWith('https://ocimatik.com/demos/concepts/'));
  const next=lang==='nl'?'en':'nl',link=languages.find(item=>item.dataset.language===next),flags=languages.map(item=>item.innerHTML);
  let prevented=false;link.events.get('click')({button:0,preventDefault:()=>prevented=true});
  assert(prevented);assert.equal(document.documentElement.lang,next);assert.equal(remembered,next);assert.equal(new URL(replaced,location.href).searchParams.get('lang'),next);
  assert.deepEqual(languages.map(item=>item.innerHTML),flags);assert.equal(JSON.parse(query('gallerySchema').textContent).inLanguage,next);
  prevented=false;languages.find(item=>item.dataset.language===lang).events.get('click')({button:0,ctrlKey:true,preventDefault:()=>prevented=true});assert(!prevented,'Modified clicks retain native new-tab navigation');
 }
});
