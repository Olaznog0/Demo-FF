(function(root){
'use strict';
const registry={
  "defaultClient": "ayden",
  "clients": {
    "ayden": {
      "market": "nl",
      "languages": [
        "nl",
        "en"
      ],
      "defaultLanguage": "nl",
      "timeZone": "Europe/Amsterdam",
      "theme": {
        "primary": "#394b3e",
        "accent": "#cdb58a",
        "background": "#f6f4ee",
        "font": "Georgia, Cambria, serif",
        "bodyFont": "Arial, Helvetica, sans-serif",
        "layout": "salon"
      },
      "sections": [
        "services",
        "process",
        "reviews",
        "gallery",
        "contact"
      ],
      "google": {
        "enabled": true,
        "placeId": "ChIJWQ2FSAq3xUcRmbPxHN8NGL8",
        "endpoint": "/api/place",
        "maxPhotos": 5,
        "syncBusinessDetails": true,
        "reviewsEndpoint": "/api/google-reviews",
        "photosEnabled": true,
        "snapshot": {
          "clientId": "ayden",
          "checked": "2026-10-03",
          "rating": 4.7,
          "total": 47,
          "reviews": [
            {
              "authorName": "Sebastiaan P",
              "profilePhotoUrl": "https://lh3.googleusercontent.com/a/ACg8ocKd69VKlyVSrWl4B7vM8koZ7sdFjCrus0Ez0E9vRyh6M7DIRA=w81-h81-p-rp-mo-ba12-br100",
              "authorUri": "https://www.google.com/maps/contrib/109664498832585600874/reviews?hl=nl",
              "rating": 5,
              "text": "Super vriendelijk, prima reserveringen maken.",
              "language": "nl",
              "originalLanguage": "nl",
              "translations": {
                "en": "Very friendly and easy to make an appointment."
              },
              "relativeTime": "9 jaar geleden",
              "originalText": "Super vriendelijk, prima reserveringen maken.",
              "googleMapsUri": "https://www.google.com/maps/search/?api=1&query=Kapsalon%20Ayden&query_place_id=ChIJWQ2FSAq3xUcRmbPxHN8NGL8"
            },
            {
              "authorName": "Jeffrey",
              "profilePhotoUrl": "https://lh3.googleusercontent.com/a-/ALV-UjU444Kw14xW0PaGAbweF39nuLd1eOJJeniY-gBD8OdYiX1KfA0=w81-h81-p-rp-mo-ba12-br100",
              "authorUri": "https://www.google.com/maps/contrib/117714509713127732781/reviews?hl=nl",
              "rating": 5,
              "text": "na elke knipbeurt ben ik altijd tevreden",
              "language": "nl",
              "originalLanguage": "nl",
              "translations": {
                "en": "I'm always happy after every haircut."
              },
              "relativeTime": "9 jaar geleden",
              "originalText": "na elke knipbeurt ben ik altijd tevreden",
              "googleMapsUri": "https://www.google.com/maps/search/?api=1&query=Kapsalon%20Ayden&query_place_id=ChIJWQ2FSAq3xUcRmbPxHN8NGL8"
            },
            {
              "authorName": "rogier vanderoord",
              "profilePhotoUrl": "https://lh3.googleusercontent.com/a-/ALV-UjV6U-pER7YHQO5AOPTRdG8sLUvFVPWqh5ZaOUWFsJGLfG3hY1TXjQ=w81-h81-p-rp-mo-ba12-br100",
              "authorUri": "https://www.google.com/maps/contrib/110835896522814759431/reviews?hl=nl",
              "rating": 5,
              "text": "Een echte vakman die de tijd neemt",
              "language": "nl",
              "originalLanguage": "nl",
              "translations": {
                "en": "A true craftsman who takes the time."
              },
              "relativeTime": "3 jaar geleden",
              "originalText": "Een echte vakman die de tijd neemt",
              "googleMapsUri": "https://www.google.com/maps/search/?api=1&query=Kapsalon%20Ayden&query_place_id=ChIJWQ2FSAq3xUcRmbPxHN8NGL8"
            }
          ],
          "url": "https://www.google.com/maps/search/?api=1&query=Kapsalon%20Ayden&query_place_id=ChIJWQ2FSAq3xUcRmbPxHN8NGL8"
        }
      },
      "calendar": {
        "mode": "demo",
        "bookingUrl": "",
        "workingDays": [
          2,
          3,
          4,
          5,
          6
        ],
        "exampleSlots": [
          "10:00",
          "11:30",
          "14:00",
          "16:00"
        ],
        "endpoint": "/api/bookings",
        "durationsConfirmed": false
      },
      "whatsapp": {
        "enabled": false,
        "number": ""
      },
      "extensions": {
        "chatbot": false,
        "automations": false
      },
      "id": "ayden",
      "name": "Kapsalon Ayden",
      "shortName": "Ayden",
      "sector": "hair-salon",
      "business": {
        "address": "Van Heutszstraat 13A, 2593 PC Den Haag",
        "phone": "+31704060102",
        "phoneDisplay": "070 406 0102",
        "email": "",
        "website": "",
        "mapsUrl": "https://www.google.com/maps/search/?api=1&query=Kapsalon%20Ayden&query_place_id=ChIJWQ2FSAq3xUcRmbPxHN8NGL8",
        "city": "Den Haag",
        "locationLabel": "Den Haag · NL",
        "coordinates": {
          "lat": 52.0862838,
          "lng": 4.3453684
        }
      },
      "proof": {
        "rating": 4.7,
        "count": 47,
        "checked": "2026-10-03",
        "source": "Google Maps"
      },
      "hours": [
        {
          "days": [
            2,
            3,
            5,
            6
          ],
          "open": "09:00",
          "close": "17:30"
        },
        {
          "days": [
            4
          ],
          "open": "09:00",
          "close": "20:00"
        },
        {
          "days": [
            0,
            1
          ],
          "closed": true
        }
      ],
      "copy": {
        "eyebrow": {
          "nl": "KAPSALON AYDEN · DEN HAAG",
          "en": "KAPSALON AYDEN · THE HAGUE"
        },
        "heroTitle": {
          "nl": "Goed haar.\nGoed gevoel.",
          "en": "Good hair.\nGood feeling."
        },
        "heroIntro": {
          "nl": "Toe aan een nieuwe coupe? Ontdek Kapsalon Ayden in Bezuidenhout en bespreek jouw haarwensen rechtstreeks met de salon.",
          "en": "Ready for a fresh look? Discover Kapsalon Ayden in Bezuidenhout and discuss your hair wishes directly with the salon."
        },
        "serviceTitle": {
          "nl": "Een look\ndie bij je past.",
          "en": "A look\nthat feels like you."
        },
        "serviceIntro": {
          "nl": "Een kleine verandering of een frisse start: het begint bij jouw haarwensen. Bel de salon om de mogelijkheden voor jouw bezoek te bespreken.",
          "en": "A small change or a fresh start: it begins with your hair wishes. Call the salon to discuss the options for your visit."
        },
        "contactTitle": {
          "nl": "Jouw volgende\nmoment begint hier.",
          "en": "Your next\nmoment starts here."
        }
      },
      "images": {
        "hero": "assets/salon-scene.webp",
        "heroType": "concept",
        "gallery": [],
        "service": "assets/hair-inspiration.webp",
        "inspiration": [
          {
            "src": "assets/hair-inspiration.webp",
            "type": "concept"
          },
          {
            "src": "assets/salon-scene.webp",
            "type": "concept"
          }
        ]
      },
      "services": [
        {
          "id": "haircut",
          "number": "01",
          "title": {
            "nl": "Knippen",
            "en": "Haircut"
          },
          "description": {
            "nl": "Bespreek je gewenste coupe met Kapsalon Ayden. Vraag de salon naar de mogelijkheden, prijs en benodigde tijd.",
            "en": "Discuss your preferred haircut with Kapsalon Ayden. Ask the salon about the options, price and appointment length."
          },
          "source": "https://www.google.com/maps/search/?api=1&query=Kapsalon%20Ayden&query_place_id=ChIJWQ2FSAq3xUcRmbPxHN8NGL8",
          "image": "assets/hair-inspiration.webp"
        },
        {
          "id": "consultation",
          "number": "02",
          "title": {
            "nl": "Jouw haarwensen",
            "en": "Your hair wishes"
          },
          "description": {
            "nl": "Weet je nog niet precies wat je wilt? Neem contact op om jouw idee voor een volgend bezoek te bespreken.",
            "en": "Still deciding on your next look? Get in touch to discuss your idea for a future visit."
          },
          "source": "https://www.google.com/maps/search/?api=1&query=Kapsalon%20Ayden&query_place_id=ChIJWQ2FSAq3xUcRmbPxHN8NGL8",
          "image": "assets/salon-scene.webp"
        }
      ],
      "faq": [
        {
          "q": {
            "nl": "Kan ik online een echte afspraak maken?",
            "en": "Can I make a real appointment online?"
          },
          "a": {
            "nl": "Dit is een onafhankelijk websiteconcept voor Kapsalon Ayden. Bel 070 406 0102 voor een echte afspraak. De online demo toont het proces; de agenda van Ayden is nog niet gekoppeld.",
            "en": "This is an independent website concept for Kapsalon Ayden. Call 070 406 0102 for a real appointment. Online booking demonstrates the flow; Ayden’s calendar is not connected yet."
          }
        },
        {
          "q": {
            "nl": "Welke behandelingen, prijzen en tijden zijn beschikbaar?",
            "en": "Which treatments, prices and times are available?"
          },
          "a": {
            "nl": "Het actuele aanbod, tarieven en behandeltijden zijn nog niet door Ayden bevestigd. Bespreek dit rechtstreeks met de salon.",
            "en": "The current services, prices and appointment lengths have not yet been confirmed by Ayden. Discuss these directly with the salon."
          }
        },
        {
          "q": {
            "nl": "Waar vind ik Kapsalon Ayden?",
            "en": "Where can I find Kapsalon Ayden?"
          },
          "a": {
            "nl": "Van Heutszstraat 13A, 2593 PC Den Haag",
            "en": "Van Heutszstraat 13A, 2593 PC Den Haag"
          }
        }
      ],
      "sources": [
        {
          "label": "Google Maps · checked 2026-10-03",
          "url": "https://www.google.com/maps/search/?api=1&query=Kapsalon%20Ayden&query_place_id=ChIJWQ2FSAq3xUcRmbPxHN8NGL8"
        },
        {
          "label": "Fresha public listing · not affiliated",
          "url": "https://www.fresha.com/nl/lvp/kapsalon-ayden-van-heutszstraat-den-haag-D1xoMa"
        }
      ],
      "ui": {
        "how1Text": {
          "nl": "Bekijk de mogelijkheden en bespreek je haarwensen.",
          "en": "Explore the options and discuss your hair wishes."
        },
        "how3": {
          "nl": "Kom langs in Den Haag",
          "en": "Visit in The Hague"
        }
      },
      "contact": {
        "mode": "demo",
        "endpoint": "/api/contact",
        "confirmed": false
      }
    },
    "ff": {
      "market": "nl",
      "languages": [
        "nl",
        "en"
      ],
      "defaultLanguage": "nl",
      "timeZone": "Europe/Amsterdam",
      "theme": {
        "primary": "#394b3e",
        "accent": "#cdb58a",
        "background": "#f6f4ee",
        "font": "Georgia, Cambria, serif",
        "bodyFont": "Arial, Helvetica, sans-serif",
        "layout": "salon"
      },
      "sections": [
        "services",
        "process",
        "reviews",
        "gallery",
        "contact"
      ],
      "google": {
        "enabled": true,
        "placeId": "",
        "endpoint": "/api/place",
        "maxPhotos": 5,
        "syncBusinessDetails": true,
        "reviewsEndpoint": "/api/google-reviews",
        "photosEnabled": true,
        "legacyEnvironmentPlaceId": true
      },
      "calendar": {
        "mode": "api",
        "bookingUrl": "",
        "workingDays": [
          1,
          2,
          3,
          4,
          5
        ],
        "exampleSlots": [
          "10:00",
          "11:30",
          "14:00",
          "16:00"
        ],
        "endpoint": "/api/bookings",
        "durationsConfirmed": true,
        "maxBookingWindowMonths": 2
      },
      "whatsapp": {
        "enabled": false,
        "number": ""
      },
      "extensions": {
        "chatbot": false,
        "automations": false
      },
      "id": "ff",
      "name": "F&F Car Service Electronics",
      "shortName": "F&F",
      "sector": "car-service",
      "business": {
        "address": "Populierendreef 990A, 2272 HX Voorburg",
        "phone": "+31703000730",
        "phoneDisplay": "070 300 07 30",
        "email": "verascipii@gmail.com",
        "website": "",
        "mapsUrl": "https://www.google.com/maps?q=Populierendreef+990A+Voorburg",
        "city": "Voorburg",
        "locationLabel": "Voorburg · NL"
      },
      "proof": null,
      "hours": [
        {
          "days": [
            1,
            2,
            3,
            4,
            5
          ],
          "open": "08:00",
          "close": "17:30"
        },
        {
          "days": [
            0,
            6
          ],
          "closed": true
        }
      ],
      "copy": {
        "eyebrow": {
          "nl": "F&F CAR SERVICE ELECTRONICS · VOORBURG",
          "en": "F&F CAR SERVICE ELECTRONICS · VOORBURG"
        },
        "heroTitle": {
          "nl": "Zorg voor\njouw auto.",
          "en": "Care for\nyour car."
        },
        "heroIntro": {
          "nl": "De oorspronkelijke F&F-configuratie: onderhoud, keuring en diagnose met Google Calendar-reserveringen.",
          "en": "The original F&F configuration: maintenance, inspection and diagnostics with Google Calendar booking."
        },
        "serviceTitle": {
          "nl": "Onderhoud &\ndiagnose.",
          "en": "Maintenance &\ndiagnostics."
        },
        "serviceIntro": {
          "nl": "De oorspronkelijke zes diensten en behandeltijden zijn uit de laatste F&F-versie behouden.",
          "en": "The original six services and appointment lengths are preserved from the latest F&F version."
        },
        "contactTitle": {
          "nl": "Plan jouw\nvolgende bezoek.",
          "en": "Plan your\nnext visit."
        }
      },
      "images": {
        "hero": "assets/garage.jpg",
        "heroType": "original",
        "service": "assets/garage.jpg",
        "gallery": [],
        "inspiration": [
          {
            "src": "assets/garage.jpg",
            "type": "original"
          }
        ]
      },
      "services": [
        {
          "id": "apk",
          "number": "01",
          "durationMinutes": 45,
          "title": {
            "nl": "APK check",
            "en": "MOT check"
          },
          "description": {
            "nl": "APK check · 45 minuten volgens de oorspronkelijke F&F-configuratie.",
            "en": "MOT check · 45 minutes in the original F&F configuration."
          }
        },
        {
          "id": "general",
          "number": "02",
          "durationMinutes": 60,
          "title": {
            "nl": "General check",
            "en": "General check"
          },
          "description": {
            "nl": "General check · 60 minuten volgens de oorspronkelijke F&F-configuratie.",
            "en": "General check · 60 minutes in the original F&F configuration."
          }
        },
        {
          "id": "tires",
          "number": "03",
          "durationMinutes": 45,
          "title": {
            "nl": "Bandenwissel",
            "en": "Tyre change"
          },
          "description": {
            "nl": "Bandenwissel · 45 minuten volgens de oorspronkelijke F&F-configuratie.",
            "en": "Tyre change · 45 minutes in the original F&F configuration."
          }
        },
        {
          "id": "oil",
          "number": "04",
          "durationMinutes": 30,
          "title": {
            "nl": "Olie verversen",
            "en": "Oil change"
          },
          "description": {
            "nl": "Olie verversen · 30 minuten volgens de oorspronkelijke F&F-configuratie.",
            "en": "Oil change · 30 minutes in the original F&F configuration."
          }
        },
        {
          "id": "brakes",
          "number": "05",
          "durationMinutes": 45,
          "title": {
            "nl": "Remmen check",
            "en": "Brake check"
          },
          "description": {
            "nl": "Remmen check · 45 minuten volgens de oorspronkelijke F&F-configuratie.",
            "en": "Brake check · 45 minutes in the original F&F configuration."
          }
        },
        {
          "id": "diagnostic",
          "number": "06",
          "durationMinutes": 60,
          "title": {
            "nl": "Diagnose",
            "en": "Diagnostics"
          },
          "description": {
            "nl": "Diagnose · 60 minuten volgens de oorspronkelijke F&F-configuratie.",
            "en": "Diagnostics · 60 minutes in the original F&F configuration."
          }
        }
      ],
      "faq": [],
      "sources": [],
      "ui": {
        "bookingTitle": {
          "nl": "Plan je onderhoud.",
          "en": "Book your maintenance."
        },
        "how1Text": {
          "nl": "Kies onderhoud, een keuring of een diagnose.",
          "en": "Choose maintenance, an inspection or diagnostics."
        },
        "how3": {
          "nl": "Kom langs in Voorburg",
          "en": "Visit in Voorburg"
        },
        "treatmentNote": {
          "nl": "Duur volgens de oorspronkelijke F&F-configuratie.",
          "en": "Duration from the original F&F configuration."
        },
        "conceptShort": {
          "nl": "Oorspronkelijk F&F-beeld",
          "en": "Original F&F image"
        },
        "photoConcept": {
          "nl": "Oorspronkelijk F&F-beeld",
          "en": "Original F&F image"
        },
        "privacyText": {
          "nl": "Bij een bevestigde afspraak verwerkt Google Calendar de reserveringsgegevens en verstuurt de e-maildienst bevestigingen. Het contactformulier verstuurt je bericht naar F&F.",
          "en": "For confirmed appointments, Google Calendar processes booking details and the email provider sends confirmation. The contact form sends your enquiry to F&F."
        },
        "call": {
          "nl": "Bel F&F",
          "en": "Call F&F"
        }
      },
      "contact": {
        "mode": "api",
        "endpoint": "/api/contact"
      }
    },
    "starter": {
      "market": "barcelona",
      "languages": [
        "es",
        "en",
        "ca"
      ],
      "defaultLanguage": "es",
      "timeZone": "Europe/Madrid",
      "theme": {
        "primary": "#234938",
        "accent": "#e1bd82",
        "background": "#f5f1e8",
        "font": "Georgia, Cambria, serif",
        "bodyFont": "Arial, Helvetica, sans-serif",
        "layout": "studio"
      },
      "sections": [
        "services",
        "contact"
      ],
      "google": {
        "enabled": false,
        "placeId": "",
        "endpoint": "/api/place",
        "maxPhotos": 2,
        "syncBusinessDetails": true
      },
      "calendar": {
        "mode": "demo",
        "bookingUrl": "",
        "workingDays": [
          1,
          2,
          3,
          4,
          5
        ],
        "exampleSlots": [
          "10:00",
          "11:30",
          "14:00",
          "16:00"
        ]
      },
      "whatsapp": {
        "enabled": false,
        "number": ""
      },
      "extensions": {
        "chatbot": false,
        "automations": false
      },
      "id": "starter",
      "name": "Studio · demo",
      "shortName": "Studio",
      "sector": "service-business",
      "business": {
        "address": "",
        "phone": "",
        "phoneDisplay": "",
        "email": "",
        "website": "",
        "mapsUrl": "",
        "city": "Barcelona",
        "locationLabel": "Barcelona · ES · demo"
      },
      "proof": null,
      "hours": [],
      "images": {
        "hero": "",
        "heroType": "concept",
        "gallery": []
      },
      "copy": {
        "eyebrow": {
          "nl": "DIENSTEN · DEMO",
          "en": "SERVICES · DEMO",
          "es": "SERVICIOS · DEMO",
          "ca": "SERVEIS · DEMO"
        },
        "heroTitle": {
          "nl": "Een basis voor\njouw bedrijf.",
          "en": "A foundation for\nyour business.",
          "es": "Una base para\ntu negocio.",
          "ca": "Una base per\nal teu negoci."
        },
        "heroIntro": {
          "nl": "Voorbeeldconfiguratie zonder een echt bedrijf.",
          "en": "Example configuration without a real business.",
          "es": "Configuración de ejemplo; no representa un negocio real.",
          "ca": "Configuració d’exemple; no representa cap negoci real."
        },
        "serviceTitle": {
          "nl": "Je diensten",
          "en": "Your services",
          "es": "Tus servicios",
          "ca": "Els teus serveis"
        },
        "serviceIntro": {
          "nl": "Configureer het aanbod per klant.",
          "en": "Configure the offer per client.",
          "es": "Configura la oferta por cliente.",
          "ca": "Configura l’oferta per client."
        },
        "contactTitle": {
          "nl": "Laten we praten.",
          "en": "Let’s talk.",
          "es": "Hablemos.",
          "ca": "Parlem-ne."
        }
      },
      "services": [
        {
          "id": "consultation",
          "number": "01",
          "title": {
            "nl": "Dienstvoorbeeld",
            "en": "Example service",
            "es": "Servicio de ejemplo",
            "ca": "Servei d’exemple"
          },
          "description": {
            "nl": "Vervang door geverifieerde bedrijfsinformatie.",
            "en": "Replace with verified business information.",
            "es": "Sustituye por información verificada del negocio.",
            "ca": "Substitueix-ho per informació verificada del negoci."
          },
          "source": ""
        }
      ],
      "faq": [],
      "sources": [],
      "servicePresentation": "list",
      "ui": {
        "bookingTitle": {
          "es": "Planifica tu visita.",
          "en": "Plan your visit.",
          "ca": "Planifica la teva visita."
        },
        "callIntro": {
          "es": "Añade el contacto público verificado en la configuración del cliente.",
          "en": "Add verified public contact details to the client configuration.",
          "ca": "Afegeix el contacte públic verificat a la configuració del client."
        }
      },
      "contact": {
        "mode": "demo",
        "endpoint": "/api/contact",
        "confirmed": false
      }
    }
  }
};
if(typeof module!=='undefined')module.exports=registry;
root.ClientRegistry=registry;
})(typeof window==='undefined'?globalThis:window);
