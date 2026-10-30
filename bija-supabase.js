/* Bija shared backend (Supabase, London region).
 * Gives the app the same small document API it already uses (doc().get/set/update/delete/onSnapshot, collection().onSnapshot),
 * stored in one Postgres table `docs` with row-level security:
 *   config/current  readable by everyone, written by staff
 *   customers/{uid} read and written by that customer (and staff)
 *   bar/{uid}       read by that customer, written by staff only (points come from here, so customers can't award themselves)
 *   finance/{id}    staff only
 * Staff = a signed-in user who unlocked a 30-minute session with the 6-digit staff PIN. The PIN is checked on the server
 * (public.staff_unlock), salted and hashed there, with rate limiting. Customers sign in anonymously; nothing else is asked.
 * Needs vendor/supabase.js (supabase-js 2.45.4, MIT) loaded first. */
(function () {
  'use strict';
  const CONFIG = {
    url: 'https://nvsampchuozqbtavuugx.supabase.co',
    // publishable key: safe in the browser, everything is guarded by row-level security
    key: 'sb_publishable_Md-efay2oSsOge7vkC4qrQ_rL3pe9dP',
  };
  const TIMEOUT = 8000, POLL = 20000;
  const clone = (v) => (v === undefined ? v : JSON.parse(JSON.stringify(v)));
  const withTimeout = (p, ms, what) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error(what + ' timed out')), ms))]);
  let client = null, uid = null, connecting = null, staffUntil = 0;
  const staffSubs = new Set();
  const setStaff = (until) => { staffUntil = until; staffSubs.forEach((f) => { try { f(isStaffNow()); } catch {} }); };
  const isStaffNow = () => staffUntil > Date.now();

  function makeClient(opts) {
    const lib = window.supabase;
    if (!lib || typeof lib.createClient !== 'function') throw new Error('supabase-js not loaded');
    return lib.createClient(opts.url, opts.key, { auth: { persistSession: true, autoRefreshToken: true, storageKey: 'bija.sb.auth' }, realtime: { params: { eventsPerSecond: 5 } } });
  }

  async function ensure(opts = {}) {
    if (client && uid) return client;
    if (connecting) return connecting;
    connecting = (async () => {
      const o = { ...CONFIG, ...opts };
      client = client || makeClient(o);
      let { data } = await withTimeout(client.auth.getSession(), TIMEOUT, 'session');
      let session = data && data.session;
      if (!session) {
        const r = await withTimeout(client.auth.signInAnonymously(), TIMEOUT, 'sign-in');
        if (r.error) throw r.error;
        session = r.data.session;
      }
      uid = session.user.id;
      try { const t = await client.rpc('staff_touch'); if (t.data && t.data.ok) setStaff(Date.parse(t.data.expires_at)); } catch {}
      return client;
    })();
    try { return await connecting; } finally { connecting = null; }
  }

  // ---------- document store ----------
  function makeDb(c) {
    const snap = (path, row) => ({ id: path.split('/').pop(), exists: !!row, data: () => clone(row ? row.data : undefined), version: row ? row.version : 0 });
    const watchers = new Set(); // { match(path), refresh() }
    const notify = (path) => watchers.forEach((w) => { if (w.match(path)) w.refresh(); });
    const err = (e) => { const x = new Error((e && e.message) || 'request failed'); x.code = (e && e.code) || 'error'; x.cause = e; return x; };

    let channel = null, live = false, poller = null;
    function startRealtime() {
      if (channel) return;
      channel = c.channel('bija-docs')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'docs' }, (p) => {
          const path = (p.new && p.new.path) || (p.old && p.old.path);
          if (path) notify(path); else watchers.forEach((w) => w.refresh());
        })
        .subscribe((status) => { live = status === 'SUBSCRIBED'; });
      // polling backs realtime up: when the socket is down, or a delete arrives without its path
      poller = setInterval(() => { if (!live || document.visibilityState === 'visible') watchers.forEach((w) => w.refresh(true)); }, POLL);
      addEventListener('online', () => watchers.forEach((w) => w.refresh()));
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') watchers.forEach((w) => w.refresh()); });
    }
    function watcher(match, load, cb, onErr) {
      let timer = null, last = null, stopped = false;
      const w = {
        match,
        refresh(quiet) {
          clearTimeout(timer);
          timer = setTimeout(async () => {
            if (stopped) return;
            try {
              const v = await load(); const key = JSON.stringify(v.raw);
              if (quiet && key === last) return; // polling only reports real changes
              last = key; cb(v.out);
            } catch (e) { if (onErr) onErr(err(e)); }
          }, quiet ? 0 : 120);
        },
      };
      watchers.add(w); startRealtime(); w.refresh();
      return () => { stopped = true; watchers.delete(w); };
    }
    async function getRow(path) {
      const { data, error } = await c.from('docs').select('path,data,version').eq('path', path).maybeSingle();
      if (error) throw error; return data;
    }
    return {
      doc: (path) => ({
        get: async () => snap(path, await getRow(path)),
        set: async (v) => {
          const { error } = await c.from('docs').upsert({ path, data: clone(v) || {} }, { onConflict: 'path' });
          if (error) throw err(error); notify(path);
        },
        update: async (patch) => {
          const { error } = await c.rpc('doc_update', { p_path: path, p_patch: clone(patch) || {} });
          if (error) { if (error.code === 'P0002' || /not_found/.test(error.message || '')) throw Object.assign(new Error('not_found'), { code: 'not_found' }); throw err(error); }
          notify(path);
        },
        delete: async () => { const { error } = await c.from('docs').delete().eq('path', path); if (error) throw err(error); notify(path); },
        onSnapshot: (cb, onErr) => watcher((p) => p === path, async () => { const row = await getRow(path); return { raw: row && [row.version, row.data], out: snap(path, row) }; }, cb, onErr),
      }),
      collection: (coll) => ({
        onSnapshot: (cb, onErr) => watcher((p) => p.startsWith(coll + '/'), async () => {
          const { data, error } = await c.from('docs').select('path,data,version').eq('coll', coll).order('path');
          if (error) throw error;
          return { raw: (data || []).map((r) => [r.path, r.version]), out: { docs: (data || []).map((r) => snap(r.path, r)) } };
        }, cb, onErr),
      }),
      refreshAll: () => watchers.forEach((w) => w.refresh()),
    };
  }

  // ---------- staff (PIN checked on the server) ----------
  async function staffUnlock(pin) {
    const c = await ensure();
    const { data, error } = await c.rpc('staff_unlock', { pin: String(pin || '') });
    if (error) return { ok: false, reason: 'error', message: error.message };
    if (data && data.ok) setStaff(Date.parse(data.expires_at));
    return data || { ok: false, reason: 'error' };
  }
  async function staffTouch() {
    const c = await ensure(); const { data } = await c.rpc('staff_touch');
    if (data && data.ok) setStaff(Date.parse(data.expires_at)); else setStaff(0);
    return data || { ok: false };
  }
  async function staffLock() { const c = await ensure(); await c.rpc('staff_lock'); setStaff(0); return { ok: true }; }
  async function staffChangePin(oldPin, newPin) {
    const c = await ensure(); const { data, error } = await c.rpc('staff_change_pin', { old_pin: String(oldPin || ''), new_pin: String(newPin || '') });
    return error ? { ok: false, reason: 'error', message: error.message } : data;
  }

  // ---------- website helpers ----------
  const SHOP = { house: ['Bija House Blend', 12], mandheling: ['Sumatra Mandheling', 12], lintong: ['Sumatra Lintong', 12], java: ['Old Brown Java', 12], discovery: ['Discovery set', 33], gift: ['Gift subscription', 36] };
  const ALIAS = { set: 'discovery' }; // the website calls the Discovery set "set", the app "discovery"
  const GRINDS = ['Whole bean', 'Espresso', 'Moka pot', 'Filter', 'Cafetière', 'V60', 'AeroPress'];
  const DAYS = { '2w': 14, '3w': 21, '4w': 28 };
  const r2 = (n) => Math.round((+n || 0) * 100) / 100;
  const ldate = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  const addDays = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const str = (v, n) => String(v == null ? '' : v).slice(0, n);

  // Saves a web shop order into the customer's own document, in the same shape the app uses (customers/{uid}.shop and .subs),
  // so staff see it in Web & delivery. Prices are recomputed from the catalogue here, never taken from the page.
  async function placeShopOrder(order) {
    const c = await ensure(), db = makeDb(c);
    const o = order || {}, id = /^[A-Za-z0-9_-]{4,40}$/.test(o.id || '') ? o.id : 'w' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const lines = (Array.isArray(o.lines) ? o.lines : []).map((l) => {
      const pid = ALIAS[l && l.id] || (l && l.id), p = SHOP[pid]; if (!p || !(+l.qty > 0)) return null;
      const plan = pid === 'gift' ? 'once' : (['once', '2w', '3w', '4w'].includes(l.plan) ? l.plan : 'once');
      return { id: pid, name: p[0], grind: GRINDS.includes(l.grind) ? l.grind : 'Whole bean', qty: Math.min(20, Math.round(+l.qty)), plan, unit: plan === 'once' ? p[1] : r2(p[1] * 0.9) };
    }).filter(Boolean);
    if (!lines.length) return { ok: false, reason: 'empty' };
    const method = o.delivery && o.delivery.method === 'post' ? 'post' : 'collect';
    const subtotal = r2(lines.reduce((a, l) => a + l.unit * l.qty, 0));
    const fee = method === 'post' && subtotal < 30 && !lines.some((l) => l.plan !== 'once') && !lines.some((l) => l.id === 'gift') ? 3.95 : 0;
    const delivery = { method, fee, ...(method === 'post' ? { address: str(o.delivery.address, 120), postcode: str(o.delivery.postcode, 8).toUpperCase() } : {}) };
    const createdAt = new Date().toISOString(), day = ldate(new Date());
    const code = /^W[A-Z0-9]{3,6}$/.test(o.code || '') ? o.code : 'W' + Math.random().toString(36).slice(2, 6).toUpperCase();
    const entry = { code, createdAt, name: str(o.name, 60), email: str(o.email, 80), lines, delivery, subtotal, total: r2(subtotal + fee), source: 'web', ...(o.marketing ? { marketing: true } : {}) };
    const subs = {};
    lines.forEach((l, i) => { if (DAYS[l.plan]) subs[`${id}-${i}`] = { pid: l.id, name: l.name, grind: l.grind, qty: l.qty, plan: l.plan, unit: l.unit, start: addDays(day, DAYS[l.plan]), delivery: { method, ...(method === 'post' ? { address: delivery.address, postcode: delivery.postcode } : {}) }, createdAt, from: id }; });
    const ref = db.doc('customers/' + uid), patch = { shop: { [id]: entry }, ...(Object.keys(subs).length ? { subs } : {}) };
    try { await ref.update(patch); }
    catch (e) {
      if (e.code !== 'not_found') return { ok: false, reason: 'error', message: e.message };
      await ref.set({ name: entry.name, joinedAt: createdAt, orders: {}, ratings: {}, secret: { visited: {} }, gifts: {}, claims: {}, ...patch });
    }
    return { ok: true, id, code, total: entry.total, uid };
  }
  async function subscribeNewsletter(email, source) {
    const c = await ensure();
    const { data, error } = await c.rpc('newsletter_subscribe', { p_email: String(email || ''), p_source: String(source || 'web') });
    return error ? { ok: false, reason: 'error', message: error.message } : data;
  }

  // ---------- ledgers (phase 2): money, points and stamps change only through these server functions ----------
  // Each wrapper returns { ok: true, data } or { ok: false, reason, message }; amounts, prices and balances always come from the server.
  async function call(fn, args) {
    const c = await ensure();
    const { data, error } = await c.rpc(fn, args || {});
    if (error) return { ok: false, reason: error.code === '42501' ? 'not_allowed' : 'error', message: error.message };
    return { ok: true, data };
  }
  const line = (l) => ({ id: str(l && l.id, 40), qty: Math.round(+(l && l.qty) || 0), ...(l && l.milk ? { milk: str(l.milk, 12) } : {}), ...(l && l.temp ? { temp: str(l.temp, 6) } : {}), ...(l && l.sweet ? { sweet: str(l.sweet, 12) } : {}) });
  const rpc = {
    // customer
    member: () => call('my_member'),
    balances: (uid) => call('balances', uid ? { p_uid: uid } : {}),
    placeOrder: ({ lines, slot, note, reward, useStamp, useGift } = {}) => call('place_order', {
      p_lines: (Array.isArray(lines) ? lines : []).map(line), p_slot: str(slot || 'ASAP', 20), p_note: note ? str(note, 140) : null,
      p_reward: reward || null, p_use_stamp: !!useStamp, p_use_gift: !!useGift }),
    cancelOrder: (orderId) => call('cancel_order', { p_order: orderId }),
    requestGift: ({ amount, to, message } = {}) => call('request_gift', { p_amount: +amount, p_to: to ? str(to, 40) : null, p_message: message ? str(message, 200) : null }),
    redeemGift: (code) => call('redeem_gift', { p_code: str(code, 20) }),
    myGifts: () => call('my_gifts'),
    setBirthMonth: (month) => call('set_birth_month', { p_month: Math.round(+month) }),
    checkInSpot: (spot) => call('check_in_spot', { p_spot: str(spot, 20) }),
    // staff (need staffUnlock first)
    setOrderStatus: (orderId, status) => call('set_order_status', { p_order: orderId, p_status: status }),
    collectOrder: (orderId) => call('collect_order', { p_order: orderId }),
    undoCollect: (orderId, reason) => call('undo_collect', { p_order: orderId, p_reason: str(reason, 200) }),
    addInstore: ({ memberCode, amount, drinks, tillRef, double } = {}) => call('add_instore', {
      p_member_code: str(memberCode, 12), p_amount: +amount, p_drinks: Math.round(+drinks || 0), p_till_ref: tillRef ? str(tillRef, 64) : null, p_double: !!double }),
    activateGift: (giftId, amountTaken) => call('activate_gift', { p_gift: giftId, p_amount_taken: +amountTaken }),
    staffGiftCards: () => call('staff_gift_cards'),
    // staff read views: members, insights and daily sales, all computed from the ledgers on the server
    staffMembers: (limit) => call('staff_members', { p_limit: Math.round(+limit || 500) }),
    staffInsights: (days) => call('staff_insights', { p_days: Math.round(+days || 28) }),
    staffSalesDaily: (from, to) => call('staff_sales_daily', { p_from: String(from).slice(0, 10), p_to: String(to).slice(0, 10) }),
    // owner only (owners table + MFA)
    adjust: ({ uid, ledger, delta, reason } = {}) => call('adjust', { p_uid: uid, p_ledger: ledger, p_delta: +delta, p_reason: str(reason, 200) }),
  };
  // Read-only lists (RLS: a customer sees their own rows, staff see all).
  async function myOrders(limit) {
    const c = await ensure();
    const { data, error } = await c.from('orders').select('*').order('created_at', { ascending: false }).limit(Math.min(+limit || 20, 100));
    return error ? { ok: false, reason: 'error', message: error.message } : { ok: true, data };
  }
  async function ledger(name, limit) {
    if (!['points_ledger', 'stamps_ledger', 'gift_ledger'].includes(name)) return { ok: false, reason: 'bad_ledger' };
    const c = await ensure();
    const { data, error } = await c.from(name).select('delta,kind,ref,created_at').order('created_at', { ascending: false }).limit(Math.min(+limit || 50, 200));
    return error ? { ok: false, reason: 'error', message: error.message } : { ok: true, data };
  }

  // Calls `cb` (debounced) whenever an order or a ledger row this user can see changes; polling covers a dropped socket.
  let ledgerSubs = null;
  function onLedgers(cb) {
    if (!ledgerSubs) {
      ledgerSubs = new Set(); let t = null; const fire = () => { clearTimeout(t); t = setTimeout(() => ledgerSubs.forEach((f) => { try { f(); } catch {} }), 250); };
      ensure().then((c) => {
        let ch = c.channel('bija-ledgers');
        for (const table of ['orders', 'points_ledger', 'stamps_ledger', 'gift_ledger']) ch = ch.on('postgres_changes', { event: '*', schema: 'public', table }, fire);
        ch.subscribe(() => {});
      }).catch(() => {});
      setInterval(() => { if (document.visibilityState === 'visible') fire(); }, POLL);
      addEventListener('online', fire);
    }
    ledgerSubs.add(cb); return () => ledgerSubs.delete(cb);
  }

  // ---------- member account ----------
  // Everyone starts as a guest (anonymous) with a Bija Card. Signing up links Google, Apple or an email to that same user,
  // so points and stamps stay; signing in on a new phone switches to the member's existing card. Google and Apple must be
  // turned on in Supabase (Authentication, Sign In / Providers), with manual linking allowed for guests.
  // a password-reset link carries type=recovery; note it before supabase-js reads and clears the address
  const RECOVERY_LINK = /[#&?]type=recovery\b/.test(location.hash + location.search);
  function accountApi(c) {
    const back = () => location.href.split('#')[0];
    return {
      async user() {
        const { data } = await c.auth.getUser(); const u = data && data.user; if (!u) return null;
        const m = u.user_metadata || {};
        return { id: u.id, guest: !!u.is_anonymous, email: u.email || '', name: m.full_name || m.name || '', providers: (u.identities || []).map((i) => i.provider) };
      },
      async withProvider(provider, mode) {
        const r = mode === 'signin' ? await c.auth.signInWithOAuth({ provider, options: { redirectTo: back() } }) : await c.auth.linkIdentity({ provider, options: { redirectTo: back() } });
        if (r.error) throw r.error;
      },
      async email(address, mode) {
        const r = mode === 'signin' ? await c.auth.signInWithOtp({ email: address, options: { emailRedirectTo: back(), shouldCreateUser: false } })
          : await c.auth.updateUser({ email: address }, { emailRedirectTo: back() });
        if (r.error) throw r.error;
      },
      // email and password: signing up as a guest adds them to the guest's own card (points stay); logging in opens an existing card
      async passwordSignUp(address, password) {
        const { data } = await c.auth.getUser(); const guest = !!(data && data.user && data.user.is_anonymous);
        const r = guest ? await c.auth.updateUser({ email: address, password }) : await c.auth.signUp({ email: address, password });
        if (r.error) throw r.error;
      },
      // the installed apps sign in natively (Apple sheet, Google account picker) and hand Supabase the ID token
      // a guest links the Google or Apple identity to their own card (points stay); if it already belongs to a member, sign in to that card
      async withIdToken(provider, token, nonce) {
        const cred = { provider, token, ...(nonce ? { nonce } : {}) };
        const { data } = await c.auth.getUser();
        if (data && data.user && data.user.is_anonymous) {
          const l = await c.auth.linkIdentity(cred);
          if (!l.error) return 'linked';
          if (!/already|exists|linked/i.test(l.error.message || '')) throw l.error;
        }
        const r = await c.auth.signInWithIdToken(cred); if (r.error) throw r.error;
        return 'signed-in';
      },
      // after signing up with email: is the address confirmed yet, and send the activation email again
      async emailPending() { const { data } = await c.auth.getUser(); const u = data && data.user; return !!(u && (u.new_email || (u.email && !u.email_confirmed_at))); },
      async resendActivation(address) {
        const { data } = await c.auth.getUser(); const changing = !!(data && data.user && data.user.new_email);
        const r = await c.auth.resend({ type: changing ? 'email_change' : 'signup', email: address, options: { emailRedirectTo: back() } });
        if (r.error) throw r.error;
      },
      async passwordSignIn(address, password) { const r = await c.auth.signInWithPassword({ email: address, password }); if (r.error) throw r.error; },
      // the reset link opens the app with a recovery session (supabase-js reads it from the URL); then a new password is set
      onRecovery(cb) {
        let done = false; const once = () => { if (!done) { done = true; cb(); } };
        if (RECOVERY_LINK) setTimeout(once, 0); // the link was read before anyone was listening
        const { data } = c.auth.onAuthStateChange((ev) => { if (ev === 'PASSWORD_RECOVERY') once(); });
        return () => data.subscription.unsubscribe();
      },
      async setPassword(password) { const r = await c.auth.updateUser({ password }); if (r.error) throw r.error; },
      async resetPassword(address) { const r = await c.auth.resetPasswordForEmail(address, { redirectTo: back() }); if (r.error) throw r.error; },
      async signOut() { await c.auth.signOut(); },
    };
  }

  async function connect(opts) {
    const c = await ensure(opts);
    return {
      db: makeDb(c), uid,
      isStaff: async () => { try { await staffTouch(); } catch {} return isStaffNow(); },
      staffUnlock, staffLock, staffTouch, staffChangePin,
      onStaffChange: (f) => { staffSubs.add(f); return () => staffSubs.delete(f); },
      rpc, myOrders, ledger, onLedgers,
      account: accountApi(c),
    };
  }

  window.BijaSupabase = { config: CONFIG, connect, staffUnlock, staffLock, staffTouch, staffChangePin, isStaff: isStaffNow, onStaffChange: (f) => { staffSubs.add(f); return () => staffSubs.delete(f); }, placeShopOrder, subscribeNewsletter, rpc, balances: rpc.balances, myOrders, ledger, _ensure: ensure };
})();
