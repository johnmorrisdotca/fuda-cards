import '@johnmorrisdotca/kazoku-ui/view-controls/define';

interface ViewState { zoom: number; panX: number; panY: number }
export interface ZoomControls extends HTMLElement {
  readonly state: ViewState;
  readonly controller: { readonly startZoom: number };
  view: HTMLElement | undefined;
  set(next: Partial<ViewState>): void;
  setFitScale(scale: number): void;
}
export interface ZoomOptions {
  /** Selector for the items that must be visible at Fit. */
  items?: string;
  /** Keep zoom in the page address. */
  address?: boolean;
  /** Put the controls after this element instead of after the stage. */
  after?: Element;
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
}

const MARGIN = 12;
const ZOOMED = 1.05;
const TAPPABLE = 'button:not(:disabled), a[href]';

/**
 * Zoom, Fit and pan for a flat view. `stage` clips, `view` is its absolutely positioned child that holds the items and is
 * moved and scaled. Fit shows every item at once; the reader's zoom and pan are never reset by a change of content.
 */
export function zoomView(stage: HTMLElement, view: HTMLElement, options: ZoomOptions = {}): ZoomView {
  const items = options.items ?? '.card';
  const controls = document.createElement('kazoku-view-controls') as ZoomControls;
  controls.setAttribute('flat', '');
  controls.setAttribute('ignore', '');
  controls.setAttribute('zoom-min', '0.4');
  controls.setAttribute('theme', 'dark');
  if (options.address) controls.setAttribute('address', '');
  (options.after ?? stage).after(controls);
  controls.view = stage;

  stage.style.userSelect = 'none';
  stage.addEventListener('dragstart', e => e.preventDefault());

  let box = { w: 0, h: 0, cx: 0, cy: 0, bw: 0, bh: 0 };
  let fit = 1;
  const self: ZoomView = { controls, minOpen: 0, refresh, reset: () => refresh(true), zoomed: () => controls.state.zoom > ZOOMED };

  function measure() {
    const previous = view.style.transform;
    view.style.transform = 'none';
    const origin = stage.getBoundingClientRect();
    const left = origin.left + stage.clientLeft, top = origin.top + stage.clientTop;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const item of Array.from(view.querySelectorAll(items))) {
      const r = item.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      x0 = Math.min(x0, r.left - left); y0 = Math.min(y0, r.top - top);
      x1 = Math.max(x1, r.right - left); y1 = Math.max(y1, r.bottom - top);
    }
    view.style.transform = previous;
    const w = stage.clientWidth, h = stage.clientHeight;
    if (x0 > x1) { x0 = 0; y0 = 0; x1 = w; y1 = h; }
    box = { w, h, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, bw: x1 - x0, bh: y1 - y0 };
  }

  function draw(state: ViewState) {
    const scale = fit * state.zoom;
    view.style.transformOrigin = `${box.cx}px ${box.cy}px`;
    view.style.transform = `translate(${box.w / 2 - box.cx + state.panX}px,${box.h / 2 - box.cy + state.panY}px) scale(${scale})`;
  }

  function refresh(open = false) {
    measure();
    if (!box.w || !box.h) return;
    fit = Math.min(1, (box.w - 2 * MARGIN) / (box.bw || 1), (box.h - 2 * MARGIN) / (box.bh || 1));
    if (!(fit > 0)) fit = 1;
    controls.setAttribute('zoom-max', String(Math.max(5, Math.ceil(2 / fit))));
    const atOpening = Math.abs(controls.state.zoom - controls.controller.startZoom) < 1e-6;
    controls.setFitScale(fit);
    if (open || atOpening) {
      const scale = Math.max(fit, Math.min(1, self.minOpen));
      controls.setAttribute('zoom', String(scale));
      const s = fit * controls.state.zoom;
      controls.set({
        panX: box.bw * s > box.w - 2 * MARGIN ? MARGIN - box.w / 2 + (box.bw * s) / 2 : 0,
        panY: box.bh * s > box.h - 2 * MARGIN ? MARGIN - box.h / 2 + (box.bh * s) / 2 : 0
      });
    }
    draw(controls.state);
  }

  controls.addEventListener('kazoku-viewchange', e => draw((e as CustomEvent<ViewState>).detail));
  new ResizeObserver(() => refresh()).observe(stage);
  let queued = 0;
  view.addEventListener('transitionend', () => { cancelAnimationFrame(queued); queued = requestAnimationFrame(() => refresh()); });

  stage.addEventListener('wheel', e => {
    if (e.ctrlKey || e.metaKey || !self.zoomed()) return;
    e.preventDefault();
    const k = e.deltaMode === 1 ? 16 : 1, s = controls.state;
    controls.set({ panX: s.panX - e.deltaX * k, panY: s.panY - e.deltaY * k });
  }, { passive: false });

  // The controls take every press on the stage, so a drag or a pinch works over the items too. A tap that did not move is passed on as a click.
  let tap: { id: number; x: number; y: number; at: number; target: HTMLElement } | null = null;
  stage.addEventListener('pointerdown', e => {
    const target = e.isPrimary ? e.composedPath().find((n): n is HTMLElement => n instanceof HTMLElement && n !== stage && n.matches(TAPPABLE)) : undefined;
    tap = target ? { id: e.pointerId, x: e.clientX, y: e.clientY, at: e.timeStamp, target } : null;
  }, true);
  stage.addEventListener('pointerup', e => {
    if (tap && e.pointerId === tap.id && Math.hypot(e.clientX - tap.x, e.clientY - tap.y) < 10 && e.timeStamp - tap.at < 800) tap.target.click();
    tap = null;
  });
  stage.addEventListener('pointercancel', () => { tap = null; });
  stage.addEventListener('click', e => {
    if (e.isTrusted && e.detail > 0) { e.stopImmediatePropagation(); e.preventDefault(); }
  }, true);

  queueMicrotask(() => refresh());
  return self;
}
