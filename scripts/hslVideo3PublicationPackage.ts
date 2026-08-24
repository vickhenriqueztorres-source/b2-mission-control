import path from 'path';
import {HslPublicationPackagingRuntime} from '../hsl/postproduction/publicationPackagingRuntime';

function main(): void {
  const productionId = process.env.HSL_VIDEO_3_RUN_ID || 'HSL-VIDEO-003';
  const runRoot = path.resolve(process.env.HSL_VIDEO_3_OUTPUT || process.argv[2] || path.join('runs', productionId));
  const frames = path.join(runRoot, 'start-frame-candidates');
  const result = new HslPublicationPackagingRuntime().run({
    productionId,
    episodePackagePath: path.join(runRoot, 'editorial', 'episode-package.json'),
    executionPlanPath: path.join(runRoot, 'editorial', 'execution', 'episode.execution.json'),
    finalVideoPath: path.join(runRoot, 'postproduction', 'HSL_FINAL_DOCUMENTARY.mp4'),
    finalRenderManifestPath: path.join(runRoot, 'postproduction', 'final-render-manifest.json'),
    outputDirectory: path.join(runRoot, 'postproduction', 'youtube-package'),
    baseImages: {
      A: path.join(frames, 'HSL3_001_V01.png'),
      B: path.join(frames, 'HSL3_026_V01.png'),
      C: path.join(frames, 'HSL3_034_V01.png')
    },
    headlineOverrides: {A: 'BEFORE THE TAP', B: 'UNDER YOUR STREET', C: 'PRESSURE FAILED'},
    titleOverrides: {
      A: 'The Hidden Journey of Water to Your Tap',
      B: 'What Really Happens Under Your Street When You Open the Tap',
      C: 'Why One Broken Pipe Can Put a Whole Neighborhood on Alert'
    },
    recommendedThumbnailVariant: 'A',
    recommendedTitle: 'The Hidden Journey of Water to Your Tap'
  });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
}
