/* Bija discovery layer: opening status (London time), the origins map, the Find your kopi quiz,
   brew guides with ratio and timer, and the delivery-day estimate. Uses window.BijaShop from site-shop.js. */
(() => {
  const S = () => window.BijaShop;
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MARK = '<circle cx="50" cy="25" r="25"/><circle cx="75" cy="50" r="25"/><circle cx="50" cy="75" r="25"/><circle cx="25" cy="50" r="25"/>';

  // ---------- opening hours in London time ----------
  const HOURS = [['Monday', 8, 17.5], ['Tuesday', 8, 17.5], ['Wednesday', 8, 17.5], ['Thursday', 8, 17.5], ['Friday', 8, 17.5], ['Saturday', 11, 18], ['Sunday', 12, 18]];
  const hm = (h) => { const H = Math.floor(h), M = Math.round((h - H) * 60), ap = H >= 12 ? 'pm' : 'am', h12 = ((H + 11) % 12) + 1; return M ? `${h12}.${String(M).padStart(2, '0')}${ap}` : `${h12}${ap}`; };
  function london(d = new Date()) {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', weekday: 'long', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(d);
    const g = (t) => parts.find((x) => x.type === t)?.value;
    return { day: g('weekday'), h: (+g('hour') % 24) + +g('minute') / 60 };
  }
  function status(d) {
    const now = london(d), i = HOURS.findIndex((x) => x[0] === now.day), [, o, c] = HOURS[i];
    if (now.h >= o && now.h < c) { const left = c - now.h; return { open: true, text: `Open now · until ${hm(c)}`, soon: left <= .5 ? `Closing in ${Math.max(1, Math.round(left * 60))} minutes` : '' }; }
    if (now.h < o) return { open: false, text: `Closed · opens ${hm(o)} today` };
    const n = HOURS[(i + 1) % 7]; return { open: false, text: `Closed · opens ${hm(n[1])} ${n[0] === 'Monday' && now.day === 'Sunday' ? 'Monday' : 'tomorrow'}` };
  }

  // ---------- delivery estimate (Royal Mail Tracked 48) ----------
  // Assumption to confirm with Bija: orders placed by 1pm on a working day are packed the same day.
  const BANK = ['2026-01-01', '2026-04-03', '2026-04-06', '2026-05-04', '2026-05-25', '2026-08-31', '2026-12-25', '2026-12-28', '2027-01-01', '2027-03-26', '2027-03-29', '2027-05-03', '2027-05-31', '2027-08-30', '2027-12-27', '2027-12-28'];
  const CUTOFF = 13;
  function londonDate(d = new Date()) { const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d); return f; }
  const addDay = (iso, n) => { const t = new Date(iso + 'T12:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
  const isWork = (iso) => { const w = new Date(iso + 'T12:00:00Z').getUTCDay(); return w !== 0 && w !== 6 && !BANK.includes(iso); };
  const nextWork = (iso) => { let x = iso; do x = addDay(x, 1); while (!isWork(x)); return x; };
  const ukDay = (iso) => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
  function delivery(d = new Date()) {
    const today = londonDate(d), h = london(d).h;
    const ship = isWork(today) && h < CUTOFF ? today : nextWork(today);
    const a = nextWork(nextWork(ship)), b = nextWork(a);
    const left = isWork(today) && h < CUTOFF ? CUTOFF - h : 0;
    return { ship, from: a, to: b, shipText: ship === today ? 'today' : ukDay(ship), left, text: `${ukDay(a).replace(/ \d+ \w+$/, (m) => m)} – ${ukDay(b)}` };
  }
  function deliveryHTML(d) {
    const e = delivery(d), mins = Math.round(e.left * 60);
    const cut = e.left > 0 ? `Order in the next <b>${mins >= 60 ? `${Math.floor(mins / 60)} hr ${mins % 60} min` : `${mins} min`}</b> and we pack it today.` : `We pack it on <b>${esc(e.shipText)}</b>.`;
    return `<div class="eta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17" cy="17.5" r="1.6"/></svg>
      <p>${cut} Royal Mail Tracked 48 usually arrives <b>${esc(ukDay(e.from))}</b> to <b>${esc(ukDay(e.to))}</b>. Or collect it free from the bar.</p></div>`;
  }

  // ---------- origins ----------
  const LON0 = 94.5, LAT0 = 6.8, K = 10;
  const pt = (lon, lat) => [((lon - LON0) * K).toFixed(1), ((LAT0 - lat) * K).toFixed(1)];
  const poly = (pts) => 'M' + pts.map(([a, b]) => pt(a, b).join(' ')).join(' L') + ' Z';
  // simplified outlines, drawn by hand from lon/lat (not to survey accuracy)
  const LAND = {
    sumatra: [[95.3, 5.6], [96.5, 5.2], [97.6, 5.2], [98.6, 3.9], [100.4, 2.2], [101.4, 1.8], [102.6, 0.8], [103.8, -0.6], [104.6, -2.1], [106.1, -3.0], [105.9, -4.8], [105.7, -5.9], [104.6, -5.9], [103.4, -4.8], [102.2, -3.8], [101.2, -2.6], [100.4, -1.1], [99.5, 0.1], [98.7, 1.7], [97.6, 2.8], [96.6, 3.7], [95.5, 4.6]],
    java: [[105.2, -6.8], [106.1, -5.9], [107.6, -6.0], [108.6, -6.7], [110.4, -6.9], [111.4, -6.6], [112.7, -6.9], [113.6, -7.6], [114.6, -7.7], [114.4, -8.6], [113.0, -8.3], [111.0, -8.2], [109.4, -7.8], [108.0, -7.8], [106.4, -7.4], [105.4, -7.0]],
    bali: [[114.45, -8.15], [115.1, -8.05], [115.7, -8.4], [115.2, -8.8], [114.6, -8.45]],
    lombok: [[116.0, -8.3], [116.7, -8.3], [116.6, -8.9], [116.0, -8.8]],
    sumbawa: [[116.9, -8.4], [118.2, -8.2], [119.1, -8.6], [118.4, -8.9], [117.0, -9.0]],
    flores: [[119.8, -8.4], [121.5, -8.5], [123.0, -8.2], [122.8, -8.7], [120.5, -8.8]],
    borneo: [[109.0, 1.6], [109.7, 2.1], [111.2, 1.8], [113.2, 3.2], [115.3, 4.9], [116.8, 6.9], [119.2, 5.3], [118.1, 4.2], [117.7, 1.2], [116.6, -1.2], [116.2, -3.8], [114.5, -3.6], [111.5, -3.1], [110.1, -1.9], [109.1, -0.2]],
    malay: [[100.3, 6.4], [101.2, 5.7], [102.3, 6.2], [103.4, 4.0], [104.2, 1.4], [103.4, 1.3], [101.3, 2.8], [100.4, 4.4]],
  };
  const ORIGINS = [
    { id: 'gayo', name: 'Aceh Gayo', island: 'Sumatra', lon: 96.85, lat: 4.62, product: 'gayo' },
    { id: 'lintong', name: 'Lintong', island: 'Sumatra', lon: 98.9, lat: 2.28, product: 'lintong' },
    { id: 'mandheling', name: 'Mandheling', island: 'Sumatra', lon: 99.5, lat: 0.85, product: 'mandheling' },
    { id: 'java', name: 'Old Brown Java', island: 'Java', lon: 110.6, lat: -7.4, product: 'java' },
    { id: 'kintamani', name: 'Kintamani', island: 'Bali', lon: 115.35, lat: -8.25, product: 'kintamani' },
  ];
  function mapSVG(sel = '') {
    const lands = Object.entries(LAND).map(([k, v]) => `<path class="land ${['sumatra', 'java', 'bali'].includes(k) ? 'grow' : ''}" d="${poly(v)}"/>`).join('');
    const [tx, ty] = pt(98.9, 2.6);
    const pins = ORIGINS.map((o, i) => { const [x, y] = pt(o.lon, o.lat); return `<g class="pin ${o.id === sel ? 'on' : ''}" data-origin="${o.id}" transform="translate(${x} ${y})" style="--i:${i}"><circle class="halo" r="11"/><circle class="dot" r="5"/></g>`; }).join('');
    return `<svg class="omap" viewBox="0 0 300 172" role="img" aria-labelledby="omap-t"><title id="omap-t">Map of Indonesia showing where Bija's coffees grow: Aceh Gayo, Lintong and Mandheling in Sumatra, Old Brown Java in Java, and Kintamani in Bali</title>
      <defs><pattern id="omap-sea" width="16" height="16" patternUnits="userSpaceOnUse"><g fill="currentColor" fill-opacity=".05"><ellipse cx="8" cy="3.5" rx="2" ry="3.4"/><ellipse cx="8" cy="12.5" rx="2" ry="3.4"/><ellipse cx="3.5" cy="8" rx="3.4" ry="2"/><ellipse cx="12.5" cy="8" rx="3.4" ry="2"/></g></pattern></defs>
      ${lands}<ellipse class="lake" cx="${tx}" cy="${ty}" rx="4.5" ry="2.6"/>
      <path class="eq" d="M0 ${pt(0, 0)[1]} H300"/><text class="eqt" x="296" y="${+pt(0, 0)[1] - 4}" text-anchor="end">Equator</text>
      <g class="lbl" aria-hidden="true"><text x="${pt(100.5, 3.4)[0]}" y="${pt(100.5, 3.4)[1]}">SUMATRA</text><text x="${pt(108.6, -9.4)[0]}" y="${pt(108.6, -9.4)[1]}">JAVA</text><text x="${pt(114.2, -9.6)[0]}" y="${pt(114.2, -9.6)[1]}">BALI</text><text x="${pt(112.6, 0.4)[0]}" y="${pt(112.6, 0.4)[1]}">BORNEO</text></g>
      ${pins}</svg>`;
  }

  // ---------- Find your kopi ----------
  const QUIZ = [
    { k: 'brew', q: 'How do you make coffee at home?', a: [['espresso', 'Espresso machine', 'Espresso'], ['moka', 'Moka pot', 'Moka pot'], ['cafetiere', 'Cafetière', 'Cafetière'], ['v60', 'V60 or pour-over', 'V60'], ['aeropress', 'AeroPress', 'AeroPress'], ['filter', 'Filter machine', 'Filter'], ['grinder', 'I grind my own', 'Whole bean']] },
    { k: 'milk', q: 'Milk, or black?', a: [['milk', 'Mostly with milk'], ['black', 'Black'], ['iced', 'Iced, most of the year']] },
    { k: 'taste', q: 'Which sounds most like you?', a: [['choc', 'Chocolate and caramel'], ['dark', 'Dark chocolate, deep and syrupy'], ['herbal', 'Herbal, cocoa, big body'], ['woody', 'Woody, spicy, very smooth'], ['bright', 'Bright and fruity']] },
    { k: 'strength', q: 'How strong?', a: [['gentle', 'Gentle'], ['balanced', 'Balanced'], ['bold', 'Bold']] },
    { k: 'often', q: 'How fast do you get through 200 g?', a: [['2w', 'About two weeks'], ['3w', 'Three weeks'], ['4w', 'A month'], ['once', 'Just trying it for now']] },
  ];
  const SCORE = {
    house: { choc: 4, milk: 2, gentle: 2, balanced: 2, espresso: 1, moka: 1 },
    mandheling: { dark: 4, milk: 2, bold: 2, espresso: 1, moka: 1, iced: 1 },
    lintong: { herbal: 4, bold: 2, black: 1, cafetiere: 2, espresso: 1, balanced: 1 },
    java: { woody: 4, iced: 2, gentle: 1, black: 1, espresso: 1, aeropress: 1 },
    // Kintamani is coming soon: bright, fruity cups go to it with a fallback in stock
    kintamani: { bright: 5, v60: 2, filter: 2, black: 1, aeropress: 1 },
  };
  function recommend(ans) {
    const total = (id) => Object.values(ans).reduce((n, v) => n + (SCORE[id][v] || 0), 0);
    const ranked = Object.keys(SCORE).map((id) => [id, total(id)]).sort((a, b) => b[1] - a[1]);
    const pick = ranked[0][0], alt = ranked.find(([id]) => id !== pick && !S().byId(id).soon)[0];
    const grind = QUIZ[0].a.find((x) => x[0] === ans.brew)?.[2] || 'Whole bean';
    return { pick, alt, grind, plan: ans.often || 'once' };
  }
  const WHY = {
    house: 'round and chocolatey, made to sit under milk',
    mandheling: 'deep, syrupy and dark, the classic Sumatran cup',
    lintong: 'herbal and cocoa-rich with a heavy body and low acidity',
    java: 'aged before roasting, so it is woody, gently spiced and very smooth',
    kintamani: 'bright and citrusy from the volcanic slopes of Mount Batur',
  };

  // ---------- brew guides ----------
  const METHODS = {
    v60: { name: 'V60', grind: 'V60', ratio: 250 / 15, dose: 15, temp: '94°C', unit: 'g', steps: [['Rinse the paper and warm the cup', 0], ['Bloom with 40 g of water', 45], ['Pour slowly in circles to 150 g', 30], ['Pour to the full amount', 30], ['Let it drain', 60]] },
    cafetiere: { name: 'Cafetière', grind: 'Cafetière', ratio: 500 / 30, dose: 30, temp: 'Just off the boil', unit: 'ml', steps: [['Add all the water and stir', 15], ['Lid on, let it steep', 225], ['Skim the crust off the top', 20], ['Plunge slowly and pour', 30]] },
    aeropress: { name: 'AeroPress', grind: 'AeroPress', ratio: 200 / 15, dose: 15, temp: '85 to 90°C', unit: 'g', steps: [['Add the water', 10], ['Stir gently', 10], ['Steep', 70], ['Press slowly', 30]] },
    moka: { name: 'Moka pot', grind: 'Moka pot', ratio: 7.5, dose: 20, temp: 'Hot water in the base', unit: 'ml', steps: [['Fill the base with hot water to the valve', 20], ['Fill the basket level, do not tamp', 20], ['Medium heat, lid open', 150], ['Off the heat as it starts to gurgle', 10]] },
    espresso: { name: 'Espresso', grind: 'Espresso', ratio: 2, dose: 18, temp: 'Machine default', unit: 'g', steps: [['Dose, level and tamp', 0], ['Pull the shot', 28]] },
  };

  const STREET = `<svg viewBox="0 0 600 380" role="img" aria-labelledby="sm-t sm-d"><title id="sm-t">Sketch map of St James's Market</title><desc id="sm-d">Bija is in St James's Market, the block between Regent Street St James's and Haymarket, south of Jermyn Street and north of Charles II Street. From Piccadilly Circus station, walk south down Regent Street St James's for about two minutes.</desc>
          <rect class="sq" x="372" y="120" width="76" height="72" rx="6"/>
          <g class="rdo" stroke-width="30"><path d="M0 70 L390 36"/><path d="M366 40 V380"/><path d="M462 30 V380"/><path d="M20 112 H600"/><path d="M200 206 H600"/><path d="M0 330 H600"/></g>
          <g class="rd" stroke-width="22"><path d="M0 70 L390 36"/><path d="M366 40 V380"/><path d="M462 30 V380"/><path d="M20 112 H600"/><path d="M200 206 H600"/><path d="M0 330 H600"/></g>
          <path class="walk" d="M396 40 L372 56 V140 L404 152"/>
          <g transform="translate(396 34)"><circle r="13" fill="#0b0b0b"/><path d="M-7 0 H7 M-6 -5 a7 7 0 0 1 12 0 M-6 5 a7 7 0 0 0 12 0" stroke="#fff" stroke-width="1.6" fill="none"/></g>
          <g transform="translate(412 156)"><circle r="20" fill="#0b0b0b"/><g transform="translate(-12 -12) scale(.24)" fill="none" stroke="#fff" stroke-width="7"><circle cx="50" cy="25" r="25"/><circle cx="75" cy="50" r="25"/><circle cx="50" cy="75" r="25"/><circle cx="25" cy="50" r="25"/></g></g>
          <g aria-hidden="true"><text x="60" y="52" transform="rotate(-5 60 52)">PICCADILLY</text><text x="420" y="26">PICCADILLY CIRCUS</text><text x="40" y="104">JERMYN STREET</text><text x="210" y="198">CHARLES II STREET</text><text x="40" y="322">PALL MALL</text><text x="356" y="300" transform="rotate(-90 356 300)">REGENT ST ST JAMES'S</text><text x="476" y="300" transform="rotate(-90 476 300)">HAYMARKET</text><text x="380" y="214" style="font-size:8px">ST JAMES'S MARKET</text><text x="438" y="186" style="font-weight:700;fill:#0b0b0b;font-size:11px">BIJA</text><text x="12" y="88" style="font-size:8px">← GREEN PARK</text><text x="520" y="100" style="font-size:8px">LEICESTER SQ →</text></g>
        </svg>`;
  // fill [data-streetmap] and [data-minimap] slots on any page that loads this file
  function slots() {
    document.querySelectorAll('[data-streetmap]').forEach((el) => { el.innerHTML = STREET; });
    document.querySelectorAll('[data-minimap]').forEach((el) => { el.innerHTML = mapSVG('').replace('role="img" aria-labelledby="omap-t"', 'aria-hidden="true" focusable="false"').replace(/<title.*?<\/title>/, ''); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', slots); else slots();

  window.BijaDiscover = { STREET, HOURS, hm, london, status, delivery, deliveryHTML, ukDay, ORIGINS, mapSVG, QUIZ, recommend, WHY, METHODS, MARK, esc, reduce };
})();
