import fs from 'fs';
import path from 'path';
import {HslPublicationPackagingRuntime} from '../hsl/postproduction/publicationPackagingRuntime';

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function main(): void {
  const productionId = process.env.HSL_VIDEO_5_RUN_ID || 'HSL-VIDEO-005';
  const runRoot = path.resolve(process.env.HSL_VIDEO_5_OUTPUT || process.argv[2] || path.join('runs', productionId));
  const frames = path.join(runRoot, 'start-frame-candidates');
  const result = new HslPublicationPackagingRuntime().run({
    productionId,
    episodePackagePath: path.join(runRoot, 'editorial', 'episode-package.json'),
    executionPlanPath: path.join(runRoot, 'editorial', 'execution', 'episode.execution.json'),
    finalVideoPath: path.join(runRoot, 'postproduction', 'HSL_FINAL_DOCUMENTARY.mp4'),
    finalRenderManifestPath: path.join(runRoot, 'postproduction', 'final-render-manifest.json'),
    outputDirectory: path.join(runRoot, 'postproduction', 'youtube-package'),
    baseImages: {
      A: path.join(frames, 'HSL5_001_V01.png'),
      B: path.join(frames, 'HSL5_009_V01.png'),
      C: path.join(frames, 'HSL5_022_V01.png')
    },
    headlineOverrides: {A: 'UNDER THE STREET', B: 'WHEN DRAINS FAIL', C: 'ONE BLOCKED GRATE'},
    titleOverrides: {
      A: 'The Invisible System That Keeps a City from Flooding',
      B: 'What Happens Underground When a City Floods',
      C: 'How One Blocked Drain Can Flood an Entire Street'
    },
    recommendedThumbnailVariant: 'A',
    recommendedTitle: 'The Invisible System That Keeps a City from Flooding'
  });
  const recommendation = {
    schema: 'hsl.video-5.publication-recommendation.v1',
    production_id: productionId,
    recommended_selection: {
      title: 'The Invisible System That Keeps a City from Flooding',
      thumbnail_variant: 'A',
      thumbnail_headline: 'UNDER THE STREET'
    },
    alternatives: [
      {variant: 'B', title: 'What Happens Underground When a City Floods', thumbnail_headline: 'WHEN DRAINS FAIL'},
      {variant: 'C', title: 'How One Blocked Drain Can Flood an Entire Street', thumbnail_headline: 'ONE BLOCKED GRATE'}
    ],
    saved_at: new Date().toISOString()
  };
  writeJson(path.join(runRoot, 'postproduction', 'youtube-package', 'publication-recommendation.json'), recommendation);
  fs.writeFileSync(path.join(runRoot, 'postproduction', 'youtube-package', 'publication-summary.md'), [
    '# HSL Video 5 Publication Summary',
    '',
    'Titulo principal recomendado: The Invisible System That Keeps a City from Flooding',
    'Thumbnail recomendada: A - UNDER THE STREET',
    'Combinacao inicial: The Invisible System That Keeps a City from Flooding + thumbnail A',
    '',
    '- A: The Invisible System That Keeps a City from Flooding + UNDER THE STREET',
    '- B: What Happens Underground When a City Floods + WHEN DRAINS FAIL',
    '- C: How One Blocked Drain Can Flood an Entire Street + ONE BLOCKED GRATE',
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
