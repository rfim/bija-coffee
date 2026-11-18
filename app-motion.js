/* Bija motion layer: the app's renders stay untouched; this file watches the DOM and adds motion on top.
   Everything is transform/opacity, everything stops under reduced motion (or window.__BIJA_TEST_NO_MOTION). */
(() => {
  const W = window, D = document, H = D.documentElement;
  const calm = () => !!W.__BIJA_TEST_NO_MOTION || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = D) => r.querySelector(s), $$ = (s, r = D) => [...r.querySelectorAll(s)];
  const ss = { get: (k) => { try { return sessionStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch {} } };
  const vib = (n) => { try { if (!calm() && navigator.vibrate && navigator.userActivation?.hasBeenActive) navigator.vibrate(n); } catch {} }; // browsers block haptics before a first tap
  const C4 = '<circle cx="50" cy="25" r="25"/><circle cx="75" cy="50" r="25"/><circle cx="50" cy="75" r="25"/><circle cx="25" cy="50" r="25"/>';
  const MARK = `<svg viewBox="-4 -4 108 108" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="7">${C4}</g></svg>`;
  const anim = (el, k, o) => (el && el.animate && !calm() ? el.animate(k, o) : null);
  const M = (W.BijaMotion = { flying: 0 });

  // ---- opening: just the Bija mark drawing itself, on every open and on coming back after more than 2 minutes
  //      away (not in the back office). Never blocks; any tap skips it.
  //      Capture scripts set sessionStorage mo.splash to film without either. ----
  // the opening's look (?ofx=2 handshake, ?ofx=5 heartbeat, for the visit); otherwise each opening picks one of the two
  const OFX = (() => { try { const q = new URLSearchParams(location.search).get('ofx'); if (q === '2' || q === '5') ss.set('mo.ofx', q); } catch {} return ss.get('mo.ofx') || ''; })();
  const KW = '<svg class="mo-kw" viewBox="0 0 100 100" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M48.4 99.5C47.5 99.4 45.7 99.2 45 99.0C43.1 98.6 42.9 98.5 41.2 98.0C40.5 97.7 40.1 97.5 38.7 96.9C38.5 96.8 37.9 96.5 37.4 96.2C36.9 95.9 36.5 95.7 36.4 95.7C35.8 95.7 31.4 91.6 30.1 89.9C29 88.5 28.5 87.8 28.5 87.7C28.5 87.7 28.3 87.3 28 86.8C26.2 83.8 24.7 79.1 24.7 76.3C24.7 75.4 24.5 75.3 23.4 75.3C20.3 75.3 15.3 73.5 11.7 71.0C11.1 70.6 10.6 70.3 10.6 70.3C10.6 70.2 10.2 70 9.9 69.7C7 67.6 4.1 63.7 2.4 59.8C-0.2 54 -0.1 45.6 2.5 40.0C3.3 38.3 3.4 38.1 3.6 37.7C3.8 37.5 4.1 37 4.3 36.6C5.3 34.8 8.5 31.2 10.2 30.0C10.5 29.8 10.8 29.5 10.9 29.5C11.2 29.2 12.7 28.2 14.5 27.3C17 26 21.6 24.7 23.8 24.7C24.6 24.7 24.7 24.6 24.7 23.6C24.7 22.9 24.8 22.3 25.1 20.7C25.5 19.2 25.7 18.5 26 17.7C26 17.6 26.1 17.2 26.2 17.0C27.6 13 31 8.4 34.4 5.8C35 5.4 35.6 4.9 35.7 4.8C37.8 3.2 42.8 1.2 46.6 0.7C50.2 0.1 56.5 0.8 58.7 2.0C58.9 2.1 59 2.2 59.1 2.2C59.3 2.2 62 3.5 63 4.1C63.5 4.4 63.9 4.6 63.9 4.6C64 4.6 64.1 4.7 64.2 4.8C64.4 4.9 64.9 5.3 65.4 5.7C69.4 8.7 73.4 14.4 74.4 18.8C74.4 18.9 74.6 19.5 74.7 20.1C75.1 21.7 75.3 22.9 75.3 23.7C75.3 24.6 75.3 24.7 76.1 24.7C79.6 24.7 87.5 27.6 89.1 29.5C89.2 29.5 89.5 29.8 89.8 30.0C98.6 36.5 102 50 97.5 59.9C96.9 61.3 96.7 61.8 96.3 62.4C96.1 62.8 95.8 63.3 95.6 63.6C94.7 65.2 91.6 68.6 90 69.8C89.7 70 89.4 70.2 89.4 70.3C89.3 70.4 87.3 71.7 86.7 72.1C85.4 72.8 83.5 73.7 82.3 74.1C80.3 74.7 77.7 75.3 76.6 75.3C75.5 75.3 75.3 75.4 75.3 76.3C75.3 77.7 74.6 80.8 74 82.3C74 82.4 73.9 82.8 73.8 83.0C73.4 84.1 72.6 85.8 72 86.8C71.7 87.3 71.5 87.7 71.5 87.7C71.5 87.9 69.5 90.4 68.9 91.1C67.2 92.9 65.1 94.7 63.4 95.7C63 95.9 62.5 96.2 62.3 96.4C61.5 96.8 59.9 97.6 58.8 98.0C56.8 98.7 55.7 98.9 53.5 99.3C52.5 99.5 49.5 99.6 48.4 99.5ZM48.6 96.4C48.6 95.3 48 92.3 47.4 90.7C44.6 82.9 37.9 77.2 29.7 75.7C27.1 75.3 27 75.3 27.3 77.3C29 87.7 36.6 95.3 46.9 96.9C48.6 97.1 48.6 97.1 48.6 96.4ZM52.9 96.9C56.1 96.4 59.2 95.4 61.7 93.8C67.8 90 71.5 84.5 72.7 77.3C73 75.6 72.9 75.5 72.1 75.5C70.4 75.6 67.4 76.3 65.1 77.3C60.1 79.6 55.7 83.7 53.6 88.2C52.9 89.7 52.7 90.2 52.7 90.4C52.7 90.5 52.7 90.6 52.6 90.7C52.2 91.1 51.4 95.2 51.4 96.4C51.4 97.1 51.3 97.1 52.9 96.9ZM50.4 89.3C52.1 84.4 56.7 79 61.4 76.3C62.5 75.7 64.6 74.7 65.4 74.4C66.1 74.2 66 74 65.2 73.7C64.3 73.4 62 72.3 61.3 71.9C61 71.7 60.7 71.5 60.6 71.4C60.3 71.3 58 69.6 56.9 68.6C55.2 67 53 64.3 52.1 62.6C51.6 61.7 51 60.4 50.7 59.9C50.3 58.9 50.3 58.8 50.2 58.5C50.1 58.1 49.8 58.1 49.8 58.5C49.7 58.6 49.7 58.9 49.6 59.0C48.5 61.6 48 62.5 46.7 64.4C44.9 67 41.7 70.1 39.4 71.4C39.1 71.6 38.6 71.9 38.2 72.1C37.3 72.7 35.6 73.5 34.7 73.8C33.9 74.1 33.9 74.2 34.6 74.4C40.3 76.4 45.8 81.4 48.7 87.3C49.3 88.7 49.5 89.1 49.8 89.9C49.9 90.3 50.1 90.1 50.4 89.3ZM24.5 72.1C24.4 69.6 23.1 65.4 21.2 62.2C18.9 58.2 14 54.2 9.4 52.6C9.1 52.5 8.8 52.4 8.6 52.3C8.2 52.1 7.5 52 6.6 51.8C6.1 51.7 5.5 51.6 5.2 51.5C4 51.2 3 51.3 3 51.7C3 52.9 3.9 56.7 4.5 58.2C4.7 58.9 5.5 60.4 5.6 60.7C5.7 60.8 5.9 61.1 6 61.4C8 64.9 12.2 68.9 15.6 70.5C16.9 71 17.2 71.2 17.8 71.4C19.7 72.1 22.5 72.7 24 72.8C24.5 72.8 24.5 72.8 24.5 72.1ZM28.7 72.7C31.9 72.2 34.6 71.3 37.1 69.9C37.4 69.7 37.8 69.4 38.1 69.3C43.5 66.2 48 59 48.6 52.3L48.7 51.4L47.9 51.4C46.4 51.4 43 52.2 41.1 53.0C39 54 38.4 54.3 36.7 55.6C31.7 59 28.4 64.6 27.3 70.9C27 73 27 72.9 28.7 72.7ZM72.8 72.4C72.8 71.4 72.2 68.5 71.7 66.9C69.9 61.4 65.1 55.9 60.2 53.6C57.7 52.5 56.6 52.1 54.4 51.7C51.3 51 51.1 51.1 51.5 53.4C52.5 59.5 55.6 64.6 60.5 68.3C61.2 68.9 61.8 69.3 61.9 69.3C61.9 69.3 62.3 69.5 62.8 69.8C63.6 70.3 63.8 70.4 65.4 71.1C67.2 71.9 70.6 72.7 72.4 72.8C72.8 72.8 72.8 72.8 72.8 72.4ZM77.1 72.7C79.6 72.3 81.6 71.7 83.8 70.7C84.2 70.5 84.6 70.4 84.6 70.4C84.6 70.4 84.9 70.2 85.3 70.0C85.6 69.7 85.9 69.6 85.9 69.6C86 69.6 87.7 68.5 87.8 68.3C87.8 68.3 88.1 68.1 88.3 67.9C89.1 67.4 91.7 64.7 92.5 63.7C93.1 62.8 94.6 60.5 94.6 60.4C94.6 60.3 94.7 59.9 95 59.5C95.2 59 95.4 58.4 95.5 58.2C95.6 57.9 95.7 57.6 95.8 57.4C96.3 56.1 96.7 54.4 97 52.0C97.1 51.3 96.4 51.1 94.8 51.5C94.5 51.6 93.9 51.7 93.4 51.8C92.5 52 91.8 52.1 91.4 52.3C91.2 52.4 90.9 52.5 90.6 52.6C89.2 53.1 87.6 53.9 85.9 55.0C83.4 56.5 80.1 59.8 78.8 62.2C76.8 65.6 75.6 69.5 75.5 72.1C75.5 72.9 75.5 72.9 77.1 72.7ZM26.2 65.3C26.4 64.7 26.7 64 27.3 62.8C29.4 58.4 34.3 53.4 38.6 51.5C39.8 50.9 40.6 50.6 41.2 50.3C42 50 42 49.9 41.1 49.6C40.5 49.4 39.9 49.1 38.6 48.5C33.4 46.1 28.2 40.3 26.2 34.8C25.9 33.8 25.8 33.8 25.5 34.7C24.5 37.8 21.6 42 18.8 44.6C18 45.4 15.5 47.3 15.3 47.3C15.2 47.3 14.9 47.5 14.6 47.7C14.1 48 12.3 48.9 11.3 49.3C11.1 49.4 10.9 49.5 10.7 49.6C10.5 49.7 10.3 49.7 10.1 49.8C10 49.8 9.9 49.9 9.9 49.9C9.9 50.1 10 50.1 10.6 50.4C12.1 51 13.4 51.6 14.3 52.2C14.8 52.4 15.3 52.7 15.5 52.8C15.7 52.9 16 53.1 16.1 53.3C16.3 53.4 16.6 53.6 16.8 53.8C17.4 54.2 17.8 54.5 18.8 55.4C21.7 58 24.3 61.9 25.4 65.1C25.8 66.2 25.9 66.2 26.2 65.3ZM74.6 65.1C75.9 61.2 79.7 56.2 83.2 53.8C83.4 53.6 83.7 53.4 83.9 53.3C84 53.1 84.3 52.9 84.5 52.8C84.7 52.7 85.2 52.4 85.7 52.2C86.6 51.6 87.9 51 89.4 50.4C90 50.1 90.1 50.1 90.1 49.9C90.1 49.9 90 49.8 89.9 49.8C89.7 49.7 89.5 49.7 89.3 49.6C89.1 49.5 88.9 49.4 88.7 49.3C87.8 49 85.9 48 85.6 47.8C85.4 47.7 85 47.5 84.7 47.3C80.7 45.1 76 39.2 74.5 34.7C74.3 34 73.9 33.7 73.9 34.2C73.9 34.9 72.1 38.4 71 40.1C68.7 43.5 64.7 47 61.4 48.5C60.1 49.1 59.5 49.4 58.9 49.6C58 49.9 58 50.1 58.9 50.4C59.3 50.5 60.1 50.9 60.7 51.1C61.2 51.4 61.7 51.6 61.8 51.6C61.9 51.6 64.3 53.2 65.1 53.7C68.1 56 71.4 59.8 72.7 62.8C73.4 64.2 73.7 65 74 65.8C74.1 66.2 74.3 65.9 74.6 65.1ZM5.1 48.5C8.1 48 10.7 47.1 13.7 45.4C19.3 42.2 23.8 35 24.4 28.2C24.5 27 24.4 27 22.7 27.3C20.9 27.7 20.5 27.7 20 27.9C19.6 28 19.2 28.1 19.1 28.1C18.9 28.2 18.6 28.3 18.3 28.4C10.4 31.2 4.4 38.4 3.2 46.5C2.9 48.9 2.8 48.9 5.1 48.5ZM48.6 48.1C48.6 47.6 48.5 46.9 48.2 45.2C48.1 44.5 47.4 42.1 47.2 41.6C45 37 42.6 33.9 39.7 31.8C39.4 31.6 39.1 31.4 38.9 31.2C38.8 31.1 38.5 30.9 38.3 30.8C38 30.7 37.5 30.4 37.2 30.2C36.2 29.6 33.9 28.5 33.7 28.5C33.6 28.5 33.4 28.5 33.3 28.4C32.9 28.1 28.9 27.2 27.7 27.2C27.1 27.2 27.1 27.3 27.3 29.0C28.9 39.1 36.2 46.7 46.3 48.4C48.2 48.8 48.6 48.7 48.6 48.1ZM53.7 48.4C61.7 47.1 68.2 41.8 71.3 34.2C72 32.7 72.8 28.8 72.8 27.6C72.8 27.2 72.8 27.2 72.3 27.2C71.1 27.2 67.1 28.1 66.7 28.4C66.6 28.5 66.4 28.5 66.3 28.5C66.1 28.5 63.8 29.6 62.8 30.2C62.5 30.4 62 30.7 61.7 30.8C61.5 30.9 61.2 31.1 61.1 31.2C60.9 31.4 60.5 31.7 60.1 31.9C56 34.7 52.5 40.8 51.5 46.6C51.1 48.8 51.2 48.9 53.7 48.4ZM97 48.4C97 47.1 96.1 43.2 95.5 41.8C93.8 37.8 91.2 34.2 88.2 32.0C86.5 30.6 84.4 29.5 82.3 28.7C81.7 28.4 81.1 28.2 80.9 28.1C80.8 28.1 80.4 28 80 27.9C79.5 27.7 79.1 27.7 77.3 27.3C75.8 27 75.5 27.1 75.5 27.8C75.5 30.4 76.8 34.4 78.8 37.8C80.2 40.3 83.9 44 86.4 45.4C87.8 46.2 89.8 47.1 91 47.5C94.2 48.6 97 49 97 48.4ZM50.3 41.4C50.3 41.2 50.3 41.1 50.4 40.9C50.5 40.8 50.7 40.3 50.9 39.9C53 35.2 56.8 30.7 60.7 28.5C61 28.2 61.5 28 61.8 27.8C62.2 27.6 62.8 27.3 64.1 26.7C65.2 26.2 65.5 26.1 65.8 26.1C66.2 26.1 66 25.8 65.4 25.6C64.2 25.2 60.9 23.4 59.3 22.3C56.9 20.6 53.7 17.1 52.4 14.9C51.7 13.7 50.7 11.4 50.4 10.7C50.1 9.8 49.9 9.8 49.6 10.7C48.2 14.6 44.3 19.8 41.2 21.9C40.8 22.1 40.4 22.4 40.3 22.6C40.1 22.7 39.8 22.9 39.5 23.1C39.3 23.2 38.8 23.5 38.5 23.7C38.1 23.9 37.4 24.3 36.8 24.6C35.7 25.1 35.3 25.3 34.3 25.7C33.9 25.8 33.8 26.1 34.2 26.1C34.5 26.1 34.9 26.2 36.3 26.9C40.8 28.8 44.9 32.5 47.6 36.9C48.3 38.1 49.7 41.1 49.7 41.4C49.7 41.6 49.8 41.7 49.8 41.8C49.9 41.9 50.3 41.6 50.3 41.4ZM29.5 24.3C31.5 23.9 33.3 23.4 34.9 22.7C36.2 22.1 36.5 21.9 37.3 21.5C38.4 20.8 38.4 20.8 39.4 20.1C40.9 19.1 45.1 14.6 45.1 14.1C45.1 14.1 45.3 13.6 45.6 13.2C45.9 12.7 46.2 12.1 46.4 11.8C46.5 11.6 46.7 11 46.9 10.6C47.1 10.1 47.3 9.7 47.3 9.6C47.3 9.5 47.3 9.4 47.4 9.3C47.8 8.9 48.6 4.8 48.6 3.6C48.6 2.9 48.3 2.8 46.9 3.1C46.5 3.2 45.8 3.3 45.4 3.4C43.6 3.8 42.3 4.2 40.7 5.0C40.1 5.2 39.7 5.4 39.6 5.4C39.6 5.4 39.2 5.7 38.7 6.0C38.2 6.3 37.7 6.5 37.7 6.5C36.7 6.5 31.7 11.7 30.2 14.3C29.7 15.3 29.5 15.6 29 16.8C28.1 18.8 27.2 22.5 27.2 24.1C27.2 24.5 27.6 24.6 29.5 24.3ZM72.8 24.0C72.8 23.6 72.7 22.8 72.4 21.2C72.2 20.2 71.5 17.9 71.1 17.0C70.4 15.5 70.3 15.3 69.8 14.4C69.5 13.9 69.3 13.5 69.3 13.5C69.3 13.5 68.9 12.9 68.4 12.2C65 7.7 59.9 4.5 54.6 3.4C54.2 3.3 53.5 3.2 53.1 3.1C51.7 2.8 51.4 2.9 51.4 3.6C51.4 6.1 53 11.3 54.6 13.6C54.8 13.8 54.9 14 54.9 14.1C54.9 14.1 55.2 14.5 55.5 15.0C57.8 18.1 61.1 20.8 64 22.2C66.5 23.3 68.1 23.8 70.4 24.2C72.3 24.6 72.8 24.5 72.8 24.0Z"/></svg>';
  const WM = '<svg class="mo-wm" viewBox="0 0 208.9 100" aria-hidden="true"><path class="wm-b" fill="currentColor" fill-rule="evenodd" d="M0.8 97.5C0.5 97.2 0.5 1.0 0.8 0.7C1.1 0.5 43.8 0.6 46.3 0.9C56.6 2.2 64.3 5.4 69.3 10.8C72.2 13.8 73.9 17.0 74.6 20.9C75.1 23.6 74.9 28.6 74.1 31.7C72.6 37.4 68.1 41.8 59.2 46.4C58.4 46.8 57.7 47.2 57.7 47.4C57.7 47.5 58.4 47.7 59.9 48.1C65.9 49.5 69.8 51.6 73.3 55.1C77.8 59.6 79.8 64.6 79.8 71.4C79.8 75.6 79.2 78.1 77.5 81.6C75.0 86.7 71.1 90.5 65.6 93.3C60.7 95.8 56.7 96.9 50.9 97.4C47.7 97.7 1.1 97.8 0.8 97.5ZM36.8 90.4C47.5 90.0 54.7 87.3 58.8 82.3C62.1 78.0 63.1 71.9 61.4 65.5C59.2 57.2 52.3 52.2 40.9 50.7C39.2 50.5 17.5 50.4 17.2 50.6C17.1 50.8 17.0 88.7 17.1 89.8C17.2 90.3 17.3 90.4 17.6 90.5C18.1 90.6 33.0 90.6 36.8 90.4ZM42.7 43.9C52.6 41.9 58.2 35.4 58.1 25.9C58.1 15.4 51.3 9.3 37.5 7.5C35.3 7.2 17.7 7.1 17.3 7.3C17.1 7.4 17.1 9.7 17.1 25.7C17.1 43.7 17.1 43.9 17.4 44.1C17.6 44.3 19.2 44.3 29.4 44.2C40.7 44.2 41.2 44.2 42.7 43.9Z"/><path class="wm-i" fill="currentColor" fill-rule="evenodd" d="M89.9 75.0C89.7 74.7 89.7 35.8 89.9 35.4C90.1 35.1 91.5 34.5 97.1 32.2C100.9 30.7 104.2 29.5 104.3 29.5L104.6 29.5L104.7 49.7C104.7 66.1 104.7 69.9 104.5 70.1C104.4 70.1 103.6 70.5 102.6 70.8C101.7 71.2 100.2 71.7 99.2 72.1C95.3 73.5 90.4 75.2 90.2 75.2C90.1 75.2 90.0 75.1 89.9 75.0ZM95.9 17.6C89.9 16.5 86.9 10.0 90.0 4.7C92.6 0.1 99.2 -0.8 103.0 2.9C104.9 4.7 105.7 6.6 105.7 9.2C105.7 11.7 104.9 13.5 103.2 15.2C101.2 17.1 98.4 18.0 95.9 17.6Z"/><path class="wm-j" fill="currentColor" fill-rule="evenodd" d="M102.1 99.2C98.9 98.9 94.6 97.5 91.2 95.5C88.5 93.9 85.6 91.6 85.6 91.0C85.6 90.7 86.1 90.3 88.1 88.8C89.4 87.8 91.4 86.4 92.4 85.7C94.8 83.9 94.7 83.9 95.5 85.2C98.9 90.3 102.6 92.8 107.6 93.5C113.2 94.2 116.0 91.8 116.9 85.3C117.1 84.0 117.2 80.3 117.2 58.6C117.2 38.6 117.2 33.3 117.3 33.1C117.5 32.9 130.9 27.5 131.6 27.3C131.9 27.3 132.0 27.3 132.0 27.6C132.2 28.3 132.0 69.7 131.8 71.9C130.7 86.2 126.2 94.3 117.7 97.5C116.2 98.0 114.1 98.5 111.4 98.9C109.8 99.1 103.7 99.3 102.1 99.2ZM123.0 17.5C120.5 17.0 118.1 15.2 116.9 12.8C115.2 9.2 116.3 4.6 119.5 2.3C124.2 -1.0 130.3 0.7 132.6 6.1C133.0 7.0 133.0 7.2 133.1 9.0C133.1 10.6 133.0 11.1 132.7 11.9C131.4 15.9 127.2 18.3 123.0 17.5Z"/><path class="wm-a" fill="currentColor" fill-rule="evenodd" d="M159.3 99.2C152.2 98.5 147.1 95.1 144.3 89.2C141.9 84.3 141.8 77.5 144.0 72.5C147.6 64.2 157.6 57.7 174.3 52.7C177.9 51.6 177.1 51.8 184.4 49.9C185.8 49.6 186.9 49.2 187.0 49.1C187.2 48.8 187.0 40.7 186.7 38.6C185.9 31.6 183.5 28.1 178.6 26.8C176.8 26.3 172.9 26.3 171.1 26.8C165.2 28.4 160.7 33.7 159.4 40.7C159.1 41.9 159.7 41.8 152.3 41.8C144.8 41.8 145.5 41.9 145.7 40.3C146.7 34.3 151.6 28.5 158.7 25.1C164.0 22.5 169.7 21.3 176.5 21.4C190.4 21.4 198.5 25.4 201.0 33.7C202.0 37.0 202.0 34.9 202.1 63.3C202.1 91.7 202.1 89.5 203.0 91.6C203.7 93.2 205.3 95.1 207.1 96.4C208.2 97.2 208.4 97.4 208.3 97.5C208.2 97.6 205.0 97.7 201.1 97.7L193.9 97.7L193.0 97.1C189.7 95.1 187.6 92.1 187.1 88.7C187.0 87.7 186.7 87.8 184.6 89.5C183.6 90.3 182.2 91.4 181.5 92.0C176.0 96.4 170.1 98.8 164.3 99.2C163.5 99.2 162.5 99.3 162.0 99.3C161.6 99.4 160.4 99.3 159.3 99.2ZM171.7 90.0C173.9 89.7 177.0 88.6 179.2 87.3C181.4 86.1 185.5 83.2 186.7 82.1L187.1 81.8L187.1 68.2C187.1 57.2 187.1 54.6 186.9 54.4C186.7 54.3 186.2 54.4 183.7 55.3C173.5 58.8 165.0 63.7 161.1 68.3C158.1 71.7 157.0 74.7 157.5 78.3C157.9 81.5 159.1 84.0 161.6 86.5C164.5 89.5 167.5 90.5 171.7 90.0Z"/></svg>';
  function splash() {
    if (M.splash?.isConnected) return;
    // drawn the way the mark was made: a guide circle and axes, four equal circles, the Kawung, then Bija with the i and j meeting
    const s = D.createElement('div'); s.className = 'mo-splash mo-build'; s.setAttribute('aria-hidden', 'true');
    const C = [[50, 25], [75, 50], [50, 75], [25, 50]].map(([x, y]) => `<circle class="mo-c" cx="${x}" cy="${y}" r="25"/>`).join('');
    s.innerHTML = `<div class="mo-lk"><div class="mo-con"><svg class="mo-cs" viewBox="-14 -14 128 128"><g transform="translate(50 50) scale(.978) translate(-50 -50)"><circle class="mo-g" cx="50" cy="50" r="50"/><path class="mo-ax" d="M-10 50H110M50 -10V110"/>${C}</g></svg>${KW}</div>${WM}<p class="mo-cap"><span>Four circles. One seed.</span><span>A place to meet.</span></p></div>`;
    D.body.appendChild(s); M.splash = s; H.classList.remove('mo-boot');
    const end = () => { if (!s.isConnected || s.classList.contains('out')) return; s.classList.add('out'); setTimeout(() => s.remove(), 400); };
    addEventListener('pointerdown', end, { once: true, capture: true }); setTimeout(end, 3000);
  }
// the header logo plays on hover (computers) or tap (phones); each time the ij picks one of four motions
(() => {
  const go = (lg) => { if (!lg || lg.classList.contains('lg-play')) return; lg.dataset.ij = String(2 + Math.floor(Math.random() * 4)); lg.classList.add('lg-play'); setTimeout(() => lg.classList.remove('lg-play'), 1500); };
  document.addEventListener('pointerover', (e) => { if (e.pointerType === 'mouse') { const lg = e.target.closest && e.target.closest('.top .logo'); if (lg && !lg.contains(e.relatedTarget)) go(lg); } }, { passive: true });
  document.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') go(e.target.closest && e.target.closest('.top .logo')); }, { passive: true });
})();
  if (!ss.get('mo.splash') && !calm()) splash();
  { let away = 0; D.addEventListener('visibilitychange', () => {
    if (D.hidden) { away = Date.now(); return; }
    if (away && Date.now() - away > 2 * 60e3 && !calm() && !ss.get('mo.splash') && !D.body.classList.contains('barista-view')) splash();
  }); }

  // ---- hold or drag along the bar: a glass lens lifts over the tab under the finger, magnifies it and follows; let go to open that tab ----
  (() => {
    let lens = null, tm = 0, on = false, down = null, cur = null, eat = 0, lx = 0;
    const tabs = () => [...$$('.bnav button.side'), $('.bnav .fab')].filter(Boolean);
    const box = (t) => (t.classList.contains('fab') ? t.parentElement : t).getBoundingClientRect(); // Order: the button and its label
    const under = (x) => tabs().reduce((a, t) => { const r = box(t), d = Math.abs(x - (r.left + r.width / 2)); return !a || d < a.d ? { t, d } : a; }, null)?.t;
    function place(x) {
      lx = x;
      const side = $('.bnav button.side'), bar = $('.bnav'); if (!side || !bar || !lens) return;
      const s = side.getBoundingClientRect(), b = bar.getBoundingClientRect(), w = s.width + 8;
      const l = Math.max(b.left - 4, Math.min(b.right - w + 4, x - w / 2));
      lens.style.width = w + 'px'; lens.style.height = s.height + 8 + 'px';
      lens.style.transform = `translate(${l - b.left - bar.clientLeft}px, ${s.top - 4 - b.top - bar.clientTop}px)`;
      const t = under(x);
      if (t !== cur) { cur?.classList.remove('mo-mag'); if (cur) vib(5); cur = t; }
      t?.classList.add('mo-mag'); // the bar re-renders its tabs, so the class is put back on every move
    }
    function start(x) {
      on = true; clearTimeout(tm);
      lens = D.createElement('div'); lens.className = 'mo-lens'; lens.setAttribute('aria-hidden', 'true'); lens.innerHTML = '<i></i>';
      lens.style.transition = 'none'; $('.bnav').prepend(lens); $('.bnav').classList.add('lensing'); place(x); lens.getBoundingClientRect(); lens.style.transition = ''; lens.classList.add('on'); vib(8);
    }
    function stop(open) {
      clearTimeout(tm); down = null; if (!on) return; on = false;
      const t = under(lx); $$('.bnav .mo-mag').forEach((x) => x.classList.remove('mo-mag')); cur = null;
      const l = lens; lens = null; l.classList.remove('on'); setTimeout(() => l.remove(), 220); $('.bnav')?.classList.remove('lensing');
      if (open && t) { eat = Date.now(); t.click(); }
    }
    addEventListener('pointerdown', (e) => {
      if (calm() || !e.isPrimary || e.button > 0 || !e.target.closest?.('.bnav button.side')) return;
      down = { x: e.clientX, y: e.clientY }; tm = setTimeout(() => down && start(down.x), 260);
    }, { passive: true });
    addEventListener('pointermove', (e) => {
      if (!down || !e.isPrimary) return;
      if (on) return place(e.clientX);
      if (Math.abs(e.clientX - down.x) > 8) start(e.clientX); else if (Math.abs(e.clientY - down.y) > 14) stop(false);
    }, { passive: true });
    addEventListener('pointerup', (e) => { if (e.isPrimary) stop(true); });
    addEventListener('pointercancel', () => stop(false));
    // the lens opened the tab itself: swallow the browser's own click that follows the lift
    addEventListener('click', (e) => { if (e.isTrusted && Date.now() - eat < 450) { e.preventDefault(); e.stopImmediatePropagation(); eat = 0; } }, true);
    addEventListener('contextmenu', (e) => { if (e.target.closest?.('.bnav')) e.preventDefault(); });
  })();

  H.classList.remove('mo-boot'); // no splash this time (already seen, or calm): lift the first-frame cover
  // ---- the signature: added items arc into the centre button, which catches them and counts ----
  const fab = () => $('.bnav .fab');
  const real = () => { const c = $('.bnav .fab .cnt'); return c && !c.hidden ? (+c.textContent || 0) : 0; };
  let shown = null, tk = null;
  function badge() {
    const f = fab(); if (!f) return null;
    let b = f.querySelector('.mo-cnt');
    if (!b) { b = D.createElement('span'); b.className = 'mo-cnt'; b.setAttribute('aria-hidden', 'true'); b.hidden = true; f.appendChild(b); f.classList.add('mo'); shown = null; }
    return b;
  }
  function show(v) {
    const b = badge(); if (!b) return;
    const was = shown; shown = v;
    if (!v) { if (!b.hidden) { const a = anim(b, [{ transform: 'scale(1)' }, { transform: 'scale(0)' }], { duration: 200 }); a ? a.finished.then(() => { if (!shown) b.hidden = true; }) : (b.hidden = true); } return; }
    if (b.hidden || !was) { b.hidden = false; b.innerHTML = `<i>${v}</i>`; anim(b, [{ transform: 'scale(0)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 380, easing: 'cubic-bezier(.3,1.4,.5,1)' }) || anim(b, [{ opacity: 0 }, { opacity: 1 }], { duration: 200 }); return; }
    if (calm()) { b.innerHTML = `<i>${v}</i>`; return; }
    const up = v > was; b.innerHTML = `<i class="mo-o">${was}</i><i>${v}</i>`;
    const [o, n] = b.children;
    o.animate([{ transform: 'none', opacity: 1 }, { transform: `translateY(${up ? -100 : 100}%)`, opacity: 0 }], { duration: 160, fill: 'forwards' }).finished.then(() => o.remove());
    n.animate([{ transform: `translateY(${up ? 100 : -100}%)` }, { transform: 'none' }], { duration: 180, easing: 'cubic-bezier(.2,.7,.2,1)' });
  }
  function tickTo(t) {
    clearInterval(tk); if (shown == null) shown = 0;
    if (calm() || Math.abs(t - shown) > 12) return show(t);
    const step = () => { if (shown === t) return clearInterval(tk); show(shown + Math.sign(t - shown)); };
    step(); if (shown !== t) tk = setInterval(step, 95);
  }
  M.sync = () => { if (!M.flying) tickTo(real()); };
  function caught() {
    const f = fab(); if (!f) return;
    if (!f.classList.contains('holding')) {
      anim(f, [{ transform: 'scale(1)' }, { transform: 'scale(.88)', offset: .3 }, { transform: 'scale(1.08)', offset: .65 }, { transform: 'scale(1)' }], { duration: 420, easing: 'ease-out', composite: 'add' });
      anim(f.querySelector('svg'), [{ transform: 'rotate(0)' }, { transform: 'rotate(90deg)' }], { duration: 460, easing: 'cubic-bezier(.3,1.4,.5,1)' });
      const r = D.createElement('span'); r.className = 'mo-ring'; f.appendChild(r);
      (anim(r, [{ transform: 'scale(1)', opacity: .7 }, { transform: 'scale(1.7)', opacity: 0 }], { duration: 520, easing: 'ease-out' })?.finished || Promise.resolve()).then(() => r.remove());
    }
    vib(12); tickTo(real());
  }
  let lastImg = null;
  // only the tapped item's own photo: never borrow a neighbouring tile's picture (no photo of one drink on another)
  const imgNear = (el) => { const tile = el && el.closest && el.closest('.prod, .ptile, article, li, .again, .offer, .slide'); const im = tile && tile.querySelector('img'); return im && im.currentSrc ? im : null; };
  M.fly = (from) => {
    const f = fab(); if (!f || !from || !from.getBoundingClientRect) return false;
    if (calm()) { M.sync(); return true; }
    const a = from.getBoundingClientRect(), z = f.getBoundingClientRect();
    if (!a.width && !a.height) return false;
    const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2, x2 = z.left + z.width / 2, y2 = z.top + z.height / 2;
    const x1 = (x0 + x2) / 2, y1 = Math.min(y0, y2) - Math.max(120, Math.abs(y2 - y0) * .45);
    const el = D.createElement('div'); el.className = 'mo-fly';
    if (lastImg) el.style.backgroundImage = `url("${lastImg.replace(/"/g, '%22')}")`; else el.innerHTML = MARK;
    D.body.appendChild(el); M.flying++;
    const fr = [], N = 14;
    for (let i = 0; i <= N; i++) {
      const t = i / N, e = t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2, u = 1 - e;
      const x = u * u * x0 + 2 * u * e * x1 + e * e * x2, y = u * u * y0 + 2 * u * e * y1 + e * e * y2;
      const sx = i === 1 ? 1.18 : t > .3 && t < .7 ? .92 : 1, sy = i === 1 ? .82 : t > .3 && t < .7 ? 1.12 : 1, sc = i === 0 ? 1 : i === 1 ? 1.12 : 1.1 - t * .75;
      fr.push({ transform: `translate(${x}px,${y}px) scale(${sx * sc},${sy * sc})`, opacity: t > .92 ? .4 : 1, offset: t });
    }
    let done = false;
    const land = () => { if (done) return; done = true; el.remove(); M.flying = Math.max(0, M.flying - 1); caught(); };
    el.animate(fr, { duration: 640, easing: 'linear' }).finished.then(land, land);
    setTimeout(land, 1400);
    return true;
  };
  // adds the app doesn't fly itself (beans, reorder) fly from the button that was pressed
  const own = { shopadd: 1, reorder: 1 }; let pend = null;
  D.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-act]'); if (!b) return;
    const act = b.dataset.act;
    if (['qty', 'sheet', 'kadd', 'shopadd', 'reorder'].includes(act)) { const im = imgNear(b); lastImg = im ? im.currentSrc : null; }
    if (own[act]) { const r = b.getBoundingClientRect(); pend = { getBoundingClientRect: () => r }; }
    if (act === 'place' && shown > 0 && !calm()) placed();
    selBefore(b);
  }, true);
  D.addEventListener('click', (e) => { if (pend) { const p = pend; pend = null; requestAnimationFrame(() => M.fly(p)); } selAfter(); });
  function placed() {
    const f = fab(), b = f && f.querySelector('.mo-cnt'); if (!b) return;
    const z = f.getBoundingClientRect(), c = D.createElement('div'); c.className = 'mo-cuppop';
    c.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 16h24v14a10 10 0 0 1-10 10h-4a10 10 0 0 1-10-10z" fill="#0b0b0b"/><path d="M34 20h3a5 5 0 0 1 0 10h-3" fill="none" stroke="#0b0b0b" stroke-width="3"/><path d="M18 6c-3 3 3 5 0 8M26 6c-3 3 3 5 0 8" fill="none" stroke="#0b0b0b" stroke-width="2.5" stroke-linecap="round"/></svg>';
    c.style.left = z.left + z.width / 2 + 'px'; c.style.top = z.top - 30 + 'px'; D.body.appendChild(c);
    anim(b, [{ transform: 'translate(0,0) scale(1)' }, { transform: 'translate(-18px,-30px) scale(0)' }], { duration: 300, fill: 'forwards' });
    c.animate([{ transform: 'translateY(20px) scale(0)', opacity: 0 }, { transform: 'translateY(-6px) scale(1.15)', opacity: 1, offset: .35 }, { transform: 'translateY(-10px) scale(1)', opacity: 1, offset: .75 }, { transform: 'translateY(-30px) scale(.9)', opacity: 0 }], { duration: 1100, easing: 'ease-out' }).finished.then(() => c.remove());
  }

  // ---- selection: a black pill slides from the old choice to the new one ----
  let sel = null;
  const pressed = (b) => { const k = b.dataset.k, id = b.dataset.id, act = b.dataset.act; return $$(`[data-act="${act}"]`).find((x) => (k == null || x.dataset.k === k) && (id == null || x.dataset.id === id) && (x.getAttribute('aria-pressed') === 'true' || x.classList.contains('on'))); };
  function selBefore(b) { sel = null; if (calm() || !['cat', 'sopt', 'opt', 'pplan', 'smethod'].includes(b.dataset.act)) return; const o = pressed(b); if (o && o !== b) sel = { act: b.dataset.act, k: b.dataset.k, id: b.dataset.id, v: b.dataset.v, r: o.getBoundingClientRect(), rad: getComputedStyle(o).borderRadius }; }
  function selAfter() {
    if (!sel) return; const s = sel; sel = null;
    requestAnimationFrame(() => {
      const n = $$(`[data-act="${s.act}"]`).find((x) => x.dataset.v === s.v && (s.k == null || x.dataset.k === s.k) && (s.id == null || x.dataset.id === s.id)); if (!n) return;
      const r = n.getBoundingClientRect(), g = D.createElement('div'); g.className = 'mo-ghost';
      Object.assign(g.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', borderRadius: s.rad });
      n.classList.add('mo-tgt'); D.body.appendChild(g);
      g.animate([{ transform: `translate(${s.r.left - r.left}px,${s.r.top - r.top}px) scale(${s.r.width / r.width},${s.r.height / r.height})` }, { transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.3,1.2,.5,1)' }).finished.then(() => { g.remove(); n.classList.remove('mo-tgt'); });
    });
  }

  // ---- tabs: View Transitions where supported ----
  // the transition overlay never eats taps: it ignores pointer events (CSS), and any new press finishes it at once
  // a navigation still waiting inside the transition runs straight away, so a newer tap can never be overridden by an older one
  let vt = false, vtNow = null, vtPend = null;
  const flush = () => { if (vtPend) { const f = vtPend; vtPend = null; f(); } if (vtNow) { try { vtNow.skipTransition(); } catch {} } };
  // mid-transition the browser hit-tests the press to <html>; the click then lands on <html> too, so replay it on what's under the finger now
  let refire = null;
  addEventListener('pointerdown', (e) => { refire = null; if (!vtNow && !vtPend) return; flush(); if (e.target === H || e.target === D.body) refire = { x: e.clientX, y: e.clientY }; }, true);
  addEventListener('click', (e) => {
    if (!refire || !e.isTrusted) return; const r = refire; refire = null;
    if (e.target !== H && e.target !== D.body) return;
    const el = D.elementFromPoint(r.x, r.y); if (!el || el === H || el === D.body) return;
    e.stopPropagation(); e.preventDefault();
    const ev = new MouseEvent('click', { bubbles: true, cancelable: true, clientX: r.x, clientY: r.y }); ev.moVT = true; el.dispatchEvent(ev);
  }, true);
  D.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') flush(); }, true);
  const RANK = { home: 0, beans: .5, more: .5, gifts: .5, secret: .5, stories: .5, visit: .5, community: .5, events: .5, club: .5, order: 1, orders: 1.5, card: 2, me: 2.5 };
  const here = () => { if ($('#hav[aria-current=page]')) return 'me'; const c = $('.bnav [aria-current=page]'); return c ? c.dataset.v : $('.bnav .fab-l.on') ? 'order' : (location.hash || '#home').slice(1); };
  D.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-act=tab],[data-act=fab],[data-act=favmenu],[data-act=goto-checkout],[data-act=showcard]');
    if (!b || e.moVT || !D.startViewTransition || calm()) return;
    // every screen change slides the same calm way; the direction follows the bottom bar (Home, Order, Profile)
    const act = b.dataset.act, from = here(), to = act === 'tab' ? b.dataset.v : act === 'showcard' ? 'card' : 'order';
    if (to === from || (act === 'fab' && from === 'order')) return; // same screen: the button scrolls or bursts, nothing to transition
    if (vt) { flush(); return; }
    e.stopPropagation(); e.preventDefault(); vt = true;
    H.dataset.moDir = b.classList.contains('back') || (RANK[to] ?? 1) < (RANK[from] ?? 1) ? 'back' : 'fwd'; H.classList.add('mo-vt');
    const nav = () => { const ev = new MouseEvent('click', { bubbles: true, cancelable: true }); ev.moVT = true; b.dispatchEvent(ev); };
    vtPend = nav;
    const t = D.startViewTransition(() => { if (vtPend === nav) { vtPend = null; nav(); } });
    vtNow = t;
    const off = () => { vt = false; vtNow = null; if (vtPend) flush(); $('#main')?.classList.remove('enter'); H.classList.remove('mo-vt'); delete H.dataset.moDir; };
    t.finished.then(off, off); setTimeout(off, 1200);
  }, true);

  // ---- sheet: the tile photo morphs into the sheet header ----
  let sheetFrom = null;
  D.addEventListener('pointerdown', (e) => { const b = e.target.closest && e.target.closest('[data-act=sheet]'); const im = b && imgNear(b); sheetFrom = im ? { src: im.currentSrc, r: im.getBoundingClientRect() } : null; }, true);
  function sheetThumb() {
    const p = $('#sheet:not([hidden]) .pan'); if (!p || !sheetFrom || p.querySelector('.mo-sthumb')) return;
    const f = sheetFrom; sheetFrom = null;
    const t = D.createElement('img'); t.className = 'mo-sthumb'; t.alt = ''; t.src = f.src; const h = p.querySelector('h3'); if (!h) return;
    h.parentElement.prepend(t);
    if (calm()) return;
    setTimeout(() => { const r = t.getBoundingClientRect(); t.animate([{ transform: `translate(${f.r.left - r.left}px,${f.r.top - r.top}px) scale(${f.r.width / r.width})`, borderRadius: '0' }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.3,1.2,.5,1)' }); }, 30);
  }

  // ---- after every render: tracking cup, card stamps/points/tier, nav dots, steppers, deal tilt, rise-in ----
  const LV = { received: .3, brewing: .66, ready: 1 }, seenStatus = new Map();
  const cupSVG = '<svg viewBox="0 0 64 64" aria-hidden="true"><g class="steam" fill="none" stroke="#0b0b0b" stroke-width="2" stroke-linecap="round"><path d="M24 14c-3 3 3 5 0 8"/><path d="M32 12c-3 3 3 5 0 8"/><path d="M40 14c-3 3 3 5 0 8"/></g><clipPath id="mo-cc"><path d="M14 26h34v16a12 12 0 0 1-12 12h-10a12 12 0 0 1-12-12z"/></clipPath><rect class="fill" clip-path="url(#mo-cc)" x="14" y="26" width="34" height="28" fill="#0b0b0b"/><path d="M14 26h34v16a12 12 0 0 1-12 12h-10a12 12 0 0 1-12-12z" fill="none" stroke="#0b0b0b" stroke-width="2.5"/><path d="M48 30h3a6 6 0 0 1 0 12h-4" fill="none" stroke="#0b0b0b" stroke-width="2.5"/></svg>';
  function cups() {
    $$('[data-live-order], #main .hero .track').forEach((n) => {
      const host = n.matches('[data-live-order]') ? n : n.parentElement;
      let s = host.dataset.status; if (!s) { const on = n.querySelectorAll('span.on').length; s = ['', 'received', 'brewing', 'ready'][on] || 'received'; }
      const key = (host.querySelector('.big-code, .code, [data-order]')?.textContent || 'live').trim();
      let w = host.querySelector('.mo-cupw');
      const prev = seenStatus.get(key);
      if (!w) { w = D.createElement('div'); w.className = 'mo-cupw still'; w.innerHTML = cupSVG; const t = host.matches('[data-live-order]') ? host.firstElementChild : n; (t || host).before ? (t === host.firstElementChild ? host.prepend(w) : n.before(w)) : host.prepend(w); w.dataset.s = prev || s; w.getBoundingClientRect(); }
      if (w.dataset.s !== s) { w.classList.remove('still'); requestAnimationFrame(() => (w.dataset.s = s)); }
      if (prev && prev !== s && s === 'ready') { petals(w); host.classList.remove('mo-pulse'); void host.offsetWidth; host.classList.add('mo-pulse'); vib(20); }
      seenStatus.set(key, s);
    });
  }
  function petals(at) {
    if (calm()) return; const r = at.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (let i = 0; i < 12; i++) {
      const p = D.createElement('i'); p.className = 'mo-petal' + (i % 2 ? ' w' : ''); p.style.left = cx + 'px'; p.style.top = cy + 'px'; D.body.appendChild(p);
      const a = (i / 12) * Math.PI * 2, d = 50 + (i % 3) * 18, deg = (a * 180) / Math.PI + 90;
      p.animate([{ transform: `rotate(${deg}deg) scale(.2)`, opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px) rotate(${deg}deg) scale(1)`, opacity: 0 }], { duration: 850, easing: 'cubic-bezier(.2,.7,.2,1)' }).finished.then(() => p.remove());
    }
  }
  const TIERS = ['seed', 'sprout', 'tree'], TNAME = { sprout: 'Sprout', tree: 'Kopi Tree' };
  function toastMo(t) { const o = D.createElement('div'); o.className = 'mo-toast'; o.setAttribute('role', 'status'); o.textContent = t; D.body.appendChild(o); (anim(o, [{ opacity: 0, transform: 'translate(-50%,-12px)' }, { opacity: 1, transform: 'translate(-50%,0)' }], { duration: 260 }) || {}); setTimeout(() => o.remove(), 2600); }
  function card() {
    const c = $('[data-card-stage] .bcard, .face .bcard, .hc .bcard'); if (!c) return;
    const b = c.querySelector('.pts b[data-to]'), pts = b ? +b.dataset.to : null, op = +ss.get('mo.pts');
    if (pts != null) { if (ss.get('mo.pts') != null && pts > op && !calm()) { const s = D.createElement('span'); s.className = 'mo-stamp'; c.appendChild(s); s.animate([{ transform: 'scale(1.6) rotate(-12deg)', opacity: 0 }, { transform: 'scale(1) rotate(-12deg)', opacity: .5, offset: .35 }, { transform: 'scale(1.3)', opacity: 0 }], { duration: 700, easing: 'ease-out' }).finished.then(() => s.remove()); } ss.set('mo.pts', pts); }
    const tier = TIERS.find((t) => c.classList.contains('tier-' + t)), ot = ss.get('mo.tier');
    if (tier) { if (ot && TIERS.indexOf(tier) > TIERS.indexOf(ot)) { c.classList.add('mo-foil'); setTimeout(() => c.classList.remove('mo-foil'), 1500); toastMo(`Welcome to ${TNAME[tier]}`); vib([10, 40, 10]); } ss.set('mo.tier', tier); }
    const st = c.dataset.stamps != null ? +c.dataset.stamps : null, os = ss.get('mo.stamps');
    if (st != null) {
      if (os != null && st > +os) {
        const n = c.querySelector('.st.new') || c.querySelectorAll('.st.on')[st - 1];
        if (n) { n.classList.add('mo-press'); if (!calm()) setTimeout(() => { const r = D.createElement('span'); r.className = 'mo-ink'; const nr = n.getBoundingClientRect(), cr = c.getBoundingClientRect(); Object.assign(r.style, { left: nr.left - cr.left + 'px', top: nr.top - cr.top + 'px', width: nr.width + 'px', height: nr.height + 'px' }); c.appendChild(r); r.animate([{ transform: 'scale(1)', opacity: .6 }, { transform: 'scale(1.8)', opacity: 0 }], { duration: 500 }).finished.then(() => r.remove()); vib(12); }, 270); }
        if (st >= 10) { const free = c.querySelector('.st.free, .st:last-of-type'); if (free) setTimeout(() => free.classList.add('mo-coin'), 450); toastMo('Your next drink is on us'); }
      }
      ss.set('mo.stamps', st);
    }
  }
  const dots = new Set();
  function navDots() { const now = new Set(); $$('.bnav .side').forEach((s) => { const d = s.querySelector('.dot'); if (!d) return; const k = s.dataset.v; now.add(k); if (!dots.has(k)) d.classList.add('mo-pop'); }); dots.clear(); now.forEach((k) => dots.add(k)); }
  const steps = new Map();
  function steppers() { $$('.step output').forEach((o) => { const k = o.closest('[data-id]')?.dataset.id || (o.closest('.sheet') ? 'sheet' : o.parentElement.querySelector('[data-id]')?.dataset.id || ''); const v = +o.textContent, p = steps.get(k); if (p != null && p !== v && !calm()) { o.classList.add('mo-roll'); if (v < p) o.classList.add('dn'); } steps.set(k, v); }); }
  function deal() { $$('.sc.deal:not(.mo-deal)').forEach((s) => { s.style.setProperty('--mo-tilt', (Math.random() * 6 - 3).toFixed(1) + 'deg'); s.classList.add('mo-deal'); }); }
  const seen = new Set(); let io = null;
  function rise() {
    if (calm() || !('IntersectionObserver' in W)) return;
    io ||= new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { const t = e.target; t.classList.add('mo-in'); t.classList.remove('mo-pre'); io.unobserve(t); } }), { rootMargin: '0px 0px -8% 0px' });
    $$('#main .menu > *, #main .ptiles > *, #main section, #main .offer, #main .panel').forEach((el, i) => {
      if (el.dataset.moSeen) return; el.dataset.moSeen = 1;
      const key = (el.className + '|' + el.textContent.slice(0, 60)).replace(/\s+/g, ' ');
      if (seen.has(key)) return; seen.add(key);
      if (el.getBoundingClientRect().top < innerHeight) return;
      el.classList.add('mo-pre'); el.style.transitionDelay = (i % 4) * 60 + 'ms'; io.observe(el);
    });
  }
  let q = false;
  const after = () => { if (q) return; q = true; requestAnimationFrame(() => { q = false; try { badge(); if (!M.flying && real() !== shown) tickTo(real()); cups(); card(); navDots(); steppers(); deal(); rise(); sheetThumb(); drawer(); } catch (e) { /* motion must never break the app */ } }); };
  new MutationObserver(after).observe(D.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-status', 'data-stamps', 'hidden'] });
  addEventListener('beforeprint', () => $$('.mo-pre').forEach((e) => e.classList.remove('mo-pre')));

  // ---- header condenses; hero photos drift slightly ----
  let sq = false;
  addEventListener('scroll', () => { if (sq) return; sq = true; requestAnimationFrame(() => { sq = false; H.classList.toggle('mo-scrolled', scrollY > 24); if (calm()) return; $$('#main .promos .slide img').slice(0, 6).forEach((im) => { const r = im.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; im.style.transform = `translateY(${((r.top + r.height / 2 - innerHeight / 2) * -0.05).toFixed(1)}px) scale(1.08)`; }); }); }, { passive: true });

  // ---- Bija Card lift: drag up into a full-screen scan view (tap-to-flip and "Show code" stay as the non-gesture route) ----
  let drag = null, scan = null;
  D.addEventListener('pointerdown', (e) => {
    if (scan || e.button > 0) return;
    const st = e.target.closest && e.target.closest('[data-card-stage], #main .flip'); if (!st) return;
    drag = { st, y0: e.clientY, t0: performance.now(), dy: 0, on: false, id: e.pointerId };
  });
  D.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dy = e.clientY - drag.y0;
    if (!drag.on) { if (dy > -8) return; drag.on = true; drag.st.classList.add('mo-lift'); $$('#main > *, #main > * > *').forEach((x) => { if (!x.contains(drag.st) && !drag.st.contains(x) && x.parentElement && x.parentElement.contains(drag.st)) x.classList.add('mo-back', 'mo-recede'); }); }
    drag.dy = dy; if (calm()) return;
    const lift = dy < 0 ? -Math.pow(-dy, .82) : dy * .2;
    drag.st.style.transform = `translateY(${lift}px) scale(${Math.min(1.04, 1 + -dy / 2500)})`;
  });
  const endDrag = (e) => {
    if (!drag || (e && e.pointerId !== drag.id)) return; const d = drag; drag = null; if (!d.on) return;
    const v = d.dy / Math.max(1, performance.now() - d.t0);
    const eat = (c) => { c.stopPropagation(); c.preventDefault(); };
    D.addEventListener('click', eat, { capture: true, once: true }); setTimeout(() => D.removeEventListener('click', eat, true), 350);
    if (d.dy < -80 || v < -0.6) openScan(d.st); else springBack(d.st);
  };
  D.addEventListener('pointerup', endDrag); D.addEventListener('pointercancel', endDrag);
  function springBack(st) { st.classList.add('mo-springback'); st.style.transform = ''; $$('.mo-recede').forEach((x) => x.classList.remove('mo-recede')); setTimeout(() => { st.classList.remove('mo-springback', 'mo-lift'); $$('.mo-back').forEach((x) => x.classList.remove('mo-back')); }, 460); }
  function openScan(st) {
    const c = st.querySelector('.bcard'), qr = st.querySelector('.back svg') || $('#main .flip .back svg');
    const code = (st.querySelector('.back .code')?.textContent || (c?.textContent.match(/BIJA-[A-Z0-9]+/) || [''])[0]).trim();
    const o = D.createElement('div'); o.className = 'mo-scan'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-label', 'Your member code');
    o.innerHTML = `<button class="mo-x" type="button">Close</button><div class="mo-card"></div><div class="mo-qr"></div><div class="mo-code"></div><p class="mo-hint">Turn your screen brightness up, then show this at the till.</p>`;
    if (c) { const k = c.cloneNode(true); k.removeAttribute('id'); o.querySelector('.mo-card').appendChild(k); }
    if (qr) o.querySelector('.mo-qr').appendChild(qr.cloneNode(true)); else o.querySelector('.mo-qr').hidden = true;
    o.querySelector('.mo-code').textContent = code;
    D.body.appendChild(o); scan = { o, st };
    const from = st.getBoundingClientRect();
    st.style.transform = ''; st.classList.remove('mo-lift');
    if (calm()) anim(o, [{ opacity: 0 }, { opacity: 1 }], { duration: 1 }) || (o.style.opacity = 1);
    else {
      o.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
      const k = o.querySelector('.mo-card'), r = k.getBoundingClientRect();
      k.animate([{ transform: `translate(${from.left - r.left}px,${from.top - r.top}px) scale(${from.width / Math.max(1, r.width)})` }, { transform: 'none' }], { duration: 480, easing: 'cubic-bezier(.3,1.25,.5,1)' });
      o.querySelector('.mo-qr').animate([{ transform: 'perspective(700px) rotateY(90deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 420, delay: 160, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
    }
    vib(10); o.querySelector('.mo-x').focus();
    o.querySelector('.mo-x').addEventListener('click', closeScan);
    let y0 = null; o.addEventListener('pointerdown', (e) => (y0 = e.clientY)); o.addEventListener('pointerup', (e) => { if (y0 != null && e.clientY - y0 > 80) closeScan(); y0 = null; });
  }
  function closeScan() {
    if (!scan) return; const { o, st } = scan; scan = null;
    $$('.mo-recede').forEach((x) => x.classList.remove('mo-recede'));
    const fin = () => { o.remove(); $$('.mo-back').forEach((x) => x.classList.remove('mo-back')); (st.isConnected ? st : $('[data-card-stage], #main .flip'))?.focus?.({ preventScroll: true }); };
    const a = anim(o, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(40px)' }], { duration: 260, easing: 'ease-in' });
    a ? a.finished.then(fin) : fin();
  }
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && scan) { e.stopPropagation(); closeScan(); } }, true);
  // ---- stamp drawer: springs in from the right, profile shifts left, stamps pop one by one, swipe right to close ----
  let drw = null;
  function drawer() {
    const d = $('[data-stamp-drawer]'); const open = d && !d.hidden && getComputedStyle(d).display !== 'none';
    if (!open) { if (drw) { $('#main')?.classList.remove('mo-under'); drw = null; } return; }
    if (drw === d) return; drw = d;
    const pan = d.querySelector('[data-drawer-panel], .pan, .panel') || d, bg = d.querySelector('[data-drawer-bg], .bg');
    // the page behind stays exactly where it is; only the panel and a light veil move
    if (calm()) { anim(d, [{ opacity: 0 }, { opacity: 1 }], { duration: 1 }); return; }
    pan.animate([{ transform: 'translateX(100%)' }, { transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.22,1,.36,1)' });
    bg && bg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: 'ease-out' });
    $$('.st.on', d).forEach((x, i) => x.animate([{ transform: 'scale(0) rotate(-20deg)', opacity: 0 }, { transform: 'scale(1.15) rotate(-12deg)', opacity: 1, offset: .7 }, { transform: 'rotate(-12deg)' }], { duration: 380, delay: 220 + i * 40, easing: 'ease-out', fill: 'backwards' }));
    let x0 = null, dx = 0;
    pan.addEventListener('pointerdown', (e) => { x0 = e.clientX; dx = 0; pan.style.transition = 'none'; });
    pan.addEventListener('pointermove', (e) => { if (x0 == null) return; dx = Math.max(0, e.clientX - x0); if (dx > 4) pan.style.transform = `translateX(${dx}px)`; });
    const up = () => { if (x0 == null) return; x0 = null; pan.style.transition = 'transform .35s cubic-bezier(.3,1.15,.5,1)'; if (dx > 80) { pan.style.transform = 'translateX(100%)'; setTimeout(() => (d.querySelector('[data-act*=close], [data-close], .close, [aria-label=Close]') || bg)?.click(), 200); } else pan.style.transform = ''; };
    pan.addEventListener('pointerup', up); pan.addEventListener('pointercancel', up);
  }
  M.openScan = (st) => openScan(st || $('[data-card-stage], #main .flip'));
  M.closeScan = closeScan;
  after();
})();
