import fs from 'fs';
import path from 'path';
import {execFileSync} from 'child_process';
import Database from 'better-sqlite3';

type GuideItem = {
  name: string;
  image: string;
  prompt: string;
  model: 'Kling 3.0' | 'Veo 3.1 Fast' | 'Veo 3.1' | 'Firefly Video';
  resolution: string;
  aspect_ratio: string;
  duration_seconds: number;
  generate_audio: boolean;
  [key: string]: unknown;
};

type JobRow = {
  id: number;
  status: string;
  model: string;
  resolution: string;
  output_path: string | null;
  error: string | null;
};

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function main(): void {
  const productionId = process.env.HSL_VIDEO_3_RUN_ID || 'HSL-VIDEO-003-RECREATE';
  const runRoot = path.resolve(process.env.HSL_VIDEO_3_OUTPUT || path.join('runs', productionId));
  const fireflyRoot = path.resolve(process.env.FIREFLY_AUTOMATION_ROOT || 'C:\\B2-AI-STUDIO\\links\\firefly-automation');
  const dbPath = path.join(fireflyRoot, 'data', 'firefly_jobs.db');
  const python = path.join(fireflyRoot, '.venv', 'Scripts', 'python.exe');
  const guidePath = path.join(runRoot, 'firefly', 'firefly-production-guide.json');
  const guide = JSON.parse(fs.readFileSync(guidePath, 'utf8')) as {items: GuideItem[]; [key: string]: unknown};
  const db = new Database(dbPath);
  const latest = db.prepare('SELECT id, status, model, resolution, output_path, error FROM jobs WHERE name = ? ORDER BY id DESC LIMIT 1');
  const updateExistingJob = db.prepare(`
    UPDATE jobs
    SET status = 'pending',
        attempts = 0,
        model = ?,
        resolution = ?,
        duration_seconds = ?,
        generate_audio = ?,
        error = ?,
        claimed_at = NULL,
        generation_started_at = NULL,
        output_path = NULL,
        download_started_at = NULL,
        download_completed_at = NULL,
        media_validated_at = NULL,
        media_validation_status = NULL,
        media_validation_error = NULL,
        file_size_bytes = NULL,
        sha256 = NULL,
        width = NULL,
        height = NULL,
        codec = NULL,
        updated_at = strftime('%s', 'now')
    WHERE id = ?
  `);

  const retryItems: GuideItem[] = [];
  const targetModel = (process.env.HSL_VIDEO_3_PROVIDER_FALLBACK_MODEL || 'Veo 3.1 Fast') as 'Veo 3.1 Fast' | 'Veo 3.1' | 'Firefly Video';
  if (!['Veo 3.1 Fast', 'Veo 3.1', 'Firefly Video'].includes(targetModel)) throw new Error(`HSL_VIDEO_3_PROVIDER_FALLBACK_MODEL_INVALID:${targetModel}`);
  const targetDuration = targetModel === 'Firefly Video' ? 5 : 4;
  const targetResolution = process.env.HSL_VIDEO_3_PROVIDER_FALLBACK_RESOLUTION || (targetModel === 'Firefly Video' ? '1080p' : '720p');
  if (!['720p', '1080p'].includes(targetResolution)) throw new Error(`HSL_VIDEO_3_PROVIDER_FALLBACK_RESOLUTION_INVALID:${targetResolution}`);
  const reroutes: Array<{job_name: string; model: 'Veo 3.1 Fast' | 'Veo 3.1' | 'Firefly Video'; generate_audio: boolean; duration_seconds: number; resolution: string; reason: string}> = [];
  let preservedDone = 0;
  let preservedActive = 0;
  let updatedExisting = 0;

  for (const item of guide.items) {
    const row = latest.get(item.name) as JobRow | undefined;
    if (row?.status === 'done' && row.output_path && fs.existsSync(row.output_path) && row.model === targetModel && row.resolution === targetResolution) {
      preservedDone += 1;
      continue;
    }
    const originalModel = item.model;
    const providerAudio = targetModel === 'Firefly Video' ? false : Boolean(item.generate_audio);
    const retryItem: GuideItem = {
      ...item,
      model: targetModel,
      resolution: targetResolution,
      duration_seconds: targetDuration,
      generate_audio: providerAudio,
      prompt: String(item.prompt || '')
        .replace(/(?:10|8|5|4)-second/g, `${targetDuration}-second`)
        .replace(/(?:10|8|5|4) seconds/g, `${targetDuration} seconds`)
    };
    if (row) {
      updateExistingJob.run(
        targetModel,
        targetResolution,
        targetDuration,
        Number(providerAudio),
        `rerouted to ${targetModel} after provider model tests`,
        row.id
      );
      updatedExisting += 1;
      if (['pending', 'claimed', 'generating', 'stale_generating'].includes(row.status)) preservedActive += 1;
    } else {
      retryItems.push(retryItem);
    }
    reroutes.push({
      job_name: item.name,
      model: targetModel,
      generate_audio: providerAudio,
      duration_seconds: targetDuration,
      resolution: targetResolution,
      reason: targetModel === 'Firefly Video'
        ? 'FIREFLY_VIDEO_CANARY_PASS_PARTNER_MODELS_408'
        : originalModel === 'Kling 3.0'
          ? 'KLING_3_PROVIDER_DEGRADED_CANARY_ERROR_TOAST'
          : 'VEO_RETRY_AFTER_STATE_READER_POLLING_FIX'
    });
  }

  const retryGuidePath = path.join(runRoot, 'firefly', 'video-3-provider-retry-guide.json');
  writeJson(retryGuidePath, {
    schema: 'hsl.firefly.provider-retry-guide.v1',
    schema_version: '1.0.0',
    production_id: productionId,
    provider_health_basis: {
      kling_3: 'DEGRADED_ERROR_TOAST',
      veo_3_1_fast: 'PARTNER_ENDPOINT_408_DURING_RETEST',
      firefly_video: 'CANARY_PASS'
    },
    model: targetModel,
    resolution: targetResolution,
    aspect_ratio: '16:9',
    duration_seconds: targetDuration,
    generate_audio: false,
    items: retryItems
  });
  writeJson(path.join(runRoot, 'firefly', 'video-3-provider-reroutes.json'), {
    schema: 'hsl.video-3.provider-reroutes.v1',
    schema_version: '1.0.0',
    production_id: productionId,
    status: 'ACTIVE',
    generated_at: new Date().toISOString(),
    items: reroutes
  });

  if (retryItems.length > 0) {
    execFileSync(python, ['-m', 'firefly_bot.main', '--feed-guide', retryGuidePath], {
      cwd: fireflyRoot,
      stdio: 'inherit'
    });
  }
  db.prepare("UPDATE system_state SET status = 'running', reason = NULL WHERE singleton = 1").run();
  db.close();

  const summary = {
    status: 'VIDEO_3_PROVIDER_RESUME_READY',
    production_id: productionId,
    preserved_done: preservedDone,
    preserved_active: preservedActive,
    updated_existing_pending: updatedExisting,
    enqueued_retry_count: retryItems.length,
    rerouted_provider_count: reroutes.length,
    rerouted_model: targetModel,
    rerouted_resolution: targetResolution,
    retry_guide_path: retryGuidePath
  };
  writeJson(path.join(runRoot, 'firefly', 'video-3-provider-resume.json'), summary);
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

main();
