"""Converts PNG artwork in public/assets to WebP sized for how big it is shown.

Usage: python3 scripts/optimize-images.py public/assets/foo.png [...]
Needs Pillow. Each PNG is replaced by a .webp next to it; update the reference in src/.
Shop item pictures (square, shown at most ~200px) are capped at 512px; room
backgrounds and avatar layers keep their size so layers stay aligned.
"""
import sys
from pathlib import Path

from PIL import Image

ITEM_MAX = 512

for name in sys.argv[1:]:
    path = Path(name)
    image = Image.open(path)
    width, height = image.size
    square = abs(width - height) <= 2
    if square and width > ITEM_MAX:
        image = image.resize((ITEM_MAX, ITEM_MAX), Image.LANCZOS)
    has_alpha = image.mode in ("RGBA", "LA") and image.getchannel("A").getextrema()[0] < 255
    image = image.convert("RGBA" if has_alpha else "RGB")
    out = path.with_suffix(".webp")
    image.save(out, "WEBP", quality=84, method=6, alpha_quality=90)
    print(f"{path} {path.stat().st_size // 1024}KB -> {out.name} {out.stat().st_size // 1024}KB")
    path.unlink()
