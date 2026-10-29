# Order-ready alerts: what ships now, and the plan for real push

Owner: Mobile App team · Sprint 2 · Status: plan, needs a decision from Bija (see the end)

## What ships in Sprint 2 (no server needed)

When the barista taps **Ready · call code**, the customer's app reacts **while it is open**, in the foreground or in a background tab:

| Signal | How | Notes |
|---|---|---|
| Banner | A green banner at the top of the page with the order code and a **Got it** button. `role="alert"`, so screen readers announce it straight away. | Black on `#8fbf7f`, about 10:1 contrast. It's in the page flow (it doesn't cover the header) and stays stuck to the top while you scroll. It clears itself when the order is collected. |
| Vibration | `navigator.vibrate([250, 120, 250, 120, 500])` | Android Chrome and Firefox only. iOS Safari has no Vibration API, so iPhones get no buzz. |
| Tab title | `Ready: B7XK · Bija`, flashing with `●` while the tab is hidden | Restored when the banner is dismissed or the order is collected. |
| Chime | Three short notes made with Web Audio, no audio file | Only after the user has tapped or pressed a key on the page (browser autoplay rules, and good manners). If they haven't touched the page, they still get the banner, title and buzz. |
| System notification (opt-in) | On the order confirmation there's an **Alert me on this device** button, which asks for notification permission. If the app is in the background when the order turns Ready, it shows a notification through the service worker registration. | It only works while the page is still alive. It is **not** push. On iPhone, notifications only work in an installed PWA (iOS 16.4+, added to the Home Screen). |

Repeat alerts are suppressed. An order you dismissed stays dismissed for the browser session. If you open the app when an order is already Ready, it shows a quiet banner with no buzz or sound.

Demo: open `app.html?view=app` in one tab (switch to Barista) and `app.html?view=app&as=sam` in another (Customer). Place an order as Sam, then mark it Ready from the first tab.

### Limits of the open-app approach
- If the customer has closed the app, or the phone has suspended the tab (iOS does this within seconds of locking), nothing arrives. That is the common case when someone walks around St James's waiting for their order.
- The fix is Web Push, which needs a server to hold subscriptions and send messages. We haven't faked it.

## Plan: real Web Push

### How it works
1. **Ask at the right moment.** Only after an order is placed, with our own button first ("Tell me when it's ready"), then the browser prompt. Never on first launch. Declining is remembered and we don't ask again for 30 days.
2. **Subscribe.** `registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: VAPID_PUBLIC_KEY })` returns an endpoint and keys. The app saves this to `pushSubs/{uid}/{deviceId}` (customer-writable, readable only by the server).
3. **Send.** When the bar writes `status: 'ready'` to `bar/{uid}`, a server function (database trigger or a small endpoint the Barista view calls) sends a Web Push message signed with the VAPID private key to each of that member's subscriptions. The payload holds only the order code: `{ "t": "ready", "code": "B7XK", "oid": "..." }`.
4. **Show.** `sw.js` gets `push` and `notificationclick` handlers. On push it shows "Your Bija order is ready · B7XK". On click it focuses an open Bija window or opens `app.html#orders`. **`sw.js` is outside the Mobile team's file. Whoever owns it needs to add these two handlers.**
5. **Tidy up.** Delete a subscription when the push service returns 404 or 410, and on sign-out.

### Platform support (current public docs)
- Android Chrome, Edge, Firefox and desktop browsers support Web Push.
- iPhone and iPad support Web Push from iOS 16.4, **only for web apps added to the Home Screen**. In Safari tabs it doesn't work. The app already shows an "Add to Home Screen" prompt on iOS. We should mention alerts in that prompt.

### Server options (pick one)
| Option | What it is | Cost for one café |
|---|---|---|
| Supabase Edge Function + `web-push` library | Database webhook on `bar` updates calls a function that sends the push | Free tier is likely enough (a few hundred pushes a day) |
| Firebase Cloud Messaging | Google's push relay, wraps Web Push | Free. Adds a Google SDK, so update the privacy notice |
| Small Node service (Fly.io, Render) | `web-push` npm package plus a webhook | About £0–5 a month |

The VAPID private key lives only on the server, as an environment secret. It must never be in `app.html` or the repo.

### Privacy and UK GDPR
- A push subscription is personal data tied to a device. Add it to the privacy notice: purpose (order status only), lawful basis (contract: telling you your order is ready), retention (deleted 90 days after last use or on sign-out).
- Send no marketing through this channel unless Bija gets separate opt-in consent (PECR). Order alerts and offers are two separate switches.
- The payload contains no name or order contents.

### Testing
- Playwright: grant `notifications` permission and assert that `showNotification` is called after a mocked push event.
- Manual: one Android phone (Chrome) and one iPhone with the app installed on the Home Screen (iOS 17+), with the phone locked and the app closed.

### Estimate
About 2–3 days: subscription UI and storage (0.5), server function and keys (1), `sw.js` handlers (0.5), privacy text and testing on devices (1).

## Decisions needed from Bija
1. Which backend should host the push sender (Supabase, Firebase or a small Node service)?
2. Are order-status alerts only (recommended) OK for launch, with marketing pushes later behind a separate consent?
3. Who owns `sw.js` for the push and click handlers?
