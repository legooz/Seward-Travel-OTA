function setupLandingVideo() {
  const video = document.querySelector('#landing-video');
  if (!video || typeof video.play !== 'function') return;
  const showVideoError = () => { document.querySelector('#video-error').hidden = false; };
  video.addEventListener('error', showVideoError);
  video.querySelector('source')?.addEventListener('error', showVideoError);
  // Leave autoplay off in HTML so reduced-motion visitors never start playback.
  if (typeof window.matchMedia !== 'function') return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const applyMotionPreference = () => {
    video.autoplay = !reducedMotion.matches;
    if (reducedMotion.matches) video.pause();
    else {
      video.muted = true;
      const playback = video.play();
      playback?.catch(() => {}); // Native controls remain available if autoplay is blocked.
    }
  };
  applyMotionPreference();
  reducedMotion.addEventListener?.('change', applyMotionPreference);
}

setupLandingVideo();
