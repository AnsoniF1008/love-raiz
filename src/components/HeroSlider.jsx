/**
 * HeroSlider — Love Raíz
 * Each product sits on a rotating plate. Changing slide turns the plate one
 * notch, the toppings burst out around it and the page tint follows the product.
 *
 * Stack: React + Tailwind + Framer Motion. No other dependencies.
 *
 * Usage:
 *   <HeroSlider
 *     products={products}                 // optional, defaults to DEFAULT_PRODUCTS
 *     onAddToBag={(p) => addToBag(p.id)}
 *     onBuildBox={() => navigate("/build-a-box")}
 *   />
 *
 * Product shape (map your Firestore docs to this):
 *   {
 *     id, title, titleAccent?, description, price,
 *     image,            // transparent PNG/WebP of the cookie, ideally top-down, square
 *     thumb?,           // small version for the picker (falls back to image)
 *     theme: { bg, blob },
 *     bits?: Bit[]      // floating toppings, see BITS below
 *   }
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const INK = "#2A1A15";
const INK_SOFT = "#5B3A33";

// t: type · x,y: % of stage · s: size (% of stage width) · r: rotation
// d: depth 0..1 (parallax + layer, >0.6 floats in front of the hand) · c: color
const MONSTER = ["#F47B20", "#B5E03C", "#8E7CC3", "#1E1B22"];
const BITS = {
  midnight: [
    { t: "eye", x: 12, y: 22, s: 9, r: -12, d: 0.9 },
    { t: "sprinkle", x: 84, y: 12, s: 11, r: 35, d: 0.4, c: MONSTER[0] },
    { t: "sprinkle", x: 6, y: 62, s: 12, r: -50, d: 0.7, c: MONSTER[1] },
    { t: "sprinkle", x: 90, y: 50, s: 9, r: 80, d: 0.3, c: MONSTER[2] },
    { t: "dot", x: 24, y: 88, s: 4.5, r: 0, d: 0.5, c: MONSTER[2] },
    { t: "dot", x: 72, y: 4, s: 3.5, r: 0, d: 0.2, c: MONSTER[0] },
    { t: "eye", x: 80, y: 30, s: 6, r: 20, d: 0.35, blur: 1.5 },
    { t: "sprinkle", x: 40, y: 2, s: 8, r: -20, d: 0.25, c: MONSTER[3] },
  ],
  slime: [
    { t: "eye", x: 86, y: 18, s: 8.5, r: 15, d: 0.85 },
    { t: "sprinkle", x: 10, y: 16, s: 12, r: -35, d: 0.6, c: MONSTER[0] },
    { t: "sprinkle", x: 4, y: 58, s: 9, r: 60, d: 0.3, c: MONSTER[2] },
    { t: "chip", x: 88, y: 52, s: 7, r: 25, d: 0.7, c: "#4A2C20" },
    { t: "chip", x: 30, y: 90, s: 5.5, r: -30, d: 0.4, c: "#4A2C20" },
    { t: "sprinkle", x: 66, y: 3, s: 10, r: 10, d: 0.45, c: "#1E1B22" },
    { t: "dot", x: 18, y: 38, s: 3.5, r: 0, d: 0.2, c: MONSTER[1] },
  ],
  chip: [
    { t: "chip", x: 10, y: 20, s: 10, r: -25, d: 0.9, c: "#4A2C20" },
    { t: "chip", x: 86, y: 14, s: 7, r: 30, d: 0.4, c: "#5A3626" },
    { t: "chip", x: 90, y: 56, s: 8.5, r: -10, d: 0.7, c: "#4A2C20" },
    { t: "crumb", x: 6, y: 64, s: 6, r: 40, d: 0.5, c: "#D9A566" },
    { t: "crumb", x: 28, y: 92, s: 4.5, r: -20, d: 0.3, c: "#C98F50" },
    { t: "chip", x: 60, y: 2, s: 5, r: 60, d: 0.2, c: "#5A3626", blur: 1.5 },
    { t: "sugar", x: 20, y: 44, s: 3, r: 15, d: 0.25, c: "#FFFFFF" },
  ],
  rosa: [
    { t: "heart", x: 10, y: 20, s: 9, r: -18, d: 0.85, c: "#D6336C" },
    { t: "heart", x: 88, y: 48, s: 6, r: 22, d: 0.45, c: "#F28CA5" },
    { t: "sugar", x: 84, y: 12, s: 4.5, r: 10, d: 0.6, c: "#FFFFFF" },
    { t: "sugar", x: 6, y: 60, s: 3.5, r: 40, d: 0.3, c: "#FFFFFF" },
    { t: "dot", x: 26, y: 90, s: 4, r: 0, d: 0.4, c: "#D6336C" },
    { t: "crumb", x: 62, y: 3, s: 5, r: 30, d: 0.25, c: "#F4D9B8" },
  ],
  talavera: [
    { t: "chip", x: 10, y: 18, s: 9, r: -40, d: 0.85, c: "#2447A8" },
    { t: "dot", x: 86, y: 14, s: 6, r: 0, d: 0.5, c: "#2447A8" },
    { t: "chip", x: 90, y: 54, s: 7, r: 140, d: 0.7, c: "#2447A8" },
    { t: "dot", x: 6, y: 58, s: 4, r: 0, d: 0.3, c: "#4C6FD1" },
    { t: "chip", x: 30, y: 92, s: 5.5, r: 200, d: 0.4, c: "#4C6FD1" },
    { t: "dot", x: 64, y: 3, s: 3.5, r: 0, d: 0.2, c: "#2447A8", blur: 1.5 },
  ],
  estrella: [
    { t: "star", x: 10, y: 20, s: 11, r: -15, d: 0.9, c: "#FFC928" },
    { t: "star", x: 88, y: 50, s: 7, r: 20, d: 0.5, c: "#FFC928" },
    { t: "star", x: 84, y: 10, s: 5, r: 35, d: 0.3, c: "#E23B3B" },
    { t: "dot", x: 6, y: 62, s: 4, r: 0, d: 0.4, c: "#E23B3B" },
    { t: "sugar", x: 28, y: 90, s: 4, r: 25, d: 0.35, c: "#FFFFFF" },
    { t: "star", x: 60, y: 2, s: 4, r: -30, d: 0.2, c: "#FFC928", blur: 1.5 },
  ],
  galaxia: [
    { t: "dot", x: 10, y: 18, s: 8, r: 0, d: 0.85, c: "#1F6F7A" },
    { t: "dot", x: 86, y: 14, s: 6, r: 0, d: 0.45, c: "#8B3A62" },
    { t: "sprinkle", x: 90, y: 52, s: 9, r: 40, d: 0.7, c: "#1F6F7A" },
    { t: "sprinkle", x: 8, y: 60, s: 8, r: -30, d: 0.35, c: "#8B3A62" },
    { t: "dot", x: 28, y: 90, s: 4.5, r: 0, d: 0.4, c: "#3A8A96" },
    { t: "dot", x: 62, y: 3, s: 3.5, r: 0, d: 0.2, c: "#8B3A62", blur: 1.5 },
  ],
  botones: [
    { t: "dot", x: 12, y: 20, s: 9, r: 0, d: 0.9, c: "#1A1A1A" },
    { t: "heart", x: 86, y: 16, s: 7, r: 18, d: 0.5, c: "#7B5EA7" },
    { t: "sugar", x: 88, y: 54, s: 4.5, r: 10, d: 0.65, c: "#FFFFFF" },
    { t: "sugar", x: 8, y: 58, s: 3.5, r: 40, d: 0.3, c: "#FFFFFF" },
    { t: "dot", x: 30, y: 90, s: 5, r: 0, d: 0.4, c: "#7B5EA7" },
    { t: "crumb", x: 60, y: 3, s: 5, r: 25, d: 0.25, c: "#C4A882" },
  ],
};

// Replace names / copy / prices with your real catalogue (or feed `products` from Firestore).
export const DEFAULT_PRODUCTS = [
  {
    id: "monster-midnight",
    title: "Midnight",
    titleAccent: "Monster",
    description: "Black cocoa dough, dark chocolate chips and a fistful of Halloween sprinkles.",
    price: 5.5,
    image: import.meta.env.BASE_URL + "cookies/monster-midnight.webp",
    thumb: import.meta.env.BASE_URL + "cookies/monster-midnight-thumb.webp",
    theme: { bg: "#E7DDF4", blob: "#C9B4EA" },
    bits: BITS.midnight,
  },
  {
    id: "monster-slime",
    title: "Slime",
    titleAccent: "Monster",
    description: "Buttery green dough, milk chocolate chips, candy eyes looking right back at you.",
    price: 5.5,
    image: import.meta.env.BASE_URL + "cookies/monster-slime.webp",
    thumb: import.meta.env.BASE_URL + "cookies/monster-slime-thumb.webp",
    theme: { bg: "#DCEEC8", blob: "#B5DA8E" },
    bits: BITS.slime,
  },
  {
    id: "concha-galaxia",
    title: "Concha",
    titleAccent: "Galaxia",
    description: "A marbled teal and magenta sugar shell, scored like a classic concha.",
    price: 4.5,
    image: import.meta.env.BASE_URL + "cookies/concha-galaxia.webp",
    thumb: import.meta.env.BASE_URL + "cookies/concha-galaxia-thumb.webp",
    theme: { bg: "#D9E4EA", blob: "#7BA8B0" },
    bits: BITS.galaxia,
  },
  {
    id: "concha-botones",
    title: "Concha",
    titleAccent: "Botones",
    description: "Vanilla shell, button eyes, a stitched chocolate smile and a violet flower.",
    price: 4.5,
    image: import.meta.env.BASE_URL + "cookies/concha-botones.webp",
    thumb: import.meta.env.BASE_URL + "cookies/concha-botones-thumb.webp",
    theme: { bg: "#F3E6D4", blob: "#D9C4A8" },
    bits: BITS.botones,
  },
  {
    id: "chocolate-chip",
    title: "Classic",
    titleAccent: "Chocolate Chip",
    description: "Brown butter, crackly edges, soft middle. The one everybody asks for.",
    price: 4.5,
    image: import.meta.env.BASE_URL + "cookies/chocolate-chip.webp",
    thumb: import.meta.env.BASE_URL + "cookies/chocolate-chip-thumb.webp",
    theme: { bg: "#F6E4C6", blob: "#EBC88F" },
    bits: BITS.chip,
  },
  {
    id: "concha-rosa",
    title: "Concha",
    titleAccent: "Rosa",
    description: "Pillowy sweet bread under a strawberry-pink sugar shell, scored by hand.",
    price: 4.0,
    image: import.meta.env.BASE_URL + "cookies/concha-rosa.webp",
    thumb: import.meta.env.BASE_URL + "cookies/concha-rosa-thumb.webp",
    theme: { bg: "#F6C6C6", blob: "#F2A1A8" },
    bits: BITS.rosa,
  },
  {
    id: "concha-talavera",
    title: "Concha",
    titleAccent: "Talavera",
    description: "Vanilla shell hand-painted in cobalt, after the tiles of Puebla.",
    price: 4.5,
    image: import.meta.env.BASE_URL + "cookies/concha-talavera.webp",
    thumb: import.meta.env.BASE_URL + "cookies/concha-talavera-thumb.webp",
    theme: { bg: "#DCE6F7", blob: "#AFC4EE" },
    bits: BITS.talavera,
  },
  {
    id: "concha-estrella",
    title: "Concha",
    titleAccent: "Estrella",
    description: "Bright red shell, one big golden star. Made to be the centre of the box.",
    price: 4.5,
    image: import.meta.env.BASE_URL + "cookies/concha-estrella.webp",
    thumb: import.meta.env.BASE_URL + "cookies/concha-estrella-thumb.webp",
    theme: { bg: "#FBE2AE", blob: "#F7C356" },
    bits: BITS.estrella,
  },
];

/* ------------------------------------------------------------------ */
/* Motion presets                                                      */
/* ------------------------------------------------------------------ */

const SWING = { duration: 0.7, ease: [0.22, 0.8, 0.2, 1] };

const bakeVariants = {
  enter: (dir) => ({ opacity: 0, scale: 0.82, rotate: dir > 0 ? 16 : -16 }),
  center: { opacity: 1, scale: 1, rotate: 0 },
  exit: (dir) => ({ opacity: 0, scale: 0.82, rotate: dir > 0 ? -16 : 16 }),
};
const bakeVariantsReduced = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

const lineVariants = {
  enter: { y: "110%" },
  center: { y: "0%" },
  exit: { y: "-110%" },
};

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function BitShape({ t, c = INK }) {
  switch (t) {
    case "sprinkle":
      return (
        <svg viewBox="0 0 100 40" className="block w-full overflow-visible">
          <rect x="2" y="6" width="96" height="28" rx="14" fill={c} />
          <rect x="14" y="11" width="46" height="6" rx="3" fill="#fff" opacity=".28" />
        </svg>
      );
    case "chip":
      return (
        <svg viewBox="0 0 100 100" className="block w-full overflow-visible">
          <path d="M50 6C57 30 92 44 92 68a42 26 0 0 1-84 0C8 44 43 30 50 6Z" fill={c} />
          <path d="M40 40c-10 8-18 16-19 26" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" opacity=".22" />
        </svg>
      );
    case "star":
      return (
        <svg viewBox="0 0 100 100" className="block w-full overflow-visible">
          <path
            d="M50 5l12.6 28.6 31 3.2-23.2 20.9 6.6 30.5L50 72.5 23 88.2l6.6-30.5L6.4 36.8l31-3.2z"
            fill={c}
            stroke={c}
            strokeWidth="6"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "heart":
      return (
        <svg viewBox="0 0 100 100" className="block w-full overflow-visible">
          <path d="M50 88C20 66 6 50 6 32a22 22 0 0 1 44-6 22 22 0 0 1 44 6c0 18-14 34-44 56Z" fill={c} />
        </svg>
      );
    case "eye":
      return (
        <svg viewBox="0 0 100 100" className="block w-full overflow-visible">
          <circle cx="50" cy="50" r="46" fill="#FBF8F1" />
          <circle cx="50" cy="50" r="46" fill="none" stroke="#000" strokeOpacity=".08" strokeWidth="4" />
          <circle cx="60" cy="58" r="19" fill="#141214" />
          <circle cx="54" cy="51" r="5" fill="#fff" opacity=".8" />
        </svg>
      );
    case "crumb":
      return (
        <svg viewBox="0 0 100 100" className="block w-full overflow-visible">
          <path d="M22 30 48 10l30 12 14 30-16 30-34 8-30-20z" fill={c} />
          <path d="M48 10l30 12 14 30-30-8z" fill="#fff" opacity=".18" />
        </svg>
      );
    case "sugar":
      return (
        <svg viewBox="0 0 100 100" className="block w-full overflow-visible">
          <rect x="18" y="18" width="64" height="64" rx="10" fill={c} opacity=".92" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 100 100" className="block w-full overflow-visible">
          <circle cx="50" cy="50" r="44" fill={c} />
          <circle cx="38" cy="36" r="10" fill="#fff" opacity=".3" />
        </svg>
      );
  }
}

function Bit({ bit, i, mx, my, still }) {
  const { x, y, s, r = 0, d = 0.5, blur = 0 } = bit;
  const px = useTransform(mx, (v) => v * d * -46);
  const py = useTransform(my, (v) => v * d * -34);
  return (
    <motion.div
      className="pointer-events-none absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${s}%`,
        x: px,
        y: py,
        zIndex: d > 0.6 ? 30 : 10,
        filter: blur ? `blur(${blur}px)` : undefined,
      }}
      aria-hidden="true"
    >
      <motion.div
        initial={{ scale: 0, rotate: r - 140, opacity: 0 }}
        animate={{ scale: 1, rotate: r, opacity: 1 }}
        exit={{ scale: 0, rotate: r + 120, opacity: 0, transition: { duration: 0.35, delay: i * 0.02 } }}
        transition={{ type: "spring", stiffness: 140, damping: 13, delay: 0.45 + i * 0.05 }}
      >
        <motion.div
          animate={still ? undefined : { y: [0, -8 - d * 8, 0], rotate: [0, d > 0.5 ? 7 : -5, 0] }}
          transition={{ duration: 4.5 + i * 0.7, repeat: Infinity, ease: "easeInOut" }}
          style={{ filter: "drop-shadow(0 6px 6px rgba(42,26,21,.18))" }}
        >
          <BitShape t={bit.t} c={bit.c} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function Plate({ turn, blob }) {
  return (
    <motion.div
      className="absolute inset-[7%] rounded-full"
      animate={{ rotate: turn * 60 }}
      transition={SWING}
      style={{
        background:
          "radial-gradient(circle at 50% 50%, #FFFDF8 0 47%, #F3EBDD 48% 49.5%, #FFFDF8 50.5% 61%, #EFE5D3 62% 63%, #FFFBF3 64% 100%)",
        boxShadow:
          "0 50px 70px -30px rgba(42,26,21,.35), 0 10px 24px rgba(42,26,21,.10), inset 0 -10px 24px rgba(42,26,21,.06), inset 0 8px 14px rgba(255,255,255,.9)",
      }}
      aria-hidden="true"
    >
      {/* one heart per notch on the rim, so the turn of the plate is readable */}
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <g key={k} transform={`rotate(${k * 60} 100 100) translate(100 8.5) scale(.62)`} opacity=".75">
            <motion.path
              d="M0 7C-5.5 3-8 .4-8-2.6a4 4 0 0 1 8-1 4 4 0 0 1 8 1C8 .4 5.5 3 0 7Z"
              animate={{ fill: blob }}
              transition={{ duration: 0.9 }}
            />
          </g>
        ))}
      </svg>
    </motion.div>
  );
}

function Bake({ product, still }) {
  return (
    <motion.div
      className="absolute inset-[16%] z-20 grid place-items-center"
      animate={still ? undefined : { y: [0, -6, 0] }}
      transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <img
        src={product.image}
        alt={[product.title, product.titleAccent].filter(Boolean).join(" ")}
        draggable={false}
        className="h-full w-full select-none object-contain"
        style={{ filter: "drop-shadow(0 22px 22px rgba(42,26,21,.32))" }}
      />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Slider                                                              */
/* ------------------------------------------------------------------ */

export default function HeroSlider({
  products = DEFAULT_PRODUCTS,
  onAddToBag,
  onBuildBox,
  autoplay = 6500,
  skin = "#E3AC86",
  skinShade = "#C98B66",
  sleeve = INK,
  className = "",
}) {
  const reduced = useReducedMotion();
  const [[index, dir, turn], setState] = useState([0, 1, 0]);
  const [paused, setPaused] = useState(false);
  const product = products[index];
  const n = products.length;

  const go = useCallback(
    (step) => setState(([i, , t]) => [(i + step + n) % n, step > 0 ? 1 : -1, t + (step > 0 ? 1 : -1)]),
    [n]
  );
  const goTo = useCallback(
    (target) =>
      setState(([i, d, t]) => {
        if (target === i) return [i, d, t];
        const step = target > i ? 1 : -1;
        return [target, step, t + step];
      }),
    []
  );

  // autoplay — paused on hover/focus, when the tab is hidden, and for reduced motion
  useEffect(() => {
    if (!autoplay || paused || reduced || n < 2) return;
    const id = setInterval(() => {
      if (!document.hidden) go(1);
    }, autoplay);
    return () => clearInterval(id);
  }, [autoplay, paused, reduced, n, go, index]);

  // preload neighbours so the next cookie is ready
  useEffect(() => {
    [1, -1].forEach((s) => {
      const img = new Image();
      img.src = products[(index + s + n) % n].image;
    });
  }, [index, n, products]);

  // pointer parallax
  const mxRaw = useMotionValue(0);
  const myRaw = useMotionValue(0);
  const mx = useSpring(mxRaw, { stiffness: 60, damping: 18 });
  const my = useSpring(myRaw, { stiffness: 60, damping: 18 });
  const rootRef = useRef(null);
  const onPointerMove = (e) => {
    if (reduced || e.pointerType === "touch") return;
    const r = rootRef.current.getBoundingClientRect();
    mxRaw.set((e.clientX - r.left) / r.width - 0.5);
    myRaw.set((e.clientY - r.top) / r.height - 0.5);
  };
  const stageX = useTransform(mx, (v) => v * 14);
  const stageY = useTransform(my, (v) => v * 10);

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  };

  if (!product) return null;
  const price = typeof product.price === "number" ? `$${product.price.toFixed(2)}` : product.price;

  return (
    <motion.section
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured bakes"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerMove={onPointerMove}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => {
        setPaused(false);
        mxRaw.set(0);
        myRaw.set(0);
      }}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      animate={{ backgroundColor: product.theme.bg }}
      transition={{ duration: 0.9, ease: "easeInOut" }}
      className={`relative isolate overflow-hidden ${className}`}
      style={{ color: INK, backgroundColor: product.theme.bg }}
    >
      {/* tinted disc bleeding off the corner */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[38%] -right-[12%] aspect-square w-[78%] rounded-full md:-bottom-[55%] md:-right-[8%] md:w-[52%]"
        animate={{ backgroundColor: product.theme.blob }}
        transition={{ duration: 0.9, ease: "easeInOut" }}
      />

      <div className="relative mx-auto grid min-h-[min(100svh,920px)] w-full max-w-[1400px] grid-cols-1 content-start items-center gap-x-8 px-6 pb-28 pt-16 md:content-center md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:px-12 md:pb-10 md:pt-4 lg:px-16">
        {/* ---------- stage ---------- */}
        <motion.div
          className="relative order-1 mx-auto aspect-square w-full max-w-[min(460px,40svh)] touch-pan-y md:order-2 md:max-w-[640px]"
          style={{ x: stageX, y: stageY }}
          drag={n > 1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60 || info.velocity.x < -400) go(1);
            else if (info.offset.x > 60 || info.velocity.x > 400) go(-1);
          }}
        >
          <Plate turn={turn} blob={product.theme.blob} />

          <AnimatePresence initial={false}>
            <motion.div key={product.id + "-bits"} className="absolute inset-0" exit={{ opacity: 1 }}>
              {(product.bits || []).map((b, i) => (
                <Bit key={i} bit={b} i={i} mx={mx} my={my} still={reduced} />
              ))}
            </motion.div>
          </AnimatePresence>

          <AnimatePresence initial={false} custom={dir}>
            <motion.div
              key={product.id}
              custom={dir}
              variants={reduced ? bakeVariantsReduced : bakeVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={reduced ? { duration: 0.3 } : SWING}
              className="absolute inset-0 z-20"
            >
              <Bake product={product} still={reduced} />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* ---------- copy ---------- */}
        <div className="relative z-40 order-2 md:order-1" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={product.id}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ staggerChildren: 0.07 }}
            >
              <h1 className="font-display text-[clamp(2.75rem,7.2vw,6.25rem)] font-extrabold leading-[0.95] tracking-[-0.045em]">
                <span className="block overflow-hidden pb-[0.08em]">
                  <motion.span className="block" variants={lineVariants} transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}>
                    {product.title}
                  </motion.span>
                </span>
                {product.titleAccent && (
                  <span className="block overflow-hidden pb-[0.12em]" style={{ color: INK_SOFT }}>
                    <motion.span className="block" variants={lineVariants} transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}>
                      {product.titleAccent}
                    </motion.span>
                  </span>
                )}
              </h1>

              <motion.p
                className="mt-3 max-w-[30rem] text-base leading-relaxed md:mt-5 md:text-xl"
                style={{ color: INK_SOFT }}
                variants={{ enter: { opacity: 0, y: 12 }, center: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } }}
                transition={{ duration: 0.4 }}
              >
                {product.description}
              </motion.p>

              <motion.p
                className="mt-3 text-3xl font-extrabold tracking-tight md:mt-5 md:text-[2.75rem]"
                variants={{ enter: { opacity: 0, y: 12 }, center: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } }}
                transition={{ duration: 0.4 }}
              >
                {price}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-5 flex flex-wrap gap-3 md:mt-7">
            <button
              type="button"
              onClick={() => onAddToBag?.(product)}
              className="rounded-full px-6 py-3.5 text-base font-semibold text-[#FFF8EC] md:px-7 md:py-4 md:text-lg transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
              style={{ backgroundColor: INK, outlineColor: INK }}
            >
              Add to bag
            </button>
            <button
              type="button"
              onClick={() => onBuildBox?.()}
              className="rounded-full bg-[#F5E6D6] px-6 py-3.5 text-base font-semibold md:px-7 md:py-4 md:text-lg transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
              style={{ outlineColor: INK }}
            >
              Build a box
            </button>
          </div>

          {/* ---------- picker + arrows ---------- */}
          <div className="mt-6 flex items-center justify-between gap-6 md:mt-16">
            <div className="-mx-2 flex gap-2 overflow-x-auto px-2 py-2 [scrollbar-width:none] md:gap-3" role="tablist" aria-label="Choose a bake">
              {products.map((p, i) => {
                const active = i === index;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-label={[p.title, p.titleAccent].filter(Boolean).join(" ")}
                    onClick={() => goTo(i)}
                    className="relative grid aspect-square w-14 shrink-0 place-items-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 md:w-16"
                    style={{ outlineColor: INK }}
                  >
                    <span className="absolute inset-0 rounded-full bg-white/55" />
                    {active && (
                      <motion.span
                        layoutId="lr-hero-ring"
                        className="absolute -inset-1 rounded-full border-2 bg-white/80"
                        style={{ borderColor: INK }}
                        transition={{ type: "spring", stiffness: 300, damping: 28 }}
                      />
                    )}
                    <motion.img
                      src={p.thumb || p.image}
                      alt=""
                      draggable={false}
                      className="relative w-[78%]"
                      animate={{ scale: active ? 1.08 : 0.92, rotate: active ? 0 : -14 }}
                      transition={{ type: "spring", stiffness: 220, damping: 18 }}
                    />
                  </button>
                );
              })}
            </div>

            <div className="hidden shrink-0 gap-3 sm:flex">
              {[
                [-1, "Previous bake", "M14 6l-6 6 6 6"],
                [1, "Next bake", "M10 6l6 6-6 6"],
              ].map(([step, label, d]) => (
                <button
                  key={label}
                  type="button"
                  aria-label={label}
                  onClick={() => go(step)}
                  className="grid h-14 w-14 place-items-center rounded-full border transition-colors duration-200 hover:bg-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ borderColor: "rgba(42,26,21,.35)", outlineColor: INK }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={d} />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
