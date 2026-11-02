# Card pictures for the demos: what exists, and what may be shown

John (2026-11-02): "are there not any hockey card APIs with images? we should try to find something besides pokemon. baseball perhaps? or both?" Read on 2026-11-02. Rule: use only what a source's terms allow; never ESPN or Sports Reference; no fake cards of real players; no league, team or maker marks in the package; nothing that needs a key or money.

## Result

- **No free hockey (or baseball) card API with pictures that may be shown was found.** The services that cover modern cards are commercial or need a key (below), and the card images themselves are the card makers' and leagues' property.
- **What does exist and is clean: pictures that are in the public domain, item by item.** Hockey: 36 cards of 1910 to 1911 on Wikimedia Commons. Baseball: the T206 cards of 1909 to 1911 at The Metropolitan Museum of Art, 24 used. Both load from their own servers when the demo is opened; nothing is bundled and nothing is in the package (a test checks the package `files`). Demo: `demo/vintage.html`.

## Used

| Source | What | Terms read | Why it is allowed | Key or cost |
|---|---|---|---|---|
| [Wikimedia Commons, category Imperial Tobacco Canada ice hockey cards](https://commons.wikimedia.org/wiki/Category:Imperial_Tobacco_Canada_ice_hockey_cards) (MediaWiki API) | 1910 to 1911 hockey cards, 38 files (36 used: two cropped copies and a card back are not separate cards; the back is attached to its front) | Each file's own page: the API's `LicenseShortName` is "Public domain" for all 38, no `Restrictions` entry; the files carry the categories PD Canada and PD US expired | Public domain in Canada and the United States, read per file on 2026-11-02 | None. Free, no key. `Access-Control-Allow-Origin: *`. A polite User-Agent is asked of scripts; the demo only embeds pictures |
| [The Met Open Access API](https://metmuseum.github.io/), the Jefferson R. Burdick Collection, T206 White Border series | 24 of 31 public-domain T206 cards that were checked (duplicates of the same player and club dropped) | "unrestricted commercial and noncommercial use" of the data; "we do not require API users to register or obtain an API key"; "limit request rate to 80 requests per second"; images "in the public domain" | The `isPublicDomain` field of each object, read on 2026-11-02 (true for all 24 used) | None. Free, no key. `Access-Control-Allow-Origin: *` |

**Item-level checking mattered.** At the Met the T206 cards sit in one series, but `isPublicDomain` is true for only some of them: of the first 60 T206 records (low object numbers) none was marked and none had an image; in object numbers 413225 and up, 31 of 109 records read were marked and had pictures. Post-1929 Burdick cards (the "W" series of the 1930s to 1960s, hockey included: "Hockey #8 from the Sports Drawings series (W542)") are not marked and have no picture. Nothing was assumed from a neighbour. The Met's search endpoint also ignores its `isPublicDomain` and `hasImages` filters (the totals do not change), so each object is read. `/v1/search` was retired on 2026-10-01; `/v1.1/search` is the one in use.

**Why the data is kept in the demo, not fetched live.** Each card's address and credit are written into `demo/vintage-hockey.js` and `demo/vintage-baseball.js` with the date they were checked, so the demo needs no API call (the Met's service answered HTTP 403 to a burst of about 70 requests and recovered in minutes), and the check is repeatable. The pictures themselves load from Commons and the Met.

**What the pictures show.** Real players on cards of their day, with the clubs and the maker named as printed on the card. That is the picture of a public-domain object, not something this package draws or ships; no card of a living or current player is shown, and none is faked.

## Looked at and not used

| Source | What was found | Decision |
|---|---|---|
| Library of Congress, Benjamin K. Edwards baseball cards (2,100 cards, 1887 to 1914) | The finding aid says "no known restrictions on publication" and that individual items' rights were not evaluated; some item pages give only thumbnails outside the Library. Its site returned HTTP 403 to the tools used, so the terms page itself was not read. | Not used for now: a collection-level "no known restrictions" is weaker than the Met's per-object flag. A candidate for a later release if its item records are read one by one. |
| TCDB (Trading Card Database) | No public API found; its terms page returned HTTP 403 to the tools used, so the terms were not read. | Not used. |
| Smithsonian Open Access (CC0) | Its site returned HTTP 403 to the tools used. Its API needs a free key from api.data.gov. | Not used: needs a key. |
| CardSight AI | A card identification service with a free tier of 750 calls a month and a hockey catalogue (vendor press releases, March 2026). Needs an account and a key; image terms not found. | Stopped: needs a key; terms unread. Nothing that bills or needs a key. |
| Trading Card API (cardtechie), Zyla Labs "Sports card and trading card API" | A PHP SDK for a card API with checklists, sets, players and images; a paid API marketplace listing with card prices. Image coverage and terms not confirmed. | Not used: keys and money. |
| NHL and MLB statistics APIs | Banned by the project's rules (red sources). | Not used, not even to look. |
| Sports Reference sites, ESPN | Banned. | Not used. |
| TCGdex (Pokémon) | Already in the demos: MIT code and data, no key. The card pictures are the Pokémon Company's artwork; the service does not state a licence for them. | Kept as the existing demo only, loaded at run time, not shipped, with a disclaimer; not a clean source for anything new. |

## What the demos do now

- `demo/collections-component.html`: Pokémon Base Set cards by TCGdex (Alex 25, Sam a pack of 10) and Hako Devices drawings (Riley 5).
- `demo/vintage.html`: the public-domain hockey and baseball cards, in every display, with each card's source named.
