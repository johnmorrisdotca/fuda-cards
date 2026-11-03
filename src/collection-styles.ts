import { BINDER_CSS } from "./binder.js";
import { CHOICE_CSS, CHOICE_VARS } from "./choice.js";

// The collection's stylesheet, one rule to a line (or one declaration to a line), in the order it cascades: the shell and its
// buttons, the row of display choices, the stage and the flat displays, the deck's piles and fan, then the dialog and the small screens.

/** The shell, the navigation row, the option rows and the buttons, in both colour themes. */
const SHELL_CSS = `
:host {
  display: block;
  ${CHOICE_VARS.dark};
  color: var(--fc-text);
  font: 16px system-ui;
}
@media (prefers-color-scheme:light) {
  :host(:not([theme="dark"])) { ${CHOICE_VARS.light}; }
}
:host([theme="light"]) { ${CHOICE_VARS.light}; }
:host([theme="dark"]) { ${CHOICE_VARS.dark}; }
* { box-sizing: border-box; }
.shell {
  background: var(--fc-surface);
  padding: 1rem;
  border-radius: 1rem;
  display: grid;
  gap: .9rem;
}
.nav {
  display: flex;
  gap: .6rem;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}
.opts {
  display: grid;
  grid-template-columns: repeat(auto-fit,minmax(min(100%,13.5rem),1fr));
  gap: .9rem;
}
.opts:not(:has(.choice:not([hidden]))) { display: none; }
.opts .choice { --choice-min: 4.6rem; }
button, input {
  font: inherit;
  color: inherit;
}
.nav button, dialog button {
  min-height: 48px;
  min-width: 48px;
  background: var(--fc-btn);
  border: 2px solid var(--fc-btn-border);
  border-radius: .7rem;
  padding: .5rem 1rem;
  cursor: pointer;
}
.nav button:disabled {
  opacity: .45;
  cursor: default;
}
.nav input {
  min-height: 48px;
  background: var(--fc-btn);
  border: 2px solid var(--fc-btn-border);
  border-radius: .7rem;
  padding: .5rem .8rem;
}
button:focus-visible, input:focus-visible, .card:focus-visible {
  outline: 3px solid var(--fc-focus);
  outline-offset: 3px;
}
`;
/** The row of display tiles: three across on a phone, four from 340 px, six from 800 px. */
const PICKER_CSS = `
.displays .choice-list { grid-template-columns: repeat(3,minmax(0,1fr)); }
@media (min-width:340px) {
  .displays .choice-list { grid-template-columns: repeat(4,minmax(0,1fr)); }
  .displays .choice-list button {
    min-height: 50px;
    padding: .3rem .25rem;
    font-size: .7rem;
  }
  .displays .choice-list svg {
    width: 28px;
    height: 18px;
  }
}
@media (min-width:800px) {
  .displays .choice-list { grid-template-columns: repeat(6,minmax(0,1fr)); }
  .displays .choice-list button {
    min-height: 56px;
    padding: .45rem .7rem;
    font-size: .8rem;
  }
  .displays .choice-list svg {
    width: 34px;
    height: 22px;
  }
}
`;
/** The stage and the flat displays: the grid, the case, the wall, the story, the atlas and the spotlight. */
const DISPLAYS_CSS = `
.stage {
  position: relative;
  height: var(--fuda-stage-height,clamp(300px,calc(100svh - 440px),620px));
  overflow: hidden;
  border-radius: 1rem;
  background: radial-gradient(ellipse,var(--fc-stage-1),var(--fc-stage-2) 68%);
}
.stage:focus-visible {
  outline: 3px solid var(--fc-focus);
  outline-offset: 2px;
}
.v {
  position: absolute;
  inset: 0;
}
kazoku-view-controls { display: block; }
.card {
  padding: 0;
  border: 0;
  background: transparent;
  line-height: 0;
}
.card img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 5%;
  box-shadow: 0 6px 16px #0009;
}
.stack .card {
  position: absolute;
  width: min(64vw,300px);
  height: 86%;
  top: 7%;
  left: 50%;
  transition: transform .25s;
}
.grid {
  display: grid;
  grid-template-columns: repeat(var(--columns,3),minmax(0,1fr));
  gap: 1rem;
  padding: 1rem;
  align-content: start;
}
.grid .card { height: clamp(130px,24vw,220px); }
.v.case { perspective: 800px; }
.stage.case {
  background: linear-gradient(#4a3f33,#1d1914);
  border: 10px solid #6b5436;
  box-shadow: inset 0 0 26px #000a;
}
.stage.case::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  background: linear-gradient(115deg,#ffffff30 0,#ffffff00 28%,#ffffff12 55%,#ffffff00 78%,#ffffff22 100%);
}
.case .card {
  transform: perspective(600px) rotateX(-15deg);
  box-shadow: 0 12px 0 -3px #2c251d,0 18px 8px -4px #000a;
}
.case .card img { box-shadow: 0 4px 10px #0009; }
.wall {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
}
.wall .card {
  height: 90%;
  flex: 0 0 190px;
}
.story {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}
.story .card {
  width: min(75%,300px);
  flex: 0 0 90%;
  min-height: 0;
}
.plane {
  position: absolute;
  left: 0;
  top: 0;
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(var(--atlas-cols,5),140px);
  padding: 30px;
}
.plane .card { height: 195px; }
.stage.spotlight { background: radial-gradient(ellipse at center,#e5ce99,#454054 40%,#171822 78%); }
`;
/** The deck: its piles, the fan, the faces of a card and the card back. */
const DECK_CSS = `
.stage:is(.deck, .random, .fan) { perspective: 1800px; }
.v.deck {
  --w: 200px;
  --gap: 56px;
  --fl: 0;
  --fr: 0;
  --ft: 0;
  --fb: 0;
  --ease: cubic-bezier(.2,.8,.2,1);
  transform-style: preserve-3d;
}
.v.deck .pile, .v.deck .slot {
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--w);
  aspect-ratio: 2.5/3.5;
  margin: calc(var(--w) * -.7) 0 0 calc(var(--w) * -.5);
  transform-style: preserve-3d;
}
.slot {
  border: 2px dashed var(--fc-btn-border);
  border-radius: 5%;
  opacity: .55;
}
.v.deck .deck-pile { translate: calc(((var(--fl) - var(--fr) - 1) * var(--w) - var(--gap)) / 2) 0; }
.v.deck .discard-pile, .v.deck .slot { translate: calc(((var(--fl) + var(--fr) + 1) * var(--w) + var(--gap)) / 2) 0; }
.v.deck.fanonly .deck-pile { translate: calc((var(--fl) - var(--fr)) * var(--w) / 2) 0; }
.v.deck .deck-pile, .v.deck .discard-pile, .v.deck .slot { transition: translate var(--t,0s) var(--ease); }
.extent {
  position: absolute;
  left: 50%;
  top: 50%;
  width: calc((var(--fl) + var(--fr) + 2) * var(--w) + var(--gap));
  height: calc((1.4 + var(--ft) + var(--fb)) * var(--w));
  translate: -50% calc(-50% + (var(--fb) - var(--ft)) * var(--w) / 2);
  visibility: hidden;
  pointer-events: none;
}
.fanonly .extent { width: calc((var(--fl) + var(--fr) + 1) * var(--w)); }
.pile .card {
  position: absolute;
  inset: 0;
  display: block;
  transform-style: preserve-3d;
  transform-origin: 50% 50%;
  transform: translate3d(calc(var(--x,0) * var(--w)),calc(var(--y,0) * var(--w)),calc(var(--k,0) * .9px)) rotate(calc(var(--r,0) * 1deg));
  transition: transform var(--t,0s) var(--ease),transform-origin var(--t,0s) var(--ease);
  transition-delay: calc(var(--j,0) * var(--stag,22ms));
}
.pile .card:not(.top) { pointer-events: none; }
.pile .card.top { cursor: pointer; }
.fan-open .deck-pile .card {
  transform-origin: 50% 165%;
  transform: translate3d(calc(var(--fx,0) * var(--w)),0,calc(var(--k,0) * .9px)) rotate(calc(var(--fa,0) * 1deg));
  transition-delay: calc(var(--i,0) * var(--stag,28ms));
  pointer-events: auto;
  cursor: pointer;
}
.fan-open .deck-pile .card:hover, .fan-open .deck-pile .card:focus-visible { translate: 0 -14px; }
.fly, .turn {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
}
.face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 5%;
  overflow: hidden;
}
.face img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 3%;
  box-shadow: 0 4px 10px #0008;
}
.face.back { transform: rotateY(180deg); }
.generic-back {
  display: grid;
  place-items: center;
  background: radial-gradient(ellipse at center,#b78745 0 12%,#152d46 13% 27%,#386988 28% 31%,#10233b 32% 62%,#d2b074 63% 66%,#182c45 67%);
  border: 6px solid #b39158;
  color: #f7e9bf;
  font: bold 18px Georgia;
  letter-spacing: .12em;
  box-shadow: 0 4px 10px #0008;
}
.pile.discard[data-land=face-down] .card:not(.flat) .turn { transform: rotateY(180deg); }
.card.flat .turn { transform: rotateY(calc(var(--fuda-yaw,0) * -1deg)) rotateX(calc(var(--fuda-tilt,0) * -1deg)); }
.ghost { pointer-events: none; }
`;
/** The card detail dialog, the empty state and the small-screen and reduced-motion rules. */
const DIALOG_CSS = `
dialog {
  color: var(--fc-text);
  background: var(--fc-dialog);
  border: 1px solid var(--fc-btn-border);
  border-radius: 1rem;
  text-align: center;
  max-width: 95vw;
  max-height: 95vh;
}
dialog::backdrop { background: #000c; }
.detail {
  display: block;
  height: min(70vh,600px);
  max-width: 80vw;
  object-fit: contain;
  margin: 1rem auto;
}
.empty {
  text-align: center;
  padding: 3rem;
}
@media (max-width:600px) {
  .stage { height: var(--fuda-stage-height,clamp(220px,calc(100svh - 570px),620px)); }
}
@media (max-width:500px) {
  .opts { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .opts .speed { grid-column: 1/-1; }
  .v.deck { --gap: 28px; }
  .grid { grid-template-columns: repeat(min(2,var(--columns,3)),minmax(0,1fr)); }
  .shell { padding: .7rem; }
  .v.deck { --w: 150px; }
}
@media (prefers-reduced-motion:reduce) {
  * { transition: none!important; }
}
`;

/** The stylesheet of \`<fuda-collection>\`'s shadow root. */
export const COLLECTION_CSS = [SHELL_CSS, CHOICE_CSS, BINDER_CSS, PICKER_CSS, DISPLAYS_CSS, DECK_CSS, DIALOG_CSS].join(
  "\n",
);

/** The markup of the shell that the element draws once; the display and the options are filled in by the element. */
export const COLLECTION_SHELL = `<section class="shell"><div class="displays"></div><div class="stage" tabindex="0" role="group" aria-label="Collection"><div class="v"></div></div><div class="nav"><button class="prev">← Previous</button><span class="count" aria-live="polite"></span><button class="next">Next →</button><label class="draw-filter" hidden>Filter cards <input type="search" aria-label="Filter cards for random draw"></label><button class="draw" hidden>Draw a card</button></div><div class="opts"></div><dialog aria-label="Card detail"></dialog></section>`;
