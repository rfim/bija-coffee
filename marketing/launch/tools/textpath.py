"""Outline text from the self-hosted woff2 fonts in fonts/ into SVG path data.

The launch graphics and press logos use this so the SVGs carry the real Archivo and
Inter letterforms without depending on a font being installed where they are opened.
Needs fonttools and brotli (pip install fonttools brotli).
"""
from functools import lru_cache
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

FONTS = Path(__file__).resolve().parents[3] / 'fonts'
FILES = {
    'archivo-900': 'archivo-latin-900-normal.woff2',
    'archivo-800': 'archivo-latin-800-normal.woff2',
    'inter-400': 'inter-latin-400-normal.woff2',
    'inter-600': 'inter-latin-600-normal.woff2',
}


class Face:
    def __init__(self, key):
        self.font = TTFont(FONTS / FILES[key])
        self.upm = self.font['head'].unitsPerEm
        self.cmap = self.font.getBestCmap()
        self.glyphs = self.font.getGlyphSet()
        self.hmtx = self.font['hmtx']
        self.kern = self._pair_kerning()

    def _pair_kerning(self):
        """Pair adjustments (GPOS lookup type 2, formats 1 and 2) as {(left, right): x advance}."""
        pairs, cls = {}, []
        if 'GPOS' not in self.font:
            return pairs, cls
        for lookup in self.font['GPOS'].table.LookupList.Lookup:
            for st in lookup.SubTable:
                if lookup.LookupType == 9:
                    st = st.ExtSubTable
                if getattr(st, 'LookupType', lookup.LookupType) != 2:
                    continue
                cov = st.Coverage.glyphs
                if st.Format == 1:
                    for i, first in enumerate(cov):
                        for pvr in st.PairSet[i].PairValueRecord:
                            v = getattr(pvr.Value1, 'XAdvance', 0) if pvr.Value1 else 0
                            if v:
                                pairs.setdefault((first, pvr.SecondGlyph), v)
                elif st.Format == 2:
                    cls.append((set(cov), st.ClassDef1.classDefs, st.ClassDef2.classDefs, st.Class1Record))
        return pairs, cls

    def kern_value(self, a, b):
        pairs, cls = self.kern
        if (a, b) in pairs:
            return pairs[(a, b)]
        for cov, c1, c2, rec in cls:
            if a in cov:
                r = rec[c1.get(a, 0)].Class2Record[c2.get(b, 0)]
                v = getattr(r.Value1, 'XAdvance', 0) if r.Value1 else 0
                if v:
                    return v
        return 0

    def names(self, text):
        return [self.cmap.get(ord(ch), self.cmap[ord('?')]) for ch in text]

    def width(self, text, size, track=0.0):
        """Advance width in px of one line at font size `size`; track is extra spacing in em."""
        g = self.names(text)
        units = sum(self.hmtx[n][0] for n in g) + sum(self.kern_value(a, b) for a, b in zip(g, g[1:]))
        return units * size / self.upm + track * size * max(len(g) - 1, 0)

    def path(self, text, size, x, y, track=0.0, anchor='start'):
        """SVG path data for `text` with its baseline at y. anchor: start, middle or end."""
        w = self.width(text, size, track)
        x0 = x - (w / 2 if anchor == 'middle' else w if anchor == 'end' else 0)
        s = size / self.upm
        pen = SVGPathPen(self.glyphs, ntos=lambda v: f'{v:.1f}'.rstrip('0').rstrip('.'))
        g = self.names(text)
        cx = 0.0
        for i, n in enumerate(g):
            self.glyphs[n].draw(TransformPen(pen, (s, 0, 0, -s, x0 + cx, y)))
            cx += self.hmtx[n][0] * s + track * size
            if i + 1 < len(g):
                cx += self.kern_value(n, g[i + 1]) * s
        return pen.getCommands()


@lru_cache(maxsize=None)
def face(key):
    return Face(key)
