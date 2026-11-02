'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { reflowCenterLabels } = require('../reflow-center-labels.js');

test('centers a center-aligned chip label using live width', () => {
  const els = [
    { id: 'r', type: 'rectangle', x: 1220, y: 132, width: 135, height: 32, groupIds: ['g'] },
    { id: 't', type: 'text', text: 'Dispatch', textAlign: 'center', containerId: null,
      x: 1100, y: 100, width: 57, height: 16, groupIds: ['g'] },
  ];
  const patch = reflowCenterLabels(els);
  const u = patch.update.find((e) => e.id === 't');
  assert.ok(u);
  assert.equal(u.set.textAlign, 'left');
  assert.equal(u.set.verticalAlign, 'top');
  assert.equal(u.set.autoResize, true);
  assert.equal(u.set.containerId, null);
  assert.equal(u.set.originalText, 'Dispatch');
  assert.ok(Math.abs(u.set.x - (1220 + (135 - 57) / 2)) < 1e-6);
  assert.ok(Math.abs(u.set.y - (132 + (32 - 16) / 2)) < 1e-6);
});

test('does not move left-aligned field text', () => {
  const els = [
    { id: 'r', type: 'rectangle', x: 0, y: 0, width: 280, height: 40, groupIds: ['g'] },
    { id: 't', type: 'text', text: 'Query', textAlign: 'left', x: 24, y: 10, width: 40, height: 16, groupIds: ['g'] },
  ];
  const patch = reflowCenterLabels(els);
  assert.equal(patch.update.length, 0);
});

test('skips bound containerId text', () => {
  const els = [
    { id: 'r', type: 'rectangle', x: 0, y: 0, width: 100, height: 40, groupIds: ['g'] },
    { id: 't', type: 'text', text: 'Hi', textAlign: 'center', containerId: 'r',
      x: 0, y: 0, width: 20, height: 16, groupIds: ['g'] },
  ];
  assert.equal(reflowCenterLabels(els).update.length, 0);
});

test('innermost chip wins over outer modal chrome', () => {
  const els = [
    { id: 'outer', type: 'rectangle', x: 0, y: 0, width: 520, height: 320, groupIds: ['g-modal'] },
    { id: 'chip', type: 'rectangle', x: 400, y: 260, width: 90, height: 28, groupIds: ['g-modal', 'g-btn'] },
    { id: 't', type: 'text', text: 'Export', textAlign: 'center', containerId: null,
      x: 10, y: 10, width: 40, height: 14, groupIds: ['g-modal', 'g-btn'] },
  ];
  const u = reflowCenterLabels(els).update.find((e) => e.id === 't');
  assert.ok(u);
  assert.ok(Math.abs(u.set.x - (400 + (90 - 40) / 2)) < 1e-6);
  assert.ok(Math.abs(u.set.y - (260 + (28 - 14) / 2)) < 1e-6);
});

test('clears host boundElements once when two center labels share a chip', () => {
  const els = [
    {
      id: 'r', type: 'rectangle', x: 0, y: 0, width: 100, height: 40, groupIds: ['g'],
      boundElements: [{ id: 't1' }, { id: 't2' }],
    },
    { id: 't1', type: 'text', text: 'A', textAlign: 'center', containerId: null,
      x: 0, y: 0, width: 10, height: 10, groupIds: ['g'] },
    { id: 't2', type: 'text', text: 'B', textAlign: 'center', containerId: null,
      x: 0, y: 0, width: 10, height: 10, groupIds: ['g'] },
  ];
  const patch = reflowCenterLabels(els);
  const hostUpdates = patch.update.filter((e) => e.id === 'r');
  assert.equal(hostUpdates.length, 1);
  assert.deepEqual(hostUpdates[0].set.boundElements, []);
  assert.ok(patch.update.find((e) => e.id === 't1'));
  assert.ok(patch.update.find((e) => e.id === 't2'));
});
