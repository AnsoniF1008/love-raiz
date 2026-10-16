"""Refine hand layers (same canvas) and extract the cinnamon roll from the held photo."""
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

DEBUG = Path(r"C:\Users\yoela\Desktop\cokies\scripts\_cut-debug")
OUT = Path(r"C:\Users\yoela\Desktop\cokies\public\cookies")

hand = Image.open(DEBUG / "hand.png").convert("RGBA")
w, h = hand.size
print("hand", w, h)

# Tight polygon around the thumb digit only (same coordinate space as full hand).
thumb_pct = [
    (0.190, 0.74),
    (0.205, 0.61),
    (0.30, 0.535),
    (0.42, 0.505),
    (0.505, 0.498),
    (0.535, 0.56),
    (0.525, 0.70),
    (0.44, 0.855),
    (0.30, 0.875),
    (0.195, 0.81),
]
poly = [(int(x * w), int(y * h)) for x, y in thumb_pct]
mask = Image.new("L", (w, h), 0)
ImageDraw.Draw(mask).polygon(poly, fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(2.4))

arr = np.array(hand)
m = np.array(mask).astype(np.float32) / 255.0
front = arr.copy()
front[..., 3] = (front[..., 3].astype(np.float32) * m).astype(np.uint8)
# Keep the full hand behind the cookie; only the thumb is painted in front.
back_im = hand
front_im = Image.fromarray(front)
front_im.save(DEBUG / "hand-front.png")
back_im.save(DEBUG / "hand-back.png")
hand.save(OUT / "hand.webp", "WEBP", quality=90, method=6)
front_im.save(OUT / "hand-front.webp", "WEBP", quality=90, method=6)
back_im.save(OUT / "hand-back.webp", "WEBP", quality=90, method=6)
print("saved hand layers", w, h)

held = Image.open(DEBUG / "cinnamon-monster-held.png").convert("RGBA")
hw, hh = held.size
print("held", hw, hh)
yy, xx = np.mgrid[0:hh, 0:hw]
cx, cy, rx, ry = 0.32 * hw, 0.28 * hh, 0.34 * hw, 0.32 * hh
inside = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 <= 1.0
carr = np.array(held)
carr[..., 3] = np.where(inside, carr[..., 3], 0)
cin = Image.fromarray(carr)
a = carr[..., 3]
ys, xs = np.where(a > 12)
cin = cin.crop((max(0, xs.min() - 4), max(0, ys.min() - 4), min(hw, xs.max() + 5), min(hh, ys.max() + 5)))
cin.save(DEBUG / "cinnamon-monster.png")
cin.save(OUT / "cinnamon-monster.webp", "WEBP", quality=90, method=6)
t = cin.copy()
t.thumbnail((320, 320), Image.Resampling.LANCZOS)
t.save(OUT / "cinnamon-monster-thumb.webp", "WEBP", quality=82, method=6)
print("cinnamon cookie", cin.size)
