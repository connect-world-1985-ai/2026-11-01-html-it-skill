'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  inspectLib,
  listLibFiles,
  auditA2,
  validateSrc,
  parsePackIndex,
  parseUsagePacks,
  companionPointsAtIndex,
  frozenFourHits,
  audit,
} = require('../audit-libraries.js');

function v2item(name) {
  return {
    id: 'x',
    status: 'unpublished',
    created: 1,
    name,
    elements: [{ id: 'e', type: 'rectangle', x: 0, y: 0, width: 10, height: 10 }],
  };
}

function writeLib(dir, file, json) {
  fs.writeFileSync(path.join(dir, file), JSON.stringify(json));
}

test('listLibFiles ignores subdirectories', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-libs-'));
  writeLib(dir, 'a.excalidrawlib', { type: 'excalidrawlib', version: 2, libraryItems: [v2item('A')] });
  fs.mkdirSync(path.join(dir, 'v2-converted-from-v1'));
  writeLib(path.join(dir, 'v2-converted-from-v1'), 'extra.excalidrawlib', {
    type: 'excalidrawlib',
    version: 2,
    libraryItems: [v2item('Z')],
  });
  assert.deepEqual(listLibFiles(dir), ['a.excalidrawlib']);
});

test('inspectLib passes a named v2 item', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-libs-'));
  writeLib(dir, 'a.excalidrawlib', { type: 'excalidrawlib', version: 2, libraryItems: [v2item('A')] });
  const row = inspectLib(dir, 'a.excalidrawlib');
  assert.equal(row.pass, true);
  assert.equal(row.itemCount, 1);
});

test('inspectLib fails v1 and duplicate names', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-libs-'));
  writeLib(dir, 'v1.excalidrawlib', { type: 'excalidrawlib', version: 1, library: [[]] });
  writeLib(dir, 'dup.excalidrawlib', {
    type: 'excalidrawlib',
    version: 2,
    libraryItems: [v2item('Same'), v2item('Same')],
  });
  assert.equal(inspectLib(dir, 'v1.excalidrawlib').pass, false);
  assert.equal(inspectLib(dir, 'dup.excalidrawlib').pass, false);
  assert.deepEqual(inspectLib(dir, 'dup.excalidrawlib').duplicateNames, ['Same']);
});

test('auditA2 detects extra and missing files', () => {
  const ok = auditA2(['a.excalidrawlib'], { a: 'a.excalidrawlib' });
  assert.equal(ok.pass, true);
  const extra = auditA2(['a.excalidrawlib', 'b.excalidrawlib'], { a: 'a.excalidrawlib' });
  assert.equal(extra.pass, false);
  assert.deepEqual(extra.extraFiles, ['b.excalidrawlib']);
  const missing = auditA2(['a.excalidrawlib'], { a: 'a.excalidrawlib', b: 'b.excalidrawlib' });
  assert.equal(missing.pass, false);
  assert.deepEqual(missing.missingMapped, ['b.excalidrawlib']);
});

test('validateSrc rejects v1 and accepts v2', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-src-'));
  const v1 = path.join(dir, 'v1.excalidrawlib');
  const v2 = path.join(dir, 'v2.excalidrawlib');
  const v2str = path.join(dir, 'v2str.excalidrawlib');
  fs.writeFileSync(v1, JSON.stringify({ type: 'excalidrawlib', version: 1, library: [[]] }));
  fs.writeFileSync(v2, JSON.stringify({ type: 'excalidrawlib', version: 2, libraryItems: [v2item('Ok')] }));
  fs.writeFileSync(v2str, JSON.stringify({ type: 'excalidrawlib', version: '2', libraryItems: [v2item('Ok')] }));
  assert.equal(validateSrc(v1).pass, false);
  assert.equal(validateSrc(v2).pass, true);
  assert.equal(validateSrc(v2).version, 2);
  assert.equal(validateSrc(v2str).pass, false);
});

test('parsePackIndex and parseUsagePacks', () => {
  const md = `# Pack index\n\n| Pack id | Count | Use when | Catalog |\n|---|---|---|---|\n| stick | 9 | people scenes. Not AWS. | references/catalog-stick.md |\n`;
  const rows = parsePackIndex(md);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].id, 'stick');
  assert.equal(rows[0].count, 9);
  assert.equal(rows[0].catalog, 'references/catalog-stick.md');
  assert.deepEqual(parseUsagePacks('Usage: stamp-library-item.js --pack alpha|beta|gamma|delta --name x\n'), [
    'alpha',
    'beta',
    'gamma',
    'delta',
  ]);
  const helperSrc =
    "function usageError(msg) { return 'required: --pack --name --x --y'; }\n" +
    'Usage: stamp-library-item.js --pack alpha|beta|gamma|delta --name <exact> --x <n> --y <n>\n';
  assert.deepEqual(parseUsagePacks(helperSrc), ['alpha', 'beta', 'gamma', 'delta']);
  assert.equal(companionPointsAtIndex('Load use-excalidraw-library. Read references/pack-index.md and run its pre-flight.'), true);
  assert.equal(companionPointsAtIndex('Announce its four packs and run its pre-flight.'), false);
});

test('frozenFourHits flags phrases when N is not 4', () => {
  const text = 'this skill only adds four bundled v2 packs';
  assert.equal(frozenFourHits(text).length > 0, true);
});

test('frozenFourHits still matches four-pack phrases', () => {
  assert.equal(frozenFourHits('Four bundled Excalidraw v2 libraries').length > 0, true);
  assert.equal(frozenFourHits('vendors the live v2 packs listed in pack-index.md').length, 0);
});

test('audit A4 uses stampFn and does not require canvas', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-skill-'));
  fs.mkdirSync(path.join(dir, 'libraries'));
  fs.mkdirSync(path.join(dir, 'scripts'));
  fs.mkdirSync(path.join(dir, 'references'));
  writeLib(path.join(dir, 'libraries'), 'a.excalidrawlib', {
    type: 'excalidrawlib',
    version: 2,
    libraryItems: [v2item('Alpha')],
  });
  fs.writeFileSync(
    path.join(dir, 'scripts/stamp-library-item.js'),
    "module.exports = { PACK_FILES: { a: 'a.excalidrawlib' } };\n"
  );
  fs.writeFileSync(path.join(dir, 'SKILL.md'), '# x\n');
  fs.writeFileSync(
    path.join(dir, 'references/pack-index.md'),
    `| Pack id | Count | Use when | Catalog |\n|---|---|---|---|\n| a | 1 | t | references/catalog-a.md |\n`
  );
  fs.writeFileSync(
    path.join(dir, 'references/catalog-a.md'),
    `| Name | Native size (px) | Notes |\n| --- | --- | --- |\n| Alpha | 10 x 10 | |\n`
  );
  const out = audit({
    skillRoot: dir,
    stampFn: () => ({ status: 0, n: 3 }),
    skipDocs: true,
  });
  assert.equal(out.a1.pass, true);
  assert.equal(out.a2.pass, true);
  assert.equal(out.a4.pass, true);
  assert.equal(out.pass, true);
});