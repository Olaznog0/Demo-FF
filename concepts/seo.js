(function(root){
 'use strict';
 const origin='https://ocimatik.com',base=origin+'/demos/';
 const organization={'@type':'Organization','@id':origin+'/#organization',name:'Ocimatik',url:origin+'/'};
 const labels={salon:{en:'salon',nl:'salons'},restaurant:{en:'restaurant',nl:'restaurants'},dentist:{en:'dental practice',nl:'tandartspraktijken'},accountant:{en:'accounting',nl:'administratiekantoren'},'moving-company':{en:'moving service',nl:'verhuisbedrijven'}};
 const features={salon:{en:'styling services, appointments and contact',nl:'haarstyling, afspraken en contact'},restaurant:{en:'the menu, table reservations and contact',nl:'de menukaart, tafelreserveringen en contact'},dentist:{en:'care information, appointments and contact',nl:'praktische zorginformatie, afspraken en contact'},accountant:{en:'advisory services, introductions and contact',nl:'adviesdiensten, kennismakingsgesprekken en contact'},'moving-company':{en:'moving services, enquiries and contact',nl:'verhuisdiensten, aanvragen en contact'}};
 const imageAlts={salon:{en:'A stylist cutting hair in a sunlit salon, used in the Studio Bloom website concept',nl:'Een kapper knipt haar in een zonnige salon, in het websiteconcept Studio Bloom'},restaurant:{en:'Chicken, rice and golden plantain on a plate in the Casa Brasa website concept',nl:'Kip, rijst en goudgele bakbanaan op een bord in het websiteconcept Casa Brasa'},dentist:{en:'Bright dental reception with comfortable seating in the Lumen Dental website concept',nl:'Lichte tandartsreceptie met comfortabele zitplaatsen in het websiteconcept Lumen Dental'},accountant:{en:'Bright office with wooden desks in the Northline Advisors website concept',nl:'Licht kantoor met houten bureaus in het websiteconcept Northline Advisors'},'moving-company':{en:'Moving boxes and an open van outside a home in the BrightMove website concept',nl:'Verhuisdozen en een open bestelwagen bij een woning in het websiteconcept BrightMove'}};
 const galleryCopy={en:{title:'Website concepts for local businesses | Ocimatik',description:'Explore five website design concepts by Ocimatik for salons, restaurants, dentists, accountants and movers. Discover design, appointments and contact flows.',name:'Website concepts',imageAlt:'A stylist cutting hair in the Studio Bloom salon concept, one of five Ocimatik website designs'},nl:{title:'Websiteconcepten voor lokale bedrijven | Ocimatik',description:'Ontdek vijf websiteontwerpen van Ocimatik voor salons, restaurants, tandartsen, administratiekantoren en verhuisbedrijven. Bekijk ontwerp, afspraken en contact.',name:'Websiteconcepten',imageAlt:'Een kapper knipt haar in het salonconcept Studio Bloom, een van vijf websiteontwerpen van Ocimatik'},es:{title:'Conceptos web para negocios locales | Ocimatik',description:'Explora cinco diseños web de Ocimatik para peluquerías, restaurantes, dentistas, contabilidad y mudanzas. Descubre diseños, citas y contacto.',name:'Conceptos web',imageAlt:'Un peluquero corta el cabello en el concepto Studio Bloom, uno de cinco diseños web de Ocimatik'}};
 const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
 const json=value=>JSON.stringify(value).replace(/</g,'\\u003c');
 function pageUrl(page,language='en'){
  const localized=language==='en'?page:String(page).replace(/index\.html$/,language+'.html');
  const url=new URL(String(localized).replace(/^\//,''),base);
  return url.href;
 }
 const imageUrl=image=>new URL(String(image).replace(/^\/+/, '').replace(/^demos\//, ''),base).href;
 function breadcrumb(name,url,lang){
  const items=[{name:'Ocimatik',item:origin+'/'},{name:galleryCopy[lang]?.name||galleryCopy.en.name,item:pageUrl('sectors/index.html',lang)}];
  if(name)items.push({name,item:url});
  return {'@type':'BreadcrumbList',itemListElement:items.map((item,index)=>({'@type':'ListItem',position:index+1,...item}))};
 }
 function concept(config,language='en'){
  const lang=config.languages.includes(language)?language:'en',label=labels[config.sector]?.[lang]||labels.salon[lang];
  const title=lang==='nl'?`${config.name}: websiteconcept voor ${label} | Ocimatik`:`${config.name}: ${label} website concept | Ocimatik`;
  const description=lang==='nl'?`Bekijk het websiteontwerp ${config.name} van Ocimatik voor ${label}. Ontdek ${features[config.sector][lang]} in dit portfolio.`:`Explore Ocimatik's ${label} website design concept ${config.name}. Discover ${features[config.sector][lang]} in this portfolio.`;
  const canonical=pageUrl(config.homePage,lang),url=canonical,image=imageUrl(config.images.hero),imageAlt=imageAlts[config.sector][lang];
  const work={'@type':'CreativeWork','@id':pageUrl(config.homePage)+'#concept',name:config.name+' · '+(lang==='nl'?'fictief websiteconcept':'fictional website concept'),description,url:canonical,image,inLanguage:config.languages,genre:lang==='nl'?'Websiteontwerpportfolio':'Website design portfolio',creator:organization,publisher:organization,provider:organization};
  const schema={'@context':'https://schema.org','@type':'WebPage','@id':canonical+'#webpage',url:canonical,name:title,description,inLanguage:lang,isPartOf:{'@type':'WebSite','@id':origin+'/#website',name:'Ocimatik',url:origin+'/'},publisher:organization,breadcrumb:breadcrumb(config.name,url,lang),mainEntity:work};
  return {title,description,canonical,url,image,imageAlt,lang,languages:config.languages,page:config.homePage,schema};
 }
 function gallery(clients,language='en'){
  const lang=Object.hasOwn(galleryCopy,language)?language:'en',copy=galleryCopy[lang],canonical=pageUrl('sectors/index.html',lang),url=canonical;
  const schema={'@context':'https://schema.org','@type':'CollectionPage','@id':canonical+'#webpage',url:canonical,name:copy.title,description:copy.description,inLanguage:lang,publisher:organization,breadcrumb:breadcrumb(null,url,lang),mainEntity:{'@type':'ItemList',itemListElement:clients.map((client,index)=>({'@type':'ListItem',position:index+1,name:client.name,url:pageUrl(client.homePage,lang==='nl'?'nl':'en'),item:{'@type':'CreativeWork',name:client.name+' · fictional website concept',url:pageUrl(client.homePage),creator:organization,provider:organization}}))}};
  return {...copy,title:copy.title,canonical,url,image:imageUrl('/assets/salon-scene.webp'),lang,languages:['en','nl','es'],page:'sectors/index.html',schema};
 }
 function head(meta){
  const props={'og:type':'website','og:title':meta.title,'og:description':meta.description,'og:site_name':'Ocimatik','og:url':meta.canonical,'og:image':meta.image,'og:image:alt':meta.imageAlt,'og:locale':{en:'en_GB',nl:'nl_NL',es:'es_ES'}[meta.lang]};
  const twitter={'twitter:card':'summary_large_image','twitter:title':meta.title,'twitter:description':meta.description,'twitter:image':meta.image,'twitter:image:alt':meta.imageAlt};
  return '<!-- Public portfolio SEO -->\n'+`<title>${escape(meta.title)}</title>\n<meta name="description" content="${escape(meta.description)}">\n<meta name="robots" content="index,follow,max-image-preview:large">\n<link rel="canonical" href="${escape(meta.canonical)}">\n`+meta.languages.map(lang=>`<link rel="alternate" hreflang="${lang}" href="${escape(pageUrl(meta.page,lang))}">`).join('\n')+`\n<link rel="alternate" hreflang="x-default" href="${escape(pageUrl(meta.page))}">\n`+Object.entries(props).map(([key,value])=>`<meta property="${key}" content="${escape(value)}">`).join('\n')+'\n'+Object.entries(twitter).map(([key,value])=>`<meta name="${key}" content="${escape(value)}">`).join('\n')+'\n<link rel="icon" href="https://ocimatik.com/favicon.svg" type="image/svg+xml">\n<link rel="icon" href="https://ocimatik.com/favicon.ico" sizes="any">\n<!-- /Public portfolio SEO -->';
 }
 function staticHTML(html,meta,schemaId){
  if(!html.includes('</head>'))return html;
  if(html.includes('<!-- Public portfolio SEO -->'))html=html.replace(/<!-- Public portfolio SEO -->[\s\S]*?<!-- \/Public portfolio SEO -->/,head(meta));
  else{
   const end=html.indexOf('</head>'),start=html.slice(0,end).replace(/<title>[\s\S]*?<\/title>/gi,'').replace(/<meta\b[^>]*(?:name="(?:description|robots|twitter:[^"]+)"|property="og:[^"]+")[^>]*>/gi,'').replace(/<link\b[^>]*rel="(?:canonical|alternate|icon)"[^>]*>/gi,'');
   html=start+'\n'+head(meta)+html.slice(end);
  }
  const tag=`<script type="application/ld+json" id="${schemaId}">${json(meta.schema)}</script>`;
  const pattern=new RegExp(`<script type="application/ld\\+json" id="${schemaId}">[\\s\\S]*?<\\/script>`);
  return pattern.test(html)?html.replace(pattern,tag):html.replace('</head>',tag+'\n</head>');
 }
 function apply(document,meta,schemaId){
  document.title=meta.title;
  const set=(selector,value,property='content')=>{const node=document.querySelector(selector);if(node)node[property]=value;};
  set('meta[name="description"]',meta.description);
  for(const prefix of ['og','twitter'])for(const [key,value] of Object.entries({title:meta.title,description:meta.description,image:meta.image,'image:alt':meta.imageAlt}))set(`meta[${prefix==='og'?'property':'name'}="${prefix}:${key}"]`,value);
  // Legacy query URLs and preview hosts consolidate to the matching published language page.
  set('link[rel="canonical"]',meta.canonical,'href');set('meta[property="og:url"]',meta.canonical);
  set('meta[property="og:locale"]',{en:'en_GB',nl:'nl_NL',es:'es_ES'}[meta.lang]);
  document.querySelectorAll('link[rel=alternate][hreflang]').forEach(link=>link.href=pageUrl(meta.page,link.hreflang==='x-default'?'en':link.hreflang));
  const schema=document.getElementById(schemaId);if(schema)schema.textContent=json(meta.schema);
 }
 const api={origin,base,organization,pageUrl,imageUrl,concept,gallery,head,staticHTML,apply};
 if(typeof module!=='undefined')module.exports=api;
 root.PublicConceptSEO=api;
})(typeof window==='undefined'?globalThis:window);
