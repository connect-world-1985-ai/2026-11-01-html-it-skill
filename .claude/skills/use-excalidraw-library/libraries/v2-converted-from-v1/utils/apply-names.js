'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { loadV1, canvasTypes } = require('./layout-v1-grid.js');

function forbiddenName(name) {
  const s = String(name || '').trim();
  if (!s) return true;
  if (/^#\d+$/.test(s)) return true;
  if (/^item\s*\d+$/i.test(s)) return true;
  return false;
}

function applyNames(v1json, names) {
  const v1 = loadV1(v1json);
  if (!Array.isArray(names) || names.length !== v1.library.length) {
    throw new Error('names length must equal library length');
  }
  const trimmed = names.map((n) => String(n || '').trim());
  const uniq = new Set(trimmed);
  if (uniq.size !== trimmed.length) throw new Error('names must be unique');
  const bad = trimmed.filter(forbiddenName);
  if (bad.length) throw new Error('forbidden name: ' + bad[0]);
  return {
    type: 'excalidrawlib',
    version: 2,
    source: v1.source || 'https://excalidraw.com',
    libraryItems: v1.library.map((elements, i) => ({
      id: crypto.randomBytes(8).toString('hex'),
      status: 'unpublished',
      created: Date.now(),
      name: trimmed[i],
      elements: canvasTypes(JSON.parse(JSON.stringify(elements))),
    })),
  };
}

function main(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === '--src') args.src = next();
    else if (a === '--names') args.names = next();
    else if (a === '--out') args.out = next();
  }
  if (!args.src || !args.names || !args.out) {
    process.stderr.write('Usage: apply-names.js --src <v1> --names names.json --out <v2.excalidrawlib>\n');
    process.exit(2);
  }
  const v1 = JSON.parse(fs.readFileSync(args.src, 'utf8'));
  const payload = JSON.parse(fs.readFileSync(args.names, 'utf8'));
  const names = Array.isArray(payload) ? payload : payload.names;
  const out = applyNames(v1, names);
  fs.mkdirSync(path.dirname(args.out), { recursive: true });
  fs.writeFileSync(args.out, JSON.stringify(out, null, 2));
  process.stdout.write(JSON.stringify({ out: args.out, items: out.libraryItems.length }) + '\n');
}

if (require.main === module) {
  main(process.argv.slice(2));
}

module.exports = { forbiddenName, applyNames, main };
