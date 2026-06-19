(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileMenu = document.querySelector(".mobile-menu");

    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("open");
      });
    }

    document.addEventListener("error", function (event) {
      if (event.target && event.target.tagName === "IMG") {
        event.target.classList.add("is-missing");
      }
    }, true);

    document.querySelectorAll(".quick-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var keyword = input ? input.value.trim() : "";
        var prefix = form.getAttribute("data-prefix") || "./";
        var url = prefix + "search.html";
        if (keyword) {
          url += "?q=" + encodeURIComponent(keyword);
        }
        window.location.href = url;
      });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var index = 0;
      var timer = null;

      function show(next) {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
          slide.classList.toggle("active", current === index);
        });
        dots.forEach(function (dot, current) {
          dot.classList.toggle("active", current === index);
        });
      }

      function start() {
        clearInterval(timer);
        timer = setInterval(function () {
          show(index + 1);
        }, 4600);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-slide")) || 0);
          start();
        });
      });

      show(0);
      start();
    }

    var filterForm = document.querySelector(".filter-form");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-results .movie-card"));

    if (filterForm && cards.length) {
      var params = new URLSearchParams(window.location.search);
      var keywordInput = filterForm.querySelector("input[name='keyword']");
      if (keywordInput && params.get("q")) {
        keywordInput.value = params.get("q");
      }

      function normalize(value) {
        return String(value || "").toLowerCase();
      }

      function applyFilters() {
        var keyword = normalize(keywordInput ? keywordInput.value : "");
        var region = filterForm.querySelector("select[name='region']");
        var year = filterForm.querySelector("select[name='year']");
        var genre = filterForm.querySelector("select[name='genre']");
        var regionValue = region ? region.value : "";
        var yearValue = year ? year.value : "";
        var genreValue = genre ? genre.value : "";

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags"),
            card.textContent
          ].join(" "));
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchRegion = !regionValue || card.getAttribute("data-region") === regionValue;
          var matchYear = !yearValue || card.getAttribute("data-year") === yearValue;
          var matchGenre = !genreValue || (card.getAttribute("data-genre") || "").indexOf(genreValue) !== -1;
          card.classList.toggle("hidden-by-filter", !(matchKeyword && matchRegion && matchYear && matchGenre));
        });
      }

      filterForm.addEventListener("input", applyFilters);
      filterForm.addEventListener("change", applyFilters);
      filterForm.addEventListener("reset", function () {
        setTimeout(applyFilters, 0);
      });
      applyFilters();
    }
  });
})();
