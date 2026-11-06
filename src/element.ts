import { cardMarkup } from "./card-markup.js";
import { cardMaterial, DEFAULT_CARD_THICKNESS_MM, stackHeightMm } from "./materials.js";
import { reducedMotion } from "./motion.js";
import { stackLayout, stillsHtml } from "./stack.js";

const template = document.createElement("template");
template.innerHTML = cardMarkup();
const defaults: Record<string, string> = {
  title: "Untitled",
  category: "COLLECTIBLE",
  subtitle: "An item worth collecting",
  description: "Add a description to tell its story.",
  number: "NO. 001",
  rarity: "✦",
};
/** The one card in focus: the card under the pointer, holding keyboard focus or last tapped. Only it may autoplay. */
let focusedCard: FudaCard | null = null;
document.addEventListener(
  "pointerdown",
  (event) => {
    if (focusedCard && !event.composedPath().includes(focusedCard)) focusedCard.setFocused(false);
  },
  true,
);
/**
 * `<fuda-card>`: a collectible card frame around a picture you give it (or a live 3D view), drawn with a true thickness, an edge, a back, foil or matte,
 * a stack, wear and the three looks. Import this module once to register the element; the attributes are listed in the card guide and in
 * [`CardOptions`](api:CardOptions), and `cardAttributes(options)` writes them from an object.
 *
 * @example
 * ```ts no-run
 * import "@johnmorrisdotca/fuda-cards/element";
 * import { cardAttributes } from "@johnmorrisdotca/fuda-cards";
 *
 * const card = document.createElement("fuda-card");
 * for (const [name, value] of Object.entries(cardAttributes({ title: "Explorer One", stack: 10, wear: "near-mint" }))) card.setAttribute(name, value);
 * document.body.append(card);
 * ```
 */
export class FudaCard extends HTMLElement {
  static observedAttributes = [
    "title",
    "category",
    "subtitle",
    "description",
    "number",
    "rarity",
    "motion",
    "playing",
    "thickness",
    "autoplay",
    "material",
    "stack",
    "stack-messiness",
    "stack-seed",
    "stack-depth",
    "wear",
    "wear-seed",
    "wear-corners",
    "wear-edges",
    "wear-surface",
    "wear-creases",
    "fan",
    "taken-off",
    "deck-land",
    "animate",
    "speed",
    "pile-controls",
  ];
  private focused = false;
  private hushed = false;
  private focusedAtPress?: boolean;
  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.append(template.content.cloneNode(true));
    const button = root.querySelector("button");
    button?.addEventListener("click", () => this.toggleMotion());
    this.watchArt(root);
    this.watchFacing();
    this.watchFocus(button);
    this.watchLight();
  }
  /** The light follows the pointer over the card: a foil card shows its sheen where the pointer is (see `--fuda-sheen-x` and `--fuda-sheen-y`). */
  private watchLight(): void {
    this.addEventListener("pointermove", (e) => {
      const box = this.getBoundingClientRect();
      if (!box.width || !box.height) return;
      this.style.setProperty("--fuda-sheen-x", String(Math.round(((e.clientX - box.left) / box.width) * 100)));
      this.style.setProperty("--fuda-sheen-y", String(Math.round(((e.clientY - box.top) / box.height) * 100)));
    });
    this.addEventListener("pointerleave", () => {
      this.style.removeProperty("--fuda-sheen-x");
      this.style.removeProperty("--fuda-sheen-y");
    });
  }
  /** With `autoplay="focus"` the card in focus animates its art; leaving it (pointer, keyboard or a tap elsewhere) stops it. */
  private watchFocus(button: HTMLButtonElement | null): void {
    const auto = () => this.getAttribute("autoplay") === "focus";
    this.addEventListener("pointerenter", (e) => {
      if (auto() && e.pointerType !== "touch") this.setFocused(true);
    });
    this.addEventListener("pointerleave", (e) => {
      if (e.pointerType !== "touch" && !this.matches(":focus-within")) this.setFocused(false);
    });
    this.addEventListener("pointerdown", (e) => {
      if (!auto()) return;
      if (e.composedPath().includes(button as EventTarget)) this.focusedAtPress = this.focused;
      else this.setFocused(true);
    });
    this.addEventListener("focusin", () => {
      if (auto()) this.setFocused(true);
    });
    this.addEventListener("focusout", (e) => {
      if (!this.contains(e.relatedTarget as Node | null) && !this.matches(":hover")) this.setFocused(false);
    });
  }
  /** Put this card in focus (or out of it); the card that had focus is put out, so only one is ever in focus. */
  setFocused(on: boolean): void {
    if (on && focusedCard && focusedCard !== this) focusedCard.setFocused(false);
    if (on) focusedCard = this;
    else if (focusedCard === this) focusedCard = null;
    if (this.focused === on) return;
    this.focused = on;
    if (!on) this.hushed = false;
    this.render();
  }
  /** True while the art moves: `playing` is set, or the card is in focus with `autoplay="focus"` and the person has not paused it. Never autoplays with reduced motion. */
  get isMoving(): boolean {
    return (
      this.getAttribute("motion") === "pan" &&
      (this.hasAttribute("playing") ||
        (this.getAttribute("autoplay") === "focus" && this.focused && !this.hushed && !reducedMotion()))
    );
  }
  private toggleMotion(): void {
    const auto = this.getAttribute("autoplay") === "focus";
    const was = this.focusedAtPress ?? this.focused;
    this.focusedAtPress = undefined;
    if (auto && !was) {
      this.hushed = false;
      this.setFocused(true);
      this.render();
      return;
    }
    const held = auto;
    if (this.isMoving) {
      this.removeAttribute("playing");
      if (held) this.hushed = true;
    } else {
      this.hushed = false;
      if (!held || reducedMotion()) this.setAttribute("playing", "");
    }
    this.render();
  }
  /** The art stays invisible until the card has a size on screen and every slotted image has loaded, so it never shows outside the frame. */
  private watchArt(root: ShadowRoot): void {
    const art = root.querySelector(".art") as HTMLElement;
    const slot = root.querySelector("slot") as HTMLSlotElement;
    const update = () => {
      const laid = this.offsetWidth > 0 && this.offsetHeight > 0;
      const waiting = slot
        .assignedElements({ flatten: true })
        .some((el) => el instanceof HTMLImageElement && !el.complete);
      art.classList.toggle("ready", laid && !waiting);
    };
    slot.addEventListener("slotchange", update);
    slot.addEventListener("load", update, true);
    slot.addEventListener("error", update, true);
    if (typeof ResizeObserver !== "undefined") new ResizeObserver(update).observe(this);
    else requestAnimationFrame(update);
  }
  /** The front is hidden while `--fuda-yaw` has turned the back toward the reader. */
  private watchFacing(): void {
    const sync = () => {
      const raw = this.style.getPropertyValue("--fuda-yaw");
      const yaw = Number.parseFloat(raw);
      const turned = ((yaw % 360) + 360) % 360;
      const back = raw !== "" && Number.isFinite(yaw) && turned > 90 && turned < 270;
      this.toggleAttribute("data-back", back);
      const root = this.shadowRoot;
      const front = root?.querySelector(".front");
      if (front instanceof HTMLElement) front.style.display = back ? "none" : "";
      // The host's drop-shadow keeps a copy of the front until a style element in the shadow root hides it.
      let hide = root?.getElementById("back-hide");
      if (back && root && !hide) {
        hide = document.createElement("style");
        hide.id = "back-hide";
        hide.textContent = ".front{display:none}";
        root.append(hide);
      } else if (!back) hide?.remove();
    };
    new MutationObserver(sync).observe(this, { attributes: true, attributeFilter: ["style"] });
    sync();
  }
  connectedCallback(): void {
    this.render();
  }
  disconnectedCallback(): void {
    this.setFocused(false);
  }
  attributeChangedCallback(name: string): void {
    if (name === "autoplay" && this.getAttribute("autoplay") !== "focus") this.setFocused(false);
    if (name === "motion" && this.getAttribute("motion") !== "pan" && this.hasAttribute("playing"))
      this.removeAttribute("playing");
    if (this.shadowRoot) this.render();
  }
  /** Millimetres thick: the `thickness` attribute, else the `material`'s, else the playing-card stock's 0.325 (`DEFAULT_CARD_THICKNESS_MM`). */
  get cardThicknessMm(): number {
    const asked = Number.parseFloat(this.getAttribute("thickness") ?? "");
    return asked >= 0 ? asked : (cardMaterial(this.getAttribute("material"))?.thicknessMm ?? DEFAULT_CARD_THICKNESS_MM);
  }
  /** How many cards the stack holds: the `stack` attribute as a whole number from 1 (one card) to 1000. */
  get stackCount(): number {
    const n = Math.floor(Number.parseFloat(this.getAttribute("stack") ?? ""));
    return n >= 1 ? Math.min(1000, n) : 1;
  }
  /** Height of the stack in millimetres: the count times a card's thickness. */
  get stackHeight(): number {
    return stackHeightMm(this.stackCount, this.cardThicknessMm);
  }
  /** How many cards are still in the stack: `stack` less the `taken-off` ones (at least one stays). */
  get heldCount(): number {
    const n = this.stackCount;
    const t = Math.floor(Number.parseFloat(this.getAttribute("taken-off") ?? ""));
    return t > 0 ? Math.max(1, n - t) : n;
  }
  /** True while the stack is fanned open (`fan="open"`, with more than one card). */
  get fanOpen(): boolean {
    return this.getAttribute("fan") === "open" && this.heldCount > 1;
  }
  /** How far the pile reaches beyond the card's own box, in card widths: an open fan and the pile of cards taken off. It is zero until a pile feature is used. Pages use it to fit the view; `fuda-pile` is sent when it changes. */
  pileBounds = { left: 0, right: 0, top: 0, bottom: 0 };
  /** Take the top card (or `count` cards) off the stack: it flies to a pile at the stack's side and lands as `deck-land` says. At least one card stays. */
  takeOff(count = 1): void {
    const t = Math.max(0, Math.floor(Number.parseFloat(this.getAttribute("taken-off") ?? "")) || 0);
    this.setAttribute("taken-off", String(Math.min(this.stackCount - 1, t + Math.max(1, count))));
  }
  /** Bring the card (or `count` cards) back from the pile onto the stack. */
  putBack(count = 1): void {
    const t = Math.max(0, Math.floor(Number.parseFloat(this.getAttribute("taken-off") ?? "")) || 0);
    if (t - Math.max(1, count) > 0) this.setAttribute("taken-off", String(t - Math.max(1, count)));
    else this.removeAttribute("taken-off");
  }
  pileUsed = false;
  private pileModule?: typeof import("./pile-card.js");
  /** Fanning, the pile of cards taken off and the controls are drawn by a module that is loaded only when a stack asks for them; a card without them never loads it. */
  private applyPile(): void {
    const asked =
      this.stackCount > 1 &&
      (this.getAttribute("fan") === "open" || this.hasAttribute("taken-off") || this.hasAttribute("pile-controls"));
    if (!asked && !this.pileModule) return;
    if (asked) this.pileUsed = true;
    const draw = (m: typeof import("./pile-card.js")) => {
      if (!this.shadowRoot) return;
      this.pileModule = m;
      m.applyPile(this, this.shadowRoot);
    };
    if (this.pileModule) draw(this.pileModule);
    else void import("./pile-card.js").then(draw);
  }

  private wearKey = "";
  private wearToken = 0;
  private wearModule?: typeof import("./wear.js");
  /** Wear (an imperfect card) is drawn by a module that is loaded only when a card asks for it; a perfect card never loads it. */
  private applyWear(): void {
    const num = (name: string) => {
      const v = this.getAttribute(name);
      return v === null || v.trim() === "" ? undefined : Number(v);
    };
    const key = ["wear", "wear-seed", "wear-corners", "wear-edges", "wear-surface", "wear-creases"]
      .map((n) => this.getAttribute(n) ?? "")
      .join("|");
    const w = this.getAttribute("wear") ?? "";
    const asked =
      (w !== "" && w !== "perfect" && w !== "0") ||
      ["wear-corners", "wear-edges", "wear-surface", "wear-creases"].some((n) => this.hasAttribute(n));
    if (key === this.wearKey || (!asked && !this.wearModule)) return;
    this.wearKey = key;
    const token = ++this.wearToken;
    const draw = (m: typeof import("./wear.js")) => {
      if (token !== this.wearToken || !this.shadowRoot) return;
      this.wearModule = m;
      m.applyWear(this.shadowRoot, {
        wear: this.getAttribute("wear"),
        seed: num("wear-seed"),
        corners: num("wear-corners"),
        edges: num("wear-edges"),
        surface: num("wear-surface"),
        creases: num("wear-creases"),
      });
      this.dispatchEvent(new CustomEvent("fuda-wear", { detail: { key } }));
    };
    if (this.wearModule) draw(this.wearModule);
    else void import("./wear.js").then(draw);
  }
  /** The wear the card is drawn with: a preset's id, a number, or an empty string when it is perfect. */
  get wear(): string {
    return this.getAttribute("wear") ?? "";
  }
  set wear(value: string) {
    if (value) this.setAttribute("wear", value);
    else this.removeAttribute("wear");
  }
  private stillsKey = "";
  /** The cards under the top one that are laid out nudged and turned; the rest of the stack is one block with a line for each card on its edge. */
  private drawStills(card: HTMLElement, count: number): void {
    const num = (name: string, fallback: number) => {
      const n = Number.parseFloat(this.getAttribute(name) ?? "");
      return Number.isFinite(n) ? n : fallback;
    };
    const messiness = num("stack-messiness", 0.3);
    const seed = num("stack-seed", 1);
    const depth = Math.min(52, Math.max(0, Math.floor(num("stack-depth", 10))));
    const places = count > 1 && (messiness > 0 || this.pileUsed) ? stackLayout(count, { messiness, seed, depth }) : [];
    const key = places.length ? JSON.stringify([count, messiness, seed, depth]) : "";
    if (key === this.stillsKey) return;
    this.stillsKey = key;
    const holder = card.querySelector(".stills");
    if (holder) holder.innerHTML = stillsHtml(places, count);
  }
  render(): void {
    const card = this.shadowRoot?.querySelector<HTMLElement>(".card");
    if (card) {
      const mm = this.cardThicknessMm;
      const count = this.heldCount;
      const fan = this.fanOpen;
      const material = cardMaterial(this.getAttribute("material"));
      card.style.setProperty("--mm", String(fan ? mm : mm * count));
      card.style.setProperty("--mm1", String(mm));
      card.classList.toggle("stacked", count > 1 && !fan);
      if (material) card.style.setProperty("--edge-color", material.edge);
      else card.style.removeProperty("--edge-color");
      this.drawStills(card, count);
    }
    this.applyWear();
    this.applyPile();
    const button = this.shadowRoot?.querySelector<HTMLButtonElement>(".motion-button");
    if (button) {
      button.hidden = this.getAttribute("motion") !== "pan";
      const active = this.isMoving;
      this.toggleAttribute("moving", active);
      button.setAttribute("aria-pressed", String(active));
    }
    for (const key of FudaCard.observedAttributes) {
      const node = this.shadowRoot?.getElementById(key);
      if (node) node.textContent = this.getAttribute(key) || (defaults[key] ?? "");
    }
  }
}
if (typeof customElements !== "undefined" && !customElements.get("fuda-card"))
  customElements.define("fuda-card", FudaCard);
