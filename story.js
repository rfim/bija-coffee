/* Our story pages: reveal on scroll, drifting photos, the sliding rail, the Kawung construction and the ij meeting. */
(() => {
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' }) : null;
  document.querySelectorAll('.rv').forEach((e) => (io && !calm ? io.observe(e) : e.classList.add('in')));
  // the ij come together when the section is in view
  const ij = document.querySelector('.ij');
  if (ij) { if (calm || !io) ij.classList.add('met'); else new IntersectionObserver((es) => es.forEach((e) => ij.classList.toggle('met', e.isIntersecting)), { threshold: .55 }).observe(ij); }
  // Listen: plays how Bija sounds
  document.querySelectorAll('[data-say]').forEach((b) => b.addEventListener('click', () => { const a = new Audio(b.dataset.say); b.classList.add('playing'); a.addEventListener('ended', () => b.classList.remove('playing')); a.play().catch(() => b.classList.remove('playing')); }));
  const walk = document.querySelector('.walk');
  if (walk) walk.dataset.sc = '1';
  const kb = document.querySelector('.kb'), steps = kb ? [...kb.querySelectorAll('.kb-step')] : [], bars = kb ? [...kb.querySelectorAll('.kb-bar i')] : [];
  const setStep = (n) => { if (!kb || kb.dataset.s === String(n)) return; kb.dataset.s = n; steps.forEach((s, i) => s.classList.toggle('on', i === n - 1)); bars.forEach((b, i) => b.classList.toggle('on', i < n)); };
  if (kb) setStep(calm ? 5 : 1);
  // the headline scrambles into its words, like letters settling on a departures board
  const scramble = (el) => {
    const nodes = []; const walk = (n) => n.childNodes.forEach((c) => { if (c.nodeType === 3 && c.textContent.trim()) nodes.push(c); else if (c.nodeType === 1) walk(c); }); walk(el);
    const G = 'abcdefghijklmnopqrstuvwxyzKAWUNGBIJA·/ʒɪ', total = nodes.reduce((t, n) => t + n.textContent.length, 0), t0 = performance.now(), dur = 900;
    const finals = nodes.map((n) => n.textContent);
    const step = (now) => { const k = Math.min(1, (now - t0) / dur); let idx = 0;
      nodes.forEach((n, ni) => { const f = finals[ni]; let out = ''; for (let c = 0; c < f.length; c++, idx++) { const ch = f[c]; out += (ch === ' ' || idx / total < k * 1.15 - .15) ? ch : G[(Math.random() * G.length) | 0]; } n.textContent = out; });
      if (k < 1) requestAnimationFrame(step); else nodes.forEach((n, ni) => (n.textContent = finals[ni])); };
    requestAnimationFrame(step);
  };
  const title = document.querySelector('.sp-hero .sp-big'); if (title && !calm) scramble(title);
  if (calm) { steps.forEach((s) => s.classList.add('on')); return; }
  const pols = [...document.querySelectorAll('[data-sp]')], rails = [...document.querySelectorAll('.sp-rail')];
  let q = false;
  const tick = () => {
    q = false; const vh = innerHeight;
    pols.forEach((el) => { const r = el.parentElement.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return; el.style.setProperty('--py', ((r.top + r.height / 2 - vh / 2) * +el.dataset.sp).toFixed(1) + 'px'); });
    rails.forEach((el) => { const r = el.parentElement.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return; const max = Math.max(0, el.scrollWidth - el.parentElement.clientWidth); el.style.setProperty('--rx', (-max * Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)))).toFixed(1) + 'px'); });
    if (walk) { const r = walk.getBoundingClientRect(), p = Math.min(1, Math.max(0, -r.top / (r.height - vh))), seg = (a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));
      const s = walk.style; s.setProperty('--t1', seg(0, .34).toFixed(4)); s.setProperty('--f12', seg(.28, .40).toFixed(4)); s.setProperty('--t2', seg(.34, .70).toFixed(4)); s.setProperty('--f23', seg(.64, .76).toFixed(4)); s.setProperty('--t3', seg(.70, 1).toFixed(4));
      walk.dataset.sc = p < .36 ? '1' : p < .72 ? '2' : '3'; }
    if (kb) { const r = kb.getBoundingClientRect(), p = Math.min(.999, Math.max(0, -r.top / (r.height - vh))); setStep(1 + Math.floor(p * 5)); }
  };
  addEventListener('scroll', () => { if (!q) { q = true; requestAnimationFrame(tick); } }, { passive: true });
  addEventListener('resize', tick, { passive: true }); tick();
})();
