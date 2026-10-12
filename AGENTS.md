# Business-template quality

For every new or updated business template, follow [docs/DESIGN-QUALITY.md](docs/DESIGN-QUALITY.md) from the initial implementation. Review the complete page, its service-specific visitor journey and its desktop/mobile rendering; do not finish a design by enlarging its hero image alone.

Preserve the business identity, factual source data, reviews and form/provider contracts. Maintain distinct compositions across variants. Keep public fictional concepts separate from real campaign data.

The local comparison page is `design-review/index.html`. Campaign CSS is generated with `node campaign20/build-styles.mjs`; edit its source refinement files and rebuild the generated sheet. Public dental, accounting and moving variants use `concepts/sector-variations.css`, `sector-variations.js` and `design-context.js`.

Apply the user's permanent disk-space controls before builds, large renders or dependency changes. Publication requires an explicit user request.
