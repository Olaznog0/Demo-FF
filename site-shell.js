(function(){
'use strict';
const C=window.SiteCore,I=window.SiteI18n;
window.ClientRegistry||={defaultClient:window.PublicClientRegistry?.defaultClient||'ayden',clients:{}};
if(window.PublicClientRegistry?.clients)for(const [id,config]of Object.entries(window.PublicClientRegistry.clients))window.ClientRegistry.clients[id]=config;
for(const config of [window.DentistConfig,window.AccountantConfig,window.MovingConfig,window.RestaurantConfig])if(config?.id)window.ClientRegistry.clients[config.id]=config;
let resolved;try{resolved=C.resolve(window.ClientRegistry,location.search);}catch{document.getElementById('main').innerHTML='<div class="container error-page"><h1>'+I.translate('configError','en')+'</h1><a href="index.html">Home</a></div>';window.LocaleBootstrap?.ready();return;}
const {config:c,lang}=resolved;
function rootLink(path,client,language){return '/'+C.link(path,client,language).replace(/^\/+/, '');}
const S=window.Site={config:c,lang,t:key=>I.localize(c.ui?.[key],lang)||I.translate(key,lang),l:value=>I.localize(value,lang),h:C.escape,link:path=>{if(path==='faq.html'&&c.id!=='ff')return rootLink((c.homePage||'index.html')+'#faq',c.id,lang);if(c.homePage&&(path.startsWith('index.html')||path==='faq.html')){const hash=path==='faq.html'?(c.id==='ff'?'information':'faq'):path.split('#')[1];return rootLink(c.homePage+(hash?'#'+(c.navAnchors?.[hash]||hash):''),c.id,lang);}return rootLink(path,c.id,lang);}};
const {t,h,link}=S;
document.documentElement.lang=lang;document.documentElement.dataset.layout=c.theme.layout;
document.body?.classList?.add('sector-'+c.theme.layout);
for(const [key,value] of Object.entries(c.theme)){const names={primary:'--primary',accent:'--accent',background:'--bg',font:'--heading-font',bodyFont:'--body-font'};if(names[key])document.documentElement.style.setProperty(names[key],value);}
const page=document.documentElement.dataset.page||'home';
function languageLink(code){const target=new URL(location.href||((location.origin||'http://local')+location.pathname+location.search+location.hash));target.searchParams.set('client',c.id);target.searchParams.set('lang',code);return target.pathname+target.search+target.hash;}
document.title=`${c.name} · ${page==='booking'?t('booking'):page==='faq'?t('faq'):c.business.city||''}`;
document.querySelector('meta[name="description"]').content=S.l(c.copy.heroIntro);
document.getElementById('skip').textContent=t('skip');
const nav=c.sections.filter(id=>['services','reviews','contact'].includes(id)).map(id=>`<a href="${h(link('index.html#'+id))}">${h(t(id))}</a>`).join('');
document.getElementById('siteHeader').innerHTML=`<header class="site-header"><div class="container header-inner"><a class="brand" href="${h(link('index.html'))}" aria-label="${h(c.name)}" title="${h(c.name)}">${C.brandIcon(c)}<span class="brand-name">${h(c.shortName)}<small class="brand-descriptor">${h(C.brandDescriptor(c,lang))}</small></span></a><nav class="main-nav" aria-label="${h(t('nav'))}">${nav}</nav><div class="header-actions"><div class="lang-switch" role="group" aria-label="${h(t('language'))}">${C.languageOrder(c.languages).map(code=>`<a lang="${code}" class="lang-btn ${code===lang?'is-active':''}" href="${h(languageLink(code))}" aria-current="${code===lang?'true':'false'}" aria-label="${h(C.languageName(code))}">${C.languageContent(code)}</a>`).join('')}</div><a class="button small desktop-cta" href="${h(link('booking.html'))}">${h(t('book'))}<span aria-hidden="true">↗</span></a><button id="mobileMenuBtn" class="mobile-menu-btn" aria-label="${h(t('menu'))}" aria-expanded="false" aria-controls="mobileMenu">☰</button></div></div><nav id="mobileMenu" class="mobile-menu container" aria-label="${h(t('nav'))}" hidden>${nav}<a href="${h(link('booking.html'))}">${h(t('book'))}</a><a href="${h(link('faq.html'))}">${h(t('faq'))}</a></nav></header>`;
document.getElementById('siteFooter').innerHTML=`<footer class="site-footer"><div class="container footer-top"><a class="brand footer-brand" href="${h(link('index.html'))}">${C.brandIcon(c)}<span class="brand-name">${h(c.shortName)}<small class="brand-descriptor">${h(C.brandDescriptor(c,lang))}</small></span></a><a href="${h(link('faq.html'))}">${h(t('faq'))} ↗</a><span>${h(c.business.locationLabel||'')}</span></div><div class="container footer-bottom"><p>${h(c.name)} · ${h(c.business.city||'')}</p><details><summary>${h(t('updated'))}</summary><ul>${c.sources.map(s=>`<li><a href="${h(C.safeUrl(s.url))}" target="_blank" rel="noopener noreferrer">${h(new URL(s.url).hostname)}</a></li>`).join('')}</ul></details><details><summary>${h(t('privacy'))}</summary><p>${h(t('privacyText'))}</p><p><a href="https://cloud.google.com/maps-platform/terms" target="_blank" rel="noopener noreferrer">${h(t('googleTerms'))}</a> · <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">${h(t('googlePrivacy'))}</a></p></details></div></footer>`;
const button=document.getElementById('mobileMenuBtn'),menu=document.getElementById('mobileMenu');
function close(){menu.hidden=true;button.setAttribute('aria-expanded','false');}
button.addEventListener('click',()=>{menu.hidden=!menu.hidden;button.setAttribute('aria-expanded',String(!menu.hidden));});
menu.addEventListener('click',e=>{if(e.target.closest('a'))close();});document.addEventListener('keydown',e=>{if(e.key==='Escape'){close();button.focus();}});
})();
