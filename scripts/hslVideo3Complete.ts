import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import {spawnSync} from 'child_process';

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function runStep(scriptName: string, env: NodeJS.ProcessEnv, runRoot: string): void {
  const startedAt = new Date().toISOString();
  const result = spawnSync('npm', ['run', scriptName], {
    cwd: process.cwd(),
    env,
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });
  const completedAt = new Date().toISOString();
  writeJson(path.join(runRoot, 'logs', `video-3-complete-${scriptName.replace(/[:/\\]/g, '-')}.json`), {
    schema: 'hsl.video-3.complete-step.v1',
    script: scriptName,
    status: result.status === 0 ? 'PASS' : 'FAIL',
    exit_code: result.status,
    signal: result.signal,
    started_at: startedAt,
    completed_at: completedAt
  });
  if (result.status !== 0) {
    throw new Error(`HSL_VIDEO_3_COMPLETE_STEP_FAILED:${scriptName}:${result.status}`);
  }
}

function main(): void {
  const productionId = process.env.HSL_VIDEO_3_RUN_ID || 'HSL-VIDEO-003-RECREATE';
  const runRoot = path.resolve(process.env.HSL_VIDEO_3_OUTPUT || path.join('runs', productionId));
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    HSL_VIDEO_3_RUN_ID: productionId,
    HSL_VIDEO_3_OUTPUT: runRoot,
    HSL_CONFIRMED_VIDEO_3_DISPATCH: 'true',
    HSL_ALLOW_PAID_FIREFLY_DISPATCH: 'true',
    FIREFLY_ALLOW_CREDIT_SPEND: 'true',
    FIREFLY_RESUME_EXISTING_BATCH: process.env.FIREFLY_RESUME_EXISTING_BATCH || 'true',
    FIREFLY_CONTINUE_ON_PROVIDER_ERROR: 'true',
    FIREFLY_CONTINUE_ON_FAILED_INFRA: 'true',
    FIREFLY_WORKER_CONCURRENCY: process.env.FIREFLY_WORKER_CONCURRENCY || '1',
    FIREFLY_MAX_WAIT_MINUTES: process.env.FIREFLY_MAX_WAIT_MINUTES || '1500',
    FIREFLY_GENERATION_BUDGET_MS: process.env.FIREFLY_GENERATION_BUDGET_MS || '1200000',
    FIREFLY_WATCHDOG_WALL_CLOCK_MS: process.env.FIREFLY_WATCHDOG_WALL_CLOCK_MS || '1350000',
    FIREFLY_PROVIDER_CAPACITY_MAX_ATTEMPTS: process.env.FIREFLY_PROVIDER_CAPACITY_MAX_ATTEMPTS || '12',
    FIREFLY_DIAG_DIR: process.env.FIREFLY_DIAG_DIR || path.join(runRoot, 'firefly', 'diagnostics'),
    HSL_FIREFLY_TARGET_RESOLUTION: process.env.HSL_FIREFLY_TARGET_RESOLUTION || '1080p',
    HSL_VIDEO_3_PROVIDER_FALLBACK_RESOLUTION: process.env.HSL_VIDEO_3_PROVIDER_FALLBACK_RESOLUTION || '1080p',
    HSL_SHOW_GLOBAL_OVERLAYS: 'false',
    HSL_SHOW_HYBRID_TEXT_OVERLAY: 'false'
  };
  const manifestPath = path.join(runRoot, 'video-3-complete-orchestration.json');
  writeJson(manifestPath, {
    schema: 'hsl.video-3.complete-orchestration.v1',
    production_id: productionId,
    status: 'RUNNING',
    run_root: runRoot,
    provider: 'Firefly',
    narration: {
      provider: env.HSL_NARRATION_PROVIDER,
      official_voice: env.HSL_OFFICIAL_VOICE_NAME,
      voicebox_preset: env.HSL_VOICEBOX_PRESET_VOICE_ID
    },
    overlays: {hsl_docs: false, ai_visualization: false, loading_line: false},
    started_at: new Date().toISOString()
  });

  try {
    runStep('hsl:video-3-dispatch', env, runRoot);
    runStep('hsl:video-3-generated-qa', env, runRoot);
    runStep('hsl:video-3-narration', env, runRoot);
    runStep('hsl:video-3-finish', env, runRoot);
    runStep('hsl:video-3-youtube-package', env, runRoot);
    const finalManifestPath = path.join(runRoot, 'video-3-final-manifest.json');
    writeJson(manifestPath, {
      schema: 'hsl.video-3.complete-orchestration.v1',
      production_id: productionId,
      status: 'HSL_VIDEO_3_COMPLETE',
      run_root: runRoot,
      final_manifest_path: finalManifestPath,
      completed_at: new Date().toISOString()
    });
    process.stdout.write(`${JSON.stringify({status: 'HSL_VIDEO_3_COMPLETE', run_root: runRoot, final_manifest_path: finalManifestPath}, null, 2)}\n`);
  } catch (error) {
    writeJson(manifestPath, {
      schema: 'hsl.video-3.complete-orchestration.v1',
      production_id: productionId,
      status: 'BLOCKED_AT_PROVIDER_OR_STEP',
      run_root: runRoot,
      error: error instanceof Error ? error.message : String(error),
      updated_at: new Date().toISOString()
    });
    throw error;
  }
}

main();
