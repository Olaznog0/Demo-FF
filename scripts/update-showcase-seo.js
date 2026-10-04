'use strict';
const fs=require('node:fs/promises'),path=require('node:path'),SEO=require('../concepts/seo.js'),registry=require('../public-client-config.js');
const root=path.resolve(__dirname,'..');
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const galleryAlts={
 en:{accountants:'A bright office with wooden desks',restaurants:'Chicken, rice and golden plantain on a rustic plate',movers:'Moving boxes and an open van outside a home',salon:'A stylist cutting hair in a sunlit salon',dentists:'A bright dental reception with a welcoming waiting area'},
 nl:{accountants:'Licht kantoor met houten bureaus',restaurants:'Kip, rijst en goudgele bakbanaan op een rustiek bord',movers:'Verhuisdozen en een open bestelwagen voor een woning',salon:'Een kapper knipt haar in een zonnige salon',dentists:'Lichte tandartsreceptie met een uitnodigende wachtruimte'},
 es:{accountants:'Oficina luminosa con escritorios de madera',restaurants:'Pollo, arroz y plátano dorado en un plato rústico',movers:'Cajas de mudanza y una furgoneta abierta frente a una casa',salon:'Un peluquero corta el cabello en un salón luminoso',dentists:'Recepción dental luminosa con una acogedora sala de espera'}
};
const galleryAria={
 en:{'Ocimatik home':'Ocimatik home','Main navigation':'Main navigation','Language':'Language','Open menu':'Open menu','Footer navigation':'Footer navigation'},
 nl:{'Ocimatik home':'Ocimatik · home','Main navigation':'Hoofdnavigatie','Language':'Taal','Open menu':'Menu openen','Footer navigation':'Voettekstnavigatie'},
 es:{'Ocimatik home':'Ocimatik · inicio','Main navigation':'Navegación principal','Language':'Idioma','Open menu':'Abrir menú','Footer navigation':'Navegación del pie'}
};
async function update(){
 for(const client of Object.values(registry.clients)){
  const original=await fs.readFile(path.join(root,client.homePage),'utf8');
  for(const language of ['en','nl']){
  const meta=SEO.concept(client,language),file=path.join(root,language==='en'?client.homePage:client.homePage.replace('index.html','nl.html'));let html=original;
  html=html.replace(/<html[^>]*>/,`<html lang="${language}" data-page="home" data-locales="en,nl" data-locale-default="${language}">`);
  if(!html.includes('src="/concepts/seo.js"'))html=html.replace('<script defer src="/concepts/public-site.js">','<script defer src="/concepts/seo.js"></script><script defer src="/concepts/public-site.js">');
  html=SEO.staticHTML(html,meta,'conceptSchema');
  const notice=`<nav class="public-portfolio" aria-label="${language==='nl'?'Kruimelpad':'Breadcrumb'}"><div class="container"><a href="https://ocimatik.com/">Ocimatik</a><span aria-hidden="true">/</span><a data-portfolio-library href="/sectors/${language==='nl'?'nl':'index'}.html">${language==='nl'?'Websiteconcepten':'Website concepts'}</a><span aria-hidden="true">/</span><span data-portfolio-label>${escape(client.name)} · ${language==='nl'?'Websiteontwerp van Ocimatik':'Website design by Ocimatik'}</span></div></nav>`;
  if(html.includes('class="public-portfolio"'))html=html.replace(/<nav class="public-portfolio"[\s\S]*?<\/nav>/,notice);
  else html=html.replace(/(<body[^>]*>)/,'$1'+notice);
  const fallback=`<noscript><section class="container public-static"><p>${language==='nl'?'Websiteontwerpportfolio van Ocimatik':'Ocimatik website design portfolio'}</p><h1>${escape(client.name)} · ${escape(client.copy.heroTitle[language].replace(/\n/g,' '))}</h1><p>${escape(meta.description)}</p><img src="${escape(client.images.hero)}" alt="${escape(meta.imageAlt)}" width="1536" height="1024"><h2>${language==='nl'?'Ontdek dit ontwerp':'Explore this design'}</h2><ul>${client.services.map(service=>`<li><strong>${escape(service.title[language])}</strong> — ${escape(service.description[language])}</li>`).join('')}</ul><p>${language==='nl'?'Een website voor jouw bedrijf? Bespreek je plannen met Ocimatik.':'Looking for a website for your business? Tell Ocimatik about your plans.'}</p><a href="https://ocimatik.com/#contacto">${language==='nl'?'Bespreek jouw website':'Let’s discuss your website'}</a> · <a href="/sectors/${language==='nl'?'nl':'index'}.html">${language==='nl'?'Bekijk alle websiteconcepten':'Explore all website concepts'}</a></section></noscript>`;
  html=html.replace(/<noscript>[\s\S]*?<\/noscript>/,fallback);
  await fs.writeFile(file,html);
  }
 }
 const clients=['northline','brasa','brightmove','bloom','lumen'].map(id=>registry.clients[id]),original=await fs.readFile(path.join(root,'sectors/index.html'),'utf8');
 const visible={en:{intro:'Five industries. Five distinct designs. Find the experience that fits your business.'},nl:{skip:'Naar inhoud',navHome:'Home',navServices:'Diensten',navConcepts:'Ontwerpen',navContact:'Contact',eyebrow:'WEBSITES VOOR LOKALE BEDRIJVEN',title:'Sterke bedrijven.<br>Een betere plek online.',intro:'Vijf sectoren. Vijf eigen ontwerpen. Ontdek de website die bij jouw bedrijf past.',salonTag:'Haar & beauty',restaurantTag:'Restaurant',dentalTag:'Tandarts',accountingTag:'Administratie',movingTag:'Verhuizen',salon:'Een warm welkom en een duidelijke route naar je volgende afspraak.',restaurant:'Latijnse smaken, de menukaart en eenvoudig een tafel reserveren.',dental:'Een geruststellend eerste bezoek, met praktische informatie binnen handbereik.',accounting:'Goed advies begint met een helder eerste gesprek.',moving:'Jouw datum, jouw route en een eenvoudige verhuisaanvraag.',open:'Bekijk de website ↗',note:'Ontdek onze ontwerpen. Stel je voor wat we voor jouw bedrijf kunnen maken.',meet:'Laten we jouw website bouwen ↗',footerStatement:'Websites die passen bij jouw bedrijf.',footerSpecialists:'Web · AI · Salesforce',backTop:'Terug naar boven ↑'},es:{skip:'Ir al contenido',navHome:'Inicio',navServices:'Servicios',navConcepts:'Diseños',navContact:'Contacto',eyebrow:'SITIOS WEB PARA NEGOCIOS LOCALES',title:'Grandes negocios.<br>Una mejor presencia digital.',intro:'Cinco sectores. Cinco diseños propios. Descubre la experiencia que encaja con tu negocio.',salonTag:'Peluquería',restaurantTag:'Restaurante',dentalTag:'Odontología',accountingTag:'Contabilidad',movingTag:'Mudanzas',salon:'Una bienvenida cálida y un camino claro hacia tu próxima cita.',restaurant:'Sabor latino, la carta y una reserva de mesa sencilla.',dental:'Una primera visita tranquila, con información práctica a mano.',accounting:'El asesoramiento profesional empieza con una buena conversación.',moving:'Tu fecha, tu recorrido y una consulta de mudanza fácil.',open:'Explorar el sitio ↗',note:'Explora nuestros diseños. Imagina lo que podemos crear para tu negocio.',meet:'Construyamos tu sitio web ↗',footerStatement:'Sitios web pensados para tu negocio.',footerSpecialists:'Web · IA · Salesforce',backTop:'Volver arriba ↑'}};
 for(const language of ['en','nl','es']){
  const file=path.join(root,'sectors',language==='en'?'index.html':language+'.html');let html=original;
  html=html.replace(/<html[^>]*>/,`<html lang="${language}" data-agency-origin="https://ocimatik.com" data-locale-scope="agency" data-locales="en,nl,es" data-locale-default="${language}">`);
  if(!html.includes('src="../concepts/seo.js"'))html=html.replace('<script src="gallery.js" defer>','<script src="../public-client-config.js" defer></script><script src="../concepts/seo.js" defer></script><script src="gallery.js" defer>');
  html=SEO.staticHTML(html,SEO.gallery(clients,language),'gallerySchema');
  html=html.replace(/(<(a|p|h1|h2|strong|span|div)\b[^>]*data-copy="([^"]+)"[^>]*>)[\s\S]*?(<\/\2>)/g,(all,start,_tag,key,end)=>visible[language][key]?start+(key==='title'?visible[language][key]:escape(visible[language][key]))+end:all);
  html=html.replace(/<img\b[^>]*data-alt="([^"]+)"[^>]*>/g,(tag,key)=>{
   if(!galleryAlts[language][key])throw new Error('Missing native gallery image description: '+language+'/'+key);
   return tag.replace(/\balt="[^"]*"/,'alt="'+escape(galleryAlts[language][key])+'"');
  });
  html=html.replace(/\baria-label="([^"]*)"/g,(attribute,label)=>Object.hasOwn(galleryAria[language],label)?'aria-label="'+escape(galleryAria[language][label])+'"':attribute);
  html=html.replace(/(<a data-language="([^"]+)"[^>]*href=")[^"]*/g,(_all,start,lang)=>start+(lang==='en'?'index.html':lang+'.html'));
  html=html.replace(/<a data-language="([^"]+)"[^>]*>/g,(tag,lang)=>tag.replace(/\saria-current="[^"]*"/g,'').replace(/>$/,lang===language?' aria-current="page">':'>'));
  if(language==='nl')html=html.replace(/(href="\/concepts\/[^/]+\/)index\.html\?client=([^"&]+)&amp;lang=en/g,'$1nl.html?client=$2&amp;lang=nl');
  await fs.writeFile(file,html);
 }
 console.log('Updated static production metadata for five concepts and the Ocimatik portfolio gallery.');
}
module.exports={update};
if(require.main===module)update().catch(error=>{console.error(error.message);process.exitCode=1;});
