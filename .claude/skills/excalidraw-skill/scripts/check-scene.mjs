#!/usr/bin/env node
/**
 * Point at spots in a canvas scene that a wide screenshot can hide. Findings are pointers, not a
 * verdict: the agent judges them in the picture, and any can be dismissed with --clear. Measured:
 * open joins, overshoots, crossings, overlaps, text on borders or lines,
 * ambiguous labels, near-miss alignment, and oversized empty shapes.
 *
 * Rules adapt to the scene so they do not loop:
 * - A bound connector end is joined; the canvas owns its binding gap.
 * - An unbound end heading at a shape and off by more than max(2px, stroke width) is reported:
 *   a fail beyond 8px, a note within it. An end that does not head at a shape does not join it.
 *   An end far from every shape is a free end (note).
 * - Only what a viewer can see counts: a line under a later opaque shape is hidden there, and a
 *   layer under 60% opacity hides nothing.
 * - A stamp is the set of elements sharing customData.stampId, trusted only when their count
 *   matches customData.stampSize (both written by the stamp helper), allowing removed words when
 *   customData.stampWords says how many it had (all members must agree); a mismatch is a note and
 *   the elements are measured loose. A stamp's own lines are not connectors, except a stamp
 *   whose longest line spans it (measured at that line's ends, heads included); its parts are
 *   not compared with each other, and its text is not free text. Unmarked groups, including
 *   the agent's own, are measured element by element.
 * - A divider inside a stamp frame that misses the border is a note, with a tolerance scaled
 *   to the frame, so hand-drawn library wobble passes.
 * - A closed frame of loose lines, and a figure (touching lines and at most one plain ellipse,
 *   whose open ends reach no other shape), are artwork: their ends are not measured, a caption
 *   may graze a figure, and a figure aligns by its outer box. Crossings of any other shape count.
 *   A head with limbs only counts as reaching a shape within 16px; a lone stem keeps the near band.
 * - A long straight line with at least two connector ends on it is a target line: those ends are
 *   measured against the line (max 6px, an arrow cannot bind to a line). Its own ends give no
 *   free-end note; an end near a shape stays measured. An end nearer a shape
 *   goes to the shape, and so does an end aimed at an unjoined shape just past the line.
 * - A free end over 16px inside a container with no leaf shape near is a free end, not a run-in.
 * - Text mostly under an opaque shape drawn after it fails, and so does a shape wholly under one.
 *   An arrow's own label counts for text crossing a border.
 * - A loose label with two connectors within reach fails; binding it to its connector ends that.
 * - 1-8px near misses are notes: alike-sized peers one by one, unlike shapes rolled into one.
 * - Near-miss alignment only compares peers inside the same container (frame, zone).
 * - A container (a shape holding a joined node, children covering 10% of it, or - when it has
 *   no label of its own - a labelled child) is never "crossed"; a labelled box with a small
 *   badge or icon inside is still a box.
 * - Oversized needs a joined peer 1.5x smaller and a scene median 2.25x smaller (one area
 *   per stamp).
 *
 * Usage: node check-scene.mjs [scene.excalidraw|elements.json|-] [--url <canvas>] [--max N]
 *        [--accept-notes id,id]   (drop notes already named as intended)
 *        [--clear key,key]        (dismiss fails judged fine in the picture; they move to `cleared`)
 *        Both last one run: pass them again on every re-run.
 * Without a file, reads the live canvas at --url / EXPRESS_SERVER_URL / http://127.0.0.1:3000.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const CLOSED = new Set(["rectangle", "ellipse", "diamond", "image", "frame", "magicframe", "embeddable", "iframe"]);
const RECT_LIKE = new Set(["rectangle", "image", "frame", "magicframe", "embeddable", "iframe"]);
const LINEAR = new Set(["arrow", "line"]);
const NEAR_MISS_MIN = 1;
const NEAR_MISS_MAX = 8;
const OVERSIZE_RATIO = 1.5;
const OVERSIZE_FILL = 0.4;
const CONTENT_PAD = 16;
const LABEL_REACH = 48;
const CAPTION_GAP = 16;
const MIN_FONT = 16;
const MIN_STAMP_FONT = 12;
const TOUCH = 3;
const DEEP_INSIDE = 16;
const TARGET_MIN_LENGTH = 100;
const TARGET_REACH = 24;
const TARGET_TOL = 6;
const COVERED = 0.5;
const COVERS_MANY = 3;
const HIDES_LISTED = 8;
const NEAR_JOIN = 16;
const CELL = 64;
const ORDER = [
  "connector-end",
  "inner-line-end",
  "crossing",
  "rides-border",
  "overlap",
  "covers-many",
  "text-overflow",
  "text-covered",
  "shape-covered",
  "text-border",
  "text-on-line",
  "label-ambiguous",
  "label-hides-arrow",
  "stamp-overflow",
  "near-align",
  "near-align-soft",
  "near-straight",
  "oversized",
  "font-size",
  "free-end",
  "label-fit",
  "stamp-word",
  "stamp-marker",
  "image-unmeasured",
];

const r1 = (v) => Math.round(v * 10) / 10;
const pts = (el) => {
  if (Array.isArray(el.points) && el.points.length) return el.points.map((p) => (Array.isArray(p) ? p : [p.x, p.y]));
  return LINEAR.has(el.type) && (el.width || el.height) ? [[0, 0], [el.width || 0, el.height || 0]] : [];
};
const absPts = (el) => pts(el).map(([px, py]) => [el.x + px, el.y + py]);
const rotated = (el) => Math.abs(el.angle || 0) > 0.01;

function box(el) {
  if (LINEAR.has(el.type) || el.type === "freedraw") {
    const p = absPts(el);
    if (!p.length) return { x: el.x, y: el.y, w: 0, h: 0 };
    const xs = p.map((q) => q[0]);
    const ys = p.map((q) => q[1]);
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
  }
  let { x, y } = el;
  let w = el.width || 0;
  let h = el.height || 0;
  if (w < 0) { x += w; w = -w; }
  if (h < 0) { y += h; h = -h; }
  if (el.type === "text" && !el.width) {
    const lines = String(el.text || "").split("\n");
    const fs = el.fontSize || 20;
    w = fs * 0.55 * Math.max(...lines.map((l) => l.length));
    h = fs * 1.25 * lines.length;
  }
  return { x, y, w, h };
}

function textExtent(fontSize, value) {
  const lines = String(value || "").split("\n");
  return { w: fontSize * 0.55 * Math.max(...lines.map((l) => l.length)), h: fontSize * 1.25 * lines.length };
}

function inkBox(el) {
  const b = box(el);
  if (el.type !== "text" || !el.width) return b;
  const est = textExtent(el.fontSize || 20, el.text);
  if (est.w >= b.w) return b;
  const shift = el.textAlign === "center" ? (b.w - est.w) / 2 : el.textAlign === "right" ? b.w - est.w : 0;
  return { x: b.x + shift, y: b.y, w: est.w, h: Math.min(b.h, est.h) };
}

const union = (boxes) => {
  const x = Math.min(...boxes.map((b) => b.x));
  const y = Math.min(...boxes.map((b) => b.y));
  return { x, y, w: Math.max(...boxes.map((b) => b.x + b.w)) - x, h: Math.max(...boxes.map((b) => b.y + b.h)) - y };
};
const intersect = (a, b) => {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const w = Math.min(a.x + a.w, b.x + b.w) - x;
  const h = Math.min(a.y + a.h, b.y + b.h) - y;
  return w > 0 && h > 0 ? { x, y, w, h } : null;
};
const padBox = (b, p) => ({ x: b.x - p, y: b.y - p, w: b.w + 2 * p, h: b.h + 2 * p });
const boxGap = (a, b) =>
  Math.hypot(Math.max(0, a.x - (b.x + b.w), b.x - (a.x + a.w)), Math.max(0, a.y - (b.y + b.h), b.y - (a.y + a.h)));
const contains = (outer, inner, tol = 0) =>
  inner.x >= outer.x - tol && inner.y >= outer.y - tol && inner.x + inner.w <= outer.x + outer.w + tol && inner.y + inner.h <= outer.y + outer.h + tol;

function polygon(el) {
  const { x, y, w, h } = box(el);
  if (el.type === "diamond") return [[x + w / 2, y], [x + w, y + h / 2], [x + w / 2, y + h], [x, y + h / 2]];
  if (el.type === "ellipse") {
    const out = [];
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * Math.PI * 2;
      out.push([x + w / 2 + (w / 2) * Math.cos(a), y + h / 2 + (h / 2) * Math.sin(a)]);
    }
    return out;
  }
  return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
}

function distToSeg(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  const t = len2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2)) : 0;
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

function inside(p, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

function signedDist(p, poly) {
  let d = Infinity;
  for (let i = 0; i < poly.length; i++) d = Math.min(d, distToSeg(p, poly[i], poly[(i + 1) % poly.length]));
  return inside(p, poly) ? -d : d;
}

function coveredShare(b, poly) {
  let n = 0;
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) if (inside([b.x + ((i + 0.5) / 5) * b.w, b.y + ((j + 0.5) / 5) * b.h], poly)) n++;
  return n / 25;
}

function segParam(a, b, c, d) {
  const r = [b[0] - a[0], b[1] - a[1]];
  const s = [d[0] - c[0], d[1] - c[1]];
  const den = r[0] * s[1] - r[1] * s[0];
  if (Math.abs(den) < 1e-9) return null;
  const t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den;
  const u = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / den;
  return t > 0 && t < 1 && u >= 0 && u <= 1 ? t : null;
}

function insideLength(a, b, poly) {
  const ts = [0, 1];
  for (let i = 0; i < poly.length; i++) {
    const t = segParam(a, b, poly[i], poly[(i + 1) % poly.length]);
    if (t != null) ts.push(t);
  }
  ts.sort((m, n) => m - n);
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  let total = 0;
  for (let i = 0; i + 1 < ts.length; i++) {
    const tm = (ts[i] + ts[i + 1]) / 2;
    const mid = [a[0] + (b[0] - a[0]) * tm, a[1] + (b[1] - a[1]) * tm];
    if (signedDist(mid, poly) < -0.5) total += (ts[i + 1] - ts[i]) * len;
  }
  return total;
}

function segBoxDist(a, b, bx) {
  const poly = [[bx.x, bx.y], [bx.x + bx.w, bx.y], [bx.x + bx.w, bx.y + bx.h], [bx.x, bx.y + bx.h]];
  if (inside(a, poly) || inside(b, poly) || insideLength(a, b, poly) > 0) return 0;
  for (let i = 0; i < 4; i++) if (segParam(a, b, poly[i], poly[(i + 1) % 4]) != null) return 0;
  let d = Math.min(signedDist(a, poly), signedDist(b, poly));
  for (const c of poly) d = Math.min(d, distToSeg(c, a, b));
  return Math.max(0, d);
}

const segments = (points) => points.slice(1).map((p, i) => [points[i], p]);
const nearBand = (b) => Math.max(48, Math.min(96, 0.5 * Math.min(b.w, b.h)));
const boundId = (el, side) => el[side]?.id ?? el[`${side}Binding`]?.elementId ?? null;
const markerOf = (el) => el.customData?.stampId ?? null;
function closedOutline(el) {
  const p = pts(el);
  if (p.length < 4) return false;
  const [a, b] = [p[0], p[p.length - 1]];
  return Math.hypot(a[0] - b[0], a[1] - b[1]) <= Math.max(4, 2 * (el.strokeWidth ?? 2));
}

export function checkScene(input, { acceptNotes = [], clear = [] } = {}) {
  // A draft file may have elements with no id yet; every check below keys on the id.
  const all = (Array.isArray(input) ? input : input?.elements || []).filter((e) => e && !e.isDeleted).map((e, i) => (e.id ? e : { ...e, id: `no-id-${i}` }));
  const byId = new Map(all.map((e) => [e.id, e]));
  const marked = new Map();
  for (const el of all) {
    const s = markerOf(el);
    if (s) marked.set(s, [...(marked.get(s) || []), el]);
  }
  const stamps = new Map();
  const badMarkers = [];
  for (const [s, members] of marked) {
    const { stamp: name, stampSize: size, stampWords: words } = members[0].customData;
    const wordCount = members.filter((m) => m.type === "text").length;
    const countsMatch = Number.isInteger(words) ? members.length - wordCount === size - words && wordCount <= words : size === members.length;
    const sealed = Number.isInteger(size) && countsMatch && members.every((m) => m.customData.stamp === name && m.customData.stampSize === size && m.customData.stampWords === words);
    if (sealed) stamps.set(s, members);
    else badMarkers.push({ s, members, size });
  }
  const stampOf = (el) => {
    const s = markerOf(el);
    return s && stamps.has(s) ? s : null;
  };
  const artOf = new Map();
  const groupIdsOf = (el) => {
    const s = stampOf(el);
    if (s) return stamps.get(s).map((m) => m.id);
    return artOf.get(el.id)?.ids || [el.id];
  };
  const sameStamp = (a, b) => stampOf(a) != null && stampOf(a) === stampOf(b);

  const units = [];
  const stampMembers = new Set();
  const innerLines = [];
  const addUnit = (el) => {
    const p = absPts(el);
    if (p.length < 2) return;
    units.push({
      el,
      ids: [el.id],
      arrow: el.type === "arrow",
      group: null,
      ends: [p[0], p[p.length - 1]],
      bound: [boundId(el, "start"), boundId(el, "end")],
      segs: segments(p),
      tol: Math.max(2, el.strokeWidth ?? 2),
      runIn: Math.max(4, 2 * (el.strokeWidth ?? 2)),
      straightCheck: !(el.roundness && p.length > 2),
    });
  };
  for (const el of all) if (LINEAR.has(el.type) && !stampOf(el) && !closedOutline(el)) addUnit(el);
  for (const [g, members] of stamps) {
    const linear = members.filter((m) => LINEAR.has(m.type));
    const closed = members.filter((m) => CLOSED.has(m.type));
    const texts = members.filter((m) => m.type === "text");
    if (!linear.length) continue;
    const gb = union(members.filter((m) => m.type !== "text").map(box));
    const spine = linear
      .map((l) => ({ p: absPts(l) }))
      .filter((s) => s.p.length >= 2)
      .map((s) => ({ ...s, a: s.p[0], b: s.p[s.p.length - 1], len: Math.hypot(s.p[s.p.length - 1][0] - s.p[0][0], s.p[s.p.length - 1][1] - s.p[0][1]) }))
      .reduce((m, s) => (!m || s.len > m.len ? s : m), null);
    const headLimit = spine ? Math.max(40, 0.25 * spine.len) : 0;
    const smallHeads = closed.every((c) => Math.max(box(c).w, box(c).h) <= headLimit);
    if (spine && spine.len > 0 && smallHeads && spine.len >= 0.7 * Math.hypot(gb.w, gb.h)) {
      members.forEach((m) => stampMembers.add(m.id));
      const d = [(spine.b[0] - spine.a[0]) / spine.len, (spine.b[1] - spine.a[1]) / spine.len];
      const along = [...linear.flatMap(absPts), ...closed.flatMap(polygon)].map((q) => (q[0] - spine.a[0]) * d[0] + (q[1] - spine.a[1]) * d[1]);
      const ends = [Math.min(...along), Math.max(...along)].map((t) => [spine.a[0] + t * d[0], spine.a[1] + t * d[1]]);
      units.push({
        ids: members.map((m) => m.id),
        arrow: true,
        group: g,
        ends,
        bound: [null, null],
        segs: linear.flatMap((l) => segments(absPts(l))),
        tol: Math.max(2, ...linear.map((l) => l.strokeWidth ?? 2)),
        runIn: Math.max(4, ...linear.map((l) => 2 * (l.strokeWidth ?? 2))),
        straightCheck: false,
      });
    } else {
      const frame = closed.length ? closed.reduce((m, c) => (box(c).w * box(c).h > box(m).w * box(m).h ? c : m)) : null;
      if (!frame || box(frame).w * box(frame).h < 0.8 * gb.w * gb.h) continue;
      for (const l of linear) {
        if (l.type === "line" && pts(l).length >= 2 && contains(box(frame), box(l), 16)) innerLines.push({ line: l, frame });
      }
    }
  }

  const shapes = all.filter((e) => CLOSED.has(e.type) && !rotated(e));
  const sBox = new Map(shapes.map((s) => [s.id, box(s)]));
  const sPoly = new Map(shapes.map((s) => [s.id, polygon(s)]));
  const boundTargets = new Set(all.filter((e) => LINEAR.has(e.type)).flatMap((e) => [boundId(e, "start"), boundId(e, "end")]).filter(Boolean));
  const area = (b) => b.w * b.h;
  const linearEnds = all.filter((e) => LINEAR.has(e.type) && !stampOf(e)).flatMap((e) => {
    const p = absPts(e);
    return p.length ? [p[0], p[p.length - 1]] : [];
  });
  const freeTexts = all.filter((e) => e.type === "text" && !e.containerId);
  const joined = (s) => boundTargets.has(s.id) || linearEnds.some((p) => Math.abs(signedDist(p, sPoly.get(s.id))) <= 16);
  const ownLabel = (s) => !!s.label?.text || all.some((t) => t.containerId === s.id);
  const labelled = (s) => ownLabel(s) || freeTexts.some((t) => contains(sBox.get(s.id), box(t), 2));
  const containers = new Set();
  for (const a of shapes) {
    const ab = sBox.get(a.id);
    const children = shapes.filter((b) => b !== a && !sameStamp(a, b) && area(ab) > area(sBox.get(b.id)) && contains(ab, sBox.get(b.id)));
    const childArea = children.reduce((acc, b) => acc + area(sBox.get(b.id)), 0);
    if (childArea >= 0.1 * area(ab) || children.some(joined) || (!ownLabel(a) && children.some(labelled))) containers.add(a.id);
  }

  const innermost = new Map();
  for (const s of shapes) {
    const sb = sBox.get(s.id);
    let best = null;
    for (const c of shapes) {
      if (c === s || !containers.has(c.id)) continue;
      const cb = sBox.get(c.id);
      if (cb.w * cb.h > sb.w * sb.h && contains(cb, sb) && (!best || cb.w * cb.h < sBox.get(best).w * sBox.get(best).h)) best = c.id;
    }
    innermost.set(s.id, best);
  }

  // Loose lines fall into three kinds, in this order: a closed frame (every end rests on another
  // line of the frame), a target line (at least two connector ends land on it), a figure (touching
  // lines and plain ellipses whose open ends reach nothing else). Anything left is a connector.
  const lineUnits = units.filter((u) => u.el?.type === "line" && !u.el.startArrowhead && !u.el.endArrowhead && !u.bound[0] && !u.bound[1]);
  const nearIndex = (items) => {
    const cells = new Map();
    const cellsOf = (m) => {
      const b = padBox(m.segs ? box(m.el) : sBox.get(m.id), TOUCH);
      const out = [];
      for (let cx = Math.floor(b.x / CELL); cx <= Math.floor((b.x + b.w) / CELL); cx++) {
        for (let cy = Math.floor(b.y / CELL); cy <= Math.floor((b.y + b.h) / CELL); cy++) out.push(`${cx},${cy}`);
      }
      return out;
    };
    const homes = new Map(items.map((m) => [m, cellsOf(m)]));
    for (const [m, keys] of homes) {
      for (const k of keys) {
        if (!cells.has(k)) cells.set(k, []);
        cells.get(k).push(m);
      }
    }
    return (m) => new Set(homes.get(m).flatMap((k) => cells.get(k)));
  };
  const touches = (p, u) => u.segs.some(([a, b]) => distToSeg(p, a, b) <= TOUCH);
  const markArt = (lines, ellipses, closed) => {
    const art = { closed, box: union([...lines, ...ellipses].map((m) => box(m.el || m))), ids: [...ellipses.map((e) => e.id), ...lines.map((u) => u.el.id)], ellipses };
    for (const u of lines) {
      u.art = art;
      u.straightCheck = false;
      artOf.set(u.el.id, art);
    }
    for (const e of ellipses) artOf.set(e.id, art);
  };
  const nearLines = nearIndex(lineUnits);
  const frameLines = new Set(lineUnits);
  for (let changed = true; changed; ) {
    changed = false;
    for (const u of frameLines) {
      const around = [...nearLines(u)].filter((o) => o !== u && frameLines.has(o));
      if (u.ends.every((p) => around.some((o) => touches(p, o)))) continue;
      frameLines.delete(u);
      changed = true;
    }
  }
  const framePending = new Set(frameLines);
  while (framePending.size) {
    const cluster = [framePending.values().next().value];
    framePending.delete(cluster[0]);
    for (const u of cluster) {
      for (const o of nearLines(u)) {
        if (framePending.has(o) && (o.ends.some((p) => touches(p, u)) || u.ends.some((p) => touches(p, o)))) {
          cluster.push(o);
          framePending.delete(o);
        }
      }
    }
    markArt(cluster, [], true);
  }

  const nearestShape = (p, own = new Set()) => {
    let best = Infinity;
    for (const s of shapes) if (!own.has(s.id)) best = Math.min(best, Math.abs(signedDist(p, sPoly.get(s.id))));
    return best;
  };
  const restsOnShape = (p, own) => shapes.some((s) => !own.has(s.id) && Math.abs(signedDist(p, sPoly.get(s.id))) <= NEAR_JOIN);
  const aimedPast = (u, i, p, own) => {
    const [a, b] = i === 0 ? [u.segs[0][1], u.segs[0][0]] : u.segs[u.segs.length - 1];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (!len) return false;
    const tip = [p[0] + ((b[0] - a[0]) / len) * LABEL_REACH, p[1] + ((b[1] - a[1]) / len) * LABEL_REACH];
    return shapes.some((s) => !own.has(s.id) && !containers.has(s.id) && !joined(s) && insideLength(p, tip, sPoly.get(s.id)) > 0);
  };
  const distToUnit = (p, u) => Math.min(...u.segs.map(([a, b]) => distToSeg(p, a, b)));
  const straightLong = (u) => {
    const [a, b] = u.ends;
    if (Math.hypot(b[0] - a[0], b[1] - a[1]) < TARGET_MIN_LENGTH) return false;
    return u.segs.flat().every((q) => distToSeg(q, a, b) <= 1);
  };
  const targetLines = [];
  for (const t of lineUnits) {
    if (t.art || !straightLong(t)) continue;
    let evidence = 0;
    for (const u of units) {
      if (u === t || u.art) continue;
      const own = new Set(u.ids);
      u.ends.forEach((p, i) => {
        if (u.bound[i]) return;
        const d = distToUnit(p, t);
        if (d > TARGET_REACH || nearestShape(p, own) <= d || aimedPast(u, i, p, own)) return;
        if (u.arrow || restsOnShape(u.ends[1 - i], own)) evidence++;
      });
    }
    if (evidence >= 2) {
      t.target = true;
      targetLines.push(t);
    }
  }

  const figureLines = lineUnits.filter((u) => !u.art && !u.target);
  const arrowEnds = units.filter((u) => u.arrow).flatMap((u) => u.ends);
  const figureEllipses = shapes.filter(
    (s) => s.type === "ellipse" && !stampOf(s) && !boundTargets.has(s.id) && !labelled(s) && !arrowEnds.some((p) => Math.abs(signedDist(p, sPoly.get(s.id))) <= TOUCH),
  );
  const onEllipse = (p, e) => Math.abs(signedDist(p, sPoly.get(e.id))) <= TOUCH;
  const linked = (a, b) => {
    if (a.segs && b.segs) {
      if (a.ends.some((p) => touches(p, b)) || b.ends.some((p) => touches(p, a))) return true;
      return a.segs.some(([p, q]) => b.segs.some(([r, s]) => segParam(p, q, r, s) != null));
    }
    if (a.segs && !b.segs) return a.ends.some((p) => onEllipse(p, b));
    if (b.segs && !a.segs) return b.ends.some((p) => onEllipse(p, a));
    return false;
  };
  const nearFigure = nearIndex([...figureLines, ...figureEllipses]);
  const figurePending = new Set([...figureLines, ...figureEllipses]);
  while (figurePending.size) {
    const cluster = [figurePending.values().next().value];
    figurePending.delete(cluster[0]);
    for (const m of cluster) {
      for (const o of nearFigure(m)) {
        if (figurePending.has(o) && linked(m, o)) {
          cluster.push(o);
          figurePending.delete(o);
        }
      }
    }
    const lines = cluster.filter((m) => m.segs);
    const ellipses = cluster.filter((m) => !m.segs);
    if (cluster.length < 2 || !lines.length || ellipses.length > 1) continue;
    const memberIds = new Set(ellipses.map((e) => e.id));
    const figureBox = union([...lines.map((u) => box(u.el)), ...ellipses.map((e) => sBox.get(e.id))]);
    const openEnds = lines.flatMap((u) => u.ends.filter((p) => !lines.some((o) => o !== u && touches(p, o)) && !ellipses.some((e) => onEllipse(p, e))));
    const limbed = ellipses.length === 1 && openEnds.length >= 2;
    const reached = openEnds.some(
      (p) =>
        (!limbed && targetLines.some((t) => distToUnit(p, t) <= TARGET_REACH)) ||
        shapes.some((s) => !memberIds.has(s.id) && !contains(sBox.get(s.id), figureBox, 2) && Math.abs(signedDist(p, sPoly.get(s.id))) <= (limbed ? NEAR_JOIN : nearBand(sBox.get(s.id)))),
    );
    if (!reached) markArt(lines, ellipses, false);
  }

  const findings = [];
  const accepted = new Set(acceptNotes);
  const boxOf = (id) => {
    const el = byId.get(id);
    if (!el) return null;
    const b = box(el);
    return [r1(b.x), r1(b.y), r1(b.w), r1(b.h)];
  };
  const keys = new Map();
  const add = (f) => {
    if (f.severity === "note" && accepted.has(f.ids[0])) return;
    const n = (keys.get(f.key) || 0) + 1;
    keys.set(f.key, n);
    const key = n > 1 ? `${f.key}#${n}` : f.key;
    const main = [...new Set(f.ids)].filter((id) => byId.has(id)).slice(0, 4);
    findings.push({ ...f, key, boxes: Object.fromEntries(main.map((id) => [id, boxOf(id)])), zoom: zoomCmd(f.ids.flatMap((id) => (byId.has(id) ? groupIdsOf(byId.get(id)) : [id]))) });
  };

  for (const { s, members, size } of badMarkers) {
    add({ check: "stamp-marker", severity: "note", key: `stamp-marker:${s}`, subject: members[0].id, ids: members.map((m) => m.id), measured: { elements: members.length, recorded: size ?? null }, message: `${members.length} elements carry stamp marker ${s}, which records ${size ?? "no"} elements; they are measured as loose elements`, fix: "Restamp the library item with the stamp helper instead of duplicating it or writing the marker by hand." });
  }

  for (const img of all.filter((e) => e.type === "image")) {
    add({ check: "image-unmeasured", severity: "note", key: `image-unmeasured:${img.id}`, subject: img.id, ids: [img.id], measured: { width: r1(img.width), height: r1(img.height) }, message: `${img.id} is an image, so nothing drawn inside it was measured`, fix: "Read it at full size in the screenshot (pass its id to --accept-notes from then on); a fault inside it is fixed in its source, not with apply." });
  }

  const zOrder = new Map(all.map((e, i) => [e.id, i]));
  const isOpaque = (e) => e.backgroundColor && e.backgroundColor !== "transparent" && (e.fillStyle ?? "solid") === "solid" && (e.opacity ?? 100) >= 60;
  const opaques = shapes.filter(isOpaque);
  const hiddenAt = (u, p, skip) => {
    const uz = Math.max(...u.ids.map((id) => zOrder.get(id) ?? -1));
    return opaques.some((o) => o.id !== skip && !u.ids.includes(o.id) && zOrder.get(o.id) > uz && signedDist(p, sPoly.get(o.id)) < 0);
  };
  const visibleInside = (u, a, b, s) => {
    const poly = sPoly.get(s.id);
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const n = Math.max(1, Math.ceil(len / 4));
    let hit = 0;
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n;
      const q = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      if (signedDist(q, poly) < 0 && !hiddenAt(u, q, s.id)) hit += len / n;
    }
    return hit;
  };
  // C: an end outside a shape joins it only if the line is heading at it.
  const aimedAt = (u, i, p, s, d) => {
    const [a, b] = i === 0 ? [u.segs[0][1], u.segs[0][0]] : u.segs[u.segs.length - 1];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (!L) return true;
    const reach = d + 4;
    const far = [p[0] + ((b[0] - a[0]) / L) * reach, p[1] + ((b[1] - a[1]) / L) * reach];
    return insideLength(p, far, sPoly.get(s.id)) > 0 || signedDist(far, sPoly.get(s.id)) <= 0;
  };

  for (const u of units) {
    u.targets = [null, null];
    u.joins = false;
    if (u.art) continue;
    const freeEnds = [];
    u.ends.forEach((p, i) => {
      const bid = u.bound[i];
      const side = i === 0 ? "start" : "end";
      if (bid) {
        const t = byId.get(bid);
        if (!t) {
          add({ check: "connector-end", severity: "fail", key: `connector-end:${u.ids[0]}:${side}`, subject: u.ids[0], ids: [...u.ids], measured: { missing: bid }, message: `${u.ids[0]} is bound to ${bid}, which is not on the canvas`, fix: "Rebind the end to a shape that exists, or delete the connector." });
          return;
        }
        u.targets[i] = t;
        const poly = sPoly.get(t.id);
        if (poly && Math.abs(signedDist(p, poly)) > 16) {
          add({ check: "connector-end", severity: "fail", key: `connector-end:${u.ids[0]}:${side}`, subject: u.ids[0], ids: [...u.ids, ...groupIdsOf(t)], measured: { gap: r1(signedDist(p, poly)) }, message: `${u.ids[0]} is bound to ${t.id} but drawn ${r1(signedDist(p, poly))}px from its border`, fix: "Update the bound shape or recreate the connector with startElementId/endElementId so the canvas re-routes it." });
        }
        return;
      }
      if (hiddenAt(u, p)) return;
      const own = new Set(u.ids);
      const whole = union(u.segs.flat().map(([x, y]) => ({ x, y, w: 0, h: 0 })));
      const cands = shapes
        .filter((s) => !own.has(s.id))
        .map((s) => ({ s, d: signedDist(p, sPoly.get(s.id)) }))
        .filter((c) => Math.abs(c.d) <= nearBand(sBox.get(c.s.id)))
        .filter((c) => (c.d > u.tol ? aimedAt(u, i, p, c.s, c.d) : true))
        .filter((c) => !(u.group && c.d < 0 && contains(sBox.get(c.s.id), whole, 1)));
      const line = targetLines
        .filter((t) => t !== u)
        .map((t) => ({ t, d: distToUnit(p, t) }))
        .filter((c) => c.d <= TARGET_REACH && !cands.some((s) => Math.abs(s.d) <= c.d) && !aimedPast(u, i, p, own))
        .reduce((m, c) => (!m || c.d < m.d ? c : m), null);
      if (line) {
        u.targets[i] = line.t.el;
        if (line.d > TARGET_TOL) {
          const [a, b] = i === 0 ? u.segs[0] : u.segs[u.segs.length - 1];
          const past = line.t.segs.some(([r, s]) => segParam(a, b, r, s) != null);
          const gap = r1(past ? -line.d : line.d);
          add({ check: "connector-end", severity: "fail", key: `connector-end:${u.ids[0]}:${side}`, subject: u.ids[0], ids: [...u.ids, line.t.el.id], measured: { gap, tolerance: TARGET_TOL }, message: past ? `${u.ids[0]} runs ${-gap}px past ${line.t.el.id}` : `${u.ids[0]} ends ${gap}px short of ${line.t.el.id}`, fix: "Move the end onto the line." });
        }
        return;
      }
      if (!cands.length) {
        if (!u.target) freeEnds.push(p.map(r1));
        return;
      }
      const closest = (list) => list.reduce((m, c) => (Math.abs(c.d) < Math.abs(m.d) ? c : m));
      let best = closest(cands);
      const leaves = cands.filter((c) => !containers.has(c.s.id));
      if (containers.has(best.s.id) && leaves.length) {
        const leaf = closest(leaves);
        if (-best.d > u.runIn || Math.abs(leaf.d) - Math.abs(best.d) <= 4) best = leaf;
      } else if (containers.has(best.s.id) && -best.d > DEEP_INSIDE) {
        if (!u.target) freeEnds.push(p.map(r1));
        return;
      }
      u.targets[i] = best.s;
      if (best.d > u.tol || -best.d > u.runIn) {
        const gap = r1(best.d);
        add({ check: "connector-end", severity: Math.abs(gap) <= NEAR_MISS_MAX ? "note" : "fail", key: `connector-end:${u.ids[0]}:${side}`, subject: u.ids[0], ids: [...u.ids, ...groupIdsOf(best.s)], measured: { gap, tolerance: gap > 0 ? u.tol : u.runIn }, message: gap > 0 ? `${u.ids[0]} ends ${gap}px short of ${best.s.id}` : `${u.ids[0]} runs ${-gap}px into ${best.s.id}`, fix: "Bind the end with startElementId/endElementId, or move the end onto the border." });
      }
    });
    if (freeEnds.length) {
      add({ check: "free-end", severity: "note", key: `free-end:${u.ids[0]}`, subject: u.ids[0], ids: [...u.ids], measured: { at: freeEnds }, message: `${u.ids[0]} has ${freeEnds.length === 2 ? "two free ends" : "a free end"} at ${freeEnds.map((q) => `(${q.join(", ")})`).join(" and ")}`, fix: "Fine if meant to be free (pass its id to --accept-notes from then on); otherwise move it onto the shape it should join." });
    }
    u.joins = u.arrow || (u.targets[0] && u.targets[1] && u.targets[0] !== u.targets[1]);
  }

  for (const { line, frame } of innerLines) {
    const poly = sPoly.get(frame.id);
    if (!poly) continue;
    const p = absPts(line);
    const fb = sBox.get(frame.id);
    const tol = Math.max(4, 2 * (line.strokeWidth ?? 2), 0.01 * Math.max(fb.w, fb.h));
    const ends = [p[0], p[p.length - 1]].map((q) => signedDist(q, poly));
    const lb = box(line);
    const divider = ends.some((d) => Math.abs(d) <= tol) || Math.max(lb.w / fb.w, lb.h / fb.h) >= 0.8;
    if (!divider) continue;
    const off = ends.filter((d) => Math.abs(d) > tol && Math.abs(d) <= nearBand(fb));
    if (!off.length) continue;
    const d = off.reduce((m, x) => (Math.abs(x) > Math.abs(m) ? x : m));
    add({ check: "inner-line-end", severity: "note", key: `inner-line-end:${line.id}`, subject: line.id, ids: [line.id, ...groupIdsOf(line)], measured: { gap: r1(d), tolerance: tol }, message: d > 0 ? `${line.id} sticks ${r1(d)}px out of ${frame.id}` : `${line.id} stops ${r1(-d)}px inside the border of ${frame.id}`, fix: "End the line on its frame's border." });
  }

  for (const u of units) {
    const own = new Set(u.ids);
    const targetIds = new Set(u.targets.filter(Boolean).flatMap((t) => groupIdsOf(t)));
    const ub = union(u.segs.flat().map(([x, y]) => ({ x, y, w: 0, h: 0 })));
    for (const s of shapes) {
      if (own.has(s.id) || targetIds.has(s.id) || containers.has(s.id)) continue;
      const sb = sBox.get(s.id);
      if (contains(sb, ub, 1) || (u.art && artOf.get(s.id) === u.art)) continue;
      const poly = sPoly.get(s.id);
      const len = u.segs.reduce((acc, [a, b]) => acc + visibleInside(u, a, b, s), 0);
      if (len > 4) add({ check: "crossing", severity: "fail", key: `crossing:${u.ids[0]}:${s.id}`, subject: u.ids[0], ids: [...u.ids, s.id], measured: { insideLength: r1(len) }, message: `${u.ids[0]} cuts ${r1(len)}px through ${s.id}`, fix: "Route around it with an elbowed or curved path, or move the shapes." });
    }
    for (const s of shapes) {
      if (own.has(s.id) || targetIds.has(s.id) || !RECT_LIKE.has(s.type)) continue;
      const sb = sBox.get(s.id);
      if (u.art && (artOf.get(s.id) === u.art || (u.art.closed && contains(u.art.box, sb, 2)))) continue;
      for (const [a, b] of u.segs) {
        const tol = u.tol;
        let ride = 0;
        if (Math.abs(a[0] - b[0]) <= tol) {
          for (const ex of [sb.x, sb.x + sb.w]) if (Math.abs(a[0] - ex) <= tol) ride = Math.max(ride, Math.min(Math.max(a[1], b[1]), sb.y + sb.h) - Math.max(Math.min(a[1], b[1]), sb.y));
        } else if (Math.abs(a[1] - b[1]) <= tol) {
          for (const ey of [sb.y, sb.y + sb.h]) if (Math.abs(a[1] - ey) <= tol) ride = Math.max(ride, Math.min(Math.max(a[0], b[0]), sb.x + sb.w) - Math.max(Math.min(a[0], b[0]), sb.x));
        }
        const rx0 = Math.max(Math.min(a[0], b[0]), sb.x); const rx1 = Math.min(Math.max(a[0], b[0]), sb.x + sb.w);
        const ry0 = Math.max(Math.min(a[1], b[1]), sb.y); const ry1 = Math.min(Math.max(a[1], b[1]), sb.y + sb.h);
        if (ride > 16 && !hiddenAt(u, [(rx0 + rx1) / 2, (ry0 + ry1) / 2], s.id)) {
          add({ check: "rides-border", severity: "fail", key: `rides-border:${u.ids[0]}:${s.id}`, subject: u.ids[0], ids: [...u.ids, s.id], measured: { length: r1(ride) }, message: `${u.ids[0]} runs ${r1(ride)}px along the border of ${s.id}`, fix: "Move that leg at least 16px off the border." });
          break;
        }
      }
    }
  }

  const peers = shapes.filter((s) => !stampMembers.has(s.id));
  const mask = (s) => stampOf(s) && s.strokeColor === "transparent" && /^#f{3}(f{3})?$/i.test(s.backgroundColor || "");
  for (let i = 0; i < peers.length; i++) {
    for (let j = i + 1; j < peers.length; j++) {
      const a = peers[i];
      const b = peers[j];
      if (sameStamp(a, b) || mask(a) || mask(b)) continue;
      const ab = sBox.get(a.id);
      const bb = sBox.get(b.id);
      const ov = intersect(ab, bb);
      if (ov && Math.min(ov.w, ov.h) > 2 && !contains(ab, bb, 2) && !contains(bb, ab, 2)) {
        const later = zOrder.get(a.id) > zOrder.get(b.id) ? a : b;
        add({ check: "overlap", severity: "fail", over: isOpaque(later) ? later.id : null, key: `overlap:${a.id}:${b.id}`, subject: a.id, ids: [a.id, b.id, ...groupIdsOf(a), ...groupIdsOf(b)], measured: { w: r1(ov.w), h: r1(ov.h) }, message: `${a.id} and ${b.id} overlap by ${r1(ov.w)}x${r1(ov.h)}px`, fix: "Separate them, or make one fully contain the other with padding." });
      }
    }
  }

  for (const [g, members] of stamps) {
    if (members.some((m) => stampMembers.has(m.id))) continue;
    const ub = union(members.filter((m) => m.type !== "text").map(box));
    for (const s of shapes) {
      if (members.includes(s) || stampMembers.has(s.id)) continue;
      const sb = sBox.get(s.id);
      const ov = intersect(ub, sb);
      if (!ov || Math.min(ov.w, ov.h) <= 2 || contains(sb, ub, 2) || contains(ub, sb, 2)) continue;
      if (ov.w * ov.h < 0.5 * ub.w * ub.h) continue;
      add({ check: "stamp-overflow", severity: "fail", key: `stamp-overflow:${g}:${s.id}`, subject: members[0].id, ids: [...members.map((m) => m.id), s.id], measured: { w: r1(ov.w), h: r1(ov.h) }, message: `stamp ${members[0].customData.stamp} pokes out of ${s.id}`, fix: "Move it fully inside, or grow the shape." });
    }
  }
  const texts = all.filter((e) => e.type === "text");
  const free = texts.filter((t) => !t.containerId && !stampOf(t));
  for (const t of texts) {
    if (!t.containerId) continue;
    const c = byId.get(t.containerId);
    if (!c || !CLOSED.has(c.type)) continue;
    if (!contains(box(c), box(t), 2)) add({ check: "text-overflow", severity: "fail", key: `text-overflow:${t.id}`, subject: t.id, ids: [c.id, t.id], measured: {}, message: `label of ${c.id} overflows it`, fix: "Widen or heighten the shape, or shorten the label." });
  }
  const order = new Map(all.map((e, i) => [e.id, i]));
  const filled = shapes.filter(isOpaque);
  for (const t of texts) {
    const tb = inkBox(t);
    for (const s of filled) {
      if (order.get(s.id) < order.get(t.id) || s.id === t.containerId || sameStamp(s, t)) continue;
      if (!intersect(tb, sBox.get(s.id))) continue;
      const share = coveredShare(tb, sPoly.get(s.id));
      if (share < COVERED) continue;
      add({ check: "text-covered", severity: "fail", over: s.id, key: `text-covered:${t.id}:${s.id}`, subject: t.id, ids: [...groupIdsOf(t), ...groupIdsOf(s)], measured: { covered: r1(share) }, message: `text ${t.id} is hidden under ${s.id}, which is drawn after it`, fix: "Move the text clear of the shape, or draw the text after it." });
    }
  }
  for (const [g, members] of stamps) {
    const fr = members.filter((m) => CLOSED.has(m.type));
    if (!fr.length) continue;
    const frame = fr.reduce((m, c) => (box(c).w * box(c).h > box(m).w * box(m).h ? c : m));
    const fb = box(frame);
    const nonText = union(members.filter((m) => m.type !== "text").map(box));
    if (fb.w * fb.h < 0.8 * nonText.w * nonText.h) continue;
    for (const t of members.filter((m) => m.type === "text")) {
      const tb = box(t);
      const ov = intersect(fb, tb);
      const crosses = ov && Math.min(ov.w, ov.h) > 2 && !contains(fb, tb, 2) && !contains(tb, fb, 2);
      if (crosses || boxGap(fb, tb) > 0.5 * Math.max(fb.w, fb.h)) add({ check: "stamp-word", severity: "note", key: `stamp-word:${t.id}`, subject: t.id, ids: [t.id, frame.id], measured: {}, message: `word ${t.id} has left its stamp frame ${frame.id}`, fix: "Re-center the word in its frame, or resize the frame." });
    }
  }
  const borderCheck = (id, tb, ids) => {
    for (const s of shapes) {
      const sb = sBox.get(s.id);
      const ov = intersect(tb, sb);
      if (ov && Math.min(ov.w, ov.h) > 2 && !contains(sb, tb, 2) && !contains(tb, sb, 2)) {
        // Over the text's own shape, or over a border hidden beneath the shape the text sits on.
        const under = filled.filter((c) => c.id !== s.id && zOrder.get(c.id) > zOrder.get(s.id) && contains(sBox.get(c.id), tb, 2)).at(-1);
        const over = isOpaque(s) && zOrder.get(s.id) > zOrder.get(id) ? s : under;
        add({ check: "text-border", severity: "fail", over: over?.id ?? null, key: `text-border:${id}:${s.id}`, subject: id, ids: [...ids, ...groupIdsOf(s)], measured: {}, message: `text ${id} crosses the border of ${s.id}`, fix: "Move the text fully inside or fully outside the shape, or resize the shape." });
      }
    }
  };
  for (const el of all) {
    if (!LINEAR.has(el.type) || stampOf(el)) continue;
    for (const t of texts) if (t.containerId === el.id) borderCheck(t.id, box(t), [t.id, el.id]);
    const label = el.label?.text;
    if (!label) continue;
    const p = absPts(el);
    if (p.length < 2) continue;
    const lens = segments(p).map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1]));
    let rest = lens.reduce((m, n) => m + n, 0) / 2;
    let mid = p[0];
    for (let i = 0; i < lens.length; i++) {
      if (rest <= lens[i]) {
        const f = lens[i] ? rest / lens[i] : 0;
        mid = [p[i][0] + (p[i + 1][0] - p[i][0]) * f, p[i][1] + (p[i + 1][1] - p[i][1]) * f];
        break;
      }
      rest -= lens[i];
    }
    const est = textExtent(el.label.fontSize || el.fontSize || 20, label);
    const arrowLen = lens.reduce((m, n) => m + n, 0);
    const across = Math.abs(p[p.length - 1][0] - p[0][0]) >= Math.abs(p[p.length - 1][1] - p[0][1]) ? est.w : est.h;
    if (across >= 0.7 * arrowLen) add({ check: "label-hides-arrow", severity: "fail", key: `label-hides-arrow:${el.id}`, subject: el.id, ids: [el.id], measured: { length: r1(arrowLen), label: r1(across) }, message: `label of ${el.id} covers most of its ${r1(arrowLen)}px length`, fix: "Lengthen the arrow or shorten the label." });
    borderCheck(el.id, { x: mid[0] - est.w / 2, y: mid[1] - est.h / 2, w: est.w, h: est.h }, [el.id]);
  }
  for (const s of shapes) {
    const label = s.label?.text;
    if (!label) continue;
    const fs = s.label.fontSize || s.fontSize || 20;
    const est = fs * 0.55 * Math.max(...String(label).split("\n").map((l) => l.length));
    if (est > sBox.get(s.id).w - 10) add({ check: "label-fit", severity: "note", key: `label-fit:${s.id}`, subject: s.id, ids: [s.id], measured: { estimatedWidth: r1(est), width: r1(sBox.get(s.id).w) }, message: `label of ${s.id} may not fit (estimated ${r1(est)}px in ${r1(sBox.get(s.id).w)}px)`, fix: "Confirm in the zoom; widen the shape if the text is cut." });
  }
  for (const t of free) {
    const tb = box(t);
    borderCheck(t.id, tb, [t.id]);
    const dists = [];
    for (const u of units) {
      if (u.art && !u.art.closed && boxGap(u.art.box, tb) <= CAPTION_GAP) {
        const ov = intersect(u.art.box, tb);
        if (!ov || Math.min(ov.w, ov.h) <= NEAR_MISS_MAX) continue;
      }
      const d = Math.min(...u.segs.map(([a, b]) => segBoxDist(a, b, tb)));
      if (d === 0) add({ check: "text-on-line", severity: "fail", key: `text-on-line:${t.id}:${u.ids[0]}`, subject: t.id, ids: [t.id, ...u.ids], measured: {}, message: `text ${t.id} sits on ${u.ids[0]}`, fix: "Give the connector its own label (text on the arrow), or move the text off the line." });
      if (u.joins) dists.push({ u, d });
    }
    const inShape = shapes.some((s) => !containers.has(s.id) && contains(sBox.get(s.id), tb, 2));
    const captionGap = Math.min(Infinity, ...shapes.filter((s) => !containers.has(s.id)).map((s) => boxGap(sBox.get(s.id), tb)));
    if (!inShape && String(t.text || "").length <= 24 && dists.length >= 2) {
      dists.sort((m, n) => m.d - n.d);
      const [d1, d2] = dists;
      const caption = captionGap <= CAPTION_GAP && captionGap < d1.d;
      if (!caption && d1.d > 0 && d2.d <= LABEL_REACH) {
        add({ check: "label-ambiguous", severity: "fail", key: `label-ambiguous:${t.id}`, subject: t.id, ids: [t.id, ...d1.u.ids, ...d2.u.ids], measured: { nearest: r1(d1.d), second: r1(d2.d) }, message: `label ${t.id} is ${r1(d1.d)}px from ${d1.u.ids[0]} and ${r1(d2.d)}px from ${d2.u.ids[0]}`, fix: "Put the label on its connector (text on the arrow), or move it clearly next to one line." });
      }
    }
    if ((t.fontSize || 20) < MIN_FONT) add({ check: "font-size", severity: "fail", key: `font-size:${t.id}`, subject: t.id, ids: [t.id], measured: { fontSize: t.fontSize }, message: `text ${t.id} is ${t.fontSize}px`, fix: `Use at least ${MIN_FONT}px for free-standing text.` });
  }

  for (const members of stamps.values()) {
    for (const t of members) {
      if (t.type !== "text" || t.containerId || (t.fontSize || 20) >= MIN_STAMP_FONT) continue;
      add({ check: "font-size", severity: "fail", key: `font-size:${t.id}`, subject: t.id, ids: [t.id], measured: { fontSize: t.fontSize }, message: `stamp word ${t.id} ("${t.text}") is ${r1(t.fontSize)}px`, fix: `Scale the stamp up, or raise this word to at least ${MIN_STAMP_FONT}px. If neither fits and the name is clear from what is around it, remove the word.` });
    }
  }

  const alignable = [];
  const artwork = new Map();
  const figures = new Set();
  for (const s of peers) {
    if (containers.has(s.id)) continue;
    const fig = artOf.get(s.id);
    if (fig) {
      if (!figures.has(fig)) alignable.push({ el: fig.ellipses[0], b: fig.box });
      figures.add(fig);
      continue;
    }
    const g = stampOf(s);
    if (g) {
      const entry = artwork.get(g) || { el: s, boxes: [] };
      if (sBox.get(s.id).w * sBox.get(s.id).h > sBox.get(entry.el.id).w * sBox.get(entry.el.id).h) entry.el = s;
      entry.boxes.push(sBox.get(s.id));
      artwork.set(g, entry);
    } else alignable.push({ el: s, b: sBox.get(s.id) });
  }
  for (const { el, boxes } of artwork.values()) alignable.push({ el, b: union(boxes) });
  for (let k = alignable.length - 1; k >= 0; k--) if (Math.min(alignable[k].b.w, alignable[k].b.h) < 16) alignable.splice(k, 1);
  const softAlign = [];
  for (let i = 0; i < alignable.length; i++) {
    for (let j = i + 1; j < alignable.length; j++) {
      if (innermost.get(alignable[i].el.id) !== innermost.get(alignable[j].el.id)) continue;
      const a = alignable[i].b;
      const b = alignable[j].b;
      const vOverlap = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      const hOverlap = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
      let diffs = null;
      let axis = "";
      if (hOverlap <= 0 && -hOverlap <= 400 && vOverlap >= 0.5 * Math.min(a.h, b.h)) {
        diffs = [a.y - b.y, a.y + a.h / 2 - (b.y + b.h / 2), a.y + a.h - (b.y + b.h)];
        axis = "row";
      } else if (vOverlap <= 0 && -vOverlap <= 400 && hOverlap >= 0.5 * Math.min(a.w, b.w)) {
        diffs = [a.x - b.x, a.x + a.w / 2 - (b.x + b.w / 2), a.x + a.w - (b.x + b.w)];
        axis = "column";
      }
      if (!diffs) continue;
      const m = Math.min(...diffs.map(Math.abs));
      if (m > NEAR_MISS_MIN && m <= NEAR_MISS_MAX) {
        const ratio = (x, y) => Math.min(x, y) / Math.max(x, y);
        if (ratio(a.w, b.w) < 0.75 || ratio(a.h, b.h) < 0.75) { softAlign.push(alignable[i].el.id, alignable[j].el.id); continue; }
        const ids = [...groupIdsOf(alignable[i].el), ...groupIdsOf(alignable[j].el)];
        const edge = (axis === "row" ? ["top", "center", "bottom"] : ["left", "center", "right"])[diffs.findIndex((d) => Math.abs(d) === m)];
        add({ check: "near-align", severity: "note", key: `near-align:${alignable[i].el.id}:${alignable[j].el.id}`, subject: alignable[i].el.id, ids, measured: { offset: r1(m), axis, edge }, message: `${alignable[i].el.id} and ${alignable[j].el.id} are ${r1(m)}px off a shared ${edge}`, fix: `Snap their ${edge} together (arrange align), or offset them clearly on purpose.` });
      }
    }
  }

  if (softAlign.length) add({ check: "near-align-soft", severity: "note", key: "near-align-soft", subject: softAlign[0], ids: [...new Set(softAlign)], measured: { shapes: new Set(softAlign).size }, message: `${new Set(softAlign).size} unlike-sized shapes sit a few px off a shared edge`, fix: "Look once; fine unless a row or column reads as crooked." });
  for (const u of units) {
    if (!u.straightCheck) continue;
    for (const [a, b] of u.segs) {
      const dx = Math.abs(b[0] - a[0]);
      const dy = Math.abs(b[1] - a[1]);
      const off = dx >= dy ? dy : dx;
      const run = Math.max(dx, dy);
      if (run >= 24 && off > NEAR_MISS_MIN && off <= NEAR_MISS_MAX) {
        add({ check: "near-straight", severity: "note", key: `near-straight:${u.ids[0]}`, subject: u.ids[0], ids: [...u.ids, ...u.targets.filter(Boolean).flatMap((t) => groupIdsOf(t))], measured: { offset: r1(off), run: r1(run) }, message: `${u.ids[0]} is ${r1(off)}px off straight over ${r1(run)}px`, fix: "Align the two shapes it joins, or make the leg exactly straight." });
        break;
      }
    }
  }

  const seenBig = new Set();
  const loose = shapes.filter((s) => !containers.has(s.id) && !stampOf(s)).map((s) => area(sBox.get(s.id)));
  const stampAreas = [...stamps.values()].map((m) => area(union(m.map(box))));
  const areas = [...loose, ...stampAreas].sort((m, n) => m - n);
  const medianArea = areas.length ? areas[Math.floor((areas.length - 1) / 2)] : 0;
  for (const u of units) {
    const [a, b] = u.targets;
    if (!a || !b || a === b || containers.has(a.id) || containers.has(b.id)) continue;
    const ab = sBox.get(a.id);
    const bb = sBox.get(b.id);
    if (!ab || !bb) continue;
    const ratio = Math.max(ab.w / bb.w, bb.w / ab.w, ab.h / bb.h, bb.h / ab.h);
    if (ratio <= OVERSIZE_RATIO) continue;
    const big = ab.w * ab.h >= bb.w * bb.h ? a : b;
    if (seenBig.has(big.id)) continue;
    const bigBox = sBox.get(big.id);
    if (area(bigBox) <= OVERSIZE_RATIO ** 2 * medianArea) continue;
    const content = all
      .filter((e) => e.id !== big.id && !(LINEAR.has(e.type) && !stampOf(e)) && !stampMembers.has(e.id))
      .filter((e) => {
        const eb = box(e);
        if (LINEAR.has(e.type) && (eb.w >= 0.9 * bigBox.w || eb.h >= 0.9 * bigBox.h)) return false;
        return contains(bigBox, eb, 2) && !contains(eb, bigBox, 0);
      })
      .map(inkBox);
    if (big.label?.text) {
      const est = textExtent(big.label.fontSize || big.fontSize || 20, big.label.text);
      content.push({ x: bigBox.x + (bigBox.w - est.w) / 2, y: bigBox.y + (bigBox.h - est.h) / 2, w: est.w, h: est.h });
    }
    const usable = bigBox.w * bigBox.h * (big.type === "diamond" ? 0.5 : big.type === "ellipse" ? Math.PI / 4 : 1);
    const inked = content.length ? intersect(padBox(union(content), CONTENT_PAD), bigBox) : null;
    const fill = inked ? Math.min(1, (inked.w * inked.h) / usable) : 0;
    if (fill < OVERSIZE_FILL) {
      seenBig.add(big.id);
      const peer = big === a ? b : a;
      add({ check: "oversized", severity: "note", key: `oversized:${big.id}`, subject: big.id, ids: [...groupIdsOf(big), ...groupIdsOf(peer)], measured: { ratio: r1(ratio), fill: r1(fill) }, message: `${big.id} is ${r1(ratio)}x its joined peer ${peer.id} and its content fills ${Math.round(fill * 100)}%`, fix: "Shrink it to its content and move the layout so the connector still meets it." });
    }
  }

  for (const s of shapes) {
    const lid = opaques.find((o) => zOrder.get(o.id) > zOrder.get(s.id) && !groupIdsOf(s).includes(o.id) && sPoly.get(s.id).every((p) => signedDist(p, sPoly.get(o.id)) <= 0));
    if (lid) add({ check: "shape-covered", severity: "fail", over: lid.id, key: `shape-covered:${s.id}:${lid.id}`, subject: s.id, ids: [...groupIdsOf(s), ...groupIdsOf(lid)], measured: {}, message: `${s.id} is hidden under ${lid.id}, which is drawn after it`, fix: "The picture cannot show this. If the reader needs it, draw it after the shape or move it clear; if it is covered on purpose, dismiss this with that reason." });
  }

  const byCover = new Map();
  for (const f of findings) {
    if (f.over) byCover.set(f.over, [...(byCover.get(f.over) || []), f]);
    delete f.over;
  }
  for (const [id, list] of byCover) {
    if (list.length < COVERS_MANY) continue;
    for (const f of list) findings.splice(findings.indexOf(f), 1);
    const ownIds = new Set(groupIdsOf(byId.get(id)));
    const items = [...new Set(list.flatMap((f) => f.ids))].filter((x) => !ownIds.has(x));
    const hiddenWords = list.filter((f) => f.check === "text-covered").map((f) => `"${byId.get(f.subject).text}"`);
    const hiddenShapes = list.filter((f) => f.check === "shape-covered").map((f) => f.subject);
    const hidden = [...new Set([...hiddenWords, ...hiddenShapes])];
    const hides = hidden.length > HIDES_LISTED ? [...hidden.slice(0, HIDES_LISTED), `and ${hidden.length - HIDES_LISTED} more`] : hidden;
    add({ check: "covers-many", severity: "fail", key: `covers-many:${id}`, subject: id, ids: [id, ...items], measured: { findings: list.length, items: items.length }, message: `${id} sits over ${items.length} other elements (${list.length} overlap or text findings rolled into this one)${hides.length ? `; it hides ${hides.join(", ")}` : ""}`, fix: "Look at it once. If it is on top on purpose and the picture reads well, dismiss this with that reason; do not rearrange the drawing. If it hides something the reader needs, move one of them." });
  }

  const cleared = [];
  const refused = [];
  for (const key of clear) {
    const f = findings.find((x) => x.severity === "fail" && x.key === key);
    if (!f) {
      refused.push(`${key}: no such fail (use the finding's key)`);
      continue;
    }
    findings.splice(findings.indexOf(f), 1);
    cleared.push(f);
  }

  const rank = (f) => (f.severity === "fail" ? 0 : 100) + ORDER.indexOf(f.check);
  findings.sort((m, n) => rank(m) - rank(n));
  const byCheck = {};
  for (const f of findings) byCheck[f.check] = (byCheck[f.check] || 0) + 1;
  return {
    guidance: "Findings point at where to look; they do not decide. Judge each in the picture: fix what hurts understanding, dismiss the rest with --clear and one line of reason.",
    elements: all.length,
    fails: findings.filter((f) => f.severity === "fail").length,
    notes: findings.filter((f) => f.severity === "note").length,
    byCheck,
    findings,
    cleared,
    refused,
    skipped: { rotated: all.filter(rotated).map((e) => e.id) },
  };
}

function zoomCmd(ids) {
  const unique = [...new Set(ids)].slice(0, 60);
  return `npx -y mcp-excalidraw-server screenshot --ids ${unique.join(",")} --scale 2 --padding 24`;
}

async function load(argv) {
  const args = argv.slice(2);
  let file = null;
  let url = process.env.EXPRESS_SERVER_URL || "http://127.0.0.1:3000";
  let max = 100;
  let acceptNotes = [];
  let clear = [];
  const list = (v) => String(v ?? "").split(",").filter(Boolean);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--url") url = args[++i];
    else if (args[i] === "--max") {
      const n = Number(args[i + 1]);
      if (Number.isInteger(n) && n > 0) {
        max = n;
        i++;
      }
    } else if (args[i] === "--accept-notes") acceptNotes = list(args[++i]);
    else if (args[i] === "--clear") clear = list(args[++i]);
    else if (args[i] === "-h" || args[i] === "--help") return { help: true };
    else file = args[i];
  }
  const opts = { max, acceptNotes, clear };
  if (file === "-") return { data: JSON.parse(readFileSync(0, "utf8")), source: "stdin", ...opts };
  if (file) return { data: JSON.parse(readFileSync(file, "utf8")), source: file, ...opts };
  let res;
  try {
    res = await fetch(`${url.replace(/\/$/, "")}/api/elements`);
  } catch {
    const err = new Error(`canvas unreachable at ${url}`);
    err.exitCode = 3;
    throw err;
  }
  if (!res.ok) throw new Error(`canvas returned HTTP ${res.status}`);
  return { data: await res.json(), source: url, ...opts };
}

async function main(argv) {
  const { help, data, source, max, acceptNotes, clear } = await load(argv);
  if (help) {
    console.error("Usage: node check-scene.mjs [scene.excalidraw|elements.json|-] [--url <canvas>] [--max N] [--accept-notes id,id] [--clear key,key]");
    return;
  }
  const result = checkScene(data, { acceptNotes, clear });
  const listed = result.findings.slice(0, max);
  console.log(JSON.stringify({ success: true, source, ...result, findings: listed, truncated: listed.length < result.findings.length }, null, 2));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main(process.argv).catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(err?.exitCode || 1);
  });
}
