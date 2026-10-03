(function(root){
'use strict';
const config={
  "id": "dental",
  "name": "Maatschap P.H.M. Petit en A. Petit-Theodoridis",
  "shortName": "Petit",
  "sector": "dentist",
  "market": "nl",
  "languages": [
    "nl",
    "en"
  ],
  "defaultLanguage": "nl",
  "timeZone": "Europe/Amsterdam",
  "theme": {
    "primary": "#14686a",
    "accent": "#bce2d8",
    "background": "#f8fbf9",
    "font": "Arial, Helvetica, sans-serif",
    "bodyFont": "Arial, Helvetica, sans-serif",
    "layout": "dental"
  },
  "sections": [
    "services",
    "reviews",
    "contact"
  ],
  "homePage": "sectors/dentists/index.html",
  "navAnchors": {
    "services": "information",
    "reviews": "location",
    "gallery": "location",
    "contact": "contact",
    "process": "contact"
  },
  "business": {
    "address": "Laan van Nieuw Oost-Indië 130A, 2593 CA Den Haag",
    "phone": "+31703837199",
    "phoneDisplay": "070 383 7199",
    "email": "",
    "city": "Den Haag",
    "mapsUrl": "https://www.google.com/maps/place/Maatschap+P.H.M.+Petit+en+A.+Petit-+Theodoridis/@52.0847415,4.3391758,17z/data=!3m1!4b1!4m6!3m5!1s0x47c5b70e9ec1891b:0xb37481615722b65b!8m2!3d52.0847415!4d4.3391758!16s%2Fg%2F11gff36k4k",
    "coordinates": {
      "lat": 52.0847415,
      "lng": 4.3391758
    }
  },
  "proof": {
    "rating": 5,
    "count": 3,
    "checked": "2026-10-03",
    "source": "Google Maps"
  },
  "hours": [],
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
      "clientId": "dental",
      "checked": "2026-10-03",
      "rating": 5,
      "total": 3,
      "reviews": [
        {
          "authorName": "Ramon B",
          "profilePhotoUrl": "https://lh3.googleusercontent.com/a-/ALV-UjXddILWvIVPmY54-mDrI-FAGtnQifzayAtpOwMrHR3X_WIsunJT=w81-h81-p-rp-mo-br100",
          "authorUri": "https://www.google.com/maps/contrib/107884002564931962260/reviews?hl=nl",
          "rating": 5,
          "text": "Zeer goede tandarts. Heel nauwkeurig en heel erg betrokken.",
          "originalText": "Zeer goede tandarts. Heel nauwkeurig en heel erg betrokken.",
          "language": "nl",
          "originalLanguage": "nl",
          "translations": {
            "en": "Very good dentist. Very thorough and very caring."
          },
          "relativeTime": "3 jaar geleden",
          "googleMapsUri": "https://www.google.com/maps/place/Maatschap+P.H.M.+Petit+en+A.+Petit-+Theodoridis/@52.0847415,4.3391758,17z/data=!3m1!4b1!4m6!3m5!1s0x47c5b70e9ec1891b:0xb37481615722b65b!8m2!3d52.0847415!4d4.3391758!16s%2Fg%2F11gff36k4k"
        },
        {
          "authorName": "Floris Verkerk",
          "profilePhotoUrl": "https://lh3.googleusercontent.com/a/ACg8ocL4A1fC8QVyPTxSJ6NqUVS04vxo7l56EZxPDy4cM5xx1M3AMg=w81-h81-p-rp-mo-br100",
          "authorUri": "https://www.google.com/maps/contrib/111467741040575385776/reviews?hl=nl",
          "rating": 5,
          "text": "",
          "language": "nl",
          "originalLanguage": "nl",
          "relativeTime": "2 jaar geleden",
          "originalText": "",
          "googleMapsUri": "https://www.google.com/maps/place/Maatschap+P.H.M.+Petit+en+A.+Petit-+Theodoridis/@52.0847415,4.3391758,17z/data=!3m1!4b1!4m6!3m5!1s0x47c5b70e9ec1891b:0xb37481615722b65b!8m2!3d52.0847415!4d4.3391758!16s%2Fg%2F11gff36k4k"
        },
        {
          "authorName": "Alexa",
          "profilePhotoUrl": "https://lh3.googleusercontent.com/a-/ALV-UjUKAF1dzAFc7xr46Q3JY2bN31a5jjmKhyyBx2G_ygRoFGuD9anmZw=w81-h81-p-rp-mo-br100",
          "authorUri": "https://www.google.com/maps/contrib/101537937201395929124/reviews?hl=nl",
          "rating": 5,
          "text": "",
          "language": "nl",
          "originalLanguage": "nl",
          "relativeTime": "5 jaar geleden",
          "originalText": "",
          "googleMapsUri": "https://www.google.com/maps/place/Maatschap+P.H.M.+Petit+en+A.+Petit-+Theodoridis/@52.0847415,4.3391758,17z/data=!3m1!4b1!4m6!3m5!1s0x47c5b70e9ec1891b:0xb37481615722b65b!8m2!3d52.0847415!4d4.3391758!16s%2Fg%2F11gff36k4k"
        }
      ],
      "url": "https://www.google.com/maps/place/Maatschap+P.H.M.+Petit+en+A.+Petit-+Theodoridis/@52.0847415,4.3391758,17z/data=!3m1!4b1!4m6!3m5!1s0x47c5b70e9ec1891b:0xb37481615722b65b!8m2!3d52.0847415!4d4.3391758!16s%2Fg%2F11gff36k4k"
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
      "id": "visit",
      "title": {
        "nl": "Een afspraak plannen",
        "en": "Plan an appointment"
      },
      "description": {
        "nl": "Vraag naar een passend moment voor je bezoek.",
        "en": "Ask about a suitable time for your visit."
      },
      "icon": "calendar"
    },
    {
      "id": "information",
      "title": {
        "nl": "Praktische informatie",
        "en": "Practical information"
      },
      "description": {
        "nl": "Bespreek de praktische stappen voor een afspraak.",
        "en": "Discuss the practical steps for an appointment."
      },
      "icon": "tooth"
    },
    {
      "id": "firstvisit",
      "title": {
        "nl": "Je eerste bezoek",
        "en": "Your first visit"
      },
      "description": {
        "nl": "Neem contact op om je eerste bezoek te bespreken.",
        "en": "Get in touch to discuss your first visit."
      },
      "icon": "spark"
    }
  ],
  "copy": {
    "eyebrow": {
      "nl": "PETIT · DEN HAAG",
      "en": "PETIT · THE HAGUE"
    },
    "heroTitle": {
      "nl": "Jouw glimlach.\nOnze aandacht.",
      "en": "Your smile.\nOur attention."
    },
    "heroIntro": {
      "nl": "Een volgend bezoek begint met helder contact. Bespreek je afspraak rechtstreeks met de praktijk.",
      "en": "A future visit begins with clear contact. Discuss your appointment directly with the practice."
    },
    "serviceTitle": {
      "nl": "Jouw volgende bezoek.",
      "en": "Your next visit."
    },
    "serviceIntro": {
      "nl": "Kies waarover je contact wilt opnemen. De praktijk bevestigt de mogelijkheden.",
      "en": "Choose what you would like to ask about. The practice confirms the options."
    },
    "contactTitle": {
      "nl": "Een vraag?\nBegin hier.",
      "en": "A question?\nStart here."
    }
  },
  "ui": {
    "bookingTitle": {
      "nl": "Plan een bezoek.",
      "en": "Plan your visit."
    },
    "call": {
      "nl": "Bel de praktijk",
      "en": "Call the practice"
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
      "nl": "Terug naar Petit",
      "en": "Back to Petit",
      "es": "Volver a Petit"
    },
    "book": {
      "nl": "Plan een bezoek",
      "en": "Plan a visit"
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
      "nl": "Plan een bezoek",
      "en": "Plan a visit"
    },
    "service": {
      "nl": "Afspraaktype",
      "en": "Appointment type"
    },
    "demoDuration": {
      "nl": "De praktijk bevestigt de gegevens van een echte afspraak.",
      "en": "The practice confirms the details of a real appointment."
    },
    "incomplete": {
      "nl": "Kies een onderwerp, dag en voorbeeldtijd.",
      "en": "Choose a topic, date and example time.",
      "es": "Elige un tema, día y hora de ejemplo."
    },
    "summary": {
      "nl": "Je afspraak",
      "en": "Your appointment"
    }
  },
  "faq": [],
  "sources": [
    {
      "label": "Google Maps · checked 2026-10-03",
      "url": "https://www.google.com/maps/place/Maatschap+P.H.M.+Petit+en+A.+Petit-+Theodoridis/@52.0847415,4.3391758,17z/data=!3m1!4b1!4m6!3m5!1s0x47c5b70e9ec1891b:0xb37481615722b65b!8m2!3d52.0847415!4d4.3391758!16s%2Fg%2F11gff36k4k"
    }
  ]
};
if(typeof module!=='undefined')module.exports=config;
root.DentistConfig=config;
})(typeof window==='undefined'?globalThis:window);
