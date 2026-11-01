# Demo personas and collections

These are fictional product personas for design and testing, not real accounts or claims about real collectors. The implemented source of card IDs and image URLs is `demo/users.js`. The stories below are proposed context for agents; update both this file and the demo data when changing a collection.

## Alex — Pokémon nostalgia

Alex enjoys the original Pokémon era and wants to browse familiar favourites in a binder or overlapping deck. Alex's **First partners** collection currently contains Charizard (#4), Blastoise (#2), Venusaur (#15), and Clefairy (#5), all from the Pokémon Base Set via TCGdex.

Alex's useful scenarios: open the collection on a phone, swipe between cards, tap to inspect an image, and browse in a binder. Alex's preferences and history are fictional design assumptions; the application does not yet maintain an account or ownership history.

## Sam — Pokémon favourites

Sam likes collecting striking Pokémon and wants a quick way to display favourites and find a card by name. Sam's **Powerhouse Pokémon** collection currently contains Mewtwo (#10), Gyarados (#6), Machamp (#8), and Nidoking (#11), from the Pokémon Base Set via TCGdex.

Sam's useful scenarios: compare layouts, draw a random card, search the collection, and open a card for detail. Search is a goal for the collection viewer, not a promise that it currently works in all views.

## Riley — Retro gaming and Hako Devices

Riley enjoys old video game consoles and gaming. He wants to celebrate the hardware in his collection as collectible cards and explore the devices. His **Retro gaming consoles** collection currently references Hako Devices drawings of Game Boy (DMG-01), Game Boy Advance (AGB-001), Nintendo 64, PlayStation 2 (fat), and Nintendo DS (NTR-001).

Riley's useful scenarios: browse a stacked deck, inspect hardware, place an interactive Hako device inside a Fuda card, and rotate it. The current demo uses remote drawing URLs; their browser availability and the live 3D integration have not been verified or completed.

## Data and boundaries

- All three are demo profiles, not authentication or saved user accounts.
- The demo's saved collections are browser-local and do not sync across devices.
- Pokémon images are referenced from TCGdex and Hako drawings from the Hako Devices site; verify availability and applicable source terms when deploying.
- Check `docs/task-board.md` before working on users or persistence, and record meaningful changes in `docs/work-log.md`.
