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
  flipped?: boolean;
  motion?: 'still' | 'pan';
  playing?: boolean;
  panDirection?: 'down' | 'up';
  panLoop?: 'alternate' | 'restart';
  cardSpin?: 'center' | 'corner';
  cardSpinDirection?: 'normal' | 'reverse';
  cardSpinPaused?: boolean;
}
export const cardVariants: readonly CardVariant[] = ['classic', 'sport', 'cosmic'];
export const cardFinishes: readonly CardFinish[] = ['foil', 'matte'];
