// The browser tests, one file at a time and one browser at a time, with a hard limit on each file's time and on the memory of everything it started.
// Usage: node scripts/e2e.mjs [part of a file name ...]. A file that goes over a limit is stopped (only the one process this script started) and counts as failed.
import { execFileSync, spawn } from "node:child_process";
import { readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const FILE_MS = Number(process.env.FUDA_E2E_FILE_MS) || 20 * 60_000;
const MEMORY_KB = (Number(process.env.FUDA_E2E_MEMORY_GB) || 3) * 1024 * 1024;
const SHIFT = Number(process.env.FUDA_E2E_PORT_SHIFT) || 0;
const PORTS = Array.from({ length: 10 }, (_, i) => 8110 + i + SHIFT);
const wanted = process.argv.slice(2);
const files = readdirSync(resolve(root, "test/e2e"))
  .filter((f) => f.endsWith(".e2e.mjs") && (!wanted.length || wanted.some((w) => f.includes(w))))
  .sort();

for (const port of PORTS) {
  let holder = "";
  try {
    holder = execFileSync("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-t"], { encoding: "utf8" }).trim();
  } catch {}
  if (holder) {
    console.error(
      `Port ${port} is taken by process ${holder}: another session may be running these tests (FUDA_E2E_PORT_SHIFT=20 moves this run). Nothing started.`,
    );
    process.exit(2);
  }
}

/** The memory of every process under `pid`, in kB, from one reading of ps. Read only: nothing here chooses a process to stop. */
function treeMemory(pid) {
  const rows = execFileSync("ps", ["-A", "-o", "pid=,ppid=,rss="], { encoding: "utf8" })
    .trim()
    .split("\n")
    .map((l) => l.trim().split(/\s+/).map(Number));
  const inside = new Set([pid]);
  for (let grown = true; grown; ) {
    grown = false;
    for (const [p, parent] of rows)
      if (inside.has(parent) && !inside.has(p)) {
        inside.add(p);
        grown = true;
      }
  }
  return rows.filter(([p]) => inside.has(p)).reduce((sum, [, , rss]) => sum + rss, 0);
}

function runFile(file) {
  return new Promise((done) => {
    const started = Date.now();
    const child = spawn(
      process.execPath,
      ["--test", "--test-isolation=none", "--test-concurrency=1", resolve(root, "test/e2e", file)],
      { cwd: root, stdio: ["ignore", "pipe", "inherit"] },
    );
    let output = "";
    let peak = 0;
    let why = "";
    child.stdout.on("data", (chunk) => {
      process.stdout.write(chunk);
      output += chunk;
    });
    // The one process this script started, by its own handle, and nothing else: it runs the tests in itself, so Playwright closes its browsers when it stops, and a browser whose pipe is gone ends by itself.
    const watch = setInterval(() => {
      let kb;
      try {
        kb = treeMemory(child.pid);
      } catch {
        return;
      }
      peak = Math.max(peak, kb);
      if (!why && kb > MEMORY_KB) why = `memory ${(kb / 1048576).toFixed(2)} GB`;
      if (!why && Date.now() - started > FILE_MS) why = `over ${FILE_MS / 60000} minutes`;
      if (why && !watch.stopping) {
        watch.stopping = true;
        console.error(`\n${file}: stopping it (${why}): ${child.pid}`);
        child.kill("SIGTERM");
        setTimeout(() => child.kill("SIGKILL"), 5000).unref();
      }
    }, 2000);
    child.on("close", (code) => {
      clearInterval(watch);
      const count = (name) => Number(output.match(new RegExp(`^(?:# |ℹ )${name} (\\d+)`, "m"))?.[1] ?? 0);
      done({
        file,
        code,
        why,
        seconds: Math.round((Date.now() - started) / 1000),
        peakGB: (peak / 1048576).toFixed(2),
        tests: count("tests"),
        pass: count("pass"),
        fail: count("fail"),
        skipped: count("skipped"),
      });
    });
  });
}

const results = [];
for (const file of files) results.push(await runFile(file));
console.log("\nfile                         tests pass fail skip  secs  peak GB");
for (const r of results)
  console.log(
    `${r.file.padEnd(28)} ${String(r.tests).padStart(5)} ${String(r.pass).padStart(4)} ${String(r.fail).padStart(4)} ${String(r.skipped).padStart(4)} ${String(r.seconds).padStart(5)}  ${r.peakGB}${r.why ? `  STOPPED: ${r.why}` : ""}`,
  );
const total = (k) => results.reduce((sum, r) => sum + r[k], 0);
console.log(
  `\n${files.length} files: ${total("tests")} tests, ${total("pass")} pass, ${total("fail")} fail, ${total("skipped")} skipped`,
);
process.exit(results.every((r) => r.code === 0 && !r.why) ? 0 : 1);
