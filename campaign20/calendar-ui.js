(function (root) {
  'use strict';
  const states = new Map();
  const copy = {
    en: { title: 'Let’s plan your visit', salonTitle: 'Your next appointment', intro: 'Pick a date and a preferred time.', date: 'Your preferred date', time: 'Preferred time', choose: 'Choose a time', name: 'Your name', email: 'Email address', message: 'Anything you’d like us to know?', optional: 'Optional', submit: 'Send my request', salonSubmit: 'Request an appointment', previous: 'Previous month', next: 'Next month', required: 'Choose a date and time, and enter your name and email.', invalid: 'Enter a valid email address.', error: 'Your request could not be completed. Please try again.', dateHint: 'Choose your preferred day. Use the arrow keys to move between dates.', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    nl: { title: 'Plan je bezoek', salonTitle: 'Je volgende afspraak', intro: 'Kies een datum en een tijd die je uitkomt.', date: 'Je gewenste datum', time: 'Gewenste tijd', choose: 'Kies een tijd', name: 'Je naam', email: 'E-mailadres', message: 'Wil je ons nog iets laten weten?', optional: 'Optioneel', submit: 'Verstuur mijn verzoek', salonSubmit: 'Vraag een afspraak aan', previous: 'Vorige maand', next: 'Volgende maand', required: 'Kies een datum en tijd en vul je naam en e-mailadres in.', invalid: 'Vul een geldig e-mailadres in.', error: 'Je verzoek kon niet worden afgerond. Probeer het opnieuw.', dateHint: 'Kies je gewenste dag. Gebruik de pijltjestoetsen om tussen datums te bewegen.', days: ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'] }
  };
  const slots = ['10:00', '11:30', '14:00', '15:30', '17:00'];
  const planningCopy = {
    en: { service: 'What can we help with?', salonService: 'Appointment preference', serviceRequired: 'Choose an option for your visit.', summary: 'Your visit, at a glance', details: 'A few details', timeHint: 'Choose the time that suits you. This is your preference.', timeFirst: 'Choose a date to see the preferred times.', send: 'Complete your request', salonSend: 'Complete your appointment request' },
    nl: { service: 'Waarmee kunnen we je helpen?', salonService: 'Je afspraakwens', serviceRequired: 'Kies een onderwerp voor je bezoek.', summary: 'Je bezoek in één oogopslag', details: 'Een paar gegevens', timeHint: 'Kies de tijd die je uitkomt. Dit is je voorkeur.', timeFirst: 'Kies een datum om de voorkeurstijden te zien.', send: 'Rond je verzoek af', salonSend: 'Rond je afspraakverzoek af' }
  };
  function servicesFor(options) {
    if (options.services === undefined) return [];
    if (!Array.isArray(options.services)) throw new TypeError('Services must be a bilingual option list.');
    const ids = new Set();
    return Array.from(options.services, service => {
      if (!service || typeof service.id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(service.id) || ids.has(service.id) || !['en', 'nl'].every(lang => typeof service.title?.[lang] === 'string' && service.title[lang].trim())) throw new TypeError('Services must have distinct IDs and bilingual titles.');
      ids.add(service.id); return { id: service.id, title: { en: service.title.en, nl: service.title.nl } };
    });
  }
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
  function validateRequest(data, today = localDay(), services = []) {
    if (services.length && !services.some(service => service.id === data.serviceId)) return 'serviceRequired';
    if (!validDay(data.date, today) || !slots.includes(data.time) || !data.name?.trim() || !data.email?.trim()) return 'required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) return 'invalid';
    return '';
  }
  function identity(options) { if (typeof options.leadId !== 'string' || !/^[A-Za-z0-9_-]+$/.test(options.leadId) || !/^[1-9]\d+$/.test(String(options.cid || ''))) throw new Error('A verified business identity is required.'); return options.leadId + ':' + options.cid; }
  function stateFor(options, today) {
    const key = identity(options);
    if (!states.has(key)) states.set(key, { serviceId: '', month: monthOf(today), date: '', time: '', name: '', email: '', message: '' });
    const state = states.get(key);
    if (state.date && !validDay(state.date, today)) { state.date = ''; state.time = ''; }
    if (state.month < monthOf(today) || state.month > monthOf(addDays(today, 90))) state.month = monthOf(today);
    return state;
  }
  function installStyles(doc) {
    if (doc.getElementById('campaign-calendar-styles')) return;
    const style = doc.createElement('style'); style.id = 'campaign-calendar-styles';
    style.textContent = '.campaign-calendar{color:var(--ink,#20303c);background:var(--paper,#fff);border:1px solid var(--line,#ccd5db);padding:clamp(20px,3.2vw,42px);border-radius:var(--radius,18px);scroll-margin-top:100px}.campaign-calendar h2{font-size:clamp(27px,3vw,40px);margin:0 0 10px;line-height:1.2}.campaign-calendar .cal-intro{font-size:19px;line-height:1.6;margin:0 0 26px}.campaign-calendar .cal-layout{display:grid;grid-template-columns:minmax(250px,1fr) minmax(250px,1fr);gap:clamp(24px,4vw,52px)}.campaign-calendar .cal-title{display:block;font-size:18px;font-weight:700;margin-bottom:10px}.campaign-calendar .cal-month{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:16px}.campaign-calendar .cal-month strong{font-size:20px;text-align:center;text-transform:capitalize}.campaign-calendar .cal-arrow{border:1px solid #c4cdd3;border-radius:50%;background:#fff;color:#223844;width:44px;height:44px;flex-shrink:0;font:inherit;font-size:25px;cursor:pointer}.campaign-calendar .cal-arrow:disabled{opacity:.4;cursor:default}.campaign-calendar .cal-days,.campaign-calendar .cal-weekdays{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}.campaign-calendar .cal-weekdays span{font-size:14px;font-weight:700;text-align:center;padding:8px 0;color:var(--ink,#20303c)}.campaign-calendar .cal-day{font:inherit;font-size:17px;border:1px solid transparent;background:transparent;color:var(--ink,#20303c);aspect-ratio:1;min-height:40px;border-radius:9px;cursor:pointer}.campaign-calendar .cal-day:disabled{opacity:.3;cursor:default}.campaign-calendar .cal-day[aria-pressed=true]{background:#203d4b;color:#fff;border-color:#203d4b;box-shadow:0 3px 10px #203d4b24}.campaign-calendar .cal-day:not(:disabled):hover{border-color:currentColor}.campaign-calendar .cal-day:focus-visible,.campaign-calendar button:focus-visible,.campaign-calendar input:focus-visible,.campaign-calendar select:focus-visible,.campaign-calendar textarea:focus-visible{outline:3px solid #267fc0;outline-offset:3px}.campaign-calendar .cal-selected{font-size:17px;min-height:28px;margin:16px 0 0;font-weight:600;text-transform:capitalize}.campaign-calendar label{display:block;font-size:17px;font-weight:600;line-height:1.4;margin-bottom:8px}.campaign-calendar .cal-field{margin-bottom:18px}.campaign-calendar input,.campaign-calendar select,.campaign-calendar textarea{font:inherit;font-size:17px;display:block;width:100%;box-sizing:border-box;border:1px solid #a8b6bf;color:#20303c;background:#fff;border-radius:8px;padding:13px 14px;min-height:50px}.campaign-calendar textarea{min-height:88px;resize:vertical}.campaign-calendar .cal-optional{font-size:14px;font-weight:400;margin-left:5px}.campaign-calendar .cal-submit{font:inherit;font-size:18px;font-weight:700;border:0;background:#203d4b;color:#fff;border-radius:var(--radius,10px);padding:16px 22px;min-height:54px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:22px;width:100%;transition:transform .15s}.campaign-calendar .cal-submit:hover{transform:translateY(-2px)}.campaign-calendar .cal-submit:disabled{opacity:.7;cursor:wait}.campaign-calendar .cal-error{color:#9a2525;font-size:16px;line-height:1.5;margin:12px 0 0}.campaign-calendar .cal-error:empty{display:none}.campaign-calendar .cal-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media(max-width:680px){.campaign-calendar .cal-layout{grid-template-columns:1fr}.campaign-calendar .cal-day{min-height:42px}.campaign-calendar{padding:22px 16px}.campaign-calendar .cal-weekdays span{font-size:13px}}@media(prefers-reduced-motion:reduce){.campaign-calendar .cal-submit{transition:none}.campaign-calendar .cal-submit:hover{transform:none}}';
    style.textContent += `
      .campaign-calendar{border:0;background:transparent;padding:0;max-width:1120px;margin:auto;font-family:var(--body-font,Arial,Helvetica,sans-serif);container:campaign-calendar / inline-size}
      .campaign-calendar .cal-intro{color:var(--muted,#53636c);max-width:55ch;margin-bottom:30px}.campaign-calendar .cal-booking-layout{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,.85fr);gap:28px;align-items:start}
      .campaign-calendar .cal-panel,.campaign-calendar .cal-summary{min-width:0;padding:32px;border:1px solid var(--line,#d5ded9);border-radius:20px;background:var(--paper,#fffdf8);box-shadow:0 16px 42px #203b2c09}
      .campaign-calendar .cal-step{min-width:0;border:0;border-bottom:1px solid var(--line,#d5ded9);padding:0 0 28px;margin:0 0 28px}.campaign-calendar .cal-step:last-child{border:0;padding-bottom:0;margin-bottom:0}.campaign-calendar .cal-step legend{font-size:22px;font-weight:600;margin-bottom:18px;line-height:1.4}.campaign-calendar .cal-step legend span{display:inline-grid;place-items:center;border:1px solid var(--line,#d5ded9);border-radius:50%;width:30px;height:30px;margin-right:10px;font:500 13px/1 Arial,Helvetica,sans-serif;color:var(--muted,#53636c)}
      .campaign-calendar .cal-services{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.campaign-calendar .cal-choice{font:inherit;font-size:17px;line-height:1.45;min-width:0;min-height:54px;border:1px solid var(--line,#bdcbc2);border-radius:11px;background:var(--paper,#fffdf8);color:var(--ink,#20303c);padding:13px;cursor:pointer}.campaign-calendar .cal-service{display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:76px;text-align:left;overflow-wrap:anywhere}.campaign-calendar .cal-choice-tick{flex:none;opacity:0}.campaign-calendar .cal-choice[aria-pressed=true],.campaign-calendar .cal-day[aria-pressed=true]{background:var(--accent,#203d4b);border-color:var(--accent,#203d4b);color:var(--accent-text,#fff);box-shadow:0 5px 16px #203b2c14}.campaign-calendar .cal-choice[aria-pressed=true] .cal-choice-tick{opacity:1}.campaign-calendar .cal-choice:hover:not(:disabled){border-color:var(--accent,#203d4b)}.campaign-calendar .cal-choice:disabled{opacity:.45;cursor:default}
      .campaign-calendar .cal-time-hint{font-size:16px;line-height:1.55;color:var(--muted,#53636c);margin:0 0 16px}.campaign-calendar .cal-times{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.campaign-calendar .cal-time{font-variant-numeric:tabular-nums}.campaign-calendar .cal-days,.campaign-calendar .cal-weekdays{gap:6px}.campaign-calendar .cal-day{min-width:0;font-variant-numeric:tabular-nums;aspect-ratio:auto;min-height:48px;height:52px}.campaign-calendar .cal-selected{font-size:16px;color:var(--muted,#53636c);min-height:24px;margin-top:15px}.campaign-calendar .cal-arrow{background:var(--paper,#fff);color:var(--ink,#20303c);border-color:var(--line,#bdcbc2)}
      .campaign-calendar .cal-summary{position:sticky;top:110px;background:color-mix(in srgb,var(--accent,#203d4b) 5%,var(--paper,#fffdf8))}.campaign-calendar .cal-summary-kicker{text-transform:uppercase;letter-spacing:.12em;font-size:14px;font-weight:700;color:var(--muted,#53636c);margin:0 0 12px}.campaign-calendar .cal-business{font-size:clamp(24px,2.5vw,34px);line-height:1.2;letter-spacing:-.03em;overflow-wrap:anywhere;margin:0 0 22px}.campaign-calendar .cal-summary dl{margin:0 0 26px}.campaign-calendar .cal-summary dl>div{display:grid;grid-template-columns:minmax(0,.75fr) minmax(0,1fr);gap:16px;padding:14px 0;border-bottom:1px solid var(--line,#d5ded9);font-size:16px;line-height:1.5}.campaign-calendar .cal-summary dt{color:var(--muted,#53636c)}.campaign-calendar .cal-summary dd{margin:0;font-weight:600;overflow-wrap:anywhere}.campaign-calendar .cal-details-title{font-size:21px;line-height:1.3;margin:0 0 20px}.campaign-calendar .cal-submit{background:var(--accent,#203d4b);color:var(--accent-text,#fff);border-radius:11px;font-size:17px;line-height:1.4}.campaign-calendar .cal-field{margin-bottom:17px}.campaign-calendar textarea{min-height:95px}.campaign-calendar [hidden]{display:none!important}.campaign-calendar :focus-visible{outline:3px solid var(--accent,#267fc0);outline-offset:3px}
      @media(max-width:900px){.campaign-calendar .cal-panel,.campaign-calendar .cal-summary{padding:26px}.campaign-calendar .cal-services{grid-template-columns:1fr}}
      @media(max-width:740px){.campaign-calendar .cal-booking-layout{grid-template-columns:1fr;gap:22px}.campaign-calendar .cal-summary{position:static}.campaign-calendar .cal-panel,.campaign-calendar .cal-summary{padding:24px 20px}.campaign-calendar .cal-step legend{font-size:21px}.campaign-calendar .cal-services{grid-template-columns:repeat(2,minmax(0,1fr))}.campaign-calendar .cal-month strong{font-size:19px}}
      @media(max-width:430px){.campaign-calendar .cal-services{grid-template-columns:1fr}.campaign-calendar .cal-days,.campaign-calendar .cal-weekdays{gap:3px}.campaign-calendar .cal-day{min-height:44px;height:44px;font-size:16px}.campaign-calendar .cal-summary dl>div{gap:10px}}
      @container campaign-calendar (max-width:740px){.campaign-calendar .cal-booking-layout{grid-template-columns:1fr;gap:22px}.campaign-calendar .cal-summary{position:static}.campaign-calendar .cal-panel,.campaign-calendar .cal-summary{padding:24px 20px}}
      .campaign-calendar input[type=hidden]{display:none!important}
    `;
    doc.head.append(style);
  }
  function mount(container, options) {
    if (!container || !root.document) throw new Error('A calendar container is required.');
    if (container.__campaignCalendar) { container.__campaignCalendar.update(options); return container.__campaignCalendar; }
    let config = { ...options }, services = servicesFor(config), today = localDay(), state = stateFor(config, today), destroyed = false, submitting = false;
    if (state.serviceId && !services.some(service => service.id === state.serviceId)) state.serviceId = '';
    if (!state.serviceId && services.some(service => service.id === config.serviceId)) state.serviceId = config.serviceId;
    const key = identity(config), doc = container.ownerDocument;
    installStyles(doc); container.classList.add('campaign-calendar');
    container.innerHTML = '<h2 data-cal-text="title"></h2><p class="cal-intro" data-cal-text="intro"></p><form class="cal-form" novalidate><input type="hidden" name="time"><input type="hidden" name="serviceId"><div class="cal-booking-layout"><div class="cal-panel"><fieldset class="cal-step cal-service-step"><legend data-cal-text="service"></legend><div class="cal-services" role="group"></div></fieldset><fieldset class="cal-step cal-date-area"><legend data-cal-text="date"></legend><div class="cal-month"><button class="cal-arrow" type="button" data-cal-month="-1">‹</button><strong aria-live="polite"></strong><button class="cal-arrow" type="button" data-cal-month="1">›</button></div><p class="cal-sr cal-hint" id="cal-hint-'+config.leadId+'"></p><div class="cal-weekdays" aria-hidden="true"></div><div class="cal-days" role="group" aria-describedby="cal-hint-'+config.leadId+'"></div><p class="cal-selected" aria-live="polite"></p></fieldset><fieldset class="cal-step"><legend data-cal-text="time"></legend><p class="cal-time-hint" role="status"></p><div class="cal-times" role="group"></div></fieldset></div><aside class="cal-summary"><p class="cal-summary-kicker" data-cal-text="summary"></p><h3 class="cal-business"></h3><dl aria-live="polite"><div class="cal-summary-service"><dt data-cal-text="service"></dt><dd data-cal-value="service"></dd></div><div><dt data-cal-text="date"></dt><dd data-cal-value="date"></dd></div><div><dt data-cal-text="time"></dt><dd data-cal-value="time"></dd></div></dl><h3 class="cal-details-title" data-cal-text="details"></h3><div class="cal-field"><label data-cal-text="name" for="cal-name-'+config.leadId+'"></label><input id="cal-name-'+config.leadId+'" name="name" autocomplete="name" maxlength="100" required></div><div class="cal-field"><label data-cal-text="email" for="cal-email-'+config.leadId+'"></label><input id="cal-email-'+config.leadId+'" name="email" type="email" autocomplete="email" maxlength="254" required></div><div class="cal-field"><label for="cal-message-'+config.leadId+'"><span data-cal-text="message"></span><span class="cal-optional" data-cal-text="optional"></span></label><textarea id="cal-message-'+config.leadId+'" name="message" maxlength="2000"></textarea></div><button class="cal-submit" type="submit"><span data-cal-text="submit"></span><span aria-hidden="true">↗</span></button><p class="cal-error" role="alert"></p></aside></div></form>';
    const form = container.querySelector('form'), dayGrid = container.querySelector('.cal-days'), error = container.querySelector('.cal-error');
    const lang = () => config.lang === 'en' ? 'en' : 'nl';
    const text = () => ({ ...copy[lang()], ...planningCopy[lang()] });
    const locale = () => config.lang === 'en' ? 'en-GB' : 'nl-NL';
    function renderDates(focusDay) {
      const first = dayDate(state.month), count = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth()+1, 0, 12)).getUTCDate();
      container.querySelector('.cal-month strong').textContent = new Intl.DateTimeFormat(locale(), { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(first);
      container.querySelector('[data-cal-month="-1"]').disabled = submitting || state.month <= monthOf(today);
      container.querySelector('[data-cal-month="1"]').disabled = submitting || state.month >= monthOf(addDays(today, 90));
      dayGrid.replaceChildren();
      for (let n=0; n<(first.getUTCDay()+6)%7; n++) { const blank=doc.createElement('span'); blank.setAttribute('aria-hidden','true'); dayGrid.append(blank); }
      for (let n=1; n<=count; n++) {
        const day=state.month.slice(0,8)+String(n).padStart(2,'0'), button=doc.createElement('button');
        button.type='button'; button.className='cal-day'; button.textContent=String(n); button.dataset.day=day; button.disabled=submitting||!validDay(day,today);
        button.setAttribute('aria-pressed',String(state.date===day)); button.setAttribute('aria-label',new Intl.DateTimeFormat(locale(),{dateStyle:'full',timeZone:'UTC'}).format(dayDate(day)));
        if(day===today)button.setAttribute('aria-current','date'); dayGrid.append(button);
      }
      container.querySelector('.cal-selected').textContent=state.date?new Intl.DateTimeFormat(locale(),{dateStyle:'long',timeZone:'UTC'}).format(dayDate(state.date)):'';
      if(focusDay)Array.from(dayGrid.querySelectorAll('button')).find(button=>button.dataset.day===focusDay)?.focus();
    }
    function renderPreferences() {
      const t = text(), selected = services.find(service => service.id === state.serviceId), choices = container.querySelector('.cal-services'), times = container.querySelector('.cal-times');
      container.querySelector('.cal-service-step').hidden = !services.length;
      container.querySelector('.cal-summary-service').hidden = !services.length;
      choices.setAttribute('aria-label', config.family === 'salon' ? t.salonService : t.service);
      choices.replaceChildren();
      for (const service of services) {
        const button = doc.createElement('button'), title = doc.createElement('span'), tick = doc.createElement('span');
        button.type = 'button'; button.className = 'cal-choice cal-service'; button.dataset.service = service.id; button.disabled = submitting;
        button.setAttribute('aria-pressed', String(state.serviceId === service.id)); title.textContent = service.title[lang()];
        tick.className = 'cal-choice-tick'; tick.setAttribute('aria-hidden', 'true'); tick.textContent = '✓'; button.append(title); button.append(tick); choices.append(button);
      }
      form.elements.serviceId.value = state.serviceId; form.elements.time.value = state.time;
      times.setAttribute('aria-label', t.time); times.replaceChildren();
      for (const slot of slots) {
        const button = doc.createElement('button'); button.type = 'button'; button.className = 'cal-choice cal-time'; button.dataset.time = slot; button.textContent = slot;
        button.disabled = submitting || !state.date || (services.length > 0 && !selected); button.setAttribute('aria-pressed', String(state.time === slot)); times.append(button);
      }
      container.querySelector('.cal-time-hint').textContent = state.date ? t.timeHint : t.timeFirst;
      container.querySelector('.cal-business').textContent = config.businessName || '';
      container.querySelector('[data-cal-value="service"]').textContent = selected ? selected.title[lang()] : '—';
      container.querySelector('[data-cal-value="date"]').textContent = state.date ? new Intl.DateTimeFormat(locale(), { dateStyle: 'long', timeZone: 'UTC' }).format(dayDate(state.date)) : '—';
      container.querySelector('[data-cal-value="time"]').textContent = state.time || '—';
      form.querySelector('[type="submit"]').disabled = submitting;
      for (const field of ['name', 'email', 'message']) form.elements[field].disabled = submitting;
    }
    function renderLanguage() {
      const t=text(), salon=config.family==='salon', active=doc.activeElement?.closest?.('.campaign-calendar')===container?doc.activeElement:null;
      const focusKey=active?.dataset?.day?['day',active.dataset.day]:active?.dataset?.service?['service',active.dataset.service]:active?.dataset?.time?['time',active.dataset.time]:null;
      for(const node of container.querySelectorAll('[data-cal-text]')) { const field=node.dataset.calText; node.textContent=field==='title'&&salon?t.salonTitle:field==='submit'?(salon?t.salonSend:t.send):field==='service'&&salon?t.salonService:t[field]; }
      container.querySelector('[data-cal-month="-1"]').setAttribute('aria-label',t.previous); container.querySelector('[data-cal-month="1"]').setAttribute('aria-label',t.next);
      container.querySelector('.cal-hint').textContent=t.dateHint; dayGrid.setAttribute('aria-label',t.date);
      const weekdays=container.querySelector('.cal-weekdays'); weekdays.replaceChildren();
      for(const day of t.days){const node=doc.createElement('span');node.textContent=day;weekdays.append(node);}
      if(error.dataset.code)error.textContent=t[error.dataset.code]; renderDates(); renderPreferences();
      if(focusKey)Array.from(container.querySelectorAll('[data-'+focusKey[0]+']')).find(node=>node.dataset[focusKey[0]]===focusKey[1]&&!node.disabled)?.focus();
    }
    for(const field of ['name','email','message'])form.elements[field].value=state[field];
    function clearError() { error.textContent='';delete error.dataset.code; }
    function onInput(event) { if(submitting||destroyed)return;const name=event.target.name;if(['name','email','message','time'].includes(name))state[name]=event.target.value;clearError();renderPreferences(); }
    function onClick(event) {
      if(submitting||destroyed)return;
      const service=event.target.closest('[data-service]');if(service&&!service.disabled&&services.some(item=>item.id===service.dataset.service)){state.serviceId=service.dataset.service;clearError();renderLanguage();return;}
      const time=event.target.closest('[data-time]');if(time&&!time.disabled&&slots.includes(time.dataset.time)){state.time=time.dataset.time;clearError();renderPreferences();Array.from(container.querySelectorAll('[data-time]')).find(node=>node.dataset.time===state.time)?.focus();return;}
      const month=event.target.closest('[data-cal-month]');if(month&&!month.disabled){state.month=moveMonth(state.month,Number(month.dataset.calMonth));renderDates();return;}
      const day=event.target.closest('[data-day]');if(day&&!day.disabled){state.date=day.dataset.day;renderDates(state.date);renderPreferences();clearError();}
    }
    function onKey(event) { if(submitting||destroyed)return;const day=event.target.closest('[data-day]'),delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7}[event.key];if(!day||!delta)return;event.preventDefault();const target=addDays(day.dataset.day,delta);if(validDay(target,today)){state.month=monthOf(target);renderDates(target);} }
    async function onSubmit(event) {
      event.preventDefault();if(submitting||destroyed)return;const refreshedDay=localDay();if(refreshedDay!==today){today=refreshedDay;state=stateFor(config,today);renderLanguage();}const code=validateRequest(state,today,services);
      if(code){error.dataset.code=code;error.textContent=text()[code];if(code==='serviceRequired')container.querySelector('[data-service]')?.focus();else if(!state.date){dayGrid.querySelector('button:not(:disabled)')?.focus();}else if(!state.time)container.querySelector('[data-time]')?.focus();else if(!state.name.trim())form.elements.name.focus();else form.elements.email.focus();return;}
      const selected=services.find(service=>service.id===state.serviceId);submitting=true;renderLanguage();
      try { if(typeof config.onSuccess!=='function')throw new Error('Missing confirmation handler.'); await config.onSuccess({leadId:config.leadId,cid:String(config.cid),businessName:config.businessName,...(selected?{serviceId:selected.id,serviceTitle:selected.title[lang()]}:{}),date:state.date,time:state.time,name:state.name.trim(),email:state.email.trim(),message:state.message.trim(),intent:config.family==='salon'?'appointment-request':'visit-request',mode:'demo',timeZone:'Europe/Amsterdam'}); }
      catch { if(!destroyed){error.dataset.code='error';error.textContent=text().error;} }
      finally { submitting=false;if(!destroyed)renderLanguage(); }
    }
    form.addEventListener('input',onInput);form.addEventListener('change',onInput);container.addEventListener('click',onClick);dayGrid.addEventListener('keydown',onKey);form.addEventListener('submit',onSubmit);
    const api={update(next){if(destroyed)return;const candidate={...config,...next};if(identity(candidate)!==key)throw new Error('A calendar cannot change business identity.');const nextServices=servicesFor(candidate);config=candidate;services=nextServices;if(state.serviceId&&!services.some(service=>service.id===state.serviceId))state.serviceId='';renderLanguage();},destroy(){if(destroyed)return;destroyed=true;form.removeEventListener('input',onInput);form.removeEventListener('change',onInput);container.removeEventListener('click',onClick);dayGrid.removeEventListener('keydown',onKey);form.removeEventListener('submit',onSubmit);delete container.__campaignCalendar;}};
    container.__campaignCalendar=api;renderLanguage();return api;
  }
  const api={mount,helpers:{localDay,addDays,moveMonth,validDay,validateRequest,identity,stateFor,servicesFor}};
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.CampaignCalendar=api;
})(typeof window==='object'?window:globalThis);
