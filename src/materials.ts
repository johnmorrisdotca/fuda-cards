/** A card material with a thickness taken from a maker or a standard, and where it was read. */
export interface CardMaterialSource {
  label: string;
  url: string;
  /** What the source says, in short. */
  says: string;
}
export type CardMaterialGroup = "paper" | "plastic" | "thick-card" | "metal";
export interface CardMaterial {
  id: string;
  name: string;
  group: CardMaterialGroup;
  /** Thickness of one card in millimetres. */
  thicknessMm: number;
  /** The colour of the card's edge (a look, not a measurement). */
  edge: string;
  source: CardMaterialSource;
}
/** A count of cards for a stack, with where the number comes from. */
export interface StackPreset {
  id: string;
  name: string;
  count: number;
  source: CardMaterialSource;
}

/** One thousandth of an inch ("pt" in card and paper trade talk) in millimetres. */
export const mmPerPoint = 0.0254;
const pt = (points: number): number => Math.round(points * mmPerPoint * 1000) / 1000;

const qin = {
  label: "Qin Printing, Custom Playing Card Printing",
  url: "https://www.qinprinting.com/poker-card-printing/",
};
const holder = (points: number, slug: string): CardMaterialSource => ({
  label: `Ultra PRO, ${points}PT ONE-TOUCH Magnetic Holder`,
  url: `https://ultrapro.com/products/${slug}`,
  says: `holds standard cards (2-1/2" x 3-1/2") up to ${points}pt in thickness`,
});
const thick = (points: number, slug: string): CardMaterial => ({
  id: `card-${points}pt`,
  name: `Thick trading card, ${points} pt`,
  group: "thick-card",
  thicknessMm: pt(points),
  edge: "#e8dfca",
  source: holder(points, slug),
});

export const cardMaterials: readonly CardMaterial[] = [
  {
    id: "paper-250",
    name: "Card stock, 250 gsm (11 pt)",
    group: "paper",
    thicknessMm: 0.28,
    edge: "#efe9da",
    source: { ...qin, says: "Premium Cardstock, 250gsm, 0.28mm, 11pt" },
  },
  {
    id: "paper-310-black-core",
    name: "Playing-card stock, black core, 310 gsm (13 pt)",
    group: "paper",
    thicknessMm: 0.325,
    edge: "#2a2a2e",
    source: { ...qin, says: "Black Core Paper, 310gsm, 0.325mm, 13pt" },
  },
  {
    id: "paper-350",
    name: "Heavy card stock, 350 gsm (16 pt)",
    group: "paper",
    thicknessMm: 0.405,
    edge: "#e9e1cd",
    source: { ...qin, says: "Premium Cardstock, 350gsm, 0.405mm, 16pt" },
  },
  {
    id: "plastic-id1",
    name: "Plastic bank-size card (ID-1, PVC)",
    group: "plastic",
    thicknessMm: 0.76,
    edge: "#f2f2ef",
    source: {
      label: "ISO/IEC 7810 ID-1, as summarised on Wikipedia",
      url: "https://en.wikipedia.org/wiki/ISO/IEC_7810",
      says: '"All card sizes have a thickness of 760±80 μm." Payment cards are generally PVC (Wikipedia, Payment card).',
    },
  },
  thick(35, "35pt-uv-one-touch-magnetic-holders-5ct"),
  thick(55, "55pt-uv-one-touch-magnetic-holder"),
  thick(75, "75pt-uv-one-touch-magnetic-holder"),
  thick(100, "100pt-uv-one-touch-magnetic-holder"),
  thick(130, "130pt-uv-one-touch-magnetic-holder"),
  thick(180, "180pt-uv-one-touch-magnetic-holder"),
  {
    id: "booklet-175pt",
    name: "Booklet card, 175 pt",
    group: "thick-card",
    thicknessMm: pt(175),
    edge: "#e8dfca",
    source: {
      label: "Ultra PRO, 175PT Vertical Booklet Card ONE-TOUCH Magnetic Holder",
      url: "https://ultrapro.com/products/175pt-vertical-booklet-card-uv-one-touch-magnetic-holder",
      says: '"Sized to fit Vertical Booklets up to 175pt thickness"',
    },
  },
  {
    id: "aluminium-0.8",
    name: "Anodised aluminium card, 0.8 mm",
    group: "metal",
    thicknessMm: 0.8,
    edge: "#c9ced4",
    source: {
      label: "ebamaz anodised aluminium business card blank, 86 x 54 x 0.8 mm (Wood Art Supply listing)",
      url: "https://woodartsupply.com/products/ebamaz-metal-business-cards-anodized-aluminum-plaque-plate-86x54x0-8mm-silver-blank-10pcs",
      says: '"Material: Anodized Aluminum", "Size: 86X54X0.8mm"',
    },
  },
  {
    id: "steel-0.5",
    name: "Stainless steel card, 0.5 mm",
    group: "metal",
    thicknessMm: 0.5,
    edge: "#aab0b6",
    source: {
      label: "My Metal Business Card, Metal Business Card Thickness Guide",
      url: "https://mymetalbusinesscard.com/blog/metal-business-card-thickness-guide/",
      says: '"our standard metal business card thickness is 0.5mm"; "A 0.5mm stainless steel business card"',
    },
  },
];

const wikiDeck = { label: "Wikipedia, Playing card", url: "https://en.wikipedia.org/wiki/Playing_card" };
const wikiPokemon = {
  label: "Wikipedia, Pokémon Trading Card Game",
  url: "https://en.wikipedia.org/wiki/Pok%C3%A9mon_Trading_Card_Game",
};
export const stackPresets: readonly StackPreset[] = [
  {
    id: "deck-52",
    name: "Playing cards, 52",
    count: 52,
    source: { ...wikiDeck, says: '"The 52-card deck is the most popular deck"' },
  },
  {
    id: "deck-54",
    name: "Playing cards with two jokers, 54",
    count: 54,
    source: {
      ...wikiDeck,
      says: 'commercial packs "often include between one and six jokers, most often two", so 52 + 2',
    },
  },
  {
    id: "pokemon-deck",
    name: "Pokémon TCG deck, 60",
    count: 60,
    source: { ...wikiPokemon, says: 'players "play with 60-card decks"' },
  },
  {
    id: "pokemon-booster",
    name: "Booster pack, about 10",
    count: 10,
    source: { ...wikiPokemon, says: '"a collector can pull 10 cards in total" from a booster pack' },
  },
];

/** The material with this id, or undefined. */
export function cardMaterial(id: string | null | undefined): CardMaterial | undefined {
  return cardMaterials.find((material) => material.id === id);
}
/** Height of a stack of `count` cards `thicknessMm` thick, in millimetres. */
export function stackHeightMm(count: number, thicknessMm: number): number {
  return Math.round(Math.max(1, Math.floor(count)) * thicknessMm * 1000) / 1000;
}
