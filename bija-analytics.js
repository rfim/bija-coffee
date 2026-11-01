// Bija app analytics: a small, privacy-first wrapper around Plausible custom events.
// No cookies, no user IDs, no names, codes or free text: only the events and properties allowed below.
// Plan and setup: docs/fullstack/analytics.md. Load after the Plausible snippet; call bijaTrack('Place Order', {...}).
(() => {
  // event name -> allowed property names (anything else is dropped)
  const EVENTS = {
    'App Open': ['mode', 'tab'],
    'Add To Order': ['item', 'cat', 'from'],
    'Place Order': ['items', 'slot', 'reward', 'gift'],
    'Order Collected': ['wait'],
    'Reward Redeemed': ['reward'],
    'Gift Card Bought': ['amount', 'design'],
    'Gift Card Paid': ['amount'],
    'Gift Card Redeemed': ['step'],
    'Referral Shared': ['channel'],
    'Referral Joined': [],
    'Secret Check In': ['spot'],
    'App Installed': [],
  };
  const SAFE = /^[A-Za-z0-9 _.:£-]{1,40}$/; // ids, bands and labels only: blocks emails, long text and most personal data

  function optedOut() {
    try {
      if (localStorage.getItem('bija.analytics') === 'off') return true;
    } catch {}
    return navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
  }

  function track(name, props = {}, revenue) {
    const allowed = EVENTS[name];
    if (!allowed || optedOut() || typeof window.plausible !== 'function') return;
    const clean = {};
    for (const k of allowed) {
      const v = props[k];
      if (v == null) continue;
      const s = String(v);
      if (SAFE.test(s)) clean[k] = s;
    }
    const opts = { props: clean };
    if (typeof revenue === 'number' && Number.isFinite(revenue) && revenue >= 0) opts.revenue = { amount: Math.round(revenue * 100) / 100, currency: 'GBP' };
    try { window.plausible(name, opts); } catch {}
  }

  // money bands keep amounts useful without making one customer's order stand out
  const band = (n) => { n = +n || 0; return n < 5 ? 'under £5' : n < 10 ? '£5-10' : n < 20 ? '£10-20' : n < 50 ? '£20-50' : '£50+'; };
  const minutes = (fromIso, toIso) => { const m = Math.round((new Date(toIso) - new Date(fromIso)) / 60000); return !Number.isFinite(m) || m < 0 ? '' : m < 5 ? '0-5 min' : m < 10 ? '5-10 min' : m < 20 ? '10-20 min' : '20+ min'; };

  window.bijaTrack = track;
  window.bijaTrack.band = band;
  window.bijaTrack.minutes = minutes;
  window.bijaTrack.optOut = (off = true) => { try { off ? localStorage.setItem('bija.analytics', 'off') : localStorage.removeItem('bija.analytics'); } catch {} };
  window.bijaTrack.isOptedOut = optedOut;
})();
