// The controls of the Card Studio and the Builder: a row of tabs, one for each group of settings, and in the open tab one row for each setting. A choice of a few
// is a row of buttons, a long list a drop-down, a number a field with a slider (and the usual counts as buttons), a switch a toggle button, a word a text field.
// Nothing here folds open: the tabs are the only thing to click to reach a setting. The words come from options.js in both languages.
import { GROUPS, MAKER_GROUPS, OPTIONS } from "./options.js";

const make = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

/** The settings of a maker that the page draws a control for. */
export const optionsOf = (maker) => OPTIONS.filter((option) => option.names[maker] !== undefined);

const currentValue = (settings, option) => settings[option.id] ?? option.default;

/**
 * Draw the controls into `into`.
 * `say(key)` gives a word of the page; `lang()` the page's language; `onChange()` runs after a setting changed (the settings object has the new value).
 * Returns `{ draw() }`, which draws them again (a new language, a new maker, new settings).
 */
export function mountControls({ into, maker, settings, lang, say, onChange }) {
  let group = null;
  let currentMaker = maker();

  function set(option, value) {
    if (value === undefined || value === "") delete settings[option.id];
    else settings[option.id] = value;
    onChange(option);
  }

  const words = (option) => option.say[lang()];
  const choiceName = (option, value) => option.choiceLabels?.[lang()]?.[value] ?? value;

  /** A row of buttons, one of which is pressed. `values` are strings; "" means the setting is left out. */
  function segmented(option, values, labelOf) {
    const bar = make("div", "fam-seg");
    bar.setAttribute("role", "group");
    bar.setAttribute("aria-label", words(option).label);
    const pressed = (value) => {
      const now = settings[option.id];
      if (value === "") return now === undefined && option.default === undefined;
      return String(now ?? option.default ?? "") === value;
    };
    const buttons = values.map((value) => {
      const button = make("button", "", labelOf(value));
      button.type = "button";
      button.dataset.value = value;
      button.setAttribute("aria-pressed", String(pressed(value)));
      button.addEventListener("click", () => {
        set(option, value === "" ? undefined : option.kind === "number" ? Number(value) : value);
        for (const other of buttons) other.setAttribute("aria-pressed", String(pressed(other.dataset.value)));
      });
      return button;
    });
    bar.append(...buttons);
    return bar;
  }

  function choice(option) {
    const notSet = say("notSet");
    if (option.control === "select") {
      const select = make("select", "fam-field");
      select.id = `opt-${option.id}`;
      const values = option.default === undefined ? ["", ...option.choices] : option.choices;
      for (const value of values) select.append(new Option(value === "" ? notSet : choiceName(option, value), value));
      select.value = String(currentValue(settings, option) ?? "");
      select.addEventListener("change", () => set(option, select.value));
      return select;
    }
    const values = option.default === undefined ? ["", ...option.choices] : option.choices;
    return segmented(option, values, (value) => (value === "" ? notSet : choiceName(option, value)));
  }

  function number(option) {
    const { min, max, step } = option.range;
    const box = make("div", "bld-number");
    if ((max - min) / step <= 6) {
      return segmented(
        option,
        Array.from({ length: Math.round((max - min) / step) + 1 }, (_, at) => String(min + at * step)),
        (value) => value,
      );
    }
    const field = make("input", "fam-field");
    field.type = "number";
    field.id = `opt-${option.id}`;
    Object.assign(field, { min, max, step });
    field.value = settings[option.id] === undefined ? "" : String(settings[option.id]);
    field.placeholder = option.default === undefined ? say("notSet") : String(option.default);
    const range = make("input");
    range.type = "range";
    Object.assign(range, { min, max, step });
    range.value = String(currentValue(settings, option) ?? min);
    range.setAttribute("aria-label", words(option).label);
    range.addEventListener("input", () => {
      field.value = range.value;
      set(option, Number(range.value));
      syncPresets();
    });
    field.addEventListener("input", () => {
      const parsed = Number(field.value);
      if (field.value === "") set(option, undefined);
      else if (Number.isFinite(parsed)) {
        range.value = field.value;
        set(option, Math.max(min, Math.min(max, parsed)));
      }
      syncPresets();
    });
    box.append(field, range);
    let syncPresets = () => {};
    if (option.presets) {
      const presets = segmented(
        { ...option, kind: "number" },
        option.presets.map((preset) => String(preset.value)),
        (value) => option.presets.find((preset) => String(preset.value) === value).label,
      );
      for (const button of presets.children) {
        button.addEventListener("click", () => {
          field.value = button.dataset.value;
          range.value = button.dataset.value;
        });
      }
      syncPresets = () => {
        for (const button of presets.children) {
          button.setAttribute("aria-pressed", String(String(currentValue(settings, option)) === button.dataset.value));
        }
      };
      const wrap = make("div", "bld-stack");
      wrap.append(box, presets);
      return wrap;
    }
    return box;
  }

  function control(option) {
    const row = make("div", "bld-row");
    row.dataset.option = option.id;
    const name = words(option).label;
    let main;
    if (option.kind === "boolean") {
      main = make("button", "fam-button");
      main.type = "button";
      main.id = `opt-${option.id}`;
      const draw = () => {
        main.setAttribute("aria-pressed", String(Boolean(currentValue(settings, option))));
        main.textContent = `${name}${lang() === "ja" ? "：" : ": "}${say(currentValue(settings, option) ? "on" : "off")}`;
      };
      draw();
      main.addEventListener("click", () => {
        set(option, !currentValue(settings, option));
        draw();
      });
      row.append(main);
    } else {
      const label = make("span", "fam-label", name);
      label.id = `opt-${option.id}-label`;
      if (option.kind === "text") {
        main = make("input", "fam-field");
        main.id = `opt-${option.id}`;
        main.value = settings[option.id] ?? "";
        main.setAttribute("aria-labelledby", label.id);
        main.addEventListener("input", () => set(option, main.value));
      } else {
        main = option.kind === "number" ? number(option) : choice(option);
        if (main.getAttribute("role") === "group") {
          main.removeAttribute("aria-label");
          main.setAttribute("aria-labelledby", label.id);
        } else if (main.id) main.setAttribute("aria-labelledby", label.id);
      }
      row.append(label, main);
    }
    const help = make("p", "fam-fine", words(option).help);
    if (option.default !== undefined && option.kind !== "text") {
      const shown =
        option.kind === "boolean" ? say(option.default ? "on" : "off") : choiceName(option, String(option.default));
      help.textContent += ` ${say("defaultIs").replace("{value}", shown)}`;
    }
    row.append(help);
    return row;
  }

  function draw() {
    if (currentMaker !== maker()) {
      currentMaker = maker();
      group = null;
    }
    const groups = MAKER_GROUPS[currentMaker].filter((name) =>
      optionsOf(currentMaker).some((option) => option.group === name),
    );
    if (!groups.includes(group)) group = groups[0];
    const tabs = make("div", "fam-tabs");
    tabs.setAttribute("role", "tablist");
    tabs.setAttribute("aria-label", say("groupsLabel"));
    // Every group's panel is in the page (the others are hidden), so a script or a test reaches any setting by its id.
    const panels = Object.fromEntries(
      groups.map((name) => {
        const panel = make("div", "fam-panel bld-options");
        panel.setAttribute("role", "tabpanel");
        panel.id = `opt-panel-${name}`;
        panel.dataset.group = name;
        panel.setAttribute("aria-labelledby", `opt-tab-${name}`);
        panel.append(
          ...optionsOf(currentMaker)
            .filter((option) => option.group === name)
            .map(control),
        );
        return [name, panel];
      }),
    );
    const show = (name, focus = false) => {
      group = name;
      for (const tab of tabs.children) {
        const on = tab.dataset.group === name;
        tab.setAttribute("aria-selected", String(on));
        tab.tabIndex = on ? 0 : -1;
        if (on && focus) tab.focus();
      }
      for (const [other, panel] of Object.entries(panels)) panel.hidden = other !== name;
    };
    for (const name of groups) {
      const tab = make("button", "", GROUPS[name][lang()]);
      tab.type = "button";
      tab.setAttribute("role", "tab");
      tab.id = `opt-tab-${name}`;
      tab.dataset.group = name;
      tab.setAttribute("aria-controls", `opt-panel-${name}`);
      tab.addEventListener("click", () => show(name));
      tab.addEventListener("keydown", (event) => {
        const at = groups.indexOf(group);
        const to = {
          ArrowRight: Math.min(groups.length - 1, at + 1),
          ArrowLeft: Math.max(0, at - 1),
          Home: 0,
          End: groups.length - 1,
        }[event.key];
        if (to === undefined) return;
        event.preventDefault();
        show(groups[to], true);
      });
      tabs.append(tab);
    }
    into.replaceChildren(tabs, ...Object.values(panels));
    show(group);
  }

  draw();
  return { draw };
}
