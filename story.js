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
  // the hero's archive mood (?sfx=1..3 for the visit; ink by default until the owner picks)
  { let v = '1'; try { const q = new URLSearchParams(location.search).get('sfx'); if (/^[1-3]$/.test(q || '')) sessionStorage.setItem('bija.sfx', q); v = sessionStorage.getItem('bija.sfx') || '1'; } catch {}
    document.documentElement.dataset.sfx = v;
    const t = document.querySelector('.sp-hero .sp-big');
    if (t) { let n = 0; const wrap = (el) => [...el.childNodes].forEach((c) => { if (c.nodeType === 3) { const f = document.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach((w) => { if (!w) return; if (/^\s+$/.test(w)) f.append(w); else { const s = document.createElement('span'); s.className = 'w'; s.style.setProperty('--i', n++); s.textContent = w; f.append(s); } }); c.replaceWith(f); } else if (c.nodeType === 1 && !c.classList.contains('w')) { c.classList.add('w'); c.style.setProperty('--i', n++); } }); wrap(t); }
    const hero = document.querySelector('.sp-hero');
    if (hero && v === '3') hero.insertAdjacentHTML('afterbegin', '<svg class="sx-route" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true"><path d="M60 470 C 250 380, 380 520, 520 420 S 800 160, 940 120"/><path class="ln" d="M60 470 C 250 380, 380 520, 520 420 S 800 160, 940 120"/><circle cx="60" cy="470" r="4" style="animation-delay:.2s"/><circle cx="520" cy="420" r="4" style="animation-delay:1.1s"/><circle cx="940" cy="120" r="4" style="animation-delay:2.1s"/><text x="74" y="500" style="animation-delay:.3s">Mocha</text><text x="534" y="452" style="animation-delay:1.2s">Java</text><text x="836" y="104" style="animation-delay:2.2s">St James’s</text></svg>'); }
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
