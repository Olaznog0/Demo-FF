'use strict';
// Build dated, attributable excerpts from the saved Google UI evidence.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const evidenceRoot = path.resolve(root, '../deliverables/leads');
const definitions = [
  { id: 'trend-hairstyling', file: 'trend', rating: 4.8, total: 82, reviews: [
    ['jack van der linden', 'Ben er goed geknipt.', 'I had a good haircut here.', '5 maanden geleden', '5 months ago'],
    ['leon aalbregt', 'Je kan snel terecht, goede kapper', 'You can get an appointment quickly; a good hairdresser.', '4 maanden geleden', '4 months ago'],
    ['Eline Potter', 'Ik ben heel blij met deze kapper.', 'I am very happy with this hairdresser.', 'een jaar geleden', '1 year ago'],
  ] },
  { id: 'las-banderas', file: 'banderas', rating: 4.7, total: 77, reviews: [
    ['Martin Van Orsouw', 'Al 3 jaar vaste klant en altijd zeer tevreden.', 'A regular customer for three years and always very happy.', '7 maanden geleden', '7 months ago'],
    ['Farhat Jalal', 'Top kapper! Erg vriendelijk personeel', 'A great hairdresser! Very friendly staff.', '4 maanden geleden', '4 months ago'],
  ] },
  { id: 'de-oude-mol', file: 'oude-mol', rating: 4.7, total: 363, reviews: [
    ['Koos Luijten', 'Erg gezellig, mooi aanbod van speciaalbieren en wijn.', 'Very cosy, with a lovely selection of craft beers and wine.', '2 maanden geleden', '2 months ago'],
    ['Sven Evers', 'Een verborgen pareltje!', 'A hidden gem!', '4 maanden geleden', '4 months ago'],
    ['Ivo van der meer', 'Een hele fijne plek om even een biertje te doen.', 'A lovely place to stop for a beer.', '3 maanden geleden', '3 months ago'],
  ] },
  { id: 'de-happertjes', file: 'happertjes', rating: 3.6, total: 69, reviews: [
    ['bien2012', 'Je wordt hier altijd vriendelijk geholpen', 'You always receive friendly service here.', '3 maanden geleden', '3 months ago'],
    ['Anne Bosman', 'De kibbeling en frietjes waren erg lekker', 'The fried fish and chips were very tasty.', 'een jaar geleden', '1 year ago'],
    ['Martin Simonis', 'Heerlijke kibbeling! Lekker vers en krokant gebakken.', 'Delicious fried fish! Lovely, fresh and crispy.', '4 jaar geleden', '4 years ago'],
  ] },
];
const snapshots = Object.fromEntries(definitions.map(definition => {
  const proof = JSON.parse(fs.readFileSync(path.join(evidenceRoot, `pitch-${definition.file}-reviews-2026-10-04.json`), 'utf8'));
  const portraits = JSON.parse(fs.readFileSync(path.join(evidenceRoot, `pitch-${definition.file}-portraits-2026-10-04.json`), 'utf8'));
  if (proof.checked !== '2026-10-04' || portraits.checked !== proof.checked) throw Error('Dated primary evidence required');
  const quotedWords = definition.reviews.reduce((sum, row) => sum + row[1].split(/\s+/).length, 0);
  if (quotedWords > 25) throw Error('Excerpts exceed the per-source quotation limit');
  return [definition.id, {
    clientId: definition.id, checked: proof.checked, rating: definition.rating, total: definition.total,
    url: proof.url, source: 'Google Maps',
    reviews: definition.reviews.map(([authorName, originalText, english, relativeTime, englishTime]) => {
      if (!proof.text.includes(authorName) || !proof.text.includes(originalText) || !proof.text.includes(relativeTime)) throw Error('Review is missing from saved primary evidence: ' + authorName);
      const image = /^url\("(https:\/\/lh3\.googleusercontent\.com\/[^"\s]+)"\)$/.exec(portraits.portraits[authorName] || '');
      return { authorName, ...(image ? { profilePhotoUrl: image[1] } : {}), rating: 5, text: originalText,
        originalText, originalLanguage: 'nl', language: 'nl', translations: { en: english },
        relativeTime, relativeTimes: { nl: relativeTime, en: englishTime }, googleMapsUri: proof.url,
        excerpt: true };
    }),
  }];
}));
fs.writeFileSync(path.join(root, 'pitch-review-snapshots.json'), JSON.stringify(snapshots, null, 2) + '\n');
console.log(JSON.stringify({ businesses: Object.keys(snapshots).length, reviews: Object.values(snapshots).reduce((sum, value) => sum + value.reviews.length, 0) }));
