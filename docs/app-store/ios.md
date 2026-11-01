# iPhone: App Store options

## The short answer

Ship Bija on iPhone as an installable web app now (Add to Home Screen, see `install.html`), and don't submit a wrapped web app to the App Store yet. Revisit a native or hybrid app once Bija has real payments and push notifications working and a reason that only an App Store app can serve.

## Options

| Option | What it is | Effort | App Store risk |
|---|---|---|---|
| 1. Home-screen web app (recommended now) | The current PWA, installed from Safari. Full screen, own icon, works offline, Web Push on iOS 16.4+ when installed. | Done | None (not in the store) |
| 2. Thin wrapper (WKWebView shell, e.g. PWABuilder iOS or Capacitor pointing at the website) | Same web app inside a native shell | Low | High: Apple guideline 4.2 (Minimum Functionality) and 4.2.2 reject apps that are "repackaged websites" |
| 3. Hybrid with native features (Capacitor + native plugins) | Web UI plus native Wallet pass, native push, Sign in with Apple, haptics, camera | Medium | Medium: acceptable if native features add real value beyond the website |
| 4. Fully native (SwiftUI) | Rewrite the customer app | High | Low |

## Guideline 4.2 risk in detail

Apple's App Review Guideline 4.2 says an app "should include features, content, and UI that elevate it beyond a repackaged website". Ordering cafés that pass review typically add native value such as:

- Apple Wallet pass for the loyalty card (PassKit), updating stamp counts live.
- Native push for "your order is ready".
- Apple Pay for in-app ordering of physical goods (allowed outside In-App Purchase, guideline 3.1.3(e)).
- Location-aware "you're nearby, order now" using a geofence (only with clear consent).

A plain WKWebView of `app.html` would very likely be rejected under 4.2. Gift cards sold in-app for use at a physical café are physical-goods-adjacent and are generally allowed outside In-App Purchase, but confirm at submission.

## What iPhone users get today without the store

- Installed from Safari: full-screen app with the Bija icon, splash and offline Bija Card.
- Web Push for order-ready alerts on iOS 16.4+ (only once installed to the home screen; see `push.md`).
- Camera QR scanning: iOS Safari has no BarcodeDetector, so the app sends people to the Camera app, which opens the Bean passport directly.

## Recommendation and trigger to revisit

Stay on option 1. Move to option 3 (Capacitor) when Bija wants an Apple Wallet loyalty pass or Apple Pay in-app; build the Wallet pass first, since it is the native feature customers notice most and the strongest answer to guideline 4.2.
