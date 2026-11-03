import type { ChoiceHandle } from "./choice.js";
import type { CollectionCard, CollectionView } from "./collection.js";
import type { FanPlace, Timing } from "./pile.js";
import type { ZoomView } from "./zoom.js";

/** How a move or a change of display plays: which kind, and which way the reader is heading (1 forward, -1 back). */
export interface MoveStyle {
  kind: "move" | "view";
  dir: number;
}

/**
 * What the collection's drawing modules need from the element. `<fuda-collection>` implements it; its members are marked
 * `@internal`, so they are in no declaration file and no reference page, and the modules that draw a display take it as an argument
 * instead of reaching into a private class.
 */
export interface CollectionHost extends HTMLElement {
  readonly root: ShadowRoot;
  data: CollectionCard[];
  /** The card on top of the deck, or the first card of the page or fan. */
  index: number;
  pageSize: number;
  selected: CollectionCard | null;
  back: boolean;
  drawFilter: string;
  zoom: ZoomView | null;
  tiles?: ChoiceHandle;
  landing?: ChoiceHandle;
  fanChoice?: ChoiceHandle;
  animateChoice?: ChoiceHandle;
  speedChoice?: ChoiceHandle;
  binderChoices: Record<string, ChoiceHandle>;
  /** The page turn that the next drawing of the binder plays. */
  turn: { from: number; to: number } | null;
  /** The flight that the next drawing of the deck plays. */
  flip: "off" | "back" | null;
  addressTimer: number;
  fanPlaces: FanPlace[];
  readonly currentView: CollectionView;
  readonly land: "face-up" | "face-down";
  readonly fanOpen: boolean;
  readonly stacked: boolean;
  readonly piled: boolean;
  readonly hasCards: boolean;
  readonly turnable: boolean;
  q<T extends HTMLElement = HTMLElement>(selector: string): T;
  image(card: CollectionCard, at: number): HTMLButtonElement;
  open(card: CollectionCard): void;
  move(by: number): void;
  canDraw(): boolean;
  binderLay(): import("./binder.js").BinderLayout;
  render(reset?: boolean, how?: MoveStyle): void;
  timeVars(): Timing;
  syncChoices(): void;
}
