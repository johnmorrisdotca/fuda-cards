// Live 3D inside cards, at no cost until a card is in focus. One card at a time turns, on the one WebGL context of kazoku-ui's shared renderer; every other card is a
// picture. A page that only shows pictures loads no 3D code at all: the renderer and three.js come in when the first card is focused, or when a card with no picture of its
// own comes near the view and needs its still made. This module only decides WHICH card is live (the focus policy): the context, the assets, the stills, the frames and the
// pixel budget are the shared renderer's (kazoku-ui docs/renderer.md).
import type {
  BuildContext,
  RendererStats,
  Scene3D,
  SharedRenderer,
  SharedRendererOptions,
  ThreeLike,
  View,
} from "@johnmorrisdotca/kazoku-ui/renderer";

/** A scene for a card. `object` is what turns about its upright axis while the card is in focus. */
export interface LiveScene extends Scene3D {
  object?: { rotation: { y: number } };
}
/** What a card shows in 3D: a key (items with the same key share their pictures) and a scene made from shared assets (`assets.acquire`). */
export interface LiveItem<T extends ThreeLike = ThreeLike> {
  key: string;
  build(context: BuildContext<T>): LiveScene | Promise<LiveScene>;
}
export interface LiveCardsOptions<T extends ThreeLike = ThreeLike>
  extends Omit<SharedRendererOptions<T>, "scheduler" | "assets" | "clock" | "document"> {
  /** Seconds for one turn of the card in focus (12). 0 does not turn it. */
  turnSeconds?: number;
  /** How long the pointer has to rest on a card before it goes live, in milliseconds (150), so moving the pointer across a page of cards starts nothing. A press or the keyboard does not wait. */
  dwellMs?: number;
  /** How far outside the view a card with no picture of its own gets its still made, in pixels (300). */
  lookAheadPx?: number;
}
export interface AddOptions {
  /** A picture the card already has (an `<img>` of its own), kept until the card is in focus. With one, the card costs no 3D code until then. */
  still?: HTMLImageElement;
}
export interface LiveCards<T extends ThreeLike = ThreeLike> {
  /** Make a card live on focus: a `<fuda-card>` or any element with a size. Gives back the function that takes it off again. */
  add(card: HTMLElement, item: LiveItem<T>, options?: AddOptions): () => void;
  /** Put this card in focus: it takes the context, and the card that had it freezes to a picture at its last angle. False if it did not go live (another took it, reduced motion, no WebGL). */
  focus(card: HTMLElement): Promise<boolean>;
  /** No card in focus: the live one freezes to a picture and nothing draws. */
  blur(): void;
  /** The card in focus, if any. */
  readonly focused: HTMLElement | undefined;
  /** The shared renderer's own figures; undefined until it has been needed. */
  readonly stats: RendererStats | undefined;
  /** The shared renderer; undefined until it has been needed. */
  readonly renderer: SharedRenderer<T> | undefined;
  /** Take every card off and let go of the renderer. */
  dispose(): void;
}

interface Entry<T extends ThreeLike> {
  card: HTMLElement;
  item: LiveItem<T>;
  host: HTMLElement;
  poster?: HTMLImageElement;
  posterSrc?: string;
  angle: number;
  view?: View;
  making?: Promise<View | undefined>;
  off: () => void;
}

/** Stills are shared per this many degrees, so a card frozen at any angle shows a picture at its angle without one picture per degree. */
const STILL_STEP = 5;
const reducedMotion = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

export function createLiveCards<T extends ThreeLike = ThreeLike>(options: LiveCardsOptions<T>): LiveCards<T> {
  const { turnSeconds = 12, dwellMs = 150, lookAheadPx = 300, ...rendererOptions } = options;
  const entries = new Map<HTMLElement, Entry<T>>();
  let renderer: SharedRenderer<T> | undefined;
  let loading: Promise<SharedRenderer<T>> | undefined;
  let focusedEntry: Entry<T> | undefined;
  let disposed = false;
  let asked = 0;

  /** The renderer's module comes in only when a card first needs it: a page of pictures never loads it. */
  const needRenderer = () =>
    (loading ??= import("@johnmorrisdotca/kazoku-ui/renderer").then(
      ({ createSharedRenderer }) => (renderer = createSharedRenderer<T>(rendererOptions)),
    ));

  /** The view of a card, made when first needed. The item's key carries the card's angle, so its still shows the angle it stopped at. */
  const viewOf = (entry: Entry<T>): Promise<View | undefined> => {
    if (entry.view) return Promise.resolve(entry.view);
    entry.making ??= needRenderer().then((shared) => {
      if (disposed || !entries.has(entry.card)) return undefined;
      const turning = {
        get key() {
          return `${entry.item.key}@${(((Math.round(entry.angle / STILL_STEP) * STILL_STEP) % 360) + 360) % 360}`;
        },
        build: async (context: BuildContext<T>): Promise<Scene3D> => {
          const scene = await entry.item.build(context);
          const turn = (): void => {
            if (scene.object) scene.object.rotation.y = (entry.angle * Math.PI) / 180;
          };
          turn();
          return {
            ...scene,
            update(dt: number, now: number) {
              const more = scene.update?.(dt, now) === true;
              if (!turnSeconds || !scene.object || reducedMotion()) return more;
              entry.angle += (360 * dt) / turnSeconds;
              turn();
              return true;
            },
          };
        },
      };
      entry.view = shared.view(entry.host, turning, entry.poster ? { still: entry.poster } : {});
      return entry.view;
    });
    return entry.making;
  };

  const putPosterBack = (entry: Entry<T>) => {
    if (entry.poster && entry.posterSrc && !entry.poster.getAttribute("src")) entry.poster.src = entry.posterSrc;
  };
  /** A card near the view shows its picture. One with a picture of its own needs nothing; the renderer makes the others', one at a time. */
  const prepare = (entry: Entry<T>) => {
    if (entry.view) {
      if (entry.poster && !entry.poster.getAttribute("src") && !entry.view.live) putPosterBack(entry);
      if (!entry.poster) void entry.view.showStill();
      return;
    }
    if (!entry.poster) void viewOf(entry).then((view) => view?.showStill());
  };
  const near =
    typeof IntersectionObserver === "function"
      ? new IntersectionObserver(
          (seen) => {
            for (const { target, isIntersecting } of seen) {
              const entry = entries.get(target as HTMLElement);
              if (entry && isIntersecting) prepare(entry);
            }
          },
          { rootMargin: `${lookAheadPx}px` },
        )
      : undefined;

  async function focus(card: HTMLElement): Promise<boolean> {
    const entry = entries.get(card);
    if (!entry || disposed || reducedMotion()) return false;
    const mine = ++asked;
    if (focusedEntry === entry && entry.view?.live) return true;
    focusedEntry = entry;
    const view = await viewOf(entry);
    if (!view || mine !== asked) return false;
    return view.focus();
  }
  function blur(): void {
    asked += 1;
    const entry = focusedEntry;
    focusedEntry = undefined;
    entry?.view?.blur();
  }

  // Who is in focus: the card under the pointer after a short rest, the one holding keyboard focus, the one last pressed. A press elsewhere ends it.
  document.addEventListener("pointerdown", onPressAnywhere, true);
  function onPressAnywhere(event: Event): void {
    if (focusedEntry && !event.composedPath().includes(focusedEntry.card)) blur();
  }
  function listen(entry: Entry<T>): () => void {
    const { card } = entry;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const wait = () => {
      clearTimeout(timer);
      timer = undefined;
    };
    const enter = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      wait();
      timer = setTimeout(() => {
        void focus(card);
      }, dwellMs);
    };
    const leave = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      wait();
      if (focusedEntry === entry && !card.matches(":focus-within")) blur();
    };
    const press = () => {
      wait();
      void focus(card);
    };
    const focusIn = () => {
      wait();
      void focus(card);
    };
    const focusOut = (e: FocusEvent) => {
      if (focusedEntry === entry && !card.contains(e.relatedTarget as Node | null) && !card.matches(":hover")) blur();
    };
    card.addEventListener("pointerenter", enter);
    card.addEventListener("pointerleave", leave);
    card.addEventListener("pointerdown", press);
    card.addEventListener("focusin", focusIn);
    card.addEventListener("focusout", focusOut);
    return () => {
      wait();
      card.removeEventListener("pointerenter", enter);
      card.removeEventListener("pointerleave", leave);
      card.removeEventListener("pointerdown", press);
      card.removeEventListener("focusin", focusIn);
      card.removeEventListener("focusout", focusOut);
    };
  }

  function add(card: HTMLElement, item: LiveItem<T>, addOptions: AddOptions = {}): () => void {
    entries.get(card)?.off();
    const host = document.createElement("div");
    host.className = "fuda-live";
    // It lies over the art and takes no press, so everything on the card still works. `.art ::slotted(*)` keeps it unseen until the card is ready.
    host.style.cssText = "position:absolute;inset:0;pointer-events:none";
    if (getComputedStyle(card).position === "static") card.style.position = "relative";
    card.append(host);
    const entry: Entry<T> = {
      card,
      item,
      host,
      angle: 0,
      off: () => {},
      ...(addOptions.still
        ? { poster: addOptions.still, posterSrc: addOptions.still.getAttribute("src") ?? undefined }
        : {}),
    };
    const unlisten = listen(entry);
    entries.set(card, entry);
    near?.observe(card);
    if (!near) prepare(entry);
    entry.off = () => {
      if (entries.get(card) !== entry) return;
      if (focusedEntry === entry) focusedEntry = undefined;
      unlisten();
      near?.unobserve(card);
      entries.delete(card);
      entry.view?.dispose();
      putPosterBack(entry);
      if (entry.poster) entry.poster.style.visibility = "";
      host.remove();
    };
    return entry.off;
  }

  return {
    add,
    focus,
    blur,
    get focused() {
      return focusedEntry?.card;
    },
    get stats() {
      return renderer?.stats;
    },
    get renderer() {
      return renderer;
    },
    dispose() {
      disposed = true;
      for (const entry of [...entries.values()]) entry.off();
      document.removeEventListener("pointerdown", onPressAnywhere, true);
      near?.disconnect();
      renderer?.dispose();
    },
  };
}
