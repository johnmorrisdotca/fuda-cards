import type { CollectionView } from "./collection.js";

/** A small picture for each display, for its tile: a grid of rectangles or a few shapes, drawn in `currentColor` on a 34 by 22 view box. */
const rects = (cols: number, rows: number, w: number, h: number, gx: number, gy: number, x0 = 1, y0 = 1) =>
  Array.from(
    { length: cols * rows },
    (_, k) =>
      `<rect x="${x0 + (k % cols) * gx}" y="${y0 + Math.floor(k / cols) * gy}" width="${w}" height="${h}" rx="1" opacity="${0.55 + (((k % cols) + Math.floor(k / cols)) % 2) * 0.4}"/>`,
  ).join("");
export const ICONS: Record<CollectionView, string> = {
  deck: '<rect x="9" y="4" width="14" height="14" rx="2" opacity=".45"/><rect x="6" y="2" width="14" height="14" rx="2" opacity=".7"/><rect x="3" y="0" width="14" height="14" rx="2"/>',
  rolodex:
    '<rect x="2" y="9" width="12" height="10" rx="1.5" opacity=".4"/><rect x="8" y="5" width="12" height="10" rx="1.5" opacity=".7"/><rect x="14" y="1" width="12" height="10" rx="1.5"/>',
  binder: rects(3, 2, 9, 9, 11, 10, 2, 1),
  case: '<path d="M3 4h28l-3 6H6z" opacity=".5"/><path d="M6 12h22l-3 8H9z"/>',
  jukebox: '<path d="M5 20V9a12 9 0 0 1 24 0v11z" opacity=".5"/><rect x="11" y="9" width="12" height="9" rx="1.5"/>',
  random:
    '<rect x="9" y="1" width="16" height="18" rx="3"/><circle cx="14" cy="6" r="1.6" fill="#0008"/><circle cx="20" cy="14" r="1.6" fill="#0008"/><circle cx="17" cy="10" r="1.6" fill="#0008"/>',
  story:
    '<rect x="11" y="0" width="12" height="7" rx="1.5"/><rect x="11" y="8" width="12" height="7" rx="1.5" opacity=".7"/><rect x="11" y="16" width="12" height="6" rx="1.5" opacity=".4"/>',
  wall: '<rect x="0" y="3" width="9" height="14" rx="1.5" opacity=".5"/><rect x="12" y="3" width="10" height="14" rx="1.5"/><rect x="25" y="3" width="9" height="14" rx="1.5" opacity=".5"/>',
  tower:
    '<rect x="9" y="1" width="16" height="4" rx="1"/><rect x="9" y="7" width="16" height="4" rx="1" opacity=".8"/><rect x="9" y="13" width="16" height="4" rx="1" opacity=".6"/><rect x="9" y="19" width="16" height="3" rx="1" opacity=".4"/>',
  spotlight:
    '<rect x="11" y="0" width="12" height="18" rx="2"/><rect x="1" y="5" width="8" height="12" rx="1.5" opacity=".4"/><rect x="25" y="5" width="8" height="12" rx="1.5" opacity=".4"/>',
  atlas: rects(4, 3, 6, 5.5, 8, 7, 2, 1),
  fan: [-30, -15, 0, 15, 30]
    .map(
      (a, i) =>
        `<rect x="14" y="1" width="7" height="13" rx="1.2" transform="rotate(${a} 17.5 21)" opacity="${0.45 + i * 0.1}"/>`,
    )
    .join(""),
};
export const icon = (view: CollectionView) => `<svg viewBox="0 0 34 22" aria-hidden="true">${ICONS[view]}</svg>`;
