import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import {FireflyAdapter} from '../adapters/fireflyAdapter';
import {FireflyToIntakeBridge} from '../production-bridge/fireflyToIntake';
import {HslGenerationHandoff} from '../production-bridge/motionToFirefly';
import {HslFireflyGenerationRuntime} from '../production/hslFireflyGenerationRuntime';
import {HslExecutionPlan} from '../hsl/execution/types/execution';

type ProviderReroute = {
  readonly job_name: string;
  readonly model: 'Kling 3.0' | 'Veo 3.1 Fast' | 'Veo 3.1' | 'Firefly Video';
  readonly generate_audio?: boolean;
  readonly duration_seconds?: number;
  readonly resolution?: string;
  readonly reason?: string;
};

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function applyProviderReroutes(
  lineageByJobName: Record<string, {model?: string; generate_audio?: boolean}>,
  reroutePath: string,
  masterGuidePath: string
): ProviderReroute[] {
  if (!fs.existsSync(reroutePath)) return [];
  const manifest = JSON.parse(fs.readFileSync(reroutePath, 'utf8')) as {status?: string; items?: ProviderReroute[]};
  if (manifest.status !== 'ACTIVE') return [];
  const reroutes = manifest.items || [];
  const guide = JSON.parse(fs.readFileSync(masterGuidePath, 'utf8')) as {items?: Array<Record<string, unknown>>};
  const guideItemsByName = new Map((guide.items || []).map((item) => [String(item.name), item]));
  for (const reroute of reroutes) {
    const lineage = lineageByJobName[reroute.job_name];
    if (!lineage) throw new Error(`HSL_VIDEO_3_PROVIDER_REROUTE_UNKNOWN_JOB:${reroute.job_name}`);
    lineage.model = reroute.model;
    const isGeneratedProvider = reroute.model !== 'Kling 3.0';
    const usesFixedDurationPicker = reroute.model === 'Veo 3.1 Fast' || reroute.model === 'Veo 3.1';
    lineage.generate_audio = Boolean(reroute.generate_audio && isGeneratedProvider);
    const guideItem = guideItemsByName.get(reroute.job_name);
    if (!guideItem) throw new Error(`HSL_VIDEO_3_PROVIDER_REROUTE_GUIDE_JOB_MISSING:${reroute.job_name}`);
    guideItem.model = reroute.model;
    guideItem.generate_audio = lineage.generate_audio;
    if (reroute.resolution) guideItem.resolution = reroute.resolution;
    const targetDuration = reroute.duration_seconds || 8;
    if (Number(guideItem.duration_seconds || 0) > targetDuration || usesFixedDurationPicker) {
      guideItem.duration_seconds = targetDuration;
      guideItem.prompt = String(guideItem.prompt || '')
        .replace(/(?:10|8|5|4)-second/g, `${targetDuration}-second`)
        .replace(/(?:10|8|5|4) seconds/g, `${targetDuration} seconds`);
    }
  }
  writeJson(masterGuidePath, guide);
  return reroutes;
}

async function main(): Promise<void> {
  if (process.env.HSL_CONFIRMED_VIDEO_3_DISPATCH !== 'true' || process.env.HSL_ALLOW_PAID_FIREFLY_DISPATCH !== 'true') {
    throw new Error('HSL_VIDEO_3_DISPATCH_NOT_AUTHORIZED');
  }
  process.env.FIREFLY_ALLOW_CREDIT_SPEND = 'true';
  process.env.FIREFLY_CONTINUE_ON_PROVIDER_ERROR = 'true';
  process.env.FIREFLY_CONTINUE_ON_FAILED_INFRA = 'true';
  const productionId = process.env.HSL_VIDEO_3_RUN_ID || 'HSL-VIDEO-003';
  const outputRoot = path.resolve(process.env.HSL_VIDEO_3_OUTPUT || path.join('runs', productionId));
  const executionPlanPath = path.join(outputRoot, 'editorial', 'execution', 'episode.execution.json');
  const executionPlan = JSON.parse(fs.readFileSync(executionPlanPath, 'utf8')) as HslExecutionPlan;
  const expectedShotIds = new Set(executionPlan.generated_shot_ids);
  const preparationPath = path.join(outputRoot, 'firefly', 'video-3-generation-preparation.json');
  const preparation = JSON.parse(fs.readFileSync(preparationPath, 'utf8')) as {status: string; motion_package_count: number};
  if (preparation.status !== 'GENERATION_GUIDE_READY' || preparation.motion_package_count !== expectedShotIds.size) {
    throw new Error('HSL_VIDEO_3_GENERATION_PREPARATION_INVALID');
  }
  const handoffPath = path.join(outputRoot, 'generation', 'mission-control-handoffs.json');
  const handoffSet = JSON.parse(fs.readFileSync(handoffPath, 'utf8')) as {handoffs: HslGenerationHandoff[]};
  const handoffShotIds = new Set(handoffSet.handoffs.map((handoff) => handoff.shot_id));
  if (handoffShotIds.size !== expectedShotIds.size || [...expectedShotIds].some((shotId) => !handoffShotIds.has(shotId))) {
    throw new Error('HSL_VIDEO_3_HANDOFF_SET_INVALID');
  }

  const authorizationPath = path.join(outputRoot, 'firefly', 'dispatch-authorization.json');
  writeJson(authorizationPath, {
    schema: 'hsl.video-3.dispatch-authorization.v1', schema_version: '1.0.0', production_id: productionId,
    status: 'AUTHORIZED', authorized_job_count: handoffSet.handoffs.length,
    firefly_credit_spend_authorized: true,
    firefly_credit_spend_authorization_env: 'FIREFLY_ALLOW_CREDIT_SPEND=true',
    authorization_source: 'EXPLICIT_USER_AUTHORIZATION_IN_CODEX_TASK', authorized_at: new Date().toISOString()
  });

  const runtime = new HslFireflyGenerationRuntime();
  const prepared = runtime.prepare(handoffSet.handoffs, path.join(outputRoot, 'firefly'));
  const providerReroutePath = path.join(outputRoot, 'firefly', 'video-3-provider-reroutes.json');
  const providerReroutes = applyProviderReroutes(
    prepared.lineageByJobName as Record<string, {model?: string; generate_audio?: boolean}>,
    providerReroutePath,
    prepared.masterGuidePath
  );
  const adapter = new FireflyAdapter();
  await adapter.initialize();
  const generated = await runtime.dispatch(productionId, prepared, adapter);
  const intakeManifestPath = path.join(outputRoot, 'hsl_video_3_asset_intake.json');
  FireflyToIntakeBridge.convert(productionId, generated.completedJobs, intakeManifestPath, {...prepared.lineageByJobName});
  const resultPath = path.join(outputRoot, 'firefly', 'dispatch-result.json');
  writeJson(resultPath, {
    schema: 'hsl.video-3.dispatch-result.v1', schema_version: '1.0.0', production_id: productionId,
    status: 'VIDEO_3_GENERATION_COMPLETE', authorization_path: authorizationPath,
    provider_reroute_path: fs.existsSync(providerReroutePath) ? providerReroutePath : undefined,
    provider_reroutes: providerReroutes,
    completed_job_count: generated.completedJobs.length, completed_jobs: generated.completedJobs,
    intake_manifest_path: intakeManifestPath, completed_at: new Date().toISOString()
  });
  process.stdout.write(`${JSON.stringify({
    status: 'VIDEO_3_GENERATION_COMPLETE', completed_job_count: generated.completedJobs.length,
    intake_manifest_path: intakeManifestPath, result_path: resultPath
  }, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
