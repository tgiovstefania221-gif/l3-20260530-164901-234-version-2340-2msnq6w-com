(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero-carousel]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dotsWrap = root.querySelector("[data-hero-dots]");
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            if (dotsWrap) {
                Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === index);
                });
            }
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (dotsWrap) {
            slides.forEach(function (_, i) {
                var dot = document.createElement("button");
                dot.type = "button";
                dot.setAttribute("aria-label", "切换推荐" + (i + 1));
                dot.addEventListener("click", function () {
                    show(i);
                    start();
                });
                dotsWrap.appendChild(dot);
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        panels.forEach(function (panel) {
            var section = panel.parentElement;
            if (!section) {
                return;
            }
            var input = panel.querySelector("[data-search-input]");
            var genre = panel.querySelector("[data-genre-select]");
            var year = panel.querySelector("[data-year-select]");
            var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
            var empty = section.querySelector("[data-empty-state]");

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var genreValue = genre ? genre.value.trim().toLowerCase() : "";
                var yearValue = year ? year.value.trim().toLowerCase() : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-year") || "",
                        card.getAttribute("data-genre") || "",
                        card.textContent || ""
                    ].join(" ").toLowerCase();
                    var ok = true;
                    if (query && text.indexOf(query) === -1) {
                        ok = false;
                    }
                    if (genreValue && text.indexOf(genreValue) === -1) {
                        ok = false;
                    }
                    if (yearValue && text.indexOf(yearValue) === -1) {
                        ok = false;
                    }
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            if (genre) {
                genre.addEventListener("change", apply);
            }
            if (year) {
                year.addEventListener("change", apply);
            }
            apply();
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var trigger = player.querySelector("[data-play-trigger]");
            var streamUrl = player.getAttribute("data-stream");
            var hls = null;
            var loaded = false;

            function playVideo() {
                if (!video || !streamUrl) {
                    return;
                }
                if (trigger) {
                    trigger.classList.add("is-hidden");
                }
                if (loaded) {
                    video.play().catch(function () {});
                    return;
                }
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                    video.addEventListener("loadedmetadata", function () {
                        video.play().catch(function () {});
                    }, { once: true });
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.src = streamUrl;
                    video.play().catch(function () {});
                }
            }

            if (trigger) {
                trigger.addEventListener("click", playVideo);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (!loaded) {
                        playVideo();
                    }
                });
            }
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
