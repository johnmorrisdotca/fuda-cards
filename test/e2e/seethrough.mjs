// Shared by the flip tests: freeze the animations of a scene at sampled moments and check, by pixels, that the card in motion is never
// see-through and never hidden by anything behind it.
//
// For each moment four pictures are taken of the same clip, with the same backdrop (flat magenta, a colour no card uses):
//   A  the scene as a visitor sees it;
//   B  only the moving card drawn (everything else `visibility:hidden`), so what the card looks like by itself;
//   M  the moving card with every face and edge painted opaque grey, so where the card's outline is;
//   C  the empty backdrop.
// Inside M's outline (shrunk by `edge` pixels, so anti-aliasing is left out) a pixel is a fault when
//   `behind`  A differs from B: something else shows through the card, or sits in front of it where it should not; or
//   `clear`   B equals the backdrop: the card by itself lets the backdrop through.
export const BACKDROP = "#ff00ff";

/** Run in the page: pause every animation of `scope` and name the moving cards (the closest `mover` of each animation's target). */
export async function freeze(page, { scope, mover, only }) {
  return page.evaluate(
    ({ scope, mover, only }) => {
      const root = scope ? document.querySelector(scope).shadowRoot : document;
      const all = root.getAnimations({ subtree: true });
      const moving = new Set();
      for (const a of all) {
        const t = a.effect?.target;
        const m = t?.closest?.(mover);
        if (m && (!only || t.matches(only) || t.closest(only))) moving.add(m);
      }
      window.__fz = { root, all, moving: [...moving] };
      for (const a of all) a.pause();
      for (const m of window.__fz.moving) m.setAttribute("data-mv", "");
      return {
        animations: all.length,
        moving: window.__fz.moving.length,
        ms: Math.max(0, ...all.map((a) => a.effect.getComputedTiming().endTime)),
      };
    },
    { scope, mover, only },
  );
}

/** Move every frozen animation to the fraction `f` of its own length. */
export const seek = (page, f) =>
  page.evaluate((f) => {
    for (const a of window.__fz.all) a.currentTime = a.effect.getComputedTiming().endTime * f;
  }, f);

const styleFor = (kind, { hide, faces, backdrop, backdropDoc, extra = "" }) => {
  const base =
    (backdrop && !backdropDoc ? `${backdrop}{background:${BACKDROP} !important;box-shadow:none !important}` : "") +
    extra;
  if (kind === "A") return base;
  const only = `${hide} *{visibility:hidden !important}[data-mv],[data-mv] *{visibility:visible !important}`;
  if (kind === "B") return base + only;
  if (kind === "M")
    return (
      base +
      only +
      `:host{filter:none !important}[data-mv] ${faces
        .split(",")
        .map((s) => s.trim())
        .join(
          ",[data-mv] ",
        )}{background:#808080 !important;border-color:#808080 !important;box-shadow:none !important;filter:none !important}[data-mv] :is(${faces}) *{visibility:hidden !important}`
    );
  return `${base}${hide} *{visibility:hidden !important}`;
};

/** Take A, B, M and C of the current moment, clipped to `clip` (a Playwright locator or a rectangle). */
export async function pictures(page, { scope, hide, faces, backdrop, backdropDoc, extra, clip }) {
  const out = {};
  for (const kind of ["A", "B", "M", "C"]) {
    await page.evaluate(
      ({ scope, css, doc }) => {
        const root = scope ? document.querySelector(scope).shadowRoot : document;
        let s = root.querySelector("style[data-seethru]");
        if (!s) {
          s = document.createElement("style");
          s.dataset.seethru = "";
          (scope ? root : document.head).append(s);
        }
        s.textContent = css;
        let d = document.head.querySelector("style[data-seethru-doc]");
        if (!d) {
          d = document.createElement("style");
          d.dataset.seethruDoc = "";
          document.head.append(d);
        }
        d.textContent = doc;
      },
      {
        scope,
        css: styleFor(kind, { hide, faces, backdrop, backdropDoc, extra }),
        doc: backdrop && backdropDoc ? `${backdrop}{background:${BACKDROP} !important}` : "",
      },
    );
    out[kind] = typeof clip.screenshot === "function" ? await clip.screenshot() : await page.screenshot({ clip });
  }
  await page.evaluate(
    ({ scope }) => {
      const root = scope ? document.querySelector(scope).shadowRoot : document;
      root.querySelector("style[data-seethru]")?.remove();
      document.head.querySelector("style[data-seethru-doc]")?.remove();
    },
    { scope },
  );
  return out;
}

/** Count the faults of one moment in the four pictures. `scanner` is a second page of the same browser (it decodes the PNGs). */
export const faults = (scanner, png, { edge = 3, tol = 28, mark = false } = {}) =>
  scanner.evaluate(
    async ({ png, edge, tol, mark }) => {
      const load = async (b64) => {
        const img = new Image();
        img.src = `data:image/png;base64,${b64}`;
        await img.decode();
        const c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        const x = c.getContext("2d", { willReadFrequently: true });
        x.drawImage(img, 0, 0);
        return { w: img.width, h: img.height, d: x.getImageData(0, 0, img.width, img.height).data };
      };
      const [A, B, M, C] = await Promise.all(["A", "B", "M", "C"].map((k) => load(png[k])));
      const { w, h } = A;
      const far = (p, q, i) =>
        Math.max(Math.abs(p.d[i] - q.d[i]), Math.abs(p.d[i + 1] - q.d[i + 1]), Math.abs(p.d[i + 2] - q.d[i + 2])) > tol;
      const inM = new Uint8Array(w * h);
      for (let k = 0; k < w * h; k++) inM[k] = far(M, C, k * 4) ? 1 : 0;
      // Shrink the outline by `edge` pixels.
      let cur = inM;
      for (let r = 0; r < edge; r++) {
        const next = new Uint8Array(w * h);
        for (let y = 1; y < h - 1; y++)
          for (let x = 1; x < w - 1; x++) {
            const k = y * w + x;
            next[k] = cur[k] && cur[k - 1] && cur[k + 1] && cur[k - w] && cur[k + w] ? 1 : 0;
          }
        cur = next;
      }
      let area = 0;
      let behind = 0;
      let clear = 0;
      const canvas = mark ? document.createElement("canvas") : null;
      let ctx;
      let img;
      if (mark) {
        canvas.width = w;
        canvas.height = h;
        ctx = canvas.getContext("2d");
        img = ctx.createImageData(w, h);
      }
      for (let k = 0; k < w * h; k++) {
        const i = k * 4;
        let bad = 0;
        if (cur[k]) {
          area++;
          if (far(A, B, i)) {
            behind++;
            bad = 1;
          }
          if (!far(B, C, i)) {
            clear++;
            bad = 2;
          }
        }
        if (mark) {
          const bx = bad ? [255, bad === 1 ? 0 : 255, 0] : [A.d[i], A.d[i + 1], A.d[i + 2]];
          img.data[i] = bx[0];
          img.data[i + 1] = bx[1];
          img.data[i + 2] = bx[2];
          img.data[i + 3] = 255;
        }
      }
      let marked = null;
      if (mark) {
        ctx.putImageData(img, 0, 0);
        marked = canvas.toDataURL("image/png").split(",")[1];
      }
      return { area, behind, clear, marked };
    },
    { png: Object.fromEntries(Object.entries(png).map(([k, v]) => [k, v.toString("base64")])), edge, tol, mark },
  );
