(function(root){
 'use strict';
 const C=root.SiteCore;
 const mounted=new WeakMap();
 let sequence=0;
 const copy={
  title:{nl:'Stuur een bericht',en:'Send a message',es:'Envía un mensaje',ca:'Envia un missatge'},
  intro:{nl:'Een vraag over je bezoek? Laat je contactgegevens achter zodat het bedrijf kan reageren.',en:'A question about your visit? Leave your contact details so the business can reply.',es:'¿Tienes una consulta? Deja tus datos de contacto para que el negocio pueda responder.',ca:'Tens una consulta? Deixa les teves dades de contacte perquè el negoci pugui respondre.'},
  pending:{nl:'De e-mailverbinding moet nog worden geactiveerd.',en:'The email connection still needs to be activated.',es:'Falta activar la conexión de correo.',ca:'Cal activar la connexió de correu.'},
  demo:{nl:'Demoformulier · Er wordt niets verzonden.',en:'Demo form · Nothing will be sent.',es:'Formulario demo · No se envía nada.',ca:'Formulari demo · No s’envia res.'},
  demoPrivacy:{nl:'Je invoer blijft alleen op deze pagina. Deel hier geen gevoelige informatie.',en:'Your input stays on this page only. Do not share sensitive information here.',es:'Lo que escribas se queda en esta página. No incluyas datos sensibles.',ca:'El que escriguis es queda en aquesta pàgina. No incloguis dades sensibles.'},
  demoSend:{nl:'Bekijk overzicht',en:'View summary',es:'Ver resumen',ca:'Veure el resum'},
  demoSuccess:{nl:'Bedankt voor je demobericht. Je hebt het contactproces bekeken; er is geen bericht of e-mail verzonden.',en:'Thank you for your demo message. You have previewed the contact process; no message or email was sent.',es:'Gracias por tu mensaje de demo. Has probado el contacto; no se ha enviado ningún mensaje ni correo.',ca:'Gràcies pel missatge de demo. Has provat el contacte; no s’ha enviat cap missatge ni correu.'},
  movingTitle:{nl:'Jouw verhuisplannen · optioneel',en:'Your moving plans · optional',es:'Tus planes de mudanza · opcional',ca:'Els teus plans de mudança · opcional'},
  movingDate:{nl:'Wanneer wil je verhuizen?',en:'When would you like to move?',es:'¿Cuándo quieres hacer la mudanza?',ca:'Quan vols fer la mudança?'},
  movingFrom:{nl:'Van · plaats of postcode',en:'From · city or postcode',es:'Origen · ciudad o código postal',ca:'Origen · ciutat o codi postal'},
  movingTo:{nl:'Naar · plaats of postcode',en:'To · city or postcode',es:'Destino · ciudad o código postal',ca:'Destinació · ciutat o codi postal'},
  movingNote:{nl:'Alleen je voorkeuren; {business} bevestigt de datum.',en:'Your preferences only; {business} confirms the date.',es:'Solo tus preferencias; {business} confirma la fecha.',ca:'Només les teves preferències; {business} confirma la data.'},
  dateError:{nl:'Kies een datum vanaf morgen, of laat de datum leeg voor een algemene vraag.',en:'Choose a date from tomorrow, or leave it blank for a general enquiry.',es:'Elige una fecha a partir de mañana, o déjala vacía para una consulta general.',ca:'Tria una data a partir de demà, o deixa-la buida per a una consulta general.'},
  name:{nl:'Je naam',en:'Your name',es:'Tu nombre',ca:'El teu nom'},email:{nl:'E-mailadres',en:'Email address',es:'Correo electrónico',ca:'Correu electrònic'},phone:{nl:'Telefoon · optioneel',en:'Phone · optional',es:'Teléfono · opcional',ca:'Telèfon · opcional'},topic:{nl:'Onderwerp',en:'Topic',es:'Tema',ca:'Tema'},general:{nl:'Algemene vraag',en:'General enquiry',es:'Consulta general',ca:'Consulta general'},message:{nl:'Je bericht',en:'Your message',es:'Tu mensaje',ca:'El teu missatge'},
  privacy:{nl:'Je contactgegevens worden gebruikt om je vraag te beantwoorden.',en:'Your contact details are used to respond to your enquiry.',es:'Tus datos de contacto se usan para responder a tu consulta.',ca:'Les dades de contacte s’utilitzen per respondre a la consulta.'},
  send:{nl:'Verstuur bericht',en:'Send message',es:'Enviar mensaje',ca:'Enviar missatge'},sending:{nl:'Bericht versturen…',en:'Sending your message…',es:'Enviando el mensaje…',ca:'Enviant el missatge…'},
  success:{nl:'Je bericht is verzonden. Het bedrijf kan via je opgegeven contactgegevens reageren.',en:'Your message has been sent. The business can reply using the contact details you provided.',es:'Tu mensaje se ha enviado. El negocio puede responder usando los datos de contacto que has indicado.',ca:'El missatge s’ha enviat. El negoci pot respondre amb les dades de contacte que has indicat.'},
  unavailable:{nl:'De e-mailverbinding is nog niet actief. Je bericht is niet verstuurd. Gebruik het openbare telefoonnummer als dat beschikbaar is.',en:'The email connection is not active yet. Your message has not been sent. Use the public phone number if one is available.',es:'La conexión de correo todavía no está activa. Tu mensaje no se ha enviado. Usa el teléfono público si está disponible.',ca:'La connexió de correu encara no està activa. El missatge no s’ha enviat. Utilitza el telèfon públic si està disponible.'},
  error:{nl:'We konden de ontvangst van je bericht niet bevestigen. Neem rechtstreeks contact op voordat je het opnieuw verstuurt.',en:'We could not confirm receipt of your message. Contact the business directly before sending it again.',es:'No pudimos confirmar la recepción del mensaje. Contacta directamente con el negocio antes de volver a enviarlo.',ca:'No hem pogut confirmar la recepció del missatge. Contacta directament amb el negoci abans de tornar-lo a enviar.'}
 };
 function detect(){return root.Site?.config||root.MovingConfig||root.DentistConfig||root.AccountantConfig||root.RestaurantConfig;}
 function mount(element,{client=detect(),lang=document.documentElement.lang||'en'}={}){
  if(!element||!client?.id||!C)return null;
  const language=Object.hasOwn(copy.title,lang)?lang:'en',t=key=>copy[key][language],h=C.escape;
  const previous=mounted.get(element);
  if(previous?.client===client&&previous.language===language&&element.querySelector('form')===previous.form)return previous;
  previous?.destroy();
  const local=value=>typeof value==='string'?value:value?.[language]||value?.en||'';
  const id='contact-'+client.id+'-'+(++sequence);
  const connected=client.contact?.confirmed===true,demo=client.contact?.mode==='demo',moving=client.sector==='moving-company';
  const firstDate=C.futureDays({workingDays:[0,1,2,3,4,5,6]},new Date(),client.timeZone||'Europe/Amsterdam')[0].toISOString().slice(0,10);
  const topics=client.contact?.topics||client.services||[];
  const movingFields=moving?`<fieldset class="cw-moving"><legend>${h(t('movingTitle'))}</legend><label for="${id}-movingDate">${h(t('movingDate'))}</label><input id="${id}-movingDate" name="movingDate" type="date" min="${h(firstDate)}"><div class="cw-fields"><div><label for="${id}-movingFrom">${h(t('movingFrom'))}</label><input id="${id}-movingFrom" name="movingFrom" maxlength="90" autocomplete="off"></div><div><label for="${id}-movingTo">${h(t('movingTo'))}</label><input id="${id}-movingTo" name="movingTo" maxlength="90" autocomplete="off"></div></div><p class="cw-privacy">${h(t('movingNote').replace('{business}',client.shortName||client.name||''))}</p></fieldset>`:'';
  element.classList.add('contact-widget');
  element.innerHTML=`<div class="cw-header"><h3 class="cw-title">${h(local(client.contact?.title)||t('title'))}</h3>${demo||!connected?`<p class="cw-pending">${h(t(demo?'demo':'pending'))}</p>`:''}</div>${demo?'':`<p class="cw-intro">${h(t('intro'))}</p>`}<form class="cw-form"><div class="cw-fields"><div class="cw-field"><label for="${id}-name">${h(t('name'))}</label><input id="${id}-name" name="name" autocomplete="name" required maxlength="120"></div><div class="cw-field"><label for="${id}-email">${h(t('email'))}</label><input id="${id}-email" name="email" type="email" autocomplete="email" required maxlength="200"></div></div><div class="cw-fields"><div class="cw-field"><label for="${id}-phone">${h(t('phone'))}</label><input id="${id}-phone" name="phone" type="tel" autocomplete="tel" maxlength="40"></div><div class="cw-field"><label for="${id}-topic">${h(t('topic'))}</label><select id="${id}-topic" name="topic"><option value="">${h(t('general'))}</option>${topics.map(service=>`<option value="${h(service.id)}">${h(local(service.title))}</option>`).join('')}</select></div></div>${movingFields}<div class="cw-field cw-message"><label for="${id}-message">${h(t('message'))}</label><textarea id="${id}-message" name="message" rows="4" required minlength="3" maxlength="1500"></textarea></div><div class="cw-footer">${demo?'':`<p class="cw-privacy">${h(t('privacy'))}</p>`}<button class="cw-submit" type="submit">${h(t(demo?'demoSend':'send'))} <span aria-hidden="true">↗</span></button></div><p class="cw-status" role="status" tabindex="-1"></p></form>`;
  const form=element.querySelector('form'),button=form.querySelector('button'),status=form.querySelector('[role="status"]');
  const controller=new AbortController();let submitting=false;
  form.addEventListener('submit',async event=>{
   event.preventDefault();if(submitting||!form.reportValidity())return;
   submitting=true;button.disabled=true;button.textContent=t('sending');status.textContent='';status.className='cw-status';
   const values=new FormData(form),topic=topics.find(service=>service.id===values.get('topic')),date=String(values.get('movingDate')||'');
   if(moving&&date&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||date<firstDate)){submitting=false;button.disabled=false;button.textContent=t(demo?'demoSend':'send')+' ↗';status.textContent=t('dateError');status.className='cw-status cw-error';status.focus();return;}
   const extra=moving?['movingDate','movingFrom','movingTo'].map(key=>{const value=String(values.get(key)||'').trim();return value?t(key)+': '+value:'';}).filter(Boolean).join('\n'):'';
   const data={name:String(values.get('name')||'').trim(),email:String(values.get('email')||'').trim(),phone:String(values.get('phone')||'').trim(),message:(topic?local(topic.title)+'\n\n':'')+(extra?extra+'\n\n':'')+String(values.get('message')||'').trim(),lang:language};
   const summary={type:'enquiry',topicId:String(values.get('topic')||''),movingDate:date};
   if(demo){submitting=false;button.disabled=false;button.textContent=t('demoSend')+' ↗';if(root.DemoConfirmation?.complete(client,language,summary,'demo'))return;status.textContent=t('demoSuccess');status.className='cw-status cw-success';status.focus();return;}
   try{
    const endpoint=new URL(client.contact?.endpoint||'/api/contact',location.origin);
    if(endpoint.origin!==location.origin)throw new Error('Contact endpoint must use the same origin');
    endpoint.search=new URLSearchParams({client:client.id,lang:language});
    const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify(data),signal:AbortSignal.timeout(15000)});
    if(response.status===503){status.textContent=t('unavailable');status.className='cw-status cw-error';return;}
    const result=await response.json();if(!response.ok||result.ok!==true||typeof result.id!=='string'||!result.id.trim())throw new Error('Receipt not confirmed');
    form.reset();if(root.DemoConfirmation?.complete(client,language,summary,'api',result))return;
    status.textContent=t('success');status.className='cw-status cw-success';
   }catch{status.textContent=t('error');status.className='cw-status cw-error';}
   finally{submitting=false;button.disabled=false;button.textContent=t('send')+' ↗';status.focus();}
  },{signal:controller.signal});
  const api={client,language,form,destroy(){controller.abort();mounted.delete(element);}};mounted.set(element,api);return api;
 }
 function mountAll(options={}){return Array.from(document.querySelectorAll('[data-contact-widget]')).map(element=>mount(element,options)).filter(Boolean);}
 function draft(element){const form=mounted.get(element)?.form;return form?Object.fromEntries(new FormData(form)):null;}
 function restore(element,values){const form=mounted.get(element)?.form;if(!form||!values)return;for(const [name,value] of Object.entries(values)){const field=form.elements.namedItem(name);if(field)field.value=value;}}
 root.ContactWidget={mount,mountAll,draft,restore,copy};
 document.addEventListener('restaurant:render',()=>mountAll({client:root.RestaurantConfig,lang:document.documentElement.lang}));
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>mountAll(),{once:true});else mountAll();
})(typeof window==='undefined'?globalThis:window);
