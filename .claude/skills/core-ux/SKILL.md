---
name: core-ux
description: UX rules, journeys and the quality checklist for the café core shared by Bija Coffee and Ngopi UK. Use when designing or changing a flow (opening, onboarding, ordering, basket, checkout, rewards, subscription, profile, back office), writing text people read, or checking a change before it ships.
---

# Café core: UX

The people: regulars who want their kopi without the queue, newcomers deciding whether to trust a small café's app, and staff working fast behind the bar. Every rule below serves one of them. Visuals and motion are in `core-design`; where code lives is in `core-architecture`.

## 1. Principles

- **Fast to the order.** Nothing stands between a customer and their first order: onboarding can be skipped, guests can order, and no animation blocks a tap.
- **Calm and honest.** Plain labels, no fake urgency, never offer what doesn't work yet (say "Nothing is charged in the app yet" rather than pretend). Never the word "demo".
- **Nobody loses work.** Edits are kept until saved; saving and approving buttons are disabled while the request runs, so a double tap can't send twice.
- **Allergies are never a joke and never hidden.** Asked once, saved on the device, shown on every clashing item, ticked at checkout, and first in the barista's note.
- **Privacy.** Hometown, votes, phone numbers and order details are for the staff only; share cards carry no order code, price, phone or surname.

## 2. Journeys (current decisions)

**Opening.** Just the mark drawing itself, about a second, on every open and on coming back after more than 2 minutes away. No greeting text on it. A tap skips it. Not in the back office.

**Onboarding** (first open, not signed in, once per device). Three short screens, then sign-in:
1. "Skip the queue." 2. "Earn as you sip." 3. "Beans at home." Each has one real coffee photo in an arched frame, a one-line explanation, dots, a round arrow, Skip at the top and a back arrow.
4. "Make it yours." **Continue with Apple · Continue with Google · Continue as guest.** Guest closes it quietly (no toast). Apple and Google open the account sheet and start the same sign-in as the profile, so errors show there.
Never shown to signed-in members, staff or deep links. Swipe, the arrow or the keyboard moves on; Escape is guest.

**Home.** A quiet greeting line (time of day, open or closed); What's new carousel (dots follow the swipe); one "For you" card that swaps its words on one still panel; no rotator dots or pause button (it pauses itself on touch, focus and reduced motion).

**Ordering.** Category chips with an ink indicator; rows with photo, name, one line, price and a 44 px add button. The basket is a black bar above the bottom bar; tapping it grows the bar into the order list (soft focus) with + and − steppers (44 px) and a bin for the last one.

**Checkout.** Compact enough to show more than two items without scrolling; collection time, payment honestly labelled, allergy tick when something clashes.

**Rewards.** The card is the hero. Use endowed progress and the goal gradient: show stamps already earned, the next one, and "9 to a free drink". Earning a stamp is the screen's one big moment.

**Order tracking.** Show the work (the labour illusion): stages that fill (received, making, ready), a calm drift while making, and one clear "ready" moment with a vibration where allowed.

**Subscription.** Grind-simple: choose brew method and cups a day, see price and delivery, confirm. 10% off and free UK delivery stated once, plainly.

**Profile.** Membership card and balance first, then Add money, History, Stamp card, Account (details, allergies, card design), Subscription. One sign-in panel: Apple, Google, email.

## 3. Words

- British English, sentence case, plain verbs on buttons ("Add", "Checkout", "Continue as guest").
- Bahasa Indonesia touches where they're warm and clear ("Selamat pagi"), never where they'd confuse an order.
- Toasts only when they add information the screen doesn't already show; the owner removed the guest toast for this reason.
- Errors say what happened and what to do, next to the field, in plain words.

## 4. Pre-delivery checklist

Adapted from UI UX Pro Max (nextlevelbuilder/ui-ux-pro-max-skill). Run it on every visible change.

**Measure** (Playwright at 428×926, light and dark, plus a short phone 428×740):
- [ ] Touch targets at least 44×44 px (bottom bar labels excepted).
- [ ] Text contrast at least 4.5:1 (3:1 for large text), in both schemes.
- [ ] Nothing a person must read under 12 px.
- [ ] Every button, link and input has an accessible name; decorative backdrops and icons are `aria-hidden`.
- [ ] No sideways scroll. Nothing hidden behind the bottom bar, the basket bar or the safe areas.

**Look:**
- [ ] One icon family; brand assets true to the original; no emoji icons.
- [ ] Spacing on the 8 px rhythm; cards from one system; no clipped or overlapping text.
- [ ] Pressed states don't shift layout.

**Use:**
- [ ] Clear feedback after every action; disabled states look disabled.
- [ ] Focus rings visible for keyboard users (not forced onto touch users); focus order matches the screen.
- [ ] Swipes have a button alternative; dialogs close with Escape and a labelled close button.
- [ ] Reduced motion keeps meaning with simple fades; auto-moving content stops on touch, focus and reduced motion.
- [ ] Forms have visible labels, keep their errors inline, and allow password managers and paste.

**Phones:** iPhone 13 Pro Max 428×926 (the standard), iPhone 13 390×844, Galaxy A15 360×800 with a three-button bar, S24 Ultra 384×832, iPhone SE 375×667. Check Home, Order, the basket sheet, checkout, Rewards, Profile, Subscription, onboarding and the back office.

**Smoothness:** with the CPU slowed 4×, no frame over 20 ms during a movement.

## 5. Working with the owner

- Show, don't describe: GIFs or a short video for motion, before and after for visible changes, at the owner's phone size.
- Taste is the owner's call: give five options and keep the current one until they pick. Bugs and clear checklist failures can be fixed straight away.
- Measure, don't promise: track add-to-basket, order completion and stamp redemption before and after a change rather than quoting outside percentages.
