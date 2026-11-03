// Runs every example in the README and the guides (`pnpm test:readme`, after a build): the same idea as chizu's, with a browser for the HTML.
//   - A fenced `ts`, `js` or `mjs` block is written to its own file under .readme-examples/ and imports the package by its name, as a reader would
//     (the package names itself through its `exports`, so this is the built package of this checkout). TypeScript blocks are type-checked together,
//     strictly, then run in Node; JavaScript blocks are run. Flags after the language: `no-run` type-checks and does not run (the block needs a
//     browser), `no-check` skips the block (an excerpt). A block that ends in comment lines (`// 20.8`) says what it prints: they are compared.
//   - A fenced `html` block is opened in Chromium (headless, drawing in software, through the tests' own launch()), as its own page with an import map
//     for the package's entry points, kazoku-ui and three. It passes when the page throws nothing, logs no error, and every <fuda-card> and
//     <fuda-collection> in it is defined and has drawn. `no-check` skips a block. Flags: `wait=<selector>` waits for a selector inside the page.
// A block that fails is named by its file and line.
import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import process from 'node:process';
import { launch, serve, offline, root, cardSvg } from '../test/e2e/support.mjs';

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const work = join(root, '.readme-examples');
rmSync(work, { recursive: true, force: true });
mkdirSync(work, { recursive: true });

const files = ['README.md'];
for (const dir of ['docs/guides']) for (const file of readdirSync(join(root, dir)).sort()) if (file.endsWith('.md')) files.push(`${dir}/${file}`);
const blocks = [];
for (const file of files) {
  const text = readFileSync(join(root, file), 'utf8').replace(/\r\n/g, '\n');
  for (const match of text.matchAll(/^```(\S+)([^\n]*)\n([\s\S]*?)\n```$/gm)) {
    const line = text.slice(0, match.index).split('\n').length;
    const flags = match[2].trim().split(/\s+/).filter(Boolean), language = match[1];
    if (flags.includes('no-check') || !['ts', 'js', 'mjs', 'html'].includes(language)) continue;
    blocks.push({ file, line, language, flags, body: match[3], where: `${file}:${line}` });
  }
}
if (!blocks.length) { console.error('no ts, js or html block to run'); process.exit(1); }

let failed = 0, count = 0;
const fail = (where, message) => { failed += 1; console.error(`FAIL ${where}: ${message}`); };

// 1. TypeScript and JavaScript.
const code = blocks.filter((block) => block.language !== 'html').map((block, index) => {
  const typescript = block.language === 'ts';
  const path = join(work, `block-${index}.${typescript ? 'ts' : 'mjs'}`);
  writeFileSync(path, `${block.body}\nexport {};\n`);
  return { ...block, path, typescript, run: !block.flags.includes('no-run') };
});
const typed = code.filter((block) => block.typescript);
if (typed.length) {
  writeFileSync(join(work, 'tsconfig.json'), JSON.stringify({
    compilerOptions: { target: 'ES2022', lib: ['dom', 'dom.iterable', 'es2023'], module: 'esnext', moduleResolution: 'bundler', strict: true, noEmit: true, skipLibCheck: true, types: [] },
    include: typed.map((block) => relative(work, block.path)),
  }));
  const checked = spawnSync(process.execPath, [join(root, 'node_modules', 'typescript', 'bin', 'tsc'), '-p', join(work, 'tsconfig.json')], { cwd: root, encoding: 'utf8' });
  const names = new Map(typed.map((block) => [relative(root, block.path), block]));
  if (checked.status !== 0) fail('type check', (checked.stdout + checked.stderr).replace(/\.readme-examples\/block-\d+\.ts\((\d+),(\d+)\)/g, (all, row, column) => { const block = names.get(all.split('(')[0]); return block ? `${block.file}:${block.line + Number(row)}:${column}` : all; }).trim());
  else console.log(`ok   ${typed.length} TypeScript block${typed.length === 1 ? '' : 's'} type-check`);
}
for (const block of code) {
  count += 1;
  if (!block.run) continue;
  const ran = spawnSync(process.execPath, [block.path], { cwd: root, encoding: 'utf8', timeout: 60_000 });
  const lines = block.body.trimEnd().split('\n');
  let tail = lines.length;
  while (tail > 0 && lines[tail - 1].startsWith('// ')) tail -= 1;
  const expected = tail < lines.length ? lines.slice(tail).map((line) => line.slice(3)).join('\n') : null;
  if (ran.status !== 0) fail(block.where, `the block did not run\n${(ran.stderr || ran.stdout).trim().split('\n').slice(0, 10).join('\n')}`);
  else if (expected !== null && ran.stdout.trimEnd() !== expected) fail(block.where, `it printed\n${ran.stdout.trimEnd()}\nand its comment says\n${expected}`);
  else console.log(`ok   ${block.where} ran${ran.stdout.trim() ? `: ${ran.stdout.trim().split('\n').slice(0, 3).join(' | ').slice(0, 100)}` : ''}`);
}

// 2. HTML, in a browser.
const html = blocks.filter((block) => block.language === 'html');
if (html.length) {
  const PORT = Number(process.env.FUDA_README_PORT) || 8103;
  const importMap = { imports: {
    [pkg.name]: '/dist/index.js', [`${pkg.name}/element`]: '/dist/element.js', [`${pkg.name}/collection`]: '/dist/collection.js', [`${pkg.name}/collection-element`]: '/dist/collection-element.js', [`${pkg.name}/live-3d`]: '/dist/live-3d.js',
    '@johnmorrisdotca/kazoku-ui/view-controls/define': '/node_modules/@johnmorrisdotca/kazoku-ui/dist/view-controls/define.js',
    '@johnmorrisdotca/kazoku-ui/renderer': '/node_modules/@johnmorrisdotca/kazoku-ui/dist/renderer/index.js',
    three: '/node_modules/three/build/three.module.js', 'three/addons/': '/node_modules/three/examples/jsm/',
  } };
  const server = serve(PORT);
  const browser = await launch();
  try {
    for (const block of html) {
      count += 1;
      const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
      const problems = [];
      page.on('pageerror', (error) => problems.push(`error: ${error.message}`));
      page.on('console', (message) => { if (message.type() === 'error' && !/Failed to load resource/.test(message.text())) problems.push(`console: ${message.text()}`); });
      await offline(page);
      await page.route(/\.(jpg|jpeg|png|webp)(\?|$)/, (route) => route.fulfill({ contentType: 'image/svg+xml', body: cardSvg('Example') }));
      const wait = block.flags.find((flag) => flag.startsWith('wait='))?.slice(5);
      const map = `<script type="importmap">${JSON.stringify(importMap)}</script>`;
      const source = /<html[\s>]/i.test(block.body) ? block.body.replace(/<head[^>]*>/i, (head) => head + map) : `<!doctype html><html><head><meta charset="utf-8">${map}</head><body>${block.body}</body></html>`;
      await page.route(`http://127.0.0.1:${PORT}/__example.html`, (route) => route.fulfill({ contentType: 'text/html', body: source }));
      try {
        await page.goto(`http://127.0.0.1:${PORT}/__example.html`);
        const names = await page.evaluate(() => [...new Set([...document.querySelectorAll('*')].map((el) => el.localName).filter((name) => name.startsWith('fuda-')))]);
        for (const name of names) await page.waitForFunction((tag) => customElements.get(tag) !== undefined, name, { timeout: 15000 });
        for (const name of names) await page.waitForFunction((tag) => [...document.querySelectorAll(tag)].every((el) => el.shadowRoot && el.shadowRoot.childElementCount > 0), name, { timeout: 15000 });
        if (wait) await page.waitForSelector(wait, { timeout: 15000 });
        await page.waitForTimeout(300);
        if (!names.length && !/<script/.test(block.body)) problems.push('the block has no <fuda-…> element and no script');
        if (problems.length) fail(block.where, problems.join('; '));
        else console.log(`ok   ${block.where} drew ${names.join(', ') || 'a script'} in Chromium`);
      } catch (error) { fail(block.where, `${error.message.split('\n')[0]}${problems.length ? `; ${problems.join('; ')}` : ''}`); }
      finally { await page.close(); }
    }
  } finally { await browser.close(); server.close(); }
}
rmSync(work, { recursive: true, force: true });
if (failed) { console.error(`${failed} of ${count} examples failed`); process.exit(1); }
console.log(`all ${count} of ${pkg.name}'s README and guide examples hold`);
