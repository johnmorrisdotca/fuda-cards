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
  /** Card thickness in millimetres at the 63 mm wide card size; overrides the material's. Default 0.3, 0 for a flat card. */
  thickness?: number;
  /** A material's id (see `cardMaterials`): its sourced thickness and edge colour. */
  material?: string;
  /** How many cards the stack holds (1 to 1000); the stack is that many times the card's thickness high. Default 1, one card. */
  stack?: number;
  /** From 0 (squared up) to 1 (very messy) for the cards under the top one. Default 0.3. */
  stackMessiness?: number;
  /** The stack's seed: the same seed lays the same stack the same way. Default 1. */
  stackSeed?: number;
  /** How many cards under the top one are laid out nudged and turned, at most 52. Default 10. */
  stackDepth?: number;
  /** A card that is not perfect: a preset's id (`mint`, `near-mint`, `lightly-played`, `moderately-played`, `heavily-played`, `damaged`) or a number from 0 to 1. Default: perfect, nothing drawn. */
  wear?: string | number;
  /** The wear's seed: the same seed draws the same marks the same way. Default 1. */
  wearSeed?: number;
  /** One level of the wear on its own, from 0 to 1, over the preset's. */
  wearCorners?: number;
  wearEdges?: number;
  wearSurface?: number;
  wearCreases?: number;
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
export { cardMaterials, cardMaterial, stackPresets, stackHeightMm, mmPerPoint } from './materials.js';
export type { CardMaterial, CardMaterialGroup, CardMaterialSource, StackPreset } from './materials.js';
export { stackLayout } from './stack.js';
export type { StackPlace, StackLayoutOptions } from './stack.js';
export { wearPresets, wearPreset, wearLevels, wearLayout, wearOutline, wearOverlaySvg } from './wear.js';
export type { WearPreset, WearLevels, WearOptions, WearFeatures, WearCorner, CornerKind } from './wear.js';
