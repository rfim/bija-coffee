# Bija native apps (Capacitor)

The Bija app (`app.html`) wrapped as real Android and iOS apps with [Capacitor](https://capacitorjs.com) 8.5.3. The website and the PWA keep working as before; this folder adds the store builds.

**Download now (Android test build):** https://github.com/rfim/bija-coffee/releases/download/android-latest/bija-android.apk
Built automatically by GitHub Actions on every push to `main` (see "Builds on GitHub" below).

## What's in it

| Path | What it is |
|---|---|
| `capacitor.config.ts` | App id `uk.co.bijalondon.app` (placeholder: Bija confirms), name "Bija", white splash and status bar, `https://app.bijalondon.co.uk` as the in-app origin so the app uses the live Supabase backend. |
| `scripts/build-www.mjs` | Copies the site into `www/` (without docs, tests, marketing, labels) and makes `index.html` open `app.html?view=app`. Works from this workspace (`../site`) and from the GitHub repo (site files at the root). Then runs `cap sync`. |
| `scripts/make-assets.mjs` | Renders the app icon (white Bija mark on black) and splash screens (black mark on white; reversed in dark mode) from the Bija mark, then generates every Android and iOS size. |
| `android/` | Android Studio project. Deep links: `https://rfim.github.io/bija-coffee/trace.html` (Bean passport QR codes) and `app.html` open the app. Camera, notification and vibration permissions. ML Kit "Google code scanner" for QR. |
| `ios/` | Xcode project (CocoaPods, because the ML Kit scanner is only published as a pod). UK English camera prompt. `App/App.entitlements` holds Associated Domains and push as placeholders. |
| `github-workflows/` | Workflows to copy into the repo's `.github/workflows/`: `android-apk.yml` (APK + release) and `ios-simulator.yml` (proves iOS compiles). |
| `../site/native-bridge.js` | Loaded by `app.html`. Does nothing in a browser. Inside the native app it adds haptics, the native share sheet, the native QR scanner, push registration, the Android back button, deep links, the status bar and the splash. |

### Plugins (exact versions)

`@capacitor/core`, `android`, `ios`, `cli` 8.5.3 · `app` 8.1.2 · `haptics` 8.0.2 · `share` 8.0.3 · `status-bar` 8.0.4 · `splash-screen` 8.0.2 · `push-notifications` 8.1.3 · `preferences` 8.0.1 · `network` 8.0.1 · `@capacitor-mlkit/barcode-scanning` 8.2.1 · dev: `@capacitor/assets` 3.0.5, `typescript` 5.6.3.

### For the app code: `window.BijaNative`

Only defined inside the native app, so always feature-check:

```js
if (window.BijaNative) {
  const url = await BijaNative.scan();        // native QR scanner; resolves with the code's text, rejects if cancelled
  BijaNative.haptic('light');                 // 'light' | 'medium' | 'heavy' | 'select' | 'success' | 'warning' | 'error'
  await BijaNative.share({ title, text, url });
  const { ok, token } = await BijaNative.push.register(); // asks permission; call after an order, never on launch
  BijaNative.push.onToken((token) => { /* save to Supabase */ });
}
```

`navigator.vibrate` and `navigator.share` are also routed to the native versions automatically, so existing app code works unchanged.

## Build it yourself

Prerequisites: Node 22, and
- **Android:** Android Studio (Ladybug or newer) with SDK 36 and JDK 21.
- **iOS:** a Mac with Xcode 16+ and CocoaPods (`sudo gem install cocoapods`).

```bash
cd native
npm ci
npm run sync           # copy the site into www/ and update both native projects
npx cap open android   # build and run from Android Studio
npx cap open ios       # build and run from Xcode
node scripts/make-assets.mjs   # only if the icon or splash changes
```

Command-line Android build: `cd android && ./gradlew assembleDebug` → `app/build/outputs/apk/debug/app-debug.apk`.

## Builds on GitHub

Copy `github-workflows/*.yml` to `.github/workflows/` in the repo.

- **Android APK** (`android-apk.yml`): on every push to `main` that touches the app or this folder, and on demand. Builds a debug APK, uploads it as a workflow artifact and republishes the `android-latest` release, so the download link above always points at the newest build. Each build gets a higher version code, so it installs over the previous one.
- **iOS simulator** (`ios-simulator.yml`): runs `pod install` and `xcodebuild -sdk iphonesimulator` on a Mac runner to prove the iOS app compiles. It does not produce something you can install on an iPhone.

### Installing the Android test build

It's a debug build, signed with a throwaway debug key, so it can only be sideloaded:
1. Open the download link on the Android phone.
2. Android asks to allow installs from your browser: allow it for this install only.
3. Open the APK and tap Install.

Play Protect may warn that the app is from an unknown developer. That's expected for test builds.

## Store releases

### Google Play
1. Bija creates a Google Play developer account ($25 one-off; identity checks take a few days).
2. Create an upload key once and keep it safe:
   `keytool -genkeypair -v -keystore bija-release.jks -alias bija -keyalg RSA -keysize 2048 -validity 10000`
3. Add repo secrets: `ANDROID_KEYSTORE_BASE64` (`base64 -w0 bija-release.jks`), `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`, `ANDROID_STORE_PASSWORD`. The workflow then also builds a signed `app-release.aab` (artifact) for Play.
4. In Play Console: create the app, turn on Play App Signing, fill in the listing and data safety form (drafts in `site/docs/app-store/play-listing.md`), upload the `.aab` to internal testing, then a closed test (new personal accounts need 12 testers for 14 days) and production.
5. Put the Play signing certificate's SHA-256 into `site/.well-known/assetlinks.json` so Bean passport links open the app directly.

### Apple App Store
1. Bija enrols in the Apple Developer Program ($99 a year, roughly £79) as an organisation (needs a D-U-N-S number).
2. On a Mac: `npx cap open ios`, set the Team under Signing & Capabilities, add the `App.entitlements` capabilities (Associated Domains, Push Notifications), set the bundle id, then Product → Archive → upload to App Store Connect.
3. Test with TestFlight first (installing on real iPhones needs this or a registered device), then submit for review.
4. Apple guideline 4.2 ("minimum functionality") rejects apps that only wrap a website. This build uses native features Apple looks for: the native camera scanner, haptics, the native share sheet, push notifications and offline loading. See `site/docs/app-store/ios.md` for the full risk note.
5. Add an `apple-app-site-association` file on the domain for universal links.

### Push notifications (later)
Order-ready push needs Firebase Cloud Messaging (Android: add `google-services.json` to `android/app/`; the build picks it up automatically) and an APNs key (iOS). Store both as Supabase secrets and send from a Supabase Edge Function; the plan is in `site/docs/app-store/push.md`. The app already asks for the token through `BijaNative.push.register()`.

## What Bija needs to supply

- Final app id (bundle id), for example `uk.co.bijalondon.app`, before the first store upload (it can't change afterwards).
- Google Play developer account ($25) and Apple Developer Program membership ($99 a year).
- Privacy policy URL on Bija's own domain (`privacy.html` content), support URL and email.
- App Store and Play screenshots (shot list in `play-listing.md`), and age rating answers.
- Firebase project (Android push) and APNs key (iOS push), when push is switched on.

## Known limits of this sandbox build

- The Android build could not run here: the Android SDK and Google's Maven (`dl.google.com`) are blocked in this environment, so Gradle can't resolve `com.google.gms:google-services` or the Android Gradle plugin. The GitHub workflow builds it on a normal runner instead.
- iOS needs a Mac (`npx cap doctor`: "Xcode is not installed" here). The iOS project was generated, but `pod install` and the Xcode build run on the macOS workflow.
