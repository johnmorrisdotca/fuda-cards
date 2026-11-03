// Drawing the deck: its piles of cards, the fan, and the flight of a card between the two piles.
import { isCard } from "./collection.js";
import type { CollectionHost } from "./collection-host.js";
import { type FanPlace, fanBounds, fanLayout, fanShift, flight } from "./pile.js";
import { stackLayout } from "./stack.js";

/** One pile of the deck. `positions` are data indexes from the bottom of the pile to its top; the cards under the top one lie nudged and turned from the seed and the top one lies square. A deck's cards also carry where they lie when the fan is open. */
export function drawPile(
  host: CollectionHost,
  kind: "deck" | "discard",
  positions: number[],
  fan: FanPlace[] = [],
): HTMLElement {
  const pile = document.createElement("div");
  pile.className = `pile ${kind}-pile${kind === "discard" ? " discard" : ""}`;
  pile.dataset.land = host.land;
  const messy = Math.min(1, Math.max(0, Number(host.getAttribute("deck-messiness") ?? 0.3)));
  const seed = Number(host.getAttribute("deck-seed") ?? 1) || 1;
  const depth = Math.min(positions.length - 1, fan.length ? fan.length - 1 : 9);
  const shown = positions.slice(positions.length - 1 - depth);
  const places = stackLayout(positions.length, { messiness: messy, seed, depth });
  shown.forEach((at, j) => {
    const top = j === shown.length - 1;
    const c = host.data[at];
    const place = places[j];
    const el = document.createElement("div");
    const flat = !isCard(c);
    el.className = `card${top ? " top" : ""}${flat ? " flat" : ""}`;
    el.dataset.i = String(at);
    if (place && !top) {
      el.style.setProperty("--x", String(place.x));
      el.style.setProperty("--y", String(place.y));
      el.style.setProperty("--r", String(place.rotate));
    }
    el.style.setProperty("--k", String(j));
    el.style.setProperty("--j", String(shown.length - 1 - j));
    const f = fan[shown.length - 1 - j];
    if (f) {
      el.style.setProperty("--fx", String(f.x));
      el.style.setProperty("--fa", String(f.angle));
      el.style.setProperty("--i", String(shown.length - 1 - j));
    }
    const fly = document.createElement("div");
    fly.className = "fly";
    const turn = document.createElement("div");
    turn.className = "turn";
    const front = document.createElement("div");
    front.className = "face front";
    const img = document.createElement("img");
    img.src = c.image;
    img.alt = top ? c.name : "";
    img.loading = "lazy";
    img.onerror = () => {
      img.replaceWith(document.createTextNode(`Image unavailable: ${c.name}`));
    };
    front.append(img);
    turn.append(front);
    // An object has no back to show: only a card gets the picture of its back (or the package's own).
    if (!flat) {
      const back = document.createElement("div");
      back.className = "face back";
      if (c.backImage) {
        const b = document.createElement("img");
        b.src = c.backImage;
        b.alt = "";
        b.loading = "lazy";
        back.append(b);
      } else {
        back.classList.add("generic-back");
        back.textContent = "FUDA";
      }
      turn.append(back);
    }
    fly.append(turn);
    el.append(fly);
    el.onclick = () => host.open(c);
    if (top) {
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", `Inspect ${c.name}`);
      el.tabIndex = 0;
      el.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          host.open(c);
        }
      };
    }
    pile.append(el);
  });
  return pile;
}

/** Where the fan's cards lie for a pile of this many cards. A phone's fan lies closer across and leans on its angle. */
export function fanFor(host: CollectionHost, count: number) {
  const narrow = (host.clientWidth || innerWidth) < 520;
  return fanLayout(count, Number(host.getAttribute("deck-seed") ?? 1) || 1, narrow ? 0.3 : 0.34);
}

/** Open the fan (or close it) on the pile that is on screen, without drawing it again, so every card glides: the open fan's reach is put in custom properties that move the piles apart and the Fit box. */
export function applyFan(host: CollectionHost, v: HTMLElement, open: boolean) {
  const b = open && host.fanPlaces.length > 1 ? fanBounds(host.fanPlaces) : { left: 0, right: 0, top: 0, bottom: 0 };
  v.classList.toggle("fan-open", open && host.fanPlaces.length > 1);
  for (const [k, x] of [
    ["--fl", b.left],
    ["--fr", b.right],
    ["--ft", b.top],
    ["--fb", b.bottom],
  ] as const)
    v.style.setProperty(k, String(x));
}

export function renderDeck(host: CollectionHost, v: HTMLElement, fanOnly = false) {
  const n = host.data.length;
  const deckPositions: number[] = [];
  const discardPositions: number[] = [];
  v.classList.add("deck");
  if (fanOnly) {
    const size = Math.min(10, Math.max(2, Math.floor(Number(host.getAttribute("fan-size")) || 10)));
    const count = Math.min(size, n);
    // The fan window: `count` cards from the first one, wrapping round; the top card is the first and lies on the left when open.
    for (let p = count - 1; p >= 0; p--) deckPositions.push((host.index + p) % n);
    v.classList.add("fanonly");
    host.fanPlaces = fanFor(host, count);
    v.append(drawPile(host, "deck", deckPositions, host.fanPlaces));
  } else {
    // The deck is the cards from the top card down (bottom first); the pile is the cards already flipped off, the last one on top.
    for (let p = 0; p < n - host.index; p++) deckPositions.push(n - 1 - p);
    for (let p = 0; p < host.index; p++) discardPositions.push(p);
    host.fanPlaces = fanFor(host, Math.min(10, deckPositions.length));
    const slot = () => {
      const s = document.createElement("div");
      s.className = "slot";
      return s;
    };
    // The deck is on the left and the pile on its other side; an empty pile is a dashed slot, so Fit does not jump when the first card lands.
    v.append(
      deckPositions.length ? drawPile(host, "deck", deckPositions, host.fanPlaces) : slot(),
      discardPositions.length ? drawPile(host, "discard", discardPositions) : slot(),
    );
  }
  const extent = document.createElement("div");
  extent.className = "extent";
  v.append(extent);
  applyFan(host, v, host.fanOpen);
}

/** The card that just moved flies between the two piles, turning over sideways on the way if it lands face down. The same element, so the card is never drawn twice. An open fan sends the card from where the fan holds it. */
export function playFlip(host: CollectionHost, direction: "off" | "back", v: HTMLElement, ms: number) {
  // Either pile may be an empty dashed slot (the last card put back leaves the pile empty): the card still flies the same distance, from where the pile was.
  const deck = v.querySelector<HTMLElement>(".deck-pile");
  const discard = v.querySelector<HTMLElement>(".discard-pile");
  const moved =
    direction === "off"
      ? discard?.querySelector<HTMLElement>(".card.top")
      : deck?.querySelector<HTMLElement>(".card.top");
  if (!moved) return;
  const style = getComputedStyle(v);
  const w = parseFloat(style.getPropertyValue("--w")) || 200;
  const gap = parseFloat(style.getPropertyValue("--gap")) || 56;
  const fr = parseFloat(v.style.getPropertyValue("--fr")) || 0;
  const dx = (1 + fr) * w + gap;
  const dy = 0;
  const fly = moved.querySelector<HTMLElement>(".fly")!;
  const turn = moved.querySelector<HTMLElement>(".turn")!;
  const lead = host.fanOpen && host.fanPlaces.length > 1 ? host.fanPlaces[0] : null;
  const shift = lead ? fanShift(lead) : { x: 0, y: 0 };
  const away = { x: shift.x * w, y: shift.y * w };
  const spin = lead ? lead.angle : 0;
  // Taking a card off an open fan starts it where the fan holds it; bringing it back ends there.
  // The piles' cards lie 0.9 px apart in depth (ten at most), so the flying card starts just above the higher of them and ends at its own place.
  const z = 9.6 - (Number.parseFloat(moved.style.getPropertyValue("--k")) || 0) * 0.9;
  const from = direction === "off" ? { x: -dx + away.x, y: -dy + away.y, z } : { x: dx - away.x, y: dy - away.y, z };
  flight(
    fly,
    turn,
    from,
    moved.classList.contains("flat") ? "face-up" : host.land,
    direction,
    ms,
    direction === "off" ? spin : -spin,
  );
}
