# Collection input

Fuda should display real collections as well as cards generated from other projects. The collection viewer accepts a JSON array or an object containing a cards array. The broader integration features below remain planned.

## Sources

- A JSON file, a JavaScript array or object supplied by the host, and data fetched from an API by the host.
- Adapters can map different external APIs and collection exports into Fuda's common card format. The host controls authentication, fetch, refresh and error handling; Fuda does not require a server or assume an external service.
- Treat image and asset URLs as supplied by the host, and give useful feedback when a file, URL, or field is missing. Support partial data and optional front and back images.

## Card data

An example supported collection format:

```json
{
  "version": 1,
  "name": "Rocket collection",
  "cards": [
    {
      "id": "starship-v3",
      "name": "Starship Block 3",
      "image": "https://example.com/starship-front.jpg",
      "backImage": "https://example.com/starship-back.jpg",
      "metadata": { "year": 2026, "number": "001" }
    }
  ]
}
```

- Represent photographed or scanned cards as full-card front and back images, so collectors can display what they already own. Alternatively, use a Fuda frame with a separate image or host-provided interactive artwork in its window.
- Keep collector details optional: set, year, card number, edition, condition, grade, quantity, notes, and other metadata. Do not assume every item has a market price or grade.
- Provide stable IDs for selection and navigation; validate malformed input and report errors without discarding valid cards.
- Allow host-supplied visual content, including interactive 3D elements, in addition to serializable image references; JSON alone cannot contain a live 3D viewer.
- Each collection presentation (binder, case, jukebox, rotating index, random viewer) consumes the same normalized collection and can expose filtering and selection to the host.

No accounts, collection storage, third-party integrations, importers, or synchronization are implemented yet. Avoid requiring accounts or uploading a collection to Fuda merely to display it.

