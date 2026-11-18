/* Bija shop layer, shared by the website pages.
   Products, basket (localStorage 'bija.shop.cart'), orders ('bija.shop.orders'), header, basket drawer, footer and product cards.
   Prices include VAT. The checkout is a demo: no payment is taken and nothing leaves this browser. */
(() => {
  // the Bija wordmark as on the shop front at St James's Market (traced from Bija's official logo), same as the app header
  const WORDMARK = '<svg class="wordmark" viewBox="0 0 208.9 100" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M159.3 99.2C152.2 98.5 147.1 95.1 144.3 89.2C141.9 84.3 141.8 77.5 144.0 72.5C147.6 64.2 157.6 57.7 174.3 52.7C177.9 51.6 177.1 51.8 184.4 49.9C185.8 49.6 186.9 49.2 187.0 49.1C187.2 48.8 187.0 40.7 186.7 38.6C185.9 31.6 183.5 28.1 178.6 26.8C176.8 26.3 172.9 26.3 171.1 26.8C165.2 28.4 160.7 33.7 159.4 40.7C159.1 41.9 159.7 41.8 152.3 41.8C144.8 41.8 145.5 41.9 145.7 40.3C146.7 34.3 151.6 28.5 158.7 25.1C164.0 22.5 169.7 21.3 176.5 21.4C190.4 21.4 198.5 25.4 201.0 33.7C202.0 37.0 202.0 34.9 202.1 63.3C202.1 91.7 202.1 89.5 203.0 91.6C203.7 93.2 205.3 95.1 207.1 96.4C208.2 97.2 208.4 97.4 208.3 97.5C208.2 97.6 205.0 97.7 201.1 97.7L193.9 97.7L193.0 97.1C189.7 95.1 187.6 92.1 187.1 88.7C187.0 87.7 186.7 87.8 184.6 89.5C183.6 90.3 182.2 91.4 181.5 92.0C176.0 96.4 170.1 98.8 164.3 99.2C163.5 99.2 162.5 99.3 162.0 99.3C161.6 99.4 160.4 99.3 159.3 99.2ZM102.1 99.2C98.9 98.9 94.6 97.5 91.2 95.5C88.5 93.9 85.6 91.6 85.6 91.0C85.6 90.7 86.1 90.3 88.1 88.8C89.4 87.8 91.4 86.4 92.4 85.7C94.8 83.9 94.7 83.9 95.5 85.2C98.9 90.3 102.6 92.8 107.6 93.5C113.2 94.2 116.0 91.8 116.9 85.3C117.1 84.0 117.2 80.3 117.2 58.6C117.2 38.6 117.2 33.3 117.3 33.1C117.5 32.9 130.9 27.5 131.6 27.3C131.9 27.3 132.0 27.3 132.0 27.6C132.2 28.3 132.0 69.7 131.8 71.9C130.7 86.2 126.2 94.3 117.7 97.5C116.2 98.0 114.1 98.5 111.4 98.9C109.8 99.1 103.7 99.3 102.1 99.2ZM0.8 97.5C0.5 97.2 0.5 1.0 0.8 0.7C1.1 0.5 43.8 0.6 46.3 0.9C56.6 2.2 64.3 5.4 69.3 10.8C72.2 13.8 73.9 17.0 74.6 20.9C75.1 23.6 74.9 28.6 74.1 31.7C72.6 37.4 68.1 41.8 59.2 46.4C58.4 46.8 57.7 47.2 57.7 47.4C57.7 47.5 58.4 47.7 59.9 48.1C65.9 49.5 69.8 51.6 73.3 55.1C77.8 59.6 79.8 64.6 79.8 71.4C79.8 75.6 79.2 78.1 77.5 81.6C75.0 86.7 71.1 90.5 65.6 93.3C60.7 95.8 56.7 96.9 50.9 97.4C47.7 97.7 1.1 97.8 0.8 97.5ZM36.8 90.4C47.5 90.0 54.7 87.3 58.8 82.3C62.1 78.0 63.1 71.9 61.4 65.5C59.2 57.2 52.3 52.2 40.9 50.7C39.2 50.5 17.5 50.4 17.2 50.6C17.1 50.8 17.0 88.7 17.1 89.8C17.2 90.3 17.3 90.4 17.6 90.5C18.1 90.6 33.0 90.6 36.8 90.4ZM171.7 90.0C173.9 89.7 177.0 88.6 179.2 87.3C181.4 86.1 185.5 83.2 186.7 82.1L187.1 81.8L187.1 68.2C187.1 57.2 187.1 54.6 186.9 54.4C186.7 54.3 186.2 54.4 183.7 55.3C173.5 58.8 165.0 63.7 161.1 68.3C158.1 71.7 157.0 74.7 157.5 78.3C157.9 81.5 159.1 84.0 161.6 86.5C164.5 89.5 167.5 90.5 171.7 90.0ZM89.9 75.0C89.7 74.7 89.7 35.8 89.9 35.4C90.1 35.1 91.5 34.5 97.1 32.2C100.9 30.7 104.2 29.5 104.3 29.5L104.6 29.5L104.7 49.7C104.7 66.1 104.7 69.9 104.5 70.1C104.4 70.1 103.6 70.5 102.6 70.8C101.7 71.2 100.2 71.7 99.2 72.1C95.3 73.5 90.4 75.2 90.2 75.2C90.1 75.2 90.0 75.1 89.9 75.0ZM42.7 43.9C52.6 41.9 58.2 35.4 58.1 25.9C58.1 15.4 51.3 9.3 37.5 7.5C35.3 7.2 17.7 7.1 17.3 7.3C17.1 7.4 17.1 9.7 17.1 25.7C17.1 43.7 17.1 43.9 17.4 44.1C17.6 44.3 19.2 44.3 29.4 44.2C40.7 44.2 41.2 44.2 42.7 43.9ZM95.9 17.6C89.9 16.5 86.9 10.0 90.0 4.7C92.6 0.1 99.2 -0.8 103.0 2.9C104.9 4.7 105.7 6.6 105.7 9.2C105.7 11.7 104.9 13.5 103.2 15.2C101.2 17.1 98.4 18.0 95.9 17.6ZM123.0 17.5C120.5 17.0 118.1 15.2 116.9 12.8C115.2 9.2 116.3 4.6 119.5 2.3C124.2 -1.0 130.3 0.7 132.6 6.1C133.0 7.0 133.0 7.2 133.1 9.0C133.1 10.6 133.0 11.1 132.7 11.9C131.4 15.9 127.2 18.3 123.0 17.5Z"/></svg>';
  // ---------- catalogue (tasting notes and origin facts match the app's bean data) ----------
  const P = [
    { id: 'house', name: 'Bija House Blend', type: 'blend', price: 12, size: '200 g', where: 'Indonesia', notes: ['Chocolate', 'Grapefruit', 'Sweet raisin'], region: 'Cisurupan, West Java (Arabica) and the Petungkriyono Forest, Central Java (Robusta)', altitude: 'Highland Arabica, forest-grown Robusta', process: 'Natural, dark roast', use: 'Our espresso at the bar', blurb: 'Highland Arabica and forest-grown Robusta, two Wildlife Friendly® coffees sourced with Kindred Forest: chocolate, grapefruit and sweet raisin, then pine, spice and clove.', art: { bag: '#f2f2f2', ink: '#0b0b0b', pat: 'kawung' } },
    { id: 'mandheling', name: 'Sumatra Mandheling', type: 'origin', origin: 'mandheling', price: 12, size: '200 g', where: 'North Sumatra', notes: ['Chocolate', 'Brown sugar', 'Herbal'], region: 'The Batak region, on Sumatra\'s volcanic slopes; named after the Mandheling people', altitude: '1,100–1,500 m', process: 'Grade 1, medium dark roast', use: 'Espresso, milk drinks', blurb: 'Balanced and smooth: chocolate, brown sugar, herbal undertones and a hint of spice, with a syrupy body and a clean finish.', art: { bag: '#0b0b0b', ink: '#ffffff', pat: 'parang' } },
    { id: 'lintong', name: 'Sumatra Lintong', type: 'origin', origin: 'lintong', price: 12, size: '200 g', where: 'North Sumatra', notes: ['Dark chocolate', 'Herbs', 'Spice'], region: 'The Lake Toba region of North-West Sumatra', altitude: '1,500–1,800 m', process: 'Grade 1, medium roast', use: 'Espresso, cafetière', blurb: 'Bold and complex: dark chocolate, herbs and spice, a buttery-smooth texture and bright acidity, with a deep, lingering finish.', art: { bag: '#2a2a2a', ink: '#ffffff', pat: 'contour' } },
    { id: 'java', name: 'Old Brown Java', type: 'origin', origin: 'java', price: 12, size: '200 g', where: 'Java', notes: ['Earthy', 'Bold', 'Low acidity'], region: 'Java, aged in the humid monsoon winds', altitude: '1,000–1,600 m', process: 'Monsooned, dark roast', use: 'Espresso, iced coffee', blurb: 'Aged in the monsoon winds for low acidity and deep, earthy notes; the dark roast gives a full body and a long finish.', art: { bag: '#d9d9d6', ink: '#0b0b0b', pat: 'toraja' } },
    { id: 'set', name: 'Discovery set', type: 'set', price: 33, size: '3 × 200 g', where: 'Sumatra and Java', notes: ['Mandheling', 'Lintong', 'Old Brown Java'], contains: ['mandheling', 'lintong', 'java'], blurb: 'Three single origins side by side: Sumatra Mandheling, Sumatra Lintong and Old Brown Java. A set of three 200 g bags.', art: { set: true } },
    { id: 'gift', name: 'Gift subscription', type: 'gift', price: 36, size: '3 × 200 g over 3 months', where: 'Indonesia', notes: ['3 bags', '1 a month', 'Delivery included'], blurb: 'Three bags over three months, one a month, prepaid with delivery included. We choose a different Indonesian coffee each month.', art: { bag: '#f2f2f2', ink: '#0b0b0b', pat: 'kawung', ribbon: true } },
    { id: 'gayo', name: 'Aceh Gayo', type: 'origin', origin: 'gayo', soon: true, price: 18, size: '250 g', where: 'Aceh, Sumatra', notes: ['Cacao', 'Cooked cranberry', 'Cola', 'Dried plum'], region: 'The Asman Gayo Mill, Pegasing district near Takengon, Aceh', altitude: '1,200–1,600 m', process: 'Natural, dark roast', use: 'Filter, espresso', blurb: 'Rich and fruit-forward: cacao, cooked cranberry, cola and dried plum, with candy-like sweetness and gently boozy acidity. Coming soon.', art: { bag: '#0b0b0b', ink: '#ffffff', pat: 'dots' } },
    { id: 'kintamani', name: 'Bali Kintamani', type: 'origin', origin: 'kintamani', soon: true, price: 12, size: '200 g', where: 'Bali', notes: ['Cacao', 'Citrus', 'Balanced'], region: 'Kintamani highlands near Mount Batur, Bali', altitude: '1,200–1,600 m', process: 'Washed or natural', use: 'Filter', blurb: 'A gentler balance of cacao and citrus from the volcanic slopes of Mount Batur. Coming soon.', art: { bag: '#f2f2f2', ink: '#0b0b0b', pat: 'grid' } },
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
  const NAV = [['shop.html', 'Shop'], ['subscribe.html', 'Subscribe'], ['gifts.html', 'Gifts'], ['stories.html', 'Coffee stories'], ['stories.html#roots', 'Indonesian roots'], ['stories.html#community', 'Communities'], ['offices.html', 'Events & catering'], ['visit.html', 'Visit']];
  function announce() {
    return `<div class="announce" role="region" aria-label="Offers">
      <span class="msg">Indonesian coffee in Piccadilly · <a href="visit.html">Visit us at St James’s Market</a></span>
      <span class="msg" aria-hidden="true" inert>Free UK delivery on orders of £30 or more · <a href="delivery.html">Delivery &amp; returns</a></span>
      <span class="msg" aria-hidden="true" inert>Subscribe and save 10% on every bag · <a href="subscribe.html">Join the Beans Club</a></span>
      <span class="msg" aria-hidden="true" inert>10 points for every £1 in the café, the app and online · <a href="rewards.html">Rewards</a></span></div>`;
  }
  const cartBtn = () => `<button class="iconbtn cartbtn" data-cart aria-label="Basket">${ICON.bag}<span class="count" data-cart-count></span></button>`;
  // ?look=delta previews the layout-and-motion redesign (floating capsule header, pill buttons, full-screen moving hero) for the visit;
  // ?look=now goes back. Fonts and colours never change. Off unless asked for, until the owner decides.
  const LOOK = (() => { let v = ''; try { v = new URLSearchParams(location.search).get('look') || sessionStorage.getItem('bija.look') || ''; if (v === 'now') { sessionStorage.removeItem('bija.look'); v = ''; } else if (v === 'delta') sessionStorage.setItem('bija.look', v); } catch {} return v === 'delta' ? 'd' : ''; })();
  if (LOOK) document.documentElement.classList.add('look-d');
  // the preview's menu: two equal halves with the Kawung exactly in the middle; Shop, Coffee stories, Indonesian roots and Visit
  // open a panel on hover or focus, as in the reference: the capsule grows into a dark card with a title, three picture links and the socials
  const PANELS = {
    'shop.html': ['Shop Bija', [['shop.html', 'All coffee', 'bag-old-brown-java'], ['subscribe.html', 'The Beans Club', 'bag-mandheling'], ['gifts.html', 'Gifts and gift cards', 'cups']]],
    'stories.html': ['Coffee stories', [['stories.html#java', 'How coffee reached Java', 'bromo-engraving'], ['stories.html#house', 'Two forests, one cup', 'house-blend-tile'], ['stories.html#identity', 'The seed and the pattern', 'identity-tile']]],
    'stories.html#roots': ['Indonesian roots', [['stories.html#roots', 'Sumatra · Mount Kerinci', 'kerinci'], ['stories.html#roots', 'Java · Mount Bromo', 'bromo'], ['stories.html#roots', 'Bali · Mount Batur', 'batur']]],
    'visit.html': ['Visit Bija', [['visit.html', 'Find us in Piccadilly', 'shopfront'], ['menu.html', 'The café menu', 'kopi-tubruk'], ['events.html', "What's on", 'interior']]],
  };
  function capsule(here) {
    const link = ([h, l]) => {
      const pn = PANELS[h], cur = here === h || (h === 'shop.html' && here.startsWith('product.html')) ? ' aria-current="page"' : '';
      if (!pn) return `<a href="${h}"${cur}>${l === 'Events & catering' ? 'Events' : l}</a>`;
      return `<span class="has-pn"><a href="${h}"${cur} aria-haspopup="true">${l}</a><span class="pn" role="group" aria-label="${pn[0]}"><b class="pn-t">${pn[0]}</b><span class="pn-g">${pn[1].map(([ph, pl, img], i) => `<a href="${ph}" style="--i:${i}"><img src="photos/shop/${img}-600.webp" alt="" loading="lazy" decoding="async"><span>${pl}</span></a>`).join('')}</span><span class="pn-f"><span><a href="https://www.instagram.com/bija.london/" rel="noopener">Instagram</a><a href="https://www.tiktok.com/@bijalondon" rel="noopener">TikTok</a></span><span>© Bija Coffee</span></span></span></span>`;
    };
    const half = Math.ceil(NAV.length / 2);
    return `<span class="nl">${NAV.slice(0, half).map(link).join('')}</span><a class="mid" href="./" aria-label="Bija home">${ICON.mark}</a><span class="nr">${NAV.slice(half).map(link).join('')}</span>`;
  }
  function header() {
    const here = location.pathname.split('/').pop() + location.search;
    return `<header class="shead"><div class="wrap in">
      <span class="menuslot"><button class="iconbtn menubtn" aria-expanded="false" aria-controls="mainnav" aria-label="Menu">${ICON.menu}</button></span>
      <a class="brand" href="./" aria-label="Bija home">${ICON.mark}${WORDMARK}</a>
      <nav class="mainnav" id="mainnav" aria-label="Main">${LOOK ? capsule(here) : NAV.map(([h, l]) => `<a href="${h}" ${here === h || (h === 'shop.html' && here === 'shop.html') || (here.startsWith('product.html') && h === 'shop.html') ? 'aria-current="page"' : ''}>${l}</a>`).join('')}</nav>
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
        <nav aria-label="Bija"><p class="fh">Bija</p><a href="visit.html">Visit us</a><a href="menu.html">Café menu</a><a href="events.html">What's on</a><a href="stories.html">Coffee stories</a><a href="find.html">Find your kopi</a><a href="origins.html">Origins</a><a href="brew.html">Brew guides</a><a href="trace.html?b=house">Bean passport</a><a href="sustainability.html">Sustainability</a><a href="rewards.html">Rewards</a><a href="install.html">Get the app</a><a href="press.html">Press</a></nav>
        <!-- email address is a mock-up: to confirm with Bija -->
        <nav aria-label="Help"><p class="fh">Help</p><a href="help.html">Help centre</a><a href="contact.html">Contact us</a><a href="delivery.html">Delivery &amp; returns</a><a href="delivery.html#terms">Terms of sale</a><a href="allergens.html">Allergens</a><a href="mailto:info@bijalondon.co.uk">info@bijalondon.co.uk</a><a href="tel:+442046033086">+44 20 4603 3086</a></nav>
        <nav aria-label="Legal"><p class="fh">Legal</p><a href="privacy.html">Privacy notice</a><button type="button" class="bc-link" data-consent-open>Privacy choices</button><a href="privacy.html#cookies">Cookies</a><a href="accessibility.html">Accessibility</a><a href="https://www.instagram.com/bija.london/" rel="noopener" target="_blank">Instagram @bija.london</a></nav>
      </div>
      <div class="bigmark" aria-hidden="true">${ICON.mark}Bija</div>
      <p class="soc"><a href="https://www.instagram.com/bija.london/" rel="noopener">Instagram</a><a href="https://www.tiktok.com/@bijalondon" rel="noopener">TikTok</a><a href="https://www.facebook.com/share/19ZKGk6Zq2/" rel="noopener">Facebook</a></p>
      <p class="tm">Bija and Bija Coffee are trading names of Bija Coffee Limited. The BIJA INDONESIAN COFFEE logo is a registered UK trade mark (No. UK00004017967). All rights in our names, trade marks and branding are reserved.</p>
      <div class="legalline"><span>© Bija Coffee Limited, registered in England and Wales, company number 15383542. 2a St James's Market, London SW1Y 4AH. Prices include VAT.</span><span>Concept rebuild by Firman Insan M, not an official Bija page.</span></div>
    </div></footer>`;
  }
  // the main buttons' Kawung pulses once as each comes into view
  // every link mark becomes Bija's Kawung, drawn inline so it can glow
  const KAWUNG = '<svg viewBox="-6 -6 112 112" aria-hidden="true" focusable="false"><circle cx="50" cy="25" r="25"/><circle cx="75" cy="50" r="25"/><circle cx="50" cy="75" r="25"/><circle cx="25" cy="50" r="25"/></svg>';
  function drawMarks(root = document) { root.querySelectorAll('.arr:not([data-k])').forEach((a) => { a.dataset.k = '1'; a.innerHTML = KAWUNG; }); }
  function arrPulse() {
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { const b = e.target; setTimeout(() => b.classList.add('arr-in'), 500); io.unobserve(b); } }), { threshold: .8 });
    document.querySelectorAll('.btn > .arr').forEach((a) => io.observe(a.parentElement));
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
    // editorial sections rise in gently as they reach the screen (the home page runs its own copy; adding 'in' twice is harmless)
    { const els = document.querySelectorAll('.reveal:not(.in)');
      if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) els.forEach((e) => e.classList.add('in'));
      else { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' }); els.forEach((e) => io.observe(e)); } }
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
    // the redesign preview: a page that opens on a full-screen hero lets the floating header sit over it
    if (LOOK) { const first = document.querySelector('main')?.firstElementChild; if (first && first.matches('.ed-hero, .hero2')) document.documentElement.classList.add('hd-over'); }
    // the home hero stops short of the screen's foot so the award strip shows on the first screen
    if (LOOK) { const hero = document.querySelector('main > .ed-hero'), aw = hero?.nextElementSibling; if (aw?.matches('.ed-award')) { const fit = () => { hero.style.height = Math.max(520, innerHeight - hero.getBoundingClientRect().top - scrollY - aw.offsetHeight) + 'px'; }; fit(); addEventListener('resize', fit, { passive: true }); } }
    // after the header, footer and product cards are in place: draw the Kawung marks and measure the header
    drawMarks(); setTimeout(arrPulse, 0);
    // pages place sticky bars under the header with --hdr: keep it equal to the header's real height
    { const hd = document.querySelector('.shead'); const setH = () => { if (hd) document.documentElement.style.setProperty('--hdr', hd.offsetHeight + 'px'); }; setH(); addEventListener('resize', setH, { passive: true }); }
    // reveal on scroll for shop pages (the home page has its own)
    if (!document.body.classList.contains('home') && 'IntersectionObserver' in window && !reduce()) {
      const els = document.querySelectorAll('.pgrid .pcard, .steps > div, .earn3 > div, .sec-h, .kband, .batik');
      els.forEach((el) => el.classList.add('srv'));
      const io = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { rootMargin: '0px 0px -6% 0px' });
      els.forEach((el) => io.observe(el));
    }
    // rotate the announcement messages
    // the announcement bar's motion (?annfx=1..5 tries another for this visit; 1 rise is the default until the owner picks):
    // 1 rise (fade and lift), 2 roll (the line rolls up like a departures board), 3 ticker (one slow continuous ribbon, paused on hover),
    // 4 cascade (the new line arrives word by word), 5 blencong (a Kawung turns and glows gold, then the line fades in beside it)
    const ANN_FX = (() => { let v = ''; try { v = new URLSearchParams(location.search).get('annfx') || sessionStorage.getItem('bija.annfx') || ''; if (/^[1-5]$/.test(v)) sessionStorage.setItem('bija.annfx', v); } catch {} return /^[1-5]$/.test(v) ? v : '1'; })();
    const bar = document.querySelector('.announce'), msgs = [...document.querySelectorAll('.announce .msg')];
    if (bar) bar.dataset.annfx = ANN_FX;
    if (bar && ANN_FX === '3' && msgs.length > 1 && !reduce()) {
      // one ribbon: every line in a row with a Kawung between, the whole run twice so the loop is seamless; the copy is hidden from screen readers
      const run = msgs.map((m) => `<span class="ann-it">${m.innerHTML}</span><span class="ann-k" aria-hidden="true">${KAWUNG}</span>`).join('');
      bar.innerHTML = `<div class="ann-track"><div class="ann-run">${run}</div><div class="ann-run" aria-hidden="true" inert>${run}</div></div>`;
    } else if (msgs.length > 1 && !reduce()) {
      if (ANN_FX === '4') msgs.forEach((m) => { let n = 0; [...m.childNodes].forEach((c) => { if (c.nodeType === 3) { const f = document.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach((w) => { if (!w) return; if (/^\s+$/.test(w)) f.append(w); else { const sp = document.createElement('span'); sp.className = 'ann-w'; sp.style.setProperty('--d', `${n++ * 55}ms`); sp.textContent = w; f.append(sp); } }); c.replaceWith(f); } else { c.classList.add('ann-w'); c.style.setProperty('--d', `${n++ * 55}ms`); } }); });
      let k = null; if (ANN_FX === '5') { bar.insertAdjacentHTML('afterbegin', `<span class="ann-k ann-lamp" aria-hidden="true">${KAWUNG}</span>`); k = bar.firstElementChild; }
      let i = 0;
      setInterval(() => {
        if (document.hidden || msgs[i].contains(document.activeElement) || bar.matches(':hover')) return;
        msgs[i].setAttribute('aria-hidden', 'true'); msgs[i].inert = true; i = (i + 1) % msgs.length; msgs[i].removeAttribute('aria-hidden'); msgs[i].inert = false;
        if (k) { k.classList.remove('lit'); void k.offsetWidth; k.classList.add('lit'); }
      }, 5000);
    } else msgs.slice(1).forEach((m) => m.remove());
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
