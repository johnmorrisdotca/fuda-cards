// Drawing the binder: two facing sheets of pockets, the page turn, and the page count.
import { binderCovers, buildLeaf, buildSide, sideCount, spreadOf, spreadSides } from "./binder.js";
import type { CollectionView } from "./collection.js";
import type { CollectionHost } from "./collection-host.js";

export function syncBinderChoices(host: CollectionHost, view: CollectionView) {
  const show = view === "binder";
  const cur = (attr: string, dflt: string, ok: string[]) => {
    const v = host.getAttribute(attr);
    return v && ok.includes(v) ? v : dflt;
  };
  const vals: Record<string, string> = {
    binder: cur("binder", "ring", ["ring", "zip"]),
    cover: cur(
      "cover",
      "green",
      binderCovers.map((c) => c.id),
    ),
    sheet: cur("sheet", "clear", ["clear", "black"]),
    pockets: cur("pockets", "9", ["4", "9", "12"]),
  };
  for (const [k, h] of Object.entries(host.binderChoices)) {
    h.hidden = !show;
    h.set(vals[k]);
  }
}

export function binderPageCount(host: CollectionHost) {
  const per = host.binderLay().per;
  const sides = sideCount(host.data.length, per);
  const [l, r] = spreadSides(spreadOf(host.index, per), sides);
  const a = (l < 0 ? r : l) + 1;
  const b = (r < 0 ? l : r) + 1;
  return a === b ? `Page ${a} / ${sides}` : `Pages ${a}–${b} / ${sides}`;
}

/** The binder: a ring or zip binder open on two facing sheets of pockets. A page turn swings the leaf about the spine, bending as it goes, and shows the pockets on its back. */
export function renderBinder(host: CollectionHost, v: HTMLElement, t: { on: boolean; ms: number }) {
  const layout = host.binderLay();
  const n = host.data.length;
  const sides = sideCount(n, layout.per);
  const spread = spreadOf(host.index, layout.per);
  const sheet = host.getAttribute("sheet") === "black" ? "black" : "clear";
  const zip = host.getAttribute("binder") === "zip";
  const cover = binderCovers.find((c) => c.id === host.getAttribute("cover")) ?? binderCovers[0];
  v.classList.add("binder");
  v.style.setProperty("--cover", cover.color);
  const pocket = (index: number, live: boolean) => {
    const c = host.data[index];
    const el = document.createElement("div");
    el.className = "pocket";
    if (live) el.append(host.image(c, index));
    else {
      const img = document.createElement("img");
      img.src = c.image;
      img.alt = "";
      img.style.cssText = "width:86%;height:92%;object-fit:contain;border-radius:3%;box-shadow:0 2px 5px #0007";
      el.append(img);
    }
    return el;
  };
  const [L, R] = spreadSides(spread, sides);
  const turn = host.turn;
  host.turn = null;
  const flat = turn && t.on && Math.abs(turn.to - turn.from) === 1 ? turn : null;
  const [oldL, oldR] = flat ? spreadSides(flat.from, sides) : [L, R];
  const [newL, newR] = flat ? spreadSides(flat.to, sides) : [L, R];
  const forward = !!flat && flat.to > flat.from;
  const book = document.createElement("div");
  book.className = `book ${zip ? "b-zip" : "b-ring"}`;
  const inside = document.createElement("div");
  inside.className = "inside";
  const left = document.createElement("div");
  const right = document.createElement("div");
  left.className = "half";
  right.className = "half";
  const put = (half: HTMLElement, side: number, where: "l" | "r") => {
    half.replaceChildren();
    if (side >= 0) half.append(buildSide(side, where, sheet, layout, n, pocket));
  };
  // While a leaf swings the half it has not reached yet shows the page it is leaving; the other half already shows the page it uncovers.
  put(left, flat ? (forward ? oldL : newL) : L, "l");
  put(right, flat ? (forward ? newR : oldR) : R, "r");
  const spine = document.createElement("div");
  spine.className = "spine";
  for (const y of [18, 50, 82]) {
    const ring = document.createElement("i");
    ring.className = "ring";
    ring.style.top = `${y}%`;
    spine.append(ring);
  }
  inside.append(left, right, spine);
  const tab = document.createElement("i");
  tab.className = "tab";
  book.append(inside, tab);
  v.append(book);
  if (flat) {
    const w = 300;
    const strip = 34;
    const { leaf, slices } = buildLeaf(
      forward ? oldR : newR,
      forward ? newL : oldL,
      sheet,
      layout,
      n,
      pocket,
      w,
      strip,
    );
    inside.append(leaf);
    const ms = Math.round(t.ms * 1.4);
    const ease = "cubic-bezier(.45,.05,.3,1)";
    const a = forward ? [0, -180] : [-180, 0];
    leaf.style.transform = `rotateY(${a[1]}deg)`;
    const swing = leaf.animate([{ transform: `rotateY(${a[0]}deg)` }, { transform: `rotateY(${a[1]}deg)` }], {
      duration: ms,
      easing: ease,
      fill: "forwards",
    });
    // Each slice leans on the one before it, so the sheet bends as it swings (the free edge trails) and straightens at the end.
    const bend = forward ? 8 : -8;
    slices.forEach((s, k) => {
      if (k)
        s.animate(
          [
            { transform: "rotateY(0deg)" },
            { transform: `rotateY(${bend}deg)`, offset: 0.5 },
            { transform: "rotateY(0deg)" },
          ],
          { duration: ms, easing: ease },
        );
    });
    const finish = () => {
      if (!leaf.isConnected) return;
      put(left, newL, "l");
      put(right, newR, "r");
      leaf.remove();
    };
    swing.finished.then(finish, finish);
  }
}
