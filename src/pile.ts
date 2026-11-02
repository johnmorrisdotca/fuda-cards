/**
 * What every pile of cards shares: how a card taken off lands, how a fan lies, and how long things take.
 *
 * `<fuda-collection>` (the Overlapping Deck and the other displays that draw a pile) and `<fuda-card stack>` both use this one
 * piece, so a pile fans open and closed, and a card comes off it and goes back, the same way everywhere.
 */
import {stackLayout} from './stack.js';

/**
 * How a card taken off a pile lands on the pile at its side: still facing up, or turned over sideways (as a person turns a card, like a
 * page) to show its back. `upside-down` was a 0.6.0 value that spun the picture half way round in its plane; it is still accepted and
 * means `face-down`, so nothing breaks. A card never ends with its picture on its head.
 */
export type DeckLanding = 'face-up' | 'face-down' | 'upside-down';
export const deckLandings: ReadonlyArray<{id: 'face-up' | 'face-down'; label: string}> = [
  {id: 'face-up', label: 'Still facing up'}, {id: 'face-down', label: 'Turned over'}
];
/** The landing a value means: `face-down` (also `upside-down` and `turned-over`) is turned over; anything else is still facing up. */
export function normalizeLanding(value: string | null | undefined): 'face-up' | 'face-down' {
  return value === 'face-down' || value === 'upside-down' || value === 'turned-over' ? 'face-down' : 'face-up';
}

/** Where the cards of a fan lie, first card on the left when open and on top when closed. `open` is the fan spread like a hand of playing cards; `closed` is the squared-up deck it starts from and closes back to. */
export interface FanPlace { angle: number; x: number; y: number; closedAngle: number; closedX: number; closedY: number }
/** `step` is how far apart neighbouring cards lie across, in card widths; the angle does the rest of the spreading. A phone uses a smaller one. */
export function fanLayout(count: number, seed = 1, step = 0.34): FanPlace[] {
  const n = Math.max(0, Math.floor(count));
  if (!n) return [];
  const spread = Math.min(110, 11 * (n - 1)), turn = n > 1 ? spread / (n - 1) : 0;
  const nudge = stackLayout(n, {messiness: 0.25, seed, depth: n});
  return Array.from({length: n}, (_, i) => {
    const under = i >= 1 ? nudge[i - 1] : undefined;
    return {
      angle: Math.round((-spread / 2 + i * turn) * 100) / 100,
      x: Math.round((i - (n - 1) / 2) * step * 1000) / 1000,
      y: 0,
      closedAngle: under ? under.rotate / 3 : 0,
      closedX: under ? under.x : 0,
      closedY: under ? under.y : 0
    };
  });
}

/** The card's height over its width, and where a fan turns: 165% of a card's height down from its top. The CSS uses the same two numbers. */
export const CARD_RATIO = 3.5 / 2.5;
export const FAN_PIVOT = 1.65;

/**
 * How far an open fan reaches beyond the box of one squared-up card, in card widths: `left` and `right` past the box's sides, `top` and
 * `bottom` past its top and bottom (never negative). Pages use it to leave room and to fit the view.
 */
export function fanBounds(places: FanPlace[]): {left: number; right: number; top: number; bottom: number} {
  let x0 = 0, x1 = 1, y0 = 0, y1 = CARD_RATIO;
  const px = 0.5, py = FAN_PIVOT * CARD_RATIO;
  for (const p of places) {
    const a = (p.angle * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
    for (const [cx, cy] of [[0, 0], [1, 0], [0, CARD_RATIO], [1, CARD_RATIO]]) {
      const dx = cx - px, dy = cy - py;
      const x = px + dx * c - dy * s + p.x, y = py + dx * s + dy * c;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
  }
  const r = (v: number) => Math.round(v * 1000) / 1000;
  return {left: r(-x0), right: r(x1 - 1), top: r(-y0), bottom: r(y1 - CARD_RATIO)};
}

/**
 * The cards of a fan as they lie relative to the first one, for a pile whose first card is the one that carries the rest (a stack's live top
 * card, with the other cards laid inside it). Card by card: the turn and the shift, in card widths, that put it where the fan wants it.
 */
export function fanRelative(places: FanPlace[]): Array<{angle: number; x: number; y: number}> {
  if (!places.length) return [];
  const a0 = (places[0].angle * Math.PI) / 180, c = Math.cos(a0), s = Math.sin(a0);
  const r = (v: number) => Math.round(v * 1000) / 1000;
  return places.map((p) => {
    const dx = p.x - places[0].x;
    return {angle: r(p.angle - places[0].angle), x: r(dx * c), y: r(-dx * s)};
  });
}

/** The fan's own centre of gravity: where a card of an open fan has moved from its squared-up place, in card widths (before the pile's own turn). */
export function fanShift(place: FanPlace): {x: number; y: number} {
  const a = (place.angle * Math.PI) / 180, lever = (FAN_PIVOT - 0.5) * CARD_RATIO;
  return {x: place.x + lever * Math.sin(a), y: lever * (1 - Math.cos(a))};
}

/** How long things take: the animation is on (the page did not turn it off and the reader did not ask for reduced motion) and how long a move lasts, in milliseconds. */
export interface Timing { on: boolean; ms: number }
export const SPEEDS: Record<string, number> = {slow: 1.6, normal: 1, quick: 0.6};
/** The base length of a move, 600 ms; `speed` stretches or shortens every move at once. */
export const BASE_MS = 600;
export function reducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}
/**
 * `animate="off"` turns every move off; `animate="on"` turns them on; with no `animate` a move is on only where `dflt` says (the pieces that
 * already moved before the option existed). The reader's reduced-motion setting always wins.
 */
export function timing(host: Element, dflt: boolean): Timing {
  const a = host.getAttribute('animate');
  const asked = a === 'off' ? false : a === 'on' ? true : dflt;
  const scale = SPEEDS[host.getAttribute('speed') ?? 'normal'] ?? 1;
  return {on: asked && !reducedMotion(), ms: Math.round(BASE_MS * scale)};
}

/**
 * A card taken off a pile flies to the pile at its side, and turns over sideways on the way if it lands face down; coming back it
 * does the same in reverse. `fly` carries the card across, `turn` carries the turn. `from` is how far the card is from where it ends.
 *
 * The card must never pass through another card: every card of a 3D scene is drawn by its depth, so a card that turns while it is level
 * with the piles is cut by them and shows the cards behind it. So the card starts above the pile it leaves (`from.z`, in pixels, is how
 * much higher than its landing place that is), stays above both piles all the way, and while it turns it is lifted by half its width times the
 * sine of the turn, which is exactly what keeps its lowest corner above the cards it passes. It is level again, and down on the pile, at the end.
 */
export function flight(fly: HTMLElement, turn: HTMLElement, from: {x: number; y: number; z?: number}, land: 'face-up' | 'face-down', direction: 'off' | 'back', ms: number, spin = 0): Animation[] {
  const options: KeyframeAnimationOptions = {duration: ms, easing: 'cubic-bezier(.3,.1,.2,1)'};
  const turns = land === 'face-down', half = (fly.offsetWidth || 200) / 2, z0 = from.z ?? 0, STEPS = 16, MARGIN = 1.5;
  const fly3d: Keyframe[] = [], turn3d: Keyframe[] = [];
  for (let k = 0; k <= STEPS; k++) {
    const p = k / STEPS, q = 1 - p, arc = Math.sin(Math.PI * p);
    // Over the pile it leaves the card stays as high as that pile until half way, then comes down to where it lands.
    const base = Math.max(0, z0 * Math.min(1, 2 * q)) + MARGIN * arc;
    const lift = (turns ? half + 6 : 80) * arc;
    const z = k === STEPS ? 0 : base + lift;
    fly3d.push({offset: p, transform: `translate3d(${from.x * q}px,${from.y * q - 136 * p * q}px,${z}px) rotate(${spin * q}deg) scale(${1 + 0.07 * arc})`});
    if (turns) turn3d.push({offset: p, transform: `rotateY(${(direction === 'off' ? p : q) * 180}deg)`});
  }
  const out = [fly.animate(fly3d, options)];
  if (turns) out.push(turn.animate(turn3d, options));
  return out;
}
