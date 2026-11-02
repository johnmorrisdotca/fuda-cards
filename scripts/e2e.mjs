// The browser tests, one file at a time and one browser at a time, with a hard limit on each file's time and on the memory of everything it started.
// Usage: node scripts/e2e.mjs [part of a file name ...]. A file that goes over a limit is stopped, by process id, and counts as failed.
import { spawn, execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const FILE_MS = Number(process.env.FUDA_E2E_FILE_MS) || 20 * 60_000;
const MEMORY_KB = (Number(process.env.FUDA_E2E_MEMORY_GB) || 3) * 1024 * 1024;
const SHIFT = Number(process.env.FUDA_E2E_PORT_SHIFT) || 0;
const PORTS = Array.from({ length: 10 }, (_, i) => 8110 + i + SHIFT);
const wanted = process.argv.slice(2);
const files = readdirSync(resolve(root, 'test/e2e')).filter((f) => f.endsWith('.e2e.mjs') && (!wanted.length || wanted.some((w) => f.includes(w)))).sort();

for (const port of PORTS) {
  let holder = '';
  try { holder = execFileSync('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-t'], { encoding: 'utf8' }).trim(); } catch {}
  if (holder) { console.error(`Port ${port} is taken by process ${holder}: another session may be running these tests (FUDA_E2E_PORT_SHIFT=20 moves this run). Nothing started.`); process.exit(2); }
}

/** Every process under `pid` (itself too), with its memory in kB, from one reading of ps. */
function tree(pid) {
  const rows = execFileSync('ps', ['-A', '-o', 'pid=,ppid=,rss='], { encoding: 'utf8' }).trim().split('\n').map((l) => l.trim().split(/\s+/).map(Number));
  const inside = new Set([pid]);
  for (let grown = true; grown;) { grown = false; for (const [p, parent] of rows) if (inside.has(parent) && !inside.has(p)) { inside.add(p); grown = true; } }
  const members = rows.filter(([p]) => inside.has(p));
  return { pids: members.map(([p]) => p), kb: members.reduce((sum, [, , rss]) => sum + rss, 0) };
}

const stopAll = (pids, signal) => { for (const pid of pids) { try { process.kill(pid, signal); } catch {} } };

function runFile(file) {
  return new Promise((done) => {
    const started = Date.now();
    const child = spawn(process.execPath, ['--test', '--test-concurrency=1', resolve(root, 'test/e2e', file)], { cwd: root, stdio: ['ignore', 'pipe', 'inherit'] });
    let output = '', peak = 0, why = '';
    child.stdout.on('data', (chunk) => { process.stdout.write(chunk); output += chunk; });
    let last = [];
    const watch = setInterval(() => {
      let now;
      try { now = tree(child.pid); } catch { return; }
      last = now.pids; peak = Math.max(peak, now.kb);
      if (!why && now.kb > MEMORY_KB) why = `memory ${(now.kb / 1048576).toFixed(2)} GB`;
      if (!why && Date.now() - started > FILE_MS) why = `over ${FILE_MS / 60000} minutes`;
      if (why && !watch.stopping) {
        watch.stopping = true;
        console.error(`\n${file}: stopping it (${why}): ${last.join(' ')}`);
        stopAll(last, 'SIGTERM');
        setTimeout(() => stopAll(last, 'SIGKILL'), 5000).unref();
      }
    }, 2000);
    child.on('close', (code) => {
      clearInterval(watch);
      const count = (name) => Number(output.match(new RegExp(`^(?:# |ℹ )${name} (\\d+)`, 'm'))?.[1] ?? 0);
      done({ file, code, why, seconds: Math.round((Date.now() - started) / 1000), peakGB: (peak / 1048576).toFixed(2), tests: count('tests'), pass: count('pass'), fail: count('fail'), skipped: count('skipped') });
    });
  });
}

const results = [];
for (const file of files) results.push(await runFile(file));
console.log('\nfile                         tests pass fail skip  secs  peak GB');
for (const r of results) console.log(`${r.file.padEnd(28)} ${String(r.tests).padStart(5)} ${String(r.pass).padStart(4)} ${String(r.fail).padStart(4)} ${String(r.skipped).padStart(4)} ${String(r.seconds).padStart(5)}  ${r.peakGB}${r.why ? `  STOPPED: ${r.why}` : ''}`);
const total = (k) => results.reduce((sum, r) => sum + r[k], 0);
console.log(`\n${files.length} files: ${total('tests')} tests, ${total('pass')} pass, ${total('fail')} fail, ${total('skipped')} skipped`);
process.exit(results.every((r) => r.code === 0 && !r.why) ? 0 : 1);
