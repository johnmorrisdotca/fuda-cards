# Third-party material

The code of Fuda Cards is MIT licensed (see [LICENSE](LICENSE)). Nothing below is part of the published npm package except where it says so; it is the pictures and data the repository and its demo pages use, each with its source and licence as read on 2026-11-03.

| What | Where | Source and licence |
|---|---|---|
| Starship Block 3 picture (`assets/starship-v3-preview.jpg`, `assets/uchusen-main-painted.jpg`) | The repository and the demo pages; not in the npm package | A screenshot of John Morris's uchusen-rockets, which draws a modified model by Clarence365: <https://sketchfab.com/3d-models/spacex-starship-block-3-6f6c6f88a3eb4b4d822fdca66733fbb2>, licensed **CC BY 4.0**. The model was reduced, rescaled, separated into parts, and had logos and serial numbers removed. The credit is also in [assets/README.md](assets/README.md), which is in the npm package. |
| Rockets of the live 3D demo | `demo/live-3d.html`, loaded from `@johnmorrisdotca/uchusen-rockets` (a development dependency) | MIT, John Morris. Their models carry their own credits in that package. |
| Vintage baseball cards | `demo/vintage-baseball.js` keeps only addresses and credits; the pictures load from The Metropolitan Museum of Art when the demo opens | The Met's Open Access collection (the Jefferson R. Burdick Collection), each object marked public domain by the Met (checked 2026-11-02). |
| Vintage hockey cards | `demo/vintage-hockey.js` keeps only addresses and credits; the pictures load from Wikimedia Commons | 1910-11 Imperial Tobacco Canada cards, each file marked public domain on its Commons page (checked 2026-11-02). |
| Pokémon Base Set card pictures and data | `demo/tcgdex.html` loads them from TCGdex when the demo opens; none is stored here | Supplied by [TCGdex](https://tcgdex.dev/). The card artwork and the Pokémon names are the property of their owners (Nintendo, Creatures, GAME FREAK, The Pokémon Company) and are shown in the demo only as an example of a collection; they are not licensed by this project and are not in the package. |
| Card thicknesses and deck sizes | `src/materials.ts`, `docs/materials.md` | Facts read from the makers' and standards' own pages, each cited with its address. No text or table was copied. |

The card designs, the wear marks, the binder and every other picture drawn by the package are drawn in code from public facts and are MIT licensed with the rest.
