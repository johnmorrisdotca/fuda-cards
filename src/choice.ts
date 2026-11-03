/**
 * A row of buttons for choosing one of a few things, in place of a drop-down: every option is on screen at once, spans the
 * width, is at least 48 px high, shows its choice clearly and wraps on a phone. It is a radio group: one tab stop, the arrow
 * keys move the choice, and a screen reader hears "Display, Binder Pages, 3 of 12".
 *
 * Used by `<fuda-collection>` and by the demo pages. The colours come from CSS custom properties (`--fc-*`), with the
 * defaults of the dark theme; `CHOICE_VARS` has both themes.
 */
export interface ChoiceOption {
  value: string;
  label: string;
  /** Inline SVG markup for a small picture above the label (decorative). */
  icon?: string;
}
export interface ChoiceHandle {
  readonly element: HTMLElement;
  /** Choose a value without telling `onChange`. */
  set(value: string): void;
  get(): string;
  /** Show or hide the whole group. */
  hidden: boolean;
}
export interface ChoiceConfig {
  label: string;
  options: readonly ChoiceOption[];
  value: string;
  onChange(value: string): void;
  /** `tiles` stacks the icon over the label; `row` (the default) puts them side by side. */
  layout?: "tiles" | "row";
}

/** The colours, for the dark theme (the default) and the light one. */
export const CHOICE_VARS = {
  dark: "--fc-surface:#20212c;--fc-text:#f6f4f1;--fc-muted:#b9b6c4;--fc-btn:#353747;--fc-btn-border:#79798c;--fc-accent:#ffd27e;--fc-on-accent:#241a05;--fc-stage-1:#52495a;--fc-stage-2:#222330;--fc-focus:#ffd27e;--fc-dialog:#242632",
  light:
    "--fc-surface:#f3efe6;--fc-text:#231e18;--fc-muted:#5b5346;--fc-btn:#fffdf8;--fc-btn-border:#a99d86;--fc-accent:#6d4400;--fc-on-accent:#ffffff;--fc-stage-1:#ebe2d0;--fc-stage-2:#cdc1a9;--fc-focus:#6d4400;--fc-dialog:#fbf8f1",
} as const;

export const CHOICE_CSS = `.choice{display:grid;gap:.4rem;min-width:0}.choice[hidden]{display:none}.choice-label{font:700 .75rem system-ui;letter-spacing:.08em;text-transform:uppercase;color:var(--fc-muted,#b9b6c4)}
.choice-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(var(--choice-min,7.5rem),1fr));gap:.5rem}
.choice-list button{display:flex;align-items:center;justify-content:center;gap:.5rem;min-height:48px;padding:.45rem .7rem;font:600 .9rem system-ui;line-height:1.15;text-align:center;color:var(--fc-text,#f6f4f1);background:var(--fc-btn,#353747);border:2px solid var(--fc-btn-border,#79798c);border-radius:.7rem;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background .15s,border-color .15s}
.choice-list.tiles button{flex-direction:column;gap:.2rem;min-height:56px;font-size:.8rem}.choice-list button svg{width:34px;height:22px;flex:none;fill:currentColor;opacity:.9}
.choice-list button:hover{border-color:var(--fc-accent,#ffd27e)}.choice-list button[aria-checked=true]{background:var(--fc-accent,#ffd27e);border-color:var(--fc-accent,#ffd27e);color:var(--fc-on-accent,#241a05);box-shadow:0 0 0 2px var(--fc-surface,#20212c),0 0 0 4px var(--fc-accent,#ffd27e)}
.choice-list button:focus-visible{outline:3px solid var(--fc-focus,#ffd27e);outline-offset:3px}@media(prefers-reduced-motion:reduce){.choice-list button{transition:none}}`;

/** Build the group. The caller puts `element` in the page and adds `CHOICE_CSS` once to the same root. */
export function createChoice(config: ChoiceConfig): ChoiceHandle {
  const element = document.createElement("div");
  element.className = "choice";
  const label = document.createElement("span");
  label.className = "choice-label";
  label.textContent = config.label;
  const list = document.createElement("div");
  list.className = `choice-list${config.layout === "tiles" ? " tiles" : ""}`;
  list.setAttribute("role", "radiogroup");
  list.setAttribute("aria-label", config.label);
  let current = config.value;
  const buttons = config.options.map((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("role", "radio");
    button.dataset.value = option.value;
    button.innerHTML = `${option.icon ?? ""}<span>${option.label.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] as string)}</span>`;
    button.addEventListener("click", () => choose(option.value, true));
    return button;
  });
  function mark() {
    buttons.forEach((button) => {
      const on = button.dataset.value === current;
      button.setAttribute("aria-checked", String(on));
      button.tabIndex = on ? 0 : -1;
    });
    if (!buttons.some((b) => b.tabIndex === 0) && buttons[0]) buttons[0].tabIndex = 0;
  }
  function choose(value: string, notify: boolean) {
    const changed = value !== current;
    current = value;
    mark();
    if (notify && changed) config.onChange(value);
  }
  list.addEventListener("keydown", (event) => {
    const at = buttons.findIndex((b) => b.dataset.value === current);
    let next = -1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (at + 1) % buttons.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (at - 1 + buttons.length) % buttons.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = buttons.length - 1;
    if (next < 0) return;
    event.preventDefault();
    event.stopPropagation();
    choose(buttons[next].dataset.value as string, true);
    buttons[next].focus();
  });
  list.append(...buttons);
  element.append(label, list);
  mark();
  return {
    element,
    set: (value) => choose(value, false),
    get: () => current,
    get hidden() {
      return element.hidden;
    },
    set hidden(value: boolean) {
      element.hidden = value;
    },
  };
}
