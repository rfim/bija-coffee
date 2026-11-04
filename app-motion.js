/* Bija motion layer: the app's renders stay untouched; this file watches the DOM and adds motion on top.
   Everything is transform/opacity, everything stops under reduced motion (or window.__BIJA_TEST_NO_MOTION). */
(() => {
  const W = window, D = document, H = D.documentElement;
  const calm = () => !!W.__BIJA_TEST_NO_MOTION || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = D) => r.querySelector(s), $$ = (s, r = D) => [...r.querySelectorAll(s)];
  const ss = { get: (k) => { try { return sessionStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch {} } };
  const vib = (n) => { try { if (!calm() && navigator.vibrate && navigator.userActivation?.hasBeenActive) navigator.vibrate(n); } catch {} }; // browsers block haptics before a first tap
  const C4 = '<circle cx="50" cy="25" r="25"/><circle cx="75" cy="50" r="25"/><circle cx="50" cy="75" r="25"/><circle cx="25" cy="50" r="25"/>';
  const MARK = `<svg viewBox="-4 -4 108 108" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="7">${C4}</g></svg>`;
  const anim = (el, k, o) => (el && el.animate && !calm() ? el.animate(k, o) : null);
  const M = (W.BijaMotion = { flying: 0 });

  // ---- opening. The very first time: a slow, quiet introduction (tap skips it). After that, on every open and on
  //      coming back after a few minutes away: the mark draws and says hello (never blocks; any tap skips it).
  //      Capture scripts set sessionStorage mo.splash to film without either. ----
  const ls = { get: (k) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };
  function splash() {
    if (M.splash?.isConnected) return;
    const s = D.createElement('div'); s.className = 'mo-splash'; s.setAttribute('aria-hidden', 'true');
    s.innerHTML = `<svg viewBox="-4 -4 108 108"><g class="r" fill="none" stroke="#0b0b0b" stroke-width="3">${C4}</g><g class="d" fill="#0b0b0b"><circle cx="50" cy="25" r="7"/><circle cx="75" cy="50" r="7"/><circle cx="50" cy="75" r="7"/><circle cx="25" cy="50" r="7"/><circle cx="50" cy="50" r="5"/></g></svg>`;
    // the greeting band lives here now: the question for the time of day, then hello and whether the bar is open
    let g = null; try { g = W.BijaGreet && W.BijaGreet(); } catch {}
    if (g) { const t = D.createElement('div'); t.className = 'mo-greet'; t.innerHTML = '<b></b><span></span>'; t.firstChild.textContent = g.q; t.lastChild.textContent = g.sub; s.appendChild(t); }
    D.body.appendChild(s); M.splash = s; H.classList.remove('mo-boot');
    const end = () => { if (!s.isConnected || s.classList.contains('out')) return; s.classList.add('out'); setTimeout(() => s.remove(), 400); };
    addEventListener('pointerdown', end, { once: true, capture: true }); setTimeout(end, g ? 2300 : 1150);
  }
  function intro() {
    ls.set('bija.intro', '1');
    const s = D.createElement('div'); s.className = 'mo-intro'; s.setAttribute('aria-hidden', 'true');
    s.innerHTML = `<div class="mi-stage"><svg class="mi-mark" viewBox="-4 -4 108 108"><g fill="none" stroke="#0b0b0b" stroke-width="1.1">${C4}</g></svg>`
      + '<div class="mi-win"><img class="p1" src="photos/feature-3-900.webp" alt="" decoding="async" fetchpriority="high"><img class="p2" src="photos/shop-3-900.webp" alt="" decoding="async"></div>'
      + '<b class="mi-word">BIJA</b></div>'
      + '<div class="mi-lines"><p style="--a:.6s;--b:1.9s">Indonesian coffee</p><p style="--a:2.3s;--b:3.7s">Kopi susu, sweetened with gula aren</p><p style="--a:4s;--b:5s">St James\'s Market, London</p><p style="--a:5.6s;--b:99s" class="mi-sub">Order ahead · Earn as you sip</p></div>'
      + '<i class="mi-time"></i>';
    D.body.appendChild(s); M.splash = s; H.classList.remove('mo-boot');
    const end = () => { if (!s.isConnected || s.classList.contains('out')) return; s.classList.add('out'); setTimeout(() => s.remove(), 900); };
    s.addEventListener('pointerdown', end); setTimeout(end, 7200);
  }
  if (!ss.get('mo.splash') && !calm()) (ls.get('bija.intro') ? splash : intro)();
  { let away = 0; D.addEventListener('visibilitychange', () => {
    if (D.hidden) { away = Date.now(); return; }
    if (away && Date.now() - away > 3 * 60e3 && !calm() && !ss.get('mo.splash') && !D.body.classList.contains('barista-view')) splash();
  }); }

  // ---- hold or drag along the bar: a glass lens lifts over the tab under the finger, magnifies it and follows; let go to open that tab ----
  (() => {
    let lens = null, tm = 0, on = false, down = null, cur = null, eat = 0, lx = 0;
    const tabs = () => [...$$('.bnav button.side'), $('.bnav .fab')].filter(Boolean);
    const box = (t) => (t.classList.contains('fab') ? t.parentElement : t).getBoundingClientRect(); // Order: the button and its label
    const under = (x) => tabs().reduce((a, t) => { const r = box(t), d = Math.abs(x - (r.left + r.width / 2)); return !a || d < a.d ? { t, d } : a; }, null)?.t;
    function place(x) {
      lx = x;
      const side = $('.bnav button.side'), bar = $('.bnav'); if (!side || !bar || !lens) return;
      const s = side.getBoundingClientRect(), b = bar.getBoundingClientRect(), w = s.width + 8;
      const l = Math.max(b.left - 4, Math.min(b.right - w + 4, x - w / 2));
      lens.style.width = w + 'px'; lens.style.height = s.height + 8 + 'px';
      lens.style.transform = `translate(${l - b.left - bar.clientLeft}px, ${s.top - 4 - b.top - bar.clientTop}px)`;
      const t = under(x);
      if (t !== cur) { cur?.classList.remove('mo-mag'); if (cur) vib(5); cur = t; }
      t?.classList.add('mo-mag'); // the bar re-renders its tabs, so the class is put back on every move
    }
    function start(x) {
      on = true; clearTimeout(tm);
      lens = D.createElement('div'); lens.className = 'mo-lens'; lens.setAttribute('aria-hidden', 'true'); lens.innerHTML = '<i></i>';
      lens.style.transition = 'none'; $('.bnav').prepend(lens); $('.bnav').classList.add('lensing'); place(x); lens.getBoundingClientRect(); lens.style.transition = ''; lens.classList.add('on'); vib(8);
    }
    function stop(open) {
      clearTimeout(tm); down = null; if (!on) return; on = false;
      const t = under(lx); $$('.bnav .mo-mag').forEach((x) => x.classList.remove('mo-mag')); cur = null;
      const l = lens; lens = null; l.classList.remove('on'); setTimeout(() => l.remove(), 220); $('.bnav')?.classList.remove('lensing');
      if (open && t) { eat = Date.now(); t.click(); }
    }
    addEventListener('pointerdown', (e) => {
      if (calm() || !e.isPrimary || e.button > 0 || !e.target.closest?.('.bnav button.side')) return;
      down = { x: e.clientX, y: e.clientY }; tm = setTimeout(() => down && start(down.x), 260);
    }, { passive: true });
    addEventListener('pointermove', (e) => {
      if (!down || !e.isPrimary) return;
      if (on) return place(e.clientX);
      if (Math.abs(e.clientX - down.x) > 8) start(e.clientX); else if (Math.abs(e.clientY - down.y) > 14) stop(false);
    }, { passive: true });
    addEventListener('pointerup', (e) => { if (e.isPrimary) stop(true); });
    addEventListener('pointercancel', () => stop(false));
    // the lens opened the tab itself: swallow the browser's own click that follows the lift
    addEventListener('click', (e) => { if (e.isTrusted && Date.now() - eat < 450) { e.preventDefault(); e.stopImmediatePropagation(); eat = 0; } }, true);
    addEventListener('contextmenu', (e) => { if (e.target.closest?.('.bnav')) e.preventDefault(); });
  })();

  H.classList.remove('mo-boot'); // no splash this time (already seen, or calm): lift the first-frame cover
  // ---- the signature: added items arc into the centre button, which catches them and counts ----
  const fab = () => $('.bnav .fab');
  const real = () => { const c = $('.bnav .fab .cnt'); return c && !c.hidden ? (+c.textContent || 0) : 0; };
  let shown = null, tk = null;
  function badge() {
    const f = fab(); if (!f) return null;
    let b = f.querySelector('.mo-cnt');
    if (!b) { b = D.createElement('span'); b.className = 'mo-cnt'; b.setAttribute('aria-hidden', 'true'); b.hidden = true; f.appendChild(b); f.classList.add('mo'); shown = null; }
    return b;
  }
  function show(v) {
    const b = badge(); if (!b) return;
    const was = shown; shown = v;
    if (!v) { if (!b.hidden) { const a = anim(b, [{ transform: 'scale(1)' }, { transform: 'scale(0)' }], { duration: 200 }); a ? a.finished.then(() => { if (!shown) b.hidden = true; }) : (b.hidden = true); } return; }
    if (b.hidden || !was) { b.hidden = false; b.innerHTML = `<i>${v}</i>`; anim(b, [{ transform: 'scale(0)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 380, easing: 'cubic-bezier(.3,1.4,.5,1)' }) || anim(b, [{ opacity: 0 }, { opacity: 1 }], { duration: 200 }); return; }
    if (calm()) { b.innerHTML = `<i>${v}</i>`; return; }
    const up = v > was; b.innerHTML = `<i class="mo-o">${was}</i><i>${v}</i>`;
    const [o, n] = b.children;
    o.animate([{ transform: 'none', opacity: 1 }, { transform: `translateY(${up ? -100 : 100}%)`, opacity: 0 }], { duration: 160, fill: 'forwards' }).finished.then(() => o.remove());
    n.animate([{ transform: `translateY(${up ? 100 : -100}%)` }, { transform: 'none' }], { duration: 180, easing: 'cubic-bezier(.2,.7,.2,1)' });
  }
  function tickTo(t) {
    clearInterval(tk); if (shown == null) shown = 0;
    if (calm() || Math.abs(t - shown) > 12) return show(t);
    const step = () => { if (shown === t) return clearInterval(tk); show(shown + Math.sign(t - shown)); };
    step(); if (shown !== t) tk = setInterval(step, 95);
  }
  M.sync = () => { if (!M.flying) tickTo(real()); };
  function caught() {
    const f = fab(); if (!f) return;
    if (!f.classList.contains('holding')) {
      anim(f, [{ transform: 'scale(1)' }, { transform: 'scale(.88)', offset: .3 }, { transform: 'scale(1.08)', offset: .65 }, { transform: 'scale(1)' }], { duration: 420, easing: 'ease-out', composite: 'add' });
      anim(f.querySelector('svg'), [{ transform: 'rotate(0)' }, { transform: 'rotate(90deg)' }], { duration: 460, easing: 'cubic-bezier(.3,1.4,.5,1)' });
      const r = D.createElement('span'); r.className = 'mo-ring'; f.appendChild(r);
      (anim(r, [{ transform: 'scale(1)', opacity: .7 }, { transform: 'scale(1.7)', opacity: 0 }], { duration: 520, easing: 'ease-out' })?.finished || Promise.resolve()).then(() => r.remove());
    }
    vib(12); tickTo(real());
  }
  let lastImg = null;
  // only the tapped item's own photo: never borrow a neighbouring tile's picture (no photo of one drink on another)
  const imgNear = (el) => { const tile = el && el.closest && el.closest('.prod, .ptile, article, li, .again, .offer, .slide'); const im = tile && tile.querySelector('img'); return im && im.currentSrc ? im : null; };
  M.fly = (from) => {
    const f = fab(); if (!f || !from || !from.getBoundingClientRect) return false;
    if (calm()) { M.sync(); return true; }
    const a = from.getBoundingClientRect(), z = f.getBoundingClientRect();
    if (!a.width && !a.height) return false;
    const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2, x2 = z.left + z.width / 2, y2 = z.top + z.height / 2;
    const x1 = (x0 + x2) / 2, y1 = Math.min(y0, y2) - Math.max(120, Math.abs(y2 - y0) * .45);
    const el = D.createElement('div'); el.className = 'mo-fly';
    if (lastImg) el.style.backgroundImage = `url("${lastImg.replace(/"/g, '%22')}")`; else el.innerHTML = MARK;
    D.body.appendChild(el); M.flying++;
    const fr = [], N = 14;
    for (let i = 0; i <= N; i++) {
      const t = i / N, e = t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2, u = 1 - e;
      const x = u * u * x0 + 2 * u * e * x1 + e * e * x2, y = u * u * y0 + 2 * u * e * y1 + e * e * y2;
      const sx = i === 1 ? 1.18 : t > .3 && t < .7 ? .92 : 1, sy = i === 1 ? .82 : t > .3 && t < .7 ? 1.12 : 1, sc = i === 0 ? 1 : i === 1 ? 1.12 : 1.1 - t * .75;
      fr.push({ transform: `translate(${x}px,${y}px) scale(${sx * sc},${sy * sc})`, opacity: t > .92 ? .4 : 1, offset: t });
    }
    let done = false;
    const land = () => { if (done) return; done = true; el.remove(); M.flying = Math.max(0, M.flying - 1); caught(); };
    el.animate(fr, { duration: 640, easing: 'linear' }).finished.then(land, land);
    setTimeout(land, 1400);
    return true;
  };
  // adds the app doesn't fly itself (beans, reorder) fly from the button that was pressed
  const own = { shopadd: 1, reorder: 1 }; let pend = null;
  D.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-act]'); if (!b) return;
    const act = b.dataset.act;
    if (['qty', 'sheet', 'kadd', 'shopadd', 'reorder'].includes(act)) { const im = imgNear(b); lastImg = im ? im.currentSrc : null; }
    if (own[act]) { const r = b.getBoundingClientRect(); pend = { getBoundingClientRect: () => r }; }
    if (act === 'place' && shown > 0 && !calm()) placed();
    selBefore(b);
  }, true);
  D.addEventListener('click', (e) => { if (pend) { const p = pend; pend = null; requestAnimationFrame(() => M.fly(p)); } selAfter(); });
  function placed() {
    const f = fab(), b = f && f.querySelector('.mo-cnt'); if (!b) return;
    const z = f.getBoundingClientRect(), c = D.createElement('div'); c.className = 'mo-cuppop';
    c.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 16h24v14a10 10 0 0 1-10 10h-4a10 10 0 0 1-10-10z" fill="#0b0b0b"/><path d="M34 20h3a5 5 0 0 1 0 10h-3" fill="none" stroke="#0b0b0b" stroke-width="3"/><path d="M18 6c-3 3 3 5 0 8M26 6c-3 3 3 5 0 8" fill="none" stroke="#0b0b0b" stroke-width="2.5" stroke-linecap="round"/></svg>';
    c.style.left = z.left + z.width / 2 + 'px'; c.style.top = z.top - 30 + 'px'; D.body.appendChild(c);
    anim(b, [{ transform: 'translate(0,0) scale(1)' }, { transform: 'translate(-18px,-30px) scale(0)' }], { duration: 300, fill: 'forwards' });
    c.animate([{ transform: 'translateY(20px) scale(0)', opacity: 0 }, { transform: 'translateY(-6px) scale(1.15)', opacity: 1, offset: .35 }, { transform: 'translateY(-10px) scale(1)', opacity: 1, offset: .75 }, { transform: 'translateY(-30px) scale(.9)', opacity: 0 }], { duration: 1100, easing: 'ease-out' }).finished.then(() => c.remove());
  }

  // ---- selection: a black pill slides from the old choice to the new one ----
  let sel = null;
  const pressed = (b) => { const k = b.dataset.k, id = b.dataset.id, act = b.dataset.act; return $$(`[data-act="${act}"]`).find((x) => (k == null || x.dataset.k === k) && (id == null || x.dataset.id === id) && (x.getAttribute('aria-pressed') === 'true' || x.classList.contains('on'))); };
  function selBefore(b) { sel = null; if (calm() || !['cat', 'sopt', 'opt', 'pplan', 'smethod'].includes(b.dataset.act)) return; const o = pressed(b); if (o && o !== b) sel = { act: b.dataset.act, k: b.dataset.k, id: b.dataset.id, v: b.dataset.v, r: o.getBoundingClientRect(), rad: getComputedStyle(o).borderRadius }; }
  function selAfter() {
    if (!sel) return; const s = sel; sel = null;
    requestAnimationFrame(() => {
      const n = $$(`[data-act="${s.act}"]`).find((x) => x.dataset.v === s.v && (s.k == null || x.dataset.k === s.k) && (s.id == null || x.dataset.id === s.id)); if (!n) return;
      const r = n.getBoundingClientRect(), g = D.createElement('div'); g.className = 'mo-ghost';
      Object.assign(g.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', borderRadius: s.rad });
      n.classList.add('mo-tgt'); D.body.appendChild(g);
      g.animate([{ transform: `translate(${s.r.left - r.left}px,${s.r.top - r.top}px) scale(${s.r.width / r.width},${s.r.height / r.height})` }, { transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.3,1.2,.5,1)' }).finished.then(() => { g.remove(); n.classList.remove('mo-tgt'); });
    });
  }

  // ---- tabs: View Transitions where supported ----
  // the transition overlay never eats taps: it ignores pointer events (CSS), and any new press finishes it at once
  // a navigation still waiting inside the transition runs straight away, so a newer tap can never be overridden by an older one
  let vt = false, vtNow = null, vtPend = null;
  const flush = () => { if (vtPend) { const f = vtPend; vtPend = null; f(); } if (vtNow) { try { vtNow.skipTransition(); } catch {} } };
  // mid-transition the browser hit-tests the press to <html>; the click then lands on <html> too, so replay it on what's under the finger now
  let refire = null;
  addEventListener('pointerdown', (e) => { refire = null; if (!vtNow && !vtPend) return; flush(); if (e.target === H || e.target === D.body) refire = { x: e.clientX, y: e.clientY }; }, true);
  addEventListener('click', (e) => {
    if (!refire || !e.isTrusted) return; const r = refire; refire = null;
    if (e.target !== H && e.target !== D.body) return;
    const el = D.elementFromPoint(r.x, r.y); if (!el || el === H || el === D.body) return;
    e.stopPropagation(); e.preventDefault();
    const ev = new MouseEvent('click', { bubbles: true, cancelable: true, clientX: r.x, clientY: r.y }); ev.moVT = true; el.dispatchEvent(ev);
  }, true);
  D.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') flush(); }, true);
  const RANK = { home: 0, beans: .5, more: .5, gifts: .5, secret: .5, club: .5, order: 1, orders: 1.5, card: 2, me: 2.5 };
  const here = () => { if ($('#hav[aria-current=page]')) return 'me'; const c = $('.bnav [aria-current=page]'); return c ? c.dataset.v : $('.bnav .fab-l.on') ? 'order' : (location.hash || '#home').slice(1); };
  D.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-act=tab],[data-act=fab],[data-act=favmenu],[data-act=goto-checkout],[data-act=showcard]');
    if (!b || e.moVT || !D.startViewTransition || calm()) return;
    // every screen change slides the same calm way; the direction follows the bottom bar (Home, Order, Profile)
    const act = b.dataset.act, from = here(), to = act === 'tab' ? b.dataset.v : act === 'showcard' ? 'card' : 'order';
    if (to === from || (act === 'fab' && from === 'order')) return; // same screen: the button scrolls or bursts, nothing to transition
    if (vt) { flush(); return; }
    e.stopPropagation(); e.preventDefault(); vt = true;
    H.dataset.moDir = b.classList.contains('back') || (RANK[to] ?? 1) < (RANK[from] ?? 1) ? 'back' : 'fwd'; H.classList.add('mo-vt');
    const nav = () => { const ev = new MouseEvent('click', { bubbles: true, cancelable: true }); ev.moVT = true; b.dispatchEvent(ev); };
    vtPend = nav;
    const t = D.startViewTransition(() => { if (vtPend === nav) { vtPend = null; nav(); } });
    vtNow = t;
    const off = () => { vt = false; vtNow = null; if (vtPend) flush(); $('#main')?.classList.remove('enter'); H.classList.remove('mo-vt'); delete H.dataset.moDir; };
    t.finished.then(off, off); setTimeout(off, 1200);
  }, true);

  // ---- sheet: the tile photo morphs into the sheet header ----
  let sheetFrom = null;
  D.addEventListener('pointerdown', (e) => { const b = e.target.closest && e.target.closest('[data-act=sheet]'); const im = b && imgNear(b); sheetFrom = im ? { src: im.currentSrc, r: im.getBoundingClientRect() } : null; }, true);
  function sheetThumb() {
    const p = $('#sheet:not([hidden]) .pan'); if (!p || !sheetFrom || p.querySelector('.mo-sthumb')) return;
    const f = sheetFrom; sheetFrom = null;
    const t = D.createElement('img'); t.className = 'mo-sthumb'; t.alt = ''; t.src = f.src; const h = p.querySelector('h3'); if (!h) return;
    h.parentElement.prepend(t);
    if (calm()) return;
    setTimeout(() => { const r = t.getBoundingClientRect(); t.animate([{ transform: `translate(${f.r.left - r.left}px,${f.r.top - r.top}px) scale(${f.r.width / r.width})`, borderRadius: '0' }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.3,1.2,.5,1)' }); }, 30);
  }

  // ---- after every render: tracking cup, card stamps/points/tier, nav dots, steppers, deal tilt, rise-in ----
  const LV = { received: .3, brewing: .66, ready: 1 }, seenStatus = new Map();
  const cupSVG = '<svg viewBox="0 0 64 64" aria-hidden="true"><g class="steam" fill="none" stroke="#0b0b0b" stroke-width="2" stroke-linecap="round"><path d="M24 14c-3 3 3 5 0 8"/><path d="M32 12c-3 3 3 5 0 8"/><path d="M40 14c-3 3 3 5 0 8"/></g><clipPath id="mo-cc"><path d="M14 26h34v16a12 12 0 0 1-12 12h-10a12 12 0 0 1-12-12z"/></clipPath><rect class="fill" clip-path="url(#mo-cc)" x="14" y="26" width="34" height="28" fill="#0b0b0b"/><path d="M14 26h34v16a12 12 0 0 1-12 12h-10a12 12 0 0 1-12-12z" fill="none" stroke="#0b0b0b" stroke-width="2.5"/><path d="M48 30h3a6 6 0 0 1 0 12h-4" fill="none" stroke="#0b0b0b" stroke-width="2.5"/></svg>';
  function cups() {
    $$('[data-live-order], #main .hero .track').forEach((n) => {
      const host = n.matches('[data-live-order]') ? n : n.parentElement;
      let s = host.dataset.status; if (!s) { const on = n.querySelectorAll('span.on').length; s = ['', 'received', 'brewing', 'ready'][on] || 'received'; }
      const key = (host.querySelector('.big-code, .code, [data-order]')?.textContent || 'live').trim();
      let w = host.querySelector('.mo-cupw');
      const prev = seenStatus.get(key);
      if (!w) { w = D.createElement('div'); w.className = 'mo-cupw still'; w.innerHTML = cupSVG; const t = host.matches('[data-live-order]') ? host.firstElementChild : n; (t || host).before ? (t === host.firstElementChild ? host.prepend(w) : n.before(w)) : host.prepend(w); w.dataset.s = prev || s; w.getBoundingClientRect(); }
      if (w.dataset.s !== s) { w.classList.remove('still'); requestAnimationFrame(() => (w.dataset.s = s)); }
      if (prev && prev !== s && s === 'ready') { petals(w); host.classList.remove('mo-pulse'); void host.offsetWidth; host.classList.add('mo-pulse'); vib(20); }
      seenStatus.set(key, s);
    });
  }
  function petals(at) {
    if (calm()) return; const r = at.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (let i = 0; i < 12; i++) {
      const p = D.createElement('i'); p.className = 'mo-petal' + (i % 2 ? ' w' : ''); p.style.left = cx + 'px'; p.style.top = cy + 'px'; D.body.appendChild(p);
      const a = (i / 12) * Math.PI * 2, d = 50 + (i % 3) * 18, deg = (a * 180) / Math.PI + 90;
      p.animate([{ transform: `rotate(${deg}deg) scale(.2)`, opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px) rotate(${deg}deg) scale(1)`, opacity: 0 }], { duration: 850, easing: 'cubic-bezier(.2,.7,.2,1)' }).finished.then(() => p.remove());
    }
  }
  const TIERS = ['seed', 'sprout', 'tree'], TNAME = { sprout: 'Sprout', tree: 'Kopi Tree' };
  function toastMo(t) { const o = D.createElement('div'); o.className = 'mo-toast'; o.setAttribute('role', 'status'); o.textContent = t; D.body.appendChild(o); (anim(o, [{ opacity: 0, transform: 'translate(-50%,-12px)' }, { opacity: 1, transform: 'translate(-50%,0)' }], { duration: 260 }) || {}); setTimeout(() => o.remove(), 2600); }
  function card() {
    const c = $('[data-card-stage] .bcard, .face .bcard, .hc .bcard'); if (!c) return;
    const b = c.querySelector('.pts b[data-to]'), pts = b ? +b.dataset.to : null, op = +ss.get('mo.pts');
    if (pts != null) { if (ss.get('mo.pts') != null && pts > op && !calm()) { const s = D.createElement('span'); s.className = 'mo-stamp'; c.appendChild(s); s.animate([{ transform: 'scale(1.6) rotate(-12deg)', opacity: 0 }, { transform: 'scale(1) rotate(-12deg)', opacity: .5, offset: .35 }, { transform: 'scale(1.3)', opacity: 0 }], { duration: 700, easing: 'ease-out' }).finished.then(() => s.remove()); } ss.set('mo.pts', pts); }
    const tier = TIERS.find((t) => c.classList.contains('tier-' + t)), ot = ss.get('mo.tier');
    if (tier) { if (ot && TIERS.indexOf(tier) > TIERS.indexOf(ot)) { c.classList.add('mo-foil'); setTimeout(() => c.classList.remove('mo-foil'), 1500); toastMo(`Welcome to ${TNAME[tier]}`); vib([10, 40, 10]); } ss.set('mo.tier', tier); }
    const st = c.dataset.stamps != null ? +c.dataset.stamps : null, os = ss.get('mo.stamps');
    if (st != null) {
      if (os != null && st > +os) {
        const n = c.querySelector('.st.new') || c.querySelectorAll('.st.on')[st - 1];
        if (n) { n.classList.add('mo-press'); if (!calm()) setTimeout(() => { const r = D.createElement('span'); r.className = 'mo-ink'; const nr = n.getBoundingClientRect(), cr = c.getBoundingClientRect(); Object.assign(r.style, { left: nr.left - cr.left + 'px', top: nr.top - cr.top + 'px', width: nr.width + 'px', height: nr.height + 'px' }); c.appendChild(r); r.animate([{ transform: 'scale(1)', opacity: .6 }, { transform: 'scale(1.8)', opacity: 0 }], { duration: 500 }).finished.then(() => r.remove()); vib(12); }, 270); }
        if (st >= 10) { const free = c.querySelector('.st.free, .st:last-of-type'); if (free) setTimeout(() => free.classList.add('mo-coin'), 450); toastMo('Your next drink is on us'); }
      }
      ss.set('mo.stamps', st);
    }
  }
  const dots = new Set();
  function navDots() { const now = new Set(); $$('.bnav .side').forEach((s) => { const d = s.querySelector('.dot'); if (!d) return; const k = s.dataset.v; now.add(k); if (!dots.has(k)) d.classList.add('mo-pop'); }); dots.clear(); now.forEach((k) => dots.add(k)); }
  const steps = new Map();
  function steppers() { $$('.step output').forEach((o) => { const k = o.closest('[data-id]')?.dataset.id || (o.closest('.sheet') ? 'sheet' : o.parentElement.querySelector('[data-id]')?.dataset.id || ''); const v = +o.textContent, p = steps.get(k); if (p != null && p !== v && !calm()) { o.classList.add('mo-roll'); if (v < p) o.classList.add('dn'); } steps.set(k, v); }); }
  function deal() { $$('.sc.deal:not(.mo-deal)').forEach((s) => { s.style.setProperty('--mo-tilt', (Math.random() * 6 - 3).toFixed(1) + 'deg'); s.classList.add('mo-deal'); }); }
  const seen = new Set(); let io = null;
  function rise() {
    if (calm() || !('IntersectionObserver' in W)) return;
    io ||= new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { const t = e.target; t.classList.add('mo-in'); t.classList.remove('mo-pre'); io.unobserve(t); } }), { rootMargin: '0px 0px -8% 0px' });
    $$('#main .menu > *, #main .ptiles > *, #main section, #main .offer, #main .panel').forEach((el, i) => {
      if (el.dataset.moSeen) return; el.dataset.moSeen = 1;
      const key = (el.className + '|' + el.textContent.slice(0, 60)).replace(/\s+/g, ' ');
      if (seen.has(key)) return; seen.add(key);
      if (el.getBoundingClientRect().top < innerHeight) return;
      el.classList.add('mo-pre'); el.style.transitionDelay = (i % 4) * 60 + 'ms'; io.observe(el);
    });
  }
  let q = false;
  const after = () => { if (q) return; q = true; requestAnimationFrame(() => { q = false; try { badge(); if (!M.flying && real() !== shown) tickTo(real()); cups(); card(); navDots(); steppers(); deal(); rise(); sheetThumb(); drawer(); } catch (e) { /* motion must never break the app */ } }); };
  new MutationObserver(after).observe(D.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-status', 'data-stamps', 'hidden'] });
  addEventListener('beforeprint', () => $$('.mo-pre').forEach((e) => e.classList.remove('mo-pre')));

  // ---- header condenses; hero photos drift slightly ----
  let sq = false;
  addEventListener('scroll', () => { if (sq) return; sq = true; requestAnimationFrame(() => { sq = false; H.classList.toggle('mo-scrolled', scrollY > 24); if (calm()) return; $$('#main .promos .slide img').slice(0, 6).forEach((im) => { const r = im.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; im.style.transform = `translateY(${((r.top + r.height / 2 - innerHeight / 2) * -0.05).toFixed(1)}px) scale(1.08)`; }); }); }, { passive: true });

  // ---- Bija Card lift: drag up into a full-screen scan view (tap-to-flip and "Show code" stay as the non-gesture route) ----
  let drag = null, scan = null;
  D.addEventListener('pointerdown', (e) => {
    if (scan || e.button > 0) return;
    const st = e.target.closest && e.target.closest('[data-card-stage], #main .flip'); if (!st) return;
    drag = { st, y0: e.clientY, t0: performance.now(), dy: 0, on: false, id: e.pointerId };
  });
  D.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dy = e.clientY - drag.y0;
    if (!drag.on) { if (dy > -8) return; drag.on = true; drag.st.classList.add('mo-lift'); $$('#main > *, #main > * > *').forEach((x) => { if (!x.contains(drag.st) && !drag.st.contains(x) && x.parentElement && x.parentElement.contains(drag.st)) x.classList.add('mo-back', 'mo-recede'); }); }
    drag.dy = dy; if (calm()) return;
    const lift = dy < 0 ? -Math.pow(-dy, .82) : dy * .2;
    drag.st.style.transform = `translateY(${lift}px) scale(${Math.min(1.04, 1 + -dy / 2500)})`;
  });
  const endDrag = (e) => {
    if (!drag || (e && e.pointerId !== drag.id)) return; const d = drag; drag = null; if (!d.on) return;
    const v = d.dy / Math.max(1, performance.now() - d.t0);
    const eat = (c) => { c.stopPropagation(); c.preventDefault(); };
    D.addEventListener('click', eat, { capture: true, once: true }); setTimeout(() => D.removeEventListener('click', eat, true), 350);
    if (d.dy < -80 || v < -0.6) openScan(d.st); else springBack(d.st);
  };
  D.addEventListener('pointerup', endDrag); D.addEventListener('pointercancel', endDrag);
  function springBack(st) { st.classList.add('mo-springback'); st.style.transform = ''; $$('.mo-recede').forEach((x) => x.classList.remove('mo-recede')); setTimeout(() => { st.classList.remove('mo-springback', 'mo-lift'); $$('.mo-back').forEach((x) => x.classList.remove('mo-back')); }, 460); }
  function openScan(st) {
    const c = st.querySelector('.bcard'), qr = st.querySelector('.back svg') || $('#main .flip .back svg');
    const code = (st.querySelector('.back .code')?.textContent || (c?.textContent.match(/BIJA-[A-Z0-9]+/) || [''])[0]).trim();
    const o = D.createElement('div'); o.className = 'mo-scan'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-label', 'Your member code');
    o.innerHTML = `<button class="mo-x" type="button">Close</button><div class="mo-card"></div><div class="mo-qr"></div><div class="mo-code"></div><p class="mo-hint">Turn your screen brightness up, then show this at the till.</p>`;
    if (c) { const k = c.cloneNode(true); k.removeAttribute('id'); o.querySelector('.mo-card').appendChild(k); }
    if (qr) o.querySelector('.mo-qr').appendChild(qr.cloneNode(true)); else o.querySelector('.mo-qr').hidden = true;
    o.querySelector('.mo-code').textContent = code;
    D.body.appendChild(o); scan = { o, st };
    const from = st.getBoundingClientRect();
    st.style.transform = ''; st.classList.remove('mo-lift');
    if (calm()) anim(o, [{ opacity: 0 }, { opacity: 1 }], { duration: 1 }) || (o.style.opacity = 1);
    else {
      o.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
      const k = o.querySelector('.mo-card'), r = k.getBoundingClientRect();
      k.animate([{ transform: `translate(${from.left - r.left}px,${from.top - r.top}px) scale(${from.width / Math.max(1, r.width)})` }, { transform: 'none' }], { duration: 480, easing: 'cubic-bezier(.3,1.25,.5,1)' });
      o.querySelector('.mo-qr').animate([{ transform: 'perspective(700px) rotateY(90deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 420, delay: 160, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
    }
    vib(10); o.querySelector('.mo-x').focus();
    o.querySelector('.mo-x').addEventListener('click', closeScan);
    let y0 = null; o.addEventListener('pointerdown', (e) => (y0 = e.clientY)); o.addEventListener('pointerup', (e) => { if (y0 != null && e.clientY - y0 > 80) closeScan(); y0 = null; });
  }
  function closeScan() {
    if (!scan) return; const { o, st } = scan; scan = null;
    $$('.mo-recede').forEach((x) => x.classList.remove('mo-recede'));
    const fin = () => { o.remove(); $$('.mo-back').forEach((x) => x.classList.remove('mo-back')); (st.isConnected ? st : $('[data-card-stage], #main .flip'))?.focus?.({ preventScroll: true }); };
    const a = anim(o, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(40px)' }], { duration: 260, easing: 'ease-in' });
    a ? a.finished.then(fin) : fin();
  }
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && scan) { e.stopPropagation(); closeScan(); } }, true);
  // ---- stamp drawer: springs in from the right, profile shifts left, stamps pop one by one, swipe right to close ----
  let drw = null;
  function drawer() {
    const d = $('[data-stamp-drawer]'); const open = d && !d.hidden && getComputedStyle(d).display !== 'none';
    if (!open) { if (drw) { $('#main')?.classList.remove('mo-under'); drw = null; } return; }
    if (drw === d) return; drw = d;
    const pan = d.querySelector('[data-drawer-panel], .pan, .panel') || d, bg = d.querySelector('[data-drawer-bg], .bg');
    // the page behind stays exactly where it is; only the panel and a light veil move
    if (calm()) { anim(d, [{ opacity: 0 }, { opacity: 1 }], { duration: 1 }); return; }
    pan.animate([{ transform: 'translateX(100%)' }, { transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.22,1,.36,1)' });
    bg && bg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: 'ease-out' });
    $$('.st.on', d).forEach((x, i) => x.animate([{ transform: 'scale(0) rotate(-20deg)', opacity: 0 }, { transform: 'scale(1.15) rotate(-12deg)', opacity: 1, offset: .7 }, { transform: 'rotate(-12deg)' }], { duration: 380, delay: 220 + i * 40, easing: 'ease-out', fill: 'backwards' }));
    let x0 = null, dx = 0;
    pan.addEventListener('pointerdown', (e) => { x0 = e.clientX; dx = 0; pan.style.transition = 'none'; });
    pan.addEventListener('pointermove', (e) => { if (x0 == null) return; dx = Math.max(0, e.clientX - x0); if (dx > 4) pan.style.transform = `translateX(${dx}px)`; });
    const up = () => { if (x0 == null) return; x0 = null; pan.style.transition = 'transform .35s cubic-bezier(.3,1.15,.5,1)'; if (dx > 80) { pan.style.transform = 'translateX(100%)'; setTimeout(() => (d.querySelector('[data-act*=close], [data-close], .close, [aria-label=Close]') || bg)?.click(), 200); } else pan.style.transform = ''; };
    pan.addEventListener('pointerup', up); pan.addEventListener('pointercancel', up);
  }
  M.openScan = (st) => openScan(st || $('[data-card-stage], #main .flip'));
  M.closeScan = closeScan;
  after();
})();
