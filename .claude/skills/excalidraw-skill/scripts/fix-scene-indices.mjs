#!/usr/bin/env node
/**
 * Repair CLI-exported .excalidraw JSON so Open/import match the live canvas:
 * 1. Rewrite every element.index with generateNKeysBetween (CLI invents a0…a90).
 * 2. Set textAlign left on ungrouped unbound text that export defaulted to
 *    center/middle/autoResize (import otherwise recenters labels into other shapes).
 *
 * Usage: node fix-scene-indices.mjs <scene.excalidraw>
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { generateNKeysBetween } from "./vendor/fractional-indexing.mjs";

function isUngrouped(el) {
  const g = el.groupIds;
  return !Array.isArray(g) || g.length === 0;
}

function isUnbound(el) {
  return el.containerId == null || el.containerId === "";
}

export function rewriteDefaultCenteredText(elements) {
  if (!Array.isArray(elements)) return elements;
  for (const el of elements) {
    if (el.type !== "text") continue;
    if (!isUnbound(el)) continue;
    if (!isUngrouped(el)) continue;
    if (el.textAlign !== "center") continue;
    if (el.verticalAlign !== "middle") continue;
    if (el.autoResize !== true) continue;
    el.textAlign = "left";
  }
  return elements;
}

export function rewriteIndices(elements) {
  if (!Array.isArray(elements) || elements.length === 0) {
    return elements;
  }
  const keys = generateNKeysBetween(null, null, elements.length);
  for (let i = 0; i < elements.length; i++) {
    elements[i].index = keys[i];
  }
  return elements;
}

export function fixScene(scene) {
  if (!scene || typeof scene !== "object") {
    throw new Error("scene must be a JSON object");
  }
  const elements = Array.isArray(scene.elements) ? scene.elements : [];
  rewriteIndices(elements);
  rewriteDefaultCenteredText(elements);
  scene.elements = elements;
  return scene;
}

function main(argv) {
  const file = argv[2];
  if (!file || file === "-h" || file === "--help") {
    console.error("Usage: node fix-scene-indices.mjs <scene.excalidraw>");
    process.exit(file ? 0 : 2);
  }
  const scene = JSON.parse(readFileSync(file, "utf8"));
  if (Array.isArray(scene)) {
    throw new Error("expected a .excalidraw object with an elements array, not a raw element list");
  }
  fixScene(scene);
  writeFileSync(file, JSON.stringify(scene, null, 2) + "\n", "utf8");
  console.log(JSON.stringify({ success: true, file, elements: scene.elements.length }));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    main(process.argv);
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}
