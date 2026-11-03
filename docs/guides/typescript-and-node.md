---
title: TypeScript and Node
section: how-to
order: 13
description: The types of every option, and the tables, the maths and the layouts that run on a server with no DOM.
---

The package ships its own types. `CardOptions` types every setting of the card, `cardAttributes(options)` turns it into attributes, and the tables of materials, stack sizes and wear grades are plain data. A mistake in a name or a value is an error at build time; the last line of the example below is meant to be one.

```ts
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
```

## On a server

The main entry, `@johnmorrisdotca/fuda-cards`, the collection helpers (`/collection`) and the layouts need no browser. The elements extend `HTMLElement`, so import them only on the client (see [Frameworks](frameworks.md)).

```js
import { cardMaterials, stackHeightMm, stackLayout, wearLayout, wearPreset } from "@johnmorrisdotca/fuda-cards";

// The tables and the maths run on a server too: nothing here touches a browser.
const black = cardMaterials.find((material) => material.id === "paper-310-black-core");
console.log(stackHeightMm(52, black.thicknessMm));
console.log(stackLayout(52, { seed: 7 }).length);
console.log(wearLayout(wearPreset("damaged").levels, 3).front.creases.length > 0);
```

## What is pure

The stack's layout and the wear's layout are pure functions of their numbers and a seed: the same seed lays the same stack and the same marks every time, in Node and in a browser, so a card's look can be written down as its settings and its seeds.
