(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    setupMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
    setupPlayer();
  });

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupSearchForms() {
    var forms = document.querySelectorAll("[data-search-form]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var target = form.getAttribute("action") || "./search.html";
        window.location.href = value ? target + "?q=" + encodeURIComponent(value) : target;
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function setupFilters() {
    var root = document.querySelector("[data-filter-root]");
    var list = document.querySelector("[data-card-list]");
    if (!root || !list) {
      seedSearchPage();
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
    var search = root.querySelector("[data-live-search]");
    var region = root.querySelector("[data-filter-field='region']");
    var year = root.querySelector("[data-filter-field='year']");
    var sort = root.querySelector("[data-sort-field]");
    var empty = document.querySelector("[data-empty-state]");

    fillOptions(region, uniqueValues(cards, "region"));
    fillOptions(year, uniqueValues(cards, "year").sort().reverse());
    seedSearchPage(search);

    [search, region, year, sort].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    function apply() {
      var q = search ? search.value.trim().toLowerCase() : "";
      var regionValue = region ? region.value : "";
      var yearValue = year ? year.value : "";
      var visible = 0;
      var ordered = cards.slice().sort(function (a, b) {
        var mode = sort ? sort.value : "date";
        if (mode === "views") {
          return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
        }
        if (mode === "rating") {
          return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
        }
        return String(b.dataset.date || "").localeCompare(String(a.dataset.date || ""));
      });

      ordered.forEach(function (card) {
        var match = true;
        if (q && !String(card.dataset.search || "").toLowerCase().includes(q)) {
          match = false;
        }
        if (regionValue && card.dataset.region !== regionValue) {
          match = false;
        }
        if (yearValue && card.dataset.year !== yearValue) {
          match = false;
        }
        card.style.display = match ? "" : "none";
        if (match) {
          visible += 1;
        }
        list.appendChild(card);
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    apply();
  }

  function uniqueValues(cards, key) {
    var values = [];
    cards.forEach(function (card) {
      var value = card.dataset[key];
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    return values;
  }

  function fillOptions(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function seedSearchPage(input) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    if (input && q) {
      input.value = q;
    }
  }

  function setupPlayer() {
    var box = document.querySelector("[data-player-box]");
    var video = document.querySelector("[data-video-player]");
    var toggle = document.querySelector("[data-player-toggle]");
    if (!box || !video || !toggle) {
      return;
    }

    var src = video.getAttribute("data-video-url");
    if (src) {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ maxBufferLength: 60 });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else {
        video.src = src;
      }
    }

    function togglePlay() {
      if (video.paused) {
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {});
        }
      } else {
        video.pause();
      }
    }

    toggle.addEventListener("click", togglePlay);
    video.addEventListener("click", togglePlay);
    video.addEventListener("play", function () {
      box.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      box.classList.remove("is-playing");
    });
    video.addEventListener("ended", function () {
      box.classList.remove("is-playing");
    });
  }
})();
