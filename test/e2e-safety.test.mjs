import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const scripts = [...readdirSync(resolve(root, 'test/e2e')).filter((f) => f.endsWith('.mjs')).map((f) => `test/e2e/${f}`), ...readdirSync(resolve(root, 'scripts')).map((f) => `scripts/${f}`)];
const read = (f) => readFileSync(resolve(root, f), 'utf8');

// A test run on a Mac's own GPU once panicked its graphics driver. No browser here may draw on the GPU or open a window.
test('a browser is started only through the software launch in test/e2e/support.mjs', () => {
  for (const file of scripts) {
    if (file === 'test/e2e/support.mjs') continue;
    assert.doesNotMatch(read(file), /\.launch\(|launchServer|launchPersistentContext|connectOverCDP|headless:\s*false|require\('playwright'\)/, `${file} starts a browser of its own`);
  }
});

test('the launch is headless, draws in software, checks it and has a time limit', () => {
  const support = read('test/e2e/support.mjs');
  for (const arg of ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']) assert.ok(support.includes(arg), `support.mjs has no ${arg}`);
  assert.match(support, /chromium\.launch\(\{ headless: true,[^}]*args: SOFTWARE_GL_ARGS/);
  assert.match(support, /swiftshader\/i\.test\(renderer\)/);
  assert.match(support, /if \(!process\.env\.CI\) webkit = undefined/);
  assert.match(support, /BROWSER_LIFE_MS/);
});

test('the browser tests run one file at a time, with limits', () => {
  assert.match(read('package.json'), /"test:e2e": "pnpm build && node scripts\/e2e\.mjs"/);
  const runner = read('scripts/e2e.mjs');
  assert.match(runner, /--test-concurrency=1/);
  assert.match(runner, /FUDA_E2E_MEMORY_GB\) \|\| 3/);
  assert.doesNotMatch(runner, /pkill|killall/);
});
