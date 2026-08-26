import fs from 'fs';
import path from 'path';
import {HslPublicationPackagingRuntime} from '../hsl/postproduction/publicationPackagingRuntime';

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function main(): void {
  const productionId = process.env.HSL_VIDEO_4_RUN_ID || 'HSL-VIDEO-004';
  const runRoot = path.resolve(process.env.HSL_VIDEO_4_OUTPUT || process.argv[2] || path.join('runs', productionId));
  const frames = path.join(runRoot, 'start-frame-candidates');
  const result = new HslPublicationPackagingRuntime().run({
    productionId,
    episodePackagePath: path.join(runRoot, 'editorial', 'episode-package.json'),
    executionPlanPath: path.join(runRoot, 'editorial', 'execution', 'episode.execution.json'),
    finalVideoPath: path.join(runRoot, 'postproduction', 'HSL_FINAL_DOCUMENTARY.mp4'),
    finalRenderManifestPath: path.join(runRoot, 'postproduction', 'final-render-manifest.json'),
    outputDirectory: path.join(runRoot, 'postproduction', 'youtube-package'),
    baseImages: {
      A: path.join(frames, 'HSL4_001_V01.png'),
      B: path.join(frames, 'HSL4_012_V01.png'),
      C: path.join(frames, 'HSL4_022_V01.png')
    },
    headlineOverrides: {A: 'BEFORE WIFI', B: 'WHERE IT SLOWS', C: 'THE LAST HOP'},
    titleOverrides: {
      A: 'How the Internet Gets to Your House',
      B: 'The Hidden System That Makes Your Wi-Fi Work',
      C: 'Why Your Internet Slows Down Before It Reaches Your Router'
    },
    recommendedThumbnailVariant: 'A',
    recommendedTitle: 'How the Internet Gets to Your House'
  });
  const recommendation = {
    schema: 'hsl.video-4.publication-recommendation.v1',
    production_id: productionId,
    recommended_selection: {
      title: 'How the Internet Gets to Your House',
      thumbnail_variant: 'A',
      thumbnail_headline: 'BEFORE WIFI'
    },
    alternatives: [
      {variant: 'B', title: 'The Hidden System That Makes Your Wi-Fi Work', thumbnail_headline: 'WHERE IT SLOWS'},
      {variant: 'C', title: 'Why Your Internet Slows Down Before It Reaches Your Router', thumbnail_headline: 'THE LAST HOP'}
    ],
    saved_at: new Date().toISOString()
  };
  writeJson(path.join(runRoot, 'postproduction', 'youtube-package', 'publication-recommendation.json'), recommendation);
  fs.writeFileSync(path.join(runRoot, 'postproduction', 'youtube-package', 'publication-summary.md'), [
    '# HSL Video 4 Publication Summary',
    '',
    'Titulo principal recomendado: How the Internet Gets to Your House',
    'Thumbnail recomendada: A - BEFORE WIFI',
    'Combinacao inicial: How the Internet Gets to Your House + thumbnail A',
    '',
    '- A: How the Internet Gets to Your House + BEFORE WIFI',
    '- B: The Hidden System That Makes Your Wi-Fi Work + WHERE IT SLOWS',
    '- C: Why Your Internet Slows Down Before It Reaches Your Router + THE LAST HOP',
    ''
  ].join('\n'), 'utf8');
  process.stdout.write(`${JSON.stringify({...result, publication_recommendation_path: path.join(runRoot, 'postproduction', 'youtube-package', 'publication-recommendation.json')}, null, 2)}\n`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
}
