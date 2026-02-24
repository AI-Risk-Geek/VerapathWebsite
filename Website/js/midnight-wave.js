(function () {
  const wavePaths = document.querySelectorAll('.js-midnight-wave-shape');
  if (!wavePaths.length) return;

  const RIGHT_FLAT_BASE = 326.23711;
  const MIN_OFFSET = -RIGHT_FLAT_BASE;
  const MAX_OFFSET = 600 - RIGHT_FLAT_BASE;

  function dWithOffset(offset) {
    const clampedOffset = Math.max(MIN_OFFSET, Math.min(MAX_OFFSET, offset));
    const rightFlat = RIGHT_FLAT_BASE + clampedOffset;

    return `M0,101.33818h720V24.5833h-${rightFlat.toFixed(5)}c-22.08223,0-30.73828-15.33223-32.87695-23.25879-.47637-1.76602-1.29492-1.76602-1.77187,0-2.13867,7.92656-10.79473,23.25879-32.87695,23.25879H0v76.75488Z`;
  }

  const mid = (MIN_OFFSET + MAX_OFFSET) / 2;
  const amp = (MAX_OFFSET - MIN_OFFSET) / 2;
  const speed = 0.000512;

  let start = null;

  function animate(timestamp) {
    if (start === null) start = timestamp;
    const elapsed = timestamp - start;
    const offset = mid + Math.sin(elapsed * speed) * amp;
    const d = dWithOffset(offset);

    wavePaths.forEach((path) => path.setAttribute('d', d));
    window.requestAnimationFrame(animate);
  }

  const initialD = dWithOffset(0);
  wavePaths.forEach((path) => path.setAttribute('d', initialD));
  window.requestAnimationFrame(animate);
})();
