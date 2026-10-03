(function(){
 'use strict';
 const c=window.DentistConfig,C=window.SiteCore;
 const requested=new URLSearchParams(location.search).get('lang'),lang=C.resolveLanguage(c,requested);
 const rows={illustration:['Conceptillustratie · geen praktijkfoto','Concept illustration · not a practice photograph'],pillTitle:['Met aandacht voor je bezoek','A thoughtful next visit'],pillText:['Een helder eerste contact','A clear first contact']};
 const t=key=>rows[key]?.[lang==='nl'?0:1]||key,h=C.escape;
 const tooth='<path d="M12 3c-4-2-9 0-8 6l2 8c1 4 3 8 5 8 2 0 1-8 4-8s2 8 4 8c2 0 4-4 5-8l2-8c1-6-4-8-8-6-2 1-4 1-6 0Z"/>';
 const icon=(name='tooth')=>`<svg viewBox="0 0 30 30" aria-hidden="true">${name==='calendar'?'<rect x="4" y="6" width="22" height="20" rx="3"/><path d="M9 3v6M21 3v6M4 12h22M9 18h4M17 18h4M9 22h4"/>':name==='spark'?'<path d="m15 3 3.4 8.6L27 15l-8.6 3.4L15 27l-3.4-8.6L3 15l8.6-3.4Z"/>':tooth}</svg>`;
 const logo=`<svg viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">${tooth}</svg>`;
 const visual=`<div class="visual"><img class="sector-cover" src="${h(c.images?.hero||'../../assets/dental-office-cover.webp')}" alt="${h(lang==='nl'?'Lichte ontvangstruimte':'Bright reception interior')}" width="1536" height="1024" fetchpriority="high"></div>`;
 window.SectorSite.render({client:c,lang,visual,logo,icons:icon});
})();
