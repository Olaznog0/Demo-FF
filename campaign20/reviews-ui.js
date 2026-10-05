/* Shared, identity-checked Google review carousel for the private campaign. */
(function (global) {
  'use strict';
  const instances = new WeakMap();
  const text = {
    en: { heading: 'What people say.', region: 'Google customer reviews', previous: 'Previous review', next: 'Next review', pause: 'Pause automatic reviews', play: 'Play reviews automatically', translated: 'Translated from Dutch', original: 'Show original', originalCopy: 'Original review', back: 'Show translation', google: 'Read all reviews on Google', rating: 'out of 5', reviewCount: 'reviews', of: 'of', unavailable: 'Read customer reviews on Google', profile: 'Google reviewer profile photo', observed: 'Google information observed on' },
    nl: { heading: 'Wat klanten vertellen.', region: 'Klantbeoordelingen op Google', previous: 'Vorige beoordeling', next: 'Volgende beoordeling', pause: 'Automatisch afspelen pauzeren', play: 'Beoordelingen automatisch afspelen', translated: 'Vertaald uit het Nederlands', original: 'Origineel tonen', originalCopy: 'Originele beoordeling', back: 'Vertaling tonen', google: 'Lees alle beoordelingen op Google', rating: 'van 5', reviewCount: 'beoordelingen', of: 'van', unavailable: 'Lees klantbeoordelingen op Google', profile: 'Profielfoto van de Google-beoordelaar', observed: 'Google-informatie waargenomen op' }
  };
  const element = (tag, className, value) => { const node = document.createElement(tag); node.className = className || ''; if (value !== undefined) node.textContent = value; return node; };
  const language = value => value === 'nl' ? 'nl' : 'en';
  const initials = name => name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => Array.from(part)[0]).join('').toLocaleUpperCase();
  const safePhoto = value => { try { const url = new URL(value); return url.protocol === 'https:' && (url.hostname === 'lh3.googleusercontent.com' || url.hostname.endsWith('.googleusercontent.com')) ? url.href : null; } catch { return null; } };
  const safeAuthor = value => { try { const url = new URL(value); return url.protocol === 'https:' && url.hostname === 'www.google.com' && url.pathname.startsWith('/maps/contrib/') ? url.href : null; } catch { return null; } };

  function styles() {
    if (document.getElementById('campaign-reviews-style')) return;
    const style = element('style'); style.id = 'campaign-reviews-style';
    style.textContent = `
      .campaign-reviews{--cr-paper:#fff;--cr-ink:#24342e;--cr-muted:#53635c;--cr-line:#d9e1dc;--cr-gold:#966500;--cr-empty:#748078;--cr-radius:18px;--cr-shadow:0 10px 32px #142a2010;color:var(--ink,#162e41);font-family:inherit;max-width:1040px;margin-inline:auto;min-width:0;container:campaign-reviews / inline-size}
      .cr-heading-row{display:flex;align-items:center;justify-content:space-between;gap:24px;margin-block-end:24px;flex-wrap:wrap}
      .cr-heading{font:inherit;font-size:clamp(30px,3.2vw,42px);font-weight:700;line-height:1.18;letter-spacing:-.035em;margin:0;max-width:17ch}
      .cr-aggregate{display:grid;grid-template-columns:auto 1fr;gap:3px 14px;padding:13px 18px;border:1px solid var(--cr-line);border-radius:12px;background:var(--cr-paper);color:var(--cr-ink);font:16px/1.45 Arial,Helvetica,sans-serif;text-decoration:none;box-shadow:0 3px 14px #142a2006}
      .cr-aggregate:hover{border-color:var(--cr-ink)}.cr-aggregate strong{grid-row:1/3;font-size:30px;font-weight:700;line-height:1.25;align-self:center;letter-spacing:-.04em;white-space:nowrap}.cr-aggregate-meta{display:flex;align-items:center;gap:9px;flex-wrap:wrap}.cr-aggregate-source{font-weight:700;font-size:15px}.cr-aggregate-count{grid-column:2;color:var(--cr-muted);font-size:14px}
      .cr-aggregate-stars{display:inline-block;position:relative;font-size:17px;line-height:1;letter-spacing:1px;color:var(--cr-empty);white-space:nowrap}.cr-aggregate-star-fill{position:absolute;inset:0 auto 0 0;overflow:hidden;color:var(--cr-gold);white-space:nowrap}
      .cr-carousel{display:flex;align-items:stretch;gap:20px;min-width:0;padding:4px 0 18px;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scroll-behavior:smooth;overscroll-behavior-x:contain;scrollbar-width:thin;scrollbar-color:var(--cr-line) transparent;touch-action:pan-x pan-y;position:relative;color:var(--cr-ink)}
      .cr-carousel::-webkit-scrollbar{height:6px}.cr-carousel::-webkit-scrollbar-thumb{background:var(--cr-line);border-radius:999px}.cr-carousel::-webkit-scrollbar-track{background:transparent}
      .cr-card{display:grid;grid-template-rows:auto auto 1fr auto;gap:18px;flex:0 0 calc((100% - 20px)/2);scroll-snap-align:start;scroll-snap-stop:normal;padding:28px;min-width:0;box-sizing:border-box;border:1px solid var(--cr-line);border-radius:var(--cr-radius);background:var(--cr-paper);box-shadow:var(--cr-shadow)}
      .cr-carousel.is-single .cr-card{flex-basis:100%}.cr-author-row{display:flex;align-items:center;gap:14px;min-height:56px;flex-wrap:wrap}.cr-avatar{display:grid;place-items:center;flex:0 0 56px;width:56px;height:56px;border-radius:50%;overflow:hidden;background:#e8eeea;color:var(--cr-ink);font:700 18px/1 Arial,Helvetica,sans-serif;box-shadow:0 0 0 3px var(--cr-paper),0 0 0 4px var(--cr-line)}
      .cr-avatar img{width:100%;height:100%;object-fit:cover;display:block}.cr-author-details{min-width:0;flex:1 1 150px}.cr-author{font:700 18px/1.4 Arial,Helvetica,sans-serif;color:var(--cr-ink);text-decoration:none;overflow-wrap:anywhere}.cr-author[href]:hover{text-decoration:underline;text-underline-offset:3px}.cr-date{display:block;font:15px/1.5 Arial,Helvetica,sans-serif;color:var(--cr-muted);margin-top:2px}
      .cr-source{display:inline-flex;align-items:center;gap:7px;padding:7px 11px;border:1px solid var(--cr-line);border-radius:999px;color:var(--cr-muted);font:600 13px/1.3 Arial,Helvetica,sans-serif;text-decoration:none;white-space:nowrap}.cr-source:hover{color:var(--cr-ink);border-color:var(--cr-ink)}.cr-source-arrow{font-size:17px;line-height:1}
      .cr-rating-row{display:flex;align-items:center;gap:11px}.cr-stars{color:var(--cr-gold);font:21px/1 Arial,Helvetica,sans-serif;letter-spacing:3px;white-space:nowrap}.cr-score{color:var(--cr-muted);font:600 14px/1.4 Arial,Helvetica,sans-serif;white-space:nowrap}
      .cr-quote{max-width:55ch;font-family:var(--cr-quote-font,inherit);font-size:clamp(21px,2vw,25px);font-weight:400;line-height:1.58;letter-spacing:-.012em;color:var(--cr-ink);margin:0;min-block-size:3.16em;overflow-wrap:anywhere}
      .cr-copy{display:flex;flex-direction:column;align-items:flex-start;gap:12px;min-width:0}.cr-quote.is-collapsed{display:-webkit-box;-webkit-line-clamp:6;-webkit-box-orient:vertical;overflow:hidden}.cr-expand{font:600 14px/1.5 Arial,Helvetica,sans-serif;background:none;color:var(--cr-ink);border:0;border-bottom:1px solid currentColor;padding:4px 0;min-height:34px;cursor:pointer}.cr-expand[hidden]{display:none}
      .cr-translation{display:flex;align-items:center;gap:8px 16px;flex-wrap:wrap;border-top:1px solid var(--cr-line);padding-top:14px;min-height:45px;font:14px/1.5 Arial,Helvetica,sans-serif;color:var(--cr-muted)}.cr-original{font:inherit;color:var(--cr-ink);background:none;border:0;padding:5px 0;cursor:pointer;text-decoration:underline;text-underline-offset:4px;min-height:34px}.cr-original[hidden]{display:none}.cr-original:hover{text-decoration-thickness:2px}
      .cr-controls{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-top:20px}.cr-control-group{display:flex;align-items:center;gap:8px}.cr-button{display:inline-grid;place-items:center;width:46px;height:46px;border:1px solid var(--cr-line);border-radius:50%;background:var(--cr-paper);color:var(--cr-ink);font:20px/1 Arial,Helvetica,sans-serif;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease}.cr-button:hover{transform:translateY(-2px);box-shadow:0 4px 12px #142a2014}.cr-button[hidden],.cr-control-group[hidden]{display:none}
      .cr-position{font:15px/1.5 Arial,Helvetica,sans-serif;color:var(--muted,#45596b);min-width:58px;text-align:center}.cr-all{font:16px/1.5 Arial,Helvetica,sans-serif;color:inherit;text-decoration:underline!important;text-underline-offset:4px;padding-block:8px}.cr-all:hover{text-decoration-thickness:2px}.campaign-reviews :focus-visible{outline:3px solid currentColor;outline-offset:4px}
      .cr-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
      @media(max-width:600px){.cr-heading-row{align-items:flex-start;gap:16px}.cr-heading{font-size:32px;max-width:none}.cr-aggregate{padding:11px 14px}.cr-card{padding:24px;gap:17px}.cr-author{font-size:17px}.cr-source{margin-left:70px;margin-top:-7px;padding:5px 9px}.cr-quote{font-size:21px;line-height:1.6;min-block-size:3.2em}.cr-controls{gap:14px}.cr-all{font-size:15px}.cr-aggregate strong{font-size:27px}}
      @container preview (max-width:740px){.cr-heading-row{gap:17px}.cr-heading{font-size:32px}.cr-card{padding:24px}.cr-quote{font-size:21px}.cr-source{font-size:12px}}
      .cr-button:disabled{opacity:.4;cursor:default;transform:none;box-shadow:none}
      @container campaign-reviews (min-width:760px){.cr-carousel.is-pair .cr-card{flex-basis:62%}}
      @container campaign-reviews (max-width:759px){.cr-card{flex-basis:88%;padding:24px}.cr-quote{font-size:21px}.cr-source{font-size:12px;padding:5px 9px}}
      @container campaign-reviews (max-width:479px){.cr-card{flex-basis:92%;padding:22px}.cr-source{margin-left:70px;margin-top:-7px}.cr-carousel{gap:16px}.cr-quote{font-size:20px;line-height:1.6}.cr-author{font-size:17px}}
      @media(prefers-reduced-motion:reduce){.cr-carousel{scroll-behavior:auto}.cr-button{transition:none}.cr-button:hover{transform:none}}
    `;
    document.head.append(style);
  }

  function mount(container, context) {
    if (!container || !container.replaceChildren) throw new TypeError('A review container is required');
    const leadId = String(context?.leadId || '');
    const cid = String(context?.cid || '');
    const business = global.CAMPAIGN_REVIEWS?.businesses?.[leadId];
    const existing = instances.get(container);
    if (!business || !/^\d+$/.test(cid) || cid !== String(business.cid)) {
      existing?.destroy(); container.replaceChildren();
      throw new RangeError('The requested business and Google review identity do not match');
    }
    if (existing && existing.leadId === leadId && existing.cid === cid) { existing.update({ lang: context.lang }); return existing; }
    existing?.destroy();
    styles();
    const extension = context.reviewExtension || global.CAMPAIGN_REVIEW_EXTENSION?.businesses?.[leadId];
    const additions = extension && String(extension.cid) === cid && Array.isArray(extension.reviews) ? extension.reviews : [];
    const seen = new Set();
    const reviews = [...business.reviews, ...additions].filter(review => {
      if (!review || typeof review.authorName !== 'string' || !review.authorName.trim() || typeof review.text !== 'string' || !review.text.trim() || !Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) return false;
      const identity = review.authorName.trim().toLocaleLowerCase() + '\n' + review.text.trim().replace(/\s+/g, ' ');
      if (seen.has(identity)) return false;
      seen.add(identity); return true;
    });
    let lang = language(context.lang), index = 0, autoplay = true, hover = false, focused = false, interacting = false, onscreen = true, timer = null, destroyed = false, intendedStop = null;
    const motion = global.matchMedia ? global.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
    const cleanup = [];
    const listen = (target, event, handler) => { target.addEventListener(event, handler); cleanup.push(() => target.removeEventListener(event, handler)); };
    const wrapper = element('div', 'campaign-reviews'); wrapper.dataset.leadId = leadId; wrapper.dataset.googleCid = cid;
    wrapper.setAttribute('role', 'region'); wrapper.setAttribute('aria-roledescription', 'carousel');
    const row = element('div', 'cr-heading-row');
    const heading = element('h2', 'cr-heading'); heading.id = 'campaign-review-heading-' + leadId;
    wrapper.setAttribute('aria-labelledby', heading.id);
    const mapsUrl = 'https://www.google.com/maps/?cid=' + cid;
    const aggregate = element('a', 'cr-aggregate'); aggregate.href = mapsUrl; aggregate.target = '_blank'; aggregate.rel = 'noopener noreferrer';
    const aggregateRating = element('strong'); const aggregateCount = element('span', 'cr-aggregate-count');
    const aggregateMeta = element('span', 'cr-aggregate-meta'); const aggregateSource = element('span', 'cr-aggregate-source', 'Google Maps');
    const aggregateStars = element('span', 'cr-aggregate-stars', '★★★★★'); aggregateStars.setAttribute('aria-hidden', 'true');
    const aggregateStarFill = element('span', 'cr-aggregate-star-fill', '★★★★★'); aggregateStarFill.style.width = Math.max(0, Math.min(100, business.rating * 20)) + '%'; aggregateStars.append(aggregateStarFill);
    aggregateMeta.append(aggregateSource, aggregateStars); aggregate.append(aggregateRating, aggregateMeta, aggregateCount); row.append(heading, aggregate); wrapper.append(row);
    const carousel = element('div', 'cr-carousel'); carousel.setAttribute('aria-live', 'off'); carousel.tabIndex = 0; carousel.setAttribute('role', 'group');
    carousel.classList.toggle('is-single', reviews.length === 1);
    carousel.classList.toggle('is-pair', reviews.length === 2);
    const cards = reviews.map((review, reviewIndex) => {
      const card = element('article', 'cr-card'); card.setAttribute('role', 'group'); card.setAttribute('aria-roledescription', 'slide');
      const authorRow = element('div', 'cr-author-row'); const avatar = element('span', 'cr-avatar');
      const initialText = initials(review.authorName); const photo = safePhoto(review.photoUrl);
      let image = null;
      if (photo) { image = element('img'); image.src = photo; image.width = 58; image.height = 58; image.loading = 'lazy'; image.decoding = 'async'; image.referrerPolicy = 'no-referrer'; image.addEventListener('error', () => { avatar.replaceChildren(document.createTextNode(initialText)); }, { once: true }); avatar.append(image); }
      else { avatar.textContent = initialText; avatar.setAttribute('aria-hidden', 'true'); }
      const authorDetails = element('div', 'cr-author-details'); const authorUrl = safeAuthor(review.authorUrl); const author = element(authorUrl ? 'a' : 'span', 'cr-author', review.authorName);
      if (authorUrl) { author.href = authorUrl; author.target = '_blank'; author.rel = 'noopener noreferrer'; }
      const date = element('span', 'cr-date'); authorDetails.append(author, date);
      const source = element('a', 'cr-source', 'Google Maps'); source.href = mapsUrl; source.target = '_blank'; source.rel = 'noopener noreferrer';
      const sourceArrow = element('span', 'cr-source-arrow', '↗'); sourceArrow.setAttribute('aria-hidden', 'true'); source.append(sourceArrow); authorRow.append(avatar, authorDetails, source);
      const stars = element('div', 'cr-stars', '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating));
      stars.setAttribute('role', 'img');
      const ratingRow = element('div', 'cr-rating-row'); const score = element('span', 'cr-score', review.rating + ' / 5'); score.setAttribute('aria-hidden', 'true'); ratingRow.append(stars, score);
      const copyArea = element('div', 'cr-copy'), quote = element('blockquote', 'cr-quote'), expand = element('button', 'cr-expand'); expand.type = 'button';
      quote.id = 'campaign-review-copy-' + leadId + '-' + reviewIndex;
      expand.setAttribute('aria-controls', quote.id);
      copyArea.append(quote, expand);
      const translation = element('div', 'cr-translation'); const translatedLabel = element('span'); const original = element('button', 'cr-original'); original.type = 'button';
      original.setAttribute('aria-controls', quote.id);
      let originalShown = false, expanded = false;
      // Measure the actual six-line viewport, even when the reader has expanded
      // the quote. Both class changes happen synchronously before a paint;
      // neither the full attributed copy nor the reader's preference changes.
      const measure = () => {
        quote.classList.toggle('is-collapsed', true);
        const height = quote.clientHeight, fullHeight = quote.scrollHeight;
        const measured = Number.isFinite(height) && height > 0 && Number.isFinite(fullHeight);
        const longCopy = measured ? fullHeight > height + 1 : quote.textContent.length > 220;
        quote.classList.toggle('is-collapsed', longCopy && !expanded);
        expand.hidden = !longCopy;
        expand.textContent = lang === 'nl' ? (expanded ? 'Minder tonen' : 'Meer lezen') : (expanded ? 'Show less' : 'Read more');
        expand.setAttribute('aria-expanded', String(expanded));
      };
      const refresh = () => {
        const copy = text[lang]; const hasTranslation = lang !== review.originalLanguage && !!review.translations?.[lang];
        quote.textContent = originalShown || !hasTranslation ? (review.displayText || review.text) : review.translations[lang];
        quote.lang = originalShown || !hasTranslation ? (review.originalLanguage || 'nl') : lang;
        measure();
        date.textContent = review.publishedLabels?.[lang] || review.publishedLabel || '';
        stars.setAttribute('aria-label', review.rating + ' ' + copy.rating);
        if (image) image.alt = review.authorName + ' — ' + copy.profile;
        const originalLanguage = review.originalLanguage === 'en' ? (lang === 'nl' ? 'Engels' : 'English') : (lang === 'nl' ? 'Nederlands' : 'Dutch');
        translatedLabel.textContent = hasTranslation && !originalShown ? (lang === 'nl' ? 'Vertaald uit het ' : 'Translated from ') + originalLanguage : copy.originalCopy;
        original.hidden = !hasTranslation; original.textContent = originalShown ? copy.back : copy.original;
        original.setAttribute('aria-pressed', String(originalShown));
      };
      listen(original, 'click', () => { originalShown = !originalShown; refresh(); });
      listen(expand, 'click', () => { expanded = !expanded; refresh(); });
      translation.append(translatedLabel, original); card.append(authorRow, ratingRow, copyArea, translation); carousel.append(card);
      return { node: card, quote, refresh, measure };
    });
    wrapper.append(carousel);
    const controls = element('div', 'cr-controls'); const group = element('div', 'cr-control-group');
    const previous = element('button', 'cr-button', '←'); previous.type = 'button';
    const position = element('span', 'cr-position'); position.setAttribute('aria-hidden', 'true');
    const next = element('button', 'cr-button', '→'); next.type = 'button';
    const toggle = element('button', 'cr-button', 'Ⅱ'); toggle.type = 'button';
    group.append(previous, position, next, toggle); group.hidden = reviews.length < 2;
    const all = element('a', 'cr-all'); all.href = mapsUrl; all.target = '_blank'; all.rel = 'noopener noreferrer';
    const status = element('span', 'cr-sr-only'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); status.setAttribute('aria-atomic', 'true');
    controls.append(group, all, status); wrapper.append(controls); container.replaceChildren(wrapper);

    function cancel() { if (timer !== null) global.clearTimeout(timer); timer = null; }
    function positions() {
      if (!cards.length) return [];
      const maximum = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
      const first = cards[0].node.offsetLeft;
      const result = [];
      cards.forEach((card, cardIndex) => {
        const left = Math.max(0, Math.min(maximum, card.node.offsetLeft - first));
        if (!result.length || Math.abs(left - result[result.length - 1].left) > 1) result.push({ left, index: cardIndex });
      });
      return result;
    }
    function currentPosition(stops) {
      let nearest = 0;
      stops.forEach((stop, stopIndex) => { if (Math.abs(stop.left - carousel.scrollLeft) < Math.abs(stops[nearest].left - carousel.scrollLeft)) nearest = stopIndex; });
      return nearest;
    }
    function navigationPosition(stops) {
      if (!intendedStop || !stops.length) return currentPosition(stops);
      let nearest = 0;
      stops.forEach((stop, stopIndex) => { if (Math.abs(stop.index - intendedStop.index) < Math.abs(stops[nearest].index - intendedStop.index)) nearest = stopIndex; });
      return nearest;
    }
    function sync(stopIndex) {
      const stops = positions();
      if (!stops.length) return;
      const selected = stopIndex === undefined ? navigationPosition(stops) : Math.max(0, Math.min(stops.length - 1, stopIndex));
      index = stops[selected].index;
      const width = cards[0].node.getBoundingClientRect().width;
      const gap = cards.length > 1 ? Math.max(0, cards[1].node.offsetLeft - cards[0].node.offsetLeft - width) : 0;
      const visible = Math.max(1, Math.floor((carousel.clientWidth + gap) / (width + gap) + .02));
      const last = Math.min(reviews.length, index + visible);
      const range = last > index + 1 ? (index + 1) + '–' + last : String(index + 1);
      position.textContent = range + ' ' + text[lang].of + ' ' + reviews.length;
      previous.disabled = selected === 0; next.disabled = selected === stops.length - 1;
      group.hidden = stops.length < 2;
      cards.forEach((card, itemIndex) => card.node.setAttribute('aria-label', (itemIndex + 1) + ' ' + text[lang].of + ' ' + reviews.length));
    }
    function schedule() {
      cancel();
      if (!destroyed && positions().length > 1 && autoplay && !motion.matches && !hover && !focused && !interacting && onscreen && !document.hidden) timer = global.setTimeout(() => {
        const stops = positions(); show((navigationPosition(stops) + 1) % stops.length, false);
      }, 7200);
    }
    function playbackLabel() { toggle.hidden = motion.matches; toggle.textContent = autoplay ? 'Ⅱ' : '▶'; toggle.setAttribute('aria-label', autoplay ? text[lang].pause : text[lang].play); toggle.title = toggle.getAttribute('aria-label'); }
    function show(value, manual) {
      const stops = positions(); if (!stops.length) return;
      const selected = Math.max(0, Math.min(stops.length - 1, value));
      const left = stops[selected].left;
      intendedStop = { index: stops[selected].index, left };
      if (carousel.scrollTo) carousel.scrollTo({ left, behavior: motion.matches ? 'auto' : 'smooth' });
      else carousel.scrollLeft = left;
      sync(selected);
      if (manual) status.textContent = (index + 1) + ' ' + text[lang].of + ' ' + reviews.length + ': ' + reviews[index].authorName;
      schedule();
    }
    function update(change) {
      if (destroyed) return;
      if (change?.leadId && String(change.leadId) !== leadId || change?.cid && String(change.cid) !== cid) { controller.destroy(); throw new RangeError('Cannot reuse reviews for a different business'); }
      lang = language(change?.lang || lang); wrapper.lang = lang; heading.textContent = text[lang].heading;
      const ratingLabel = new Intl.NumberFormat(lang, { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(business.rating);
      aggregateRating.textContent = ratingLabel; aggregateCount.textContent = business.reviewCount + ' ' + text[lang].reviewCount;
      aggregate.setAttribute('aria-label', ratingLabel + ' ' + text[lang].rating + ', ' + business.reviewCount + ' ' + text[lang].reviewCount + '. ' + text[lang].google);
      aggregate.title = text[lang].observed + ' ' + String(business.observedAt).slice(0, 10);
      previous.setAttribute('aria-label', text[lang].previous); next.setAttribute('aria-label', text[lang].next); all.textContent = text[lang].google + ' ↗';
      carousel.setAttribute('aria-label', text[lang].region);
      cards.forEach(card => card.refresh()); playbackLabel(); sync(); schedule();
      if (status.textContent && reviews.length) status.textContent = (index + 1) + ' ' + text[lang].of + ' ' + reviews.length + ': ' + reviews[index].authorName;
    }
    listen(previous, 'click', () => show(navigationPosition(positions()) - 1, true)); listen(next, 'click', () => show(navigationPosition(positions()) + 1, true));
    listen(carousel, 'scroll', () => {
      const stops = positions();
      if (intendedStop && stops.length && Math.abs(stops[navigationPosition(stops)].left - carousel.scrollLeft) <= 1.5) intendedStop = null;
      sync(); schedule();
    });
    listen(carousel, 'scrollend', () => { intendedStop = null; sync(); schedule(); });
    listen(carousel, 'keydown', event => {
      if (event.target !== carousel || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault(); const stops = positions();
      const selected = event.key === 'Home' ? 0 : event.key === 'End' ? stops.length - 1 : navigationPosition(stops) + (event.key === 'ArrowLeft' ? -1 : 1);
      show(selected, true);
    });
    listen(carousel, 'pointerdown', () => { intendedStop = null; interacting = true; sync(); cancel(); });
    listen(carousel, 'wheel', () => { intendedStop = null; sync(); });
    listen(carousel, 'pointerup', () => { interacting = false; schedule(); });
    listen(carousel, 'pointercancel', () => { interacting = false; schedule(); });
    listen(carousel, 'pointerleave', () => { interacting = false; schedule(); });
    listen(toggle, 'click', () => { autoplay = !autoplay; playbackLabel(); schedule(); });
    listen(wrapper, 'mouseenter', () => { hover = true; cancel(); }); listen(wrapper, 'mouseleave', () => { hover = false; schedule(); });
    listen(wrapper, 'focusin', () => { focused = true; cancel(); }); listen(wrapper, 'focusout', event => { if (!wrapper.contains(event.relatedTarget)) { focused = false; schedule(); } });
    listen(document, 'visibilitychange', schedule);
    if (motion.addEventListener) listen(motion, 'change', () => { playbackLabel(); schedule(); });
    let observer = null;
    if (global.IntersectionObserver) { observer = new global.IntersectionObserver(entries => { onscreen = entries[0]?.isIntersecting ?? true; schedule(); }, { threshold: .05 }); observer.observe(wrapper); }
    const resize = () => {
      cards.forEach(card => card.measure());
      const stops = positions();
      if (intendedStop && stops.length) {
        const stop = stops[navigationPosition(stops)];
        if (Math.abs(stop.left - intendedStop.left) > 1.5) {
          intendedStop = { index: stop.index, left: stop.left };
          if (carousel.scrollTo) carousel.scrollTo({ left: stop.left, behavior: motion.matches ? 'auto' : 'smooth' });
          else carousel.scrollLeft = stop.left;
        }
      }
      sync(); schedule();
    };
    let sizeObserver = null;
    if (global.ResizeObserver) { sizeObserver = new global.ResizeObserver(resize); sizeObserver.observe(carousel); cards.forEach(card => sizeObserver.observe(card.quote)); }
    else if (global.addEventListener) listen(global, 'resize', resize);
    const controller = { leadId, cid, update, destroy() { if (destroyed) return; destroyed = true; cancel(); cleanup.forEach(remove => remove()); observer?.disconnect(); sizeObserver?.disconnect(); if (instances.get(container) === controller) instances.delete(container); container.replaceChildren(); }, getState() { return { leadId, cid, lang, index, count: reviews.length, autoplay: autoplay && !motion.matches, paused: hover || focused || interacting || !onscreen || document.hidden, intervalMs: 7200 }; } };
    instances.set(container, controller); update({ lang }); return controller;
  }

  global.CampaignReviews = Object.freeze({ mount });
})(window);
