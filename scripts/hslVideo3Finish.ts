import fs from 'fs';
import path from 'path';
import {spawnSync} from 'child_process';
import {assertOfficialHslNarrationConfig} from '../config/hslProductionRules';
import {HslPostproductionRuntime} from '../hsl/postproduction/postproductionRuntime';
import {HslGeneratedAssetIntakeManifest} from '../production-bridge/fireflyToIntake';

const generatedFallbackByScene: Readonly<Record<string, string>> = {
  HSL3_004: 'HSL3_006_V01'
};

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function runFfmpeg(args: readonly string[], errorCode: string): void {
  const result = spawnSync('ffmpeg', [...args], {encoding: 'utf8', maxBuffer: 1024 * 1024 * 20});
  if (result.status !== 0) throw new Error(`${errorCode}:${result.stderr || result.stdout || ''}`);
}

function usesLocalProxy(value: unknown): boolean {
  return typeof value === 'string' && /local-proxy|LOCAL_PROXY|LOCAL_PROXY_NO_PAID_PROVIDER/i.test(value);
}

function assertRealGeneratedAssets(
  intake: HslGeneratedAssetIntakeManifest,
  dispatchResult: Record<string, unknown>
): void {
  if (usesLocalProxy(dispatchResult.status)) {
    throw new Error(`HSL_VIDEO_3_REAL_GENERATED_ASSETS_REQUIRED: dispatch status is ${dispatchResult.status}`);
  }
  if (usesLocalProxy(dispatchResult.dispatch_mode)) {
    throw new Error(`HSL_VIDEO_3_REAL_GENERATED_ASSETS_REQUIRED: dispatch mode is ${dispatchResult.dispatch_mode}`);
  }
  const completedJobs = Array.isArray(dispatchResult.completed_jobs) ? dispatchResult.completed_jobs : [];
  for (const job of completedJobs) {
    if (job && typeof job === 'object' && usesLocalProxy((job as {output_path?: unknown}).output_path)) {
      throw new Error(`HSL_VIDEO_3_REAL_GENERATED_ASSETS_REQUIRED: local proxy dispatch output for ${(job as {job_name?: unknown}).job_name || 'UNKNOWN_JOB'}`);
    }
  }
  for (const item of intake.items) {
    if (usesLocalProxy(item.video_path)) {
      throw new Error(`HSL_VIDEO_3_LOCAL_PROXY_ASSET_FORBIDDEN:${item.shot_id}:${item.video_path}`);
    }
  }
}

function audioDuration(filePath: string): number {
  const result = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', filePath], {encoding: 'utf8'});
  if (result.status !== 0) throw new Error(`HSL_VIDEO_3_NARRATION_PROBE_FAILED:${result.stderr || ''}`);
  return Number(result.stdout.trim());
}

function fitNarration(sourcePath: string, targetSeconds: number, outputPath: string): string {
  const duration = audioDuration(sourcePath);
  const tempo = duration / targetSeconds;
  if (!Number.isFinite(tempo) || tempo < 0.5 || tempo > 2) throw new Error(`HSL_VIDEO_3_NARRATION_TEMPO_INVALID:${tempo}`);
  runFfmpeg([
    '-y', '-hide_banner', '-loglevel', 'error', '-i', sourcePath,
    '-filter:a', `atempo=${tempo.toFixed(6)}`, '-c:a', 'libmp3lame', '-b:a', '192k', outputPath
  ], 'HSL_VIDEO_3_NARRATION_FIT_FAILED');
  return outputPath;
}

async function main(): Promise<void> {
  assertOfficialHslNarrationConfig();
  process.env.HSL_SHOW_GLOBAL_OVERLAYS = 'false';
  process.env.HSL_SHOW_HYBRID_TEXT_OVERLAY = 'false';
  const productionId = process.env.HSL_VIDEO_3_RUN_ID || 'HSL-VIDEO-003';
  const runRoot = path.resolve(process.env.HSL_VIDEO_3_OUTPUT || path.join('runs', productionId));
  const sourceExecutionRoot = path.join(runRoot, 'editorial', 'execution');
  const sourcePlanPath = path.join(sourceExecutionRoot, 'episode.execution.json');
  const intakePath = path.join(runRoot, 'hsl_video_3_asset_intake.json');
  const dispatchResultPath = path.join(runRoot, 'firefly', 'dispatch-result.json');
  const finalNarrationPath = path.join(runRoot, 'postproduction', 'narration.mp3');
  const narrationProvider = (process.env.HSL_NARRATION_PROVIDER || '').toLowerCase();
  const narrationSourcePath = finalNarrationPath;
  if (!fs.existsSync(finalNarrationPath)) {
    throw new Error('HSL_VIDEO_3_OFFICIAL_NARRATION_REQUIRED: run hsl:video-3-narration with the official Echo/Voicebox voice before finishing');
  }
  for (const required of [sourcePlanPath, intakePath, dispatchResultPath, narrationSourcePath]) {
    if (!fs.existsSync(required)) throw new Error(`HSL_VIDEO_3_FINISH_INPUT_REQUIRED:${required}`);
  }

  const sourcePlan = JSON.parse(fs.readFileSync(sourcePlanPath, 'utf8')) as {episode_id: string; scenes: string[]; [key: string]: unknown};
  const intake = JSON.parse(fs.readFileSync(intakePath, 'utf8')) as HslGeneratedAssetIntakeManifest;
  const dispatchResult = JSON.parse(fs.readFileSync(dispatchResultPath, 'utf8')) as Record<string, unknown>;
  assertRealGeneratedAssets(intake, dispatchResult);
  const sourceAssetByShot = new Map(intake.items.map((item) => [item.shot_id, item]));
  const postExecutionRoot = path.join(runRoot, 'postproduction-execution');
  const combinedItems = [...intake.items];
  const fallbackRecords: Array<{scene_id: string; target_shot_id: string; source_generated_shot_id: string}> = [];
  let totalDurationSeconds = 0;

  for (const relative of sourcePlan.scenes) {
    const sourceScenePath = path.resolve(sourceExecutionRoot, relative);
    const scene = JSON.parse(fs.readFileSync(sourceScenePath, 'utf8')) as {
      scene_id: string;
      planned_duration_seconds: number;
      visual_mode?: string;
      evidence_status?: string;
      ai_disclosure_required?: boolean;
      visual_function?: string;
      visual_shots?: Array<Record<string, unknown> & {shot_id: string; visual_mode: string}>;
    };
    totalDurationSeconds += Number(scene.planned_duration_seconds || 0);
    const fallbackSourceShotId = generatedFallbackByScene[scene.scene_id];
    if (fallbackSourceShotId) {
      const sourceAsset = sourceAssetByShot.get(fallbackSourceShotId);
      if (!sourceAsset) throw new Error(`HSL_VIDEO_3_FALLBACK_ASSET_REQUIRED:${fallbackSourceShotId}`);
      scene.visual_mode = 'generated_ai';
      scene.evidence_status = 'illustrative';
      scene.ai_disclosure_required = true;
      scene.visual_function = 'reconstruction';
      scene.visual_shots = (scene.visual_shots || []).map((shot) => {
        if (shot.visual_mode !== 'licensed_real') return shot;
        combinedItems.push({...sourceAsset, shot_id: shot.shot_id});
        fallbackRecords.push({scene_id: scene.scene_id, target_shot_id: shot.shot_id, source_generated_shot_id: fallbackSourceShotId});
        return {
          ...shot,
          visual_mode: 'generated_ai', evidence_status: 'illustrative', ai_disclosure_required: true,
          visual_function: 'reconstruction', generation_strategy: 'KLING_CINEMATIC', audio_strategy: 'KENNEY_DESIGNED'
        };
      });
    }
    const destination = path.resolve(postExecutionRoot, relative);
    writeJson(destination, scene);
  }
  const postPlanPath = path.join(postExecutionRoot, 'episode.execution.json');
  writeJson(postPlanPath, {...sourcePlan, scenes: sourcePlan.scenes});
  const combinedIntakePath = path.join(runRoot, 'hsl_video_3_postproduction_intake.json');
  writeJson(combinedIntakePath, {...intake, generated_at: new Date().toISOString(), items: combinedItems});
  const fallbackManifestPath = path.join(runRoot, 'postproduction', 'licensed-footage-fallback-manifest.json');
  writeJson(fallbackManifestPath, {
    schema: 'hsl.video-3.licensed-footage-fallback.v1', status: 'GENERATED_AI_FALLBACK_APPLIED',
    reason: 'NO_LICENSED_REAL_FOOTAGE_SUPPLIED', ai_disclosure_required: true, items: fallbackRecords
  });

  const fittedNarrationPath = path.join(runRoot, 'postproduction', 'narration-timeline-fit.mp3');
  fitNarration(narrationSourcePath, totalDurationSeconds, fittedNarrationPath);
  const outputDirectory = path.join(runRoot, 'postproduction');
  const postproduction = await new HslPostproductionRuntime().run({
    productionId, executionPlanPath: postPlanPath, intakeManifestPath: combinedIntakePath,
    narrationPath: fittedNarrationPath, outputDirectory
  });

  const contactSheetPath = path.join(outputDirectory, 'contact-sheet.png');
  runFfmpeg([
    '-y', '-hide_banner', '-loglevel', 'error', '-i', postproduction.finalVideoPath,
    '-vf', 'fps=1/120,scale=640:-1,tile=4x2:padding=8:margin=8:color=0x0D0E15',
    '-frames:v', '1', contactSheetPath
  ], 'HSL_VIDEO_3_CONTACT_SHEET_FAILED');
  const renderManifest = JSON.parse(fs.readFileSync(postproduction.renderManifestPath, 'utf8')) as Record<string, unknown>;
  const finalManifestPath = path.join(runRoot, 'video-3-final-manifest.json');
  writeJson(finalManifestPath, {
    schema: 'hsl.video-3.final-manifest.v1', schema_version: '1.0.0', status: 'HSL_VIDEO_3_COMPLETE',
    production_id: productionId, title: 'The Hidden Journey of Water to Your Tap',
    completed_generated_jobs: Number(dispatchResult.completed_job_count || 0),
    original_intake_manifest_path: intakePath, postproduction_intake_manifest_path: combinedIntakePath,
    licensed_footage_fallback_manifest_path: fallbackManifestPath,
    narration_source_path: narrationSourcePath,
    narration_status: narrationProvider === 'voicebox' ? 'VOICEBOX_LOCAL_FINAL' : 'ELEVENLABS_FINAL',
    fitted_narration_path: fittedNarrationPath,
    soundfx_provider: 'Kenney', soundfx_license: 'CC0-1.0',
    soundfx_plan_path: postproduction.soundFxPlanPath, soundfx_bed_path: postproduction.soundFxBedPath,
    overlays: {hsl_docs: false, ai_visualization: false, loading_line: false, hybrid_text: false},
    final_video_path: postproduction.finalVideoPath, final_render_manifest_path: postproduction.renderManifestPath,
    contact_sheet_path: contactSheetPath, final_render: renderManifest, completed_at: new Date().toISOString()
  });
  process.stdout.write(`${JSON.stringify({
    status: 'HSL_VIDEO_3_COMPLETE', title: 'The Hidden Journey of Water to Your Tap',
    narration_status: narrationProvider === 'voicebox' ? 'VOICEBOX_LOCAL_FINAL' : 'ELEVENLABS_FINAL',
    final_video_path: postproduction.finalVideoPath, contact_sheet_path: contactSheetPath,
    final_manifest_path: finalManifestPath
  }, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
