// Packs the package the way it is published (`npm pack`), installs the tarball into an empty project and uses it as somebody who installed it would: every file that
// `exports` points at is in the tarball, the entries that run on a server (the main one, the collection helpers) are imported by name, and the elements' modules are
// imported against a stub of the few browser globals they touch when they are evaluated. No picture and nothing from docs/ guides is in what is installed
// except what `files` names. `pnpm test:package` builds first.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const windows = process.platform === "win32";
const scratch = mkdtempSync(join(tmpdir(), "fuda-cards-package-"));

/** Run a command and hand back what it printed; on Windows npm is a .cmd file, which only a shell runs. */
function run(command, args, cwd) {
  const ran = spawnSync(command, args, { cwd, encoding: "utf8", shell: windows && command === "npm" });
  if (ran.status !== 0) {
    console.error(`FAIL ${command} ${args.join(" ")}\n${ran.stdout}\n${ran.stderr}`);
    process.exit(1);
  }
  return ran.stdout;
}

// 1. Pack, with npm.
const packed = JSON.parse(run("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", scratch], root));
const tarball = join(scratch, packed[0].filename);
const inTarball = new Set(packed[0].files.map((file) => file.path));
console.log(`ok   npm pack: ${packed[0].filename}, ${packed[0].files.length} files`);
const pictures = [...inTarball].filter((file) => /\.(webp|png|jpe?g|gif)$/.test(file));
if (pictures.length > 0) {
  console.error(`FAIL the tarball holds pictures: ${pictures.join(", ")}`);
  process.exit(1);
}
console.log("ok   no picture is in the tarball");

// 2. Everything package.json points at is in the tarball.
const targets = [];
const walk = (value) => {
  if (typeof value === "string") targets.push(value);
  else if (value && typeof value === "object") for (const one of Object.values(value)) walk(one);
};
walk(pkg.exports);
for (const target of targets) {
  if (target === "./package.json") continue;
  if (!inTarball.has(target.replace(/^\.\//, ""))) {
    console.error(`FAIL exports names ${target}, which is not in the tarball`);
    process.exit(1);
  }
}
console.log(`ok   all ${targets.length} files that exports names are in the tarball`);
if (!inTarball.has("LICENSE") && existsSync(join(root, "LICENSE"))) {
  console.error("FAIL LICENSE is in the repository and not in the tarball");
  process.exit(1);
}

// 3. Install it into an empty project, with its one dependency.
const project = join(scratch, "project");
mkdirSync(project);
writeFileSync(join(project, "package.json"), JSON.stringify({ name: "consumer", private: true, type: "module" }));
run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", tarball], project);
const installed = join(project, "node_modules", ...pkg.name.split("/"));
console.log("ok   installed into an empty project");

// 4. Use it: the entries that run anywhere by name, and the elements against a stub of the browser.
const probe = `
const main = await import(${JSON.stringify(pkg.name)});
const collection = await import(${JSON.stringify(`${pkg.name}/collection`)});
const live = await import(${JSON.stringify(`${pkg.name}/live-3d`)});
if (main.VERSION !== ${JSON.stringify(pkg.version)}) throw new Error("VERSION is " + main.VERSION);
if (main.cardMaterial("steel-0.5")?.thicknessMm !== 0.5) throw new Error("cardMaterial is off");
if (main.stackHeightMm(52, main.DEFAULT_CARD_THICKNESS_MM) !== 16.9) throw new Error("stackHeightMm is off");
if (main.cardAttributes({ stackMessiness: 0.5, flipped: true }).flipped !== "") throw new Error("cardAttributes is off");
if (collection.parseCollection([{ name: "A", image: "a" }])[0].id !== "0") throw new Error("parseCollection is off");
if (typeof live.createLiveCards !== "function") throw new Error("createLiveCards is missing");
// The elements extend HTMLElement and register themselves when their module is evaluated: a stub of the globals they touch is enough to evaluate them.
const registered = [];
globalThis.HTMLElement = class {};
globalThis.customElements = { get: () => undefined, define: (name) => registered.push(name) };
globalThis.document = { createElement: () => ({ content: { cloneNode: () => ({}) }, set innerHTML(value) {} }), addEventListener() {} };
await import(${JSON.stringify(`${pkg.name}/element`)});
if (!registered.includes("fuda-card")) throw new Error("the card element did not register");
console.log("ok   the entries import and work: " + Object.keys(main).length + " names in the main one, fuda-card registers");
`;
const probeFile = join(project, "probe.mjs");
writeFileSync(probeFile, probe);
console.log(run(process.execPath, [probeFile], project).trim());
console.log(
  `ok   ${pathToFileURL(installed).pathname.split("/").slice(-2).join("/")} ${pkg.version} is installed and used`,
);
