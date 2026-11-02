'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

function skillRootFromScript() {
  return path.resolve(__dirname, '..');
}

function repoRootFromSkill(skillRoot) {
  return path.resolve(skillRoot, '../../..');
}

function listLibFiles(libDir) {
  return fs
    .readdirSync(libDir)
    .filter((f) => f.endsWith('.excalidrawlib'))
    .sort();
}

function inspectLib(libDir, file) {
  let j;
  try {
    j = JSON.parse(fs.readFileSync(path.join(libDir, file), 'utf8'));
  } catch {
    return {
      file,
      type: null,
      version: null,
      itemCount: 0,
      named: 0,
      unique: 0,
      duplicateNames: [],
      missingNames: 0,
      pass: false,
    };
  }
  const items = Array.isArray(j.libraryItems) ? j.libraryItems : [];
  const names = items
    .map((it) => it && it.name)
    .filter(Boolean)
    .map((n) => String(n).trim())
    .filter(Boolean);
  const uniq = new Set(names);
  const duplicateNames = [...uniq].filter((n) => names.filter((x) => x === n).length > 1);
  const pass =
    j.type === 'excalidrawlib' &&
    j.version === 2 &&
    items.length > 0 &&
    names.length === items.length &&
    uniq.size === names.length &&
    duplicateNames.length === 0;
  return {
    file,
    type: j.type,
    version: j.version,
    itemCount: items.length,
    named: names.length,
    unique: uniq.size,
    duplicateNames,
    missingNames: items.length - names.length,
    pass,
  };
}

function auditA2(files, PACK_FILES) {
  const mapped = new Set(Object.values(PACK_FILES));
  const missingMapped = [...mapped].filter((f) => !files.includes(f));
  const extraFiles = files.filter((f) => !mapped.has(f));
  return {
    missingMapped,
    extraFiles,
    pass: missingMapped.length === 0 && extraFiles.length === 0,
  };
}

function validateSrc(srcPath) {
  let j;
  try {
    j = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
  } catch {
    return { type: null, version: null, items: 0, named: 0, dup: [], pass: false };
  }
  const items = Array.isArray(j.libraryItems) ? j.libraryItems : [];
  const names = items
    .map((it) => it && it.name)
    .filter(Boolean)
    .map((n) => String(n).trim())
    .filter(Boolean);
  const dup = [...new Set(names.filter((n, i) => names.indexOf(n) !== i))];
  const pass =
    j.type === 'excalidrawlib' &&
    j.version === 2 &&
    items.length > 0 &&
    names.length === items.length &&
    dup.length === 0;
  return { type: j.type, version: j.version, items: items.length, named: names.length, dup, pass };
}

function parsePackIndex(md) {
  const rows = [];
  for (const line of String(md).split(/\r?\n/)) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').map((s) => s.trim()).filter(Boolean);
    if (cells.length < 4) continue;
    const id = cells[0];
    if (!id || id === 'Pack id' || /^-{3,}$/.test(id)) continue;
    rows.push({ id, count: Number(cells[1]), catalog: cells[cells.length - 1] });
  }
  return rows;
}

function readPackIndex(skillRoot) {
  const indexPath = path.join(skillRoot, 'references', 'pack-index.md');
  if (!fs.existsSync(indexPath)) {
    return { md: '', rows: [], missing: true };
  }
  const md = fs.readFileSync(indexPath, 'utf8');
  return { md, rows: parsePackIndex(md), missing: false };
}

function companionPointsAtIndex(text) {
  const t = String(text);
  return /pack-index\.md/i.test(t) && /pre-flight/i.test(t) && !/Announce its/i.test(t);
}

function parseUsagePacks(text) {
  const m = String(text).match(/Usage:.*--pack\s+([a-z0-9|-]+)/i);
  if (!m) return [];
  return m[1].split('|').map((s) => s.trim()).filter(Boolean);
}

function frozenFourHits(text) {
  return String(text).match(/four packs|four named|four bundled|four v2/gi) || [];
}

function firstCatalogName(catalogMd) {
  for (const line of String(catalogMd).split(/\r?\n/)) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').map((s) => s.trim()).filter(Boolean);
    if (!cells.length) continue;
    const name = cells[0];
    if (!name || name === 'Name' || /^-{3,}$/.test(name)) continue;
    return name;
  }
  return null;
}

function defaultStampFn({ skillRoot, pack, name, out }) {
  const script = path.join(skillRoot, 'scripts/stamp-library-item.js');
  const r = spawnSync(process.execPath, [script, '--pack', pack, '--name', name, '--x', '0', '--y', '0', '--out', out], {
    encoding: 'utf8',
  });
  let n = 0;
  try {
    n = JSON.parse(fs.readFileSync(out, 'utf8')).length;
  } catch {
    n = 0;
  }
  return { status: r.status, n, stderr: r.stderr };
}

function loadPackFiles(skillRoot) {
  return require(path.join(skillRoot, 'scripts/stamp-library-item.js')).PACK_FILES;
}

function sameSet(a, b) {
  return a.length === b.length && a.every((x) => b.includes(x)) && b.every((x) => a.includes(x));
}

function auditA5({ skillRoot, PACK_FILES, a1Rows, skipDocs }) {
  const details = [];
  const n = Object.keys(PACK_FILES).length;
  const packIds = Object.keys(PACK_FILES);
  let pass = true;
  const index = readPackIndex(skillRoot);
  if (index.missing) {
    pass = false;
    details.push('pack-index missing');
  }
  const announce = index.rows;
  const ids = announce.map((r) => r.id);
  if (!sameSet(ids, packIds)) {
    pass = false;
    details.push('announce ids != PACK_FILES');
  }
  const countByFile = Object.fromEntries(a1Rows.map((r) => [r.file, r.itemCount]));
  for (const row of announce) {
    const file = PACK_FILES[row.id];
    if (!file) {
      pass = false;
      details.push('unknown announce id ' + row.id);
      continue;
    }
    if (row.count !== countByFile[file]) {
      pass = false;
      details.push('count mismatch ' + row.id);
    }
    if (!String(row.catalog).endsWith('catalog-' + row.id + '.md')) {
      pass = false;
      details.push('catalog path ' + row.id);
    }
  }

  if (skipDocs) {
    return { pass, details, n };
  }

  const helperSrc = fs.readFileSync(path.join(skillRoot, 'scripts/stamp-library-item.js'), 'utf8');
  const usage = parseUsagePacks(helperSrc);
  if (!sameSet(usage, packIds)) {
    pass = false;
    details.push('usage packs');
  }

  const repoRoot = repoRootFromSkill(skillRoot);
  const filesToScan = [
    path.join(skillRoot, 'SKILL.md'),
    path.join(repoRoot, 'production/skills/excalidraw-skill/SKILL.md'),
    path.join(repoRoot, 'production/github_collection/backup_manual_install_excalidraw-skill.txt'),
    path.join(repoRoot, 'README.md'),
  ];
  for (const f of filesToScan) {
    if (!fs.existsSync(f)) {
      pass = false;
      details.push('missing ' + path.basename(f));
      continue;
    }
    if (frozenFourHits(fs.readFileSync(f, 'utf8')).length) {
      pass = false;
      details.push('frozen-four ' + path.basename(f));
    }
  }

  const companionPath = path.join(repoRoot, 'production/skills/excalidraw-skill/SKILL.md');
  const companion = fs.readFileSync(companionPath, 'utf8');
  if (!companionPointsAtIndex(companion)) {
    pass = false;
    details.push('companion pack-index');
  }

  const attr = fs.readFileSync(path.join(skillRoot, 'ATTRIBUTION.md'), 'utf8');
  const attrFiles = [];
  for (const line of attr.split(/\r?\n/)) {
    const m = line.match(/`libraries\/([^`]+\.excalidrawlib)`\s*\|\s*(\d+)/);
    if (m) attrFiles.push({ file: m[1], count: Number(m[2]) });
  }
  if (attrFiles.length !== a1Rows.length) {
    pass = false;
    details.push('attribution row count');
  }
  for (const row of a1Rows) {
    const hit = attrFiles.find((x) => x.file === row.file);
    if (!hit || hit.count !== row.itemCount) {
      pass = false;
      details.push('attribution ' + row.file);
    }
  }

  const install = fs.readFileSync(
    path.join(repoRoot, 'production/github_collection/backup_manual_install_excalidraw-skill.txt'),
    'utf8'
  );
  if (!/pack-index\.md/i.test(install)) {
    pass = false;
    details.push('install note pack-index');
  }

  return { pass, details, n };
}

function audit(opts) {
  const skillRoot = opts.skillRoot;
  const stampFn = opts.stampFn || defaultStampFn;
  const skipDocs = !!opts.skipDocs;
  const libDir = path.join(skillRoot, 'libraries');
  const files = listLibFiles(libDir);
  const PACK_FILES = loadPackFiles(skillRoot);
  const a1Rows = files.map((f) => inspectLib(libDir, f));
  const a1 = { rows: a1Rows, pass: a1Rows.length > 0 && a1Rows.every((r) => r.pass) };
  const a2 = auditA2(files, PACK_FILES);
  const announce = readPackIndex(skillRoot).rows;
  const a4results = [];
  for (const pack of Object.keys(PACK_FILES)) {
    const row = announce.find((r) => r.id === pack);
    const catalogRel = row && row.catalog ? row.catalog.replace(/^\.\//, '') : path.join('references', 'catalog-' + pack + '.md');
    const catalogPath = path.join(skillRoot, catalogRel);
    let name = 'missing';
    try {
      name = firstCatalogName(fs.readFileSync(catalogPath, 'utf8')) || 'missing';
    } catch {
      name = 'missing';
    }
    const out = path.join(os.tmpdir(), 'audit-' + pack + '-' + Date.now() + '.json');
    let r;
    try {
      r = stampFn({ skillRoot, pack, name, out });
    } finally {
      try {
        fs.unlinkSync(out);
      } catch {
        /* stampFn may not write `out` (tests) */
      }
    }
    a4results.push({ pack, name, exit: r.status, n: r.n, pass: r.status === 0 && r.n > 0 });
  }
  const a4 = {
    results: a4results,
    pass: a4results.length === Object.keys(PACK_FILES).length && a4results.every((x) => x.pass),
  };
  const a5 = auditA5({ skillRoot, PACK_FILES, a1Rows, skipDocs });
  const pass = a1.pass && a2.pass && a4.pass && a5.pass;
  return { a1, a2, a4, a5, pass };
}

function main(argv) {
  const srcIdx = argv.indexOf('--src');
  if (srcIdx >= 0) {
    const src = argv[srcIdx + 1];
    if (!src) {
      process.stderr.write('Usage: audit-libraries.js [--src file.excalidrawlib]\n');
      process.exit(2);
    }
    const out = validateSrc(src);
    process.stdout.write(JSON.stringify(out, null, 2) + '\n');
    process.exit(out.pass ? 0 : 1);
  }
  const result = audit({ skillRoot: skillRootFromScript() });
  process.stdout.write('PASS a1 ' + result.a1.pass + '\n');
  process.stdout.write('PASS a2 ' + result.a2.pass + '\n');
  process.stdout.write('PASS a4 ' + result.a4.pass + '\n');
  process.stdout.write('PASS a5 ' + result.a5.pass + '\n');
  if (result.a5.details && result.a5.details.length) {
    process.stdout.write('a5 details ' + result.a5.details.join('; ') + '\n');
  }
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  process.exit(result.pass ? 0 : 1);
}

if (require.main === module) {
  main(process.argv.slice(2));
}

module.exports = {
  inspectLib,
  listLibFiles,
  auditA2,
  validateSrc,
  parsePackIndex,
  parseUsagePacks,
  companionPointsAtIndex,
  frozenFourHits,
  audit,
  firstCatalogName,
  skillRootFromScript,
  main,
};
