# Google Play listing: Bija Coffee

Draft for Bija Coffee Limited to approve. The Android app is a Trusted Web Activity (TWA) wrapping the Bija web app, built with Bubblewrap from `twa-manifest.json` in this folder. Everything here describes the app as it works today; update it if features change.

## Store listing

**App name** (30 max): Bija Coffee

**Short description** (80 max):
Order ahead at Bija, St James's Market. Stamps, points and Indonesian beans.

**Full description** (4,000 max):

Bija is an award-winning Indonesian coffee shop at 2a St James's Market, two minutes from Piccadilly Circus. The Bija app puts the café in your pocket.

ORDER AHEAD
Choose your drink, your milk, sweetness and hot or iced, pick a time and collect at the bar. You'll see when it's brewing and when it's ready.

STAMPS AND POINTS
Every handcrafted drink earns a stamp, and your 10th drink is on us. You also earn 10 points for every £1, in the café, in the app and in our web shop, towards cake and bags of beans.

YOUR BIJA CARD
Show your card at the till and the barista scans it. It opens even when the signal drops.

BEANS, DELIVERED
Single-origin coffee from Sumatra and Java, ground the way you brew. Buy a bag or join the Beans Club for 10% off every bag and free delivery. Skip, pause or cancel any time.

SCAN YOUR COFFEE
Scan the QR code on your bag or cup to see where your coffee comes from: the region, altitude, process and roast date.

SECRET ST JAMES'S
A walking trail of hidden corners around St James's. Every visit to Bija deals you a new card.

GIFT CARDS
Send a Bija gift card from £5 with a personal message.

Best New Coffee Shop, London Coffee Festival Awards 2025.

**Category:** Food & Drink
**Tags:** coffee, café, order ahead, loyalty
**Contact email:** info@bijalondon.co.uk
**Website:** https://rfim.github.io/bija-coffee/ (switch to Bija's own domain at launch)
**Privacy policy URL:** https://rfim.github.io/bija-coffee/privacy.html (must be public and match the form below)

## Data safety form

Answers based on `privacy.html` (29 October 2026). If payments, accounts or push notifications are added, revisit every answer.

| Question | Answer |
|---|---|
| Does the app collect or share user data? | Collects: yes. Shares: no (Royal Mail and our hosting provider act on our behalf as processors, which Google counts as "not shared"). |
| Is all data encrypted in transit? | Yes (HTTPS only). |
| Can users request deletion? | Yes, by emailing info@bijalondon.co.uk (reply within one month). |
| Personal info: Name | Collected. Purpose: app functionality (name on your cup, deliveries). Optional? Required for orders. |
| Personal info: Email address | Collected for beans orders (app functionality) and, only with opt-in, for marketing. |
| Personal info: Address | Collected for beans deliveries (app functionality). |
| Financial info: Purchase history | Collected (app functionality: orders, stamps, points). Card numbers are not collected by the app. |
| Location | Not collected. (Walking times are fixed text, not GPS.) |
| Photos and videos | Not collected. The camera is used on the device only to read QR codes; nothing is stored or sent. |
| App activity: In-app actions | Collected: ratings and comments you choose to leave (analytics: no; app functionality: yes). |
| App info and performance / Device IDs | Not collected. No analytics or advertising SDKs. |
| Is data collection optional? | Ordering requires a name; email and address only for deliveries; marketing email is opt-in. |

## Content rating (IARC questionnaire)

- Category: "Utility, productivity, communication or other" (not a game).
- No violence, sexual content, gambling, controlled substances, or user-to-user chat. No location sharing.
- Users can't communicate with each other; gift card messages go only to the named recipient via a code.
- Digital purchases: none through Google Play (gift cards and orders are paid at the bar or, later, via a payment provider for physical goods, which is allowed outside Play Billing).
- Expected rating: PEGI 3 / Everyone.

## Target audience

13 and over (matches the privacy notice). Not designed for children; don't opt into the Families programme.

## Screenshot shot list

Phone screenshots, 1080 × 1920 (9:16), PNG, at least 4, max 8. Use the demo with realistic sample data, no personal data. No text overlaid on café photos; captions go on plain black or white space above the device frame.

1. Home: greeting, Bija Card, Order now. Caption: "Your Bija, in your pocket"
2. Menu grid with photo tiles. Caption: "Order ahead, skip the queue"
3. Drink options sheet (milk, sweetness, hot or iced). Caption: "Exactly how you like it"
4. Live order tracker at "Ready". Caption: "Know when it's ready"
5. Bija Card with the stamp row. Caption: "10th drink on us"
6. Beans shop with grind and Subscribe & save. Caption: "Beans, delivered"
7. Bean passport after scanning a bag. Caption: "Scan to see where it's from"
8. Secret St James's card. Caption: "Discover hidden St James's"

Also: feature graphic 1024 × 500 (black, Kawung pattern, Bija mark and wordmark; no photo with text over it) and the 512 × 512 icon (`icons/icon-512.png`).

## Release checklist

1. Move the web app to Bija's own domain, then update `host`, `startUrl`, icon URLs in `twa-manifest.json`.
2. `bubblewrap init --manifest https://<domain>/manifest.webmanifest`, then `bubblewrap build`.
3. Enrol in Play App Signing; copy the **app signing** SHA-256 fingerprint into `/.well-known/assetlinks.json` and redeploy, so the app opens without the browser bar.
4. Check `https://<domain>/.well-known/assetlinks.json` returns JSON (GitHub Pages needs `.nojekyll` at the root to serve `.well-known`).
5. Internal testing track first, then closed testing with 12+ testers for 14 days (required for new personal developer accounts), then production.
