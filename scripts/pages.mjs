// The Card Studio and the Builder, written from their templates in demo/ with the family's header, footer and language script. `pnpm site` writes them into site/, and the
// tests' server and `pnpm dev` call the same function, so what a test opens is the page the site publishes. The paths in a template are the paths of the written page: the
// site's root, with demo/, dist/ and node_modules/ beside it.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  FAMILY_EMBED_BUILDER_WORDS,
  FAMILY_SCRIPT,
  familyEmbedBuilder,
  familyFooter,
  familyHead,
  familyHeader,
  familyUnreviewed,
} from "./family-template.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
export const ID = "fuda-cards";
const TITLE = "Fuda Cards 札 — Collectible card frames for the web";

/** The mark in the tab: a card on a stack. */
const ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect x='24' y='16' width='56' height='72' rx='9' fill='%23ab742c'/%3E%3Crect x='18' y='10' width='56' height='72' rx='9' fill='%23fbdf87' stroke='%239c702d' stroke-width='4'/%3E%3Crect x='28' y='22' width='36' height='28' rx='3' fill='%23273c4c'/%3E%3C/svg%3E";

const KAZOKU = "./node_modules/@johnmorrisdotca/kazoku-ui/dist";
/** The kazoku-ui parts the pages use, found by the bare names the scripts import them by. */
const IMPORT_MAP = JSON.stringify({
  imports: {
    "@johnmorrisdotca/kazoku-ui/view-controls/define": `${KAZOKU}/view-controls/define.js`,
    "@johnmorrisdotca/kazoku-ui/language-picker/define": `${KAZOKU}/language-picker/define.js`,
    "@johnmorrisdotca/kazoku-ui/theme-switch/define": `${KAZOKU}/theme-switch/define.js`,
  },
});

const links = (here) =>
  [
    { href: "./", say: "toStudio" },
    { href: "builder.html", say: "toBuilder" },
    { href: "demo/collections-component.html", say: "toCollections" },
    { href: "demo/tcgdex.html", say: "toBinder" },
    { href: "demo/vintage.html", say: "toVintage" },
    { href: "demo/live-3d.html", say: "toLive" },
    { href: "docs/index.html", say: "pageDocs" },
  ].filter((link) => link.say !== here);

const PAGES = {
  index: {
    template: "demo/index.html",
    title: TITLE,
    description:
      "Collectible card frames for the web: a true thickness, foil, stacks, wear and a binder, as two web components. Turn, tip and zoom a card, and change anything about it.",
    here: "toStudio",
  },
  builder: {
    template: "demo/builder.html",
    title: `${TITLE.replace(" — ", " · ")} · Builder`,
    description: "Choose how a card or a collection looks, see it live, and copy the code for your page.",
    here: "toBuilder",
  },
};

/**
 * The page called `name` (`index` or `builder`), as HTML. `thumbnails` is the family's card for the page's head (og:image, twitter:image, the icon:
 * `thumbnailHead(pkg)`), which the site build adds; a test's or the dev server's page has none.
 */
export function renderPage(name, thumbnails = "") {
  const page = PAGES[name];
  if (page === undefined) throw new Error(`There is no page called ${name}`);
  const parts = {
    head: familyHead({
      id: ID,
      title: page.title,
      description: page.description,
      ogTitle: "Fuda Cards 札",
      ogDescription: "Collectible card frames for the web, with a true thickness, foil, stacks, wear and a binder.",
    }),
    icon: `<link rel="icon" href="${ICON}" />${thumbnails === "" ? "" : `\n    ${thumbnails}`}`,
    importmap: `<script type="importmap">${IMPORT_MAP}</script>\n    <script type="module">import "@johnmorrisdotca/kazoku-ui/language-picker/define"; import "@johnmorrisdotca/kazoku-ui/theme-switch/define";</script>`,
    header: familyHeader({ id: ID, links: links(page.here) }),
    unreviewed: familyUnreviewed({ id: ID }),
    footer: familyFooter({ id: ID }),
    script: `<script>${FAMILY_SCRIPT}</script>`,
  };
  return readFileSync(join(root, page.template), "utf8").replace(/<!-- family:([A-Za-z]+) -->/g, (_match, key) => {
    if (!(key in parts))
      throw new Error(`${page.template} asks for family:${key}, which scripts/pages.mjs does not know`);
    return parts[key];
  });
}

/** The addresses the pages are served at, for the tests' server and `pnpm dev`: address -> page name. */
export const PAGE_ADDRESSES = { "/": "index", "/index.html": "index", "/builder.html": "builder" };

/** The family's embed builder, which the template keeps as a function, written as a module a page can import (demo/family-embed-builder.js). */
export function embedBuilderModule() {
  return `export const FAMILY_EMBED_BUILDER_WORDS = ${JSON.stringify(FAMILY_EMBED_BUILDER_WORDS)};\nexport ${familyEmbedBuilder.toString()};\n`;
}

/** The files the site has that are not in the repository as they are: the address and what is sent. */
export const MADE_FILES = { "/demo/family-embed-builder.js": embedBuilderModule };
