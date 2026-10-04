(function(){
'use strict';
const C=window.SiteCore,registry=window.PitchClientRegistry;
let resolved;
try{resolved=C.resolve(registry,location.search);}catch{
 document.title='Ocimatik';document.getElementById('main').innerHTML='<div class="container pitch-unavailable"><h1>Ocimatik</h1><a href="/pitch-library/index.html">Websiteconcepten · Website concepts ↗</a></div>';window.LocaleBootstrap?.ready();return;
}
const {config:c,lang}=resolved,h=C.escape,l=value=>typeof value==='string'?value:value?.[lang]||value?.en||'';
document.body.classList.add('pitch--'+c.pitch.slot);
document.documentElement.dataset.pitchVariant=c.pitch.slot;
for(const [key,value]of Object.entries(c.theme)){if(['primary','accent','background','ink','font','bodyFont'].includes(key))document.documentElement.style.setProperty('--'+key,value);}
const visual=`<figure class="visual pitch-visual"><img src="${h(c.images.hero)}" alt="${h(l(c.images.heroAlt))}" width="1536" height="1024" fetchpriority="high"></figure>`;
const paths={scissors:'M6 14 23 3M10 14 25 22M12 12l4 4M3 14a4 4 0 1 0 8 0 4 4 0 0 0-8 0Zm16 10a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z',calendar:'M4 7h23v20H4ZM10 3v8M21 3v8M4 14h23M10 19h4M19 19h3',flame:'M16 2c2 8-5 9-2 15 2-1 4-4 5-7 8 7 9 17-3 18C3 27 3 15 11 9c-1 6 1 7 3 7-4-6 2-9 2-14Z',tooth:'M12 3C8 1 3 3 4 9l2 8c1 4 3 8 5 8 2 0 1-8 4-8s2 8 4 8c2 0 4-4 5-8l2-8c1-6-4-8-8-6-2 1-4 1-6 0Z',document:'M6 3h13l6 6v19H6ZM18 3v7h7M10 15h10M10 20h10M10 25h6',briefcase:'M3 10h26v18H3ZM10 10V5h12v5M3 17h26M13 17v5h6v-5',truck:'M3 8h16v13H3ZM19 12h5l4 5v4h-9ZM5 23a3 3 0 1 0 6 0 3 3 0 0 0-6 0Zm15 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z',box:'m4 9 12-5 12 5v15l-12 5-12-5ZM4 9l12 6 12-6M16 15v14M10 6l12 6'};
const icons=name=>`<svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name]||paths.document}"/></svg>`;
function updateBusinessDetails(place){
 const contact=document.querySelector('.contact-grid>div:first-child');
 if(place.address){const caption=document.querySelector('.map-caption>p'),address=contact?.querySelector('.actions')?.nextElementSibling;if(caption)caption.textContent=place.address;if(address?.tagName==='P')address.textContent=place.address;}
 const phone=String(place.phone||'').replace(/[\s()-]/g,'');
 if(/^\+?\d{7,15}$/.test(phone)){
  const calls=document.querySelectorAll('a[href^="tel:"]');calls.forEach(link=>link.href='tel:'+phone);
  if(!calls.length)contact?.querySelector('.actions')?.insertAdjacentHTML('beforeend',`<a class="button light" href="tel:${h(phone)}">${h(lang==='nl'?'Bel het bedrijf':'Call the business')} ↗</a>`);
 }
 if(Array.isArray(place.hours)&&place.hours.length&&contact){
  let hours=contact.querySelector('.hours');
  if(!hours){const title=document.createElement('h3');title.textContent=lang==='nl'?'Openingstijden':'Opening hours';hours=document.createElement('div');hours.className='hours';contact.append(title,hours);}
  hours.replaceChildren(...place.hours.map(row=>{const line=document.createElement('div');line.textContent=String(row);return line;}));
 }
}
window.SectorSite.render({client:c,lang,visual,icons,onPlace:updateBusinessDetails});
// SectorSite mounts ContactWidget, which owns the shared FAQ and navigation link.
document.querySelector('meta[name="description"]').content=l(c.copy.heroIntro);
const schema={'@context':'https://schema.org','@type':'WebPage',name:document.title,inLanguage:lang,about:{'@type':{salon:'HairSalon',restaurants:'Restaurant',dentists:'Dentist',accountants:'AccountingService',movers:'MovingCompany'}[c.pitch.family],name:c.name,address:c.business.address,sameAs:c.business.mapsUrl,...(c.business.phone?{telephone:c.business.phone}:{})}};
const structured=document.createElement('script');structured.type='application/ld+json';structured.textContent=JSON.stringify(schema).replace(/</g,'\\u003c');document.head.append(structured);
window.PitchSite={client:c,lang};
})();
