import 'dotenv/config';
import path from 'path';
import {CinematicDirectionShadowRunner} from '../hsl/cinematic/runners/cinematicDirectionShadowRunner';
import {HSL_VIDEO_1_EPISODE_SEED} from '../hsl/editorial/config/video1EpisodeSeed';
import {HslEditorialRuntime} from '../hsl/editorial/editorialRuntime';
import {CinematicExecutionCompiler} from '../hsl/execution/cinematicExecutionCompiler';

async function main(): Promise<void> {
  process.env.HSL_NARRATION_WPM = process.env.HSL_VIDEO_1_NARRATION_WPM || '157.7';
  const productionId = process.env.HSL_VIDEO_1_RUN_ID || 'HSL-VIDEO-001';
  const outputRoot = path.resolve(process.env.HSL_VIDEO_1_OUTPUT || path.join('runs', productionId));
  const editorial = new HslEditorialRuntime().run(
    productionId,
    path.join(outputRoot, 'editorial'),
    HSL_VIDEO_1_EPISODE_SEED
  );
  const cinematic = await new CinematicDirectionShadowRunner().run({
    productionId,
    editorialPackagePath: editorial.episodePackagePath
  });
  const execution = new CinematicExecutionCompiler().compile(editorial.episodePackagePath, cinematic);
  process.stdout.write(`${JSON.stringify({
    status: 'VIDEO_1_PREPRODUCTION_READY',
    production_id: productionId,
    episode_package_path: editorial.episodePackagePath,
    cinematic_episode_plan_path: cinematic.episodePlanPath,
    execution_plan_path: execution.executionPlanPath,
    visual_coverage_report_path: execution.visualCoverageReportPath,
    scene_count: execution.scenePaths.length,
    visual_shot_count: execution.totalVisualShots,
    generated_scene_count: execution.generatedScenePaths.length,
    generated_shot_count: execution.generatedShotIds.length
  }, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
