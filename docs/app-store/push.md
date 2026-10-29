# Order-ready push notifications: plan

Plan only: no keys are created and nothing is deployed. It uses the Supabase project **bija** (ref `nvsampchuozqbtavuugx`, region eu-west-2 London).

## What customers get

- "Your Kopi Susu Aren is ready at the bar · BPD3" when staff mark an order Ready.
- Optional later: "Your Beans Club bag ships tomorrow" (Beans Club reminder), only if the customer opted in for that topic.
- Nothing promotional through push. Marketing stays in the opt-in email.

## Where it works

| Platform | Support |
|---|---|
| Android, Chrome or the Play Store app (TWA) | Web Push, works in the browser and installed |
| iPhone/iPad, iOS and iPadOS 16.4+ | Web Push **only when Bija is installed to the home screen** (not in a Safari tab). The permission prompt must come from a tap. |
| Desktop Chrome, Edge, Firefox, Safari 16+ | Web Push |
| Older iOS | No push: the live order tracker in the app and the bar call-out stay the fallback |

## Flow

1. After placing an order, the order confirmation shows a quiet "Tell me when it's ready" button. Never ask on page load. On iOS, show the button only when `navigator.standalone` or `display-mode: standalone` is true; otherwise link to `install.html`.
2. Tap: `Notification.requestPermission()`, then `registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: <VAPID public key> })`.
3. Save the subscription (endpoint, p256dh, auth keys) to Supabase table `push_subscriptions` with `user_id = auth.uid()`, `topics = ['order_ready']`, `created_at`, `last_used_at`.
4. When staff set an order's status to `ready` (a write to `bar/{uid}`), a database trigger calls the Edge Function `notify-order-ready` (via `pg_net` or a Database Webhook) with the customer uid, order code and first item name.
5. The Edge Function loads that user's subscriptions, signs with the VAPID private key, sends the Web Push payload, deletes subscriptions that return 404 or 410, and updates `last_used_at`.
6. The service worker shows the notification. Tapping it opens or focuses the app on the order tracker.

## Supabase pieces

### Table and policies (migration)

```sql
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  topics text[] not null default array['order_ready'],
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);
alter table public.push_subscriptions enable row level security;
create policy "own subscriptions: read" on public.push_subscriptions for select using (user_id = auth.uid());
create policy "own subscriptions: add" on public.push_subscriptions for insert with check (user_id = auth.uid());
create policy "own subscriptions: remove" on public.push_subscriptions for delete using (user_id = auth.uid());
-- No update policy; the Edge Function uses the service role to update last_used_at and prune dead endpoints.
```

### Secrets (Supabase dashboard, Edge Functions, Secrets; never in the repo)

- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`: generate once with `npx web-push generate-vapid-keys` on a trusted machine.
- `VAPID_SUBJECT`: `mailto:info@bijalondon.co.uk`.
- The public key also goes into the app (it is public by design) as `BIJA_VAPID_PUBLIC_KEY`.

### Edge Function `notify-order-ready` (Deno, outline)

- Accepts only calls signed with the database webhook secret (`WEBHOOK_SECRET` header check).
- Input: `{ uid, code, item }`. Looks up `push_subscriptions` for `uid` where `'order_ready' = any(topics)`.
- Payload JSON (keep it small, under 2 KB): `{ "title": "Your order is ready", "body": "Kopi Susu Aren is waiting at the bar · BPD3", "tag": "order-BPD3", "url": "/bija-coffee/app.html?view=app#orders" }`.
- Sends with a Web Push library for Deno (e.g. `jsr:@negrel/webpush` or `npm:web-push`), TTL 900 seconds (a ready drink after 15 minutes isn't useful), urgency `high`.
- On HTTP 404 or 410 from the push service: delete that subscription.

### Trigger

Fire only on the transition to `ready` (old status not ready, new status ready), so re-saves don't re-notify. Throttle to one push per order.

## Service worker code to paste into `sw.js`

Add this at the end of `sw.js`, then bump `CACHE`:

```js
// Order-ready alerts (Web Push). The payload comes from the notify-order-ready Edge Function.
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { body: e.data && e.data.text() }; }
  const title = d.title || 'Bija';
  e.waitUntil(self.registration.showNotification(title, {
    body: d.body || 'Your order is ready at the bar.',
    tag: d.tag || 'bija-order',
    renotify: true,
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png',
    data: { url: d.url || 'app.html?view=app#orders' },
  }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const target = new URL((e.notification.data && e.notification.data.url) || 'app.html?view=app#orders', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    for (const c of list) {
      if (new URL(c.url).pathname.endsWith('/app.html') && 'focus' in c) { c.navigate(target); return c.focus(); }
    }
    return self.clients.openWindow(target);
  }));
});
self.addEventListener('pushsubscriptionchange', (e) => {
  // The push service rotated the subscription: tell open app windows to re-subscribe and save the new one.
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then((list) => list.forEach((c) => c.postMessage({ type: 'bija:resubscribe' }))));
});
```

Notes:
- A monochrome badge icon (white mark on transparent, 96 × 96) would look better on Android than `icon-192.png`. Add `icons/badge-96.png` later.
- `c.navigate()` only works for windows this service worker controls; falling through to `openWindow` covers the rest.

## Privacy and compliance

- Add a "Notifications" line to `privacy.html`: what we send (order ready, and Beans Club reminders if chosen), what we store (the push endpoint and keys, linked to your Bija Card), how to turn it off (phone settings, or "Stop alerts" in Profile, which deletes the subscription), lawful basis: consent.
- PECR: push messages about an order you placed are service messages, not marketing. Never send offers by push without separate opt-in consent.
- Retention: delete subscriptions not used for 6 months.

## Test plan

1. Android Chrome: subscribe, mark the order Ready from the barista view, notification arrives, tapping opens the tracker.
2. iPhone (iOS 17+): install to the home screen, subscribe from the confirmation, lock the phone, mark Ready, notification arrives.
3. Revoke permission in settings and check the Edge Function prunes the 410 endpoint.
4. Re-saving an order already Ready sends nothing.
