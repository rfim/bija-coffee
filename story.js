/* Our story pages: reveal on scroll, drifting photos, the sliding rail, the Kawung construction and the ij meeting. */
(() => {
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' }) : null;
  document.querySelectorAll('.rv').forEach((e) => (io && !calm ? io.observe(e) : e.classList.add('in')));
  // the ij come together when the section is in view
  const ij = document.querySelector('.ij');
  if (ij) { if (calm || !io) ij.classList.add('met'); else new IntersectionObserver((es) => es.forEach((e) => ij.classList.toggle('met', e.isIntersecting)), { threshold: .55 }).observe(ij); }
  const kb = document.querySelector('.kb'), steps = kb ? [...kb.querySelectorAll('.kb-step')] : [], bars = kb ? [...kb.querySelectorAll('.kb-bar i')] : [];
  const setStep = (n) => { if (!kb || kb.dataset.s === String(n)) return; kb.dataset.s = n; steps.forEach((s, i) => s.classList.toggle('on', i === n - 1)); bars.forEach((b, i) => b.classList.toggle('on', i < n)); };
  if (kb) setStep(calm ? 5 : 1);
  if (calm) { steps.forEach((s) => s.classList.add('on')); return; }
  const pols = [...document.querySelectorAll('[data-sp]')], rails = [...document.querySelectorAll('.sp-rail')];
  let q = false;
  const tick = () => {
    q = false; const vh = innerHeight;
    pols.forEach((el) => { const r = el.parentElement.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return; el.style.setProperty('--py', ((r.top + r.height / 2 - vh / 2) * +el.dataset.sp).toFixed(1) + 'px'); });
    rails.forEach((el) => { const r = el.parentElement.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return; const max = Math.max(0, el.scrollWidth - el.parentElement.clientWidth); el.style.setProperty('--rx', (-max * Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)))).toFixed(1) + 'px'); });
    if (kb) { const r = kb.getBoundingClientRect(), p = Math.min(.999, Math.max(0, -r.top / (r.height - vh))); setStep(1 + Math.floor(p * 5)); }
  };
  addEventListener('scroll', () => { if (!q) { q = true; requestAnimationFrame(tick); } }, { passive: true });
  addEventListener('resize', tick, { passive: true }); tick();
})();
