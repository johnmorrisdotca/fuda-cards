// The card detail dialog.
import type { CollectionHost } from "./collection-host.js";

export function renderDetail(host: CollectionHost) {
  const dlg = host.q<HTMLDialogElement>("dialog");
  dlg.replaceChildren();
  const close = document.createElement("button");
  close.textContent = "Close";
  close.onclick = () => dlg.close();
  dlg.append(close);
  if (host.selected) {
    const img = document.createElement("img");
    img.className = "detail";
    img.src = host.back && host.selected.backImage ? host.selected.backImage : host.selected.image;
    img.alt = `${host.selected.name}, ${host.back ? "back" : "front"}`;
    const label = document.createElement("p");
    label.textContent = host.selected.name;
    dlg.append(img, label);
    if (host.selected.backImage) {
      const flip = document.createElement("button");
      flip.textContent = host.back ? "Show front" : "Show back";
      flip.onclick = () => {
        host.back = !host.back;
        renderDetail(host);
      };
      dlg.append(flip);
    }
  }
  if (!dlg.open) dlg.showModal();
}
