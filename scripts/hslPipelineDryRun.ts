import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import {CinematicDirectionShadowRunner} from '../hsl/cinematic/runners/cinematicDirectionShadowRunner';
import {HslEditorialRuntime} from '../hsl/editorial/editorialRuntime';
import {HslEpisodeSeed} from '../hsl/editorial/types/editorial';
import {CinematicExecutionCompiler} from '../hsl/execution/cinematicExecutionCompiler';
import {HslStartFrameRuntime} from '../hsl/startframe/startFrameRuntime';
import {HslFireflyGenerationRuntime} from '../production/hslFireflyGenerationRuntime';

function runId(): string {
  return `HSL-PIPELINE-DRYRUN-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}`;
}

function readSeed(seedPath: string | undefined): HslEpisodeSeed | undefined {
  if (!seedPath) return undefined;
  const resolved = path.resolve(seedPath);
  if (!fs.existsSync(resolved)) throw new Error(`HSL_DRY_RUN_SEED_NOT_FOUND:${resolved}`);
  return JSON.parse(fs.readFileSync(resolved, 'utf8')) as HslEpisodeSeed;
}

async function main(): Promise<void> {
  const productionId = process.env.HSL_DRY_RUN_ID || runId();
  const outputRoot = path.resolve(process.env.HSL_DRY_RUN_OUTPUT || path.join('runs', productionId));
  const seed = readSeed(process.env.HSL_EPISODE_SEED_PATH || process.argv[2]);
  const editorial = new HslEditorialRuntime().run(productionId, path.join(outputRoot, 'editorial'), seed);
  const cinematic = await new CinematicDirectionShadowRunner().run({
    productionId,
    editorialPackagePath: editorial.episodePackagePath
  });
  const execution = new CinematicExecutionCompiler().compile(editorial.episodePackagePath, cinematic);
  const result: Record<string, unknown> = {
    status: 'EXECUTION_PLAN_READY',
    production_id: productionId,
    output_root: outputRoot,
    episode_package_path: editorial.episodePackagePath,
    cinematic_episode_plan_path: cinematic.episodePlanPath,
    execution_plan_path: execution.executionPlanPath,
    executable_scene_count: execution.scenePaths.length,
    generated_scene_count: execution.generatedScenePaths.length,
    paid_firefly_dispatch: false
  };

  const framesDirectory = process.env.HSL_START_FRAME_SOURCE_DIR;
  const approvalManifest = process.env.HSL_START_FRAME_APPROVAL_MANIFEST;
  if (framesDirectory || approvalManifest) {
    if (!framesDirectory || !approvalManifest) throw new Error('HSL_START_FRAME_INPUTS_INCOMPLETE');
    const startFrames = new HslStartFrameRuntime().run({
      productionId,
      executionPlanPath: execution.executionPlanPath,
      sourceFramesDirectory: framesDirectory,
      approvalManifestPath: approvalManifest,
      outputDirectory: path.join(outputRoot, 'generation')
    });
    const prepared = new HslFireflyGenerationRuntime().prepare(startFrames.handoffs, path.join(outputRoot, 'firefly'));
    Object.assign(result, {
      status: 'FIREFLY_GUIDE_READY',
      start_frame_manifest_path: startFrames.startFrameManifestPath,
      motion_package_paths: startFrames.motionPackagePaths,
      firefly_guide_path: prepared.masterGuidePath,
      firefly_jobs: prepared.jobNames
    });
  }

  const manifestPath = path.join(outputRoot, 'dry-run-manifest.json');
  fs.mkdirSync(outputRoot, {recursive: true});
  fs.writeFileSync(manifestPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({...result, manifest_path: manifestPath}, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
