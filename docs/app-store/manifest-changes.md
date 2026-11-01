# manifest.webmanifest: changes for install and the stores

Apply these to `manifest.webmanifest` (owned by main). Each change is listed with why. The full proposed file is at the end; it is a drop-in replacement.

## JSON patch (RFC 6902)

```json
[
  { "op": "add", "path": "/id", "value": "/bija-coffee/app.html" },
  { "op": "replace", "path": "/start_url", "value": "app.html?view=app&source=pwa" },
  { "op": "replace", "path": "/scope", "value": "./" },
  { "op": "add", "path": "/display_override", "value": ["standalone", "minimal-ui"] },
  { "op": "replace", "path": "/background_color", "value": "#ffffff" },
  { "op": "replace", "path": "/theme_color", "value": "#ffffff" },
  { "op": "add", "path": "/lang", "value": "en-GB" },
  { "op": "add", "path": "/dir", "value": "ltr" },
  { "op": "add", "path": "/categories", "value": ["food", "lifestyle"] },
  { "op": "replace", "path": "/description", "value": "Order ahead at Bija, St James's Market. Stamps, points, your Bija Card, Indonesian beans delivered, and the story behind every bag." },
  { "op": "add", "path": "/icons/-", "value": { "src": "icons/apple-touch-icon.png", "sizes": "180x180", "type": "image/png" } },
  { "op": "add", "path": "/shortcuts", "value": [
    { "name": "Order", "short_name": "Order", "description": "Order ahead and collect at the bar", "url": "app.html?view=app&source=shortcut#order", "icons": [{ "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" }] },
    { "name": "Bija Card", "short_name": "Card", "description": "Show your card at the till", "url": "app.html?view=app&source=shortcut#card", "icons": [{ "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" }] }
  ] },
  { "op": "add", "path": "/screenshots", "value": [
    { "src": "screenshots/home.png", "sizes": "1080x1920", "type": "image/png", "form_factor": "narrow", "label": "Home with your Bija Card and Order now" },
    { "src": "screenshots/menu.png", "sizes": "1080x1920", "type": "image/png", "form_factor": "narrow", "label": "Menu of drinks and cakes to order ahead" },
    { "src": "screenshots/card.png", "sizes": "1080x1920", "type": "image/png", "form_factor": "narrow", "label": "Bija Card with stamps and points" },
    { "src": "screenshots/shop.png", "sizes": "1920x1080", "type": "image/png", "form_factor": "wide", "label": "Bija web shop on a computer" }
  ] },
  { "op": "add", "path": "/prefer_related_applications", "value": false }
]
```

## Why each change

| Change | Reason |
|---|---|
| `id` | Gives the app a stable identity, so a future change to `start_url` doesn't create a second installed app. Chrome and the Play TWA both read it. |
| `start_url` with `source=pwa` | Lets us tell installed launches apart without analytics cookies (the param can be read locally). Hash routes `#order` and `#card` already exist in `app.html`. |
| `display_override` | Prefer standalone, fall back to minimal-ui where standalone isn't available. |
| `background_color` and `theme_color` to white | The UI is now the light Grind-style system; black flashes a dark splash and status bar before the white app. Keep `<meta name="theme-color" content="#ffffff">` in `app.html` in step. |
| `lang`, `dir` | Correct language for screen readers and store metadata. |
| `categories` | ["food", "lifestyle"]: used by store listings and some app catalogues. |
| `shortcuts` | Long-press the icon (Android, desktop) for Order or Bija Card. They use the existing `#order` and `#card` hash routes. |
| `screenshots` | Chrome on Android shows the richer install sheet only when at least one `narrow` screenshot is present; `wide` is used on desktop. |
| Extra 180 icon | Harmless; helps some launchers. |

## Maskable icon check

`icons/maskable-512.png` passes. The artwork's bounding box is 118 to 394 px on a 512 canvas, so its furthest point is about 139 px from the centre, well inside the 204.8 px safe-zone radius (40% of the width). The background is solid black to the edges, so no transparent corners show when the launcher masks it. Nothing to change.

Optional: `icon-192.png` and `icon-512.png` (`purpose: any`) are also solid black squares. That's fine, but a monochrome icon (`purpose: monochrome`, white mark on transparent) would let Android 13+ themed icons work. Not required.

## Screenshots: how to make them

The `screenshots/` folder doesn't exist yet. Create the four PNGs from the demo with clean sample data, after the overnight UI work settles (the app is changing tonight). One way:

```js
// node make-screens.js  (server on http://127.0.0.1:8099)
const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const phone = await b.newContext({ ...devices['iPhone 13'], viewport: { width: 360, height: 640 }, deviceScaleFactor: 3 }); // 1080 × 1920
  const p = await phone.newPage();
  await p.goto('http://127.0.0.1:8099/app.html?view=app#home'); await p.waitForTimeout(1500); await p.screenshot({ path: 'screenshots/home.png' });
  await p.goto('http://127.0.0.1:8099/app.html?view=app#order'); await p.waitForTimeout(1500); await p.screenshot({ path: 'screenshots/menu.png' });
  await p.goto('http://127.0.0.1:8099/app.html?view=app#card'); await p.waitForTimeout(1500); await p.screenshot({ path: 'screenshots/card.png' });
  const desk = await b.newContext({ viewport: { width: 1920, height: 1080 } });
  const d = await desk.newPage(); await d.goto('http://127.0.0.1:8099/shop.html'); await d.waitForTimeout(1200); await d.screenshot({ path: 'screenshots/shop.png' });
  await b.close();
})();
```

Skip the launch splash and onboarding before capturing (dismiss them once, or set reduced motion on the context).

## Proposed full file

```json
{
  "id": "/bija-coffee/app.html",
  "name": "Bija Coffee",
  "short_name": "Bija",
  "description": "Order ahead at Bija, St James's Market. Stamps, points, your Bija Card, Indonesian beans delivered, and the story behind every bag.",
  "lang": "en-GB",
  "dir": "ltr",
  "start_url": "app.html?view=app&source=pwa",
  "scope": "./",
  "display": "standalone",
  "display_override": ["standalone", "minimal-ui"],
  "orientation": "portrait",
  "background_color": "#ffffff",
  "theme_color": "#ffffff",
  "categories": ["food", "lifestyle"],
  "prefer_related_applications": false,
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" },
    { "src": "icons/apple-touch-icon.png", "sizes": "180x180", "type": "image/png" }
  ],
  "shortcuts": [
    { "name": "Order", "short_name": "Order", "description": "Order ahead and collect at the bar", "url": "app.html?view=app&source=shortcut#order", "icons": [{ "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" }] },
    { "name": "Bija Card", "short_name": "Card", "description": "Show your card at the till", "url": "app.html?view=app&source=shortcut#card", "icons": [{ "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" }] }
  ],
  "screenshots": [
    { "src": "screenshots/home.png", "sizes": "1080x1920", "type": "image/png", "form_factor": "narrow", "label": "Home with your Bija Card and Order now" },
    { "src": "screenshots/menu.png", "sizes": "1080x1920", "type": "image/png", "form_factor": "narrow", "label": "Menu of drinks and cakes to order ahead" },
    { "src": "screenshots/card.png", "sizes": "1080x1920", "type": "image/png", "form_factor": "narrow", "label": "Bija Card with stamps and points" },
    { "src": "screenshots/shop.png", "sizes": "1920x1080", "type": "image/png", "form_factor": "wide", "label": "Bija web shop on a computer" }
  ]
}
```

Only add the `screenshots` block once the PNGs exist; a manifest that points at missing screenshots makes Chrome skip the rich install sheet.
