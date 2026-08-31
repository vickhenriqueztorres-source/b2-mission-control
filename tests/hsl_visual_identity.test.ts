import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test, {after} from 'node:test';
import {
  assertHslStartFramePromptIdentity,
  buildHslStartFramePrompt,
  HSL_PREMIUM_MOTION_REFERENCE_SET,
  HSL_VISUAL_IDENTITY_CONTRACT_VERSION
} from '../config/hslVisualIdentity';
import {
  inspectHslStartFrameCandidateEligibility,
  sha256File,
  sha256Text,
  StartFrameIdentityGate
} from '../hsl/startframe/startFrameIdentityGate';

const roots: string[] = [];
after(() => roots.forEach((root) => fs.rmSync(root, {recursive: true, force: true})));

test('central prompt contract locks the HSL visual grammar', () => {
  const prompt = buildHslStartFramePrompt({
    subject: 'a storm drain beneath a rain-soaked city avenue',
    composition: 'wide environmental composition',
    lens: 'documentary 35',
    subjectAnchor: 'left third'
  });
  assert.doesNotThrow(() => assertHslStartFramePromptIdentity(prompt, 'HSL_TEST_001'));
  assert.throws(
    () => assertHslStartFramePromptIdentity('generic dark diagram with blue lines', 'HSL_TEST_002'),
    /HSL_VISUAL_IDENTITY_PROMPT_RULE_MISSING/
  );
});

test('identity gate accepts reference-conditioned lineage and rejects procedural previs', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hsl-identity-gate-'));
  roots.push(root);
  const framePath = path.join(root, 'HSL_TEST_001.png');
  fs.copyFileSync(path.resolve('assets/visual_identity/documentary-field-v4/observational-field.png'), framePath);
  const prompt = buildHslStartFramePrompt({
    subject: 'a pump station moving stormwater through a buried gallery',
    composition: 'medium-wide mechanical composition',
    lens: 'documentary 35',
    subjectAnchor: 'right third'
  });
  const referenceManifestPath = path.resolve(HSL_PREMIUM_MOTION_REFERENCE_SET.manifestPath);
  const provenancePath = path.join(root, 'start-frame-provenance.json');
  const base = {
    schema: 'hsl.start-frame.provenance.v2',
    identity_contract_version: HSL_VISUAL_IDENTITY_CONTRACT_VERSION,
    reference_set_manifest_path: HSL_PREMIUM_MOTION_REFERENCE_SET.manifestPath,
    reference_set_manifest_sha256: sha256File(referenceManifestPath),
    items: [{
      shot_id: 'HSL_TEST_001',
      frame_sha256: sha256File(framePath),
      prompt_sha256: sha256Text(prompt),
      generator: 'TEST_REFERENCE_CONDITIONED_GENERATOR',
      identity_contract_version: HSL_VISUAL_IDENTITY_CONTRACT_VERSION,
      reference_asset_ids: ['OBSERVATIONAL_FIELD']
    }]
  } as const;
  fs.writeFileSync(provenancePath, `${JSON.stringify({
    ...base,
    status: 'IDENTITY_LOCKED_START_FRAMES_READY',
    items: base.items.map((item) => ({...item, source_mode: 'REFERENCE_CONDITIONED_GENERATION'}))
  }, null, 2)}\n`);
  const gate = new StartFrameIdentityGate();
  assert.equal(inspectHslStartFrameCandidateEligibility({
    provenanceManifestPath: provenancePath,
    shot: {shot_id: 'HSL_TEST_001', frame_path: framePath, start_frame_prompt: prompt}
  }).eligible, true);
  assert.doesNotThrow(() => gate.validate({
    provenanceManifestPath: provenancePath,
    expectedShots: [{shot_id: 'HSL_TEST_001', frame_path: framePath, start_frame_prompt: prompt}]
  }));

  fs.writeFileSync(provenancePath, `${JSON.stringify({
    ...base,
    status: 'PROCEDURAL_PREVIS_ONLY',
    items: base.items.map((item) => ({...item, source_mode: 'PROCEDURAL_PREVIS'}))
  }, null, 2)}\n`);
  assert.deepEqual(inspectHslStartFrameCandidateEligibility({
    provenanceManifestPath: provenancePath,
    shot: {shot_id: 'HSL_TEST_001', frame_path: framePath, start_frame_prompt: prompt}
  }), {
    eligible: false,
    reason: 'PROCEDURAL_PREVIS_ONLY'
  });
  assert.throws(() => gate.validate({
    provenanceManifestPath: provenancePath,
    expectedShots: [{shot_id: 'HSL_TEST_001', frame_path: framePath, start_frame_prompt: prompt}]
  }), /HSL_START_FRAME_SOURCE_NOT_IDENTITY_ELIGIBLE/);
});

test('video 5 complete orchestration cannot fabricate human or paid authorization', () => {
  const source = fs.readFileSync(path.resolve('scripts/hslVideo5Complete.ts'), 'utf8');
  assert.doesNotMatch(source, /HSL_CONFIRMED_HUMAN_APPROVAL:\s*'true'/);
  assert.doesNotMatch(source, /HSL_CONFIRMED_VIDEO_5_DISPATCH:\s*'true'/);
  assert.doesNotMatch(source, /FIREFLY_ALLOW_CREDIT_SPEND:\s*'true'/);
});
