# Restaurant concept: El Fogon Latino

Independent restaurant website concept, isolated from the salon frontend. No collaboration or endorsement is claimed. No publication or restaurant contact has been performed.

Preview through the shared Ocimatik concepts server at:

`http://localhost:4174/sectors/restaurants/el-fogon-latino/index.html?lang=nl`

Use `lang=en` for English and `lang=nl` for Dutch. These are the only visible business languages. All navigation, booking states, source notes, error states and accessible labels are translated. The shared server must explicitly allow the sector's static files; do not copy this directory into the salon root.

## Reuse for another restaurant

`config.js` exports the same object to Node (`require(...)`) and the browser (`window.RestaurantConfig`). Edit `id`, `name`, `shortName`, `business`, `contact`, `copy`, `menu`, `menuImages`, `theme` and `proof`. Register that configuration in the shared server/integration context with the same ID. The sector has its own CSS, rendering and booking preview and uses shared core, carousel and contact components. It does not modify the salon frontend or backend.

## Verified details and sources

- Google Maps UI, reviewed 3 October 2026: El Fogon Latino; Pletterijkade 29, 2515 SG Den Haag; phone +31 6 42510834; coordinates 52.0741804, 4.3225177; rating 4.3 from 63 Google reviews. The displayed aggregate is dated, not described as live.
- [Google Maps business profile](https://www.google.com/maps/place/El+Fogon+Latino/@52.0741804,4.3225177,17z/data=!3m1!4b1!4m6!3m5!1s0x47c5b7dccc6b7365:0x110679e57c9f47c0!8m2!3d52.0741804!4d4.3225177!16s%2Fg%2F11svvv9lj3).
- [Public Uber Eats menu](https://www.ubereats.com/nl-en/store/el-fogon-latino/Gbkb9TKTUjC96zoEd8S6qQ): Pica Pollo, Rabo de vaca and Tostones. Brief menu descriptions are paraphrased. No prices, availability, allergen information or platform rating is copied into the concept as current. Uber Eats review counts are not Google review counts.
- An exact search found no verified Dutch owned website; similarly named Italian and US websites were excluded. No unverified social/contact URL is used.

## Google connection and fallback

The verified Maps URL and a free embed with name, full address and coordinates work without an API key. `google.placeId` is deliberately empty: the Maps CID is not substituted for a Places Place ID. `google.resolvePlaceId: true` lets the server resolve and validate the business when Places is activated.

Same-origin shared endpoints: `/api/google-reviews?client=fogon&lang=nl|en` for the recovered review integration, and `/api/place?client=fogon&lang=...` for photos and place details. Keep Google credentials on the server. When live data is available, the frontend renders author photos, stars, review text, available translations with original text, Google branding, selection notes, source links and photo author attribution. The route preserves the review selection returned by Google. If that route is unavailable, the Places response is used with its own selection note.

The fallback is a real public review selection checked on 3 October 2026, with date, author photos, ratings and source links. Manual English translations are labelled as concept translations. A successful live connection replaces this selection. No invented reviews or restaurant photos are supplied. Carousels support touch scrolling, keyboard arrows, previous/next, optional autoplay, pause on focus/hover and reduced motion. The photo gallery is hidden until actual Google photos arrive. The 251 KB WebP hero photograph is used once; three native SVG food illustrations accompany the menu. Their conceptual origin is labelled, and original PNG files remain preserved.

## Booking and payments

The reservation flow previews a date, party size, example time and optional name entirely on screen. It makes no POST request, persists no guest data, creates no table reservation and no Google Calendar event. The result explicitly states those limits. Actual availability, capacity, restaurant approval and a live reservation integration remain pending. The call CTA opens the verified phone only when the user chooses it.

There is no payment form or charge in this sector. Payment experiments belong in the separate `deliverables/payments` proof of concept. A browser return or a pending SEPA debit must never be treated as payment proof or a confirmed reservation.

## Images and readiness

See `assets/manifest.json`. The hero is an AI-created Latin Caribbean food mood image, labelled as a concept throughout. It does not depict a verified restaurant dish, customer or premises. The original generated files remain in the Codex generated-images directory; only the selected final is referenced here.

Before any public launch: obtain restaurant approval; confirm menu, prices, allergens, hours and rights to actual images; configure the real Google Place ID and server credentials; implement approved reservation capacity and confirmation; define privacy/retention; replace the independent-concept disclaimer only after approval.

No dependencies or builds were added for this sector. Syntax and shared frontend tests check the NL/EN configuration, scoped reviews and contact behaviour. The header node is retained during language switches; reservation and contact drafts remain in page memory, without storage or transmission. Fixed hero, action and brand dimensions keep fonts and image placement consistent across languages. Final desktop/mobile visual QA is coordinated with the parent task.
