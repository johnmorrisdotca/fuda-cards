// The builder: choose what a card or a collection looks like, see it live, copy the code. Every choice is a row of buttons (the package's own
// choice component); the setup is kept in the address, so a link opens the same one. The pictures are drawn here, so nothing is fetched.
import "../dist/element.js";
import "../dist/collection-element.js";
import { collectionViews } from "../dist/collection.js";
import { cardMaterials, stackPresets, wearPresets } from "../dist/index.js";
import { createChoice, setupPage } from "./ui.js";

setupPage();

const $ = (selector) => document.querySelector(selector);
const PACKAGE = "@johnmorrisdotca/fuda-cards";
const hues = [0, 35, 60, 120, 170, 200, 240, 280, 320, 15, 90, 260];
const picture = (n) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 245 337" width="245" height="337"><rect width="245" height="337" rx="12" fill="hsl(${hues[n % 12]} 60% 30%)"/><rect x="12" y="12" width="221" height="313" rx="8" fill="none" stroke="hsl(${hues[n % 12]} 80% 75%)" stroke-width="4"/><circle cx="122" cy="140" r="60" fill="hsl(${hues[n % 12]} 70% 60%)"/><text x="122" y="285" font-size="34" text-anchor="middle" fill="#fff" font-family="sans-serif">No. ${n + 1}</text></svg>`)}`;
const sample = Array.from({ length: 18 }, (_, i) => ({ id: `c${i + 1}`, name: `Card ${i + 1}`, image: picture(i) }));

// Each setting: a key, its label, the choices as [value, label], and its default. A default is left out of the code.
const material = [
  ["", "Standard"],
  ...cardMaterials.map((m) => [
    m.id,
    `${m.name.replace(/ \(.*\)$/, "").replace(/, [\d.]+ mm$/, "")}, ${m.thicknessMm} mm`,
  ]),
];
const CARD = [
  {
    key: "variant",
    label: "Card style",
    options: [
      ["classic", "Classic"],
      ["sport", "Silver sport"],
      ["cosmic", "Cosmic violet"],
    ],
    value: "classic",
  },
  {
    key: "finish",
    label: "Finish",
    options: [
      ["foil", "Foil"],
      ["matte", "Matte"],
    ],
    value: "foil",
  },
  {
    key: "wear",
    label: "Wear",
    options: [["", "Perfect"], ...wearPresets.filter((w) => w.id !== "perfect").map((w) => [w.id, w.name])],
    value: "",
  },
  { key: "material", label: "Material", options: material, value: "" },
  {
    key: "stack",
    label: "Cards in the stack",
    options: [["1", "One card"], ...stackPresets.map((p) => [String(p.count), String(p.count)]), ["200", "200"]],
    value: "1",
  },
  {
    key: "stack-messiness",
    label: "Messiness",
    options: [
      ["0", "Neat"],
      ["0.3", "Slightly messy"],
      ["0.6", "Messy"],
      ["1", "Very messy"],
    ],
    value: "0.3",
    when: (s) => s.stack !== "1",
  },
  {
    key: "fan",
    label: "Fan",
    options: [
      ["", "Closed"],
      ["open", "Open"],
    ],
    value: "",
    when: (s) => s.stack !== "1",
  },
  {
    key: "card-spin",
    label: "Rotation",
    options: [
      ["", "None"],
      ["center", "Around the centre"],
      ["corner", "Around a corner"],
    ],
    value: "",
  },
  {
    key: "flipped",
    label: "Face",
    options: [
      ["", "Front"],
      ["on", "Back"],
    ],
    value: "",
  },
];
const COLLECTION = [
  { key: "view", label: "Display", options: collectionViews.map((v) => [v.id, v.label]), value: "deck", always: true },
  {
    key: "binder",
    label: "Binder",
    options: [
      ["ring", "Ring"],
      ["zip", "Zip"],
    ],
    value: "ring",
    when: (s) => s.view === "binder",
  },
  {
    key: "cover",
    label: "Cover",
    options: [
      ["green", "Green"],
      ["black", "Black"],
      ["teal", "Teal"],
      ["navy", "Navy"],
      ["red", "Red"],
    ],
    value: "green",
    when: (s) => s.view === "binder",
  },
  {
    key: "sheet",
    label: "Sheet",
    options: [
      ["clear", "Clear"],
      ["black", "Black"],
    ],
    value: "clear",
    when: (s) => s.view === "binder",
  },
  {
    key: "pockets",
    label: "Pockets",
    options: [
      ["4", "4"],
      ["9", "9"],
      ["12", "12"],
    ],
    value: "9",
    when: (s) => s.view === "binder",
  },
  {
    key: "deck-land",
    label: "A card taken off lands",
    options: [
      ["face-up", "Facing up"],
      ["face-down", "Turned over"],
    ],
    value: "face-up",
    when: (s) => ["deck", "random", "fan"].includes(s.view),
  },
  {
    key: "animate",
    label: "Animate",
    options: [
      ["on", "On"],
      ["off", "Off"],
    ],
    value: "on",
  },
  {
    key: "speed",
    label: "Speed",
    options: [
      ["slow", "Slow"],
      ["normal", "Normal"],
      ["quick", "Quick"],
    ],
    value: "normal",
  },
  {
    key: "theme",
    label: "Colours",
    options: [
      ["", "Follow the reader"],
      ["light", "Light"],
      ["dark", "Dark"],
    ],
    value: "",
  },
];

const state = { what: "card", format: 0, card: {}, collection: {} };
const query = new URLSearchParams(location.search);
if (query.get("what") === "collection") state.what = "collection";
for (const [group, list] of [
  ["card", CARD],
  ["collection", COLLECTION],
])
  for (const setting of list) {
    const given = query.get(`${group === "card" ? "c" : "k"}-${setting.key}`);
    state[group][setting.key] = given !== null && setting.options.some((o) => o[0] === given) ? given : setting.value;
  }

const attributes = (list, values) =>
  list
    .filter((s) => (!s.when || s.when(values)) && (s.always || (values[s.key] !== s.value && values[s.key] !== "")))
    .map((s) => [s.key, values[s.key] === "on" && s.key === "flipped" ? "" : values[s.key]]);
const attrText = (pairs) => pairs.map(([k, v]) => (v === "" ? k : `${k}="${v}"`)).join(" ");

const FORMATS = {
  card: ["HTML", "React", "Vue"],
  collection: ["HTML", "React", "Vue"],
};
function code() {
  const html = FORMATS[state.what][state.format];
  if (state.what === "card") {
    const pairs = [["title", "Explorer One"], ...attributes(CARD, state.card)];
    const open = `<fuda-card ${attrText(pairs)}>`;
    const art = '  <img src="/your/picture.jpg" alt="Describe the picture">\n';
    if (html === "HTML")
      return `<script type="module">\n  import '${PACKAGE}/element';\n</script>\n${open}\n${art}</fuda-card>`;
    if (html === "React")
      return `import '${PACKAGE}/element';\n\nexport const Card = () => (\n  ${open}\n    <img src="/your/picture.jpg" alt="Describe the picture" />\n  </fuda-card>\n);`;
    return `<script setup>\nimport '${PACKAGE}/element';\n</script>\n<template>\n  ${open}\n    <img src="/your/picture.jpg" alt="Describe the picture" />\n  </fuda-card>\n</template>`;
  }
  const tag = `<fuda-collection ${attrText(attributes(COLLECTION, state.collection))}>`;
  const data = `[\n  { id: 'one', name: 'First card', image: '/cards/one.jpg', backImage: '/cards/one-back.jpg' },\n  { id: 'two', name: 'Second card', image: '/cards/two.jpg' },\n]`;
  if (html === "HTML")
    return `${tag}</fuda-collection>\n<script type="module">\n  import '${PACKAGE}/collection-element';\n  document.querySelector('fuda-collection').cards = ${data.replace(/\n/g, "\n  ")};\n</script>`;
  if (html === "React")
    return `import { useEffect, useRef } from 'react';\nimport '${PACKAGE}/collection-element';\n\nexport function Cards({ cards }) {\n  const ref = useRef(null);\n  useEffect(() => { if (ref.current) ref.current.cards = cards; }, [cards]);\n  return ${tag.replace(">", " ref={ref} />").replace(/<fuda-collection /, "<fuda-collection ")};\n}`;
  return `<script setup>\nimport '${PACKAGE}/collection-element';\ndefineProps({ cards: { type: Array, required: true } });\n</script>\n<template>\n  ${tag.replace(">", ' :cards.prop="cards" />')}\n</template>`;
}

function address() {
  const next = new URLSearchParams();
  if (state.what === "collection") next.set("what", "collection");
  for (const [group, list] of [
    ["card", CARD],
    ["collection", COLLECTION],
  ])
    for (const s of list)
      if (state[group][s.key] !== s.value) next.set(`${group === "card" ? "c" : "k"}-${s.key}`, state[group][s.key]);
  const theme = new URLSearchParams(location.search).get("theme");
  if (theme) next.set("theme", theme);
  return `${location.pathname}${next.size ? `?${next}` : ""}`;
}

const stage = $("#stage");
const controls = $("#controls");
const note = $("#note");
let cardEl;
let collectionEl;
let handles = [];
function preview() {
  note.textContent = "";
  if (state.what === "card") {
    stage.className = "stage";
    if (!cardEl) {
      cardEl = document.createElement("fuda-card");
      cardEl.innerHTML = `<img src="../assets/starship-v3-preview.jpg" alt="Starship Block 3">`;
    }
    for (const a of [...cardEl.getAttributeNames()]) if (a !== "style") cardEl.removeAttribute(a);
    cardEl.setAttribute("title", "Explorer One");
    for (const [k, v] of attributes(CARD, state.card)) cardEl.setAttribute(k, v);
    cardEl.style.setProperty("--fuda-yaw", "-18deg");
    cardEl.style.setProperty("--fuda-tilt", "6deg");
    cardEl.toggleAttribute("card-view", !cardEl.hasAttribute("card-spin"));
    stage.replaceChildren(cardEl);
    if (cardEl.stackCount > 1) note.textContent = `${cardEl.stackCount} cards, ${cardEl.stackHeight} mm high.`;
    else note.textContent = `One card, ${cardEl.cardThicknessMm} mm thick.`;
  } else {
    stage.className = "stage wide";
    if (!collectionEl) {
      collectionEl = document.createElement("fuda-collection");
      collectionEl.cards = sample;
    }
    for (const a of [...collectionEl.getAttributeNames()]) collectionEl.removeAttribute(a);
    collectionEl.setAttribute("view", state.collection.view);
    for (const [k, v] of attributes(COLLECTION, state.collection)) collectionEl.setAttribute(k, v);
    stage.replaceChildren(collectionEl);
    note.textContent = "Eighteen sample cards, drawn on this page.";
  }
}

function renderCode() {
  const formats = FORMATS[state.what];
  const bar = $("#formats");
  bar.replaceChildren(
    ...formats.map((name, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.role = "tab";
      button.textContent = name;
      button.setAttribute("aria-selected", String(index === state.format));
      button.addEventListener("click", () => {
        state.format = index;
        renderCode();
      });
      return button;
    }),
  );
  $("#code").textContent = code();
}

function renderControls() {
  const list = state.what === "card" ? CARD : COLLECTION;
  const values = state[state.what];
  handles = list.map((setting) => {
    const handle = createChoice({
      label: setting.label,
      value: values[setting.key],
      options: setting.options.map(([value, label]) => ({ value, label })),
      onChange: (value) => {
        values[setting.key] = value;
        update(false);
      },
    });
    handle.hidden = Boolean(setting.when && !setting.when(values));
    return { setting, handle };
  });
  controls.replaceChildren(...handles.map((h) => h.handle.element));
}
function update(rebuild = true) {
  if (!rebuild) {
    const values = state[state.what];
    for (const h of handles) h.handle.hidden = Boolean(h.setting.when && !h.setting.when(values));
  }
  preview();
  renderCode();
  try {
    history.replaceState(null, "", address());
  } catch {
    /* an address that cannot be set is not an error */
  }
}

for (const tab of document.querySelectorAll("#what [role=tab]")) {
  tab.setAttribute("aria-selected", String(tab.dataset.what === state.what));
  tab.addEventListener("click", () => {
    state.what = tab.dataset.what;
    state.format = 0;
    for (const t of document.querySelectorAll("#what [role=tab]")) t.setAttribute("aria-selected", String(t === tab));
    renderControls();
    update();
  });
}
const copy = async (text, done) => {
  try {
    await navigator.clipboard.writeText(text);
    $("#copied").textContent = done;
  } catch {
    $("#copied").textContent = "Copy is not allowed here: select the code and copy it.";
  }
};
$("#copy").addEventListener("click", () => copy($("#code").textContent, "Code copied."));
$("#link").addEventListener("click", () => copy(new URL(address(), location.href).href, "Link copied."));
renderControls();
update();
