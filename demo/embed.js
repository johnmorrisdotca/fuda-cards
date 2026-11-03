// The card of embed.html, from the address: every parameter that names an attribute of <fuda-card> is put on it, and `image` is its picture.
import "../dist/element.js";

const query = new URLSearchParams(location.search);
const card = document.createElement("fuda-card");
for (const [name, value] of query) {
  if (name === "image" || !/^[a-z][a-z-]*$/.test(name)) continue;
  card.setAttribute(name, value === "1" ? "" : value);
}
const art = document.createElement("img");
art.alt = query.get("title") ?? "";
const image = query.get("image");
art.src = image && /^(https?:|data:image\/|\.{0,2}\/)/.test(image) ? image : "../assets/starship-v3-preview.jpg";
card.append(art);
document.body.append(card);
