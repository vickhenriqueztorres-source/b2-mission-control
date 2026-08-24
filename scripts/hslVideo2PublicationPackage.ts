import path from 'path';
import {HslPublicationPackagingRuntime} from '../hsl/postproduction/publicationPackagingRuntime';

function main(): void {
  const productionId = process.env.HSL_VIDEO_2_RUN_ID || 'HSL-VIDEO-002';
  const runRoot = path.resolve(process.env.HSL_VIDEO_2_OUTPUT || process.argv[2] || path.join('runs', productionId));
  const frames = path.join(runRoot, 'start-frame-candidates');
  const result = new HslPublicationPackagingRuntime().run({
    productionId,
    episodePackagePath: path.join(runRoot, 'editorial', 'episode-package.json'),
    executionPlanPath: path.join(runRoot, 'editorial', 'execution', 'episode.execution.json'),
    finalVideoPath: path.join(runRoot, 'postproduction', 'HSL_FINAL_DOCUMENTARY.mp4'),
    finalRenderManifestPath: path.join(runRoot, 'postproduction', 'final-render-manifest.json'),
    outputDirectory: path.join(runRoot, 'postproduction', 'youtube-package'),
    baseImages: {
      A: path.join(frames, 'HSL2_011_V01.png'),
      B: path.join(frames, 'HSL2_036_V01.png'),
      C: path.join(frames, 'HSL2_054_V01.png')
    },
    headlineOverrides: {A: 'THE OTHER ROUTE', B: 'LEFT BEHIND', C: 'THE SECOND JOURNEY'},
    recommendedThumbnailVariant: 'B',
    recommendedTitle: 'What Happens When Your Bag Misses Its Connection?'
  });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
}
