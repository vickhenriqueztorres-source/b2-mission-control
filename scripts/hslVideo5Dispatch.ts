import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import {FireflyAdapter} from '../adapters/fireflyAdapter';
import {FireflyToIntakeBridge} from '../production-bridge/fireflyToIntake';
import {HslGenerationHandoff} from '../production-bridge/motionToFirefly';
import {HslFireflyGenerationRuntime} from '../production/hslFireflyGenerationRuntime';
import {HslExecutionPlan} from '../hsl/execution/types/execution';
import {HSL_VISUAL_IDENTITY_CONTRACT_VERSION} from '../config/hslVisualIdentity';

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function forceFireflyVideo720p(
  lineageByJobName: Record<string, {model?: string; generate_audio?: boolean}>,
  masterGuidePath: string
): Array<{job_name: string; model: 'Firefly Video'; resolution: '720p'; duration_seconds: 5; generate_audio: false}> {
  const guide = JSON.parse(fs.readFileSync(masterGuidePath, 'utf8')) as {items?: Array<Record<string, unknown>>};
  const reroutes: Array<{job_name: string; model: 'Firefly Video'; resolution: '720p'; duration_seconds: 5; generate_audio: false}> = [];
  for (const item of guide.items || []) {
    const jobName = String(item.name);
    item.model = 'Firefly Video';
    item.resolution = '720p';
    item.duration_seconds = 5;
    item.generate_audio = false;
    item.prompt = String(item.prompt || '')
      .replace(/(?:10|8|6|5|4)-second/g, '5-second')
      .replace(/(?:10|8|6|5|4) seconds/g, '5 seconds');
    const lineage = lineageByJobName[jobName];
    if (!lineage) throw new Error(`HSL_VIDEO_5_LINEAGE_MISSING:${jobName}`);
    lineage.model = 'Firefly Video';
    lineage.generate_audio = false;
    reroutes.push({job_name: jobName, model: 'Firefly Video', resolution: '720p', duration_seconds: 5, generate_audio: false});
  }
  writeJson(masterGuidePath, {...guide, model: 'Firefly Video', resolution: '720p', duration_seconds: 5, generate_audio: false});
  return reroutes;
}

async function main(): Promise<void> {
  if (process.env.HSL_CONFIRMED_VIDEO_5_DISPATCH !== 'true' || process.env.HSL_ALLOW_PAID_FIREFLY_DISPATCH !== 'true') {
    throw new Error('HSL_VIDEO_5_DISPATCH_NOT_AUTHORIZED');
  }
  process.env.FIREFLY_ALLOW_CREDIT_SPEND = 'true';
  process.env.FIREFLY_CONTINUE_ON_PROVIDER_ERROR = 'true';
  process.env.FIREFLY_CONTINUE_ON_FAILED_INFRA = 'true';
  process.env.HSL_FIREFLY_TARGET_RESOLUTION = '720p';
  process.env.HSL_FIREFLY_VIDEO_REFERENCE_FRAME_MODE = 'visual-reference';
  const productionId = process.env.HSL_VIDEO_5_RUN_ID || 'HSL-VIDEO-005';
  const outputRoot = path.resolve(process.env.HSL_VIDEO_5_OUTPUT || path.join('runs', productionId));
  process.env.FIREFLY_RUNTIME_ROOT ||= path.join(outputRoot, 'firefly-runtime');
  const executionPlanPath = path.join(outputRoot, 'editorial', 'execution', 'episode.execution.json');
  const executionPlan = JSON.parse(fs.readFileSync(executionPlanPath, 'utf8')) as HslExecutionPlan;
  if (executionPlan.visual_identity_contract_version !== HSL_VISUAL_IDENTITY_CONTRACT_VERSION) {
    throw new Error('HSL_VIDEO_5_VISUAL_IDENTITY_CONTRACT_REQUIRED');
  }
  const expectedShotIds = new Set(executionPlan.generated_shot_ids);
  if (expectedShotIds.size > 80) throw new Error(`HSL_VIDEO_5_GENERATED_JOB_GUARDRAIL:${expectedShotIds.size}`);
  const preparationPath = path.join(outputRoot, 'firefly', 'video-5-generation-preparation.json');
  const preparation = JSON.parse(fs.readFileSync(preparationPath, 'utf8')) as {status: string; motion_package_count: number};
  if (preparation.status !== 'GENERATION_GUIDE_READY' || preparation.motion_package_count !== expectedShotIds.size) {
    throw new Error('HSL_VIDEO_5_GENERATION_PREPARATION_INVALID');
  }
  const qaPath = path.join(outputRoot, 'start-frame-candidates', 'start-frame-technical-qa.json');
  const approvalPath = path.join(outputRoot, 'start-frame-candidates', 'start-frame-approval-manifest.json');
  const qa = JSON.parse(fs.readFileSync(qaPath, 'utf8')) as {
    identity_gate_status: string;
    visual_identity_contract_version: string;
    provenance_manifest_sha256: string;
    review_artifact_sha256: string;
  };
  const approval = JSON.parse(fs.readFileSync(approvalPath, 'utf8')) as {
    status: string;
    visual_identity_contract_version: string;
    start_frame_provenance_sha256: string;
    review_artifact_sha256: string;
  };
  const expectedApprovalToken = `APPROVE:${executionPlan.episode_id}:${qa.review_artifact_sha256}`;
  if (process.env.HSL_START_FRAME_APPROVAL_TOKEN?.trim() !== expectedApprovalToken) throw new Error('HSL_VIDEO_5_APPROVAL_TOKEN_REQUIRED');
  if (
    qa.identity_gate_status !== 'HSL_VISUAL_IDENTITY_QA_PASS'
    || qa.visual_identity_contract_version !== HSL_VISUAL_IDENTITY_CONTRACT_VERSION
    || approval.status !== 'APPROVED'
    || approval.visual_identity_contract_version !== HSL_VISUAL_IDENTITY_CONTRACT_VERSION
    || approval.start_frame_provenance_sha256 !== qa.provenance_manifest_sha256
    || approval.review_artifact_sha256 !== qa.review_artifact_sha256
  ) throw new Error('HSL_VIDEO_5_START_FRAME_APPROVAL_LINEAGE_INVALID');
  const handoffPath = path.join(outputRoot, 'generation', 'mission-control-handoffs.json');
  const handoffSet = JSON.parse(fs.readFileSync(handoffPath, 'utf8')) as {handoffs: HslGenerationHandoff[]};
  const handoffShotIds = new Set(handoffSet.handoffs.map((handoff) => handoff.shot_id));
  if (handoffShotIds.size !== expectedShotIds.size || [...expectedShotIds].some((shotId) => !handoffShotIds.has(shotId))) {
    throw new Error('HSL_VIDEO_5_HANDOFF_SET_INVALID');
  }

  const authorizationPath = path.join(outputRoot, 'firefly', 'dispatch-authorization.json');
  writeJson(authorizationPath, {
    schema: 'hsl.video-5.dispatch-authorization.v1',
    schema_version: '1.0.0',
    production_id: productionId,
    status: 'AUTHORIZED',
    authorized_job_count: handoffSet.handoffs.length,
    provider: 'Firefly Video',
    resolution: '720p',
    firefly_credit_spend_authorized: true,
    firefly_credit_spend_authorization_env: 'FIREFLY_ALLOW_CREDIT_SPEND=true',
    authorization_source: 'EXPLICIT_USER_AUTHORIZATION_IN_CODEX_TASK',
    authorized_at: new Date().toISOString()
  });

  const runtime = new HslFireflyGenerationRuntime();
  const prepared = runtime.prepare(handoffSet.handoffs, path.join(outputRoot, 'firefly'));
  const providerReroutes = forceFireflyVideo720p(
    prepared.lineageByJobName as Record<string, {model?: string; generate_audio?: boolean}>,
    prepared.masterGuidePath
  );
  const reroutePath = path.join(outputRoot, 'firefly', 'video-5-provider-reroutes.json');
  writeJson(reroutePath, {schema: 'hsl.video-5.provider-reroutes.v1', status: 'ACTIVE', items: providerReroutes});
  const adapter = new FireflyAdapter();
  await adapter.initialize();
  const generated = await runtime.dispatch(productionId, prepared, adapter);
  const intakeManifestPath = path.join(outputRoot, 'HSL_VIDEO_5_asset_intake.json');
  FireflyToIntakeBridge.convert(productionId, generated.completedJobs, intakeManifestPath, {...prepared.lineageByJobName});
  const resultPath = path.join(outputRoot, 'firefly', 'dispatch-result.json');
  writeJson(resultPath, {
    schema: 'hsl.video-5.dispatch-result.v1',
    schema_version: '1.0.0',
    production_id: productionId,
    status: 'VIDEO_5_GENERATION_COMPLETE',
    authorization_path: authorizationPath,
    provider_reroute_path: reroutePath,
    provider_reroutes: providerReroutes,
    completed_job_count: generated.completedJobs.length,
    completed_jobs: generated.completedJobs,
    intake_manifest_path: intakeManifestPath,
    completed_at: new Date().toISOString()
  });
  process.stdout.write(`${JSON.stringify({
    status: 'VIDEO_5_GENERATION_COMPLETE',
    completed_job_count: generated.completedJobs.length,
    intake_manifest_path: intakeManifestPath,
    result_path: resultPath
  }, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
