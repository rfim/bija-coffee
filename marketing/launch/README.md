# Bija London launch kit

| File | What it is |
|---|---|
| `plan.md` | The 4-week launch plan: daily actions, owner minutes, KPIs |
| `instagram-grid.md` | 12 feed posts: order, captions, alt text, hashtags |
| `stories.md` | 6 Stories scripts |
| `newsletter.md` | The launch newsletter |
| `in-store.md` | Copy for the till card, table talker and QR poster |
| `graphics/` | Social graphics as SVG: `feed-*` at 1080 × 1350, `story-*` at 1080 × 1920 |
| `graphics/png/` | The same graphics as PNG, ready to upload |
| `tools/` | Scripts that rebuild the graphics and the press logos in `/press` |

Anything not yet confirmed by Bija is marked in an HTML comment (`<!-- Unconfirmed: … -->`).

## Rebuilding the graphics

```sh
pip install fonttools brotli
python3 marketing/launch/tools/build_graphics.py   # writes graphics/*.svg and press/*.svg
node marketing/launch/tools/render.js              # writes graphics/png/*.png (uses Playwright)
```

Headlines are set in Archivo and body text in Inter, both from `fonts/`. The text is turned into outlines, so the SVGs look the same wherever they're opened. Words only sit on solid black or white, never on the Kawung pattern or on café photos.
