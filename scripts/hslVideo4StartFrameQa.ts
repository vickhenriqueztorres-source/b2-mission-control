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
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function renderContactSheets(items: Array<ShotPlanItem & {candidate_path: string}>, outputRoot: string): string[] {
  const tileWidth = 480;
  const tileHeight = 270;
  const columns = 4;
  const pageSize = 24;
  const paths: string[] = [];
  for (let offset = 0; offset < items.length; offset += pageSize) {
    const page = items.slice(offset, offset + pageSize);
    const inputs = page.flatMap((item) => ['-i', item.candidate_path]);
    const filters = page.map((item, index) => (
      `[${index}:v]scale=${tileWidth}:${tileHeight}:force_original_aspect_ratio=decrease,` +
      `pad=${tileWidth}:${tileHeight}:(ow-iw)/2:(oh-ih)/2:black,` +
      `drawtext=fontfile='C\\:/Windows/Fonts/arial.ttf':text='${item.shot_id}':x=14:y=14:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.72[v${index}]`
    ));
    const layout = page.map((_, index) => `${(index % columns) * tileWidth}_${Math.floor(index / columns) * tileHeight}`).join('|');
    const stack = `${page.map((_, index) => `[v${index}]`).join('')}xstack=inputs=${page.length}:layout=${layout}:fill=black[out]`;
    const pageNumber = String(paths.length + 1).padStart(2, '0');
    const outputPath = path.join(outputRoot, `contact-sheet-${pageNumber}.png`);
    const render = spawnSync('ffmpeg', [
      '-y', '-hide_banner', '-loglevel', 'error', ...inputs,
      '-filter_complex', `${filters.join(';')};${stack}`, '-map', '[out]', '-frames:v', '1', outputPath
    ], {encoding: 'utf8', maxBuffer: 1024 * 1024 * 20});
    if (render.status !== 0) throw new Error(`START_FRAME_CONTACT_SHEET_FAILED:${render.stderr || render.stdout || ''}`);
    paths.push(outputPath);
  }
  return paths;
}

function main(): void {
  const productionId = process.env.HSL_VIDEO_4_RUN_ID || 'HSL-VIDEO-004';
  const outputRoot = path.resolve(process.env.HSL_VIDEO_4_OUTPUT || path.join('runs', productionId));
  const candidatesRoot = path.join(outputRoot, 'start-frame-candidates');
  const planPath = path.join(candidatesRoot, 'start-frame-shot-plan.json');
  const plan = JSON.parse(fs.readFileSync(planPath, 'utf8')) as {episode_id: string; items: ShotPlanItem[]};
  const qa = new StartFrameQaAgent();
  const items = plan.items.map((item) => {
    const candidatePath = item.candidate_path || path.join(candidatesRoot, `${item.shot_id}.png`);
    const validation = qa.validate(candidatePath);
    return {...item, candidate_path: candidatePath, ...validation, status: 'START_FRAME_QA_PASS'};
  });
  const duplicateHashCount = items.length - new Set(items.map((item) => item.sha256)).size;
  if (duplicateHashCount > 0) throw new Error(`HSL_VIDEO_4_DUPLICATE_START_FRAME_HASH:${duplicateHashCount}`);
  const contactSheetPaths = renderContactSheets(items, candidatesRoot);
  const manifestPath = path.join(candidatesRoot, 'start-frame-technical-qa.json');
  writeJson(manifestPath, {
    schema: 'hsl.video-4.start-frame.technical-qa.v1',
    schema_version: '1.0.0',
    episode_id: plan.episode_id,
    production_id: productionId,
    status: 'START_FRAME_SET_QA_PASS',
    item_count: items.length,
    duplicate_hash_count: duplicateHashCount,
    dimensions_consistent: new Set(items.map((item) => `${item.width}x${item.height}`)).size === 1,
    human_review_status: 'PENDING',
    contact_sheet_path: contactSheetPaths[0],
    contact_sheet_paths: contactSheetPaths,
    contact_sheet_page_size: 24,
    items
  });
  process.stdout.write(`${JSON.stringify({
    status: 'START_FRAME_SET_QA_PASS',
    item_count: items.length,
    qa_manifest_path: manifestPath,
    contact_sheet_paths: contactSheetPaths,
    human_review_status: 'PENDING'
  }, null, 2)}\n`);
}

main();
