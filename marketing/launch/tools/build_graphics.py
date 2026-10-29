"""Build the launch social graphics (SVG) in marketing/launch/graphics/.

Black and white, Kawung pattern, Archivo headlines and Inter body text outlined from fonts/.
Text only sits on solid black or white, never on the pattern and never on café photos.
Run: python3 marketing/launch/tools/build_graphics.py
"""
from html import escape
from pathlib import Path

from textpath import face

OUT = Path(__file__).resolve().parents[1] / 'graphics'
W = 1080
M = 72  # side margin
MARK = [(50, 25), (75, 50), (50, 75), (25, 50)]


def colours(dark):
    return ('#0b0b0b', '#ffffff') if dark else ('#ffffff', '#0b0b0b')


def kawung_defs(pid, ink, bg, size=150):
    """One Kawung tile: four petals round a centre, half petals on the edges, each petal with a seed."""
    h, r1, r2 = size / 2, size * 0.13, size * 0.23
    petals = []
    for cx, cy, rx, ry in [(h, h / 2, r1, r2), (h, h * 1.5, r1, r2), (h / 2, h, r2, r1), (h * 1.5, h, r2, r1),
                           (0, h / 2, r1, r2), (size, h / 2, r1, r2), (0, h * 1.5, r1, r2), (size, h * 1.5, r1, r2),
                           (h / 2, 0, r2, r1), (h * 1.5, 0, r2, r1), (h / 2, size, r2, r1), (h * 1.5, size, r2, r1)]:
        petals.append(f'<ellipse cx="{cx:g}" cy="{cy:g}" rx="{rx:g}" ry="{ry:g}" fill="{ink}"/>'
                      f'<ellipse cx="{cx:g}" cy="{cy:g}" rx="{rx * .32:g}" ry="{ry * .32:g}" fill="{bg}"/>')
    dots = ''.join(f'<circle cx="{x:g}" cy="{y:g}" r="{size * .035:g}" fill="{ink}"/>' for x, y in [(0, 0), (size, 0), (0, size), (size, size), (h, h)])
    return (f'<pattern id="{pid}" width="{size}" height="{size}" patternUnits="userSpaceOnUse">'
            f'<rect width="{size}" height="{size}" fill="{bg}"/>{"".join(petals)}{dots}</pattern>')


def mark(x, y, s, stroke):
    """The Bija mark: four interlocking circles, s px wide."""
    k = s / 104
    circles = ''.join(f'<circle cx="{cx}" cy="{cy}" r="25"/>' for cx, cy in MARK)
    return (f'<g transform="translate({x:g} {y:g}) scale({k:.4f}) translate(2 2)" fill="none" stroke="{stroke}" '
            f'stroke-width="5">{circles}</g>')


def txt(key, s, size, x, y, fill, track=0.0, anchor='start'):
    return f'<path fill="{fill}" d="{face(key).path(s, size, x, y, track, anchor)}"/>'


def fit(key, lines, size, maxw, track=-0.01):
    widest = max(face(key).width(l, 1, track) for l in lines)
    return min(size, maxw / widest)


def brandbar(y, ink, label):
    out = [mark(M, y - 40, 48, ink), txt('archivo-900', 'BIJA', 46, M + 64, y, ink, -0.02)]
    if label:
        out.append(txt('inter-600', label.upper(), 22, W - M, y - 8, ink, 0.14, 'end'))
    return ''.join(out)


def headline(lines, y, ink, size, maxw=W - 2 * M, lead=0.92):
    lines = [l.upper() for l in lines]
    size = fit('archivo-900', lines, size, maxw)
    out, base = [], y + size * 0.74
    for l in lines:
        out.append(txt('archivo-900', l, size, M, base, ink, -0.01))
        base += size * lead
    return ''.join(out), base - size * lead + size * 0.26


def body(lines, y, ink, size=36, lead=1.38):
    out, base = [], y + size
    for l in lines:
        out.append(txt('inter-400', l, size, M, base, ink))
        base += size * lead
    return ''.join(out), base


def pill(label, x, y, ink, bg, size=26, h=76):
    w = face('inter-600').width(label.upper(), size, 0.1) + 2 * 40
    return (f'<rect x="{x:g}" y="{y:g}" width="{w:.0f}" height="{h}" rx="{h / 2:g}" fill="{ink}"/>'
            + txt('inter-600', label.upper(), size, x + w / 2, y + h / 2 + size * 0.36, bg, 0.1, 'middle'))


# ---------- motifs: drawn on a solid card that sits in the Kawung panel ----------
def card(x, y, w, h, bg, ink):
    return f'<rect x="{x:g}" y="{y:g}" width="{w:g}" height="{h:g}" rx="28" fill="{bg}" stroke="{ink}" stroke-width="6"/>'


def m_launch(cx, cy, ink, bg):
    return f'<circle cx="{cx}" cy="{cy}" r="190" fill="{bg}" stroke="{ink}" stroke-width="6"/>' + mark(cx - 130, cy - 130, 260, ink)


def m_club(cx, cy, ink, bg):
    w, h = 600, 330
    out = [card(cx - w / 2, cy - h / 2, w, h, bg, ink),
           txt('archivo-900', '10%', 190, cx, cy + 40, ink, -0.02, 'middle'),
           txt('inter-600', 'OFF EVERY BAG', 26, cx, cy + 110, ink, 0.16, 'middle')]
    return ''.join(out)


def m_stamps(cx, cy, ink, bg):
    w, h, r = 720, 330, 46
    out = [card(cx - w / 2, cy - h / 2, w, h, bg, ink)]
    for i in range(10):
        x = cx - 2 * 124 + (i % 5) * 124
        y = cy - 70 + (i // 5) * 140
        if i < 9:
            out.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{ink}"/>' + mark(x - 26, y - 26, 52, bg))
        else:
            out.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{bg}" stroke="{ink}" stroke-width="5" stroke-dasharray="10 8"/>'
                       + txt('archivo-900', 'FREE', 24, x, y + 9, ink, 0, 'middle'))
    return ''.join(out)


def m_passport(cx, cy, ink, bg):
    out = []
    for dx, dy, rot, l1, l2 in [(-190, -60, -8, 'SUMATRA', 'MANDHELING'), (170, -95, 6, 'OLD BROWN', 'JAVA'), (40, 95, -3, 'SUMATRA', 'LINTONG')]:
        w, h = 360, 170
        g = (f'<rect x="{-w / 2}" y="{-h / 2}" width="{w}" height="{h}" rx="22" fill="{bg}" stroke="{ink}" stroke-width="6"/>'
             f'<rect x="{-w / 2 + 14}" y="{-h / 2 + 14}" width="{w - 28}" height="{h - 28}" rx="12" fill="none" stroke="{ink}" stroke-width="2.5" stroke-dasharray="8 7"/>'
             + txt('inter-600', l1, 24, 0, -16, ink, 0.18, 'middle') + txt('archivo-900', l2, fit('archivo-900', [l2], 56, w - 64), 0, 42, ink, -0.01, 'middle'))
        out.append(f'<g transform="translate({cx + dx} {cy + dy}) rotate({rot})">{g}</g>')
    return ''.join(out)


def m_trail(cx, cy, ink, bg):
    w, h = 760, 340
    pts = [(-290, 90), (-150, -70), (10, 40), (150, -90), (290, 60)]
    d = 'M' + ' '.join(f'{cx + x},{cy + y}' for x, y in pts)
    out = [card(cx - w / 2, cy - h / 2, w, h, bg, ink),
           f'<path d="{d}" fill="none" stroke="{ink}" stroke-width="6" stroke-dasharray="4 16" stroke-linecap="round" stroke-linejoin="round"/>']
    for i, (x, y) in enumerate(pts, 1):
        out.append(f'<circle cx="{cx + x}" cy="{cy + y}" r="38" fill="{ink}"/>' + txt('archivo-900', str(i), 40, cx + x, cy + y + 15, bg, 0, 'middle'))
    return ''.join(out)


def m_award(cx, cy, ink, bg):
    w, h = 560, 380
    out = [card(cx - w / 2, cy - h / 2, w, h, bg, ink), mark(cx - 60, cy - 150, 120, ink),
           txt('inter-600', 'LONDON COFFEE FESTIVAL', 24, cx, cy + 40, ink, 0.14, 'middle'),
           txt('inter-600', 'AWARDS', 24, cx, cy + 78, ink, 0.14, 'middle'),
           txt('archivo-900', '2025', 72, cx, cy + 160, ink, -0.01, 'middle')]
    return ''.join(out)


MOTIF = {'launch': m_launch, 'club': m_club, 'stamps': m_stamps, 'passport': m_passport, 'trail': m_trail, 'award': m_award}

# slug, motif, dark?, label, headline lines, body lines, call to action
POSTS = [
    ('01-launch', 'launch', True, 'Now live', ['Bija, now', 'in your pocket'],
     ['Web shop, Beans Club, Bija Card and', 'the app. Indonesian coffee, St James’s.'], 'Link in bio'),
    ('02-beans-club', 'club', False, 'Beans Club', ['10% off', 'every bag'],
     ['Fresh beans delivered every 2, 3 or', '4 weeks, from the Bija web shop.'], 'Join the Beans Club'),
    ('03-bija-card', 'stamps', True, 'Bija Card', ['Your 10th', 'drink is free'],
     ['Collect a stamp with every drink and', 'earn points on the Bija Card.'], 'Get the app'),
    ('04-bean-passport', 'passport', False, 'Bean passport', ['Scan it.', 'Meet your coffee'],
     ['Scan the QR on your bag or cup to see', 'where your coffee comes from.'], 'Scan in store'),
    ('05-secret-st-jamess', 'trail', True, 'In the app', ['Secret', 'St James’s'],
     ['A walking trail through St James’s,', 'in the Bija app.'], 'Start the trail'),
    ('06-award', 'award', False, 'Best New Coffee Shop', ['Best New', 'Coffee Shop'],
     ['Thank you, London. Come and taste', 'why at 2a St James’s Market.'], 'Visit us'),
]


def svg(fmt, slug, motif, dark, label, head, lines, cta):
    bg, ink = colours(dark)
    H = 1350 if fmt == 'feed' else 1920
    pid = f'kw-{fmt}-{slug}'
    parts = [f'<rect width="{W}" height="{H}" fill="{bg}"/>']
    if fmt == 'feed':
        py, ph, top, foot = 170, 470, 112, H - 72
    else:
        py, ph, top, foot = 0, 820, 0, H - 300   # story: keep words between 250 and 1670 for the Instagram UI
    parts.append(f'<rect x="0" y="{py}" width="{W}" height="{ph}" fill="url(#{pid})"/>')
    if fmt == 'story':
        parts.append(f'<rect x="0" y="{H - 200}" width="{W}" height="200" fill="url(#{pid})"/>')
    parts.append(MOTIF[motif](W // 2, py + ph // 2 + (60 if fmt == 'story' else 0), ink, bg))
    if fmt == 'feed':
        parts.append(brandbar(top, ink, label))
        h, y = headline(head, 700, ink, 150)
        b, y = body(lines, y + 34, ink, 36)
        parts += [h, b]
        parts.append(f'<rect x="{M}" y="{foot - 52}" width="{W - 2 * M}" height="3" fill="{ink}"/>')
        parts.append(txt('inter-600', '@BIJA.LONDON', 24, M, foot, ink, 0.12))
        parts.append(txt('inter-600', cta.upper(), 24, W - M, foot, ink, 0.12, 'end'))
    else:
        parts.append(f'<rect x="0" y="{ph - 40}" width="{W}" height="40" fill="{bg}"/>')
        parts.append(brandbar(ph + 90, ink, label))
        h, y = headline(head, ph + 150, ink, 170)
        b, y = body(lines, y + 40, ink, 38)
        parts += [h, b, pill(cta, M, min(y + 50, 1580), ink, bg)]
        parts.append(txt('inter-600', '@BIJA.LONDON · 2A ST JAMES’S MARKET', 24, M, 1660, ink, 0.12))
    title = ' '.join(head)
    desc = f'Bija, {label}. {title}. {" ".join(lines)} {cta}. @bija.london. Black and white Kawung pattern.'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-labelledby="t d">'
            f'<title id="t">{escape(title)}</title><desc id="d">{escape(desc)}</desc>'
            f'<defs>{kawung_defs(pid, ink, bg)}</defs>{"".join(parts)}</svg>\n')


def logos(dest):
    """Press logos: the mark alone, and the mark with the BIJA wordmark, in black and in white."""
    for name, fill in [('black', '#0b0b0b'), ('white', '#ffffff')]:
        (dest / f'bija-mark-{name}.svg').write_text(
            f'<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="-2 -2 104 104" role="img" aria-labelledby="t">'
            f'<title id="t">Bija mark</title><g fill="none" stroke="{fill}" stroke-width="5">'
            + ''.join(f'<circle cx="{x}" cy="{y}" r="25"/>' for x, y in MARK) + '</g></svg>\n')
        word = face('archivo-900')
        size, gap, mk = 200, 40, 176
        ww = word.width('BIJA', size, -0.02)
        w, h = mk + gap + ww, 200
        (dest / f'bija-logo-{name}.svg').write_text(
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{w:.0f}" height="{h}" viewBox="0 0 {w:.0f} {h}" role="img" aria-labelledby="t">'
            f'<title id="t">Bija</title>' + mark(0, (h - mk) / 2, mk, fill).replace('stroke-width="5"', 'stroke-width="5.5"')
            + txt('archivo-900', 'BIJA', size, mk + gap, h / 2 + size * 0.36, fill, -0.02) + '</svg>\n')


if __name__ == '__main__':
    OUT.mkdir(exist_ok=True)
    for fmt in ('feed', 'story'):
        for p in POSTS:
            (OUT / f'{fmt}-{p[0]}.svg').write_text(svg(fmt, *p))
    logos(Path(__file__).resolve().parents[3] / 'press')
    print('built', len(POSTS) * 2, 'graphics and 4 logos')
