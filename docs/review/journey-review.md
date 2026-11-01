# Bija journey review: fresh eyes, 30 October 2026

Four people walked their journeys end to end in a real browser (Playwright, demo mode, local site at 00:00 UTC). Customer journeys ran at iPhone 13 size; staff on a 1280-wide tablet or desktop. Times are what each step took in the browser, including animations. No console errors occurred on any journey.

**Verdict:** every journey completes. Ordering, points, stamps, staff entry, finance and the shop all work without dead ends. The friction is in a handful of details: one broken search highlight, an empty-looking scanner on iPhone, a contact form whose errors don't clear, and copy that speaks to the wrong person.

## 1. Sekar, first-time customer on her phone

22 steps, about 40 seconds of interaction (not counting waits for staff).

| Step | Time | Result |
|---|---|---|
| Instagram link to index.html | 2.5s | Redirects to the app. |
| Intro: 3 cards, "Start ordering" | 3.1s | Opens the menu. |
| Search "aren" | 1.1s | 2 results: Kopi Susu Aren and Arenga Affogato. |
| Options, then Oat and Iced, then add | 3.0s | Flies into the Order button; the basket shows it. |
| Checkout, name, place order | 3.3s | Code BUGJ, with "Ready around 12.08am". |
| Staff: brewing, ready, collected | 6.0s | Status updates live. |
| Profile | 1.8s | 145 points, 1 of 10 stamps, "205 pts to any cake". |
| Stamp drawer | 1.6s | History shows "Kopi Susu Aren +1". |
| Wallet preview | 1.9s | Labelled as a preview; no false "added". |
| Invite a friend | 1.3s | Copies the code. |
| Scan coffee | 2.7s | Sheet opens. |
| Beans: subscribe to Lintong, then place | 3.4s plus checkout | "Order placed. Welcome to Beans Club". |
| Bean passport (trace.html) | 2.0s | Origin, freshness and map all render. |

**Worked well:** the intro is short and skippable, search is instant, and the options sheet is clear. The fly-in animation confirms the add, and the ready-time estimate sets expectations. Points and stamps land the moment staff mark the order collected, and the stamp drawer explains the rule in one line.

**Friction:**
- **High · Scan coffee on iPhone:** the sheet is a full black screen with one line of text ("Use your phone's Camera app…"). On iPhone Safari there's no in-browser scanner, so most iPhone users will see this. *Fix:* show a simple drawing of a phone camera pointing at a bag QR, add a "Choose a photo of the code" button (`scan-file` already exists), and make the sheet light, not black.
- **Medium · Beans Club defaults to Click & collect:** a subscription "delivered to your door" opens with Click & collect selected, even though posting is free with a subscription. *Fix:* default to Royal Mail when the bag holds a subscription.
- **Medium · Invite a friend:** without the share sheet (desktop, some Android), the toast shows only "BIJA-6JR76", so it's unclear the code was copied. *Fix:* say "Invite link copied: BIJA-6JR76".
- **Low · Toasts:** on the Beans page two toasts stack over the form fields. *Fix:* show one at a time and lift toasts above the bottom nav and fields.

## 2. Desktop shopper

9 steps, about 20 seconds.

| Step | Time | Result |
|---|---|---|
| Home | 2.2s | Shop-first and fast. |
| Find your kopi (5 taps) | 4.7s | Recommends House Blend with a clear reason, "Subscribe · £10.80". |
| Product page: Subscribe 3 weeks, V60, add | 3.7s | Basket drawer: "Free delivery: your basket has a subscription". |
| Checkout, then place | 3.7s | "Terima kasih, Ayu. Your order is in", with code, Royal Mail date and points. |
| Gifts | 1.6s | Three ways to give and a budget finder. |
| Help search "skip" | 1.9s | One answer found. |
| Contact form | 1.8s | Error summary works on submit. |

**Worked well:** the quiz to product to basket flow is quick, with no dead ends. Delivery and points are shown before you pay, and the confirmation page is warm and complete.

**Friction:**
- **High · Help search highlight breaks the question:** searching "skip" turns "Can I skip, pause or cancel?" into "Can I" / a black **skip** block pushed to the right / ", pause or cancel?" on a new line. *Fix:* style the highlight with `mark { display:inline; background:#0b0b0b; color:#fff; padding:0 .15em }` and keep it inside the summary line, with no flex or float on `mark`.
- **Medium · Contact form errors don't clear:** after a failed submit, "Enter your name" and "Enter an email address…" stay in red under fields you've already filled. *Fix:* re-validate each field on `input` or `blur` and clear its message once it's valid.
- **Low · Basket drawer:** the frequency select is cut off ("Every 3 weeks (−1…"). *Fix:* shorter option labels, e.g. "Every 3 weeks · −10%", or a wider select.
- **Low · Tap targets:** announcement-bar links are 24px tall and footer links 35px, which meets WCAG 2.5.8's 24px minimum but falls short of the 44px best practice. *Fix:* pad links to 44px tap height without changing how they look.

## 3. Barista on the bar tablet

7 steps, about 24 seconds.

| Step | Time | Result |
|---|---|---|
| Hold Order for 3 seconds (Enter key) | 4.5s | PIN sheet opens. |
| PIN 111111 on the keypad | 3.4s | Staff view with the queue. |
| Brewing, ready, collected | 3.2s | Queue clears. |
| In-store £6.40 with 2 drinks by member code | 2.3s | "+64 points". |
| Gift cards | 1.3s | Empty state explains what will appear. |
| Exit | 1.3s | Staff tabs gone. |

**Worked well:** the hidden hold-to-enter works, including from the keyboard. The keypad is big and clear. The queue cards are tidy, and staff mode exits in one tap.

**Friction:**
- **Medium · Wrong-audience toast after Collected:** the barista sees "+139 points · a new secret card", which is the customer's message. What the barista needs is how much to take. *Fix:* in staff view, show "Collected · take £3.90 · Rina gets 39 points". Live mode already returns "take £x"; match it in demo.
- **Low · In-store spend:** the member-code field expects the code typed exactly. *Fix:* accept lower case and a missing "BIJA-" prefix, and suggest a match.

## 4. Owner

11 steps, about 20 seconds; every finance section opens in about 1 second.

| Step | Time | Result |
|---|---|---|
| Finance Today | 1.9s | To-do list and "Add yesterday's till takings to start". |
| Close the day, 3 steps | 3.5s | Sales £499.75 (card £412.50, cash £87.25); drawer difference explained. |
| Expense £48 with VAT | 2.0s | "Expense of £48.00 added". |
| Bills, VAT, Profit & loss, Cash flow, Staff, Deadlines, Settings | about 1s each | Clear empty states that teach. |
| Accountant CSV | 1.1s | `bija-accountant-2026-10-26-to-2026-11-01.csv` downloaded. |
| Change staff PIN | 2.3s | Found in the Menu tab. |
| QR labels | 1.9s | Label maker loads. |

**Worked well:** plain English throughout, one main action per screen, numbers explained, and HMRC's 9 VAT boxes laid out. The CSV export downloads in one tap.

**Friction:**
- **Medium · Deadlines are empty until Settings are filled:** the owner has to know their company year end. *Fix:* on the Deadlines empty state, link straight to the two Settings fields, with a "Find these on Companies House" link (company 15383542).
- **Low · Change staff PIN is in the Menu tab:** owners will look for it in Settings. *Fix:* add it to Finance Settings too, or rename the Menu tab "Menu & settings".
- **Low · No obvious route to QR labels from the staff view:** labels.html is linked from Menu only. *Fix:* add "Print QR labels" to the Web & delivery tab, next to the beans orders.

## Top 10 fixes, in order of value

1. **Help search highlight** (High): fix the `mark` styling so questions don't break apart.
2. **Scan coffee on iPhone** (High): a light sheet with a drawing and a "Choose a photo of the code" button.
3. **Barista Collected toast** (Medium): show "take £x", not the customer's message.
4. **Beans Club delivery default** (Medium): Royal Mail by default when the bag holds a subscription.
5. **Contact form errors** (Medium): clear each error as soon as the field is valid.
6. **Deadlines empty state** (Medium): a direct link to the year-end settings and Companies House.
7. **Invite copy feedback** (Medium): "Invite link copied: BIJA-…".
8. **Toasts** (Low): one at a time, never over form fields.
9. **Basket drawer frequency labels** (Low): shorter, so they aren't cut off.
10. **Tap height** (Low): announcement-bar and footer links padded to 44px.

Screenshots: `docs/review/shots/`. Script: `scratchpad/journey/run.js` (re-runnable).
