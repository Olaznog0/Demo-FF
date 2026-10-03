# Public business concepts

The five public websites are fictional portfolio businesses. Their names, addresses and guest voices are invented; the feedback has no Google attribution, ratings, public profiles or verification claims. The original business configurations remain separate for private local pitches.

| ID | Business | Page |
| --- | --- | --- |
| bloom | Studio Bloom | salon/index.html |
| brasa | Casa Brasa | restaurants/index.html |
| lumen | Lumen Dental | dentists/index.html |
| northline | Northline Advisors | accountants/index.html |
| brightmove | BrightMove | movers/index.html |

`../public-client-config.js` supplies the public-only UMD registry. Each folder has a small config wrapper; the public pages never load `client-config.js` or the private sector configs. The shared booking and confirmation pages accept the five public IDs and return to their configured `homePage`.

Calendar and contact modes are `demo`; Google Places and review fetching are disabled. There are no real phone numbers, Place IDs, Google snapshots or outgoing business links. The map names the Peace Palace separately from each fictional address. Its actual address comes from the [Peace Palace directions page](https://www.vredespaleis.nl/organization/directions/?lang=en).

`public-core.js` normalizes links for nested pages and selects the named landmark map. `public-site.js` reuses the shared salon and sector infrastructure, adds sector icons, local concept feedback, and distinct hardcoded images. `public.css` keeps each sector’s own appearance. Image provenance is recorded in the project’s `deliverables/design-assets.json`.

Verify data isolation with `node --test tests/public-concepts.test.js`. These tests never contact an external provider. Public builds must use the separate showcase allowlist; private pitch configurations and credentials must stay out of the public artifact.
