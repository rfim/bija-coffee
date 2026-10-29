"""Make responsive versions of every photo in photos/ (run from the repo root: python3 tools/resize-photos.py).

For each photos/<name>.jpg it writes:
  <name>-800.webp            800px wide (or the original width if smaller)
  <name>-1600.webp           up to 1600px wide, only if the original is wider than 800px (never upscaled)
  <name>-800.jpg             800px JPEG fallback, only if the original is wider than 800px
and photos/og-image.jpg (1200x630 social card cropped from shop-3.jpg).
The original <name>.jpg stays as the largest JPEG and the photo viewer's full-size image.
After adding a photo, add its <picture> markup in index.html (copy an existing figure and fix the widths).
"""
import os
from PIL import Image, ImageOps

D = 'photos'
for f in sorted(os.listdir(D)):
    name, ext = os.path.splitext(f)
    if ext != '.jpg' or name.endswith(('-800', '-1600')) or name == 'og-image':
        continue
    im = ImageOps.exif_transpose(Image.open(os.path.join(D, f))).convert('RGB')
    W, H = im.size
    for tag, tw in (('800', 800), ('1600', 1600)):
        if tag == '1600' and W <= 800:
            continue
        w = min(tw, W)
        r = im if w == W else im.resize((w, round(H * w / W)), Image.LANCZOS)
        r.save(os.path.join(D, f'{name}-{tag}.webp'), 'WEBP', quality=76, method=6)
        if tag == '800' and W > 800:
            r.save(os.path.join(D, f'{name}-800.jpg'), 'JPEG', quality=80, optimize=True, progressive=True)
    print(f'{name}: {W}x{H}')

src = Image.open(os.path.join(D, 'shop-3.jpg')).convert('RGB')
ImageOps.fit(src, (1200, 630), Image.LANCZOS).save(os.path.join(D, 'og-image.jpg'), 'JPEG', quality=82, optimize=True, progressive=True)
