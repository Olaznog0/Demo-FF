(function () {
  'use strict';
  if (!window.Site) return;
  const S = window.Site;
  const C = window.SiteCore;
  const { config: c, t, l, h, link, lang } = S;
  const main = document.getElementById('main');
  const carousels = [];
  const external = (url, label, cls = 'text-link') => C.safeUrl(url)
    ? `<a class="${cls}" href="${h(C.safeUrl(url))}" target="_blank" rel="noopener noreferrer">${h(label)} <span aria-hidden="true">↗</span></a>` : '';
  const call = (cls = 'button outline') => c.business.phone
    ? `<a class="${cls}" href="tel:${h(c.business.phone)}">${h(t('call'))} <span aria-hidden="true">↗</span></a>` : '';
  const book = (cls = 'button') => `<a class="${cls}" href="${h(link('booking.html'))}" target="_blank" rel="noopener noreferrer">${h(t('book'))}<span aria-hidden="true">↗</span></a>`;
  function rating(compact = false) {
    if (!c.proof) return '';
    const value = new Intl.NumberFormat(C.locale(lang), { minimumFractionDigits: 1 }).format(c.proof.rating);
    const checked = new Intl.DateTimeFormat(C.locale(lang), { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(c.proof.checked + 'T12:00:00'));
    return `<a class="rating ${compact ? 'rating-compact' : ''}" href="${h(C.safeUrl(c.business.mapsUrl))}" target="_blank" rel="noopener noreferrer"><span class="rating-score">${value}<span class="rating-stars" aria-hidden="true">★★★★★</span></span><span><strong>${c.proof.count} ${h(t('reviewsCount'))}</strong><small>${h(t('ratingSource'))} ${checked}</small></span></a>`;
  }
  function hero() {
    return `<section id="hero" class="hero"><div class="container"><div class="jumbotron"><img id="heroImage" class="hero-image" src="${h(c.images.hero)}" alt="${h(t('photoConcept'))}" width="1536" height="1024" fetchpriority="high"><div class="hero-shade"></div><div class="hero-copy"><p class="eyebrow">${h(l(c.copy.eyebrow))}</p><h1>${h(l(c.copy.heroTitle)).replace(/\n/g, '<br>')}</h1><p class="hero-intro">${h(l(c.copy.heroIntro))}</p><div class="actions">${book('button light')}${call('button transparent')}</div></div><div class="hero-rating">${rating(true)}</div></div><div class="hero-bottom"><span><i aria-hidden="true">⌖</i>${h(c.business.address || c.business.locationLabel || '')}</span><a href="#services">${h(t('discover'))}<span aria-hidden="true">↓</span></a></div></div></section>`;
  }
  function services() {
    return `<section id="services" class="section services-section"><div class="container"><div class="section-head"><div><p class="eyebrow">${h(t('services'))}</p><h2>${h(l(c.copy.serviceTitle)).replace(/\n/g, '<br>')}</h2></div><p>${h(l(c.copy.serviceIntro))}</p></div><div class="service-grid ${c.servicePresentation === 'list' ? 'services-list' : ''}">${c.services.map((service, i) => `<article class="service-card"><div class="service-image-wrap"><img src="${h(service.image || c.images.service || c.images.hero)}" class="service-image service-image-${i}" alt="${h(t('conceptShort'))}" loading="lazy" width="640" height="480"></div><div class="service-card-copy"><h3>${h(l(service.title))}</h3><p>${h(l(service.description))}</p><p class="treatment-note">${h(t('treatmentNote'))}</p><a class="text-link" href="${h(link('booking.html') + '&service=' + encodeURIComponent(service.id))}" target="_blank" rel="noopener noreferrer">${h(t('book'))} <span aria-hidden="true">↗</span></a></div></article>`).join('')}</div></div></section>`;
  }
  function process() {
    return `<section class="process-section section"><div class="container process-layout"><div><p class="eyebrow">${h(t('booking'))}</p><h2>${h(t('howTitle'))}</h2><div class="actions">${book()}${call()}</div></div><div class="process-steps">${[1, 2, 3].map(i => `<article><div><h3>${h(t('how' + i))}</h3><p>${h(t('how' + i + 'Text'))}</p></div></article>`).join('')}</div></div></section>`;
  }
  function carousel(type, slides) {
    return `<div class="carousel ${type}-carousel" data-carousel role="region" aria-label="${h(t(type === 'review' ? 'reviewCarousel' : 'photoCarousel'))}"><div class="carousel-track" data-carousel-track tabindex="0">${slides}</div><div class="carousel-footer"><span class="carousel-position" data-carousel-progress></span><button class="carousel-autoplay" data-carousel-toggle type="button" aria-pressed="false">${h(t('carouselPlay'))}</button><div class="carousel-arrows"><button data-carousel-prev type="button" aria-label="${h(t('carouselPrevious'))}">←</button><button data-carousel-next type="button" aria-label="${h(t('carouselNext'))}">→</button></div></div></div>`;
  }
  function mountCarousels() {
    document.querySelectorAll('[data-carousel]').forEach(element => {
      if (element.dataset.mounted) return;
      element.dataset.mounted = 'true';
      carousels.push(window.SalonCarousel.mount(element, { playLabel: t('carouselPlay'), pauseLabel: t('carouselPause') }));
    });
  }
  function reviewFallback(message = 'connectionPending', retry = false) {
    return `<div class="review-fallback"><img src="assets/google-maps.svg" alt="Google Maps" width="98" height="18"><p>${h(t('reviewIntro'))}</p>${external(c.business.mapsUrl, t('allReviews'), 'button')}<p class="integration-note">${h(t(message))}</p>${retry ? `<button class="text-link" id="retryGoogle" type="button">${h(t('retry'))} ↻</button>` : ''}</div>`;
  }
  function reviews() {
    return `<section id="reviews" class="section google-section"><div class="container"><div class="section-head"><div><p class="eyebrow">${h(t('googleReviews'))}</p><h2>${h(t('reviewTitle'))}</h2></div>${rating()}</div><div class="google-layout"><div class="map-card"><iframe id="businessMap" title="${h(t('mapTitle') + ' · ' + c.name)}" src="${h(C.mapEmbed(c))}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe><div class="map-caption"><div><strong data-business-name>${h(c.name)}</strong><p data-business-address>${h(c.business.address)}</p></div>${external(c.business.mapsUrl, t('directions'))}</div></div><div id="googleReviews" aria-live="polite">${reviewFallback(c.google.enabled ? 'reviewLoading' : 'connectionPending')}</div></div><div id="googleAttribution" class="google-attribution" hidden translate="no"><img src="assets/google-maps.svg" alt="Google Maps" width="98" height="18"><span>${h(t('reviewOrder'))}</span></div></div></section>`;
  }
  function gallery() {
    const used = [c.images.hero, c.images.service, ...c.services.map(service => service.image)];
    const photos = C.uniquePhotos(c.images.inspiration || [], used, location.href);
    const slides = photos.map(photo => `<figure class="photo-slide"><img src="${h(photo.src)}" alt="${h(t('photoConcept'))}" loading="lazy" width="1000" height="750"></figure>`).join('');
    return `<section id="gallery" class="section gallery-section"${photos.length ? '' : ' hidden'}><div class="container"><div class="section-head"><div><p class="eyebrow" id="galleryEyebrow">${h(t('inspiration'))}</p><h2 id="galleryHeading">${h(t('inspirationTitle'))}</h2></div>${external(c.business.mapsUrl, t('openMaps'))}</div><div id="googlePhotos" class="photo-grid" data-photo-count="${photos.length}">${slides}</div></div></section>`;
  }
  function hours() {
    const formatter = new Intl.DateTimeFormat(C.locale(lang), { weekday: 'short' });
    return c.hours.length ? `<h3>${h(t('hours'))}</h3><dl class="hours-list">${c.hours.map(item => `<div><dt>${item.days.map(day => formatter.format(new Date(2026, 0, 4 + day))).join(', ')}</dt><dd>${item.closed ? h(t('closed')) : h(item.open) + '–' + h(item.close)}</dd></div>`).join('')}</dl><p class="fine-print">${h(t('hoursSource'))}</p>` : '';
  }
  function contact() {
    const whatsapp = c.whatsapp.enabled ? C.whatsappUrl(c.whatsapp.number, t('whatsappMessage')) : '';
    const form = '<div data-contact-widget></div>';
    return `<section id="contact" class="section contact-section"><div class="container"><div class="contact-title-row"><div><p class="eyebrow">${h(t('contact'))}</p><h2>${h(l(c.copy.contactTitle)).replace(/\n/g, '<br>')}</h2></div>${book('button light')}</div><div class="contact-layout"><div class="contact-info"><h3>${h(t('visitSalon'))}</h3><p class="contact-label">${h(t('address'))}</p><p data-business-address>${h(c.business.address)}</p>${external(c.business.mapsUrl, t('directions'))}<p class="contact-label">${h(t('phone'))}</p><a class="phone-link" href="tel:${h(c.business.phone)}">${h(c.business.phoneDisplay)}</a><div id="liveBusinessHours">${hours()}</div></div><div class="contact-form-container">${form}<div class="whatsapp-state">${whatsapp ? external(whatsapp, t('whatsapp'), 'button outline') : ''}</div></div></div></div></section>`;
  }
  function renderReview(review) {
    const author = review.author || { displayName: review.authorName, photoUri: review.profilePhotoUrl, uri: review.authorUri };
    const copy = C.reviewCopy(review, lang);
    const stars = Math.round(Math.max(0, Math.min(5, review.rating || 0)));
    const avatar = C.safeUrl(author.photoUri)
      ? `<img class="review-avatar" src="${h(C.safeUrl(author.photoUri))}" alt="${h(author.displayName || '')}" width="48" height="48" loading="lazy">`
      : `<span class="review-avatar review-initial" aria-hidden="true">${h((author.displayName || 'G').slice(0, 1))}</span>`;
    return `<article class="review-card" data-review-card="google"><div class="review-author">${avatar}<div>${external(author.uri, author.displayName || 'Google Maps', 'review-author-link') || `<strong class="review-author-link">${h(author.displayName || 'Google Maps')}</strong>`}<span class="review-date">${h(review.relativeDate || review.relativeTime || '')}</span></div></div><div class="review-score"><span class="review-stars" role="img" aria-label="${h(review.rating)} ${lang === 'nl' ? 'van' : 'out of'} 5"><span aria-hidden="true">${'★'.repeat(stars)}<span class="review-stars-empty">${'☆'.repeat(5 - stars)}</span></span></span><span class="review-score-value" aria-hidden="true">${h(review.rating)} / 5</span></div><blockquote class="review-text" lang="${h(copy.languageCode || lang)}">${h(copy.text)}</blockquote>${copy.translated ? `<p class="translated-note">${h(t(review.translationSource==='concept'?'translatedConcept':'translatedReview'))}</p><details class="original-review"><summary>${h(t('originalReview'))}</summary><p lang="${h(copy.sourceLanguage)}">${h(copy.originalText)}</p></details>` : ''}<footer class="review-source"><img class="review-google" src="assets/google-maps.svg" alt="Google Maps" width="98" height="18">${external(review.googleMapsUri || c.business.mapsUrl, t('readReview'))}</footer></article>`;
  }
  function syncBusiness(data) {
    if (!c.google.syncBusinessDetails) return;
    const previousMaps = c.business.mapsUrl;
    if (data.displayName) {
      c.name = data.displayName;
      document.querySelectorAll('.brand-name small,[data-business-name]').forEach(element => element.textContent = data.displayName);
      document.title = data.displayName + ' · ' + (c.business.city || '');
    }
    if (data.address) {
      c.business.address = data.address;
      document.querySelectorAll('[data-business-address]').forEach(element => element.textContent = data.address);
    }
    if (data.phone) {
      c.business.phone = data.phone;
      c.business.phoneDisplay = data.phone;
      document.querySelectorAll('a[href^="tel:"]').forEach(element => element.href = 'tel:' + data.phone.replace(/[^+0-9]/g, ''));
      document.querySelectorAll('.phone-link').forEach(element => element.textContent = data.phone);
    }
    if (C.safeUrl(data.googleMapsUri)) {
      c.business.mapsUrl = data.googleMapsUri;
      document.querySelectorAll('a').forEach(element => { if (element.href === previousMaps) element.href = data.googleMapsUri; });
    }
    if (Number.isFinite(data.rating) && Number.isFinite(data.count)) {
      c.proof = { rating: data.rating, count: data.count, checked: new Date().toISOString().slice(0, 10), source: 'Google Maps' };
      document.querySelectorAll('.rating').forEach(element => element.outerHTML = rating(element.classList.contains('rating-compact')));
    }
    const map = document.getElementById('businessMap');
    if (map) map.src = C.mapEmbed(c);
    if (data.hours?.length) {
      const box = document.getElementById('liveBusinessHours');
      if (box) box.innerHTML = `<h3>${h(t('hours'))}</h3><ul class="live-hours">${data.hours.map(text => `<li>${h(text)}</li>`).join('')}</ul><p class="fine-print" translate="no">Google Maps</p>`;
    }
  }
  async function loadGoogle() {
    if (!c.google.enabled || !document.getElementById('googleReviews')) return;
    const reviewsBox = document.getElementById('googleReviews');
    const snapshot = C.snapshotData(c, lang);
    const showSnapshot = () => {
      if (!snapshot?.reviews?.length) return false;
      const checked = new Intl.DateTimeFormat(C.locale(lang), { dateStyle: 'medium' }).format(new Date(snapshot.checked + 'T12:00:00Z'));
      reviewsBox.innerHTML = carousel('review', snapshot.reviews.map(renderReview).join('')) + '<p class="fine-print">Google Maps · ' + h(checked) + '</p>';
      document.getElementById('googleAttribution').hidden = false;
      mountCarousels();
      return true;
    };
    if (!showSnapshot()) reviewsBox.innerHTML = reviewFallback('reviewLoading');
    async function request(path) {
      const endpoint = new URL(path, location.origin);
      endpoint.searchParams.set('client', c.id);
      endpoint.searchParams.set('lang', lang);
      const response = await fetch(endpoint, { signal: AbortSignal.timeout(15000), credentials: 'same-origin' });
      if (!response.ok) throw new Error(response.status === 503 ? 'Pending' : 'Unavailable');
      return response.json();
    }
    const results = await Promise.allSettled([
      request(c.google.reviewsEndpoint || '/api/google-reviews'),
      c.google.photosEnabled ? request(c.google.endpoint || '/api/place') : Promise.resolve(null)
    ]);
    const reviewsResult = results[0];
    if (reviewsResult.status === 'fulfilled') {
      const data = reviewsResult.value;
      syncBusiness({ ...data, count: data.total ?? data.count, googleMapsUri: data.url || data.googleMapsUri });
      reviewsBox.innerHTML = data.reviews?.length ? carousel('review', data.reviews.map(renderReview).join('')) : reviewFallback('reviewEmpty');
      document.getElementById('googleAttribution').hidden = !data.reviews?.length;
      if (data.attributions?.length) {
        const attribution = document.createElement('p');
        attribution.className = 'fine-print';
        attribution.innerHTML = data.attributions.map(item => external(item.uri, item.provider || 'Google Maps')).join(' · ');
        reviewsBox.append(attribution);
      }
    } else if (!showSnapshot()) {
      const message = reviewsResult.reason?.message === 'Pending' ? 'connectionPending' : 'reviewError';
      reviewsBox.innerHTML = reviewFallback(message, true);
      document.getElementById('retryGoogle').addEventListener('click', loadGoogle);
    }
    const photosResult = results[1];
    if (photosResult.status === 'fulfilled' && photosResult.value) {
      const data = photosResult.value;
      syncBusiness(data);
      const photos = C.uniquePhotos(data.photos, [], location.href);
      if (photos.length && document.getElementById('googlePhotos')) {
        document.getElementById('gallery').hidden = false;
        document.getElementById('galleryEyebrow').textContent = t('googlePhotos');
        document.getElementById('galleryHeading').textContent = t('galleryTitle');
        const grid = document.getElementById('googlePhotos');
        grid.dataset.photoCount = String(photos.length);
        grid.innerHTML = photos.map(photo => `<figure class="photo-slide"><img src="${h(C.safeUrl(photo.url))}" alt="${h(t('photoAlt'))}" loading="lazy" width="1000" height="750"><figcaption>${(photo.authorAttributions || []).map(author => external(author.uri, author.displayName)).join(' · ')} ${external(photo.googleMapsUri, 'Google Maps')}</figcaption></figure>`).join('');
      }
    }
    mountCarousels();
  }
  const page = document.documentElement.dataset.page;
  if (page === 'home') {
    const blocks = { services, process, reviews, gallery, contact };
    main.innerHTML = hero() + c.sections.map(id => (id === 'contact' && c.sector && c.id !== 'ff' ? C.faqMarkup(c, lang) : '') + (blocks[id]?.() || '')).join('');
    main.insertAdjacentHTML('beforeend', `<div class="mobile-contact-bar">${call()}${book()}</div>`);
    mountCarousels();
  }
  if (page === 'faq') {
    main.innerHTML = `<section class="section subpage"><div class="container"><a class="text-link" href="${h(link('index.html'))}">← ${h(t('home'))}</a><p class="eyebrow">${h(c.name)}</p><h1>${h(t('faq'))}</h1><div class="faq-list">${c.faq.map(item => `<details><summary>${h(l(item.q))}</summary><p>${h(l(item.a))}</p></details>`).join('')}</div><div class="actions">${book()}${call()}</div></div></section>`;
  }
  window.ContactWidget?.mountAll({ client: c, lang });
  document.getElementById('whatsappDemo')?.addEventListener('click', () => {
    const preview = document.getElementById('whatsappPreview');
    preview.hidden = false;
    preview.textContent = t('whatsappMessage') + ' — ' + t('demoResult');
  });
  window.addEventListener('pagehide', () => carousels.forEach(carousel => carousel.destroy()));
  loadGoogle();
  if(page==='home'&&!c.concept?.fictional||page==='faq')window.LocaleBootstrap?.ready();
})();
