"""Build the launch social graphics as self-contained SVGs (fonts embedded).

Run from the repo root:  python3 marketing/launch/assets/build.py
Black and white, Kawung batik pattern, headlines in Archivo 900, small text in Inter 600.
No photos are used, so text never sits on top of a café photo.
"""
import base64, pathlib
from xml.sax.saxutils import escape

ROOT = pathlib.Path(__file__).resolve().parents[3]
OUT = pathlib.Path(__file__).resolve().parent
b64 = lambda p: base64.b64encode((ROOT / p).read_bytes()).decode()
FONTS = f"""<style>
@font-face{{font-family:'Archivo';font-weight:900;src:url(data:font/woff2;base64,{b64('fonts/archivo-latin-900-normal.woff2')}) format('woff2')}}
@font-face{{font-family:'Inter';font-weight:600;src:url(data:font/woff2;base64,{b64('fonts/inter-latin-600-normal.woff2')}) format('woff2')}}
.h{{font-family:Archivo,'Arial Black',sans-serif;font-weight:900;text-transform:uppercase}}
.s{{font-family:Inter,Helvetica,Arial,sans-serif;font-weight:600}}
</style>"""
MARK = '<circle cx="50" cy="25" r="25"/><circle cx="75" cy="50" r="25"/><circle cx="50" cy="75" r="25"/><circle cx="25" cy="50" r="25"/>'

def kawung(pid, ink, cell=120, op=1):
    q = cell / 4
    return (f'<pattern id="{pid}" width="{cell}" height="{cell}" patternUnits="userSpaceOnUse">'
            f'<g fill="{ink}" fill-opacity="{op}">'
            f'<ellipse cx="{2*q}" cy="{q*.93}" rx="{q*.52}" ry="{q*.86}"/><ellipse cx="{2*q}" cy="{q*3.07}" rx="{q*.52}" ry="{q*.86}"/>'
            f'<ellipse cx="{q*.93}" cy="{2*q}" rx="{q*.86}" ry="{q*.52}"/><ellipse cx="{q*3.07}" cy="{2*q}" rx="{q*.86}" ry="{q*.52}"/>'
            f'<circle cx="{2*q}" cy="{2*q}" r="{q*.12}"/></g></pattern>')

def graphic(name, w, h, theme, eyebrow, lines, body, foot, size=None):
    """theme 'dark' = white type on black, 'light' = black type on white. Pattern fills a band; type sits on a solid panel."""
    bg, ink = ('#0b0b0b', '#ffffff') if theme == 'dark' else ('#ffffff', '#0b0b0b')
    pad = 84
    band = 300 if h > 1500 else 220            # Kawung band height at the top
    base = size or (230 if h > 1500 else 180)  # headline size before fitting
    longest = max(len(t) for t in lines)
    size = min(base, int((w - 2 * pad) / (longest * .7)))  # Archivo 900 caps run about .66 em a character
    lead, cap = size * .9, size * .73
    foot_top = h - pad - 110
    block = 30 + 56 + cap + (len(lines) - 1) * lead + 90 + len(body) * 52  # eyebrow, gap, headline, gap, body
    top = band + max(90, (foot_top - band - block) / 2)                  # centre the type between band and footer
    ye = top + 30
    y0 = ye + 56 + cap
    head = ''.join(f'<text class="h" x="{pad}" y="{y0 + i*lead:.0f}" font-size="{size}" letter-spacing="-3" fill="{ink}">{escape(t)}</text>' for i, t in enumerate(lines))
    yb = y0 + (len(lines) - 1) * lead + 100
    body_t = ''.join(f'<text class="s" x="{pad}" y="{yb + i*52:.0f}" font-size="38" fill="{ink}" fill-opacity=".86">{escape(t)}</text>' for i, t in enumerate(body))
    yf = h - pad
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
<title>{escape(' '.join(lines))}</title>{FONTS}
<defs>{kawung('k', ink)}</defs>
<rect width="{w}" height="{h}" fill="{bg}"/>
<rect width="{w}" height="{band}" fill="url(#k)"/>
<rect y="{band}" width="{w}" height="6" fill="{ink}"/>
<g transform="translate({w/2 - 60} {band - 60})"><circle cx="60" cy="60" r="66" fill="{bg}"/><g transform="translate(14 14) scale(.92)" fill="none" stroke="{ink}" stroke-width="5">{MARK}</g></g>
<text class="s" x="{pad}" y="{ye:.0f}" font-size="30" letter-spacing="6" fill="{ink}" fill-opacity=".7">{escape(eyebrow.upper())}</text>
{head}{body_t}
<rect y="{h - 150 - pad + 40}" x="{pad}" width="{w - 2*pad}" height="2" fill="{ink}" fill-opacity=".25"/>
<g transform="translate({pad} {yf - 52}) scale(.56)" fill="none" stroke="{ink}" stroke-width="6">{MARK}</g>
<text class="h" x="{pad + 76}" y="{yf - 4}" font-size="54" letter-spacing="-1" fill="{ink}">BIJA</text>
<text class="s" x="{w - pad}" y="{yf - 10}" font-size="30" text-anchor="end" fill="{ink}" fill-opacity=".8">{escape(foot)}</text>
</svg>'''
    (OUT / f'{name}.svg').write_text(svg)

FEED = [  # 1080 x 1350, grid posts that are graphics (the rest of the grid is real café photos, no text)
    ('feed-01-website', 'dark', 'New · the Bija website', ['Bija is', 'online.'], ['Indonesian beans, the Beans Club and', 'your Bija Card, in one place.'], 'Link in bio'),
    ('feed-03-app', 'light', 'The Bija app', ['Order', 'ahead.'], ['Order from your desk, collect at the', 'window bar. 100 points on your first order.'], '2a St James\'s Market'),
    ('feed-05-beans-club', 'dark', 'The Beans Club', ['10% off', 'every bag.'], ['Fresh Indonesian beans every 2, 3 or 4 weeks.', '£10.80 a bag, free UK delivery. Pause up to 3 days ahead.'], 'Link in bio'),
    ('feed-07-points', 'light', 'Bija Card', ['10 points', 'per £1.'], ['At the bar, in the app and online.', 'Cake 350 · beans 1,200 · 10th drink free.'], 'Terms in the app'),
    ('feed-09-passport', 'dark', 'Origins Passport', ['Collect', 'the', 'islands.'], ['A stamp for each Indonesian origin you taste.', 'Fill the passport: +600 points.'], 'In the Bija app'),
    ('feed-11-secret', 'light', 'Secret St James\'s', ['Ten', 'secrets.'], ['A walking trail of stories around the market,', 'hiding in plain sight. Find all ten: +400.'], 'In the Bija app'),
]
STORIES = [  # 1080 x 1920
    ('story-1-launch', 'dark', 'New', ['Bija,', 'now', 'online.'], ['Shop beans, join the Beans Club,', 'get your Bija Card.'], 'Tap the link'),
    ('story-2-app', 'light', 'Order ahead', ['Skip', 'the', 'queue.'], ['Order in the Bija app, collect at', 'the window bar.'], 'Tap the link'),
    ('story-3-beans-club', 'dark', 'The Beans Club', ['10%', 'off,', 'always.'], ['Every 2, 3 or 4 weeks. Free UK delivery.', 'Skip, pause or cancel up to 3 days ahead.'], 'Tap the link'),
    ('story-4-card', 'light', 'Bija Card', ['Show', 'your', 'QR.'], ['The barista scans it, the points land.', '10 points per £1.'], 'Get the app'),
    ('story-5-passport', 'dark', 'Origins Passport', ['Five', 'origins,', 'five', 'stamps.'], ['One stamp for each origin you taste.', 'Fill the passport for +600 points.'], 'Get the app'),
    ('story-6-secret', 'light', 'Secret St James\'s', ['Find', 'all', 'ten.'], ['A trail of stories around the market.', 'Finish it for +400 points.'], 'Get the app'),
]
for n, t, e, l, b, f in FEED: graphic(n, 1080, 1350, t, e, l, b, f)
for n, t, e, l, b, f in STORIES: graphic(n, 1080, 1920, t, e, l, b, f)
print('built', len(FEED) + len(STORIES), 'graphics in', OUT)
