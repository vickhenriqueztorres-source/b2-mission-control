import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import {FireflyAdapter} from '../adapters/fireflyAdapter';
import {FireflyToIntakeBridge} from '../production-bridge/fireflyToIntake';
import {HslGenerationHandoff} from '../production-bridge/motionToFirefly';
import {HslFireflyGenerationRuntime} from '../production/hslFireflyGenerationRuntime';

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function main(): Promise<void> {
  if (process.env.HSL_CONFIRMED_VEO_TEST_DISPATCH !== 'true') throw new Error('HSL_VEO_TEST_DISPATCH_NOT_AUTHORIZED');
  const productionId = process.env.HSL_VIDEO_1_RUN_ID || 'HSL-VIDEO-001-VEO-TEST';
  const outputRoot = path.resolve(process.env.HSL_VIDEO_1_OUTPUT || path.join('runs', productionId));
  const handoffPath = path.join(outputRoot, 'generation', 'veo-test-handoffs.json');
  const handoffSet = JSON.parse(fs.readFileSync(handoffPath, 'utf8')) as {handoffs: HslGenerationHandoff[]};
  if (handoffSet.handoffs.length !== 12 || handoffSet.handoffs.some((handoff) => !handoff.generation_strategy?.startsWith('VEO'))) {
    throw new Error('HSL_VEO_TEST_HANDOFF_SET_INVALID');
  }
  const runtime = new HslFireflyGenerationRuntime();
  const prepared = runtime.prepare(handoffSet.handoffs, path.join(outputRoot, 'firefly-veo-test'));
  const authorizationPath = path.join(outputRoot, 'firefly-veo-test', 'dispatch-authorization.json');
  writeJson(authorizationPath, {
    schema: 'hsl.firefly.veo-test-authorization.v1', production_id: productionId,
    status: 'AUTHORIZED', authorized_job_count: prepared.jobNames.length,
    authorization_source: 'EXPLICIT_USER_AUTHORIZATION_IN_CODEX_TASK', authorized_at: new Date().toISOString()
  });
  const adapter = new FireflyAdapter();
  await adapter.initialize();
  const generated = await runtime.dispatch(productionId, prepared, adapter);
  const intakeManifestPath = path.join(outputRoot, 'hsl_veo_asset_intake.json');
  FireflyToIntakeBridge.convert(productionId, generated.completedJobs, intakeManifestPath, {...prepared.lineageByJobName});
  const resultPath = path.join(outputRoot, 'firefly-veo-test', 'dispatch-result.json');
  writeJson(resultPath, {
    schema: 'hsl.firefly.veo-test-result.v1', production_id: productionId,
    status: 'VEO_TEST_DISPATCH_COMPLETE', authorization_path: authorizationPath,
    completed_job_count: generated.completedJobs.length, completed_jobs: generated.completedJobs,
    intake_manifest_path: intakeManifestPath, completed_at: new Date().toISOString()
  });
  process.stdout.write(`${JSON.stringify({
    status: 'VEO_TEST_DISPATCH_COMPLETE', completed_job_count: generated.completedJobs.length,
    intake_manifest_path: intakeManifestPath, result_path: resultPath
  }, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
