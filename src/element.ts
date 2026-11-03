import { cardMaterial, stackHeightMm } from "./materials.js";
import { stackLayout } from "./stack.js";

const template = document.createElement("template");
template.innerHTML = `<style>
:host{display:inline-block;width:300px;aspect-ratio:2.5/3.5;perspective:var(--fuda-perspective,1000px);container-type:inline-size;filter:drop-shadow(0 12px 14px #0006);--edge:linear-gradient(90deg,#f6dc8c,#b98631 50%,#f6dc8c);font-family:Georgia,serif;color:#27201b}*{box-sizing:border-box}.rotation{height:100%;transform-style:preserve-3d;transform-origin:center center}:host([card-spin="center"]) .rotation{animation:fuda-turn var(--fuda-card-spin-duration, 180s) linear infinite}:host([card-spin="corner"]) .rotation{transform-origin:0 100%;transform:translate(50%,-50%);animation:fuda-corner-turn var(--fuda-card-spin-duration, 180s) linear infinite}:host([card-spin-direction="reverse"]) .rotation{animation-direction:reverse}:host([card-spin-paused]) .rotation{animation-play-state:paused}@keyframes fuda-turn{to{transform:rotateY(360deg)}}@keyframes fuda-corner-turn{from{transform:translate(50%,-50%) rotateY(0)}to{transform:translate(50%,-50%) rotateY(360deg)}}:host([card-view]) .rotation{animation:none;transform:rotateX(var(--fuda-tilt,0deg)) rotateY(var(--fuda-yaw,0deg))}:host([card-view][card-spin="corner"]) .rotation{transform:translate(50%,-50%) rotateX(var(--fuda-tilt,0deg)) rotateY(var(--fuda-yaw,0deg))}@media (prefers-reduced-motion:reduce){:host([card-spin]) .rotation{animation:none}:host .card{transition:none}.art ::slotted(*){transition:none}}.card{--t:calc(var(--mm,.3) * 100cqw / 63);--pitch:calc(var(--mm1,var(--mm,.3)) * 100cqw / 63);height:100%;position:relative;transform-style:preserve-3d;transition:transform .65s}:host([flipped]) .card{transform:rotateY(180deg)}.face{position:absolute;inset:0;border-radius:15px;backface-visibility:hidden;overflow:hidden}.front{transform:translateZ(calc(var(--t) / 2));padding:13px;background:linear-gradient(135deg,#fbdf87,#ab742c 35%,#ffe9a6 58%,#ae792d);border:2px solid #9c702d}.inner{height:100%;padding:12px;background:linear-gradient(150deg,#f9edc8,#d6b477);border:2px solid #76512a;display:flex;flex-direction:column;gap:8px}.heading,.footer{display:flex;justify-content:space-between;align-items:center;gap:5px}.heading{font-weight:bold;font-size:20px}.badge{font:700 10px sans-serif;letter-spacing:.12em}.art{position:relative;height:53%;border:5px ridge #dcc18a;box-shadow:0 2px 5px #47301488;background:radial-gradient(circle at 50% 35%,#7496a1,#273c4c);overflow:hidden}.art ::slotted(*){width:100%;height:100%;object-fit:contain;display:block;opacity:0;transition:opacity .35s ease}.art.ready ::slotted(*){opacity:1}:host([motion="pan"]) .art ::slotted(img){object-fit:cover;object-position:var(--fuda-focus-x, 50%) var(--fuda-focus-y, 25%)}:host([motion="pan"][moving]) .art ::slotted(img){animation:fuda-pan var(--fuda-pan-duration, 12s) ease-in-out infinite alternate}:host([motion="pan"][pan-loop="restart"]) .art ::slotted(img){animation-direction:normal}:host([motion="pan"][pan-direction="up"]) .art ::slotted(img){animation-direction:alternate-reverse}:host([motion="pan"][pan-direction="up"][pan-loop="restart"]) .art ::slotted(img){animation-direction:reverse}@keyframes fuda-pan{from{object-position:50% 0%}to{object-position:50% 100%}}@media (prefers-reduced-motion:reduce){:host([motion="pan"][moving]) .art ::slotted(img){animation:none}.motion-button{transition:none}}.motion-button{position:absolute;right:0;bottom:0;z-index:1;width:48px;height:48px;padding:0;border:0;background:none;display:grid;place-items:center;cursor:pointer;opacity:.55;transition:opacity .2s;-webkit-tap-highlight-color:transparent}.motion-button:hover,.motion-button:focus-visible,.motion-button[aria-pressed=true]{opacity:1}.motion-button:focus-visible{outline:none}.motion-button:focus-visible .glyph{outline:3px solid white;outline-offset:2px}.glyph{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:#101827b3;border:1px solid #fff5;color:white}.glyph svg{width:11px;height:11px;fill:currentColor}.motion-button[aria-pressed=true] .play,.motion-button[aria-pressed=false] .pause{display:none}.motion-button[hidden]{display:none}.subtitle{text-align:center;font:italic 11px Georgia}.description{border-top:1px solid #9d8054;padding-top:9px;font-size:13px;line-height:1.35;flex:1}.footer{border-top:1px solid #9d8054;padding-top:5px;font:700 9px sans-serif;letter-spacing:.08em}.back{transform:rotateY(180deg) translateZ(calc(var(--t) / 2));background:radial-gradient(ellipse at center,#b78745 0 12%,#152d46 13% 27%,#386988 28% 31%,#10233b 32% 62%,#d2b074 63% 66%,#182c45 67%);border:11px solid #b39158;display:grid;place-items:center;color:#f7e9bf}.emblem{width:125px;height:125px;border:2px solid #edd18c;border-radius:50%;display:grid;place-items:center;background:#17334a;box-shadow:0 0 0 7px #967344,0 0 30px #e6c98288;font:bold 23px Georgia;letter-spacing:.12em}.shine{pointer-events:none;position:absolute;inset:0;opacity:.35;mix-blend-mode:screen;background:linear-gradient(125deg,transparent 25%,#fff9 36%,transparent 48%,#7cf6 56%,#f9a5 62%,transparent 70%)}:host([finish=matte]) .shine{display:none}.edge{position:absolute;background:var(--fuda-edge,var(--edge))}.stacked .edge{--dir:180deg;background:repeating-linear-gradient(var(--dir),transparent 0 calc(var(--pitch) * .7),#8886 calc(var(--pitch) * .7) var(--pitch)),var(--fuda-edge,var(--edge))}.stacked .edge.side{--dir:90deg}.stills{display:contents}.still{position:absolute;inset:0;border-radius:15px;border:2px solid #9c702d;pointer-events:none;background:linear-gradient(135deg,#fbdf87,#ab742c 35%,#ffe9a6 58%,#ae792d);transform:translate3d(calc(var(--x) * 100cqw),calc(var(--y) * 100cqw),calc(var(--t) / -2 + var(--pitch) * var(--k))) rotate(calc(var(--r) * 1deg))}:host([variant=sport]) .still{background:linear-gradient(135deg,#ebedef,#525e69,#fff,#47505d);border-color:#394c5b}:host([variant=cosmic]) .still{background:linear-gradient(130deg,#c9b4ff,#433b83,#dabdff,#503969);border-color:#584378}:host([variant=sport]),:host([variant=cosmic]){--edge:#ece4d2}:host([variant=sport]) .front{background:linear-gradient(135deg,#ebedef,#525e69,#fff,#47505d)}:host([variant=sport]) .inner{background:linear-gradient(145deg,#eef1ee,#aebac1);border-color:#394c5b}:host([variant=sport]) .art{border-color:#a9b9c0}:host([variant=cosmic]) .front{background:linear-gradient(130deg,#c9b4ff,#433b83,#dabdff,#503969)}:host([variant=cosmic]) .inner{background:linear-gradient(145deg,#e6dafa,#a997cd);border-color:#584378}
</style><div class="rotation"><div class="card"><div class="face front"><div class="inner"><div class="heading"><span id="title"></span><span class="badge" id="category"></span></div><div class="art"><slot></slot><button class="motion-button" type="button" aria-pressed="false" aria-label="Animate the picture" title="Animate" hidden><span class="glyph"><svg viewBox="0 0 12 12" aria-hidden="true"><path class="play" d="M3 1.5v9l7.5-4.5z"/><path class="pause" d="M2.5 1.5h2.8v9H2.5zM6.7 1.5h2.8v9H6.7z"/></svg></span></button></div><div class="subtitle" id="subtitle"></div><div class="description" id="description"></div><div class="footer"><span id="number"></span><span>✦ FUDA COLLECTION</span><span id="rarity"></span></div></div><div class="shine"></div></div><div class="face back"><div class="emblem">FUDA</div><div class="shine"></div></div><i class="edge" style="left:50%;top:0;width:calc(100% - 30px);height:var(--t);transform:translate(-50%,-50%) rotate(0deg) rotateX(90deg)"></i><i class="edge" style="left:50%;top:100%;width:calc(100% - 30px);height:var(--t);transform:translate(-50%,-50%) rotate(0deg) rotateX(90deg)"></i><i class="edge side" style="left:0;top:50%;width:var(--t);height:calc(100% - 30px);transform:translate(-50%,-50%) rotateY(90deg)"></i><i class="edge side" style="left:100%;top:50%;width:var(--t);height:calc(100% - 30px);transform:translate(-50%,-50%) rotateY(90deg)"></i><i class="edge" style="left:2.20px;top:9.70px;width:11.48px;height:var(--t);transform:translate(-50%,-50%) rotate(-67.5deg) rotateX(90deg)"></i><i class="edge" style="left:9.70px;top:2.20px;width:11.48px;height:var(--t);transform:translate(-50%,-50%) rotate(-22.5deg) rotateX(90deg)"></i><i class="edge" style="left:2.20px;top:calc(100% - 9.70px);width:11.48px;height:var(--t);transform:translate(-50%,-50%) rotate(67.5deg) rotateX(90deg)"></i><i class="edge" style="left:9.70px;top:calc(100% - 2.20px);width:11.48px;height:var(--t);transform:translate(-50%,-50%) rotate(22.5deg) rotateX(90deg)"></i><i class="edge" style="left:calc(100% - 2.20px);top:9.70px;width:11.48px;height:var(--t);transform:translate(-50%,-50%) rotate(67.5deg) rotateX(90deg)"></i><i class="edge" style="left:calc(100% - 9.70px);top:2.20px;width:11.48px;height:var(--t);transform:translate(-50%,-50%) rotate(22.5deg) rotateX(90deg)"></i><i class="edge" style="left:calc(100% - 2.20px);top:calc(100% - 9.70px);width:11.48px;height:var(--t);transform:translate(-50%,-50%) rotate(-67.5deg) rotateX(90deg)"></i><i class="edge" style="left:calc(100% - 9.70px);top:calc(100% - 2.20px);width:11.48px;height:var(--t);transform:translate(-50%,-50%) rotate(-22.5deg) rotateX(90deg)"></i><div class="stills"></div></div></div>`;
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
const reducedMotion = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
document.addEventListener(
  "pointerdown",
  (event) => {
    if (focusedCard && !event.composedPath().includes(focusedCard)) focusedCard.setFocused(false);
  },
  true,
);
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
    this.watchFocus(button);
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
  /** Millimetres thick: the `thickness` attribute, else the `material`'s, else 0.3. */
  get cardThicknessMm(): number {
    const asked = Number.parseFloat(this.getAttribute("thickness") ?? "");
    return asked >= 0 ? asked : (cardMaterial(this.getAttribute("material"))?.thicknessMm ?? 0.3);
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
    if (holder)
      holder.innerHTML = places
        .map(
          (p, at) =>
            `<i class="still" style="--x:${p.x};--y:${p.y};--r:${p.rotate};--k:${count - places.length + at}"></i>`,
        )
        .join("");
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
      if (material) card.style.setProperty("--edge", material.edge);
      else card.style.removeProperty("--edge");
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
