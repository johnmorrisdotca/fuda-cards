// The Builder: choose how a card or a collection looks, see it live, and copy the code for a page. The settings are the ones in options.js; the code comes from the family's
// embed builder (formats, defaults left out, the address of a setup), and the controls are the Studio's own tabs. The setup is in the address after the #, so a link opens the same one.
import "../dist/element-define.js";
import { VERSION } from "../dist/index.js";
import { mountControls } from "./controls.js";
import { FAMILY_EMBED_BUILDER_WORDS, familyEmbedBuilder } from "./family-embed-builder.js";
import { GROUPS, LEFT_OUT, OPTIONS } from "./options.js";
import { WORDS } from "./words.js";

const $ = (id) => document.getElementById(id);
const FORMATS = ["element", "iframe", "module", "react", "vue", "svelte", "angular", "url"];

const api = familyEmbedBuilder({
  id: "fuda-cards",
  packageName: "@johnmorrisdotca/fuda-cards",
  major: VERSION.split(".")[0],
  site: "https://johnmorrisdotca.github.io/fuda-cards/",
  title: "Fuda Cards",
  titleJa: "札のカード",
  options: OPTIONS,
  groups: GROUPS,
  leftOut: LEFT_OUT,
  component: "FudaCard",
  selector: "app-fuda-card",
  makers: {
    card: {
      names: "card",
      element: "card",
      tag: "fuda-card",
      embed: "demo/embed.html",
      prefix: "fuda-",
      description: "makerCardSays",
      formats: FORMATS,
      width: 340,
      height: 480,
    },
    collection: {
      names: "collection",
      element: "collection",
      tag: "fuda-collection",
      embed: "demo/embed-collection.html",
      prefix: "fuda-",
      description: "makerCollectionSays",
      formats: FORMATS,
      width: 640,
      height: 760,
    },
  },
});

/** What a card starts with, so that the first code and preview are a card and not an empty frame. */
const INITIAL = {
  card: {
    title: "Explorer One",
    category: "ROCKET",
    subtitle: "Falcon 9 Block 5",
    description: "A first stage that lands itself.",
    motion: "pan",
  },
  collection: { view: "deck" },
};

const hues = [0, 35, 60, 120, 170, 200, 240, 280, 320, 15, 90, 260];
const picture = (n) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 245 337" width="245" height="337"><rect width="245" height="337" rx="12" fill="hsl(${hues[n % 12]} 60% 30%)"/><rect x="12" y="12" width="221" height="313" rx="8" fill="none" stroke="hsl(${hues[n % 12]} 60% 70%)" stroke-width="3"/><text x="122" y="190" font-family="Georgia,serif" font-size="64" text-anchor="middle" fill="white">${n + 1}</text></svg>`)}`;
const SAMPLE = Array.from({ length: 18 }, (_, i) => ({ id: `c${i + 1}`, name: `Card ${i + 1}`, image: picture(i) }));

const state = api.restoreState(location.hash, INITIAL);
let { maker } = state;
const { settings } = state;
let format = new URLSearchParams(location.hash.replace(/^#/, "")).get("show") ?? "";

const page = globalThis.familyLanguage({ id: "fuda-cards", words: WORDS, onChange: () => draw() });
const say = (key, values = {}) =>
  Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    WORDS[page.lang][key] ?? FAMILY_EMBED_BUILDER_WORDS[page.lang][key] ?? key,
  );

let preview = null;
let previewKey = "";
function drawPreview() {
  const live = api.liveFor(maker, OPTIONS, settings);
  const key = JSON.stringify([maker, live.attrs]);
  if (key === previewKey) return;
  previewKey = key;
  preview?.remove();
  const stage = $("bld-stage");
  const element = document.createElement(maker === "card" ? "fuda-card" : "fuda-collection");
  for (const [name, value] of live.attrs) element.setAttribute(name, value);
  if (maker === "card") {
    const art = document.createElement("img");
    art.alt = "";
    art.src = picture(2);
    element.append(art);
  } else element.cards = SAMPLE;
  stage.replaceChildren(element);
  preview = element;
}

function drawCode() {
  const formats = api.makers[maker].formats;
  if (!formats.includes(format)) format = formats[0];
  const tabs = $("bld-formats");
  tabs.replaceChildren(
    ...formats.map((name) => {
      const tab = document.createElement("button");
      tab.type = "button";
      tab.setAttribute("role", "tab");
      tab.id = `bld-tab-${name}`;
      tab.dataset.format = name;
      tab.setAttribute("aria-controls", "bld-panel");
      tab.setAttribute("aria-selected", String(name === format));
      tab.tabIndex = name === format ? 0 : -1;
      tab.textContent = api.formats[name].label[page.lang];
      tab.addEventListener("click", () => {
        format = name;
        drawCode();
        keepAddress();
        $(`bld-tab-${format}`).focus();
      });
      tab.addEventListener("keydown", (event) => {
        const at = formats.indexOf(format);
        const to = {
          ArrowRight: Math.min(formats.length - 1, at + 1),
          ArrowLeft: Math.max(0, at - 1),
          Home: 0,
          End: formats.length - 1,
        }[event.key];
        if (to === undefined) return;
        event.preventDefault();
        format = formats[to];
        drawCode();
        keepAddress();
        $(`bld-tab-${format}`).focus();
      });
      return tab;
    }),
  );
  $("bld-panel").setAttribute("aria-labelledby", `bld-tab-${format}`);
  $("bld-code").textContent = api.codeFor(maker, format, OPTIONS, settings) ?? "";
  $("bld-code").dataset.format = format;
  $("bld-copy").disabled = $("bld-code").textContent === "";
}

function keepAddress() {
  history.replaceState(null, "", `#${api.toAddress(maker, OPTIONS, settings)}&show=${format}`);
}

let typing = 0;
function changed() {
  clearTimeout(typing);
  typing = setTimeout(() => {
    drawPreview();
    drawCode();
    keepAddress();
  }, 120);
}

const controls = mountControls({
  into: $("controls"),
  maker: () => maker,
  settings,
  lang: () => page.lang,
  say,
  onChange: changed,
});

function draw() {
  for (const button of $("bld-makers").children)
    button.setAttribute("aria-pressed", String(button.dataset.maker === maker));
  $("bld-maker-says").textContent = say(api.makers[maker].description);
  controls.draw();
  previewKey = "";
  drawPreview();
  drawCode();
  keepAddress();
}

for (const button of $("bld-makers").children) {
  button.addEventListener("click", () => {
    maker = button.dataset.maker;
    for (const id of Object.keys(settings)) delete settings[id];
    Object.assign(settings, INITIAL[maker]);
    draw();
  });
}
$("bld-reset").addEventListener("click", () => {
  for (const id of Object.keys(settings)) delete settings[id];
  Object.assign(settings, INITIAL[maker]);
  draw();
});

const copy = async (text, into, word) => {
  try {
    await navigator.clipboard.writeText(text);
    into.textContent = say(word);
  } catch {
    into.textContent = "";
  }
};
$("bld-copy").addEventListener("click", () => void copy($("bld-code").textContent, $("bld-code-copied"), "copied"));
$("bld-link").addEventListener("click", () => {
  keepAddress();
  void copy(location.href, $("bld-copied"), "linkCopied");
});

// Every attribute the elements watch has a setting here or a reason it has none.
api.validateCoverage({
  card: customElements.get("fuda-card").observedAttributes,
  collection: customElements.get("fuda-collection").observedAttributes,
});
draw();
document.documentElement.dataset.ready = "true";
