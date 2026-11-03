import { CARD_CSS } from "./card-styles.js";

/** The corner radius of the card's face, in design pixels (a 300th of the card's width). */
const CORNER_RADIUS = 15;
/** The edge planes stop this far from the corner so that the rounded corner is not poked through (twice the corner radius). */
const EDGE_INSET = CORNER_RADIUS * 2;

/**
 * Each rounded corner is edged by two short planes that follow its curve, as the straight edges are by one: where they sit from the corner, how long
 * they are and how far they turn. They are tangents of the 15 pixel arc, one at 22.5 degrees and one at 67.5 degrees round it (length 2 r tan 22.5, at
 * r (1 - cos 22.5) and r (1 - sin 22.5) from the corner), not chords. A plane of the edge reaches across the whole card when it is extended, and the browser
 * cuts the faces it crosses along it, which left a thin diagonal line on the card (MODULES-142): a tangent of a convex card never crosses its face.
 */
const CORNER_PLANE = { near: 1.14, far: 9.26, length: 12.43, steep: 67.5, shallow: 22.5 };

const design = (pixels: number): string => `calc(${pixels} * var(--u))`;
const fromRight = (pixels: number): string => `calc(100% - ${design(pixels)})`;

interface Plane {
  left: string;
  top: string;
  width: string;
  height: string;
  transform: string;
  side?: boolean;
}

const plane = ({ left, top, width, height, transform, side }: Plane): string =>
  `<i class="edge${side ? " side" : ""}" style="left:${left};top:${top};width:${width};height:${height};transform:${transform}"></i>`;

const turned = (degrees: number): string => `translate(-50%,-50%) rotate(${degrees}deg) rotateX(90deg)`;

/** The planes that make the card's edge: four straight ones and eight that follow the corners. */
function edgePlanes(): string {
  const run = `calc(100% - ${design(EDGE_INSET)})`;
  const { near, far, length, steep, shallow } = CORNER_PLANE;
  const long = design(length);
  const corner = (left: string, top: string, degrees: number): string =>
    plane({ left, top, width: long, height: "var(--t)", transform: turned(degrees) });
  return [
    plane({ left: "50%", top: "0", width: run, height: "var(--t)", transform: turned(0) }),
    plane({ left: "50%", top: "100%", width: run, height: "var(--t)", transform: turned(0) }),
    plane({
      left: "0",
      top: "50%",
      width: "var(--t)",
      height: run,
      transform: "translate(-50%,-50%) rotateY(90deg)",
      side: true,
    }),
    plane({
      left: "100%",
      top: "50%",
      width: "var(--t)",
      height: run,
      transform: "translate(-50%,-50%) rotateY(90deg)",
      side: true,
    }),
    corner(design(near), design(far), -steep),
    corner(design(far), design(near), -shallow),
    corner(design(near), fromRight(far), steep),
    corner(design(far), fromRight(near), shallow),
    corner(fromRight(near), design(far), steep),
    corner(fromRight(far), design(near), shallow),
    corner(fromRight(near), fromRight(far), -steep),
    corner(fromRight(far), fromRight(near), -shallow),
  ].join("");
}

/** The picture's slot and its Animate button. */
const ART = `<div class="art"><slot></slot><button class="motion-button" type="button" aria-pressed="false" aria-label="Animate the picture" title="Animate" hidden><span class="glyph"><svg viewBox="0 0 12 12" aria-hidden="true"><path class="play" d="M3 1.5v9l7.5-4.5z"/><path class="pause" d="M2.5 1.5h2.8v9H2.5zM6.7 1.5h2.8v9H6.7z"/></svg></span></button></div>`;

const FRONT = `<div class="face front"><div class="inner"><div class="heading"><span id="title"></span><span class="badge" id="category"></span></div>${ART}<div class="subtitle" id="subtitle"></div><div class="description" id="description"></div><div class="footer"><span id="number"></span><span>✦ FUDA COLLECTION</span><span id="rarity"></span></div></div><div class="shine"></div></div>`;
const BACK = `<div class="face back"><div class="emblem">FUDA</div><div class="shine"></div></div>`;

/** The card's shadow root: its stylesheet, the front, the back, the edge and the place for the cards under the top one. */
export function cardMarkup(): string {
  return `<style>${CARD_CSS}</style><div class="rotation"><div class="card">${FRONT}${BACK}${edgePlanes()}<div class="stills"></div></div></div>`;
}
