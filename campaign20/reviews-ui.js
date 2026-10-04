/* Shared, identity-checked Google review carousel for the private campaign. */
(function (global) {
  'use strict';
  const instances = new WeakMap();
  const text = {
    en: { heading: 'What people say.', region: 'Google customer reviews', previous: 'Previous review', next: 'Next review', pause: 'Pause automatic reviews', play: 'Play reviews automatically', translated: 'Translated from Dutch', original: 'Show original', back: 'Show translation', google: 'Read all reviews on Google', rating: 'out of 5', reviewCount: 'Google reviews', of: 'of', unavailable: 'Read customer reviews on Google', profile: 'Google reviewer profile photo', observed: 'Google information observed on' },
    nl: { heading: 'Wat klanten vertellen.', region: 'Klantbeoordelingen op Google', previous: 'Vorige beoordeling', next: 'Volgende beoordeling', pause: 'Automatisch afspelen pauzeren', play: 'Beoordelingen automatisch afspelen', translated: 'Vertaald uit het Nederlands', original: 'Origineel tonen', back: 'Vertaling tonen', google: 'Lees alle beoordelingen op Google', rating: 'van 5', reviewCount: 'Google-beoordelingen', of: 'van', unavailable: 'Lees klantbeoordelingen op Google', profile: 'Profielfoto van de Google-beoordelaar', observed: 'Google-informatie waargenomen op' }
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
      .campaign-reviews{color:var(--ink,#162e41);font-family:inherit;max-width:1100px;margin-inline:auto;min-width:0}
      .cr-heading-row{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-block-end:25px;flex-wrap:wrap}
      .cr-heading{font:inherit;font-size:clamp(27px,3.2vw,42px);font-weight:700;line-height:1.15;letter-spacing:-.035em;margin:0;min-height:1.2em}
      .cr-aggregate{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:17px;line-height:1.6;color:inherit;text-decoration:none}
      .cr-aggregate:hover{text-decoration:underline;text-underline-offset:4px}.cr-aggregate strong{font-size:22px}
      .cr-aggregate-count{color:var(--muted,#45596b)}.cr-google-letter{font-weight:800;font-size:24px;color:var(--ink,#162e41)}
      .cr-carousel{display:grid;min-height:20rem;min-width:0;border:1px solid var(--line,#d5dce1);border-radius:20px;background:var(--paper,#fff);overflow:hidden}
      .cr-card{grid-area:1/1;padding:clamp(22px,4vw,42px);min-width:0;box-sizing:border-box;visibility:hidden;pointer-events:none}
      .cr-card.is-active{visibility:visible;pointer-events:auto}.cr-author-row{display:flex;align-items:center;gap:15px;min-height:62px}
      .cr-avatar{display:grid;place-items:center;flex:0 0 58px;width:58px;height:58px;border-radius:50%;overflow:hidden;background:var(--ink,#162e41);color:var(--paper,#fff);font-size:19px;font-weight:700}
      .cr-avatar img{width:100%;height:100%;object-fit:cover;display:block}.cr-author-details{min-width:0}.cr-author{font-size:18px;font-weight:700;line-height:1.35;color:inherit;text-decoration:none;overflow-wrap:anywhere}.cr-author[href]:hover{text-decoration:underline;text-underline-offset:3px}
      .cr-date{display:block;font-size:15px;color:var(--muted,#45596b);line-height:1.5;margin-top:3px}.cr-stars{color:var(--ink,#162e41);font-size:20px;letter-spacing:4px;line-height:1;margin-block-start:18px}
      .cr-quote{font-size:clamp(19px,2vw,24px);font-weight:400;line-height:1.6;letter-spacing:-.01em;margin:18px 0 15px;min-block-size:3.2em;overflow-wrap:break-word}
      .cr-translation{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-height:30px;font-size:14px;color:var(--muted,#45596b)}.cr-original{font:inherit;color:var(--ink,#162e41);background:none;border:0;border-bottom:1px solid var(--line,#d5dce1);padding:4px 0;cursor:pointer;text-underline-offset:3px;min-height:30px}
      .cr-controls{display:flex;align-items:center;justify-content:space-between;gap:15px;flex-wrap:wrap;margin-top:18px}.cr-control-group{display:flex;align-items:center;gap:9px}.cr-button{display:inline-grid;place-items:center;width:46px;height:46px;border:1px solid var(--line,#d5dce1);border-radius:50%;background:var(--paper,#fff);color:var(--ink,#162e41);font:inherit;font-size:20px;cursor:pointer;transition:transform .18s ease}.cr-button:hover{transform:translateY(-2px)}.cr-button[hidden],.cr-control-group[hidden]{display:none}
      .cr-position{font-size:15px;color:var(--muted,#45596b);min-width:60px;text-align:center}.cr-all{font-size:16px;line-height:1.5;color:inherit;text-decoration:underline;text-underline-offset:4px}.campaign-reviews :focus-visible{outline:3px solid var(--accent,#2563eb);outline-offset:4px}
      .cr-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
      @media(max-width:600px){.cr-heading-row{display:block}.cr-heading{min-height:2.3em;font-size:32px}.cr-aggregate{margin-top:10px;font-size:16px}.cr-card{padding:23px}.cr-quote{font-size:20px;line-height:1.55;min-block-size:6.2em}.cr-carousel{min-height:21rem}.cr-controls{gap:18px}.cr-author{font-size:17px}.cr-all{font-size:15px}}
      @media(prefers-reduced-motion:reduce){.cr-button{transition:none}.cr-button:hover{transform:none}}
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
    const reviews = business.reviews.filter(review => review.authorName && review.text && Number.isFinite(review.rating) && review.rating >= 1 && review.rating <= 5);
    let lang = language(context.lang), index = 0, autoplay = true, hover = false, focused = false, onscreen = true, timer = null, destroyed = false;
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
    const googleLetter = element('span', 'cr-google-letter', 'G'); googleLetter.setAttribute('aria-hidden', 'true');
    const aggregateRating = element('strong'); const aggregateCount = element('span', 'cr-aggregate-count');
    aggregate.append(googleLetter, aggregateRating, aggregateCount); row.append(heading, aggregate); wrapper.append(row);
    const carousel = element('div', 'cr-carousel'); carousel.setAttribute('aria-live', 'off');
    const cards = reviews.map(review => {
      const card = element('article', 'cr-card'); card.setAttribute('role', 'group'); card.setAttribute('aria-roledescription', 'slide');
      const authorRow = element('div', 'cr-author-row'); const avatar = element('span', 'cr-avatar');
      const initialText = initials(review.authorName); const photo = safePhoto(review.photoUrl);
      let image = null;
      if (photo) { image = element('img'); image.src = photo; image.width = 58; image.height = 58; image.loading = 'lazy'; image.decoding = 'async'; image.referrerPolicy = 'no-referrer'; image.addEventListener('error', () => { avatar.replaceChildren(document.createTextNode(initialText)); }, { once: true }); avatar.append(image); }
      else { avatar.textContent = initialText; avatar.setAttribute('aria-hidden', 'true'); }
      const authorDetails = element('div', 'cr-author-details'); const authorUrl = safeAuthor(review.authorUrl); const author = element(authorUrl ? 'a' : 'span', 'cr-author', review.authorName);
      if (authorUrl) { author.href = authorUrl; author.target = '_blank'; author.rel = 'noopener noreferrer'; }
      const date = element('span', 'cr-date'); authorDetails.append(author, date); authorRow.append(avatar, authorDetails);
      const stars = element('div', 'cr-stars', '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating));
      stars.setAttribute('role', 'img');
      const quote = element('blockquote', 'cr-quote'); const translation = element('div', 'cr-translation'); const translatedLabel = element('span'); const original = element('button', 'cr-original'); original.type = 'button';
      let originalShown = false;
      const refresh = () => {
        const copy = text[lang]; const hasTranslation = lang !== review.originalLanguage && !!review.translations?.[lang];
        quote.textContent = originalShown || !hasTranslation ? (review.displayText || review.text) : review.translations[lang];
        quote.lang = originalShown || !hasTranslation ? (review.originalLanguage || 'nl') : lang;
        date.textContent = review.publishedLabels?.[lang] || review.publishedLabel || '';
        stars.setAttribute('aria-label', review.rating + ' ' + copy.rating);
        if (image) image.alt = review.authorName + ' — ' + copy.profile;
        translatedLabel.textContent = hasTranslation ? copy.translated : 'Google';
        original.hidden = !hasTranslation; original.textContent = originalShown ? copy.back : copy.original;
        original.setAttribute('aria-pressed', String(originalShown));
      };
      listen(original, 'click', () => { originalShown = !originalShown; refresh(); });
      translation.append(translatedLabel, original); card.append(authorRow, stars, quote, translation); carousel.append(card);
      return { node: card, refresh, resetOriginal: () => { originalShown = false; } };
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
    function schedule() {
      cancel();
      if (!destroyed && reviews.length > 1 && autoplay && !motion.matches && !hover && !focused && onscreen && !document.hidden) timer = global.setTimeout(() => show(index + 1, false), 7200);
    }
    function playbackLabel() { toggle.hidden = motion.matches; toggle.textContent = autoplay ? 'Ⅱ' : '▶'; toggle.setAttribute('aria-label', autoplay ? text[lang].pause : text[lang].play); toggle.title = toggle.getAttribute('aria-label'); }
    function show(value, manual) {
      if (!reviews.length) return;
      index = (value + reviews.length) % reviews.length;
      cards.forEach((card, itemIndex) => { const active = itemIndex === index; card.node.classList.toggle('is-active', active); card.node.inert = !active; card.node.setAttribute('aria-hidden', String(!active)); card.node.setAttribute('aria-label', (itemIndex + 1) + ' ' + text[lang].of + ' ' + reviews.length); });
      position.textContent = (index + 1) + ' ' + text[lang].of + ' ' + reviews.length;
      if (manual) status.textContent = (index + 1) + ' ' + text[lang].of + ' ' + reviews.length + ': ' + reviews[index].authorName;
      schedule();
    }
    function update(change) {
      if (destroyed) return;
      if (change?.leadId && String(change.leadId) !== leadId || change?.cid && String(change.cid) !== cid) { controller.destroy(); throw new RangeError('Cannot reuse reviews for a different business'); }
      lang = language(change?.lang || lang); wrapper.lang = lang; heading.textContent = text[lang].heading;
      const ratingLabel = new Intl.NumberFormat(lang, { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(business.rating);
      aggregateRating.textContent = ratingLabel + ' / 5'; aggregateCount.textContent = '· ' + business.reviewCount + ' ' + text[lang].reviewCount;
      aggregate.setAttribute('aria-label', ratingLabel + ' ' + text[lang].rating + ', ' + business.reviewCount + ' ' + text[lang].reviewCount + '. ' + text[lang].google);
      aggregate.title = text[lang].observed + ' ' + String(business.observedAt).slice(0, 10);
      previous.setAttribute('aria-label', text[lang].previous); next.setAttribute('aria-label', text[lang].next); all.textContent = text[lang].google + ' ↗';
      cards.forEach(card => { card.resetOriginal(); card.refresh(); }); playbackLabel(); show(index, false);
      if (status.textContent && reviews.length) status.textContent = (index + 1) + ' ' + text[lang].of + ' ' + reviews.length + ': ' + reviews[index].authorName;
    }
    listen(previous, 'click', () => show(index - 1, true)); listen(next, 'click', () => show(index + 1, true));
    listen(toggle, 'click', () => { autoplay = !autoplay; playbackLabel(); schedule(); });
    listen(wrapper, 'mouseenter', () => { hover = true; cancel(); }); listen(wrapper, 'mouseleave', () => { hover = false; schedule(); });
    listen(wrapper, 'focusin', () => { focused = true; cancel(); }); listen(wrapper, 'focusout', event => { if (!wrapper.contains(event.relatedTarget)) { focused = false; schedule(); } });
    listen(document, 'visibilitychange', schedule);
    if (motion.addEventListener) listen(motion, 'change', () => { playbackLabel(); schedule(); });
    let observer = null;
    if (global.IntersectionObserver) { observer = new global.IntersectionObserver(entries => { onscreen = entries[0]?.isIntersecting ?? true; schedule(); }, { threshold: .05 }); observer.observe(wrapper); }
    const controller = { leadId, cid, update, destroy() { if (destroyed) return; destroyed = true; cancel(); cleanup.forEach(remove => remove()); observer?.disconnect(); if (instances.get(container) === controller) instances.delete(container); container.replaceChildren(); }, getState() { return { leadId, cid, lang, index, count: reviews.length, autoplay: autoplay && !motion.matches, paused: hover || focused || !onscreen || document.hidden, intervalMs: 7200 }; } };
    instances.set(container, controller); update({ lang }); return controller;
  }

  global.CampaignReviews = Object.freeze({ mount });
})(window);
