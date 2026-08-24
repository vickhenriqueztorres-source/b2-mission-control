import Ajv2020 from 'ajv/dist/2020';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { HiddenSystemsLabAdapter } from '../adapters/hiddenSystemsLabAdapter';
import { getDatabase } from '../database/db';
import { ProductionStateMachine } from '../orchestrator/stateMachine';
import { MotionToFireflyBridge } from '../production-bridge/motionToFirefly';

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

async function runTests(): Promise<void> {
  const ajvDraft7 = new Ajv({allErrors: true});
  const ajv2020 = new Ajv2020({allErrors: true});
  addFormats(ajvDraft7);
  addFormats(ajv2020);
  const contractsDir = path.resolve(__dirname, '../../shared-contracts');
  for (const file of ['production.schema.json', 'generation-request.schema.json', 'generation-result.schema.json', 'agent-event.schema.json', 'artifact.schema.json', 'hsl-episode.schema.json']) {
    const filePath = path.join(contractsDir, file);
    assert.ok(fs.existsSync(filePath), `Schema missing: ${filePath}`);
    const schema = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const validator = String(schema.$schema || '').includes('2020-12') ? ajv2020 : ajvDraft7;
    validator.addSchema(schema, file);
  }

  const productionId = `hsl-integration-${Date.now()}`;
  getDatabase().prepare(`
    INSERT OR REPLACE INTO productions (production_id, project_name, status)
    VALUES (?, 'Hidden Systems Lab Test', 'IDLE')
  `).run(productionId);
  const sm = new ProductionStateMachine(productionId);
  sm.transitionTo('BRIEFING_RECEIVED');
  sm.transitionTo('HSL_EDITORIAL_PREPRODUCTION_RUNNING');
  sm.transitionTo('HSL_EPISODE_PACKAGE_READY');
  assert.throws(() => sm.transitionTo('FINAL_VIDEO_RENDERED'), /INVALID_STATE_TRANSITION/);

  const tempDir = path.resolve(__dirname, '../runs/test_run_hsl');
  fs.mkdirSync(tempDir, {recursive: true});
  const framePath = path.join(tempDir, 'fuel_farm_start.png');
  fs.writeFileSync(framePath, PNG_1X1);
  const packagePath = path.join(tempDir, 'generation_package.json');
  const guidePath = path.join(tempDir, 'firefly_guide.json');
  fs.writeFileSync(packagePath, JSON.stringify([{
    shot_id: 'HSL_001',
    take_id: 'TAKE_01',
    prompt: 'Slow fuel movement through an airport pipeline network.',
    start_frame_path: framePath,
    aspect_ratio: '16:9',
    resolution: '1080p'
  }], null, 2));
  const guide = MotionToFireflyBridge.convert(packagePath, guidePath);
  assert.equal(guide.length, 1);
  assert.equal(guide[0].aspect_ratio, '16:9');
  assert.equal(guide[0].resolution, '1080p');

  const hsl = new HiddenSystemsLabAdapter();
  assert.equal(await hsl.checkHealth(), true);
  process.stdout.write('HSL integration checks passed.\n');
}

runTests().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
