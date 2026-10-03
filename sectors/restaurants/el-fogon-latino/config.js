(function(root){
'use strict';
const config={
  "id": "fogon",
  "sector": "restaurant",
  "name": "El Fogon Latino",
  "shortName": "El Fogon",
  "languages": [
    "nl",
    "en"
  ],
  "defaultLanguage": "nl",
  "timeZone": "Europe/Amsterdam",
  "homePage": "sectors/restaurants/el-fogon-latino/index.html",
  "navAnchors": {
    "information": "menu",
    "services": "menu",
    "reviews": "google",
    "gallery": "google",
    "contact": "visit",
    "process": "reserve"
  },
  "theme": {
    "primary": "#a83923",
    "accent": "#e7b46a",
    "background": "#fbf6ed",
    "ink": "#32241e",
    "font": "Arial, Helvetica, sans-serif"
  },
  "business": {
    "address": "Pletterijkade 29, 2515 SG Den Haag",
    "city": "Den Haag",
    "phone": "+31642510834",
    "phoneDisplay": "06 42510834",
    "email": "",
    "website": "",
    "coordinates": {
      "lat": 52.0741804,
      "lng": 4.3225177
    },
    "mapsUrl": "https://www.google.com/maps/place/El+Fogon+Latino/@52.0741804,4.3225177,17z/data=!3m1!4b1!4m6!3m5!1s0x47c5b7dccc6b7365:0x110679e57c9f47c0!8m2!3d52.0741804!4d4.3225177!16s%2Fg%2F11svvv9lj3"
  },
  "proof": {
    "rating": 4.3,
    "count": 63,
    "checked": "2026-10-03",
    "source": "Google Maps"
  },
  "google": {
    "enabled": true,
    "placeId": "",
    "endpoint": "/api/place",
    "reviewsEndpoint": "/api/google-reviews",
    "maxPhotos": 6,
    "photosEnabled": true,
    "syncBusinessDetails": true,
    "snapshot": {
      "clientId": "fogon",
      "checked": "2026-10-03",
      "rating": 4.3,
      "total": 63,
      "reviews": [
        {
          "authorName": "PinkTime",
          "profilePhotoUrl": "https://lh3.googleusercontent.com/a-/ALV-UjXeXXE7P-GvtAjjCHZ2CLj0OY3MPOKZrUjzX0RH333tvTtx5uHD=w81-h81-p-rp-mo-ba12-br100",
          "authorUri": "https://www.google.com/maps/contrib/100900713782417353211/reviews?hl=nl",
          "rating": 5,
          "text": "Personeel heel attent, eten is lekker",
          "language": "nl",
          "originalLanguage": "nl",
          "translations": {
            "en": "Very attentive staff and delicious food.",
            "es": "Personal muy atento y comida deliciosa."
          },
          "relativeTime": "2 jaar geleden",
          "originalText": "Personeel heel attent, eten is lekker",
          "googleMapsUri": "https://www.google.com/maps/place/El+Fogon+Latino/@52.0741804,4.3225177,17z/data=!3m1!4b1!4m6!3m5!1s0x47c5b7dccc6b7365:0x110679e57c9f47c0!8m2!3d52.0741804!4d4.3225177!16s%2Fg%2F11svvv9lj3"
        },
        {
          "authorName": "valentina j",
          "profilePhotoUrl": "https://lh3.googleusercontent.com/a-/ALV-UjVki8wG5KXNELMe-71QMMEUyak5LycPJj0aIw7CN562LAoUjitb=w81-h81-p-rp-mo-ba12-br100",
          "authorUri": "https://www.google.com/maps/contrib/104411474876144263454/reviews?hl=nl",
          "rating": 5,
          "text": "Heerlijk gegeten bij EL Fogon Latino.",
          "language": "nl",
          "originalLanguage": "nl",
          "translations": {
            "en": "Had a delicious meal at El Fogon Latino.",
            "es": "Disfruté de una comida deliciosa en El Fogon Latino."
          },
          "relativeTime": "Bewerkt: 7 maanden geleden",
          "originalText": "Heerlijk gegeten bij EL Fogon Latino.",
          "googleMapsUri": "https://www.google.com/maps/place/El+Fogon+Latino/@52.0741804,4.3225177,17z/data=!3m1!4b1!4m6!3m5!1s0x47c5b7dccc6b7365:0x110679e57c9f47c0!8m2!3d52.0741804!4d4.3225177!16s%2Fg%2F11svvv9lj3"
        },
        {
          "authorName": "Mimo Susu",
          "profilePhotoUrl": "https://lh3.googleusercontent.com/a/ACg8ocIDpI0AN2beCaFHI2sjXi-qi_SZlhfFu8WyidU4k1ac65wZV0E=w81-h81-p-rp-mo-ba12-br100",
          "authorUri": "https://www.google.com/maps/contrib/100208514511683957013/reviews?hl=nl",
          "rating": 5,
          "text": "Echt een leuke plek met goede prijzen",
          "language": "nl",
          "originalLanguage": "nl",
          "translations": {
            "en": "A really lovely place with good prices.",
            "es": "Un lugar muy agradable con buenos precios."
          },
          "relativeTime": "Bewerkt: 4 maanden geleden",
          "originalText": "Echt een leuke plek met goede prijzen",
          "googleMapsUri": "https://www.google.com/maps/place/El+Fogon+Latino/@52.0741804,4.3225177,17z/data=!3m1!4b1!4m6!3m5!1s0x47c5b7dccc6b7365:0x110679e57c9f47c0!8m2!3d52.0741804!4d4.3225177!16s%2Fg%2F11svvv9lj3"
        }
      ],
      "url": "https://www.google.com/maps/place/El+Fogon+Latino/@52.0741804,4.3225177,17z/data=!3m1!4b1!4m6!3m5!1s0x47c5b7dccc6b7365:0x110679e57c9f47c0!8m2!3d52.0741804!4d4.3225177!16s%2Fg%2F11svvv9lj3"
    },
    "resolvePlaceId": true
  },
  "services": [
    {
      "id": "table-enquiry",
      "title": {
        "nl": "Een tafel aanvragen",
        "en": "Table enquiry",
        "es": "Solicitud de mesa"
      },
      "description": {
        "nl": "Voorbeeld van een tafelreservering.",
        "en": "Example table reservation journey.",
        "es": "Ejemplo del recorrido de reserva de mesa."
      },
      "durationMinutes": null,
      "priceAmount": null
    }
  ],
  "calendar": {
    "mode": "demo",
    "bookingUrl": "../../../booking.html",
    "workingDays": [
      0,
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "exampleSlots": [
      "18:00",
      "19:00",
      "20:00"
    ],
    "durationsConfirmed": false
  },
  "whatsapp": {
    "enabled": false,
    "number": ""
  },
  "hours": [],
  "contact": {
    "mode": "demo",
    "orderUrl": "https://www.ubereats.com/nl-en/store/el-fogon-latino/Gbkb9TKTUjC96zoEd8S6qQ",
    "reservationUrl": "",
    "endpoint": "/api/contact",
    "confirmed": false
  },
  "images": {
    "hero": "assets/latin-concept-hero.webp",
    "concept": true
  },
  "menuImages": [
    {
      "src": "assets/pica-pollo-illustration.svg",
      "concept": true
    },
    {
      "src": "assets/rabo-illustration.svg",
      "concept": true
    },
    {
      "src": "assets/tostones-illustration.svg",
      "concept": true
    }
  ],
  "menu": [
    {
      "id": "pica-pollo",
      "title": "Pica Pollo",
      "image": "assets/pica-pollo-illustration.svg",
      "category": {
        "nl": "Kip",
        "en": "Chicken",
        "es": "Pollo"
      },
      "description": {
        "nl": "Krokante kip.",
        "en": "Crispy chicken.",
        "es": "Pollo crujiente."
      }
    },
    {
      "id": "rabo",
      "title": "Rabo de vaca",
      "image": "assets/rabo-illustration.svg",
      "category": {
        "nl": "Vlees",
        "en": "Meat",
        "es": "Carne"
      },
      "description": {
        "nl": "Gestoofde ossenstaart.",
        "en": "Braised oxtail.",
        "es": "Rabo de vaca guisado."
      }
    },
    {
      "id": "tostones",
      "title": "Tostones",
      "image": "assets/tostones-illustration.svg",
      "category": {
        "nl": "Bijgerecht",
        "en": "Side dish",
        "es": "Guarnición"
      },
      "description": {
        "nl": "Gebakken bakbanaan.",
        "en": "Fried plantain.",
        "es": "Plátano frito."
      }
    }
  ],
  "copy": {
    "eyebrow": {
      "nl": "LATIJNS-AMERIKAANSE SMAKEN · DEN HAAG",
      "en": "LATIN AMERICAN FLAVOURS · DEN HAAG",
      "es": "SABORES LATINOAMERICANOS · DEN HAAG"
    },
    "heroTitle": {
      "nl": "Proef Latin.\nGeniet samen.",
      "en": "Taste Latin.\nEnjoy together.",
      "es": "Un toque latino.\nUn momento para saborear."
    },
    "heroIntro": {
      "nl": "Latijns-Amerikaanse smaken aan de Pletterijkade. Ontdek de kaart en plan je volgende bezoek.",
      "en": "Latin American flavours on Pletterijkade. Explore the menu and plan your next visit.",
      "es": "Sabores latinoamericanos en Pletterijkade. Explora la carta y planea tu próxima visita."
    },
    "menuTitle": {
      "nl": "Van de kaart.\nVol karakter.",
      "en": "From the menu.\nFull of character.",
      "es": "De la carta.\nCon carácter."
    },
    "menuIntro": {
      "nl": "Drie smaken uit de openbare kaart. Bekijk de selectie op Uber Eats.",
      "en": "Three tastes from the public menu. Explore the selection on Uber Eats.",
      "es": "Tres sabores de la carta pública. Explora la selección en Uber Eats."
    },
    "visitTitle": {
      "nl": "Jouw volgende avond.\nHier in Den Haag.",
      "en": "Your next evening.\nRight here in Den Haag.",
      "es": "Tu próxima salida.\nAquí en Den Haag."
    },
    "footer": {
      "nl": "Een zelfstandig websiteconcept door Ocimatik.",
      "en": "An independent website concept by Ocimatik.",
      "es": "Un concepto web independiente de Ocimatik."
    }
  },
  "sources": [
    {
      "type": "Google Maps",
      "checked": "2026-10-03",
      "note": "Name, address, phone, coordinates, 4.3/63; verified in Google Maps UI by project reviewer.",
      "url": "https://www.google.com/maps/place/El+Fogon+Latino/@52.0741804,4.3225177,17z/data=!3m1!4b1!4m6!3m5!1s0x47c5b7dccc6b7365:0x110679e57c9f47c0!8m2!3d52.0741804!4d4.3225177!16s%2Fg%2F11svvv9lj3"
    },
    {
      "type": "Uber Eats",
      "checked": "2026-10-03",
      "note": "Menu names and short descriptions; platform ratings are not Google ratings. No prices copied.",
      "url": "https://www.ubereats.com/nl-en/store/el-fogon-latino/Gbkb9TKTUjC96zoEd8S6qQ"
    }
  ],
  "sections": [
    "services",
    "reviews",
    "contact"
  ],
  "ui": {
    "book": {
      "nl": "Reserveer een tafel",
      "en": "Reserve a table",
      "es": "Reservar una mesa"
    },
    "call": {
      "nl": "Bel het restaurant",
      "en": "Call the restaurant",
      "es": "Llamar al restaurante"
    },
    "bookingTitle": {
      "nl": "Plan je bezoek.",
      "en": "Plan your visit.",
      "es": "Planea tu visita."
    },
    "demoResult": {
      "nl": "Bedankt voor het plannen van je demo. Er is geen echte tafel gereserveerd en niets verzonden.",
      "en": "Thank you for booking your demo. No real table was reserved and nothing was sent.",
      "es": "Gracias por reservar tu demo. No se ha reservado ninguna mesa real ni se ha enviado nada."
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
    "home": {
      "nl": "Terug naar El Fogon",
      "en": "Back to El Fogon",
      "es": "Volver a El Fogon"
    },
    "bookingIntro": {
      "nl": "Bekijk het afspraakproces in deze demo.",
      "en": "Explore the appointment process in this demo.",
      "es": "Prueba el recorrido de reserva de esta demo."
    },
    "summary": {
      "nl": "Je tafelvraag",
      "en": "Your table enquiry",
      "es": "Tu solicitud de mesa"
    }
  }
};
if(typeof module!=='undefined')module.exports=config;
root.RestaurantConfig=config;
})(typeof window==='undefined'?globalThis:window);
