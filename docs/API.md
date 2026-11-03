# @johnmorrisdotca/fuda-cards API reference

Every export of @johnmorrisdotca/fuda-cards 0.10.0, one section for each entry point, written by `pnpm docs:api` from the built declarations. Do not edit it by hand: `pnpm docs:check` fails when it is out of date. The guides are in [docs/guides](guides/getting-started.md).

## `@johnmorrisdotca/fuda-cards`

14 values and 15 types.

```js
import { cardFinishes, cardMaterial, cardMaterials, cardVariants, mmPerPoint, stackHeightMm, stackLayout, stackPresets, wearLayout, wearLevels, wearOutline, wearOverlaySvg, wearPreset, wearPresets } from '@johnmorrisdotca/fuda-cards';
```

### cardFinishes

*constant*

```ts
const cardFinishes: readonly CardFinish[];
```

### cardMaterial

*function*. The material with this id, or undefined.

```ts
function cardMaterial(id: string | null | undefined): CardMaterial | undefined;
```

### cardMaterials

*constant*

```ts
const cardMaterials: readonly CardMaterial[];
```

### cardVariants

*constant*

```ts
const cardVariants: readonly CardVariant[];
```

### mmPerPoint

*constant*. One thousandth of an inch ("pt" in card and paper trade talk) in millimetres.

```ts
const mmPerPoint = 0.0254;
```

### stackHeightMm

*function*. Height of a stack of `count` cards `thicknessMm` thick, in millimetres.

```ts
function stackHeightMm(count: number, thicknessMm: number): number;
```

### stackLayout

*function*. The cards under the top one of a stack of `count`, bottom first: the top `depth` of them, as the top card is the live one

```ts
function stackLayout(count: number, options?: StackLayoutOptions): StackPlace[];
```

### stackPresets

*constant*

```ts
const stackPresets: readonly StackPreset[];
```

### wearLayout

*function*. Where every mark of a card lies. A pure function of the levels and the seed: no DOM, nothing at random.

```ts
function wearLayout(levels: WearLevels, seed?: number): WearFeatures;
```

### wearLevels

*function*. The levels a card's wear asks for, or null when it asks for none (no wear, "perfect", an unknown name or all zero).

```ts
function wearLevels(options: WearOptions): WearLevels | null;
```

### wearOutline

*function*. The outline of a face as an SVG path in the 250 by 350 box, corners as worn.

```ts
function wearOutline(features: WearFeatures, face?: 'front' | 'back'): string;
```

### wearOverlaySvg

*function*. The SVG laid over one face: whitening, folds, creases, scratches, specks, stain and toning. Markup only, no script.

```ts
function wearOverlaySvg(features: WearFeatures, face?: 'front' | 'back'): string;
```

### wearPreset

*function*

```ts
function wearPreset(id: string | null | undefined): WearPreset | undefined;
```

### wearPresets

*constant*. From perfect to damaged. The names are the plain grading terms; the numbers are this package's reading of them (docs/wear.md).

```ts
const wearPresets: readonly WearPreset[];
```

### CardFinish

*type*. A card's finish and visual family.

```ts
type CardFinish = 'foil' | 'matte';
```

### CardMaterial

*interface*

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

*type*

```ts
type CardMaterialGroup = 'paper' | 'plastic' | 'thick-card' | 'metal';
```

### CardMaterialSource

*interface*. A card material with a thickness taken from a maker or a standard, and where it was read.

```ts
interface CardMaterialSource {
    label: string;
    url: string;
    /** What the source says, in short. */
    says: string;
}
```

### CardOptions

*interface*

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
    /** Card thickness in millimetres at the 63 mm wide card size; overrides the material's. Default 0.3, 0 for a flat card. */
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
    flipped?: boolean;
    motion?: 'still' | 'pan';
    playing?: boolean;
    /** `focus`: the card in focus animates its art (needs `motion: 'pan'`); never with reduced motion. */
    autoplay?: 'focus';
    panDirection?: 'down' | 'up';
    panLoop?: 'alternate' | 'restart';
    cardSpin?: 'center' | 'corner';
    cardSpinDirection?: 'normal' | 'reverse';
    cardSpinPaused?: boolean;
}
```

### CardVariant

*type*

```ts
type CardVariant = 'classic' | 'sport' | 'cosmic';
```

### CornerKind

*type*

```ts
type CornerKind = 'sharp' | 'soft' | 'rounded' | 'chipped' | 'dog-eared';
```

### StackLayoutOptions

*interface*

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

*interface*. Where the cards of a stack lie, from neat to messy, the same every time for the same seed.

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

*interface*. A count of cards for a stack, with where the number comes from.

```ts
interface StackPreset {
    id: string;
    name: string;
    count: number;
    source: CardMaterialSource;
}
```

### WearCorner

*interface*

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

*interface*

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

*interface*

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

*interface*

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

*class*

```ts
class FudaCard extends HTMLElement {
    static observedAttributes: string[];
    private focused;
    private hushed;
    private focusedAtPress?;
    constructor();
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
    /** Millimetres thick: the `thickness` attribute, else the `material`'s, else 0.3. */
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

## `@johnmorrisdotca/fuda-cards/live-3d`

1 value and 5 types.

```js
import { createLiveCards } from '@johnmorrisdotca/fuda-cards/live-3d';
```

### createLiveCards

*function*

```ts
function createLiveCards<T extends ThreeLike = ThreeLike>(options: LiveCardsOptions<T>): LiveCards<T>;
```

### AddOptions

*interface*

```ts
interface AddOptions {
    /** A picture the card already has (an `<img>` of its own), kept until the card is in focus. With one, the card costs no 3D code until then. */
    still?: HTMLImageElement;
}
```

### LiveCards

*interface*

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

*interface*

```ts
interface LiveCardsOptions<T extends ThreeLike = ThreeLike> extends Omit<SharedRendererOptions<T>, 'scheduler' | 'assets' | 'clock' | 'document'> {
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

*interface*. A scene for a card. `object` is what turns about its upright axis while the card is in focus.

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

*constant*

```ts
const collectionKinds: ReadonlyArray<CollectionKind>;
```

### collectionViewAliases

*constant*. Display names that earlier versions accepted and that now open another display, so a page that sets them keeps working.

```ts
const collectionViewAliases: Readonly<Record<string, CollectionView>>;
```

### collectionViews

*constant*. The displays, in the order the buttons show them. `jukebox` and `tower` were two more names for the deck's pile of cards (no real counterpart for cards, and the same drawing), so they are no longer offered; see `collectionViewAliases`.

```ts
const collectionViews: ReadonlyArray<{
    id: CollectionView;
    label: string;
}>;
```

### deckLandings

*constant*

```ts
const deckLandings: ReadonlyArray<{
    id: 'face-up' | 'face-down';
    label: string;
}>;
```

### fanLayout

*function*. `step` is how far apart neighbouring cards lie across, in card widths; the angle does the rest of the spreading. A phone uses a smaller one.

```ts
function fanLayout(count: number, seed?: number, step?: number): FanPlace[];
```

### isCard

*constant*. True for an item that is a card: anything that does not say it is an object. Only a card turns, has a back and lands turned over.

```ts
const isCard: (card: Pick<CollectionCard, "kind">) => boolean;
```

### movePage

*function*. Return the first card index of a wrapped page.

```ts
function movePage(index: number, length: number, pageSize: number, delta: number): number;
```

### normalizeLanding

*function*. The landing a value means: `face-down` (also `upside-down` and `turned-over`) is turned over; anything else is still facing up.

```ts
function normalizeLanding(value: string | null | undefined): 'face-up' | 'face-down';
```

### parseCollection

*function*

```ts
function parseCollection(value: unknown): CollectionCard[];
```

### randomDrawIndex

*function*. Choose a matching card, avoiding the current card when another match exists.

```ts
function randomDrawIndex(cards: CollectionCard[], current: number, filter: string, random?: () => number): number | null;
```

### CollectionCard

*interface*

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
type CollectionKind = 'card' | 'object';
```

### CollectionMetadata

*interface*

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

*type*. Browser-native collection viewer. Import this module to register <fuda-collection>.

```ts
type CollectionView = 'deck' | 'rolodex' | 'binder' | 'case' | 'jukebox' | 'random' | 'story' | 'wall' | 'tower' | 'spotlight' | 'atlas' | 'fan';
```

### DeckLanding

*type*. How a card taken off a pile lands on the pile at its side: still facing up, or turned over sideways (as a person turns a card, like a

```ts
type DeckLanding = 'face-up' | 'face-down' | 'upside-down';
```

### FanPlace

*interface*. Where the cards of a fan lie, first card on the left when open and on top when closed. `open` is the fan spread like a hand of playing cards; `closed` is the squared-up deck it starts from and closes back to.

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

*class*

```ts
class FudaCollection extends HTMLElement {
    private root;
    private data;
    private index;
    private pageSize;
    private selected;
    private back;
    private drawFilter;
    private zoom;
    private tiles?;
    private landing?;
    private fanChoice?;
    private animateChoice?;
    private speedChoice?;
    private binderChoices;
    private turn;
    private flip;
    private addressTimer;
    private fanPlaces;
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
    private get currentView();
    /** How a card taken off lands: still facing up, or turned over sideways. The 0.6.0 value `upside-down` is still accepted and means turned over. */
    private get land();
    private get fanOpen();
    private get stacked();
    private get piled();
    /** Only a card turns: a collection of objects (no card in it) never turns, and in a mixed one the objects stay square to the reader while the cards turn. */
    private get hasCards();
    private get turnable();
    private q;
    /** With `address`, the display, the fan, the landing, the animation and its speed are kept in the page's address (`?view=fan&fan=open&land=face-down&animate=off`), and a link to it opens the same. */
    private readAddress;
    private writeAddress;
    private move;
    private binderLay;
    /** The first card of an opening of the binder: the right-hand page's first card, or the left-hand page's when the right-hand page is past the end. */
    private spreadFirst;
    private image;
    private open;
    private renderDialog;
    private canDraw;
    /** The one length every move takes, in a custom property the stylesheet reads: `animate="off"` and reduced motion make it 0, `speed` stretches it. */
    private timeVars;
    private syncChoices;
    private build;
    /** One pile of the deck. `positions` are data indexes from the bottom of the pile to its top; the cards under the top one lie nudged and turned from the seed and the top one lies square. A deck's cards also carry where they lie when the fan is open. */
    private pile;
    /** Where the fan's cards lie for a pile of this many cards. A phone's fan lies closer across and leans on its angle. */
    private fanFor;
    /** Open the fan (or close it) on the pile that is on screen, without drawing it again, so every card glides: the open fan's reach is put in custom properties that move the piles apart and the Fit box. */
    private fanVars;
    /** `fan` changed: when a pile is on screen, move its cards to or from the fan in place (animated) and fit the view to it. Returns false when there is no pile to move. */
    private setFan;
    private renderDeck;
    /** The card that just moved flies between the two piles, turning over sideways on the way if it lands face down. The same element, so the card is never drawn twice. An open fan sends the card from where the fan holds it. */
    private playFlip;
    private renderFan;
    /** Where every card is on screen now, by data index. */
    private snapshot;
    /** Cards that arrive grow and fade in, a little to the side the reader is heading. Only an opening keyframe: they end on the card's own style. */
    private enter;
    /** After a card or page change or a switch of display: glide what stays, let what goes leave, bring in what comes. Nothing runs afterwards: each is one animation that ends by itself. */
    private play;
    private syncBinder;
    private binderCount;
    /** The binder: a ring or zip binder open on two facing sheets of pockets. A page turn swings the leaf about the spine, bending as it goes, and shows the pockets on its back. */
    private renderBinder;
    private render;
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
