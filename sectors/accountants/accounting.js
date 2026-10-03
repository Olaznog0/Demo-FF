(function(){
 'use strict';
 const c=window.AccountantConfig,C=window.SiteCore;
 const requested=new URLSearchParams(location.search).get('lang'),lang=c.languages.includes(requested)?requested:c.defaultLanguage;
 const rows={illustration:['Conceptbeeld · geen foto van het Axis-kantoor','Concept image · not a photograph of the Axis office']};
 const t=key=>rows[key]?.[lang==='nl'?0:1]||key,h=C.escape;
 const icon=(name='document')=>`<svg viewBox="0 0 30 30" aria-hidden="true">${name==='calendar'?'<rect x="4" y="6" width="22" height="20"/><path d="M9 3v6M21 3v6M4 12h22M9 18h4M17 18h4"/>':name==='briefcase'?'<rect x="3" y="10" width="24" height="16"/><path d="M10 10V5h10v5M3 16h24M12 16v4h6v-4"/>':'<path d="M7 3h12l5 5v19H7ZM18 3v6h6M11 14h9M11 19h9M11 23h6"/>'}</svg>`;
 const logo='<svg viewBox="0 0 34 40" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 4h26v32H4ZM10 12h14M10 20h14M10 28h8"/></svg>';
 const visual=`<div class="visual office-visual"><img class="office-photo" src="../../assets/accounting-office-concept.webp" alt="${h(t('illustration'))}" width="1536" height="1024"><p class="visual-caption">${h(t('illustration'))}</p></div>`;
 window.SectorSite.render({client:c,lang,visual,logo,icons:icon});
})();
