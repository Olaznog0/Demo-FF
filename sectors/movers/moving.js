(function(){
 'use strict';
 const c=window.MovingConfig,C=window.SiteCore,requested=new URLSearchParams(location.search).get('lang'),lang=C.resolveLanguage(c,requested),h=C.escape;
 const caption=lang==='nl'?'Conceptillustratie · geen voertuig van het bedrijf':'Concept illustration · not the business’s vehicle';
 const truck='<path d="M3 8h16v13H3ZM19 12h5l4 5v4h-9Z"/><circle cx="8" cy="23" r="3"/><circle cx="23" cy="23" r="3"/>';
 const logo=`<svg viewBox="0 0 32 30" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">${truck}</svg>`;
 const icon=name=>`<svg viewBox="0 0 32 30" aria-hidden="true">${name==='calendar'?'<rect x="4" y="6" width="23" height="20" rx="2"/><path d="M10 3v6M21 3v6M4 13h23M10 19h5M19 19h3"/>':name==='box'?'<path d="m4 8 12-5 12 5v16l-12 5-12-5ZM4 8l12 6 12-6M16 14v15M10 5l12 6"/>':truck}</svg>`;
 const visual=`<div class="visual"><img class="sector-cover" src="${h(c.images?.hero||'../../assets/moving-cover.webp')}" alt="${h(lang==='nl'?'Verhuisdozen en een open bestelwagen bij een woning':'Moving boxes and an open van outside a home')}" width="1536" height="1024" fetchpriority="high"></div>`;
 window.SectorSite.render({client:c,lang,visual,logo,icons:icon});
})();
