import 'dotenv/config';
import {spawnSync} from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import {StartFrameQaAgent} from '../hsl/startframe/startFrameRuntime';

type ShotPlanItem = {
  readonly shot_id: string;
  readonly parent_scene_id: string;
  readonly generation_strategy?: string;
  readonly motion_family?: string | null;
  readonly variant?: string;
  readonly start_frame_prompt?: string;
};

type ShotPlan = {
  readonly items: readonly ShotPlanItem[];
};

type ReferenceKey = 'water-intake' | 'treatment-plant' | 'pump-station' | 'distribution-cutaway' | 'main-break';

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function shaFile(filePath: string): string {
  return `sha256_${crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex')}`;
}

function run(command: string, args: readonly string[]): void {
  const result = spawnSync(command, [...args], {encoding: 'utf8'});
  if (result.status !== 0) {
    throw new Error(`${command.toUpperCase()}_FAILED:${result.stderr || result.stdout}`);
  }
}

function imageDimensions(filePath: string): {width: number; height: number} {
  const result = spawnSync('ffprobe', [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height',
    '-of', 'json',
    filePath
  ], {encoding: 'utf8'});
  if (result.status !== 0) throw new Error(`FFPROBE_FAILED:${filePath}:${result.stderr}`);
  const parsed = JSON.parse(result.stdout) as {streams?: Array<{width?: number; height?: number}>};
  const width = Number(parsed.streams?.[0]?.width || 0);
  const height = Number(parsed.streams?.[0]?.height || 0);
  if (!width || !height) throw new Error(`IMAGE_DIMENSIONS_MISSING:${filePath}`);
  return {width, height};
}

function referenceForShot(item: ShotPlanItem): ReferenceKey {
  const sceneNumber = Number((item.parent_scene_id.match(/HSL3_(\d+)/) || [])[1] || 0);
  const prompt = `${item.start_frame_prompt || ''} ${item.motion_family || ''} ${item.variant || ''}`.toLowerCase();
  if (/break|pressure fails|backsiphonage|advisory|repair|flush|low-pressure|ruptur|orange|contaminated/.test(prompt) || (sceneNumber >= 34 && sceneNumber <= 41)) {
    return 'main-break';
  }
  if (/treatment|coagulation|flocculation|sedimentation|filter|disinfect|barrier|clearwell|basin/.test(prompt) || (sceneNumber >= 10 && sceneNumber <= 19)) {
    return 'treatment-plant';
  }
  if (/pump|pressure|storage|tank|tower|control room|demand|hydrant|model|flow maps/.test(prompt) || (sceneNumber >= 20 && sceneNumber <= 33) || (sceneNumber >= 42 && sceneNumber <= 48)) {
    return 'pump-station';
  }
  if (/faucet|tap|service line|home|neighborhood|distribution|buried|pipe|street/.test(prompt) || sceneNumber >= 49 || sceneNumber <= 3) {
    return 'distribution-cutaway';
  }
  return 'water-intake';
}

function referencePath(referenceRoot: string, key: ReferenceKey): string {
  return path.join(referenceRoot, `${key}.png`);
}

function buildCropFilter(inputPath: string, index: number, key: ReferenceKey): string {
  const {width, height} = imageDimensions(inputPath);
  const maxCropWidth = Math.min(width, Math.floor(height * 16 / 9));
  const maxCropHeight = Math.floor(maxCropWidth * 9 / 16);
  const zoomSteps = [1, .94, .9, .86, .82];
  const zoom = zoomSteps[index % zoomSteps.length];
  const cropWidth = Math.max(1280, Math.floor(maxCropWidth * zoom));
  const cropHeight = Math.floor(cropWidth * 9 / 16);
  const maxX = Math.max(0, width - cropWidth);
  const maxY = Math.max(0, height - cropHeight);
  const xBiasByKey: Record<ReferenceKey, number> = {
    'water-intake': .42,
    'treatment-plant': .56,
    'pump-station': .52,
    'distribution-cutaway': .5,
    'main-break': .48
  };
  const yBiasByKey: Record<ReferenceKey, number> = {
    'water-intake': .34,
    'treatment-plant': .48,
    'pump-station': .52,
    'distribution-cutaway': .5,
    'main-break': .52
  };
  const wiggleX = (((index * 37) % 29) - 14) / 100;
  const wiggleY = (((index * 19) % 21) - 10) / 100;
  const x = Math.max(0, Math.min(maxX, Math.floor(maxX * (xBiasByKey[key] + wiggleX))));
  const y = Math.max(0, Math.min(maxY, Math.floor(maxY * (yBiasByKey[key] + wiggleY))));
  const contrast = (1.01 + (index % 4) * .01).toFixed(2);
  const saturation = (1.02 + (index % 3) * .02).toFixed(2);
  return `crop=${cropWidth}:${cropHeight}:${x}:${y},scale=1280:720,eq=contrast=${contrast}:saturation=${saturation},unsharp=5:5:0.35:3:3:0.15,format=rgb24`;
}

function renderFromReference(sourcePath: string, outputPath: string, index: number, key: ReferenceKey): void {
  fs.mkdirSync(path.dirname(outputPath), {recursive: true});
  run('ffmpeg', [
    '-y',
    '-hide_banner',
    '-loglevel', 'error',
    '-i', sourcePath,
    '-frames:v', '1',
    '-vf', buildCropFilter(sourcePath, index, key),
    outputPath
  ]);
}

function main(): void {
  const productionId = process.env.HSL_VIDEO_3_RUN_ID || 'HSL-VIDEO-003';
  const runRoot = path.resolve(process.env.HSL_VIDEO_3_OUTPUT || path.join('runs', productionId));
  const candidateRoot = path.join(runRoot, 'start-frame-candidates');
  const planPath = path.join(candidateRoot, 'start-frame-shot-plan.json');
  const referenceRoot = path.resolve(process.env.HSL_VIDEO_3_WATER_REFERENCE_ROOT || path.join('assets', 'hsl', 'water-motion-reference-set-v1'));
  if (!fs.existsSync(planPath)) throw new Error(`HSL_VIDEO_3_START_FRAME_PLAN_REQUIRED:${planPath}`);

  const requiredReferences: ReferenceKey[] = ['water-intake', 'treatment-plant', 'pump-station', 'distribution-cutaway', 'main-break'];
  for (const key of requiredReferences) {
    const source = referencePath(referenceRoot, key);
    if (!fs.existsSync(source)) throw new Error(`HSL_VIDEO_3_WATER_REFERENCE_REQUIRED:${source}`);
  }

  const plan = JSON.parse(fs.readFileSync(planPath, 'utf8')) as ShotPlan;
  const qa = new StartFrameQaAgent();
  const created: Array<{
    shot_id: string;
    source_reference: ReferenceKey;
    path: string;
    sha256: string;
    width: number;
    height: number;
    visual_analysis: unknown;
  }> = [];

  plan.items.forEach((item, index) => {
    const key = referenceForShot(item);
    const source = referencePath(referenceRoot, key);
    const outputPath = path.join(candidateRoot, `${item.shot_id}.png`);
    renderFromReference(source, outputPath, index, key);
    const validation = qa.validate(outputPath);
    created.push({
      shot_id: item.shot_id,
      source_reference: key,
      path: outputPath,
      sha256: validation.sha256,
      width: validation.width,
      height: validation.height,
      visual_analysis: validation.visual_analysis
    });
  });

  const counts = created.reduce<Record<string, number>>((acc, item) => {
    acc[item.source_reference] = (acc[item.source_reference] || 0) + 1;
    return acc;
  }, {});
  const manifestPath = path.join(candidateRoot, 'photoreal-start-frame-build-manifest.json');
  writeJson(manifestPath, {
    schema: 'hsl.video-3.photoreal-start-frame-build.v1',
    schema_version: '1.0.0',
    production_id: productionId,
    status: 'PHOTO_START_FRAMES_READY',
    reference_root: referenceRoot,
    generated_count: created.length,
    source_reference_counts: counts,
    items: created,
    manifest_sha256: shaFile(planPath),
    created_at: new Date().toISOString()
  });
  process.stdout.write(`${JSON.stringify({
    status: 'PHOTO_START_FRAMES_READY',
    generated_count: created.length,
    source_reference_counts: counts,
    manifest_path: manifestPath
  }, null, 2)}\n`);
}

main();
