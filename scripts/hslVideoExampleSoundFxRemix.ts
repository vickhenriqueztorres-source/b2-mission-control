import fs from 'fs';
import path from 'path';
import {spawnSync} from 'child_process';
import {HslPostproductionRuntime} from '../hsl/postproduction/postproductionRuntime';

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function main(): Promise<void> {
  const runRoot = path.resolve(process.argv[2] || path.join('runs', 'HSL-VIDEO-EXAMPLE-001'));
  const executionPlanPath = path.join(runRoot, 'editorial', 'execution', 'episode.execution.json');
  const intakeManifestPath = path.join(runRoot, 'hsl_kling_asset_intake.json');
  const narrationPath = path.join(runRoot, 'postproduction', 'narration.mp3');
  const sourceManifestPath = path.join(runRoot, 'video-example-manifest.json');
  for (const required of [executionPlanPath, intakeManifestPath, narrationPath, sourceManifestPath]) {
    if (!fs.existsSync(required)) throw new Error(`HSL_SFX_REMIX_INPUT_REQUIRED:${required}`);
  }

  const outputDirectory = path.join(runRoot, 'postproduction-kenney-sfx');
  const postproduction = await new HslPostproductionRuntime().run({
    productionId: 'HSL-VIDEO-EXAMPLE-001-KENNEY-SFX',
    executionPlanPath,
    intakeManifestPath,
    narrationPath,
    outputDirectory
  });

  const contactSheetPath = path.join(outputDirectory, 'contact-sheet.png');
  const contactSheet = spawnSync('ffmpeg', [
    '-y', '-hide_banner', '-loglevel', 'error', '-i', postproduction.finalVideoPath,
    '-vf', 'fps=1/3,scale=640:-1,tile=3x2:padding=8:margin=8:color=0x0D0E15',
    '-frames:v', '1', contactSheetPath
  ], {encoding: 'utf8'});
  if (contactSheet.status !== 0) throw new Error(`HSL_SFX_REMIX_CONTACT_SHEET_FAILED:${contactSheet.stderr || ''}`);

  const sourceManifest = JSON.parse(fs.readFileSync(sourceManifestPath, 'utf8')) as Record<string, unknown>;
  const finalRenderManifest = JSON.parse(fs.readFileSync(postproduction.renderManifestPath, 'utf8')) as Record<string, unknown>;
  const soundFxPlan = JSON.parse(fs.readFileSync(postproduction.soundFxPlanPath, 'utf8')) as {cues?: unknown[]};
  const remixManifestPath = path.join(outputDirectory, 'kenney-sfx-remix-manifest.json');
  const remixManifest = {
    status: 'HSL_KENNEY_SFX_REMIX_COMPLETE',
    source_production_id: sourceManifest.production_id,
    source_firefly_jobs: sourceManifest.generated_jobs,
    source_intake_manifest_path: intakeManifestPath,
    source_narration_path: narrationPath,
    external_generation_reused: true,
    external_generation_dispatched: false,
    soundfx_provider: 'Kenney',
    soundfx_license: 'CC0-1.0',
    soundfx_cue_count: soundFxPlan.cues?.length || 0,
    soundfx_plan_path: postproduction.soundFxPlanPath,
    soundfx_bed_path: postproduction.soundFxBedPath,
    final_video_path: postproduction.finalVideoPath,
    final_render_manifest_path: postproduction.renderManifestPath,
    contact_sheet_path: contactSheetPath,
    final_render: finalRenderManifest,
    completed_at: new Date().toISOString()
  };
  writeJson(remixManifestPath, remixManifest);
  console.log(JSON.stringify({...remixManifest, remix_manifest_path: remixManifestPath}, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
