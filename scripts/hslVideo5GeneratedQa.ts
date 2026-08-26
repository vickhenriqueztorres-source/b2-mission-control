import fs from 'fs';
import path from 'path';
import {spawnSync} from 'child_process';
import {HslGeneratedAssetIntakeManifest} from '../production-bridge/fireflyToIntake';
import {HslExecutableScene, HslExecutionPlan} from '../hsl/execution/types/execution';

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function usesLocalProxy(value: unknown): boolean {
  return typeof value === 'string' && /local-proxy|LOCAL_PROXY|LOCAL_PROXY_NO_PAID_PROVIDER/i.test(value);
}

function renderContactSheets(items: HslGeneratedAssetIntakeManifest['items'], outputRoot: string): {paths: string[]; errors: string[]} {
  const tileWidth = 384;
  const tileHeight = 216;
  const columns = 5;
  const pageSize = 25;
  const paths: string[] = [];
  const errors: string[] = [];
  for (let offset = 0; offset < items.length; offset += pageSize) {
    const page = items.slice(offset, offset + pageSize);
    const inputs = page.flatMap((item) => ['-ss', '2', '-i', item.video_path]);
    const filters = page.map((item, index) => (
      `[${index}:v]scale=${tileWidth}:${tileHeight}:force_original_aspect_ratio=decrease,` +
      `pad=${tileWidth}:${tileHeight}:(ow-iw)/2:(oh-ih)/2:black,` +
      `drawtext=fontfile='C\\:/Windows/Fonts/arial.ttf':text='${item.shot_id}':x=10:y=10:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.72[v${index}]`
    ));
    const layout = page.map((_, index) => `${(index % columns) * tileWidth}_${Math.floor(index / columns) * tileHeight}`).join('|');
    const stack = `${page.map((_, index) => `[v${index}]`).join('')}xstack=inputs=${page.length}:layout=${layout}:fill=black[out]`;
    const pageNumber = String(paths.length + 1).padStart(2, '0');
    const outputPath = path.join(outputRoot, `generated-video-contact-sheet-${pageNumber}.png`);
    const render = spawnSync('ffmpeg', [
      '-y', '-hide_banner', '-loglevel', 'error', ...inputs,
      '-filter_complex', `${filters.join(';')};${stack}`, '-map', '[out]', '-frames:v', '1', outputPath
    ], {encoding: 'utf8', maxBuffer: 1024 * 1024 * 30});
    if (render.status !== 0) errors.push(`CONTACT_SHEET_PAGE_${pageNumber}:${render.stderr || render.stdout || ''}`);
    else paths.push(outputPath);
  }
  return {paths, errors};
}

function main(): void {
  const productionId = process.env.HSL_VIDEO_5_RUN_ID || 'HSL-VIDEO-005';
  const runRoot = path.resolve(process.env.HSL_VIDEO_5_OUTPUT || path.join('runs', productionId));
  const intakePath = path.join(runRoot, 'HSL_VIDEO_5_asset_intake.json');
  const intake = JSON.parse(fs.readFileSync(intakePath, 'utf8')) as HslGeneratedAssetIntakeManifest;
  const dispatchResultPath = path.join(runRoot, 'firefly', 'dispatch-result.json');
  const dispatchResult = fs.existsSync(dispatchResultPath)
    ? JSON.parse(fs.readFileSync(dispatchResultPath, 'utf8')) as Record<string, unknown>
    : null;
  const executionPath = path.join(runRoot, 'editorial', 'execution', 'episode.execution.json');
  const executionPlan = JSON.parse(fs.readFileSync(executionPath, 'utf8')) as HslExecutionPlan;
  const executionRoot = path.dirname(executionPath);
  const scenes = executionPlan.scenes.map((relative) => JSON.parse(fs.readFileSync(path.resolve(executionRoot, relative), 'utf8')) as HslExecutableScene);
  const expected = new Set(scenes.flatMap((scene) => scene.visual_shots).filter((shot) => shot.visual_mode === 'generated_ai').map((shot) => shot.shot_id));
  const errors: string[] = [];
  if (!dispatchResult) {
    errors.push('DISPATCH_RESULT_MISSING');
  } else {
    if (usesLocalProxy(dispatchResult.status)) errors.push(`LOCAL_PROXY_DISPATCH_STATUS:${dispatchResult.status}`);
    if (usesLocalProxy(dispatchResult.dispatch_mode)) errors.push(`LOCAL_PROXY_DISPATCH_MODE:${dispatchResult.dispatch_mode}`);
    const completedJobs = Array.isArray(dispatchResult.completed_jobs) ? dispatchResult.completed_jobs : [];
    for (const job of completedJobs) {
      if (job && typeof job === 'object' && usesLocalProxy((job as {output_path?: unknown}).output_path)) {
        errors.push(`LOCAL_PROXY_DISPATCH_OUTPUT:${(job as {job_name?: unknown}).job_name || 'UNKNOWN_JOB'}`);
      }
    }
  }
  const intakeIds = new Set(intake.items.map((item) => item.shot_id));
  if (intake.items.length !== expected.size) errors.push(`ITEM_COUNT:${intake.items.length}:EXPECTED:${expected.size}`);
  for (const shotId of expected) if (!intakeIds.has(shotId)) errors.push(`EXPECTED_SHOT_MISSING:${shotId}`);
  for (const item of intake.items) {
    if (!expected.has(item.shot_id)) errors.push(`UNPLANNED_SHOT:${item.shot_id}`);
    if (item.model !== 'Firefly Video') errors.push(`MODEL_MISMATCH:${item.shot_id}:${item.model}:EXPECTED:Firefly Video`);
    if (usesLocalProxy(item.video_path)) errors.push(`LOCAL_PROXY_VIDEO_FORBIDDEN:${item.shot_id}`);
    if (!fs.existsSync(item.video_path)) errors.push(`VIDEO_MISSING:${item.shot_id}`);
    if (item.width < 960 || item.height < 540) errors.push(`RESOLUTION_TOO_LOW:${item.shot_id}:${item.width}x${item.height}`);
    if (item.observed_duration_seconds < 3.5) errors.push(`DURATION:${item.shot_id}:${item.observed_duration_seconds}`);
    if (item.model !== 'Firefly Video' && item.visual_qa.first_frame_fidelity !== 'FIRST_FRAME_FIDELITY_PASS') {
      errors.push(`FIRST_FRAME_FIDELITY:${item.shot_id}`);
    }
  }
  const contactSheets = renderContactSheets(intake.items, path.join(runRoot, 'firefly'));
  errors.push(...contactSheets.errors);
  const status = errors.length ? 'GENERATED_VIDEO_QA_FAIL' : 'GENERATED_VIDEO_QA_PASS';
  const qaPath = path.join(runRoot, 'firefly', 'generated-video-qa.json');
  writeJson(qaPath, {
    schema: 'hsl.video-5.generated-video-qa.v1',
    production_id: productionId,
    status,
    item_count: intake.items.length,
    expected_item_count: expected.size,
    model_counts: intake.items.reduce<Record<string, number>>((counts, item) => {
      counts[item.model] = (counts[item.model] || 0) + 1;
      return counts;
    }, {}),
    native_audio_counts: intake.items.reduce<Record<string, number>>((counts, item) => {
      counts[item.native_audio_status] = (counts[item.native_audio_status] || 0) + 1;
      return counts;
    }, {}),
    contact_sheet_path: contactSheets.paths[0] || null,
    contact_sheet_paths: contactSheets.paths,
    contact_sheet_page_size: 25,
    errors,
    items: intake.items.map((item) => ({
      shot_id: item.shot_id,
      model: item.model,
      duration_seconds: item.observed_duration_seconds,
      dimensions: `${item.width}x${item.height}`,
      fps: item.fps,
      first_frame_ssim: item.visual_qa.first_frame_ssim,
      native_audio_status: item.native_audio_status,
      sha256: item.sha256
    }))
  });
  if (errors.length) throw new Error(`${status}:${errors.join(',')}`);
  process.stdout.write(`${JSON.stringify({status, item_count: intake.items.length, qa_path: qaPath, contact_sheet_paths: contactSheets.paths}, null, 2)}\n`);
}

main();
