'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { layoutPages, nativeSize } = require('./layout-v1-grid.js');
const { applyNames, forbiddenName } = require('./apply-names.js');

const v1 = {
  type: 'excalidrawlib',
  version: 1,
  library: [
    [{ id: 'a', type: 'rectangle', x: 0, y: 0, width: 80, height: 40 }],
    [{ id: 'b', type: 'ellipse', x: 5, y: 5, width: 20, height: 20 }],
  ],
};

test('nativeSize uses width/height', () => {
  assert.equal(nativeSize(v1.library[0]), '80 x 40');
});

test('layoutPages rejects v2', () => {
  assert.throws(() => layoutPages({ type: 'excalidrawlib', version: 2, libraryItems: [] }, { pageSize: 16 }), /not v1/);
});

test('layoutPages one page two labeled cells', () => {
  const { pages, itemCount } = layoutPages(v1, { pageSize: 16, cols: 4, cell: 240 });
  assert.equal(itemCount, 2);
  assert.equal(pages.length, 1);
  const labels = pages[0].filter((el) => el.type === 'text').map((el) => el.text);
  assert.deepEqual(labels, ['#0', '#1']);
  const shapes = pages[0].filter((el) => el.type !== 'text');
  assert.ok(shapes.length >= 2);
});

test('layoutPages paginates', () => {
  const lib = { type: 'excalidrawlib', version: 1, library: [] };
  for (let i = 0; i < 17; i += 1) {
    lib.library.push([{ id: String(i), type: 'rectangle', x: 0, y: 0, width: 10, height: 10 }]);
  }
  const { pages } = layoutPages(lib, { pageSize: 16, cols: 4, cell: 240 });
  assert.equal(pages.length, 2);
  assert.equal(pages[1].filter((el) => el.type === 'text' && el.text === '#16').length, 1);
});

test('layoutPages maps draw to freedraw for canvas add', () => {
  const lib = {
    type: 'excalidrawlib',
    version: 1,
    library: [[{ id: 'd', type: 'draw', x: 0, y: 0, width: 10, height: 10, points: [[0, 0]] }]],
  };
  const { pages } = layoutPages(lib, { pageSize: 16, cols: 4, cell: 240 });
  const drawn = pages[0].filter((el) => el.type === 'freedraw' || el.type === 'draw');
  assert.equal(drawn.length, 1);
  assert.equal(drawn[0].type, 'freedraw');
});

test('forbiddenName blocks indexes and Item N', () => {
  assert.equal(forbiddenName('#0'), true);
  assert.equal(forbiddenName('Item 3'), true);
  assert.equal(forbiddenName('Search field'), false);
});

test('applyNames writes v2 unique names', () => {
  const out = applyNames(v1, ['Box A', 'Circle B']);
  assert.equal(out.version, 2);
  assert.equal(out.type, 'excalidrawlib');
  assert.equal(out.libraryItems.length, 2);
  assert.deepEqual(out.libraryItems.map((it) => it.name), ['Box A', 'Circle B']);
  assert.equal(out.libraryItems[0].elements[0].type, 'rectangle');
});

test('applyNames maps draw to freedraw on written v2', () => {
  const lib = {
    type: 'excalidrawlib',
    version: 1,
    library: [[{ id: 'd', type: 'draw', x: 0, y: 0, width: 10, height: 10, points: [[0, 0]] }]],
  };
  const out = applyNames(lib, ['Stroke']);
  assert.equal(out.libraryItems[0].elements[0].type, 'freedraw');
});

test('applyNames rejects length mismatch and dupes', () => {
  assert.throws(() => applyNames(v1, ['Only']), /length/);
  assert.throws(() => applyNames(v1, ['Same', 'Same']), /unique/);
  assert.throws(() => applyNames(v1, ['#0', 'Ok']), /forbidden/);
});
