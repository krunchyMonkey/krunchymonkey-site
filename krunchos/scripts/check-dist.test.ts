import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { checkDist } from "./check-dist.mjs";

const dirs: string[] = [];

function makeDist(files: Record<string, string> = {}): string {
  const dir = mkdtempSync(path.join(tmpdir(), "krunchos-dist-"));
  dirs.push(dir);
  const all: Record<string, string> = {
    "index.html":
      '<!doctype html><script type="module" src="./assets/app.js"></script><link rel="stylesheet" href="./assets/app.css">',
    "assets/app.js": "console.log('hello');",
    "assets/app.css": "body{background:url(./bg.png)}",
    "assets/bg.png": "png",
    ...files,
  };
  for (const [name, content] of Object.entries(all)) {
    const full = path.join(dir, name);
    mkdirSync(path.dirname(full), { recursive: true });
    writeFileSync(full, content);
  }
  return dir;
}

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("checkDist", () => {
  it("passes a clean relative artifact", () => {
    const report = checkDist(makeDist());
    expect(report.problems).toEqual([]);
    expect(report.totals?.files).toBe(4);
  });

  it("fails on source maps", () => {
    const report = checkDist(makeDist({ "assets/app.js.map": "{}" }));
    expect(report.problems.join("\n")).toMatch(/app\.js\.map: file type is not allowed/);
  });

  it("fails on absolute asset URLs", () => {
    const report = checkDist(
      makeDist({ "index.html": '<script type="module" src="/assets/app.js"></script>' }),
    );
    expect(report.problems.join("\n")).toMatch(
      /non-relative or external reference "\/assets\/app\.js"/,
    );
  });

  it("fails on denylisted private hostnames", () => {
    const report = checkDist(
      makeDist({ "assets/app.js": "fetch('https://tg.krunchymonkey.dev')" }),
    );
    expect(report.problems.join("\n")).toMatch(/denylisted "tg\.krunchymonkey\.dev"/);
  });

  it("fails on external script URLs", () => {
    const report = checkDist(
      makeDist({ "index.html": '<script src="https://cdn.example.org/x.js"></script>' }),
    );
    expect(report.problems.join("\n")).toMatch(
      /external reference "https:\/\/cdn\.example\.org\/x\.js"/,
    );
  });
});
