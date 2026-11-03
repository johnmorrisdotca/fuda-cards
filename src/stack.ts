/**
 * Where one card of a stack lies, as the stack's layout says: how far it is nudged across and down, in card widths, and how far it is turned.
 *
 * @example
 * ```ts
 * import { stackLayout, type StackPlace } from "@johnmorrisdotca/fuda-cards";
 *
 * const place: StackPlace = stackLayout(5, { seed: 3 })[0];
 * console.log(Object.keys(place)); // [ 'x', 'y', 'rotate' ]
 * ```
 */
export interface StackPlace {
  /** Across, in card widths from where a square card lies. */
  x: number;
  /** Down, in card widths. */
  y: number;
  /** Turn in degrees. */
  rotate: number;
}
/**
 * How a stack is laid out: how messy, from which seed and how many cards deep.
 *
 * @example
 * ```ts
 * import { stackLayout, type StackLayoutOptions } from "@johnmorrisdotca/fuda-cards";
 *
 * const messy: StackLayoutOptions = { messiness: 0.8, seed: 7, depth: 5 };
 * console.log(stackLayout(52, messy).length); // 5
 * ```
 */
export interface StackLayoutOptions {
  /** From 0 (squared up) to 1 (very messy). Unless said, 0.3. */
  messiness?: number;
  /** The stack's own seed: the same seed lays the same stack the same way. Unless said, 1. */
  seed?: number;
  /** How many cards under the top one are laid out at most, so a stack of 52 costs no more than one of 11. Unless said, 10. */
  depth?: number;
}

/** A stream of numbers in [0, 1) fixed by a seed (mulberry32). */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp01 = (value: number): number => (Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 1);
const round = (value: number): number => {
  const kept = Math.round(value * 1000) / 1000;
  return Object.is(kept, -0) ? 0 : kept;
};

/**
 * Where the cards of a stack lie, from neat to messy, the same every time for the same seed: the cards under the top one, bottom first, at most
 * `depth` of them, as the top card is the live one and lies square. A card's place depends on its number from the bottom, so a card put
 * on top moves none of those under it.
 *
 * The idea and the three parameters (messiness, seed, depth) come from toranpu's pileLayout (github.com/johnmorrisdotca/toranpu,
 * `src/ui/layout.ts`, MIT). This is written again here for a stack that has a true thickness: a card's height is not faked by moving it
 * down the page, so only the nudge and the turn are laid out.
 *
 * @param count - How many cards the stack holds; with none or one there is nothing under the top.
 * @param options - How messy, which seed and how deep. Unless said: 0.3, 1 and 10.
 * @returns The places of the cards under the top one, bottom first; empty for a stack of one.
 * @example
 * ```ts
 * import { stackLayout } from "@johnmorrisdotca/fuda-cards";
 *
 * const same = JSON.stringify(stackLayout(52, { seed: 7 })) === JSON.stringify(stackLayout(52, { seed: 7 }));
 * console.log(same, stackLayout(1).length, stackLayout(52).length); // true 0 10
 * ```
 */
export function stackLayout(count: number, options: StackLayoutOptions = {}): StackPlace[] {
  const whole = Math.max(0, Math.floor(Number.isFinite(count) ? count : 0));
  const mess = clamp01(options.messiness ?? 0.3);
  const depth = Math.max(0, Math.floor(options.depth ?? 10));
  const shown = Math.max(0, Math.min(whole - 1, depth));
  const seed = Number.isFinite(options.seed) ? (options.seed as number) : 1;
  const places: StackPlace[] = [];
  for (let at = 0; at < shown; at++) {
    const index = whole - 1 - shown + at;
    const random = seededRandom((seed * 2654435761 + index * 40503) >>> 0);
    const nudge = 0.09 * mess;
    places.push({
      x: round((random() * 2 - 1) * nudge),
      y: round((random() * 2 - 1) * nudge * 0.8),
      rotate: round((random() * 2 - 1) * 14 * mess ** 1.3),
    });
  }
  return places;
}

/**
 * The markup of the cards under the top one, bottom first, for a stack of `count` cards: each is the frame of the top card with
 * nothing written on it, laid where `places` says and as many cards lower as its number from the bottom.
 */
export function stillsHtml(places: StackPlace[], count: number): string {
  return places
    .map(
      (place, at) =>
        `<div class="still" style="--x:${place.x};--y:${place.y};--r:${place.rotate};--k:${count - places.length + at}"><div class="inner"></div><div class="shine"></div></div>`,
    )
    .join("");
}
