(function() {
    function qs(selector, parent) {
        return (parent || document).querySelector(selector);
    }

    function qsa(selector, parent) {
        return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = qs('.menu-toggle');
        var nav = qs('.mobile-nav');
        if (!button || !nav) return;
        button.addEventListener('click', function() {
            nav.classList.toggle('open');
        });
    }

    function initHero() {
        var slider = qs('.hero-slider');
        if (!slider) return;
        var slides = qsa('.hero-slide', slider);
        var dots = qsa('.hero-dot', slider);
        if (!slides.length) return;
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }
        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                show(parseInt(dot.getAttribute('data-target'), 10) || 0);
            });
        });
        window.setInterval(function() {
            show(current + 1);
        }, 5600);
    }

    function initSearch() {
        var input = qs('#site-search');
        var cards = qsa('.movie-card');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('search') || '';
        if (input && query) input.value = query;
        function filter(value) {
            var needle = (value || '').trim().toLowerCase();
            if (!cards.length) return;
            cards.forEach(function(card) {
                var hay = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.textContent
                ].join(' ').toLowerCase();
                card.classList.toggle('is-hidden', needle && hay.indexOf(needle) === -1);
            });
        }
        filter(query);
        if (input && cards.length) {
            input.addEventListener('input', function() {
                filter(input.value);
            });
        }
    }

    function initPlayer() {
        var video = qs('[data-stream]');
        if (!video) return;
        var layer = qs('.play-layer');
        var stream = video.getAttribute('data-stream');
        var hlsReady = false;
        function loadStream() {
            if (hlsReady) return;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                hlsReady = true;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hlsReady = true;
                return;
            }
            video.src = stream;
            hlsReady = true;
        }
        function start() {
            loadStream();
            if (layer) layer.classList.add('is-hidden');
            var playing = video.play();
            if (playing && playing.catch) playing.catch(function() {});
        }
        if (layer) layer.addEventListener('click', start);
        video.addEventListener('click', function() {
            if (video.paused) start();
        });
        video.addEventListener('play', function() {
            if (layer) layer.classList.add('is-hidden');
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        initMenu();
        initHero();
        initSearch();
        initPlayer();
    });
})();
