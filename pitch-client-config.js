(function(root){
'use strict';
const businesses=typeof module!=='undefined'?require('./pitch-businesses.js'):root.PitchBusinesses||[];
const bi=(nl,en)=>({nl,en});
const themes={
 'salon-a':{primary:'#3c5146',accent:'#dfc59d',background:'#f5f2e9',ink:'#233b30',font:'Georgia, Cambria, serif',composition:'arch'},
 'salon-b':{primary:'#643952',accent:'#f3c3b8',background:'#faf3f2',ink:'#3f2436',font:'Arial, Helvetica, sans-serif',composition:'reverse'},
 'restaurants-a':{primary:'#8e3c25',accent:'#f2cc8d',background:'#fbf4e8',ink:'#3b2418',font:'Georgia, Cambria, serif',composition:'cover'},
 'restaurants-b':{primary:'#46513b',accent:'#d9db99',background:'#f5f5ec',ink:'#293425',font:'Arial, Helvetica, sans-serif',composition:'table'},
 'dentists-a':{primary:'#176a72',accent:'#c9ecea',background:'#f6fbfa',ink:'#203d45',font:'Arial, Helvetica, sans-serif',composition:'practice'},
 'dentists-b':{primary:'#264fa2',accent:'#dfcbac',background:'#f8f7f2',ink:'#21375b',font:'Georgia, Cambria, serif',composition:'panorama'},
 'accountants-a':{primary:'#273d54',accent:'#b9c8d3',background:'#f5f2eb',ink:'#243243',font:'Georgia, Cambria, serif',composition:'ledger'},
 'accountants-b':{primary:'#2b564e',accent:'#d2dfa0',background:'#eef5ef',ink:'#203e39',font:'Arial, Helvetica, sans-serif',composition:'reverse'},
 'movers-a':{primary:'#183b50',accent:'#edbd76',background:'#f6f4ec',ink:'#1e3645',font:'Arial, Helvetica, sans-serif',composition:'route'},
 'movers-b':{primary:'#4c3d72',accent:'#d4df91',background:'#f7f5fa',ink:'#352949',font:'Arial, Helvetica, sans-serif',composition:'dispatch'}
};
const families={
 salon:{sector:'salon',layout:'salon',icon:'salon',image:'/assets/salon-scene.webp',alt:bi('Een kapsalon','A hair salon'),title:bi('Jouw haar.\nJouw volgende bezoek.','Your hair.\nYour next visit.'),book:bi('Plan je bezoek','Plan your visit'),intro:bi('Bespreek je haarwensen en je voorkeursdatum. Neem contact op om de mogelijkheden af te stemmen.','Discuss your hair plans and preferred date. Get in touch to agree on the next step.'),topics:[['hair','Je haarwensen bespreken','Discuss your hair plans','scissors'],['visit','Een bezoek plannen','Plan a visit','calendar']]},
 restaurants:{sector:'restaurant',layout:'restaurant',icon:'restaurant',image:'/assets/restaurant-cover.webp',alt:bi('Een maaltijd','A meal'),title:bi('Een goede maaltijd.\nEen volgend bezoek.','A good meal.\nYour next visit.'),book:bi('Bespreek je bezoek','Discuss your visit'),intro:bi('Stel je vraag over de kaart of bespreek een bezoek. Stem je wensen rechtstreeks af met het bedrijf.','Ask about the menu or discuss a visit. Agree on your plans directly with the business.'),topics:[['visit','Een bezoek bespreken','Discuss a visit','calendar'],['menu','Een vraag over de kaart','Ask about the menu','flame']]},
 dentists:{sector:'dentist',layout:'dental',icon:'dental',image:'/assets/dental-office-cover.webp',alt:bi('Een tandartspraktijk','A dental practice'),title:bi('Je volgende bezoek.\nEen duidelijke eerste stap.','Your next visit.\nA clear first step.'),book:bi('Plan je bezoek','Plan your visit'),intro:bi('Stel je praktische vraag of bespreek een eerste bezoek. De praktijk bevestigt de mogelijkheden voor een afspraak.','Ask a practical question or discuss a first visit. The practice confirms the options for an appointment.'),topics:[['visit','Een bezoek bespreken','Discuss a visit','tooth'],['introduction','Een eerste kennismaking','A first introduction','calendar']]},
 accountants:{sector:'accountant',layout:'accounting',icon:'accounting',image:'/assets/accounting-office-concept.webp',alt:bi('Een kantoor','An office'),title:bi('Jouw onderneming.\nEen helder gesprek.','Your business.\nA clear conversation.'),book:bi('Plan een gesprek','Plan a conversation'),intro:bi('Vertel over je onderneming en de vraag die je wilt bespreken. Begin met een persoonlijk contactmoment.','Tell us about your business and the question you would like to discuss. Start with a personal conversation.'),topics:[['administration','Je administratie bespreken','Discuss your administration','document'],['introduction','Een kennismaking plannen','Plan an introduction','briefcase']]},
 movers:{sector:'moving-company',layout:'moving',icon:'moving',image:'/assets/moving-cover.webp',alt:bi('Een verhuizing','A move'),title:bi('Jouw route.\nEen nieuw begin.','Your route.\nA new beginning.'),book:bi('Plan je verhuizing','Plan your move'),intro:bi('Geef je vertrekplaats, bestemming en voorkeursdatum door. Bespreek de planning en ondersteuning voor jouw verhuizing.','Share your starting point, destination and preferred date. Discuss the planning and support for your move.'),topics:[['move','Je verhuizing bespreken','Discuss your move','truck'],['planning','De planning afstemmen','Discuss the plan','box']]}
};
const slots=Object.keys(families).flatMap(family=>['a','b'].map(variant=>({id:family+'-'+variant,family,variant})));
const clone=value=>JSON.parse(JSON.stringify(value));
const date=value=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return false;const parsed=new Date(value+'T12:00:00Z');return Number.isFinite(parsed.getTime())&&parsed.toISOString().slice(0,10)===value;};
const url=value=>{try{const parsed=new URL(value);return parsed.protocol==='https:'||parsed.protocol==='http:'?parsed.href:'';}catch{return '';}};
function calendarOverrides(value){
 if(value===undefined)return {};
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(key=>!['tableReservation','workingDays','exampleSlots'].includes(key)))throw new Error('Pitch calendar overrides only accept tableReservation, workingDays and exampleSlots');
 if(Object.hasOwn(value,'tableReservation')&&typeof value.tableReservation!=='boolean')throw new Error('tableReservation must be a boolean');
 if(Object.hasOwn(value,'workingDays')&&(!Array.isArray(value.workingDays)||!value.workingDays.length||value.workingDays.some(day=>!Number.isInteger(day)||day<0||day>6)||new Set(value.workingDays).size!==value.workingDays.length))throw new Error('workingDays must contain distinct weekdays');
 if(Object.hasOwn(value,'exampleSlots')&&(!Array.isArray(value.exampleSlots)||value.exampleSlots.length>48||value.exampleSlots.some(time=>!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))||new Set(value.exampleSlots).size!==value.exampleSlots.length))throw new Error('exampleSlots must contain distinct HH:MM preferences');
 return clone(value);
}
function faqContent(business){
 const provided=business.faqContent??business.faq;
 if(provided!==undefined){
  if(!Array.isArray(provided)||provided.length!==3||provided.some(item=>['q','a'].some(key=>['nl','en'].some(lang=>typeof item?.[key]?.[lang]!=='string'||!item[key][lang].trim()))))throw new Error('Pitch FAQ requires three questions and answers in NL and EN');
  return clone(provided);
 }
 const channels=[business.phoneDisplay||business.phone,business.email].filter(Boolean).join(' · ');
 return [
  {q:bi('Hoe neem ik contact op?','How can I get in touch?'),a:bi(channels?'Neem rechtstreeks contact op via '+channels+'.':'Gebruik de contactgegevens op Google Maps om je vraag rechtstreeks te bespreken.',channels?'Contact the business directly via '+channels+'.':'Use the contact details on Google Maps to discuss your enquiry directly.')},
  {q:bi('Hoe bespreek ik mijn voorkeursdatum?','How can I discuss my preferred date?'),a:bi('Geef je vraag en gewenste datum door. Het bedrijf bevestigt de mogelijkheden rechtstreeks; de online agenda toont een voorbeeldproces.','Share your enquiry and preferred date. The business confirms the options directly; the online calendar demonstrates the process.')},
  {q:bi('Waar vind ik '+business.name.trim()+'?','Where can I find '+business.name.trim()+'?'),a:bi(business.address.trim(),business.address.trim())}
 ];
}
function createClient(business){
 const slot=slots.find(item=>item.id===business?.slot);
 if(!slot)throw new Error('Unknown pitch slot');
 if(!/^[a-z][a-z0-9-]{2,60}$/.test(business.id||'')||['constructor','prototype','__proto__','ff','ayden','fogon','dental','accounting','moving','bloom','brasa','lumen','northline','brightmove'].includes(business.id))throw new Error('Invalid or reserved pitch client ID');
 if(!business.name?.trim()||!business.address?.trim()||!business.city?.trim()||!url(business.mapsUrl))throw new Error('Verified business identity required');
 const verified=business.verification;
 const noWebsite=verified?.websiteStatus==='none-confirmed',broken=verified?.websiteStatus==='broken-confirmed'&&verified.normalBrowserVerified===true&&verified.commercialAlternativesNegative===true;
 if((!noWebsite&&!broken)||!date(verified.checked)||!Array.isArray(verified.sources)||!verified.sources.length||verified.sources.some(source=>!url(source.url)||!source.label))throw new Error('Current no-website evidence or normal-browser broken-site evidence required');
 const coordinates=business.coordinates;
 if(coordinates&&(!Number.isFinite(coordinates.lat)||!Number.isFinite(coordinates.lng)||Math.abs(coordinates.lat)>90||Math.abs(coordinates.lng)>180))throw new Error('Invalid verified coordinates');
 const placeId=business.placeId||'';
 if(placeId&&(!/^[A-Za-z0-9_-]{10,255}$/.test(placeId)||/^\d+$/.test(placeId)))throw new Error('A Maps CID is not a Places API place ID');
 if(!placeId&&!coordinates)throw new Error('A verified Place ID or coordinates are required');
 if(business.cid&&!/^\d{1,22}$/.test(String(business.cid)))throw new Error('Invalid Maps CID');
 const family=families[slot.family],theme=themes[slot.id];
 const client={
  id:business.id,name:business.name.trim(),shortName:business.shortName?.trim()||business.name.trim(),sector:family.sector,brandIcon:family.icon,
  market:'nl',languages:['nl','en'],defaultLanguage:'nl',timeZone:'Europe/Amsterdam',
  theme:{...theme,bodyFont:'Arial, Helvetica, sans-serif',layout:family.layout},homePage:'pitches/index.html',
  navAnchors:{services:'information',reviews:'location',gallery:'location',contact:'contact',process:'contact',faq:'faq'},sections:['services','reviews','faq','contact'],
  business:{address:business.address.trim(),city:business.city.trim(),phone:business.phone||'',phoneDisplay:business.phoneDisplay||business.phone||'',email:business.email||'',website:'',mapsUrl:url(business.mapsUrl),coordinates:coordinates?clone(coordinates):null},
  proof:null,google:{enabled:true,placeId,resolvePlaceId:!placeId,photosEnabled:true,maxPhotos:6,syncBusinessDetails:true,endpoint:'/api/place',reviewsEndpoint:'/api/google-reviews'},
  calendar:{mode:'demo',confirmed:false,endpoint:'/api/bookings',bookingUrl:'',tableReservation:false,workingDays:[0,1,2,3,4,5,6],exampleSlots:['10:00','11:30','14:00','16:00'],serviceDurations:{},...calendarOverrides(business.calendar)},
  contact:{mode:'demo',confirmed:false,endpoint:'/api/contact'},whatsapp:{enabled:false,number:''},extensions:{chatbot:false,automations:false},
  hours:[],services:family.topics.map(([id,nl,en,icon])=>({id,title:bi(nl,en),description:bi('Bespreek je vraag rechtstreeks met het bedrijf.','Discuss your enquiry directly with the business.'),icon})),
  copy:{eyebrow:bi(business.name.trim(),business.name.trim()),heroTitle:clone(family.title),heroIntro:clone(family.intro),serviceTitle:bi('Waar wil je\nmee beginnen?','Where would you\nlike to begin?'),serviceIntro:bi('Kies het onderwerp voor je eerste contact.','Choose the topic for your first conversation.'),contactTitle:bi('Laten we\ncontact maken.','Let’s\nget in touch.')},
  ui:{book:clone(family.book),plan:clone(family.book),bookingTitle:bi('Plan je volgende stap.','Plan your next step.'),home:bi('Terug naar '+business.name.trim(),'Back to '+business.name.trim()),brandLabel:bi(business.name.trim(),business.name.trim()),demoResult:bi('Je hebt het afspraakproces bekeken. Er is niets verzonden.','You have explored the appointment process. Nothing has been sent.')},
  images:{hero:family.image,heroType:'concept',heroAlt:clone(family.alt)},sources:clone(verified.sources),faqContent:faqContent(business),
  pitch:{slot:slot.id,family:slot.family,variant:slot.variant,checked:verified.checked,cid:business.cid?String(business.cid):'',websiteStatus:verified.websiteStatus}
 };
 if(client.calendar.tableReservation){if(slot.family!=='restaurants')throw new Error('Table reservation requires a restaurant pitch');client.ui.book=bi('Plan je tafel','Plan your table');client.ui.plan=clone(client.ui.book);}
 // No proof, review text, service claim or opening hours are inferred from another template.
 if(business.hours)client.hours=clone(business.hours);
 if(business.copy)for(const [key,value]of Object.entries(business.copy)){if(Object.hasOwn(client.copy,key))client.copy[key]=clone(value);}
 if(business.ui){
  const allowed=['book','plan','bookingTitle','home','demoResult','brandLabel','brandDescriptor'];
  if(typeof business.ui!=='object'||Array.isArray(business.ui)||Object.entries(business.ui).some(([key,value])=>!allowed.includes(key)||['nl','en'].some(lang=>typeof value?.[lang]!=='string'||!value[lang].trim())))throw new Error('Pitch UI overrides require supported bilingual labels');
  Object.assign(client.ui,clone(business.ui));
 }
 if(business.services)client.services=clone(business.services);
 if(business.image&&(/^\/assets\/[A-Za-z0-9_-]+\.(?:webp|svg|jpe?g|png)$/.test(business.image)||url(business.image))){client.images.hero=business.image;client.images.heroType=business.imageType==='business'?'business':'concept';client.images.heroAlt=business.imageAlt||clone(family.alt);}
 if(business.snapshot){if(business.snapshot.clientId!==client.id||!date(business.snapshot.checked))throw new Error('Review snapshot belongs to a different or undated business');client.google.snapshot=clone(business.snapshot);}
 return client;
}
function buildRegistry(assignments=businesses){
 const clients={},usedSlots=new Set(),usedMaps=new Set();
 for(const business of assignments){const client=createClient(business);if(Object.hasOwn(clients,client.id)||usedSlots.has(client.pitch.slot))throw new Error('Duplicate pitch client or slot');const mapsKeys=[client.google.placeId&&'place:'+client.google.placeId,client.pitch.cid&&'cid:'+client.pitch.cid,'url:'+client.business.mapsUrl].filter(Boolean);if(mapsKeys.some(key=>usedMaps.has(key)))throw new Error('Each pitch must represent a distinct business');usedSlots.add(client.pitch.slot);mapsKeys.forEach(key=>usedMaps.add(key));clients[client.id]=client;}
 return {defaultClient:Object.keys(clients)[0]||null,clients};
}
const registry=buildRegistry();
const api={...registry,slots,themes,createClient,buildRegistry,readyClients:()=>slots.flatMap(slot=>Object.values(registry.clients).filter(client=>client.pitch.slot===slot.id))};
if(typeof module!=='undefined')module.exports=api;
root.PitchClientRegistry=api;
})(typeof window==='undefined'?globalThis:window);
