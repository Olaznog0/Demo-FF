(function(root){
'use strict';
const config={
  "id": "accounting",
  "name": "Axis Administraties & Advies",
  "shortName": "Axis",
  "sector": "accountant",
  "market": "nl",
  "languages": [
    "nl",
    "en"
  ],
  "defaultLanguage": "nl",
  "timeZone": "Europe/Amsterdam",
  "theme": {
    "primary": "#3f5842",
    "accent": "#c7cbb5",
    "background": "#f8f6ef",
    "font": "Georgia, Cambria, serif",
    "bodyFont": "Arial, Helvetica, sans-serif",
    "layout": "accounting"
  },
  "sections": [
    "services",
    "reviews",
    "contact"
  ],
  "homePage": "sectors/accountants/index.html",
  "navAnchors": {
    "services": "information",
    "reviews": "location",
    "gallery": "location",
    "contact": "contact",
    "process": "contact"
  },
  "business": {
    "address": "Kaapstraat 95, 2572 HG Den Haag",
    "phone": "+31638663410",
    "phoneDisplay": "06 38663410",
    "email": "",
    "city": "Den Haag",
    "mapsUrl": "https://www.google.com/maps/place/Axis+Administraties+%26+Advies+-+Boekhouder+Den+Haag/@52.0631683,4.2949179,17z/data=!3m1!4b1!4m6!3m5!1s0x47c5b7a65a42e247:0x6c9c6a22f7801c5c!8m2!3d52.0631683!4d4.2949179!16s%2Fg%2F11z47pb_9j",
    "coordinates": {
      "lat": 52.0631683,
      "lng": 4.2949179
    }
  },
  "proof": {
    "rating": 5,
    "count": 8,
    "checked": "2026-10-03",
    "source": "Google Maps"
  },
  "hours": [
    {
      "days": [
        1,
        2,
        3,
        4,
        5
      ],
      "open": "08:30",
      "close": "17:00"
    },
    {
      "days": [
        6
      ],
      "open": "09:30",
      "close": "15:00"
    },
    {
      "days": [
        0
      ],
      "closed": true
    }
  ],
  "google": {
    "enabled": true,
    "placeId": "",
    "reviewsEndpoint": "/api/google-reviews",
    "endpoint": "/api/place",
    "photosEnabled": true,
    "maxPhotos": 4,
    "syncBusinessDetails": false,
    "resolvePlaceId": true,
    "snapshot": {
      "clientId": "accounting",
      "checked": "2026-10-03",
      "rating": 5,
      "total": 8,
      "reviews": [
        {
          "authorName": "Veselin Dobrev",
          "profilePhotoUrl": "https://lh3.googleusercontent.com/a/ACg8ocKG6V9BjualfEAfZyCHkNUnfqFInphq9SIeLcznnwEFTb3lVw=w81-h81-p-rp-mo-br100",
          "authorUri": "https://www.google.com/maps/contrib/116053177177217250279/reviews?hl=nl",
          "rating": 5,
          "text": "Alles wordt duidelijk uitgelegd en netjes geregeld.",
          "language": "nl",
          "originalLanguage": "nl",
          "translations": {
            "en": "Everything is clearly explained and carefully arranged."
          },
          "relativeTime": "3 maanden geleden",
          "originalText": "Alles wordt duidelijk uitgelegd en netjes geregeld.",
          "googleMapsUri": "https://www.google.com/maps/place/Axis+Administraties+%26+Advies+-+Boekhouder+Den+Haag/@52.0631683,4.2949179,17z/data=!3m1!4b1!4m6!3m5!1s0x47c5b7a65a42e247:0x6c9c6a22f7801c5c!8m2!3d52.0631683!4d4.2949179!16s%2Fg%2F11z47pb_9j"
        },
        {
          "authorName": "Eray Dogan",
          "profilePhotoUrl": "https://lh3.googleusercontent.com/a/ACg8ocL5iTHOGYnnleOTLRxHzNhFx5lJY0h5T6Wtl71ya5fec2K0UA=w81-h81-p-rp-mo-br100",
          "authorUri": "https://www.google.com/maps/contrib/111235047251734856852/reviews?hl=nl",
          "rating": 5,
          "text": "Betrouwbare service en mooi werk afgeleverd. Zeker een aanrader.",
          "language": "nl",
          "originalLanguage": "nl",
          "translations": {
            "en": "Reliable service and great work. Definitely recommended."
          },
          "relativeTime": "4 maanden geleden",
          "originalText": "Betrouwbare service en mooi werk afgeleverd. Zeker een aanrader.",
          "googleMapsUri": "https://www.google.com/maps/place/Axis+Administraties+%26+Advies+-+Boekhouder+Den+Haag/@52.0631683,4.2949179,17z/data=!3m1!4b1!4m6!3m5!1s0x47c5b7a65a42e247:0x6c9c6a22f7801c5c!8m2!3d52.0631683!4d4.2949179!16s%2Fg%2F11z47pb_9j"
        },
        {
          "authorName": "Batuhan",
          "profilePhotoUrl": "https://lh3.googleusercontent.com/a/ACg8ocJ6obFRQ8wzzpUPTMNw5JL9wwvZIWMWHggLla5HoBp0o8NzJA=w81-h81-p-rp-mo-br100",
          "authorUri": "https://www.google.com/maps/contrib/109535356665938841401/reviews?hl=nl",
          "rating": 5,
          "text": "Snelle en professionele service.",
          "language": "nl",
          "originalLanguage": "nl",
          "translations": {
            "en": "Fast and professional service."
          },
          "relativeTime": "2 maanden geleden",
          "originalText": "Snelle en professionele service.",
          "googleMapsUri": "https://www.google.com/maps/place/Axis+Administraties+%26+Advies+-+Boekhouder+Den+Haag/@52.0631683,4.2949179,17z/data=!3m1!4b1!4m6!3m5!1s0x47c5b7a65a42e247:0x6c9c6a22f7801c5c!8m2!3d52.0631683!4d4.2949179!16s%2Fg%2F11z47pb_9j"
        }
      ],
      "url": "https://www.google.com/maps/place/Axis+Administraties+%26+Advies+-+Boekhouder+Den+Haag/@52.0631683,4.2949179,17z/data=!3m1!4b1!4m6!3m5!1s0x47c5b7a65a42e247:0x6c9c6a22f7801c5c!8m2!3d52.0631683!4d4.2949179!16s%2Fg%2F11z47pb_9j"
    }
  },
  "calendar": {
    "mode": "demo",
    "bookingUrl": "",
    "endpoint": "/api/bookings",
    "confirmed": false,
    "serviceDurations": {},
    "workingDays": [
      1,
      2,
      3,
      4,
      5
    ],
    "exampleSlots": [
      "09:00",
      "11:00",
      "14:00",
      "16:00"
    ]
  },
  "whatsapp": {
    "enabled": false,
    "number": ""
  },
  "contact": {
    "mode": "demo",
    "endpoint": "/api/contact",
    "confirmed": false
  },
  "extensions": {
    "chatbot": false,
    "automations": false
  },
  "services": [
    {
      "id": "administration",
      "title": {
        "nl": "Administratie bespreken",
        "en": "Discuss your administration"
      },
      "description": {
        "nl": "Bespreek jouw administratieve vraag.",
        "en": "Discuss your administration enquiry."
      },
      "icon": "document"
    },
    {
      "id": "business",
      "title": {
        "nl": "Informatie voor ondernemers",
        "en": "Information for businesses"
      },
      "description": {
        "nl": "Vraag naar ondersteuning voor jouw onderneming.",
        "en": "Ask about support for your business."
      },
      "icon": "briefcase"
    },
    {
      "id": "introduction",
      "title": {
        "nl": "Een kennismaking plannen",
        "en": "Plan an introduction"
      },
      "description": {
        "nl": "Begin met een persoonlijk contactmoment.",
        "en": "Start with a personal conversation."
      },
      "icon": "calendar"
    }
  ],
  "copy": {
    "eyebrow": {
      "nl": "AXIS ADMINISTRATIES & ADVIES",
      "en": "AXIS ADMINISTRATIES & ADVIES"
    },
    "heroTitle": {
      "nl": "Heldere cijfers.\nAdvies op maat.",
      "en": "Clear numbers.\nAdvice for you."
    },
    "heroIntro": {
      "nl": "Jouw administratie begint met een persoonlijk gesprek. Bespreek je vraag met Axis in Den Haag.",
      "en": "Your administration begins with a personal conversation. Discuss your enquiry with Axis in The Hague."
    },
    "serviceTitle": {
      "nl": "Waar kunnen we\nmee beginnen?",
      "en": "Where shall\nwe begin?"
    },
    "serviceIntro": {
      "nl": "Kies een onderwerp voor het eerste gesprek. Axis bevestigt welke ondersteuning beschikbaar is.",
      "en": "Choose a topic for your first conversation. Axis confirms what support is available."
    },
    "contactTitle": {
      "nl": "Laten we\nkennismaken.",
      "en": "Let’s\nget acquainted."
    }
  },
  "ui": {
    "bookingTitle": {
      "nl": "Plan je kennismaking.",
      "en": "Plan your introduction."
    },
    "call": {
      "nl": "Bel Axis",
      "en": "Call Axis"
    },
    "bookingIntro": {
      "nl": "Bekijk het afspraakproces in deze demo.",
      "en": "Explore the appointment process in this demo.",
      "es": "Prueba el recorrido de reserva de esta demo."
    },
    "demoBooking": {
      "nl": "Demo · Voorbeeldtijden. Er wordt geen echte afspraak gemaakt.",
      "en": "Demo · Example times. No real appointment is made."
    },
    "demoResult": {
      "nl": "Bedankt voor het plannen van je demo. Er is geen echte afspraak gemaakt en niets verzonden.",
      "en": "Thank you for booking your demo. No real appointment was made and nothing was sent."
    },
    "home": {
      "nl": "Terug naar Axis",
      "en": "Back to Axis",
      "es": "Volver a Axis"
    },
    "book": {
      "nl": "Plan een gesprek",
      "en": "Plan a conversation"
    },
    "services": {
      "nl": "Informatie",
      "en": "Information"
    },
    "faq": {
      "nl": "Informatie",
      "en": "Information"
    },
    "photoConcept": {
      "nl": "Onafhankelijk websiteconcept",
      "en": "Independent website concept"
    },
    "plan": {
      "nl": "Plan een gesprek",
      "en": "Plan a conversation"
    },
    "service": {
      "nl": "Onderwerp",
      "en": "Topic",
      "es": "Tema"
    },
    "demoDuration": {
      "nl": "Het bedrijf bevestigt de gegevens van een echte afspraak.",
      "en": "The business confirms the details of a real appointment.",
      "es": "El negocio confirma los detalles de una cita real."
    },
    "incomplete": {
      "nl": "Kies een onderwerp, dag en voorbeeldtijd.",
      "en": "Choose a topic, date and example time.",
      "es": "Elige un tema, día y hora de ejemplo."
    },
    "summary": {
      "nl": "Je kennismaking",
      "en": "Your introduction"
    }
  },
  "faq": [],
  "sources": [
    {
      "label": "Google Maps · checked 2026-10-03",
      "url": "https://www.google.com/maps/place/Axis+Administraties+%26+Advies+-+Boekhouder+Den+Haag/@52.0631683,4.2949179,17z/data=!3m1!4b1!4m6!3m5!1s0x47c5b7a65a42e247:0x6c9c6a22f7801c5c!8m2!3d52.0631683!4d4.2949179!16s%2Fg%2F11z47pb_9j"
    }
  ],
  "images": {
    "hero": "assets/accounting-office-concept.webp",
    "heroType": "concept"
  }
};
if(typeof module!=='undefined')module.exports=config;
root.AccountantConfig=config;
})(typeof window==='undefined'?globalThis:window);
