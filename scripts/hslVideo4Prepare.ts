import 'dotenv/config';
import path from 'path';
import {CinematicDirectionShadowRunner} from '../hsl/cinematic/runners/cinematicDirectionShadowRunner';
import {HSL_VIDEO_4_EPISODE_SEED} from '../hsl/editorial/config/video4EpisodeSeed';
import {HslEditorialRuntime} from '../hsl/editorial/editorialRuntime';
import {CinematicExecutionCompiler} from '../hsl/execution/cinematicExecutionCompiler';

async function main(): Promise<void> {
  process.env.HSL_NARRATION_WPM = process.env.HSL_VIDEO_4_NARRATION_WPM || '157.7';
  process.env.HSL_VISUAL_CADENCE_SECONDS = process.env.HSL_VISUAL_CADENCE_SECONDS || '5.9';
  process.env.HSL_GENERATED_SHOTS_PER_SCENE = process.env.HSL_GENERATED_SHOTS_PER_SCENE || '2';
  process.env.HSL_PREMIUM_MOTION_SHOTS = process.env.HSL_PREMIUM_MOTION_SHOTS || 'HSL4_001_V03,HSL4_004_V03,HSL4_007_V03,HSL4_011_V03,HSL4_015_V03,HSL4_019_V03';
  process.env.HSL_MIN_GENERATED_COVERAGE_RATIO = process.env.HSL_MIN_GENERATED_COVERAGE_RATIO || '0.7';
  process.env.HSL_MAX_REMOTION_COVERAGE_RATIO = process.env.HSL_MAX_REMOTION_COVERAGE_RATIO || '0.22';
  const productionId = process.env.HSL_VIDEO_4_RUN_ID || 'HSL-VIDEO-004';
  const outputRoot = path.resolve(process.env.HSL_VIDEO_4_OUTPUT || path.join('runs', productionId));
  const editorial = new HslEditorialRuntime().run(
    productionId,
    path.join(outputRoot, 'editorial'),
    HSL_VIDEO_4_EPISODE_SEED
  );
  const cinematic = await new CinematicDirectionShadowRunner().run({
    productionId,
    editorialPackagePath: editorial.episodePackagePath
  });
  const execution = new CinematicExecutionCompiler().compile(editorial.episodePackagePath, cinematic);
  process.stdout.write(`${JSON.stringify({
    status: 'VIDEO_4_PREPRODUCTION_READY',
    production_id: productionId,
    episode_package_path: editorial.episodePackagePath,
    cinematic_episode_plan_path: cinematic.episodePlanPath,
    execution_plan_path: execution.executionPlanPath,
    visual_coverage_report_path: execution.visualCoverageReportPath,
    scene_count: execution.scenePaths.length,
    visual_shot_count: execution.totalVisualShots,
    generated_scene_count: execution.generatedScenePaths.length,
    generated_shot_count: execution.generatedShotIds.length,
    paid_generation_started: false
  }, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
