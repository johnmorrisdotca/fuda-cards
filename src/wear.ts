/**
 * Wear: a card that is not perfect.
 *
 * Real condition grading looks at four things: corners, edges, surface and centering, and at creases and staining
 * (see docs/wear.md for the sources and what each says). Here a preset sets how much of each there is, from 0 (none) to
 * 1 (the worst the preset names), and a seed lays the marks out, so the same seed draws the same card every time.
 * Everything is drawn: the outline of each face (rounded, chipped or folded corners) and one SVG over each face
 * (whitening, creases, scratches, specks, staining, toning). Nothing here is a picture.
 *
 * This module is loaded by `<fuda-card>` only when a card asks for wear, so a perfect card carries none of it.
 */
import { seededRandom } from "./stack.js";

/** How much of each kind of wear, from 0 (none) to 1 (the worst the preset names). */
export interface WearLevels {
  corners: number;
  edges: number;
  surface: number;
  creases: number;
  /** Yellowing and darkened borders with age. */
  toning: number;
  /** How far the print sits off centre. */
  centering: number;
}
export interface WearPreset {
  id: string;
  name: string;
  levels: WearLevels;
  /** What the condition term means in grading language, in a few words. */
  says: string;
}
const L = (
  corners: number,
  edges: number,
  surface: number,
  creases: number,
  toning: number,
  centering: number,
): WearLevels => ({ corners, edges, surface, creases, toning, centering });
/** From perfect to damaged. The names are the plain grading terms; the numbers are this package's reading of them (docs/wear.md). */
export const wearPresets: readonly WearPreset[] = [
  {
    id: "perfect",
    name: "Perfect",
    levels: L(0, 0, 0, 0, 0, 0),
    says: "No imperfections, even close up. Draws nothing.",
  },
  {
    id: "mint",
    name: "Mint",
    levels: L(0.05, 0.05, 0.06, 0, 0, 0.1),
    says: "Nothing to the naked eye; a flaw or two only on close inspection.",
  },
  {
    id: "near-mint",
    name: "Near mint",
    levels: L(0.18, 0.2, 0.2, 0, 0, 0.2),
    says: "Sharp corners, a trace of edge whitening, a few light scratches.",
  },
  {
    id: "lightly-played",
    name: "Lightly played",
    levels: L(0.38, 0.45, 0.4, 0, 0.05, 0.3),
    says: "Very slight corner rounding, whitening on one or two edges, scratches seen when tilted.",
  },
  {
    id: "moderately-played",
    name: "Moderately played",
    levels: L(0.62, 0.68, 0.62, 0.08, 0.15, 0.45),
    says: "Soft or rounded corners, whitening on several edges, obvious scratches, some gloss lost.",
  },
  {
    id: "heavily-played",
    name: "Heavily played",
    levels: L(0.82, 0.9, 0.85, 0.3, 0.3, 0.6),
    says: "Corners that have lost their shape, heavy whitening, deep scratches, minor creases.",
  },
  {
    id: "damaged",
    name: "Damaged",
    levels: L(1, 1, 1, 0.85, 0.5, 0.8),
    says: "Chipped and folded corners, hard creases, staining.",
  },
];
export function wearPreset(id: string | null | undefined): WearPreset | undefined {
  return wearPresets.find((preset) => preset.id === id);
}

export interface WearOptions {
  /** A preset's id, or a number from 0 to 1 for all the levels at once. */
  wear?: string | number | null;
  /** The seed: the same seed lays the same marks the same way. Unless said, 1. */
  seed?: number;
  /** Overrides of one level each, from 0 to 1. */
  corners?: number;
  edges?: number;
  surface?: number;
  creases?: number;
}
const clamp01 = (value: number): number => (Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0);
const round = (value: number): number => Math.round(value * 100) / 100;

/** The levels a card's wear asks for, or null when it asks for none (no wear, "perfect", an unknown name or all zero). */
export function wearLevels(options: WearOptions): WearLevels | null {
  const asked = options.wear;
  let base: WearLevels = L(0, 0, 0, 0, 0, 0);
  if (typeof asked === "number" && Number.isFinite(asked)) {
    const n = clamp01(asked);
    base = L(n, n, n, n * n, n * 0.5, n);
  } else if (typeof asked === "string" && asked.trim() !== "") {
    const preset = wearPreset(asked.trim());
    if (preset) base = preset.levels;
    else if (Number.isFinite(Number(asked))) return wearLevels({ ...options, wear: Number(asked) });
  }
  const levels = { ...base };
  for (const key of ["corners", "edges", "surface", "creases"] as const) {
    const given = options[key];
    if (given !== undefined && Number.isFinite(given)) levels[key] = clamp01(given);
  }
  return Object.values(levels).every((v) => v === 0) ? null : levels;
}

export type CornerKind = "sharp" | "soft" | "rounded" | "chipped" | "dog-eared";
export interface WearCorner {
  kind: CornerKind;
  /** How far the damage reaches along each edge, in units of a 250 by 350 card. */
  size: number;
  /** Jagged points of a chip, in the corner's own frame. */
  jag: number[];
}
export interface WearMark {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Strength from 0 to 1. */
  a: number;
  /** A crease that broke the print. */
  heavy?: boolean;
}
export interface WearFleck {
  x: number;
  y: number;
  r: number;
  a: number;
  light: boolean;
}
export interface WearEdgeFleck {
  x: number;
  y: number;
  w: number;
  h: number;
  a: number;
}
export interface WearFace {
  edge: WearEdgeFleck[];
  creases: WearMark[];
  scratches: WearMark[];
  specks: WearFleck[];
  stain: { x: number; y: number; r: number; a: number } | null;
}
export interface WearFeatures {
  levels: WearLevels;
  /** Top left, top right, bottom right, bottom left of the front. */
  corners: WearCorner[];
  /** The print's shift off centre in pixels at 300 wide: x and y. */
  centering: { x: number; y: number };
  front: WearFace;
  back: WearFace;
}
export const CARD_W = 250;
export const CARD_H = 350;
/** The radius of a perfect card's corner in these units (15 px of 300). */
export const BASE_RADIUS = 12.5;

function cornerFor(severity: number, random: () => number): WearCorner {
  const s = clamp01(severity);
  if (s < 0.1) return { kind: "sharp", size: BASE_RADIUS, jag: [] };
  if (s < 0.35) return { kind: "soft", size: round(BASE_RADIUS + s * 14), jag: [] };
  if (s < 0.6) return { kind: "rounded", size: round(17 + s * 22), jag: [] };
  if (s < 0.8) {
    const size = round(7 + s * 14);
    return {
      kind: "chipped",
      size,
      jag: [
        round(0.3 + random() * 0.25),
        round(0.25 + random() * 0.3),
        round(0.5 + random() * 0.35),
        round(0.1 + random() * 0.2),
      ],
    };
  }
  return { kind: "dog-eared", size: round(15 + s * 22), jag: [] };
}

function faceFor(levels: WearLevels, random: () => number): WearFace {
  const edge: WearEdgeFleck[] = [];
  const flecks = Math.round(levels.edges * 30);
  for (let i = 0; i < flecks; i++) {
    const side = Math.floor(random() * 4);
    const at = 0.08 + random() * 0.84;
    const len = 2 + random() * (3 + levels.edges * 12);
    const depth = 0.5 + random() * (0.8 + levels.edges * 2.4);
    const a = round(0.7 + random() * 0.3);
    if (side === 0) edge.push({ x: round(at * CARD_W), y: 0, w: round(len), h: round(depth), a });
    else if (side === 1)
      edge.push({ x: round(CARD_W - depth), y: round(at * CARD_H), w: round(depth), h: round(len), a });
    else if (side === 2)
      edge.push({ x: round(at * CARD_W), y: round(CARD_H - depth), w: round(len), h: round(depth), a });
    else edge.push({ x: 0, y: round(at * CARD_H), w: round(depth), h: round(len), a });
  }
  const scratches: WearMark[] = [];
  const lines = Math.round(levels.surface * 9);
  for (let i = 0; i < lines; i++) {
    const x1 = 15 + random() * 220;
    const y1 = 15 + random() * 320;
    const angle = random() * Math.PI;
    const len = 14 + random() * (30 + levels.surface * 60);
    scratches.push({
      x1: round(x1),
      y1: round(y1),
      x2: round(Math.min(245, Math.max(5, x1 + Math.cos(angle) * len))),
      y2: round(Math.min(345, Math.max(5, y1 + Math.sin(angle) * len))),
      a: round(0.15 + random() * 0.35),
    });
  }
  const specks: WearFleck[] = [];
  const dots = Math.round(levels.surface * 26);
  for (let i = 0; i < dots; i++)
    specks.push({
      x: round(8 + random() * 234),
      y: round(8 + random() * 334),
      r: round(0.3 + random() * 0.9),
      a: round(0.25 + random() * 0.4),
      light: random() < 0.5,
    });
  const creases: WearMark[] = [];
  const count = levels.creases <= 0.04 ? 0 : Math.min(4, Math.ceil(levels.creases * 3));
  for (let i = 0; i < count; i++) {
    const horizontal = random() < 0.5;
    const along = 0.15 + random() * 0.7;
    const other = 0.15 + random() * 0.7;
    const heavy = levels.creases > 0.5 && i === 0;
    const x1 = horizontal ? 0 : along * CARD_W;
    const y1 = horizontal ? along * CARD_H : 0;
    const x2 = horizontal ? CARD_W : other * CARD_W;
    const y2 = horizontal ? other * CARD_H : CARD_H;
    creases.push({ x1: round(x1), y1: round(y1), x2: round(x2), y2: round(y2), a: round(0.5 + random() * 0.4), heavy });
  }
  const stain =
    levels.creases > 0.5 || levels.toning > 0.4
      ? {
          x: round(40 + random() * 170),
          y: round(60 + random() * 230),
          r: round(25 + random() * 45),
          a: round(0.12 + levels.toning * 0.25),
        }
      : null;
  return { edge, creases, scratches, specks, stain };
}

/** Where every mark of a card lies. A pure function of the levels and the seed: no DOM, nothing at random. */
export function wearLayout(levels: WearLevels, seed = 1): WearFeatures {
  const base = (Number.isFinite(seed) ? seed : 1) * 2654435761;
  const corners: WearCorner[] = [];
  for (let at = 0; at < 4; at++) {
    const random = seededRandom((base + (at + 1) * 40503) >>> 0);
    corners.push(cornerFor(levels.corners * (0.35 + random() * 0.95), random));
  }
  // A card has at most one folded corner and two chipped ones; the rest are only rounded, as real damage rarely falls on all four.
  let folded = 0;
  let chipped = 0;
  corners.forEach((corner, index) => {
    if (corner.kind === "dog-eared" && ++folded > 1)
      corners[index] = { kind: "chipped", size: round(corner.size * 0.45), jag: [0.4, 0.35, 0.6, 0.2] };
    if (corners[index].kind === "chipped" && ++chipped > 2)
      corners[index] = { kind: "rounded", size: round(corner.size * 1.6), jag: [] };
  });
  const place = seededRandom((base + 7919) >>> 0);
  const centering = {
    x: round((place() * 2 - 1) * levels.centering * 7),
    y: round((place() * 2 - 1) * levels.centering * 5),
  };
  return {
    levels,
    corners,
    centering,
    front: faceFor(levels, seededRandom((base + 1000003) >>> 0)),
    back: faceFor({ ...levels, creases: levels.creases }, seededRandom((base + 2000003) >>> 0)),
  };
}

/** Points of one corner from where it leaves the incoming edge to where it joins the outgoing edge, in the corner's frame (a along the way out, b back along the way in). */
function cornerPoints(corner: WearCorner): Array<[number, number]> {
  const s = corner.kind === "sharp" ? BASE_RADIUS : corner.size;
  if (corner.kind === "dog-eared")
    return [
      [0, s],
      [s, 0],
    ];
  if (corner.kind === "chipped") {
    const [p, q, r, t] = corner.jag;
    return [
      [0, s],
      [s * p, s * (1 - q) * 0.9],
      [s * q * 0.5, s * r * 0.5],
      [s * (1 - t), s * t],
      [s, 0],
    ];
  }
  const points: Array<[number, number]> = [];
  for (let step = 0; step <= 6; step++) {
    const angle = (step / 6) * (Math.PI / 2);
    points.push([s - s * Math.cos(angle), s - s * Math.sin(angle)]);
  }
  return points;
}
/** Which of the front's corners a face's corner is: the back is the front seen from behind, so left and right swap. */
const frames = [
  { x: 0, y: 0, a: [1, 0], b: [0, 1] },
  { x: CARD_W, y: 0, a: [0, 1], b: [-1, 0] },
  { x: CARD_W, y: CARD_H, a: [-1, 0], b: [0, -1] },
  { x: 0, y: CARD_H, a: [0, -1], b: [1, 0] },
] as const;
const mirrored = [1, 0, 3, 2] as const;
const at = (frame: (typeof frames)[number], a: number, b: number): [number, number] => [
  round(frame.x + frame.a[0] * a + frame.b[0] * b),
  round(frame.y + frame.a[1] * a + frame.b[1] * b),
];

/** The corner a face draws at position `index` (0 top left, clockwise as seen on that face). */
function faceCorner(features: WearFeatures, index: number, face: "front" | "back"): WearCorner {
  return features.corners[face === "front" ? index : mirrored[index]];
}

/** The outline of a face as an SVG path in the 250 by 350 box, corners as worn. */
export function wearOutline(features: WearFeatures, face: "front" | "back" = "front"): string {
  const points: Array<[number, number]> = [];
  frames.forEach((frame, index) => {
    for (const [a, b] of cornerPoints(faceCorner(features, index, face))) points.push(at(frame, a, b));
  });
  return `M${points.map(([x, y]) => `${x} ${y}`).join("L")}Z`;
}

function line(m: WearMark, stroke: string, width: number, opacity: number, extra = "", bend = 0): string {
  const nx = -(m.y2 - m.y1);
  const ny = m.x2 - m.x1;
  const len = Math.hypot(nx, ny) || 1;
  const way = bend
    ? `Q${round((m.x1 + m.x2) / 2 + (nx / len) * bend)} ${round((m.y1 + m.y2) / 2 + (ny / len) * bend)} ${m.x2} ${m.y2}`
    : `L${m.x2} ${m.y2}`;
  return `<path d="M${m.x1} ${m.y1}${way}" stroke="${stroke}" stroke-width="${width}" opacity="${opacity}" fill="none" stroke-linecap="round"${extra}/>`;
}

/** The SVG laid over one face: whitening, folds, creases, scratches, specks, stain and toning. Markup only, no script. */
export function wearOverlaySvg(features: WearFeatures, face: "front" | "back" = "front"): string {
  const data = face === "front" ? features.front : features.back;
  const levels = features.levels;
  const paper = "#fffaf0";
  const out: string[] = [];
  out.push(
    '<defs><radialGradient id="t" cx="50%" cy="48%" r="75%"><stop offset="45%" stop-color="#b8863a" stop-opacity="0"/><stop offset="100%" stop-color="#7a4a14" stop-opacity="1"/></radialGradient><linearGradient id="f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.5"/><stop offset="1" stop-color="#000" stop-opacity="0.35"/></linearGradient><radialGradient id="s"><stop offset="0" stop-color="#6b4513" stop-opacity="1"/><stop offset="100%" stop-color="#6b4513" stop-opacity="0"/></radialGradient></defs>',
  );
  if (levels.toning > 0)
    out.push(
      `<rect width="${CARD_W}" height="${CARD_H}" fill="url(#t)" opacity="${round(levels.toning * 0.55)}" style="mix-blend-mode:multiply"/>`,
    );
  if (data.stain)
    out.push(
      `<circle cx="${data.stain.x}" cy="${data.stain.y}" r="${data.stain.r}" fill="url(#s)" opacity="${data.stain.a}" style="mix-blend-mode:multiply"/>`,
    );
  for (const f of data.specks)
    out.push(`<circle cx="${f.x}" cy="${f.y}" r="${f.r}" fill="${f.light ? "#fff" : "#2b1b08"}" opacity="${f.a}"/>`);
  for (const m of data.scratches) out.push(line(m, "#fff", 0.45, m.a));
  for (const m of data.creases) {
    const nx = -(m.y2 - m.y1);
    const ny = m.x2 - m.x1;
    const len = Math.hypot(nx, ny) || 1;
    const ox = round((nx / len) * 0.9);
    const oy = round((ny / len) * 0.9);
    const bend = round((m.a - 0.7) * 14);
    out.push(
      line(
        { ...m, x1: round(m.x1 + ox), y1: round(m.y1 + oy), x2: round(m.x2 + ox), y2: round(m.y2 + oy) },
        "#2a1a05",
        m.heavy ? 1.3 : 0.8,
        round(m.a * 0.4),
        "",
        bend,
      ),
    );
    out.push(line(m, "#fff", m.heavy ? 1.1 : 0.6, round(m.a * 0.55), "", bend));
    if (m.heavy) out.push(line(m, paper, 1.6, 0.8, ' stroke-dasharray="9 5 3 11 6 4"', bend));
  }
  for (const e of data.edge)
    out.push(`<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" fill="${paper}" opacity="${e.a}"/>`);
  frames.forEach((frame, index) => {
    const corner = faceCorner(features, index, face);
    const pts = cornerPoints(corner).map(([a, b]) => at(frame, a, b));
    if (corner.kind === "sharp") {
      if (levels.corners > 0.02)
        out.push(
          `<circle cx="${at(frame, 1.3, 1.3)[0]}" cy="${at(frame, 1.3, 1.3)[1]}" r="1.3" fill="${paper}" opacity="0.8"/>`,
        );
      return;
    }
    if (corner.kind === "dog-eared") {
      const s = corner.size;
      const fold = [at(frame, 0, s), at(frame, s, 0), at(frame, s, s)];
      const flap = face === "front" ? "#183450" : "#e8c46a";
      const shade = [at(frame, 0, s), at(frame, s, 0), at(frame, s + 2.2, s + 2.2)];
      out.push(`<polygon points="${shade.map((p) => p.join(",")).join(" ")}" fill="#000" opacity="0.3"/>`);
      out.push(
        `<polygon points="${fold.map((p) => p.join(",")).join(" ")}" fill="${flap}" stroke="${paper}" stroke-width="0.8"/>`,
      );
      out.push(`<polygon points="${fold.map((p) => p.join(",")).join(" ")}" fill="url(#f)" opacity="0.55"/>`);
      out.push(
        `<path d="M${pts.map((p) => p.join(" ")).join("L")}" stroke="${paper}" stroke-width="1.2" fill="none"/>`,
      );
      return;
    }
    out.push(
      `<path d="M${pts.map((p) => p.join(" ")).join("L")}" stroke="${paper}" stroke-width="${corner.kind === "chipped" ? 2.2 : 1.6}" opacity="0.85" fill="none" stroke-linejoin="round"/>`,
    );
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CARD_W} ${CARD_H}" preserveAspectRatio="none" aria-hidden="true">${out.join("")}</svg>`;
}

const STYLE =
  ".wear{position:absolute;pointer-events:none;display:block}.wear svg{display:block;width:100%;height:100%}";
const maskUrl = (path: string): string =>
  `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CARD_W} ${CARD_H}" preserveAspectRatio="none"><path d="${path}" fill="#000"/></svg>`)}")`;

/** Draw a card's wear into its shadow root; calling it again with other options replaces the first. */
export function applyWear(root: ShadowRoot, options: WearOptions): boolean {
  const levels = wearLevels(options);
  clearWear(root);
  if (!levels) return false;
  const features = wearLayout(levels, options.seed ?? 1);
  const style = document.createElement("style");
  style.dataset.wear = "";
  style.textContent = STYLE;
  root.prepend(style);
  for (const face of ["front", "back"] as const) {
    const element = root.querySelector<HTMLElement>(`.face.${face}`);
    if (!element) continue;
    const holder = document.createElement("div");
    holder.className = "wear";
    holder.dataset.wear = face;
    holder.style.inset = face === "front" ? "-2px" : "-11px";
    holder.innerHTML = wearOverlaySvg(features, face);
    element.append(holder);
    const mask = maskUrl(wearOutline(features, face));
    element.style.setProperty("-webkit-mask-image", mask);
    element.style.setProperty("mask-image", mask);
    element.style.setProperty("-webkit-mask-size", "100% 100%");
    element.style.setProperty("mask-size", "100% 100%");
    element.style.setProperty("-webkit-mask-repeat", "no-repeat");
    element.style.setProperty("mask-repeat", "no-repeat");
  }
  const front = root.querySelector<HTMLElement>(".face.front");
  if (front) {
    const { x, y } = features.centering;
    front.style.padding = `${13 + y}px ${13 - x}px ${13 - y}px ${13 + x}px`;
  }
  return true;
}

/** Take a card's wear away, leaving the card as it was. */
export function clearWear(root: ShadowRoot): void {
  root.querySelector("style[data-wear]")?.remove();
  for (const holder of Array.from(root.querySelectorAll(".wear"))) holder.remove();
  for (const element of Array.from(root.querySelectorAll<HTMLElement>(".face"))) {
    for (const name of [
      "-webkit-mask-image",
      "mask-image",
      "-webkit-mask-size",
      "mask-size",
      "-webkit-mask-repeat",
      "mask-repeat",
    ])
      element.style.removeProperty(name);
    if (element.classList.contains("front")) element.style.removeProperty("padding");
    if (!element.getAttribute("style")) element.removeAttribute("style");
  }
}
