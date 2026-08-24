import {spawnSync} from 'child_process';
import fs from 'fs';
import path from 'path';
import {StartFrameQaAgent} from '../hsl/startframe/startFrameRuntime';

interface ShotPlanItem {
  readonly shot_id: string;
  readonly parent_scene_id: string;
  readonly variant: string;
  readonly candidate_path: string | null;
}

function writeJson(filePath: string, value: unknown): void {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function main(): void {
  const productionId = process.env.HSL_VIDEO_1_RUN_ID || 'HSL-VIDEO-001';
  const outputRoot = path.resolve(process.env.HSL_VIDEO_1_OUTPUT || path.join('runs', productionId));
  const candidatesRoot = path.join(outputRoot, 'start-frame-candidates');
  const planPath = path.join(candidatesRoot, 'start-frame-shot-plan.json');
  const plan = JSON.parse(fs.readFileSync(planPath, 'utf8')) as {episode_id: string; items: ShotPlanItem[]};
  const qa = new StartFrameQaAgent();
  const items = plan.items.map((item) => {
    if (!item.candidate_path) throw new Error(`START_FRAME_REQUIRED:${item.shot_id}`);
    const validation = qa.validate(item.candidate_path);
    return {...item, candidate_path: item.candidate_path, ...validation, status: 'START_FRAME_QA_PASS'};
  });

  const tileWidth = 480;
  const tileHeight = 270;
  const columns = 4;
  const rows = Math.ceil(items.length / columns);
  const inputs = items.flatMap((item) => ['-i', item.candidate_path]);
  const filters = items.map((item, index) => (
    `[${index}:v]scale=${tileWidth}:${tileHeight}:force_original_aspect_ratio=decrease,` +
    `pad=${tileWidth}:${tileHeight}:(ow-iw)/2:(oh-ih)/2:black,` +
    `drawtext=fontfile='C\\:/Windows/Fonts/arial.ttf':text='${item.shot_id}':x=14:y=14:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.72[v${index}]`
  ));
  const layout = items.map((_, index) => `${(index % columns) * tileWidth}_${Math.floor(index / columns) * tileHeight}`).join('|');
  const stack = `${items.map((_, index) => `[v${index}]`).join('')}xstack=inputs=${items.length}:layout=${layout}:fill=black[out]`;
  const contactSheetPath = path.join(candidatesRoot, 'contact-sheet-24-shots.png');
  const render = spawnSync('ffmpeg', [
    '-y', '-hide_banner', '-loglevel', 'error', ...inputs,
    '-filter_complex', `${filters.join(';')};${stack}`, '-map', '[out]', '-frames:v', '1', contactSheetPath
  ], {encoding: 'utf8', maxBuffer: 1024 * 1024 * 20});
  if (render.status !== 0) throw new Error(`START_FRAME_CONTACT_SHEET_FAILED:${render.stderr || render.stdout || ''}`);

  const manifestPath = path.join(candidatesRoot, 'start-frame-technical-qa.json');
  writeJson(manifestPath, {
    schema: 'hsl.start-frame.technical-qa.v1', schema_version: '1.0.0', episode_id: plan.episode_id,
    status: 'START_FRAME_SET_QA_PASS', item_count: items.length,
    dimensions_consistent: new Set(items.map((item) => `${item.width}x${item.height}`)).size === 1,
    human_review_status: 'PENDING', contact_sheet_path: contactSheetPath,
    contact_sheet_dimensions: {width: columns * tileWidth, height: rows * tileHeight}, items
  });
  process.stdout.write(`${JSON.stringify({status: 'START_FRAME_SET_QA_PASS', item_count: items.length, qa_manifest_path: manifestPath, contact_sheet_path: contactSheetPath, human_review_status: 'PENDING'}, null, 2)}\n`);
}

main();
