import path from 'path';
import {HslPublicationPackagingRuntime} from '../hsl/postproduction/publicationPackagingRuntime';

function main(): void {
  const productionId = process.env.HSL_VIDEO_1_RUN_ID || 'HSL-VIDEO-001-VEO-TEST';
  const runRoot = path.resolve(process.env.HSL_VIDEO_1_OUTPUT || process.argv[2] || path.join('runs', productionId));
  const frames = path.join(runRoot, 'start-frame-candidates');
  const result = new HslPublicationPackagingRuntime().run({
    productionId,
    episodePackagePath: path.join(runRoot, 'editorial', 'episode-package.json'),
    executionPlanPath: path.join(runRoot, 'editorial', 'execution', 'episode.execution.json'),
    finalVideoPath: path.join(runRoot, 'postproduction', 'HSL_FINAL_DOCUMENTARY.mp4'),
    finalRenderManifestPath: path.join(runRoot, 'postproduction', 'final-render-manifest.json'),
    outputDirectory: path.join(runRoot, 'postproduction', 'youtube-package'),
    baseImages: {
      A: path.join(frames, 'HSL_002_V02.png'),
      B: path.join(frames, 'HSL_044_V02.png'),
      C: path.join(frames, 'HSL_028_V02.png')
    },
    headlineOverrides: {A: 'BEFORE TAKEOFF', B: 'ONE WEAK LINK', C: 'BENEATH THE RUNWAY'},
    recommendedThumbnailVariant: 'C',
    recommendedTitle: 'The Hidden System That Keeps Planes Flying'
  });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
}
