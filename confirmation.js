(function(){
 'use strict';
 const S=window.Site,C=window.SiteCore,F=window.DemoConfirmation;if(!S||!F)return;
 const {config:c,lang,h,l,link}=S,type=new URLSearchParams(location.search).get('type')||'booking',data=F.read(c,type);
 const copy={
  nl:{demo:'Bedankt voor je aanvraag.',booking:'Je afspraak is bevestigd.',enquiry:'Je bericht is verzonden.',table:'Je reservering is bevestigd.',empty:'Je volgende stap.',intro:'Alles overzichtelijk bij elkaar.',emptyIntro:'Begin op de website van het bedrijf.',badge:'Gegevens nog te bevestigen',summary:'Jouw overzicht',service:'Onderwerp',date:'Datum',time:'Tijd',party:'Personen',general:'Algemene vraag',message:'Contactvraag',moving:'Gewenste verhuisdatum',back:'Terug naar de website',confirmed:'Bevestigd',note:'Je bevestiging bevat de verdere gegevens.'},
  en:{demo:'Thank you for your enquiry.',booking:'Your appointment is confirmed.',enquiry:'Your message has been sent.',table:'Your reservation is confirmed.',empty:'Your next step.',intro:'Everything, at a glance.',emptyIntro:'Start on the business website.',badge:'Details await confirmation',summary:'Your summary',service:'Topic',date:'Date',time:'Time',party:'Guests',general:'General enquiry',message:'Contact enquiry',moving:'Preferred moving date',back:'Back to the website',confirmed:'Confirmed',note:'Your confirmation contains the next details.'}
 };
 const t=key=>(copy[lang]||copy.en)[key],demo=data?.status==='demo';
 const topic=[...(c.services||[]),...(c.contact?.topics||[])].find(service=>service.id===(data?.serviceId||data?.topicId));
 const rows=[];if(data){if(type!=='table')rows.push([type==='enquiry'?t('service'):S.t('service'),topic?l(topic.title):t(type==='enquiry'?'general':'message')]);if(data.date)rows.push([t('date'),new Intl.DateTimeFormat(C.locale(lang),{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(data.date+'T12:00:00Z'))]);if(data.time)rows.push([t('time'),data.time]);if(data.party)rows.push([t('party'),String(data.party)]);if(data.movingDate)rows.push([t('moving'),new Intl.DateTimeFormat(C.locale(lang),{day:'numeric',month:'long',year:'numeric'}).format(new Date(data.movingDate+'T12:00:00Z'))]);}
 const title=!data?t('empty'):demo?t('demo'):t(type);
 document.title=title+' · '+c.name;
 document.getElementById('main').innerHTML=`<section class="thanks-page"><div class="container thanks-layout"><div class="thanks-copy"><div class="thanks-mark" aria-hidden="true">${C.brandIcon(c)}</div><p class="eyebrow">${h(c.name)}</p><h1>${h(title)}</h1><p class="thanks-intro">${h(t(data?'intro':'emptyIntro'))}</p><a class="button thanks-back" id="thanksBack" href="${h(link('index.html'))}">${h(t('back'))} <span aria-hidden="true">↗</span></a></div>${data?`<aside class="thanks-summary"><p class="eyebrow">${h(t('summary'))}</p><h2>${h(c.shortName)}</h2><dl>${rows.map(([label,value])=>`<div><dt>${h(label)}</dt><dd>${h(value)}</dd></div>`).join('')}</dl><p>${h(t(demo?'badge':'note'))}</p><span class="thanks-business">${h(c.business.address||c.business.city||'')}</span></aside>`:''}</div></section>`;
 document.getElementById('thanksBack').addEventListener('click',()=>F.clear());
 window.LocaleBootstrap?.ready();
})();
