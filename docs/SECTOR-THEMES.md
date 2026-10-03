# Reusable sector designs

Each sector has one visual system shared by its public fictional concept and private business presentation. Keep the layout in sector CSS and the business identity, copy, photos and integration settings in configuration.

| Sector | Visual structure | Style entry |
| --- | --- | --- |
| Hair and beauty | Editorial typography, mirror-shaped portrait, treatment rows and a soft green palette | `style.css`, salon rules in `actions.css` |
| Restaurant | Full-width food cover, warm paper, circular dish images, ember motif and a table reservation panel | `sectors/restaurants/el-fogon-latino/restaurant.css`, restaurant rules in `concepts/public.css` |
| Dental | Centered practice introduction, white space, panoramic reception arch, smile curve and calm green care cards | `sectors/dentists/dental.css` |
| Accounting | Desktop navigation rail, serif editorial headline, office photograph framed like paper, ledger rows and ink accents | `sectors/accountants/accounting.css` |
| Moving | Wide cover, overlapping route panel, packing details and a gold primary action | `sectors/movers/moving.css` |

## Shared behavior

`core.js`, `site-shell.js`, `appointment.js`, `contact-widget.js`, `carousel.js` and the confirmation components provide language, calendar, reviews and contact behavior. The existing Google, Calendar and Resend adapters remain separate from visual themes.

- Dutch businesses use Dutch and English with the same fonts, image sources, crop and reserved header/hero space.
- Set `bookingEligible: false` on contact-only services. General enquiries belong in contact selectors; genuine consultations and introductory visits remain appointments.
- Contact topics are unique by ID and equivalent localized label. A configured general topic suppresses the default one.
- Restaurant bookings ask for a table, party size, date and time. They do not invoke a payment flow.
- Demo interactions produce a local summary. API interactions redirect only after a real provider receipt. Return links point to the selected business home and retain its language.
- Review autoplay pauses on hover, focus, hidden pages and reduced-motion preferences. Keep author attribution, photo credits and original-language text.
- Decorative motifs use CSS/SVG and respect reduced motion. They must not change content dimensions or obscure controls.

## Public and private packages

The public build uses fictional identities and its own feedback registry. It excludes real business configuration and Google data. The private presentation build retains the selected businesses and their corroborated sources. Verify package contents before distribution; keep credentials in server environment variables.

## Validation

The October 2026 visual review covered all ten home pages in Dutch and English at 320, 390 and 1280 pixels. Header and hero image geometry stayed equal across languages, all covers loaded, and no horizontal overflow appeared. The API and frontend tests cover scoped integration credentials, provider receipts, calendar dates, translation, contact topic uniqueness and public/private isolation.
