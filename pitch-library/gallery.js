(function(){
'use strict';
const registry=window.PitchClientRegistry,C=window.SiteCore;
const translations={
 en:{eyebrow:'WEBSITES FOR LOCAL BUSINESSES',title:'Distinct websites.\nBuilt around your business.',intro:'Explore personal website presentations across five industries.',note:'Each presentation brings its own identity, layout and route to contact.',meet:'Let’s build your website ↗',open:'Explore the website ↗',titleMeta:'Business website presentations · Ocimatik',families:{salon:'Hair & beauty',restaurants:'Restaurant',dentists:'Dentistry',accountants:'Accounting',movers:'Moving services'}},
 nl:{eyebrow:'WEBSITES VOOR LOKALE BEDRIJVEN',title:'Eigen websites.\nRond jouw bedrijf.',intro:'Ontdek persoonlijke websitepresentaties in vijf sectoren.',note:'Elke presentatie heeft een eigen identiteit, ontwerp en route naar contact.',meet:'Laten we jouw website bouwen ↗',open:'Bekijk de website ↗',titleMeta:'Websitepresentaties voor bedrijven · Ocimatik',families:{salon:'Haar & beauty',restaurants:'Restaurant',dentists:'Tandarts',accountants:'Administratie',movers:'Verhuizen'}},
 es:{eyebrow:'SITIOS WEB PARA NEGOCIOS LOCALES',title:'Sitios propios.\nPensados para tu negocio.',intro:'Explora presentaciones de sitios web personales en cinco sectores.',note:'Cada presentación tiene su propia identidad, diseño y camino hacia el contacto.',meet:'Construyamos tu sitio web ↗',open:'Explorar el sitio ↗',titleMeta:'Presentaciones web para negocios · Ocimatik',families:{salon:'Peluquería',restaurants:'Restaurante',dentists:'Odontología',accountants:'Contabilidad',movers:'Mudanzas'}}
};
const requested=new URLSearchParams(location.search).get('lang'),lang=window.LocaleBootstrap?.resolve(['en','nl','es'],'en',requested)||(Object.hasOwn(translations,requested)?requested:'en');
const copy=translations[lang],businessLanguage=lang==='nl'?'nl':'en',local=value=>typeof value==='string'?value:value?.[businessLanguage]||value?.en||'',h=C.escape;
const clients=registry.readyClients();
document.documentElement.lang=lang;document.title=copy.titleMeta;
document.querySelector('meta[name="description"]').content=copy.intro;
document.querySelector('meta[property="og:title"]').content=copy.titleMeta;
document.querySelector('meta[property="og:description"]').content=copy.intro;
document.querySelectorAll('[data-copy]').forEach(element=>element.textContent=copy[element.dataset.copy]);
document.querySelectorAll('[data-language]').forEach(element=>{if(element.dataset.language===lang)element.setAttribute('aria-current','page');});
const localHost=['localhost','127.0.0.1','[::1]'].includes(location.hostname),origin=localHost?location.protocol+'//'+location.hostname+':4173/':'https://ocimatik.com/';
document.querySelectorAll('[data-main]').forEach(element=>{const target=new URL(origin);target.searchParams.set('lang',lang);if(element.closest('footer'))target.hash='contacto';element.href=target.href;});
document.getElementById('pitchGrid').innerHTML=clients.map(client=>`<a class="card pitch-card pitch-card--${h(client.pitch.slot)}" href="/pitches/index.html?${h(new URLSearchParams({client:client.id,lang:businessLanguage}))}" style="--pitch-primary:${client.theme.primary};--pitch-accent:${client.theme.accent};--pitch-background:${client.theme.background}"><div class="card-visual"><img src="${h(client.images.hero)}" alt="${h(local(client.images.heroAlt))}" width="640" height="400" loading="lazy" decoding="async"><span class="pitch-card-mark" aria-hidden="true">${C.brandIcon(client)}</span></div><div class="card-copy"><span>${h(copy.families[client.pitch.family])}</span><h2>${h(client.name)}</h2><p>${h(client.business.city)}</p><strong>${h(copy.open)}</strong></div></a>`).join('');
const schema={'@context':'https://schema.org','@type':'CollectionPage',name:copy.titleMeta,description:copy.intro,inLanguage:lang,mainEntity:{'@type':'ItemList',itemListElement:clients.map((client,index)=>({'@type':'ListItem',position:index+1,name:client.name,url:new URL('/pitches/index.html?'+new URLSearchParams({client:client.id,lang:businessLanguage}),location.href).href}))}};
document.getElementById('pitchSchema').textContent=JSON.stringify(schema);
window.LocaleBootstrap?.ready();
})();
