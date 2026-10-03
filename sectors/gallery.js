(function(){'use strict';
const translations={en:{eyebrow:'WEBSITES FOR LOCAL BUSINESSES',title:'Great businesses.\nA better digital home.',intro:'Five industries. Five distinct designs. Find the experience that fits your business.',salonTag:'Hair & beauty · EN / NL',restaurantTag:'Restaurant · EN / NL',dentalTag:'Dentistry · EN / NL',accountingTag:'Accounting · EN / NL',movingTag:'Moving services · EN / NL',salon:'A warm welcome and a clear path to your next appointment.',restaurant:'Latin flavour, the menu and a simple table reservation.',dental:'A reassuring first visit, with practical information close at hand.',accounting:'Professional advice starts with a useful first conversation.',moving:'Your date, your route and a straightforward moving enquiry.',open:'Explore the demo ↗',note:'Explore our concepts. Imagine what we could create for your business.',meet:'Let’s build your website ↗'},es:{eyebrow:'SITIOS WEB PARA NEGOCIOS LOCALES',title:'Grandes negocios.\nUna mejor presencia digital.',intro:'Cinco sectores. Cinco diseños propios. Descubre la experiencia que encaja con tu negocio.',salonTag:'Peluquería · EN / NL',restaurantTag:'Restaurante · EN / NL',dentalTag:'Odontología · EN / NL',accountingTag:'Contabilidad · EN / NL',movingTag:'Mudanzas · EN / NL',salon:'Una bienvenida cálida y un camino claro hacia tu próxima cita.',restaurant:'Sabor latino, la carta y una reserva de mesa sencilla.',dental:'Una primera visita tranquila, con información práctica a mano.',accounting:'El asesoramiento profesional empieza con una buena conversación.',moving:'Tu fecha, tu recorrido y una consulta de mudanza fácil.',open:'Explorar la demo ↗',note:'Explora nuestros conceptos. Imagina lo que podemos crear para tu negocio.',meet:'Construyamos tu sitio web ↗'}};

Object.assign(translations.en,{skip:'Skip to content',navHome:'Home',navServices:'Services',navConcepts:'Concepts',navContact:'Contact',footerStatement:'Websites built around your business.',footerSpecialists:'Web · AI · Salesforce',backTop:'Back to top ↑',note:'Explore our designs. Imagine what we could create for your business.',open:'Explore the website ↗'});
Object.assign(translations.es,{skip:'Ir al contenido',navHome:'Inicio',navServices:'Servicios',navConcepts:'Diseños',navContact:'Contacto',footerStatement:'Sitios web pensados para tu negocio.',footerSpecialists:'Web · IA · Salesforce',backTop:'Volver arriba ↑',note:'Explora nuestros diseños. Imagina lo que podemos crear para tu negocio.',open:'Explorar el sitio ↗'});
translations.nl={eyebrow:'WEBSITES VOOR LOKALE BEDRIJVEN',title:'Sterke bedrijven.\nEen betere plek online.',intro:'Vijf sectoren. Vijf eigen ontwerpen. Ontdek de website die bij jouw bedrijf past.',salonTag:'Haar & beauty · EN / NL',restaurantTag:'Restaurant · EN / NL',dentalTag:'Tandarts · EN / NL',accountingTag:'Administratie · EN / NL',movingTag:'Verhuizen · EN / NL',salon:'Een warm welkom en een duidelijke route naar je volgende afspraak.',restaurant:'Latijnse smaken, de menukaart en eenvoudig een tafel reserveren.',dental:'Een geruststellend eerste bezoek, met praktische informatie binnen handbereik.',accounting:'Goed advies begint met een helder eerste gesprek.',moving:'Jouw datum, jouw route en een eenvoudige verhuisaanvraag.',open:'Bekijk de website ↗',note:'Ontdek onze ontwerpen. Stel je voor wat we voor jouw bedrijf kunnen maken.',meet:'Laten we jouw website bouwen ↗',skip:'Naar inhoud',navHome:'Home',navServices:'Diensten',navConcepts:'Ontwerpen',navContact:'Contact',footerStatement:'Websites die passen bij jouw bedrijf.',footerSpecialists:'Web · AI · Salesforce',backTop:'Terug naar boven ↑'};
const requested=new URLSearchParams(location.search).get('lang');
let lang=window.LocaleBootstrap?.resolve(['en','nl','es'],'en',requested)||(Object.hasOwn(translations,requested)?requested:'en');
function localize(language){
lang=language;const copy=translations[lang];
document.documentElement.lang=lang;
document.title={en:'Website designs for local businesses · Ocimatik',es:'Diseños web para negocios locales · Ocimatik',nl:'Websiteontwerpen voor lokale bedrijven · Ocimatik'}[lang];
const description={en:'Explore five website designs for accountants, restaurants, movers, salons and dental practices. Clear appointments, contact and mobile browsing.',es:'Explora cinco diseños de sitios web para contabilidad, restaurantes, mudanzas, peluquerías y clínicas dentales. Citas claras, contacto y navegación móvil.',nl:'Ontdek vijf websiteontwerpen voor administratiekantoren, restaurants, verhuisbedrijven, salons en tandartspraktijken. Duidelijke afspraken, contact en mobiel gebruik.'}[lang];
document.querySelector('meta[name="description"]').content=description;
document.querySelector('meta[property="og:title"]').content=document.title;
document.querySelector('meta[property="og:description"]').content=description;
document.querySelectorAll('[data-copy]').forEach(element=>{if(copy[element.dataset.copy])element.textContent=copy[element.dataset.copy];});
const alts={nl:{accountants:'Licht kantoor met houten bureaus',restaurants:'Kip, rijst en goudgele bakbanaan op een rustiek bord',movers:'Verhuisdozen en een open bestelwagen voor een woning',salon:'Een kapper knipt haar in een zonnige salon',dentists:'Lichte tandartsreceptie met een uitnodigende wachtruimte'},en:{accountants:'A bright office with wooden desks',restaurants:'Chicken, rice and golden plantain on a rustic plate',movers:'Moving boxes and an open van outside a home',salon:'A stylist cutting hair in a sunlit salon',dentists:'A bright dental reception with a welcoming waiting area'},es:{accountants:'Oficina luminosa con escritorios de madera',restaurants:'Pollo, arroz y plátano dorado en un plato rústico',movers:'Cajas de mudanza y una furgoneta abierta frente a una casa',salon:'Un peluquero corta el cabello en un salón luminoso',dentists:'Recepción dental luminosa con una acogedora sala de espera'}};
document.querySelectorAll('[data-alt]').forEach(image=>image.alt=alts[lang][image.dataset.alt]);
document.querySelectorAll('[data-language]').forEach(element=>{if(element.dataset.language===lang)element.setAttribute('aria-current','page');else element.removeAttribute('aria-current');});
const configuredOrigin=document.documentElement.dataset.agencyOrigin||'https://ocimatik.com',local=['localhost','127.0.0.1','[::1]'].includes(location.hostname),agencyOrigin=local?location.protocol+'//'+location.hostname+':4173/':configuredOrigin;
document.querySelectorAll('[data-agency-link]').forEach(element=>{const target=new URL(agencyOrigin);target.searchParams.set('lang',lang);target.hash=element.dataset.agencyLink;element.href=target.href;});
document.querySelectorAll('.brand').forEach(element=>element.setAttribute('aria-label',{en:'Ocimatik home',es:'Ocimatik · inicio',nl:'Ocimatik · home'}[lang]));
document.querySelector('.language-switch').setAttribute('aria-label',{en:'Language',es:'Idioma',nl:'Taal'}[lang]);
const nav=document.getElementById('navigation'),toggle=document.querySelector('.menu-toggle');
nav.setAttribute('aria-label',{en:'Main navigation',es:'Navegación principal',nl:'Hoofdnavigatie'}[lang]);
toggle.setAttribute('aria-label',menuLabel(toggle.getAttribute('aria-expanded')==='true'));
document.querySelector('.footer-bottom nav').setAttribute('aria-label',{en:'Footer navigation',es:'Navegación del pie',nl:'Voettekstnavigatie'}[lang]);
const cards=Array.from(document.querySelectorAll('.grid>.card'));
for(const card of cards){const target=new URL(card.getAttribute('href'),location.href);target.searchParams.set('lang',lang==='nl'?'nl':'en');card.href=target.pathname+target.search;}
for(const alternate of document.querySelectorAll('link[rel=alternate][hreflang]')){const target=new URL(location.href);target.searchParams.set('lang',alternate.hreflang);target.hash='';alternate.href=target.href;}
const schema={'@context':'https://schema.org','@type':'CollectionPage',name:document.title,description,inLanguage:lang,mainEntity:{'@type':'ItemList',itemListElement:cards.map((card,index)=>({'@type':'ListItem',position:index+1,name:card.querySelector('h2').textContent,url:new URL(card.getAttribute('href'),location.href).href}))}};
document.getElementById('gallerySchema').textContent=JSON.stringify(schema);
}
const nav=document.getElementById('navigation'),toggle=document.querySelector('.menu-toggle');
const menuLabel=open=>({en:open?'Close menu':'Open menu',es:open?'Cerrar menú':'Abrir menú',nl:open?'Menu sluiten':'Menu openen'}[lang]);
const close=()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label',menuLabel(false));};
close();toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',menuLabel(open));});
nav.addEventListener('click',event=>{if(event.target.closest('a'))close();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){close();toggle.focus();}});
document.querySelectorAll('[data-language]').forEach(element=>element.addEventListener('click',event=>{
 if(event.defaultPrevented||event.button>0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
 const language=element.dataset.language;if(!Object.hasOwn(translations,language))return;
 event.preventDefault();if(language===lang)return;
 const target=new URL(location.href);target.searchParams.set('lang',language);
 window.history.replaceState({},'',target.pathname+target.search+target.hash);
 window.LocaleBootstrap?.remember(language);localize(language);
}));
localize(lang);
window.LocaleBootstrap?.ready();
})();
