'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PACK_FILES = {
  stick: 'stick-figures.excalidrawlib',
  ux: 'basic-ux-wireframing-elements.excalidrawlib',
  aws: 'aws-architecture-icons.excalidrawlib',
  forms: 'forms.excalidrawlib',
  'system-design': 'system-design.excalidrawlib',
  emojis: 'emojis.excalidrawlib',
  bubbles: 'bubbles.excalidrawlib',
  'post-it': 'post-it.excalidrawlib',
  'awesome-icons': 'awesome-icons.excalidrawlib',
  'data-viz': 'data-viz.excalidrawlib',
  'c4-architecture': 'c4-architecture.excalidrawlib',
  'data-processing': 'data-processing.excalidrawlib',
  'enterprise-integration-patterns': 'enterprise-integration-patterns.excalidrawlib',
  icons: 'icons.excalidrawlib',
  'network-topology-icons': 'network-topology-icons.excalidrawlib',
  'stick-people': 'stick-people.excalidrawlib',
  'uml-class-er': 'UML-ER-library.excalidrawlib',
  'uml-component': 'uml-component-diagram.excalidrawlib',
  'uml-deployment': 'uml-deployment-diagram.excalidrawlib',
  'uml-activity': 'uml-library-activity-diagram.excalidrawlib',
};

const CENTRED_WITHIN = 3;
const WIDE_CHAR = /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿＀-｠]/;

function skillRootFromScript() {
  return path.resolve(__dirname, '..');
}

function newId() {
  return crypto.randomBytes(8).toString('hex');
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function collectIds(elements) {
  const elementIds = new Set();
  const groupIds = new Set();
  for (const el of elements) {
    if (el.id) elementIds.add(el.id);
    for (const g of el.groupIds || []) groupIds.add(g);
  }
  return { elementIds, groupIds };
}

function remapId(value, map) {
  if (value == null) return value;
  return map.has(value) ? map.get(value) : value;
}

// Rough ink width per character and font size: 1 handwritten, 2 sans, 3 mono. CJK is a full square.
function inkWidth(el) {
  const perChar = { 2: 0.47, 3: 0.6 }[el.fontFamily] || 0.55;
  const lineWidth = (line) => [...line].reduce((sum, ch) => sum + (WIDE_CHAR.test(ch) ? 1 : perChar), 0);
  return (el.fontSize || 20) * Math.max(...el.text.split('\n').map(lineWidth));
}

// The horizontal middle of the shape this text was authored on: its smallest rectangle, else the item's shapes.
function homeCentre(elements, text) {
  const hole = smallestContainingRect(elements, text);
  if (hole) return hole.x + hole.width / 2;
  const shapes = elements.filter((el) => el.type !== 'text' && typeof el.x === 'number' && typeof el.width === 'number');
  if (!shapes.length) return null;
  const left = Math.min(...shapes.map((el) => el.x));
  const right = Math.max(...shapes.map((el) => el.x + el.width));
  return (left + right) / 2;
}

function replaceTexts(elements, replacePairs) {
  const texts = elements.filter((el) => el.type === 'text' && typeof el.text === 'string');
  const set = (el, value) => {
    const centre = el.containerId ? null : homeCentre(elements, el);
    const centred = centre != null && Math.abs(el.x + (el.width || 0) / 2 - centre) <= CENTRED_WITHIN;
    el.text = value;
    el.originalText = value;
    if (centred) {
      el.width = inkWidth(el);
      el.x = centre - el.width / 2;
    }
  };
  for (const [from, to] of replacePairs) {
    const whole = texts.filter((el) => el.text === from);
    if (whole.length) {
      whole.forEach((el) => set(el, to));
      continue;
    }
    const lines = texts.flatMap((el) => el.text.split('\n').filter((l) => l === from).map(() => el));
    if (lines.length > 1) throw usageError(`--replace-text line is not unique: ${from}`);
    if (lines.length) set(lines[0], lines[0].text.split('\n').map((l) => (l === from ? to : l)).join('\n'));
  }
}

function remapAndShift(elements, targetX, targetY, replacePairs) {
  const cloned = deepClone(elements);
  let { minX, minY } = bboxMin(cloned);
  if (!Number.isFinite(minX)) minX = 0;
  if (!Number.isFinite(minY)) minY = 0;
  const dx = targetX - minX;
  const dy = targetY - minY;

  const { elementIds, groupIds } = collectIds(cloned);
  const idMap = new Map();
  const groupMap = new Map();
  for (const id of elementIds) idMap.set(id, newId());
  for (const id of groupIds) groupMap.set(id, newId());

  for (const el of cloned) {
    if (el.id) el.id = remapId(el.id, idMap);
    if (typeof el.x === 'number') el.x += dx;
    if (typeof el.y === 'number') el.y += dy;
    if (Array.isArray(el.groupIds)) {
      el.groupIds = el.groupIds.map((g) => remapId(g, groupMap));
    }
    if (el.containerId) el.containerId = remapId(el.containerId, idMap);
    if (el.frameId) el.frameId = remapId(el.frameId, idMap);
    if (Array.isArray(el.boundElements)) {
      for (const b of el.boundElements) {
        if (b && b.id) b.id = remapId(b.id, idMap);
      }
    }
    if (el.startBinding && el.startBinding.elementId) {
      el.startBinding.elementId = remapId(el.startBinding.elementId, idMap);
    }
    if (el.endBinding && el.endBinding.elementId) {
      el.endBinding.elementId = remapId(el.endBinding.elementId, idMap);
    }
    if (el.start && el.start.id) el.start.id = remapId(el.start.id, idMap);
    if (el.end && el.end.id) el.end.id = remapId(el.end.id, idMap);
    el.seed = crypto.randomInt(1, 2 ** 31);
    el.version = 1;
    delete el.updated;
    delete el.versionNonce;
    delete el.index;
  }
  if (replacePairs && replacePairs.length) replaceTexts(cloned, replacePairs);
  for (const el of cloned) {
    if (el.type === 'text' && el.textAlign === 'center' && !el.containerId) {
      el.textAlign = 'left';
    }
  }
  return cloned;
}

function smallestContainingRect(elements, text) {
  const groups = new Set(text.groupIds || []);
  if (!groups.size) return null;
  const cx = text.x + (text.width || 0) / 2;
  const cy = text.y + (text.height || 0) / 2;
  let best = null;
  let bestArea = Infinity;
  for (const el of elements) {
    if (el.type !== 'rectangle') continue;
    if (typeof el.width !== 'number' || typeof el.height !== 'number') continue;
    if (!(el.groupIds || []).some((g) => groups.has(g))) continue;
    if (el.x > cx || cx > el.x + el.width || el.y > cy || cy > el.y + el.height) continue;
    const area = el.width * el.height;
    if (area < bestArea) {
      best = el;
      bestArea = area;
    }
  }
  return best;
}

function centerMiddleTextInHoles(elements) {
  for (const t of elements) {
    if (t.type !== 'text' || t.containerId) continue;
    if (t.verticalAlign !== 'middle') continue;
    const hole = smallestContainingRect(elements, t);
    if (!hole) continue;
    const fs = t.fontSize || t.height || 20;
    t.verticalAlign = 'top';
    // Hug the line box to catalog ratio so Virgil ink is not a tall empty em-box.
    t.height = fs * 1.25;
    t.y = hole.y + (hole.height - fs) / 2;
  }
  return elements;
}

// The canvas lays out bound text in the middle of its container, whatever the element says, so a
// title authored at the top has to be free text to stay there.
function unbindTopText(elements) {
  for (const t of elements) {
    if (t.type !== 'text' || typeof t.text !== 'string' || !t.containerId || t.verticalAlign !== 'top') continue;
    const box = elements.find((el) => el.id === t.containerId);
    if (!box) continue;
    box.boundElements = (box.boundElements || []).filter((b) => b.id !== t.id);
    delete t.containerId;
    t.textAlign = 'left';
    t.originalText = t.text;
    t.width = (t.fontSize || 20) * 0.49 * Math.max(...t.text.split('\n').map((l) => l.length));
    t.x = box.x + (box.width - t.width) / 2;
  }
  return elements;
}

function bboxMin(elements) {
  let minX = Infinity;
  let minY = Infinity;
  for (const el of elements) {
    const points = Array.isArray(el.points) ? el.points.filter((p) => Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1])) : [];
    if (typeof el.x === 'number') minX = Math.min(minX, el.x + Math.min(0, ...points.map((p) => p[0])));
    if (typeof el.y === 'number') minY = Math.min(minY, el.y + Math.min(0, ...points.map((p) => p[1])));
  }
  return { minX, minY };
}

function scaleElements(elements, factor, originX, originY) {
  if (factor === 1) return elements;
  for (const el of elements) {
    if (typeof el.x === 'number') el.x = originX + (el.x - originX) * factor;
    if (typeof el.y === 'number') el.y = originY + (el.y - originY) * factor;
    if (typeof el.width === 'number') el.width *= factor;
    if (typeof el.height === 'number') el.height *= factor;
    if (typeof el.fontSize === 'number') el.fontSize *= factor;
    if (typeof el.baseline === 'number') el.baseline *= factor;
    if (Array.isArray(el.points)) {
      el.points = el.points.map((p) =>
        Array.isArray(p) && p.length >= 2 ? [p[0] * factor, p[1] * factor] : p
      );
    }
  }
  return elements;
}

function usageError(message) {
  const err = new Error(message);
  err.exitCode = 2;
  return err;
}

function loadPack(skillRoot, pack) {
  const file = PACK_FILES[pack];
  if (!file) throw usageError(`unknown pack: ${pack}`);
  const full = path.join(skillRoot, 'libraries', file);
  let json;
  try {
    json = JSON.parse(fs.readFileSync(full, 'utf8'));
  } catch (cause) {
    const err = usageError(`cannot read library for pack ${pack}: ${full}`);
    err.cause = cause;
    throw err;
  }
  if (json.type !== 'excalidrawlib' || json.version !== 2 || !Array.isArray(json.libraryItems)) {
    throw usageError(`not a v2 named library: ${file}`);
  }
  return { json, full };
}

function stamp(options) {
  const skillRoot = options.skillRoot || skillRootFromScript();
  const pack = options.pack;
  const name = options.name;
  const x = options.x;
  const y = options.y;
  const replacePairs = options.replacePairs || [];
  if (!pack || !name || typeof x !== 'number' || Number.isNaN(x) || typeof y !== 'number' || Number.isNaN(y)) {
    throw usageError('required: --pack --name --x --y');
  }
  const { json, full } = loadPack(skillRoot, pack);
  const item = json.libraryItems.find((it) => it.name === name);
  if (!item) throw usageError(`unknown name in pack ${pack}: ${name}`);
  const before = fs.readFileSync(full);
  const stamped = remapAndShift(item.elements || [], x, y, replacePairs);
  const after = fs.readFileSync(full);
  if (Buffer.compare(before, after) !== 0) {
    throw new Error('library file mutated');
  }
  const factor = options.scale == null ? 1 : options.scale;
  if (typeof factor !== 'number' || !Number.isFinite(factor) || factor <= 0) {
    throw usageError(`--scale must be a number > 0, got ${options.scale}`);
  }
  const placed = centerMiddleTextInHoles(unbindTopText(scaleElements(stamped, factor, x, y)));
  const stampId = newId();
  const stampWords = placed.filter((el) => el.type === 'text').length;
  for (const el of placed) {
    el.customData = { ...(el.customData || {}), stampId, stamp: `${pack}/${name}`, stampSize: placed.length, stampWords };
  }
  return placed;
}

function parseArgs(argv) {
  const out = { replacePairs: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const next = () => {
      i += 1;
      if (i >= argv.length) throw usageError(`missing value for ${a}`);
      return argv[i];
    };
    if (a === '--pack') out.pack = next();
    else if (a === '--name') out.name = next();
    else if (a === '--x') out.x = Number(next());
    else if (a === '--y') out.y = Number(next());
    else if (a === '--out') out.outPath = next();
    else if (a === '--scale') {
      const raw = next();
      const n = Number(raw);
      if (!Number.isFinite(n) || n <= 0) throw usageError(`--scale must be a number > 0, got ${raw}`);
      out.scale = n;
    }
    else if (a === '--replace-text') {
      const spec = next();
      const eq = spec.indexOf('=');
      if (eq < 1) throw usageError(`--replace-text needs old=new, got ${spec}`);
      out.replacePairs.push([spec.slice(0, eq), spec.slice(eq + 1)]);
    } else if (a === '--help' || a === '-h') {
      out.help = true;
    } else {
      throw usageError(`unknown flag: ${a}`);
    }
  }
  return out;
}

function main(argv) {
  try {
    const args = parseArgs(argv);
    if (args.help) {
      process.stderr.write(
        'Usage: stamp-library-item.js --pack stick|ux|aws|forms|system-design|emojis|bubbles|post-it|awesome-icons|data-viz|c4-architecture|data-processing|enterprise-integration-patterns|icons|network-topology-icons|stick-people|uml-class-er|uml-component|uml-deployment|uml-activity --name <exact> --x <n> --y <n> [--scale <factor>] [--replace-text old=new] [--out file.json]\n'
      );
      return 0;
    }
    const stamped = stamp({
      pack: args.pack,
      name: args.name,
      x: args.x,
      y: args.y,
      scale: args.scale,
      replacePairs: args.replacePairs,
    });
    const text = JSON.stringify(stamped);
    if (args.outPath) fs.writeFileSync(args.outPath, text);
    process.stdout.write(text);
    return 0;
  } catch (err) {
    process.stderr.write(String(err.message || err) + '\n');
    return err.exitCode || 1;
  }
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}

module.exports = {
  PACK_FILES,
  skillRootFromScript,
  remapAndShift,
  bboxMin,
  scaleElements,
  smallestContainingRect,
  centerMiddleTextInHoles,
  unbindTopText,
  stamp,
  parseArgs,
  main,
};
