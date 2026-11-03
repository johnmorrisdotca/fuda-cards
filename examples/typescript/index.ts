import {
  type CardMaterial,
  type CardOptions,
  cardAttributes,
  cardMaterial,
  stackHeightMm,
  wearPresets,
} from "@johnmorrisdotca/fuda-cards";

const options: CardOptions = { title: "Explorer One", material: "paper-310-black-core", stack: 52, wear: "near-mint" };
const stock: CardMaterial | undefined = cardMaterial(options.material);
console.log(stock?.name, stackHeightMm(options.stack ?? 1, stock?.thicknessMm ?? 0.325));
console.log(Object.keys(cardAttributes(options)).join(" "), wearPresets.length);

// @ts-expect-error "neon" is not a look
cardAttributes({ variant: "neon" });
