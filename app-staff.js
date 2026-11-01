/* Bija staff tools (barista queue, web & delivery, members, gift cards, insights, finance, menu admin, Maheera).
   Generated from app.html by scratchpad/perf/split/split.js: the code is unchanged, it just loads on demand.
   It runs inside the app's own scope through the accessor object app.html passes in (staffCore), so it reads and
   writes the same state (S, render, esc, money…) as before. */
window.__bijaStaffInit = function (core) {
  with (core) { // eslint-disable-line no-with
const FLOW = { received: 'brewing', brewing: 'ready', ready: 'collected' };
function lvAllOrders() {
    const name = (uid) => clip(S.customers.find((c) => c.id === uid)?.name || 'Guest', 40);
    return LV.all.map((o) => {
      const q = lvReq(o), rw = q.reward;
      return { ...q, id: o.id, status: o.status, cid: o.uid, cname: name(o.uid), claimed: q.total, priced: null, reward: rw ? { ...rw } : null, discount: q.discount, stampFree: q.stampFree,
        giftPay: 0, giftNote: !!o.use_gift, st: () => ({ pointsRaw: 0, stampsRaw: 0, giftBase: 0 }) }; // the server checks balances at collect
    }).sort((x, y) => String(y.createdAt).localeCompare(String(x.createdAt)));
  }
function giftsBar() {
    const { gifts, claims } = giftData();
    const unpaid = gifts.filter((g) => !g.paid), sold = gifts.filter((g) => g.paid);
    return `<div class="tiles">
      <div class="tile"><small>Gift cards sold</small><b>${money(sold.reduce((a, g) => a + (+g.amount || 0), 0))}</b><span>${sold.length} card${sold.length === 1 ? '' : 's'}</span></div>
      <div class="tile"><small>To take payment</small><b>${unpaid.length}</b><span>customer pays at the bar</span></div>
      <div class="tile"><small>Codes to confirm</small><b>${claims.length}</b><span>redeemed in the app</span></div>
    </div>
    <section class="sec"><div class="sec-h"><h2>Take payment</h2></div>
      ${!unpaid.length ? '<div class="empty"><b>Nothing waiting</b>Gift cards bought in the app appear here until they are paid.</div>' : `<div class="list">${unpaid.map((g) => `<article class="order"><div class="h"><b>${money(g.amount)} for ${esc(g.to || 'someone')}</b><span class="hint">${fmt(g.createdAt)}</span></div><div class="lines">Bought by <b>${esc(g.bname)}</b>${g.message ? ` · “${esc(g.message)}”` : ''}</div><div><button class="btn sm ok" data-act="gpaid" data-c="${esc(g.buyer)}" data-g="${esc(g.gid)}" ${S.busy ? 'disabled' : ''}>Paid · activate card</button></div></article>`).join('')}</div>`}
    </section>
    <section class="sec"><div class="sec-h"><h2>Codes to confirm</h2></div>
      ${!claims.length ? '<div class="empty"><b>No codes waiting</b>When someone adds a gift card in the app, you confirm it here.</div>' : `<div class="list">${claims.map((c) => {
        const g = c.gift, ok = g && g.paid && !g.used;
        const why = !g ? 'No gift card has this code' : !g.paid ? 'Not paid yet' : 'Already redeemed';
        return `<article class="order"><div class="h"><span class="code">${esc(c.code)}</span><span class="hint">${fmt(c.at)}</span></div><div class="lines"><b>${esc(c.cname)}</b> ${ok ? `adds ${money(g.amount)} from ${esc(g.bname)}` : `· <span style="color:var(--warn)">${why}</span>`}</div>
          <div class="row">${ok ? `<button class="btn sm ok" data-act="gok" data-c="${esc(c.cid)}" data-code="${esc(c.code)}" ${S.busy ? 'disabled' : ''}>Confirm · add balance</button>` : ''}<button class="btn sm ghost" data-act="gno" data-c="${esc(c.cid)}" data-code="${esc(c.code)}" ${S.busy ? 'disabled' : ''}>Reject</button></div></article>`;
      }).join('')}</div>`}
    </section>
    <section class="sec"><div class="sec-h"><h2>All gift cards</h2></div>
      ${!gifts.length ? '<p class="hint">None yet.</p>' : `<div class="panel tablewrap"><table><thead><tr><th>Code</th><th class="num">Amount</th><th>From</th><th>To</th><th>Status</th></tr></thead><tbody>${gifts.map((g) => `<tr><td class="code">${g.paid ? esc(g.code) : '·'}</td><td class="num">${money(g.amount)}</td><td>${esc(g.bname)}</td><td>${esc(g.to || '')}</td><td>${g.used ? 'Redeemed' : g.paid ? 'Active' : 'Unpaid'}</td></tr>`).join('')}</tbody></table></div>`}
    </section>`;
  }
function barista() {
    if (!S.custLoaded || !S.configLoaded) return notReady();
    queueMicrotask(migrateBar);
    if (S.btab === 'members') return members();
    if (S.btab === 'shop') return shopBar();
    if (S.btab === 'gifts') return giftsBar();
    if (S.btab === 'insights') return insights();
    if (S.btab === 'menu') return menuEditor();
    if (S.btab === 'finance') return finance();
    if (S.btab === 'maheera') return maheera();
    return queue();
  }
function allOrders() {
    if (live()) return lvAllOrders();
    const out = [], now = Date.now(), DAY = 864e5;
    for (const c of S.customers) {
      const b = S.bars[c.id]; let open = 0;
      for (const o of ordersOf(c, b).reverse()) {
        const ts = Date.parse(o.createdAt);
        if (!Number.isFinite(ts) || ts > now + DAY) continue;
        const isOpen = o.status !== 'collected' && o.status !== 'cancelled';
        if (isOpen && (ts < now - DAY || ++open > 5)) continue;
        const p = priceOrder(o), t = o.status === 'collected' ? trusted(o, b) : null;
        out.push({ ...o, code: clip(o.code, 12), slot: clip(o.slot, 24), note: clip(o.note, 140), milk: clip(o.milk, 20), sweet: clip(o.sweet, 20),
          lines: t ? t.lines : p.lines, total: t ? t.total : p.total, claimed: +o.total, priced: p, reward: t ? (t.redeemed ? { ...t.redeemed, name: REWARDS.find((r) => r.id === t.redeemed.id)?.name || 'Reward' } : null) : p.reward,
          discount: p.discount, cid: c.id, cname: clip(c.name || 'Guest', 40), st: () => stats(c, b) });
      }
    }
    return out.sort((x, y) => String(y.createdAt).localeCompare(String(x.createdAt)));
  }
function queue() {
    const all = allOrders();
    const active = all.filter((o) => o.status !== 'collected' && o.status !== 'cancelled').reverse();
    const today = new Date().toDateString();
    const todays = all.filter((o) => o.status !== 'cancelled' && new Date(o.createdAt).toDateString() === today);
    const list = S.qFilter === 'active' ? active : S.qFilter === 'collected' ? all.filter((o) => o.status === 'collected') : all;
    const nextLabel = { received: 'Start brewing', brewing: 'Ready · call code', ready: 'Collected · add points' };
    return `<div class="tiles">
      <div class="tile"><small>In the queue</small><b>${active.length}</b><span>${active.filter((o) => o.status === 'ready').length} ready to collect</span></div>
      <div class="tile"><small>Today</small><b>${money(todays.reduce((a, o) => a + (+o.total || 0), 0))}</b><span>${todays.length} order${todays.length === 1 ? '' : 's'}, after free drinks</span></div>
      <div class="tile"><small>App ordering</small><b>${isOpen() ? 'On' : 'Off'}</b><span><button class="btn sm ghost" data-act="toggle-open" ${S.busy ? 'disabled' : ''}>${isOpen() ? 'Pause orders' : 'Resume orders'}</button></span></div>
    </div>
    <div class="cats" style="margin-top:14px">${[['active', 'Active'], ['collected', 'Collected'], ['all', 'All']].map(([k, l]) => `<button data-act="qf" data-v="${k}" aria-pressed="${S.qFilter === k}">${l}</button>`).join('')}</div>
    <div class="list">${!list.length ? `<div class="empty"><b>${S.qFilter === 'active' ? 'Queue is clear' : 'Nothing here yet'}</b>New app orders appear here the moment they're placed, oldest first.</div>` : list.map((o) => {
      const st = o.st();
      return `<article class="order">
        <div class="h"><span><span class="code" style="font-size:18px">${esc(o.code)}</span> · <b>${esc(o.cname)}</b></span><span class="pill ${o.status}">${STATUS[o.status]}</span></div>
        <div class="lines">${(o.lines || []).map((l) => `<b>${num(l.qty, 0, 20)}×</b> ${esc(l.name)}${l.origin ? ` (${esc(origin(l.origin)?.name || '')})` : ''}${optText(l) ? ` — <b style="color:var(--ink)">${esc(clip(optText(l), 60))}</b>` : ''}`).join(' · ')}</div>
        <div class="hint">${o.milk ? esc(o.milk) + ' milk · ' + esc(o.sweet) + ' · ' : ''}${esc(o.slot)} · <b style="color:var(--ink)">${money(o.total)}</b> · ${fmt(o.createdAt)}</div>
        ${o.status !== 'collected' && Math.abs((+o.claimed || 0) - o.total) > 0.01 ? `<div class="hint warn"><b>Price check:</b> ${money(o.total)} on today's menu, ${Number.isFinite(o.claimed) ? money(o.claimed) : 'no total'} in the order. Charge the menu price.</div>` : ''}
        ${o.note ? `<p class="quote${/^ALLERGY:/.test(o.note) ? ' allergy' : ''}">${/^ALLERGY:/.test(o.note) ? '⚠ ' : ''}${esc(o.note)}</p>` : ''}
        ${o.reward ? `<div class="hint warn"><b>Points reward:</b> ${esc(o.reward.name)} (−${num(o.reward.pts, 0, 1e5)} pts) · ${money(o.discount)} off${o.status !== 'collected' && st.pointsRaw < 0 ? ' · <b>not enough points: charge full price</b>' : ''}</div>` : ''}
        ${o.status !== 'collected' && o.stampFree ? `<div class="hint warn"><b>Stamp card:</b> free drink${st.stampsRaw < 0 ? ' · <b>not enough stamps: charge full price</b>' : ''}</div>` : ''}
        ${o.status !== 'collected' && +o.giftPay > 0 ? (() => { const give = Math.min(+o.giftPay, o.total, Math.max(0, st.giftBase)); return `<div class="hint"><b>Gift card:</b> ${money(give)} from their balance · take ${money(Math.max(0, r2(o.total - give)))}</div>`; })() : ''}
        <div class="row">
          ${FLOW[o.status] ? `<button class="btn sm ${o.status === 'ready' ? 'ok' : ''}" data-act="status" data-c="${esc(o.cid)}" data-o="${esc(o.id)}" data-s="${FLOW[o.status]}" ${S.busy ? 'disabled' : ''}>${nextLabel[o.status]}</button>` : ''}
          ${o.status === 'collected' ? `<button class="btn sm ghost" data-act="status" data-c="${esc(o.cid)}" data-o="${esc(o.id)}" data-s="ready" ${S.busy ? 'disabled' : ''}>Undo</button>` : ''}
        </div>
      </article>`;
    }).join('')}</div>`;
  }
function shopBar() {
    const orders = [];
    for (const c of S.customers) for (const o of shopOf(c, S.bars[c.id])) orders.push({ ...o, cid: c.id, cname: o.name || c.name || 'Guest' });
    const open = orders.filter((o) => o.status === 'placed').reverse(), sent = orders.filter((o) => o.status === 'dispatched' || o.status === 'collected');
    const due = subsDue(), today = ldate();
    const subsRev = Object.values(S.bars).reduce((a, bd) => a + Object.values(bd?.subs || {}).reduce((x, y) => x + (+y.amount || 0), 0), 0);
    const active = S.customers.reduce((a, c) => a + Object.values(c.subs || {}).filter((x) => !x.cancelled && !x.paused).length, 0);
    const lines = (ls) => (Array.isArray(ls) ? ls : []).slice(0, 30).map((l) => `<b>${num(l.qty, 0, 20)}×</b> ${esc(clip(l.name, 60))} —<b style="color:var(--ink)">${esc(l.grind)}</b>${l.plan !== 'once' ? ` <small>(${esc(PLANS[l.plan] || '')})</small>` : ''}`).join(' · ');
    const addr = (d) => d?.method === 'post' ? `Royal Mail Tracked 48 · ${esc(d.address || '')}${d.postcode ? ', ' + esc(d.postcode) : ''}` : 'Click & collect at the bar';
    return `<div class="tiles">
      <div class="tile"><small>To send or hand over</small><b>${open.length}</b><span>${open.filter((o) => o.delivery?.method === 'post').length} by post</span></div>
      <div class="tile"><small>Beans Club due</small><b>${due.length}</b><span>in the next 3 days</span></div>
      <div class="tile"><small>Beans sales</small><b>${money(sent.reduce((a, o) => a + (+o.total || 0), 0) + subsRev)}</b><span>sent orders and deliveries</span></div>
      <div class="tile"><small>Subscribers</small><b>${active}</b><span>active subscriptions</span></div>
    </div>
    <section class="sec"><div class="sec-h"><h2>Orders to send</h2><small>App and web shop</small></div>
      ${!open.length ? '<div class="empty"><b>Nothing to send</b>Beans orders from the app and the website appear here.</div>' : `<div class="list">${open.map((o) => `<article class="order">
        <div class="h"><span><span class="code" style="font-size:18px">${esc(o.code)}</span> · <b>${esc(o.cname)}</b></span><span class="pill received">${o.source === 'web' ? 'Web' : 'App'}</span></div>
        <div class="lines">${lines(o.lines)}</div>
        <div class="hint">${addr(o.delivery)}${o.email ? ' · ' + esc(o.email) : ''} · <b style="color:var(--ink)">${money(o.total)}</b> · ${fmt(o.createdAt)}</div>
        <div class="row"><button class="btn sm ok" data-act="shipst" data-c="${esc(o.cid)}" data-o="${esc(o.id)}" data-s="${o.delivery?.method === 'post' ? 'dispatched' : 'collected'}" ${S.busy ? 'disabled' : ''}>${o.delivery?.method === 'post' ? 'Dispatched · add points' : 'Collected · add points'}</button></div>
      </article>`).join('')}</div>`}
    </section>
    <section class="sec"><div class="sec-h"><h2>Beans Club deliveries</h2><small>Due in the next 3 days</small></div>
      ${!due.length ? '<div class="empty"><b>No deliveries due</b>Subscriptions show up here three days before each delivery.</div>' : `<div class="list">${due.map((x) => `<article class="order">
        <div class="h"><span><b>${esc(clip(x.cname, 40))}</b> · ${num(x.qty, 0, 20)}× ${esc(clip(product(x.pid)?.name || x.name, 60))}</span><span class="pill ${x.next < today ? 'cancelled' : 'brewing'}">${x.next < today ? 'Late' : 'Due'} ${esc(ukDay(x.next))}</span></div>
        <div class="lines"><b style="color:var(--ink)">${esc(clip(x.grind, 20))}</b> · ${esc(PLANS[x.plan] || '')} · ${money(product(x.pid) ? unitOf(product(x.pid), x.plan) * num(x.qty, 1, 20) : 0)}</div>
        <div class="hint">${addr(x.delivery)}</div>
        <div class="row"><button class="btn sm ok" data-act="subship" data-c="${esc(x.cid)}" data-s="${esc(x.id)}" data-d="${esc(x.next)}" ${S.busy ? 'disabled' : ''}>${x.delivery?.method === 'post' ? 'Dispatched' : 'Collected'} · add points</button></div>
      </article>`).join('')}</div>`}
    </section>
    ${sent.length ? `<section class="sec"><div class="sec-h"><h2>Sent</h2></div><div class="panel tablewrap"><table><thead><tr><th>Code</th><th>Name</th><th>Items</th><th class="num">Total</th><th>Status</th></tr></thead><tbody>${sent.slice(0, 12).map((o) => `<tr><td class="code">${esc(o.code)}</td><td>${esc(o.cname)}</td><td>${(o.lines || []).reduce((a, l) => a + l.qty, 0)}</td><td class="num">${money(o.total)}</td><td>${o.status === 'dispatched' ? 'Dispatched' : 'Collected'} ${esc(fmt(o.doneAt))}</td></tr>`).join('')}</tbody></table></div></section>` : ''}`;
  }
function members() {
    const rows = S.customers.map((c) => ({ c, st: stats(c, S.bars[c.id]) })).filter((r) => r.st.os.length || r.st.instore || r.st.credits || r.st.shop.length).sort((a, b) => b.st.lifetime - a.st.lifetime);
    return `<div class="panel stack">
      <div><b>Add in-store spend</b><div class="hint">Customer shows their Bija Card code or QR when paying at the till.</div></div>
      <div class="grid2"><label class="f">Member code<input type="text" id="is-code" data-is="code" value="${esc(S.instore.code)}" placeholder="BIJA-XXXXX" style="text-transform:uppercase;font-family:var(--mono)"></label>
      <label class="f">Amount paid (£)<input type="number" min="0" step="0.1" id="is-amt" data-is="amount" value="${esc(S.instore.amount)}"></label>
      <label class="f">Drinks <span class="h">Handcrafted drinks, for stamps</span><input type="number" min="0" max="20" step="1" id="is-drinks" data-is="drinks" value="${esc(S.instore.drinks || '')}" inputmode="numeric"></label></div>
      <label class="chk"><input type="checkbox" id="is-double" data-is="double" ${S.instore.double ? 'checked' : ''}> Early bird: double points (Mon–Fri before 9am)</label>
      <div><button class="btn sm" data-act="instore" ${S.busy ? 'disabled' : ''}>Add points</button></div>
    </div>
    ${refsToConfirm().length ? `<section class="sec"><div class="sec-h"><h2>Invites to confirm</h2><small>+${REFER} each side</small></div><div class="list">${refsToConfirm().map(({ c, by }) => `<article class="order"><div class="h"><b>${esc(c.name || 'Guest')}</b><span class="code">${esc(c.referredBy)}</span></div>
      <div class="lines">${by ? `Invited by <b>${esc(by.name || 'a member')}</b>. First order collected.` : '<span style="color:var(--warn)">No member has this code</span>'}</div>
      <div class="row">${by ? `<button class="btn sm ok" data-act="refok" data-c="${esc(c.id)}" ${S.busy ? 'disabled' : ''}>Confirm · +${REFER} each</button>` : ''}<button class="btn sm ghost" data-act="refno" data-c="${esc(c.id)}" ${S.busy ? 'disabled' : ''}>Reject</button></div></article>`).join('')}</div></section>` : ''}
    <section class="sec">${live() ? lvMembersTable() : !rows.length ? '<div class="empty"><b>No Bija Card members yet</b>Everyone who orders in the app gets a card automatically.</div>' : `<div class="panel tablewrap"><table>
      <thead><tr><th>Name</th><th>Code</th><th>Level</th><th class="num">Points</th><th class="num">Stamps</th><th class="num">All time</th><th class="num">Gift £</th><th class="num">Secrets</th><th>Last order</th></tr></thead>
      <tbody>${rows.map(({ c, st }) => `<tr><td><b>${esc(c.name || 'Guest')}</b></td><td class="code">${esc(memberCode(c.id))}</td><td>${esc(st.tier.name)}</td><td class="num">${st.balance}</td><td class="num">${Math.min(st.stamps, STAMP_FREE_AT)}/${STAMP_FREE_AT + 1}${st.stamps >= STAMP_FREE_AT ? ' · free' : ''}</td><td class="num">${st.lifetime}</td><td class="num">${money(st.wallet)}</td><td class="num">${st.found}/${SPOTS.length}</td><td>${fmt(st.os[0]?.createdAt)}</td></tr>`).join('')}</tbody>
    </table></div>`}</section>`;
  }
function lvInsights() {
    const I = LV.ins, pct = Math.round((+I.repeat_rate || 0) * 100), ins = I.instore || {};
    const hours = Object.entries(I.by_hour || {}).map(([h, n]) => [String(num(h, 0, 23)).padStart(2, '0') + ':00', num(n, 0, 1e6)]).sort((a, b) => a[0].localeCompare(b[0]));
    const best = (Array.isArray(I.best_sellers) ? I.best_sellers : []).slice(0, 8).map((x) => [clip(x.name || x.id, 40), num(x.qty, 0, 1e6)]);
    const spots = SPOTS.map((x) => [x.name, S.customers.filter((c) => c.secret?.visited?.[x.id]).length]);
    const ratings = S.customers.flatMap((c) => Object.values(c.ratings || {}).slice(-50).filter((r) => r && typeof r === 'object').map((r) => ({ stars: num(r.stars, 1, 5), comment: clip(r.comment, 200), at: r.at, name: clip(c.name, 40) })));
    const avg = ratings.length ? ratings.reduce((a, r) => a + r.stars, 0) / ratings.length : 0;
    const comments = ratings.filter((r) => r.comment).sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, 6);
    return `<div class="tiles">
      <div class="tile"><small>Members visiting</small><b>${num(I.members_active, 0, 1e6)}</b><span>${num(I.repeat_members, 0, 1e6)} came back (${pct}%), last ${num(I.days, 1, 366)} days</span></div>
      <div class="tile"><small>App revenue</small><b>${money(+I.revenue || 0)}</b><span>${num(I.orders, 0, 1e6)} collected · ${money(+I.avg_order || 0)} average</span></div>
      <div class="tile"><small>In store with Bija Card</small><b>${money(+ins.amount || 0)}</b><span>${num(ins.count, 0, 1e6)} visit${+ins.count === 1 ? '' : 's'} recorded</span></div>
      <div class="tile"><small>Rating</small><b>${ratings.length ? avg.toFixed(1) : '–'}</b><span>${ratings.length} rating${ratings.length === 1 ? '' : 's'}</span></div>
    </div>
    <div class="cols sec">
      <div class="panel"><div class="sec-h"><h2>Best sellers</h2><small>Last ${num(I.days, 1, 366)} days</small></div>${bars(best)}</div>
      <div class="panel"><div class="sec-h"><h2>Collected by hour</h2><small>London time</small></div>${bars(hours)}</div>
      <div class="panel"><div class="sec-h"><h2>Secret spots found</h2></div>${bars(spots.filter((s) => s[1]))}</div>
      <div class="panel"><div class="sec-h"><h2>What people say</h2></div>${comments.length ? `<div class="list">${comments.map((r) => `<p class="quote">${esc(r.comment)}<br><span class="hint">${esc(r.name || 'Guest')} · ${'★'.repeat(num(r.stars, 0, 5))}</span></p>`).join('')}</div>` : '<p class="hint">No comments yet.</p>'}</div>
    </div>`;
  }
function lvMembersTable() {
    const rows = LV.members.filter((m) => m.visits > 0 || +m.points || +m.gift_balance);
    if (!rows.length) return '<div class="empty"><b>No Bija Card members yet</b>Everyone who orders in the app gets a card automatically.</div>';
    const name = (uid) => clip(S.customers.find((c) => c.id === uid)?.name || 'Guest', 40);
    const tier = (life) => (TIERS.filter((t) => life >= t.min).pop() || TIERS[0]).name;
    return `<div class="panel tablewrap"><table>
      <thead><tr><th>Name</th><th>Code</th><th>Level</th><th class="num">Points</th><th class="num">Stamps</th><th class="num">All time</th><th class="num">Gift £</th><th class="num">Visits</th><th>Last visit</th></tr></thead>
      <tbody>${rows.map((m) => { const st = num(m.stamps, 0, 1e6), life = num(m.lifetime_points, 0, 1e9); return `<tr><td><b>${esc(name(m.uid))}</b></td><td class="code">${esc(clip(m.member_code, 12))}</td><td>${esc(tier(life))}</td><td class="num">${num(m.points, -1e9, 1e9)}</td><td class="num">${Math.min(st, STAMP_FREE_AT)}/${STAMP_FREE_AT + 1}${st >= STAMP_FREE_AT ? ' · free' : ''}</td><td class="num">${life}</td><td class="num">${money(Math.max(0, +m.gift_balance || 0))}</td><td class="num">${num(m.visits, 0, 1e6)}</td><td>${m.last_visit ? fmt(m.last_visit) : '–'}</td></tr>`; }).join('')}</tbody>
    </table></div>`;
  }
function bars(entries, fmtv) {
    if (!entries.length) return `<p class="hint">No data yet.</p>`;
    entries = entries.map(([n, v]) => [String(n), Number.isFinite(+v) ? Math.max(0, +v) : 0]); // chart values are coerced and escaped (S1)
    const max = Math.max(...entries.map((e) => e[1]), 1);
    return `<div class="bars">${entries.map(([n, v]) => `<div class="bar"><span class="n" title="${esc(n)}">${esc(n)}</span><span class="tr"><span class="fl" style="width:${(v / max) * 100}%"></span></span><span class="v">${esc(fmtv ? fmtv(v) : v)}</span></div>`).join('')}</div>`;
  }
function insights() {
    if (live() && LV.ins) return lvInsights();
    const all = allOrders().filter((o) => o.status !== 'cancelled');
    const buyers = S.customers.filter((c) => ordersOf(c, S.bars[c.id]).some((o) => o.status !== 'cancelled'));
    const repeat = buyers.filter((c) => ordersOf(c, S.bars[c.id]).filter((o) => o.status !== 'cancelled').length >= 2).length;
    const qty = new Map(); for (const o of all) for (const l of o.lines || []) qty.set(l.name, (qty.get(l.name) || 0) + l.qty);
    const hours = new Map(); for (const o of all) { const h = new Date(o.createdAt).getHours(); const k = String(h).padStart(2, '0') + ':00'; hours.set(k, (hours.get(k) || 0) + 1); }
    const spots = SPOTS.map((x) => [x.name, S.customers.filter((c) => c.secret?.visited?.[x.id]).length]);
    // ratings are customer-written: stars clamped 1–5, text clipped (S1, S8)
    const ratings = S.customers.flatMap((c) => Object.values(c.ratings || {}).slice(-50).filter((r) => r && typeof r === 'object').map((r) => ({ ...r, stars: num(r.stars, 1, 5), comment: clip(r.comment, 200), name: clip(c.name, 40) })));
    const avg = ratings.length ? ratings.reduce((a, r) => a + (+r.stars || 0), 0) / ratings.length : 0;
    const comments = ratings.filter((r) => r.comment).sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, 6);
    return `<div class="tiles">
      <div class="tile"><small>App customers</small><b>${buyers.length}</b><span>${repeat} came back</span></div>
      <div class="tile"><small>Revenue</small><b>${money(all.reduce((a, o) => a + (+o.total || 0), 0))}</b><span>${all.length} order${all.length === 1 ? '' : 's'}, all time</span></div>
      <div class="tile"><small>Points issued</small><b>${S.customers.reduce((a, c) => a + stats(c, S.bars[c.id]).lifetime, 0).toLocaleString('en-GB')}</b><span>${S.customers.reduce((a, c) => a + stats(c, S.bars[c.id]).spent, 0).toLocaleString('en-GB')} spent on rewards</span></div>
      <div class="tile"><small>Rating</small><b>${ratings.length ? avg.toFixed(1) : '–'}</b><span>${ratings.length} rating${ratings.length === 1 ? '' : 's'}</span></div>
    </div>
    <div class="cols sec">
      <div class="panel"><div class="sec-h"><h2>Best sellers</h2></div>${bars([...qty].sort((a, b) => b[1] - a[1]).slice(0, 8))}</div>
      <div class="panel"><div class="sec-h"><h2>Order times</h2></div>${bars([...hours].sort((a, b) => a[0].localeCompare(b[0])))}</div>
      <div class="panel"><div class="sec-h"><h2>Secret spots found</h2></div>${bars(spots.filter((s) => s[1]))}</div>
      <div class="panel"><div class="sec-h"><h2>What people say</h2></div>${comments.length ? `<div class="list">${comments.map((r) => `<p class="quote">${esc(r.comment)}<br><span class="hint">${esc(r.name || 'Guest')} · ${'★'.repeat(num(r.stars, 0, 5))}</span></p>`).join('')}</div>` : '<p class="hint">No comments yet.</p>'}</div>
    </div>`;
  }
const VAT_HELP = { 20: 'Standard rate', 5: 'Reduced rate, e.g. home energy', 0: 'Zero rate, e.g. milk, beans, most food', exempt: 'Exempt, e.g. insurance, card fees', none: 'No VAT: wages, business rates' };
const PERIODS = [['week', 'This week'], ['lastweek', 'Last week'], ['month', 'This month'], ['lastmonth', 'Last month'], ['d90', 'Last 90 days']];
const FIN_SUBS = [['today', 'Today'], ['close', 'Close the day'], ['out', 'Money out'], ['bills', 'Bills'], ['flow', 'Cash flow'], ['pl', 'Profit & loss'], ['vat', 'VAT'], ['staff', 'Staff'], ['dates', 'Deadlines'], ['reports', 'Reports & export'], ['settings', 'Settings']];
const UK = { vatThreshold: 90000, nlw: 12.71, niRate: 0.15, niWeekly: 96, empAllowance: 10500, aeTrigger: 10000 / 52, qeLow: 6240 / 52, qeHigh: 50270 / 52, pension: 0.03 };
const addMonths = (s, n) => { let [y, m, d] = s.split('-').map(Number); const end = d === lastDay(y, m); m += n; y += Math.floor((m - 1) / 12); m = ((m - 1) % 12 + 12) % 12 + 1; return ymd(y, m, end ? lastDay(y, m) : Math.min(d, lastDay(y, m))); };
function appCollected(date) { // app orders are paid at the bar, so they are already inside the till's card and cash totals
    if (live()) { const r = LV.sales[date]; return r ? [pen(+r.app_sales || 0), num(r.app_orders, 0, 1e6)] : [0, 0]; } // the server's figure
    let t = 0, n = 0; for (const c of S.customers) for (const o of ordersOf(c, S.bars[c.id])) { const at = new Date(o.createdAt); if (o.status === 'collected' && !isNaN(at) && ldate(at) === date) { t += +o.total || 0; n++; } }
    return [pen(t), n];
  }
function vatQuarters(st = finSet(), today = ldate()) { // most recent first: the current quarter, then finished ones
    const ends = { 1: [3, 6, 9, 12], 2: [1, 4, 7, 10], 3: [2, 5, 8, 11] }[st.stagger], out = [];
    const [ty] = today.split('-').map(Number);
    for (let y = ty + 1; y >= ty - 2; y--) for (const m of [...ends].reverse()) { const e = ymd(y, m, lastDay(y, m)), s = addDays(addMonths(e, -3), 1); if (s <= today) out.push([s, e]); }
    return out.slice(0, 6);
  }
function recurringKeys() { // latest entry for each monthly cost, keyed by category and supplier
    const m = new Map();
    for (const e of S.fin.entries) if (e.kind === 'expense' && e.recurring) { const k = catOf(e) + '|' + String(e.note || '').trim().toLowerCase(); const p = m.get(k); if (!p || e.date > p.date) m.set(k, e); }
    return [...m.values()];
  }
function recurringDue(today = ldate()) { // monthly costs not yet added this month
    const ym = today.slice(0, 7);
    return recurringKeys().filter((e) => e.date.slice(0, 7) < ym && !S.fin.entries.some((x) => x.kind === 'expense' && x.date.slice(0, 7) === ym && catOf(x) === catOf(e) && String(x.note || '').trim().toLowerCase() === String(e.note || '').trim().toLowerCase()));
  }
function cashFlow(st = finSet(), today = ldate()) {
    const wk0 = monday(today), weeks = [];
    for (let i = 12; i >= 1; i--) {
      const a = addDays(wk0, -7 * i), b = addDays(a, 6), es = S.fin.entries.filter((e) => e.date >= a && e.date <= b);
      weeks.push({ a, b, in: sumBy(es.filter((e) => e.kind !== 'expense'), flow), out: sumBy(es.filter((e) => e.kind === 'expense'), (e) => +e.amount), end: balanceAt(b, st), actual: true, data: es.length > 0 });
    }
    const recent = weeks.slice(-4), withIn = recent.filter((w) => w.in > 0);
    const avgIn = withIn.length ? pen(withIn.reduce((x, w) => x + w.in, 0) / withIn.length) : 0;
    const varOut = pen(recent.reduce((x, w) => x + sumBy(S.fin.entries.filter((e) => e.kind === 'expense' && !e.recurring && e.date >= w.a && e.date <= w.b), (e) => +e.amount), 0) / 4);
    const recWeekly = pen(recurringKeys().reduce((x, e) => x + (+e.amount || 0), 0) * 12 / 52);
    const unpaid = S.fin.bills.filter((x) => !x.paid);
    let bal = balanceAt(today, st); const fc = [];
    for (let j = 1; j <= 8; j++) {
      const a = addDays(wk0, 7 * j), b = addDays(a, 6);
      const billsOut = sumBy(unpaid.filter((x) => j === 1 ? x.due <= b : x.due >= a && x.due <= b), (x) => +x.amount);
      const out = pen(varOut + recWeekly + billsOut); bal = pen(bal + avgIn - out);
      fc.push({ a, b, in: avgIn, out, end: bal, actual: false, bills: billsOut });
    }
    const low = fc.reduce((m, w) => (w.end < m.end ? w : m), fc[0]);
    return { weeks, fc, avgIn, varOut, recWeekly, now: balanceAt(today, st), low, firstNeg: fc.find((w) => w.end < 0) };
  }
function deadlines(st = finSet(), today = ldate()) {
    const out = [], horizon = addMonths(today, 15), [ty] = today.split('-').map(Number), add = (date, title, help, tag) => { if (date >= today && date <= horizon) out.push({ date, title, help, tag }); };
    if (st.vat) {
      const ends = { 1: [3, 6, 9, 12], 2: [1, 4, 7, 10], 3: [2, 5, 8, 11] }[st.stagger];
      for (let y = ty - 1; y <= ty + 1; y++) for (const m of ends) { const qe = ymd(y, m, lastDay(y, m)); add(addDays(addMonths(qe, 1), 7), 'VAT return and payment', `For the quarter ending ${dlabel(qe, { day: 'numeric', month: 'long', year: 'numeric' })}. Due 1 month and 7 days after the quarter ends, filed through MTD software.`, 'VAT'); }
    }
    if (isDate(st.yearEnd)) {
      const [, mm, dd] = st.yearEnd.split('-').map(Number);
      for (let y = ty - 2; y <= ty + 1; y++) {
        const ye = ymd(y, mm, Math.min(dd, lastDay(y, mm))), yl = dlabel(ye, { day: 'numeric', month: 'short', year: 'numeric' });
        add(addMonths(ye, 9), 'Annual accounts to Companies House', `For the year ending ${yl}. Private companies: 9 months after the year end (first accounts can differ).`, 'Companies House');
        add(addDays(addMonths(ye, 9), 1), 'Corporation Tax payment', `For the year ending ${yl}. Due 9 months and 1 day after the year end.`, 'HMRC');
        add(addMonths(ye, 12), 'Company Tax Return (CT600)', `For the year ending ${yl}. Due 12 months after the year end.`, 'HMRC');
      }
    }
    if (isDate(st.csDate)) {
      const [, mm, dd] = st.csDate.split('-').map(Number);
      for (let y = ty - 1; y <= ty + 1; y++) add(addDays(ymd(y, mm, Math.min(dd, lastDay(y, mm))), 14), 'Confirmation statement', 'Check company details at Companies House and pay the fee. Due within 14 days after your review date.', 'Companies House');
    }
    if (st.paye) {
      const [y0, m0] = today.split('-').map(Number);
      for (let i = 0; i < 3; i++) { const m = ((m0 - 1 + i) % 12) + 1, y = y0 + Math.floor((m0 - 1 + i) / 12); add(ymd(y, m, 22), 'PAYE and NI to HMRC', 'For the tax month that ended on the 5th, when paying electronically. Send the payroll report (FPS) on or before each payday.', 'HMRC'); }
    }
    return out.sort((a, b) => a.date.localeCompare(b.date));
  }
const daysTo = (d, today = ldate()) => Math.round((new Date(d + 'T12:00:00Z') - new Date(today + 'T12:00:00Z')) / 864e5);
const whenTxt = (n) => n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : n < 0 ? `${-n} day${n === -1 ? '' : 's'} late` : `In ${n} days`;
function finance() {
    if (!S.fin.loaded) return notReady();
    if (S.fin.err) return `<div class="empty"><b>Finance data isn't available</b>The owner-only finance storage couldn't be read. Ask whoever publishes the app to allow the <span class="code">finance</span> collection for admins.</div>`;
    const sub = FIN_SUBS.some((x) => x[0] === S.fin.sub) ? S.fin.sub : 'today', over = S.fin.bills.filter((x) => !x.paid && x.due < ldate()).length;
    const nav = `<nav class="cats fsubs" aria-label="Finance sections">${FIN_SUBS.map(([id, l]) => `<button data-act="fsub" data-v="${id}" aria-pressed="${sub === id}">${l}${id === 'bills' && over ? `<span class="fcount" aria-label=", ${over} overdue">${over}</span>` : ''}</button>`).join('')}</nav>`;
    const body = { today: finToday, close: finCloseView, out: finOutView, bills: finBillsView, flow: finFlowView, pl: finPLView, vat: finVatView, staff: finStaffView, dates: finDatesView, reports: finReports, settings: finSettingsView }[sub]();
    // thousands separators on every amount shown (£12,620.00); inputs hold plain numbers and are untouched
    return `<div class="fin2">${nav}${body.replace(/£(\d{4,})(\.\d\d)?/g, (_, i, d) => '£' + Number(i).toLocaleString('en-GB') + (d || ''))}</div>`;
  }
const ftile = (l, v, sub, cls = '') => `<div class="tile"><small>${l}</small><b class="${cls}">${v}</b><span>${sub}</span></div>`;
const fhead = (t, lead) => `<header class="fhead"><h2>${t}</h2>${lead ? `<p>${lead}</p>` : ''}</header>`;
const fbig = (id, label, value, cls, note, lt = '') => `<div class="fbig" id="${id}"><small>${label}</small><b class="${cls || ''}">${value}</b>${lt}${note ? `<p>${note}</p>` : ''}</div>`;
const more = (label, html) => `<details class="fmore"><summary>${label}</summary>${html}</details>`;
const fcta = (...btns) => `<div class="fcta">${btns.join('')}</div>`;
function finToday() {
    const st = finSet(), today = ldate(), yest = addDays(today, -1), F = S.fin;
    const hasClose = F.entries.some((e) => e.kind === 'close');
    const closeT = F.entries.find((e) => e.id === 'close-' + today), closeY = F.entries.find((e) => e.id === 'close-' + yest);
    const inToday = pen((closeT ? closeSales(closeT) : 0) + sumBy(F.entries.filter((e) => e.kind === 'income' && e.date === today), (e) => +e.amount));
    const outToday = sumBy(F.entries.filter((e) => e.kind === 'expense' && e.date === today), (e) => +e.amount);
    const bal = balanceAt(today, st), hasOpen = st.openBal !== null && st.openBal !== '' && isDate(st.openDate);
    const m1 = today.slice(0, 8) + '01', dim = lastDay(+today.slice(0, 4), +today.slice(5, 7)), day = +today.slice(8);
    const mtd = sumBy(F.entries.filter((e) => e.date >= m1 && e.date <= today && e.kind !== 'expense'), flow), mtdOut = sumBy(F.entries.filter((e) => e.kind === 'expense' && e.date >= m1 && e.date <= today), (e) => +e.amount);
    const k = finCalc(), pace = st.budget ? pen(st.budget * day / dim) : 0, bePace = k.breakEven ? pen(k.breakEven * day) : 0;
    const over = F.bills.filter((x) => !x.paid && x.due < today), soon = F.bills.filter((x) => !x.paid && x.due >= today && x.due <= addDays(today, 7)), rec = recurringDue(today);
    const next = deadlines(st, today)[0];
    const todo = [];
    if (hasClose && !closeY) todo.push(`<li><button class="linkish" data-act="fstart" data-v="${yest}">Close ${dlabel(yest)}</button><span>Yesterday's till isn't recorded yet.</span></li>`);
    if (over.length) todo.push(`<li><button class="linkish" data-act="fsub" data-v="bills">Pay ${over.length} overdue bill${over.length > 1 ? 's' : ''}</button><span>${money(sumBy(over, (x) => +x.amount))} past its due date.</span></li>`);
    if (soon.length) todo.push(`<li><button class="linkish" data-act="fsub" data-v="bills">${soon.length} bill${soon.length > 1 ? 's' : ''} due this week</button><span>${money(sumBy(soon, (x) => +x.amount))} to set aside.</span></li>`);
    if (rec.length) todo.push(`<li><button class="linkish" data-act="fsub" data-v="out">Add ${rec.length} monthly cost${rec.length > 1 ? 's' : ''}</button><span>${rec.slice(0, 3).map((e) => esc(catOf(e))).join(', ')} not recorded this month.</span></li>`);
    if (!hasOpen) todo.push(`<li><button class="linkish" data-act="fsub" data-v="settings">Set your opening bank balance</button><span>So the cash position matches your bank.</span></li>`);
    if (next && daysTo(next.date, today) <= 30) todo.push(`<li><button class="linkish" data-act="fsub" data-v="dates">${esc(next.title)}</button><span>${whenTxt(daysTo(next.date, today))}, ${dlabel(next.date, { day: 'numeric', month: 'short' })}.</span></li>`);
    const track = [];
    if (st.budget) track.push(`<div class="rw"><div><b>Sales target</b><div class="hint">${money(mtd)} of ${money(st.budget)}. By today you'd want ${money(pace)}.</div></div>${mtd >= pace ? light('ok', 'On track') : mtd >= pace * 0.85 ? light('amber', 'A little behind') : light('bad', 'Behind')}</div>
      <div class="meter" role="img" aria-label="${Math.round(mtd / st.budget * 100)}% of the monthly target"><i style="width:${Math.min(100, mtd / st.budget * 100)}%"></i><em style="left:${Math.min(100, day / dim * 100)}%"></em></div>`);
    if (bePace) track.push(`<div class="rw"><div><b>Break-even</b><div class="hint">About ${money(k.breakEven)} a day covers fixed costs. So far this month ${money(mtd)} against ${money(bePace)}.</div></div>${mtd >= bePace ? light('ok', 'Covered') : light('bad', 'Not yet')}</div>`);
    return `${!hasClose ? `<div class="empty fstart"><b>Add yesterday's till takings to start</b>Copy the card and cash totals from the till's end-of-day report into Close the day. Then add rent, wages and supplier bills in Money out, and set your opening bank balance in Settings.</div>` : ''}
    ${fhead('Today', dlabel(today, { weekday: 'long', day: 'numeric', month: 'long' }))}
    ${fbig('fin-cash', 'Cash position', signed(bal), bal < 0 ? 'neg' : '', hasOpen ? `Bank and till, from ${money(st.openBal)} on ${dlabel(st.openDate)} plus everything since.` : 'Everything recorded so far. Add your opening bank balance in Settings to match the bank.', bal < 0 ? light('bad', 'Overdrawn') : k.fixed && bal < k.fixed ? light('amber', 'Under a month of fixed costs') : '')}
    <dl class="kv" id="fin-today"><div><dt>In today</dt><dd>${closeT || inToday ? money(inToday) : '–'}</dd></div><div><dt>Out today</dt><dd>${money(outToday)}</dd></div><div><dt>In this month</dt><dd>${money(mtd)}</dd></div><div><dt>Out this month</dt><dd>${money(mtdOut)}</dd></div></dl>
    ${fcta(`<button class="btn" data-act="fstart" data-v="${closeT || closeY || !hasClose ? today : yest}">${closeT ? 'Edit today\'s close' : 'Close the day'}</button>`)}
    ${todo.length ? `<section class="fsec"><h3 class="fh3">To do</h3><ul class="todo">${todo.join('')}</ul></section>` : ''}
    <section class="fsec" id="fin-track"><h3 class="fh3">Are we on track? · ${monthLabel(today.slice(0, 7))}</h3>
      ${track.length ? track.join('') : '<p class="hint">Set a monthly sales target in Settings, and add rent, wages and other fixed costs, to see whether the month is on track.</p>'}</section>`;
  }
function finCloseView() {
    const W = S.fin.wz, today = ldate(), st = finSet(), ex = W.date && S.fin.entries.find((e) => e.id === 'close-' + W.date);
    const online = isDate(W.date) ? onlineSales(W.date) : 0, [appT, appN] = isDate(W.date) ? appCollected(W.date) : [0, 0];
    const card = parseMoney(W.card) || 0, cash = parseMoney(W.cash) || 0, tc = parseMoney(W.tipsCard) || 0, tk = parseMoney(W.tipsCash) || 0;
    const paidOut = sumBy(S.fin.entries.filter((e) => e.kind === 'expense' && e.date === W.date && e.paidBy === 'cash'), (e) => +e.amount);
    const float = String(W.float).trim() === '' ? st.float : (parseMoney(W.float) || 0), expected = pen(float + cash + tk - paidOut), counted = String(W.counted).trim() === '' ? null : parseMoney(W.counted);
    const variance = counted === null || !Number.isFinite(counted) ? null : pen(counted - expected), vsign = (v) => (v > 0 ? '+' : v < 0 ? '−' : '') + money(Math.abs(v));
    const stepper = `<ol class="wz" aria-label="Steps">${['Takings', 'Cash count', 'Save'].map((s, i) => `<li class="${W.step === i + 1 ? 'on' : W.step > i + 1 ? 'done' : ''}" ${W.step === i + 1 ? 'aria-current="step"' : ''}><span>${i + 1}</span>${s}</li>`).join('')}</ol>`;
    const vtxt = variance === null ? 'Count the cash in the drawer to check it matches the till.' : Math.abs(variance) < 1 ? 'Spot on. The drawer matches the till.' : variance > 0
      ? `Over by ${money(variance)}. Often a sale rung up wrong or change not given. Add a note.` : `Short by ${money(-variance)}. Check paid-outs, refunds and change given before you save.`;
    const replace = ex ? `<p class="hint warn">${dlabel(ex.date)} already has a close of ${money(flow(ex))}. Saving replaces it.</p>` : '';
    let body = '';
    if (W.step === 1) body = `<div class="fform">
        <label class="f">Date<input type="date" id="fc-date" data-fin="wz:date" value="${esc(W.date)}" max="${today}"></label>
        <div class="grid2">
          <label class="f">Card takings (£) <span class="h">From the till's end-of-day report</span><input type="number" inputmode="decimal" min="0" step="0.01" id="fc-card" data-fin="wz:card" value="${esc(W.card)}" placeholder="0.00"></label>
          <label class="f">Cash takings (£) <span class="h">Cash sales on the same report</span><input type="number" inputmode="decimal" min="0" step="0.01" id="fc-cash" data-fin="wz:cash" value="${esc(W.cash)}" placeholder="0.00"></label>
        </div>
        <div class="rw"><div><b>Online beans orders</b><div class="hint">Paid online in the app and web shop. Added for you.</div></div><span class="num" id="fc-online">${money(online)}</span></div>
        ${more('Tips and app orders', `<div class="grid2">
          <label class="f">Tips on card (£) <span class="h">For staff, not sales</span><input type="number" inputmode="decimal" min="0" step="0.01" id="fc-tips-card" data-fin="wz:tipsCard" value="${esc(W.tipsCard)}" placeholder="0.00"></label>
          <label class="f">Tips in cash (£) <span class="h">For staff, not sales</span><input type="number" inputmode="decimal" min="0" step="0.01" id="fc-tips-cash" data-fin="wz:tipsCash" value="${esc(W.tipsCash)}" placeholder="0.00"></label>
        </div><p class="hint">${appN} app order${appN === 1 ? '' : 's'} collected (${money(appT)}). They're paid at the bar, so they're already in the card and cash totals.</p>`)}
        ${replace}
      </div>${fcta(`<button class="btn" data-act="fwz" data-v="2">Next: count the cash</button>`)}`;
    else if (W.step === 2) body = `<div class="fform">
        <div class="grid2">
          <label class="f">Cash counted (£) <span class="h">Everything in the drawer now</span><input type="number" inputmode="decimal" min="0" step="0.01" id="fc-count" data-fin="wz:counted" value="${esc(W.counted)}" placeholder="0.00"></label>
          <label class="f">Float (£) <span class="h">Change in the drawer at opening</span><input type="number" inputmode="decimal" min="0" step="0.01" id="fc-float" data-fin="wz:float" value="${esc(String(W.float).trim() === '' ? String(st.float) : W.float)}"></label>
        </div>
        ${fbig('fc-var', 'Difference', variance === null ? '–' : vsign(variance), variance !== null && Math.abs(variance) >= 1 ? 'neg' : '', vtxt)}
        ${more('How we work it out', `<table class="ftab" id="fc-expected"><tbody><tr><th scope="row">Float</th><td class="num">${money(float)}</td></tr><tr><th scope="row">+ Cash takings</th><td class="num">${money(cash)}</td></tr>${tk ? `<tr><th scope="row">+ Cash tips</th><td class="num">${money(tk)}</td></tr>` : ''}${paidOut ? `<tr><th scope="row">− Paid out of the till</th><td class="num">${money(paidOut)}</td></tr>` : ''}<tr class="tot"><th scope="row">Should be in the drawer</th><td class="num">${money(expected)}</td></tr></tbody></table>`)}
        <p class="hint">You can skip the count, but a daily count is the quickest way to spot mistakes.</p>
      </div>${fcta(`<button class="btn ghost" data-act="fwz" data-v="1">Back</button>`, `<button class="btn" data-act="fwz" data-v="3">Next: check and save</button>`)}`;
    else body = `<div class="fform" id="fc-review">
        ${fbig('fc-total', `Sales for ${dlabel(W.date)}`, money(pen(card + cash + online)), '', '')}
        <table class="ftab"><tbody>
          <tr><th scope="row">Card</th><td class="num">${money(card)}</td></tr><tr><th scope="row">Cash</th><td class="num">${money(cash)}</td></tr><tr><th scope="row">Online beans orders</th><td class="num">${money(online)}</td></tr>
          ${tc || tk ? `<tr><th scope="row">Tips for staff (not sales)</th><td class="num">${money(pen(tc + tk))}</td></tr>` : ''}
          <tr><th scope="row">Drawer difference</th><td class="num">${variance === null ? 'Not counted' : vsign(variance)}</td></tr>
        </tbody></table>
        <label class="f">Note <span class="h">Optional: weather, events, anything unusual</span><input type="text" id="fc-note" data-fin="wz:note" value="${esc(W.note)}" maxlength="140" placeholder="Rainy, quiet afternoon…"></label>
        ${replace}
      </div>${fcta(`<button class="btn ghost" data-act="fwz" data-v="2">Back</button>`, `<button class="btn" data-act="fclose" ${S.busy ? 'disabled' : ''}>${ex ? 'Replace close' : 'Save close'}</button>`)}`;
    return `${fhead('Close the day', 'Takings, cash count, save. About a minute.')}${stepper}${body}`;
  }
function finOutView() {
    const X = S.fin.exp, isExp = X.kind === 'expense', today = ldate(), st = finSet(), rec = recurringDue(today);
    const recent = S.fin.entries.filter((e) => e.kind !== 'close' && e.date >= addDays(today, -45)).sort((a, b) => b.date.localeCompare(a.date) || String(b.at).localeCompare(String(a.at))).slice(0, 12);
    const amt = parseMoney(X.amount), inside = Number.isFinite(amt) && amt > 0 && VAT_RATES[X.vatRate] ? vatIn(amt, X.vatRate) : 0;
    const chips = FIN_GROUPS.map(([, label, cats]) => `<div class="cgrp"><span class="cgl">${label}</span><div class="opts">${cats.map((c) => `<button data-act="fcat" data-v="${esc(c)}" aria-pressed="${X.cat === c}">${esc(c)}</button>`).join('')}</div></div>`).join('');
    return `${fhead('Money out', 'What was it, how much, how you paid.')}
    ${rec.length ? `<section class="fsec" id="fin-recur"><h3 class="fh3">Monthly costs to add</h3>${rec.map((e) => `<div class="rw"><div><b>${esc(catOf(e))}</b><div class="hint">${e.note ? esc(e.note) + ' · ' : ''}last ${money(e.amount)} on ${dlabel(e.date)}</div></div><button class="btn sm ghost" data-act="frecadd" data-id="${esc(e.id)}" ${S.busy ? 'disabled' : ''}>Add ${money(e.amount)}</button></div>`).join('')}</section>` : ''}
    <section class="fform" id="fin-exp-form">
      <div class="opts seg">${[['expense', 'Expense'], ['income', 'Other income']].map(([id, l]) => `<button data-act="fkind" data-v="${id}" aria-pressed="${X.kind === id}">${l}</button>`).join('')}</div>
      <div class="grid2">
        <label class="f">Amount (£) <span class="h">Including VAT, as on the receipt</span><input type="number" inputmode="decimal" min="0" step="0.01" id="fe-amt" data-fin="exp:amount" value="${esc(X.amount)}" placeholder="0.00"></label>
        <label class="f">Date<input type="date" id="fe-date" data-fin="exp:date" value="${esc(X.date)}"></label>
      </div>
      ${isExp ? `<fieldset><legend>What was it?</legend>${chips}<p class="hint">${esc(CAT_META[X.cat]?.[2] || '')}</p></fieldset>` : ''}
      <label class="f">${isExp ? 'Supplier or note' : 'What for'} <span class="h">Optional</span><input type="text" id="fe-note" data-fin="exp:note" value="${esc(X.note)}" maxlength="140" placeholder="${isExp ? 'Dairy delivery, week 44' : 'Catering, office breakfast'}"></label>
      <fieldset><legend>${isExp ? 'Paid by' : 'Received by'}</legend><div class="opts seg">${Object.entries(PAID_BY).map(([id, l]) => `<button data-act="fpaid" data-v="${id}" aria-pressed="${X.paidBy === id}">${l}</button>`).join('')}</div></fieldset>
      ${more(`VAT: ${VAT_RATES[X.vatRate]?.[0] || '20%'}${st.vat && inside ? ` · ${money(inside)} inside` : ''}${isExp ? ' · repeat · receipt' : ''}`, `
        <fieldset><legend>VAT on this ${isExp ? 'cost' : 'income'}</legend><div class="opts seg">${Object.entries(VAT_RATES).map(([id, [l]]) => `<button data-act="fvat" data-v="${id}" aria-pressed="${String(X.vatRate) === id}">${l}</button>`).join('')}</div><p class="hint">${esc(VAT_HELP[X.vatRate] || '')}. We pick the usual rate for the category.</p></fieldset>
        ${isExp ? `<label class="check"><input type="checkbox" id="fe-rec" data-fin="exp:recurring" ${X.recurring ? 'checked' : ''}><span><b>Repeats every month</b><br><span class="hint">Rent, rates, software. You'll get a one-tap reminder each month.</span></span></label>
        <label class="f">Receipt photo <span class="h">Optional. HMRC asks you to keep records for 6 years</span><input type="file" accept="image/*" capture="environment" id="fe-receipt"></label>
        ${X.receipt ? `<div class="rcpt"><img src="${esc(X.receipt)}" alt="Receipt preview"><button class="btn sm ghost" data-act="frcptx">Remove photo</button></div>` : X.receiptName ? `<p class="hint">Photo too large to keep; name saved: ${esc(X.receiptName)}</p>` : ''}` : ''}`)}
      ${fcta(`<button class="btn" data-act="fexp" ${S.busy ? 'disabled' : ''}>${isExp ? 'Add expense' : 'Add income'}</button>`)}
    </section>
    <section class="fsec"><h3 class="fh3">Recent</h3>
      ${recent.length ? `<div class="tablewrap"><table class="ftab" id="fin-recent"><tbody>${recent.map((e) => `<tr><td class="d">${dlabel(e.date, { day: 'numeric', month: 'short' })}</td><td><b>${e.kind === 'income' ? 'Other income' : esc(catOf(e))}</b>${e.note ? `<span class="hint"> · ${esc(e.note)}</span>` : ''}${e.recurring ? '<span class="hint"> · monthly</span>' : ''}${e.receipt ? ` <button class="linkish" data-act="frcpt" data-id="${esc(e.id)}" aria-expanded="${S.fin.rcpt === e.id}">Receipt</button>` : ''}</td><td class="num">${e.kind === 'expense' ? '−' : '+'}${money(e.amount)}</td><td class="act"><button class="btn sm ghost" data-act="fdel" data-id="${esc(e.id)}" ${S.busy ? 'disabled' : ''}>${S.fin.del === e.id ? 'Sure?' : 'Delete'}</button></td></tr>${S.fin.rcpt === e.id && e.receipt ? `<tr><td colspan="4"><img class="rcpt-full" src="${esc(e.receipt)}" alt="Receipt for ${esc(catOf(e))}, ${dlabel(e.date)}"></td></tr>` : ''}`).join('')}</tbody></table></div>` : `<div class="empty"><b>No costs yet</b>Add rent, wages and supplier deliveries here. Mark rent and subscriptions as monthly and they come back as one-tap reminders.</div>`}
    </section>`;
  }
function finBillsView() {
    const B = S.fin.bill, today = ldate(), list = S.fin.bills.slice().sort((a, b) => a.due.localeCompare(b.due));
    const open = list.filter((x) => !x.paid), paid = list.filter((x) => x.paid).sort((a, b) => String(b.paidOn).localeCompare(String(a.paidOn))).slice(0, 8), over = open.filter((x) => x.due < today);
    return `${fhead('Bills to pay', 'Supplier invoices you owe. Mark one paid and it moves to Money out.')}
    ${fbig('fin-bills-total', 'To pay', money(sumBy(open, (x) => +x.amount)), '', `${open.length} bill${open.length === 1 ? '' : 's'}${over.length ? ` · ${over.length} overdue (${money(sumBy(over, (x) => +x.amount))})` : ''}`, over.length ? light('bad', 'Overdue') : '')}
    <section class="fsec" id="fin-bills">${open.length ? `<div class="tablewrap"><table class="ftab"><tbody>${open.map((x) => { const n = daysTo(x.due, today); return `<tr class="${n < 0 ? 'over' : ''}"><td><b>${esc(x.supplier)}</b><span class="hint"> · ${esc(catOf(x))}${x.ref ? ' · ' + esc(x.ref) : ''}</span><div class="hint">Due ${dlabel(x.due, { day: 'numeric', month: 'short' })} · ${n < 0 ? `<span class="negc">${whenTxt(n)}</span>` : whenTxt(n)}</div></td><td class="num">${money(x.amount)}</td><td class="act"><button class="btn sm" data-act="fbpay" data-id="${esc(x.id)}" ${S.busy ? 'disabled' : ''}>Paid</button><button class="btn sm ghost" data-act="fbdel" data-id="${esc(x.id)}" ${S.busy ? 'disabled' : ''}>${S.fin.bdel === x.id ? 'Sure?' : 'Delete'}</button></td></tr>`; }).join('')}</tbody></table></div>` : '<div class="empty"><b>Nothing owed</b>Add supplier invoices with their due date. They show up here and on Today before they are due.</div>'}</section>
    ${more('Add a bill', `<div class="fform" id="fin-bill-form">
      <div class="grid2">
        <label class="f">Supplier<input type="text" id="fb-sup" data-fin="bill:supplier" value="${esc(B.supplier)}" maxlength="80" placeholder="Roastery, dairy, landlord"></label>
        <label class="f">Amount (£) <span class="h">Including VAT</span><input type="number" inputmode="decimal" min="0" step="0.01" id="fb-amt" data-fin="bill:amount" value="${esc(B.amount)}" placeholder="0.00"></label>
        <label class="f">Due date<input type="date" id="fb-due" data-fin="bill:due" value="${esc(B.due)}"></label>
        <label class="f">Invoice number <span class="h">Optional</span><input type="text" id="fb-ref" data-fin="bill:ref" value="${esc(B.ref)}" maxlength="40"></label>
      </div>
      <label class="f">Category<select id="fb-cat" data-fin="bill:cat">${FIN_GROUPS.map(([, l, cs]) => `<optgroup label="${l}">${cs.map((c) => `<option ${B.cat === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</optgroup>`).join('')}</select></label>
      ${fcta(`<button class="btn" data-act="fbill" ${S.busy ? 'disabled' : ''}>Add bill</button>`)}</div>`).replace('<details class="fmore">', `<details class="fmore" ${open.length ? '' : 'open'}>`)}
    ${paid.length ? more('Recently paid', `<table class="ftab"><tbody>${paid.map((x) => `<tr><td><b>${esc(x.supplier)}</b><div class="hint">Paid ${dlabel(x.paidOn)}</div></td><td class="num">${money(x.amount)}</td></tr>`).join('')}</tbody></table>`) : ''}`;
  }
function finFlowView() {
    const st = finSet(), C = cashFlow(st), all = [...C.weeks, ...C.fc], W = 640, H = 180, pad = 22, end = C.fc[C.fc.length - 1].end;
    const vals = all.map((w) => w.end), lo = Math.min(0, ...vals), hi = Math.max(1, ...vals), y = (v) => pad + (H - 2 * pad) * (1 - (v - lo) / (hi - lo || 1)), x = (i) => 8 + i * ((W - 16) / (all.length - 1));
    const pts = (ws, off) => ws.map((w, i) => `${x(i + off).toFixed(1)},${y(w.end).toFixed(1)}`).join(' '), n = C.weeks.length;
    const svg = `<svg class="fchart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Bank balance at the end of each week: 12 weeks recorded, then 8 weeks forecast ending at ${signed(end)}">
      <line x1="8" x2="${W - 8}" y1="${y(0).toFixed(1)}" y2="${y(0).toFixed(1)}" class="zero"/>
      <polyline points="${pts(C.weeks, 0)}" class="act"/><polyline points="${x(n - 1).toFixed(1)},${y(C.weeks[n - 1].end).toFixed(1)} ${pts(C.fc, n)}" class="fc"/>
      <line x1="${x(n - 1).toFixed(1)}" x2="${x(n - 1).toFixed(1)}" y1="${pad - 8}" y2="${H - pad + 8}" class="now"/>
      <text x="8" y="${H - 4}" class="lbl">${dlabel(C.weeks[0].a, { day: 'numeric', month: 'short' })}</text><text x="${x(n - 1).toFixed(1)}" y="${H - 4}" class="lbl" text-anchor="middle">Now</text><text x="${W - 8}" y="${H - 4}" class="lbl" text-anchor="end">${dlabel(C.fc[C.fc.length - 1].b, { day: 'numeric', month: 'short' })}</text>
    </svg>`;
    const none = !C.weeks.some((w) => w.data);
    const note = none ? 'Close a few days and add your costs to see a forecast.'
      : C.firstNeg ? `At this pace the bank goes below £0 in the week of ${dlabel(C.firstNeg.a, { day: 'numeric', month: 'long' })}. Chase money owed, hold off big purchases, or talk to your bank early.`
      : `At this pace you'll have about ${money(end)} in 8 weeks. Lowest point: ${money(C.low.end)}, week of ${dlabel(C.low.a, { day: 'numeric', month: 'short' })}.`;
    return `${fhead('Cash flow', 'Where the bank is heading if things carry on like this.')}
    ${fbig('fin-forecast', 'Bank in 8 weeks', signed(end), end < 0 ? 'neg' : '', note, C.firstNeg ? light('bad', 'Runs short') : '')}
    <div class="fchartwrap">${svg}<p class="hint">Solid: recorded. Dashed: forecast from an average week of ${money(C.avgIn)} in, ${money(C.recWeekly)} monthly costs, ${money(C.varOut)} other spending, plus bills due.</p></div>
    ${more('Week by week', `<div class="tablewrap"><table class="ftab" id="fin-flow"><thead><tr><th scope="col">Week of</th><th scope="col" class="num">In</th><th scope="col" class="num">Out</th><th scope="col" class="num">Bank at end</th></tr></thead><tbody>
      ${[...C.weeks.slice(-6), ...C.fc].map((w) => `<tr class="${w.actual ? '' : 'fcrow'}"><td>${dlabel(w.a, { day: 'numeric', month: 'short' })}${w.actual ? '' : ' <span class="hint">forecast</span>'}</td><td class="num">${money(w.in)}</td><td class="num">${money(w.out)}</td><td class="num">${signed(w.end)}</td></tr>`).join('')}
    </tbody></table></div>`)}`;
  }
function finPLView() {
    const st = finSet(), today = ldate(), months = [];
    for (let i = 5; i >= 0; i--) months.push(addMonths(today.slice(0, 8) + '01', -i).slice(0, 7));
    const rows = months.map((m) => monthPL(m, st)), cur = rows[rows.length - 1], pm = S.fin.pm && months.includes(S.fin.pm) ? S.fin.pm : months[months.length - 2];
    const be = cur.overheads && cur.margin > 0 ? pen(cur.overheads / (cur.margin / 100)) : 0, budgetEx = st.budget ? pen(st.vat ? st.budget - st.budget * st.stdShare / 600 : st.budget) : 0;
    const old = (i) => i < rows.length - 3 ? ' old' : ''; // phones show the last 3 months
    const line = (label, key, cls = '') => `<tr class="${cls}"><th scope="row">${label}</th>${rows.map((r, i) => `<td class="num${old(i)}">${key === 'margin' ? (r.margin === null ? '–' : r.margin + '%') : signed(r[key])}</td>`).join('')}</tr>`;
    return `${fhead('Profit and loss', st.vat ? 'Monthly, without VAT: VAT belongs to HMRC.' : 'Monthly. Not VAT registered, so costs include VAT.')}
    ${fbig('fin-pl-now', `Profit, ${monthLabel(cur.ym)} so far`, signed(cur.net), cur.net < 0 ? 'neg' : '', `${money(cur.sales)} sales · ${cur.margin === null ? '–' : cur.margin + '%'} gross margin${be ? ` · break-even ${money(be)} a month` : ''}`)}
    <div class="tablewrap fsec"><table class="ftab" id="fin-pl"><thead><tr><th scope="col"><span class="sr">Line</span></th>${months.map((m, i) => `<th scope="col" class="num${old(i)}">${monthLabel(m, false)}</th>`).join('')}</tr></thead><tbody>
      ${line('Sales', 'sales', 'b')}${line('Cost of sales', 'cos')}${line('Gross profit', 'gp', 'b')}${line('Gross margin', 'margin', 'sub')}
      ${line('Staff', 'staff')}${line('Premises', 'premises')}${line('Running costs', 'running')}${line('Net profit', 'net', 'b tot')}
    </tbody></table></div>
    ${more('What the lines mean', `<p class="hint">Cost of sales: coffee, milk, food and cups. Gross margin: what's left of each £1 of sales after those; specialty coffee shops often aim for 65–75%. Premises: rent, rates, utilities. Running costs: equipment, marketing, fees, software, insurance.</p>`)}
    ${st.budget || st.obudget ? more('Budget vs actual', `<table class="ftab" id="fin-budget"><tbody>${st.budget ? `<tr><th scope="row">Sales <span class="hint">target ${money(budgetEx)} without VAT</span></th><td class="num">${money(cur.sales)}</td><td class="num">${budgetEx ? Math.round(cur.sales / budgetEx * 100) : 0}%</td></tr>` : ''}${st.obudget ? `<tr><th scope="row">Overheads <span class="hint">budget ${money(st.obudget)}</span></th><td class="num">${money(cur.overheads)}</td><td class="num ${cur.overheads > st.obudget ? 'negc' : ''}">${Math.round(cur.overheads / st.obudget * 100)}%</td></tr>` : ''}</tbody></table>`) : ''}
    <section class="fsec"><h3 class="fh3">Monthly report</h3><p class="hint">One page to print or save as PDF for your accountant or bank.</p>
      <label class="f">Month<select id="fp-month" data-fin="root:pm">${months.map((m) => `<option value="${m}" ${m === pm ? 'selected' : ''}>${monthLabel(m)}</option>`).join('')}</select></label>
      ${fcta(`<button class="btn" data-act="fprint" data-v="${pm}">Print monthly report</button>`)}</section>`;
  }
function finVatView() {
    const st = finSet(), today = ldate();
    if (!st.vat) {
      const a = addDays(today, -364), t = sumBy(S.fin.entries.filter((e) => e.date >= a && e.date <= today && e.kind !== 'expense' && !(e.kind === 'income' && rateOf(e) === 'none')), flow), pct = Math.min(100, t / UK.vatThreshold * 100);
      return `${fhead('VAT', 'Not VAT registered. Keep an eye on the threshold.')}
      ${fbig('fin-vat-thr', 'Taxable sales, last 12 months', money(t), '', `${Math.round(pct)}% of the ${money(UK.vatThreshold)} threshold. You must register within 30 days of the end of any month where the last 12 months go over it, or straight away if you expect to go over it in the next 30 days alone.`, pct >= 100 ? light('bad', 'Over') : pct >= 80 ? light('amber', 'Getting close') : '')}
      <div class="meter" role="img" aria-label="${Math.round(pct)}% of the VAT threshold"><i style="width:${pct}%"></i></div>
      <p class="hint">Turn on "VAT registered" in Settings once you have a VAT number.</p>`;
    }
    const qs = vatQuarters(st, today), i = Math.max(0, Math.min(S.fin.vq, qs.length - 1)), [a, b] = qs[i] || [today, today], B = vatBoxes(a, b, st), open = b >= today, dueOn = addDays(addMonths(b, 1), 7);
    const box = (n, label, v, whole) => `<tr><th scope="row"><span class="boxn">${n}</span>${label}</th><td class="num" id="vb${n}">${whole ? '£' + v.toLocaleString('en-GB') : money(v)}</td></tr>`;
    return `${fhead('VAT return', `Quarter by quarter, laid out like HMRC's 9 boxes.${st.vatNo ? ' VAT number ' + esc(st.vatNo) + '.' : ''}`)}
    <label class="f">Quarter<select id="fv-q" data-fin="root:vq">${qs.map(([s, e], j) => `<option value="${j}" ${j === i ? 'selected' : ''}>${dlabel(s, { day: 'numeric', month: 'short', year: 'numeric' })} – ${dlabel(e, { day: 'numeric', month: 'short', year: 'numeric' })}${e >= today ? ' (in progress)' : ''}</option>`).join('')}</select></label>
    ${fbig('fin-vat-due', B.box5 >= 0 ? 'VAT to pay' : 'VAT to reclaim', money(Math.abs(B.box5)), '', `${open ? 'Quarter still running. ' : ''}Return and payment due ${dlabel(dueOn, { day: 'numeric', month: 'long', year: 'numeric' })}. Set it aside as it comes in.`)}
    <div class="tablewrap fsec"><table class="ftab" id="fin-vat-boxes"><tbody>
      ${box(1, 'VAT due on sales', B.box1)}${box(3, 'Total VAT due', B.box3)}${box(4, 'VAT reclaimed on purchases', B.box4)}${box(5, B.box5 >= 0 ? 'Net VAT to pay' : 'Net VAT to reclaim', Math.abs(B.box5))}
      ${box(6, 'Total sales without VAT', B.box6, true)}${box(7, 'Total purchases without VAT', B.box7, true)}
    </tbody></table></div>
    ${more('Boxes 2, 8 and 9', `<table class="ftab"><tbody>${box(2, 'VAT on goods from the EU', B.box2)}${box(8, 'Goods supplied to the EU', B.box8, true)}${box(9, 'Goods bought from the EU', B.box9, true)}</tbody></table><p class="hint">Only for goods moving between Northern Ireland and the EU, so £0 for Bija.</p>`)}
    ${more('How this is worked out', `<p class="hint">Box 1: ${st.stdShare}% of till and online sales at 20% (1/6 of the total), plus VAT on other income. Box 4: VAT inside the costs you recorded at 20% or 5%. Box 7 leaves out wages, rates and anything with no VAT. Boxes 6 and 7 are whole pounds.</p><p class="hint">An estimate to plan with, not a filed return. Cold takeaway food and some drinks can be zero-rated; set the standard-rated share in Settings. Returns are filed through Making Tax Digital software, usually by your accountant.</p>`)}`;
  }
function finStaffView() {
    const st = finSet(), D = S.fin.staff || (S.fin.staff = st.staff.map((p) => ({ name: p.name || '', rate: String(p.rate ?? ''), hours: String(p.hours ?? '') })));
    const ppl = D.map((p) => ({ name: p.name, rate: parseMoney(p.rate) || 0, hours: Number(p.hours) || 0 })).filter((p) => p.name.trim() || p.rate || p.hours);
    const wk = (p) => pen(p.rate * p.hours), gross = sumBy(ppl, wk), ni = sumBy(ppl, (p) => Math.max(0, wk(p) - UK.niWeekly) * UK.niRate);
    const pens = sumBy(ppl, (p) => wk(p) > UK.aeTrigger ? (Math.min(wk(p), UK.qeHigh) - UK.qeLow) * UK.pension : 0), total = pen(gross + ni + pens);
    const low = ppl.filter((p) => p.rate && p.rate < UK.nlw);
    return `${fhead('Staff costs', 'An estimate of what the team costs. Your payroll provider has exact figures.')}
    ${fbig('fin-staff-total', 'Team cost a week', money(total), '', `${money(gross)} wages · ${money(ni)} employer NI · ${money(pens)} pension · about ${money(total * 52 / 12)} a month`)}
    ${low.length ? `<p class="hint warn">${low.map((p) => esc(p.name || 'Someone')).join(', ')} ${low.length === 1 ? 'is' : 'are'} below the National Living Wage of £${UK.nlw.toFixed(2)} an hour (21 and over, from April 2026). Check ages and gov.uk rates.</p>` : ''}
    <section class="fsec" id="fin-staff"><h3 class="fh3">Team</h3>
      ${D.map((p, i) => `<div class="staffrow"><label class="f">Name<input type="text" id="fst-${i}-name" data-staff="${i}:name" value="${esc(p.name)}" maxlength="30"></label><label class="f">£ an hour<input type="number" inputmode="decimal" min="0" step="0.01" id="fst-${i}-rate" data-staff="${i}:rate" value="${esc(p.rate)}"></label><label class="f">Hours a week<input type="number" inputmode="decimal" min="0" step="0.5" id="fst-${i}-hours" data-staff="${i}:hours" value="${esc(p.hours)}"></label><button class="btn sm ghost" data-act="fstaffdel" data-v="${i}" aria-label="Remove ${esc(p.name || 'person ' + (i + 1))}">Remove</button></div>`).join('') || '<p class="hint">Add the people you pay, first names only, to estimate weekly costs.</p>'}
      <button class="linkish" data-act="fstaffadd">+ Add a person</button>
      ${fcta(`<button class="btn" data-act="fstaffsave" ${S.busy ? 'disabled' : ''}>Save team</button>`)}</section>
    ${more('UK rules to remember', `<ul class="rules">
      <li><b>Employer NI</b> 15% on pay above £${UK.niWeekly} a week each. Most small employers can claim Employment Allowance, up to ${money(UK.empAllowance)} a year off.</li>
      <li><b>Pension</b> Enrol staff aged 22 to State Pension age earning over £192 a week; employer pays at least 3% of earnings between £120 and £967 a week. Re-enrol every 3 years.</li>
      <li><b>Holiday</b> 5.6 weeks a year. For irregular hours it builds up at 12.07% of hours worked: about ${money(gross * 0.1207)} a week across this team.</li>
      <li><b>Payroll</b> Use HMRC-recognised software, send a Full Payment Submission on or before each payday, and pay PAYE by the 22nd.</li>
      <li><b>Tips</b> All tips go to staff in full, under a written policy (since October 2024). Held now: ${money(finCalc().tips)}.</li></ul>`)}`;
  }
function finDatesView() {
    const st = finSet(), today = ldate(), dl = deadlines(st, today);
    const missing = [!isDate(st.yearEnd) && 'your company year end', !isDate(st.csDate) && 'your confirmation statement date'].filter(Boolean);
    return `${fhead('Deadlines', 'Tax and company dates for the next 15 months, from your settings.')}
    ${missing.length ? `<div class="panel stack"><p class="hint warn" style="margin:0">Add ${missing.join(' and ')} to see every date. Both are on Bija Coffee Limited's Companies House page.</p>
      <div class="row"><button class="btn sm" data-act="fsub" data-v="settings" data-focus="${!isDate(st.yearEnd) ? 'fs-ye' : 'fs-cs'}">Add the dates in Settings</button><button class="btn sm ghost" data-act="fsub" data-v="settings" data-focus="fs-stagger">VAT quarters</button>
      <a class="btn sm ghost" href="https://find-and-update.company-information.service.gov.uk/" target="_blank" rel="noopener">Companies House: find your company ↗</a></div></div>` : ''}
    ${dl.length ? `<div class="tablewrap"><table class="ftab" id="fin-dates"><tbody>${dl.map((d) => { const n = daysTo(d.date, today); return `<tr><td class="d">${dlabel(d.date, { day: 'numeric', month: 'short', year: 'numeric' })}</td><td><b>${esc(d.title)}</b><div class="hint">${esc(d.tag)}</div></td><td class="num">${n <= 7 ? `<span class="negc">${whenTxt(n)}</span>` : whenTxt(n)}</td></tr>`; }).join('')}</tbody></table></div>
    ${more('What each date is', `<ul class="rules">${[...new Map(dl.map((d) => [d.title, d.help.replace(/^For the (quarter|year) ending [^.]+\. /, '')])).entries()].map(([t, h]) => `<li><b>${esc(t)}</b> ${esc(h)}</li>`).join('')}</ul>`)}` : '<div class="empty"><b>No dates yet</b>Turn on VAT or add your year end in Settings and the dates appear here.</div>'}
    <p class="hint">General guidance for a UK private limited company; your accountant and letters from HMRC and Companies House have the dates that apply to you. Late filing brings automatic penalties.</p>`;
  }
function finReports() {
    const F = S.fin, k = finCalc(), st = k.st, pl = Object.fromEntries(PERIODS)[F.period], long = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    const tile = ftile, pl1 = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
    const ledger = k.inP.slice().sort((a, b) => b.date.localeCompare(a.date) || String(b.at).localeCompare(String(a.at)));
    const detail = (e) => e.kind === 'close' ? `Card ${money(e.card)} · Cash ${money(e.cash)}${+e.online ? ` · Online ${money(e.online)}` : ''}${e.note ? ' · ' + esc(e.note) : ''}`
      : `${e.kind === 'expense' ? `<b>${esc(catOf(e))}</b>${e.note ? ' · ' : ''}` : ''}${esc(e.note || '')}${PAID_BY[e.paidBy] ? ` <span class="hint">· ${PAID_BY[e.paidBy]}</span>` : ''}`;
    return `${fhead('Reports and export', 'Totals for any period, the full ledger, and files for your accountant.')}
    <div class="cats">${PERIODS.map(([id, l]) => `<button data-act="fper" data-v="${id}" aria-pressed="${F.period === id}">${l}</button>`).join('')}</div>
    <p class="hint">${dlabel(k.from, long)} – ${dlabel(k.to, long)}</p>
    <div class="tiles fin" id="fin-tiles">
      ${tile('Takings', money(k.takings), `${pl1(k.closes.length, 'day')} closed${k.other ? ` · +${money(k.other)} other income` : ''}`)}
      ${tile('Expenses', money(k.expenses), pl1(k.exps.length, 'bill'))}
      ${tile('Net cash flow', signed(k.net), 'takings + other income − expenses', k.net < 0 ? 'neg' : '')}
      ${tile('Cash balance now', signed(k.balance), k.hasOpen ? `from ${money(st.openBal)} on ${dlabel(st.openDate)}` : 'set your opening balance in Settings', k.balance < 0 ? 'neg' : '')}
    </div>
    <div class="tiles fin" id="fin-kpis">
      ${tile('Average day', k.trading ? money(k.avg) : '–', `takings per trading day (${k.trading})`)}
      ${tile(st.vat ? 'Break-even day incl. VAT' : 'Break-even day', k.breakEven ? money(k.breakEven) : '–', k.breakEven ? `${money(k.fixed)} fixed costs in 30 days, ${st.margin}% margin${k.trading ? (k.avg >= k.breakEven ? ' · you are above it' : ' · you are below it') : ''}` : 'add rent, wages, utilities or software bills')}
      ${tile('App share', k.takings ? Math.round((k.app / k.takings) * 100) + '%' : '–', `${money(k.app)} of collected app orders`)}
      ${st.vat ? tile('VAT estimate', money(k.vat), 'output VAT in takings') : ''}
    </div>
    <div class="cols fsec">
      <div><h3 class="fh3">Expenses by category</h3><div class="fbars" id="fin-cats">${k.byCat.length ? bars(k.byCat, money) : '<p class="hint">No expenses in this period.</p>'}</div></div>
      <div><h3 class="fh3">Daily takings</h3><div class="fbars" id="fin-days">${k.daily.length ? bars(k.daily, (v) => v ? money(v) : '–') : '<p class="hint">No closes in this period.</p>'}</div></div>
    </div>
    <div class="cols fsec">
      <div class="stack" id="fin-liab"><h3 class="fh3">Liabilities · ${money(k.gifts + k.ptsVal + k.stampVal + k.tips + st.deposits)} owed</h3>
        <div class="rw"><div><b>Gift cards outstanding</b><div class="hint">Money already received for coffee not yet served, so keep it in the bank. ${money(k.wallets)} on members' balances, ${money(k.unredeemed)} sold and not yet added.</div></div><span class="num">${money(k.gifts)}</span></div>
        <div class="rw"><div><b>Points outstanding</b><div class="hint">Rewards already promised to members: ${k.pts.toLocaleString('en-GB')} points at £${st.ppv} each, paid out as free cakes and bags of beans.</div></div><span class="num">${money(k.ptsVal)}</span></div>
        <div class="rw" id="fin-stamps"><div><b>Stamp cards outstanding</b><div class="hint">Estimate: ${k.stamps.toLocaleString('en-GB')} stamps ÷ 9 × ${money(st.stampCost)} average drink cost. Every 10th drink is free.</div></div><span class="num">${money(k.stampVal)}</span></div>
        <div class="rw"><div><b>Tips held for staff</b><div class="hint">From Close the day${st.tipsPaid ? ` since ${dlabel(st.tipsPaid)}` : ''}. Staff money, not Bija's.${k.tips ? ` <button class="linkish" data-act="ftipspaid" ${S.busy ? 'disabled' : ''}>Paid out today</button>` : ''}</div></div><span class="num">${money(k.tips)}</span></div>
        <div class="rw"><div><b>Customer deposits</b><div class="hint">Catering and event deposits, set in Settings.</div></div><span class="num">${money(st.deposits)}</span></div>
      </div>
      <div class="stack" id="fin-vat"><h3 class="fh3">VAT estimate · ${pl}</h3>
        ${st.vat ? `<div class="rw"><div><b>Output VAT in takings</b><div class="hint">${money(k.takings)} × 1/6: UK standard rate 20%, prices include VAT</div></div><span class="num">${money(k.vat)}</span></div>
        <p class="hint">Estimate only. The VAT section has the full quarter, including VAT you can reclaim on costs.</p>` : '<p class="hint">Not VAT registered. Change this in Settings.</p>'}
        <h3 class="fh3" style="margin-top:16px">Discounts given · ${pl}</h3>
        <div class="rw" id="fin-disc-stamp"><div><b>Free drinks from stamp cards</b><div class="hint">${k.freeN} drink${k.freeN === 1 ? '' : 's'}. A discount at the till, so takings are already lower; cost of sales is unchanged.</div></div><span class="num">${money(k.freeVal)}</span></div>
        <div class="rw" id="fin-disc-pts"><div><b>Points rewards</b><div class="hint">${k.ptsN} cake${k.ptsN === 1 ? '' : 's'} or bags redeemed with points.</div></div><span class="num">${money(k.ptsOff)}</span></div>
      </div>
    </div>
    <section class="fsec"><h3 class="fh3">Export</h3><p class="hint">Accountant CSV: Date, Description, Reference, Amount, Account, Tax rate. Imports into Xero or QuickBooks as a bank statement or journal.</p>
      ${fcta(`<button class="btn" data-act="facsv" ${ledger.length ? '' : 'disabled'}>Accountant CSV</button>`, `<button class="btn ghost" data-act="fcsv" ${ledger.length ? '' : 'disabled'}>Cash flow CSV</button>`)}</section>
    <section class="fsec"><h3 class="fh3">Ledger</h3>
      ${!ledger.length ? `<div class="empty"><b>Nothing in ${esc(pl.toLowerCase())}</b>Daily closes, expenses and other income you add show up here.</div>` : `<div class="tablewrap"><table class="ftab" id="fin-ledger"><thead><tr><th scope="col">Date</th><th scope="col">Type</th><th scope="col">Details</th><th scope="col" class="num">In</th><th scope="col" class="num">Out</th><th scope="col"><span class="sr">Actions</span></th></tr></thead><tbody>${ledger.map((e) => { const v = flow(e); return `<tr><td class="d">${dlabel(e.date)}</td><td>${KIND[e.kind] || ''}</td><td>${detail(e)}</td><td class="num">${v > 0 ? money(v) : ''}</td><td class="num">${v < 0 ? money(-v) : ''}</td><td class="act"><button class="btn sm ghost" data-act="fdel" data-id="${esc(e.id)}" ${S.busy ? 'disabled' : ''}>${F.del === e.id ? 'Sure? Delete' : 'Delete'}</button></td></tr>`; }).join('')}</tbody></table></div>`}
    </section>`;
  }
function finSettingsView() {
    const F = S.fin, today = ldate();
    if (!F.set) { const s = finSet(); F.set = { openBal: s.openBal == null ? '' : String(s.openBal), openDate: s.openDate || '', margin: String(s.margin), ppv: String(s.ppv), stampCost: String(s.stampCost), vat: !!s.vat, vatNo: s.vatNo || '', stagger: String(s.stagger), stdShare: String(s.stdShare), yearEnd: s.yearEnd || '', csDate: s.csDate || '', budget: s.budget ? String(s.budget) : '', obudget: s.obudget ? String(s.obudget) : '', float: String(s.float), paye: !!s.paye, deposits: s.deposits ? String(s.deposits) : '' }; }
    const T = F.set;
    return `${fhead('Settings', 'Set these once. Everything else is worked out from them.')}
    <section class="fform" id="fin-settings">
      <h3 class="fh3">Bank</h3>
      <div class="grid2">
        <label class="f">Opening bank balance (£) <span class="h">Bank plus till cash at the start of that day. Negative if overdrawn.</span><input type="number" step="0.01" id="fs-bal" data-fin="set:openBal" value="${esc(T.openBal)}"></label>
        <label class="f">Balance date <span class="h">Entries from this date on count towards the balance.</span><input type="date" id="fs-date" data-fin="set:openDate" value="${esc(T.openDate)}" max="${today}"></label>
        <label class="f">Till float (£) <span class="h">Change left in the drawer each morning</span><input type="number" min="0" step="0.01" id="fs-float" data-fin="set:float" value="${esc(T.float)}"></label>
        <label class="f">Customer deposits held (£) <span class="h">Catering or event deposits not yet earned</span><input type="number" min="0" step="0.01" id="fs-dep" data-fin="set:deposits" value="${esc(T.deposits)}"></label>
      </div>
      <h3 class="fh3">Targets</h3>
      <div class="grid2">
        <label class="f">Monthly sales target (£) <span class="h">Including VAT, like the till</span><input type="number" min="0" step="1" id="fs-budget" data-fin="set:budget" value="${esc(T.budget)}"></label>
        <label class="f">Monthly overheads budget (£) <span class="h">Staff, premises and running costs</span><input type="number" min="0" step="1" id="fs-obudget" data-fin="set:obudget" value="${esc(T.obudget)}"></label>
        <label class="f">Gross margin % <span class="h">What's left of £1 of sales after beans, milk, food and cups.</span><input type="number" min="1" max="100" step="1" id="fs-margin" data-fin="set:margin" value="${esc(T.margin)}"></label>
        <label class="f">Value per point (£) <span class="h">For the points liability. 350 points is about a £3.50 cake.</span><input type="number" min="0" max="1" step="0.001" id="fs-ppv" data-fin="set:ppv" value="${esc(T.ppv)}"></label>
        <label class="f">Average drink cost price (£) <span class="h">Beans, milk and cup for one drink. Values stamp cards (estimate)</span><input type="number" min="0" max="20" step="0.01" id="fs-stampcost" data-fin="set:stampCost" value="${esc(T.stampCost)}"></label>
      </div>
      <h3 class="fh3">VAT</h3>
      <label class="check"><input type="checkbox" id="fs-vat" data-fin="set:vat" ${T.vat ? 'checked' : ''}><span><b>VAT registered</b><br><span class="hint">Shows the VAT return and its deadlines. Off: tracks the ${money(UK.vatThreshold)} threshold.</span></span></label>
      <div class="grid2">
        <label class="f">VAT number <span class="h">Optional, shown on reports</span><input type="text" id="fs-vatno" data-fin="set:vatNo" value="${esc(T.vatNo)}" maxlength="14" placeholder="GB123456789"></label>
        <label class="f">VAT quarters end in <span class="h">On your VAT registration certificate</span><select id="fs-stagger" data-fin="set:stagger">${[['1', 'Mar, Jun, Sep, Dec'], ['2', 'Apr, Jul, Oct, Jan'], ['3', 'May, Aug, Nov, Feb']].map(([v, l]) => `<option value="${v}" ${T.stagger === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <label class="f">Standard-rated share of sales % <span class="h">Hot drinks and eat-in are 20%; cold takeaway food and beans can be 0%.</span><input type="number" min="0" max="100" step="1" id="fs-std" data-fin="set:stdShare" value="${esc(T.stdShare)}"></label>
      </div>
      <h3 class="fh3">Company</h3>
      <div class="grid2">
        <label class="f">Financial year end <span class="h">Any year; the day and month are used</span><input type="date" id="fs-ye" data-fin="set:yearEnd" value="${esc(T.yearEnd)}"></label>
        <label class="f">Confirmation statement date <span class="h">Your review date, usually the incorporation anniversary</span><input type="date" id="fs-cs" data-fin="set:csDate" value="${esc(T.csDate)}"></label>
      </div>
      <label class="check"><input type="checkbox" id="fs-paye" data-fin="set:paye" ${T.paye ? 'checked' : ''}><span><b>We run payroll (PAYE)</b><br><span class="hint">Adds the monthly PAYE payment date to Deadlines.</span></span></label>
      ${fcta(`<button class="btn" data-act="fsave" ${S.busy ? 'disabled' : ''}>Save settings</button>`)}
    </section>`;
  }
function menuEditor() {
    const d = S.draft || (S.draft = JSON.parse(JSON.stringify(S.config || STARTER)));
    return `${!S.config ? `<div class="panel" style="margin-bottom:12px"><b>No menu is live yet.</b> <span class="hint">This is the starter menu. Edit it and publish to open the app.</span></div>` : ''}
    <div class="panel stack">
      <div class="grid2">
        <label class="f">On filter today<select id="m-filter" data-d="filter">${ORIGINS.map((o) => `<option value="${o.id}" ${d.filter === o.id ? 'selected' : ''}>${esc(o.name)}, ${esc(o.where)}</option>`).join('')}</select></label>
        <label class="f">Opening line <span class="h">Shown on the order screen</span><input type="text" id="m-note" data-d="note" value="${esc(d.note || '')}" maxlength="120"></label>
      </div>
      <label class="check"><input type="checkbox" id="m-open" data-d="open" ${d.open ? 'checked' : ''}><span><b>Take app orders</b><br><span class="hint">Untick to pause ordering, for example when the bar is slammed.</span></span></label>
      <div>${(d.menu || []).map((m, i) => `<div class="edit-item">
        <label class="f"><span class="sr">Name</span><input type="text" id="mi-n-${i}" data-m="${i}" data-k="name" value="${esc(m.name)}"></label>
        <label class="f"><span class="sr">Price</span><input type="number" step="0.1" min="0" id="mi-p-${i}" data-m="${i}" data-k="price" value="${esc(m.price)}"></label>
        <label class="check" style="padding:6px 10px"><input type="checkbox" id="mi-a-${i}" data-m="${i}" data-k="available" ${m.available ? 'checked' : ''}><span>${esc(m.cat)} · on</span></label>
      </div>`).join('')}</div>
      <div class="row between"><button class="btn sm ghost" data-act="reset-draft">Discard changes</button><button class="btn" data-act="save-cfg" ${S.busy ? 'disabled' : ''}>${S.busy ? 'Saving…' : S.config ? 'Save menu' : 'Publish menu'}</button></div>
    </div>
    <section class="sec panel stack" aria-labelledby="pin-h"><h3 id="pin-h" style="margin:0">Change staff PIN</h3>
      <p class="hint" style="margin:0">6 to 8 digits. On the website, type opensesame; in the app, hold the Order button for 3 seconds. Then enter the admin email and this PIN.</p>
      <div class="grid2"><label class="f">Current PIN<input type="password" inputmode="numeric" autocomplete="off" maxlength="8" id="pc-old" data-pc="old" value="${esc(S.pc.old)}"></label>
        <label class="f">New PIN<input type="password" inputmode="numeric" autocomplete="off" maxlength="8" id="pc-new" data-pc="new" value="${esc(S.pc.new)}"></label>
        <label class="f">Confirm new PIN<input type="password" inputmode="numeric" autocomplete="off" maxlength="8" id="pc-again" data-pc="again" value="${esc(S.pc.again)}"></label></div>
      <div class="row"><button class="btn sm" data-act="pin-change" ${S.busy ? 'disabled' : ''}>Change PIN</button></div>
    </section>
    <section class="sec panel stack"><h3 style="margin:0">QR labels for bags and cups</h3><p class="hint" style="margin:0">Each code opens that coffee's Bean passport: origin, roast date and lot.</p><div class="row"><a class="btn sm ghost" href="labels.html" target="_blank" rel="noopener">Print QR labels</a></div></section>`;
  }
// ---------- Maheera: Kenduri's shared back office, read-only (supabase/functions/maheera) ----------
// One fetch when the tab opens (and on Refresh); the rest of the back office never waits for it.
const MH_SUBS = [['today', 'Today'], ['stock', 'Stock'], ['costs', 'Drink & dish costs'], ['week', 'Last 7 days']];
function mhLoad() {
    const M = S.mh || (S.mh = { sub: 'today' });
    if (M.loading || !S.sb?.maheera) return;
    M.loading = true; M.err = null;
    S.sb.maheera().then((r) => {
      M.loading = false; M.at = Date.now();
      if (r && r.ok) { M.data = r.data; M.err = null; } else M.err = (r && r.reason) || 'down';
      if (S.view === 'bar' && S.btab === 'maheera') render();
    });
  }
const mhN = (v) => (v === null || v === undefined || v === '' || !Number.isFinite(+v) ? null : +v);
const mhMoney = (v) => (mhN(v) === null ? '–' : money(+v));
const mhRows = (v) => (Array.isArray(v) ? v.filter((x) => x && typeof x === 'object') : []);
const mhCount = (v) => (Array.isArray(v) ? v.length : Math.max(0, num(v, 0, 1e6)));
const mhName = (x) => clip(typeof x === 'string' ? x : x?.name || x?.item || x?.supplier || x?.ingredient || '', 60);
// grams and millilitres read better as kg and litres once they pass 1,000
function mhQty(v, unit) {
    const n = mhN(v); if (n === null) return '–';
    const big = Math.abs(n) >= 1000 && (unit === 'g' || unit === 'ml');
    const x = big ? n / 1000 : n, u = big ? (unit === 'g' ? 'kg' : 'L') : unit === 'each' ? '' : unit;
    return `${x.toLocaleString('en-GB', { maximumFractionDigits: big ? 2 : unit === 'each' ? 1 : 0 })}${u ? ' ' + esc(u) : ''}`;
  }
const mhPart = (key) => (S.mh?.data?.missing || []).includes(key) ? `<p class="hint warn" role="status">Maheera didn't send this part. <button class="linkish" data-act="mh-retry">Try again</button></p>` : '';
// The tab shows Kenduri's shared <maheera-panel> (vendor/maheera-panel.js, v3, loaded when the tab first opens), fed by
// the shared "maheera-panel" function. Its look and words (Bija's ink colour, "bar", "drinks and cakes") are Bija's
// settings in Maheera, not code here. Until that function is deployed, the older view below is shown, read through
// "maheera". The one panel element lives in S.mh, so every render() moves it into the new slot instead of reloading it;
// Exit and the idle lock destroy it with S.mh.
// The panel's fonts (vendor/maheera-fonts/fonts.css, Maheera's host kit) are linked in the page with it: @font-face
// does not work inside its shadow root. The integrity hash is v3's published SRI (rfim/maheera docs/embed.md); a
// different file refuses to run and the tab falls back to the older view.
const MH_PANEL_SRI = 'sha384-xpFD8WfjKvNaipIWcm4+WHCJzdwS8knPKkyF6NJV3DG/nrdX+0pqGEEKVYljBixy';
let mhScript = null;
function mhPanelScript() {
    if (!document.getElementById('mh-fonts')) document.head.insertAdjacentHTML('beforeend', '<link id="mh-fonts" rel="stylesheet" href="vendor/maheera-fonts/fonts.css">');
    if (window.MaheeraPanel || mhScript) return;
    mhScript = document.createElement('script'); mhScript.src = 'vendor/maheera-panel.js'; mhScript.integrity = MH_PANEL_SRI;
    mhScript.onload = () => { if (S.view === 'bar' && S.btab === 'maheera') render(); };
    mhScript.onerror = () => { mhScript = null; if (S.mh) S.mh.legacy = true; if (S.view === 'bar' && S.btab === 'maheera') render(); };
    document.head.appendChild(mhScript);
  }
function mhMountPanel() {
    const slot = document.getElementById('mh-slot'), M = S.mh;
    if (!slot || !M || M.legacy || !window.MaheeraPanel || !S.staffOk) return;
    if (!M.el) {
      const el = M.el = document.createElement('maheera-panel');
      el.config = { theme: { mode: 'light' } }; // the back office is light only, so the panel stays light in dark mode too
      el.load = () => S.sb.maheeraPanel().catch((e) => {
        if (e.code === 'not_deployed' && S.mh === M) { M.legacy = true; M.el = null; el.destroy(); if (S.view === 'bar' && S.btab === 'maheera') render(); }
        throw e;
      });
    }
    if (M.el.parentNode !== slot) slot.replaceChildren(M.el);
  }
function maheera() {
    if (!S.sb?.maheera) return `<div class="empty"><b>Maheera opens on the live back office</b>This back office is keeping data on this device only, so it can't reach Maheera. On the live site, staff see Kenduri's shared stock, drink costs and sales here.</div>`;
    const M = S.mh || (S.mh = { sub: 'today' });
    if (!M.legacy && S.sb.maheeraPanel) {
      mhPanelScript(); queueMicrotask(mhMountPanel);
      return `<div id="mh-slot" class="mh-slot">${M.el ? '' : '<div class="list" aria-busy="true"><div class="skel"></div><div class="skel"></div><div class="skel"></div></div>'}</div>`;
    }
    if (!M.data && !M.err && !M.loading) queueMicrotask(mhLoad);
    const sub = MH_SUBS.some((x) => x[0] === M.sub) ? M.sub : 'today';
    const nav = `<nav class="cats" aria-label="Maheera sections">${MH_SUBS.map(([id, l]) => `<button data-act="mh-sub" data-v="${id}" aria-pressed="${sub === id}">${l}</button>`).join('')}</nav>`;
    const head = `<div class="sec-h"><h2>Maheera</h2><small>Kenduri's shared back office · read only</small></div>`;
    if (!M.data) {
      if (M.err === 'not_allowed') return `${head}<div class="empty"><b>Your staff session has ended</b>Exit and enter the PIN again to see Maheera.</div>`;
      if (M.err === 'setup') return `${head}<div class="empty"><b>Maheera isn't set up yet</b>The owner adds Bija's Maheera sign-in to the backend first (README, "Maheera"). Everything else here works as normal.</div>`;
      if (M.err) return `${head}<div class="empty" role="alert"><b>Maheera isn't answering</b>The rest of the back office works as normal. Try again in a minute.<div class="row" style="justify-content:center;margin-top:12px"><button class="btn sm" data-act="mh-retry">Try again</button></div></div>`;
      return `${head}<div class="list" aria-busy="true"><div class="skel"></div><div class="skel"></div><div class="skel"></div></div><p class="hint" role="status">Asking Maheera…</p>`;
    }
    const body = { today: mhToday, stock: mhStock, costs: mhCosts, week: mhWeek }[sub]();
    const when = M.at ? new Date(M.at).toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit' }) : '';
    return `<div class="mh">${head}${nav}${M.err ? `<p class="hint warn" role="status">Maheera isn't answering, so this is from ${esc(when)}. <button class="linkish" data-act="mh-retry">Try again</button></p>` : ''}${body}
    <p class="hint" style="margin-top:18px">From Maheera${when ? ' at ' + esc(when) : ''}. <button class="linkish" data-act="mh-retry" ${M.loading ? 'disabled' : ''}>${M.loading ? 'Refreshing…' : 'Refresh'}</button></p></div>`;
  }
function mhToday() {
    const D = S.mh.data, b = D.brief && typeof D.brief === 'object' ? D.brief : null;
    const yday = isDate(b?.day) ? b.day : addDays(isDate(D.today) ? D.today : ldate(), -1);
    const row = mhRows(D.pnl).find((r) => r.day === yday);
    const s = b?.sales, gross = mhN(s && typeof s === 'object' ? s.gross_sales ?? s.gross : s) ?? mhN(row?.gross_sales);
    const avg = mhN(b?.same_weekday_avg_gross), wd = dlabel(yday, { weekday: 'long' });
    const vs = gross === null || !avg ? `No ${esc(wd)}s to compare with yet` : `${gross >= avg ? '+' : '−'}${money(Math.abs(gross - avg))} on an average ${esc(wd)} (${money(avg)})`;
    const orders = s && typeof s === 'object' ? mhN(s.orders ?? s.tickets ?? s.count) : null;
    const top = mhRows(b?.top_items).slice(0, 5);
    const below = b ? b.below_par : mhRows(D.stock).filter((x) => x.below_par);
    const pos = b?.purchase_orders_due, norec = b?.dishes_without_recipe, batch = b?.open_batch;
    const todo = [];
    if (mhCount(below)) todo.push(`<li><button class="linkish" data-act="mh-sub" data-v="stock">${mhCount(below)} item${mhCount(below) === 1 ? '' : 's'} below par</button><span>${Array.isArray(below) ? below.slice(0, 4).map((x) => esc(mhName(x))).filter(Boolean).join(', ') : 'Check the stock list and reorder.'}</span></li>`);
    if (mhCount(pos)) todo.push(`<li><b>${mhCount(pos)} supplier order${mhCount(pos) === 1 ? '' : 's'} due</b><span>${Array.isArray(pos) ? pos.slice(0, 3).map((x) => esc(mhName(x))).filter(Boolean).join(', ') : 'Expected in, or to send, today.'}</span></li>`);
    if (mhCount(norec)) todo.push(`<li><button class="linkish" data-act="mh-sub" data-v="costs">${mhCount(norec)} item${mhCount(norec) === 1 ? '' : 's'} sold without a recipe</button><span>Their cost isn't counted until a recipe is added in Maheera${Array.isArray(norec) ? ': ' + norec.slice(0, 3).map((x) => esc(mhName(x))).filter(Boolean).join(', ') : ''}.</span></li>`);
    if (batch && (typeof batch !== 'object' || Object.keys(batch).length)) todo.push(`<li><b>A batch is still open</b><span>${esc(mhName(batch) || 'Finish or close it in Maheera.')}</span></li>`);
    return `<div class="tiles">
      <div class="tile"><small>Yesterday's sales</small><b>${gross === null ? '–' : money(gross)}</b><span>${esc(dlabel(yday))}${orders !== null ? ` · ${num(orders, 0, 1e6)} sale${orders === 1 ? '' : 's'}` : ''}</span></div>
      <div class="tile"><small>Same weekday</small><b>${avg ? money(avg) : '–'}</b><span>${vs}</span></div>
    </div>
    ${mhPart('brief')}
    <section class="sec"><div class="sec-h"><h3>Top items yesterday</h3></div>
      ${top.length ? bars(top.map((x) => [mhName(x), num(x.qty ?? x.count, 0, 1e6)])) : '<div class="empty"><b>No item sales yet</b>Items show here once Maheera has yesterday\'s sales with item detail.</div>'}</section>
    <section class="sec"><div class="sec-h"><h3>Needs attention</h3></div>
      ${todo.length ? `<ul class="todo">${todo.join('')}</ul>` : `<div class="empty"><b>Nothing needs attention</b>${b ? 'Stock is above par, no supplier orders are due and every item sold has a recipe.' : 'Maheera has little Bija data yet. This fills in once recipes and stock counts are entered.'}</div>`}</section>`;
  }
function mhStock() {
    const D = S.mh.data, rows = mhRows(D.stock), sug = mhRows(D.reorder), low = rows.filter((x) => x.below_par);
    const tbl = !rows.length ? '<div class="empty"><b>No stock in Maheera yet</b>Ingredients appear here once Bija\'s first stock count is entered in Maheera, with items below par at the top.</div>'
      : `<div class="panel tablewrap"><table><thead><tr><th>Item</th><th class="num">On hand</th><th class="num">Par</th><th>Status</th></tr></thead><tbody>${rows.map((x) => `<tr><td><b>${esc(mhName(x))}</b>${x.category ? `<div class="hint">${esc(clip(x.category, 40))}</div>` : ''}</td><td class="num">${mhQty(x.on_hand, x.base_unit)}</td><td class="num">${mhQty(x.par_level, x.base_unit)}</td><td>${x.below_par ? light('bad', 'Low') : mhN(x.par_level) === null ? light('', 'No par') : light('ok', 'OK')}</td></tr>`).join('')}</tbody></table></div>`;
    return `<div class="tiles">
      <div class="tile"><small>Below par</small><b>${low.length}</b><span>of ${rows.length} item${rows.length === 1 ? '' : 's'} counted</span></div>
      <div class="tile"><small>To reorder</small><b>${sug.length}</b><span>${sug.some((x) => mhN(x.pack_price) !== null) ? `about ${money(sug.reduce((a, x) => a + (mhN(x.pack_price) || 0) * (mhN(x.suggested_packs) || 0), 0))}` : 'suggested by Maheera'}</span></div>
    </div>
    ${mhPart('stock')}
    <section class="sec"><div class="sec-h"><h3>Stock</h3><small>Low first</small></div>${tbl}</section>
    ${mhPart('reorder')}
    <section class="sec"><div class="sec-h"><h3>Reorder suggestions</h3><small>Up to par</small></div>
      ${!sug.length ? '<div class="empty"><b>Nothing to reorder</b>When an item drops below par, Maheera suggests how much to order and in which pack.</div>'
        : `<div class="panel tablewrap"><table><thead><tr><th>Item</th><th class="num">Order</th><th>Packs</th><th class="num">Cost</th></tr></thead><tbody>${sug.map((x) => { const p = mhN(x.suggested_packs), pp = mhN(x.pack_price); return `<tr><td><b>${esc(mhName(x))}</b><div class="hint">${mhQty(x.on_hand, x.base_unit)} of ${mhQty(x.par_level, x.base_unit)}</div></td><td class="num">${mhQty(x.suggested_qty, x.base_unit)}</td><td>${p !== null ? `${num(p, 0, 1e4)} × ${esc(clip(x.pack_desc || 'pack', 40))}` : '<span class="hint">No supplier pack yet</span>'}</td><td class="num">${p !== null && pp !== null ? money(p * pp) : '–'}</td></tr>`; }).join('')}</tbody></table></div>`}</section>`;
  }
function mhCosts() {
    const rows = mhRows(S.mh.data.dishes), costed = rows.filter((x) => mhN(x.margin_pct) !== null);
    const net = costed.reduce((a, x) => a + (mhN(x.net) || 0), 0), cogs = costed.reduce((a, x) => a + (mhN(x.cogs) || 0), 0);
    const each = (x) => { const q = mhN(x.qty), c = mhN(x.cogs); return q && c !== null ? money(c / q) : '–'; };
    return `<div class="tiles">
      <div class="tile"><small>Margin</small><b>${costed.length && net > 0 ? Math.round((1 - cogs / net) * 1000) / 10 + '%' : '–'}</b><span>on costed items, last 28 days</span></div>
      <div class="tile"><small>Costed</small><b>${costed.length}/${rows.length}</b><span>items with a recipe for every sale</span></div>
    </div>
    <p class="hint">Cost per item comes from its recipe in Maheera. Milk choices such as oat or soya are costed by their own recipe variant, so an oat flat white carries the cost of oat milk.</p>
    ${mhPart('dishes')}
    <section class="sec"><div class="sec-h"><h3>Drink & dish costs</h3><small>Last 28 days</small></div>
      ${!rows.length ? '<div class="empty"><b>No costs yet</b>Drinks, cakes and beans show their cost and margin here once their recipes are entered in Maheera.</div>'
        : `<div class="panel tablewrap"><table><thead><tr><th>Item</th><th class="num">Price</th><th class="num">Sold</th><th class="num">Cost each</th><th class="num">Margin</th></tr></thead><tbody>${rows.map((x) => { const m = mhN(x.margin_pct); return `<tr><td><b>${esc(mhName(x))}</b>${x.category ? `<div class="hint">${esc(clip(x.category, 40))}</div>` : ''}</td><td class="num">${mhMoney(x.price)}</td><td class="num">${num(x.qty, 0, 1e7)}</td><td class="num">${each(x)}</td><td class="num">${m === null ? '<span class="hint">Not costed yet</span>' : `<span${m < 60 ? ' class="neg"' : ''}>${m.toFixed(1)}%</span>`}</td></tr>`; }).join('')}</tbody></table></div>`}</section>`;
  }
function mhWeek() {
    const rows = mhRows(S.mh.data.pnl).filter((r) => isDate(r.day)).sort((a, z) => z.day.localeCompare(a.day));
    const sum = (k) => rows.reduce((a, r) => a + (mhN(r[k]) || 0), 0);
    const noDetail = rows.filter((r) => num(r.sales_without_detail, 0, 1e6) > 0), noRecipe = rows.reduce((a, r) => a + num(r.lines_without_recipe, 0, 1e6), 0);
    const gp = sum('gross_profit');
    return `<div class="tiles">
      <div class="tile"><small>Sales</small><b>${money(sum('gross_sales'))}</b><span>${money(sum('net_sales'))} after VAT</span></div>
      <div class="tile"><small>Cost of goods</small><b>${money(sum('cogs'))}</b><span>from recipes</span></div>
      <div class="tile"><small>Gross profit</small><b${gp < 0 ? ' style="color:var(--warn)"' : ''}>${gp < 0 ? '−' : ''}${money(Math.abs(gp))}</b><span>sales after VAT less cost of goods</span></div>
    </div>
    ${noDetail.length ? `<p class="hint warn"><b>${noDetail.length === 1 ? '1 day has' : noDetail.length + ' days have'} in-store till sales without item detail.</b> They are counted as totals only, so their cost of goods isn't included.</p>` : ''}
    ${noRecipe ? `<p class="hint warn">${noRecipe} item line${noRecipe === 1 ? '' : 's'} sold without a recipe, so ${noRecipe === 1 ? 'its' : 'their'} cost isn't counted yet.</p>` : ''}
    ${mhPart('pnl')}
    <section class="sec"><div class="sec-h"><h3>Day by day</h3><small>Last 7 days</small></div>
      ${!rows.length ? '<div class="empty"><b>No sales in Maheera yet</b>Each day\'s sales, cost of goods and gross profit show here once Bija\'s till sales reach Maheera.</div>'
        : `<div class="panel tablewrap"><table><thead><tr><th>Day</th><th class="num">Sales</th><th class="num">Cost of goods</th><th class="num">Gross profit</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${esc(dlabel(r.day))}${num(r.sales_without_detail, 0, 1e6) > 0 ? '<div class="hint">Some till sales are totals only</div>' : ''}</td><td class="num">${mhMoney(r.gross_sales)}</td><td class="num">${mhMoney(r.cogs)}</td><td class="num">${mhMoney(r.gross_profit)}</td></tr>`).join('')}</tbody></table></div>`}</section>`;
  }
const migrated = new Set();
function migrateBar() {
    if (!S.admin || S.view !== 'bar' || !S.custLoaded || !S.configLoaded) return;
    // codes already frozen by the bar, so a new one is never a duplicate (S10)
    const taken = new Set(Object.values(S.bars).map((x) => x?.memberCode).filter(Boolean));
    for (const c of S.customers) {
      const bd = S.bars[c.id] || {};
      const patch = {};
      if (!MEMBER_RE.test(bd.memberCode || '') && !migrated.has(c.id + '/code')) {
        migrated.add(c.id + '/code');
        const mine = typeof c.memberCode === 'string' && MEMBER_RE.test(c.memberCode) ? c.memberCode : '';
        const clash = !mine || taken.has(mine) || S.customers.some((x) => x.id !== c.id && x.memberCode === mine);
        let code = clash ? newMemberCode() : mine; while (taken.has(code)) code = newMemberCode();
        taken.add(code); patch.memberCode = code;
      }
      for (const [oid, r] of Object.entries(bd.orders || {})) {
        if (r?.status !== 'collected' || r.total != null || !c.orders?.[oid] || migrated.has(c.id + '/' + oid)) continue;
        migrated.add(c.id + '/' + oid); const sp = collectSnap(c.id, oid, r.at || new Date().toISOString(), true);
        if (sp) { patch.orders = { ...(patch.orders || {}), ...sp.orders }; if (sp.birthMonth) patch.birthMonth = sp.birthMonth; }
      }
      for (const [gid, v] of Object.entries(bd.giftsPaid || {})) {
        if (typeof v !== 'string' || migrated.has(c.id + '/' + gid)) continue;
        migrated.add(c.id + '/' + gid); const g = c.gifts?.[gid];
        if (g) (patch.giftsPaid ||= {})[gid] = { at: v, amount: Math.min(200, Math.max(5, Math.round(+g.amount || 0))), code: clip(g.code, 20) };
      }
      if (Object.keys(patch).length) saveBar(c.id, patch).catch(() => {});
    }
  }
    return { FLOW, lvAllOrders, giftsBar, barista, allOrders, queue, shopBar, members, lvInsights, lvMembersTable, bars, insights, VAT_HELP, PERIODS, FIN_SUBS, UK, addMonths, appCollected, vatQuarters, recurringKeys, recurringDue, cashFlow, deadlines, daysTo, whenTxt, finance, ftile, fhead, fbig, more, fcta, finToday, finCloseView, finOutView, finBillsView, finFlowView, finPLView, finVatView, finStaffView, finDatesView, finReports, finSettingsView, menuEditor, MH_SUBS, mhLoad, maheera, mhToday, mhStock, mhCosts, mhWeek, migrated, migrateBar };
  }
};
