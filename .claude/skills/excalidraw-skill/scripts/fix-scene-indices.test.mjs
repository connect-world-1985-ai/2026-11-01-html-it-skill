import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";
import { generateNKeysBetween } from "./vendor/fractional-indexing.mjs";
import { fixScene, rewriteIndices, rewriteDefaultCenteredText } from "./fix-scene-indices.mjs";

const scriptPath = fileURLToPath(new URL("./fix-scene-indices.mjs", import.meta.url));

function sceneWithDecimalIndices(n) {
  return {
    type: "excalidraw",
    version: 2,
    source: "mcp-excalidraw-server",
    elements: Array.from({ length: n }, (_, i) => ({
      id: `r${i}`,
      type: "rectangle",
      x: i,
      y: 0,
      width: 10,
      height: 10,
      index: `a${i}`,
    })),
    appState: { viewBackgroundColor: "#ffffff", gridSize: null },
  };
}

test("91 CLI-export keys become generateNKeysBetween(null,null,n)", () => {
  const scene = sceneWithDecimalIndices(91);
  const out = fixScene(scene);
  const expected = generateNKeysBetween(null, null, 91);
  assert.deepEqual(
    out.elements.map((e) => e.index),
    expected
  );
  assert.equal(out.elements.some((e) => e.index === "a90"), false);
});

test("11 CLI-export keys are rewritten even though Open already loads them", () => {
  const out = fixScene(sceneWithDecimalIndices(11));
  assert.deepEqual(
    out.elements.map((e) => e.index),
    generateNKeysBetween(null, null, 11)
  );
  assert.equal(out.elements[10].index, "aA");
});

test("rewriteIndices always replaces, including already-valid keys", () => {
  const els = [{ id: "x", index: "aA" }, { id: "y", index: "aB" }];
  rewriteIndices(els);
  assert.deepEqual(
    els.map((e) => e.index),
    generateNKeysBetween(null, null, 2)
  );
});

test("empty elements is a no-op", () => {
  const scene = { type: "excalidraw", elements: [] };
  assert.deepEqual(fixScene(scene).elements, []);
});

test("CLI rewrites a .excalidraw file in place", async () => {
  const dir = await mkdtemp(join(tmpdir(), "fix-idx-"));
  const file = join(dir, "bad.excalidraw");
  await writeFile(file, JSON.stringify(sceneWithDecimalIndices(91)), "utf8");
  const result = spawnSync(process.execPath, [scriptPath, file], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  const rewritten = JSON.parse(await readFile(file, "utf8"));
  assert.deepEqual(
    rewritten.elements.map((e) => e.index),
    generateNKeysBetween(null, null, 91)
  );
});

function cliDefaultText(overrides = {}) {
  return {
    id: "tht",
    type: "text",
    x: 336,
    y: 80,
    text: "Task            SKU",
    textAlign: "center",
    verticalAlign: "middle",
    autoResize: true,
    containerId: null,
    groupIds: [],
    index: "a0",
    ...overrides,
  };
}

test("ungrouped CLI-default center text becomes left", () => {
  const scene = { type: "excalidraw", elements: [cliDefaultText()] };
  const out = fixScene(scene);
  assert.equal(out.elements[0].textAlign, "left");
  assert.equal(out.elements[0].x, 336);
  assert.equal(out.elements[0].verticalAlign, "middle");
  assert.equal(out.elements[0].autoResize, true);
});

test("grouped stamp center text stays center", () => {
  const el = cliDefaultText({
    id: "chip",
    groupIds: ["stamp-group"],
    textAlign: "center",
  });
  rewriteDefaultCenteredText([el]);
  assert.equal(el.textAlign, "center");
});

test("explicit left stays left", () => {
  const el = cliDefaultText({ textAlign: "left" });
  rewriteDefaultCenteredText([el]);
  assert.equal(el.textAlign, "left");
});

test("bound containerId center text stays center", () => {
  const el = cliDefaultText({ containerId: "rect-1" });
  rewriteDefaultCenteredText([el]);
  assert.equal(el.textAlign, "center");
});

test("ungrouped explicit center is the same combo and becomes left", () => {
  const el = cliDefaultText({ id: "t-center", text: "CENTER in box" });
  rewriteDefaultCenteredText([el]);
  assert.equal(el.textAlign, "left");
  assert.equal(el.x, 336);
});

test("CLI file rewrite left-aligns ungrouped default-center text and rewrites index", async () => {
  const dir = await mkdtemp(join(tmpdir(), "fix-align-"));
  const file = join(dir, "scene.excalidraw");
  await writeFile(
    file,
    JSON.stringify({ type: "excalidraw", elements: [cliDefaultText()] }),
    "utf8"
  );
  const result = spawnSync(process.execPath, [scriptPath, file], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  const rewritten = JSON.parse(await readFile(file, "utf8"));
  assert.equal(rewritten.elements[0].textAlign, "left");
  assert.equal(rewritten.elements[0].x, 336);
  assert.equal(rewritten.elements[0].index, generateNKeysBetween(null, null, 1)[0]);
});

