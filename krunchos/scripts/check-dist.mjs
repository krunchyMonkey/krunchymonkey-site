import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const ALLOWED_EXTENSIONS = new Set([
  ".html",
  ".js",
  ".css",
  ".webp",
  ".png",
  ".svg",
  ".woff2",
  ".ico",
  ".txt",
]);
const TEXT_EXTENSIONS = new Set([".html", ".js", ".css", ".svg", ".txt"]);
const MAX_GZIP_JS = 120 * 1000;
const MAX_GZIP_CSS = 15 * 1000;

const DENYLIST = [
  "tg.krunchymonkey.dev",
  "192.168.",
  "10.0.",
  "127.0.0.1",
  "localhost",
  ":4190",
  ":4191",
  ":4192",
  "@gmail.com",
  "BEGIN PRIVATE KEY",
  "PRIVATE KEY-----",
  "api_key",
  "secret=",
  "/api/",
];

/** Narrow, reviewed exceptions: a literal may appear in files matching `file` only. */
const DENYLIST_EXCEPTIONS = [];

function walk(root, dir = root) {
  const entries = readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
  );
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(root, full));
    else files.push(path.relative(root, full).split(path.sep).join("/"));
  }
  return files;
}

function isExternalOrAbsolute(ref) {
  return ref.startsWith("/") || /^[a-z][a-z0-9+.-]*:/i.test(ref) || ref.startsWith("//");
}

function checkReference(ref, fromFile, dir, problems) {
  const value = ref.trim();
  if (value === "" || value.startsWith("#") || /^data:/i.test(value)) return;
  if (isExternalOrAbsolute(value)) {
    problems.push(`${fromFile}: non-relative or external reference "${value}"`);
    return;
  }
  const target = value.split(/[?#]/)[0];
  if (target === "") return;
  const resolved = path.resolve(dir, path.dirname(fromFile), decodeURIComponent(target));
  const rel = path.relative(dir, resolved);
  if (rel.startsWith("..") || path.isAbsolute(rel) || !existsSync(resolved)) {
    problems.push(`${fromFile}: reference "${value}" does not resolve to a file inside dist`);
  }
}

export function checkDist(dir) {
  const problems = [];
  const root = path.resolve(dir);
  if (!existsSync(root)) {
    return { problems: [`${dir} does not exist; run the build first`], files: [], totals: null };
  }
  const paths = walk(root);
  if (!paths.includes("index.html")) problems.push("index.html is missing");

  const files = [];
  for (const rel of paths) {
    const buffer = readFileSync(path.join(root, rel));
    const ext = path.extname(rel).toLowerCase();
    const base = path.posix.basename(rel);
    if (base.startsWith(".") || !ALLOWED_EXTENSIONS.has(ext)) {
      problems.push(`${rel}: file type is not allowed in the public artifact`);
    }
    files.push({
      path: rel,
      bytes: buffer.length,
      gzipBytes: gzipSync(buffer, { level: 9 }).length,
      sha256: createHash("sha256").update(buffer).digest("hex"),
    });
    if (!TEXT_EXTENSIONS.has(ext)) continue;

    const text = buffer.toString("utf8");
    if (ext === ".js" || ext === ".css") {
      if (/sourceMappingURL/.test(text)) problems.push(`${rel}: contains sourceMappingURL`);
    }
    if (ext === ".html") {
      for (const match of text.matchAll(/\b(?:src|href)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
        checkReference(match[1] ?? match[2], rel, root, problems);
      }
    }
    if (ext === ".css") {
      for (const match of text.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)"'\s]*))\s*\)/gi)) {
        checkReference(match[1] ?? match[2] ?? match[3], rel, root, problems);
      }
    }
    const lower = text.toLowerCase();
    for (const literal of DENYLIST) {
      const needle = literal.toLowerCase();
      let index = lower.indexOf(needle);
      while (index !== -1) {
        const excepted = DENYLIST_EXCEPTIONS.some(
          (rule) => rule.literal === literal && rule.file.test(rel),
        );
        if (!excepted) {
          const context = text
            .slice(Math.max(0, index - 40), index + needle.length + 40)
            .replace(/\s+/g, " ");
          problems.push(`${rel}: denylisted "${literal}" in ...${context}...`);
        }
        index = lower.indexOf(needle, index + needle.length);
      }
    }
  }

  const sum = (ext, key) =>
    files.filter((f) => f.path.endsWith(ext)).reduce((total, f) => total + f[key], 0);
  const totals = {
    files: files.length,
    bytes: files.reduce((total, f) => total + f.bytes, 0),
    jsBytes: sum(".js", "bytes"),
    jsGzipBytes: sum(".js", "gzipBytes"),
    cssBytes: sum(".css", "bytes"),
    cssGzipBytes: sum(".css", "gzipBytes"),
  };
  if (totals.jsGzipBytes > MAX_GZIP_JS) {
    problems.push(`total gzip JS ${totals.jsGzipBytes} B exceeds budget ${MAX_GZIP_JS} B`);
  }
  if (totals.cssGzipBytes > MAX_GZIP_CSS) {
    problems.push(`total gzip CSS ${totals.cssGzipBytes} B exceeds budget ${MAX_GZIP_CSS} B`);
  }
  return { problems, files, totals };
}

const kb = (n) => `${(n / 1000).toFixed(2)} kB`;

function main(argv) {
  const jsonIndex = argv.indexOf("--json");
  const jsonPath = jsonIndex === -1 ? null : argv[jsonIndex + 1];
  if (jsonIndex !== -1 && !jsonPath) {
    console.error("--json requires a path");
    return 2;
  }
  const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
  const { problems, files, totals } = checkDist(dir);
  if (jsonPath && totals) {
    writeFileSync(jsonPath, `${JSON.stringify({ files, totals }, null, 2)}\n`);
  }
  if (problems.length > 0) {
    console.error(`dist check failed with ${problems.length} problem(s):`);
    for (const problem of problems) console.error(`  - ${problem}`);
    return 1;
  }
  console.log("dist check passed");
  for (const f of files) {
    console.log(`  ${f.path}  raw ${kb(f.bytes)}  gzip ${kb(f.gzipBytes)}`);
  }
  console.log(
    `  total: ${totals.files} files, raw ${kb(totals.bytes)}; JS gzip ${kb(totals.jsGzipBytes)} / ${kb(MAX_GZIP_JS)}; CSS gzip ${kb(totals.cssGzipBytes)} / ${kb(MAX_GZIP_CSS)}`,
  );
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main(process.argv.slice(2)));
}
