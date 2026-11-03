/**
 * A card's finish: foil catches the light and shows a rainbow in its frame, matte does not.
 *
 * @example
 * ```ts
 * import { cardFinishes, type CardFinish } from "@johnmorrisdotca/fuda-cards";
 *
 * const finish: CardFinish = "matte";
 * console.log(cardFinishes.includes(finish)); // true
 * ```
 */
export type CardFinish = "foil" | "matte";
/**
 * A card's look: classic gold, silver sport or cosmic violet.
 *
 * @example
 * ```ts
 * import { cardVariants, type CardVariant } from "@johnmorrisdotca/fuda-cards";
 *
 * const look: CardVariant = "cosmic";
 * console.log(cardVariants.indexOf(look)); // 2
 * ```
 */
export type CardVariant = "classic" | "sport" | "cosmic";

/**
 * Every setting of `<fuda-card>` as an object. `cardAttributes(options)` turns it into the element's attributes, so the same object
 * works in a framework, a script and a test.
 *
 * @example
 * ```ts
 * import { type CardOptions, cardAttributes } from "@johnmorrisdotca/fuda-cards";
 *
 * const options: CardOptions = { title: "Explorer One", variant: "sport", stack: 10, wear: "near-mint" };
 * console.log(cardAttributes(options).variant); // sport
 * ```
 */
export interface CardOptions {
  title?: string;
  category?: string;
  subtitle?: string;
  description?: string;
  number?: string;
  rarity?: string;
  variant?: CardVariant;
  finish?: CardFinish;
  /** Card thickness in millimetres at the 63 mm wide card size; overrides the material's. Default 0.325, 0 for a flat card. */
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
  /** The card shows its back. */
  flipped?: boolean;
  motion?: "still" | "pan";
  /** The picture is moving now (needs `motion: "pan"`). */
  playing?: boolean;
  /** `focus`: the card in focus animates its art (needs `motion: 'pan'`); never with reduced motion. */
  autoplay?: "focus";
  panDirection?: "down" | "up";
  panLoop?: "alternate" | "restart";
  cardSpin?: "center" | "corner";
  cardSpinDirection?: "normal" | "reverse";
  cardSpinPaused?: boolean;
  /** The page turns the card with `--fuda-yaw` and `--fuda-tilt` instead of the built-in spin. */
  cardView?: boolean;
  /** `open`: a stack of more than one card fans open. */
  fan?: "open";
  /** How many cards are on the pile beside the stack. */
  takenOff?: number;
  /** How a card taken off lands: `face-up` or turned over (`face-down`). */
  deckLand?: "face-up" | "face-down";
  /** `off` ends every move at once. */
  animate?: "on" | "off";
  /** How long a move takes: `slow`, `normal` or `quick`. */
  speed?: "slow" | "normal" | "quick";
  /** The three buttons under a stack: Fan, Take a card off and Put it back. */
  pileControls?: boolean;
}

/**
 * The three looks, in the order the studio offers them.
 *
 * @example
 * ```ts
 * import { cardVariants } from "@johnmorrisdotca/fuda-cards";
 *
 * console.log(cardVariants.join(" ")); // classic sport cosmic
 * ```
 */
export const cardVariants: readonly CardVariant[] = ["classic", "sport", "cosmic"];
/**
 * The two finishes, foil and matte.
 *
 * @example
 * ```ts
 * import { cardFinishes } from "@johnmorrisdotca/fuda-cards";
 *
 * console.log(cardFinishes.join(" ")); // foil matte
 * ```
 */
export const cardFinishes: readonly CardFinish[] = ["foil", "matte"];

/** A setting's name as the element's attribute: `stackMessiness` is `stack-messiness`. */
const attributeName = (name: string): string => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

/**
 * The attributes of a `<fuda-card>` for these options, ready to set one by one (`element.setAttribute(name, value)`): names are the
 * kebab-case of the option's, a `true` boolean is the empty string (the attribute is present) and a `false` one, like anything that
 * is `undefined` or `null`, is left out. Numbers are written as plain text.
 *
 * @param options - The settings of the card, by their camel-case names.
 * @returns The attributes by name; set each with `element.setAttribute(name, value)`. Nothing is shared with `options`.
 * @example
 * ```ts
 * import { cardAttributes } from "@johnmorrisdotca/fuda-cards";
 *
 * console.log(cardAttributes({ title: "Explorer One", stackMessiness: 0.5, flipped: true, wear: undefined }));
 * // { title: 'Explorer One', 'stack-messiness': '0.5', flipped: '' }
 * ```
 */
export function cardAttributes(options: CardOptions): Record<string, string> {
  const attributes: Record<string, string> = {};
  for (const [name, value] of Object.entries(options)) {
    if (value === undefined || value === null || value === false) continue;
    attributes[attributeName(name)] = value === true ? "" : String(value);
  }
  return attributes;
}
