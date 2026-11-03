// The shell's controls: the display tiles, the option rows, Previous and Next, the draw filter, touch and the arrow keys.
import { binderCovers } from "./binder.js";
import { createChoice } from "./choice.js";
import { collectionViews, randomDrawIndex } from "./collection.js";
import { writeAddress } from "./collection-address.js";
import type { CollectionHost } from "./collection-host.js";
import { icon } from "./collection-icons.js";
import { COLLECTION_CSS, COLLECTION_SHELL } from "./collection-styles.js";
import { deckLandings } from "./pile.js";
import { zoomView } from "./zoom.js";

export function buildControls(host: CollectionHost) {
  if (host.zoom) return;
  host.root.innerHTML = `<style>${COLLECTION_CSS}</style>${COLLECTION_SHELL}`;
  const keep = (attr: string, value: string | null) => {
    if (value === null) host.removeAttribute(attr);
    else host.setAttribute(attr, value);
    writeAddress(host);
  };
  host.tiles = createChoice({
    label: "Display",
    layout: "tiles",
    value: host.currentView,
    options: collectionViews.map((v) => ({ value: v.id, label: v.label, icon: icon(v.id) })),
    onChange: (value) => {
      host.setAttribute("view", value);
      writeAddress(host);
    },
  });
  host.q(".displays").append(host.tiles.element);
  host.landing = createChoice({
    label: "A card taken off lands",
    value: host.land,
    options: deckLandings.map((l) => ({ value: l.id, label: l.label })),
    onChange: (value) => {
      host.setAttribute("deck-land", value);
      writeAddress(host);
    },
  });
  host.fanChoice = createChoice({
    label: "Fan",
    value: host.fanOpen ? "open" : "closed",
    options: [
      { value: "closed", label: "Closed" },
      { value: "open", label: "Open" },
    ],
    onChange: (value) => {
      if (value === "open") host.setAttribute("fan", "open");
      else host.removeAttribute("fan");
      writeAddress(host);
    },
  });
  host.animateChoice = createChoice({
    label: "Animate",
    value: "on",
    options: [
      { value: "on", label: "On" },
      { value: "off", label: "Off" },
    ],
    onChange: (value) => keep("animate", value === "off" ? "off" : "on"),
  });
  host.speedChoice = createChoice({
    label: "Speed",
    value: "normal",
    options: [
      { value: "slow", label: "Slow" },
      { value: "normal", label: "Normal" },
      { value: "quick", label: "Quick" },
    ],
    onChange: (value) => keep("speed", value),
  });
  const bin = (attr: string, label: string, value: string, options: { value: string; label: string }[]) => {
    const h = createChoice({
      label,
      value,
      options,
      onChange: (v) => {
        host.setAttribute(attr, v);
        writeAddress(host);
      },
    });
    host.binderChoices[attr] = h;
    return h.element;
  };
  host.q(".opts").append(
    host.landing.element,
    host.fanChoice.element,
    bin("binder", "Binder", "ring", [
      { value: "ring", label: "Ring" },
      { value: "zip", label: "Zip" },
    ]),
    bin(
      "cover",
      "Cover",
      "green",
      binderCovers.map((c) => ({ value: c.id, label: c.label })),
    ),
    bin("sheet", "Sheet", "clear", [
      { value: "clear", label: "Clear" },
      { value: "black", label: "Black" },
    ]),
    bin("pockets", "Pockets", "9", [
      { value: "4", label: "4" },
      { value: "9", label: "9" },
      { value: "12", label: "12" },
    ]),
    host.animateChoice.element,
    host.speedChoice.element,
  );
  host.speedChoice.element.classList.add("speed");
  host.q(".prev").onclick = () => host.move(-1);
  host.q(".next").onclick = () => host.move(1);
  const input = host.q<HTMLInputElement>(".draw-filter input");
  const draw = host.q<HTMLButtonElement>(".draw");
  input.oninput = () => {
    host.drawFilter = input.value;
    draw.disabled = !host.canDraw();
  };
  draw.onclick = () => {
    const next = randomDrawIndex(host.data, host.index, host.drawFilter);
    if (next === null) return;
    host.index = next;
    host.render(false, { kind: "move", dir: 1 });
  };
  const stage = host.q(".stage");
  host.zoom = zoomView(stage, host.q(".v"), {
    address: host.hasAttribute("address"),
    items: ".card,.slot",
    theme: host.getAttribute("theme") ?? undefined,
  });
  let startX = 0;
  stage.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length === 1) startX = e.touches[0].clientX;
    },
    { passive: true },
  );
  stage.addEventListener(
    "touchend",
    (e) => {
      if (!host.stacked || host.piled || host.zoom!.zoomed() || e.changedTouches.length !== 1) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 45) {
        if (e.cancelable) e.preventDefault();
        host.move(dx < 0 ? 1 : -1);
      }
    },
    { passive: false },
  );
  stage.addEventListener("keydown", (e: KeyboardEvent) => {
    if (!host.stacked || host.piled || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
    e.preventDefault();
    host.move(e.key === "ArrowRight" ? 1 : -1);
    host.q(".stack .card:last-child")?.focus();
  });
}
