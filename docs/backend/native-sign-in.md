# Sign-in: email, Google and Apple (web and the installed apps)

The app is ready for all three. What is missing is configuration that only Bija can do, because it needs Bija's own accounts.

## 1. Switch Supabase on (needed for everything, including email)

Supabase dashboard, project **bija**, **Authentication**:

1. **Sign In / Providers**: turn on **Allow anonymous sign-ins** and **Allow manual linking**.
   Until anonymous sign-ins are on, the app cannot reach Supabase at all and keeps everything on the phone. That is why no activation email arrives today: nothing reaches Supabase (it has 0 users).
2. **Sign In / Providers → Email**: keep **Confirm email** on, so every new account gets an activation email.
3. **URL Configuration**: Site URL `https://rfim.github.io/bija-coffee/`; add `https://rfim.github.io/bija-coffee/app.html` to Redirect URLs.

## 2. Send real emails (activation and password reset)

Supabase's built-in sender only delivers to people on Bija's Supabase team, about 2 emails an hour. Customers need Bija's own sender:

1. Create an account with an email service (for example Resend, Postmark or Amazon SES) and verify the domain Bija sends from, e.g. `bijalondon.co.uk` (SPF and DKIM records).
2. Supabase → **Authentication → Emails → SMTP Settings**: turn on **Custom SMTP**, enter the service's host, port, user and password, sender `hello@bijalondon.co.uk`, name `Bija Coffee`.
3. **Authentication → Emails → Templates**: edit "Confirm signup" and "Reset password" into Bija's voice (British English).
4. **Rate limits**: raise the email limit to suit the shop (e.g. 100 an hour).

## 3. Google

1. Google Cloud Console → new project "Bija" → **OAuth consent screen** (External; app name Bija; support email; logo; privacy policy `https://rfim.github.io/bija-coffee/privacy.html`) → publish.
2. **Credentials → Create OAuth client ID**, three times:
   - **Web application**: JavaScript origin `https://rfim.github.io`; redirect URI `https://nvsampchuozqbtavuugx.supabase.co/auth/v1/callback`. This one goes into Supabase and is the app's `googleWebClientId`.
   - **Android**: package `uk.co.bijalondon.app` and the SHA-1 fingerprint of the signing key (Play Console → App integrity, or `keytool -list -v` on the upload key).
   - **iOS**: bundle ID `uk.co.bijalondon.app`. This is the app's `googleIosClientId`.
3. Supabase → **Sign In / Providers → Google**: turn on; paste the **Web** client ID and secret; under **Authorized Client IDs** add the Android and iOS client IDs too; turn on **Skip nonce check** (Google's iPhone sign-in sets its own nonce).
4. In `native-bridge.js`, fill `OAUTH.googleWebClientId` and `OAUTH.googleIosClientId`.
5. iPhone only: add the iOS client's **reversed client ID** (e.g. `com.googleusercontent.apps.123-abc`) as a URL scheme in `native/ios/App/App/Info.plist` (URL Types).

## 4. Apple (Apple Developer account, $99 a year)

1. Certificates, IDs & Profiles → **Identifiers**: open the App ID `uk.co.bijalondon.app`, tick **Sign in with Apple**.
2. Create a **Services ID** (e.g. `uk.co.bijalondon.web`), tick Sign in with Apple, configure: domain `nvsampchuozqbtavuugx.supabase.co`, return URL `https://nvsampchuozqbtavuugx.supabase.co/auth/v1/callback`. This is for the website and Android.
3. **Keys**: create a key with Sign in with Apple; download the `.p8`; note the Key ID and Team ID.
4. Supabase → **Sign In / Providers → Apple**: turn on; Client IDs `uk.co.bijalondon.web,uk.co.bijalondon.app`; Secret Key generated from the `.p8` (Supabase links a generator). The secret expires every 6 months: put a renewal in the calendar.
5. Xcode: Signing & Capabilities → add `native/ios/App/App/App.entitlements` (it already lists Sign in with Apple) once the team is set.

## How the app uses them

| Where | Google | Apple | Email |
|---|---|---|---|
| Website | Google page, back to the app | Apple page, back to the app | Email and password |
| Android app | Google's own account picker (native) | Apple web page (Apple has no Android SDK) | Email and password |
| iPhone app | Google's own sheet (native) | Apple's own sheet with Face ID (native) | Email and password |

A guest who signs up with **email** keeps their Bija Card and points (the email is added to the guest's own account). The native Google and Apple sign-in starts a fresh session; a guest's points from before are not carried over yet (that needs a newer Supabase library with token-based linking, a small follow-up).

Until the steps above are done, the buttons say plainly that the option isn't switched on yet.
