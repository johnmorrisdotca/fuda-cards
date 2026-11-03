// Keeping the display, the fan, the landing, the animation and the binder in the page's address.
import { binderCovers } from "./binder.js";
import type { CollectionHost } from "./collection-host.js";

/** With `address`, the display, the fan, the landing, the animation and its speed are kept in the page's address (`?view=fan&fan=open&land=face-down&animate=off`), and a link to it opens the same. */
/** The attributes kept in the address, in the order they are written. */
export const ADDRESS_KEYS = ["view", "fan", "land", "animate", "speed", "binder", "cover", "sheet", "pockets"] as const;
/** An address key whose attribute has another name. */
export const NAMES: Record<string, string> = { land: "deck-land" };

export function readAddress(host: CollectionHost) {
  try {
    const params = new URLSearchParams(location.search);
    for (const key of ADDRESS_KEYS) {
      const value = params.get(key);
      if (value === null) continue;
      const attr = NAMES[key] ?? key;
      if (host.getAttribute(attr) !== value) host.setAttribute(attr, value);
    }
  } catch {}
}

export function writeAddress(host: CollectionHost) {
  if (!host.hasAttribute("address")) return;
  clearTimeout(host.addressTimer);
  host.addressTimer = window.setTimeout(() => {
    try {
      const url = new URL(location.href);
      const want: Record<string, string | null> = {
        view: host.currentView === "deck" ? null : host.currentView,
        fan: host.fanOpen ? "open" : null,
        land: host.land === "face-up" ? null : host.land,
        animate: host.getAttribute("animate") === "off" ? "off" : null,
        speed: ["slow", "quick"].includes(host.getAttribute("speed") ?? "") ? host.getAttribute("speed") : null,
        binder: host.getAttribute("binder") === "zip" ? "zip" : null,
        cover:
          binderCovers.some((c) => c.id === host.getAttribute("cover")) && host.getAttribute("cover") !== "green"
            ? host.getAttribute("cover")
            : null,
        sheet: host.getAttribute("sheet") === "black" ? "black" : null,
        pockets: ["4", "12"].includes(host.getAttribute("pockets") ?? "") ? host.getAttribute("pockets") : null,
      };
      for (const [k, v] of Object.entries(want)) {
        if (v === null) url.searchParams.delete(k);
        else url.searchParams.set(k, v);
      }
      history.replaceState(history.state, "", url);
    } catch {}
  }, 250);
}
