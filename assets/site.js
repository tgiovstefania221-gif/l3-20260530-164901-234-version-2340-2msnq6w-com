(function() {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function() {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    if (prev) {
      prev.addEventListener('click', function() {
        showSlide(current - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        showSlide(current + 1);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function() {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var sortSelect = document.querySelector('[data-sort-select]');
  var grid = document.querySelector('[data-card-grid]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function getCards() {
    if (!grid) {
      return [];
    }
    return Array.prototype.slice.call(grid.querySelectorAll('.movie-card, .horizontal-card'));
  }

  function cardText(card) {
    return normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-tags'),
      card.getAttribute('data-year'),
      card.getAttribute('data-region'),
      card.getAttribute('data-category'),
      card.textContent
    ].join(' '));
  }

  function applyFilters() {
    var query = filterInput ? normalize(filterInput.value) : '';
    var year = yearFilter ? normalize(yearFilter.value) : '';
    getCards().forEach(function(card) {
      var matchesQuery = !query || cardText(card).indexOf(query) !== -1;
      var matchesYear = !year || normalize(card.getAttribute('data-year')) === year;
      card.classList.toggle('is-hidden', !(matchesQuery && matchesYear));
    });
  }

  function applySort() {
    if (!grid || !sortSelect) {
      return;
    }
    var cards = getCards();
    var value = sortSelect.value;
    if (value === 'year-desc') {
      cards.sort(function(a, b) {
        return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
      });
    }
    if (value === 'title-asc') {
      cards.sort(function(a, b) {
        return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-Hans-CN');
      });
    }
    if (value !== 'default') {
      cards.forEach(function(card) {
        grid.appendChild(card);
      });
    }
    applyFilters();
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilters);
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', applyFilters);
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', applySort);
  }
})();
