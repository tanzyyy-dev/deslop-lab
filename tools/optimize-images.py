#!/usr/bin/env python3
"""Convert a PNG to a resized WebP (and keep the aspect ratio).

usage: python3 tools/optimize-images.py <src.png> <dst.webp> <max-width> [quality]
Requires Pillow (pip install Pillow). Used from STEP 2-6 onward; earlier steps keep their original PNGs.
"""
import sys
from PIL import Image

src, dst, max_w = sys.argv[1], sys.argv[2], int(sys.argv[3])
q = int(sys.argv[4]) if len(sys.argv) > 4 else 80
im = Image.open(src).convert("RGB")
if im.width > max_w:
    im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
im.save(dst, "WEBP", quality=q, method=6)
print(f"{dst}: {im.width}x{im.height}")
