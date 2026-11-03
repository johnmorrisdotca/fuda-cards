// The collection of embed-collection.html, from the address: every parameter that names an attribute of <fuda-collection> is put on it.
import "../dist/collection-element.js";

const query = new URLSearchParams(location.search);
const collection = document.createElement("fuda-collection");
for (const [name, value] of query) {
  if (name === "cards" || !/^[a-z][a-z-]*$/.test(name)) continue;
  collection.setAttribute(name, value === "1" ? "" : value);
}
const hues = [0, 35, 60, 120, 170, 200, 240, 280, 320, 15, 90, 260];
const picture = (n) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 245 337" width="245" height="337"><rect width="245" height="337" rx="12" fill="hsl(${hues[n % 12]} 60% 30%)"/><rect x="12" y="12" width="221" height="313" rx="8" fill="none" stroke="hsl(${hues[n % 12]} 60% 70%)" stroke-width="3"/><text x="122" y="190" font-family="Georgia,serif" font-size="64" text-anchor="middle" fill="white">${n + 1}</text></svg>`)}`;
const sample = Array.from({ length: 18 }, (_, i) => ({ id: `c${i + 1}`, name: `Card ${i + 1}`, image: picture(i) }));
document.body.append(collection);
const source = query.get("cards");
if (source && /^(https?:|\.{0,2}\/)/.test(source)) {
  fetch(source)
    .then((response) => response.json())
    .then((cards) => {
      collection.cards = cards;
    })
    .catch(() => {
      collection.cards = sample;
    });
} else collection.cards = sample;
