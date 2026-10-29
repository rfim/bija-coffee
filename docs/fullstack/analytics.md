# Analytics plan

For: Bija app (`app.html`) and website (`index.html`) · Written: 29 Oct 2026 · Owner: Full stack & Finance team

## What we want to learn

1. **Is the app worth it?** How many people open it, order, and come back.
2. **What sells in the app?** Which drinks get added, which get ordered, at what time.
3. **Does loyalty work?** How often rewards are redeemed and how many orders use them.
4. **Do gift cards and referrals bring new customers?**
5. **Where do people drop off?** App open → add to order → place order → collected.

We already have most of the *money* answers inside the app (Barista → Insights and Finance). Analytics adds the *behaviour* between them (opens, drop-off, returning visitors), which the database cannot see.

## Tool choice: Plausible Analytics (recommended)

| | Plausible | Umami | Fathom | Google Analytics 4 |
|---|---|---|---|---|
| Cookies or device storage | None | None | None | Yes (cookies) |
| Consent banner needed (UK PECR) | No | No | No | **Yes** |
| Personal data stored | No (IP and user agent are hashed with a daily rotating salt, then discarded) | No | No | Yes (pseudonymous IDs) |
| Custom events with properties | Yes | Yes | Yes | Yes |
| Funnels and revenue | Yes (funnels and revenue goals on paid plans) | Basic | Basic | Yes |
| Data hosted | EU (Germany) | EU cloud or self-host | EU isolation option | US/global |
| Cost | Paid monthly plan by page views *(check current price on plausible.io/#pricing)* | Free tier on Umami Cloud, or free self-hosted | Paid *(check)* | Free |
| Open source | Yes | Yes | No | No |

**Why Plausible:** no cookies and nothing stored on the device, so no consent banner, which fits the README's "no tracking cookies" promise; EU hosting (the UK treats the EU as adequate, so no transfer paperwork beyond the DPA); custom events, funnels and revenue in pounds; and it is simple for an owner to read on a phone. **Umami Cloud's free tier** is a good alternative if cost matters more than funnels. **We do not recommend Google Analytics 4**: it sets cookies, needs a consent banner and sends data to the US.

Prices could not be checked from our environment on 29 Oct 2026; check the vendor page before subscribing.

### UK GDPR and PECR

- **PECR** (the cookie rules) applies to storing or reading anything on the user's device, including localStorage. Plausible stores nothing, so PECR consent is not triggered. The only thing `bija-analytics.js` stores is the opt-out choice itself, which is strictly necessary to honour it.
- **UK GDPR:** Plausible processes IP addresses briefly to count unique visitors. Our lawful basis is **legitimate interests** (understanding how the app is used to improve it), with low impact because nothing identifies a person. Do a short legitimate interests assessment (the ICO has a template) and keep it on file.
- **Sign Plausible's Data Processing Agreement** (available in account settings) and list Plausible as a processor in `privacy.html`.
- **Never send personal data in events.** No user IDs, names, emails, member codes, gift card codes, order codes, notes, ratings text or birth months. `bija-analytics.js` enforces this with an allow-list of property names and a value pattern that rejects long or unusual text.
- **Respect opt-outs:** the wrapper does nothing if the browser sends Global Privacy Control or Do Not Track, or if the user turned analytics off in the app.
- Data retention: Plausible keeps aggregate stats only. Say so in the privacy notice.

Suggested privacy notice wording (for the Mobile team or whoever owns `privacy.html`, to agree with Bija):

> **Analytics.** We use Plausible Analytics to count visits and app actions (for example "order placed") so we can improve the app. It does not use cookies, does not store anything on your device and does not collect personal data; your IP address is used only to count unique visitors for the day and is not stored. Plausible Insights OÜ (EU) processes this for us under a data processing agreement. Our lawful basis is legitimate interests. You can turn it off in the app (Card → Privacy) or with your browser's Global Privacy Control setting.

## Event list

Names use Plausible's "Title Case" convention. **Where:** C = fire in the customer view, B = fire in the Barista view (staff device). Properties are short codes or bands only.

| Event | When it fires | Where | Properties (allowed values) | Answers |
|---|---|---|---|---|
| *(page view)* | Plausible counts automatically on load | C | — | Visitors, returning visitors, devices, referrers |
| `App Open` | App starts, or comes back to the foreground after 30+ minutes | C | `mode`: `standalone` (installed) / `browser`; `tab`: start tab | Installed vs browser use; daily active users |
| `Add To Order` | Item added to basket (`sadd`, `kadd`, `qty +` on beans, reorder) | C | `item`: menu id (e.g. `flatwhite`); `cat`: menu category; `from`: `menu` / `usual` / `reorder` / `beans` | What people want; which add buttons work |
| `Place Order` | `placeOrder()` succeeds | C | `items`: count; `slot`: `ASAP` / `later`; `reward`: `yes`/`no`; `gift`: `yes`/`no`; **revenue**: order total in GBP | Conversion; app revenue; loyalty and gift card use |
| `Order Collected` | Barista taps *Collected* | B | `wait`: `0-5 min` / `5-10 min` / `10-20 min` / `20+ min` (placed → collected) | Speed of service; orders abandoned (placed − collected − cancelled) |
| `Reward Redeemed` | Barista taps *Collected* on an order with a reward | B | `reward`: `cake` / `drink` / `beans` | Real reward cost; which rewards matter |
| `Gift Card Bought` | Customer saves a gift card (`gbuy`) | C | `amount`: band (`£20-50` etc.); `design`: theme id | Gift demand |
| `Gift Card Paid` | Barista taps *Paid · activate card* | B | `amount`: band | Gift cards actually sold (revenue comes from the till) |
| `Gift Card Redeemed` | `step`: `claimed` when a customer adds a code (C), `confirmed` when the barista confirms it (B) | C, B | `step` | How many gift cards bring someone into the app |
| `Referral Shared` | Customer taps a "Share Bija" button *(not built yet)* | C | `channel`: `share` / `copy` | Word of mouth |
| `Referral Joined` | App opened from a referral link (`?ref=friend`) and the visitor places a first order | C | — | New customers from referrals |
| `Secret Check In` *(optional)* | Secret St James's check-in | C | `spot`: spot id | Which spots engage people |
| `App Installed` *(optional)* | `appinstalled` browser event | C | — | Install rate |

**Goals and funnel to set up in Plausible:** add each event above as a *custom event goal*; set `Place Order` as a *revenue goal* in GBP; create a funnel **App Open → Add To Order → Place Order**. `Order Collected` is fired on the staff device, so compare it with `Place Order` in a separate view rather than as a funnel step.

**Referrals:** there is no referral feature in the app yet. When one is built, the share link should be `https://<app domain>/app.html?ref=friend&utm_source=referral`, with no user ID in it. Rewarding the referrer needs a server-side record (or a staff step), not analytics; analytics only counts it.

**Don't double-count staff.** Do not send page views or `App Open` from the Barista view. Fire only the B events listed. On the barista's own phone, tap *Turn off analytics* once (sets the opt-out) if they also use the customer view for testing; or exclude the shop's IP address in Plausible's settings (*Shields → IP addresses*).

## Setup steps

1. **Create the site.** Sign up at plausible.io, add the domain the app is served from (today `rfim.github.io`; later Bija's own domain), and choose the **Europe/London** time zone.
2. **Sign the DPA** in Plausible's account settings and file it with the legitimate interests assessment.
3. **Add the scripts to `app.html`** (Mobile team, since they own the file). Paste the exact snippet Plausible shows for the site (it changes between versions), then the wrapper:
   ```html
   <!-- Plausible snippet from your site settings goes here -->
   <script defer src="bija-analytics.js"></script>
   ```
   Only load these on the live site, not in the claude.ai-hosted build: that host may block outside scripts, and its users are not Bija customers. A simple guard is to add the tags only when `location.hostname` is Bija's domain.
4. **Call the events** at the points in the table. Examples for the existing handlers:
   ```js
   // placeOrder(), after saveMine succeeds
   window.bijaTrack?.('Place Order', { items: t.qty, slot: f.slot === 'ASAP' ? 'ASAP' : 'later', reward: t.reward ? 'yes' : 'no', gift: t.giftPay ? 'yes' : 'no' }, t.total);
   // 'sadd' handler
   window.bijaTrack?.('Add To Order', { item: sh.id, cat: m.cat, from: 'menu' });
   // 'status' handler, when s === 'collected' (Barista view)
   const o = allOrders().find((x) => x.id === b.dataset.o);
   if (o) window.bijaTrack?.('Order Collected', { wait: bijaTrack.minutes(o.createdAt, new Date().toISOString()) });
   // 'gbuy' handler
   window.bijaTrack?.('Gift Card Bought', { amount: bijaTrack.band(amount), design: g.design });
   ```
   The `?.` means the app still works if the script is blocked or missing.
5. **Add an opt-out** in the app (for example under Card, "Privacy: share anonymous usage stats" toggle) that calls `bijaTrack.optOut(true/false)`.
6. **Update `sw.js`** only if needed: it already ignores other-origin requests, so the Plausible script and event calls are not cached.
7. **Update `privacy.html`** with the wording above and add Plausible to the processor list.
8. **Set up goals** (step above), the funnel and the revenue goal, then exclude the shop's IP.
9. **Test:** open the app with `?plausible_debug=1` or the browser console, place a demo order, and check the event appears in Plausible's real-time view with no personal data in its properties.
10. **Review monthly** alongside the Finance tab: app share of takings (Finance) vs `Place Order` revenue (Plausible) vs till reports. Till reports remain the record for HMRC; analytics is never used for accounts.

## What we will look at each month

- App opens, new vs returning visitors, installed share.
- Funnel conversion App Open → Place Order, and where it drops.
- Top items added vs ordered.
- Rewards redeemed per 100 orders, and the cost at the value per point in Finance settings.
- Gift cards bought → paid → redeemed.
- Median wait band from `Order Collected`.

## Needs a decision from Bija

1. Approve Plausible (paid) or Umami Cloud (free tier).
2. Which domain the live app will use, so the site can be set up once.
3. Approve the privacy notice wording above.
