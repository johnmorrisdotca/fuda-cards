import type { CollectionView } from "./collection.js";

// Which displays work alike.
/** The displays that turn pages: the binder and the case. */
export const pages: CollectionView[] = ["binder", "case"];
export const scrolling: CollectionView[] = ["wall", "story", "atlas"];
/** The displays that draw a pile of cards: they turn in 3D, fan open and closed, and a card comes off them onto a pile at their side. The Fan of Cards is the same pile with only the fan. */
export const pileViews: CollectionView[] = ["deck", "random"];
/** The displays whose cards sit on top of each other: moving to another card glides the cards that stay and lets the one that leaves go. */
export const gliding: CollectionView[] = ["rolodex", "spotlight", "fan"];
