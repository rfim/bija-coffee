/* From rfim/ngopiuk-coffee (same owner): the owner's licensed black-and-gold wayang drawings, animated. Bija uses the dancer, garuda and gamelan. */
/* Wayang motion: the owner's black-and-gold drawings (art/motion/), cut into layers at their own shapes and the
   joint dots drawn on the puppets' arms. Nothing is redrawn; the motion is turning and moving those layers, plus a
   light that runs over each drawing's own gold (wayang.css). Colours: the sheet's black (--wy-ink) and gold (--wy-acc), as drawn.
   Use: <span data-wayang="dancer"></span> (optional data-label="…" to name it; data-decor to hide it from screen readers;
   data-nopause where the page has its own <button class="wy-pause"> for all of them; data-once to play one short pass
   when it comes into view, again on hover or tap, and again when the page is left idle (8 s, then every 20 s, at most
   3 times), with no pause button needed),
   or NgopiWayang.html('dancer', { decor: true }) for markup made in script.
   One pause button state for every drawing on the page, remembered on this device (WCAG 2.2.2). */
(function () {
  var KEY = 'ngopi.wayangPaused', root = document.documentElement;
  var CFG = {"warrior":{"w":330,"h":533,"label":"A wayang warrior in black and gold, moving his arm like a puppet","layers":[["base",[50,50],null],["fore",[68.79,58.35],"upper"],["upper",[60.0,37.52],null]]},"dancer":{"w":356,"h":633,"label":"A wayang dancer in black and gold, slowly dancing","layers":[["base",[50,50],null],["armR",[81.04,39.72],null],["armL",[30.73,44.47],null]]},"mask":{"w":330,"h":462,"label":"A black and gold Javanese mask, gently floating","layers":[["base",[50,50],null]]},"crown":{"w":387,"h":370,"label":"A black and gold Javanese crown, light catching its gold","layers":[["base",[50,50],null]]},"keris":{"w":659,"h":177,"label":"A black and gold keris dagger, light running along the blade","layers":[["base",[50,50],null]]},"garuda":{"w":368,"h":339,"label":"A black and gold garuda with spread wings, soaring","layers":[["base",[50,50],null]]},"flower":{"w":344,"h":373,"label":"A black and gold flower ornament, slowly blooming","layers":[["base",[50,50],null],["top",[50,23],null],["flowerL",[40,72],null],["flowerR",[60,72],null],["centre",[50,54],null],["leafL",[45,86],null],["leafR",[55,86],null],["bud",[50,94],null]]},"gamelan":{"w":538,"h":198,"label":"A black and gold gamelan, its mallets striking the gongs","layers":[["base",[50,50],null],["mallets",[64.13,84.34],null]]},"gate":{"w":424,"h":378,"label":"A black and gold Balinese split gate, light rising through it","layers":[["base",[50,50],null]]}};
  var DIR = (document.currentScript && document.currentScript.src || '').replace(/[^/]*$/, '') + 'art/motion/';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function paused() { return root.classList.contains('wayang-paused'); }
  function set(p) {
    root.classList.toggle('wayang-paused', p);
    var b = document.querySelectorAll('.wy-pause');
    for (var i = 0; i < b.length; i++) {
      b[i].setAttribute('aria-pressed', p ? 'true' : 'false');
      b[i].setAttribute('aria-label', (p ? 'Play' : 'Pause') + ' the animation');
    }
  }
  // one layer: the drawing's shape painted in the colour system's light colour, its gold parts in the accent colour,
  // and the moving light over those parts
  function layer(name, nm, org, inner) {
    var f = DIR + name + '/' + name + '-' + nm, sh = 'url(' + f + '.webp)', g = 'url(' + f + '-gold.webp)';
    function m(u, cls) { return '<span class="' + cls + '" style="-webkit-mask-image:' + u + ';mask-image:' + u + '"></span>'; }
    return '<span class="wy-l wy-' + name + '-' + nm + '" style="transform-origin:' + org[0] + '% ' + org[1] + '%">' +
      m(sh, 'wy-ink') + m(g, 'wy-acc') + m(g, 'wy-gold') + (inner || '') + '</span>';
  }
  function html(name, o) {
    var c = CFG[name]; if (!c) return '';
    o = o || {};
    var kids = {}, top = [];
    c.layers.forEach(function (l) { if (l[2]) (kids[l[2]] = kids[l[2]] || []).push(l); else top.push(l); });
    function build(l) { return layer(name, l[0], l[1], (kids[l[0]] || []).map(build).join('')); }
    var fig = o.decor ? 'aria-hidden="true"' : 'role="img" aria-label="' + esc(o.label || c.label) + '"';
    var p = paused();
    if (o.once) o.nopause = true;
    return '<span class="wy wy-' + name + (o.once ? ' wy-once' : '') + (o.cls ? ' ' + esc(o.cls) : '') + '" style="aspect-ratio:' + c.w + '/' + c.h + '">' +
      '<span class="wy-fig" ' + fig + '>' + top.map(build).join('') + '</span>' + (o.nopause ? '</span>' :
      '<button class="wy-pause" type="button" aria-pressed="' + p + '" aria-label="' + (p ? 'Play' : 'Pause') + ' the animation">' +
      '<svg class="wy-i-stop" viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="1" width="3" height="10"/><rect x="7" y="1" width="3" height="10"/></svg>' +
      '<svg class="wy-i-play" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1l8 5-8 5z"/></svg></button></span>');
  }
  function hydrate(scope) {
    var els = (scope || document).querySelectorAll('[data-wayang]:not([data-wy-done])');
    for (var i = 0; i < els.length; i++) {
      var el = els[i]; el.setAttribute('data-wy-done', '');
      el.innerHTML = html(el.getAttribute('data-wayang'), { label: el.getAttribute('data-label'), decor: el.hasAttribute('data-decor'), nopause: el.hasAttribute('data-nopause'), once: el.hasAttribute('data-once') || el.hasAttribute('data-idle') });
      if (el.hasAttribute('data-once') || el.hasAttribute('data-idle')) once(el.firstChild, el.hasAttribute('data-idle'));
    }
  }
  // 'once' drawings play one short pass (under 5 s, so they need no pause button) when they come into view,
  // then rest; hovering or tapping plays them again
  function anims(w) { return w.getAnimations ? w.getAnimations({ subtree: true }) : []; }
  function play(w) {
    if (w.classList.contains('wy-hold')) { w.classList.remove('wy-hold'); anims(w).forEach(function (x) { x.currentTime = 0; }); return; }
    var a = anims(w);
    if (a.some(function (x) { return x.playState === 'running'; })) return;
    a.forEach(function (x) { x.currentTime = 0; x.play(); });
  }
  var onceAll = [], seen = null;
  // data-idle: stays still until the page is left idle (no first pass when it comes into view)
  function once(w, idleOnly) {
    onceAll = onceAll.filter(function (x) { if (x.isConnected) return true; if (seen) seen.unobserve(x); return false; });
    onceAll.push(w);
    // held by a class from its first frame (wayang.css), so a drawing that is redrawn never twitches; no style is read here
    w.classList.add('wy-hold');
    w._wyFirst = !idleOnly;
    if ('IntersectionObserver' in window) {
      seen = seen || new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          var x = e.target; x._wyVis = e.isIntersecting;
          if (e.isIntersecting && x._wyFirst) { x._wyFirst = false; setTimeout(function () { if (x.isConnected) play(x); }, 250); }
        });
      }, { threshold: .5 });
      seen.observe(w);
    } else { w._wyVis = true; if (!idleOnly) play(w); }
    w.addEventListener('pointerenter', function () { play(w); });
    w.addEventListener('click', function () { play(w); });
  }
  // when the visitor leaves the page idle, the drawings on screen come back to life: one pass after 8 s without
  // pointer, touch, scroll or keys, then again every 20 s, at most 3 times, until the visitor does something
  var IDLE_FIRST = 8000, IDLE_EVERY = 20000, IDLE_MAX = 3, last = Date.now(), plays = 0, next = IDLE_FIRST;
  ['pointermove', 'pointerdown', 'keydown', 'scroll', 'wheel', 'touchstart'].forEach(function (t) {
    addEventListener(t, function () { last = Date.now(); plays = 0; next = IDLE_FIRST; }, { passive: true, capture: true });
  });
  setInterval(function () {
    if (!onceAll.length || document.hidden || plays >= IDLE_MAX || Date.now() - last < next) return;
    onceAll.forEach(function (w) { if (w._wyVis && w.isConnected) play(w); });
    plays++; last = Date.now(); next = IDLE_EVERY;
  }, 1000);
  try { set(localStorage.getItem(KEY) === '1'); } catch (e) { set(false); }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.wy-pause');
    if (!b) return;
    var p = !paused(); set(p);
    try { localStorage.setItem(KEY, p ? '1' : '0'); } catch (e2) {}
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { hydrate(); }); else hydrate();
  window.NgopiWayang = { html: html, hydrate: hydrate, names: Object.keys(CFG) };
})();
