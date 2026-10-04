import { THEME_IDS, contextUrl, resolveContext, validateModel } from './model.mjs';
const $ = id => document.getElementById(id);
const make = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; };
const safeUrl = value => { try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; } catch { return null; } };
const words = {
  en: {
    skip: 'Skip to content', preview: 'Your business. Your style.', demo: 'Demo', chooseStyle: 'Choose a style', chooseLanguage: 'Website language', themeNames: { R1: 'Warm editorial', R2: 'City blue', R3: 'Botanical', R4: 'Bright coral', R5: 'Night ink', B1: 'Cream studio', B2: 'Blush fashion', B3: 'Navy mirror', B4: 'Sage studio', B5: 'Cobalt editorial' },
    discover: 'Discover', reviews: 'Reviews', contact: 'Contact', navigation: 'Website navigation', detailsLabel: 'A little closer', findUs: 'Find us', getDirections: 'Open Google Maps', call: 'Call us', faq: 'Good questions. Clear answers.', calendarFood: 'Plan your visit', calendarBeauty: 'Request an appointment', heroFood: { R1: 'Make time for something good.', R2: 'Your place. Your moment.', R3: 'Feel close. Feel like yourself.', R4: 'Make your day a little brighter.', R5: 'A good moment starts here.' }, heroBeauty: { B1: 'Room for your own style.', B2: 'A fresh look. Completely you.', B3: 'Character in every style.', B4: 'Time for yourself. Your way.', B5: 'Your style. In focus.' }, heroIce: 'A little moment. A lot of joy.',
    bodyCafe: 'A place to meet, take a breath and enjoy the moment. Find us nearby and make it your own.', bodyBeauty: 'Your style, your moment. Start with a personal conversation and discover what feels right for you.', bodyFood: 'Make your next stop a good one. Find the address, explore the reviews and get in touch.', bodyIce: 'A cheerful stop for a small moment of pleasure. Find our address and come by.', bodyFish: 'Herring, mackerel and cod kibbeling, right by the Spaarne. Find us and plan your next stop.', bodyLibrary: 'An eetcafé and bar with live music and cultural events. A place for good company and a good moment.', bodySeasonal: 'Oliebollen from October to January, and the Wateringse ice cream shop in the other months. Find us on the Plein.',
    assetAlt: 'A dining atmosphere selected for this website design', beautyAlt: 'Hair styling inspiration selected for this website design', iceAlt: 'Ice cream illustration for this website design',
    serviceFood: [['Come by', 'Find the right address for your next visit.'], ['What people say', 'Explore the experiences shared on Google.'], ['Ask us', 'A personal question starts a conversation.']], serviceBeauty: [['Your style', 'Tell us what you have in mind.'], ['Your moment', 'Choose a preferred day for an appointment request.'], ['A personal touch', 'Start with a conversation, at your own pace.']], serviceIce: [['A cheerful stop', 'Find our address and plan your visit.'], ['Shared moments', 'Read what visitors say on Google.'], ['A question?', 'Ask about the current offer before you stop by.']],
    faqBeauty: [['How can I request an appointment?', 'Choose a preferred date and tell us what you have in mind. An appointment request starts the conversation; the salon confirms the details.'], ['Can I ask a question first?', 'Of course. Share your question in the message field, so you can explain what you are looking for.'], ['Where can I find the salon?', 'Use the address and Google Maps link below to plan your route.']], faqFood: [['Can I ask a question before visiting?', 'Use the visit planner to choose a preferred date and share your question. You can also use the phone number shown below.'], ['Where can I find you?', 'Our address and Google Maps link are below. Check the Google listing for the latest opening information.'], ['How can I ask about the current offer?', 'Write your question in the message field. Ask about ingredients or the current selection before your visit.']],
    thanksKicker: 'Thank you', thanksTitle: 'A lovely first step.', thanksBeauty: 'Thanks for trying your appointment request.', thanksFood: 'Thanks for trying your visit enquiry.', thanksDemo: 'Your demo request is complete.', preferredDate: 'Your preferred date', returnHome: 'Return to the website', thanksNote: 'Take another look, or explore a different style.', personalWebsite: 'A website shaped around you', powered: 'Website preview by Ocimatik', mapTitle: 'Google Maps location for',
  },
  nl: {
    skip: 'Naar de inhoud', preview: 'Jouw zaak. Jouw stijl.', demo: 'Demo', chooseStyle: 'Kies een stijl', chooseLanguage: 'Taal van de website', themeNames: { R1: 'Warm editorial', R2: 'Stedelijk blauw', R3: 'Botanisch', R4: 'Helder koraal', R5: 'Nachtelijk inkt', B1: 'Crème studio', B2: 'Blush mode', B3: 'Navy spiegel', B4: 'Salie studio', B5: 'Cobalt editorial' },
    discover: 'Ontdek', reviews: 'Reviews', contact: 'Contact', navigation: 'Websitenavigatie', detailsLabel: 'Even dichterbij', findUs: 'Vind ons', getDirections: 'Open Google Maps', call: 'Bel ons', faq: 'Goede vragen. Heldere antwoorden.', calendarFood: 'Plan je bezoek', calendarBeauty: 'Vraag een afspraak aan', heroFood: { R1: 'Even tijd voor iets goeds.', R2: 'Jouw plek. Jouw moment.', R3: 'Dichtbij. En helemaal jezelf.', R4: 'Maak je dag een beetje mooier.', R5: 'Een goed moment begint hier.' }, heroBeauty: { B1: 'Ruimte voor jouw stijl.', B2: 'Een frisse blik. Helemaal jij.', B3: 'Karakter in elke stijl.', B4: 'Tijd voor jezelf. Op jouw manier.', B5: 'Jouw stijl. In beeld.' }, heroIce: 'Een klein moment. Veel plezier.',
    bodyCafe: 'Een plek om elkaar te ontmoeten, even te ontspannen en van het moment te genieten. Vind ons in de buurt en kom langs.', bodyBeauty: 'Jouw stijl, jouw moment. Begin met een persoonlijk gesprek en ontdek wat bij je past.', bodyFood: 'Maak van je volgende stop een fijn moment. Vind het adres, lees de reviews en neem contact op.', bodyIce: 'Een vrolijke stop voor een klein moment van plezier. Vind ons adres en kom langs.', bodyFish: 'Haring, makreel en kabeljauwkibbeling, direct aan het Spaarne. Vind ons en plan je volgende bezoek.', bodyLibrary: 'Een eetcafé en bar met livemuziek en culturele evenementen. Een plek voor goed gezelschap en een fijn moment.', bodySeasonal: 'Oliebollen van oktober tot januari, en de Wateringse IJssalon in de andere maanden. Vind ons op het Plein.',
    assetAlt: 'Een eetgelegenheid als sfeerbeeld voor dit websiteontwerp', beautyAlt: 'Haarinspiratie voor dit websiteontwerp', iceAlt: 'IJsillustratie voor dit websiteontwerp',
    serviceFood: [['Kom langs', 'Vind het juiste adres voor je volgende bezoek.'], ['Ervaringen', 'Lees de ervaringen die op Google zijn gedeeld.'], ['Stel een vraag', 'Persoonlijk contact begint met een gesprek.']], serviceBeauty: [['Jouw stijl', 'Vertel ons wat je in gedachten hebt.'], ['Jouw moment', 'Kies een gewenste dag voor je afspraakverzoek.'], ['Persoonlijk', 'Begin met een gesprek, op jouw tempo.']], serviceIce: [['Een vrolijke stop', 'Vind ons adres en plan je bezoek.'], ['Gedeelde momenten', 'Lees wat bezoekers op Google vertellen.'], ['Een vraag?', 'Vraag naar het actuele aanbod voordat je langskomt.']],
    faqBeauty: [['Hoe vraag ik een afspraak aan?', 'Kies een gewenste datum en vertel ons wat je in gedachten hebt. Je afspraakverzoek begint het gesprek; de salon bevestigt de details.'], ['Kan ik eerst een vraag stellen?', 'Natuurlijk. Gebruik het berichtveld om uit te leggen waar je naar op zoek bent.'], ['Waar vind ik de salon?', 'Gebruik het adres en de Google Maps-link hieronder om je route te plannen.']], faqFood: [['Kan ik voor mijn bezoek een vraag stellen?', 'Kies een gewenste datum in de bezoekplanner en schrijf je vraag. Je kunt ook het telefoonnummer hieronder gebruiken.'], ['Waar vind ik jullie?', 'Ons adres en de Google Maps-link staan hieronder. Bekijk de Google-vermelding voor de laatste openingstijden.'], ['Hoe vraag ik naar het actuele aanbod?', 'Schrijf je vraag in het berichtveld. Vraag voor je bezoek naar ingrediënten of het actuele aanbod.']],
    thanksKicker: 'Bedankt', thanksTitle: 'Een fijne eerste stap.', thanksBeauty: 'Bedankt voor het proberen van je afspraakverzoek.', thanksFood: 'Bedankt voor het proberen van je bezoekaanvraag.', thanksDemo: 'Je demoverzoek is afgerond.', preferredDate: 'Je gewenste datum', returnHome: 'Terug naar de website', thanksNote: 'Kijk nog even rond of ontdek een andere stijl.', personalWebsite: 'Een website die bij jou past', powered: 'Websitevoorbeeld van Ocimatik', mapTitle: 'Google Maps-locatie van',
  }
};

let model, context, bindings = [], toolbarBindings = [], thankYouData = null, calendarMount = null, reviewsMount = null;
function translated(node, getter) { bindings.push(() => node.textContent = getter(words[context.lang], context.lead)); return node; }
function linked(label, href, className) { const link = make('a', className, label); link.href = href; return link; }
function themeUrl(view = context.view) { return contextUrl(location.href, context, view); }
function updateUrl() { history.replaceState(null, '', themeUrl()); }
function dispatchContext() { window.dispatchEvent(new CustomEvent('campaign20:context', { detail: { leadId: context.lead.id, cid: context.lead.google.cid, theme: context.theme, lang: context.lang, returnUrl: themeUrl('home').href } })); }

function toolbar() {
  toolbarBindings = [];
  const text = getter => { const node = make('span'); toolbarBindings.push(() => node.textContent = getter(words[context.lang])); return node; };
  const brand = make('div', 'demo-brand'); brand.append(make('strong', 'demo-badge', 'Demo'), text(d => d.preview));
  const controls = make('div', 'demo-controls');
  const language = make('div', 'demo-languages'); language.setAttribute('role', 'group');
  for (const lang of ['en', 'nl']) {
    const button = make('button', 'language-button', lang === 'en' ? 'English' : 'Nederlands'); button.type = 'button'; button.lang = lang; button.dataset.language = lang; button.setAttribute('aria-pressed', String(context.lang === lang)); button.addEventListener('click', () => setLanguage(lang)); language.append(button);
  }
  const palette = make('div', 'demo-palette'); palette.setAttribute('role', 'group');
  const paletteLabel = text(d => d.chooseStyle); paletteLabel.className = 'palette-label'; palette.append(paletteLabel);
  for (const theme of THEME_IDS[context.lead.family]) {
    const button = make('button', 'palette-button'); button.type = 'button'; button.dataset.theme = theme; button.setAttribute('aria-pressed', String(theme === context.theme));
    const chip = make('span', 'palette-chip chip-' + theme); chip.setAttribute('aria-hidden', 'true'); const label = text(d => d.themeNames[theme]); label.className = 'sr-only';
    toolbarBindings.push(() => { button.title = words[context.lang].themeNames[theme]; button.setAttribute('aria-label', words[context.lang].themeNames[theme]); }); button.append(chip, label); button.addEventListener('click', () => setTheme(theme)); palette.append(button);
  }
  controls.append(language, palette); $('demo-toolbar').replaceChildren(brand, controls);
  toolbarBindings.push(() => { language.setAttribute('aria-label', words[context.lang].chooseLanguage); palette.setAttribute('aria-label', words[context.lang].chooseStyle); });
}

function iceVisual() {
  const ns = 'http://www.w3.org/2000/svg'; const svg = document.createElementNS(ns, 'svg'); svg.setAttribute('viewBox', '0 0 700 620'); svg.setAttribute('role', 'img');
  const title = document.createElementNS(ns, 'title'); svg.append(title); bindings.push(() => title.textContent = words[context.lang].iceAlt);
  const shape = (tag, attrs) => { const node = document.createElementNS(ns, tag); for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value); svg.append(node); };
  shape('ellipse', { cx: 350, cy: 535, rx: 160, ry: 25, fill: '#243844', opacity: '.12' });
  shape('path', { d: 'M228 310 L470 310 L427 512 Q350 552 271 512 Z', fill: '#e9b389', stroke: '#533b32', 'stroke-width': 7 });
  shape('path', { d: 'M249 350 Q350 383 451 350 M267 405 Q350 433 436 405 M281 460 Q351 486 422 460', fill: 'none', stroke: '#8e5e46', 'stroke-width': 5 });
  for (const [cx, cy, r, fill] of [[350, 184, 101, '#f4d7ca'], [260, 264, 88, '#e8e6bd'], [440, 264, 88, '#b47762']]) shape('circle', { cx, cy, r, fill, stroke: '#533b32', 'stroke-width': 6 });
  shape('path', { d: 'M209 245 Q228 212 257 220 M306 135 Q337 108 369 123 M416 225 Q447 219 469 244', fill: 'none', stroke: '#fff9f2', 'stroke-width': 11, 'stroke-linecap': 'round' });
  return svg;
}

function bodyText(d, lead) {
  if (lead.id === 'NLEX100N-156') return d.bodyFish;
  if (lead.id === 'NLE100S-058') return d.bodyLibrary;
  if (lead.id === 'NLEZ2-201') return d.bodySeasonal;
  if (lead.family === 'salon') return d.bodyBeauty;
  if (lead.groupId === 'ice-cream') return d.bodyIce;
  if (["Café", 'Madame'].some(prefix => lead.name.startsWith(prefix))) return d.bodyCafe;
  return d.bodyFood;
}

function renderHome() {
  const lead = context.lead; bindings = [];
  const site = make('article', 'site theme-' + context.theme); site.dataset.leadId = lead.id; site.dataset.googleCid = lead.google.cid;
  const header = make('header', 'site-header'), brand = linked(lead.name, themeUrl('home').href, 'site-brand'); brand.dataset.home = 'true'; header.append(brand);
  const nav = make('nav', 'site-nav'); bindings.push(() => nav.setAttribute('aria-label', words[context.lang].navigation));
  for (const [key, href] of [['discover', '#discover'], ['reviews', '#reviews-module'], ['contact', '#calendar-module']]) nav.append(translated(linked('', href), d => d[key]));
  header.append(nav); site.append(header);
  const hero = make('section', 'site-hero'), copy = make('div', 'hero-copy'); copy.append(make('p', 'site-kicker', lead.locality));
  copy.append(translated(make('h1', 'site-title'), (d, b) => b.groupId === 'ice-cream' ? d.heroIce : (b.family === 'salon' ? d.heroBeauty : d.heroFood)[context.theme]));
  copy.append(translated(make('p', 'site-body'), bodyText));
  const cta = linked('', '#calendar-module', 'site-cta'); cta.append(translated(make('span'), (d, b) => b.family === 'salon' ? d.calendarBeauty : d.calendarFood), make('span', 'cta-arrow', '↗')); cta.lastChild.setAttribute('aria-hidden', 'true'); copy.append(cta);
  const visual = make('figure', 'hero-visual');
  if (lead.media.asset) { const img = make('img'); img.src = '/demos/assets/' + lead.media.asset; img.width = 1200; img.height = 900; img.decoding = 'async'; img.fetchPriority = 'high'; bindings.push(() => img.alt = lead.family === 'salon' ? words[context.lang].beautyAlt : words[context.lang].assetAlt); visual.append(img); } else visual.append(iceVisual());
  hero.append(copy, visual); site.append(hero);
  const strip = make('section', 'service-strip'); strip.id = 'discover';
  for (let index = 0; index < 3; index++) { const card = make('div', 'service-item'); const choose = d => lead.family === 'salon' ? d.serviceBeauty : lead.groupId === 'ice-cream' ? d.serviceIce : d.serviceFood; card.append(translated(make('h2'), d => choose(d)[index][0]), translated(make('p'), d => choose(d)[index][1])); strip.append(card); }
  site.append(strip);
  const reviews = make('section', 'content-section reviews-section'); reviews.id = 'reviews-module'; reviews.dataset.leadId = lead.id; reviews.dataset.googleCid = lead.google.cid; site.append(reviews);
  const calendar = make('section', 'content-section calendar-section'); calendar.id = 'calendar-module'; calendar.dataset.leadId = lead.id; calendar.dataset.googleCid = lead.google.cid; site.append(calendar);
  const faq = make('section', 'content-section faq-section'); faq.id = 'faq'; faq.append(translated(make('h2', 'section-title'), d => d.faq));
  const faqs = make('div', 'faq-grid');
  for (let index = 0; index < 3; index++) { const item = make('details', 'faq-item'); const summary = make('summary'); summary.append(translated(make('h3'), d => (lead.family === 'salon' ? d.faqBeauty : d.faqFood)[index][0])); const answer = translated(make('p'), d => (lead.family === 'salon' ? d.faqBeauty : d.faqFood)[index][1]); item.append(summary, answer); faqs.append(item); } faq.append(faqs); site.append(faq);
  const visit = make('section', 'content-section visit-section'); visit.id = 'visit';
  const info = make('div', 'visit-copy'); info.append(translated(make('h2', 'section-title'), d => d.findUs), make('strong', 'visit-name', lead.name), make('p', 'visit-address', lead.address));
  const maps = safeUrl(lead.google.mapsUrl); if (maps) { const link = translated(linked('', maps, 'location-link'), d => d.getDirections); link.target = '_blank'; link.rel = 'noopener noreferrer'; info.append(link); }
  if (lead.phone && /^\+?\d+$/.test(lead.phone)) { const phone = linked(lead.phone, 'tel:' + lead.phone, 'phone-link'); phone.setAttribute('aria-label', `${words[context.lang].call}: ${lead.phone}`); bindings.push(() => phone.setAttribute('aria-label', `${words[context.lang].call}: ${lead.phone}`)); info.append(phone); }
  const map = make('iframe', 'business-map'); map.loading = 'lazy'; map.referrerPolicy = 'strict-origin-when-cross-origin'; map.src = `https://www.google.com/maps?cid=${lead.google.cid}&output=embed`; bindings.push(() => map.title = `${words[context.lang].mapTitle} ${lead.name}`); visit.append(info, map); site.append(visit);
  const footer = make('footer', 'site-footer'); footer.append(make('strong', '', lead.name), translated(linked('', 'https://ocimatik.com/', 'ocimatik-credit'), d => d.powered)); site.append(footer);
  $('product').replaceChildren(site); applyLanguage(); mountModules();
}

function moduleContext() { return { leadId: context.lead.id, cid: context.lead.google.cid, businessName: context.lead.name, family: context.lead.family, subtype: context.lead.groupId === 'ice-cream' ? 'ice-cream' : context.lead.actualSubtype, lang: context.lang, onSuccess: showThanks }; }
function mountModules() {
  if (context.view !== 'home') return;
  const payload = moduleContext();
  if (window.CampaignReviews?.mount) {
    const container = $('reviews-module');
    if (reviewsMount?.container === container && reviewsMount.controller?.update) reviewsMount.controller.update({ lang: payload.lang });
    else { reviewsMount?.controller?.destroy?.(); reviewsMount = { container, controller: window.CampaignReviews.mount(container, { leadId: payload.leadId, cid: payload.cid, lang: payload.lang }) }; }
  }
  else { const slot = $('reviews-module'); slot.replaceChildren(); const link = translated(linked('', context.lead.google.mapsUrl, 'google-summary'), d => `${context.lead.google.rating} / 5 · ${context.lead.google.reviewCount} Google ${d.reviews.toLowerCase()} ↗`); link.target = '_blank'; link.rel = 'noopener noreferrer'; slot.append(link); applyLanguage(); }
  if (window.CampaignCalendar?.mount) {
    const container = $('calendar-module');
    if (calendarMount?.container === container && calendarMount.controller?.update) calendarMount.controller.update({ lang: payload.lang, onSuccess: showThanks });
    else { calendarMount?.controller?.destroy?.(); calendarMount = { container, controller: window.CampaignCalendar.mount(container, payload) }; }
  }
  dispatchContext();
}

function renderThanks() {
  calendarMount?.controller?.destroy?.(); calendarMount = null;
  reviewsMount?.controller?.destroy?.(); reviewsMount = null;
  bindings = []; const lead = context.lead, site = make('article', 'site thanks-site theme-' + context.theme); site.dataset.leadId = lead.id; site.dataset.googleCid = lead.google.cid;
  const header = make('header', 'site-header'); header.append(linked(lead.name, themeUrl('home').href, 'site-brand')); site.append(header);
  const main = make('section', 'thanks-content');
  const icon = make('div', 'thanks-symbol'); icon.setAttribute('aria-hidden', 'true'); icon.textContent = '✓';
  const copy = make('div', 'thanks-copy'); copy.append(translated(make('p', 'site-kicker'), d => d.thanksKicker), translated(make('h1', 'site-title'), d => d.thanksTitle), translated(make('p', 'site-body'), d => lead.family === 'salon' ? d.thanksBeauty : d.thanksFood), translated(make('p', 'thanks-demo'), d => d.thanksDemo));
  if (thankYouData?.date) { const date = translated(make('p', 'thanks-date'), d => `${d.preferredDate}: ${new Intl.DateTimeFormat(context.lang === 'nl' ? 'nl-NL' : 'en-GB', { dateStyle: 'long', timeZone: 'Europe/Amsterdam' }).format(new Date(thankYouData.date + 'T12:00:00Z'))}${thankYouData.time ? ' · ' + thankYouData.time : ''}`); copy.append(date); }
  const link = translated(linked('', themeUrl('home').href, 'site-cta'), d => d.returnHome); link.dataset.home = 'true'; link.addEventListener('click', event => { event.preventDefault(); context.view = 'home'; updateUrl(); renderHome(); window.scrollTo({ top: 0, behavior: 'instant' }); }); copy.append(link, translated(make('p', 'thanks-note'), d => d.thanksNote)); main.append(icon, copy); site.append(main);
  const footer = make('footer', 'site-footer'); footer.append(make('strong', '', lead.name), make('p', '', lead.address)); site.append(footer); $('product').replaceChildren(site); applyLanguage();
}

function showThanks(data) {
  if (data?.leadId !== context.lead.id || String(data?.cid || '') !== context.lead.google.cid) throw new Error('The request belongs to another business.');
  thankYouData = { date: typeof data?.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data.date) ? data.date : null, time: typeof data?.time === 'string' && /^\d{2}:\d{2}$/.test(data.time) ? data.time : null, intent: typeof data?.intent === 'string' ? data.intent : null };
  context.view = 'thanks'; updateUrl(); renderThanks(); window.scrollTo({ top: 0, behavior: 'instant' }); $('main-content').focus({ preventScroll: true });
}
function applyLanguage() {
  document.documentElement.lang = context.lang; const site = $('product').firstElementChild; if (site) site.lang = context.lang;
  for (const update of toolbarBindings) update(); for (const update of bindings) update();
  document.querySelector('.skip').textContent = words[context.lang].skip;
  document.title = `${context.lead.name} · ${words[context.lang].personalWebsite} · Demo`;
  document.querySelectorAll('[data-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === context.lang)));
  document.querySelectorAll('[data-home]').forEach(link => link.href = themeUrl('home').href);
}
function setLanguage(lang) { if (!['en', 'nl'].includes(lang) || context.lang === lang) return; context.lang = lang; applyLanguage(); updateUrl(); mountModules(); }
function setTheme(theme) {
  if (!THEME_IDS[context.lead.family].includes(theme) || context.theme === theme) return;
  const old = context.theme; context.theme = theme; const site = $('product').firstElementChild; site.classList.replace('theme-' + old, 'theme-' + theme);
  document.querySelectorAll('[data-theme]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.theme === theme)));
  applyLanguage(); updateUrl(); dispatchContext();
}
window.addEventListener('campaign20:reviews-ready', () => { if (context?.view === 'home') mountModules(); });
window.addEventListener('popstate', () => { const next = resolveContext(model, location.search); if (next.lead.id !== context.lead.id) thankYouData = null; context = next; toolbar(); context.view === 'thanks' ? renderThanks() : renderHome(); });

try {
  const response = await fetch('./business-data.json', { cache: 'no-store' }); if (!response.ok) throw new Error('Business data could not be loaded.'); model = await response.json();
  const issues = validateModel(model); if (issues.length) throw new Error(issues.join('; '));
  context = resolveContext(model, location.search); toolbar(); context.view === 'thanks' ? renderThanks() : renderHome(); updateUrl();
  window.CAMPAIGN20 = { getContext: () => ({ ...moduleContext(), theme: context.theme, returnUrl: themeUrl('home').href }), showThanks };
} catch (error) { $('load-error').hidden = false; $('load-error').textContent = 'The website preview could not be loaded. Please refresh and try again.'; console.error('Campaign preview:', error.message); }
