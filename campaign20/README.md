# Twenty personalized business previews

One lightweight frontend gives each of the ten food businesses five restaurant directions (`R1`–`R5`) and each of the ten Hair & Beauty businesses five salon directions (`B1`–`B5`). Business identity remains fixed when a visitor changes a palette or switches between English and Nederlands.

Start the local preview with `node campaign20/server.cjs`, then open `http://127.0.0.1:4188/campaign20/launcher.html`. A business link is `./index.html?lead=NLEZ2-029&theme=R1&lang=nl`. Localhost is for review, and must never be sent as a campaign link.

## Public release boundary

Public entry files are explicitly listed in `release-files.mjs` (`PUBLIC_ENTRY_FILES`), plus the five whitelisted image/logo assets from the existing `../assets` directory. `getCampaignFiles()` returns exactly these regular files, with their source, destination, size and SHA-256 hash: pages under `/pitch/`, assets under `/demos/assets/`. The `launcher.html` and `launcher.js` are a local review aid; exclude them from a personalized public package unless a separate private launcher is intended. Also exclude this README, build scripts, tests, source briefs, email drafts, original inventory and deployment audit.

`business-data.json` includes only twenty business identities, public phone numbers, corroborated Google summaries and sourced business facts. There are no emails, personal pitch strategy, rankings or contact lists in the preview payload. Existing conceptual cover assets are reused as design references, not as verified photographs of each business. Image alternatives describe that role without claiming the images show the business or its staff.

## Component contracts

The HTML loads `reviews-data.js`, `reviews-ui.js` and `calendar-ui.js` as classic deferred scripts. The app consumes:

- `window.CampaignReviews.mount(container, {leadId, cid, lang})`, returning `{update({lang}), destroy()}`. Its dataset is business-specific and must check CID attribution.
- `window.CampaignCalendar.mount(container, {leadId, cid, businessName, family, subtype, lang, onSuccess})`, returning `{update({lang, onSuccess}), destroy()}`. Appointment/visit preferences are preserved by business; demo submissions do not contact providers.

Themes are changed with one CSS class; changing a palette never rebuilds image, calendar or review nodes. Translation updates text in place. Thank-you routes retain `lead`, `theme`, `lang` and `view=thanks`; names, emails and messages never enter URLs, local storage or requests. Return links always point to that business homepage. The request summary lives only in app memory.

All twenty Google decimal CIDs are corroborated in the source manifest. A Google CID identifies its Maps record and is distinct from a Places API `place_id`; null Places IDs remain null. Reviews use attributed observations rather than fabricated quotes or automatic inference. Visit planners for cafés, kiosks, takeaway and ice cream shops do not invent table bookings or available slots. Salons request preferred appointments rather than confirm real availability.

Regenerate data/styles with `node campaign20/build-data.mjs` and `node campaign20/build-styles.mjs`. Run `node --test campaign20/campaign.test.mjs`. No new dependencies, images, copied repositories or backend changes are required.
