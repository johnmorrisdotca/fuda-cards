// Shared by the demo pages: light and dark colours, controls that are buttons rather than drop-downs, and choices kept in the address.
// The choice buttons are the package's own (dist/choice.js), the same ones <fuda-collection> uses for its Display.
import { CHOICE_CSS, CHOICE_VARS, createChoice } from '../dist/choice.js';

/** The page's colours as custom properties (--fc-*), light or dark by the reader's setting, or by `?theme=light|dark`. */
export const PAGE_CSS = `
:root{color-scheme:dark;${CHOICE_VARS.dark};--page:#10151e;--card:#1b2230;--line:#35404a;--link:#e1c082}
@media(prefers-color-scheme:light){:root:not([data-theme=dark]){color-scheme:light;${CHOICE_VARS.light};--page:#f6f2e9;--card:#fffdf8;--line:#cfc5b0;--link:#6d4400}}
:root[data-theme=light]{color-scheme:light;${CHOICE_VARS.light};--page:#f6f2e9;--card:#fffdf8;--line:#cfc5b0;--link:#6d4400}
body{margin:0;background:var(--page);color:var(--fc-text);font:16px/1.5 system-ui,sans-serif}a{color:var(--link)}
.btn,.demo-field input,.demo-field textarea,.demo-field select{box-sizing:border-box;font:inherit;min-height:48px;border-radius:.7rem;border:2px solid var(--fc-btn-border);background:var(--fc-btn);color:var(--fc-text);padding:.5rem .9rem}
.btn{cursor:pointer;font-weight:600}.btn:hover{border-color:var(--fc-accent)}.btn:disabled{opacity:.45;cursor:default}.btn.primary{background:var(--fc-accent);border-color:var(--fc-accent);color:var(--fc-on-accent)}
.demo-field{display:grid;gap:.35rem;font:700 .75rem system-ui;letter-spacing:.08em;text-transform:uppercase;color:var(--fc-muted)}.demo-field input,.demo-field textarea,.demo-field select{text-transform:none;letter-spacing:0;font-weight:500;font-size:1rem;width:100%;min-width:0}
.btn:focus-visible,.demo-field :focus-visible,a:focus-visible{outline:3px solid var(--fc-focus);outline-offset:3px}
.file-btn{position:relative;display:inline-flex;align-items:center}.file-btn input{position:absolute;inset:0;width:100%;opacity:0;cursor:pointer}.file-btn:focus-within{outline:3px solid var(--fc-focus);outline-offset:3px}
${CHOICE_CSS}`;

/** Put the colours on the page. Call once, before anything is drawn. */
export function setupPage() {
  const style = document.createElement('style');
  style.textContent = PAGE_CSS;
  document.head.append(style);
  try {
    const theme = new URLSearchParams(location.search).get('theme');
    if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
  } catch { /* an address that cannot be read leaves the reader's setting */ }
}

export { createChoice };

/** Turn a `<select>` into a row of buttons. The select stays in the page, hidden, so scripts and forms still read it; a change of either moves the other. */
export function choiceFromSelect(select, { layout = 'row', label } = {}) {
  const wrapper = select.closest('label');
  const title = label ?? (wrapper ? [...wrapper.childNodes].find((n) => n.nodeType === 3)?.textContent.trim() : select.getAttribute('aria-label')) ?? '';
  const options = [...select.options].map((o) => ({ value: o.value, label: o.textContent.trim() }));
  const handle = createChoice({
    label: title, layout, value: select.value, options,
    onChange: (value) => { select.value = value; select.dispatchEvent(new Event('input', { bubbles: true })); select.dispatchEvent(new Event('change', { bubbles: true })); }
  });
  select.hidden = true;
  select.setAttribute('aria-hidden', 'true');
  select.tabIndex = -1;
  if (wrapper) { wrapper.replaceWith(handle.element); handle.element.append(select); } else select.after(handle.element);
  const sync = () => handle.set(select.value);
  select.addEventListener('change', sync);
  select.addEventListener('fuda-sync', sync);
  return handle;
}

/** Keep the value of each control (found by id) in the address, as `?id=value`, and read it back when the page opens. Other parameters are left as they are. */
export function keepInAddress(ids, { skip = {} } = {}) {
  const read = () => { try { return new URLSearchParams(location.search); } catch { return new URLSearchParams(); } };
  const initial = {};
  for (const id of ids) { const el = document.getElementById(id); if (el) initial[id] = el.value; }
  const params = read();
  for (const id of ids) {
    const el = document.getElementById(id), value = params.get(id);
    if (el && value !== null && value !== el.value) {
      el.value = value;
      if (el.value !== value) continue;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  let timer = 0;
  const write = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        const url = new URL(location.href);
        for (const id of ids) {
          const el = document.getElementById(id);
          if (!el || el.value === initial[id] || skip[id]?.(el.value)) url.searchParams.delete(id); else url.searchParams.set(id, el.value);
        }
        history.replaceState(history.state, '', url);
      } catch { /* a page that cannot change its address keeps working */ }
    }, 250);
  };
  for (const id of ids) document.getElementById(id)?.addEventListener('input', write);
}
