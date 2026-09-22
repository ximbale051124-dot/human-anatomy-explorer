import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(import.meta.dirname, '..');
const assetDir = path.join(root, 'public', 'models', 'anatomy-atlas');
const dataPath = path.join(root, 'src', 'data', 'anatomy', 'atlas.generated.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const failures = [];

function fail(message) {
  failures.push(message);
}

function readGlbJson(file) {
  const buffer = fs.readFileSync(file);
  if (buffer.readUInt32LE(0) !== 0x46546c67) fail(`${file}: not a GLB file`);
  const jsonLength = buffer.readUInt32LE(12);
  return JSON.parse(buffer.subarray(20, 20 + jsonLength).toString('utf8'));
}

const recordsById = new Map();
for (const record of data.records) {
  if (recordsById.has(record.id)) fail(`Duplicate AnatomyRecord ID: ${record.id}`);
  recordsById.set(record.id, record);
}

const bindingsById = new Map();
for (const binding of data.bindings) {
  if (bindingsById.has(binding.anatomyId)) fail(`Duplicate AnatomyBinding ID: ${binding.anatomyId}`);
  bindingsById.set(binding.anatomyId, binding);
  if (!recordsById.has(binding.anatomyId)) fail(`Binding without AnatomyRecord: ${binding.anatomyId}`);
}

for (const record of data.records) {
  if (!bindingsById.has(record.id)) fail(`AnatomyRecord without source binding: ${record.id}`);
}

const perAsset = {};
const emittedIds = new Set();
for (const asset of fs.readdirSync(assetDir).filter((file) => file.endsWith('.glb'))) {
  const sourceAsset = path.basename(asset, '.glb');
  const doc = readGlbJson(path.join(assetDir, asset));
  const meshNodes = (doc.nodes ?? []).filter((node) => node.mesh !== undefined);
  perAsset[sourceAsset] = meshNodes.length;
  for (const node of meshNodes) {
    const anatomyId = node.extras?.anatomyId;
    if (typeof anatomyId !== 'string') {
      fail(`${asset}:${node.name ?? '<unnamed>'} has no extras.anatomyId`);
      continue;
    }
    if (emittedIds.has(anatomyId)) fail(`Duplicate emitted anatomyId: ${anatomyId}`);
    emittedIds.add(anatomyId);
    const record = recordsById.get(anatomyId);
    const binding = bindingsById.get(anatomyId);
    if (!record) fail(`${asset}:${node.name} references missing AnatomyRecord ${anatomyId}`);
    if (!binding) fail(`${asset}:${node.name} references missing AnatomyBinding ${anatomyId}`);
    if (record && (record.sourceAsset !== sourceAsset || record.sourceNode !== node.name)) {
      fail(`${anatomyId}: AnatomyRecord source does not match ${asset}:${node.name}`);
    }
    if (binding && (binding.sourceAsset !== sourceAsset || binding.sourceNode !== node.name)) {
      fail(`${anatomyId}: AnatomyBinding source does not match ${asset}:${node.name}`);
    }
    if (record && (sourceAsset === 'skeletal' || sourceAsset === 'muscular')) {
      const suffix = /\.(l|r)$/i.exec(node.name ?? '');
      const expectedSide = suffix ? (suffix[1].toLowerCase() === 'l' ? 'left' : 'right') : 'midline';
      if (record.side !== expectedSide) fail(`${anatomyId}: expected ${expectedSide} side from ${node.name}`);
    }
  }
}

for (const [anatomyId, binding] of bindingsById) {
  const sourceFile = path.join(assetDir, `${binding.sourceAsset}.glb`);
  if (!fs.existsSync(sourceFile)) fail(`${anatomyId}: missing source asset ${binding.sourceAsset}.glb`);
}

for (const anatomyId of bindingsById.keys()) {
  if (!emittedIds.has(anatomyId)) fail(`Binding references a node omitted from all GLBs: ${anatomyId}`);
}

const skeletalChecks = ['femur', 'tibia', 'fibula', 'humerus', 'radius', 'ulna'];
for (const structure of skeletalChecks) {
  for (const side of ['left', 'right']) {
    const anatomyId = `skeletal_${structure}_${side}`;
    if (!recordsById.has(anatomyId)) fail(`Required skeletal validation node is absent: ${anatomyId}`);
  }
}

const muscularFamilies = ['biceps brachii', 'triceps brachii', 'deltoid', 'pectoralis major', 'rectus abdominis', 'gastrocnemius'];
for (const family of muscularFamilies) {
  for (const side of ['left', 'right']) {
    const found = data.records.some((record) =>
      record.sourceAsset === 'muscular' && record.side === side && record.displayName.toLowerCase().includes(family)
    );
    if (!found) fail(`Required muscular validation family is absent: ${family} (${side})`);
  }
}

if (failures.length) {
  console.error(`Interactive atlas audit failed with ${failures.length} issue(s):`);
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log('Interactive atlas audit passed.');
console.log(JSON.stringify({ anatomyIds: recordsById.size, bindings: bindingsById.size, perAsset }, null, 2));
