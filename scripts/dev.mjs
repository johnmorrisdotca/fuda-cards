import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";

const root = resolve(".");
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};
createServer(async (req, res) => {
  try {
    const path = resolve(
      root,
      "." +
        decodeURIComponent(
          new URL(req.url, "http://localhost").pathname === "/"
            ? "/index.html"
            : new URL(req.url, "http://localhost").pathname,
        ),
    );
    if (!path.startsWith(root + sep)) {
      res.writeHead(403).end();
      return;
    }
    const body = await readFile(path);
    res.writeHead(200, { "Content-Type": types[extname(path)] ?? "application/octet-stream" }).end(body);
  } catch {
    res.writeHead(404).end("Not found");
  }
}).listen(8100, "127.0.0.1", () => console.log("Fuda: http://localhost:8100"));
