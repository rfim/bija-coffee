/* Bija shop layer, shared by the website pages.
   Products, basket (localStorage 'bija.shop.cart'), orders ('bija.shop.orders'), header, basket drawer, footer and product cards.
   Prices include VAT. The checkout is a demo: no payment is taken and nothing leaves this browser. */
(() => {
  // the Bija wordmark as on the shop front at St James's Market (traced from Bija's official logo), same as the app header
  const WORDMARK = '<svg class="wordmark" viewBox="0 0 208.9 100" aria-hidden="true"><path class="wm-b" fill="currentColor" fill-rule="evenodd" d="M0.8 97.5C0.5 97.2 0.5 1.0 0.8 0.7C1.1 0.5 43.8 0.6 46.3 0.9C56.6 2.2 64.3 5.4 69.3 10.8C72.2 13.8 73.9 17.0 74.6 20.9C75.1 23.6 74.9 28.6 74.1 31.7C72.6 37.4 68.1 41.8 59.2 46.4C58.4 46.8 57.7 47.2 57.7 47.4C57.7 47.5 58.4 47.7 59.9 48.1C65.9 49.5 69.8 51.6 73.3 55.1C77.8 59.6 79.8 64.6 79.8 71.4C79.8 75.6 79.2 78.1 77.5 81.6C75.0 86.7 71.1 90.5 65.6 93.3C60.7 95.8 56.7 96.9 50.9 97.4C47.7 97.7 1.1 97.8 0.8 97.5ZM36.8 90.4C47.5 90.0 54.7 87.3 58.8 82.3C62.1 78.0 63.1 71.9 61.4 65.5C59.2 57.2 52.3 52.2 40.9 50.7C39.2 50.5 17.5 50.4 17.2 50.6C17.1 50.8 17.0 88.7 17.1 89.8C17.2 90.3 17.3 90.4 17.6 90.5C18.1 90.6 33.0 90.6 36.8 90.4ZM42.7 43.9C52.6 41.9 58.2 35.4 58.1 25.9C58.1 15.4 51.3 9.3 37.5 7.5C35.3 7.2 17.7 7.1 17.3 7.3C17.1 7.4 17.1 9.7 17.1 25.7C17.1 43.7 17.1 43.9 17.4 44.1C17.6 44.3 19.2 44.3 29.4 44.2C40.7 44.2 41.2 44.2 42.7 43.9Z"/><path class="wm-i" fill="currentColor" fill-rule="evenodd" d="M89.9 75.0C89.7 74.7 89.7 35.8 89.9 35.4C90.1 35.1 91.5 34.5 97.1 32.2C100.9 30.7 104.2 29.5 104.3 29.5L104.6 29.5L104.7 49.7C104.7 66.1 104.7 69.9 104.5 70.1C104.4 70.1 103.6 70.5 102.6 70.8C101.7 71.2 100.2 71.7 99.2 72.1C95.3 73.5 90.4 75.2 90.2 75.2C90.1 75.2 90.0 75.1 89.9 75.0ZM95.9 17.6C89.9 16.5 86.9 10.0 90.0 4.7C92.6 0.1 99.2 -0.8 103.0 2.9C104.9 4.7 105.7 6.6 105.7 9.2C105.7 11.7 104.9 13.5 103.2 15.2C101.2 17.1 98.4 18.0 95.9 17.6Z"/><path class="wm-j" fill="currentColor" fill-rule="evenodd" d="M102.1 99.2C98.9 98.9 94.6 97.5 91.2 95.5C88.5 93.9 85.6 91.6 85.6 91.0C85.6 90.7 86.1 90.3 88.1 88.8C89.4 87.8 91.4 86.4 92.4 85.7C94.8 83.9 94.7 83.9 95.5 85.2C98.9 90.3 102.6 92.8 107.6 93.5C113.2 94.2 116.0 91.8 116.9 85.3C117.1 84.0 117.2 80.3 117.2 58.6C117.2 38.6 117.2 33.3 117.3 33.1C117.5 32.9 130.9 27.5 131.6 27.3C131.9 27.3 132.0 27.3 132.0 27.6C132.2 28.3 132.0 69.7 131.8 71.9C130.7 86.2 126.2 94.3 117.7 97.5C116.2 98.0 114.1 98.5 111.4 98.9C109.8 99.1 103.7 99.3 102.1 99.2ZM123.0 17.5C120.5 17.0 118.1 15.2 116.9 12.8C115.2 9.2 116.3 4.6 119.5 2.3C124.2 -1.0 130.3 0.7 132.6 6.1C133.0 7.0 133.0 7.2 133.1 9.0C133.1 10.6 133.0 11.1 132.7 11.9C131.4 15.9 127.2 18.3 123.0 17.5Z"/><path class="wm-a" fill="currentColor" fill-rule="evenodd" d="M159.3 99.2C152.2 98.5 147.1 95.1 144.3 89.2C141.9 84.3 141.8 77.5 144.0 72.5C147.6 64.2 157.6 57.7 174.3 52.7C177.9 51.6 177.1 51.8 184.4 49.9C185.8 49.6 186.9 49.2 187.0 49.1C187.2 48.8 187.0 40.7 186.7 38.6C185.9 31.6 183.5 28.1 178.6 26.8C176.8 26.3 172.9 26.3 171.1 26.8C165.2 28.4 160.7 33.7 159.4 40.7C159.1 41.9 159.7 41.8 152.3 41.8C144.8 41.8 145.5 41.9 145.7 40.3C146.7 34.3 151.6 28.5 158.7 25.1C164.0 22.5 169.7 21.3 176.5 21.4C190.4 21.4 198.5 25.4 201.0 33.7C202.0 37.0 202.0 34.9 202.1 63.3C202.1 91.7 202.1 89.5 203.0 91.6C203.7 93.2 205.3 95.1 207.1 96.4C208.2 97.2 208.4 97.4 208.3 97.5C208.2 97.6 205.0 97.7 201.1 97.7L193.9 97.7L193.0 97.1C189.7 95.1 187.6 92.1 187.1 88.7C187.0 87.7 186.7 87.8 184.6 89.5C183.6 90.3 182.2 91.4 181.5 92.0C176.0 96.4 170.1 98.8 164.3 99.2C163.5 99.2 162.5 99.3 162.0 99.3C161.6 99.4 160.4 99.3 159.3 99.2ZM171.7 90.0C173.9 89.7 177.0 88.6 179.2 87.3C181.4 86.1 185.5 83.2 186.7 82.1L187.1 81.8L187.1 68.2C187.1 57.2 187.1 54.6 186.9 54.4C186.7 54.3 186.2 54.4 183.7 55.3C173.5 58.8 165.0 63.7 161.1 68.3C158.1 71.7 157.0 74.7 157.5 78.3C157.9 81.5 159.1 84.0 161.6 86.5C164.5 89.5 167.5 90.5 171.7 90.0Z"/></svg>';
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
  // Bija's real Kawung, traced from the brand icon: four petals, each holding a four-pointed star. Defined once (bija-kw), with a
  // slightly bolder cut (bija-kw-b) for small sizes, and every mark on the site points to it
  const KW_SPRITE = '<svg width="0" height="0" style="position:absolute;overflow:hidden" aria-hidden="true" focusable="false"><symbol id="bija-kw" viewBox="0 0 100 100"><path fill="currentColor" fill-rule="evenodd" d="M48.4 99.5C47.5 99.4 45.7 99.2 45 99.0C43.1 98.6 42.9 98.5 41.2 98.0C40.5 97.7 40.1 97.5 38.7 96.9C38.5 96.8 37.9 96.5 37.4 96.2C36.9 95.9 36.5 95.7 36.4 95.7C35.8 95.7 31.4 91.6 30.1 89.9C29 88.5 28.5 87.8 28.5 87.7C28.5 87.7 28.3 87.3 28 86.8C26.2 83.8 24.7 79.1 24.7 76.3C24.7 75.4 24.5 75.3 23.4 75.3C20.3 75.3 15.3 73.5 11.7 71.0C11.1 70.6 10.6 70.3 10.6 70.3C10.6 70.2 10.2 70 9.9 69.7C7 67.6 4.1 63.7 2.4 59.8C-0.2 54 -0.1 45.6 2.5 40.0C3.3 38.3 3.4 38.1 3.6 37.7C3.8 37.5 4.1 37 4.3 36.6C5.3 34.8 8.5 31.2 10.2 30.0C10.5 29.8 10.8 29.5 10.9 29.5C11.2 29.2 12.7 28.2 14.5 27.3C17 26 21.6 24.7 23.8 24.7C24.6 24.7 24.7 24.6 24.7 23.6C24.7 22.9 24.8 22.3 25.1 20.7C25.5 19.2 25.7 18.5 26 17.7C26 17.6 26.1 17.2 26.2 17.0C27.6 13 31 8.4 34.4 5.8C35 5.4 35.6 4.9 35.7 4.8C37.8 3.2 42.8 1.2 46.6 0.7C50.2 0.1 56.5 0.8 58.7 2.0C58.9 2.1 59 2.2 59.1 2.2C59.3 2.2 62 3.5 63 4.1C63.5 4.4 63.9 4.6 63.9 4.6C64 4.6 64.1 4.7 64.2 4.8C64.4 4.9 64.9 5.3 65.4 5.7C69.4 8.7 73.4 14.4 74.4 18.8C74.4 18.9 74.6 19.5 74.7 20.1C75.1 21.7 75.3 22.9 75.3 23.7C75.3 24.6 75.3 24.7 76.1 24.7C79.6 24.7 87.5 27.6 89.1 29.5C89.2 29.5 89.5 29.8 89.8 30.0C98.6 36.5 102 50 97.5 59.9C96.9 61.3 96.7 61.8 96.3 62.4C96.1 62.8 95.8 63.3 95.6 63.6C94.7 65.2 91.6 68.6 90 69.8C89.7 70 89.4 70.2 89.4 70.3C89.3 70.4 87.3 71.7 86.7 72.1C85.4 72.8 83.5 73.7 82.3 74.1C80.3 74.7 77.7 75.3 76.6 75.3C75.5 75.3 75.3 75.4 75.3 76.3C75.3 77.7 74.6 80.8 74 82.3C74 82.4 73.9 82.8 73.8 83.0C73.4 84.1 72.6 85.8 72 86.8C71.7 87.3 71.5 87.7 71.5 87.7C71.5 87.9 69.5 90.4 68.9 91.1C67.2 92.9 65.1 94.7 63.4 95.7C63 95.9 62.5 96.2 62.3 96.4C61.5 96.8 59.9 97.6 58.8 98.0C56.8 98.7 55.7 98.9 53.5 99.3C52.5 99.5 49.5 99.6 48.4 99.5ZM48.6 96.4C48.6 95.3 48 92.3 47.4 90.7C44.6 82.9 37.9 77.2 29.7 75.7C27.1 75.3 27 75.3 27.3 77.3C29 87.7 36.6 95.3 46.9 96.9C48.6 97.1 48.6 97.1 48.6 96.4ZM52.9 96.9C56.1 96.4 59.2 95.4 61.7 93.8C67.8 90 71.5 84.5 72.7 77.3C73 75.6 72.9 75.5 72.1 75.5C70.4 75.6 67.4 76.3 65.1 77.3C60.1 79.6 55.7 83.7 53.6 88.2C52.9 89.7 52.7 90.2 52.7 90.4C52.7 90.5 52.7 90.6 52.6 90.7C52.2 91.1 51.4 95.2 51.4 96.4C51.4 97.1 51.3 97.1 52.9 96.9ZM50.4 89.3C52.1 84.4 56.7 79 61.4 76.3C62.5 75.7 64.6 74.7 65.4 74.4C66.1 74.2 66 74 65.2 73.7C64.3 73.4 62 72.3 61.3 71.9C61 71.7 60.7 71.5 60.6 71.4C60.3 71.3 58 69.6 56.9 68.6C55.2 67 53 64.3 52.1 62.6C51.6 61.7 51 60.4 50.7 59.9C50.3 58.9 50.3 58.8 50.2 58.5C50.1 58.1 49.8 58.1 49.8 58.5C49.7 58.6 49.7 58.9 49.6 59.0C48.5 61.6 48 62.5 46.7 64.4C44.9 67 41.7 70.1 39.4 71.4C39.1 71.6 38.6 71.9 38.2 72.1C37.3 72.7 35.6 73.5 34.7 73.8C33.9 74.1 33.9 74.2 34.6 74.4C40.3 76.4 45.8 81.4 48.7 87.3C49.3 88.7 49.5 89.1 49.8 89.9C49.9 90.3 50.1 90.1 50.4 89.3ZM24.5 72.1C24.4 69.6 23.1 65.4 21.2 62.2C18.9 58.2 14 54.2 9.4 52.6C9.1 52.5 8.8 52.4 8.6 52.3C8.2 52.1 7.5 52 6.6 51.8C6.1 51.7 5.5 51.6 5.2 51.5C4 51.2 3 51.3 3 51.7C3 52.9 3.9 56.7 4.5 58.2C4.7 58.9 5.5 60.4 5.6 60.7C5.7 60.8 5.9 61.1 6 61.4C8 64.9 12.2 68.9 15.6 70.5C16.9 71 17.2 71.2 17.8 71.4C19.7 72.1 22.5 72.7 24 72.8C24.5 72.8 24.5 72.8 24.5 72.1ZM28.7 72.7C31.9 72.2 34.6 71.3 37.1 69.9C37.4 69.7 37.8 69.4 38.1 69.3C43.5 66.2 48 59 48.6 52.3L48.7 51.4L47.9 51.4C46.4 51.4 43 52.2 41.1 53.0C39 54 38.4 54.3 36.7 55.6C31.7 59 28.4 64.6 27.3 70.9C27 73 27 72.9 28.7 72.7ZM72.8 72.4C72.8 71.4 72.2 68.5 71.7 66.9C69.9 61.4 65.1 55.9 60.2 53.6C57.7 52.5 56.6 52.1 54.4 51.7C51.3 51 51.1 51.1 51.5 53.4C52.5 59.5 55.6 64.6 60.5 68.3C61.2 68.9 61.8 69.3 61.9 69.3C61.9 69.3 62.3 69.5 62.8 69.8C63.6 70.3 63.8 70.4 65.4 71.1C67.2 71.9 70.6 72.7 72.4 72.8C72.8 72.8 72.8 72.8 72.8 72.4ZM77.1 72.7C79.6 72.3 81.6 71.7 83.8 70.7C84.2 70.5 84.6 70.4 84.6 70.4C84.6 70.4 84.9 70.2 85.3 70.0C85.6 69.7 85.9 69.6 85.9 69.6C86 69.6 87.7 68.5 87.8 68.3C87.8 68.3 88.1 68.1 88.3 67.9C89.1 67.4 91.7 64.7 92.5 63.7C93.1 62.8 94.6 60.5 94.6 60.4C94.6 60.3 94.7 59.9 95 59.5C95.2 59 95.4 58.4 95.5 58.2C95.6 57.9 95.7 57.6 95.8 57.4C96.3 56.1 96.7 54.4 97 52.0C97.1 51.3 96.4 51.1 94.8 51.5C94.5 51.6 93.9 51.7 93.4 51.8C92.5 52 91.8 52.1 91.4 52.3C91.2 52.4 90.9 52.5 90.6 52.6C89.2 53.1 87.6 53.9 85.9 55.0C83.4 56.5 80.1 59.8 78.8 62.2C76.8 65.6 75.6 69.5 75.5 72.1C75.5 72.9 75.5 72.9 77.1 72.7ZM26.2 65.3C26.4 64.7 26.7 64 27.3 62.8C29.4 58.4 34.3 53.4 38.6 51.5C39.8 50.9 40.6 50.6 41.2 50.3C42 50 42 49.9 41.1 49.6C40.5 49.4 39.9 49.1 38.6 48.5C33.4 46.1 28.2 40.3 26.2 34.8C25.9 33.8 25.8 33.8 25.5 34.7C24.5 37.8 21.6 42 18.8 44.6C18 45.4 15.5 47.3 15.3 47.3C15.2 47.3 14.9 47.5 14.6 47.7C14.1 48 12.3 48.9 11.3 49.3C11.1 49.4 10.9 49.5 10.7 49.6C10.5 49.7 10.3 49.7 10.1 49.8C10 49.8 9.9 49.9 9.9 49.9C9.9 50.1 10 50.1 10.6 50.4C12.1 51 13.4 51.6 14.3 52.2C14.8 52.4 15.3 52.7 15.5 52.8C15.7 52.9 16 53.1 16.1 53.3C16.3 53.4 16.6 53.6 16.8 53.8C17.4 54.2 17.8 54.5 18.8 55.4C21.7 58 24.3 61.9 25.4 65.1C25.8 66.2 25.9 66.2 26.2 65.3ZM74.6 65.1C75.9 61.2 79.7 56.2 83.2 53.8C83.4 53.6 83.7 53.4 83.9 53.3C84 53.1 84.3 52.9 84.5 52.8C84.7 52.7 85.2 52.4 85.7 52.2C86.6 51.6 87.9 51 89.4 50.4C90 50.1 90.1 50.1 90.1 49.9C90.1 49.9 90 49.8 89.9 49.8C89.7 49.7 89.5 49.7 89.3 49.6C89.1 49.5 88.9 49.4 88.7 49.3C87.8 49 85.9 48 85.6 47.8C85.4 47.7 85 47.5 84.7 47.3C80.7 45.1 76 39.2 74.5 34.7C74.3 34 73.9 33.7 73.9 34.2C73.9 34.9 72.1 38.4 71 40.1C68.7 43.5 64.7 47 61.4 48.5C60.1 49.1 59.5 49.4 58.9 49.6C58 49.9 58 50.1 58.9 50.4C59.3 50.5 60.1 50.9 60.7 51.1C61.2 51.4 61.7 51.6 61.8 51.6C61.9 51.6 64.3 53.2 65.1 53.7C68.1 56 71.4 59.8 72.7 62.8C73.4 64.2 73.7 65 74 65.8C74.1 66.2 74.3 65.9 74.6 65.1ZM5.1 48.5C8.1 48 10.7 47.1 13.7 45.4C19.3 42.2 23.8 35 24.4 28.2C24.5 27 24.4 27 22.7 27.3C20.9 27.7 20.5 27.7 20 27.9C19.6 28 19.2 28.1 19.1 28.1C18.9 28.2 18.6 28.3 18.3 28.4C10.4 31.2 4.4 38.4 3.2 46.5C2.9 48.9 2.8 48.9 5.1 48.5ZM48.6 48.1C48.6 47.6 48.5 46.9 48.2 45.2C48.1 44.5 47.4 42.1 47.2 41.6C45 37 42.6 33.9 39.7 31.8C39.4 31.6 39.1 31.4 38.9 31.2C38.8 31.1 38.5 30.9 38.3 30.8C38 30.7 37.5 30.4 37.2 30.2C36.2 29.6 33.9 28.5 33.7 28.5C33.6 28.5 33.4 28.5 33.3 28.4C32.9 28.1 28.9 27.2 27.7 27.2C27.1 27.2 27.1 27.3 27.3 29.0C28.9 39.1 36.2 46.7 46.3 48.4C48.2 48.8 48.6 48.7 48.6 48.1ZM53.7 48.4C61.7 47.1 68.2 41.8 71.3 34.2C72 32.7 72.8 28.8 72.8 27.6C72.8 27.2 72.8 27.2 72.3 27.2C71.1 27.2 67.1 28.1 66.7 28.4C66.6 28.5 66.4 28.5 66.3 28.5C66.1 28.5 63.8 29.6 62.8 30.2C62.5 30.4 62 30.7 61.7 30.8C61.5 30.9 61.2 31.1 61.1 31.2C60.9 31.4 60.5 31.7 60.1 31.9C56 34.7 52.5 40.8 51.5 46.6C51.1 48.8 51.2 48.9 53.7 48.4ZM97 48.4C97 47.1 96.1 43.2 95.5 41.8C93.8 37.8 91.2 34.2 88.2 32.0C86.5 30.6 84.4 29.5 82.3 28.7C81.7 28.4 81.1 28.2 80.9 28.1C80.8 28.1 80.4 28 80 27.9C79.5 27.7 79.1 27.7 77.3 27.3C75.8 27 75.5 27.1 75.5 27.8C75.5 30.4 76.8 34.4 78.8 37.8C80.2 40.3 83.9 44 86.4 45.4C87.8 46.2 89.8 47.1 91 47.5C94.2 48.6 97 49 97 48.4ZM50.3 41.4C50.3 41.2 50.3 41.1 50.4 40.9C50.5 40.8 50.7 40.3 50.9 39.9C53 35.2 56.8 30.7 60.7 28.5C61 28.2 61.5 28 61.8 27.8C62.2 27.6 62.8 27.3 64.1 26.7C65.2 26.2 65.5 26.1 65.8 26.1C66.2 26.1 66 25.8 65.4 25.6C64.2 25.2 60.9 23.4 59.3 22.3C56.9 20.6 53.7 17.1 52.4 14.9C51.7 13.7 50.7 11.4 50.4 10.7C50.1 9.8 49.9 9.8 49.6 10.7C48.2 14.6 44.3 19.8 41.2 21.9C40.8 22.1 40.4 22.4 40.3 22.6C40.1 22.7 39.8 22.9 39.5 23.1C39.3 23.2 38.8 23.5 38.5 23.7C38.1 23.9 37.4 24.3 36.8 24.6C35.7 25.1 35.3 25.3 34.3 25.7C33.9 25.8 33.8 26.1 34.2 26.1C34.5 26.1 34.9 26.2 36.3 26.9C40.8 28.8 44.9 32.5 47.6 36.9C48.3 38.1 49.7 41.1 49.7 41.4C49.7 41.6 49.8 41.7 49.8 41.8C49.9 41.9 50.3 41.6 50.3 41.4ZM29.5 24.3C31.5 23.9 33.3 23.4 34.9 22.7C36.2 22.1 36.5 21.9 37.3 21.5C38.4 20.8 38.4 20.8 39.4 20.1C40.9 19.1 45.1 14.6 45.1 14.1C45.1 14.1 45.3 13.6 45.6 13.2C45.9 12.7 46.2 12.1 46.4 11.8C46.5 11.6 46.7 11 46.9 10.6C47.1 10.1 47.3 9.7 47.3 9.6C47.3 9.5 47.3 9.4 47.4 9.3C47.8 8.9 48.6 4.8 48.6 3.6C48.6 2.9 48.3 2.8 46.9 3.1C46.5 3.2 45.8 3.3 45.4 3.4C43.6 3.8 42.3 4.2 40.7 5.0C40.1 5.2 39.7 5.4 39.6 5.4C39.6 5.4 39.2 5.7 38.7 6.0C38.2 6.3 37.7 6.5 37.7 6.5C36.7 6.5 31.7 11.7 30.2 14.3C29.7 15.3 29.5 15.6 29 16.8C28.1 18.8 27.2 22.5 27.2 24.1C27.2 24.5 27.6 24.6 29.5 24.3ZM72.8 24.0C72.8 23.6 72.7 22.8 72.4 21.2C72.2 20.2 71.5 17.9 71.1 17.0C70.4 15.5 70.3 15.3 69.8 14.4C69.5 13.9 69.3 13.5 69.3 13.5C69.3 13.5 68.9 12.9 68.4 12.2C65 7.7 59.9 4.5 54.6 3.4C54.2 3.3 53.5 3.2 53.1 3.1C51.7 2.8 51.4 2.9 51.4 3.6C51.4 6.1 53 11.3 54.6 13.6C54.8 13.8 54.9 14 54.9 14.1C54.9 14.1 55.2 14.5 55.5 15.0C57.8 18.1 61.1 20.8 64 22.2C66.5 23.3 68.1 23.8 70.4 24.2C72.3 24.6 72.8 24.5 72.8 24.0Z"/></symbol><symbol id="bija-kw-b" viewBox="0 0 100 100"><path fill="currentColor" fill-rule="evenodd" d="M42.7 99.9C42.7 99.8 42.5 99.7 42.3 99.7C42.2 99.7 41.6 99.6 41.1 99.4C40.6 99.2 40 99 39.8 98.9C39.5 98.8 39.1 98.7 37.6 98.0C37.4 97.9 36.8 97.5 36.3 97.3C35.8 97 35.4 96.7 35.4 96.7C34.8 96.7 30.3 92.7 29 91.0C27.9 89.5 27.4 88.9 27.4 88.8C27.4 88.8 27.2 88.4 26.9 87.9C25.1 84.8 23.6 80.2 23.6 77.4C23.6 76.5 23.5 76.4 22.3 76.4C19.2 76.3 14.3 74.6 10.6 72.1C10 71.7 9.5 71.4 9.5 71.3C9.5 71.3 9.2 71 8.8 70.8C6.3 68.9 3.4 65.2 1.9 62.1C1.2 60.6 1.1 60.5 0.1 57.4C-0 56.8 -0 43.2 0.1 42.6C0.6 41 1.2 39.5 1.4 38.9C2.2 37.3 2.3 37 2.6 36.6C2.7 36.4 3 35.9 3.2 35.5C4.3 33.7 7.4 30.2 9.1 28.9C9.4 28.7 9.7 28.4 9.8 28.4C10.1 28.1 11.6 27.1 13.5 26.2C15.9 24.9 20.5 23.6 22.7 23.6C23.5 23.6 23.6 23.5 23.6 22.5C23.6 21.8 23.7 21.2 24.1 19.6C24.4 18.1 24.6 17.4 24.9 16.6C24.9 16.5 25 16.2 25.1 15.9C26.5 11.9 29.9 7.3 33.4 4.7C34 4.3 34.5 3.8 34.6 3.8C35.6 3 39.1 1.3 41 0.7C41.7 0.4 42.4 0.2 42.6 0.1C42.9 -0 57 -0 57.4 0.1C57.5 0.2 58.1 0.4 58.7 0.6C59.3 0.7 59.8 0.9 59.8 1.0C59.9 1 60.1 1.1 60.2 1.1C60.4 1.1 63 2.3 64.1 3.0C64.6 3.3 65 3.5 65 3.5C65.1 3.5 65.2 3.6 65.3 3.7C65.4 3.8 66 4.2 66.4 4.6C70.5 7.6 74.5 13.3 75.5 17.7C75.5 17.8 75.6 18.4 75.8 19.0C76.2 20.6 76.4 21.9 76.4 22.6C76.4 23.6 76.4 23.6 77.2 23.6C80.6 23.6 88.6 26.5 90.2 28.4C90.3 28.4 90.6 28.7 90.9 28.9C92.9 30.4 95.9 34 97.3 36.3C98.4 38.3 98.8 39.2 99.9 42.6C100 43.2 100 57.2 99.9 57.3C99.8 57.3 99.7 57.5 99.7 57.6C99.7 58 99 60.1 98.6 61.0C98 62.4 97.7 62.9 97.4 63.5C97.2 63.9 96.9 64.4 96.7 64.6C95.8 66.3 92.7 69.7 91.1 70.9C90.8 71.1 90.5 71.3 90.5 71.3C90.4 71.5 88.4 72.8 87.8 73.2C86.5 73.9 84.6 74.8 83.4 75.2C81.4 75.8 78.8 76.4 77.7 76.4C76.5 76.4 76.4 76.5 76.4 77.4C76.4 78.7 75.7 81.9 75.1 83.4C75.1 83.5 75 83.8 74.9 84.1C74.5 85.2 73.7 86.9 73.1 87.9C72.8 88.4 72.6 88.8 72.6 88.8C72.6 89 70.6 91.5 70 92.2C68.3 94 66.2 95.8 64.5 96.8C64.1 97 63.6 97.3 63.4 97.4C62.7 97.9 60.8 98.7 60.2 98.9C60 99 59.4 99.2 58.9 99.4C58.4 99.6 57.8 99.7 57.7 99.7C57.5 99.7 57.3 99.8 57.3 99.9C57.2 100 54.6 100 50 100.0C45.4 100 42.8 100 42.7 99.9ZM47.3 95.4C47.3 95 46.7 92.8 46.3 91.8C43.7 84.5 37.8 79.2 30.3 77.2C28.4 76.7 28.4 76.7 28.8 78.4C31.2 87.2 37 93 45.9 95.4C47.1 95.7 47.3 95.7 47.3 95.4ZM54.2 95.3C56.3 94.8 57.1 94.5 59 93.6C64.8 90.9 69.3 85.3 71.2 78.4C71.6 76.7 71.6 76.7 69.9 77.1C63.4 78.7 57.3 83.6 54.7 89.3C54 90.8 53.8 91.3 53.8 91.5C53.8 91.6 53.8 91.7 53.7 91.8C53.6 91.8 53.5 92 53.5 92.2C53.5 92.3 53.3 93.1 53.1 93.8C52.7 95.2 52.6 95.7 52.8 95.7C52.9 95.7 53.5 95.5 54.2 95.3ZM50.3 86.1C51.8 82.2 57.3 76.5 61.6 74.6C62.4 74.2 62.4 74.1 61.5 73.7C61.1 73.5 60.6 73.2 60.3 73.0C60 72.8 59.6 72.6 59.5 72.5C58 72 53.7 67.8 52 65.3C51.2 64.1 51.1 63.9 50.4 62.6C50.3 62.2 50.1 62 50 62.0C49.9 62 49.7 62.2 49.6 62.6C48.2 65.3 46 68.1 43.7 70.1C42.7 71 40.6 72.6 40.5 72.6C40.4 72.6 39.9 72.9 39.3 73.2C38.6 73.6 38 73.9 37.9 73.9C37.5 73.9 37.8 74.3 38.4 74.6C42.6 76.5 47.1 81 49.5 85.6C49.9 86.5 50.1 86.6 50.3 86.1ZM23.1 71.1C23.1 69.8 21.6 65.7 20.2 63.3C17.8 59.3 12.6 55.1 8.2 53.7C7.9 53.6 7.6 53.4 7.5 53.4C7.5 53.3 7.1 53.2 6.7 53.1C6.2 53 5.7 52.9 5.5 52.8C5.1 52.7 4.3 52.7 4.3 52.8C4.3 53.2 5.2 56.3 5.6 57.1C5.8 57.8 6.5 59.3 6.7 59.6C6.8 59.7 6.9 60 7.1 60.3C9.1 63.8 13.3 67.8 16.7 69.4C18 70 18.3 70.1 19 70.4C20 70.7 20.5 70.9 21.7 71.2C23 71.5 23.1 71.5 23.1 71.1ZM29.9 71.2C31.7 70.8 34.5 69.7 36.1 68.7C36.4 68.5 36.8 68.3 37 68.3C38.1 67.8 41.8 64.3 43.2 62.5C45.2 59.7 46.7 56.1 47.2 53.2C47.3 52.6 47.2 52.6 45.8 52.9C43.9 53.4 41.4 54.4 39.6 55.4C34.3 58.5 30.4 63.7 28.9 69.8C28.4 71.5 28.4 71.5 28.9 71.4C29.1 71.4 29.6 71.3 29.9 71.2ZM71.5 71.3C71.5 70.9 70.6 67.7 70.3 66.9C68 61.5 63.7 56.8 59.1 54.7C57.6 54 57 53.8 56.1 53.5C53.9 52.7 52.7 52.6 52.7 53.0C52.7 54.2 54.2 58.3 55.6 60.6C57.1 63.2 62 68.2 62.9 68.2C63 68.2 63.4 68.4 63.9 68.7C64.7 69.2 64.9 69.3 66.4 70.0C67.5 70.5 70.6 71.4 71.2 71.5C71.4 71.5 71.5 71.4 71.5 71.3ZM78.4 71.1C80.3 70.6 81.1 70.4 82.7 69.6C83.1 69.4 83.5 69.3 83.5 69.3C83.5 69.3 83.8 69.1 84.2 68.9C84.5 68.7 84.8 68.5 84.8 68.5C84.9 68.5 86.6 67.4 86.7 67.3C86.7 67.2 87 67 87.2 66.8C88 66.3 90.7 63.6 91.4 62.6C92 61.7 93.5 59.4 93.5 59.3C93.5 59.3 93.7 58.8 93.9 58.4C94.1 57.9 94.3 57.3 94.4 57.1C94.5 56.8 94.6 56.5 94.7 56.3C95 55.7 95.1 55.2 95.4 54.1C95.5 53.4 95.7 52.8 95.7 52.8C95.7 52.7 94.9 52.7 94.5 52.8C94.3 52.9 93.8 53 93.3 53.1C92.9 53.2 92.5 53.3 92.5 53.4C92.4 53.4 92.1 53.6 91.8 53.7C90.5 54.1 88.7 54.9 86.9 56.0C84.5 57.5 81.2 60.9 79.9 63.2C78.3 66 76.9 69.8 76.9 71.1C76.9 71.5 76.9 71.5 78.4 71.1ZM26.1 62.0C26.1 61.9 26.2 61.6 26.4 61.3C26.5 61.1 26.8 60.7 26.9 60.4C28.4 57.8 31.4 54.4 33.8 52.7C35.4 51.5 37.5 50.3 37.8 50.3C38.2 50.3 38 49.9 37.5 49.6C33.1 47.5 27.6 42 26.2 38.2C26 37.6 25.8 37.7 25.3 38.5C24.2 40.9 22 43.7 19.9 45.7C19 46.5 16.6 48.4 16.4 48.4C16.3 48.4 16 48.5 15.7 48.8C15.4 49 14.8 49.3 14.4 49.5C13.4 50 13.4 50 14.1 50.4C14.4 50.5 15 50.8 15.4 51.1C15.9 51.3 16.4 51.6 16.6 51.8C16.8 51.9 17.1 52 17.2 52.2C17.4 52.3 17.7 52.5 17.9 52.7C20.7 54.7 24.2 58.8 25.5 61.7C25.7 62.2 26.1 62.4 26.1 62.0ZM74.5 61.7C75.8 58.8 79.4 54.6 82.1 52.7C82.3 52.5 82.6 52.3 82.8 52.2C82.9 52 83.2 51.9 83.4 51.8C83.6 51.6 84.1 51.3 84.6 51.1C85 50.8 85.6 50.5 85.9 50.4C86.6 50 86.6 50 85.6 49.5C85.2 49.3 84.7 49 84.5 48.9C84.3 48.8 83.9 48.5 83.6 48.4C80.5 46.6 76.7 42.5 74.7 38.6C74.2 37.6 74.1 37.6 73.6 38.6C71.5 43 66.9 47.5 62.5 49.6C62 49.9 61.8 50.3 62.1 50.3C62.7 50.3 66 52.4 67.6 53.8C68.7 54.8 70.8 57 71.5 58.0C72.7 59.6 73.9 61.7 73.9 62.0C73.9 62.4 74.3 62.2 74.5 61.7ZM5.5 47.2C5.7 47.1 6.2 47 6.5 46.9C8.6 46.3 10.4 45.6 12.6 44.3C17.2 41.6 21.6 35.7 22.8 30.2C23.2 28.5 23.2 28.4 22.3 28.7C22.1 28.7 21.6 28.8 21.2 28.9C20.8 29 20.3 29.1 20.2 29.2C20 29.3 19.7 29.4 19.4 29.5C13.2 31.7 8.1 36.6 5.6 42.9C5.2 43.7 4.3 46.8 4.3 47.2C4.3 47.3 5 47.3 5.5 47.2ZM47.3 47.1C47.3 46.6 46.4 43.4 46.1 42.7C43.9 38.1 41.5 34.9 38.6 32.9C38.3 32.7 38 32.4 37.9 32.3C37.7 32.2 37.4 32 37.2 31.9C36.9 31.8 36.4 31.5 36.1 31.2C35.1 30.7 32.9 29.6 32.6 29.6C32.5 29.6 32.3 29.6 32.3 29.5C32 29.3 28.7 28.4 28.6 28.6C28.3 28.9 29.7 33.1 30.7 35.1C33.6 40.7 38.3 44.8 44.2 46.6C46.8 47.4 47.3 47.4 47.3 47.1ZM54.3 47.0C61.8 45 67.3 40.2 70.3 33.1C70.7 32 71.5 28.7 71.4 28.6C71.3 28.4 68 29.3 67.7 29.5C67.7 29.6 67.5 29.6 67.4 29.6C67.1 29.6 64.9 30.7 63.9 31.2C63.6 31.5 63.1 31.8 62.8 31.9C62.6 32 62.3 32.2 62.1 32.3C62 32.4 61.6 32.8 61.2 33.0C59.7 34.1 56.8 37.2 55.7 39.2C53.8 42.3 52.2 47.3 53 47.3C53.1 47.3 53.7 47.2 54.3 47.0ZM95.7 47.2C95.7 47.1 95.6 46.9 95.5 46.7C95.5 46.4 95.3 45.9 95.2 45.5C94.9 44.1 94.6 43.2 93.6 41.2C92.2 38.2 89.6 34.9 87.2 33.1C85.4 31.7 83.3 30.6 81.2 29.8C80.6 29.5 80 29.3 79.8 29.2C79.7 29.1 79.2 29 78.8 28.9C78.4 28.8 77.9 28.7 77.7 28.7C76.8 28.4 76.7 28.6 77.2 30.3C77.8 32.6 78.6 34.4 79.9 36.8C81.7 39.9 85.5 43.4 89.2 45.2C91 46.1 91.8 46.4 93.5 46.9C93.8 47 94.2 47.1 94.4 47.1C94.9 47.3 95.7 47.3 95.7 47.2ZM50.4 37.5C52.5 33.5 56.2 29.4 59.6 27.4C60 27.2 60.4 26.9 60.7 26.7C60.9 26.6 61.3 26.4 61.7 26.2C62.4 25.9 62.4 25.8 61.7 25.5C58.6 24 55 21 52.7 17.9C51.7 16.6 51.5 16.2 50.6 14.5C50 13.4 50 13.4 49.5 14.4C48.1 17.3 44.7 21.4 42.3 23.0C41.9 23.2 41.5 23.5 41.4 23.6C41.2 23.8 40.9 24 40.6 24.2C40.3 24.3 39.9 24.6 39.6 24.8C39.3 24.9 38.8 25.2 38.4 25.4C38.1 25.6 37.8 25.8 37.8 25.8C37.8 25.9 38.1 26.1 38.4 26.3C43 28.6 47.1 32.6 49.5 37.3C50 38.2 50 38.2 50.4 37.5ZM30.3 22.8C32.1 22.3 32.9 22 34.9 21.1C35.3 20.9 36.4 20.3 37.2 19.8C39.3 18.5 44 13.8 44 13.0C44 13 44.3 12.5 44.5 12.1C44.8 11.6 45.2 11 45.3 10.7C45.4 10.5 45.6 9.9 45.8 9.5C46 9 46.2 8.6 46.2 8.5C46.2 8.4 46.2 8.3 46.3 8.2C46.4 8.2 46.5 8 46.5 7.8C46.5 7.7 46.7 6.9 46.9 6.2C47.4 4.2 47.4 4.2 46.5 4.5C46.2 4.6 45.6 4.7 45.2 4.8C44.1 5.1 43 5.5 41.7 6.1C41.2 6.3 40.7 6.5 40.7 6.5C40.7 6.5 40.3 6.8 39.8 7.1C39.3 7.4 38.8 7.6 38.8 7.6C38.7 7.6 38.1 8 37.4 8.6C34.6 10.7 31.9 14 30.5 16.8C29.6 18.8 29.3 19.7 28.9 21.5C28.4 23.4 28.3 23.3 30.3 22.8ZM71.4 22.7C71.4 22.5 71.3 22.1 71.2 21.7C71 20.9 70.3 18.8 70 18.0C69.8 17.6 69.6 17.1 69.5 16.8C69.3 16.6 69 16 68.7 15.5C68.4 15 68.2 14.6 68.2 14.6C68.2 14.3 66.1 11.8 65 10.7C62.1 7.9 58.3 5.7 54.8 4.8C54.4 4.7 53.8 4.6 53.5 4.5C52.8 4.3 52.7 4.3 52.7 4.6C52.7 4.8 53.2 6.9 53.5 7.8C53.9 9 55.1 11.7 55.7 12.5C55.9 12.7 56 12.9 56 13.0C56 13 56.3 13.4 56.6 13.9C58.9 17 62.2 19.7 65.1 21.1C67 22 67.9 22.3 69.6 22.8C71.2 23.2 71.5 23.2 71.4 22.7Z"/></symbol></svg>';
  const KW = (b) => `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><use href="#bija-kw${b ? '-b' : ''}"/></svg>`;
  if (!document.getElementById('bija-kw')) document.documentElement.insertAdjacentHTML('afterbegin', KW_SPRITE);
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
      <use href="#bija-kw" x="78" y="132" width="44" height="44" style="color:${a.ink}"/>
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

  // the Shopify labels: each coffee's colour, its batik and the unfurling frame; a line of its story sells it
  const LABEL = {
    house: { k: 'rgba(217,180,90,.30)', ks: 100, c: '#3d2500', isl: 'Java', story: 'Two forests, one cup, grown with farmers who protect the endangered Javan slow loris.', ch: 'house' },
    mandheling: { k: 'rgba(255,255,255,.20)', ks: 92, c: '#7f947b', isl: 'Sumatra', story: 'Named after the Mandailing people of North Sumatra, who have grown it for generations.', ch: 'roots' },
    lintong: { k: 'rgba(255,200,190,.26)', ks: 112, c: '#b21919', isl: 'Sumatra', story: 'Grown above Lake Toba, the largest volcanic lake on Earth.', ch: 'roots' },
    java: { k: 'rgba(60,30,10,.32)', ks: 96, c: '#995c2d', isl: 'Java', story: 'Aged in the monsoon winds, the old way, for its deep brown colour and low acidity.', ch: 'java' },
    gayo: { k: 'rgba(214,150,80,.32)', ks: 88, c: '#3d0026', isl: 'Sumatra', story: 'From the highlands of Aceh, where the smallholders of Pantan Musara rebuilt their farms.', ch: 'gayo' },
    kintamani: { k: 'rgba(255,230,160,.34)', ks: 104, c: '#cc7a00', isl: 'Bali', story: 'Grown by 377 smallholders among Bali’s orange trees, in harmony with the land.', ch: 'roots' },
  };
  const setArt = (p) => `<span class="lbl-fan">${p.contains.map((id, i) => { const q = byId(id), l = LABEL[id]; return `<span class="lbl lbl-f" style="--c:${l.c};--i:${i}"><span class="lbl-m" style="background-image:url(photos/shop/motif-${id}.webp)"></span><span class="lbl-o">Indonesia / ${esc(l.isl)}</span><span class="lbl-n">${esc(q.name)}</span></span>`; }).join('')}</span>`;
  const giftArt = () => `<span class="lbl" style="--c:#151515"><span class="lbl-m" style="background-image:url(photos/shop/motif-house.webp);opacity:.28"></span><span class="lbl-o" style="color:#d9b45a">A bag a month · 3 months</span><span class="lbl-n">Gift subscription</span></span>`;
  const labelArt = (p) => { const l = LABEL[p.id]; return `<span class="lbl" style="--c:${l.c}"><span class="lbl-m" style="background-image:url(photos/shop/motif-${p.id}.webp)"></span><span class="lbl-o">Indonesia / ${esc(l.isl)}</span><span class="lbl-n">${esc(p.name)}</span></span>`; };
  function card(p, o = {}) {
    const plan = o.plan || 'once', link = `product.html?id=${p.id}`;
    const btn = p.soon ? `<button class="btn ghost" data-notify="${p.id}">Notify me</button>`
      : `<button class="btn" data-add="${p.id}" data-plan="${plan}" aria-label="Add ${esc(p.name)} to basket${plan !== 'once' ? ', ' + PLANS[plan].toLowerCase() : ''}">${plan !== 'once' ? 'Subscribe' : 'Add to basket'}</button>`;
    const price = plan !== 'once' && canSub(p) ? `${money(unit(p, plan))} <small>${esc(p.size)}</small>` : `${money(p.price)} <small>${esc(p.size)}</small>`;
    return `<article class="pcard ${p.soon ? 'soon' : ''}" data-type="${p.type}">
      <a class="pimg has-lbl" href="${link}" style="--pbg:transparent" tabindex="-1" aria-hidden="true">${LABEL[p.id] ? labelArt(p) : p.type === 'set' ? setArt(p) : giftArt()}${p.soon ? '<span class="flag">Coming soon</span>' : p.type === 'set' ? '<span class="flag">Set · save £3</span>' : p.type === 'gift' ? '<span class="flag">Gift</span>' : ''}</a>
      <div class="pbody"><span class="ptag">${esc(kind(p))}</span><h3><a href="${link}">${esc(p.name)}</a></h3>
        <p class="pnotes">${p.notes.map(esc).join(' · ')}</p>${LABEL[p.id] ? `<p class="pstory">${esc(LABEL[p.id].story)} <a href="stories.html#${LABEL[p.id].ch}">Read its story</a></p>` : ''}
        <div class="prow"><span class="pprice">${price}</span><p class="psub">${p.soon ? 'Be first to know when it lands' : p.type === 'gift' ? 'Prepaid, delivery included' : plan !== 'once' ? `Save 10% · ${PLANS[plan].toLowerCase()} · free delivery` : `${money(unit(p, '2w'))} on subscription`}</p>${btn}</div></div>
    </article>`;
  }

  // ---------- chrome: announcement bar, header, drawer, footer ----------
  const ICON = {
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    mark: KW(),
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
  // the website's look: floating capsule header, pill buttons, full-screen moving heroes (chosen by the owner).
  // ?look=now shows the previous look for the visit, for comparison; ?look=delta comes back.
  // page transition options: ?vt=1..5 on any link tries one for the visit (1 lift is the default until the owner picks)
  // the Kerinci card's motion: each visit picks one of 1 breathe, 2 dawn, 3 depth at random and keeps it for the visit (?kfx=1..3 fixes one)
  try { const q = new URLSearchParams(location.search).get('kfx'); if (/^[1-3]$/.test(q || '')) sessionStorage.setItem('bija.kfx', q); let v = sessionStorage.getItem('bija.kfx'); if (!v) { v = String(1 + Math.floor(Math.random() * 3)); sessionStorage.setItem('bija.kfx', v); } document.documentElement.dataset.kfx = v; } catch { document.documentElement.dataset.kfx = '1'; }
  // 3 depth: the card leans towards the pointer
  document.addEventListener('pointermove', (e) => { if (document.documentElement.dataset.kfx !== '3' || e.pointerType !== 'mouse') return; const c = e.target.closest && e.target.closest('.hb-tall'); document.querySelectorAll('.hb-tall').forEach((k) => { if (k !== c) { k.style.removeProperty('--rx'); k.style.removeProperty('--ry'); return; } const r = k.getBoundingClientRect(); k.style.setProperty('--ry', (((e.clientX - r.left) / r.width - .5) * 14).toFixed(2) + 'deg'); k.style.setProperty('--rx', ((.5 - (e.clientY - r.top) / r.height) * 12).toFixed(2) + 'deg'); }); }, { passive: true });
  // the ij motion: each time it plays, one of 2 handshake, 3 embrace, 4 bow, 5 heartbeat at random; ?ij=1..5 fixes one for the visit
  let IJ_FIXED = ''; try { const q = new URLSearchParams(location.search).get('ij'); if (/^[1-5]$/.test(q || '')) sessionStorage.setItem('bija.ij', q); IJ_FIXED = sessionStorage.getItem('bija.ij') || ''; } catch {}
  const ijPick = () => { document.documentElement.dataset.ij = IJ_FIXED || String(2 + Math.floor(Math.random() * 4)); };
  ijPick();
  document.addEventListener('pointerover', (e) => { const t = e.target.closest && e.target.closest('.mid, .shead .brand, .has-pn > a, .sfoot .wordmark'); if (t && !t.contains(e.relatedTarget)) ijPick(); }, { passive: true });
  document.addEventListener('focusin', (e) => { if (e.target.closest && e.target.closest('.mid')) ijPick(); });
  try { const v = new URLSearchParams(location.search).get('vt'); if (/^([1-9]|1[0-5])$/.test(v || '')) { sessionStorage.setItem('bija.vt', v); document.documentElement.dataset.vt = v; } } catch {}
  const LOOK = (() => { let v = ''; try { v = new URLSearchParams(location.search).get('look') || sessionStorage.getItem('bija.look') || ''; if (v === 'delta') { sessionStorage.removeItem('bija.look'); v = ''; } else if (v === 'now') sessionStorage.setItem('bija.look', v); } catch {} return v === 'now' ? '' : 'd'; })();
  document.documentElement.classList.toggle('look-d', !!LOOK);
  // the preview's menu: two equal halves with the Kawung exactly in the middle; Shop, Coffee stories, Indonesian roots and Visit
  // open a panel on hover or focus, as in the reference: the capsule grows into a dark card with a title, three picture links and the socials
  const CAP = [['stories.html', 'Bija'], ['shop.html', 'Shop'], ['gifts.html', 'Gifts'], ['catering.html', 'Catering'], ['rewards.html', 'Rewards'], ['visit.html', 'Visit']];
  const PANELS = {
    'stories.html': ['Bija', [['our-story.html', 'Our story', 'shared-table'], ['concept.html', 'The concept', 'design-facade'], ['identity.html', 'Brand identity', 'mark-studies'], ['people.html', 'The people', 'barista-olive']], [['stories.html', 'Coffee stories'], ['drinks.html', 'Speciality drinks'], ['communities.html', 'Communities']]],
    'shop.html': ['Shop by island', 'islands'],
    'catering.html': ['Bija at your event', [['catering.html', 'Coffee for your event', 'catering-people'], ['offices.html', 'Coffee for your office', 'catering'], ['events.html', "What's on at Bija", 'interior']]],
    'visit.html': ['Visit Bija', [['visit.html', 'Find us in Piccadilly', 'shopfront'], ['menu.html', 'The café menu', 'kopi-tubruk'], ['events.html', "What's on", 'interior']]],
  };
  // artwork, labels and bags are shown whole inside the card; landscape photos fill it
  const WHOLE = new Set(['mark-studies', 'bag-old-brown-java', 'bag-mandheling', 'cups', 'bromo-engraving', 'house-blend-tile', 'identity-tile', 'kopi-tubruk', 'card-aceh-gayo']);
  // the Shop panel: our coffees by island, as on the Indonesian roots page
  const ISLANDS = [
    ['Sumatra', 'Mount Kerinci', 'kerinci', ['mandheling', 'lintong', 'gayo']],
    ['Java', 'Mount Bromo', 'bromo', ['java', 'house']],
    ['Bali', 'Mount Batur', 'batur', ['kintamani']],
  ];
  const islandsPanel = () => `<span class="pn-g pn-isl">${ISLANDS.map(([isl, mt, img, ids], i) => `<span class="isl" style="--i:${i}"><a class="isl-h" href="stories.html#roots"><img src="photos/shop/${img}-600.webp" alt="" loading="lazy" decoding="async"><small>${mt}</small><b>${isl}</b></a>${ids.map((id) => { const p = byId(id); return p ? `<a class="isl-c" href="product.html?id=${id}">${p.name}${p.soon ? ' <em>soon</em>' : ''}</a>` : ''; }).join('')}</span>`).join('')}</span><span class="pn-f">${socRow()}<span class="pn-more"><a href="shop.html">All coffee</a><a href="subscribe.html">The Beans Club</a><a href="find.html">Find your kopi</a></span></span>`;
  const SOC = [
    ['https://www.instagram.com/bija.london/', 'Instagram', '<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.8" cy="7.2" r=".9" fill="currentColor" stroke="none"/>'],
    ['https://www.tiktok.com/@bijalondon', 'TikTok', '<path d="M14 4v10.2a3.4 3.4 0 1 1-3.4-3.4"/><path d="M14 4c.4 2.6 2.2 4.3 4.8 4.5"/>'],
    ['https://www.facebook.com/share/19ZKGk6Zq2/', 'Facebook', '<path d="M13.4 20v-7h2.4l.4-2.8h-2.8V8.5c0-.8.3-1.4 1.4-1.4h1.5V4.6c-.3 0-1.2-.1-2.2-.1-2.2 0-3.6 1.3-3.6 3.7v2h-2.4V13h2.4v7"/>'],
  ];
  const socRow = () => `<span class="pn-soc">${SOC.map(([h, l, g]) => `<a href="${h}" rel="noopener" aria-label="${l}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${g}</svg></a>`).join('')}</span>`;
  function capsule(here) {
    const link = ([h, l]) => {
      const pn = PANELS[h], cur = here === h || (h === 'shop.html' && /^(product|subscribe|find)\.html/.test(here)) || (h === 'stories.html' && /^(stories|our-story|concept|identity|people)\.html/.test(here)) || (h === 'visit.html' && /^menu\.html/.test(here)) || (h === 'catering.html' && /^(offices|events)\.html/.test(here)) ? ' aria-current="page"' : '';
      if (!pn) return `<a href="${h}"${cur}>${l}</a>`;
      const lab = l === 'Bija' ? `<span class="vh">Bija</span>${WORDMARK}` : l;
      return `<span class="has-pn"><a href="${h}"${cur} aria-haspopup="true" aria-expanded="false">${lab}<i class="crt" aria-hidden="true"></i></a><span class="pn" role="group" aria-label="${pn[0]}"><b class="pn-t">${pn[0] === 'Bija' ? `<span class="vh">Bija</span>${WORDMARK}` : pn[0].replace(/^Bija (.*)$/, `<span class="pn-wm"><span class="vh">Bija</span>${WORDMARK}</span> $1`)}</b>${pn[1] === 'islands' ? islandsPanel() : `<span class="pn-g">${pn[1].map(([ph, pl, img], i) => `<a href="${ph}" style="--i:${i}"><img${WHOLE.has(img) ? ' class="whole"' : ''} src="photos/shop/${img}-600.webp" alt="" loading="lazy" decoding="async"><span>${pl}</span></a>`).join('')}</span><span class="pn-f">${socRow()}${pn[2] ? `<span class="pn-more">${pn[2].map(([mh, ml]) => `<a href="${mh}">${ml}</a>`).join('')}</span>` : '<span>© Bija Coffee</span>'}</span>`}</span></span>`;
    };
    return `<span class="nl">${CAP.slice(0, 3).map(link).join('')}</span><a class="mid" href="./" aria-label="Bija home"><span class="mid-k">${ICON.mark}</span><span class="mid-w">${WORDMARK}</span></a><span class="nr">${CAP.slice(3).map(link).join('')}</span>`;
  }
  // phones only: the menu offers the app view and the download, nothing switches by itself
  const MAPP = `<span class="m-app"><a class="m-app-b" href="app.html?view=app">Switch to app view</a><a class="m-app-b alt" href="install.html">Download the app</a></span><a class="m-cat" href="catering.html"><img src="photos/shop/catering-people-600.webp" alt="" width="72" height="72" loading="lazy"><span><b>Catering for your event</b><small>Coffee, pastries and our baristas · from £11.50 a head</small></span><i aria-hidden="true">→</i></a>`;
  function header() {
    const here = location.pathname.split('/').pop() + location.search;
    return `<header class="shead"><div class="wrap in">
      <span class="menuslot"><button class="iconbtn menubtn" aria-expanded="false" aria-controls="mainnav" aria-label="Menu">${ICON.menu}</button></span>
      <a class="brand" href="./" aria-label="Bija home">${ICON.mark}${WORDMARK}</a>
      <nav class="mainnav" id="mainnav" aria-label="Main">${LOOK ? capsule(here) : NAV.map(([h, l]) => `<a href="${h}" ${here === h || (h === 'shop.html' && here === 'shop.html') || (here.startsWith('product.html') && h === 'shop.html') ? 'aria-current="page"' : ''}>${l}</a>`).join('')}${MAPP}</nav>
      ${LOOK ? '<div class="hleft"><a class="hlink" href="help.html">Help</a></div>' : ''}
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
        <nav aria-label="Shop"><p class="fh">Shop</p><a href="shop.html">All coffee</a><a href="subscribe.html">Subscriptions</a><a href="gifts.html">Gifts</a><a href="product.html?id=set">Discovery set</a><a href="product.html?id=gift">Gift subscription</a><a href="app.html?view=app#gifts">Gift cards</a><a href="offices.html">For offices</a><a href="catering.html">Events and catering</a></nav>
        <nav aria-label="Bija"><p class="fh">Bija</p><a href="visit.html">Visit us</a><a href="menu.html">Café menu</a><a href="events.html">What's on</a><a href="our-story.html">Our story</a><a href="identity.html">Brand identity</a><a href="stories.html">Coffee stories</a><a href="drinks.html">Speciality drinks</a><a href="communities.html">Communities</a><a href="find.html">Find your kopi</a><a href="origins.html">Origins</a><a href="brew.html">Brew guides</a><a href="trace.html?b=house">Bean passport</a><a href="sustainability.html">Sustainability</a><a href="rewards.html">Rewards</a><a href="install.html">Get the app</a><a href="press.html">Press</a></nav>
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
  const KAWUNG = KW(true);
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
    if (LOOK) { const hero = document.querySelector('main > .ed-hero'), aw = hero?.nextElementSibling; if (aw?.matches('.ed-award')) { const fit = () => { hero.style.height = innerWidth > 1000 ? Math.max(520, innerHeight - hero.getBoundingClientRect().top - scrollY - aw.offsetHeight) + 'px' : ''; }; fit(); addEventListener('resize', fit, { passive: true }); } }
    // phones: the centre mark grows into the stacked logo, the ij leaning in, once when a visit starts and on each press
    if (LOOK) { const br = document.querySelector('.shead .brand'); if (br) { const play = () => { ijPick(); br.classList.remove('logo-play'); void br.offsetWidth; br.classList.add('logo-play'); };
      let first = false; try { first = !sessionStorage.getItem('bija.logo'); sessionStorage.setItem('bija.logo', '1'); } catch {}
      if (first && !reduce()) setTimeout(play, 700); br.addEventListener('pointerdown', play); br.addEventListener('animationend', (e) => { if (e.animationName === 'mlogo') br.classList.remove('logo-play'); }); } }
    // preview menu panels: open on hover, keyboard focus or a first tap (tablets have no hover); stay open while the pointer moves
    // from the item into its panel; close shortly after it leaves, on Escape, or on a tap elsewhere
    if (LOOK) {
      const items = [...document.querySelectorAll('.shead .has-pn')], wide = matchMedia('(min-width: 1181px)');
      const shut = (h) => { h.classList.remove('open'); h.firstElementChild.setAttribute('aria-expanded', 'false'); };
      items.forEach((h) => {
        const a = h.firstElementChild, pn = a.nextElementSibling; let t;
        const open = () => { clearTimeout(t); const was = items.some((o) => o !== h && o.classList.contains('open')); document.querySelector('.shead .mainnav').classList.toggle('pn-swap', was); items.forEach((o) => o !== h && shut(o)); h.classList.add('open'); a.setAttribute('aria-expanded', 'true'); };
        const later = () => { clearTimeout(t); t = setTimeout(() => shut(h), 260); };
        [a, pn].forEach((el) => { el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && wide.matches) open(); }); el.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') later(); }); });
        // a tap on a closed item opens its panel first; a mouse click (already open from hovering) or Enter goes to the page
        a.addEventListener('pointerdown', () => { h.wasOpen = h.classList.contains('open'); });
        a.addEventListener('click', (e) => { if (wide.matches && h.wasOpen === false) { e.preventDefault(); open(); } h.wasOpen = undefined; });
        h.addEventListener('focusin', () => { if (wide.matches) open(); });
        h.addEventListener('focusout', (e) => { if (!h.contains(e.relatedTarget)) later(); });
      });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') items.forEach(shut); });
      document.addEventListener('pointerdown', (e) => { if (!e.target.closest('.has-pn')) items.forEach(shut); });
    }
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

// the menu marks the page you are on, inside the panels too, so the phone menu can light it
(() => { const mark = () => { const here = location.pathname.split('/').pop() || 'index.html'; document.querySelectorAll('.mainnav .pn a[href]:not(.isl-h)').forEach((a) => { if (a.getAttribute('href').split('#')[0] === here) a.setAttribute('aria-current', 'page'); }); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mark); else mark(); setTimeout(mark, 600); })();

// the open menu is as tall as the screen below the header, scrolls on its own, and the page behind does not move
(() => {
  const fit = () => { const n = document.getElementById('mainnav'); if (!n) return; const open = n.classList.contains('open') && matchMedia('(max-width: 1180px)').matches;
    document.documentElement.classList.toggle('mnav-lock', open); if (open) n.style.setProperty('--mnav-h', Math.max(240, innerHeight - n.getBoundingClientRect().top) + 'px'); };
  document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('.menubtn')) requestAnimationFrame(fit); });
  addEventListener('resize', fit);
  new MutationObserver((ms) => { if (ms.some((m) => m.target.id === 'mainnav')) fit(); }).observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['class'] });
})();

// any link in the menu closes it and frees the page, including links that only jump within this page; never leave the page locked
(() => {
  const close = () => { const n = document.getElementById('mainnav'); if (n && n.classList.contains('open')) { n.classList.remove('open'); document.querySelector('.menubtn')?.setAttribute('aria-expanded', 'false'); } document.documentElement.classList.remove('mnav-lock'); };
  document.addEventListener('click', (e) => { const a = e.target.closest && e.target.closest('#mainnav a[href]'); if (a) close(); });
  addEventListener('hashchange', close); addEventListener('pageshow', (e) => { if (e.persisted) close(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();

// safety net: a page transition never holds the page for more than 1.5s, and a page shown again never stays locked
(() => {
  addEventListener('pagereveal', (e) => { const t = e.viewTransition; if (t) { const k = setTimeout(() => { try { t.skipTransition(); } catch {} }, 1500); t.finished.finally(() => clearTimeout(k)); } });
  addEventListener('pageswap', (e) => { const t = e.viewTransition; if (t) setTimeout(() => { try { t.skipTransition(); } catch {} }, 1500); });
  const free = () => { const d = document.getElementById('drawer'); if (!(d && d.classList.contains('open'))) document.documentElement.style.overflow = ''; if (!document.getElementById('mainnav')?.classList.contains('open')) document.documentElement.classList.remove('mnav-lock'); };
  addEventListener('pageshow', free); document.addEventListener('visibilitychange', () => { if (!document.hidden) free(); });
})();
