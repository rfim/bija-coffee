# Bija Coffee: website + app

Concept rebuild of bijacoffee.co.uk with an order-ahead app for Bija, St James's Market, London. **Not an official Bija page.**

Live (GitHub Pages): https://rfim.github.io/bija-coffee/

## What's here
| File | What it is |
|---|---|
| `index.html` | Website. Phones and tablets are sent to the app; `?view=site` / `?view=app` overrides (remembered per device). |
| `app.html` | Installable web app (PWA): order ahead with per-drink options, beans, Bija Card points, rewards and challenges, gift cards, Secret St James's, and a Barista view (queue, members, gift cards, finance, insights, menu). On GitHub Pages it runs in demo mode: data stays in each browser. |
| `privacy.html`, `accessibility.html` | UK GDPR privacy notice and WCAG 2.2 AA accessibility statement (drafts for Bija to approve). |
| `photos/` | Bija's photos, cropped and compressed for the web. Slots without a file show a labelled placeholder (`founder.jpg` is still needed). |
| `manifest.webmanifest`, `sw.js`, `icons/` | Home-screen install, offline cache and app icons. |

## Standards we follow
- Accessibility: WCAG 2.2 AA (keyboard, focus, contrast, 44px tap targets, reduced motion, alt text).
- UK law and good practice: prices include VAT; allergen information signposted (14 major allergens); company name and number in the footer (Companies Act); privacy notice under UK GDPR; no tracking cookies.
- Security: all user text escaped; points, gift balances and finance can only be changed by staff (enforced by data access rules on the hosted version).

## To confirm with Bija
Wording, prices, bean details, loyalty numbers, Secret St James's facts, retention periods in the privacy notice, and the founder photo.
