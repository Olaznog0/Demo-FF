(function () {
  function getLang() {
    const params = new URLSearchParams(window.location.search);
    return params.get('lang') === 'en' ? 'en' : 'nl';
  }

  function withLang(href, lang) {
    const [basePart, hashPart] = href.split('#');
    const base = basePart || (window.location.pathname.split('/').pop() || 'index.html');
    const isAnchorOnly = href.startsWith('#');
    const path = isAnchorOnly ? (window.location.pathname.split('/').pop() || 'index.html') : base;
    const url = new URL(path, window.location.href);
    url.searchParams.set('lang', lang);
    return `${url.pathname.split('/').pop()}${url.search}${hashPart ? '#' + hashPart : ''}`;
  }

  function renderShell() {
    const headerTarget = document.getElementById('siteHeader');
    const footerTarget = document.getElementById('siteFooter');
    if (!headerTarget || !footerTarget) return;

    const lang = getLang();
    document.documentElement.lang = lang;
    const page = document.documentElement.dataset.page || 'home';
    const labels = {
      nl: { services: 'Diensten', reviews: 'Reviews', booking: 'Afspraken', faq: 'FAQ', contact: 'Contact', cta: 'Plan afspraak' },
      en: { services: 'Services', reviews: 'Reviews', booking: 'Booking', faq: 'FAQ', contact: 'Contact', cta: 'Book now' }
    }[lang];

    const current = window.location.pathname.split('/').pop() || 'index.html';

    headerTarget.innerHTML = `
      <header class="site-header">
        <div class="container header-inner">
          <a href="${withLang('index.html', lang)}" class="brand" aria-label="FF Car Service Electronics home">
            <img src="assets/logo.jpg" alt="FF Car Service Electronics logo" class="brand-logo" />
            <div class="brand-text">
              <span class="brand-name">F&amp;F Car Service</span>
              <span class="brand-sub">Electronics • Voorburg</span>
            </div>
          </a>
          <nav class="main-nav" aria-label="Hoofd navigatie">
            <a href="${withLang('index.html#services', lang)}">${labels.services}</a>
            <a href="${withLang('index.html#reviews', lang)}">${labels.reviews}</a>
            <a href="${withLang('booking.html', lang)}" class="${page === 'booking' ? 'is-active' : ''}">${labels.booking}</a>
            <a href="${withLang('faq.html', lang)}" class="${page === 'faq' ? 'is-active' : ''}">${labels.faq}</a>
            <a href="${withLang('index.html#contact', lang)}">${labels.contact}</a>
          </nav>
          <div class="header-actions">
            <div class="lang-switch" aria-label="Taal kiezen">
              <a class="lang-btn ${lang === 'nl' ? 'is-active' : ''}" href="${withLang(current + window.location.hash, 'nl')}"><span class="flag">🇳🇱</span><span class="lang-label">NL</span></a>
              <a class="lang-btn ${lang === 'en' ? 'is-active' : ''}" href="${withLang(current + window.location.hash, 'en')}"><span class="flag">🇬🇧</span><span class="lang-label">EN</span></a>
            </div>
            <a href="${withLang(page === 'home' ? '#contact' : 'booking.html', lang)}" class="btn btn-primary desktop-cta">${labels.cta}</a>
            <button type="button" class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Open menu">☰</button>
          </div>
        </div>
        <div class="mobile-menu" id="mobileMenu">
          <div class="container mobile-menu-inner">
            <a href="${withLang('index.html#services', lang)}">${labels.services}</a>
            <a href="${withLang('index.html#reviews', lang)}">${labels.reviews}</a>
            <a href="${withLang('booking.html', lang)}" class="${page === 'booking' ? 'is-active' : ''}">${labels.booking}</a>
            <a href="${withLang('faq.html', lang)}" class="${page === 'faq' ? 'is-active' : ''}">${labels.faq}</a>
            <a href="${withLang('index.html#contact', lang)}">${labels.contact}</a>
          </div>
        </div>
      </header>`;

    footerTarget.innerHTML = `
      <footer class="site-footer">
        <div class="container footer-inner">
          <p class="footer-text">${lang === 'en' ? 'Demo website concept for F&F Car Service Electronics.' : 'Demo websiteconcept voor F&F Car Service Electronics.'}</p>
          <p class="footer-text">${lang === 'en' ? 'Ready for bilingual content and a future booking module.' : 'Klaar voor meertaligheid en een toekomstige online afsprakenmodule.'}</p>
        </div>
      </footer>`;

    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener('click', () => mobileMenu.classList.toggle('is-open'));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderShell);
  } else {
    renderShell();
  }
})();