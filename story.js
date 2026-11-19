/* Our story pages: reveal on scroll, drifting photos, the sliding rail, the Kawung construction and the ij meeting. */
(() => {
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: matchMedia('(max-width: 760px)').matches ? '0px 0px 6% 0px' : '0px 0px -10% 0px' }) : null;
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
    if (hero && v === '3') {
      // the route sails around the words like a ship rounding an island: an oval drawn from the text's own box, never across it
      const box = hero.querySelector('.in'), draw = () => { hero.querySelector('.sx-route')?.remove(); const H = hero.getBoundingClientRect(), b = box.getBoundingClientRect();
        const wide = H.width > 760, cx = b.left - H.left + b.width / 2, cy = b.top - H.top + b.height / 2, rx = Math.min(H.width / 2 - 6, b.width / 2 + (wide ? 90 : 14)), ry = Math.min(H.height / 2 - 30, b.height / 2 + (wide ? 70 : 44));
        // a superellipse: round at the ends, nearly straight along the sides, so it hugs the text box and never crosses it
        const se = (c) => Math.sign(c) * Math.pow(Math.abs(c), 2 / 5), P = (t) => [cx + rx * se(Math.cos(t)), cy + ry * se(Math.sin(t))], a0 = Math.PI * .8, a1 = a0 + Math.PI * 1.75, N = 64;
        let d = ''; for (let n = 0; n <= N; n++) { const [x, y] = P(a0 + (a1 - a0) * n / N); d += (n ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); }
        const ports = [[0, 'Mocha'], [.5, 'Java'], [1, 'St James’s']].map(([f, l], n) => { const t = a0 + (a1 - a0) * f, [x, y] = P(t), ox = Math.cos(t) * 18, oy = Math.sin(t) * 18, lx = x + ox, anc = lx < 70 ? 'start' : lx > H.width - 70 ? 'end' : Math.cos(t) > .3 ? 'start' : Math.cos(t) < -.3 ? 'end' : 'middle'; return `<circle cx="${x}" cy="${y}" r="4" style="animation-delay:${.2 + n * .95}s"/><text x="${Math.min(H.width - 8, Math.max(8, lx))}" y="${y + oy + 5}" text-anchor="${anc}" style="animation-delay:${.3 + n * .95}s">${l}</text>`; }).join('');
        hero.insertAdjacentHTML('afterbegin', `<svg class="sx-route" viewBox="0 0 ${H.width} ${H.height}" aria-hidden="true"><path d="${d}"/><path class="ln" pathLength="1400" d="${d}"/>${ports}<g class="sx-ship" style="offset-path:path('${d}')"><use href="#bija-kw-b" x="-9" y="-9" width="18" height="18"/></g></svg>`); };
      draw(); let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(draw, 200); }, { passive: true }); } }
  // Communities: cards land as they reach the screen
  document.querySelectorAll('.cwall .cw').forEach((e) => (io && !calm ? io.observe(e) : e.classList.add('in')));
  const pour = document.querySelector('.pour'); if (pour) { pour.dataset.p = '1'; if (calm) { pour.dataset.p = '4'; pour.style.cssText = '--pg:1;--pw:1;--pst:1'; } }
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
    if (pour) { const r = pour.getBoundingClientRect(), p = Math.min(1, Math.max(0, -r.top / (r.height - vh))), seg = (a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));
      const s = pour.style; s.setProperty('--pg', seg(0, .22).toFixed(3)); s.setProperty('--pw', seg(.25, .5).toFixed(3)); s.setProperty('--pu', (seg(.25, .45) - seg(.5, .72)).toFixed(3)); s.setProperty('--pst', seg(.72, .9).toFixed(3));
      pour.dataset.p = p < .25 ? '1' : p < .5 ? '2' : p < .75 ? '3' : '4'; }
    if (kb) { const r = kb.getBoundingClientRect(), p = Math.min(.999, Math.max(0, -r.top / (r.height - vh))); setStep(1 + Math.floor(p * 5)); }
  };
  addEventListener('scroll', () => { if (!q) { q = true; requestAnimationFrame(tick); } }, { passive: true });
  addEventListener('resize', tick, { passive: true }); tick();
})();

/* the hero wordmark: one of the four ij motions at random as the page opens, another on each tap */
(() => { const b = document.querySelector('.hero-mark'); if (!b) return; const pick = () => { b.dataset.ij = 2 + Math.floor(Math.random() * 4); };
  pick(); b.addEventListener('click', () => { const w = b.querySelector('.wordmark'); pick(); w.querySelectorAll('.wm-i, .wm-j').forEach((e) => { e.style.animation = 'none'; void e.getBoundingClientRect(); e.style.animation = ''; e.style.animationDelay = '0s'; }); }); })();
