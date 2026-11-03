// How a move or a change of display plays: the cards that stay glide, the ones that leave fade out, the ones that arrive grow in.

import type { CollectionView } from "./collection.js";
import type { CollectionHost } from "./collection-host.js";
import { gliding, pages, scrolling } from "./collection-views.js";

/** Where every card is on screen now, by data index. */
export function snapshotRects(v: HTMLElement) {
  const m = new Map<string, DOMRect>();
  for (const el of v.querySelectorAll<HTMLElement>("[data-i]:not(.ghost)"))
    m.set(el.dataset.i!, el.getBoundingClientRect());
  return m;
}

/** Cards that arrive grow and fade in, a little to the side the reader is heading. Only an opening keyframe: they end on the card's own style. */
export function enterCards(els: Iterable<Element>, ms: number, dir = 0, stagger = 18) {
  let k = 0;
  for (const el of els)
    el.animate([{ opacity: 0, translate: `${dir * 36}px 0`, scale: 0.94, offset: 0 }], {
      duration: ms,
      delay: Math.min(k++, 12) * stagger,
      easing: "cubic-bezier(.2,.8,.2,1)",
      fill: "backwards",
    });
}

/** After a card or page change or a switch of display: glide what stays, let what goes leave, bring in what comes. Nothing runs afterwards: each is one animation that ends by itself. */
export function playMove(
  host: CollectionHost,
  how: { kind: "move" | "view"; dir: number },
  before: Map<string, DOMRect>,
  left: HTMLElement[],
  view: CollectionView,
  v: HTMLElement,
  ms: number,
) {
  if (how.kind === "view") {
    enterCards(Array.from(v.querySelectorAll(".card,.slot")), ms * 0.7);
    return;
  }
  if (pages.includes(view)) {
    enterCards(Array.from(v.querySelectorAll(".card")), ms * 0.7, how.dir);
    return;
  }
  if (scrolling.includes(view)) {
    const el = v.querySelector(`[data-i="${host.index}"]`);
    if (el) host.zoom!.reveal(el, ms);
    return;
  }
  if (!gliding.includes(view) || host.zoom!.turned()) return;
  const scale = v.offsetWidth ? v.getBoundingClientRect().width / v.offsetWidth : 1;
  const kept = new Set<string>();
  for (const el of Array.from(v.querySelectorAll<HTMLElement>(".card[data-i]"))) {
    const was = before.get(el.dataset.i!);
    const now = el.getBoundingClientRect();
    if (!was || !now.width) {
      enterCards([el], ms * 0.7, how.dir);
      continue;
    }
    kept.add(el.dataset.i!);
    const dx = (was.left + was.width / 2 - now.left - now.width / 2) / scale;
    const dy = (was.top + was.height / 2 - now.top - now.height / 2) / scale;
    el.animate([{ translate: `${dx}px ${dy}px`, scale: was.width / now.width, offset: 0 }], {
      duration: ms,
      easing: "cubic-bezier(.2,.8,.2,1)",
    });
  }
  const leaving = v.querySelector(".deck-pile") ?? v;
  for (const old of left) {
    if (kept.has(old.dataset.i!)) continue;
    old.classList.add("ghost");
    old.removeAttribute("role");
    old.tabIndex = -1;
    leaving.append(old);
    const done = () => old.remove();
    old
      .animate(
        [
          { opacity: 1, translate: "0 0", offset: 0 },
          { opacity: 0, translate: `${-how.dir * 60}px 0`, offset: 1 },
        ],
        { duration: ms * 0.8, easing: "ease-in" },
      )
      .finished.then(done, done);
  }
}
