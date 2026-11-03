import { type BinderLayout, binderLayout, sideCount, spreadCount, spreadOf } from "./binder.js";
import type { ChoiceHandle } from "./choice.js";
import {
  type CollectionCard,
  type CollectionView,
  collectionViewAliases,
  collectionViews,
  isCard,
  movePage,
  parseCollection,
} from "./collection.js";
import { readAddress, writeAddress } from "./collection-address.js";
import { binderPageCount, renderBinder, syncBinderChoices } from "./collection-binder-view.js";
import { buildControls } from "./collection-controls.js";
import { applyFan, playFlip, renderDeck } from "./collection-deck.js";
import { renderDetail } from "./collection-dialog.js";
import { playMove, snapshotRects } from "./collection-motion.js";
import { gliding, pages, pileViews, scrolling } from "./collection-views.js";
import type { LiveCards, LiveItem } from "./live-3d.js";
import { type FanPlace, normalizeLanding, timing } from "./pile.js";
import type { ZoomView } from "./zoom.js";

/**
 * Live 3D in a collection's cards: the shared cards from `createLiveCards` and the 3D item of a card, if it has one. See docs/live-3d.md.
 *
 * @example
 * ```ts no-run
 * import type { CollectionLive } from "@johnmorrisdotca/fuda-cards/collection-element";
 * import { createLiveCards } from "@johnmorrisdotca/fuda-cards/live-3d";
 *
 * const live: CollectionLive = { cards: createLiveCards({ load: () => import("three") }) as never, item: () => undefined };
 * console.log(typeof live.item);
 * ```
 */
export interface CollectionLive {
  cards: LiveCards<never>;
  item(card: CollectionCard): LiveItem<never> | undefined;
}

/**
 * `<fuda-collection>`: a whole collection in one of ten displays (a deck, a rolodex, binder pages, a display case, a random draw, a story scroll, a gallery wall,
 * a spotlight, a card table, a fan), with zoom, Fit and Centre, the choices kept in the page address and a card detail on a press. Give it
 * `cards` (see {@link parseCollection}) and a `view`.
 *
 * @example
 * ```ts no-run
 * import "@johnmorrisdotca/fuda-cards/collection-element";
 * import type { FudaCollection } from "@johnmorrisdotca/fuda-cards/collection-element";
 *
 * const collection = document.createElement("fuda-collection") as FudaCollection;
 * collection.setAttribute("view", "binder");
 * collection.cards = [{ id: "1", name: "Explorer One", image: "one.jpg" }];
 * document.body.append(collection);
 * ```
 */
export class FudaCollection extends HTMLElement {
  /** @internal */
  root = this.attachShadow({ mode: "open" });
  /** @internal */
  data: CollectionCard[] = [];
  /** @internal */
  index = 0;
  /** @internal */
  pageSize = 9;
  /** @internal */
  selected: CollectionCard | null = null;
  /** @internal */
  back = false;
  /** @internal */
  drawFilter = "";
  /** @internal */
  zoom: ZoomView | null = null;
  /** @internal */
  tiles?: ChoiceHandle;
  /** @internal */
  landing?: ChoiceHandle;
  /** @internal */
  fanChoice?: ChoiceHandle;
  /** @internal */
  animateChoice?: ChoiceHandle;
  /** @internal */
  speedChoice?: ChoiceHandle;
  /** @internal */
  binderChoices: Record<string, ChoiceHandle> = {};
  /** @internal */
  turn: { from: number; to: number } | null = null;
  /** @internal */
  flip: "off" | "back" | null = null;
  /** @internal */
  addressTimer = 0;
  /** @internal */
  fanPlaces: FanPlace[] = [];
  private liveSetup: CollectionLive | null = null;
  private liveOff: Array<() => void> = [];
  static get observedAttributes() {
    return [
      "view",
      "page-size",
      "columns",
      "fan",
      "fan-size",
      "deck-land",
      "deck-messiness",
      "deck-seed",
      "theme",
      "animate",
      "speed",
      "binder",
      "cover",
      "sheet",
      "pockets",
    ];
  }
  set cards(value: CollectionCard[]) {
    this.data = parseCollection(value);
    this.index = Math.min(this.index, Math.max(0, this.data.length - 1));
    this.flip = null;
    this.render();
  }
  get cards() {
    return this.data.map((c) => ({ ...c, ...(c.metadata ? { metadata: { ...c.metadata } } : {}) }));
  }
  /** Live 3D: the card in focus turns in 3D on the page's one WebGL context, and every other card stays its picture. Nothing 3D loads until a card is focused. */
  set live(value: CollectionLive | null) {
    this.liveSetup = value;
    this.render();
  }
  get live() {
    return this.liveSetup;
  }
  /** The cards are drawn again on every move, so their live views are made again too: the pictures stay in the shared cache. */
  private attachLive(v: HTMLElement) {
    for (const off of this.liveOff) off();
    this.liveOff = [];
    const setup = this.liveSetup;
    if (!setup) return;
    for (const el of Array.from(v.querySelectorAll<HTMLElement>(".card[data-i]:not(.ghost)"))) {
      const c = this.data[Number(el.dataset.i)];
      const item = c && setup.item(c);
      if (!item) continue;
      const still = el.querySelector("img") ?? undefined;
      this.liveOff.push(setup.cards.add(el, item, still ? { still } : {}));
    }
  }
  /** The card on top of the deck, or the first card of the page or fan (counting from 0). */
  get position() {
    return this.index;
  }
  connectedCallback() {
    if (this.hasAttribute("address")) readAddress(this);
    this.render();
  }
  disconnectedCallback() {
    clearTimeout(this.addressTimer);
    for (const off of this.liveOff) off();
    this.liveOff = [];
  }
  attributeChangedCallback(name: string) {
    this.pageSize = Math.min(100, Math.max(1, Math.floor(Number(this.getAttribute("page-size")) || 9)));
    if (name === "fan" && this.setFan()) return;
    if (name === "animate" || name === "speed") {
      this.timeVars();
      this.syncChoices();
      return;
    }
    if (name === "view" || name === "page-size" || name === "columns") {
      this.index = 0;
      this.flip = null;
    }
    this.render(name === "view", name === "view" ? { kind: "view", dir: 1 } : undefined);
  }
  /** @internal */
  get currentView(): CollectionView {
    let v = this.getAttribute("view") ?? "";
    v = collectionViewAliases[v] ?? v;
    return collectionViews.some((x) => x.id === v) ? (v as CollectionView) : "deck";
  }
  /** How a card taken off lands: still facing up, or turned over sideways. The 0.6.0 value `upside-down` is still accepted and means turned over. */
  /** @internal */
  get land(): "face-up" | "face-down" {
    return normalizeLanding(this.getAttribute("deck-land"));
  }
  /** @internal */
  get fanOpen() {
    return this.getAttribute("fan") === "open";
  }
  /** @internal */
  get stacked() {
    return ![...pages, ...scrolling].includes(this.currentView);
  }
  /** @internal */
  get piled() {
    return pileViews.includes(this.currentView);
  }
  /** Only a card turns: a collection of objects (no card in it) never turns, and in a mixed one the objects stay square to the reader while the cards turn. */
  /** @internal */
  get hasCards() {
    return this.data.some(isCard);
  }
  /** @internal */
  get turnable() {
    return (this.piled || this.currentView === "fan") && this.hasCards;
  }
  /** @internal */
  q<T extends HTMLElement = HTMLElement>(selector: string) {
    return this.root.querySelector(selector) as T;
  }
  /** @internal */
  move(n: number) {
    if (!this.data.length) return;
    const view = this.currentView;
    if (view === "binder") {
      const per = this.binderLay().per;
      const spreads = spreadCount(sideCount(this.data.length, per));
      const from = spreadOf(this.index, per);
      const to = (from + n + spreads * Math.abs(n)) % spreads;
      this.turn = { from, to };
      this.index = this.spreadFirst(to);
    } else if (pages.includes(view)) {
      this.index = movePage(this.index, this.data.length, this.pageSize, n);
    } else {
      const next = (this.index + n + this.data.length) % this.data.length;
      this.flip = this.piled && Math.abs(n) === 1 && next === this.index + n ? (n > 0 ? "off" : "back") : null;
      this.index = next;
    }
    this.render(false, { kind: "move", dir: n > 0 ? 1 : -1 });
  }
  /** @internal */
  binderLay(): BinderLayout {
    return binderLayout(this.getAttribute("pockets"), this.getAttribute("columns"), this.getAttribute("page-size"));
  }
  /** The first card of an opening of the binder: the right-hand page's first card, or the left-hand page's when the right-hand page is past the end. */
  private spreadFirst(spread: number) {
    const per = this.binderLay().per;
    const sides = sideCount(this.data.length, per);
    return Math.min(this.data.length - 1, (2 * spread < sides ? 2 * spread : 2 * spread - 1) * per);
  }
  /** @internal */
  image(c: CollectionCard, at: number): HTMLButtonElement {
    const button = document.createElement("button");
    button.className = "card";
    button.dataset.i = String(at);
    button.setAttribute("aria-label", `Inspect ${c.name}`);
    const img = document.createElement("img");
    img.src = c.image;
    img.alt = c.name;
    img.loading = "lazy";
    img.onerror = () => {
      img.replaceWith(document.createTextNode(`Image unavailable: ${c.name}`));
    };
    button.append(img);
    button.onclick = () => this.open(c);
    return button;
  }
  /** @internal */
  open(c: CollectionCard) {
    this.selected = c;
    this.back = false;
    renderDetail(this);
  }
  /** @internal */
  canDraw() {
    const query = this.drawFilter.trim().toLocaleLowerCase();
    return this.data.some((c) => c.name.toLocaleLowerCase().includes(query));
  }
  /** The one length every move takes, in a custom property the stylesheet reads: `animate="off"` and reduced motion make it 0, `speed` stretches it. */
  /** @internal */
  timeVars() {
    const t = timing(this, true);
    const shell = this.root.querySelector<HTMLElement>(".shell");
    if (!shell) return t;
    shell.style.setProperty("--t", t.on ? `${t.ms}ms` : "0s");
    if (t.on) shell.style.removeProperty("--stag");
    else shell.style.setProperty("--stag", "0ms");
    return t;
  }
  /** @internal */
  syncChoices() {
    this.animateChoice?.set(this.getAttribute("animate") === "off" ? "off" : "on");
    this.speedChoice?.set(
      ["slow", "quick"].includes(this.getAttribute("speed") ?? "") ? this.getAttribute("speed")! : "normal",
    );
  }
  /** `fan` changed: when a pile is on screen, move its cards to or from the fan in place (animated) and fit the view to it. Returns false when there is no pile to move. */
  private setFan(): boolean {
    if (!this.zoom || !(this.piled || this.currentView === "fan")) return false;
    const v = this.q(".v");
    if (!v.classList.contains("deck") || !this.data.length) return false;
    const t = this.timeVars();
    this.zoom.animated(
      () => {
        applyFan(this, v, this.fanOpen);
        this.zoom!.refresh();
      },
      t.on ? t.ms : 0,
    );
    this.syncChoices();
    this.fanChoice!.set(this.fanOpen ? "open" : "closed");
    writeAddress(this);
    return true;
  }
  /** @internal */
  render(reset = false, how?: { kind: "move" | "view"; dir: number }) {
    if (!this.isConnected) return;
    buildControls(this);
    const view = this.currentView;
    const stage = this.q(".stage");
    const v = this.q(".v");
    const t = this.timeVars();
    const playing = t.on && how && this.data.length > 0;
    const before = playing ? snapshotRects(v) : new Map<string, DOMRect>();
    const left =
      playing && how!.kind === "move" && gliding.includes(view)
        ? Array.from(v.querySelectorAll<HTMLElement>(".card:not(.ghost)"))
        : [];
    syncBinderChoices(this, view);
    this.tiles!.set(view);
    this.landing!.set(this.land);
    this.fanChoice!.set(this.fanOpen ? "open" : "closed");
    this.syncChoices();
    this.landing!.hidden = !this.piled || !this.hasCards;
    this.fanChoice!.hidden = !(this.piled || view === "fan");
    this.q(".count").textContent = this.data.length
      ? view === "binder"
        ? binderPageCount(this)
        : pages.includes(view)
          ? `Page ${Math.floor(this.index / this.pageSize) + 1} / ${Math.ceil(this.data.length / this.pageSize)}`
          : `${this.index + 1} / ${this.data.length}`
      : "No cards";
    for (const selector of [".prev", ".next"]) this.q<HTMLButtonElement>(selector).disabled = !this.data.length;
    const random = view === "random";
    this.q(".draw-filter").hidden = !random;
    this.q(".draw").hidden = !random;
    this.q<HTMLInputElement>(".draw-filter input").value = this.drawFilter;
    this.q<HTMLButtonElement>(".draw").disabled = !this.canDraw();
    stage.className = `stage ${view}`;
    v.className = "v";
    v.replaceChildren();
    v.style.removeProperty("--columns");
    for (const k of ["--fl", "--fr", "--ft", "--fb"]) v.style.removeProperty(k);
    this.zoom!.minOpen = scrolling.includes(view) ? 0.5 : 0;
    this.zoom!.setTurnable(this.turnable && this.data.length > 0, this.data.length > 0 && !this.hasCards);
    this.zoom!.items = this.piled || view === "fan" ? ".extent" : view === "binder" ? ".book" : ".card,.slot";
    if (!this.data.length) {
      v.innerHTML = '<p class="empty">No cards in this collection.</p>';
    } else if (this.piled) renderDeck(this, v);
    else if (view === "fan") renderDeck(this, v, true);
    else if (view === "binder") renderBinder(this, v, t);
    else if (pages.includes(view)) {
      v.classList.add("grid", view);
      const columns = Math.min(10, Math.max(1, Math.floor(Number(this.getAttribute("columns")) || 3)));
      v.style.setProperty("--columns", String(columns));
      const start = Math.floor(this.index / this.pageSize) * this.pageSize;
      this.data.slice(start, start + this.pageSize).forEach((c, k) => {
        v.append(this.image(c, start + k));
      });
    } else if (view === "wall" || view === "story") {
      v.classList.add(view);
      this.data.forEach((c, k) => {
        v.append(this.image(c, k));
      });
    } else if (view === "atlas") {
      v.classList.add("atlas");
      const plane = document.createElement("div");
      plane.className = "plane";
      this.data.forEach((c, k) => {
        plane.append(this.image(c, k));
      });
      v.append(plane);
    } else {
      v.classList.add("stack", view);
      const count = Math.min(3, this.data.length);
      for (let d = count - 1; d >= 0; d--) {
        const at = (this.index + d) % this.data.length;
        const c = this.data[at];
        const el = this.image(c, at);
        const offset = view === "rolodex" ? d * 42 : view === "spotlight" ? d * 70 : d * 14;
        const rotation = view === "rolodex" ? d * 12 : d * 5;
        el.style.transform = `translateX(calc(-50% + ${offset}px)) rotate(${rotation}deg) scale(${1 - d * 0.08})`;
        el.style.opacity = String(1 - d * 0.2);
        v.append(el);
      }
    }
    this.attachLive(v);
    this.zoom!.refresh(reset);
    if (this.flip && this.piled && t.on && this.data.length > 1) playFlip(this, this.flip, v, Math.round(t.ms * 1.15));
    this.flip = null;
    if (playing) playMove(this, how!, before, left, view, v, t.ms);
  }
}
if (!customElements.get("fuda-collection")) customElements.define("fuda-collection", FudaCollection);
