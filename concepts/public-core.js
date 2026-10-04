(function(){
 'use strict';
 const C=window.SiteCore,originalLink=C.link,originalMap=C.mapEmbed,originalLanguage=C.resolveLanguage,originalFAQ=C.faqMarkup;
 C.resolveLanguage=(config,requested)=>{
  const pageLanguage=location.pathname.match(/\/(nl|en)\.html$/)?.[1];
  return originalLanguage(config,requested??pageLanguage??null);
 };
 C.link=(...args)=>'/'+originalLink(...args);
 C.faqMarkup=(config,lang)=>{
  const markup=originalFAQ(config,lang);
  return config.concept?.fictional?markup.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g,''):markup;
 };
 C.mapEmbed=config=>{
  if(!config.concept?.fictional||!config.map?.query)return originalMap(config);
  const url=new URL('https://www.google.com/maps');
  url.search=new URLSearchParams({q:config.map.query,output:'embed',z:'16'});
  return url.href;
 };
 // Original vector portraits and sample scores belong only to fictional concepts.
 // They never carry Google branding, profile URLs or verified-review claims.
 const h=C.escape;
 const labels={en:{rating:'out of 5',voices:'guest voices',avatar:'Illustrated avatar of'},nl:{rating:'van 5',voices:'ervaringen',avatar:'Geïllustreerde avatar van'}};
 const language=lang=>lang==='nl'?'nl':'en';
 const format=(value,lang)=>new Intl.NumberFormat(language(lang),{minimumFractionDigits:1,maximumFractionDigits:1}).format(value);
 const validRating=value=>Number.isInteger(value)&&value>=1&&value<=5;
 const aggregate=config=>{
  if(!config?.concept?.fictional)throw new TypeError('Sample feedback is restricted to fictional concepts');
  const ratings=(config.feedback||[]).map(person=>person.rating);
  if(!ratings.length||!ratings.every(validRating))throw new TypeError('Every sample voice needs a score from one to five');
  return {count:ratings.length,rating:ratings.reduce((sum,rating)=>sum+rating,0)/ratings.length};
 };
 const stars=(rating,lang)=>{
  if(!Number.isFinite(rating)||rating<1||rating>5)throw new TypeError('A valid rating is required');
  const label=format(rating,lang)+' '+labels[language(lang)].rating;
  return `<span class="public-rating-stars" role="img" aria-label="${h(label)}"><span aria-hidden="true">☆☆☆☆☆</span><span class="public-rating-fill" style="width:${rating*20}%" aria-hidden="true">★★★★★</span></span>`;
 };
 const avatar=(person,lang)=>{
  const seed=String(person.avatarSeed||person.author||'');
  const hash=Array.from(seed).reduce((sum,character)=>(sum*31+character.codePointAt(0))>>>0,0);
  const palettes=[['#f6dece','#efbb99','#49322f','#647b6a'],['#dce7ef','#9f684e','#28272b','#39576a'],['#eee0e6','#f2c4a4','#725d49','#856b7c'],['#e5e9db','#c68d68','#352e28','#536151'],['#efe4d3','#d6a783','#68513d','#7b5c42']];
  const [background,skin,hair,shirt]=palettes[hash%palettes.length];
  const longHair=hash%2===0;
  const hairBack=longHair?'<path d="M15 29c0-15 7-22 17-22s17 7 17 22v19H15Z"/>':'<path d="M17 27C17 10 25 7 33 7c12 0 17 9 14 24H17Z"/>';
  const hairFront=longHair?'M20 28c0-10 4-15 12-15 5 0 8 4 13 4l-1 12c-3-7-8-9-16-11-1 5-4 8-8 10Z':'M18 26c-1-8 3-14 10-14 5 0 6 4 13 2 5 5 6 10 4 15-2-7-6-8-8-9-4 4-9 5-19 6Z';
  const detail=(hash>>>8)%3;
  const accessory=detail===1?`<g fill="none" stroke="${hair}" stroke-width="1.3"><circle cx="27" cy="29" r="4"/><circle cx="37" cy="29" r="4"/><path d="M31 29h2m-13-2 3 1m18 0 3-1"/></g>`:detail===2?'<g fill="#b7894c"><circle cx="20" cy="36" r="1.4"/><circle cx="44" cy="36" r="1.4"/></g>':'';
  return `<svg class="public-avatar-portrait" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="${h(labels[language(lang)].avatar+' '+person.author)}" focusable="false"><rect width="64" height="64" rx="32" fill="${background}"/><g fill="${hair}">${hairBack}</g><path d="M10 64c0-14 8-22 22-22s22 8 22 22" fill="${shirt}"/><path d="M27 39h10v9c-3 5-7 5-10 0Z" fill="${skin}"/><ellipse cx="32" cy="29" rx="12" ry="16" fill="${skin}"/><path d="${hairFront}" fill="${hair}"/><g fill="#332b2a"><circle cx="27" cy="29" r="1.1"/><circle cx="37" cy="29" r="1.1"/></g><path d="M32 30v4m-4 3q4 4 8 0" fill="none" stroke="#784934" stroke-width="1.1" stroke-linecap="round"/>${accessory}<path d="m23 48 9 6 9-6" fill="none" stroke="#fff9" stroke-width="2" stroke-linecap="round"/></svg>`;
 };
 const summary=(config,lang)=>{
  const result=aggregate(config);
  return `<div class="public-voice-summary" data-feedback-count="${result.count}">${stars(result.rating,lang)}<span class="public-voice-average" aria-hidden="true"><strong>${h(format(result.rating,lang))}</strong><span> / 5</span></span><span class="public-voice-count">${result.count} ${h(labels[language(lang)].voices)}</span></div>`;
 };
 const card=(person,lang)=>{
  if(person.kind!=='fictional-concept'||!validRating(person.rating))throw new TypeError('Sample feedback must be explicitly fictional with its own rating');
  const content=person.text?.[language(lang)]||person.text?.en||'';
  return `<article class="public-voice"><div class="public-voice-author"><span class="public-avatar">${avatar(person,lang)}</span><strong>${h(person.author)}</strong></div><div class="public-voice-score">${stars(person.rating,lang)}<span class="public-voice-score-value" aria-hidden="true">${h(format(person.rating,lang))} / 5</span></div><blockquote lang="${language(lang)}">${h(content)}</blockquote></article>`;
 };
 C.publicFeedback=Object.freeze({aggregate,stars,avatar,summary,card});
})();
