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
export function fanLayout(count: number, seed = 1): FanPlace[] {
  const n = Math.max(0, Math.floor(count));
  if (!n) return [];
  const spread = Math.min(110, 11 * (n - 1)), step = n > 1 ? spread / (n - 1) : 0;
  const nudge = stackLayout(n, {messiness: 0.25, seed, depth: n});
  return Array.from({length: n}, (_, i) => {
    const under = i >= 1 ? nudge[i - 1] : undefined;
    return {
      angle: Math.round((-spread / 2 + i * step) * 100) / 100,
      x: Math.round((i - (n - 1) / 2) * 0.34 * 1000) / 1000,
      y: 0,
      closedAngle: under ? under.rotate / 3 : 0,
      closedX: under ? under.x : 0,
      closedY: under ? under.y : 0
    };
  });
}

/**
 * A card taken off a pile flies to the pile at its side, and turns over sideways on the way if it lands face down; coming back it
 * does the same in reverse. `fly` carries the card across, `turn` carries the turn. `from` is how far the card is from where it ends.
 */
export function flight(fly: HTMLElement, turn: HTMLElement, from: {x: number; y: number}, land: 'face-up' | 'face-down', direction: 'off' | 'back', ms: number): Animation[] {
  const options: KeyframeAnimationOptions = {duration: ms, easing: 'cubic-bezier(.3,.1,.2,1)'};
  const out = [fly.animate([
    {transform: `translate3d(${from.x}px,${from.y}px,0)`},
    {transform: `translate3d(${from.x / 2}px,${from.y / 2 - 34}px,80px) scale(1.07)`, offset: 0.5},
    {transform: 'translate3d(0,0,0)'}
  ], options)];
  if (land === 'face-down') out.push(turn.animate(direction === 'off' ? [{transform: 'none'}, {transform: 'rotateY(180deg)'}] : [{transform: 'rotateY(180deg)'}, {transform: 'none'}], options));
  return out;
}
