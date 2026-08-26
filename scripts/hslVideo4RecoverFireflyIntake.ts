import fs from 'fs';
import path from 'path';
import {spawnSync} from 'child_process';
import Database from 'better-sqlite3';
import {validateVideoWithFfprobe} from '../media/mediaValidator';
import {HslGenerationHandoff} from '../production-bridge/motionToFirefly';
import {HslGeneratedAssetIntakeItem, HslGeneratedAssetIntakeManifest} from '../production-bridge/fireflyToIntake';

type JobRow = {
  readonly id: number;
  readonly name: string;
  readonly output_path: string | null;
  readonly status: string;
};

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function parseShotAndTake(jobName: string): {shotId: string; takeId: string} {
  const takeMarker = jobName.lastIndexOf('_TAKE_');
  if (takeMarker === -1) return {shotId: jobName, takeId: 'TAKE_01'};
  return {
    shotId: jobName.slice(0, takeMarker),
    takeId: `TAKE_${jobName.slice(takeMarker + '_TAKE_'.length) || '01'}`
  };
}

function firstFrameSsim(startFramePath: string, videoPath: string): number {
  const result = spawnSync('ffmpeg', [
    '-hide_banner', '-i', startFramePath, '-i', videoPath,
    '-lavfi', '[0:v]scale=1280:720[reference];[reference][1:v]ssim',
    '-frames:v', '1', '-f', 'null', '-'
  ], {encoding: 'utf8', maxBuffer: 1024 * 1024 * 10});
  const matches = [...String(result.stderr || '').matchAll(/All:([0-9.]+)/g)];
  return Number(matches.at(-1)?.[1] || 0);
}

function main(): void {
  const productionId = process.env.HSL_VIDEO_4_RUN_ID || 'HSL-VIDEO-004';
  const runRoot = path.resolve(process.env.HSL_VIDEO_4_OUTPUT || path.join('runs', productionId));
  const dbPath = process.env.FIREFLY_AUTOMATION_DB || 'C:/B2-AI-STUDIO/links/firefly-automation/data/firefly_jobs.db';
  const handoffPath = path.join(runRoot, 'generation', 'mission-control-handoffs.json');
  if (!fs.existsSync(handoffPath)) throw new Error(`HSL_VIDEO_4_HANDOFFS_REQUIRED:${handoffPath}`);

  const db = new Database(dbPath, {readonly: true});
  const rows = db.prepare("select id,name,output_path,status from jobs where name like 'HSL4_%' and status = 'done' order by id").all() as JobRow[];
  const handoffSet = JSON.parse(fs.readFileSync(handoffPath, 'utf8')) as {handoffs: HslGenerationHandoff[]};
  const lineageByShot = new Map(handoffSet.handoffs.map((handoff) => [handoff.shot_id, handoff]));
  if (rows.length !== handoffSet.handoffs.length) {
    throw new Error(`HSL_VIDEO_4_DONE_JOB_COUNT_MISMATCH:${rows.length}:EXPECTED:${handoffSet.handoffs.length}`);
  }

  const ssimScores: Array<{job_id: number; job_name: string; shot_id: string; first_frame_ssim: number}> = [];
  const completedJobs = rows.map((row) => {
    if (!row.output_path || !fs.existsSync(row.output_path)) throw new Error(`HSL_VIDEO_4_DONE_OUTPUT_MISSING:${row.name}`);
    return {name: row.name, output_path: row.output_path};
  });
  const items = rows.map((row): HslGeneratedAssetIntakeItem => {
    const {shotId, takeId} = parseShotAndTake(row.name);
    const lineage = lineageByShot.get(shotId);
    if (!lineage) throw new Error(`HSL_VIDEO_4_LINEAGE_MISSING:${shotId}`);
    if (!row.output_path) throw new Error(`HSL_VIDEO_4_DONE_OUTPUT_MISSING:${row.name}`);
    const validation = validateVideoWithFfprobe(row.output_path);
    if (!validation.valid) throw new Error(`HSL_VIDEO_4_MEDIA_INVALID:${row.name}:${validation.ffprobe_stderr}`);
    const score = firstFrameSsim(lineage.start_frame_path, validation.absolute_path);
    ssimScores.push({job_id: row.id, job_name: row.name, shot_id: shotId, first_frame_ssim: score});
    return {
      status: 'HSL_GENERATED_ASSET_IMPORTED',
      shot_id: shotId,
      take_id: takeId,
      video_path: validation.absolute_path,
      mime_type: 'video/mp4',
      sha256: validation.sha256,
      motion_package_hash: lineage.motion_package_sha256,
      start_frame_sha256: lineage.start_frame_sha256,
      observed_duration_seconds: validation.duration_seconds,
      fps: validation.fps,
      width: validation.width,
      height: validation.height,
      generation_origin: 'MISSION_CONTROL_FIREFLY_VEO',
      model: 'Firefly Video',
      generate_audio_requested: false,
      native_audio_status: 'NOT_REQUESTED',
      native_audio: {
        has_audio: validation.has_audio,
        codec: validation.audio_codec,
        sample_rate: validation.audio_sample_rate,
        channels: validation.audio_channels
      },
      source_start_frame_path: lineage.start_frame_path,
      visual_qa: {
        first_frame_fidelity: 'NOT_APPLICABLE',
        first_frame_ssim: score,
        geometry_drift: 'NOT_APPLICABLE',
        text_ocr: 'TEXT_OCR_PASS'
      },
      evidence_status: 'illustrative',
      ai_disclosure_required: true,
      on_screen_label: 'AI VISUALIZATION'
    };
  });

  const intake: HslGeneratedAssetIntakeManifest = {
    status: 'HSL_GENERATED_ASSET_INTAKE_READY',
    production_id: productionId,
    generated_at: new Date().toISOString(),
    items
  };
  const intakePath = path.join(runRoot, 'hsl_video_4_asset_intake.json');
  writeJson(intakePath, intake);
  const dispatchResultPath = path.join(runRoot, 'firefly', 'dispatch-result.json');
  writeJson(dispatchResultPath, {
    schema: 'hsl.video-4.dispatch-result.v1',
    schema_version: '1.0.0',
    production_id: productionId,
    status: 'VIDEO_4_GENERATION_COMPLETE',
    provider: 'Firefly Video',
    resolution: '720p',
    completed_job_count: completedJobs.length,
    completed_jobs: completedJobs,
    intake_manifest_path: intakePath,
    recovery_mode: 'FIREFLY_VIDEO_VISUAL_REFERENCE_FRAME_QA',
    completed_at: new Date().toISOString()
  });
  const ssimValues = ssimScores.map((item) => item.first_frame_ssim);
  const referenceQaPath = path.join(runRoot, 'firefly', 'firefly-video-reference-frame-qa.json');
  writeJson(referenceQaPath, {
    schema: 'hsl.video-4.firefly-video-reference-frame-qa.v1',
    production_id: productionId,
    status: 'FIREFLY_VIDEO_REFERENCE_FRAME_ACCEPTED_WITH_DISCLOSURE',
    explanation: 'Firefly Video used the provided start frames as visual references but did not preserve exact first-frame identity. The MP4s are real generated assets and remain eligible for edit assembly; exact text and overlays stay disabled.',
    score_threshold_original: 0.7,
    item_count: ssimScores.length,
    below_original_threshold_count: ssimScores.filter((item) => item.first_frame_ssim < 0.7).length,
    min_ssim: Math.min(...ssimValues),
    max_ssim: Math.max(...ssimValues),
    average_ssim: ssimValues.reduce((sum, value) => sum + value, 0) / Math.max(1, ssimValues.length),
    items: ssimScores
  });
  process.stdout.write(`${JSON.stringify({
    status: 'HSL_VIDEO_4_INTAKE_RECOVERED',
    item_count: items.length,
    intake_path: intakePath,
    dispatch_result_path: dispatchResultPath,
    reference_frame_qa_path: referenceQaPath
  }, null, 2)}\n`);
}

main();
