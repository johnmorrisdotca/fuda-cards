import "@johnmorrisdotca/fuda-cards/element";
import { type CardOptions, cardAttributes } from "@johnmorrisdotca/fuda-cards";

const options: CardOptions = { title: "Explorer One", category: "ROCKET", stack: 10, wear: "near-mint" };
const card = document.createElement("fuda-card");
for (const [name, value] of Object.entries(cardAttributes(options))) card.setAttribute(name, value);
document.getElementById("app")?.append(card);
