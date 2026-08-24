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
  if (process.env.HSL_CONFIRMED_PAID_DISPATCH !== 'true' || process.env.HSL_ALLOW_PAID_FIREFLY_DISPATCH !== 'true') {
    throw new Error('HSL_PAID_FIREFLY_DISPATCH_NOT_AUTHORIZED');
  }
  const productionId = process.env.HSL_VIDEO_1_RUN_ID || 'HSL-VIDEO-001';
  const outputRoot = path.resolve(process.env.HSL_VIDEO_1_OUTPUT || path.join('runs', productionId));
  const preparationPath = path.join(outputRoot, 'firefly', 'video-1-firefly-preparation.json');
  const preparation = JSON.parse(fs.readFileSync(preparationPath, 'utf8')) as {status: string; motion_package_count: number};
  if (preparation.status !== 'FIREFLY_GUIDE_READY' || preparation.motion_package_count !== 24) throw new Error('HSL_VIDEO_1_FIREFLY_PREPARATION_INVALID');
  const handoffPath = path.join(outputRoot, 'generation', 'mission-control-handoffs.json');
  const handoffSet = JSON.parse(fs.readFileSync(handoffPath, 'utf8')) as {handoffs: HslGenerationHandoff[]};
  if (handoffSet.handoffs.length !== 24) throw new Error('HSL_VIDEO_1_HANDOFF_COUNT_INVALID');

  const authorizedAt = new Date().toISOString();
  const authorizationPath = path.join(outputRoot, 'firefly', 'paid-dispatch-authorization.json');
  writeJson(authorizationPath, {
    schema: 'hsl.firefly.paid-dispatch-authorization.v1', schema_version: '1.0.0',
    production_id: productionId, status: 'AUTHORIZED', authorized_job_count: handoffSet.handoffs.length,
    authorization_source: 'EXPLICIT_USER_AUTHORIZATION_IN_CODEX_TASK', authorized_at: authorizedAt
  });

  const runtime = new HslFireflyGenerationRuntime();
  const prepared = runtime.prepare(handoffSet.handoffs, path.join(outputRoot, 'firefly'));
  const adapter = new FireflyAdapter();
  await adapter.initialize();
  const generated = await runtime.dispatch(productionId, prepared, adapter);
  const intakeManifestPath = path.join(outputRoot, 'hsl_kling_asset_intake.json');
  FireflyToIntakeBridge.convert(productionId, generated.completedJobs, intakeManifestPath, {...prepared.lineageByJobName});
  const resultPath = path.join(outputRoot, 'firefly', 'paid-dispatch-result.json');
  writeJson(resultPath, {
    schema: 'hsl.firefly.paid-dispatch-result.v1', schema_version: '1.0.0', production_id: productionId,
    status: 'FIREFLY_DISPATCH_COMPLETE', authorization_path: authorizationPath,
    completed_job_count: generated.completedJobs.length, completed_jobs: generated.completedJobs,
    intake_manifest_path: intakeManifestPath, completed_at: new Date().toISOString()
  });
  process.stdout.write(`${JSON.stringify({status: 'FIREFLY_DISPATCH_COMPLETE', completed_job_count: generated.completedJobs.length, intake_manifest_path: intakeManifestPath, result_path: resultPath}, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
