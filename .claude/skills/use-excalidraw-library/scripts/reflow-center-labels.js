'use strict';

const fs = require('fs');

function loadElements(scenePath) {
  const data = JSON.parse(fs.readFileSync(scenePath, 'utf8'));
  return Array.isArray(data) ? data : data.elements || [];
}

function largestRect(members) {
  const rects = members.filter((e) => e.type === 'rectangle');
  if (!rects.length) return null;
  return rects.reduce((a, b) =>
    (a.width || 0) * (a.height || 0) >= (b.width || 0) * (b.height || 0) ? a : b
  );
}

function innermostChip(text, byGroup) {
  let best = null;
  let bestArea = Infinity;
  for (const g of text.groupIds || []) {
    const host = largestRect(byGroup.get(g) || []);
    if (!host) continue;
    const area = (host.width || 0) * (host.height || 0);
    if (area > 0 && area < bestArea) {
      best = host;
      bestArea = area;
    }
  }
  return best;
}

function reflowCenterLabels(elements) {
  const byGroup = new Map();
  for (const el of elements) {
    for (const g of el.groupIds || []) {
      if (!byGroup.has(g)) byGroup.set(g, []);
      byGroup.get(g).push(el);
    }
  }
  const updates = [];
  const done = new Set();
  const hostCleared = new Set();
  for (const el of elements) {
    if (el.type !== 'text' || el.textAlign !== 'center' || done.has(el.id)) continue;
    if (el.containerId) continue;
    const host = innermostChip(el, byGroup);
    if (!host) continue;
    const tw = Number(el.width) || 8;
    const th = Number(el.height) || 8;
    const x = (host.x || 0) + ((host.width || 0) - tw) / 2;
    const y = (host.y || 0) + ((host.height || 0) - th) / 2;
    updates.push({
      id: el.id,
      set: {
        textAlign: 'left',
        verticalAlign: 'top',
        autoResize: true,
        containerId: null,
        originalText: el.text || '',
        x,
        y,
      },
    });
    if (host.boundElements && host.boundElements.length && !hostCleared.has(host.id)) {
      updates.push({ id: host.id, set: { boundElements: [] } });
      hostCleared.add(host.id);
    }
    done.add(el.id);
  }
  return { update: updates };
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const next = () => {
      i += 1;
      if (i >= argv.length) throw Object.assign(new Error(`missing value for ${a}`), { exitCode: 2 });
      return argv[i];
    };
    if (a === '--scene') out.scene = next();
    else if (a === '--out') out.outPath = next();
    else if (a === '--help' || a === '-h') out.help = true;
    else throw Object.assign(new Error(`unknown flag: ${a}`), { exitCode: 2 });
  }
  return out;
}

function main(argv) {
  try {
    const args = parseArgs(argv);
    if (args.help) {
      process.stderr.write('Usage: reflow-center-labels.js --scene <file.excalidraw|elements.json> [--out patch.json]\n');
      return 0;
    }
    if (!args.scene) throw Object.assign(new Error('required: --scene'), { exitCode: 2 });
    const patch = reflowCenterLabels(loadElements(args.scene));
    const text = JSON.stringify(patch);
    if (args.outPath) fs.writeFileSync(args.outPath, text);
    process.stdout.write(text);
    return 0;
  } catch (err) {
    process.stderr.write(String(err.message || err) + '\n');
    return err.exitCode || 1;
  }
}

if (require.main === module) process.exitCode = main(process.argv.slice(2));

module.exports = { reflowCenterLabels, loadElements, parseArgs, main, innermostChip };
