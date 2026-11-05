/* Bija shop layer, shared by the website pages.
   Products, basket (localStorage 'bija.shop.cart'), orders ('bija.shop.orders'), header, basket drawer, footer and product cards.
   Prices include VAT. The checkout is a demo: no payment is taken and nothing leaves this browser. */
(() => {
  // the Bija wordmark as on the shop front at St James's Market (traced from Bija's own logo artwork), same as the app header
  const WORDMARK = '<svg class="wordmark" viewBox="0 0 207.7 100" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M102.0 99.3C100.6 99.1 97.0 98.1 95.3 97.5C91.8 96.1 86.6 92.8 86.0 91.5C85.5 90.6 85.5 90.7 89.2 88.0C90.0 87.4 91.3 86.4 92.2 85.8C94.4 84.2 94.6 84.2 95.6 85.7C98.4 89.9 102.1 92.6 106.2 93.4C112.1 94.4 115.1 92.6 116.4 87.3C117.0 84.5 117.1 83.9 117.1 58.1C117.1 33.7 117.1 33.7 117.4 33.3C117.7 32.9 118.8 32.3 120.7 31.7C121.3 31.4 122.2 31.0 122.8 30.8C124.3 30.2 126.7 29.2 128.0 28.8C128.5 28.5 129.4 28.2 129.9 28.0C130.9 27.5 131.4 27.6 131.6 28.1C131.9 28.7 131.9 66.6 131.6 71.0C131.4 74.5 130.7 79.2 130.2 80.9C130.1 81.4 129.8 82.3 129.7 82.8C128.7 86.6 126.1 91.3 123.7 93.6C120.8 96.2 117.7 97.7 113.4 98.5C112.3 98.7 110.9 99.0 110.3 99.1C109.0 99.3 103.4 99.5 102.0 99.3ZM158.7 99.3C156.1 99.0 152.3 97.6 150.0 96.0C142.0 90.7 139.8 79.0 145.1 70.2C150.1 61.9 162.4 55.4 182.7 50.4C185.2 49.8 186.2 49.4 186.6 49.0C186.9 48.6 186.9 48.6 186.8 44.1C186.7 39.2 186.6 38.3 186.0 35.7C184.6 29.2 181.1 26.4 174.5 26.5C172.1 26.5 170.8 26.7 169.1 27.4C164.4 29.3 161.0 33.5 159.4 39.2C158.9 40.9 158.7 41.4 158.1 41.7C157.7 41.9 146.7 42.0 146.1 41.7C145.4 41.5 145.3 40.8 146.0 38.6C147.9 31.9 154.6 25.9 163.0 23.4C163.8 23.2 164.6 22.9 164.8 22.8C165.0 22.8 166.4 22.5 167.8 22.2C175.1 20.8 183.9 21.3 189.7 23.3C196.5 25.7 199.8 29.4 201.3 36.2C201.6 37.6 201.6 37.7 201.7 63.4C201.8 89.2 201.8 89.2 202.2 90.4C202.9 92.5 204.2 94.4 206.0 95.8C206.9 96.6 207.2 97.1 206.9 97.4C206.7 97.6 205.8 97.6 200.9 97.6C194.3 97.7 193.6 97.6 192.5 96.9C189.5 94.8 187.5 92.1 187.0 89.3C186.7 87.6 186.4 87.7 182.9 90.5C178.6 94.0 177.2 94.9 174.5 96.2C169.3 98.7 163.6 99.8 158.7 99.3ZM0.9 97.4C0.7 97.1 0.6 95.3 0.6 49.0C0.6 1.0 0.6 1.0 0.9 0.8C1.4 0.4 44.3 0.6 46.0 0.9C46.7 1.0 48.2 1.3 49.4 1.5C50.7 1.7 52.0 2.0 52.5 2.1C52.9 2.2 53.7 2.5 54.3 2.6C65.3 5.4 73.4 13.1 74.4 21.6C75.0 26.0 74.2 31.6 72.6 34.8C70.6 38.9 65.6 43.2 59.2 46.2C57.1 47.2 57.3 47.7 60.0 48.3C64.0 49.1 68.6 51.3 71.7 53.8C80.8 61.4 82.3 75.5 75.0 85.3C70.5 91.4 61.8 96.0 52.7 97.2C49.3 97.6 45.6 97.7 23.5 97.7C1.3 97.7 1.2 97.7 0.9 97.4ZM37.1 90.5C41.9 90.2 44.0 89.9 47.8 88.9C52.3 87.8 56.5 85.2 58.8 82.1C61.1 79.1 62.0 76.2 62.0 71.8C62.0 63.7 59.0 58.2 52.7 54.4C52.0 54.0 51.3 53.6 50.9 53.5C50.6 53.4 50.2 53.2 50.1 53.1C49.9 53.0 49.3 52.8 48.8 52.6C48.3 52.5 47.5 52.2 47.1 52.0C46.2 51.7 42.7 51.0 40.8 50.7C37.9 50.3 19.2 50.1 17.9 50.5C16.8 50.7 16.9 49.1 16.9 70.4C16.9 84.1 16.9 89.7 17.1 89.9C17.4 90.6 17.6 90.6 26.1 90.6C30.5 90.6 35.4 90.5 37.1 90.5ZM171.5 90.0C174.5 89.7 178.6 87.9 182.6 85.1C185.3 83.2 186.4 82.3 186.6 81.9C186.9 81.2 186.9 55.5 186.7 54.9C186.3 54.2 185.6 54.3 179.6 56.7C169.1 60.7 161.3 66.2 158.3 71.7C155.5 76.9 157.7 84.6 163.2 88.3C165.5 89.9 168.1 90.4 171.5 90.0ZM90.0 74.6C89.8 74.5 89.7 74.3 89.7 74.2C89.7 74.0 89.7 65.4 89.7 54.9C89.7 34.9 89.7 35.5 90.4 35.1C90.7 34.8 94.3 33.3 98.1 31.9C99.4 31.4 100.8 30.8 102.0 30.3C103.4 29.7 103.7 29.7 104.1 30.0C104.4 30.4 104.4 30.4 104.4 49.9C104.4 69.5 104.4 69.5 104.1 69.9C103.7 70.2 102.5 70.8 100.6 71.5C100.1 71.6 98.8 72.1 97.8 72.5C96.7 72.8 95.4 73.3 94.9 73.5C94.3 73.7 93.2 74.1 92.4 74.3C90.9 74.9 90.3 75.0 90.0 74.6ZM41.2 44.2C43.0 43.9 45.6 43.3 46.8 42.8C47.2 42.6 47.7 42.4 48.0 42.3C50.1 41.5 53.0 39.1 54.8 36.8C56.2 34.9 57.5 31.6 57.8 29.2C58.0 27.4 57.9 22.8 57.6 21.6C56.0 15.0 51.2 10.7 43.1 8.5C38.9 7.4 35.7 7.2 25.9 7.2C17.6 7.2 17.6 7.2 17.3 7.6C16.9 8.0 16.9 8.0 16.9 25.8C16.9 44.6 16.9 43.8 17.6 44.2C18.0 44.5 39.1 44.4 41.2 44.2ZM95.2 17.4C93.6 17.1 92.1 16.3 90.8 14.8C87.4 11.1 88.0 5.2 92.2 2.3C94.2 1.0 95.1 0.7 97.0 0.7C98.8 0.7 98.8 0.7 100.0 1.2C102.5 2.5 103.9 3.9 104.9 6.2C106.7 10.6 104.0 16.1 99.5 17.3C98.3 17.6 96.4 17.7 95.2 17.4ZM122.2 17.3C119.9 16.8 117.9 15.1 116.7 12.7C116.1 11.5 116.1 11.5 116.1 9.2C116.1 7.0 116.1 7.0 116.7 5.8C118.3 2.5 121.6 0.4 124.9 0.6C128.2 0.8 131.8 3.9 132.6 7.1C134.1 13.5 128.6 18.9 122.2 17.3Z"/></svg>';
  // ---------- catalogue (tasting notes and origin facts match the app's bean data) ----------
  const P = [
    { id: 'house', name: 'Bija House Blend', type: 'blend', price: 12, size: '200 g', where: 'Indonesia', notes: ['Balanced', 'Chocolate', 'Caramel'], region: 'Indonesian blend', altitude: 'Various', process: 'Mixed', use: 'Our espresso at the bar', blurb: 'The coffee we pour every day at the bar: round, chocolatey and easy with milk.', art: { bag: '#f2f2f2', ink: '#0b0b0b', pat: 'kawung' } },
    { id: 'mandheling', name: 'Sumatra Mandheling', type: 'origin', origin: 'mandheling', price: 12, size: '200 g', where: 'North Sumatra', notes: ['Dark chocolate', 'Earthy', 'Syrupy'], region: 'North Sumatra, named after the Mandailing people', altitude: '1,100–1,500 m', process: 'Wet-hulled (giling basah)', use: 'Espresso, milk drinks', blurb: 'Deep and syrupy, the classic Sumatran cup.', art: { bag: '#0b0b0b', ink: '#ffffff', pat: 'parang' } },
    { id: 'lintong', name: 'Sumatra Lintong', type: 'origin', origin: 'lintong', price: 12, size: '200 g', where: 'North Sumatra', notes: ['Herbal', 'Cocoa', 'Heavy body'], region: 'Lintong Nihuta, south-west of Lake Toba, North Sumatra', altitude: '1,200–1,500 m', process: 'Wet-hulled (giling basah)', use: 'Espresso, cafetière', blurb: 'Grown above Lake Toba: herbal, cocoa-rich and full-bodied with low acidity.', art: { bag: '#2a2a2a', ink: '#ffffff', pat: 'contour' } },
    { id: 'java', name: 'Old Brown Java', type: 'origin', origin: 'java', price: 12, size: '200 g', where: 'Java', notes: ['Woody', 'Spice', 'Very low acidity'], region: 'Java, aged after harvest', altitude: '1,000–1,600 m', process: 'Aged for years before roasting', use: 'Espresso, iced coffee', blurb: 'Aged before roasting for a mellow, woody cup with gentle spice.', art: { bag: '#d9d9d6', ink: '#0b0b0b', pat: 'toraja' } },
    { id: 'set', name: 'Discovery set', type: 'set', price: 33, size: '3 × 200 g', where: 'Sumatra and Java', notes: ['Mandheling', 'Lintong', 'Old Brown Java'], contains: ['mandheling', 'lintong', 'java'], blurb: 'Three single origins side by side: Sumatra Mandheling, Sumatra Lintong and Old Brown Java. A set of three 200 g bags.', art: { set: true } },
    { id: 'gift', name: 'Gift subscription', type: 'gift', price: 36, size: '3 × 200 g over 3 months', where: 'Indonesia', notes: ['3 bags', '1 a month', 'Delivery included'], blurb: 'Three bags over three months, one a month, prepaid with delivery included. We choose a different Indonesian coffee each month.', art: { bag: '#f2f2f2', ink: '#0b0b0b', pat: 'kawung', ribbon: true } },
    { id: 'gayo', name: 'Aceh Gayo', type: 'origin', origin: 'gayo', soon: true, price: 12, size: '200 g', where: 'Aceh, Sumatra', notes: ['Spice', 'Cedar', 'Dark sugar'], region: 'Gayo highlands around Lake Laut Tawar, Aceh', altitude: '1,200–1,600 m', process: 'Wet-hulled or washed', use: 'Filter, espresso', blurb: 'From the Gayo highlands of Aceh. Coming soon.', art: { bag: '#0b0b0b', ink: '#ffffff', pat: 'dots' } },
    { id: 'kintamani', name: 'Bali Kintamani', type: 'origin', origin: 'kintamani', soon: true, price: 12, size: '200 g', where: 'Bali', notes: ['Citrus', 'Brown sugar', 'Bright'], region: 'Kintamani highlands near Mount Batur, Bali', altitude: '1,200–1,600 m', process: 'Washed or natural', use: 'Filter', blurb: 'Bright and citrusy, from the volcanic slopes of Mount Batur. Coming soon.', art: { bag: '#f2f2f2', ink: '#0b0b0b', pat: 'grid' } },
  ];
  const GRINDS = ['Whole bean', 'Espresso', 'Moka pot', 'Filter', 'Cafetière', 'V60', 'AeroPress'];
  const PLANS = { once: 'One-off', '2w': 'Every 2 weeks', '3w': 'Every 3 weeks', '4w': 'Every 4 weeks' };
  const BREW = {
    'Whole bean': 'Grind just before you brew. Keep the bag sealed, away from light and heat, and enjoy within a month of opening.',
    Espresso: '18 g in, 36 to 40 g out in 25 to 30 seconds. Go finer if it runs fast, coarser if it chokes.',
    'Moka pot': 'Fill the basket level without tamping. Start with hot water in the base, medium heat, lid open; take it off as soon as it starts to gurgle.',
    Filter: '60 g of coffee per litre of water just off the boil. Rinse the paper first.',
    Cafetière: '30 g to 500 ml of water just off the boil. Stir, wait four minutes, skim the crust, plunge slowly.',
    V60: '15 g to 250 g of water at about 94°C. Bloom with 40 g for 45 seconds, then pour in slow circles. Aim for 2½ to 3 minutes in total.',
    AeroPress: '15 g to 200 g of water at 85 to 90°C. Stir, steep for 1½ to 2 minutes, press gently for about 30 seconds.',
  };
  const SUB_OFF = 0.1, POST = 3.95, FREE_AT = 30, PTS = 10;
  const r2 = (n) => Math.round(n * 100) / 100;
  const money = (n) => '£' + (+n || 0).toFixed(2);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
  };
  const byId = (id) => P.find((p) => p.id === id);
  const canSub = (p) => p && p.type !== 'gift';
  const unit = (p, plan) => (plan && plan !== 'once' && canSub(p) ? r2(p.price * (1 - SUB_OFF)) : p.price);
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- basket ----------
  function cart() {
    const raw = store.get('bija.shop.cart', []);
    const out = [];
    (Array.isArray(raw) ? raw : []).forEach((i) => {
      const p = byId(i && i.id); if (!p || p.soon) return;
      const grind = GRINDS.includes(i.grind) ? i.grind : GRINDS[0];
      const plan = canSub(p) && PLANS[i.plan] ? i.plan : 'once';
      const qty = Math.max(1, Math.min(20, Math.floor(+i.qty || 1)));
      const same = out.find((o) => o.id === p.id && o.grind === grind && o.plan === plan);
      if (same) same.qty = Math.min(20, same.qty + qty); else out.push({ id: p.id, grind, qty, plan });
    });
    return out;
  }
  function saveCart(c) { store.set('bija.shop.cart', c); store.set('bija.shop.cart', cart()); paint(); }
  function add(id, o = {}) {
    const p = byId(id); if (!p || p.soon) return;
    const c = cart(); c.push({ id, grind: o.grind || GRINDS[0], qty: o.qty || 1, plan: o.plan || 'once' });
    saveCart(c);
    toast(`Added to your basket: ${p.name}${o.grind && o.grind !== GRINDS[0] ? ' (' + o.grind + ')' : ''}`);
    document.querySelectorAll('.cartbtn').forEach((b) => { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); });
  }
  function lines(c = cart()) {
    return c.map((i) => { const p = byId(i.id), u = unit(p, i.plan); return { ...i, name: p.name, unit: u, total: r2(u * i.qty), p }; });
  }
  // free delivery on £30+, on any order with a subscription, and on gift subscriptions (delivery included)
  function totals(method = 'post', ls = lines()) {
    const subtotal = r2(ls.reduce((a, l) => a + l.total, 0));
    const needsPost = ls.some((l) => l.p.type !== 'gift');
    const free = method === 'collect' || !needsPost || subtotal >= FREE_AT || ls.some((l) => l.plan !== 'once');
    const fee = ls.length && !free ? POST : 0;
    return { subtotal, fee, total: r2(subtotal + fee), pts: Math.round(subtotal * PTS), toFree: Math.max(0, r2(FREE_AT - subtotal)), hasSub: ls.some((l) => l.plan !== 'once') };
  }
  const count = () => cart().reduce((a, i) => a + i.qty, 0);

  // ---------- art: a black and white bag with a batik pattern and the Bija mark, no words ----------
  let uid = 0;
  const MARK = '<circle cx="50" cy="25" r="25"/><circle cx="75" cy="50" r="25"/><circle cx="50" cy="75" r="25"/><circle cx="25" cy="50" r="25"/>';
  const PATS = {
    kawung: (c) => `<pattern id="%" width="28" height="28" patternUnits="userSpaceOnUse"><g fill="${c}" fill-opacity=".22"><ellipse cx="14" cy="6.5" rx="3.6" ry="6"/><ellipse cx="14" cy="21.5" rx="3.6" ry="6"/><ellipse cx="6.5" cy="14" rx="6" ry="3.6"/><ellipse cx="21.5" cy="14" rx="6" ry="3.6"/></g></pattern>`,
    parang: (c) => `<pattern id="%" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><path d="M-4 11 Q1.5 4 7 11 T18 11 T29 11" fill="none" stroke="${c}" stroke-opacity=".28" stroke-width="3"/></pattern>`,
    contour: (c) => `<pattern id="%" width="60" height="22" patternUnits="userSpaceOnUse"><path d="M0 16 Q15 4 30 12 T60 9" fill="none" stroke="${c}" stroke-opacity=".3" stroke-width="1.4"/></pattern>`,
    toraja: (c) => `<pattern id="%" width="24" height="24" patternUnits="userSpaceOnUse"><g fill="none" stroke="${c}" stroke-opacity=".28" stroke-width="2"><path d="M0 12 L6 6 L12 12 L18 6 L24 12"/><circle cx="12" cy="19" r="2.5"/></g></pattern>`,
    dots: (c) => `<pattern id="%" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="2" fill="${c}" fill-opacity=".3"/><circle cx="11" cy="11" r="3" fill="${c}" fill-opacity=".18"/></pattern>`,
    grid: (c) => `<pattern id="%" width="14" height="14" patternUnits="userSpaceOnUse"><path d="M14 0H0V14" fill="none" stroke="${c}" stroke-opacity=".22" stroke-width="1"/></pattern>`,
  };
  function bagShape(a, x = 0, s = 1) {
    const id = 'bp' + ++uid, pat = PATS[a.pat](a.ink).replace('%', id);
    return `<g transform="translate(${x} 0) scale(${s})"><defs>${pat}</defs>
      <rect x="42" y="30" width="116" height="22" rx="3" fill="${a.bag}"/><path d="M48 34v14M58 34v14M68 34v14M78 34v14M88 34v14M98 34v14M108 34v14M118 34v14M128 34v14M138 34v14M148 34v14" stroke="${a.ink}" stroke-opacity=".18" stroke-width="2"/>
      <path d="M40 50 H160 L166 244 Q100 254 34 244 Z" fill="${a.bag}"/><path d="M40 50 H160 L166 244 Q100 254 34 244 Z" fill="url(#${id})"/>
      <path d="M40 50 H70 L64 246 Q48 246 34 244 Z" fill="#fff" fill-opacity=".06"/>
      <rect x="64" y="112" width="72" height="84" rx="4" fill="${a.bag}" stroke="${a.ink}" stroke-opacity=".5"/>
      <g transform="translate(78 132) scale(.44)" fill="none" stroke="${a.ink}" stroke-width="4">${MARK}</g>
      <circle cx="100" cy="76" r="6" fill="none" stroke="${a.ink}" stroke-opacity=".35" stroke-width="2"/>
      ${a.ribbon ? `<g fill="none" stroke="${a.ink}" stroke-width="7"><path d="M100 52 V246"/><path d="M38 150 H164"/></g><g fill="none" stroke="${a.ink}" stroke-width="5"><path d="M100 52 C70 20 62 54 100 52 C138 54 130 20 100 52 Z"/></g>` : ''}</g>`;
  }
  function bagArt(p) {
    if (p.art.set) {
      const arts = p.contains.map((id) => byId(id).art);
      return `<svg class="bag" viewBox="0 0 200 260" aria-hidden="true" focusable="false">${bagShape(arts[0], -18, .62).replace('<g ', '<g opacity=".95" ')}${bagShape(arts[2], 94, .62)}${bagShape(arts[1], 38, .7).replace('scale(.7)', 'scale(.7) translate(0 80)')}</svg>`;
    }
    return `<svg class="bag" viewBox="0 0 200 260" aria-hidden="true" focusable="false">${bagShape(p.art)}</svg>`;
  }
  // grey tiles: a touch darker behind the pale bags so they still stand out
  const bgFor = (p) => (p.art.set ? '#ecebe8' : (p.art.bag === '#0b0b0b' || p.art.bag === '#2a2a2a') ? '#f2f2f0' : '#dfdeda');
  const kind = (p) => ({ origin: `Single origin · ${p.where}`, blend: 'Blend · Indonesia', set: 'Set · 3 × 200 g', gift: 'Gift · 3 months' }[p.type]);

  function card(p, o = {}) {
    const plan = o.plan || 'once', link = `product.html?id=${p.id}`;
    const btn = p.soon ? `<button class="btn ghost" data-notify="${p.id}">Notify me</button>`
      : `<button class="btn" data-add="${p.id}" data-plan="${plan}" aria-label="Add ${esc(p.name)} to basket${plan !== 'once' ? ', ' + PLANS[plan].toLowerCase() : ''}">${plan !== 'once' ? 'Subscribe' : 'Add to basket'}</button>`;
    const price = plan !== 'once' && canSub(p) ? `${money(unit(p, plan))} <small>${esc(p.size)}</small>` : `${money(p.price)} <small>${esc(p.size)}</small>`;
    return `<article class="pcard ${p.soon ? 'soon' : ''}" data-type="${p.type}">
      <a class="pimg" href="${link}" style="--pbg:${bgFor(p)}" tabindex="-1" aria-hidden="true">${bagArt(p)}${p.soon ? '<span class="flag">Coming soon</span>' : p.type === 'set' ? '<span class="flag">Set · save £3</span>' : p.type === 'gift' ? '<span class="flag">Gift</span>' : ''}</a>
      <div class="pbody"><span class="ptag">${esc(kind(p))}</span><h3><a href="${link}">${esc(p.name)}</a></h3>
        <p class="pnotes">${p.notes.map(esc).join(' · ')}</p>
        <div class="prow"><span class="pprice">${price}</span><p class="psub">${p.soon ? 'Be first to know when it lands' : p.type === 'gift' ? 'Prepaid, delivery included' : plan !== 'once' ? `Save 10% · ${PLANS[plan].toLowerCase()} · free delivery` : `${money(unit(p, '2w'))} on subscription`}</p>${btn}</div></div>
    </article>`;
  }

  // ---------- chrome: announcement bar, header, drawer, footer ----------
  const ICON = {
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    mark: `<svg viewBox="-2 -2 104 104" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="5">${MARK}</g></svg>`,
  };
  const NAV = [['shop.html', 'Shop'], ['subscribe.html', 'Subscribe'], ['gifts.html', 'Gifts'], ['menu.html', 'Menu'], ['find.html', 'Find your kopi'], ['visit.html', 'Visit']];
  function announce() {
    return `<div class="announce" role="region" aria-label="Offers">
      <span class="msg">Free UK delivery on orders of £30 or more · <a href="delivery.html">Delivery &amp; returns</a></span>
      <span class="msg" aria-hidden="true" inert>Subscribe and save 10% on every bag · <a href="subscribe.html">Join the Beans Club</a></span>
      <span class="msg" aria-hidden="true" inert>10 points for every £1 in the café, the app and online · <a href="rewards.html">Rewards</a></span></div>`;
  }
  const cartBtn = () => `<button class="iconbtn cartbtn" data-cart aria-label="Basket">${ICON.bag}<span class="count" data-cart-count></span></button>`;
  function header() {
    const here = location.pathname.split('/').pop() + location.search;
    return `<header class="shead"><div class="wrap in">
      <span class="menuslot"><button class="iconbtn menubtn" aria-expanded="false" aria-controls="mainnav" aria-label="Menu">${ICON.menu}</button></span>
      <a class="brand" href="./" aria-label="Bija home">${ICON.mark}${WORDMARK}</a>
      <nav class="mainnav" id="mainnav" aria-label="Main">${NAV.map(([h, l]) => `<a href="${h}" ${here === h || (h === 'shop.html' && here === 'shop.html') || (here.startsWith('product.html') && h === 'shop.html') ? 'aria-current="page"' : ''}>${l}</a>`).join('')}</nav>
      <div class="hact"><a class="hlink hidesm" href="help.html">Help</a><a class="btn sm ghost hidesm" href="app.html?view=app">Order ahead</a>${cartBtn()}</div>
    </div></header>`;
  }
  function footer() {
    return `<footer class="sfoot"><div class="wrap">
      <div class="cols">
        <div class="news" id="newsletter"><p class="fh">Get the good stuff first</p><p>New beans, events at St James's Market and members' offers. About twice a month.</p>
          <form data-news novalidate><label class="vh" for="news-email">Email address</label>
            <div class="row"><input class="inp" id="news-email" type="email" name="email" autocomplete="email" placeholder="Email address" required><button class="btn" type="submit">Sign up</button></div>
            <label class="check"><input type="checkbox" name="consent" required><span>Yes, email me news and offers from Bija. I can unsubscribe at any time. See our <a href="privacy.html">privacy notice</a>.</span></label>
            <p class="err" data-news-err role="alert"></p><p class="ok" data-news-ok role="status"></p></form></div>
        <nav aria-label="Shop"><p class="fh">Shop</p><a href="shop.html">All coffee</a><a href="subscribe.html">Subscriptions</a><a href="gifts.html">Gifts</a><a href="product.html?id=set">Discovery set</a><a href="product.html?id=gift">Gift subscription</a><a href="app.html?view=app#gifts">Gift cards</a><a href="offices.html">For offices</a></nav>
        <nav aria-label="Bija"><p class="fh">Bija</p><a href="visit.html">Visit us</a><a href="menu.html">Café menu</a><a href="events.html">What's on</a><a href="find.html">Find your kopi</a><a href="origins.html">Origins</a><a href="brew.html">Brew guides</a><a href="trace.html?b=house">Bean passport</a><a href="sustainability.html">Sustainability</a><a href="rewards.html">Rewards</a><a href="install.html">Get the app</a><a href="press.html">Press</a></nav>
        <!-- email address is a mock-up: to confirm with Bija -->
        <nav aria-label="Help"><p class="fh">Help</p><a href="help.html">Help centre</a><a href="contact.html">Contact us</a><a href="delivery.html">Delivery &amp; returns</a><a href="delivery.html#terms">Terms of sale</a><a href="allergens.html">Allergens</a><a href="mailto:info@bijalondon.co.uk">info@bijalondon.co.uk</a><a href="tel:+442046033086">+44 20 4603 3086</a></nav>
        <nav aria-label="Legal"><p class="fh">Legal</p><a href="privacy.html">Privacy notice</a><button type="button" class="bc-link" data-consent-open>Privacy choices</button><a href="privacy.html#cookies">Cookies</a><a href="accessibility.html">Accessibility</a><a href="https://www.instagram.com/bija.london/" rel="noopener" target="_blank">Instagram @bija.london</a></nav>
      </div>
      <div class="bigmark" aria-hidden="true">${ICON.mark}Bija</div>
      <div class="legalline"><span>© Bija Coffee Limited, registered in England and Wales, company number 15383542. 2a St James's Market, London SW1Y 4AH. Prices include VAT.</span><span>Concept rebuild by Firman Insan M, not an official Bija page.</span></div>
    </div></footer>`;
  }
  function drawer() {
    return `<div class="drawer" id="drawer" aria-hidden="true"><div class="scrim" data-close-cart></div>
      <div class="pan" role="dialog" aria-modal="true" aria-labelledby="drawer-h">
        <div class="dh"><h2 id="drawer-h">Your basket</h2><button class="iconbtn" data-close-cart aria-label="Close basket">${ICON.x}</button></div>
        <div data-drawer-body style="display:contents"></div>
      </div></div><div class="toast" id="shop-toast" role="status" aria-live="polite"></div>`;
  }
  function drawerBody() {
    const ls = lines(), t = totals('post', ls);
    if (!ls.length) return `<div class="dl"><div class="empty">${ICON.mark}<p>Your basket is empty.</p><a class="btn" href="shop.html">Shop coffee</a></div></div>`;
    const freeMsg = t.hasSub ? 'Free delivery: your basket has a subscription.' : t.toFree > 0 ? `You're <b>${money(t.toFree)}</b> away from free UK delivery.` : 'You have free UK delivery.';
    const pct = t.hasSub ? 100 : Math.min(100, (t.subtotal / FREE_AT) * 100);
    return `<div class="free" aria-live="polite">${freeMsg}<div class="bar" role="progressbar" aria-label="Progress to free delivery" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pct)}"><i style="width:${pct}%"></i></div></div>
      <div class="dl">${ls.map((l, i) => `<div class="line"><a class="thumb" href="product.html?id=${l.id}" style="--pbg:${bgFor(l.p)}" tabindex="-1" aria-hidden="true">${bagArt(l.p)}</a>
        <div><div class="lrow"><h3>${esc(l.name)}</h3><span class="pprice">${money(l.total)}</span></div>
          <div class="opts"><label class="vh" for="lg${i}">Grind for ${esc(l.name)}</label><select class="inp" id="lg${i}" data-line="${i}" data-k="grind">${GRINDS.map((g) => `<option ${g === l.grind ? 'selected' : ''}>${g}</option>`).join('')}</select>
          ${canSub(l.p) ? `<label class="vh" for="lp${i}">Plan for ${esc(l.name)}</label><select class="inp" id="lp${i}" data-line="${i}" data-k="plan">${Object.entries(PLANS).map(([k, v]) => `<option value="${k}" ${k === l.plan ? 'selected' : ''}>${k === 'once' ? 'One-off' : v + ' (−10%)'}</option>`).join('')}</select>` : '<span class="small" style="align-self:center">Prepaid, 3 months</span>'}</div>
          <div class="lrow"><div class="step" role="group" aria-label="Quantity of ${esc(l.name)}"><button data-line="${i}" data-d="-1" aria-label="One fewer">−</button><output>${l.qty}</output><button data-line="${i}" data-d="1" aria-label="One more">+</button></div><button class="rm" data-line="${i}" data-rm>Remove</button></div>
        </div></div>`).join('')}</div>
      <div class="df"><div class="sumrow"><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
        <div class="sumrow small"><span>Delivery</span><span>${t.fee ? money(t.fee) + ' (Royal Mail Tracked 48)' : 'Free'}</span></div>
        <p class="small" style="margin:0">Earn about ${t.pts.toLocaleString('en-GB')} points on your Bija Card. Free click &amp; collect at St James's Market.</p>
        <a class="btn block" href="checkout.html">Checkout · ${money(t.total)}</a></div>`;
  }

  let lastFocus = null;
  function openCart() {
    const d = document.getElementById('drawer'); if (!d) return;
    lastFocus = document.activeElement; paintDrawer();
    d.classList.add('open'); d.setAttribute('aria-hidden', 'false'); document.documentElement.style.overflow = 'hidden';
    setTimeout(() => d.querySelector('.dh [data-close-cart]').focus(), reduce() ? 0 : 60);
  }
  function closeCart() {
    const d = document.getElementById('drawer'); if (!d || !d.classList.contains('open')) return;
    d.classList.remove('open'); d.setAttribute('aria-hidden', 'true'); document.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function paintDrawer() {
    const b = document.querySelector('[data-drawer-body]'); if (!b) return;
    const f = document.activeElement, fid = f && f.id, fl = f && f.dataset && f.dataset.line, fd = f && f.dataset && f.dataset.d;
    b.innerHTML = drawerBody();
    const back = fid ? document.getElementById(fid) : fl != null ? b.querySelector(`[data-line="${fl}"][data-d="${fd}"]`) : null;
    if (back) back.focus(); else if (document.getElementById('drawer').classList.contains('open') && !b.contains(document.activeElement)) document.querySelector('.dh [data-close-cart]').focus();
  }
  function paint() {
    const n = count();
    document.querySelectorAll('[data-cart-count]').forEach((c) => { c.textContent = n ? n : ''; c.dataset.n = n; });
    document.querySelectorAll('.cartbtn').forEach((b) => b.setAttribute('aria-label', n ? `Basket, ${n} item${n === 1 ? '' : 's'}` : 'Basket, empty'));
    if (document.getElementById('drawer')?.classList.contains('open')) paintDrawer();
    document.dispatchEvent(new CustomEvent('bija:cart'));
  }
  let tt;
  function toast(msg) { const t = document.getElementById('shop-toast'); if (!t) return; t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2600); }

  const markCycle = (cls = '') => `<svg class="mk cycle ${cls}" viewBox="-1.5 -1.5 103 103" aria-hidden="true"><defs><pattern id="mkd${++uid}" width="2.4" height="2.4" patternUnits="userSpaceOnUse"><circle cx="1.2" cy="1.2" r=".75" fill="currentColor"/></pattern><clipPath id="mkc${uid}">${MARK}</clipPath></defs>
    <path class="l-sol" fill-rule="evenodd" d="M25 25a25 25 0 1 0 50 0a25 25 0 1 0 -50 0Z M50 50a25 25 0 1 0 50 0a25 25 0 1 0 -50 0Z M25 75a25 25 0 1 0 50 0a25 25 0 1 0 -50 0Z M0 50a25 25 0 1 0 50 0a25 25 0 1 0 -50 0Z"/>
    <path class="l-dot" fill="url(#mkd${uid})" fill-rule="evenodd" d="M25 25a25 25 0 1 0 50 0a25 25 0 1 0 -50 0Z M50 50a25 25 0 1 0 50 0a25 25 0 1 0 -50 0Z M25 75a25 25 0 1 0 50 0a25 25 0 1 0 -50 0Z M0 50a25 25 0 1 0 50 0a25 25 0 1 0 -50 0Z"/>
    <g class="l-out" fill="none" stroke="currentColor" stroke-width="1.3">${MARK}<g clip-path="url(#mkc${uid})"><circle cx="25" cy="0" r="25"/><circle cx="75" cy="0" r="25"/><circle cx="100" cy="25" r="25"/><circle cx="100" cy="75" r="25"/><circle cx="75" cy="100" r="25"/><circle cx="25" cy="100" r="25"/><circle cx="0" cy="75" r="25"/><circle cx="0" cy="25" r="25"/></g></g></svg>`;

  // ---------- wiring ----------
  function mount() {
    const top = document.getElementById('shop-top'); if (top) top.outerHTML = announce() + header();
    const ann = document.getElementById('shop-announce'); if (ann) ann.outerHTML = announce();
    document.querySelectorAll('[data-cart-slot]').forEach((s) => (s.outerHTML = cartBtn()));
    const foot = document.getElementById('shop-foot'); if (foot) foot.outerHTML = footer();
    document.body.insertAdjacentHTML('beforeend', drawer());
    document.querySelectorAll('[data-products]').forEach((el) => {
      const plan = el.dataset.plan || 'once';
      el.innerHTML = el.dataset.products.split(',').map((id) => byId(id.trim())).filter(Boolean).map((p) => card(p, { plan })).join('');
    });
    // a fan of three bag illustrations, used as designed art in heroes
    document.querySelectorAll('[data-fan]').forEach((el) => { el.innerHTML = el.dataset.fan.split(',').map((id) => byId(id.trim())).filter(Boolean).map((p) => `<div class="pimg" style="--pbg:${bgFor(p)}">${bagArt(p)}</div>`).join(''); });
    document.querySelectorAll('[data-mk]').forEach((el, i) => { el.innerHTML = markCycle(); el.firstChild.style.animationDelay = `${-i * 3}s`; });
    // reveal on scroll for shop pages (the home page has its own)
    if (!document.body.classList.contains('home') && 'IntersectionObserver' in window && !reduce()) {
      const els = document.querySelectorAll('.pgrid .pcard, .steps > div, .earn3 > div, .sec-h, .kband, .batik');
      els.forEach((el) => el.classList.add('srv'));
      const io = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { rootMargin: '0px 0px -6% 0px' });
      els.forEach((el) => io.observe(el));
    }
    // rotate the announcement messages
    const msgs = [...document.querySelectorAll('.announce .msg')];
    if (msgs.length > 1 && !reduce()) { let i = 0; setInterval(() => { if (document.hidden || msgs[i].contains(document.activeElement)) return; msgs[i].setAttribute('aria-hidden', 'true'); msgs[i].inert = true; i = (i + 1) % msgs.length; msgs[i].removeAttribute('aria-hidden'); msgs[i].inert = false; }, 5000); }
    else msgs.slice(1).forEach((m) => m.remove());
    paint();
  }

  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.closest('[data-cart]')) { e.preventDefault(); openCart(); return; }
    if (t.closest('[data-close-cart]')) { closeCart(); return; }
    const mb = t.closest('.menubtn');
    if (mb) { const n = document.getElementById('mainnav'), on = !n.classList.contains('open'); n.classList.toggle('open', on); mb.setAttribute('aria-expanded', on); return; }
    const a = t.closest('[data-add]');
    if (a) { add(a.dataset.add, { plan: a.dataset.plan || 'once', grind: a.dataset.grind }); return; }
    const nt = t.closest('[data-notify]');
    if (nt) { const p = byId(nt.dataset.notify), em = document.getElementById('news-email'); toast(`Sign up below and we'll email you when ${p.name} lands.`); if (em) { em.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'center' }); setTimeout(() => em.focus({ preventScroll: true }), reduce() ? 0 : 500); } return; }
    const ln = t.closest('[data-line]');
    if (ln && (ln.dataset.d || ln.hasAttribute('data-rm'))) {
      const c = cart(), i = +ln.dataset.line; if (!c[i]) return;
      if (ln.hasAttribute('data-rm')) { const name = byId(c[i].id).name; c.splice(i, 1); saveCart(c); toast(`Removed ${name}`); return; }
      c[i].qty += +ln.dataset.d; if (c[i].qty < 1) c.splice(i, 1); saveCart(c);
    }
  });
  document.addEventListener('change', (e) => {
    const s = e.target.closest('select[data-line]'); if (!s) return;
    const c = cart(), i = +s.dataset.line; if (!c[i]) return; c[i][s.dataset.k] = s.value; saveCart(c);
    setTimeout(() => { const d = document.querySelector('[data-drawer-body]'); const again = d && d.querySelector(`select[data-k="${s.dataset.k}"]`); if (again && !d.contains(document.activeElement)) again.focus(); }, 0);
  });
  document.addEventListener('keydown', (e) => {
    const d = document.getElementById('drawer'); if (!d || !d.classList.contains('open')) return;
    if (e.key === 'Escape') { e.preventDefault(); closeCart(); return; }
    if (e.key !== 'Tab') return;
    const f = [...d.querySelectorAll('a[href], button:not([disabled]), select, input, [tabindex]:not([tabindex="-1"])')].filter((x) => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    else if (!d.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
  });
  document.addEventListener('submit', (e) => {
    const f = e.target.closest('[data-news]'); if (!f) return;
    e.preventDefault();
    const em = f.email.value.trim(), err = f.querySelector('[data-news-err]'), ok = f.querySelector('[data-news-ok]');
    ok.textContent = ''; f.email.removeAttribute('aria-invalid');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) { err.textContent = 'Enter an email address like name@example.com.'; f.email.setAttribute('aria-invalid', 'true'); f.email.focus(); return; }
    if (!f.consent.checked) { err.textContent = 'Tick the box to say you want our emails.'; f.consent.focus(); return; }
    err.textContent = ''; f.reset();
    backend().then((B) => (B ? B.subscribeNewsletter(em, 'web-footer') : null)).then((r) => { ok.textContent = r && r.ok !== false ? "Thank you. You're on the list." : 'Thank you. This is a demo, so no email was stored or sent.'; }).catch(() => { ok.textContent = 'Thank you. This is a demo, so no email was stored or sent.'; });
  });
  addEventListener('storage', (e) => { if (e.key === 'bija.shop.cart') paint(); });

  let be = null;
  function backend() {
    if (be) return be;
    const live = location.protocol === 'https:' && !/^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(location.hostname);
    if (!live && new URLSearchParams(location.search).get('backend') !== 'supabase') return (be = Promise.resolve(null));
    be = new Promise((res) => { const sc = document.createElement('script'); sc.src = 'bija-supabase.js'; sc.async = true; sc.onload = () => res(window.BijaSupabase || null); sc.onerror = () => res(null); document.head.appendChild(sc); })
      .then((B) => (B ? B.connect().then(() => B) : null)).catch(() => null);
    return be;
  }
  window.BijaShop = { P, GRINDS, PLANS, BREW, SUB_OFF, POST, FREE_AT, PTS, byId, unit, canSub, cart, saveCart, add, lines, totals, count, card, bagArt, bgFor, kind, money, esc, store, toast, markCycle, openCart, closeCart, paint, backend };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
