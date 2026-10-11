"""Write web-sized copies of the source photography.

Usage: python3 scripts/resize-images.py <src_dir> <out_dir>

Photos become progressive JPEGs at a few widths (name-800.jpg, name-1600.jpg, ...)
for use in srcset. The logo and Michelin badge stay PNG to keep their transparency.
"""

import sys
from pathlib import Path

from PIL import Image, ImageOps

PHOTO_WIDTHS = (800, 1600)
HERO_WIDTHS = (800, 1600, 2400)
HERO = "april-17"
PNG_WIDTHS = {"logo": 1200, "michelin": 360}


def save_jpeg(img, path, width):
    if img.width > width:
        h = round(img.height * width / img.width)
        img = img.resize((width, h), Image.LANCZOS)
    img.save(path, "JPEG", quality=78, optimize=True, progressive=True)
    return img.size


def main(src_dir, out_dir):
    src_dir, out_dir = Path(src_dir), Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    for src in sorted(src_dir.iterdir()):
        name = src.stem
        with Image.open(src) as im:
            im = ImageOps.exif_transpose(im)
            if name in PNG_WIDTHS:
                im = im.convert("RGBA")
                w = PNG_WIDTHS[name]
                if im.width > w:
                    im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
                im.save(out_dir / f"{name}.png", optimize=True)
                print(f"{name}.png {im.size}")
                continue
            im = im.convert("RGB")
            for w in HERO_WIDTHS if name == HERO else PHOTO_WIDTHS:
                size = save_jpeg(im, out_dir / f"{name}-{w}.jpg", w)
                print(f"{name}-{w}.jpg {size}")


if __name__ == "__main__":
    main(*sys.argv[1:3])
