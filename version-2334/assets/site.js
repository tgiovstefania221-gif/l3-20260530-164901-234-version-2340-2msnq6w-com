(function () {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");

  if (header && toggle) {
    toggle.addEventListener("click", function () {
      header.classList.toggle("menu-open");
    });
  }

  const slider = document.querySelector("[data-hero-slider]");

  if (slider) {
    const slides = Array.from(slider.querySelectorAll(".hero-slide"));
    const dots = Array.from(slider.querySelectorAll(".hero-dot"));
    const prev = slider.querySelector(".hero-prev");
    const next = slider.querySelector(".hero-next");
    let current = 0;
    let timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function move(step) {
      show(current + step);
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        move(1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        move(-1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        move(1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  const filterInputs = Array.from(document.querySelectorAll(".filter-input"));
  const yearSelects = Array.from(document.querySelectorAll(".filter-select"));
  const categorySelect = document.querySelector(".category-select");
  const cards = Array.from(document.querySelectorAll(".searchable-card"));
  const empty = document.querySelector(".empty-result");

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function readQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  }

  function cardText(card) {
    return normalize([
      card.dataset.title,
      card.dataset.region,
      card.dataset.genre,
      card.dataset.tags,
      card.dataset.year
    ].join(" "));
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    const keyword = normalize(filterInputs.map(function (input) {
      return input.value;
    }).join(" "));
    const year = normalize(yearSelects.map(function (select) {
      return select.value;
    }).find(Boolean) || "");
    const category = categorySelect ? normalize(categorySelect.value) : "";
    let visible = 0;

    cards.forEach(function (card) {
      const text = cardText(card);
      const matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      const matchYear = !year || normalize(card.dataset.year) === year;
      const matchCategory = !category || normalize(card.dataset.category) === category;
      const shouldShow = matchKeyword && matchYear && matchCategory;
      card.classList.toggle("hidden-card", !shouldShow);
      if (shouldShow) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle("show", visible === 0);
    }
  }

  if (filterInputs.length || yearSelects.length || categorySelect) {
    const initial = readQuery();
    if (initial && filterInputs[0]) {
      filterInputs[0].value = initial;
    }

    filterInputs.forEach(function (input) {
      input.addEventListener("input", applyFilters);
    });

    yearSelects.forEach(function (select) {
      select.addEventListener("change", applyFilters);
    });

    if (categorySelect) {
      categorySelect.addEventListener("change", applyFilters);
    }

    applyFilters();
  }
}());
