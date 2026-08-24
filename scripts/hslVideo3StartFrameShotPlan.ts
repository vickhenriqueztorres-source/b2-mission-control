import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import {HslExecutableScene, HslExecutionPlan} from '../hsl/execution/types/execution';

function sha256(filePath: string): string {
  return `sha256_${crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex')}`;
}

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function main(): void {
  const productionId = process.env.HSL_VIDEO_3_RUN_ID || 'HSL-VIDEO-003';
  const outputRoot = path.resolve(process.env.HSL_VIDEO_3_OUTPUT || path.join('runs', productionId));
  const executionPlanPath = path.join(outputRoot, 'editorial', 'execution', 'episode.execution.json');
  const executionPlan = JSON.parse(fs.readFileSync(executionPlanPath, 'utf8')) as HslExecutionPlan;
  const executionRoot = path.dirname(executionPlanPath);
  const scenes = executionPlan.scenes.map((relative) => JSON.parse(fs.readFileSync(path.resolve(executionRoot, relative), 'utf8')) as HslExecutableScene);
  const generatedShots = scenes.flatMap((scene) => scene.visual_shots.filter((shot) => shot.visual_mode === 'generated_ai'));
  const candidatesRoot = path.join(outputRoot, 'start-frame-candidates');
  const items = generatedShots.map((shot) => {
    const candidatePath = path.join(candidatesRoot, `${shot.shot_id}.png`);
    const available = fs.existsSync(candidatePath);
    return {
      shot_id: shot.shot_id,
      parent_scene_id: shot.parent_scene_id,
      shot_index: shot.shot_index,
      variant: shot.variant,
      generation_strategy: shot.generation_strategy,
      motion_family: shot.motion_family,
      planned_duration_seconds: shot.planned_duration_seconds,
      start_frame_prompt: shot.start_frame_prompt,
      motion_prompt: shot.motion?.motion_prompt || null,
      candidate_status: available ? 'CANDIDATE_AVAILABLE' : 'GENERATION_REQUIRED',
      candidate_path: available ? candidatePath : null,
      candidate_sha256: available ? sha256(candidatePath) : null,
      human_review_status: 'PENDING'
    };
  });
  const planPath = path.join(candidatesRoot, 'start-frame-shot-plan.json');
  writeJson(planPath, {
    schema: 'hsl.start-frame.shot-plan.v1', schema_version: '1.0.0', episode_id: executionPlan.episode_id,
    status: 'START_FRAME_SHOT_PLAN_READY', generated_shot_count: items.length,
    generated_scene_count: new Set(items.map((item) => item.parent_scene_id)).size,
    candidate_available_count: items.filter((item) => item.candidate_status === 'CANDIDATE_AVAILABLE').length,
    generation_required_count: items.filter((item) => item.candidate_status === 'GENERATION_REQUIRED').length,
    human_approval_required: true, items
  });
  process.stdout.write(`${JSON.stringify({
    status: 'START_FRAME_SHOT_PLAN_READY', plan_path: planPath,
    generated_shot_count: items.length,
    generated_scene_count: new Set(items.map((item) => item.parent_scene_id)).size,
    generation_required_count: items.filter((item) => item.candidate_status === 'GENERATION_REQUIRED').length
  }, null, 2)}\n`);
}

main();
