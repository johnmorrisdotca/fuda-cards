/**
 * Where the cards of a stack lie, from neat to messy, the same every time for the same seed.
 *
 * The idea and the three parameters (messiness, seed, depth) come from toranpu's pileLayout
 * (github.com/johnmorrisdotca/toranpu, `src/ui/layout.ts`, MIT). This is written again here for a stack that has a true
 * thickness: a card's height is not faked by moving it down the page, so only the nudge and the turn are laid out.
 */
export interface StackPlace {
  /** Across, in card widths from where a square card lies. */
  x: number;
  /** Down, in card widths. */
  y: number;
  /** Turn in degrees. */
  rotate: number;
}
export interface StackLayoutOptions {
  /** From 0 (squared up) to 1 (very messy). Unless said, 0.3. */
  messiness?: number;
  /** The stack's own seed: the same seed lays the same stack the same way. Unless said, 1. */
  seed?: number;
  /** How many cards under the top one are laid out at most, so a stack of 52 costs no more than one of 11. Unless said, 10. */
  depth?: number;
}

/** A stream of numbers in [0, 1) fixed by a seed (mulberry32). */
function seededRandom(seed: number): () => number {
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
 * The cards under the top one of a stack of `count`, bottom first: the top `depth` of them, as the top card is the live one
 * and lies square. A card's place depends on its number from the bottom, so a card put on top moves none of those under it.
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
      rotate: round((random() * 2 - 1) * 14 * mess ** 1.3)
    });
  }
  return places;
}
