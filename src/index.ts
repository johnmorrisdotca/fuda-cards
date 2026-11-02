/** A card's finish and visual family. */
export type CardFinish = 'foil' | 'matte';
export type CardVariant = 'classic' | 'sport' | 'cosmic';
export interface CardOptions {
  title?: string;
  category?: string;
  subtitle?: string;
  description?: string;
  number?: string;
  rarity?: string;
  variant?: CardVariant;
  finish?: CardFinish;
  /** Card thickness in millimetres at the 63 mm wide card size; default 0.3, 0 for a flat card. */
  thickness?: number;
  flipped?: boolean;
  motion?: 'still' | 'pan';
  playing?: boolean;
  /** `focus`: the card in focus animates its art (needs `motion: 'pan'`); never with reduced motion. */
  autoplay?: 'focus';
  panDirection?: 'down' | 'up';
  panLoop?: 'alternate' | 'restart';
  cardSpin?: 'center' | 'corner';
  cardSpinDirection?: 'normal' | 'reverse';
  cardSpinPaused?: boolean;
}
export const cardVariants: readonly CardVariant[] = ['classic', 'sport', 'cosmic'];
export const cardFinishes: readonly CardFinish[] = ['foil', 'matte'];
