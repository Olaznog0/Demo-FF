(function () {
  const reviews = [
    { initials: 'AK', image: 'assets/g1.jpg', name: 'Ali K.', stars: '★★★★★', nl: 'Super geholpen! Duidelijke uitleg, vooraf een prijsafspraak en de auto stond dezelfde dag weer klaar.', en: 'Great service! Clear explanation, upfront price agreement and the car was ready the same day.' },
    { initials: 'MD', image: 'assets/g2.jpg', name: 'Murat D.', stars: '★★★★★', nl: 'Na een storingsmelding kon ik snel terecht. Probleem professioneel opgespoord en opgelost zonder onnodige kosten.', en: 'After a warning light came on I could come in quickly. The problem was diagnosed and fixed professionally without unnecessary costs.' },
    { initials: 'SR', image: 'assets/g3.jpg', name: 'Sofia R.', stars: '★★★★★', nl: 'Vriendelijke mensen en eerlijk advies. Mijn auto rijdt weer als nieuw en ik weet precies wat er gedaan is.', en: 'Friendly people and honest advice. My car drives like new again and I know exactly what has been done.' },
    { initials: 'JV', image: 'assets/g4.jpg', name: 'J. de Vries', stars: '★★★★☆', nl: 'Snelle service en duidelijke communicatie. Er werd meegedacht over wat direct nodig was en wat kon wachten.', en: 'Fast service and clear communication. They thought along with what had to be done immediately and what could wait.' },
    { initials: 'AR', image: 'assets/g5.jpg', name: 'A. Rahman', stars: '★★★★★', nl: 'Eerlijke prijzen en goede uitleg. Geen onnodige reparaties, alleen wat echt nodig is.', en: 'Fair prices and good explanations. No unnecessary repairs, only what is really needed.' },
    { initials: 'MK', image: 'assets/g6.jpg', name: 'M. Koster', stars: '★★★★★', nl: 'Altijd snel geholpen en flexibel in het plannen. Een vaste garage waar je op kunt vertrouwen.', en: 'Always helped quickly and flexible with planning. A regular garage you can rely on.' }
  ];

  const state = { page: 0, perPage: window.innerWidth >= 720 ? 3 : 1, timer: null };

  function lang() { return window.__SITE_LANG__ || 'nl'; }
  function dict() { return window.__SITE_I18N__ || {}; }
  function maxPage() { return Math.ceil(reviews.length / state.perPage) - 1; }
  function currentSlice() {
    const start = state.page * state.perPage;
    return reviews.slice(start, start + state.perPage);
  }

  function renderReviews() {
  const list = document.getElementById('review-list');
  if (!list) return;
  list.innerHTML = '';

  currentSlice().forEach((review) => {
    const card = document.createElement('article');
    card.className = 'review-card is-visible';

    card.innerHTML = `
      <div class="review-header">
        ${
          review.image
            ? `<img src="${review.image}" alt="${review.name}" style="width:36px;height:36px;border-radius:999px;object-fit:cover;flex-shrink:0;">`
            : `<div class="review-avatar" data-initials="${review.initials}"></div>`
        }
        <div>
          <p class="review-name">${review.name}</p>
          <p class="review-meta">${dict()['reviews.metaRecent'] || ''}</p>
        </div>
        <div class="review-stars">${review.stars}</div>
      </div>
      <p class="review-text">${lang() === 'en' ? review.en : review.nl}</p>`;

    list.appendChild(card);
  });
}

  function next() {
    state.page = state.page >= maxPage() ? 0 : state.page + 1;
    renderReviews();
  }

  function prev() {
    state.page = state.page <= 0 ? maxPage() : state.page - 1;
    renderReviews();
  }

  function bind() {
    document.getElementById('reviewsNext')?.addEventListener('click', () => { next(); resetTimer(); });
    document.getElementById('reviewsPrev')?.addEventListener('click', () => { prev(); resetTimer(); });
    document.getElementById('contactForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      window.alert(dict()['contact.form.alert'] || '');
    });
    window.addEventListener('resize', () => {
      const nextPerPage = window.innerWidth >= 720 ? 3 : 1;
      if (nextPerPage !== state.perPage) {
        state.perPage = nextPerPage;
        state.page = 0;
        renderReviews();
      }
    });
  }

  function resetTimer() {
    clearInterval(state.timer);
    state.timer = setInterval(next, 5000);
  }

  function init() {
    if (!document.getElementById('review-list')) return;
    renderReviews();
    bind();
    resetTimer();
  }

  document.addEventListener('site:lang-ready', renderReviews);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();