(function(){
 'use strict';
 const c=window.PublicConceptConfig,C=window.SiteCore;
 if(!c||!C)return;
 const requested=new URLSearchParams(location.search).get('lang');
 const lang=c.languages.includes(requested)?requested:c.defaultLanguage;
 const h=C.escape,l=value=>typeof value==='string'?value:value?.[lang]||value?.en||'';
 const text={nl:{voices:'Ervaringen',voicesIntro:'Verhalen uit ons conceptkwartier.',local:'Een stukje buurt.\nEen warm welkom.',map:'Vredespaleis · Den Haag',mapContext:'Een monument in de stad',address:'Adres in het conceptkwartier',more:'Meer websites',previous:'Vorige',next:'Volgende',play:'Automatisch afspelen',pause:'Pauzeren',footer:'Portfolio concept van Ocimatik'},en:{voices:'Guest voices',voicesIntro:'Stories from our imagined neighbourhood.',local:'A little local colour.\nA warm welcome.',map:'Peace Palace · The Hague',mapContext:'A landmark in the city',address:'Address in the concept quarter',more:'More websites',previous:'Previous',next:'Next',play:'Play automatically',pause:'Pause',footer:'Portfolio concept by Ocimatik'}}[lang];
 const paths={scissors:'M6 14 23 3M10 14 25 22M12 12l4 4M3 14a4 4 0 1 0 8 0 4 4 0 0 0-8 0Zm16 10a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z',tooth:'M12 3C8 1 3 3 4 9l2 8c1 4 3 8 5 8 2 0 1-8 4-8s2 8 4 8c2 0 4-4 5-8l2-8c1-6-4-8-8-6-2 1-4 1-6 0Z',flame:'M16 2c2 8-5 9-2 15 2-1 4-4 5-7 8 7 9 17-3 18C3 27 3 15 11 9c-1 6 1 7 3 7-4-6 2-9 2-14Z',document:'M6 3h13l6 6v19H6ZM18 3v7h7M10 15h10M10 20h10M10 25h6',box:'m4 9 12-5 12 5v15l-12 5-12-5ZM4 9l12 6 12-6M16 15v14M10 6l12 6',truck:'M3 8h16v13H3ZM19 12h5l4 5v4h-9ZM5 23a3 3 0 1 0 6 0 3 3 0 0 0-6 0Zm15 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z',calendar:'M4 7h23v20H4ZM10 3v8M21 3v8M4 14h23M10 19h4M19 19h3',spark:'m16 3 4 9 9 4-9 4-4 9-4-9-9-4 9-4Z',briefcase:'M3 10h26v18H3ZM10 10V5h12v5M3 17h26M13 17v5h6v-5'};
 const icon=name=>`<svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name]||paths.document}"/></svg>`;
 const logoName={salon:'scissors',restaurant:'flame',dentist:'tooth',accountant:'document','moving-company':'box'}[c.sector];
 if(c.sector!=='salon'){
  const visual=`<div class="visual public-visual"><img class="public-cover" src="${h(c.images.hero)}" alt="${h(c.name)}" width="1536" height="1024" fetchpriority="high"></div>`;
  window.SectorSite.render({client:c,lang,visual,logo:icon(logoName),icons:icon});
  Object.entries({primary:c.theme.primary,teal:c.theme.primary,accent:c.theme.accent,paper:c.theme.background}).forEach(([key,value])=>document.documentElement.style.setProperty('--'+key,value));
 }
 document.title=c.name+' · '+l(c.copy.heroTitle).replace(/\n/g,' ');
 document.querySelector('meta[name="description"]').content=l(c.copy.heroIntro);
 document.querySelectorAll('.lang-btn,.langs a').forEach(link=>{
  const language=link.getAttribute('lang')||new URL(link.getAttribute('href'),location.href).searchParams.get('lang');
  if(c.languages.includes(language))link.href='/'+c.homePage+'?lang='+language;
 });
 // A landmark is presented in its own name; it never acts as a pin for a fictional business.
 const mapHtml=`<iframe title="${h(text.map)}" src="${h(C.mapEmbed(c))}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe><div class="map-caption"><strong>${h(text.map)}</strong><p>${h(text.mapContext)}</p><a class="text-link" href="${h(c.map.source)}" target="_blank" rel="noopener noreferrer">${h(text.mapContext)} ↗</a></div>`;
 const map=document.querySelector(c.sector==='salon'?'.map-card':'.location-grid .map');
 if(map){map.classList.remove('map-concept');map.innerHTML=mapHtml;}
 const section=document.getElementById(c.sector==='salon'?'reviews':'location');
 if(section){
  const eyebrow=section.querySelector('.section-head .eyebrow');if(eyebrow)eyebrow.textContent=text.voices;
  const title=section.querySelector('.section-head h2');if(title)title.innerHTML=text.local.split('\n').map(h).join('<br>');
 }
 const box=document.getElementById(c.sector==='salon'?'googleReviews':'reviews');
 const carousel=()=>`<div data-carousel role="region" aria-label="${h(text.voices)}"><div class="carousel-track" data-carousel-track tabindex="0">${c.feedback.map(person=>`<article class="public-voice"><div class="public-voice-author"><span class="public-avatar" aria-hidden="true">${h(person.initials)}</span><strong>${h(person.author)}</strong></div><blockquote>${h(l(person.text))}</blockquote></article>`).join('')}</div><div class="carousel-footer"><span class="carousel-position" data-carousel-progress></span><button class="carousel-autoplay" data-carousel-toggle type="button" aria-pressed="false">${h(text.play)}</button><div class="carousel-arrows"><button data-carousel-prev type="button" aria-label="${h(text.previous)}">←</button><button data-carousel-next type="button" aria-label="${h(text.next)}">→</button></div></div></div>`;
 if(box){box.innerHTML=`<h3>${h(text.voices)}</h3><p class="public-voices-intro">${h(text.voicesIntro)}</p>${carousel()}`;}
 document.querySelectorAll('.image-credit,.hero-credit,.visual-caption,.whatsapp-state,.google-attribution,#googleAttribution').forEach(element=>element.remove());
 if(c.sector==='salon'){
  document.querySelectorAll('#liveBusinessHours .fine-print').forEach(caption=>caption.remove());
  document.querySelectorAll('.brand-mark').forEach(mark=>mark.innerHTML=icon('scissors'));
  document.querySelectorAll('.brand-name small').forEach(label=>label.textContent=l(c.ui.brandLabel));
  const phone=document.querySelector('.contact-info .phone-link');
  if(phone&&!c.business.phone){const label=phone.previousElementSibling;if(label?.classList.contains('contact-label'))label.remove();phone.remove();}
  const address=document.querySelector('.contact-info .contact-label');if(address)address.textContent=text.address;
 }
 if(c.sector==='restaurant'){
  document.querySelectorAll('.service-card').forEach((card,index)=>{
   const service=c.services[index],holder=card.querySelector('.service-icon');
   if(holder&&service.image)holder.outerHTML=`<img class="public-dish" src="${h(service.image)}" alt="${h(l(service.title))}" width="520" height="400" loading="lazy">`;
   const reserve=card.querySelector('.text-link');
   if(reserve){reserve.href='/booking.html?'+new URLSearchParams({client:c.id,lang});reserve.textContent=l(c.ui.book)+' ↗';}
  });
 }
 const footer=document.getElementById(c.sector==='salon'?'siteFooter':'footer');
 if(footer)footer.innerHTML=`<footer class="public-footer"><div class="container"><a class="public-footer-brand" href="/${h(c.homePage)}?lang=${lang}">${icon(logoName)}<strong>${h(c.name)}</strong></a><p>${h(text.footer)}</p><a class="text-link" href="/sectors/index.html?lang=${lang}">${h(text.more)} ↗</a></div></footer>`;
 const mounted=[];
 box?.querySelectorAll('[data-carousel]').forEach(element=>mounted.push(window.SalonCarousel.mount(element,{playLabel:text.play,pauseLabel:text.pause})));
 window.addEventListener('pagehide',()=>mounted.forEach(item=>item.destroy()),{once:true});
})();
