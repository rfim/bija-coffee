---
name: core-design
description: Visual design and motion system for the café core shared by Bija Coffee and Ngopi UK (and any brand built from it). Use for any change to how a screen, page, card, logo, photo, icon or animation looks or moves, in the app (app.html, app-motion.*) or on the website (index.html, site-*.css).
---

# Café core: design and motion

One hand, two identities. Bija and Ngopi UK run on the same core and should feel made by the same careful designer, while each keeps its own look. This skill holds what the two share and what each owns. Read `core-ux` for journeys and checks, and `core-architecture` for where things live.

## 1. The two identities

| | **Bija** (rfim/bija-coffee) | **Ngopi UK** (rfim/ngopiuk-coffee) |
|---|---|---|
| Direction | Grind-style minimal black and white, generous white space | **Kedai**: the ngopi.co.uk shopfront drawing grown into a system |
| Colour | Ink `#0b0b0b`, paper `#fff`, warm grey tile `#efedea` / `#f2f2f0`. No other colour, except Maheera's amber on Maheera's mark | Cream paper, navy ink (`#14164f`), blue, gold (`#c9a24a`). Tokens in `design/app-ds-1-kedai.css`, `design/ds-1-kedai.css` |
| Type | Archivo 900 for display (caps on the website, sentence case in the app), Inter 400/600 for body | Fredoka headings, the core's body face |
| Mark | Kawung, four circles through one centre (`C4` in `app-motion.js`, `kawung()` in `app-icons.js`) | Kawung hairline as ornament; the shopfront and the owner's licensed wayang art |
| Wordmark | "Bija", traced from the brand's own logo artwork (`WORDMARK` in `app.html` and `site-shop.js`). Never retype it in a font | Ngopi wordmark SVG in `brand/` |
| Photos | Real café photos (`photos/`), the menu's line illustrations (`illustrations/`) in black or white | Owner's photos and art; food art in `art/food/` |

When a pattern works in one brand, port the *pattern*, not the look: Ngopi took Bija's homepage rhythm and kept Kedai's palette; Bija took Ngopi's kinetic opening idea and kept black and white.

## 2. Tokens, not values

- Colours, radii and easings are CSS custom properties on `:root`. A component never writes a raw hex that a token already names.
- Spacing on a 4/8 px rhythm. Phone gutter 16–28 px; section gaps 64 px on phones, 96–120 px on desktop.
- One card system per brand: the same radius, the same image ratio and the same button placement on every card.
- Dark mode: test both schemes. Bija deliberately stays light in dark mode; if a brand adapts, redefine tokens under `prefers-color-scheme: dark` and check contrast separately (never assume light values carry over).

## 3. Type

- Big type, few words. Section headlines are short and bold, with a small eyebrow above (caps, letter-spaced, muted).
- Body 15–17 px, line height about 1.45. Nothing anyone must read below 12 px; 11 px only for tab labels and eyebrows.
- One emphasised word per headline at most. Bija marks it with a solid block behind the word (white on black or black on white) that opens from the left; Ngopi uses its gold block. Never italics or a handwriting font in Bija.

## 4. Imagery and icons

- Real photography wherever it can be; drawings only where they mean something.
- No photos of identifiable people without their agreement. The owner asked to keep the founder's photo out of the openings and onboarding.
- Use the brand's own assets before making new ones: Bija's menu illustrations are a consistent line set; use them before drawing an icon.
- Icons: one family per brand (`app-icons.js` for Bija: 24×24, stroke 1.7, round caps, `currentColor`). No emoji as icons. Decorative icons beside text get `aria-hidden="true"`.
- Brand objects drawn as icons must be true to the real thing. Bija's Home icon is the blade sign outside the bar: a tall rounded panel with the mark, on two arms from the wall on the left.
- Small photos (under about 600 px wide) look soft on a phone: show them in a modest frame, never full-bleed, and ask for originals.

## 5. Motion system (shared)

Motion orients, confirms and teaches. It is never decoration for its own sake.

**Properties.** Animate only `transform` and `opacity`. Never animate `width`, `height`, `top`, a large `clip-path` or `box-shadow` (fake a shadow with an opacity layer). Blur only on small content or a backdrop, and fade the blur in after movement settles.

**Durations.** 80 ms press · 160 toggle · 240 small enter (chip, toast, count) · 360 card or sheet · 480 screen · 720 scroll reveal · 1200 one signature moment. Exits run about 20% shorter than entrances and do not stagger.

**Easing.**
- Entrances and screen changes: Bija `cubic-bezier(.32,.72,0,1)` (iPhone-sheet), Ngopi `--alon: cubic-bezier(.22,1,.36,1)`. Within a brand, use one curve for every entrance.
- State changes and exits: `cubic-bezier(.3,0,.2,1)` (`--tepak`).
- Rewards only: a gentle overshoot `cubic-bezier(.34,1.4,.64,1)` (`--gong`). No bounce anywhere else.

**Rhythm ("one gong per screen").** Items stagger in beats of 60–80 ms, at most 6 beats, then the rest arrive together. Each screen has at most one big moment, tied to the business action (item added, stamp earned, order placed).

**When.** Play on open, never on a redraw. Above-the-fold content is visible at first paint; only decoration animates. Nothing blocks an add or pay action; feedback runs alongside it in under about 450 ms.

**Screen changes.** Old content leaves first, then the new content arrives (or dip through the background). Never cross-fade two busy layouts into a double exposure. Bija's chosen styles: soft focus for the order bar and subscription, ink for section switches.

**Reduced motion.** Under `prefers-reduced-motion: reduce`: no translate, scale, parallax or flying items. Keep the *meaning* as a 150 ms opacity cross-fade (counts, stamps, order stages). Ornaments render already drawn. Ambient loops longer than 5 s need a pause, or stop on touch, focus and reduced motion.

**House techniques.** SVG stroke drawing with `pathLength="1"` (the mark draws itself); the Web Animations API for flights and page fades (no forced layout); same-document View Transitions as progressive enhancement; card flips drawn flat in two half-turns, hiding the unused side with `visibility`.

## 6. Indonesian vocabulary (use with respect)

| Motif | Meaning | Use | Avoid |
|---|---|---|---|
| Kawung | Wisdom, purity; the house mark | The four circles draw in sequence; hairline fields at 5–7% opacity | Spinning it as a loader |
| Kelir (shadow-play screen) | The stage where the story appears | A screen that rises (a wipe, not a fade) for true thresholds only | Every tab change |
| Blencong (oil lamp) | Light that brings shadows alive | One soft light pass on a primary action or reward | Constant shimmer |
| Mega mendung (clouds) | Patience, calm | Slow tonal drift while waiting (order making) | Fast movement |
| Kopi tubruk | Grounds settling | "Settle" easing for confirmations | Literal muddy cups |
| Es kopi susu gula aren | Layers poured in order | Order progress filling in layers | Liquid simulation |
| Gamelan colotomy | Nested cycles | Small beats for items, one gong per screen | Sound by default |

Never animate Parang as decoration, never use the gunungan as a loader, and credit the art's origin.

## 7. Website page rhythm (Bija's homepage, reused by Ngopi)

1. Thin announcement line, compact header with "Order ahead" as a pill and the wordmark centred.
2. Hero: one big headline, one sentence, two buttons, a real photo.
3. Info strip of four facts (open now, delivery, subscribe and save, an award), each a link.
4. Product row, full-bleed band, three "get to know your kopi" cards, story, ways to earn, gifts band, app section, what's on, menu, visit, strong footer.

Content section on paper, then a full-bleed band, then content: never two bands in a row. Every section ends in one clear action.

## 8. How the owner decides

- When a look or a movement is a matter of taste, make **five options** as slow-motion GIFs or a review page and let the owner (and their wife) pick. Don't decide for them; keep the current default until they choose.
- Keep the picked option as the default and the others behind a URL switch (`?bagfx=`, `?catfx=`, `?subfx=`, `?mhui=`).
- Show visible changes as before and after at the owner's phone size (428×926, iPhone 13 Pro Max).
