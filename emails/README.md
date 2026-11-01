# Email templates

HTML and plain-text versions of Bija's customer emails. `preview.html` lists them all.

| File | Sent when |
|---|---|
| `order-confirmation` | A web shop or app beans order is placed |
| `dispatched` | Staff mark a beans order dispatched (Royal Mail Tracked 48) |
| `beans-club-reminder` | 3 days before a Beans Club dispatch, when changes for that delivery close |
| `gift-card-received` | Someone sends a Bija gift card |
| `newsletter-welcome` | Someone ticks the news box and confirms their email |

## Merge tags

Your email provider replaces these before sending.

| Tag | Value |
|---|---|
| `{{site_url}}` | The live site address **without** a trailing slash, for example `https://www.bijalondon.co.uk` (the demo is `https://rfim.github.io/bija-coffee`). Links are written as `{{site_url}}/shop.html`. |
| `{{first_name}}`, `{{order_code}}`, `{{#items}}…{{/items}}` and the others in each file | The customer and order details. |

Set `{{site_url}}` once in the provider's settings, so moving to Bija's own domain needs no template changes.
