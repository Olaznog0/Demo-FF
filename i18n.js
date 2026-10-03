(function(root){
'use strict';
const rows={
  "translatedConcept": [
    "Vertaling",
    "Translation",
    "Traducción para este concepto",
    "Traducció per a aquest concepte"
  ],
  "liveTime": [
    "Tijd",
    "Time",
    "Hora",
    "Hora"
  ],
  "availabilityLoading": [
    "Beschikbaarheid laden…",
    "Loading availability…",
    "Consultando disponibilidad…",
    "Consultant disponibilitat…"
  ],
  "availabilityEmpty": [
    "Geen tijden beschikbaar voor deze dag. Kies een andere dag.",
    "No times are available on this date. Choose another date.",
    "No hay horas disponibles este día. Elige otra fecha.",
    "No hi ha hores disponibles aquest dia. Tria una altra data."
  ],
  "calendarPending": [
    "Neem rechtstreeks contact op voor je afspraak.",
    "Contact the business directly about your appointment.",
    "La agenda de este negocio está pendiente de activación. Llama para reservar.",
    "L’agenda d’aquest negoci està pendent d’activació. Truca per reservar."
  ],
  "availabilityError": [
    "Beschikbaarheid kon niet worden geladen. Probeer opnieuw of bel het bedrijf.",
    "Availability could not be loaded. Try again or call the business.",
    "No se pudo consultar disponibilidad. Reintenta o llama al negocio.",
    "No s’ha pogut consultar disponibilitat. Reintenta o truca al negoci."
  ],
  "customerDetails": [
    "Jouw gegevens",
    "Your details",
    "Tus datos",
    "Les teves dades"
  ],
  "bookingEmail": [
    "E-mailadres",
    "Email address",
    "Correo electrónico",
    "Correu electrònic"
  ],
  "bookingPhone": [
    "Telefoon (optioneel)",
    "Phone (optional)",
    "Teléfono (opcional)",
    "Telèfon (opcional)"
  ],
  "confirmBooking": [
    "Afspraak bevestigen",
    "Confirm appointment",
    "Confirmar cita",
    "Confirma la cita"
  ],
  "bookingSubmitting": [
    "Afspraak wordt bevestigd…",
    "Confirming your appointment…",
    "Confirmando tu cita…",
    "Confirmant la cita…"
  ],
  "bookingSuccess": [
    "Je afspraak is bevestigd. Controleer je e-mail voor de bevestiging en annuleerlink.",
    "Your appointment is confirmed. Check your email for confirmation and the cancellation link.",
    "Tu cita está confirmada. Consulta el correo con confirmación y enlace de cancelación.",
    "La cita està confirmada. Consulta el correu amb la confirmació i l’enllaç de cancel·lació."
  ],
  "bookingError": [
    "De afspraak is niet bevestigd. Controleer de beschikbaarheid opnieuw of bel het bedrijf.",
    "Your appointment is not confirmed. Check availability again or call the business.",
    "La cita no está confirmada. Consulta disponibilidad de nuevo o llama al negocio.",
    "La cita no està confirmada. Consulta disponibilitat de nou o truca al negoci."
  ],
  "apiBookingIntro": [
    "Kies een behandeling, dag en beschikbare tijd. Bevestig vervolgens met je gegevens.",
    "Choose a service, date and available time. Then confirm with your details.",
    "Elige servicio, fecha y hora disponible. Después confirma con tus datos.",
    "Tria servei, data i hora disponible. Després confirma amb les teves dades."
  ],
  "bookingPrivacy": [
    "Na bevestigen worden je gegevens gebruikt voor de afspraak en bevestigingsmail. Annuleren kan via de link in je e-mail.",
    "On confirmation, your details are used for the appointment and confirmation email. Cancel using the link in your email.",
    "Al confirmar, se usarán tus datos para la cita y el correo de confirmación. Cancela desde el enlace del correo.",
    "En confirmar, les dades s’utilitzen per a la cita i el correu de confirmació. Cancel·la des de l’enllaç del correu."
  ],
  "chooseOtherDate": [
    "Of kies een andere datum",
    "Or choose another date",
    "O elige otra fecha",
    "O tria una altra data"
  ],
  "contactSend": [
    "Bericht versturen",
    "Send message",
    "Enviar mensaje",
    "Envia el missatge"
  ],
  "contactSubmitting": [
    "Bericht wordt verstuurd…",
    "Sending your message…",
    "Enviando mensaje…",
    "Enviant el missatge…"
  ],
  "contactSuccess": [
    "Je bericht is verstuurd. Het bedrijf neemt contact met je op.",
    "Your message has been sent. The business will get in touch.",
    "Tu mensaje se ha enviado. El negocio se pondrá en contacto contigo.",
    "El missatge s’ha enviat. El negoci es posarà en contacte amb tu."
  ],
  "contactError": [
    "Je bericht is niet verstuurd. Bel het bedrijf of probeer later opnieuw.",
    "Your message has not been sent. Call the business or try again later.",
    "Tu mensaje no se ha enviado. Llama al negocio o reintenta más tarde.",
    "El missatge no s’ha enviat. Truca al negoci o torna-ho a provar més tard."
  ],
  "contactPrivacy": [
    "Je naam, e-mail en bericht worden naar het bedrijf verstuurd om je vraag te beantwoorden.",
    "Your name, email and message are sent to the business to answer your enquiry.",
    "Tu nombre, correo y mensaje se enviarán al negocio para responder tu consulta.",
    "El nom, correu i missatge s’envien al negoci per respondre la consulta."
  ],
  "mapTitle": [
    "Locatie op Google Maps",
    "Location on Google Maps",
    "Ubicación en Google Maps",
    "Ubicació a Google Maps"
  ],
  "carouselPrevious": [
    "Vorige",
    "Previous",
    "Anterior",
    "Anterior"
  ],
  "carouselNext": [
    "Volgende",
    "Next",
    "Siguiente",
    "Següent"
  ],
  "carouselPlay": [
    "Automatisch afspelen",
    "Play automatically",
    "Reproducción automática",
    "Reproducció automàtica"
  ],
  "carouselPause": [
    "Pauzeren",
    "Pause",
    "Pausar",
    "Pausa"
  ],
  "reviewCarousel": [
    "Google-beoordelingen",
    "Google reviews",
    "Reseñas de Google",
    "Ressenyes de Google"
  ],
  "photoCarousel": [
    "Fotogalerij",
    "Photo gallery",
    "Galería de fotos",
    "Galeria de fotos"
  ],
  "translatedReview": [
    "Vertaald door Google",
    "Translated by Google",
    "Traducido por Google",
    "Traduït per Google"
  ],
  "originalReview": [
    "Originele beoordeling",
    "Original review",
    "Reseña original",
    "Ressenya original"
  ],
  "inspiration": [
    "Haarinspiratie",
    "Hair inspiration",
    "Inspiración de estilo",
    "Inspiració d’estil"
  ],
  "inspirationTitle": [
    "De details maken het verschil.",
    "It’s all in the details.",
    "La diferencia está en los detalles.",
    "La diferència és als detalls."
  ],
  "conceptShort": [
    "Haar en stijl",
    "Hair and style",
    "Imagen editorial conceptual",
    "Imatge editorial conceptual"
  ],
  "connectionPending": [
    "Bekijk alle ervaringen en foto’s op Google Maps.",
    "Explore all experiences and photos on Google Maps.",
    "La conexión de Google de esta demo está pendiente de activación.",
    "La connexió de Google d’aquesta demo està pendent d’activació."
  ],
  "requestTitle": [
    "Laten we je bezoek plannen.",
    "Let’s plan your visit.",
    "Planifiquemos tu visita.",
    "Planifiquem la teva visita."
  ],
  "quickContact": [
    "Direct contact",
    "Quick contact",
    "Contacto directo",
    "Contacte directe"
  ],
  "treatmentNote": [
    "Prijs en duur: vraag de salon",
    "Price and duration: ask the salon",
    "Precio y duración: consulta al negocio",
    "Preu i durada: consulta al negoci"
  ],
  "visitSalon": [
    "Bezoek de salon",
    "Visit the salon",
    "Visita el negocio",
    "Visita el negoci"
  ],
  "allReviews": [
    "Bekijk alle beoordelingen",
    "Read all reviews",
    "Leer todas las reseñas",
    "Llegeix totes les ressenyes"
  ],
  "skip": [
    "Naar inhoud",
    "Skip to content",
    "Ir al contenido",
    "Ves al contingut"
  ],
  "nav": [
    "Hoofdnavigatie",
    "Main navigation",
    "Navegación principal",
    "Navegació principal"
  ],
  "menu": [
    "Menu",
    "Menu",
    "Menú",
    "Menú"
  ],
  "language": [
    "Taal kiezen",
    "Choose language",
    "Elegir idioma",
    "Tria idioma"
  ],
  "services": [
    "Behandelingen",
    "Treatments",
    "Servicios",
    "Serveis"
  ],
  "reviews": [
    "Ervaringen",
    "Reviews",
    "Reseñas",
    "Ressenyes"
  ],
  "gallery": [
    "De salon",
    "The salon",
    "Galería",
    "Galeria"
  ],
  "contact": [
    "Contact",
    "Contact",
    "Contacto",
    "Contacte"
  ],
  "booking": [
    "Afspraak",
    "Booking",
    "Reserva",
    "Reserva"
  ],
  "book": [
    "Plan je bezoek",
    "Plan your visit",
    "Planifica tu visita",
    "Planifica la teva visita"
  ],
  "call": [
    "Bel de salon",
    "Call the salon",
    "Llama al negocio",
    "Truca al negoci"
  ],
  "discover": [
    "Ontdek de behandelingen",
    "Explore treatments",
    "Descubre los servicios",
    "Descobreix els serveis"
  ],
  "concept": [
    "",
    "",
    "Concepto web de Ocimatik · No es la web oficial",
    "Concepte web d’Ocimatik · No és el web oficial"
  ],
  "photoConcept": [
    "Een kapper knipt haar in een lichte salon",
    "A stylist cutting hair in a sunlit salon",
    "Imagen conceptual · no es una foto del negocio ni de clientes",
    "Imatge conceptual · no és una foto del negoci ni de clients"
  ],
  "ratingSource": [
    "Google Maps · gecontroleerd op",
    "Google Maps · checked on",
    "Google Maps · comprobado el",
    "Google Maps · comprovat el"
  ],
  "reviewsCount": [
    "beoordelingen",
    "reviews",
    "reseñas",
    "ressenyes"
  ],
  "openMaps": [
    "Bekijk op Google Maps",
    "View on Google Maps",
    "Ver en Google Maps",
    "Veure a Google Maps"
  ],
  "googleReviews": [
    "Google reviews",
    "Google reviews",
    "Reseñas de Google",
    "Ressenyes de Google"
  ],
  "reviewOrder": [
    "Selectie door Google, op relevantie.",
    "Selected by Google, ordered by relevance.",
    "Selección de Google, por relevancia.",
    "Selecció de Google, per rellevància."
  ],
  "reviewTitle": [
    "Een vertrouwd adres in de buurt.",
    "A familiar name in the neighbourhood.",
    "Un negocio con presencia en el barrio.",
    "Un negoci amb presència al barri."
  ],
  "reviewIntro": [
    "Lees de ervaringen op Google Maps.",
    "Read the experiences on Google Maps.",
    "Consulta las reseñas directamente en Google Maps.",
    "Consulta les ressenyes directament a Google Maps."
  ],
  "reviewLoading": [
    "Google-beoordelingen laden…",
    "Loading Google reviews…",
    "Cargando reseñas de Google…",
    "Carregant ressenyes de Google…"
  ],
  "reviewPending": [
    "Bekijk ervaringen op Google Maps.",
    "Explore experiences on Google Maps.",
    "Consulta las opiniones en Google Maps. La conexión directa de esta demo está pendiente de activación.",
    "Consulta les opinions a Google Maps. La connexió directa d’aquesta demo està pendent d’activació."
  ],
  "reviewEmpty": [
    "Google heeft geen reviewteksten teruggestuurd. Bekijk alle beoordelingen op Google Maps.",
    "Google returned no review text. View all reviews on Google Maps.",
    "Google no devolvió textos de reseñas. Consulta todas en Google Maps.",
    "Google no ha retornat textos de ressenyes. Consulta-les a Google Maps."
  ],
  "reviewError": [
    "Google is momenteel niet beschikbaar. Bekijk beoordelingen via Google Maps.",
    "Google is currently unavailable. View reviews through Google Maps.",
    "Google no está disponible ahora. Consulta las reseñas en Google Maps.",
    "Google no està disponible ara. Consulta les ressenyes a Google Maps."
  ],
  "retry": [
    "Opnieuw proberen",
    "Try again",
    "Reintentar",
    "Torna-ho a provar"
  ],
  "readReview": [
    "Lees op Google Maps",
    "Read on Google Maps",
    "Leer en Google Maps",
    "Llegeix a Google Maps"
  ],
  "googlePhotos": [
    "Foto’s van Google",
    "Photos from Google",
    "Fotos de Google",
    "Fotos de Google"
  ],
  "galleryTitle": [
    "Een kijkje in de salon.",
    "A look inside the salon.",
    "Conoce el espacio.",
    "Coneix l’espai."
  ],
  "photoPending": [
    "Salonfoto’s verschijnen hier met bronvermelding na activering van Google Places. Bekijk de huidige foto’s op Google Maps.",
    "Salon photos will appear here with attribution when Google Places is activated. View current photos on Google Maps.",
    "Las fotos aparecerán con atribución al activar Google Places. Puedes verlas en Google Maps.",
    "Les fotos apareixeran amb atribució en activar Google Places. Pots veure-les a Google Maps."
  ],
  "photoLoading": [
    "Foto’s laden…",
    "Loading photos…",
    "Cargando fotos…",
    "Carregant fotos…"
  ],
  "photoEmpty": [
    "Google heeft geen foto’s beschikbaar gesteld.",
    "Google did not provide photos.",
    "Google no facilitó fotos.",
    "Google no ha facilitat fotos."
  ],
  "photoAlt": [
    "Foto van het bedrijf via Google",
    "Business photo via Google",
    "Foto del negocio de Google",
    "Foto del negoci de Google"
  ],
  "details": [
    "Praktische informatie",
    "Good to know",
    "Información práctica",
    "Informació pràctica"
  ],
  "address": [
    "Adres",
    "Address",
    "Dirección",
    "Adreça"
  ],
  "phone": [
    "Telefoon",
    "Phone",
    "Teléfono",
    "Telèfon"
  ],
  "email": [
    "E-mail",
    "Email",
    "Correo",
    "Correu"
  ],
  "hours": [
    "Openingstijden",
    "Opening hours",
    "Horario",
    "Horari"
  ],
  "hoursSource": [
    "Volgens de openbare bedrijfsvermelding; bevestig voor je bezoek.",
    "As listed on the public business profile; confirm before visiting.",
    "Según la ficha pública del negocio; confirma antes de ir.",
    "Segons la fitxa pública del negoci; confirma abans d’anar-hi."
  ],
  "addressNote": [
    "Google Maps en de bedrijfswebsite schrijven het adres verschillend. Gebruik Google Maps en bevestig telefonisch.",
    "Google Maps and the business website use different address labels. Follow Google Maps and confirm by phone.",
    "Maps y su web muestran variantes de la dirección. Sigue Maps y confirma por teléfono.",
    "Maps i el web mostren variants de l’adreça. Segueix Maps i confirma per telèfon."
  ],
  "directions": [
    "Route naar de salon",
    "Directions to the salon",
    "Cómo llegar",
    "Com arribar"
  ],
  "write": [
    "Vertel ons wat je zoekt.",
    "Tell us what you have in mind.",
    "Cuéntanos qué necesitas.",
    "Explica’ns què necessites."
  ],
  "callIntro": [
    "Bel de salon om je wensen te bespreken of een afspraak te maken.",
    "Call the salon to discuss your preferences or arrange a visit.",
    "Llama al negocio para comentar tus preferencias o concertar una cita.",
    "Truca al negoci per comentar les preferències o concertar una cita."
  ],
  "formIntro": [
    "Kies een behandeling en stel je vraag. Bel rechtstreeks of stel een e-mail op.",
    "Choose a treatment and ask a question. Call directly or draft an email.",
    "Elige un servicio y haz tu consulta. Puedes llamar o redactar un correo.",
    "Tria un servei i fes la consulta. Pots trucar o redactar un correu."
  ],
  "name": [
    "Naam",
    "Name",
    "Nombre",
    "Nom"
  ],
  "message": [
    "Je vraag",
    "Your message",
    "Tu consulta",
    "La teva consulta"
  ],
  "send": [
    "E-mail opstellen",
    "Draft email",
    "Redactar correo",
    "Redacta un correu"
  ],
  "formNote": [
    "Opent je e-mailapp.",
    "Opens your email app.",
    "Abre tu aplicación de correo. Esta demo no envía ni guarda nada automáticamente.",
    "Obre l’aplicació de correu. Aquesta demo no envia ni desa res automàticament."
  ],
  "formStatus": [
    "Je e-mailapp is geopend. Controleer en verstuur het bericht zelf.",
    "Your email app has been opened. Review and send the message yourself.",
    "Se ha abierto tu correo. Revisa y envía el mensaje.",
    "S’ha obert el correu. Revisa i envia el missatge."
  ],
  "service": [
    "Behandeling",
    "Treatment",
    "Servicio",
    "Servei"
  ],
  "select": [
    "Kies een behandeling",
    "Choose a treatment",
    "Elige un servicio",
    "Tria un servei"
  ],
  "askPrice": [
    "Vraag naar prijs en duur",
    "Ask about price and duration",
    "Consulta precio y duración",
    "Consulta preu i durada"
  ],
  "published": [
    "Gepubliceerd op de bedrijfswebsite",
    "Published on the business website",
    "Publicado en la web del negocio",
    "Publicat al web del negoci"
  ],
  "howTitle": [
    "Van een idee naar je volgende look.",
    "From an idea to your next look.",
    "De tu idea a tu próxima visita.",
    "De la teva idea a la pròxima visita."
  ],
  "how1": [
    "Kies je behandeling",
    "Choose a treatment",
    "Elige tu servicio",
    "Tria el servei"
  ],
  "how1Text": [
    "Knippen of baardverzorging: ontdek het aanbod.",
    "Haircuts or beard grooming: explore the services.",
    "Explora los cortes y el cuidado de barba.",
    "Explora els talls i la cura de la barba."
  ],
  "how2": [
    "Neem contact op",
    "Get in touch",
    "Ponte en contacto",
    "Contacta"
  ],
  "how2Text": [
    "Bespreek je wensen, de prijs en de benodigde tijd.",
    "Discuss your preferences, price and appointment length.",
    "Confirma tus preferencias, precio y duración.",
    "Confirma les preferències, el preu i la durada."
  ],
  "how3": [
    "Kom langs in Voorburg",
    "Visit in Voorburg",
    "Ven a Voorburg",
    "Vine a Voorburg"
  ],
  "how3Text": [
    "De salon bevestigt je afspraak. Je vindt de route hieronder.",
    "The salon confirms your appointment. Find directions below.",
    "El negocio confirma tu cita. Consulta la ruta debajo.",
    "El negoci confirma la cita. Consulta la ruta més avall."
  ],
  "bookingTitle": [
    "Tijd voor een nieuwe look.",
    "Time for a fresh look.",
    "Es hora de tu próxima visita.",
    "És hora de la pròxima visita."
  ],
  "bookingIntro": [
    "Kies een behandeling om het reserveringsproces te verkennen.",
    "Choose a treatment to explore the booking experience.",
    "Elige un servicio para explorar la reserva.",
    "Tria un servei per explorar la reserva."
  ],
  "demoBooking": [
    "Afspraakgegevens zijn nog te bevestigen.",
    "Appointment details still need confirmation.",
    "Demo. La agenda aún no está conectada; las horas de ejemplo no indican disponibilidad real.",
    "Demo. L’agenda encara no està connectada; les hores d’exemple no són disponibilitat real."
  ],
  "realBooking": [
    "Plan je afspraak op de Google Calendar-reserveringspagina van het bedrijf.",
    "Book on the business’s Google Calendar booking page.",
    "Reserva en la página de Google Calendar del negocio.",
    "Reserva a la pàgina de Google Calendar del negoci."
  ],
  "openCalendar": [
    "Open Google Calendar",
    "Open Google Calendar",
    "Abrir Google Calendar",
    "Obre Google Calendar"
  ],
  "day": [
    "Dag",
    "Date",
    "Día",
    "Dia"
  ],
  "time": [
    "Gewenste tijd",
    "Preferred time",
    "Hora de ejemplo",
    "Hora d’exemple"
  ],
  "chooseDay": [
    "Kies eerst een dag",
    "Choose a date first",
    "Elige primero un día",
    "Tria primer un dia"
  ],
  "summary": [
    "Je bezoek",
    "Your visit",
    "Tu visita",
    "La teva visita"
  ],
  "demoContinue": [
    "Aanvraag afronden",
    "Complete your enquiry",
    "Ver resumen de demostración",
    "Veure resum de demostració"
  ],
  "demoResult": [
    "Bedankt voor je aanvraag. De afspraakgegevens zijn nog te bevestigen.",
    "Thank you for your enquiry. Appointment details still need confirmation.",
    "Gracias por reservar tu demo. No se ha hecho ninguna reserva real ni se ha enviado nada.",
    "Gràcies per reservar la demo. No s’ha fet cap reserva real ni s’ha enviat res."
  ],
  "incomplete": [
    "Kies een behandeling, dag en voorbeeldtijd.",
    "Choose a treatment, date and example time.",
    "Elige un servicio, día y hora de ejemplo.",
    "Tria un servei, dia i hora d’exemple."
  ],
  "demoDuration": [
    "Tijden en duur worden door de salon bevestigd.",
    "Times and duration are confirmed by the salon.",
    "El negocio confirma horas y duración.",
    "El negoci confirma hores i durada."
  ],
  "whatsapp": [
    "WhatsApp",
    "WhatsApp",
    "WhatsApp",
    "WhatsApp"
  ],
  "whatsappPending": [
    "WhatsApp wordt beschikbaar zodra de salon een nummer bevestigt. Het publieke telefoonnummer is niet automatisch als WhatsApp gebruikt.",
    "WhatsApp becomes available when the salon confirms a number. The public phone number has not been assumed to support WhatsApp.",
    "WhatsApp estará disponible cuando el negocio confirme un número. No asumimos que el teléfono publicado tenga WhatsApp.",
    "WhatsApp estarà disponible quan el negoci confirmi un número. No assumim que el telèfon publicat tingui WhatsApp."
  ],
  "whatsappMessage": [
    "Hallo, ik wil graag informatie over een afspraak.",
    "Hello, I would like information about an appointment.",
    "Hola, quisiera información sobre una cita.",
    "Hola, voldria informació sobre una cita."
  ],
  "faq": [
    "Veelgestelde vragen",
    "Frequently asked questions",
    "Preguntas frecuentes",
    "Preguntes freqüents"
  ],
  "home": [
    "Terug naar de salon",
    "Back to the salon",
    "Volver al negocio",
    "Torna al negoci"
  ],
  "privacy": [
    "Privacy",
    "Privacy",
    "Privacidad en esta demo",
    "Privacitat en aquesta demo"
  ],
  "googleTerms": [
    "Google Maps: gebruiksvoorwaarden",
    "Google Maps: terms of service",
    "Google Maps: condiciones de servicio",
    "Google Maps: condicions de servei"
  ],
  "googlePrivacy": [
    "Google: privacybeleid",
    "Google: privacy policy",
    "Google: política de privacidad",
    "Google: política de privacitat"
  ],
  "privacyText": [
    "Externe diensten zoals Google Maps, Calendar en WhatsApp hebben hun eigen privacyvoorwaarden.",
    "External services such as Google Maps, Calendar and WhatsApp have their own privacy terms.",
    "Esta web conceptual no guarda datos de formularios. Teléfono, correo, Maps, Calendar y WhatsApp abren servicios externos con sus propias condiciones.",
    "Aquest web conceptual no desa dades dels formularis. Telèfon, correu, Maps, Calendar i WhatsApp obren serveis externs amb condicions pròpies."
  ],
  "updated": [
    "Bedrijfsinformatie & bronnen",
    "Business information & sources",
    "Fuentes e información de la demo",
    "Fonts i informació de la demo"
  ],
  "sources": [
    "Bedrijfswebsite",
    "Business website",
    "Web del negocio",
    "Web del negoci"
  ],
  "configError": [
    "Deze klantconfiguratie is niet beschikbaar.",
    "This client configuration is not available.",
    "Esta configuración no está disponible.",
    "Aquesta configuració no està disponible."
  ],
  "closed": [
    "Gesloten",
    "Closed",
    "Cerrado",
    "Tancat"
  ]
};
const languages=['nl','en','es','ca'];
const dictionaries=Object.fromEntries(languages.map((lang,i)=>[lang,Object.fromEntries(Object.entries(rows).map(([key,v])=>[key,v[i]]))]));
const api={dictionaries,languages,translate:(key,lang)=>dictionaries[lang]?.[key]||key,localize:(v,lang)=>typeof v==='string'?v:(v?.[lang]||'')};
if(typeof module!=='undefined')module.exports=api;root.SiteI18n=api;
})(typeof window==='undefined'?globalThis:window);
