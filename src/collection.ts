export type { DeckLanding, FanPlace } from "./pile.js";
export { deckLandings, fanLayout, normalizeLanding } from "./pile.js";
/**
 * The name of a display of `<fuda-collection>`: the `view` attribute's values. `jukebox` and `tower` are older names that open the deck (see
 * {@link collectionViewAliases}).
 *
 * @example
 * ```ts
 * import { collectionViews, type CollectionView } from "@johnmorrisdotca/fuda-cards/collection";
 *
 * const view: CollectionView = "binder";
 * console.log(collectionViews.some((one) => one.id === view)); // true
 * ```
 */
export type CollectionView =
  | "deck"
  | "rolodex"
  | "binder"
  | "case"
  | "jukebox"
  | "random"
  | "story"
  | "wall"
  | "tower"
  | "spotlight"
  | "atlas"
  | "fan";
/**
 * What a collector writes about a card: its set, year, number, edition, condition, grade, quantity and notes. All optional; `year` and `quantity` are whole numbers.
 *
 * @example
 * ```ts
 * import { parseCollection, type CollectionMetadata } from "@johnmorrisdotca/fuda-cards/collection";
 *
 * const metadata: CollectionMetadata = { set: "Base", year: 1999, quantity: 2 };
 * console.log(parseCollection([{ name: "Card", image: "c.jpg", metadata }])[0].metadata);
 * // { set: 'Base', year: 1999, quantity: 2 }
 * ```
 */
export interface CollectionMetadata {
  set?: string;
  year?: number;
  number?: string;
  edition?: string;
  condition?: string;
  grade?: string;
  quantity?: number;
  notes?: string;
}
/**
 * What an item is. A `card` (the default, so every collection written before this field existed is still cards) is a flat, thin card with a back: it
 * turns in 3D, can be seen from behind and lands turned over when taken off a pile. An `object` is a picture of a thing that is not a card, such as a
 * games console: it has no back and no thickness, so it never turns over, is never seen from behind or edge-on, and always lands facing up. (A real 3D
 * object would be a third kind; none can be given as an image yet.)
 *
 * @example
 * ```ts
 * import { collectionKinds, type CollectionKind } from "@johnmorrisdotca/fuda-cards/collection";
 *
 * const kind: CollectionKind = "object";
 * console.log(collectionKinds.includes(kind)); // true
 * ```
 */
export type CollectionKind = "card" | "object";
/**
 * The two kinds of item, `card` and `object`.
 *
 * @example
 * ```ts
 * import { collectionKinds } from "@johnmorrisdotca/fuda-cards/collection";
 *
 * console.log(collectionKinds); // [ 'card', 'object' ]
 * ```
 */
export const collectionKinds: ReadonlyArray<CollectionKind> = ["card", "object"];
/**
 * One item of a collection: an id, a name, the front's picture, optionally the back's, its kind and its metadata.
 *
 * @example
 * ```ts
 * import { type CollectionCard } from "@johnmorrisdotca/fuda-cards/collection";
 *
 * const card: CollectionCard = { id: "1", name: "Explorer One", image: "front.jpg", backImage: "back.jpg" };
 * console.log(card.name); // Explorer One
 * ```
 */
export interface CollectionCard {
  id: string;
  name: string;
  image: string;
  backImage?: string;
  kind?: CollectionKind;
  metadata?: CollectionMetadata;
}
/**
 * Whether an item is a card: anything that does not say it is an object. Only a card turns, has a back and lands turned over.
 *
 * @param card - The item, or anything with its `kind`.
 * @returns `true` for a card, `false` for an object.
 * @example
 * ```ts
 * import { isCard } from "@johnmorrisdotca/fuda-cards/collection";
 *
 * console.log(isCard({}), isCard({ kind: "object" })); // true false
 * ```
 */
export const isCard = (card: Pick<CollectionCard, "kind">): boolean => card.kind !== "object";
/**
 * The ten displays, in the order the buttons show them, each with the label on its button. `jukebox` and `tower` were two more names for the deck's pile of cards (no real counterpart for cards, and the same drawing), so they are no longer offered; see {@link collectionViewAliases}.
 *
 * @example
 * ```ts
 * import { collectionViews } from "@johnmorrisdotca/fuda-cards/collection";
 *
 * console.log(collectionViews.length, collectionViews[0].label); // 10 Overlapping Deck
 * ```
 */
export const collectionViews: ReadonlyArray<{ id: CollectionView; label: string }> = [
  { id: "deck", label: "Overlapping Deck" },
  { id: "rolodex", label: "Rolodex" },
  { id: "binder", label: "Binder Pages" },
  { id: "case", label: "Convention Display Case" },
  { id: "random", label: "Random Draw" },
  { id: "story", label: "Vertical Story Scroll" },
  { id: "wall", label: "Sliding Gallery Wall" },
  { id: "spotlight", label: "Spotlight Carousel" },
  { id: "atlas", label: "Card Table" },
  { id: "fan", label: "Fan of Cards" },
];
/**
 * Display names that earlier versions accepted and that now open another display, so a page that sets them keeps working.
 *
 * @example
 * ```ts
 * import { collectionViewAliases } from "@johnmorrisdotca/fuda-cards/collection";
 *
 * console.log(collectionViewAliases.jukebox); // deck
 * ```
 */
export const collectionViewAliases: Readonly<Record<string, CollectionView>> = { jukebox: "deck", tower: "deck" };
/**
 * Check a collection and make it the shape the element draws: an array of cards, or an object with a `cards` array. A card without an id is numbered by its place.
 *
 * @param input - An array of items, or `{ cards: [...] }` as an exported collection has it.
 * @returns A new array of cards; the input is not changed.
 * @throws Error saying which card is wrong (its number, and what is wrong with it) for an input that is not an array, a card that is not an object, a missing name or image, a repeated id, a back or kind of the wrong type, or invalid metadata.
 * @example
 * ```ts
 * import { parseCollection } from "@johnmorrisdotca/fuda-cards/collection";
 *
 * console.log(parseCollection([{ name: "Card", image: "front.jpg" }])); // [ { id: '0', name: 'Card', image: 'front.jpg' } ]
 * try {
 *   parseCollection([{ name: "Card" }]);
 * } catch (error) {
 *   console.log((error as Error).message); // Card 1 needs a name and image URL.
 * }
 * ```
 */
export function parseCollection(input: unknown): CollectionCard[] {
  const value =
    input && typeof input === "object" && !Array.isArray(input) && "cards" in input
      ? (input as { cards: unknown }).cards
      : input;
  if (!Array.isArray(value)) throw new Error("Collection must be an array or an object containing a cards array.");
  const ids = new Set<string>();
  return value.map((item: unknown, i: number) => {
    if (!item || typeof item !== "object") throw new Error(`Card ${i + 1} must be an object.`);
    const c = item as Record<string, unknown>;
    if (typeof c.name !== "string" || !c.name.trim() || typeof c.image !== "string" || !c.image.trim())
      throw new Error(`Card ${i + 1} needs a name and image URL.`);
    const id = typeof c.id === "string" && c.id ? c.id : String(i);
    if (ids.has(id)) throw new Error(`Duplicate card id: ${id}`);
    ids.add(id);
    if (c.backImage !== undefined && typeof c.backImage !== "string")
      throw new Error(`Card ${i + 1} backImage must be a URL.`);
    if (c.kind !== undefined && !collectionKinds.includes(c.kind as CollectionKind))
      throw new Error(`Card ${i + 1} kind must be "card" or "object".`);
    let metadata: CollectionMetadata | undefined;
    if (c.metadata !== undefined) {
      if (!c.metadata || typeof c.metadata !== "object" || Array.isArray(c.metadata))
        throw new Error(`Card ${i + 1} metadata must be an object.`);
      const m = c.metadata as Record<string, unknown>;
      for (const key of ["set", "number", "edition", "condition", "grade", "notes"])
        if (m[key] !== undefined && typeof m[key] !== "string")
          throw new Error(`Card ${i + 1} metadata.${key} must be a string.`);
      for (const key of ["year", "quantity"])
        if (
          m[key] !== undefined &&
          (typeof m[key] !== "number" ||
            !Number.isSafeInteger(m[key]) ||
            (m[key] as number) < (key === "quantity" ? 1 : 0))
        )
          throw new Error(`Card ${i + 1} metadata.${key} must be a valid integer.`);
      metadata = {};
      for (const key of ["set", "number", "edition", "condition", "grade", "notes"] as const)
        if (typeof m[key] === "string") metadata[key] = m[key];
      for (const key of ["year", "quantity"] as const) if (typeof m[key] === "number") metadata[key] = m[key];
    }
    return {
      id,
      name: c.name,
      image: c.image,
      ...(c.backImage ? { backImage: c.backImage as string } : {}),
      ...(c.kind === "object" ? { kind: "object" as const } : {}),
      ...(metadata ? { metadata } : {}),
    };
  });
}

/**
 * Choose a card whose name contains the filter, avoiding the current card when another match exists.
 *
 * @param cards - The collection.
 * @param current - The index of the card now on top.
 * @param filter - Text the name must contain, whatever its case; spaces round it are ignored. Empty matches every card.
 * @param random - A source of numbers from 0 up to but not including 1. Unless said, `Math.random`.
 * @returns The index of the card to draw, or `null` when no card matches.
 * @example
 * ```ts
 * import { randomDrawIndex } from "@johnmorrisdotca/fuda-cards/collection";
 *
 * const cards = ["Alpha", "Beta", "Gamma"].map((name, i) => ({ id: String(i), name, image: `${i}.jpg` }));
 * console.log(randomDrawIndex(cards, 0, "", () => 0)); // 1
 * console.log(randomDrawIndex(cards, 0, "zzz")); // null
 * ```
 */
export function randomDrawIndex(
  cards: CollectionCard[],
  current: number,
  filter: string,
  random = Math.random,
): number | null {
  const query = filter.trim().toLocaleLowerCase();
  const matches = cards
    .map((card, index) => ({ card, index }))
    .filter(({ card }) => card.name.toLocaleLowerCase().includes(query));
  if (!matches.length) return null;
  const alternatives = matches.filter(({ index }) => index !== current);
  const pool = alternatives.length ? alternatives : matches;
  return pool[Math.floor(random() * pool.length)].index;
}

/**
 * The first card of the page that is `delta` pages away, wrapping round at either end.
 *
 * @param index - The index of any card on the page now.
 * @param length - How many cards the collection holds.
 * @param pageSize - How many cards a page holds.
 * @param delta - How many pages to move: 1 forward, -1 back.
 * @returns The index of the first card of that page; 0 for an empty collection.
 * @example
 * ```ts
 * import { movePage } from "@johnmorrisdotca/fuda-cards/collection";
 *
 * console.log(movePage(6, 7, 3, 1), movePage(0, 7, 3, -1)); // 0 6
 * ```
 */
export function movePage(index: number, length: number, pageSize: number, delta: number): number {
  if (length === 0) return 0;
  const pages = Math.ceil(length / pageSize);
  const page = Math.floor(index / pageSize);
  return ((((page + delta) % pages) + pages) % pages) * pageSize;
}
