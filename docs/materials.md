# Card materials and stacks

Every thickness below was read from a maker's page or a standard on 2026-11-02 and is the number the page gives. Nothing is guessed. A material with no maker or standard to cite is not offered.

**Units.** `pt` is one thousandth of an inch (0.0254 mm): "a 10 pt. card is 0.010 in (0.254 mm) thick", "12 pt. is 0.012 in (0.3048 mm)" ([Wikipedia, Card stock](https://en.wikipedia.org/wiki/Card_stock), note 2). Where a source gives points only, the millimetres are points times 0.0254.

Use a material with `material="<id>"`. It sets the card's thickness and the colour of its edge (the edge colour is how the material looks, not a measurement; `--fuda-edge` still wins). `thickness` (millimetres) overrides the material's thickness. With neither, a card is 0.3 mm thick, as before (12 pt = 0.3048 mm).

| id | Material | Thickness (mm) | Source | What the source says |
|---|---|---|---|---|
| `paper-250` | Card stock, 250 gsm (11 pt) | 0.28 | [Qin Printing, Custom Playing Card Printing](https://www.qinprinting.com/poker-card-printing/) | Premium Cardstock, 250gsm, 0.28mm, 11pt |
| `paper-310-black-core` | Playing-card stock, black core, 310 gsm (13 pt) | 0.325 | [Qin Printing, Custom Playing Card Printing](https://www.qinprinting.com/poker-card-printing/) | Black Core Paper, 310gsm, 0.325mm, 13pt |
| `paper-350` | Heavy card stock, 350 gsm (16 pt) | 0.405 | [Qin Printing, Custom Playing Card Printing](https://www.qinprinting.com/poker-card-printing/) | Premium Cardstock, 350gsm, 0.405mm, 16pt |
| `plastic-id1` | Plastic bank-size card (ID-1, PVC) | 0.76 | [ISO/IEC 7810 ID-1, as summarised on Wikipedia](https://en.wikipedia.org/wiki/ISO/IEC_7810) | "All card sizes have a thickness of 760±80 μm." Payment cards are generally PVC (Wikipedia, Payment card). |
| `card-35pt` | Thick trading card, 35 pt | 0.889 | [Ultra PRO, 35PT ONE-TOUCH Magnetic Holder](https://ultrapro.com/products/35pt-uv-one-touch-magnetic-holders-5ct) | holds standard cards (2-1/2" x 3-1/2") up to 35pt in thickness |
| `card-55pt` | Thick trading card, 55 pt | 1.397 | [Ultra PRO, 55PT ONE-TOUCH Magnetic Holder](https://ultrapro.com/products/55pt-uv-one-touch-magnetic-holder) | holds standard cards (2-1/2" x 3-1/2") up to 55pt in thickness |
| `card-75pt` | Thick trading card, 75 pt | 1.905 | [Ultra PRO, 75PT ONE-TOUCH Magnetic Holder](https://ultrapro.com/products/75pt-uv-one-touch-magnetic-holder) | holds standard cards (2-1/2" x 3-1/2") up to 75pt in thickness |
| `card-100pt` | Thick trading card, 100 pt | 2.54 | [Ultra PRO, 100PT ONE-TOUCH Magnetic Holder](https://ultrapro.com/products/100pt-uv-one-touch-magnetic-holder) | holds standard cards (2-1/2" x 3-1/2") up to 100pt in thickness |
| `card-130pt` | Thick trading card, 130 pt | 3.302 | [Ultra PRO, 130PT ONE-TOUCH Magnetic Holder](https://ultrapro.com/products/130pt-uv-one-touch-magnetic-holder) | holds standard cards (2-1/2" x 3-1/2") up to 130pt in thickness |
| `card-180pt` | Thick trading card, 180 pt | 4.572 | [Ultra PRO, 180PT ONE-TOUCH Magnetic Holder](https://ultrapro.com/products/180pt-uv-one-touch-magnetic-holder) | holds standard cards (2-1/2" x 3-1/2") up to 180pt in thickness |
| `booklet-175pt` | Booklet card, 175 pt | 4.445 | [Ultra PRO, 175PT Vertical Booklet Card ONE-TOUCH Magnetic Holder](https://ultrapro.com/products/175pt-vertical-booklet-card-uv-one-touch-magnetic-holder) | "Sized to fit Vertical Booklets up to 175pt thickness" |
| `aluminium-0.8` | Anodised aluminium card, 0.8 mm | 0.8 | [ebamaz anodised aluminium business card blank, 86 x 54 x 0.8 mm (Wood Art Supply listing)](https://woodartsupply.com/products/ebamaz-metal-business-cards-anodized-aluminum-plaque-plate-86x54x0-8mm-silver-blank-10pcs) | "Material: Anodized Aluminum", "Size: 86X54X0.8mm" |
| `steel-0.5` | Stainless steel card, 0.5 mm | 0.5 | [My Metal Business Card, Metal Business Card Thickness Guide](https://mymetalbusinesscard.com/blog/metal-business-card-thickness-guide/) | "our standard metal business card thickness is 0.5mm"; "A 0.5mm stainless steel business card" |

How to read the table:

- The three paper stocks are a card printer's published calipers for playing-card and card stock. A real deck varies by maker and finish.
- The thick trading cards by point size (`card-35pt` to `card-180pt`) take the largest thickness Ultra PRO says its holder for that size holds ("up to"). A card sold as a given point size is at most that thick. A holder's limit is the maker's own number for a card of that size; it is not a measurement of one particular card.
- `plastic-id1` is the bank-card standard, 760 ± 80 µm; the PVC is from the payment-card article. A plastic playing card is not this thick.
- The two metals are single sellers' listings (anodised aluminium blank, 86 x 54 x 0.8 mm) and a metal-card maker's stated standard (stainless steel, 0.5 mm). Metal cards come in other thicknesses; those are not offered because no source for them was found.

**Left out because it could not be sourced to a maker or a standard:** a patch or relic card (no maker or standard gives its thickness; use a thick trading card or a booklet card), a graded-card slab, a plastic playing card (only reviewers' measurements were found), brass, copper and titanium cards, and other aluminium and steel thicknesses.

A check on the paper numbers: 52 cards come to 52 x 0.28 = 14.6 mm (250 gsm), 52 x 0.3 = 15.6 mm (the card's default, about 12 pt) or 52 x 0.325 = 16.9 mm (black-core playing-card stock).

## Stacks

`stack="N"` draws N cards, N from 1 to 1000. The height is N times a card's thickness, to scale: 52 cards of 0.325 mm are 16.9 mm. The count is free; these presets have a source:

| id | Preset | Cards | Source | What the source says |
|---|---|---|---|---|
| `deck-52` | Playing cards, 52 | 52 | [Wikipedia, Playing card](https://en.wikipedia.org/wiki/Playing_card) | "The 52-card deck is the most popular deck" |
| `deck-54` | Playing cards with two jokers, 54 | 54 | [Wikipedia, Playing card](https://en.wikipedia.org/wiki/Playing_card) | commercial packs "often include between one and six jokers, most often two", so 52 + 2 |
| `pokemon-deck` | Pokémon TCG deck, 60 | 60 | [Wikipedia, Pokémon Trading Card Game](https://en.wikipedia.org/wiki/Pok%C3%A9mon_Trading_Card_Game) | players "play with 60-card decks" |
| `pokemon-booster` | Booster pack, about 10 | 10 | [Wikipedia, Pokémon Trading Card Game](https://en.wikipedia.org/wiki/Pok%C3%A9mon_Trading_Card_Game) | "a collector can pull 10 cards in total" from a booster pack |

How a stack is drawn (one 3D context, no loop):

- The top card is the live `<fuda-card>`. Under it, the whole stack is one block whose edge is the material's colour with a fine line for each card.
- With messiness above 0, the `stack-depth` cards under the top one (10 unless said, at most 52) are drawn as flat stills: no art, no text, nudged and turned from a seed. Their places depend on their number from the bottom, so a card put on top moves none of those under it. A neat stack (`stack-messiness="0"`) draws no stills.
- Nothing animates: no timer, no animation frame, no CSS animation. A test checks that a 52-card stack at rest draws and requests no frames (`test/e2e/stack.e2e.mjs`).
- Attributes: `stack` (count), `stack-messiness` (0 to 1, default 0.3), `stack-seed` (a whole number, default 1), `stack-depth`. The element reads `stackCount` and `stackHeight` (millimetres). The package exports `cardMaterials`, `cardMaterial`, `stackPresets`, `stackHeightMm` and `stackLayout`.

The idea of a pile that goes from neat to messy from a seed, and its three parameters (messiness, seed, depth), come from [toranpu](https://github.com/johnmorrisdotca/toranpu) (`pileLayout` in `src/ui/layout.ts`, `<toranpu-pile>`, MIT). The code here is written again for a stack with a true thickness. Sharing the maths between the two packages is proposed to kazoku-ui.
