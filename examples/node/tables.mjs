import { cardMaterials, stackHeightMm, stackLayout, wearLayout, wearPreset } from "@johnmorrisdotca/fuda-cards";

// The tables and the maths run on a server too: nothing here touches a browser.
const black = cardMaterials.find((material) => material.id === "paper-310-black-core");
console.log(stackHeightMm(52, black.thicknessMm));
console.log(stackLayout(52, { seed: 7 }).length);
console.log(wearLayout(wearPreset("damaged").levels, 3).front.creases.length > 0);
