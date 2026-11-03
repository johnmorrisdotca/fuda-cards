---
title: Bundlers
section: how-to
order: 10
description: Use the card with Vite or webpack: import the element once, in code that runs in the browser, and build with nothing more to configure.
---

A bundler resolves everything from `node_modules`. Import `@johnmorrisdotca/fuda-cards/element` (and `/collection-element` for the collection) once, anywhere that runs in the browser. The package marks its element files as having side effects, so a bundler keeps the import even though nothing is used from it. Both examples are built by `pnpm test:usage` from the package as npm packs it, and the page they make is opened.

## Vite

```ts no-run
import "@johnmorrisdotca/fuda-cards/element";
import { type CardOptions, cardAttributes } from "@johnmorrisdotca/fuda-cards";

const options: CardOptions = { title: "Explorer One", category: "ROCKET", stack: 10, wear: "near-mint" };
const card = document.createElement("fuda-card");
for (const [name, value] of Object.entries(cardAttributes(options))) card.setAttribute(name, value);
document.getElementById("app")?.append(card);
```

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Fuda Cards with Vite</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="./main.ts"></script>
  </body>
</html>
```

## webpack

```js no-run
import "@johnmorrisdotca/fuda-cards/element";

const card = document.createElement("fuda-card");
card.setAttribute("title", "Explorer One");
card.setAttribute("variant", "cosmic");
document.body.append(card);
```

```js
import { fileURLToPath } from "node:url";

export default {
  mode: "production",
  entry: "./src/index.js",
  output: { path: fileURLToPath(new URL("./dist", import.meta.url)), filename: "main.js" },
};
```

## What you get

The element's modules for stacks, wear and piles are loaded only when a card asks for one, so a plain card costs little. The sizes of every entry point are in [Architecture](architecture.md).
