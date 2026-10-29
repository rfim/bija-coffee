/* Bean passport (trace.html). Everything shown comes from the QR's URL and the shop catalogue in site-shop.js:
   ?b=<bean id>&r=<roast date YYYY-MM-DD>&l=<lot>&f=<farm or co-op>&h=<harvest>&c=<bag|cup>
   Nothing is sent anywhere. Unknown beans and bad dates are ignored, and all text from the URL is escaped. */
(() => {
  const S = window.BijaShop;
  const root = document.getElementById('passport');
  const esc = S ? S.esc : (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MARK = '<g fill="none" stroke="currentColor" stroke-width="3"><circle cx="50" cy="25" r="25"/><circle cx="75" cy="50" r="25"/><circle cx="50" cy="75" r="25"/><circle cx="25" cy="50" r="25"/></g>';
  const mark = (cls) => `<svg class="${cls}" viewBox="-2 -2 104 104" aria-hidden="true" focusable="false">${MARK}</svg>`;

  // ---------- reading the code ----------
  const BEANS = ['house', 'mandheling', 'lintong', 'java', 'gayo', 'kintamani'];
  const q = new URLSearchParams(location.search);
  const clean = (v, max) => String(v || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max);
  const londonToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const dayNo = (ymd) => { const [y, m, d] = ymd.split('-').map(Number); return Date.UTC(y, m - 1, d) / 864e5; };
  const ukDate = (ymd) => new Date(ymd + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/London' });
  const addDays = (ymd, n) => new Date((dayNo(ymd) + n) * 864e5 + 432e5).toISOString().slice(0, 10);
  function roastDate(v) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v || '')) return null;
    const [y, m, d] = v.split('-').map(Number), t = new Date(Date.UTC(y, m - 1, d));
    if (t.getUTCFullYear() !== y || t.getUTCMonth() !== m - 1 || t.getUTCDate() !== d) return null; // 2026-02-31 and friends
    const age = dayNo(londonToday()) - dayNo(v);
    return age < 0 || age > 730 ? null : v; // not in the future, not older than two years
  }
  const code = {
    b: BEANS.includes(q.get('b')) ? q.get('b') : null,
    r: roastDate(q.get('r')),
    l: clean(q.get('l'), 24),
    f: clean(q.get('f'), 60),
    h: clean(q.get('h'), 30),
    c: q.get('c') === 'cup' ? 'cup' : 'bag',
  };

  // ---------- map of Indonesia (simplified outlines, longitude/latitude → SVG) ----------
  const X = (lon) => ((lon - 94) * 20.5).toFixed(1), Y = (lat) => ((7 - lat) * 24).toFixed(1);
  const poly = (pts) => 'M' + pts.map(([lo, la]) => `${X(lo)} ${Y(la)}`).join('L') + 'Z';
  const ISLANDS = {
    sumatra: [[95.3, 5.6], [97.5, 5.2], [98.7, 3.8], [100.3, 2.3], [101.4, 1.7], [103.4, .5], [104.5, -1.5], [106, -3.2], [105.9, -5.8], [104.6, -5.9], [102.3, -4], [101, -2.4], [100.3, -1], [99.1, .2], [98.5, 1.7], [97.3, 2.9], [96.2, 4.1], [95.2, 5.2]],
    java: [[105.2, -6.8], [106.1, -6], [108.3, -6.2], [110.4, -6.9], [112.6, -6.9], [114.4, -7.7], [114.5, -8.6], [112.7, -8.4], [110.7, -8.2], [108.2, -7.8], [106.4, -7.4], [105.3, -6.9]],
    bali: [[114.6, -8.1], [115.7, -8.2], [115.6, -8.8], [114.9, -8.6]],
    lombok: [[116.1, -8.4], [116.7, -8.3], [116.6, -8.9], [116, -8.8]],
    sumbawa: [[117, -8.3], [119, -8.4], [118.8, -8.9], [117.1, -9]],
    flores: [[119.9, -8.4], [122.9, -8.1], [122.8, -8.7], [120, -8.8]],
    timor: [[123.6, -10.3], [125.2, -9], [127, -8.4], [125, -9.6], [124, -10.4]],
    borneo: [[109, 1.9], [109.6, -1], [110.2, -2.9], [111.6, -3.4], [114.5, -3.6], [116.3, -3.9], [116.6, -1.5], [117.9, .8], [119, 1], [118, 2.4], [117.6, 4.2], [116.4, 6.9], [115.1, 5], [113.8, 4.4], [111.4, 2.5], [110.3, 1.7]],
    sulawesi: [[118.9, -3], [119.5, -5.6], [120.5, -5.6], [120.4, -2.9], [121.4, -4.7], [122.8, -4.8], [121.5, -2.2], [123.2, -1], [121.3, -1.2], [120.6, .5], [124.9, 1.5], [125.2, 1.3], [124.2, .4], [121.2, .4], [121.3, -.6], [120, -.6], [119.2, -1.4]],
    seram: [[128.2, -3.2], [130.8, -3.4], [130.5, -3.8], [128.3, -3.6]],
    papua: [[131, -1], [132.5, -.4], [134.2, -.9], [135.5, -3.3], [137.9, -1.5], [141, -2.6], [141, -9.1], [139.1, -8.1], [137.6, -8.4], [138.6, -6.8], [137.9, -5.1], [134.6, -4], [133.6, -3.9], [132.8, -4], [132, -2.8], [133.2, -2.2], [131.9, -1.6]],
  };
  const PIN = {
    gayo: { lon: 96.85, lat: 4.62, at: 'Gayo highlands', island: 'sumatra' },
    lintong: { lon: 98.85, lat: 2.3, at: 'Lintong Nihuta', island: 'sumatra' },
    mandheling: { lon: 99.4, lat: .9, at: 'Mandailing', island: 'sumatra' },
    java: { lon: 112.5, lat: -7.7, at: 'Java', island: 'java' },
    kintamani: { lon: 115.35, lat: -8.25, at: 'Kintamani', island: 'bali' },
  };
  function mapSvg(id) {
    const pin = PIN[id];
    const land = Object.entries(ISLANDS).map(([k, pts]) => `<path class="land ${pin && pin.island === k ? 'hot' : ''}" d="${poly(pts)}"/>`).join('');
    const marker = pin ? `<circle class="ring" cx="${X(pin.lon)}" cy="${Y(pin.lat)}" r="16"/><circle class="pinr" cx="${X(pin.lon)}" cy="${Y(pin.lat)}" r="11"/><circle class="pinc" cx="${X(pin.lon)}" cy="${Y(pin.lat)}" r="4.5"/>
      <text class="lbl" x="${+X(pin.lon) + 20}" y="${+Y(pin.lat) + 5}">${esc(pin.at)}</text>` : '';
    return `<svg viewBox="0 0 980 440" role="img" aria-labelledby="map-t"><title id="map-t">${pin ? `Map of Indonesia with ${esc(pin.at)} marked` : 'Map of Indonesia'}</title>
      <text class="sea" x="250" y="420">Indian Ocean</text><text class="sea" x="300" y="292">Java Sea</text>${land}${marker}</svg>`;
  }

  // ---------- words ----------
  const PROCESS = {
    'Wet-hulled (giling basah)': 'Hulled while the beans are still damp, the Sumatran way. It gives the heavy body and earthy, cocoa notes.',
    'Aged for years before roasting': 'Rested in the warehouse for years after harvest, the old Javanese way. The acidity fades and woody, spicy notes come through.',
    'Wet-hulled or washed': 'Most Gayo coffee is wet-hulled; some lots are washed for a cleaner cup. Bija will say which one this is.',
    'Washed or natural': 'Washed lots taste bright and clean; naturals dry in the cherry for more fruit. Bija will say which one this is.',
    Mixed: 'Each coffee in the blend is processed in its own way.',
  };
  const BREWS = (p) => {
    const u = (p.use || '').toLowerCase(), out = [];
    if (/espresso|milk|bar/.test(u)) out.push('Espresso');
    if (/cafeti/.test(u)) out.push('Cafetière');
    if (/filter/.test(u)) out.push('Filter', 'V60');
    if (/iced/.test(u)) out.push('AeroPress');
    return [...new Set(out.length ? out : ['Cafetière'])];
  };

  function freshness() {
    if (!code.r) return '';
    const age = dayNo(londonToday()) - dayNo(code.r), pos = Math.min(age, 60) / 60 * 100;
    const [title, text] = age < 7 ? [`Resting · day ${age}`, `Freshly roasted. Coffee tastes best after about a week of rest, so it will be at its best from ${ukDate(addDays(code.r, 7))}.`]
      : age <= 30 ? [`At its best · day ${age}`, `Rested ${age} days. It's best between day 7 and day 30 after roasting, so enjoy it by ${ukDate(addDays(code.r, 30))}.`]
      : age <= 60 ? [`Past its peak · day ${age}`, 'Still good to drink. The brightest flavours fade after a month, so keep the bag sealed and away from light.']
      : [`Brew it soon · day ${age}`, 'Over two months since roasting. It will taste flatter now; it is still fine for cold brew or a cafetière.'];
    return `<section class="fresh" aria-labelledby="fr-h"><div class="top"><span class="eyebrow" id="fr-h">Roasted ${esc(ukDate(code.r))}</span><b>${esc(title)}</b></div>
      <div class="scale" role="img" aria-label="Freshness: day ${age} after roasting, on a scale where day 7 to day 30 is best"><span class="dot" style="left:${pos.toFixed(1)}%"></span></div>
      <div class="ticks" aria-hidden="true"><span>Roast day</span><span>Day 7</span><span>Day 30</span><span>Day 60</span></div><p>${esc(text)}</p></section>`;
  }

  function render() {
    const p = code.b && S ? S.byId(code.b) : null;
    if (!p) return renderBad();
    const cup = code.c === 'cup', single = p.type === 'origin', pin = PIN[p.id];
    document.title = `${p.name} · Bean passport · Bija`;
    const fact = (k, v, small, soft) => `<div><dt>${k}</dt><dd class="${soft ? 'soft' : ''}">${v}${small ? `<small>${small}</small>` : ''}</dd></div>`;
    const methods = BREWS(p);
    root.innerHTML = `
      <p class="crumbs"><a href="./">Home</a> / <a href="shop.html">Shop coffee</a> / Bean passport</p>
      <section class="tr-hero">
        <div class="tr-art" style="--pbg:${S.bgFor(p)}">${S.bagArt(p)}<span class="stamp">${cup ? 'In your cup today' : 'Bean passport'}</span>${mark('pin')}</div>
        <div>
          <span class="eyebrow">${cup ? 'You scanned your cup' : 'You scanned your bag'} · ${esc(single ? 'Single origin · ' + p.where : 'Blend · Indonesia')}</span>
          <h1>${esc(p.name)}</h1>
          <p class="lede">${esc(cup ? `Your drink was made with ${p.name}. ${p.blurb}` : p.blurb)}</p>
          <ul class="tr-notes" aria-label="Tasting notes">${p.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>
          ${freshness()}
          <div class="tr-acts">${p.soon ? `<a class="btn" href="product.html?id=${p.id}">Coming soon: get notified</a>` : `<a class="btn" href="product.html?id=${p.id}">Buy this coffee · ${S.money(p.price)}</a>`}</div>
          <ul class="tr-links">${p.soon ? '' : `<li><a href="product.html?id=${p.id}&amp;plan=2w">Subscribe &amp; save 10%</a></li>`}${single ? `<li><a href="app.html?view=app&amp;stamp=${p.id}">Stamp it in your Origins Passport</a></li>` : ''}${cup ? '<li><a href="app.html?view=app">Order it again</a></li>' : ''}<li><button type="button" id="share">Share</button></li></ul>
        </div>
      </section>
      ${cup ? `<section class="cupband"><img src="photos/ig/latte-pour.jpg" alt="A latte being poured at the Bija bar" width="291" height="293" loading="lazy" decoding="async"><div><b>Brewed at 2a St James's Market</b><p>Made at our bar in St James's Market, two minutes from Piccadilly Circus, with ${esc(p.name)}.</p></div></section>` : ''}

      <section class="tr-sec" aria-labelledby="facts-h">
        <div class="sec-h"><div><span class="eyebrow">Where it comes from</span><h2 id="facts-h">The facts</h2></div></div>
        <dl class="tr-facts">
          ${fact('Region', esc(p.where), esc(p.region))}
          ${fact('Altitude', esc(p.altitude))}
          ${fact('Process', esc(p.process))}
          ${fact('Sourced with', 'Kindred Forest', 'Green coffee sourcing partner')}${fact('Roasted by', 'Bija\'s baristas', 'Roasted in-house for freshness')}
          ${fact('Farm or co-op', code.f ? esc(code.f) : 'To be published by Bija', code.f ? '' : 'We share farm names once our importer confirms them', !code.f)}
          ${code.l ? fact('Lot', esc(code.l)) : ''}
          ${code.h ? fact('Harvest', esc(code.h)) : ''}
          ${code.r ? fact('Roast date', esc(ukDate(code.r))) : ''}
        </dl>
      </section>

      <section class="tr-sec" aria-labelledby="map-h">
        <div class="tr-map">
          <figure style="margin:0">${mapSvg(p.id)}<figcaption class="small">${pin ? `${esc(pin.at)}, ${esc(p.where)}, Indonesia.` : 'Indonesia: the islands our coffees come from.'} Map simplified.</figcaption></figure>
          <div><span class="eyebrow">On the map</span><h3 id="map-h">${esc(pin ? pin.at : 'Across the archipelago')}</h3>
            <p>${esc(single ? p.region + '. Grown at ' + p.altitude + '.' : 'Our House Blend brings together Indonesian coffees for a round, chocolatey espresso. Bija will publish the coffees in each batch.')}</p>
</div>
        </div>
      </section>

      <section class="tr-sec" aria-labelledby="j-h">
        <div class="sec-h"><div><span class="eyebrow">From farm to ${cup ? 'cup' : 'kitchen'}</span><h2 id="j-h">The journey</h2></div></div>
        <ol class="journey">
          <li><h3>Farm</h3><p>${esc(code.f ? `Grown by ${code.f}` : `Grown in ${p.where}`)}${p.altitude && p.altitude !== 'Various' ? `, ${esc(p.altitude)} up` : ''}${code.h ? `. Harvest ${esc(code.h)}` : ''}.</p></li>
          <li><h3>Processing</h3><p>${esc(PROCESS[p.process] || p.process)}</p></li>
          <li><h3>Export</h3><p>Green coffee is bagged and shipped from Indonesia to the UK.</p></li>
          <li><h3>Roasted by our baristas</h3><p>Roasted by Bija's baristas${code.r ? ` on ${esc(ukDate(code.r))}` : ''}.</p></li>
          <li class="here"><h3>${cup ? 'Your cup' : 'Your kitchen'}</h3><p>${cup ? 'Brewed at 2a St James\'s Market, London.' : 'Ground and brewed by you. Here\'s how we\'d do it.'}</p></li>
        </ol>
      </section>

      <section class="tr-sec" aria-labelledby="brew-h">
        <div class="brewcard">${mark('mk')}<div><span class="eyebrow">How we'd brew it</span><h3 id="brew-h">${esc(methods[0])}</h3>
          <p id="brew-t">${esc(S.BREW[methods[0]])}</p>
          ${methods.length > 1 ? `<div class="chips" role="group" aria-label="Brew method">${methods.map((m, i) => `<button class="chip" type="button" data-brew="${esc(m)}" aria-pressed="${i === 0}">${esc(m)}</button>`).join('')}</div>` : ''}</div></div>
      </section>

      <section class="tr-sec" aria-labelledby="more-h">
        <div class="sec-h"><div><span class="eyebrow">Taste the islands</span><h2 id="more-h">More from Indonesia</h2></div><a class="more" href="shop.html">Shop all</a></div>
        <div class="pgrid" data-more></div>
      </section>`;
    const more = S.P.filter((x) => x.type === 'origin' && !x.soon && x.id !== p.id).slice(0, 4);
    root.querySelector('[data-more]').innerHTML = more.map((x) => S.card(x)).join('');
  }

  function renderBad() {
    document.title = 'Bean passport · Bija';
    root.innerHTML = `<section class="tr-bad">${mark('mkbig')}<div><span class="eyebrow">Bean passport</span><h1>We couldn't read this code</h1>
      <p>The QR code may be from an older bag, or the link got cut short. Every Bija coffee is in the shop with its region, altitude and process, and our team at 2a St James's Market can tell you about the coffee in your cup.</p>
      <div class="tr-acts" style="margin-top:22px"><a class="btn" href="shop.html">Shop coffee</a><a class="btn ghost" href="app.html?view=app">Open the app</a></div></div></section>`;
  }

  document.addEventListener('click', async (e) => {
    const chip = e.target.closest('[data-brew]');
    if (chip) {
      root.querySelectorAll('[data-brew]').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      root.querySelector('#brew-h').textContent = chip.dataset.brew;
      root.querySelector('#brew-t').textContent = S.BREW[chip.dataset.brew] || '';
      return;
    }
    if (e.target.closest('#share')) {
      const p = S.byId(code.b), data = { title: `${p.name} · Bija`, text: `${p.name} from ${p.where}, roasted for Bija in London.`, url: location.href };
      try { if (navigator.share) { await navigator.share(data); return; } } catch (err) { if (err && err.name === 'AbortError') return; }
      try { await navigator.clipboard.writeText(location.href); S.toast('Link copied. Paste it anywhere to share.'); } catch { S.toast('Copy the address from your browser bar to share.'); }
    }
  });

  if (!S) { root.innerHTML = '<p style="padding:40px 0">This page needs the Bija shop script. Please reload.</p>'; return; }
  render();
})();
