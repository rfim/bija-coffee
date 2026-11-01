// Native features for the Bija app when it runs inside the Capacitor shells (Android and iOS).
// In a normal browser this file does nothing: window.BijaNative stays undefined and the app uses its web fallbacks.
(() => {
  const C = window.Capacitor;
  if (!C || typeof C.isNativePlatform !== 'function' || !C.isNativePlatform()) return;

  const plugin = (name) => {
    try { return C.registerPlugin ? C.registerPlugin(name) : (C.Plugins || {})[name]; } catch { return undefined; }
  };
  const App = plugin('App'), Haptics = plugin('Haptics'), Share = plugin('Share'), StatusBar = plugin('StatusBar');
  const SplashScreen = plugin('SplashScreen'), Push = plugin('PushNotifications'), Scanner = plugin('BarcodeScanner');
  const platform = C.getPlatform ? C.getPlatform() : 'native';
  const quiet = (p) => Promise.resolve(p).catch(() => undefined);
  document.documentElement.classList.add('is-native', `is-${platform}`);

  // Haptics: the app's navigator.vibrate(10) calls become a native tap; longer patterns become a stronger one.
  const haptic = (kind = 'light') => {
    if (!Haptics) return Promise.resolve();
    if (kind === 'success' || kind === 'warning' || kind === 'error') return quiet(Haptics.notification({ type: kind.toUpperCase() }));
    if (kind === 'select') return quiet(Haptics.selectionChanged());
    return quiet(Haptics.impact({ style: kind === 'heavy' ? 'HEAVY' : kind === 'medium' ? 'MEDIUM' : 'LIGHT' }));
  };
  try {
    navigator.vibrate = (pattern) => {
      const ms = Array.isArray(pattern) ? pattern.reduce((a, b) => a + (+b || 0), 0) : +pattern || 0;
      if (ms > 0) haptic(ms >= 40 ? 'medium' : 'light');
      return true;
    };
  } catch { /* read-only on some engines; the app's own guard still works */ }

  // Share sheet: navigator.share goes to the native share sheet.
  const share = (data = {}) => Share ? Share.share({ title: data.title, text: data.text, url: data.url, dialogTitle: data.title || 'Share' }) : Promise.reject(new Error('Share unavailable'));
  try { navigator.share = share; navigator.canShare = () => !!Share; } catch { /* ignore */ }

  // QR scan for the "Scan coffee" button: resolves with the code's text, rejects if cancelled or unavailable.
  const scan = async () => {
    if (!Scanner) throw new Error('Scanner unavailable');
    if (platform === 'android' && Scanner.isGoogleBarcodeScannerModuleAvailable) {
      const { available } = await Scanner.isGoogleBarcodeScannerModuleAvailable();
      if (!available) { await Scanner.installGoogleBarcodeScannerModule(); throw new Error('The scanner is being installed by Google Play services. Try again in a moment.'); }
    } else if (Scanner.requestPermissions) {
      const { camera } = await Scanner.requestPermissions();
      if (camera !== 'granted' && camera !== 'limited') throw new Error('Camera permission was not given.');
    }
    const { barcodes = [] } = await Scanner.scan({ formats: ['QR_CODE'] });
    const value = barcodes[0] && (barcodes[0].rawValue || barcodes[0].displayValue);
    if (!value) throw new Error('No code found.');
    haptic('success');
    return value;
  };

  // Push: asks permission only when the app calls register() (for example after an order), never on launch.
  const pushListeners = [];
  const push = {
    async register() {
      if (!Push) return { ok: false, reason: 'unavailable' };
      let { receive } = await Push.checkPermissions();
      if (receive === 'prompt' || receive === 'prompt-with-rationale') ({ receive } = await Push.requestPermissions());
      if (receive !== 'granted') return { ok: false, reason: 'denied' };
      return new Promise((resolve) => {
        quiet(Push.addListener('registration', ({ value }) => { pushListeners.forEach((f) => f(value)); resolve({ ok: true, token: value }); }));
        quiet(Push.addListener('registrationError', (e) => resolve({ ok: false, reason: (e && e.error) || 'error' })));
        quiet(Push.register());
      });
    },
    onToken(fn) { if (typeof fn === 'function') pushListeners.push(fn); },
  };

  // Native sign-in: Apple's sheet on iPhone, Google's account picker on Android and iPhone (Google blocks sign-in inside app web views).
  // Each returns an ID token that Supabase checks (signInWithIdToken). Bija fills these IDs once they exist: docs/backend/native-sign-in.md
  const OAUTH = {
    googleWebClientId: '', // Google Cloud: OAuth client of type Web application (also the one in Supabase)
    googleIosClientId: '', // Google Cloud: OAuth client of type iOS, bundle uk.co.bijalondon.app
  };
  const Social = plugin('SocialLogin');
  let socialReady = null;
  const hex = (b) => Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, '0')).join('');
  const sha256 = async (t) => hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)));
  async function signIn(provider) {
    if (!Social) return null;
    if (provider === 'apple' && platform !== 'ios') return null; // Android: Apple has no native SDK, so the web sign-in is used
    if (provider === 'google' && !(platform === 'ios' ? OAUTH.googleIosClientId : OAUTH.googleWebClientId)) throw new Error('provider is not enabled');
    socialReady = socialReady || Social.initialize({
      ...(OAUTH.googleWebClientId || OAUTH.googleIosClientId ? { google: { webClientId: OAUTH.googleWebClientId || undefined, iOSClientId: OAUTH.googleIosClientId || undefined, iOSServerClientId: OAUTH.googleWebClientId || undefined } } : {}),
      ...(platform === 'ios' ? { apple: { redirectUrl: '' } } : {}),
    });
    await socialReady;
    // the provider gets the hashed nonce, Supabase the raw one, so a stolen token can't be replayed (Google's iOS SDK sets its own nonce)
    const raw = hex(crypto.getRandomValues(new Uint8Array(16)).buffer), hashed = await sha256(raw);
    const useNonce = !(provider === 'google' && platform === 'ios');
    const r = await Social.login({ provider, options: provider === 'apple' ? { scopes: ['email', 'name'], nonce: hashed } : { scopes: ['email', 'profile'], ...(useNonce ? { nonce: hashed } : {}) } });
    const res = r && r.result, token = res && res.idToken;
    if (!token) throw new Error('No ID token from ' + provider);
    const prof = res.profile || {};
    return { token, nonce: useNonce ? raw : undefined, name: [prof.givenName, prof.familyName].filter(Boolean).join(' ') || prof.name || '' };
  }

  window.BijaNative = Object.freeze({ platform, scan, haptic, share, push, signIn });

  // Links into the app (Bean passport QR codes, app links) open the matching page inside the app.
  const SITE = /^https:\/\/rfim\.github\.io\/bija-coffee\//;
  const ALLOWED = /^(trace\.html|app\.html|index\.html|shop\.html|product\.html|menu\.html)(\?[^#]*)?(#[\w-]*)?$/;
  if (App) quiet(App.addListener('appUrlOpen', ({ url }) => {
    const rel = String(url || '').replace(SITE, '');
    if (rel !== url && ALLOWED.test(rel)) location.href = rel;
  }));

  // Android back button: close an open sheet or dialog first, then go back, then leave the app.
  const openOverlay = () => document.querySelector('dialog[open], [aria-modal="true"]:not([hidden]), #sheet:not([hidden]) .pan, .sheet.on, [data-stamp-drawer].open, [data-stamp-drawer][aria-hidden="false"]');
  // In the app: sheet first, then an open allergy step, then back to Home, then "press again to leave" (the usual Android pattern).
  let lastBack = 0;
  const backHint = () => {
    let t = document.getElementById('backhint');
    if (!t) { t = document.createElement('div'); t.id = 'backhint'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = 'Press back again to leave Bija'; t.hidden = false; clearTimeout(t._h); t._h = setTimeout(() => { t.hidden = true; }, 2000);
  };
  if (App && platform === 'android') quiet(App.addListener('backButton', ({ canGoBack }) => {
    if (openOverlay()) { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); return; }
    const close = document.querySelector('.diet-ask [data-act=dclose]');
    if (close) { close.click(); return; }
    if (!/app\.html$/.test(location.pathname)) { if (canGoBack) history.back(); else location.href = 'app.html?view=app'; return; }
    const home = document.querySelector('.bnav [data-act=tab][data-v=home]');
    if (home && home.getAttribute('aria-current') !== 'page') { home.click(); return; }
    if (Date.now() - lastBack < 2000) { quiet(App.exitApp()); return; }
    lastBack = Date.now(); backHint();
  }));

  // Status bar: dark text on white, matching the light app. The splash stays until the app has drawn.
  if (StatusBar) {
    quiet(StatusBar.setStyle({ style: 'LIGHT' }));
    if (platform === 'android') quiet(StatusBar.setBackgroundColor({ color: '#ffffff' }));
  }
  const hideSplash = () => SplashScreen && quiet(SplashScreen.hide({ fadeOutDuration: 250 }));
  const ready = () => document.querySelector('#main > *') || document.querySelector('main > *');
  if (ready()) hideSplash();
  else {
    const mo = new MutationObserver(() => { if (ready()) { mo.disconnect(); hideSplash(); } });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => { mo.disconnect(); hideSplash(); }, 4000); // never leave the splash up
  }
})();
