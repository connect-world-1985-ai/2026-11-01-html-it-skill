'use strict';

const fs = require('fs');
const path = require('path');
const { remapAndShift, scaleElements } = require('../../../scripts/stamp-library-item.js');

function nativeSize(elements) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const el of elements || []) {
    if (typeof el.x !== 'number' || typeof el.y !== 'number') continue;
    const w = typeof el.width === 'number' ? el.width : 0;
    const h = typeof el.height === 'number' ? el.height : 0;
    minX = Math.min(minX, el.x);
    minY = Math.min(minY, el.y);
    maxX = Math.max(maxX, el.x + w);
    maxY = Math.max(maxY, el.y + h);
  }
  const width = Number.isFinite(minX) ? Math.round(maxX - minX) : 0;
  const height = Number.isFinite(minY) ? Math.round(maxY - minY) : 0;
  return `${width} x ${height}`;
}

function loadV1(json) {
  if (!json || json.type !== 'excalidrawlib' || json.version !== 1 || !Array.isArray(json.library)) {
    throw new Error('not v1 named-less library (need type excalidrawlib, version 1, library[])');
  }
  if (json.library.length === 0) throw new Error('empty library');
  return json;
}

function indexLabel(i, x, y) {
  return {
    id: `lbl${i}`,
    type: 'text',
    x,
    y,
    width: 80,
    height: 24,
    text: `#${i}`,
    fontSize: 18,
    strokeColor: '#1e1e1e',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    roughness: 0,
    opacity: 100,
    angle: 0,
    seed: i + 1,
    version: 1,
    isDeleted: false,
    groupIds: [],
    boundElements: null,
    link: null,
    locked: false,
    textAlign: 'left',
    verticalAlign: 'top',
    containerId: null,
    originalText: `#${i}`,
    autoResize: true,
    lineHeight: 1.25,
  };
}

function canvasTypes(elements) {
  return (elements || []).map((el) => {
    if (!el || typeof el !== 'object') return el;
    if (el.type === 'draw') return { ...el, type: 'freedraw' };
    return el;
  });
}

function layoutPages(json, opts) {
  const v1 = loadV1(json);
  const pageSize = opts.pageSize || 16;
  const cols = opts.cols || 4;
  const cell = opts.cell || 240;
  const gap = opts.gap || 36;
  const labelH = 28;
  const pad = 24;
  const pages = [];
  const n = v1.library.length;
  const pageCount = Math.ceil(n / pageSize);
  for (let p = 0; p < pageCount; p += 1) {
    const els = [];
    const start = p * pageSize;
    const end = Math.min(n, start + pageSize);
    for (let i = start; i < end; i += 1) {
      const local = i - start;
      const col = local % cols;
      const row = Math.floor(local / cols);
      const cellX = pad + col * (cell + gap);
      const cellY = pad + row * (cell + gap + labelH);
      els.push(indexLabel(i, cellX, cellY));
      const raw = v1.library[i] || [];
      const size = nativeSize(raw);
      const [nw, nh] = size.split(' x ').map(Number);
      const holeX = cellX;
      const holeY = cellY + labelH;
      let stamped = canvasTypes(remapAndShift(raw, holeX, holeY, []));
      const fx = nw > 0 ? cell / nw : 1;
      const fy = nh > 0 ? cell / nh : 1;
      const factor = Math.min(fx, fy);
      if (Number.isFinite(factor) && factor > 0 && factor !== 1) {
        stamped = scaleElements(stamped, factor, holeX, holeY);
      }
      els.push(...stamped);
    }
    pages.push(els);
  }
  return { pages, itemCount: n, pageSize, pageCount };
}

function main(argv) {
  const args = { pageSize: 16 };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === '--src') args.src = next();
    else if (a === '--out-dir') args.outDir = next();
    else if (a === '--page-size') args.pageSize = Number(next());
  }
  if (!args.src || !args.outDir) {
    process.stderr.write('Usage: layout-v1-grid.js --src <v1.excalidrawlib> --out-dir <dir> [--page-size 16]\n');
    process.exit(2);
  }
  const json = JSON.parse(fs.readFileSync(args.src, 'utf8'));
  const { pages, itemCount, pageSize, pageCount } = layoutPages(json, { pageSize: args.pageSize });
  fs.mkdirSync(args.outDir, { recursive: true });
  pages.forEach((els, i) => {
    const name = `page-${String(i).padStart(2, '0')}.json`;
    fs.writeFileSync(path.join(args.outDir, name), JSON.stringify(els));
  });
  fs.writeFileSync(
    path.join(args.outDir, 'manifest.json'),
    JSON.stringify({ src: path.resolve(args.src), itemCount, pageSize, pageCount, pages: pages.map((_, i) => `page-${String(i).padStart(2, '0')}.json`) }, null, 2)
  );
  process.stdout.write(JSON.stringify({ itemCount, pageCount, outDir: args.outDir }) + '\n');
}

if (require.main === module) {
  main(process.argv.slice(2));
}

module.exports = { nativeSize, loadV1, layoutPages, canvasTypes, main };
