// The Card Studio: one card on a stage that the shared view controls turn, tip, zoom, move and put back in the middle, and the settings of the card in tabs beside it.
// Every setting is kept in the page address (`?variant=sport&stack=10`), and a link to it opens the same card.
import "../dist/element.js";
import { stackHeightMm } from "../dist/index.js";
import "@johnmorrisdotca/kazoku-ui/view-controls/define";
import { mountControls, optionsOf } from "./controls.js";
import { WORDS } from "./words.js";

const $ = (selector) => document.querySelector(selector);
const card = $("#card");
const stage = $("#stage");
const zoomer = $("#zoomer");
const view = $("#view");

// What the Studio starts with: the rocket on a gold card that turns on its own, nothing else chosen.
const START = {
  title: "Starship Block 3",
  category: "ROCKET",
  subtitle: "Starship + Super Heavy",
  description: "Height: 124.4 m · Diameter: 9 m · 33 Raptor 3 booster engines.",
  motion: "pan",
  "card-spin": "center",
};
const ids = new Set(optionsOf("card").map((option) => option.id));
const query = new URLSearchParams(location.search);
const settings = { ...START };
for (const option of optionsOf("card")) {
  if (!query.has(option.id)) continue;
  const raw = query.get(option.id);
  if (option.kind === "boolean") settings[option.id] = raw === "1" || raw === "true" || raw === "";
  else if (option.kind === "number") {
    if (raw !== "" && Number.isFinite(Number(raw))) settings[option.id] = Number(raw);
  } else if (raw !== "") settings[option.id] = raw;
}

const page = globalThis.familyLanguage({
  id: "fuda-cards",
  words: WORDS,
  onChange: () => {
    controls.draw();
    notes();
    stageLabel();
  },
});
const say = (key, values = {}) =>
  Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    WORDS[page.lang][key] ?? key,
  );

/** The settings put on the card as attributes. A setting left out takes its attribute off. */
function apply() {
  for (const option of optionsOf("card")) {
    const name = option.names.card;
    const value = settings[option.id];
    if (value === undefined || value === "" || value === false) card.removeAttribute(name);
    else card.setAttribute(name, value === true ? "" : String(value));
  }
  card.setAttribute("card-view", "");
  measure();
}

/** Every setting that is not the starting one is kept in the address. */
let kept = 0;
function keep() {
  clearTimeout(kept);
  kept = setTimeout(() => {
    const url = new URL(location.href);
    for (const id of ids) url.searchParams.delete(id);
    for (const [id, value] of Object.entries(settings)) {
      if (START[id] === value || value === undefined || value === "" || value === false) continue;
      url.searchParams.set(id, value === true ? "1" : String(value));
    }
    history.replaceState(history.state, "", url);
  }, 200);
}

const controls = mountControls({
  into: $("#controls"),
  maker: () => "card",
  settings,
  lang: () => page.lang,
  say,
  onChange: () => {
    apply();
    spin();
    notes();
    keep();
  },
});

// The stage: the card turns, tips and zooms with the shared view controls, which also put it back in the middle (Centre) once it has been moved away.
const PERSPECTIVE = 2400;
let fit = 1;
let hull = { x: 0, y: 0 };
let last = { yaw: 0, tilt: 0, zoom: 1, panX: 0, panY: 0 };

function measure() {
  const w = card.offsetWidth;
  const h = card.offsetHeight;
  if (!w || !h) return;
  const margin = 16;
  const corner = card.getAttribute("card-spin") === "corner";
  const bounds = card.pileBounds;
  // The card, an open fan and the pile of cards taken off are one thing to fit: its half width and half height from its own centre.
  hull = { x: ((bounds.right - bounds.left) / 2) * w, y: ((bounds.bottom - bounds.top) / 2) * w };
  const halfWidth = ((1 + bounds.left + bounds.right) / 2) * w;
  const halfHeight = h / 2 + ((bounds.top + bounds.bottom) / 2) * w;
  // The widest the turned thing can look: its near edge comes closer as it turns, and it is widest at the angle where that gains most.
  const wide = bounds.left + bounds.right + bounds.top + bounds.bottom > 0;
  const reach = Math.min(0.9, halfWidth / PERSPECTIVE);
  const near = corner
    ? PERSPECTIVE / (PERSPECTIVE - w)
    : wide
      ? 1 / Math.sqrt(1 - reach * reach)
      : PERSPECTIVE / (PERSPECTIVE - halfWidth);
  const extentX = corner ? w * 1.1 : halfWidth * near;
  const extentY = corner ? h * near : halfHeight * near;
  fit = Math.min(1, (stage.clientWidth / 2 - margin) / extentX, (stage.clientHeight / 2 - margin) / extentY);
  view.setFitScale(fit);
  // So that the controls can keep a quarter of the card in view however far it is moved, and Centre appears once it is away.
  view.objectSize = {
    width: (1 + bounds.left + bounds.right) * w * fit,
    height: (h + (bounds.top + bounds.bottom) * w) * fit,
  };
  draw(last);
}

function draw(state) {
  last = state;
  zoomer.style.transform = `translate(${state.panX - hull.x * fit * state.zoom}px,${state.panY - hull.y * fit * state.zoom}px) scale(${fit * state.zoom})`;
  card.style.setProperty("--fuda-yaw", `${state.yaw}deg`);
  card.style.setProperty("--fuda-tilt", `${state.tilt}deg`);
}
view.addEventListener("kazoku-viewchange", (event) => draw(event.detail));
new ResizeObserver(measure).observe(stage);
// The card has no size until its element is defined and laid out, so it is measured again then.
new ResizeObserver(measure).observe(card);
customElements.whenDefined("fuda-card").then(() => requestAnimationFrame(measure));

// The controls sit in one row at a desk and in the compact row on a phone, where the rest is behind More.
const narrow = matchMedia("(max-width: 560px)");
const layout = () => view.setAttribute("layout", narrow.matches ? "compact" : "horizontal");
narrow.addEventListener("change", layout);
layout();

// A fan or a pile at the side changes what has to fit: the view glides to the new fit (not with reduced motion or Animate off).
card.addEventListener("fuda-pile", () => {
  const glide = settings.animate !== "off" && !matchMedia("(prefers-reduced-motion: reduce)").matches;
  const from = glide ? getComputedStyle(zoomer).transform : "";
  measure();
  view.set({ zoom: 1, panX: 0, panY: 0 });
  if (glide && from && from !== "none" && from !== zoomer.style.transform) {
    zoomer.animate([{ transform: from }, { transform: zoomer.style.transform }], {
      duration: 600,
      easing: "cubic-bezier(.2,.8,.2,1)",
    });
  }
  pile();
});

/** The way Auto-turn goes: the view's own button turns the card, forward or in reverse as the setting says (its speeds are the view's own). A positive speed raises yaw, which is the same way a drag right moves the front. 12 degrees a second only moves that front about two pixels in the first second when frames are scarce, so the turn is 36: still a calm spin, and the front has clearly moved. */
const AUTO_TURN_DEGREES_A_SECOND = 36;
function spin() {
  view.setAttribute(
    "speed",
    String((card.getAttribute("card-spin-direction") === "reverse" ? -1 : 1) * AUTO_TURN_DEGREES_A_SECOND),
  );
}
spin();

// Take the top card off the stack and put it back (the stack must hold more than one card).
const takeOff = $("#take-off");
const putBack = $("#put-back");
function pile() {
  const count = card.stackCount;
  const taken = Number(card.getAttribute("taken-off")) || 0;
  takeOff.disabled = count < 2 || taken >= count - 1;
  putBack.disabled = taken < 1;
  $("#pile-note").textContent =
    count < 2
      ? say("pileOneCard")
      : taken
        ? say("pileCounts", { taken, total: count, held: count - taken })
        : say("pileHeld", { total: count });
  if (taken) settings["taken-off"] = taken;
  else delete settings["taken-off"];
  keep();
}
takeOff.addEventListener("click", () => {
  card.takeOff();
  pile();
});
putBack.addEventListener("click", () => {
  card.putBack();
  pile();
});

/** The height of the stack, said in words under the card. */
function notes() {
  const count = card.stackCount;
  const mm = card.cardThicknessMm;
  $("#note").textContent =
    count > 1 ? say("stackHeight", { count, mm, height: stackHeightMm(count, mm) }) : say("oneCard", { mm });
  pile();
}

function stageLabel() {
  stage.setAttribute("aria-label", say("stageLabel"));
  $("#art").alt = say("cardAlt");
}

// The reader's own picture, kept in this tab only.
let url;
$("#upload").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  if (url) URL.revokeObjectURL(url);
  url = URL.createObjectURL(file);
  $("#art").src = url;
  $("#art").alt = file.name;
});

const copied = $("#copied");
$("#link").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(location.href);
    copied.textContent = say("linkCopied");
  } catch {
    copied.textContent = "";
  }
});
$("#to-builder").addEventListener("click", () => {
  const params = new URLSearchParams({ make: "card" });
  for (const [id, value] of Object.entries(settings))
    if (ids.has(id) && value !== undefined && value !== "") params.set(id, value === true ? "1" : String(value));
  location.href = `builder.html#${params}`;
});

apply();
notes();
stageLabel();
keep();
