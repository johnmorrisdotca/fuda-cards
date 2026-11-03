import "@johnmorrisdotca/kazoku-ui/view-controls/define";

interface ViewState {
  zoom: number;
  panX: number;
  panY: number;
  yaw?: number;
  tilt?: number;
}
export interface ZoomControls extends HTMLElement {
  readonly state: ViewState;
  readonly controller: { readonly startZoom: number };
  view: HTMLElement | undefined;
  set(next: Partial<ViewState>): void;
  readonly turning?: boolean;
  setFitScale(scale: number): void;
}
export interface ZoomOptions {
  /** Selector for the items that must be visible at Fit. */
  items?: string;
  /** Keep zoom in the page address. */
  address?: boolean;
  /** Put the controls after this element instead of after the stage. */
  after?: Element;
  /** The colour theme of the controls (`light` or `dark`); left out they follow the page. */
  theme?: string;
}
export interface ZoomView {
  controls: ZoomControls;
  /** The smallest scale the view opens at; 0 opens at Fit. */
  minOpen: number;
  /** Measure again after the content or the stage changed. */
  refresh(open?: boolean): void;
  /** Go back to the opening view. */
  reset(): void;
  zoomed(): boolean;
  /** Let the reader turn the view in 3D (angle, tilt, Auto-turn) or only zoom and move it. Off by default. `never` says nothing in the view can turn, so an angle in the address is dropped too. */
  setTurnable(on: boolean, never?: boolean): void;
  /** The selector of the items that must be visible at Fit. It can change with the display. */
  items: string;
  /** Run a change that moves the view (a refit, a pan) so that the view glides to its new place over `ms` instead of jumping; 0 jumps. */
  animated(change: () => void, ms: number): void;
  /** Move the view so the item is in the middle of the stage, gliding over `ms` (0 jumps). Does nothing when the item is not in the view. */
  reveal(item: Element, ms: number): void;
  /** True while the view is turned in 3D. */
  turned(): boolean;
}

const MARGIN = 12;
const ZOOMED = 1.05;
const TAPPABLE = "button:not(:disabled), a[href], [role=button]";

/**
 * Zoom, Fit and pan for a flat view. `stage` clips, `view` is its absolutely positioned child that holds the items and is
 * moved and scaled. Fit shows every item at once; the reader's zoom and pan are never reset by a change of content.
 */
export function zoomView(stage: HTMLElement, view: HTMLElement, options: ZoomOptions = {}): ZoomView {
  const controls = document.createElement("kazoku-view-controls") as ZoomControls;
  controls.setAttribute("flat", "");
  controls.setAttribute("ignore", "");
  controls.setAttribute("zoom-min", "0.4");
  if (options.theme) controls.setAttribute("theme", options.theme);
  if (options.address) controls.setAttribute("address", "");
  (options.after ?? stage).after(controls);
  controls.view = stage;

  stage.style.userSelect = "none";
  stage.addEventListener("dragstart", (e) => e.preventDefault());

  let box = { w: 0, h: 0, cx: 0, cy: 0, bw: 0, bh: 0 };
  let fit = 1;
  let turnable = false;
  const self: ZoomView = {
    controls,
    minOpen: 0,
    items: options.items ?? ".card",
    refresh,
    reset: () => refresh(true),
    zoomed: () => controls.state.zoom > ZOOMED,
    setTurnable,
    animated,
    reveal,
    turned: () => turnable && Boolean(controls.state.yaw || controls.state.tilt),
  };

  let glide: Animation | undefined;
  /** A glide that is still running would be measured as if it were the layout, so a new measure ends it first. */
  function settleGlide() {
    if (glide) {
      glide.cancel();
      glide = undefined;
    }
  }

  function measure() {
    settleGlide();
    const previous = view.style.transform;
    view.style.transform = "none";
    const origin = stage.getBoundingClientRect();
    const left = origin.left + stage.clientLeft;
    const top = origin.top + stage.clientTop;
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (const item of Array.from(view.querySelectorAll(self.items))) {
      const r = item.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      x0 = Math.min(x0, r.left - left);
      y0 = Math.min(y0, r.top - top);
      x1 = Math.max(x1, r.right - left);
      y1 = Math.max(y1, r.bottom - top);
    }
    view.style.transform = previous;
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (x0 > x1) {
      x0 = 0;
      y0 = 0;
      x1 = w;
      y1 = h;
    }
    box = { w, h, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, bw: x1 - x0, bh: y1 - y0 };
  }

  function draw(state: ViewState) {
    const scale = fit * state.zoom;
    view.style.transformOrigin = `${box.cx}px ${box.cy}px`;
    const turn = turnable ? ` rotateX(${state.tilt ?? 0}deg) rotateY(${state.yaw ?? 0}deg)` : "";
    // The turn, for the items that must stay square to the reader (they turn the other way by this much).
    view.style.setProperty("--fuda-yaw", turnable ? String(state.yaw ?? 0) : "0");
    view.style.setProperty("--fuda-tilt", turnable ? String(state.tilt ?? 0) : "0");
    view.style.transform = `translate(${box.w / 2 - box.cx + state.panX}px,${box.h / 2 - box.cy + state.panY}px) scale(${scale})${turn}`;
  }

  function setTurnable(on: boolean, never = false) {
    // A view whose items can never turn (`never`) keeps no angle either, whatever the address says.
    if (on === turnable) {
      if (never && !on && (controls.state.yaw || controls.state.tilt)) controls.set({ yaw: 0, tilt: 0 });
      return;
    }
    turnable = on;
    if (!on) controls.set({ yaw: 0, tilt: 0 });
    controls.toggleAttribute("flat", !on);
    draw(controls.state);
  }

  const EASE = "cubic-bezier(.2,.8,.2,1)";
  function animated(change: () => void, ms: number) {
    const from = ms > 0 ? getComputedStyle(view).transform : "";
    change();
    const to = view.style.transform;
    if (ms > 0 && from && from !== "none" && to && from !== to) {
      settleGlide();
      glide = view.animate([{ transform: from }, { transform: to }], { duration: ms, easing: EASE });
    }
  }

  function reveal(item: Element, ms: number) {
    animated(() => {
      measure();
      const previous = view.style.transform;
      view.style.transform = "none";
      const origin = stage.getBoundingClientRect();
      const r = item.getBoundingClientRect();
      view.style.transform = previous;
      if (!r.width) return;
      const s = fit * controls.state.zoom;
      const px = r.left + r.width / 2 - origin.left - stage.clientLeft;
      const py = r.top + r.height / 2 - origin.top - stage.clientTop;
      controls.set({ panX: -s * (px - box.cx), panY: -s * (py - box.cy) });
      draw(controls.state);
    }, ms);
  }

  function refresh(open = false) {
    measure();
    if (!box.w || !box.h) return;
    fit = Math.min(1, (box.w - 2 * MARGIN) / (box.bw || 1), (box.h - 2 * MARGIN) / (box.bh || 1));
    if (!(fit > 0)) fit = 1;
    controls.setAttribute("zoom-max", String(Math.max(5, Math.ceil(2 / fit))));
    const atOpening = Math.abs(controls.state.zoom - controls.controller.startZoom) < 1e-6;
    controls.setFitScale(fit);
    if (open || atOpening) {
      const scale = Math.max(fit, Math.min(1, self.minOpen));
      controls.setAttribute("zoom", String(scale));
      const s = fit * controls.state.zoom;
      controls.set({
        panX: box.bw * s > box.w - 2 * MARGIN ? MARGIN - box.w / 2 + (box.bw * s) / 2 : 0,
        panY: box.bh * s > box.h - 2 * MARGIN ? MARGIN - box.h / 2 + (box.bh * s) / 2 : 0,
      });
    }
    draw(controls.state);
  }

  controls.addEventListener("kazoku-viewchange", (e) => draw((e as CustomEvent<ViewState>).detail));
  new ResizeObserver(() => refresh()).observe(stage);
  let queued = 0;
  view.addEventListener("transitionend", () => {
    cancelAnimationFrame(queued);
    queued = requestAnimationFrame(() => refresh());
  });

  stage.addEventListener(
    "wheel",
    (e) => {
      if (e.ctrlKey || e.metaKey || !self.zoomed()) return;
      e.preventDefault();
      const k = e.deltaMode === 1 ? 16 : 1;
      const s = controls.state;
      controls.set({ panX: s.panX - e.deltaX * k, panY: s.panY - e.deltaY * k });
    },
    { passive: false },
  );

  // The controls take every press on the stage, so a drag or a pinch works over the items too. A tap that did not move is passed on as a click.
  let tap: { id: number; x: number; y: number; at: number; target: HTMLElement } | null = null;
  stage.addEventListener(
    "pointerdown",
    (e) => {
      const target = e.isPrimary
        ? e.composedPath().find((n): n is HTMLElement => n instanceof HTMLElement && n !== stage && n.matches(TAPPABLE))
        : undefined;
      tap = target ? { id: e.pointerId, x: e.clientX, y: e.clientY, at: e.timeStamp, target } : null;
    },
    true,
  );
  stage.addEventListener("pointerup", (e) => {
    if (
      tap &&
      e.pointerId === tap.id &&
      Math.hypot(e.clientX - tap.x, e.clientY - tap.y) < 10 &&
      e.timeStamp - tap.at < 800
    )
      tap.target.click();
    tap = null;
  });
  stage.addEventListener("pointercancel", () => {
    tap = null;
  });
  stage.addEventListener(
    "click",
    (e) => {
      if (e.isTrusted && e.detail > 0) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    },
    true,
  );

  queueMicrotask(() => refresh());
  return self;
}
