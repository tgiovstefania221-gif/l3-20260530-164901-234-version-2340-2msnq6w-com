function setupVideoPlayer(sourceUrl) {
  var video = document.getElementById("movie-video");
  var cover = document.getElementById("player-cover");
  var playButton = document.getElementById("play-button");
  var prepared = false;
  var hlsInstance = null;

  function attach() {
    if (!video || prepared) {
      return;
    }
    prepared = true;
    video.controls = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = sourceUrl;
  }

  function reveal() {
    if (cover) {
      cover.classList.add("hidden");
    }
  }

  function play() {
    attach();
    reveal();
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {
        video.controls = true;
      });
    }
  }

  if (cover) {
    cover.addEventListener("click", play);
  }

  if (playButton) {
    playButton.addEventListener("click", function (event) {
      event.preventDefault();
      play();
    });
  }

  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
  }

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
