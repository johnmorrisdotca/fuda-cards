// The stylesheet of `<fuda-card>`, in the order it cascades: the host and its colours, the turn, the face, the picture, the foil and
// the gloss, the back, the edge, the cards under the top one. One design pixel is `--u`, a 300th of the card's width, so a card of any
// width is the same drawing: every length below is a number of design pixels, never a fixed pixel size.

/** The host: its size, its shadow and the colours of the look it has (the classic gold look unless a variant says otherwise). */
const HOST_CSS = `
:host {
  display: inline-block;
  width: 300px;
  aspect-ratio: 2.5/3.5;
  perspective: var(--fuda-perspective, 1000px);
  container-type: inline-size;
  /* A tight shadow where the card meets the table and a soft one under it. */
  filter: drop-shadow(0 1px 1px #0006) drop-shadow(0 12px 14px #0005);
  font-family: Georgia, serif;
  color: #27201b;
  /* The look: the frame and its line, the panel inside it and its line, the line round the picture, the rules between the texts, the card stock's edge. */
  --frame: linear-gradient(135deg, #fbdf87, #ab742c 35%, #ffe9a6 58%, #ae792d);
  --frame-line: #9c702d;
  --panel: linear-gradient(150deg, #f9edc8, #d6b477);
  --panel-line: #76512a;
  --art-line: #dcc18a;
  --rule: #9d8054;
  --edge-color: #e3c777;
  /* The foil: a rainbow in the frame that shifts with the light. A matte card has none. */
  --foil: linear-gradient(115deg, #ff5d8f44, #ffb35c44, #f5f06544, #5de8a044, #5db7ff44, #a67bff44, #ff5d8f44);
}
:host([finish=matte]) { --foil: none; }
:host([variant=sport]) {
  --frame: linear-gradient(135deg, #ebedef, #525e69, #fff, #47505d);
  --frame-line: #394c5b;
  --panel: linear-gradient(145deg, #eef1ee, #aebac1);
  --panel-line: #394c5b;
  --art-line: #a9b9c0;
  --rule: #6f7f89;
  --edge-color: #ece4d2;
}
:host([variant=cosmic]) {
  --frame: linear-gradient(130deg, #c9b4ff, #433b83, #dabdff, #503969);
  --frame-line: #584378;
  --panel: linear-gradient(145deg, #e6dafa, #a997cd);
  --panel-line: #584378;
  --art-line: #bba8e0;
  --rule: #7f6aa6;
  --edge-color: #ece4d2;
}
* { box-sizing: border-box; }
`;

/** The turn: the card about its centre or a corner, a turn the reader sets, and the flip. */
const TURN_CSS = `
.rotation {
  --u: calc(100cqw / 300);
  height: 100%;
  transform-style: preserve-3d;
  transform-origin: center center;
}
:host([card-spin="center"]) .rotation { animation: fuda-turn var(--fuda-card-spin-duration, 180s) linear infinite; }
:host([card-spin="corner"]) .rotation {
  transform-origin: 0 100%;
  transform: translate(50%, -50%);
  animation: fuda-corner-turn var(--fuda-card-spin-duration, 180s) linear infinite;
}
:host([card-spin-direction="reverse"]) .rotation { animation-direction: reverse; }
:host([card-spin-paused]) .rotation { animation-play-state: paused; }
@keyframes fuda-turn { to { transform: rotateY(360deg); } }
@keyframes fuda-corner-turn {
  from { transform: translate(50%, -50%) rotateY(0); }
  to { transform: translate(50%, -50%) rotateY(360deg); }
}
:host([card-view]) .rotation {
  animation: none;
  transform: rotateX(var(--fuda-tilt, 0deg)) rotateY(var(--fuda-yaw, 0deg));
}
:host([card-view][card-spin="corner"]) .rotation {
  transform: translate(50%, -50%) rotateX(var(--fuda-tilt, 0deg)) rotateY(var(--fuda-yaw, 0deg));
}
@media (prefers-reduced-motion: reduce) {
  :host([card-spin]) .rotation { animation: none; }
  :host .card { transition: none; }
  .art ::slotted(*) { transition: none; }
}
.card {
  /* The card's thickness and the pitch of one card in a stack, in pixels at this card's width (a card is 63 mm wide). */
  --t: calc(var(--mm, 0.325) * 100cqw / 63);
  --pitch: calc(var(--mm1, var(--mm, 0.325)) * 100cqw / 63);
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.65s;
}
:host([flipped]) .card { transform: rotateY(180deg); }
`;

/** The face a person reads: the frame, the panel, the texts and the rules. The cards under the top one of a stack are the same frame with nothing written on it. */
const FACE_CSS = `
.face {
  position: absolute;
  inset: 0;
  border-radius: calc(15 * var(--u));
  backface-visibility: hidden;
  overflow: hidden;
}
.front, .still {
  padding: calc(13 * var(--u));
  background-image: var(--foil), var(--frame);
  background-size: 220% 220%, auto;
  background-position: calc(var(--fuda-sheen-x, 30) * 1%) calc(var(--fuda-sheen-y, 30) * 1%), 0 0;
  border: calc(2 * var(--u)) solid var(--frame-line);
}
.front { transform: translateZ(calc(var(--t) / 2)); }
/* A filter on the host flattens a back-facing face near edge-on, and its glyphs paint through the back. The front is not drawn while the back is toward the reader. */
:host([data-back]) .front { display: none; }
.inner {
  height: 100%;
  padding: calc(12 * var(--u));
  background: var(--panel);
  border: calc(2 * var(--u)) solid var(--panel-line);
  box-shadow: inset 0 calc(1 * var(--u)) 0 #fff7, inset 0 calc(-2 * var(--u)) calc(6 * var(--u)) #4a2e0a26;
  display: flex;
  flex-direction: column;
  gap: calc(8 * var(--u));
}
.heading, .footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: calc(5 * var(--u));
}
.heading { font-weight: bold; font-size: calc(20 * var(--u)); }
.badge { font: 700 calc(10 * var(--u)) sans-serif; letter-spacing: 0.12em; }
.subtitle { text-align: center; font: italic calc(11 * var(--u)) Georgia; }
.description {
  border-top: calc(1 * var(--u)) solid var(--rule);
  padding-top: calc(9 * var(--u));
  font-size: calc(13 * var(--u));
  line-height: 1.35;
  flex: 1;
}
.footer {
  border-top: calc(1 * var(--u)) solid var(--rule);
  padding-top: calc(5 * var(--u));
  font: 700 calc(9 * var(--u)) sans-serif;
  letter-spacing: 0.08em;
}
`;

/** The picture and its Animate button. */
const ART_CSS = `
.art {
  position: relative;
  height: 53%;
  border: calc(5 * var(--u)) ridge var(--art-line);
  box-shadow: 0 calc(2 * var(--u)) calc(5 * var(--u)) #47301488, inset 0 0 calc(10 * var(--u)) #0006;
  background: radial-gradient(circle at 50% 35%, #7496a1, #273c4c);
  overflow: hidden;
}
.art ::slotted(*) {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  opacity: 0;
  transition: opacity 0.35s ease;
}
.art.ready ::slotted(*) { opacity: 1; }
:host([motion="pan"]) .art ::slotted(img) {
  object-fit: cover;
  object-position: var(--fuda-focus-x, 50%) var(--fuda-focus-y, 25%);
}
:host([motion="pan"][moving]) .art ::slotted(img) { animation: fuda-pan var(--fuda-pan-duration, 12s) ease-in-out infinite alternate; }
:host([motion="pan"][pan-loop="restart"]) .art ::slotted(img) { animation-direction: normal; }
:host([motion="pan"][pan-direction="up"]) .art ::slotted(img) { animation-direction: alternate-reverse; }
:host([motion="pan"][pan-direction="up"][pan-loop="restart"]) .art ::slotted(img) { animation-direction: reverse; }
@keyframes fuda-pan {
  from { object-position: 50% 0%; }
  to { object-position: 50% 100%; }
}
@media (prefers-reduced-motion: reduce) {
  :host([motion="pan"][moving]) .art ::slotted(img) { animation: none; }
  .motion-button { transition: none; }
}
.motion-button {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 1;
  width: 48px;
  height: 48px;
  padding: 0;
  border: 0;
  background: none;
  display: grid;
  place-items: center;
  cursor: pointer;
  opacity: 0.55;
  transition: opacity 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.motion-button:hover, .motion-button:focus-visible, .motion-button[aria-pressed=true] { opacity: 1; }
.motion-button:focus-visible { outline: none; }
.motion-button:focus-visible .glyph { outline: 3px solid white; outline-offset: 2px; }
.glyph {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #101827b3;
  border: 1px solid #fff5;
  color: white;
}
.glyph svg { width: 11px; height: 11px; fill: currentColor; }
.motion-button[aria-pressed=true] .play, .motion-button[aria-pressed=false] .pause { display: none; }
.motion-button[hidden] { display: none; }
`;

/**
 * The light on the card. A foil card catches a bright band and a rainbow that move across it as the light moves: the page says where the
 * light is with --fuda-sheen-x and --fuda-sheen-y (percentages, 50 is the middle) and the card follows the pointer over it; a card
 * that spins on its own sweeps the light across by itself. A matte card has no foil.
 */
const SHEEN_CSS = `
.shine {
  pointer-events: none;
  position: absolute;
  inset: 0;
  background-image: linear-gradient(115deg, transparent 38%, #ffffff30 45%, #ffffff66 50%, #ffffff30 55%, transparent 62%);
  background-size: 300% 300%;
  background-position: calc(var(--fuda-sheen-x, 30) * 1%) calc(var(--fuda-sheen-y, 30) * 1%);
}
:host([card-spin]) .shine { animation: fuda-sheen var(--fuda-card-spin-duration, 180s) linear infinite; }
:host([card-spin-direction="reverse"]) .shine { animation-direction: reverse; }
:host([card-spin-paused]) .shine { animation-play-state: paused; }
@keyframes fuda-sheen {
  from { background-position: 0% 30%; }
  to { background-position: 100% 70%; }
}
:host([card-spin]) :is(.front, .still) { animation: fuda-foil var(--fuda-card-spin-duration, 180s) linear infinite; }
:host([card-spin-direction="reverse"]) :is(.front, .still) { animation-direction: reverse; }
:host([card-spin-paused]) :is(.front, .still) { animation-play-state: paused; }
@keyframes fuda-foil {
  from { background-position: 0% 20%, 0 0; }
  to { background-position: 100% 80%, 0 0; }
}
:host([finish=matte]) .shine { display: none; }
/* The reader is holding the angle, so the foil stays where the light is instead of sweeping on its own. */
:host([card-view]) .shine, :host([card-view]) :is(.front, .still) { animation: none; }
@media (prefers-reduced-motion: reduce) {
  :host([card-spin]) .shine, :host([card-spin]) :is(.front, .still) { animation: none; }
}
`;

/** The back: the emblem on its ground, in the card stock's own frame. */
const BACK_CSS = `
.back {
  transform: rotateY(180deg) translateZ(calc(var(--t) / 2));
  background: radial-gradient(ellipse at center, #b78745 0 12%, #152d46 13% 27%, #386988 28% 31%, #10233b 32% 62%, #d2b074 63% 66%, #182c45 67%);
  border: calc(11 * var(--u)) solid #b39158;
  display: grid;
  place-items: center;
  color: #f7e9bf;
}
.emblem {
  width: calc(125 * var(--u));
  height: calc(125 * var(--u));
  border: calc(2 * var(--u)) solid #edd18c;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #17334a;
  box-shadow: 0 0 0 calc(7 * var(--u)) #967344, 0 0 calc(30 * var(--u)) #e6c98288;
  font: bold calc(23 * var(--u)) Georgia;
  letter-spacing: 0.12em;
}
`;

/**
 * The edge: the card stock seen from the side, a flat colour that darkens a little against each face (where the printed layers are), and
 * for a stack one hairline for each card. The colour is the material's (`--edge-color`) or the page's own background (`--fuda-edge`).
 */
const EDGE_CSS = `
.edge {
  --dir: 180deg;
  position: absolute;
  background: var(--fuda-edge, linear-gradient(var(--dir),
    color-mix(in srgb, var(--edge-color) 72%, #000),
    var(--edge-color) 28%,
    var(--edge-color) 72%,
    color-mix(in srgb, var(--edge-color) 72%, #000)));
}
.edge.side { --dir: 90deg; }
.stacked .edge {
  background:
    repeating-linear-gradient(var(--dir), transparent 0 calc(var(--pitch) * 0.7), #8886 calc(var(--pitch) * 0.7) var(--pitch)),
    var(--fuda-edge, linear-gradient(var(--dir), color-mix(in srgb, var(--edge-color) 72%, #000), var(--edge-color) 28%, var(--edge-color) 72%, color-mix(in srgb, var(--edge-color) 72%, #000)));
}
`;

/** The cards under the top one of a stack: the same frame as the top card, laid nudged and turned, each one a card's thickness lower. */
const STILL_CSS = `
.stills { display: contents; }
.still > .shine { border-radius: inherit; }
.still {
  position: absolute;
  inset: 0;
  border-radius: calc(15 * var(--u));
  pointer-events: none;
  transform: translate3d(calc(var(--x) * 100cqw), calc(var(--y) * 100cqw), calc(var(--t) / -2 + var(--pitch) * var(--k))) rotate(calc(var(--r) * 1deg));
}
`;

/** The stylesheet of the card's shadow root. */
export const CARD_CSS = [HOST_CSS, TURN_CSS, FACE_CSS, ART_CSS, SHEEN_CSS, BACK_CSS, EDGE_CSS, STILL_CSS].join("");
