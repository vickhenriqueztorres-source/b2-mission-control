import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import {HslExecutableScene, HslExecutionPlan} from '../hsl/execution/types/execution';
import {
  assertHslStartFramePromptIdentity,
  HSL_PREMIUM_MOTION_REFERENCE_SET,
  HSL_VISUAL_IDENTITY_CONTRACT_VERSION
} from '../config/hslVisualIdentity';
import {inspectHslStartFrameCandidateEligibility} from '../hsl/startframe/startFrameIdentityGate';

function sha256(filePath: string): string {
  return `sha256_${crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex')}`;
}

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function main(): void {
  const productionId = process.env.HSL_VIDEO_5_RUN_ID || 'HSL-VIDEO-005';
  const outputRoot = path.resolve(process.env.HSL_VIDEO_5_OUTPUT || path.join('runs', productionId));
  const executionPlanPath = path.join(outputRoot, 'editorial', 'execution', 'episode.execution.json');
  const executionPlan = JSON.parse(fs.readFileSync(executionPlanPath, 'utf8')) as HslExecutionPlan;
  const executionRoot = path.dirname(executionPlanPath);
  const scenes = executionPlan.scenes.map((relative) => JSON.parse(fs.readFileSync(path.resolve(executionRoot, relative), 'utf8')) as HslExecutableScene);
  const generatedShots = scenes.flatMap((scene) => scene.visual_shots.filter((shot) => shot.visual_mode === 'generated_ai'));
  if (executionPlan.visual_identity_contract_version !== HSL_VISUAL_IDENTITY_CONTRACT_VERSION) {
    throw new Error('HSL_VIDEO_5_EXECUTION_IDENTITY_CONTRACT_REQUIRED');
  }
  const candidatesRoot = path.join(outputRoot, 'start-frame-candidates');
  const provenanceManifestPath = path.join(candidatesRoot, 'start-frame-provenance.json');
  const items = generatedShots.map((shot) => {
    assertHslStartFramePromptIdentity(shot.start_frame_prompt || '', shot.shot_id);
    const candidatePath = path.join(candidatesRoot, `${shot.shot_id}.png`);
    const eligibility = inspectHslStartFrameCandidateEligibility({
      provenanceManifestPath,
      shot: {
        shot_id: shot.shot_id,
        frame_path: candidatePath,
        start_frame_prompt: shot.start_frame_prompt || ''
      }
    });
    const available = eligibility.eligible;
    return {
      shot_id: shot.shot_id,
      parent_scene_id: shot.parent_scene_id,
      shot_index: shot.shot_index,
      variant: shot.variant,
      generation_strategy: shot.generation_strategy,
      motion_family: shot.motion_family,
      visual_identity_contract_version: shot.visual_identity_contract_version,
      required_visual_reference_set: shot.required_visual_reference_set,
      planned_duration_seconds: shot.planned_duration_seconds,
      start_frame_prompt: shot.start_frame_prompt,
      motion_prompt: shot.motion?.motion_prompt || null,
      candidate_status: available ? 'CANDIDATE_AVAILABLE' : 'GENERATION_REQUIRED',
      candidate_path: available ? candidatePath : null,
      candidate_sha256: available ? sha256(candidatePath) : null,
      identity_eligibility: eligibility.reason,
      human_review_status: 'PENDING'
    };
  });
  const planPath = path.join(candidatesRoot, 'start-frame-shot-plan.json');
  writeJson(planPath, {
    schema: 'hsl.start-frame.shot-plan.v1',
    schema_version: '1.0.0',
    episode_id: executionPlan.episode_id,
    status: 'START_FRAME_SHOT_PLAN_READY',
    generated_shot_count: items.length,
    generated_scene_count: new Set(items.map((item) => item.parent_scene_id)).size,
    candidate_available_count: items.filter((item) => item.candidate_status === 'CANDIDATE_AVAILABLE').length,
    generation_required_count: items.filter((item) => item.candidate_status === 'GENERATION_REQUIRED').length,
    max_job_guardrail: 80,
    human_approval_required: true,
    visual_identity_contract_version: HSL_VISUAL_IDENTITY_CONTRACT_VERSION,
    required_visual_reference_set: HSL_PREMIUM_MOTION_REFERENCE_SET.name,
    approved_reference_asset_ids: HSL_PREMIUM_MOTION_REFERENCE_SET.approvedAssetIds,
    items
  });
  if (items.length > 80) throw new Error(`HSL_VIDEO_5_GENERATED_JOB_GUARDRAIL:${items.length}`);
  process.stdout.write(`${JSON.stringify({
    status: 'START_FRAME_SHOT_PLAN_READY',
    plan_path: planPath,
    generated_shot_count: items.length,
    generated_scene_count: new Set(items.map((item) => item.parent_scene_id)).size,
    generation_required_count: items.filter((item) => item.candidate_status === 'GENERATION_REQUIRED').length
  }, null, 2)}\n`);
}

main();
