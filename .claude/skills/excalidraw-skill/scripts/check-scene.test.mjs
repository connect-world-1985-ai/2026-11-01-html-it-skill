import { spawnSync } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";
import { checkScene as rawCheckScene } from "./check-scene.mjs";

const scriptPath = fileURLToPath(new URL("./check-scene.mjs", import.meta.url));

const seal = (els) => {
  const counts = new Map();
  for (const e of els) if (e?.customData?.stampId) counts.set(e.customData.stampId, (counts.get(e.customData.stampId) || 0) + 1);
  return els.map((e) => (e?.customData?.stampId && e.customData.stampSize === undefined ? { ...e, customData: { stamp: "test/item", ...e.customData, stampSize: counts.get(e.customData.stampId) } } : e));
};
const checkScene = (els, opts) => rawCheckScene(Array.isArray(els) ? seal(els) : els, opts);

const rect = (id, x, y, w = 160, h = 60, extra = {}) => ({ id, type: "rectangle", x, y, width: w, height: h, ...extra });
const arrow = (id, x, y, points, extra = {}) => ({ id, type: "arrow", x, y, points, strokeWidth: 2, ...extra });
const text = (id, x, y, w, h, s, extra = {}) => ({ id, type: "text", x, y, width: w, height: h, text: s, fontSize: 16, ...extra });

const st = (id) => ({ groupIds: [id], customData: { stampId: id } });

const notesOf = (els, check) => checkScene(els).findings.filter((f) => f.severity === "note" && f.check === check);
const seen = (els, check) => checkScene(els).findings.filter((f) => !check || f.check === check);
const fails = (els, check) => checkScene(els).findings.filter((f) => f.severity === "fail" && (!check || f.check === check));

test("unbound end 40px short of a box is an open join", () => {
  const els = [rect("a", 0, 0), rect("b", 400, 0), arrow("ab", 160, 30, [[0, 0], [200, 0]])];
  const f = fails(els, "connector-end");
  assert.equal(f.length, 1);
  assert.deepEqual(f[0].ids.slice(0, 2), ["ab", "b"]);
  assert.equal(f[0].measured.gap, 40);
});

test("unbound end within the stroke tolerance passes", () => {
  const els = [rect("a", 0, 0), rect("b", 400, 0), arrow("ab", 161, 30, [[0, 0], [238, 0]])];
  assert.equal(fails(els, "connector-end").length, 0);
});

test("tolerance grows with stroke width", () => {
  const els = [rect("a", 0, 0), rect("b", 400, 0), arrow("ab", 160, 30, [[0, 0], [236, 0]], { strokeWidth: 4 })];
  assert.equal(seen(els, "connector-end").length, 0);
  els[2].strokeWidth = 1;
  assert.equal(seen(els, "connector-end").length, 1);
});

test("a bound end at the canvas binding gap passes", () => {
  const els = [rect("a", 0, 0), rect("b", 400, 0), arrow("ab", 168, 30, [[0, 0], [224, 0]], { start: { id: "a" }, end: { id: "b" } })];
  assert.equal(fails(els).length, 0);
});

test("a binding to a missing element fails", () => {
  const els = [rect("a", 0, 0), arrow("ab", 168, 30, [[0, 0], [224, 0]], { startBinding: { elementId: "a" }, endBinding: { elementId: "gone" } })];
  assert.equal(fails(els, "connector-end").length, 1);
});

test("an end far from every shape is a free end, not a failure", () => {
  const els = [rect("a", 0, 0), arrow("ab", 160, 30, [[0, 0], [300, 0]])];
  const r = checkScene(els);
  assert.equal(r.findings.filter((f) => f.severity === "fail").length, 0);
  assert.equal(r.findings.filter((f) => f.check === "free-end").length, 1);
});

test("an end that runs into the box fails", () => {
  const els = [rect("a", 0, 0), rect("b", 400, 0), arrow("ab", 160, 30, [[0, 0], [252, 0]])];
  const f = fails(els, "connector-end");
  assert.equal(f.length, 1);
  assert.equal(f[0].measured.gap, -12);
});

test("an elongated stamp group used as a connector is checked at its ends", () => {
  const els = [
    rect("child", 0, 0),
    rect("parent", 400, 0),
    { id: "s-line", type: "line", x: 160, y: 30, points: [[0, 0], [200, 0]], ...st("stamp") },
    { id: "s-head", type: "diamond", x: 344, y: 22, width: 16, height: 16, ...st("stamp") },
  ];
  const f = fails(els, "connector-end");
  assert.equal(f.length, 1);
  assert.equal(f[0].measured.gap, 40);
  assert.ok(f[0].ids.includes("parent"));
});

test("a divider inside a stamp that overshoots its frame is a note", () => {
  const els = [
    rect("box", 0, 0, 300, 200, { ...st("cls") }),
    { id: "divider", type: "line", x: 0, y: 40, points: [[0, 0], [306, 0]], ...st("cls") },
  ];
  assert.equal(fails(els).length, 0);
  const f = notesOf(els, "inner-line-end");
  assert.equal(f.length, 1);
  assert.equal(f[0].measured.gap, 6);
});

test("a connector through an unrelated box fails, a zone around it does not", () => {
  const els = [
    rect("zone", -50, -50, 700, 300),
    rect("a", 0, 0),
    rect("mid", 220, 10, 120, 40),
    rect("b", 400, 0),
    arrow("ab", 160, 30, [[0, 0], [240, 0]]),
  ];
  const f = fails(els, "crossing");
  assert.equal(f.length, 1);
  assert.ok(f[0].ids.includes("mid"));
});

test("a connector that rides another shape's border fails", () => {
  const els = [
    rect("zone", 0, 0, 800, 400),
    rect("a", 40, 40),
    rect("b", 40, 300),
    arrow("ab", 40, 70, [[0, 0], [-40, 0], [-40, 260], [0, 260]]),
  ];
  assert.equal(fails(els, "rides-border").length, 1);
});

test("partial overlap fails, full containment passes", () => {
  assert.equal(fails([rect("a", 0, 0), rect("b", 100, 20)], "overlap").length, 1);
  assert.equal(fails([rect("z", 0, 0, 500, 300), rect("b", 100, 20)], "overlap").length, 0);
});

test("text that crosses a box border fails", () => {
  const els = [rect("a", 0, 0), text("t", 120, 20, 90, 20, "too long")];
  assert.equal(fails(els, "text-border").length, 1);
});

test("text sitting on a connector fails, the connector's own label does not", () => {
  const els = [
    rect("a", 0, 0),
    rect("b", 400, 0),
    arrow("ab", 160, 30, [[0, 0], [240, 0]]),
    text("t", 250, 20, 50, 20, "uses"),
    text("own", 250, 20, 50, 20, "own", { containerId: "ab" }),
  ];
  const f = fails(els, "text-on-line");
  assert.equal(f.length, 1);
  assert.deepEqual(f[0].ids[0], "t");
});

test("a label equally close to two lines is ambiguous", () => {
  const els = [
    rect("a", 0, 0),
    rect("b", 400, 0),
    rect("c", 0, 200),
    rect("d", 400, 200),
    arrow("ab", 160, 100, [[0, 0], [240, 0]]),
    arrow("cd", 160, 140, [[0, 0], [240, 0]]),
    text("lbl", 260, 110, 40, 20, "books"),
  ];
  assert.equal(fails(els, "label-ambiguous").length, 1);
  els[6].y = 116;
  assert.equal(fails(els, "label-ambiguous").length, 1, "nearer the second line still has both in reach");
  els[6].y = 60;
  assert.equal(fails(els, "label-ambiguous").length, 0);
});

test("a slight run-in onto the border passes, a gap of the same size fails", () => {
  const els = [rect("a", 0, 0), rect("b", 400, 0), arrow("ab", 160, 30, [[0, 0], [243, 0]])];
  assert.equal(seen(els, "connector-end").length, 0);
  els[2].points = [[0, 0], [237, 0]];
  assert.equal(seen(els, "connector-end").length, 1);
});

test("hand-drawn wobble of a stamp's inner line passes", () => {
  const els = [
    rect("box", 0, 0, 300, 200, { ...st("cls") }),
    { id: "divider", type: "line", x: 3, y: 40, points: [[0, 0], [299, 0]], strokeWidth: 1, ...st("cls") },
  ];
  assert.equal(notesOf(els, "inner-line-end").length, 0);
});

test("peers almost aligned are noted, clearly offset or exact peers pass", () => {
  assert.equal(seen([rect("a", 0, 0), rect("b", 300, 4)], "near-align").length, 1);
  assert.equal(seen([rect("a", 0, 0), rect("b", 300, 0)], "near-align").length, 0);
  assert.equal(seen([rect("a", 0, 0), rect("b", 300, 30)], "near-align").length, 0);
});

test("an almost straight connector segment is noted", () => {
  const els = [rect("a", 0, 0), rect("b", 400, 4), arrow("ab", 160, 30, [[0, 0], [240, 4]])];
  assert.equal(seen(els, "near-straight").length, 1);
});

test("an empty joined box over 1.5 times its peer is noted, a full one passes", () => {
  const els = [
    rect("small", 0, 0, 160, 100),
    rect("big", 400, 0, 400, 260),
    arrow("ab", 160, 50, [[0, 0], [240, 0]]),
    text("n1", 10, 10, 80, 20, "Small"),
    text("n2", 410, 10, 80, 20, "Big"),
  ];
  assert.equal(seen(els, "oversized").length, 1);
  els.push(text("n3", 410, 40, 380, 210, Array(8).fill("a long attribute line here xx").join("\n")));
  assert.equal(seen(els, "oversized").length, 0);
});

test("small free text fails, small stamp text is exempt", () => {
  assert.equal(fails([text("t", 0, 0, 80, 16, "tiny", { fontSize: 12 })], "font-size").length, 1);
  assert.equal(fails([text("t", 0, 0, 80, 16, "tiny", { fontSize: 12, ...st("stamp") })], "font-size").length, 0);
});

test("each finding carries a ready zoom command for its elements", () => {
  const els = [rect("a", 0, 0), rect("b", 400, 0), arrow("ab", 160, 30, [[0, 0], [200, 0]])];
  const [f] = fails(els, "connector-end");
  assert.match(f.zoom, /screenshot --ids ab,b/);
  assert.match(f.zoom, /--scale 2/);
});

test("findings carry the boxes of their main elements", () => {
  const els = [rect("a", 0, 0), rect("b", 400, 0), arrow("ab", 160, 30, [[0, 0], [200, 0]])];
  const [f] = fails(els, "connector-end");
  assert.deepEqual(f.boxes.b, [400, 0, 160, 60]);
});

test("a line with two free ends gives one note", () => {
  const els = [rect("title", 0, 0, 300, 40), { id: "deco", type: "line", x: 600, y: 400, points: [[0, 0], [200, 0]] }];
  const notes = checkScene(els).findings.filter((f) => f.check === "free-end");
  assert.equal(notes.length, 1);
});

test("accepted notes are dropped, fails are not", () => {
  const els = [rect("a", 0, 0), rect("b", 400, 0), arrow("ab", 160, 30, [[0, 0], [200, 0]]), { id: "deco", type: "line", x: 600, y: 400, points: [[0, 0], [200, 0]] }];
  const r = checkScene(els, { acceptNotes: ["deco", "ab"] });
  assert.equal(r.findings.filter((f) => f.check === "free-end").length, 0);
  assert.equal(r.fails, 1);
});

test("a label between two divider lines of one card is not ambiguous", () => {
  const els = [
    rect("card", 0, 0, 300, 200),
    { id: "d1", type: "line", x: 0, y: 60, points: [[0, 0], [300, 0]] },
    { id: "d2", type: "line", x: 0, y: 100, points: [[0, 0], [300, 0]] },
    text("name", 20, 70, 60, 20, "Name"),
  ];
  assert.equal(fails(els, "label-ambiguous").length, 0);
});

test("near-align only compares peers inside the same container", () => {
  const lbl = (s) => ({ label: { text: s } });
  const els = [rect("s1", 0, 0, 400, 400), rect("s2", 500, 4, 400, 400), rect("w1", 300, 100, 80, 40, lbl("OK")), rect("w2", 520, 104, 80, 40, lbl("Go"))];
  assert.equal(seen(els, "near-align").filter((f) => f.ids.includes("w1")).length, 0);
  els.push(rect("w3", 40, 104, 80, 40, lbl("No")));
  assert.equal(seen(els, "near-align").filter((f) => f.ids.includes("w3")).length, 1);
});

test("deleted elements are ignored", () => {
  const els = [rect("a", 0, 0), rect("b", 100, 20, 160, 60, { isDeleted: true })];
  assert.equal(fails(els).length, 0);
});

const ellipse = (id, x, y, w, h, extra = {}) => ({ id, type: "ellipse", x, y, width: w, height: h, ...extra });
const diamond = (id, x, y, w, h, extra = {}) => ({ id, type: "diamond", x, y, width: w, height: h, ...extra });
const line = (id, x, y, points, extra = {}) => ({ id, type: "line", x, y, points, ...extra });

test("correct diagrams give 0 fails", async (t) => {
  const scenes = {
    "flowchart with shape labels": [
      ellipse("s", 0, 0, 120, 60, { label: { text: "Start" } }),
      rect("p", 200, 0, 200, 60, { label: { text: "Process request" } }),
      arrow("a", 128, 30, [[0, 0], [64, 0]], { start: { id: "s" }, end: { id: "p" } }),
    ],
    "flowchart with text elements": [
      ellipse("s", 0, 0, 120, 60),
      text("st", 30, 20, 60, 20, "Start", { containerId: "s" }),
      rect("p", 200, 0, 200, 60),
      text("pt", 210, 20, 180, 20, "Process request", { containerId: "p" }),
      arrow("a", 128, 30, [[0, 0], [64, 0]], { start: { id: "s" }, end: { id: "p" } }),
    ],
    "decision diamond": [
      diamond("d", 0, 0, 140, 100, { label: { text: "OK?" } }),
      rect("p", 240, 20, 160, 60, { label: { text: "Process" } }),
      arrow("a", 148, 50, [[0, 0], [84, 0]], { start: { id: "d" }, end: { id: "p" } }),
    ],
    swimlanes: [
      rect("L1", 0, 0, 800, 150), rect("L2", 0, 150, 800, 150), rect("L3", 0, 300, 800, 150),
      rect("a", 50, 40, 120, 60), rect("m", 400, 190, 120, 60, { label: { text: "Review" } }), rect("b", 50, 340, 120, 60),
      arrow("ab", 110, 108, [[0, 0], [0, 224]], { start: { id: "a" }, end: { id: "b" } }),
    ],
    "icon stamp with hand-drawn parts": [
      rect("i1", 0, 0, 40, 40, { ...st("icon") }),
      rect("i2", 60, 3, 40, 40, { ...st("icon") }),
    ],
    "document icon with text lines": [
      rect("doc", 0, 0, 80, 100, { ...st("d") }),
      line("t1", 12, 30, [[0, 0], [56, 0]], { ...st("d") }),
      line("t2", 12, 50, [[0, 0], [56, 0]], { ...st("d") }),
    ],
    "arrow ending on a zone border": [
      rect("zone", 0, 0, 400, 300), rect("c", 40, 120, 120, 60, { label: { text: "API" } }), rect("src", -300, 120, 100, 60),
      arrow("x", -200, 150, [[0, 0], [200, 0]]),
    ],
    "caption under a box with two arrows": [
      rect("box", 200, 0, 100, 60), text("cap", 210, 70, 80, 20, "Gateway"),
      rect("l", 0, 0, 100, 60), rect("r", 400, 0, 100, 60),
      arrow("x", 100, 30, [[0, 0], [92, 0]], { start: { id: "l" }, end: { id: "box" } }),
      arrow("y", 400, 30, [[0, 0], [-92, 0]], { start: { id: "r" }, end: { id: "box" } }),
    ],
  };
  for (const [name, els] of Object.entries(scenes)) {
    await t.test(name, () => {
      const f = fails(els);
      assert.equal(f.length, 0, f.map((x) => `${x.check}: ${x.message}`).join("; "));
    });
  }
});

test("an oversized box with only a short label is still noted", () => {
  const els = [
    rect("small", 0, 0, 160, 60, { label: { text: "A" } }),
    rect("big", 300, 0, 400, 260, { label: { text: "B" } }),
    arrow("ab", 168, 30, [[0, 0], [124, 0]], { start: { id: "small" }, end: { id: "big" } }),
  ];
  assert.equal(seen(els, "oversized").length, 1);
});

test("a divider that misses its border gives one note", () => {
  const els = [
    rect("box", 0, 0, 300, 200, { ...st("cls") }),
    line("divider", 0, 40, [[0, 0], [280, 0]], { ...st("cls") }),
  ];
  const f = notesOf(els, "inner-line-end");
  assert.equal(f.length, 1, "one finding per line");
  assert.equal(f[0].measured.gap, -20);
});

test("a connector cutting through a leaf shape still fails across lanes", () => {
  const els = [
    rect("L1", 0, 0, 800, 150), rect("L2", 0, 150, 800, 150),
    rect("a", 50, 40, 120, 60), rect("b", 50, 190, 120, 60), rect("mid", 80, 120, 60, 20),
    arrow("ab", 110, 108, [[0, 0], [0, 74]], { start: { id: "a" }, end: { id: "b" } }),
  ];
  const f = fails(els, "crossing");
  assert.equal(f.length, 1);
  assert.ok(f[0].ids.includes("mid"));
});

test("an end on a zone border is measured against the zone, not the child inside", () => {
  const els = [rect("zone", 0, 0, 400, 300), rect("c", 40, 120, 120, 60, { label: { text: "API" } }), rect("src", -300, 120, 100, 60), arrow("x", -200, 150, [[0, 0], [160, 0]])];
  const f = fails(els, "connector-end");
  assert.equal(f.length, 1);
  assert.ok(f[0].ids.includes("zone"));
  assert.equal(f[0].measured.gap, 40);
});

test("a grouped arrow and its grouped label are checked like loose ones", () => {
  const els = [
    rect("p", 0, 0, 100, 60), rect("q", 300, 0, 100, 60),
    arrow("x", 100, 30, [[0, 0], [160, 0]], { groupIds: ["gg"] }),
    text("lab", 150, 22, 60, 20, "calls", { groupIds: ["gg"] }),
  ];
  assert.equal(fails(els, "connector-end").length, 1);
  assert.equal(fails(els, "text-on-line").length, 1);
});

test("an arrow inside a grouped section is checked as a connector", () => {
  const els = [
    rect("p", 0, 0, 100, 60, { groupIds: ["sec"] }), rect("q", 300, 0, 100, 60, { groupIds: ["sec"] }),
    arrow("x", 100, 30, [[0, 0], [160, 0]], { groupIds: ["sec"] }),
  ];
  const f = fails(els, "connector-end");
  assert.equal(f.length, 1);
  assert.equal(f[0].measured.gap, 40);
});

test("every finding carries an exact key naming its check and elements", () => {
  const els = [rect("a", 0, 0), rect("mid", 220, 10, 120, 40), rect("b", 400, 0), arrow("ab", 160, 30, [[0, 0], [240, 0]])];
  assert.deepEqual(fails(els).map((f) => f.key), ["crossing:ab:mid"]);
});

test("a key clears only its own finding", () => {
  const els = [
    rect("a", 0, 0), rect("b", 600, 0),
    arrow("ab", 160, 30, [[0, 0], [440, 0]], { start: { id: "a" }, end: { id: "b" } }),
    text("t1", 250, 20, 40, 20, "x"), text("t2", 450, 20, 40, 20, "y"),
  ];
  const r = checkScene(els, { clear: ["text-on-line:t1:ab"] });
  assert.equal(r.cleared.length, 1);
  assert.equal(r.findings.filter((f) => f.check === "text-on-line").length, 1);
});

test("a fail inside an unmarked group is checked like loose elements", () => {
  const g = { groupIds: ["section"] };
  const els = [
    rect("zone", 0, 0, 800, 300, g), rect("a", 40, 40, 120, 60, g), rect("b", 600, 40, 120, 60, g), rect("c", 300, 50, 100, 40, g),
    line("ln", 160, 70, [[0, 0], [430, 0]], g),
  ];
  const checks = fails(els).map((f) => f.check);
  assert.ok(checks.includes("connector-end"));
  assert.ok(checks.includes("crossing"));
  const boxes = [rect("p", 0, 0, 100, 60, g), rect("q", 80, 3, 100, 60, g)];
  assert.ok(fails(boxes).some((f) => f.check === "overlap"));
});

test("a box holding a small icon is still crossed and size-checked", () => {
  const crossed = [rect("l", 0, 40, 100, 60), rect("svc", 200, 20, 200, 100), rect("ic", 210, 30, 24, 24), rect("r", 500, 40, 100, 60),
    arrow("x", 108, 70, [[0, 0], [384, 0]], { start: { id: "l" }, end: { id: "r" } })];
  assert.ok(fails(crossed, "crossing").some((f) => f.ids.includes("svc")));
  const stretched = [rect("s", 0, 0, 160, 60, { label: { text: "Small" } }), rect("u", 300, 0, 400, 300, { label: { text: "User" } }), rect("ic", 310, 10, 24, 24),
    arrow("x", 168, 30, [[0, 0], [124, 0]], { start: { id: "s" }, end: { id: "u" } })];
  assert.equal(seen(stretched, "oversized").length, 1);
});

test("a uniform flowchart column passes the size check", () => {
  const els = [
    ellipse("start", 60, 0, 120, 60, { label: { text: "Start" } }),
    rect("b1", 0, 140, 240, 80, { label: { text: "Save" } }),
    rect("b2", 0, 300, 240, 80, { label: { text: "Load config" } }),
    rect("b3", 0, 460, 240, 80, { label: { text: "Send" } }),
    ellipse("end", 60, 620, 120, 60, { label: { text: "End" } }),
    arrow("a1", 120, 68, [[0, 0], [0, 64]], { start: { id: "start" }, end: { id: "b1" } }),
    arrow("a2", 120, 228, [[0, 0], [0, 64]], { start: { id: "b1" }, end: { id: "b2" } }),
    arrow("a3", 120, 388, [[0, 0], [0, 64]], { start: { id: "b2" }, end: { id: "b3" } }),
    arrow("a4", 120, 548, [[0, 0], [0, 64]], { start: { id: "b3" }, end: { id: "end" } }),
  ];
  assert.deepEqual(fails(els).map((f) => f.key), []);
});

test("a closed polyline is an outline, not a connector", () => {
  const els = [rect("a", 300, 0), line("note", 0, 0, [[0, 0], [200, 3], [198, 150], [2, 148], [0, 0]])];
  assert.equal(fails(els).length, 0);
});

test("every bundled library item passes when stamped alone", async () => {
  const { createRequire } = await import("node:module");
  const require = createRequire(import.meta.url);
  const { stamp, PACK_FILES } = require("../../use-excalidraw-library/scripts/stamp-library-item.js");
  const { readFileSync } = await import("node:fs");
  const libDir = fileURLToPath(new URL("../../use-excalidraw-library/libraries/", import.meta.url));
  const bad = [];
  for (const [pack, file] of Object.entries(PACK_FILES)) {
    const lib = JSON.parse(readFileSync(join(libDir, file), "utf8"));
    for (const item of lib.libraryItems) {
      // Native size is authoring size, so a small word here is not yet a drawn flaw.
      const f = fails(stamp({ pack, name: item.name, x: 0, y: 0 })).filter((x) => x.check !== "font-size");
      if (f.length) bad.push(`${pack}/${item.name}: ${f.map((x) => x.check).join(",")}`);
    }
  }
  assert.deepEqual(bad, []);
});

test("a stamp marker that does not match its recorded size is measured element by element", () => {
  const els = [rect("a", 0, 0), rect("b", 400, 0), arrow("ab", 160, 30, [[0, 0], [200, 0]], { customData: { stampId: "x" } })];
  const forged = rawCheckScene(els);
  assert.deepEqual(forged.findings.filter((f) => f.severity === "fail").map((f) => f.key), ["connector-end:ab:end"]);
  assert.equal(forged.findings.filter((f) => f.check === "stamp-marker").length, 1);
  const twice = [rect("a", 0, 0), rect("b", 400, 0),
    line("s1", 160, 30, [[0, 0], [200, 0]], { customData: { stampId: "k", stamp: "p/n", stampSize: 1 } }),
    line("s2", 160, 230, [[0, 0], [200, 0]], { customData: { stampId: "k", stamp: "p/n", stampSize: 1 } })];
  const dup = rawCheckScene(twice);
  assert.ok(dup.findings.some((f) => f.check === "stamp-marker"));
  assert.ok(dup.findings.some((f) => f.key === "connector-end:s1:end"));
});

test("a labelled diagonal connector stamp is measured at its ends", () => {
  const els = [
    rect("a", 0, 0, 100, 60), rect("b", 400, 300, 100, 60),
    arrow("rel", 100, 60, [[0, 0], [280, 230]], { ...st("r") }),
    text("rl", 200, 120, 60, 20, "relation", { ...st("r") }),
  ];
  const f = fails(els, "connector-end");
  assert.equal(f.length, 1);
  assert.ok(f[0].ids.includes("b"));
});

test("a scaled-up connector stamp is still measured at its ends", () => {
  const els = [
    rect("a", 0, 0, 160, 80), rect("b", 600, 0, 160, 80),
    line("ln", 160, 40, [[0, 0], [336, 0]], { ...st("agg") }),
    diamond("hd", 496, 8, 64, 64, { ...st("agg") }),
  ];
  const f = fails(els, "connector-end");
  assert.equal(f.length, 1);
  assert.equal(f[0].measured.gap, 40);
});

test("a box holding only a small labelled badge is still crossed", () => {
  const els = [
    rect("a", 0, 0, 100, 60), rect("m", 200, -40, 200, 140, { label: { text: "M" } }), rect("badge", 350, -30, 40, 24, { label: { text: "v2" } }), rect("b", 500, 0, 100, 60),
    arrow("ab", 108, 30, [[0, 0], [384, 0]], { start: { id: "a" }, end: { id: "b" } }),
  ];
  assert.deepEqual(fails(els, "crossing").map((f) => f.key), ["crossing:ab:m"]);
});

test("a stamp counts once toward the typical shape size", () => {
  const els = [
    ellipse("start", 60, 0, 120, 60, { label: { text: "Start" } }),
    rect("b1", -100, 140, 260, 100, { label: { text: "One" } }), rect("b2", 200, 140, 260, 100, { label: { text: "Two" } }), rect("b3", 500, 140, 260, 100, { label: { text: "Three" } }),
    arrow("a1", 120, 68, [[0, 0], [0, 64]], { start: { id: "start" }, end: { id: "b1" } }),
  ];
  for (let i = 0; i < 8; i++) els.push(rect(`ic${i}`, 1000 + (i % 4) * 9, 400 + Math.floor(i / 4) * 9, 8, 8, { ...st("aws") }));
  assert.equal(fails(els, "oversized").length, 0);
});

test("rotated shapes are listed as skipped", () => {
  const r = checkScene([rect("a", 0, 0), rect("rot", 300, 0, 60, 60, { angle: 0.5 })]);
  assert.deepEqual(r.skipped.rotated, ["rot"]);
});

test("a connector without points is measured from its width and height", () => {
  const els = [rect("p", 0, 0, 100, 60), rect("q", 300, 0, 100, 60), { id: "x", type: "arrow", x: 100, y: 30, width: 160, height: 0 }];
  assert.equal(fails(els, "connector-end").length, 1);
});

test("CLI --max without a number falls back to 100", async () => {
  const dir = await mkdtemp(join(tmpdir(), "check-scene-"));
  const file = join(dir, "scene.json");
  await writeFile(file, JSON.stringify([rect("a", 0, 0), rect("b", 400, 0), arrow("ab", 160, 30, [[0, 0], [200, 0]])]), "utf8");
  const result = spawnSync(process.execPath, [scriptPath, file, "--max"], { encoding: "utf8" });
  const out = JSON.parse(result.stdout);
  assert.equal(out.findings.length, 1);
  assert.equal(out.truncated, false);
});

test("CLI --clear and --accept-notes are applied", async () => {
  const dir = await mkdtemp(join(tmpdir(), "check-scene-"));
  const file = join(dir, "scene.json");
  const els = [rect("a", 0, 0, 200, 100), rect("b", 150, 50, 200, 100), line("deco", 900, 400, [[0, 0], [200, 0]])];
  await writeFile(file, JSON.stringify(els), "utf8");
  const result = spawnSync(process.execPath, [scriptPath, file, "--clear", "overlap:a:b", "--accept-notes", "deco"], { encoding: "utf8" });
  const out = JSON.parse(result.stdout);
  assert.equal(out.fails, 0);
  assert.equal(out.notes, 0);
  assert.equal(out.cleared.length, 1);
});

test("CLI exits 3 when the canvas is unreachable", () => {
  const result = spawnSync(process.execPath, [scriptPath, "--url", "http://127.0.0.1:9"], { encoding: "utf8" });
  assert.equal(result.status, 3);
});

test("CLI reads a scene file and reports counts", async () => {
  const dir = await mkdtemp(join(tmpdir(), "check-scene-"));
  const file = join(dir, "scene.excalidraw");
  const elements = [rect("a", 0, 0), rect("b", 400, 0), arrow("ab", 160, 30, [[0, 0], [200, 0]])];
  await writeFile(file, JSON.stringify({ type: "excalidraw", elements }), "utf8");
  const result = spawnSync(process.execPath, [scriptPath, file], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  const out = JSON.parse(result.stdout);
  assert.equal(out.success, true);
  assert.equal(out.fails, 1);
  assert.equal(out.findings[0].check, "connector-end");
});

test("CLI --max limits listed findings but keeps the full count", async () => {
  const dir = await mkdtemp(join(tmpdir(), "check-scene-"));
  const file = join(dir, "scene.json");
  const elements = [];
  for (let i = 0; i < 5; i++) elements.push(rect(`a${i}`, 0, i * 200), rect(`b${i}`, 400, i * 200), arrow(`c${i}`, 160, i * 200 + 30, [[0, 0], [200, 0]]));
  await writeFile(file, JSON.stringify(elements), "utf8");
  const result = spawnSync(process.execPath, [scriptPath, file, "--max", "2"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  const out = JSON.parse(result.stdout);
  assert.equal(out.fails, 5);
  assert.equal(out.findings.length, 2);
  assert.equal(out.truncated, true);
});

const actor = (p, cx, top) => [
  ellipse(`${p}-head`, cx - 15, top, 30, 30),
  line(`${p}-body`, cx, top + 30, [[0, 0], [0, 20]]),
  line(`${p}-arms`, cx - 18, top + 38, [[0, 0], [36, 0]]),
  line(`${p}-legl`, cx - 18, top + 65, [[0, 0], [18, -15]]),
  line(`${p}-legr`, cx, top + 50, [[0, 0], [16, 15]]),
  text(`${p}-cap`, cx - 26, top + 63, 58, 20, "Patient"),
];
const free = (els) => checkScene(els).findings.filter((f) => f.check === "free-end");
const lifelines = () => [
  rect("h1", 0, 0, 150, 65), rect("f1", 0, 675, 150, 65), line("l1", 75, 65, [[0, 0], [0, 610]]),
  rect("h2", 300, 0, 150, 65), rect("f2", 300, 675, 150, 65), line("l2", 375, 65, [[0, 0], [0, 610]]),
];

test("messages ending on lifelines are joined and the lifelines are not connectors", () => {
  const els = [...lifelines(),
    arrow("m1", 76, 110, [[0, 0], [295, 0]]),
    arrow("m2", 374, 220, [[0, 0], [-294.5, 0]], { strokeStyle: "dotted" }),
    arrow("m3", 76, 330, [[0, 0], [295, 0]])];
  assert.deepEqual(fails(els).map((f) => f.key), []);
  assert.deepEqual(free(els).map((f) => f.key), []);
});

test("a device bus with tapping lines passes", () => {
  const els = [line("bus", 0, 200, [[0, 0], [800, 0]]),
    rect("d1", 40, 60, 120, 60), line("t1", 100, 120, [[0, 0], [0, 80]]),
    rect("d2", 340, 60, 120, 60), line("t2", 400, 120, [[0, 0], [0, 80]]),
    rect("d3", 640, 60, 120, 60), line("t3", 700, 120, [[0, 0], [0, 80]])];
  assert.deepEqual(fails(els).map((f) => f.key), []);
  assert.deepEqual(free(els).map((f) => f.key), []);
});

test("a timeline axis with event arrows passes", () => {
  const els = [line("axis", 0, 300, [[0, 0], [900, 0]]),
    rect("e1", 40, 100, 140, 60), arrow("a1", 110, 160, [[0, 0], [0, 136]]),
    rect("e2", 400, 100, 140, 60), arrow("a2", 470, 160, [[0, 0], [0, 136]])];
  assert.deepEqual(fails(els).map((f) => f.key), []);
});

test("an org chart bus line passes", () => {
  const els = [rect("boss", 300, 0, 160, 60), line("stem", 380, 60, [[0, 0], [0, 60]]), line("bar", 80, 120, [[0, 0], [600, 0]]),
    rect("c1", 0, 200, 160, 60), line("d1", 80, 120, [[0, 0], [0, 80]]),
    rect("c2", 600, 200, 160, 60), line("d2", 680, 120, [[0, 0], [0, 80]])];
  assert.deepEqual(fails(els).map((f) => f.key), []);
});

test("one end near a line is not enough to make it a target", () => {
  const els = [rect("a", 0, 0), rect("b", 400, 0), line("rail", 370, -300, [[0, 0], [0, 700]]), arrow("ab", 160, 30, [[0, 0], [208, 0]])];
  assert.ok(fails(els, "connector-end").some((f) => f.key === "connector-end:ab:end" && f.ids.includes("b")));
});

test("a message stopping 20px short of a lifeline fails with the gap", () => {
  const els = [...lifelines(), arrow("m1", 76, 110, [[0, 0], [295, 0]]), arrow("m2", 76, 220, [[0, 0], [295, 0]]), arrow("m3", 76, 330, [[0, 0], [279, 0]])];
  const f = fails(els, "connector-end");
  assert.deepEqual(f.map((x) => x.key), ["connector-end:m3:end"]);
  assert.equal(f[0].measured.gap, 20);
  assert.ok(f[0].ids.includes("l2"));
});

test("a message running past a lifeline fails as a negative gap", () => {
  const els = [...lifelines(), arrow("m1", 76, 110, [[0, 0], [295, 0]]), arrow("m2", 76, 220, [[0, 0], [295, 0]]), arrow("m3", 76, 330, [[0, 0], [319, 0]])];
  const f = fails(els, "connector-end");
  assert.deepEqual(f.map((x) => x.key), ["connector-end:m3:end"]);
  assert.equal(f[0].measured.gap, -20);
});

test("a target line's free ends are silent but an end near a shape stays measured", () => {
  const els = [rect("h1", 0, 0, 150, 65), line("l1", 75, 75, [[0, 0], [0, 600]]), arrow("m1", 300, 200, [[0, 0], [-223, 0]]), arrow("m2", 300, 400, [[0, 0], [-223, 0]])];
  assert.deepEqual(fails(els).map((f) => f.key), ["connector-end:l1:start"]);
  assert.equal(free(els).filter((f) => f.subject === "l1").length, 0);
});

test("a filled chip on a target line is still a crossing", () => {
  const els = [...lifelines(), arrow("m1", 76, 110, [[0, 0], [295, 0]]), arrow("m2", 76, 220, [[0, 0], [295, 0]]), rect("chip", 60, 300, 32, 30, { backgroundColor: "#eee" })];
  assert.deepEqual(fails(els, "crossing").map((f) => f.key), ["crossing:l1:chip"]);
});

test("an end nearer a box than a target line is measured against the box", () => {
  const els = [...lifelines(), arrow("m1", 76, 110, [[0, 0], [295, 0]]), arrow("m2", 76, 220, [[0, 0], [295, 0]]), rect("n", 90, 400, 200, 60), arrow("m3", 200, 620, [[0, 0], [-110, -160]])];
  assert.deepEqual(fails(els, "connector-end").map((f) => f.key), []);
});

test("a stick figure with its caption is artwork", () => {
  const els = actor("p", 75, 0);
  assert.deepEqual(fails(els).map((f) => f.key), []);
  assert.deepEqual(free(els).map((f) => f.key), []);
});

test("a check mark and a cross mark are artwork", () => {
  const check = [line("c1", 0, 20, [[0, 0], [15, 15]]), line("c2", 15, 35, [[0, 0], [40, -35]]), rect("far", 400, 0)];
  assert.deepEqual(fails(check).map((f) => f.key), []);
  const cross = [line("x1", 0, 0, [[0, 0], [40, 40]]), line("x2", 40, 0, [[0, 0], [-40, 40]]), rect("far", 400, 0)];
  assert.deepEqual(fails(cross).map((f) => f.key), []);
  assert.deepEqual(free(cross).map((f) => f.key), []);
});

test("a mark drawn inside a box is artwork, the box does not count as reached", () => {
  const els = [rect("tick", 0, 0, 100, 100, { label: { text: "OK" } }), line("c1", 20, 50, [[0, 0], [15, 15]]), line("c2", 35, 65, [[0, 0], [40, -35]])];
  assert.deepEqual(fails(els).map((f) => f.key), []);
});

test("a two-segment hand-drawn connector stopping short still fails", () => {
  const els = [rect("a", 0, 0), rect("b", 400, 200),
    line("s1", 160, 30, [[0, 0], [300, 0]]), line("s2", 460, 30, [[0, 0], [0, 140]])];
  assert.ok(fails(els, "connector-end").some((f) => f.key === "connector-end:s2:end" && f.measured.gap === 30));
});

test("an underline under a title is not a join", () => {
  const els = [rect("title", 0, 0, 300, 60), line("rule", 0, 70, [[0, 0], [300, 0]])];
  assert.equal(seen(els, "connector-end").length, 0);
});

test("a frame drawn from loose lines is artwork, however near a box its corners are", () => {
  const frame = [line("top", 60, 200, [[0, 0], [400, 0]]), line("right", 460, 200, [[0, 0], [0, 300]]), line("bot", 60, 500, [[0, 0], [400, 0]]), line("left", 60, 200, [[0, 0], [0, 300]]), line("div", 60, 350, [[0, 0], [400, 0]])];
  const els = [...frame, rect("foot", 400, 520, 160, 60), rect("chip", 60, 200, 32, 30, { backgroundColor: "#eee" })];
  assert.deepEqual(fails(els).map((f) => f.key), []);
  assert.deepEqual(free(els).map((f) => f.key), []);
});

test("text on a frame's own line still fails, a box cut by the frame still crosses", () => {
  const frame = [line("top", 60, 200, [[0, 0], [400, 0]]), line("right", 460, 200, [[0, 0], [0, 300]]), line("bot", 60, 500, [[0, 0], [400, 0]]), line("left", 60, 200, [[0, 0], [0, 300]])];
  assert.deepEqual(fails([...frame, text("t", 200, 190, 60, 20, "guard")], "text-on-line").length, 1);
  assert.ok(fails([...frame, rect("cut", 400, 300, 160, 60)], "crossing").length >= 1);
});

test("a figure aligns by its union box, not by its head", () => {
  const near = [...actor("p", 75, -5), rect("b", 300, 0, 150, 65)];
  assert.equal(notesOf(near, "near-align-soft").length, 1);
  assert.equal(seen([...actor("p", 75, 0), rect("b", 300, 0, 150, 65)], "near-align-soft").length, 0);
});

test("a free end deep inside a container is a free end", () => {
  const pane = [rect("pane", 0, 0, 600, 400), rect("svc", 40, 40, 120, 60, { label: { text: "S" } })];
  const els = [...pane, arrow("stick", 300, 340, [[0, 0], [150, 0]])];
  assert.deepEqual(fails(els, "connector-end").map((f) => f.key), []);
  assert.equal(free(els).length, 1);
});

test("a ball stamp deep inside a pane is a free end", () => {
  const els = [rect("pane", 0, 0, 700, 340), rect("svc", 40, 40, 120, 60, { label: { text: "S" } }),
    line("stem", 500, 270, [[0, 0], [120, 0]], { ...st("ball") }), ellipse("ball", 620, 260, 20, 20, { ...st("ball") })];
  assert.deepEqual(fails(els, "connector-end").map((f) => f.key), []);
});

test("an overshoot of a few px past a zone border still fails", () => {
  const els = [rect("zone", 0, 0, 400, 300), rect("c", 240, 40, 120, 60, { label: { text: "API" } }), rect("src", -300, 180, 100, 60), arrow("x", -200, 210, [[0, 0], [212, 0]])];
  const f = fails(els, "connector-end");
  assert.deepEqual(f.map((x) => x.measured.gap), [-12]);
});

test("an end inside a zone near a leaf is still measured against the leaf", () => {
  const els = [rect("zone", 0, 0, 600, 400), rect("c", 240, 160, 120, 60, { label: { text: "API" } }), rect("src", 20, 170, 100, 40, { label: { text: "S" } }), arrow("x", 120, 190, [[0, 0], [90, 0]])];
  const f = fails(els, "connector-end");
  assert.deepEqual(f.map((x) => x.measured.gap), [30]);
  assert.ok(f[0].ids.includes("c"));
});

test("text under a later filled shape is covered, in free, stamp, and bound forms", () => {
  const filled = { backgroundColor: "#fff", fillStyle: "solid" };
  assert.deepEqual(fails([text("t", 20, 20, 80, 20, "hidden"), rect("over", 0, 0, 200, 100, filled)], "text-covered").map((f) => f.key), ["text-covered:t:over"]);
  const env = [rect("env", 0, 0, 400, 300, { ...st("e") }), text("title", 100, 140, 200, 20, "runtime", { ...st("e") }), rect("art", 80, 100, 240, 100, { ...filled, ...st("a") })];
  assert.equal(fails(env, "text-covered").length, 1);
  const bound = [rect("box", 0, 0, 200, 80), text("lbl", 20, 30, 160, 20, "name", { containerId: "box" }), rect("note", 0, 0, 200, 80, filled)];
  assert.equal(fails(bound, "text-covered").length, 1);
});

test("text is not covered by its own container, its own stamp, a shape below, or an unfilled shape", () => {
  const filled = { backgroundColor: "#fff", fillStyle: "solid" };
  assert.equal(fails([text("l", 20, 20, 80, 20, "own", { containerId: "b" }), rect("b", 0, 0, 200, 100, filled)], "text-covered").length, 0);
  assert.equal(fails([text("l", 20, 20, 80, 20, "own", { ...st("s") }), rect("b", 0, 0, 200, 100, { ...filled, ...st("s") })], "text-covered").length, 0);
  assert.equal(fails([rect("b", 0, 0, 200, 100, filled), text("l", 20, 20, 80, 20, "above")], "text-covered").length, 0);
  assert.equal(fails([text("l", 20, 20, 80, 20, "open"), rect("b", 0, 0, 200, 100, { backgroundColor: "transparent" })], "text-covered").length, 0);
  assert.equal(fails([text("l", 90, 20, 80, 20, "edge"), rect("b", 0, 0, 100, 100, filled)], "text-covered").length, 0);
});

test("an arrow's own label on a lane border fails, clear of borders it passes", () => {
  const lanes = [rect("L1", 0, 0, 800, 150), rect("L2", 0, 150, 800, 150), rect("a", 50, 40, 120, 60), rect("b", 50, 190, 120, 60)];
  const onBorder = { start: { id: "a" }, end: { id: "b" } };
  const withLabel = [...lanes, arrow("ab", 110, 108, [[0, 0], [0, 74]], { ...onBorder, label: { text: "[taken]" } })];
  assert.deepEqual(fails(withLabel, "text-border").map((f) => f.key), ["text-border:ab:L1", "text-border:ab:L2"]);
  const clear = [rect("a", 0, 0), rect("b", 600, 0), arrow("ab", 168, 30, [[0, 0], [424, 0]], { start: { id: "a" }, end: { id: "b" }, label: { text: "books" } })];
  assert.equal(fails(clear, "text-border").length, 0);
});

test("a bound arrow label is measured at its own box", () => {
  const els = [rect("L1", 0, 0, 800, 150), rect("L2", 0, 150, 800, 150), rect("a", 50, 40, 120, 60), rect("b", 50, 190, 120, 60),
    arrow("ab", 110, 108, [[0, 0], [0, 74]], { start: { id: "a" }, end: { id: "b" } }), text("g", 80, 140, 60, 20, "[taken]", { containerId: "ab" })];
  assert.deepEqual(fails(els, "text-border").map((f) => f.key), ["text-border:g:L1", "text-border:g:L2"]);
});

test("a zoom lists every member of a stamp involved", () => {
  const els = [rect("a", 0, 0, 100, 60), rect("b", 280, 0, 100, 60),
    line("ln", 100, 30, [[0, 0], [150, 0]], { ...st("rel") }), diamond("hd", 234, 22, 16, 16, { ...st("rel") }), text("cap", 150, 10, 40, 16, "x", { ...st("rel") }),
    rect("s1", 600, 0, 40, 40, { ...st("box") }), rect("s2", 650, 3, 10, 10, { ...st("box") }), arrow("to", 460, 20, [[0, 0], [110, 0]])];
  for (const id of ["ln", "hd", "cap"]) assert.match(fails(els, "connector-end").find((f) => f.subject === "ln").zoom, new RegExp(`\\b${id}\\b`));
  const f = fails(els, "connector-end").find((x) => x.subject === "to");
  for (const id of ["to", "s1", "s2"]) assert.match(f.zoom, new RegExp(`\\b${id}\\b`));
});

test("a ball nested in a socket is not an overlap with the socket's mask", async () => {
  const { createRequire } = await import("node:module");
  const { stamp } = createRequire(import.meta.url)("../../use-excalidraw-library/scripts/stamp-library-item.js");
  const socket = stamp({ pack: "uml-component", name: "Required interface", x: 300, y: 100 });
  const raw = stamp({ pack: "uml-component", name: "Provided interface", x: 0, y: 0 });
  const ballAt = raw.find((e) => e.type === "ellipse");
  const ball = raw.map((e) => ({ ...e, x: e.x - ballAt.x + 303, y: e.y - ballAt.y + 103 }));
  assert.deepEqual(fails([...socket, ...ball], "overlap").map((f) => f.key), []);
});

test("a filled shape with a visible stroke that partly overlaps a stamp still fails", () => {
  const els = [rect("m", 0, 0, 100, 100, { backgroundColor: "#fff", strokeColor: "#000", ...st("a") }), rect("n", 50, 50, 100, 100, { ...st("b") })];
  assert.equal(fails(els, "overlap").length, 1);
});

test("a line through a shape inside a figure's box still crosses it", () => {
  const els = [ellipse("head", 100, 0, 40, 40), line("a", 120, 40, [[0, 0], [-100, 120]]), line("b", 120, 40, [[0, 0], [100, 120]]),
    ellipse("dot", 110, 90, 20, 20, { label: { text: "x" } }), line("c", 60, 100, [[0, 0], [120, 0]])];
  assert.deepEqual(fails(els, "crossing").map((f) => f.key), ["crossing:c:dot"]);
});

test("a divider through a cell inside a closed frame still crosses it", () => {
  const els = [line("top", 60, 200, [[0, 0], [400, 0]]), line("right", 460, 200, [[0, 0], [0, 300]]),
    line("bottom", 60, 500, [[0, 0], [400, 0]]), line("left", 60, 200, [[0, 0], [0, 300]]), line("div", 260, 200, [[0, 0], [0, 300]]),
    rect("inner", 200, 300, 120, 60, { label: { text: "cell" } })];
  assert.deepEqual(fails(els, "crossing").map((f) => f.key), ["crossing:div:inner"]);
});

test("a graph of plain dots is not one figure", () => {
  const els = [ellipse("n1", 0, 0, 40, 40), ellipse("n2", 140, 6, 40, 40), ellipse("n3", 280, 0, 40, 40),
    line("e1", 40, 20, [[0, 0], [100, 6]]), line("e2", 180, 26, [[0, 0], [100, -6]])];
  const keys = seen(els).map((f) => f.key);
  assert.ok(keys.includes("near-align:n1:n2"), keys.join());
  assert.ok(keys.includes("near-straight:e1"), keys.join());
});

test("a figure's feet beside a long line give it no connector ends", () => {
  for (const y of [70, 80]) assert.deepEqual(fails([...actor("a", 75, 0).slice(0, 5), line("ground", 0, y, [[0, 0], [300, 0]])]).map((f) => f.key), []);
});

test("a figure at the normal spacing from a box stays a figure", () => {
  assert.deepEqual(fails([...actor("a", 75, 0), rect("b", 133, 0, 200, 80, { label: { text: "System" } })]).map((f) => f.key), []);
});

test("a one-stem ball short of its box is still a connector", () => {
  const els = [rect("b", 0, 0, 200, 80, { label: { text: "Service" } }), line("stem", 220, 40, [[0, 0], [60, 0]]), ellipse("ball", 280, 30, 20, 20)];
  assert.deepEqual(fails(els, "connector-end").map((f) => f.key), ["connector-end:stem:start"]);
});

test("arrows aimed at a box past a stray rule stay measured against the box", () => {
  const els = [rect("A", 100, 0, 100, 50, { label: { text: "A" } }), rect("B", 260, 0, 100, 50, { label: { text: "B" } }), rect("C", 100, 200, 260, 60, { label: { text: "C" } }),
    line("rule", 0, 160, [[0, 0], [460, 0]]), arrow("a1", 150, 50, [[0, 0], [0, 110]]), arrow("a2", 310, 50, [[0, 0], [0, 110]])];
  assert.deepEqual(fails(els, "connector-end").map((f) => f.key), ["connector-end:a1:end", "connector-end:a2:end"]);
});

test("a bus with its own drop to a box below still takes the arrows above it", () => {
  const els = [rect("A", 100, 0, 100, 50, { label: { text: "A" } }), rect("B", 260, 0, 100, 50, { label: { text: "B" } }), rect("C", 100, 200, 260, 60, { label: { text: "C" } }),
    line("bus", 0, 160, [[0, 0], [460, 0]]), arrow("a1", 150, 50, [[0, 0], [0, 110]]), arrow("a2", 310, 50, [[0, 0], [0, 110]]), arrow("drop", 230, 160, [[0, 0], [0, 40]])];
  assert.deepEqual(fails(els, "connector-end").map((f) => f.key), []);
});

test("thousands of loose lines stay fast", () => {
  const els = Array.from({ length: 6000 }, (_, i) => line(`d${i}`, (i % 100) * 50, Math.floor(i / 100) * 50, [[0, 0], [30, 0]]));
  const start = Date.now();
  checkScene(els);
  assert.ok(Date.now() - start < 1500, `${Date.now() - start}ms`);
});

test("text in a diamond's bounding corner is not covered by it", () => {
  assert.equal(fails([text("t", 5, 5, 40, 20, "Yes"), diamond("d", 0, 0, 200, 100, { backgroundColor: "#ffe" })], "text-covered").length, 0);
  assert.equal(fails([text("t", 80, 40, 40, 20, "Yes"), diamond("d", 0, 0, 200, 100, { backgroundColor: "#ffe" })], "text-covered").length, 1);
});

test("a coloured borderless stamp overlapping a box still overlaps", () => {
  const els = [rect("a", 0, 0, 160, 60), ellipse("badge", 120, 20, 60, 60, { backgroundColor: "#e03131", strokeColor: "transparent", ...st("s") })];
  assert.equal(fails(els, "overlap").length, 1);
});

test("a labelled arrow with no points does not throw", () => {
  assert.equal(checkScene([arrow("z", 10, 10, [], { width: 0, height: 0, label: { text: "x" } })]).fails, 0);
});

test("text over a figure's arms sits on its line", () => {
  const keys = fails([...actor("a", 75, 0).slice(0, 5), text("over", 40, 30, 80, 20, "over arms")], "text-on-line").map((f) => f.key);
  assert.ok(keys.includes("text-on-line:over:a-arms"), keys.join());
});

test("an image is a note, because nothing inside it can be measured", () => {
  const image = { id: "pic", type: "image", x: 0, y: 0, width: 824, height: 775, fileId: "f1" };
  const r = checkScene([image]);
  assert.equal(r.fails, 0);
  assert.deepEqual(r.findings.map((f) => f.key), ["image-unmeasured:pic"]);
  assert.equal(checkScene([image], { acceptNotes: ["pic"] }).notes, 0);
});

const hline = (id, x, y, len, extra = {}) => ({ id, type: "line", x, y, width: len, height: 0, points: [[0, 0], [len, 0]], strokeWidth: 2, ...extra });

test("a line under a later opaque shape is hidden there, so it does not cross what is under it", () => {
  const els = [rect("box", 300, 0, 100, 60), hline("row", 0, 30, 800), rect("dialog", 250, -50, 200, 160, { backgroundColor: "#ffffff", fillStyle: "solid" })];
  assert.equal(fails(els, "crossing").filter((f) => f.ids.includes("box")).length, 0);
});

test("the same line with no opaque shape over it still crosses", () => {
  const els = [hline("row", 0, 30, 800), rect("box", 300, 0, 100, 60, { label: { text: "box" } })];
  assert.equal(fails(els, "crossing").length, 1);
});

test("a translucent wash does not hide text, a solid box does", () => {
  const wash = [text("t", 10, 10, 60, 20, "hello"), rect("dim", 0, 0, 400, 200, { backgroundColor: "#868e96", fillStyle: "solid", opacity: 35 })];
  assert.equal(fails(wash, "text-covered").length, 0);
  const solid = [text("t", 10, 10, 60, 20, "hello"), rect("lid", 0, 0, 100, 50, { backgroundColor: "#868e96", fillStyle: "solid" })];
  assert.equal(fails(solid, "text-covered").length, 1);
});

test("a line ending beside a shape it does not head at is not a short join", () => {
  const els = [rect("avatar", 400, 0, 40, 40), hline("divider", 0, 70, 390)];
  assert.equal(fails(els, "connector-end").length, 0);
});

test("a line heading at a shape and stopping 30px short is still reported", () => {
  const els = [rect("b", 400, 40, 40, 40), hline("link", 0, 60, 370)];
  assert.equal(fails(els, "connector-end").length, 1);
});

test("an unbound end a few pixels off is a note, not a fault", () => {
  const els = [rect("a", 0, 0), rect("b", 400, 0), arrow("ab", 160, 30, [[0, 0], [234, 0]])];
  assert.equal(fails(els, "connector-end").length, 0);
  assert.equal(notesOf(els, "connector-end").length, 1);
});

test("alignment is never a fault: peers get a note, unlike shapes roll into one note", () => {
  const peers = [rect("a", 0, 0), rect("b", 240, 4)];
  assert.equal(fails(peers, "near-align").length, 0);
  assert.equal(notesOf(peers, "near-align").length, 1);
  const unlike = [rect("big", 0, 0, 300, 200), rect("s1", 340, 3, 40, 40), rect("s2", 420, 5, 90, 90)];
  assert.equal(notesOf(unlike, "near-align").length, 0);
  assert.equal(notesOf(unlike, "near-align-soft").length, 1);
});

test("a stamp mostly inside a shape that pokes out of it is reported", () => {
  const els = [rect("group", 0, 0, 300, 200), rect("db", 100, 150, 100, 70, st("s1")), hline("rim", 100, 170, 100, st("s1"))];
  assert.equal(fails(els, "stamp-overflow").length, 1);
});

test("a label covering most of a short arrow is reported, a long arrow is fine", () => {
  const short = [rect("a", 0, 0), rect("b", 200, 0), arrow("ab", 160, 30, [[0, 0], [40, 0]], { label: { text: "uses data" } })];
  assert.equal(fails(short, "label-hides-arrow").length, 1);
  const long = [rect("a", 0, 0), rect("b", 500, 0), arrow("ab", 160, 30, [[0, 0], [340, 0]], { label: { text: "uses data" } })];
  assert.equal(fails(long, "label-hides-arrow").length, 0);
});

test("a stamp word far from its frame is a note", () => {
  const els = [rect("btn", 0, 0, 180, 40, st("s1")), text("w", 400, 10, 60, 20, "Go", st("s1"))];
  assert.equal(notesOf(els, "stamp-word").length, 1);
});

test("any finding can be dismissed by its key and is listed as cleared", () => {
  const els = [rect("a", 0, 0, 200, 100), rect("b", 150, 50, 200, 100)];
  const key = fails(els, "overlap")[0].key;
  const r = checkScene(els, { clear: [key] });
  assert.equal(r.fails, 0);
  assert.equal(r.cleared.length, 1);
  assert.equal(r.refused.length, 0);
});

test("the output says findings are pointers for the picture", () => {
  assert.match(checkScene([rect("a", 0, 0)]).guidance, /picture/);
});

const solid = { backgroundColor: "#ffffff", fillStyle: "solid" };
const covered = () => [
  rect("r1", 0, 0, 400, 40), rect("r2", 0, 60, 400, 40), rect("r3", 0, 120, 400, 40), rect("r4", 0, 180, 400, 40),
  text("t1", 10, 70, 80, 20, "alpha"), text("t2", 10, 130, 80, 20, "beta"),
  rect("top", 200, 20, 240, 180, solid),
];

test("one solid shape drawn over many things gives one finding, whatever the shape is", () => {
  const f = fails(covered());
  const roll = f.filter((x) => x.check === "covers-many");
  assert.equal(roll.length, 1);
  assert.equal(roll[0].subject, "top");
  assert.equal(f.filter((x) => x.check === "overlap").length, 0);
});

test("text hidden under one solid shape joins its covers-many finding", () => {
  const els = [...covered().slice(0, 4), text("t1", 220, 70, 80, 20, "alpha"), text("t2", 220, 130, 80, 20, "beta"), covered()[6]];
  const f = fails(els);
  assert.equal(f.filter((x) => x.check === "text-covered").length, 0);
  const roll = f.find((x) => x.check === "covers-many");
  assert.ok(roll.ids.includes("t1") && roll.ids.includes("t2"));
});

test("a covers-many finding names the words it hides", () => {
  const els = [rect("p", 0, 0, 100, 60), rect("q", 0, 100, 100, 60), text("t", 120, 70, 50, 20, "Secret"), rect("top", 60, 30, 130, 100, { backgroundColor: "#fff", fillStyle: "solid" })];
  assert.match(fails(els, "covers-many")[0].message, /"Secret"/);
});

test("a shape wholly under a later opaque shape is reported, since the picture cannot show it", () => {
  const lid = { backgroundColor: "#fff", fillStyle: "solid" };
  assert.deepEqual(fails([rect("b", 400, 0), rect("zone", 340, -40, 300, 140, lid)], "shape-covered").map((f) => f.key), ["shape-covered:b:zone"]);
  assert.equal(fails([rect("zone", 340, -40, 300, 140, lid), rect("b", 400, 0)], "shape-covered").length, 0);
  assert.equal(fails([rect("b", 400, 0), rect("zone", 340, -40, 300, 140)], "shape-covered").length, 0);
  assert.equal(fails([rect("b", 400, 0, 160, 60, st("s")), rect("zone", 340, -40, 300, 140, { ...lid, ...st("s") })], "shape-covered").length, 0);
});

test("draft scene elements with no id are measured apart and never named undefined", () => {
  const lid = { backgroundColor: "#fff", fillStyle: "solid" };
  const noId = ({ id, ...rest }) => rest;
  const hiddenUnder = fails([noId(rect("x", 50, 50, 20, 20)), rect("lid", 0, 0, 300, 300, lid)], "shape-covered");
  assert.equal(hiddenUnder.length, 1);
  assert.ok(!JSON.stringify(hiddenUnder).includes("undefined"));
  const lidless = fails([rect("b", 400, 0), noId(rect("x", 340, -40, 300, 140, lid))], "shape-covered");
  assert.equal(lidless.length, 1);
  assert.ok(!JSON.stringify(lidless).includes("undefined"));
  assert.equal(fails([noId(rect("x", 0, 0)), noId(rect("y", 500, 0))], "shape-covered").length, 0);
});

test("id-less lines and shapes beside a stamp do not crash the checker", () => {
  const els = [
    rect("r", 890, 22, 138, 36, { groupIds: ["g"], customData: { stampId: "s", stamp: "forms/Date picker", stampSize: 12 } }),
    { type: "line", x: 110, y: 376, points: [[0, 0], [490, 0]] },
    { type: "line", x: 110, y: 422, points: [[0, 0], [223, -41], [490, -89]] },
    { type: "rectangle", x: 900, y: 262, width: 14, height: 14 },
  ];
  assert.doesNotThrow(() => rawCheckScene(els));
});

test("a shape under a lid of its own kind is hidden, ellipse or diamond", () => {
  const lid = { backgroundColor: "#fff", fillStyle: "solid" };
  for (const type of ["ellipse", "diamond"]) {
    const twin = [{ ...rect("a", 0, 0, 100, 100), type }, { ...rect("b", 0, 0, 100, 100, lid), type }];
    assert.equal(fails(twin, "shape-covered").length, 1, type);
    const inner = [{ ...rect("a", 10, 10, 100, 100), type }, { ...rect("b", 0, 0, 120, 120, lid), type }];
    assert.equal(fails(inner, "shape-covered").length, 1, type);
  }
});

test("a covers-many finding names hidden shapes, once each word, and stops after eight", () => {
  const lid = { backgroundColor: "#fff", fillStyle: "solid" };
  const under = [];
  for (let i = 0; i < 12; i++) under.push(text(`t${i}`, 20, 20 + i, 40, 20, "Edit"), rect(`s${i}`, 20, 60 + i, 40, 20));
  const { message } = fails([...under, rect("lid", 0, 0, 300, 300, lid)], "covers-many")[0];
  assert.equal(message.match(/"Edit"/g).length, 1);
  assert.match(message, /s0/);
  assert.match(message, /s6, and 5 more/);
});

test("a shape in the bounding corner of a later ellipse is not hidden by it", () => {
  const els = [rect("b", 0, 0, 40, 40), { id: "e", type: "ellipse", x: 0, y: 0, width: 300, height: 300, backgroundColor: "#fff", fillStyle: "solid" }];
  assert.equal(fails(els, "shape-covered").length, 0);
});

test("a stamp whose members disagree on the removed-word count is not trusted", () => {
  const cd = (stampWords) => ({ groupIds: ["k"], customData: { stampId: "k", stamp: "p/n", stampSize: 3, stampWords } });
  const els = [rect("r", 0, 0, 100, 60, cd(1)), rect("r2", 200, 0, 100, 60, cd(9))];
  assert.equal(rawCheckScene(els).findings.filter((f) => f.check === "stamp-marker").length, 1);
});

test("text on the top shape crossing a border hidden beneath it joins the finding", () => {
  const els = [...covered(), text("onTop", 210, 50, 200, 20, "on the top shape")];
  assert.equal(fails(els, "text-border").filter((x) => x.subject === "onTop").length, 0);
  assert.equal(fails(els, "covers-many").length, 1);
});

test("a covers-many finding stays a fail and clears once with its key", () => {
  assert.equal(fails(covered(), "covers-many")[0].severity, "fail");
  const r = checkScene(covered(), { clear: ["covers-many:top"] });
  assert.equal(r.findings.filter((x) => x.check === "covers-many").length, 0);
  assert.equal(r.cleared.length, 1);
});

test("a small accidental overlap keeps its own specific finding", () => {
  const els = [rect("a", 0, 0, 160, 60), rect("b", 100, 20, 160, 60, solid)];
  assert.equal(fails(els, "overlap").length, 1);
  assert.equal(fails(els, "covers-many").length, 0);
});

test("a see-through or unfilled shape over many things is not rolled up", () => {
  const els = covered().slice(0, 6).concat(rect("top", 200, 20, 240, 180));
  assert.equal(fails(els, "covers-many").length, 0);
  assert.ok(fails(els, "overlap").length >= 3);
});

test("a stamp word too small to read is a fail, and a readable one is not", () => {
  const icon = rect("icon", 0, 0, 40, 40, st("stamp"));
  const small = fails([icon, text("cap", 0, 42, 40, 10, "Chart", { fontSize: 7, ...st("stamp") })], "font-size");
  assert.equal(small.length, 1);
  assert.deepEqual(small[0].ids, ["cap"]);
  assert.equal(fails([icon, text("cap", 0, 42, 40, 15, "Chart", { fontSize: 12, ...st("stamp") })], "font-size").length, 0);
});

test("removing a stamp's word keeps the stamp trusted, but losing a stroke or adding a copy does not", () => {
  const cd = { stampId: "k", stamp: "p/n", stampSize: 3, stampWords: 1 };
  const body = rect("b", 0, 0, 40, 40, { groupIds: ["k"], customData: cd });
  const stroke = rect("c", 5, 5, 10, 10, { groupIds: ["k"], customData: cd });
  const word = text("w", 0, 42, 40, 20, "Chart", { groupIds: ["k"], customData: cd });
  const markers = (els) => rawCheckScene(els).findings.filter((f) => f.check === "stamp-marker").length;
  assert.equal(markers([body, stroke, word]), 0);
  assert.equal(markers([body, stroke]), 0);
  assert.equal(markers([body, word]), 1);
  assert.equal(markers([body, stroke, word, { ...word, id: "w2" }]), 1);
  assert.equal(markers([{ ...body, customData: { ...cd, stampWords: undefined } }, { ...stroke, customData: { ...cd, stampWords: undefined } }]), 1);
});
