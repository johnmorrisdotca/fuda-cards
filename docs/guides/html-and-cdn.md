---
title: HTML and CDN
section: how-to
order: 9
description: Put a card on a page with no build step, from jsDelivr or unpkg, or with an import map for the collection and live 3D.
---

A card needs one script tag and nothing else: `<fuda-card>` imports only its own small modules, so no import map is needed. Both CDNs answer for the package; `pnpm test:usage` opens each page below with the CDN's answers stood in by the package as npm packs it.

## From jsDelivr

jsDelivr bundles a subpath of the package with its dependencies when the address ends in `/+esm`.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Fuda Cards from jsDelivr</title>
    <script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/fuda-cards/element/+esm"></script>
  </head>
  <body>
    <fuda-card title="Explorer One" category="ROCKET" variant="cosmic" finish="foil" stack="10" wear="near-mint">
      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Crect width='10' height='10' fill='%23335'/%3E%3C/svg%3E" alt="Explorer One" />
    </fuda-card>
  </body>
</html>
```

## From unpkg

unpkg serves the package's own files; `?module` makes it rewrite the imports so that the browser can follow them.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Fuda Cards from unpkg</title>
    <script type="module" src="https://unpkg.com/@johnmorrisdotca/fuda-cards/dist/element.js?module"></script>
  </head>
  <body>
    <fuda-card title="Explorer One" category="ROCKET" variant="sport" finish="matte" material="steel-0.5">
      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Crect width='10' height='10' fill='%23335'/%3E%3C/svg%3E" alt="Explorer One" />
    </fuda-card>
  </body>
</html>
```

## The collection and live 3D from a CDN

`<fuda-collection>` draws its zoom bar with kazoku-ui, and live 3D loads `three`. Without a bundler, an import map says where each lives.

```html
<script type="importmap">
{ "imports": {
  "@johnmorrisdotca/fuda-cards/collection-element": "https://cdn.jsdelivr.net/npm/@johnmorrisdotca/fuda-cards/collection-element/+esm"
} }
</script>
<fuda-collection view="binder"></fuda-collection>
<script type="module">
  import '@johnmorrisdotca/fuda-cards/collection-element';
  document.querySelector('fuda-collection').cards = [{ id: 'one', name: 'Example', image: 'one.jpg' }];
</script>
```

The single card needs none of this. For a server's or a bundler's way of loading the same modules see [Bundlers](bundlers.md) and [Frameworks](frameworks.md).
