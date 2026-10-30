# Order-ready notifications: how they work and how to switch them on

Built and deployed, but off until the owner adds three secrets. Until then the app never offers notifications.

## What customers see

- After placing an order in the app: "Get a notification when it's ready · Notify me".
- In Profile, Settings: "Order-ready alerts · Turn on / Turn off".
- When staff mark the order Ready: "Your order is ready · Your Kopi Susu Aren is ready at the bar · Order BPD3". Tapping it opens the app at the Bija Card and live order.
- iPhone and iPad: only when Bija is added to the Home Screen (iOS 16.4 or later). In a Safari tab the option doesn't appear.
- Android and desktop browsers: works in the browser or installed.
- The in-browser demo never shows it.

## How it's built

- **No new tables.** A customer's device subscription is saved in their own record (`customers/{uid}.push`), which only they can write.
- **`send-push` Edge Function** (deployed, JWT required):
  - `GET /functions/v1/send-push/status` returns `{ configured: false }` until the secrets exist, then `{ configured: true, publicKey }`.
  - `POST /functions/v1/send-push` with `{ order_id }`. Called by the staff app right after an order is marked Ready on the live backend. It checks the order is ready, claims the send by writing `bar/{uid}.pushed[order_id]` (only staff can write `bar/*`, so a customer can't trigger it, and a second Ready sends nothing), then sends to the customer's devices with a 15-minute expiry and high urgency. Devices that have gone (404/410) are listed in `bar/{uid}.pushDead`.
- **Route chosen:** the app calls the function after `set_order_status('ready')` succeeds. The database route (`pg_net` trigger) wasn't used because `pg_net` isn't enabled on the project.
- **`push.js`** in the app handles permission (only after a tap), subscribing and saving. **`sw.js`** shows the notification and opens the app when tapped. Inside the native app, `BijaNative.push` is used instead.

## Switch it on (owner, once)

1. On a trusted computer, run `npx web-push generate-vapid-keys`. Keep the private key secret.
2. In the Supabase dashboard, open the **bija** project, then **Edge Functions → Secrets**, and add:
   - `VAPID_PUBLIC_KEY`: the public key
   - `VAPID_PRIVATE_KEY`: the private key
   - `VAPID_SUBJECT`: `mailto:info@bijalondon.co.uk` (to confirm)
3. Reload the app on a phone, place an order, tap **Notify me**, then mark it Ready from the staff view.

To switch it off again, delete the secrets. To change keys, existing subscriptions stop working and customers turn alerts on again.

## Privacy

Order-ready alerts are service messages about an order the customer placed, sent only after they turn them on (consent). Never send offers by push without a separate opt-in. The privacy notice needs a "Notifications" line before launch.
