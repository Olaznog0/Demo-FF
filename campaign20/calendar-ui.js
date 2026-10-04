(function (root) {
  'use strict';
  const states = new Map();
  const copy = {
    en: { title: 'Let’s plan your visit', salonTitle: 'Your next appointment', intro: 'Pick a date and a preferred time.', date: 'Your preferred date', time: 'Preferred time', choose: 'Choose a time', name: 'Your name', email: 'Email address', message: 'Anything you’d like us to know?', optional: 'Optional', submit: 'Send my request', salonSubmit: 'Request an appointment', previous: 'Previous month', next: 'Next month', required: 'Choose a date and time, and enter your name and email.', invalid: 'Enter a valid email address.', error: 'Your request could not be completed. Please try again.', dateHint: 'Choose your preferred day. Use the arrow keys to move between dates.', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    nl: { title: 'Plan je bezoek', salonTitle: 'Je volgende afspraak', intro: 'Kies een datum en een tijd die je uitkomt.', date: 'Je gewenste datum', time: 'Gewenste tijd', choose: 'Kies een tijd', name: 'Je naam', email: 'E-mailadres', message: 'Wil je ons nog iets laten weten?', optional: 'Optioneel', submit: 'Verstuur mijn verzoek', salonSubmit: 'Vraag een afspraak aan', previous: 'Vorige maand', next: 'Volgende maand', required: 'Kies een datum en tijd en vul je naam en e-mailadres in.', invalid: 'Vul een geldig e-mailadres in.', error: 'Je verzoek kon niet worden afgerond. Probeer het opnieuw.', dateHint: 'Kies je gewenste dag. Gebruik de pijltjestoetsen om tussen datums te bewegen.', days: ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'] }
  };
  const slots = ['10:00', '11:30', '14:00', '15:30', '17:00'];
  function localDay(now = new Date()) {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
    const value = type => parts.find(part => part.type === type).value;
    return value('year') + '-' + value('month') + '-' + value('day');
  }
  function dayDate(day) { return new Date(day + 'T12:00:00Z'); }
  function addDays(day, count) { const date = dayDate(day); date.setUTCDate(date.getUTCDate() + count); return date.toISOString().slice(0, 10); }
  function monthOf(day) { return day.slice(0, 7) + '-01'; }
  function moveMonth(day, delta) { const date = dayDate(monthOf(day)); date.setUTCMonth(date.getUTCMonth() + delta); return date.toISOString().slice(0, 10); }
  function validDay(day, today) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day || '')) return false;
    const parsed = dayDate(day);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === day && day >= today && day <= addDays(today, 90);
  }
  function validateRequest(data, today = localDay()) {
    if (!validDay(data.date, today) || !slots.includes(data.time) || !data.name?.trim() || !data.email?.trim()) return 'required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) return 'invalid';
    return '';
  }
  function identity(options) { if (!options.leadId || !/^[1-9]\d+$/.test(String(options.cid || ''))) throw new Error('A verified business identity is required.'); return options.leadId + ':' + options.cid; }
  function stateFor(options, today) {
    const key = identity(options);
    if (!states.has(key)) states.set(key, { month: monthOf(today), date: '', time: '', name: '', email: '', message: '' });
    const state = states.get(key);
    if (state.date && !validDay(state.date, today)) { state.date = ''; state.time = ''; }
    if (state.month < monthOf(today) || state.month > monthOf(addDays(today, 90))) state.month = monthOf(today);
    return state;
  }
  function installStyles(doc) {
    if (doc.getElementById('campaign-calendar-styles')) return;
    const style = doc.createElement('style'); style.id = 'campaign-calendar-styles';
    style.textContent = '.campaign-calendar{color:var(--ink,#20303c);background:var(--paper,#fff);border:1px solid var(--line,#ccd5db);padding:clamp(20px,3.2vw,42px);border-radius:var(--radius,18px);scroll-margin-top:100px}.campaign-calendar h2{font-size:clamp(27px,3vw,40px);margin:0 0 10px;line-height:1.2}.campaign-calendar .cal-intro{font-size:19px;line-height:1.6;margin:0 0 26px}.campaign-calendar .cal-layout{display:grid;grid-template-columns:minmax(250px,1fr) minmax(250px,1fr);gap:clamp(24px,4vw,52px)}.campaign-calendar .cal-title{display:block;font-size:18px;font-weight:700;margin-bottom:10px}.campaign-calendar .cal-month{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:16px}.campaign-calendar .cal-month strong{font-size:20px;text-align:center;text-transform:capitalize}.campaign-calendar .cal-arrow{border:1px solid #c4cdd3;border-radius:50%;background:#fff;color:#223844;width:44px;height:44px;flex-shrink:0;font:inherit;font-size:25px;cursor:pointer}.campaign-calendar .cal-arrow:disabled{opacity:.4;cursor:default}.campaign-calendar .cal-days,.campaign-calendar .cal-weekdays{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}.campaign-calendar .cal-weekdays span{font-size:14px;font-weight:700;text-align:center;padding:8px 0;color:var(--ink,#20303c)}.campaign-calendar .cal-day{font:inherit;font-size:17px;border:1px solid transparent;background:transparent;color:var(--ink,#20303c);aspect-ratio:1;min-height:40px;border-radius:9px;cursor:pointer}.campaign-calendar .cal-day:disabled{opacity:.3;cursor:default}.campaign-calendar .cal-day[aria-pressed=true]{background:#203d4b;color:#fff;border-color:#203d4b;box-shadow:0 3px 10px #203d4b24}.campaign-calendar .cal-day:not(:disabled):hover{border-color:currentColor}.campaign-calendar .cal-day:focus-visible,.campaign-calendar button:focus-visible,.campaign-calendar input:focus-visible,.campaign-calendar select:focus-visible,.campaign-calendar textarea:focus-visible{outline:3px solid #267fc0;outline-offset:3px}.campaign-calendar .cal-selected{font-size:17px;min-height:28px;margin:16px 0 0;font-weight:600;text-transform:capitalize}.campaign-calendar label{display:block;font-size:17px;font-weight:600;line-height:1.4;margin-bottom:8px}.campaign-calendar .cal-field{margin-bottom:18px}.campaign-calendar input,.campaign-calendar select,.campaign-calendar textarea{font:inherit;font-size:17px;display:block;width:100%;box-sizing:border-box;border:1px solid #a8b6bf;color:#20303c;background:#fff;border-radius:8px;padding:13px 14px;min-height:50px}.campaign-calendar textarea{min-height:88px;resize:vertical}.campaign-calendar .cal-optional{font-size:14px;font-weight:400;margin-left:5px}.campaign-calendar .cal-submit{font:inherit;font-size:18px;font-weight:700;border:0;background:#203d4b;color:#fff;border-radius:var(--radius,10px);padding:16px 22px;min-height:54px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:22px;width:100%;transition:transform .15s}.campaign-calendar .cal-submit:hover{transform:translateY(-2px)}.campaign-calendar .cal-submit:disabled{opacity:.7;cursor:wait}.campaign-calendar .cal-error{color:#9a2525;font-size:16px;line-height:1.5;margin:12px 0 0}.campaign-calendar .cal-error:empty{display:none}.campaign-calendar .cal-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media(max-width:680px){.campaign-calendar .cal-layout{grid-template-columns:1fr}.campaign-calendar .cal-day{min-height:42px}.campaign-calendar{padding:22px 16px}.campaign-calendar .cal-weekdays span{font-size:13px}}@media(prefers-reduced-motion:reduce){.campaign-calendar .cal-submit{transition:none}.campaign-calendar .cal-submit:hover{transform:none}}';
    doc.head.append(style);
  }
  function mount(container, options) {
    if (!container || !root.document) throw new Error('A calendar container is required.');
    if (container.__campaignCalendar) { container.__campaignCalendar.update(options); return container.__campaignCalendar; }
    let config = { ...options }, today = localDay(), state = stateFor(config, today), destroyed = false;
    const key = identity(config), doc = container.ownerDocument;
    installStyles(doc); container.classList.add('campaign-calendar');
    container.innerHTML = '<h2 data-cal-text="title"></h2><p class="cal-intro" data-cal-text="intro"></p><form class="cal-form" novalidate><div class="cal-layout"><div class="cal-date-area"><span class="cal-title" data-cal-text="date"></span><div class="cal-month"><button class="cal-arrow" type="button" data-cal-month="-1">‹</button><strong aria-live="polite"></strong><button class="cal-arrow" type="button" data-cal-month="1">›</button></div><p class="cal-sr cal-hint" id="cal-hint-'+config.leadId+'"></p><div class="cal-weekdays" aria-hidden="true"></div><div class="cal-days" role="group" aria-describedby="cal-hint-'+config.leadId+'"></div><p class="cal-selected" aria-live="polite"></p><div class="cal-field"><label data-cal-text="time" for="cal-time-'+config.leadId+'"></label><select id="cal-time-'+config.leadId+'" name="time" required></select></div></div><div class="cal-details"><div class="cal-field"><label data-cal-text="name" for="cal-name-'+config.leadId+'"></label><input id="cal-name-'+config.leadId+'" name="name" autocomplete="name" maxlength="100" required></div><div class="cal-field"><label data-cal-text="email" for="cal-email-'+config.leadId+'"></label><input id="cal-email-'+config.leadId+'" name="email" type="email" autocomplete="email" maxlength="254" required></div><div class="cal-field"><label for="cal-message-'+config.leadId+'"><span data-cal-text="message"></span><span class="cal-optional" data-cal-text="optional"></span></label><textarea id="cal-message-'+config.leadId+'" name="message" maxlength="2000"></textarea></div><button class="cal-submit" type="submit"><span data-cal-text="submit"></span><span aria-hidden="true">↗</span></button><p class="cal-error" role="alert"></p></div></div></form>';
    const form = container.querySelector('form'), dayGrid = container.querySelector('.cal-days'), error = container.querySelector('.cal-error');
    const text = () => copy[config.lang === 'en' ? 'en' : 'nl'];
    const locale = () => config.lang === 'en' ? 'en-GB' : 'nl-NL';
    function renderDates(focusDay) {
      const first = dayDate(state.month), count = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth()+1, 0, 12)).getUTCDate();
      container.querySelector('.cal-month strong').textContent = new Intl.DateTimeFormat(locale(), { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(first);
      container.querySelector('[data-cal-month="-1"]').disabled = state.month <= monthOf(today);
      container.querySelector('[data-cal-month="1"]').disabled = state.month >= monthOf(addDays(today, 90));
      dayGrid.replaceChildren();
      for (let n=0; n<(first.getUTCDay()+6)%7; n++) { const blank=doc.createElement('span'); blank.setAttribute('aria-hidden','true'); dayGrid.append(blank); }
      for (let n=1; n<=count; n++) {
        const day=state.month.slice(0,8)+String(n).padStart(2,'0'), button=doc.createElement('button');
        button.type='button'; button.className='cal-day'; button.textContent=String(n); button.dataset.day=day; button.disabled=!validDay(day,today);
        button.setAttribute('aria-pressed',String(state.date===day)); button.setAttribute('aria-label',new Intl.DateTimeFormat(locale(),{dateStyle:'full',timeZone:'UTC'}).format(dayDate(day)));
        if(day===today)button.setAttribute('aria-current','date'); dayGrid.append(button);
      }
      container.querySelector('.cal-selected').textContent=state.date?new Intl.DateTimeFormat(locale(),{dateStyle:'long',timeZone:'UTC'}).format(dayDate(state.date)):'';
      if(focusDay)Array.from(dayGrid.querySelectorAll('button')).find(button=>button.dataset.day===focusDay)?.focus();
    }
    function renderLanguage() {
      const t=text(), salon=config.family==='salon';
      for(const node of container.querySelectorAll('[data-cal-text]')) { const field=node.dataset.calText; node.textContent=field==='title'&&salon?t.salonTitle:field==='submit'&&salon?t.salonSubmit:t[field]; }
      container.querySelector('[data-cal-month="-1"]').setAttribute('aria-label',t.previous); container.querySelector('[data-cal-month="1"]').setAttribute('aria-label',t.next);
      container.querySelector('.cal-hint').textContent=t.dateHint; dayGrid.setAttribute('aria-label',t.date);
      const weekdays=container.querySelector('.cal-weekdays'); weekdays.replaceChildren();
      for(const day of t.days){const node=doc.createElement('span');node.textContent=day;weekdays.append(node);}
      const select=form.elements.time;select.replaceChildren();const empty=doc.createElement('option');empty.value='';empty.textContent=t.choose;select.append(empty);
      for(const slot of slots){const option=doc.createElement('option');option.value=slot;option.textContent=slot;select.append(option);}select.value=state.time;
      if(error.dataset.code)error.textContent=t[error.dataset.code]; renderDates();
    }
    for(const field of ['name','email','message'])form.elements[field].value=state[field];
    function onInput(event) { const name=event.target.name;if(['name','email','message','time'].includes(name))state[name]=event.target.value;error.textContent='';delete error.dataset.code; }
    function onClick(event) {
      const month=event.target.closest('[data-cal-month]');if(month&&!month.disabled){state.month=moveMonth(state.month,Number(month.dataset.calMonth));renderDates();return;}
      const day=event.target.closest('[data-day]');if(day&&!day.disabled){state.date=day.dataset.day;renderDates(state.date);error.textContent='';delete error.dataset.code;}
    }
    function onKey(event) { const day=event.target.closest('[data-day]'),delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7}[event.key];if(!day||!delta)return;event.preventDefault();const target=addDays(day.dataset.day,delta);if(validDay(target,today)){state.month=monthOf(target);renderDates(target);} }
    async function onSubmit(event) {
      event.preventDefault();const refreshedDay=localDay();if(refreshedDay!==today){today=refreshedDay;state=stateFor(config,today);renderLanguage();}const code=validateRequest(state,today);
      if(code){error.dataset.code=code;error.textContent=text()[code];if(!state.date){dayGrid.querySelector('button:not(:disabled)')?.focus();}else if(!state.time)form.elements.time.focus();else if(!state.name.trim())form.elements.name.focus();else form.elements.email.focus();return;}
      const button=form.querySelector('[type="submit"]');button.disabled=true;
      try { if(typeof config.onSuccess!=='function')throw new Error('Missing confirmation handler.'); await config.onSuccess({leadId:config.leadId,cid:String(config.cid),businessName:config.businessName,date:state.date,time:state.time,name:state.name.trim(),email:state.email.trim(),message:state.message.trim(),intent:config.family==='salon'?'appointment-request':'visit-request',mode:'demo',timeZone:'Europe/Amsterdam'}); }
      catch { error.dataset.code='error';error.textContent=text().error; }
      finally { if(!destroyed)button.disabled=false; }
    }
    form.addEventListener('input',onInput);form.addEventListener('change',onInput);container.addEventListener('click',onClick);dayGrid.addEventListener('keydown',onKey);form.addEventListener('submit',onSubmit);
    const api={update(next){if(identity({...config,...next})!==key)throw new Error('A calendar cannot change business identity.');config={...config,...next};renderLanguage();},destroy(){destroyed=true;form.removeEventListener('input',onInput);form.removeEventListener('change',onInput);container.removeEventListener('click',onClick);dayGrid.removeEventListener('keydown',onKey);form.removeEventListener('submit',onSubmit);delete container.__campaignCalendar;}};
    container.__campaignCalendar=api;renderLanguage();return api;
  }
  const api={mount,helpers:{localDay,addDays,moveMonth,validDay,validateRequest,identity,stateFor}};
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.CampaignCalendar=api;
})(typeof window==='object'?window:globalThis);
