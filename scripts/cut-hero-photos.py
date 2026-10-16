"""Cut studio/phone photos to transparent WebP for the hero slider."""
from pathlib import Path
import io
import json
import numpy as np
from PIL import Image
from rembg import new_session, remove

ASSETS = Path(r"C:\Users\yoela\.cursor\projects\c-Users-yoela-Desktop-cokies\assets")
OUT = Path(r"C:\Users\yoela\Desktop\cokies\public\cookies")
DEBUG = Path(r"C:\Users\yoela\Desktop\cokies\scripts\_cut-debug")
OUT.mkdir(parents=True, exist_ok=True)
DEBUG.mkdir(parents=True, exist_ok=True)

JOBS = [
    ("222215orxd15orx-65226b0b-2fd8-4e1b-bc02-c12fd9da01a4.jpg", "monster-midnight", "u2net"),
    ("Gemini_Generated_Image_5orxd15orxd15orx-c1991e41-e0a0-4e07-b5fe-0be4eb0c8886.jpg", "monster-slime", "u2net"),
    ("Gemini_2rxd15orx-84724ece-d519-4d39-b179-e1b11ae632a4.jpg", "concha-galaxia", "u2net"),
    ("Gemini_Generate2orxd15orxd15orx-2e24fa9e-ef33-4002-aec2-dcc7c06f2439.jpg", "concha-botones", "u2net"),
    ("PXL_20260918_204416940-b0b14d30-07ca-4a78-88cd-c1e93e0061b4.jpg", "cinnamon-monster-held", "u2net"),
    ("Gemini_Generated_Image_c19bt4c19bt4c19b-a82feaf2-4520-4fca-a3b5-8e45827fb59f.jpg", "hand", "u2net_human_seg"),
]


def find_src(token):
    matches = [p for p in ASSETS.iterdir() if token in p.name]
    if not matches:
        raise FileNotFoundError(token)
    return matches[0]


def crop_alpha(im, pad_ratio=0.02):
    a = np.array(im.getchannel("A"))
    ys, xs = np.where(a > 12)
    if len(xs) == 0:
        return im
    x0, x1 = int(xs.min()), int(xs.max()) + 1
    y0, y1 = int(ys.min()), int(ys.max()) + 1
    pad = int(max(im.size) * pad_ratio)
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
    x1, y1 = min(im.width, x1 + pad), min(im.height, y1 + pad)
    return im.crop((x0, y0, x1, y1))


def despill_white(im, thresh=238):
    """Knock down leftover white halo on studio shots."""
    arr = np.array(im).astype(np.float32)
    rgb, a = arr[..., :3], arr[..., 3]
    mx = rgb.max(axis=2)
    near = (mx > thresh) & (a > 0)
    # pull near-white pixels toward transparent
    fade = np.clip((mx - thresh) / (255 - thresh), 0, 1)
    a2 = a.copy()
    a2[near] = a[near] * (1 - fade[near] * 0.92)
    arr[..., 3] = a2
    return Image.fromarray(arr.astype(np.uint8), "RGBA")


def save_webp(im, path, max_side=1600, quality=90):
    im = im.convert("RGBA")
    w, h = im.size
    if max(w, h) > max_side:
        scale = max_side / max(w, h)
        im = im.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)
    im.save(path, "WEBP", quality=quality, method=6)
    return im


def save_thumb(im, path, side=320):
    t = im.copy()
    t.thumbnail((side, side), Image.Resampling.LANCZOS)
    t.save(path, "WEBP", quality=82, method=6)


def split_hand(im):
    """
    Grabbing hand, wrist on the right, thumb below the pinch.
    Front = thumb (below a diagonal through the webbing).
    Back = fingers + palm (thumb punched out).
    """
    arr = np.array(im)
    h, w = arr.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    # Line from ~35% x / 58% y (webbing) to 100% x / 78% y (below wrist)
    # Thumb is BELOW this line.
    x0, y0 = 0.28 * w, 0.52 * h
    x1, y1 = 1.02 * w, 0.82 * h
    # cross product sign: below the line
    below = ((xx - x0) * (y1 - y0) - (yy - y0) * (x1 - x0)) > 0
    front = arr.copy()
    back = arr.copy()
    front[..., 3] = np.where(below, front[..., 3], 0)
    back[..., 3] = np.where(below, 0, back[..., 3])
    return Image.fromarray(back), Image.fromarray(front)


def main():
    sessions = {}
    report = {}
    for token, name, model in JOBS:
        src = find_src(token)
        print(f"cut {name} <- {src.name} ({model})")
        if model not in sessions:
            sessions[model] = new_session(model)
        raw = Image.open(src).convert("RGBA")
        cut = remove(raw, session=sessions[model])
        if not isinstance(cut, Image.Image):
            cut = Image.open(io.BytesIO(cut)).convert("RGBA")
        cut = cut.convert("RGBA")
        if name != "cinnamon-monster-held":
            cut = despill_white(cut)
        cut = crop_alpha(cut)
        png_debug = DEBUG / f"{name}.png"
        cut.save(png_debug)
        if name == "hand":
            back, front = split_hand(cut)
            back = crop_alpha(back, 0.01)
            front = crop_alpha(front, 0.01)
            # keep full hand too, for alignment
            save_webp(cut, OUT / "hand.webp", max_side=1400)
            save_webp(back, OUT / "hand-back.webp", max_side=1400)
            save_webp(front, OUT / "hand-front.webp", max_side=1400)
            back.save(DEBUG / "hand-back.png")
            front.save(DEBUG / "hand-front.png")
            report[name] = {"size": cut.size, "back": back.size, "front": front.size}
        else:
            out = save_webp(cut, OUT / f"{name}.webp")
            save_thumb(out, OUT / f"{name}-thumb.webp")
            report[name] = {"size": out.size}
    (DEBUG / "report.json").write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
