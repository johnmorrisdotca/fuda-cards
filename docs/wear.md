# Wear: cards that are not perfect

`wear` draws a card as it looks after use: corners that are soft, rounded, chipped or folded, whitening on the edges, creases, scratches, specks, staining, yellowing and a print that sits off centre. It is off by default: a card with no `wear` attribute (or `wear="perfect"`) is drawn exactly as before and never loads the wear code.

```html
<fuda-card title="Rookie" wear="lightly-played" wear-seed="7"></fuda-card>
```

A card's wear is fixed by its preset and its seed, so a card looks the same every time it is drawn and on every device: the same seed lays the same marks, another seed lays others. Nothing is random at draw time and nothing animates.

## Attributes

| Attribute | Meaning |
|---|---|
| `wear` | A preset's id (below), or a number from 0 to 1 for all the levels at once. Empty or `perfect`: no wear. |
| `wear-seed` | The seed, a whole number. Default 1. |
| `wear-corners`, `wear-edges`, `wear-surface`, `wear-creases` | One level on its own, 0 to 1, over the preset's. |

In script: `card.wear = 'near-mint'`; the options object has `wear`, `wearSeed`, `wearCorners`, `wearEdges`, `wearSurface` and `wearCreases`. The package exports the data without touching the DOM: `wearPresets`, `wearPreset(id)`, `wearLevels(options)`, `wearLayout(levels, seed)` (where every mark lies), `wearOutline(layout, face)` and `wearOverlaySvg(layout, face)`. The code is a separate module (`dist/wear.js`) that `<fuda-card>` loads with a dynamic `import()` only when a card asks for wear.

## What real wear looks like, and where the words come from

Grading looks at four things: **centering, corners, edges and surface**, with creases, scratches, tears and staining counted as wear. The Wikipedia article on trading cards (section Value, Condition) lists the scale from pristine through mint, near mint, excellent, very good and good to poor, and says that "centering, corners, edges and surface are taken into consideration for imperfections".

The five terms most used for cards sold singly are near mint, lightly played, moderately played, heavily played and damaged. A guide that states its own conventions ("marketplace conventions, not official grades", Rare Candy, Pokémon card condition guide) describes them like this, and the presets follow it:

- **Near mint**: corners "sharp, no rounding or fraying"; edges "crisp, no whitening or chipping"; no scratch lines; no creases or staining.
- **Lightly played**: "very slight corner rounding"; "edge whitening on one or two sides"; scratch lines "you'd only notice if you tilted the card".
- **Moderately played**: corners "clearly soft or rounded"; whitening "consistent around multiple sides"; "obvious scratch lines"; still no creases or bends.
- **Heavily played**: "corners that have lost their shape entirely"; "heavy whitening on all four edges", possible chipping; "deep scratches"; minor bends or creases.
- **Damaged**: "punched corners"; "visible creases, hard bends, tears"; "water staining".

For the numbered scale, a third-party summary of PSA's standards (cardgrading.app, which says it is not PSA) lists, for the top grades, "factory-sharp points on every corner" at 10, "one corner is allowed to have very slight wear" at 9, "multiple corners with light wear" at 8, "moderate corner wear" at 7, "rounded corners" at 5, and creases and staining at 4 and below; and, for centering, front tolerances widening from 55/45 at 10 to 85/15 at 5. Older cards are held to a softer standard (Wikipedia, same section).

**What was not read.** The grading companies' own pages (PSA, Beckett, SGC) and TCGplayer's condition guide returned HTTP 403 to the tools used, so the numbers above come from the secondary sources named, not from the graders. The preset levels are this package's reading of those words, not a grade: no preset is "a PSA 7". The grading companies' names and grades are not used in any preset.

## Presets

Each level runs from 0 (none) to 1 (the worst the preset names). Levels never fall from one preset to the next (a test checks it).

| Id | Name | Corners | Edges | Surface | Creases | Toning | Centering | In plain words |
|---|---|---|---|---|---|---|---|---|
| `perfect` | Perfect | 0 | 0 | 0 | 0 | 0 | 0 | No imperfections. Draws nothing. |
| `mint` | Mint | 0.05 | 0.05 | 0.06 | 0 | 0 | 0.1 | Nothing to the naked eye; a flaw or two only on close inspection. |
| `near-mint` | Near mint | 0.18 | 0.2 | 0.2 | 0 | 0 | 0.2 | Sharp corners, a trace of edge whitening, a few light scratches. |
| `lightly-played` | Lightly played | 0.38 | 0.45 | 0.4 | 0 | 0.05 | 0.3 | Very slight corner rounding, whitening on one or two edges, scratches seen when tilted. |
| `moderately-played` | Moderately played | 0.62 | 0.68 | 0.62 | 0.08 | 0.15 | 0.45 | Soft or rounded corners, whitening on several edges, obvious scratches, some gloss lost. |
| `heavily-played` | Heavily played | 0.82 | 0.9 | 0.85 | 0.3 | 0.3 | 0.6 | Corners that have lost their shape, heavy whitening, deep scratches, minor creases. |
| `damaged` | Damaged | 1 | 1 | 1 | 0.85 | 0.5 | 0.8 | Chipped and folded corners, hard creases, staining. |

## How each kind of wear is drawn

- **Corners.** Each corner has its own severity, from the level and the seed: sharp (a speck of whitening), soft (a larger radius), rounded, chipped (a jagged notch) or folded (a dog-ear that shows the back of the card). A card has at most one folded and two chipped corners; real damage rarely lands on all four. The outline of each face is a mask, so the drop shadow follows it. The back is the front seen from behind, so its corners are the front's mirrored.
- **Edges.** Small cream flecks of bare stock along the four edges, longer and deeper with more wear.
- **Surface.** Thin light scratches and dark or light specks. They lie over the face and its shine.
- **Creases.** Slightly curved lines with a light side and a shadow side; a heavy one also breaks the print (a dashed cream line). None below `moderately-played`.
- **Toning and staining.** A yellow-brown darkening towards the edges and, from heavy wear, a soft stain.
- **Centering.** The print sits off centre by up to 7 px across and 5 px down (at 300 px wide) at full level, so one border is wider than the other.

## Limits

- The 3D edge planes (the card's thickness) keep the perfect card's outline; at 0.3 mm that is about 1 px. A chipped or folded corner shows the thickness's normal corner behind it.
- Warping and bending of the whole card, rubbed foil patterns, dents and tears across the card are not drawn.
- Cards under the top one of a `stack` are drawn without wear; only the live top card is worn.
- `<fuda-collection>` draws the caller's pictures, so it does not apply wear; scans that are already worn show their own wear.
- Headless Chromium only; not checked on a real phone, Safari or Firefox.
