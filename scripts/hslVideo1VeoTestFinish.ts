import fs from 'fs';
import path from 'path';
import {spawnSync} from 'child_process';
import {assertOfficialHslNarrationConfig} from '../config/hslProductionRules';
import {HslPostproductionRuntime} from '../hsl/postproduction/postproductionRuntime';
import {HslGeneratedAssetIntakeManifest} from '../production-bridge/fireflyToIntake';

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function runFfmpeg(args: readonly string[], errorCode: string): void {
  const result = spawnSync('ffmpeg', [...args], {encoding: 'utf8', maxBuffer: 1024 * 1024 * 20});
  if (result.status !== 0) throw new Error(`${errorCode}:${result.stderr || result.stdout || ''}`);
}

function readIntake(filePath: string): HslGeneratedAssetIntakeManifest {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as HslGeneratedAssetIntakeManifest;
}

async function main(): Promise<void> {
  assertOfficialHslNarrationConfig();
  process.env.HSL_SHOW_GLOBAL_OVERLAYS = process.env.HSL_SHOW_GLOBAL_OVERLAYS || 'false';
  process.env.HSL_SHOW_HYBRID_TEXT_OVERLAY = process.env.HSL_SHOW_HYBRID_TEXT_OVERLAY || 'false';
  const productionId = process.env.HSL_VIDEO_1_RUN_ID || 'HSL-VIDEO-001-VEO-TEST';
  const runRoot = path.resolve(process.env.HSL_VIDEO_1_OUTPUT || process.argv[2] || path.join('runs', productionId));
  const originalRoot = path.resolve(process.env.HSL_VIDEO_1_ORIGINAL_ROOT || path.join('runs', 'HSL-VIDEO-001'));
  const executionPlanPath = path.join(runRoot, 'editorial', 'execution', 'episode.execution.json');
  const originalIntakePath = path.join(originalRoot, 'hsl_kling_asset_intake.json');
  const veoIntakePath = path.join(runRoot, 'hsl_veo_asset_intake.json');
  const sourceNarrationPath = path.join(originalRoot, 'postproduction', 'narration.mp3');

  for (const required of [executionPlanPath, originalIntakePath, veoIntakePath, sourceNarrationPath]) {
    if (!fs.existsSync(required)) throw new Error(`HSL_VEO_TEST_FINISH_INPUT_REQUIRED:${required}`);
  }

  const originalIntake = readIntake(originalIntakePath);
  const veoIntake = readIntake(veoIntakePath);
  const mergedByShot = new Map(originalIntake.items.map((item) => [item.shot_id, item]));
  for (const item of veoIntake.items) mergedByShot.set(item.shot_id, item);
  const combinedIntakePath = path.join(runRoot, 'hsl_generated_asset_intake.json');
  const combinedIntake: HslGeneratedAssetIntakeManifest = {
    status: 'HSL_GENERATED_ASSET_INTAKE_READY',
    production_id: productionId,
    generated_at: new Date().toISOString(),
    items: [...mergedByShot.values()]
  };
  writeJson(combinedIntakePath, combinedIntake);

  const outputDirectory = path.join(runRoot, 'postproduction');
  fs.mkdirSync(outputDirectory, {recursive: true});
  const narrationPath = path.join(outputDirectory, 'narration.mp3');
  fs.copyFileSync(sourceNarrationPath, narrationPath);

  const postproduction = await new HslPostproductionRuntime().run({
    productionId,
    executionPlanPath,
    intakeManifestPath: combinedIntakePath,
    narrationPath,
    outputDirectory
  });

  const contactSheetPath = path.join(outputDirectory, 'contact-sheet.png');
  runFfmpeg([
    '-y', '-hide_banner', '-loglevel', 'error', '-i', postproduction.finalVideoPath,
    '-vf', 'fps=1/120,scale=640:-1,tile=4x2:padding=8:margin=8:color=0x0D0E15',
    '-frames:v', '1', contactSheetPath
  ], 'HSL_VEO_TEST_CONTACT_SHEET_FAILED');

  const renderManifest = JSON.parse(fs.readFileSync(postproduction.renderManifestPath, 'utf8')) as Record<string, unknown>;
  const renderProps = JSON.parse(fs.readFileSync(path.join(outputDirectory, 'remotion-props.json'), 'utf8')) as {
    scenes?: Array<{generationStrategy?: string; visualMode?: string; shotId?: string; durationInFrames: number}>;
  };
  const scenes = renderProps.scenes || [];
  let cursorFrames = 0;
  const hybridMidpointFrames: number[] = [];
  for (const scene of scenes) {
    if (scene.generationStrategy === 'VEO_REMOTION_HYBRID') {
      hybridMidpointFrames.push(cursorFrames + Math.floor(scene.durationInFrames / 2));
    }
    cursorFrames += scene.durationInFrames;
  }
  const hybridContactSheetPath = path.join(outputDirectory, 'veo-hybrid-contact-sheet.png');
  if (hybridMidpointFrames.length) {
    const selection = hybridMidpointFrames.map((frame) => `eq(n,${frame})`).join('+');
    const columns = Math.min(4, hybridMidpointFrames.length);
    const rows = Math.ceil(hybridMidpointFrames.length / columns);
    runFfmpeg([
      '-y', '-hide_banner', '-loglevel', 'error', '-i', postproduction.finalVideoPath,
      '-vf', `select='${selection}',scale=480:-1,tile=${columns}x${rows}:padding=8:margin=8:color=0x0D0E15`,
      '-vsync', '0', '-frames:v', '1', hybridContactSheetPath
    ], 'HSL_VEO_TEST_HYBRID_CONTACT_SHEET_FAILED');
  }
  const manifestPath = path.join(runRoot, 'video-1-veo-test-final-manifest.json');
  const manifest = {
    schema: 'hsl.video-1.veo-test.final-manifest.v1',
    schema_version: '1.0.0',
    status: 'HSL_VIDEO_1_VEO_TEST_COMPLETE',
    production_id: productionId,
    original_production_id: originalIntake.production_id,
    original_master_path: path.join(originalRoot, 'postproduction', 'HSL_FINAL_DOCUMENTARY.mp4'),
    execution_plan_path: executionPlanPath,
    combined_intake_manifest_path: combinedIntakePath,
    preserved_kling_asset_count: originalIntake.items.length,
    veo_asset_count: veoIntake.items.length,
    total_generated_asset_count: combinedIntake.items.length,
    veo_hybrid_shots: scenes.filter((scene) => scene.generationStrategy === 'VEO_REMOTION_HYBRID').map((scene) => scene.shotId),
    remaining_remotion_shot_count: scenes.filter((scene) => scene.visualMode === 'remotion').length,
    narration_reused_from: sourceNarrationPath,
    final_video_path: postproduction.finalVideoPath,
    final_render_manifest_path: postproduction.renderManifestPath,
    contact_sheet_path: contactSheetPath,
    veo_hybrid_contact_sheet_path: hybridContactSheetPath,
    final_render: renderManifest,
    completed_at: new Date().toISOString()
  };
  writeJson(manifestPath, manifest);
  process.stdout.write(`${JSON.stringify({...manifest, manifest_path: manifestPath}, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
