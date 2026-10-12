# Quality requirements for every business template

These requirements apply from the first implementation, including all future templates. Review the complete page in its business context; increasing every image mechanically is not a design review.

- The first viewport identifies the business and its service, contains relevant imagery, and gives visitors a clear next action. Photography must communicate the service; moving services show a team at work. Concept imagery is not presented as an authenticated photograph of a real business.
- Each design has its own composition, typography, palette and section rhythm. Preserve successful elements. Adjust photo crop, content order, proportion, contrast and space according to that composition.
- Services, proof, FAQ, contact and location form a useful sequence. Avoid duplicate pitches, repeated photographs, decorative blank space and invented services, prices, availability or reviews.
- Navigation, primary actions and form labels are legible and accessible. Small-screen menus remain available by keyboard. Forms retain their original validation and provider contracts; a demonstration never claims that a message or appointment has been sent.
- Review every variant at 1440, 390 and 320 pixels in both Dutch and English. Verify loaded hero images, readable text, natural content height, horizontal overflow, photo cropping, CTA visibility, services, carousel controls, FAQ, form validation, language switching and return links.
- Palette changes preserve business identity and entered form data. Booking and confirmation retain the selected business, language and design. Keep real campaign data and fictional portfolio feedback separate.
- Review the complete rendered page, including the final sections. Fix observed issues and rerun affected checks before marking a variant complete. Automated geometry checks complement visual inspection.
- Before building or rendering, run the user's disk-space guard. Reuse source assets and dependencies; keep task temporaries below 10 GB, preserve the 100 GB disk reserve, and remove only verified disposable outputs.

## October 2026 implementation

The local [review index](../design-review/index.html) links all 25 designs. R1–R5 and B1–B5 refine the existing campaign pages; D1–D5, A1–A5 and M1–M5 extend the existing fictional dental, accounting and moving concepts.

`campaign20/build-styles.mjs` assembles the original primitives, shared modules and the café, salon and navigation refinements. Preserve these inputs when regenerating styles. The fifteen public concepts use `concepts/sector-variations.css` and `sector-variations.js`; the selector changes a class attribute without rebuilding forms. `design-context.js` carries the public palette through shared booking and confirmation.

New assets use the built-in ImageGen tool, saved as sibling WebP files. Original generated PNGs are retained under the chat's `generated_images` directory. Prompts: an inviting European neighbourhood café with coffee preparation, ceramic cups and natural window light; a moving team carrying a protected sofa from a brick home to an unbranded van. Both request editorial photography, usable wide/mobile crops, and no logos, readable text or identifiable real business. They are design references.

The local review index is excluded from the public showcase build. Production changes are prepared in source; this review does not deploy or send campaign messages.
