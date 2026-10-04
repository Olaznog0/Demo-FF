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
 for(const [index,item] of meta.schema.mainEntity.itemListElement.entries()){
  const expected=SEO.pageUrl(clients[index].homePage,lang==='nl'?'nl':'en');
  assert.equal(item.url,expected);assert.equal(item.item.url,expected,'The work and its list link use the same available language route');
 }
 assert.match(html,lang==='en'?/Five industries/:lang==='nl'?/Vijf sectoren/:/Cinco sectores/);
});

const nativeGalleryAccessibility={
 en:{alts:['A bright office with wooden desks','Chicken, rice and golden plantain on a rustic plate','Moving boxes and an open van outside a home','A stylist cutting hair in a sunlit salon','A bright dental reception with a welcoming waiting area'],labels:['Ocimatik home','Main navigation','Language','Open menu','Footer navigation']},
 nl:{alts:['Licht kantoor met houten bureaus','Kip, rijst en goudgele bakbanaan op een rustiek bord','Verhuisdozen en een open bestelwagen voor een woning','Een kapper knipt haar in een zonnige salon','Lichte tandartsreceptie met een uitnodigende wachtruimte'],labels:['Ocimatik · home','Hoofdnavigatie','Taal','Menu openen','Voettekstnavigatie']},
 es:{alts:['Oficina luminosa con escritorios de madera','Pollo, arroz y plátano dorado en un plato rústico','Cajas de mudanza y una furgoneta abierta frente a una casa','Un peluquero corta el cabello en un salón luminoso','Recepción dental luminosa con una acogedora sala de espera'],labels:['Ocimatik · inicio','Navegación principal','Idioma','Abrir menú','Navegación del pie']}
};
for(const lang of ['en','nl','es'])test(`gallery ${lang} exposes localized image descriptions and navigation names before JavaScript`,()=>{
 const html=fs.readFileSync(path.join(root,'sectors',lang==='en'?'index.html':lang+'.html'),'utf8'),expected=nativeGalleryAccessibility[lang];
 const images=[...html.matchAll(/<img\b[^>]*data-alt="([^"]+)"[^>]*>/g)];
 assert.deepEqual(images.map(match=>match[1]),['accountants','restaurants','movers','salon','dentists']);
 assert.deepEqual(images.map(match=>match[0].match(/\balt="([^"]*)"/)[1]),expected.alts);
 for(const label of expected.labels)assert(html.includes('aria-label="'+label+'"'),label+' is readable without translation JavaScript');
 const languages=[...html.matchAll(/<a data-language="([^"]+)"[^>]*>/g)];
 assert.deepEqual(languages.map(match=>match[1]),['en','nl','es']);
 assert.deepEqual(languages.filter(match=>match[0].includes('aria-current="page"')).map(match=>match[1]),[lang]);
 if(lang!=='en')for(const label of ['Main navigation','Language','Open menu','Footer navigation'])assert(!html.includes('aria-label="'+label+'"'),'No English navigation fallback in the localized HTML');
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
