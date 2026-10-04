'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),SEO=require('../concepts/seo.js'),registry=require('../public-client-config.js'),manifest=require('../scripts/build-showcase.js').manifest;
const clients=['northline','brasa','brightmove','bloom','lumen'].map(id=>registry.clients[id]);
function inspect(file,meta,id){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 assert(html.includes(SEO.head(meta)),file+' contains complete metadata before JavaScript');
 assert.equal((html.match(/rel="canonical"/g)||[]).length,1,file);
 assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,file);
 assert.match(html,new RegExp('<html lang="'+meta.lang+'"'));
 const schema=JSON.parse(html.match(new RegExp('<script type="application/ld\\+json" id="'+id+'">([\\s\\S]*?)</script>'))[1]);
 assert.deepEqual(schema,meta.schema);
 assert.equal(schema.url,meta.canonical);assert.equal(schema.inLanguage,meta.lang);
 assert.equal(schema.publisher.name,'Ocimatik');assert.equal(schema.publisher.url,'https://ocimatik.com/');
 assert.equal(schema.breadcrumb['@type'],'BreadcrumbList');
 assert(!/LocalBusiness|AggregateRating|"Review"|PostalAddress|openingHours|telephone/.test(JSON.stringify(schema)));
 assert(meta.image.startsWith('https://ocimatik.com/demos/assets/'));assert(meta.imageAlt.length>30);
 assert(manifest.includes(file));
 for(const link of html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)){
  const url=new URL(link[2]);assert.equal(url.origin,'https://ocimatik.com');assert.equal(url.search,'');
  assert(fs.existsSync(path.join(root,url.pathname.replace(/^\/demos\//,''))),link[2]+' exists');
 }
 return html;
}
for(const client of clients)for(const lang of ['en','nl'])test(`${client.name} ${lang} has crawlable portfolio metadata and a real language URL`,()=>{
 const file=lang==='en'?client.homePage:client.homePage.replace('index.html','nl.html'),meta=SEO.concept(client,lang),html=inspect(file,meta,'conceptSchema');
 assert.equal(meta.canonical,SEO.base+file);
 assert.equal(meta.schema.mainEntity['@type'],'CreativeWork');assert.equal(meta.schema.mainEntity.provider.name,'Ocimatik');
 assert(!html.includes('hreflang="es"'));assert(html.includes('href="https://ocimatik.com/"'));
 const fallback=html.match(/<noscript>([\s\S]*?)<\/noscript>/)[1];assert(fallback.includes(meta.description.replace(/'/g,'&#39;')));
 for(const service of client.services)assert(fallback.includes(require('../core.js').escape(service.title[lang])));
 assert.match(fallback,lang==='nl'?/Websiteontwerpportfolio van Ocimatik/:/Ocimatik website design portfolio/);
 assert(!/Fictional business|Fictief bedrijf|Enable JavaScript|Schakel JavaScript/.test(fallback));
});
for(const lang of ['en','nl','es'])test(`gallery ${lang} describes Ocimatik's five fictional works in source HTML`,()=>{
 const file='sectors/'+(lang==='en'?'index':lang)+'.html',meta=SEO.gallery(clients,lang),html=inspect(file,meta,'gallerySchema');
 assert.equal(meta.schema['@type'],'CollectionPage');assert.equal(meta.schema.mainEntity.itemListElement.length,5);
 assert(meta.schema.mainEntity.itemListElement.every(item=>item.item['@type']==='CreativeWork'&&item.item.provider.name==='Ocimatik'));
 assert.match(html,lang==='en'?/Five industries/:lang==='nl'?/Vijf sectoren/:/Cinco sectores/);
});
test('legacy query URLs use the matching canonical file without leaking preview hosts or UI parameters',()=>{
 const nodes=new Map(),links=['en','nl','x-default'].map(hreflang=>({hreflang}));
 const document={querySelector:selector=>{if(!nodes.has(selector))nodes.set(selector,{});return nodes.get(selector);},querySelectorAll:()=>links,getElementById:id=>{if(!nodes.has(id))nodes.set(id,{});return nodes.get(id);}};
 SEO.apply(document,SEO.concept(registry.clients.bloom,'nl'),'conceptSchema');
 assert.equal(nodes.get('link[rel="canonical"]').href,'https://ocimatik.com/demos/concepts/salon/nl.html');
 assert.equal(links.find(link=>link.hreflang==='nl').href,'https://ocimatik.com/demos/concepts/salon/nl.html');
 assert(!JSON.stringify([...nodes.values()]).includes('localhost'));
});

test('image metadata accepts local and published asset paths without duplicating the showcase prefix',()=>{
 const expected='https://ocimatik.com/demos/assets/salon-scene.webp';
 for(const asset of ['/assets/salon-scene.webp','assets/salon-scene.webp','/demos/assets/salon-scene.webp','demos/assets/salon-scene.webp'])assert.equal(SEO.imageUrl(asset),expected);
 assert.equal(SEO.imageUrl('https://cdn.example/image.webp'),'https://cdn.example/image.webp');
});
test('localized concept pages select their published language and keep fictional FAQs outside rich-result markup',()=>{
 const C={...require('../core.js')};
 vm.runInNewContext(fs.readFileSync(path.join(root,'concepts/public-core.js'),'utf8'),{window:{SiteCore:C},location:{pathname:'/demos/concepts/salon/nl.html'},URL,URLSearchParams});
 assert.equal(C.resolveLanguage(registry.clients.bloom,null),'nl');assert.equal(C.resolveLanguage(registry.clients.bloom,'en'),'en');
 assert(!C.faqMarkup(registry.clients.bloom,'nl').includes('application/ld+json'));
 assert(C.faqMarkup({...registry.clients.bloom,concept:{fictional:false}},'en').includes('application/ld+json'));
});
