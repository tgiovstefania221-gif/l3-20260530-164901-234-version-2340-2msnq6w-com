(function () {
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function initMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      const hidden = menu.hasAttribute('hidden');
      if (hidden) {
        menu.removeAttribute('hidden');
        toggle.setAttribute('aria-expanded', 'true');
      } else {
        menu.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function normalize(text) {
    return (text || '').toLowerCase();
  }

  function filterCards(input, container) {
    const q = normalize(input.value.trim());
    const cards = $$('[data-movie-card]', container);
    cards.forEach((card) => {
      const hay = normalize(card.getAttribute('data-keywords') || card.textContent);
      const visible = !q || hay.includes(q);
      card.style.display = visible ? '' : 'none';
    });
    const count = container.querySelector('[data-result-count]');
    if (count) {
      const visibleCount = cards.filter((card) => card.style.display !== 'none').length;
      count.textContent = String(visibleCount);
    }
  }

  function initSearch() {
    $$('[data-search-form]').forEach((form) => {
      const input = form.querySelector('[data-search-input]');
      const container = document.querySelector(form.getAttribute('data-target')) || document;
      if (!input) return;

      input.addEventListener('input', () => filterCards(input, container));
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        filterCards(input, container);
        const target = document.querySelector(form.getAttribute('data-target'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      const params = new URLSearchParams(location.search);
      const q = params.get('q');
      if (q && !input.value) {
        input.value = q;
        filterCards(input, container);
      }
    });
  }

  function initHlsPlayer() {
    $$('video[data-hls-src]').forEach((video) => {
      const src = video.getAttribute('data-hls-src');
      if (!src) return;
      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        video.dataset.bound = 'true';
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.dataset.bound = 'true';
      } else {
        const hint = video.parentElement && video.parentElement.querySelector('[data-player-hint]');
        if (hint) {
          hint.textContent = '当前浏览器不支持 HLS 自动绑定，但可尝试直接打开源地址。';
        }
      }
    });
  }

  function initHeroSlider() {
    const root = document.querySelector('[data-hero-slider]');
    if (!root) return;
    const slides = $$('.hero-slide', root);
    const thumbs = $$('[data-hero-thumb]', root);
    if (!slides.length) return;
    let index = 0;
    const activate = (next) => {
      slides.forEach((slide, i) => {
        slide.classList.toggle('is-active', i === next);
      });
      thumbs.forEach((thumb, i) => {
        thumb.classList.toggle('is-active', i === next);
      });
      index = next;
    };
    thumbs.forEach((thumb, i) => thumb.addEventListener('click', () => activate(i)));
    activate(0);
    window.setInterval(() => activate((index + 1) % slides.length), 5000);
  }

  function initScrollTop() {
    const btn = document.querySelector('[data-scroll-top]');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('show', window.scrollY > 500);
    });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    initSearch();
    initHlsPlayer();
    initHeroSlider();
    initScrollTop();
  });
})();
