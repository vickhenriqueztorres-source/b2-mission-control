import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import {FireflyAdapter} from '../adapters/fireflyAdapter';
import {HslPostproductionRuntime} from '../hsl/postproduction/postproductionRuntime';
import {FireflyToIntakeBridge} from '../production-bridge/fireflyToIntake';
import {HslGenerationHandoff} from '../production-bridge/motionToFirefly';
import {HslFireflyGenerationRuntime} from '../production/hslFireflyGenerationRuntime';

async function main(): Promise<void> {
  const runRoot = path.resolve(process.argv[2] || path.join('runs', 'HSL-VIDEO-EXAMPLE-001'));
  const handoffPath = path.join(runRoot, 'generation', 'mission-control-handoffs.json');
  const executionPlanPath = path.join(runRoot, 'editorial', 'execution', 'episode.execution.json');
  if (!fs.existsSync(handoffPath) || !fs.existsSync(executionPlanPath)) throw new Error(`HSL_VIDEO_EXAMPLE_INPUTS_REQUIRED:${runRoot}`);
  const handoffSet = JSON.parse(fs.readFileSync(handoffPath, 'utf8')) as {handoffs: HslGenerationHandoff[]};
  const fireflyRuntime = new HslFireflyGenerationRuntime();
  const prepared = fireflyRuntime.prepare(handoffSet.handoffs, path.join(runRoot, 'firefly'));
  const adapter = new FireflyAdapter();
  await adapter.initialize();
  const generated = await fireflyRuntime.dispatch('HSL-VIDEO-EXAMPLE-001', prepared, adapter);
  const intakeManifestPath = path.join(runRoot, 'hsl_kling_asset_intake.json');
  FireflyToIntakeBridge.convert(
    'HSL-VIDEO-EXAMPLE-001',
    generated.completedJobs,
    intakeManifestPath,
    {...prepared.lineageByJobName}
  );
  const postproduction = await new HslPostproductionRuntime().run({
    productionId: 'HSL-VIDEO-EXAMPLE-001',
    executionPlanPath,
    intakeManifestPath,
    outputDirectory: path.join(runRoot, 'postproduction')
  });
  const manifest = {
    status: 'HSL_VIDEO_EXAMPLE_COMPLETE',
    production_id: 'HSL-VIDEO-EXAMPLE-001',
    firefly_guide_path: prepared.masterGuidePath,
    generated_jobs: generated.completedJobs,
    intake_manifest_path: intakeManifestPath,
    final_video_path: postproduction.finalVideoPath,
    final_render_manifest_path: postproduction.renderManifestPath,
    completed_at: new Date().toISOString()
  };
  const manifestPath = path.join(runRoot, 'video-example-manifest.json');
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({...manifest, manifest_path: manifestPath}, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
