# Release checklist

Use this for every change to the website, shop or app. A release is anything merged into `main`: GitHub Pages publishes `main` within a few minutes of the merge, so merging is releasing.

## Before opening the pull request

- [ ] The change is on a branch, not committed straight to `main`.
- [ ] Ran the checks locally ([tests/README.md](../../tests/README.md)): `node tests/tools/a11y.js`, `node tests/tools/links.js` and every `tests/*.js` suite (including `tests/security.js`).
- [ ] Tried the change in a browser at phone width (390px) and desktop width, with keyboard only (Tab, Enter, Esc), and with reduced motion turned on.
- [ ] New images have alt text (or `alt=""` if decorative), are compressed, and have width and height set.
- [ ] Any user text shown on the page is escaped.
- [ ] No secrets in the diff: no Supabase service role key, no payment secret key, no passwords. Only the Supabase anon key and the provider's publishable key may appear in the site.
- [ ] No new tracking scripts or cookies. If a third party is added, the privacy notice is updated in the same pull request.

## If the change touches...

- [ ] **Files the app caches offline** (any page, CSS, JS, font or icon listed in `sw.js`): bump `CACHE` in `sw.js` (`bija-v4` → `bija-v5`) so phones fetch the new version. Add new files to `SHELL`.
- [ ] **Prices, delivery charges, discounts or loyalty rules:** confirmed with the owner; prices include VAT; the shop, checkout and app show the same numbers.
- [ ] **Allergens or menu items:** checked against the shop's allergen matrix.
- [ ] **Personal data** (new fields, new uses, new processors, retention): `privacy.html` updated and the owner has approved the wording.
- [ ] **Supabase schema or access rules:** migration reviewed; row-level security on for every table with customer or staff data; tested as a customer, as staff and signed out; a backup taken in the last 24 hours.
- [ ] **Payments:** tested end to end in the provider's test mode (success, declined card, 3-D Secure, refund), and the webhook still creates the order.
- [ ] **Accessibility statement:** `accessibility.html` still accurate (known issues, last reviewed date).

## Pull request

- [ ] CI is green: Node tests, axe WCAG 2.2 AA audit, link check.
- [ ] Lighthouse (advisory) checked after the last merge; no new budget failures from this change (LCP < 2.5 s, CLS < 0.1, TBT < 200 ms, accessibility 100).
- [ ] Someone other than the author has reviewed it, or the lead has approved it.
- [ ] The description says what changed and how to check it.

## After merging

- [ ] Wait for the **pages-build-deployment** run in the Actions tab to finish.
- [ ] Open the live site on a phone (mobile data, not shop Wi-Fi) and check the changed pages, then the basics: home page, shop, a product, basket, checkout, app home, Barista view sign-in.
- [ ] If `sw.js` changed: reopen the installed app and check the new version shows (it may take one reload).
- [ ] Watch for problems for the next hour: the Barista queue, the payment dashboard, the inbox.

## Rolling back

If the release breaks something important, roll it back first and investigate afterwards.

1. On GitHub, open the merged pull request and select **Revert**, then merge the revert pull request. Or, locally: `git revert <merge commit> -m 1` on a branch, push, open a pull request and merge it once CI passes.
2. Wait for Pages to publish and check the live site.
3. If the release included a Supabase migration, roll back the data change separately (a down migration, or a restore if data was damaged; see section 2 of [runbook.md](runbook.md)). Reverting the site does not undo database changes.
4. If `sw.js` was changed, the revert needs a **new** cache name too (for example `bija-v6`, not back to `bija-v4`), or phones keep the broken version.
5. For anything customers noticed, follow [incident-response.md](incident-response.md).

Never force-push to `main` to undo a release.
