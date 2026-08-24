import fs from 'fs';
import path from 'path';
import {spawnSync} from 'child_process';
import {assertOfficialHslNarrationConfig} from '../config/hslProductionRules';
import {HslPostproductionRuntime} from '../hsl/postproduction/postproductionRuntime';

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function runFfmpeg(args: readonly string[], errorCode: string): void {
  const result = spawnSync('ffmpeg', [...args], {encoding: 'utf8', maxBuffer: 1024 * 1024 * 20});
  if (result.status !== 0) throw new Error(`${errorCode}:${result.stderr || result.stdout || ''}`);
}

async function main(): Promise<void> {
  assertOfficialHslNarrationConfig();
  const productionId = process.env.HSL_VIDEO_1_RUN_ID || 'HSL-VIDEO-001';
  const runRoot = path.resolve(process.env.HSL_VIDEO_1_OUTPUT || process.argv[2] || path.join('runs', productionId));
  const executionPlanPath = path.join(runRoot, 'editorial', 'execution', 'episode.execution.json');
  const intakeManifestPath = path.join(runRoot, 'hsl_kling_asset_intake.json');
  const narrationPath = path.join(runRoot, 'postproduction', 'narration.mp3');
  const dispatchResultPath = path.join(runRoot, 'firefly', 'paid-dispatch-result.json');

  for (const required of [executionPlanPath, intakeManifestPath, narrationPath, dispatchResultPath]) {
    if (!fs.existsSync(required)) throw new Error(`HSL_VIDEO_1_FINISH_INPUT_REQUIRED:${required}`);
  }

  const outputDirectory = path.join(runRoot, 'postproduction');
  const previousMasterPath = path.join(outputDirectory, 'HSL_FINAL_DOCUMENTARY.mp4');
  const preservedMasterPath = path.join(outputDirectory, 'HSL_FINAL_DOCUMENTARY_V1_ORIGINAL.mp4');
  if (fs.existsSync(previousMasterPath) && !fs.existsSync(preservedMasterPath)) fs.copyFileSync(previousMasterPath, preservedMasterPath);
  const previousRenderManifestPath = path.join(outputDirectory, 'final-render-manifest.json');
  const preservedRenderManifestPath = path.join(outputDirectory, 'final-render-manifest.v1-original.json');
  if (fs.existsSync(previousRenderManifestPath) && !fs.existsSync(preservedRenderManifestPath)) fs.copyFileSync(previousRenderManifestPath, preservedRenderManifestPath);
  const postproduction = await new HslPostproductionRuntime().run({
    productionId,
    executionPlanPath,
    intakeManifestPath,
    narrationPath,
    outputDirectory
  });

  const contactSheetPath = path.join(outputDirectory, 'contact-sheet.png');
  runFfmpeg([
    '-y', '-hide_banner', '-loglevel', 'error', '-i', postproduction.finalVideoPath,
    '-vf', 'fps=1/120,scale=640:-1,tile=4x2:padding=8:margin=8:color=0x0D0E15',
    '-frames:v', '1', contactSheetPath
  ], 'HSL_VIDEO_1_CONTACT_SHEET_FAILED');

  const dispatchResult = JSON.parse(fs.readFileSync(dispatchResultPath, 'utf8')) as Record<string, unknown>;
  const finalRenderManifest = JSON.parse(fs.readFileSync(postproduction.renderManifestPath, 'utf8')) as Record<string, unknown>;
  const soundFxPlan = JSON.parse(fs.readFileSync(postproduction.soundFxPlanPath, 'utf8')) as {cues?: unknown[]};
  const renderProps = JSON.parse(fs.readFileSync(path.join(outputDirectory, 'remotion-props.json'), 'utf8')) as {
    scenes?: Array<{motionDesign?: {template?: string}}>;
  };
  const motionTemplates = (renderProps.scenes || []).reduce<Record<string, number>>((counts, scene) => {
    const template = scene.motionDesign?.template;
    if (template) counts[template] = (counts[template] || 0) + 1;
    return counts;
  }, {});
  const manifestPath = path.join(runRoot, 'video-1-final-manifest.json');
  const manifest = {
    schema: 'hsl.video-1.final-manifest.v1',
    schema_version: '1.0.0',
    status: 'HSL_VIDEO_1_COMPLETE',
    production_id: productionId,
    dispatch_result_path: dispatchResultPath,
    completed_firefly_jobs: dispatchResult.completed_job_count,
    intake_manifest_path: intakeManifestPath,
    narration_path: narrationPath,
    soundfx_provider: 'Kenney',
    soundfx_license: 'CC0-1.0',
    soundfx_cue_count: soundFxPlan.cues?.length || 0,
    soundfx_plan_path: postproduction.soundFxPlanPath,
    soundfx_bed_path: postproduction.soundFxBedPath,
    motion_design: {
      schema: 'hsl.motion-design.v2', schema_version: '2.0.0',
      remotion_shot_count: Object.values(motionTemplates).reduce((sum, count) => sum + count, 0),
      template_count: Object.keys(motionTemplates).length, template_distribution: motionTemplates,
      preview_path: path.resolve('runs', 'HSL-MOTION-V2-PREVIEW', 'HSL_MOTION_V2_PREVIEW.mp4'),
      previous_master_preserved_path: fs.existsSync(preservedMasterPath) ? preservedMasterPath : null
    },
    final_video_path: postproduction.finalVideoPath,
    final_render_manifest_path: postproduction.renderManifestPath,
    contact_sheet_path: contactSheetPath,
    final_render: finalRenderManifest,
    completed_at: new Date().toISOString()
  };
  writeJson(manifestPath, manifest);
  process.stdout.write(`${JSON.stringify({...manifest, manifest_path: manifestPath}, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
