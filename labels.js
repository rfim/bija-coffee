/* QR label maker (labels.html): builds trace.html links and draws an A4 sheet of 21 labels with their QR codes. Nothing leaves the browser. */
(() => {
  const S = window.BijaShop, $ = (id) => document.getElementById(id);
  const esc = S.esc;
  // Codes point at the site this page is served from; the GitHub Pages demo address is only the fallback for local files.
  const LIVE = location.protocol === 'https:' ? new URL('trace.html', location.href).href : 'https://rfim.github.io/bija-coffee/trace.html';
  const BEANS = ['house', 'mandheling', 'lintong', 'java', 'gayo', 'kintamani'];
  // L7160 geometry in millimetres
  const COLS = 3, ROWS = 7, W = 63.5, H = 38.1, TOP = 15.15, LEFT = 7.25, PITCH_X = 66.04, PITCH_Y = 38.1;
  const MARK = '<svg viewBox="-2 -2 104 104" aria-hidden="true"><g fill="none" stroke="#000" stroke-width="8"><circle cx="50" cy="25" r="25"/><circle cx="75" cy="50" r="25"/><circle cx="50" cy="75" r="25"/><circle cx="25" cy="50" r="25"/></g></svg>';
  const londonToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const short = (ymd) => new Date(ymd + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/London' });
  const clean = (v, max) => String(v || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max);
  const num = (v, lo, hi, d) => { const n = Math.floor(+v); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d; };

  // a QR code as one SVG path, with a 2-module quiet zone
  function qrSvg(text) {
    const q = qrcode(0, 'M'); q.addData(text); q.make();
    const n = q.getModuleCount(), m = 2; let d = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c + m} ${r + m}h1v1h-1z`;
    return `<svg class="qr" viewBox="0 0 ${n + m * 2} ${n + m * 2}" shape-rendering="crispEdges" role="img" aria-label="QR code"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
  }

  const f = $('lf');
  $('f-b').innerHTML = BEANS.map((id) => S.byId(id)).map((p) => `<option value="${p.id}">${esc(p.name)}${p.soon ? ' (coming soon)' : ''}</option>`).join('');
  $('f-b').value = 'lintong';
  $('f-r').value = londonToday(); $('f-r').max = londonToday();

  function read() {
    const b = BEANS.includes(f.b.value) ? f.b.value : 'house';
    const r = /^\d{4}-\d{2}-\d{2}$/.test(f.r.value) && f.r.value <= londonToday() ? f.r.value : '';
    return { b, r, l: clean(f.l.value, 24), fm: clean(f.f.value, 60), h: clean(f.h.value, 30), c: f.c.value === 'cup' ? 'cup' : 'bag',
      n: num(f.n.value, 1, 21, 21), s: num(f.s.value, 1, 21, 1), base: f.base.value === 'here' ? new URL('trace.html', location.href).href : LIVE };
  }
  const urlFor = (o) => {
    const u = new URLSearchParams({ b: o.b }); if (o.r) u.set('r', o.r); if (o.l) u.set('l', o.l); if (o.fm) u.set('f', o.fm); if (o.h) u.set('h', o.h); if (o.c === 'cup') u.set('c', 'cup');
    return o.base + '?' + u.toString();
  };

  function draw() {
    const o = read(), p = S.byId(o.b), url = urlFor(o), qr = qrSvg(url);
    $('lf-err').textContent = o.r ? '' : 'Choose the roast date: today or earlier.';
    f.r.setAttribute('aria-invalid', String(!o.r));
    const used = Math.min(o.n, 21 - o.s + 1);
    let html = '';
    for (let i = 0; i < COLS * ROWS; i++) {
      const col = i % COLS, row = Math.floor(i / COLS), on = i >= o.s - 1 && i < o.s - 1 + used;
      const pos = `left:${(LEFT + col * PITCH_X).toFixed(2)}mm;top:${(TOP + row * PITCH_Y).toFixed(2)}mm`;
      html += on ? `<div class="lab" style="${pos}">${qr}<div class="tx"><span class="br">${MARK}BIJA</span><span class="nm">${esc(p.name)}</span>
        <span class="mt">${o.r ? 'Roasted ' + esc(short(o.r)) : ''}${o.l ? '<br>Lot ' + esc(o.l) : ''}</span><span class="cta">${o.c === 'cup' ? 'Scan me: the coffee in your cup' : 'Scan me: where your coffee comes from'}</span></div></div>`
        : `<div class="lab blank" style="${pos}" aria-hidden="true"></div>`;
    }
    $('sheet').innerHTML = html;
    $('pv-n').textContent = `${used} label${used === 1 ? '' : 's'}, starting at label ${o.s}`;
    $('test').innerHTML = `Each code opens: <a href="${esc(url)}" target="_blank" rel="noopener">${esc(url.replace(/^https?:\/\//, ''))}</a>`;
    fit();
  }
  // scale the real-size sheet to the preview width
  function fit() {
    const box = $('fit'), sheet = $('sheet'), w = box.parentElement.clientWidth - parseFloat(getComputedStyle(box.parentElement).paddingLeft) * 2;
    const k = Math.min(1, w / sheet.offsetWidth);
    sheet.style.transform = `scale(${k})`; box.style.width = sheet.offsetWidth * k + 'px'; box.style.height = sheet.offsetHeight * k + 'px';
  }

  f.addEventListener('input', draw); f.addEventListener('change', draw);
  $('guides').addEventListener('change', (e) => $('sheet').classList.toggle('guides', e.target.checked));
  $('print').addEventListener('click', () => { if (!read().r) { $('f-r').focus(); return; } window.print(); });
  addEventListener('resize', fit);
  draw();
})();
