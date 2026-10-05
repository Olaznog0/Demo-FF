import { THEME_IDS, contextUrl, resolveContext, validateModel, bookingServices, confirmationKey, confirmationSummary, readConfirmation } from './model.mjs';
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

Object.assign(words.en, { home: 'The website', about: 'About us', discover: 'Services', faqNav: 'FAQ', newTab: 'Opens in a new tab', aboutTitle: 'A familiar place. A personal touch.', aboutBody: (b) => `${b.name}, in ${b.locality}. Discover the atmosphere, read our guests’ experiences and tell us what you have in mind.`, aboutBeauty: (b) => `${b.name}, in ${b.locality}. Your wishes start the conversation. Get to know the salon and plan your next appointment.`, invitationKicker: 'Your next moment', invitationTitle: 'Let’s make a plan.', invitationBody: 'Choose your preferred date and time in our visit planner.', invitationBeauty: 'Choose what you have in mind, then a day and time that suit you.', bookingKicker: 'A little time for you', bookingTitle: 'Let’s plan your visit.', bookingBeauty: 'Your next appointment.', bookingBody: 'Your preferences, in one place. Start with what you have in mind.', contactTitle: 'A question? Let’s talk.', contactBody: 'Tell us what you have in mind. We’ll be in touch to help with the details.', name: 'Your name', email: 'Email address', message: 'Your message', send: 'Send my message', contactRequired: 'Enter your name, a valid email address and a message.', thanksTitle: 'Thank you for your request.', thanksBeauty: 'Thank you for planning your next appointment. We’ll be in touch to confirm the details.', thanksFood: 'Thank you for planning your visit. We’ll be in touch about your request.', thanksMessage: 'Thank you for your message. We’ll be in touch as soon as possible.', thanksNote: 'We look forward to hearing more about what you have in mind.', summaryService: 'Your preference', galleryTitle: 'A little inspiration.', galleryBody: 'A fresh perspective for your next look.' });
Object.assign(words.nl, { home: 'De website', about: 'Over ons', discover: 'Mogelijkheden', faqNav: 'FAQ', newTab: 'Opent in een nieuw tabblad', aboutTitle: 'Een vertrouwde plek. Persoonlijke aandacht.', aboutBody: (b) => `${b.name}, in ${b.locality}. Ontdek de sfeer, lees de ervaringen van onze gasten en vertel ons wat je in gedachten hebt.`, aboutBeauty: (b) => `${b.name}, in ${b.locality}. Jouw wensen zijn het begin van ons gesprek. Leer de salon kennen en plan je volgende afspraak.`, invitationKicker: 'Jouw volgende moment', invitationTitle: 'Zullen we iets plannen?', invitationBody: 'Kies je gewenste datum en tijd in onze bezoekplanner.', invitationBeauty: 'Kies wat je in gedachten hebt en daarna een dag en tijd die je uitkomen.', bookingKicker: 'Even tijd voor jezelf', bookingTitle: 'Plan je volgende bezoek.', bookingBeauty: 'Je volgende afspraak.', bookingBody: 'Jouw voorkeuren op één plek. Begin met wat je in gedachten hebt.', contactTitle: 'Een vraag? Laten we praten.', contactBody: 'Vertel ons wat je in gedachten hebt. We nemen contact op om je verder te helpen.', name: 'Je naam', email: 'E-mailadres', message: 'Je bericht', send: 'Verstuur mijn bericht', contactRequired: 'Vul je naam, een geldig e-mailadres en een bericht in.', thanksTitle: 'Bedankt voor je aanvraag.', thanksBeauty: 'Bedankt voor het plannen van je volgende afspraak. We nemen contact op om de details te bevestigen.', thanksFood: 'Bedankt voor het plannen van je bezoek. We nemen contact op over je aanvraag.', thanksMessage: 'Bedankt voor je bericht. We nemen zo snel mogelijk contact op.', thanksNote: 'We horen graag meer over wat je in gedachten hebt.', summaryService: 'Jouw voorkeur', galleryTitle: 'Een beetje inspiratie.', galleryBody: 'Een frisse blik op jouw volgende look.' });

let model, context, bindings = [], toolbarBindings = [], thankYouData = null, calendarMount = null, reviewsMount = null;
Object.assign(words.en, { thanksMessageTitle: 'Thank you for your message.', noRequestTitle: 'Let’s start with you.', noRequestBody: 'Return to the website to send a message or plan your next visit.' });
Object.assign(words.nl, { thanksMessageTitle: 'Bedankt voor je bericht.', noRequestTitle: 'Het begint bij jou.', noRequestBody: 'Ga naar de website om een bericht te sturen of je volgende bezoek te plannen.' });
function translated(node, getter) { bindings.push(() => node.textContent = getter(words[context.lang], context.lead)); return node; }
function linked(label, href, className) { const link = make('a', className, label); link.href = href; return link; }
function homeLink(label, anchor = '', className = '') { const url = themeUrl('home'); url.hash = anchor; const link = linked(label, url.href, className); link.dataset.home = 'true'; if (anchor) link.dataset.anchor = anchor; return link; }
function bookingLink(className = 'site-cta', serviceId = null) {
  const link = linked('', contextUrl(location.href, { ...context, serviceId }, 'booking').href, className); link.dataset.booking = 'true'; if (serviceId) link.dataset.service = serviceId; link.target = '_blank'; link.rel = 'noopener noreferrer';
  link.append(translated(make('span'), (d, b) => b.family === 'salon' ? d.calendarBeauty : d.calendarFood), make('span', 'cta-arrow', '↗')); link.lastChild.setAttribute('aria-hidden', 'true');
  bindings.push(() => link.title = words[context.lang].newTab); return link;
}
function siteHeader(lead, inner = false) {
  const header = make('header', 'site-header'); header.append(businessBrand(lead));
  const nav = make('nav', 'site-nav'); bindings.push(() => nav.setAttribute('aria-label', words[context.lang].navigation));
  const items = inner ? [['home', ''], ['contact', 'contact']] : [['about', 'about'], ['discover', 'discover'], ['reviews', 'reviews-module'], ['contact', 'contact']];
  for (const [key, anchor] of items) nav.append(translated(inner ? homeLink('', anchor) : linked('', '#' + anchor), d => d[key]));
  const faqLink = translated(linked('', themeUrl('faq').href), d => d.faqNav); faqLink.dataset.faq = 'true'; nav.append(faqLink);
  if (!inner) nav.append(bookingLink('nav-booking'));
  header.append(nav); return header;
}
function businessBrand(lead) {
  const brand = linked('', themeUrl('home').href, 'site-brand'); brand.dataset.home = 'true';
  if (lead.name.length > 34) brand.classList.add('brand-long-name');
  const mark = make('span', 'brand-mark'); mark.setAttribute('aria-hidden', 'true');
  const logo = lead.brandLogo;
  if (logo?.verified === true && typeof logo.asset === 'string' && /^[a-z0-9][a-z0-9._-]*\.(?:webp|png|svg)$/i.test(logo.asset) && safeUrl(logo.sourceUrl)) {
    const image = make('img', 'brand-logo'); image.src = '/demos/assets/' + logo.asset; image.alt = ''; image.width = 72; image.height = 72; image.decoding = 'async';
    mark.classList.add('brand-mark-logo'); mark.append(image);
  } else {
    const significant = lead.name.split(/\s+/).filter(part => !/^(?:café|cafe|kapsalon|de|het|the|salon|barbershop|beauty|en|and|&)$/i.test(part));
    mark.textContent = (significant.length ? significant : lead.name.split(/\s+/)).slice(0, 2).map(part => Array.from(part)[0]).join('').toLocaleUpperCase('nl-NL');
  }
  const identity = make('span', 'brand-identity'); identity.append(make('strong', 'brand-wordmark', lead.name), make('span', 'brand-place', lead.locality));
  brand.append(mark, identity); return brand;
}
function themeUrl(view = context.view) { return contextUrl(location.href, context, view); }
function updateUrl() { history.replaceState(null, '', themeUrl()); }
function dispatchContext() { window.dispatchEvent(new CustomEvent('campaign20:context', { detail: { leadId: context.lead.id, cid: context.lead.google.cid, theme: context.theme, lang: context.lang, returnUrl: themeUrl('home').href } })); }

function toolbar() {
  toolbarBindings = [];
  const text = getter => { const node = make('span'); toolbarBindings.push(() => node.textContent = getter(words[context.lang])); return node; };
  const brand = make('div', 'demo-brand'); const ocimatik = linked('Demo Ocimatik', 'https://ocimatik.com/', 'demo-badge'); ocimatik.target = '_blank'; ocimatik.rel = 'noopener noreferrer'; brand.append(ocimatik, text(d => d.preview));
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

function businessSymbol(lead) {
  const paths = lead.family === 'salon'
    ? ['M8 8l18 18M8 24L26 6M25 25l3 3', 'M10 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM10 25a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z']
    : lead.groupId === 'ice-cream'
      ? ['M8 16h16L16 30Z', 'M7 16a5 5 0 0 1 3-9 6 6 0 0 1 12 0 5 5 0 0 1 3 9', 'M12 21l8 4M14 17l8 5']
      : lead.id === 'NLEX100N-156'
        ? ['M5 16c7-10 14-10 22 0-8 10-15 10-22 0Z', 'M5 16l-4-6v12ZM20 10q-3 6 0 12', 'M23 14h.1']
        : ['M5 11h18v8a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8Z', 'M23 12h3a4 4 0 0 1 0 8h-3M2 30h27M10 3v3M17 2v4'];
  const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
  for (const [name, value] of Object.entries({ viewBox: '0 0 32 32', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', class: 'stamp-symbol' })) svg.setAttribute(name, value);
  for (const d of paths) { const path = document.createElementNS(ns, 'path'); path.setAttribute('d', d); svg.append(path); } return svg;
}

function renderHome() {
  calendarMount?.controller?.destroy?.(); calendarMount = null;
  const lead = context.lead; bindings = [];
  const site = make('article', 'site theme-' + context.theme); site.dataset.leadId = lead.id; site.dataset.googleCid = lead.google.cid;
  site.append(siteHeader(lead));
  const hero = make('section', 'site-hero'), copy = make('div', 'hero-copy'); copy.append(make('p', 'site-kicker', lead.locality));
  copy.append(translated(make('h1', 'site-title'), (d, b) => b.groupId === 'ice-cream' ? d.heroIce : (b.family === 'salon' ? d.heroBeauty : d.heroFood)[context.theme]));
  copy.append(translated(make('p', 'site-body'), bodyText));
  copy.append(bookingLink());
  const proof = linked('', '#reviews-module', 'hero-google-proof'); bindings.push(() => { const d = words[context.lang]; proof.textContent = `★ ${new Intl.NumberFormat(context.lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(lead.google.rating)} / 5 · ${lead.google.reviewCount} Google ${d.reviews.toLowerCase()}`; }); copy.append(proof);
  const visual = make('figure', 'hero-visual');
  if (lead.media.asset) { const img = make('img'); img.src = '/demos/assets/' + lead.media.asset; img.width = 1200; img.height = 900; img.decoding = 'async'; img.fetchPriority = 'high'; bindings.push(() => img.alt = lead.family === 'salon' ? words[context.lang].beautyAlt : words[context.lang].assetAlt); visual.append(img); } else visual.append(iceVisual());
  hero.append(copy, visual); site.append(hero);
  const about = make('section', 'content-section about-section'); about.id = 'about'; const aboutCopy = make('div'); aboutCopy.append(translated(make('p', 'site-kicker'), d => d.about), translated(make('h2', 'section-title'), d => d.aboutTitle), translated(make('p', 'section-body'), d => lead.family === 'salon' ? d.aboutBeauty(lead) : d.aboutBody(lead)));
  const stamp = make('div', 'business-stamp'); stamp.setAttribute('aria-hidden', 'true'); stamp.append(businessSymbol(lead), make('strong', '', lead.name), make('span', '', lead.locality)); about.append(aboutCopy, stamp); site.append(about);
  const services = make('section', 'content-section services-section'); services.id = 'discover'; services.append(translated(make('p', 'site-kicker'), d => d.discover), translated(make('h2', 'section-title'), d => lead.family === 'salon' ? d.invitationKicker : d.detailsLabel)); const choices = make('div', 'booking-service-cards');
  for (const service of bookingServices(lead)) { const card = make('article', 'booking-service-card'); card.append(translated(make('h3'), () => service.title[context.lang]), translated(make('p'), d => lead.family === 'salon' ? d.invitationBeauty : d.invitationBody), bookingLink('text-cta', service.id)); choices.append(card); } services.append(choices); site.append(services);
  if (lead.family === 'salon') { const gallery = make('section', 'content-section inspiration-section'); gallery.id = 'inspiration'; const img = make('img', 'inspiration-image'); img.src = '/demos/assets/' + (lead.media.asset === 'salon-scene.webp' ? 'hair-inspiration.webp' : 'salon-scene.webp'); img.width = 1200; img.height = 900; img.loading = 'lazy'; img.decoding = 'async'; bindings.push(() => img.alt = words[context.lang].beautyAlt); const intro = make('div'); intro.append(translated(make('h2', 'section-title'), d => d.galleryTitle), translated(make('p', 'section-body'), d => d.galleryBody), bookingLink()); gallery.append(img, intro); site.append(gallery); }
  const reviews = make('section', 'content-section reviews-section'); reviews.id = 'reviews-module'; reviews.dataset.leadId = lead.id; reviews.dataset.googleCid = lead.google.cid; site.append(reviews);
  site.append(bookingInvitation());
  const faq = make('section', 'content-section faq-section'); faq.id = 'faq'; faq.append(translated(make('h2', 'section-title'), d => d.faq));
  const faqs = make('div', 'faq-grid');
  for (let index = 0; index < 3; index++) { const item = make('details', 'faq-item'); const summary = make('summary'); summary.append(translated(make('h3'), d => (lead.family === 'salon' ? d.faqBeauty : d.faqFood)[index][0])); const answer = translated(make('p'), d => (lead.family === 'salon' ? d.faqBeauty : d.faqFood)[index][1]); item.append(summary, answer); faqs.append(item); } faq.append(faqs); site.append(faq);
  const moreFaq = translated(linked('', themeUrl('faq').href, 'text-cta'), d => d.faq); moreFaq.dataset.faq = 'true'; faq.append(moreFaq);
  site.append(contactSection());
  const visit = make('section', 'content-section visit-section'); visit.id = 'visit';
  const info = make('div', 'visit-copy'); info.append(translated(make('h2', 'section-title'), d => d.findUs), make('strong', 'visit-name', lead.name), make('p', 'visit-address', lead.address));
  const maps = safeUrl(lead.google.mapsUrl); if (maps) { const link = translated(linked('', maps, 'location-link'), d => d.getDirections); link.target = '_blank'; link.rel = 'noopener noreferrer'; info.append(link); }
  if (lead.phone && /^\+?\d+$/.test(lead.phone)) { const phone = linked(lead.phone, 'tel:' + lead.phone, 'phone-link'); phone.setAttribute('aria-label', `${words[context.lang].call}: ${lead.phone}`); bindings.push(() => phone.setAttribute('aria-label', `${words[context.lang].call}: ${lead.phone}`)); info.append(phone); }
  const map = make('iframe', 'business-map'); map.loading = 'lazy'; map.referrerPolicy = 'strict-origin-when-cross-origin'; map.src = `https://www.google.com/maps?cid=${lead.google.cid}&output=embed`; bindings.push(() => map.title = `${words[context.lang].mapTitle} ${lead.name}`); visit.append(info, map); site.append(visit);
  const footer = make('footer', 'site-footer'); footer.append(make('strong', '', lead.name), translated(linked('', 'https://ocimatik.com/', 'ocimatik-credit'), d => d.powered)); site.append(footer);
  $('product').replaceChildren(site); applyLanguage(); mountModules();
}

function bookingInvitation() {
  const section = make('section', 'content-section booking-invitation'); section.id = 'appointment';
  const copy = make('div'); copy.append(translated(make('p', 'site-kicker'), d => d.invitationKicker), translated(make('h2', 'section-title'), d => d.invitationTitle), translated(make('p', 'section-body'), (d, b) => b.family === 'salon' ? d.invitationBeauty : d.invitationBody));
  section.append(copy, bookingLink()); return section;
}

function contactSection() {
  const section = make('section', 'content-section campaign-contact'); section.id = 'contact'; const intro = make('div', 'contact-intro'); intro.append(translated(make('p', 'site-kicker'), d => d.contact), translated(make('h2', 'section-title'), d => d.contactTitle), translated(make('p', 'section-body'), d => d.contactBody));
  const form = make('form', 'contact-form'); form.noValidate = true; form.dataset.contactForm = 'true';
  for (const [name, type] of [['name', 'text'], ['email', 'email'], ['message', 'textarea']]) { const label = make('label', 'contact-field'); label.append(translated(make('span'), d => d[name])); const field = make(type === 'textarea' ? 'textarea' : 'input'); if (type !== 'textarea') { field.type = type; field.autocomplete = name; } else field.rows = 5; field.name = name; field.required = true; field.maxLength = name === 'message' ? 3000 : name === 'name' ? 120 : 200; if (name !== 'email') field.minLength = name === 'name' ? 2 : 10; label.append(field); form.append(label); }
  const error = make('p', 'contact-error'); error.setAttribute('role', 'alert'); error.hidden = true; bindings.push(() => { if (!error.hidden) error.textContent = words[context.lang].contactRequired; });
  const submit = translated(make('button', 'site-cta'), d => d.send); submit.type = 'submit'; form.append(error, submit);
  form.addEventListener('input', () => { error.hidden = true; });
  form.addEventListener('submit', event => { event.preventDefault(); const fields = form.elements; const valid = fields.name.value.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value.trim()) && fields.message.value.trim().length >= 10; if (!valid) { error.hidden = false; error.textContent = words[context.lang].contactRequired; form.reportValidity(); return; } submit.disabled = true; showThanks({ leadId: context.lead.id, cid: context.lead.google.cid, kind: 'enquiry' }); });
  section.append(intro, form); return section;
}

function renderBooking() {
  reviewsMount?.controller?.destroy?.(); reviewsMount = null; bindings = [];
  const lead = context.lead, site = make('article', 'site booking-site theme-' + context.theme); site.dataset.leadId = lead.id; site.dataset.googleCid = lead.google.cid; site.append(siteHeader(lead, true));
  const intro = make('section', 'booking-intro'); intro.append(translated(make('p', 'site-kicker'), d => d.bookingKicker), translated(make('h1', 'site-title'), d => lead.family === 'salon' ? d.bookingBeauty : d.bookingTitle), translated(make('p', 'section-body'), d => d.bookingBody)); site.append(intro);
  const slot = make('section', 'booking-module'); slot.id = 'calendar-module'; slot.dataset.leadId = lead.id; slot.dataset.googleCid = lead.google.cid; site.append(slot);
  const footer = make('footer', 'site-footer'); footer.append(make('strong', '', lead.name), translated(homeLink('', '', 'text-cta'), d => d.returnHome)); site.append(footer); $('product').replaceChildren(site); applyLanguage(); mountModules();
}

function renderFaq() {
  calendarMount?.controller?.destroy?.(); calendarMount = null; reviewsMount?.controller?.destroy?.(); reviewsMount = null; bindings = [];
  const lead = context.lead, site = make('article', 'site faq-site theme-' + context.theme); site.dataset.leadId = lead.id; site.dataset.googleCid = lead.google.cid; site.append(siteHeader(lead, true));
  const content = make('section', 'content-section full-faq'); content.append(translated(make('p', 'site-kicker'), d => d.faqNav), translated(make('h1', 'site-title'), d => d.faq));
  const list = make('div', 'full-faq-list'); for (let index = 0; index < 3; index++) { const item = make('details', 'faq-item'); const summary = make('summary'); summary.append(translated(make('h2'), d => (lead.family === 'salon' ? d.faqBeauty : d.faqFood)[index][0])); item.append(summary, translated(make('p'), d => (lead.family === 'salon' ? d.faqBeauty : d.faqFood)[index][1])); list.append(item); } content.append(list); site.append(content, bookingInvitation());
  const footer = make('footer', 'site-footer faq-footer'); footer.append(make('strong', '', lead.name), make('p', '', lead.address));
  const directions = translated(linked('', lead.google.mapsUrl, 'text-cta'), d => d.getDirections); directions.target = '_blank'; directions.rel = 'noopener noreferrer';
  footer.append(directions, translated(homeLink('', 'contact', 'text-cta'), d => d.contact), translated(homeLink('', '', 'text-cta'), d => d.returnHome)); site.append(footer);
  $('product').replaceChildren(site); applyLanguage(); dispatchContext();
}

function moduleContext() { return { leadId: context.lead.id, cid: context.lead.google.cid, businessName: context.lead.name, family: context.lead.family, subtype: context.lead.groupId === 'ice-cream' ? 'ice-cream' : context.lead.actualSubtype, services: bookingServices(context.lead), serviceId: context.serviceId, lang: context.lang, onSuccess: showThanks }; }
function mountModules() {
  if (!['home', 'booking'].includes(context.view)) return;
  const payload = moduleContext();
  if (context.view === 'home' && window.CampaignReviews?.mount) {
    const container = $('reviews-module');
    if (reviewsMount?.container === container && reviewsMount.controller?.update) reviewsMount.controller.update({ lang: payload.lang });
    else { reviewsMount?.controller?.destroy?.(); reviewsMount = { container, controller: window.CampaignReviews.mount(container, { leadId: payload.leadId, cid: payload.cid, lang: payload.lang, reviewExtension: context.lead.google.reviewExtension, reviewSnapshot: context.lead.google.reviewSnapshot }) }; }
  }
  else if (context.view === 'home') { const slot = $('reviews-module'); slot.replaceChildren(); const link = translated(linked('', context.lead.google.mapsUrl, 'google-summary'), d => `${context.lead.google.rating} / 5 · ${context.lead.google.reviewCount} Google ${d.reviews.toLowerCase()} ↗`); link.target = '_blank'; link.rel = 'noopener noreferrer'; slot.append(link); applyLanguage(); }
  if (context.view === 'booking' && window.CampaignCalendar?.mount) {
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
  site.append(siteHeader(lead, true));
  const main = make('section', 'thanks-content');
  const icon = make('div', 'thanks-symbol'); icon.setAttribute('aria-hidden', 'true'); icon.textContent = thankYouData ? '✓' : '↗';
  const copy = make('div', 'thanks-copy'); copy.append(translated(make('p', 'site-kicker'), d => thankYouData ? d.thanksKicker : d.personalWebsite), translated(make('h1', 'site-title'), d => !thankYouData ? d.noRequestTitle : thankYouData.kind === 'enquiry' ? d.thanksMessageTitle : d.thanksTitle), translated(make('p', 'site-body'), d => !thankYouData ? d.noRequestBody : thankYouData.kind === 'enquiry' ? d.thanksMessage : lead.family === 'salon' ? d.thanksBeauty : d.thanksFood));
  if (thankYouData?.serviceId) copy.append(translated(make('p', 'thanks-service'), d => `${d.summaryService}: ${bookingServices(lead).find(service => service.id === thankYouData.serviceId)?.title[context.lang] || ''}`));
  if (thankYouData?.date) { const date = translated(make('p', 'thanks-date'), d => `${d.preferredDate}: ${new Intl.DateTimeFormat(context.lang === 'nl' ? 'nl-NL' : 'en-GB', { dateStyle: 'long', timeZone: 'Europe/Amsterdam' }).format(new Date(thankYouData.date + 'T12:00:00Z'))}${thankYouData.time ? ' · ' + thankYouData.time : ''}`); copy.append(date); }
  const link = translated(homeLink('', '', 'site-cta'), d => d.returnHome); copy.append(link, translated(make('p', 'thanks-note'), d => d.thanksNote)); main.append(icon, copy); site.append(main);
  const footer = make('footer', 'site-footer'); footer.append(make('strong', '', lead.name), make('p', '', lead.address)); site.append(footer); $('product').replaceChildren(site); applyLanguage();
}

function showThanks(data) {
  thankYouData = confirmationSummary(context, data);
  try { sessionStorage.setItem(confirmationKey(context), JSON.stringify(thankYouData)); } catch { /* In-memory confirmation still works if storage is unavailable. */ }
  context.view = 'thanks'; updateUrl(); renderThanks(); window.scrollTo({ top: 0, behavior: 'instant' }); $('main-content').focus({ preventScroll: true });
}
function applyLanguage() {
  document.documentElement.lang = context.lang; const site = $('product').firstElementChild; if (site) site.lang = context.lang;
  for (const update of toolbarBindings) update(); for (const update of bindings) update();
  document.querySelector('.skip').textContent = words[context.lang].skip;
  document.title = `${context.lead.name} · ${words[context.lang].personalWebsite} · Demo`;
  document.querySelectorAll('[data-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === context.lang)));
  document.querySelectorAll('[data-home]').forEach(link => { const url = themeUrl('home'); url.hash = link.dataset.anchor || ''; link.href = url.href; });
  document.querySelectorAll('[data-booking]').forEach(link => link.href = contextUrl(location.href, { ...context, serviceId: link.dataset.service || null }, 'booking').href);
  document.querySelectorAll('[data-faq]').forEach(link => link.href = themeUrl('faq').href);
}
function setLanguage(lang) { if (!['en', 'nl'].includes(lang) || context.lang === lang) return; context.lang = lang; applyLanguage(); updateUrl(); mountModules(); }
function setTheme(theme) {
  if (!THEME_IDS[context.lead.family].includes(theme) || context.theme === theme) return;
  const old = context.theme; context.theme = theme; const site = $('product').firstElementChild; site.classList.replace('theme-' + old, 'theme-' + theme);
  document.querySelectorAll('[data-theme]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.theme === theme)));
  applyLanguage(); updateUrl(); dispatchContext();
}
window.addEventListener('campaign20:reviews-ready', () => { if (context?.view === 'home') mountModules(); });
function renderRoute() { if (context.view === 'booking') renderBooking(); else if (context.view === 'faq') renderFaq(); else if (context.view === 'thanks') renderThanks(); else renderHome(); }
window.addEventListener('popstate', () => {
  if (!model || !context) return;
  const next = resolveContext(model, location.search);
  // Native section links also fire popstate. Keep the current product and its
  // review/appointment state when only the fragment changes.
  if (next.lead.id === context.lead.id && next.view === context.view && next.theme === context.theme && next.lang === context.lang) return;
  if (next.lead.id !== context.lead.id) thankYouData = null;
  context = next; toolbar(); renderRoute();
});

try {
  const response = await fetch('./business-data.json', { cache: 'no-store' }); if (!response.ok) throw new Error('Business data could not be loaded.'); model = await response.json();
  const issues = validateModel(model); if (issues.length) throw new Error(issues.join('; '));
  context = resolveContext(model, location.search); try { thankYouData = readConfirmation(context, sessionStorage.getItem(confirmationKey(context))); } catch { thankYouData = null; } toolbar(); renderRoute(); updateUrl();
  window.CAMPAIGN20 = { getContext: () => ({ ...moduleContext(), theme: context.theme, returnUrl: themeUrl('home').href }), showThanks };
} catch (error) { $('load-error').hidden = false; $('load-error').textContent = 'The website preview could not be loaded. Please refresh and try again.'; console.error('Campaign preview:', error.message); }
