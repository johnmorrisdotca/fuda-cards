// Fifty rockets in a binder and three in framed cards, all on one WebGL context: fuda-cards' focus policy (dist/live-3d.js) over kazoku-ui's shared renderer.
import "../dist/element.js";
import "../dist/collection-element.js";
import { createLiveCards } from "../dist/live-3d.js";

const assetsAt = "../node_modules/@johnmorrisdotca/uchusen-rockets/dist/assets/";
const models = [
  ["Starship Block 3", "starship-v3"],
  ["Starship Block 2", "starship-v2"],
  ["Starship Block 1", "starship-v1"],
  ["Falcon 9 Block 5", "falcon-9-block-5"],
  ["Falcon 9 Full Thrust", "falcon-9-ft"],
  ["Falcon Heavy", "falcon-heavy-falcon-heavy"],
  ["Dragon 2 capsule", "dragon-dragon-2-capsule"],
  ["Dragon 1 capsule", "dragon-dragon-1-capsule"],
];
const picture = (file) => `${assetsAt}${file}.painted.svg`;

/** A rocket as a scene for a card: its geometry and materials are shared with every other card that shows the same rocket, and freed when the last one lets go. */
const rocket = (file) => ({
  key: `rocket:${file}`,
  async build({ three, assets, width, height }) {
    const gltf = await assets.acquire(
      `glb:${file}`,
      () => new three.GLTFLoader().loadAsync(`${assetsAt}${file}.glb`),
      (loading) => {
        loading.then((g) => three.disposeDeep(g.scene));
      },
    );
    const object = gltf.scene.clone(true);
    const box = new three.Box3().setFromObject(object);
    const size = box.getSize(new three.Vector3());
    const centre = box.getCenter(new three.Vector3());
    object.position.sub(centre);
    const holder = new three.Group();
    holder.add(object);
    const scene = new three.Scene();
    scene.add(holder, new three.HemisphereLight(0xffffff, 0x445066, 2.2));
    const sun = new three.DirectionalLight(0xffffff, 2.4);
    sun.position.set(2, 3, 4);
    scene.add(sun);
    const camera = new three.PerspectiveCamera(30, width / height, 0.01, 10000);
    const frame = (w, h) => {
      camera.aspect = w / h;
      const tall = size.y / 2 / Math.tan((camera.fov * Math.PI) / 360);
      const wide = Math.max(size.x, size.z) / 2 / Math.tan((camera.fov * Math.PI) / 360) / camera.aspect;
      camera.position.set(0, 0, Math.max(tall, wide) * 1.25 + Math.max(size.x, size.z) / 2);
      camera.updateProjectionMatrix();
    };
    frame(width, height);
    return { scene, camera, object: holder, resize: frame };
  },
});

// `load` is the only way three reaches this page, and it runs when a card first goes live.
export const live = createLiveCards({
  load: async () => {
    const [three, { GLTFLoader }, { disposeDeep }] = await Promise.all([
      import("three"),
      import("three/addons/loaders/GLTFLoader.js"),
      import("@johnmorrisdotca/kazoku-ui/renderer"),
    ]);
    return { ...three, GLTFLoader, disposeDeep };
  },
});

const framed = document.querySelector("#framed");
for (const [name, file] of models.slice(3, 6)) {
  const card = document.createElement("fuda-card");
  card.title = name;
  card.setAttribute("title", name);
  card.setAttribute("category", "ROCKET");
  card.setAttribute("subtitle", "Rest on me");
  card.setAttribute("description", "A picture until it is in focus.");
  card.tabIndex = 0;
  const img = document.createElement("img");
  img.src = picture(file);
  img.alt = name;
  card.append(img);
  framed.append(card);
  live.add(card, rocket(file), { still: img });
}

const binder = document.querySelector("#binder");
binder.cards = Array.from({ length: 50 }, (_, i) => {
  const [name, file] = models[i % models.length];
  return { id: `r${i}`, name: `${name} No. ${i + 1}`, image: picture(file), kind: "object" };
});
const files = new Map(Array.from({ length: 50 }, (_, i) => [`r${i}`, models[i % models.length][1]]));
const items = new Map(models.map(([, file]) => [file, rocket(file)]));
binder.live = { cards: live, item: (card) => items.get(files.get(card.id)) };

const stats = document.querySelector("#stats");
const showStats = () => {
  const s = live.stats;
  stats.textContent = s
    ? `WebGL contexts ${s.contexts}, draws ${s.draws}, canvas ${(s.canvas.pixels / 1e6).toFixed(2)} MP, stills ${s.stills.count}${live.focused ? ", one card live" : ", all pictures"}`
    : "No 3D code loaded yet: every card is a picture.";
};
showStats();
// Only on a press or a focus change, never on a timer.
for (const type of ["pointerover", "focusin", "pointerdown"])
  document.addEventListener(type, () => setTimeout(showStats, 400));
window.fudaLive = live;
window.fudaRocket = rocket;
