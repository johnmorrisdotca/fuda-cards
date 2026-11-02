/**
 * The pile features of `<fuda-card stack>`: the stack fans open and closes, the top card comes off onto a pile at its side and goes back,
 * and an optional bar of three buttons does it. Loaded by `element.js` only when a stack asks for one of them, so a card without them
 * is exactly what it was.
 *
 * It shares everything with the collection's deck through `pile.js`: the fan's layout, how a card lands and how it flies.
 */
import {fanBounds, fanLayout, fanRelative, fanShift, flight, normalizeLanding, timing} from './pile.js';
import {stackLayout} from './stack.js';

interface PileHost extends HTMLElement {
  stackCount: number; heldCount: number; fanOpen: boolean; cardThicknessMm: number;
  pileBounds: {left: number; right: number; top: number; bottom: number};
  takeOff(count?: number): void; putBack(count?: number): void;
}
interface State { taken: number; token: number; flyer?: HTMLElement; bar?: HTMLElement; discard?: HTMLElement }
const states = new WeakMap<PileHost, State>();
/** The gap between the stack and the pile at its side, in card widths (the collection's deck uses the same 0.28). */
const GAP = 0.28;

const PILE_CSS = `:host{position:relative}.rotation{position:relative}:host(:not([card-spin=corner])) .rotation{transform-origin:calc(50% + var(--pivot,0) * 100cqw) 50%}
.card{transition:transform var(--fuda-move,.65s) cubic-bezier(.2,.8,.2,1),transform-origin var(--fuda-move,.65s) cubic-bezier(.2,.8,.2,1)}
.card.fanned{transform-origin:50% 165%;transform:translate(calc(var(--fx,0) * 100cqw),0) rotate(calc(var(--fa,0) * 1deg))}
:host([flipped]) .card.fanned{transform:translate(calc(var(--fx,0) * 100cqw),0) rotate(calc(var(--fa,0) * 1deg)) rotateY(180deg)}
.still{transition:transform var(--fuda-move,.65s) cubic-bezier(.2,.8,.2,1),transform-origin var(--fuda-move,.65s) cubic-bezier(.2,.8,.2,1);transition-delay:calc(var(--j,0) * var(--stag,22ms))}
.card.fanned .still{transform-origin:50% 165%;transform:translate3d(calc(var(--rx,0) * 100cqw),calc(var(--ry,0) * 100cqw),calc(var(--t) / -2 - var(--j,1) * 1.5px)) rotate(calc(var(--ra,0) * 1deg));transition-delay:calc(var(--j,0) * var(--stag,28ms))}
.still.far{display:none}.still.faced{background:none;border:0;transform-style:preserve-3d}.still .face,.flyer .face,.discard .face{position:absolute;inset:0}
.art>img.copy{width:100%;height:100%;object-fit:contain;display:block}:host([motion="pan"]) .art>img.copy{object-fit:cover;object-position:var(--fuda-focus-x,50%) var(--fuda-focus-y,25%)}
.discard{position:absolute;left:0;top:0;width:100%;height:100%;transform-style:preserve-3d;translate:calc(var(--dx,1.28) * 100cqw) 0;transition:translate var(--fuda-move,.65s) cubic-bezier(.2,.8,.2,1);pointer-events:none}
.discard .card{transition:none}.discard[data-land=face-down] .card{transform:rotateY(180deg)}
.flyer{position:absolute;left:0;top:0;width:100%;height:100%;transform-style:preserve-3d;pointer-events:none;--t:calc(var(--mm,.3) * 100cqw / 63)}.flyer .fly,.flyer .turn{position:absolute;inset:0;transform-style:preserve-3d}
.bar{position:absolute;left:50%;top:calc(100% + 14px);translate:-50% 0;display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center;width:max-content;max-width:min(100vw - 24px,22rem);filter:none;font:600 .9rem system-ui,sans-serif}
.bar button{box-sizing:border-box;min-height:48px;min-width:48px;padding:.45rem .9rem;font:inherit;color:#f6f4f1;background:#2a2d3c;border:2px solid #8a8ca0;border-radius:.7rem;cursor:pointer}.bar button:hover{border-color:#ffd27e}.bar button[aria-pressed=true]{background:#ffd27e;border-color:#ffd27e;color:#241a05}.bar button:disabled{opacity:.45;cursor:default}.bar button:focus-visible{outline:3px solid #ffd27e;outline-offset:3px}
@media(prefers-reduced-motion:reduce){.card,.still,.discard{transition:none}}`;

function num(host: HTMLElement, name: string, fallback: number): number {const n = Number.parseFloat(host.getAttribute(name) ?? ''); return Number.isFinite(n) ? n : fallback;}

/** Copies of the card's front and back faces for a card that is not the live one: the picture as an `img` copy (a 3D viewer is never copied), no ids, no Animate button. */
function faceCopies(host: HTMLElement, root: ShadowRoot): [HTMLElement, HTMLElement] {
  const front = root.querySelector('.card > .front')!.cloneNode(true) as HTMLElement, back = root.querySelector('.card > .back')!.cloneNode(true) as HTMLElement;
  for (const el of [front, back]) { el.querySelectorAll('[id]').forEach((e) => e.removeAttribute('id')); el.querySelectorAll('.motion-button').forEach((e) => e.remove()); }
  const slot = front.querySelector('slot'), img = host.querySelector('img');
  if (slot) { if (img) { const copy = img.cloneNode() as HTMLImageElement; copy.removeAttribute('id'); copy.className = 'copy'; slot.replaceWith(copy); } else slot.remove(); }
  return [front, back];
}

function stillsMarkup(count: number, host: HTMLElement): string {
  const messiness = num(host, 'stack-messiness', 0.3), seed = num(host, 'stack-seed', 1) + 7, depth = Math.min(52, Math.max(0, Math.floor(num(host, 'stack-depth', 10))));
  if (count < 2) return '';
  const places = stackLayout(count, {messiness, seed, depth});
  return places.map((p, at) => `<i class="still" style="--x:${p.x};--y:${p.y};--r:${p.rotate};--k:${count - places.length + at}"></i>`).join('');
}

/** The pile of cards taken off: a thick block of `count` cards like the stack, its top card face up or turned over, at the stack's side. */
function drawDiscard(host: PileHost, root: ShadowRoot, state: State, count: number, land: 'face-up' | 'face-down', dx: number): void {
  const rotation = root.querySelector('.rotation')!;
  if (count < 1) { state.discard?.remove(); state.discard = undefined; return; }
  let box = state.discard;
  if (!box) { box = document.createElement('div'); box.className = 'discard'; rotation.append(box); state.discard = box; }
  box.dataset.land = land; box.style.setProperty('--dx', String(dx));
  const live = root.querySelector('.card') as HTMLElement, copy = live.cloneNode(true) as HTMLElement;
  copy.className = 'card'; copy.removeAttribute('style');
  const [front, back] = faceCopies(host, root);
  copy.querySelector('.front')!.replaceWith(front); copy.querySelector('.back')!.replaceWith(back);
  const mm = host.cardThicknessMm;
  copy.style.setProperty('--mm', String(mm * count)); copy.style.setProperty('--mm1', String(mm)); copy.classList.toggle('stacked', count > 1);
  copy.querySelector('.stills')!.innerHTML = stillsMarkup(count, host);
  box.replaceChildren(copy);
}

function fanState(host: PileHost, root: ShadowRoot, on: boolean) {
  const card = root.querySelector('.card') as HTMLElement, stills = Array.from(root.querySelectorAll<HTMLElement>('.card > .stills > .still'));
  card.classList.toggle('fanned', on);
  const n = Math.min(10, 1 + stills.length), places = fanLayout(n, num(host, 'stack-seed', 1), 0.34), rel = fanRelative(places);
  if (on) {
    card.style.setProperty('--fx', String(places[0].x)); card.style.setProperty('--fa', String(places[0].angle));
    const [front, back] = stills.length ? faceCopies(host, root) : [null, null];
    stills.forEach((still, at) => {
      const i = stills.length - at;
      still.classList.toggle('far', i >= n);
      if (i >= n) return;
      still.style.setProperty('--rx', String(rel[i].x)); still.style.setProperty('--ry', String(rel[i].y)); still.style.setProperty('--ra', String(rel[i].angle)); still.style.setProperty('--j', String(i));
      if (!still.classList.contains('faced') || still.dataset.sig !== host.innerHTML + host.getAttribute('title')) {
        still.classList.add('faced'); still.dataset.sig = host.innerHTML + host.getAttribute('title');
        const [f, b] = [front!.cloneNode(true) as HTMLElement, back!.cloneNode(true) as HTMLElement];
        still.replaceChildren(f, b);
      }
    });
  } else {
    stills.forEach((still, at) => { still.style.setProperty('--j', String(stills.length - at)); still.classList.remove('far'); });
  }
  return {places, bounds: on ? fanBounds(places) : {left: 0, right: 0, top: 0, bottom: 0}};
}

/** Draw the pile features for the stack's current attributes: `fan`, `taken-off`, `deck-land`, `animate`, `speed` and `pile-controls`. */
export function applyPile(host: PileHost, root: ShadowRoot): void {
  let state = states.get(host);
  if (!state) { state = {taken: 0, token: 0}; states.set(host, state); }
  if (!root.querySelector('style[data-pile]')) { const style = document.createElement('style'); style.dataset.pile = ''; style.textContent = PILE_CSS; root.append(style); }
  const t = timing(host, true), land = normalizeLanding(host.getAttribute('deck-land'));
  host.style.setProperty('--fuda-move', t.on ? `${t.ms}ms` : '0s'); if (t.on) host.style.removeProperty('--stag'); else host.style.setProperty('--stag', '0ms');
  const total = host.stackCount, taken = Math.min(total - 1, Math.max(0, Math.floor(num(host, 'taken-off', 0)))), fan = host.fanOpen;
  const was = state.taken, token = ++state.token;
  const {places, bounds} = fanState(host, root, fan);
  if (!fan) {
    const faced = Array.from(root.querySelectorAll<HTMLElement>('.card > .stills > .still.faced'));
    // The copies of the faces go once the cards have closed (at once when nothing is animated).
    const clean = () => { if (!host.fanOpen) faced.forEach((s) => { s.classList.remove('faced'); s.replaceChildren(); delete s.dataset.sig; }); };
    if (faced.length) { if (t.on) void Promise.all(root.querySelector('.card')!.getAnimations({subtree: true}).map((a) => a.finished.catch(() => undefined))).then(clean); else clean(); }
  }
  const dx = 1 + GAP + bounds.right, mmPx = (host.cardThicknessMm * host.offsetWidth) / 63;
  // The pile at the side: where it is, how many cards and how its top card lies. While a card flies to it, it holds the cards that were there before.
  const moving = taken !== was && t.on && host.offsetWidth > 0;
  state.flyer?.remove(); state.flyer = undefined;
  drawDiscard(host, root, state, moving && taken > was ? was : taken, land, dx);
  if (moving) {
    const off = taken > was, rotation = root.querySelector('.rotation')!, [front, back] = faceCopies(host, root);
    const flyer = document.createElement('div'); flyer.className = 'flyer'; flyer.style.setProperty('--mm', String(host.cardThicknessMm));
    const fly = document.createElement('div'); fly.className = 'fly'; const turn = document.createElement('div'); turn.className = 'turn';
    turn.append(front, back); fly.append(turn); flyer.append(fly); rotation.append(flyer); state.flyer = flyer;
    const w = host.offsetWidth, heldBefore = off ? total - was : total - taken, zStack = (heldBefore * mmPx) / 2, zPile = (Math.max(1, off ? taken : was) * mmPx) / 2;
    const lead = fan && places.length > 1 ? places[0] : null, shift = lead ? fanShift(lead) : {x: 0, y: 0};
    // The flyer sits at its landing place; it flies from (off) or to (back) the stack, where an open fan holds the top card.
    flyer.style.transform = off ? `translate3d(${dx * w}px,0,${zPile}px)` : `translate3d(${shift.x * w}px,${shift.y * w}px,${zStack}px) rotate(${lead ? lead.angle : 0}deg)`;
    const away = off ? {x: -dx * w + shift.x * w, y: shift.y * w, z: zStack - zPile} : {x: dx * w - shift.x * w, y: -shift.y * w, z: zPile - zStack};
    const anims = flight(fly, turn, away, land, off ? 'off' : 'back', Math.round(t.ms * 1.15), lead ? (off ? lead.angle : -lead.angle) : 0);
    void Promise.all(anims.map((a) => a.finished)).then(() => {
      if (token !== state!.token) return;
      flyer.remove(); state!.flyer = undefined; drawDiscard(host, root, state!, taken, land, dx);
    }, () => undefined);
  }
  state.taken = taken;
  // The bar of three buttons, when asked for.
  if (host.hasAttribute('pile-controls')) {
    if (!state.bar) {
      const bar = document.createElement('div'); bar.className = 'bar'; bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Pile');
      const make = (label: string, run: () => void) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.addEventListener('click', run); return b; };
      const fanButton = make('Fan', () => { if (host.getAttribute('fan') === 'open') host.removeAttribute('fan'); else host.setAttribute('fan', 'open'); });
      fanButton.dataset.role = 'fan'; fanButton.setAttribute('aria-pressed', 'false');
      const off = make('Take a card off', () => host.takeOff()); off.dataset.role = 'off';
      const back = make('Put it back', () => host.putBack()); back.dataset.role = 'back';
      bar.append(fanButton, off, back); root.append(bar); state.bar = bar;
    }
    const q = (role: string) => state!.bar!.querySelector(`[data-role=${role}]`) as HTMLButtonElement;
    q('fan').setAttribute('aria-pressed', String(fan)); q('fan').textContent = fan ? 'Close the fan' : 'Fan open';
    q('off').disabled = taken >= total - 1; q('back').disabled = taken < 1;
  } else if (state.bar) { state.bar.remove(); state.bar = undefined; }
  const right = Math.max(bounds.right, taken > 0 || (moving && taken < was) ? dx : 0);
  const next = {left: bounds.left, right, top: bounds.top, bottom: bounds.bottom};
  const old = host.pileBounds;
  host.pileBounds = next;
  host.style.setProperty('--pivot', String((next.right - next.left) / 2));
  if (old.left !== next.left || old.right !== next.right || old.top !== next.top || old.bottom !== next.bottom) host.dispatchEvent(new CustomEvent('fuda-pile', {detail: next}));
}
