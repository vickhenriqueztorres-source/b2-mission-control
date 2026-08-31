import assert from 'assert';
import fs from 'fs';
import os from 'os';
import path from 'path';
import scenesData from '../contracts/episodes/drones-agro-noturnos.scenes.json';
import {
  DRONE_AGRO_COMPONENT_BY_CATEGORY,
  DroneAgroCanonCategory,
} from '../contracts/droneAgroVisualContract';
import {DRONES_AGRO_NOTURNOS_TIMELINE_CONTRACT} from '../remotion/episodeDronesAgroNoturnosTimelineData';
import {isRegisteredComponent} from '../remotion/cinema/componentRegistry';
import {PipelineContractGate} from '../pipeline/pipelineContractGate';

const root = process.cwd();
const source = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const contractScenes = DRONES_AGRO_NOTURNOS_TIMELINE_CONTRACT.scenes;
const sceneCategories = new Map(
  (scenesData as Array<{sceneId: string; required_category: DroneAgroCanonCategory}>)
    .map((scene) => [scene.sceneId, scene.required_category]),
);

assert.strictEqual(contractScenes.length, scenesData.length);
assert.ok(contractScenes.length >= 40, 'episode must preserve documentary scene density');

const categoriesSeen = new Set<DroneAgroCanonCategory>();
for (const scene of contractScenes) {
  const category = sceneCategories.get(scene.id);
  assert.ok(category, `missing canonical category for ${scene.id}`);
  categoriesSeen.add(category!);
  assert.strictEqual(scene.component, DRONE_AGRO_COMPONENT_BY_CATEGORY[category!]);
  assert.ok(isRegisteredComponent(scene.component), `unregistered scene component: ${scene.component}`);
  assert.notStrictEqual(scene.component, 'DroneAgroNightOpsScene');

  if (category === 'matter') {
    assert.match(scene.mediaFile || '', /\/takes\/DAN_\d{3}\.mp4$/);
    assert.strictEqual(scene.props?.imageSrc, undefined);
  } else {
    assert.strictEqual(scene.mediaFile, undefined);
    assert.match(String(scene.props?.imageSrc || ''), /\/images\/DAN_\d{3}\.png$/);
  }
}

assert.deepStrictEqual(
  [...categoriesSeen].sort(),
  ['evidence', 'maps', 'matter', 'reveal'],
  'all canonical visual languages must be exercised',
);

const materializer = source('scripts/materializeDronesPhysicalMotionV2.ts');
assert.match(materializer, /STATIC_TAKE_MATERIALIZATION_FORBIDDEN/);
assert.doesNotMatch(materializer, /spawnSync|execFileSync|execSync/);

for (const retiredMaterializer of [
  'scripts/buildDronesAgroMedia.ts',
  'scripts/rebuildDronesAgroFullAssets.ts',
]) {
  const contents = source(retiredMaterializer);
  assert.match(contents, /STATIC_TAKE_MATERIALIZATION_FORBIDDEN/);
  assert.doesNotMatch(contents, /execSync|spawnSync|-loop 1|zoompan=/);
}

const fastAssembler = source('scripts/assembleDronesAgroNoturnosFastMaster.ts');
assert.match(fastAssembler, /FAST_MASTER_ASSEMBLY_FORBIDDEN/);
assert.doesNotMatch(fastAssembler, /drawtext=|drawbox=|timeline_media_assembly/);

const episodePreparer = source('scripts/prepareDronesAgroNoturnosEpisode.ts');
assert.doesNotMatch(episodePreparer, /remotion_deterministic_fallback|createStartFrame/);
assert.match(episodePreparer, /staticVideoFallbackAllowed: false/);

const renderScript = source('scripts/renderDronesAgroNoturnosMaster.ts');
assert.match(renderScript, /remotion render remotion\/index\.ts EpisodeDronesAgroNoturnos/);
assert.match(renderScript, /engine: 'CinematicEpisode'/);
assert.match(renderScript, /FINAL_MASTER_STATIC_VIDEO_REJECTED/);
assert.match(renderScript, /outputSha256: finalSha256/);

const gateSource = source('pipeline/pipelineContractGate.ts');
assert.match(gateSource, /VIDEO_PROVENANCE_DERIVATIVE_FORBIDDEN/);
assert.match(gateSource, /validDossierVisuals/);
assert.match(gateSource, /videoProvenanceValid/);

const contradictoryRun = fs.mkdtempSync(path.join(os.tmpdir(), 'hsl-done-contradiction-'));
const completionFailures = PipelineContractGate.validateCompletedRunEvidence(contradictoryRun, {
  status: 'DONE',
  fireflyFailed: true,
  stages: {visuals: {status: 'DEGRADED'}, render: {status: 'DONE', engine: 'timeline_media_assembly'}},
  render: {engine: 'timeline_media_assembly'},
});
assert.ok(completionFailures.some((failure) => failure.reason.startsWith('MANIFEST_DONE_ENGINE_MISMATCH')));
assert.ok(completionFailures.some((failure) => failure.reason.startsWith('MANIFEST_DONE_VISUALS_NOT_APPROVED')));
assert.ok(completionFailures.some((failure) => failure.reason.startsWith('MANIFEST_DONE_WITH_PROVIDER_FAILURE')));
assert.ok(completionFailures.some((failure) => failure.reason.startsWith('MANIFEST_DONE_MASTER_INVALID')));
assert.deepStrictEqual(
  PipelineContractGate.validateCompletedRunEvidence(contradictoryRun, {status: 'BLOCKED'}),
  [],
);
fs.rmSync(contradictoryRun, {recursive: true, force: true});

console.log('drones_agro_cinematic_pipeline.test.ts: PASS');
