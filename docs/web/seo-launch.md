# Switching search indexing on (launch checklist)

The site is a concept until Bija approves it, so every page has
`<meta name="robots" content="noindex, nofollow">`. Everything else for search
(structured data, sitemap, social cards) is already in place, pointing at the
current address `https://rfim.github.io/bija-coffee/`.

## Before launch: decisions needed
1. **Final address.** Expected: `https://bijacoffee.co.uk/`.
2. **Phones are sent to the app.** `index.html` redirects phones and tablets to
   `app.html`, and `app.html` is `noindex`. Google indexes the mobile version of a
   site first, so as things stand **the homepage would barely appear in Google**.
   Recommended: stop the automatic redirect and show phone visitors the website
   with a clear "Order ahead" button (the website already works at phone size with
   `?view=site`). This needs the product lead's sign-off.

## Steps
1. Replace `https://rfim.github.io/bija-coffee/` with the final address in:
   `index.html` (canonical, `og:*`, `twitter:*`, JSON-LD), `sitemap.xml` and `robots.txt`.
2. Delete the `<meta name="robots" content="noindex, nofollow">` line from
   `index.html`, `privacy.html` and `accessibility.html`. Leave `app.html` as it is (app team).
3. Make sure `robots.txt` is served from the **root** of the domain
   (`https://bijacoffee.co.uk/robots.txt`). On a GitHub Pages project site
   (`user.github.io/repo/`) crawlers never read it, because it isn't at the root.
4. Check the structured data in Google's Rich Results Test and the Schema Markup Validator.
   Confirm the geo point, price range and menu prices with Bija first.
5. Add the site to Google Search Console (and Bing Webmaster Tools), verify it and submit `sitemap.xml`.
6. Set the website link in the Google Business Profile (see `google-business-profile.md`).
7. Check the social card with a link preview (WhatsApp, LinkedIn Post Inspector).
8. Update each `<lastmod>` in `sitemap.xml` whenever a page changes.
