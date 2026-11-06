# @johnmorrisdotca/fuda-cards API reference

Every export of @johnmorrisdotca/fuda-cards 0.11.0, one section for each entry point, written by `pnpm docs:api` from the built declarations. Do not edit it by hand: `pnpm docs:check` fails when it is out of date. The guides are in [docs/guides](guides/getting-started.md).

## `@johnmorrisdotca/fuda-cards`

17 values and 15 types.

```js
import { cardAttributes, cardFinishes, cardMaterial, cardMaterials, cardVariants, DEFAULT_CARD_THICKNESS_MM, mmPerPoint, stackHeightMm, stackLayout, stackPresets, VERSION, wearLayout, wearLevels, wearOutline, wearOverlaySvg, wearPreset, wearPresets } from '@johnmorrisdotca/fuda-cards';
```

### cardAttributes

*function*. The attributes of a `<fuda-card>` for these options, ready to set one by one (`element.setAttribute(name, value)`): names are the

```ts
function cardAttributes(options: CardOptions): Record<string, string>;
```

### cardFinishes

*constant*. The two finishes, foil and matte.

```ts
const cardFinishes: readonly CardFinish[];
```

### cardMaterial

*function*. The material with this id.

```ts
function cardMaterial(id: string | null | undefined): CardMaterial | undefined;
```

### cardMaterials

*constant*. Every material the package knows, each with a thickness and the page it was read from. `docs/materials.md` lists them with their sources.

```ts
const cardMaterials: readonly CardMaterial[];
```

### cardVariants

*constant*. The three looks, in the order the studio offers them.

```ts
const cardVariants: readonly CardVariant[];
```

### DEFAULT_CARD_THICKNESS_MM

*constant*. The thickness of a card that names no material or thickness: a playing card's black-core stock, 13 pt, 0.325 mm

```ts
const DEFAULT_CARD_THICKNESS_MM = 0.325;
```

### mmPerPoint

*constant*. One thousandth of an inch ("pt" in card and paper trade talk) in millimetres, 0.0254: a 13 pt card is 13 × 0.0254 mm.

```ts
const mmPerPoint = 0.0254;
```

### stackHeightMm

*function*. The height of a stack of cards, in millimetres: the count times the thickness of one, to a thousandth of a millimetre.

```ts
function stackHeightMm(count: number, thicknessMm: number): number;
```

### stackLayout

*function*. Where the cards of a stack lie, from neat to messy, the same every time for the same seed: the cards under the top one, bottom first, at most

```ts
function stackLayout(count: number, options?: StackLayoutOptions): StackPlace[];
```

### stackPresets

*constant*. The usual sizes of a stack of cards, each with where the number comes from.

```ts
const stackPresets: readonly StackPreset[];
```

### VERSION

*constant*. The version of this package, the same as `package.json`'s (a test holds the two together).

```ts
const VERSION = "0.10.1";
```

### wearLayout

*function*. Where every mark of a card lies. A pure function of the levels and the seed: no DOM, nothing at random, so the same seed lays the same marks every time.

```ts
function wearLayout(levels: WearLevels, seed?: number): WearFeatures;
```

### wearLevels

*function*. The levels a card's wear asks for: the grade's or the number's, with any level named on its own laid over them.

```ts
function wearLevels(options: WearOptions): WearLevels | null;
```

### wearOutline

*function*. The outline of a face as an SVG path in the 250 by 350 box, corners as worn.

```ts
function wearOutline(features: WearFeatures, face?: "front" | "back"): string;
```

### wearOverlaySvg

*function*. The SVG laid over one face: whitening, folds, creases, scratches, specks, stain and toning. Markup only, no script.

```ts
function wearOverlaySvg(features: WearFeatures, face?: "front" | "back"): string;
```

### wearPreset

*function*. The grade with this id.

```ts
function wearPreset(id: string | null | undefined): WearPreset | undefined;
```

### wearPresets

*constant*. The seven grades, from perfect to damaged. The names are the plain grading terms; the numbers are this package's reading of them (docs/wear.md).

```ts
const wearPresets: readonly WearPreset[];
```

### CardFinish

*type*. A card's finish: foil catches the light and shows a rainbow in its frame, matte does not.

```ts
type CardFinish = "foil" | "matte";
```

### CardMaterial

*interface*. A card material: a stock or a metal with a thickness read from a maker or a standard, and the colour its edge is drawn in.

```ts
interface CardMaterial {
    id: string;
    name: string;
    group: CardMaterialGroup;
    /** Thickness of one card in millimetres. */
    thicknessMm: number;
    /** The colour of the card's edge (a look, not a measurement). */
    edge: string;
    source: CardMaterialSource;
}
```

### CardMaterialGroup

*type*. The kind of stock a material is: plain paper card, plastic, a thick trading-card stock or metal.

```ts
type CardMaterialGroup = "paper" | "plastic" | "thick-card" | "metal";
```

### CardMaterialSource

*interface*. Where a number was read: the maker's or the standard's page, and what it says there.

```ts
interface CardMaterialSource {
    label: string;
    url: string;
    /** What the source says, in short. */
    says: string;
}
```

### CardOptions

*interface*. Every setting of `<fuda-card>` as an object. `cardAttributes(options)` turns it into the element's attributes, so the same object

```ts
interface CardOptions {
    title?: string;
    category?: string;
    subtitle?: string;
    description?: string;
    number?: string;
    rarity?: string;
    variant?: CardVariant;
    finish?: CardFinish;
    /** Card thickness in millimetres at the 63 mm wide card size; overrides the material's. Default 0.325, 0 for a flat card. */
    thickness?: number;
    /** A material's id (see `cardMaterials`): its sourced thickness and edge colour. */
    material?: string;
    /** How many cards the stack holds (1 to 1000); the stack is that many times the card's thickness high. Default 1, one card. */
    stack?: number;
    /** From 0 (squared up) to 1 (very messy) for the cards under the top one. Default 0.3. */
    stackMessiness?: number;
    /** The stack's seed: the same seed lays the same stack the same way. Default 1. */
    stackSeed?: number;
    /** How many cards under the top one are laid out nudged and turned, at most 52. Default 10. */
    stackDepth?: number;
    /** A card that is not perfect: a preset's id (`mint`, `near-mint`, `lightly-played`, `moderately-played`, `heavily-played`, `damaged`) or a number from 0 to 1. Default: perfect, nothing drawn. */
    wear?: string | number;
    /** The wear's seed: the same seed draws the same marks the same way. Default 1. */
    wearSeed?: number;
    /** One level of the wear on its own, from 0 to 1, over the preset's. */
    wearCorners?: number;
    wearEdges?: number;
    wearSurface?: number;
    wearCreases?: number;
    /** The card shows its back. */
    flipped?: boolean;
    motion?: "still" | "pan";
    /** The picture is moving now (needs `motion: "pan"`). */
    playing?: boolean;
    /** `focus`: the card in focus animates its art (needs `motion: 'pan'`); never with reduced motion. */
    autoplay?: "focus";
    panDirection?: "down" | "up";
    panLoop?: "alternate" | "restart";
    cardSpin?: "center" | "corner";
    cardSpinDirection?: "normal" | "reverse";
    cardSpinPaused?: boolean;
    /** The page turns the card with `--fuda-yaw` and `--fuda-tilt` instead of the built-in spin. */
    cardView?: boolean;
    /** `open`: a stack of more than one card fans open. */
    fan?: "open";
    /** How many cards are on the pile beside the stack. */
    takenOff?: number;
    /** How a card taken off lands: `face-up` or turned over (`face-down`). */
    deckLand?: "face-up" | "face-down";
    /** `off` ends every move at once. */
    animate?: "on" | "off";
    /** How long a move takes: `slow`, `normal` or `quick`. */
    speed?: "slow" | "normal" | "quick";
    /** The three buttons under a stack: Fan, Take a card off and Put it back. */
    pileControls?: boolean;
}
```

### CardVariant

*type*. A card's look: classic gold, silver sport or cosmic violet.

```ts
type CardVariant = "classic" | "sport" | "cosmic";
```

### CornerKind

*type*. How a corner is worn: sharp, softened, rounded, chipped or folded.

```ts
type CornerKind = "sharp" | "soft" | "rounded" | "chipped" | "dog-eared";
```

### StackLayoutOptions

*interface*. How a stack is laid out: how messy, from which seed and how many cards deep.

```ts
interface StackLayoutOptions {
    /** From 0 (squared up) to 1 (very messy). Unless said, 0.3. */
    messiness?: number;
    /** The stack's own seed: the same seed lays the same stack the same way. Unless said, 1. */
    seed?: number;
    /** How many cards under the top one are laid out at most, so a stack of 52 costs no more than one of 11. Unless said, 10. */
    depth?: number;
}
```

### StackPlace

*interface*. Where one card of a stack lies, as the stack's layout says: how far it is nudged across and down, in card widths, and how far it is turned.

```ts
interface StackPlace {
    /** Across, in card widths from where a square card lies. */
    x: number;
    /** Down, in card widths. */
    y: number;
    /** Turn in degrees. */
    rotate: number;
}
```

### StackPreset

*interface*. A count of cards for a stack, with where the number comes from: a deck of 52, a Pokémon deck of 60, a booster pack of about 10.

```ts
interface StackPreset {
    id: string;
    name: string;
    count: number;
    source: CardMaterialSource;
}
```

### WearCorner

*interface*. One corner of a worn card: how it is worn and how far the damage reaches.

```ts
interface WearCorner {
    kind: CornerKind;
    /** How far the damage reaches along each edge, in units of a 250 by 350 card. */
    size: number;
    /** Jagged points of a chip, in the corner's own frame. */
    jag: number[];
}
```

### WearFeatures

*interface*. Every mark of a worn card: its corners, its centring, and the creases, scratches, specks and stain of each face.

```ts
interface WearFeatures {
    levels: WearLevels;
    /** Top left, top right, bottom right, bottom left of the front. */
    corners: WearCorner[];
    /** The print's shift off centre in pixels at 300 wide: x and y. */
    centering: {
        x: number;
        y: number;
    };
    front: WearFace;
    back: WearFace;
}
```

### WearLevels

*interface*. How much of each kind of wear, from 0 (none) to 1 (the worst the preset names).

```ts
interface WearLevels {
    corners: number;
    edges: number;
    surface: number;
    creases: number;
    /** Yellowing and darkened borders with age. */
    toning: number;
    /** How far the print sits off centre. */
    centering: number;
}
```

### WearOptions

*interface*. What a card asks of its wear: a grade or a number, a seed, and any level on its own.

```ts
interface WearOptions {
    /** A preset's id, or a number from 0 to 1 for all the levels at once. */
    wear?: string | number | null;
    /** The seed: the same seed lays the same marks the same way. Unless said, 1. */
    seed?: number;
    /** Overrides of one level each, from 0 to 1. */
    corners?: number;
    edges?: number;
    surface?: number;
    creases?: number;
}
```

### WearPreset

*interface*. A grading term with the levels it stands for and what it means in a few words.

```ts
interface WearPreset {
    id: string;
    name: string;
    levels: WearLevels;
    /** What the condition term means in grading language, in a few words. */
    says: string;
}
```

## `@johnmorrisdotca/fuda-cards/element`

1 value and 0 types.

```js
import { FudaCard } from '@johnmorrisdotca/fuda-cards/element';
```

### FudaCard

*class*. `<fuda-card>`: a collectible card frame around a picture you give it (or a live 3D view), drawn with a true thickness, an edge, a back, foil or matte,

```ts
class FudaCard extends HTMLElement {
    static observedAttributes: string[];
    private focused;
    private hushed;
    private focusedAtPress?;
    constructor();
    /** The light follows the pointer over the card: a foil card shows its sheen where the pointer is (see `--fuda-sheen-x` and `--fuda-sheen-y`). */
    private watchLight;
    /** With `autoplay="focus"` the card in focus animates its art; leaving it (pointer, keyboard or a tap elsewhere) stops it. */
    private watchFocus;
    /** Put this card in focus (or out of it); the card that had focus is put out, so only one is ever in focus. */
    setFocused(on: boolean): void;
    /** True while the art moves: `playing` is set, or the card is in focus with `autoplay="focus"` and the person has not paused it. Never autoplays with reduced motion. */
    get isMoving(): boolean;
    private toggleMotion;
    /** The art stays invisible until the card has a size on screen and every slotted image has loaded, so it never shows outside the frame. */
    private watchArt;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string): void;
    /** Millimetres thick: the `thickness` attribute, else the `material`'s, else the playing-card stock's 0.325 (`DEFAULT_CARD_THICKNESS_MM`). */
    get cardThicknessMm(): number;
    /** How many cards the stack holds: the `stack` attribute as a whole number from 1 (one card) to 1000. */
    get stackCount(): number;
    /** Height of the stack in millimetres: the count times a card's thickness. */
    get stackHeight(): number;
    /** How many cards are still in the stack: `stack` less the `taken-off` ones (at least one stays). */
    get heldCount(): number;
    /** True while the stack is fanned open (`fan="open"`, with more than one card). */
    get fanOpen(): boolean;
    /** How far the pile reaches beyond the card's own box, in card widths: an open fan and the pile of cards taken off. It is zero until a pile feature is used. Pages use it to fit the view; `fuda-pile` is sent when it changes. */
    pileBounds: {
        left: number;
        right: number;
        top: number;
        bottom: number;
    };
    /** Take the top card (or `count` cards) off the stack: it flies to a pile at the stack's side and lands as `deck-land` says. At least one card stays. */
    takeOff(count?: number): void;
    /** Bring the card (or `count` cards) back from the pile onto the stack. */
    putBack(count?: number): void;
    pileUsed: boolean;
    private pileModule?;
    /** Fanning, the pile of cards taken off and the controls are drawn by a module that is loaded only when a stack asks for them; a card without them never loads it. */
    private applyPile;
    private wearKey;
    private wearToken;
    private wearModule?;
    /** Wear (an imperfect card) is drawn by a module that is loaded only when a card asks for it; a perfect card never loads it. */
    private applyWear;
    /** The wear the card is drawn with: a preset's id, a number, or an empty string when it is perfect. */
    get wear(): string;
    set wear(value: string);
    private stillsKey;
    /** The cards under the top one that are laid out nudged and turned; the rest of the stack is one block with a line for each card on its edge. */
    private drawStills;
    render(): void;
}
```

## `@johnmorrisdotca/fuda-cards/element/define`

0 values and 0 types.

```js
import { /* types only */ } from '@johnmorrisdotca/fuda-cards/element/define';
```

## `@johnmorrisdotca/fuda-cards/live-3d`

1 value and 5 types.

```js
import { createLiveCards } from '@johnmorrisdotca/fuda-cards/live-3d';
```

### createLiveCards

*function*. Make the live cards of a page. Nothing 3D is loaded until a card is first in focus (or a card with no picture of its own comes near the view and needs its still made).

```ts
function createLiveCards<T extends ThreeLike = ThreeLike>(options: LiveCardsOptions<T>): LiveCards<T>;
```

### AddOptions

*interface*. What a card brings when it is added: the picture it already has.

```ts
interface AddOptions {
    /** A picture the card already has (an `<img>` of its own), kept until the card is in focus. With one, the card costs no 3D code until then. */
    still?: HTMLImageElement;
}
```

### LiveCards

*interface*. The live cards of a page: add a card, put one in focus, let go. Only the card in focus turns in 3D, on the page's one WebGL context; the others stay pictures.

```ts
interface LiveCards<T extends ThreeLike = ThreeLike> {
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
```

### LiveCardsOptions

*interface*. How the live cards behave: the shared renderer's options (kazoku-ui's), and how long a turn takes, how long the pointer rests before a card goes live and how far ahead a still is made.

```ts
interface LiveCardsOptions<T extends ThreeLike = ThreeLike> extends Omit<SharedRendererOptions<T>, "scheduler" | "assets" | "clock" | "document"> {
    /** Seconds for one turn of the card in focus (12). 0 does not turn it. */
    turnSeconds?: number;
    /** How long the pointer has to rest on a card before it goes live, in milliseconds (150), so moving the pointer across a page of cards starts nothing. A press or the keyboard does not wait. */
    dwellMs?: number;
    /** How far outside the view a card with no picture of its own gets its still made, in pixels (300). */
    lookAheadPx?: number;
}
```

### LiveItem

*interface*. What a card shows in 3D: a key (items with the same key share their pictures) and a scene made from shared assets (`assets.acquire`).

```ts
interface LiveItem<T extends ThreeLike = ThreeLike> {
    key: string;
    build(context: BuildContext<T>): LiveScene | Promise<LiveScene>;
}
```

### LiveScene

*interface*. A scene for a card: kazoku-ui's scene, with `object`, the thing that turns about its upright axis while the card is in focus.

```ts
interface LiveScene extends Scene3D {
    object?: {
        rotation: {
            y: number;
        };
    };
}
```

## `@johnmorrisdotca/fuda-cards/collection`

10 values and 6 types.

```js
import { collectionKinds, collectionViewAliases, collectionViews, deckLandings, fanLayout, isCard, movePage, normalizeLanding, parseCollection, randomDrawIndex } from '@johnmorrisdotca/fuda-cards/collection';
```

### collectionKinds

*constant*. The two kinds of item, `card` and `object`.

```ts
const collectionKinds: ReadonlyArray<CollectionKind>;
```

### collectionViewAliases

*constant*. Display names that earlier versions accepted and that now open another display, so a page that sets them keeps working.

```ts
const collectionViewAliases: Readonly<Record<string, CollectionView>>;
```

### collectionViews

*constant*. The ten displays, in the order the buttons show them, each with the label on its button. `jukebox` and `tower` were two more names for the deck's pile of cards (no real counterpart for cards, and the same drawing), so they are no longer offered; see {@link collectionViewAliases}.

```ts
const collectionViews: ReadonlyArray<{
    id: CollectionView;
    label: string;
}>;
```

### deckLandings

*constant*. The two ways a card can land, with the label on each button: `face-up` (still facing up) and `face-down` (turned over sideways on the way).

```ts
const deckLandings: ReadonlyArray<{
    id: "face-up" | "face-down";
    label: string;
}>;
```

### fanLayout

*function*. Where the cards of a fan lie: each card turns eleven degrees more than the one before, up to 110 degrees from the first to the last, centred on the pile.

```ts
function fanLayout(count: number, seed?: number, step?: number): FanPlace[];
```

### isCard

*constant*. Whether an item is a card: anything that does not say it is an object. Only a card turns, has a back and lands turned over.

```ts
const isCard: (card: Pick<CollectionCard, "kind">) => boolean;
```

### movePage

*function*. The first card of the page that is `delta` pages away, wrapping round at either end.

```ts
function movePage(index: number, length: number, pageSize: number, delta: number): number;
```

### normalizeLanding

*function*. The landing a value means: `face-down` (also `upside-down` and `turned-over`) is turned over; anything else is still facing up.

```ts
function normalizeLanding(value: string | null | undefined): "face-up" | "face-down";
```

### parseCollection

*function*. Check a collection and make it the shape the element draws: an array of cards, or an object with a `cards` array. A card without an id is numbered by its place.

```ts
function parseCollection(input: unknown): CollectionCard[];
```

### randomDrawIndex

*function*. Choose a card whose name contains the filter, avoiding the current card when another match exists.

```ts
function randomDrawIndex(cards: CollectionCard[], current: number, filter: string, random?: () => number): number | null;
```

### CollectionCard

*interface*. One item of a collection: an id, a name, the front's picture, optionally the back's, its kind and its metadata.

```ts
interface CollectionCard {
    id: string;
    name: string;
    image: string;
    backImage?: string;
    kind?: CollectionKind;
    metadata?: CollectionMetadata;
}
```

### CollectionKind

*type*. What an item is. A `card` (the default, so every collection written before this field existed is still cards) is a flat, thin card with a back: it

```ts
type CollectionKind = "card" | "object";
```

### CollectionMetadata

*interface*. What a collector writes about a card: its set, year, number, edition, condition, grade, quantity and notes. All optional; `year` and `quantity` are whole numbers.

```ts
interface CollectionMetadata {
    set?: string;
    year?: number;
    number?: string;
    edition?: string;
    condition?: string;
    grade?: string;
    quantity?: number;
    notes?: string;
}
```

### CollectionView

*type*. The name of a display of `<fuda-collection>`: the `view` attribute's values. `jukebox` and `tower` are older names that open the deck (see

```ts
type CollectionView = "deck" | "rolodex" | "binder" | "case" | "jukebox" | "random" | "story" | "wall" | "tower" | "spotlight" | "atlas" | "fan";
```

### DeckLanding

*type*. How a card taken off a pile lands on the pile at its side: still facing up, or turned over sideways (as a person turns a card, like a

```ts
type DeckLanding = "face-up" | "face-down" | "upside-down";
```

### FanPlace

*interface*. Where one card of a fan lies, first card on the left when open and on top when closed. `angle`, `x` and `y` are the open fan, spread like a hand

```ts
interface FanPlace {
    angle: number;
    x: number;
    y: number;
    closedAngle: number;
    closedX: number;
    closedY: number;
}
```

## `@johnmorrisdotca/fuda-cards/collection-element`

1 value and 1 type.

```js
import { FudaCollection } from '@johnmorrisdotca/fuda-cards/collection-element';
```

### FudaCollection

*class*. `<fuda-collection>`: a whole collection in one of ten displays (a deck, a rolodex, binder pages, a display case, a random draw, a story scroll, a gallery wall,

```ts
class FudaCollection extends HTMLElement {
    private liveSetup;
    private liveOff;
    static get observedAttributes(): string[];
    set cards(value: CollectionCard[]);
    get cards(): CollectionCard[];
    /** Live 3D: the card in focus turns in 3D on the page's one WebGL context, and every other card stays its picture. Nothing 3D loads until a card is focused. */
    set live(value: CollectionLive | null);
    get live(): CollectionLive | null;
    /** The cards are drawn again on every move, so their live views are made again too: the pictures stay in the shared cache. */
    private attachLive;
    /** The card on top of the deck, or the first card of the page or fan (counting from 0). */
    get position(): number;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string): void;
    /** The first card of an opening of the binder: the right-hand page's first card, or the left-hand page's when the right-hand page is past the end. */
    private spreadFirst;
    /** `fan` changed: when a pile is on screen, move its cards to or from the fan in place (animated) and fit the view to it. Returns false when there is no pile to move. */
    private setFan;
}
```

### CollectionLive

*interface*. Live 3D in a collection's cards: the shared cards from `createLiveCards` and the 3D item of a card, if it has one. See docs/live-3d.md.

```ts
interface CollectionLive {
    cards: LiveCards<never>;
    item(card: CollectionCard): LiveItem<never> | undefined;
}
```
