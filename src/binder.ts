/**
 * The Binder Pages display: a ring or zip binder opened on two facing sheets, each sheet a page of clear plastic pockets (nine, three by
 * three, unless asked otherwise) with one card inside each pocket, on a clear or black backing with a strip of punched holes down the edge
 * that lies against the rings. A page turn swings one leaf about the spine; the leaf bends as it turns and shows the pockets on its back.
 *
 * A leaf has two sides, as a real one does: leaf k holds sides 2k (the right-hand page) and 2k+1 (the left-hand page of the next opening).
 * An opening (spread) j shows side 2j-1 on the left (none at the start) and side 2j on the right.
 */
export type BinderStyle = "ring" | "zip";
export type BinderSheet = "clear" | "black";
export const binderCovers: ReadonlyArray<{ id: string; label: string; color: string }> = [
  { id: "green", label: "Green", color: "#1f7a4a" },
  { id: "black", label: "Black", color: "#1d1d22" },
  { id: "teal", label: "Teal", color: "#1a9d93" },
  { id: "navy", label: "Navy", color: "#1f3a70" },
  { id: "red", label: "Red", color: "#b0262d" },
];
/** The sheets a binder takes: how many pockets and how they lie (across by down). 9 is the usual page; 4 and 12 are the other common ones. */
export const binderPockets: ReadonlyArray<{ count: number; cols: number; rows: number }> = [
  { count: 4, cols: 2, rows: 2 },
  { count: 9, cols: 3, rows: 3 },
  { count: 12, cols: 4, rows: 3 },
];
export interface BinderLayout {
  cols: number;
  rows: number;
  per: number;
}

/** The pockets of a sheet: `pockets` (4, 9 or 12) if the page asks, else the older `columns` and `page-size`, else nine in three columns. */
export function binderLayout(pockets: string | null, columns: string | null, pageSize: string | null): BinderLayout {
  const known = binderPockets.find((p) => String(p.count) === pockets);
  if (known) return { cols: known.cols, rows: known.rows, per: known.count };
  const size = Math.min(100, Math.max(1, Math.floor(Number(pageSize)) || 9));
  const cols = Math.min(10, Math.max(1, Math.floor(Number(columns)) || 3), size);
  return { cols, rows: Math.ceil(size / cols), per: size };
}
/** How many sides a collection of `cards` fills, and how many openings that makes. */
export const sideCount = (cards: number, per: number): number => Math.max(1, Math.ceil(cards / per));
export const spreadCount = (sides: number): number => Math.ceil((sides + 1) / 2);
/** The opening a card is on: its side's number, halved and rounded up. */
export const spreadOf = (index: number, per: number): number => Math.ceil(Math.floor(index / per) / 2);
/** The sides an opening shows (-1 where there is none), left then right, for `sides` sides in all. */
export function spreadSides(spread: number, sides: number): [number, number] {
  const left = 2 * spread - 1;
  const right = 2 * spread;
  return [left >= 0 && left < sides ? left : -1, right < sides ? right : -1];
}

export const BINDER_CSS = `
.stage.binder{perspective:2400px;background:radial-gradient(ellipse,var(--fc-stage-1),var(--fc-stage-2) 68%)}
.v.binder{--sw:300px;--sh:384px;--strip:34px;--cover:#1f7a4a;display:flex;align-items:center;justify-content:center;transform-style:preserve-3d}
.book{position:relative;display:flex;padding:18px 16px;border-radius:16px;background:var(--cover);box-shadow:0 12px 28px #0008,inset 0 0 0 2px #fff2,inset 0 0 24px #0005;transform-style:preserve-3d}
.book::before{content:'';position:absolute;inset:6px;border-radius:12px;box-shadow:inset 0 0 0 2px #0004;pointer-events:none}
.book.b-zip::after{content:'';position:absolute;inset:5px;border-radius:13px;border:3px dotted #cfd2d8;opacity:.7;pointer-events:none}
.book .tab{display:none}.book.b-zip .tab{display:block;position:absolute;right:30px;bottom:-4px;width:34px;height:14px;border-radius:5px;background:linear-gradient(#e4e6ea,#8d9098);box-shadow:0 2px 4px #0006}
.inside{position:relative;display:flex;transform-style:preserve-3d;background:var(--lining,#f1eee6);border-radius:6px;box-shadow:inset 0 0 18px #0003}
.half{position:relative;width:var(--sw);height:var(--sh);flex:none}
.half:empty::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,#0002,transparent 14%)}
.spine{position:absolute;left:50%;top:0;bottom:0;width:0;transform-style:preserve-3d;pointer-events:none;z-index:3}
.ring{position:absolute;left:-9px;width:18px;height:46px;margin-top:-23px;border-radius:9px;border:4px solid #c3c6cd;border-color:#f1f2f5 #8d9098 #8d9098 #f1f2f5;box-shadow:0 2px 3px #0005;transform:translateZ(2px)}
.side{position:absolute;inset:0;display:grid;padding:12px 10px;grid-template-columns:repeat(var(--cols,3),minmax(0,1fr));grid-template-rows:repeat(var(--rows,3),minmax(0,1fr));gap:5px;background:var(--sheetbg);box-sizing:border-box;border:1px solid var(--sheetedge)}
.side.clear{--sheetbg:#ffffff2e;--sheetedge:#ffffff55;--pocketbg:#ffffff26;--pocketedge:#ffffffa0}.side.black{--sheetbg:#17171b;--sheetedge:#000;--pocketbg:#ffffff12;--pocketedge:#ffffff55}
.side.r{padding-left:calc(var(--strip) + 6px)}.side.l{padding-right:calc(var(--strip) + 6px)}
.holes{position:absolute;top:0;bottom:0;width:var(--strip);display:flex;flex-direction:column;justify-content:space-evenly;align-items:center;padding:14px 0}.side.r .holes{left:0}.side.l .holes{right:0}.holes i{width:9px;height:9px;border-radius:50%;background:var(--lining,#f1eee6);box-shadow:inset 0 1px 2px #0007,0 0 0 1px #0002}
.pocket{position:relative;display:grid;place-items:center;border-radius:4px;background:var(--pocketbg);border:1px solid var(--pocketedge);box-shadow:inset 0 0 0 1px #0000000d,0 1px 2px #0003;overflow:hidden;min-width:0;min-height:0}
.pocket::after{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(118deg,#ffffff55 0,#ffffff00 32%,#ffffff12 55%,#ffffff00 70%,#ffffff33 100%)}
.pocket .card{position:relative;z-index:0;width:86%;height:92%;padding:0;border:0;background:transparent;line-height:0;display:grid;place-items:center}.pocket .card img{width:100%;height:100%;object-fit:contain;border-radius:3%;box-shadow:0 2px 5px #0007}
.pocket.empty{opacity:.55}
.leaf{position:absolute;left:50%;top:0;width:var(--sw);height:var(--sh);transform-origin:0 50%;transform-style:preserve-3d;pointer-events:none;z-index:2}
.slice{position:absolute;top:0;height:100%;transform-origin:0 50%;transform-style:preserve-3d}
.slice>.f,.slice>.b{position:absolute;inset:0 -1.5px;backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden}.slice>.b{transform:rotateY(180deg)}
.slice .sf{position:absolute;top:0;height:100%}
/* The slices overlap their neighbours by a pixel and a half, so no seam between them lets the page behind show; the outer edges of the leaf stay where they are. */
.slice.first>.f,.slice.last>.b{left:0}.slice.first>.b,.slice.last>.f{right:0}
`;

/** The cards a side holds, as indexes into the collection (or -1 for an empty pocket), in reading order. */
export function sideCards(side: number, layout: BinderLayout, total: number): number[] {
  return Array.from({ length: layout.per }, (_, k) => (side * layout.per + k < total ? side * layout.per + k : -1));
}

export type PocketMaker = (index: number, live: boolean) => HTMLElement;

/** One side as it lies in the book: `left` or `right` of the spine, with its hole strip against the spine. `live` pockets hold the page's real card buttons; the rest hold pictures only. */
export function buildSide(
  side: number,
  where: "l" | "r",
  sheet: BinderSheet,
  layout: BinderLayout,
  total: number,
  pocket: PocketMaker,
  live = true,
): HTMLElement {
  const el = document.createElement("div");
  el.className = `side ${where} ${sheet}`;
  el.dataset.side = String(side);
  el.style.setProperty("--cols", String(layout.cols));
  el.style.setProperty("--rows", String(layout.rows));
  const holes = document.createElement("div");
  holes.className = "holes";
  holes.innerHTML = "<i></i>".repeat(9);
  el.append(holes);
  for (const index of sideCards(side, layout, total))
    el.append(
      index < 0 ? Object.assign(document.createElement("div"), { className: "pocket empty" }) : pocket(index, live),
    );
  return el;
}

/**
 * A leaf of the book, built to swing: a chain of slices hinged one on the next (the hole strip, then a slice for each column of
 * pockets), so that each can lean a little more than the one before it and the sheet bends. Each slice has the pockets of the front side on its
 * front and the matching column of the back side on its back. Returns the leaf and its slices.
 */
export function buildLeaf(
  front: number,
  back: number,
  sheet: BinderSheet,
  layout: BinderLayout,
  total: number,
  pocket: PocketMaker,
  widthPx: number,
  strip: number,
): { leaf: HTMLElement; slices: HTMLElement[] } {
  const leaf = document.createElement("div");
  leaf.className = "leaf";
  const faces = (side: number, where: "l" | "r") =>
    side < 0 ? null : buildSide(side, where, sheet, layout, total, pocket, false);
  const rightSide = faces(front, "r");
  const leftSide = faces(back, "l");
  const widths = [strip + 6, ...Array.from({ length: layout.cols }, () => (widthPx - strip - 6) / layout.cols)];
  const slices: HTMLElement[] = [];
  let parent: HTMLElement = leaf;
  let offset = 0;
  widths.forEach((w, k) => {
    const slice = document.createElement("div");
    slice.className = k === 0 ? "slice first" : k === widths.length - 1 ? "slice last" : "slice";
    slice.style.width = `${w}px`;
    slice.style.left = k === 0 ? "0" : "100%";
    const f = document.createElement("div");
    const b = document.createElement("div");
    f.className = "f";
    b.className = "b";
    // The whole side is placed inside each slice's face and shifted so that this slice shows its own part of it.
    if (rightSide) {
      const copy = rightSide.cloneNode(true) as HTMLElement;
      copy.classList.add("sf");
      copy.style.width = `${widthPx}px`;
      copy.style.left = `${-offset}px`;
      f.append(copy);
    }
    if (leftSide) {
      const copy = leftSide.cloneNode(true) as HTMLElement;
      copy.classList.add("sf");
      copy.style.width = `${widthPx}px`;
      copy.style.left = `${-(widthPx - offset - w)}px`;
      b.append(copy);
    }
    slice.append(f, b);
    parent.append(slice);
    parent = slice;
    offset += w;
    slices.push(slice);
  });
  return { leaf, slices };
}
