'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const helper = require('../stamp-library-item.js');
const {
  PACK_FILES,
  remapAndShift,
  bboxMin,
  stamp,
  parseArgs,
  smallestContainingRect,
} = helper;

const skillRoot = path.join(__dirname, '..', '..');
const scriptPath = path.join(__dirname, '..', 'stamp-library-item.js');

function libraryJson(pack) {
  const file = PACK_FILES[pack];
  return JSON.parse(fs.readFileSync(path.join(skillRoot, 'libraries', file), 'utf8'));
}

function itemNamed(pack, name) {
  const item = libraryJson(pack).libraryItems.find((it) => it.name === name);
  assert.ok(item, `missing item ${name} in ${pack}`);
  return item;
}

function spawnStamp(args) {
  return spawnSync(process.execPath, [scriptPath, ...args], {
    encoding: 'utf8',
    windowsHide: true,
  });
}

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

test('duplicate names inside a pack', () => {
  for (const pack of Object.keys(PACK_FILES)) {
    const names = libraryJson(pack).libraryItems.map((it) => it.name);
    assert.equal(new Set(names).size, names.length, pack);
  }
});

test('stick Stick man at (100,200)', () => {
  const original = itemNamed('stick', 'Stick man');
  const originalIds = new Set(original.elements.map((el) => el.id));
  const out = stamp({ pack: 'stick', name: 'Stick man', x: 100, y: 200, skillRoot });
  const min = bboxMin(out);
  assert.ok(Math.abs(min.minX - 100) < 1e-6);
  assert.ok(Math.abs(min.minY - 200) < 1e-6);
  for (const el of out) {
    assert.match(el.id, /^[0-9a-f]{16}$/);
    assert.equal(originalIds.has(el.id), false);
  }
});

test('stamp same item twice yields disjoint ids and groupIds', () => {
  const a = stamp({ pack: 'stick', name: 'Stick man', x: 0, y: 0, skillRoot });
  const b = stamp({ pack: 'stick', name: 'Stick man', x: 10, y: 10, skillRoot });
  const idsA = new Set(a.map((el) => el.id));
  const idsB = new Set(b.map((el) => el.id));
  for (const id of idsA) assert.equal(idsB.has(id), false);
  const groupsA = new Set(a.flatMap((el) => el.groupIds || []));
  const groupsB = new Set(b.flatMap((el) => el.groupIds || []));
  for (const id of groupsA) assert.equal(groupsB.has(id), false);
});

test('Happy keeps face text and remaps nested groupIds', () => {
  const original = itemNamed('stick', 'Happy');
  const originalGroups = new Set(original.elements.flatMap((el) => el.groupIds || []));
  const originalEllipseGroups = original.elements.find((el) => el.type === 'ellipse').groupIds.length;
  const out = stamp({ pack: 'stick', name: 'Happy', x: 0, y: 0, skillRoot });
  const face = out.find((el) => el.type === 'text');
  assert.equal(face.text, '｡◕‿◕｡');
  const newGroups = out.flatMap((el) => el.groupIds || []);
  for (const g of newGroups) assert.equal(originalGroups.has(g), false);
  const ellipse = out.find((el) => el.type === 'ellipse');
  assert.equal(ellipse.groupIds.length, originalEllipseGroups);
  assert.equal(ellipse.groupIds.length, 2);
});

test('Search field is grouped', () => {
  const original = itemNamed('ux', 'Search field');
  const originalGroups = new Set(original.elements.flatMap((el) => el.groupIds || []));
  const out = stamp({ pack: 'ux', name: 'Search field', x: 5, y: 5, skillRoot });
  original.elements.forEach((orig, i) => {
    if (orig.groupIds && orig.groupIds.length) {
      assert.ok(out[i].groupIds.length >= 1);
      for (const g of out[i].groupIds) assert.equal(originalGroups.has(g), false);
    }
  });
});

test('Database boundElements out-of-item ids are left unchanged', () => {
  const original = itemNamed('c4-architecture', 'Database');
  const inItem = new Set(original.elements.map((el) => el.id));
  const originalBoundOutItem = [];
  for (const el of original.elements) {
    for (const b of el.boundElements || []) {
      if (b && b.id && !inItem.has(b.id)) originalBoundOutItem.push(b.id);
    }
  }
  assert.ok(originalBoundOutItem.length > 0, 'Database fixture should have out-of-item bound ids');
  const originalBoundInItem = original.elements.flatMap((el) =>
    (el.boundElements || []).filter((b) => b && b.id && inItem.has(b.id)).map((b) => b.id)
  );
  assert.equal(originalBoundInItem.length, 0);
  const out = stamp({ pack: 'c4-architecture', name: 'Database', x: 0, y: 0, skillRoot });
  const outBound = new Set();
  for (const el of out) {
    for (const b of el.boundElements || []) {
      if (b && b.id) outBound.add(b.id);
    }
  }
  for (const id of originalBoundOutItem) {
    assert.equal(outBound.has(id), true, `out-of-item bound id should survive: ${id}`);
  }
});

test('remapAndShift remaps boundElements, containerId, frameId, and startBinding', () => {
  const elements = [
    {
      id: 'a',
      type: 'rectangle',
      x: 5,
      y: 5,
      width: 10,
      height: 10,
      boundElements: [
        { id: 'b', type: 'arrow' },
        { id: 'c', type: 'text' },
      ],
    },
    {
      id: 'b',
      type: 'arrow',
      x: 5,
      y: 15,
      width: 10,
      height: 10,
      startBinding: { elementId: 'a' },
      points: [[0, 0], [0, 10]],
    },
    {
      id: 'c',
      type: 'text',
      x: 6,
      y: 6,
      width: 8,
      height: 8,
      containerId: 'a',
      frameId: 'a',
      text: 'hi',
    },
  ];
  const out = remapAndShift(elements, 0, 0, []);
  const ids = out.map((el) => el.id);
  assert.equal(ids.includes('a'), false);
  assert.equal(ids.includes('b'), false);
  assert.equal(ids.includes('c'), false);
  const rect = out.find((el) => el.type === 'rectangle');
  const arrow = out.find((el) => el.type === 'arrow');
  const text = out.find((el) => el.type === 'text');
  assert.equal(arrow.startBinding.elementId, rect.id);
  assert.equal(rect.boundElements[0].id, arrow.id);
  assert.equal(rect.boundElements[1].id, text.id);
  assert.equal(text.containerId, rect.id);
  assert.equal(text.frameId, rect.id);
  const min = bboxMin(out);
  assert.ok(Math.abs(min.minX - 0) < 1e-6);
  assert.ok(Math.abs(min.minY - 0) < 1e-6);
});

test('relative geometry preserved', () => {
  const original = itemNamed('stick', 'Stick man').elements;
  let minX = Infinity;
  let minY = Infinity;
  for (const el of original) {
    if (typeof el.x === 'number') minX = Math.min(minX, el.x);
    if (typeof el.y === 'number') minY = Math.min(minY, el.y);
  }
  const before = original.map((el) => ({ dx: el.x - minX, dy: el.y - minY }));
  const out = stamp({ pack: 'stick', name: 'Stick man', x: 50, y: 60, skillRoot });
  const afterMin = bboxMin(out);
  out.forEach((el, i) => {
    assert.ok(Math.abs(el.x - afterMin.minX - before[i].dx) < 1e-6);
    assert.ok(Math.abs(el.y - afterMin.minY - before[i].dy) < 1e-6);
  });
});

test('--replace-text Search=Query', () => {
  const replaced = stamp({
    pack: 'ux',
    name: 'Search field',
    x: 0,
    y: 0,
    skillRoot,
    replacePairs: [['Search', 'Query']],
  });
  assert.ok(replaced.some((el) => el.type === 'text' && el.text === 'Query'));
  const plain = stamp({ pack: 'ux', name: 'Search field', x: 0, y: 0, skillRoot });
  assert.ok(plain.some((el) => el.type === 'text' && el.text === 'Search'));
});

test('replace-text no-match is no-op', () => {
  const out = stamp({
    pack: 'ux',
    name: 'Search field',
    x: 0,
    y: 0,
    skillRoot,
    replacePairs: [['Nope', 'X']],
  });
  assert.ok(out.some((el) => el.type === 'text' && el.text === 'Search'));
});

test('unknown pack / unknown name / missing --x', () => {
  const badPack = spawnStamp(['--pack', 'no-such', '--name', 'x', '--x', '0', '--y', '0']);
  assert.equal(badPack.status, 2);
  assert.equal((badPack.stdout || '').trim(), '');

  const droppedArchitecture = spawnStamp([
    '--pack',
    'architecture',
    '--name',
    'Slack',
    '--x',
    '0',
    '--y',
    '0',
  ]);
  assert.equal(droppedArchitecture.status, 2);
  assert.equal((droppedArchitecture.stdout || '').trim(), '');

  const badName = spawnStamp(['--pack', 'ux', '--name', 'no-such-widget', '--x', '0', '--y', '0']);
  assert.equal(badName.status, 2);
  assert.equal((badName.stdout || '').trim(), '');

  const missingX = spawnStamp(['--pack', 'ux', '--name', 'Search field', '--y', '0']);
  assert.equal(missingX.status, 2);
  assert.equal((missingX.stdout || '').trim(), '');
});

test('library file bytes unchanged', () => {
  const filePath = path.join(skillRoot, 'libraries', PACK_FILES.ux);
  const before = sha256File(filePath);
  stamp({ pack: 'ux', name: 'Search field', x: 1, y: 1, skillRoot });
  assert.equal(sha256File(filePath), before);
});

test('aws Lambda stamp succeeds', () => {
  const original = itemNamed('aws', 'Lambda');
  const out = stamp({ pack: 'aws', name: 'Lambda', x: 30, y: 40, skillRoot });
  assert.equal(out.length, original.elements.length);
  assert.equal(out.length, 4);
  const min = bboxMin(out);
  assert.ok(Math.abs(min.minX - 30) < 1e-6);
  assert.ok(Math.abs(min.minY - 40) < 1e-6);
});

test('negative x/y allowed', () => {
  const out = stamp({ pack: 'stick', name: 'Stick man', x: -20, y: -30, skillRoot });
  const min = bboxMin(out);
  assert.ok(Math.abs(min.minX - -20) < 1e-6);
  assert.ok(Math.abs(min.minY - -30) < 1e-6);
});

test('--out writes the same JSON as stdout', () => {
  const outPath = path.join(os.tmpdir(), `stamp-out-${process.pid}.json`);
  const result = spawnStamp([
    '--pack',
    'ux',
    '--name',
    'Search field',
    '--x',
    '10',
    '--y',
    '20',
    '--out',
    outPath,
  ]);
  assert.equal(result.status, 0, result.stderr);
  const stdoutJson = JSON.parse(result.stdout);
  const fileJson = JSON.parse(fs.readFileSync(outPath, 'utf8'));
  assert.deepEqual(fileJson, stdoutJson);
  fs.unlinkSync(outPath);
});

test('parseArgs rejects --replace-text without equals', () => {
  assert.throws(() => parseArgs(['--replace-text', 'nocolon']), { exitCode: 2 });
});

test('parseArgs rejects removed --drop-text flag', () => {
  assert.throws(() => parseArgs(['--drop-text', 'Lambda']), { exitCode: 2 });
});

function catalogNames(fileName) {
  const text = fs.readFileSync(path.join(skillRoot, 'references', fileName), 'utf8');
  const names = [];
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\| ([^|]+) \|/);
    if (!match) continue;
    const name = match[1].trim();
    if (!name || name === 'Name' || /^-+$/.test(name)) continue;
    names.push(name);
  }
  return names;
}

test('each catalog lists exactly the library names', () => {
  const mapping = Object.fromEntries(
    Object.keys(PACK_FILES).map((id) => [id, `catalog-${id}.md`])
  );
  for (const [pack, fileName] of Object.entries(mapping)) {
    const libNames = new Set(libraryJson(pack).libraryItems.map((it) => it.name));
    const catNames = catalogNames(fileName);
    assert.equal(new Set(catNames).size, catNames.length, `${fileName} has duplicate names`);
    assert.equal(catNames.length, libNames.size, `${fileName} count`);
    for (const name of catNames) {
      assert.equal(libNames.has(name), true, `${fileName} extra ${name}`);
    }
    for (const name of libNames) {
      assert.equal(catNames.includes(name), true, `${fileName} missing ${name}`);
    }
  }
  const uxText = fs.readFileSync(path.join(skillRoot, 'references', 'catalog-ux.md'), 'utf8');
  assert.match(uxText, /Do not stretch filled buttons/);
  assert.match(uxText, /authoring size/);
  const classErText = fs.readFileSync(path.join(skillRoot, 'references', 'catalog-uml-class-er.md'), 'utf8');
  assert.match(classErText, /use-case leftover; not a class/);
  assert.match(classErText, /sequence leftover; do not stamp as a lifeline/);
  const activityText = fs.readFileSync(path.join(skillRoot, 'references', 'catalog-uml-activity.md'), 'utf8');
  assert.match(activityText, /baked typo iterartive/);
  const componentText = fs.readFileSync(path.join(skillRoot, 'references', 'catalog-uml-component.md'), 'utf8');
  assert.match(componentText, /flat arrow, height 0; use contain or match-width/);
});

test('parseArgs reads --scale', () => {
  const out = parseArgs(['--pack', 'ux', '--name', 'Search field', '--x', '1', '--y', '2', '--scale', '1.8']);
  assert.equal(out.scale, 1.8);
});

test('parseArgs rejects --scale <= 0', () => {
  assert.throws(() => parseArgs(['--scale', '0']), { exitCode: 2 });
  assert.throws(() => parseArgs(['--scale', '-1']), { exitCode: 2 });
  assert.throws(() => parseArgs(['--scale', 'nope']), { exitCode: 2 });
});

test('stamp --scale 2 doubles size and keeps bbox min at target', () => {
  const a = stamp({ pack: 'ux', name: 'Filled button (text only)', x: 100, y: 200, skillRoot });
  const b = stamp({ pack: 'ux', name: 'Filled button (text only)', x: 100, y: 200, scale: 2, skillRoot });
  const minA = bboxMin(a);
  const minB = bboxMin(b);
  assert.ok(Math.abs(minA.minX - 100) < 1e-6);
  assert.ok(Math.abs(minB.minX - 100) < 1e-6);
  assert.ok(Math.abs(minB.minY - 200) < 1e-6);
  const wa = Math.max(...a.map((el) => el.width || 0));
  const wb = Math.max(...b.map((el) => el.width || 0));
  assert.ok(Math.abs(wb - wa * 2) < 1e-6);
  const fa = a.find((el) => el.type === 'text');
  const fb = b.find((el) => el.type === 'text');
  assert.ok(fa && fb);
  assert.ok(Math.abs(fb.fontSize - fa.fontSize * 2) < 1e-6);
});

test('stamp --scale 2 doubles points and leaves strokeWidth', () => {
  const a = stamp({ pack: 'stick', name: 'Stick man', x: 10, y: 20, skillRoot });
  const b = stamp({ pack: 'stick', name: 'Stick man', x: 10, y: 20, scale: 2, skillRoot });
  assert.equal(a.length, b.length);
  const idx = a.findIndex((el) => Array.isArray(el.points) && el.points.length >= 1);
  assert.ok(idx >= 0);
  const lastA = a[idx].points[a[idx].points.length - 1];
  const lastB = b[idx].points[b[idx].points.length - 1];
  assert.ok(Math.abs(lastB[0] - lastA[0] * 2) < 1e-6);
  assert.ok(Math.abs(lastB[1] - lastA[1] * 2) < 1e-6);
  for (let i = 0; i < a.length; i += 1) {
    if (typeof a[i].strokeWidth === 'number') {
      assert.equal(b[i].strokeWidth, a[i].strokeWidth);
    }
  }
});

test('stamp default scale is 1 (existing callers unchanged)', () => {
  const a = stamp({ pack: 'stick', name: 'Stick man', x: 0, y: 0, skillRoot });
  const b = stamp({ pack: 'stick', name: 'Stick man', x: 0, y: 0, scale: 1, skillRoot });
  assert.equal(a.length, b.length);
  assert.ok(Math.abs((a[0].width || 0) - (b[0].width || 0)) < 1e-6);
});

test('CloudFront stamp emits left-aligned label at authored x (CLI add must not see center)', () => {
  const original = itemNamed('aws', 'CloudFront');
  const origText = original.elements.find((el) => el.type === 'text' && el.text === 'CloudFront');
  assert.equal(origText.textAlign, 'center');
  const out = stamp({ pack: 'aws', name: 'CloudFront', x: 80, y: 980, skillRoot });
  const t = out.find((el) => el.type === 'text' && el.text === 'CloudFront');
  assert.ok(t);
  assert.equal(t.textAlign, 'left');
  assert.equal(t.containerId, null);
  const min = bboxMin(out);
  assert.ok(Math.abs(min.minX - 80) < 1e-6);
  // CloudFront's caption is the leftmost element (library textDx === 0). Do not copy t.x === targetX onto Button.
  assert.ok(Math.abs(t.x - 80) < 1e-6);
});

test('CloudFront --replace-text still matches then emits left', () => {
  const out = stamp({
    pack: 'aws',
    name: 'CloudFront',
    x: 0,
    y: 0,
    skillRoot,
    replacePairs: [['CloudFront', 'CDN']],
  });
  const t = out.find((el) => el.type === 'text' && el.text === 'CDN');
  assert.ok(t);
  assert.equal(t.textAlign, 'left');
});

test('forms Button stamp emits left at same relative x (not on-chip reflow)', () => {
  const original = itemNamed('forms', 'Button');
  const origText = original.elements.find((el) => el.type === 'text' && el.text === 'Button');
  assert.equal(origText.textAlign, 'center');
  const origDx = origText.x - Math.min(...original.elements.map((e) => e.x));
  const out = stamp({ pack: 'forms', name: 'Button', x: 10, y: 20, skillRoot });
  const t = out.find((el) => el.type === 'text' && el.text === 'Button');
  assert.equal(t.textAlign, 'left');
  const min = bboxMin(out);
  assert.ok(Math.abs((t.x - min.minX) - origDx) < 1e-4);
});

test('DynamoDB and Search field stay left and keep relative x', () => {
  for (const [pack, name, needle] of [
    ['aws', 'DynamoDB', 'DynamoDB'],
    ['ux', 'Search field', 'Search'],
  ]) {
    const original = itemNamed(pack, name);
    const origText = original.elements.find((el) => el.type === 'text' && el.text === needle);
    assert.equal(origText.textAlign, 'left');
    const origDx = origText.x - Math.min(...original.elements.map((e) => e.x));
    const out = stamp({ pack, name, x: 0, y: 0, skillRoot });
    const t = out.find((el) => el.type === 'text' && el.text === needle);
    assert.equal(t.textAlign, 'left');
    const min = bboxMin(out);
    assert.ok(Math.abs((t.x - min.minX) - origDx) < 1e-4);
  }
});

test('remapAndShift does not flip center text that has containerId', () => {
  const out = remapAndShift(
    [
      { id: 'r', type: 'rectangle', x: 0, y: 0, width: 40, height: 20, groupIds: ['g'] },
      {
        id: 't',
        type: 'text',
        text: 'Hi',
        textAlign: 'center',
        containerId: 'r',
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        groupIds: ['g'],
      },
    ],
    100,
    200,
    [],
  );
  const t = out.find((el) => el.type === 'text');
  assert.equal(t.textAlign, 'center');
  assert.ok(t.containerId);
});

function assertInHoleBand(elements, needle) {
  const t = elements.find((el) => el.type === 'text' && el.text === needle);
  assert.ok(t, `missing text ${needle}`);
  const hole = smallestContainingRect(elements, t);
  assert.ok(hole, `${needle} should sit in a sibling rectangle`);
  assert.equal(t.verticalAlign, 'top');
  const fs = t.fontSize;
  assert.ok(typeof fs === 'number' && fs > 0);
  assert.ok(Math.abs(t.y - (hole.y + (hole.height - fs) / 2)) < 1e-4);
  assert.ok(t.x >= hole.x);
}

test('ComboBox Aisle sits in the field (valign top, fontSize band centered in hole)', () => {
  const original = itemNamed('forms', 'ComboBox');
  const orig = original.elements.find((el) => el.type === 'text' && el.text === 'ComboBox');
  const origDx = orig.x - Math.min(...original.elements.map((e) => e.x));
  const out = stamp({
    pack: 'forms',
    name: 'ComboBox',
    x: 10,
    y: 20,
    skillRoot,
    replacePairs: [['ComboBox', 'Aisle']],
  });
  assertInHoleBand(out, 'Aisle');
  const t = out.find((el) => el.type === 'text' && el.text === 'Aisle');
  const min = bboxMin(out);
  assert.ok(Math.abs(t.x - min.minX - origDx) < 1e-4);
});

test('ComboBox Aisle at scale 1.7 still centers the fontSize band in the scaled hole', () => {
  const out = stamp({
    pack: 'forms',
    name: 'ComboBox',
    x: 0,
    y: 0,
    scale: 1.7,
    skillRoot,
    replacePairs: [['ComboBox', 'Aisle']],
  });
  assertInHoleBand(out, 'Aisle');
});

test('ComboBox Aisle at scale 0.55 shrinks font and stays in the hole', () => {
  const out = stamp({
    pack: 'forms',
    name: 'ComboBox',
    x: 0,
    y: 0,
    scale: 0.55,
    skillRoot,
    replacePairs: [['ComboBox', 'Aisle']],
  });
  const t = out.find((el) => el.type === 'text' && el.text === 'Aisle');
  assert.ok(t.fontSize < 20);
  assertInHoleBand(out, 'Aisle');
});

test('Button Pick sits in the chip (not above it)', () => {
  const out = stamp({
    pack: 'forms',
    name: 'Button',
    x: 0,
    y: 0,
    skillRoot,
    replacePairs: [['Button', 'Pick']],
  });
  assertInHoleBand(out, 'Pick');
});

test('Segmented One sits in its chip', () => {
  const out = stamp({ pack: 'forms', name: 'Segmented control', x: 0, y: 0, skillRoot });
  assertInHoleBand(out, 'One');
  assertInHoleBand(out, 'Two');
  assertInHoleBand(out, 'Three');
});

test('Search field SKU stays top-aligned (not middle-in-hole rewrite)', () => {
  const original = itemNamed('ux', 'Search field');
  const orig = original.elements.find((el) => el.type === 'text' && el.text === 'Search');
  assert.equal(orig.verticalAlign, 'top');
  const origDy = orig.y - Math.min(...original.elements.map((e) => e.y));
  const out = stamp({
    pack: 'ux',
    name: 'Search field',
    x: 0,
    y: 0,
    skillRoot,
    replacePairs: [['Search', 'SKU']],
  });
  const t = out.find((el) => el.type === 'text' && el.text === 'SKU');
  assert.equal(t.verticalAlign, 'top');
  const min = bboxMin(out);
  assert.ok(Math.abs(t.y - min.minY - origDy) < 1e-4);
});

test('CloudFront caption stays under the glyph (not recentered onto the icon)', () => {
  const original = itemNamed('aws', 'CloudFront');
  const orig = original.elements.find((el) => el.type === 'text' && el.text === 'CloudFront');
  const origDy = orig.y - Math.min(...original.elements.map((e) => e.y));
  const out = stamp({ pack: 'aws', name: 'CloudFront', x: 80, y: 980, skillRoot });
  const t = out.find((el) => el.type === 'text' && el.text === 'CloudFront');
  const min = bboxMin(out);
  assert.ok(Math.abs(t.y - min.minY - origDy) < 1e-4);
  assert.equal(t.verticalAlign, orig.verticalAlign);
});

test('Checkbox Selected stays beside the box', () => {
  const original = itemNamed('forms', 'Checkbox selected');
  const orig = original.elements.find((el) => el.type === 'text' && el.text === 'Selected');
  const origDx = orig.x - bboxMin(original.elements).minX;
  const origDy = orig.y - bboxMin(original.elements).minY;
  const out = stamp({ pack: 'forms', name: 'Checkbox selected', x: 0, y: 0, skillRoot });
  const t = out.find((el) => el.type === 'text' && el.text === 'Selected');
  const min = bboxMin(out);
  assert.ok(Math.abs(t.x - min.minX - origDx) < 1e-4);
  assert.ok(Math.abs(t.y - min.minY - origDy) < 1e-4);
});

test('Toolbar style sits in the inner chip; B/U/S stay put', () => {
  const original = itemNamed('forms', 'Toolbar');
  const origStyle = original.elements.find((el) => el.type === 'text' && el.text === 'style');
  assert.equal(origStyle.verticalAlign, 'middle');
  const out = stamp({ pack: 'forms', name: 'Toolbar', x: 0, y: 0, skillRoot });
  assertInHoleBand(out, 'style');
  const style = out.find((el) => el.type === 'text' && el.text === 'style');
  const hole = smallestContainingRect(out, style);
  assert.ok(hole.width < 80, 'style hole should be the inner chip, not the outer bar');
  assert.ok(Math.abs(style.height - style.fontSize * 1.25) < 1e-4);
  const min = bboxMin(out);
  for (const letter of ['B', 'U', 'S']) {
    const orig = original.elements.find((el) => el.type === 'text' && el.text === letter);
    assert.ok(orig, letter);
    const origDy = orig.y - Math.min(...original.elements.map((e) => e.y));
    const t = out.find((el) => el.type === 'text' && el.text === letter);
    assert.equal(t.verticalAlign, orig.verticalAlign);
    assert.ok(Math.abs(t.y - min.minY - origDy) < 1e-4);
  }
});

test('every stamped element carries the same stamp marker', () => {
  const a = stamp({ pack: 'uml-class-er', name: 'Class 2-compartment', x: 0, y: 0 });
  const b = stamp({ pack: 'uml-class-er', name: 'Class 2-compartment', x: 400, y: 0 });
  const ids = new Set(a.map((el) => el.customData && el.customData.stampId));
  assert.equal(ids.size, 1);
  assert.ok([...ids][0]);
  assert.equal(a[0].customData.stamp, 'uml-class-er/Class 2-compartment');
  assert.ok(a.every((el) => el.customData.stampSize === a.length));
  assert.notEqual(a[0].customData.stampId, b[0].customData.stampId);
});

const drawnLeft = (el) => el.x + Math.min(0, ...(el.points || []).map((p) => p[0]));
const drawnTop = (el) => el.y + Math.min(0, ...(el.points || []).map((p) => p[1]));

test('--x and --y are the top-left of the drawn box for every bundled item', () => {
  for (const pack of Object.keys(PACK_FILES)) {
    for (const item of libraryJson(pack).libraryItems) {
      if (!(item.elements || []).length) continue;
      for (const scale of [1, 2]) {
        const out = stamp({ pack, name: item.name, x: 300, y: 200, scale });
        assert.ok(Math.abs(Math.min(...out.map(drawnLeft)) - 300) < 1e-3, `${pack}/${item.name} x at scale ${scale}`);
        assert.ok(Math.abs(Math.min(...out.map(drawnTop)) - 200) < 1e-3, `${pack}/${item.name} y at scale ${scale}`);
      }
    }
  }
});

test('a line drawn backwards lands right of the anchor', () => {
  const out = stamp({ pack: 'uml-component', name: 'Provided interface', x: 500, y: 100 });
  assert.ok(out.filter((el) => el.points).every((el) => drawnLeft(el) >= 500 - 1e-3));
});

test('bboxMin measures the drawn box', () => {
  const min = bboxMin([{ type: 'line', x: 100, y: 50, points: [[0, 0], [-40, -10]] }, { type: 'rectangle', x: 90, y: 45, width: 5, height: 5 }]);
  assert.deepEqual(min, { minX: 60, minY: 40 });
});

test('--replace-text falls back to one whole line of a multi-line text', () => {
  const out = stamp({ pack: 'uml-deployment', name: 'Execution environment', x: 0, y: 0, replacePairs: [['environment title + version', 'WildFly 36']] });
  const t = out.find((el) => el.type === 'text');
  assert.equal(t.text, '\n<< execution environment >>\nWildFly 36');
  assert.equal(t.originalText, t.text);
});

test('--replace-text keeps a whole-text match first and does not touch part of a line', () => {
  const whole = stamp({ pack: 'uml-activity', name: 'Action Box', x: 0, y: 0, replacePairs: [['Action', 'Check in']] });
  assert.equal(whole.find((el) => el.type === 'text').text, 'Check in');
  const part = stamp({ pack: 'uml-deployment', name: 'Execution environment', x: 0, y: 0, replacePairs: [['environment title', 'X']] });
  assert.equal(part.find((el) => el.type === 'text').text, '\n<< execution environment >>\nenvironment title + version');
});

test('--replace-text refuses a line found more than once', () => {
  const els = [{ type: 'text', id: 'a', x: 0, y: 0, text: 'x\ntitle' }, { type: 'text', id: 'b', x: 0, y: 9, text: 'title\ny' }];
  assert.throws(() => remapAndShift(els, 0, 0, [['title', 'New']]), { exitCode: 2 });
});

test('a replaced bound label keeps its binding and drops the library text', () => {
  const out = stamp({ pack: 'uml-activity', name: 'Action Box', x: 0, y: 0, replacePairs: [['Action', 'Check in']] });
  const t = out.find((el) => el.type === 'text');
  const box = out.find((el) => el.id === t.containerId);
  assert.ok(box);
  assert.equal(t.originalText, 'Check in');
  assert.ok(box.boundElements.some((b) => b.id === t.id));
});

test('a top-aligned bound title is unbound so the canvas cannot centre it', () => {
  for (const name of ['Execution environment', 'Operating system']) {
    const raw = itemNamed('uml-deployment', name).elements;
    const rawText = raw.find((el) => el.type === 'text');
    const rawBox = raw.find((el) => el.id === rawText.containerId);
    const out = stamp({ pack: 'uml-deployment', name, x: 100, y: 100, scale: 2 });
    const t = out.find((el) => el.type === 'text');
    assert.equal(t.containerId, undefined);
    assert.equal(t.textAlign, 'left');
    assert.equal(t.fontSize, rawText.fontSize * 2);
    const front = out.filter((el) => el.type === 'rectangle').find((r) => Math.abs(r.width - rawBox.width * 2) < 1e-3);
    assert.ok(!(front.boundElements || []).some((b) => b.id === t.id));
    assert.ok(Math.abs(t.y - front.y - (rawText.y - rawBox.y) * 2) < 1e-3);
    assert.ok(Math.abs(t.x + t.width / 2 - (front.x + front.width / 2)) < 1e-3);
  }
});

test('an unbound title recentres on its replaced width', () => {
  const out = stamp({ pack: 'uml-deployment', name: 'Execution environment', x: 0, y: 0, replacePairs: [['\n<< execution environment >>\nenvironment title + version', 'WildFly']] });
  const t = out.find((el) => el.type === 'text');
  const front = out.filter((el) => el.type === 'rectangle').reduce((m, r) => (r.width > m.width ? r : m));
  assert.ok(t.width < 100);
  assert.ok(Math.abs(t.x + t.width / 2 - (front.x + front.width / 2)) < 1e-3);
});

test('an unbound title keeps close to its catalog width', () => {
  for (const name of ['Execution environment', 'Operating system']) {
    const orig = itemNamed('uml-deployment', name).elements.find((el) => el.type === 'text');
    const t = stamp({ pack: 'uml-deployment', name, x: 0, y: 0, scale: 2 }).find((el) => el.type === 'text');
    assert.ok(Math.abs(t.width - orig.width * 2) / (orig.width * 2) < 0.02, `${name}: ${t.width} vs ${orig.width * 2}`);
  }
});

test('malformed points do not break the anchor', () => {
  assert.deepEqual(bboxMin([{ x: 5, y: 5, points: [[]] }, { x: 7, y: 9 }]), { minX: 5, minY: 5 });
});

test('a bound top element with no text string is left alone', () => {
  const els = [{ id: 'b', type: 'rectangle', x: 0, y: 0, width: 10, height: 10 }, { id: 't', type: 'text', containerId: 'b', verticalAlign: 'top', x: 0, y: 0 }];
  assert.equal(helper.unbindTopText(els)[1].containerId, 'b');
});

test('--replace-text gives a Chinese word its full width when centring', () => {
  const out = stamp({ pack: 'c4-architecture', name: 'Person', x: 0, y: 0, replacePairs: [['User', '客户客户']] });
  const word = out.find((el) => el.text === '客户客户');
  const body = out.find((el) => el.type === 'rectangle');
  assert.equal(word.width, word.fontSize * 4);
  assert.ok(Math.abs(word.x + word.width / 2 - (body.x + body.width / 2)) < 1);
});

test('--replace-text keeps a centred word centred on its box and a left word at its x', () => {
  const inkCentre = (t, factor) => t.x + (t.fontSize * factor * t.text.length) / 2;
  const out = stamp({ pack: 'c4-architecture', name: 'Person', x: 0, y: 0, replacePairs: [['User', 'Customer']] });
  const word = out.find((el) => el.text === 'Customer');
  const body = out.find((el) => el.type === 'rectangle');
  assert.ok(Math.abs(inkCentre(word, 0.55) - (body.x + body.width / 2)) < 2, `centre ${inkCentre(word, 0.55)}`);

  const scaled = stamp({ pack: 'c4-architecture', name: 'Person', x: 0, y: 0, scale: 2, replacePairs: [['User', 'Customer']] });
  const big = scaled.find((el) => el.text === 'Customer');
  const bigBody = scaled.find((el) => el.type === 'rectangle');
  assert.ok(Math.abs(inkCentre(big, 0.55) - (bigBody.x + bigBody.width / 2)) < 4);

  const raw = stamp({ pack: 'forms', name: 'ComboBox', x: 0, y: 0 }).find((el) => el.text === 'ComboBox');
  const kept = stamp({ pack: 'forms', name: 'ComboBox', x: 0, y: 0, replacePairs: [['ComboBox', 'Aisle']] }).find((el) => el.text === 'Aisle');
  assert.equal(kept.x, raw.x);
});

test('a stamp records how many of its elements are words', () => {
  const out = stamp({ pack: 'c4-architecture', name: 'Person', x: 0, y: 0 });
  assert.ok(out.every((el) => el.customData.stampWords === 3));
});
