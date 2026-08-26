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
  writeJson(path.join(runRoot, 'logs', `video-5-complete-${scriptName.replace(/[:/\\]/g, '-')}.json`), {
    schema: 'hsl.video-5.complete-step.v1',
    script: scriptName,
    status: result.status === 0 ? 'PASS' : 'FAIL',
    exit_code: result.status,
    signal: result.signal,
    started_at: startedAt,
    completed_at: completedAt
  });
  if (result.status !== 0) throw new Error(`HSL_VIDEO_5_COMPLETE_STEP_FAILED:${scriptName}:${result.status}`);
}

function main(): void {
  const productionId = process.env.HSL_VIDEO_5_RUN_ID || 'HSL-VIDEO-005';
  const runRoot = path.resolve(process.env.HSL_VIDEO_5_OUTPUT || path.join('runs', productionId));
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    HSL_VIDEO_5_RUN_ID: productionId,
    HSL_VIDEO_5_OUTPUT: runRoot,
    HSL_NARRATION_PROVIDER: 'voicebox',
    HSL_OFFICIAL_VOICE_NAME: 'Echo',
    HSL_VOICEBOX_PRESET_VOICE_ID: 'am_echo',
    HSL_CONFIRMED_HUMAN_APPROVAL: process.env.HSL_CONFIRMED_HUMAN_APPROVAL,
    HSL_START_FRAME_REVIEWER: process.env.HSL_START_FRAME_REVIEWER,
    HSL_START_FRAME_APPROVAL_TOKEN: process.env.HSL_START_FRAME_APPROVAL_TOKEN,
    HSL_CONFIRMED_VIDEO_5_DISPATCH: process.env.HSL_CONFIRMED_VIDEO_5_DISPATCH,
    HSL_ALLOW_PAID_FIREFLY_DISPATCH: process.env.HSL_ALLOW_PAID_FIREFLY_DISPATCH,
    FIREFLY_ALLOW_CREDIT_SPEND: process.env.FIREFLY_ALLOW_CREDIT_SPEND,
    FIREFLY_RESUME_EXISTING_BATCH: process.env.FIREFLY_RESUME_EXISTING_BATCH || 'false',
    FIREFLY_CONTINUE_ON_PROVIDER_ERROR: 'true',
    FIREFLY_CONTINUE_ON_FAILED_INFRA: 'true',
    FIREFLY_WORKER_CONCURRENCY: process.env.FIREFLY_WORKER_CONCURRENCY || '1',
    FIREFLY_MAX_WAIT_MINUTES: process.env.FIREFLY_MAX_WAIT_MINUTES || '1500',
    FIREFLY_GENERATION_BUDGET_MS: process.env.FIREFLY_GENERATION_BUDGET_MS || '1200000',
    FIREFLY_WATCHDOG_WALL_CLOCK_MS: process.env.FIREFLY_WATCHDOG_WALL_CLOCK_MS || '1350000',
    FIREFLY_PROVIDER_CAPACITY_MAX_ATTEMPTS: process.env.FIREFLY_PROVIDER_CAPACITY_MAX_ATTEMPTS || '12',
    FIREFLY_DIAG_DIR: process.env.FIREFLY_DIAG_DIR || path.join(runRoot, 'firefly', 'diagnostics'),
    HSL_FIREFLY_TARGET_RESOLUTION: '720p',
    HSL_FIREFLY_VIDEO_REFERENCE_FRAME_MODE: 'visual-reference',
    HSL_VISUAL_CADENCE_SECONDS: process.env.HSL_VISUAL_CADENCE_SECONDS || '5.9',
    HSL_GENERATED_SHOTS_PER_SCENE: process.env.HSL_GENERATED_SHOTS_PER_SCENE || '3',
    HSL_PREMIUM_MOTION_SHOTS: process.env.HSL_PREMIUM_MOTION_SHOTS || 'HSL5_001_V03,HSL5_004_V03,HSL5_007_V03,HSL5_011_V03,HSL5_015_V03,HSL5_019_V03',
    HSL_SHOW_GLOBAL_OVERLAYS: 'false',
    HSL_SHOW_HYBRID_TEXT_OVERLAY: 'false'
  };
  const manifestPath = path.join(runRoot, 'video-5-complete-orchestration.json');
  writeJson(manifestPath, {
    schema: 'hsl.video-5.complete-orchestration.v1',
    production_id: productionId,
    status: 'RUNNING',
    run_root: runRoot,
    provider: 'Firefly Video',
    resolution: '720p',
    narration: {provider: 'voicebox', official_voice: 'Echo', voicebox_preset: 'am_echo'},
    overlays: {hsl_docs: false, ai_visualization: false, loading_line: false},
    started_at: new Date().toISOString()
  });

  try {
    runStep('hsl:video-5-prepare', env, runRoot);
    runStep('hsl:video-5-start-frame-plan', env, runRoot);
    const provenancePath = path.join(runRoot, 'start-frame-candidates', 'start-frame-provenance.json');
    const provenance = fs.existsSync(provenancePath)
      ? JSON.parse(fs.readFileSync(provenancePath, 'utf8')) as {status?: string}
      : null;
    if (provenance?.status !== 'IDENTITY_LOCKED_START_FRAMES_READY') {
      writeJson(manifestPath, {
        schema: 'hsl.video-5.complete-orchestration.v1',
        production_id: productionId,
        status: 'WAITING_FOR_IDENTITY_LOCKED_START_FRAMES',
        run_root: runRoot,
        required_provenance_manifest: provenancePath,
        visual_identity_contract: 'HSL_VISUAL_IDENTITY_V2',
        updated_at: new Date().toISOString()
      });
      process.stdout.write(`${JSON.stringify({status: 'WAITING_FOR_IDENTITY_LOCKED_START_FRAMES', required_provenance_manifest: provenancePath}, null, 2)}\n`);
      return;
    }
    runStep('hsl:video-5-start-frame-qa', env, runRoot);
    const qaPath = path.join(runRoot, 'start-frame-candidates', 'start-frame-technical-qa.json');
    const qa = JSON.parse(fs.readFileSync(qaPath, 'utf8')) as {review_artifact_sha256: string};
    if (env.HSL_CONFIRMED_HUMAN_APPROVAL !== 'true' || !env.HSL_START_FRAME_APPROVAL_TOKEN) {
      writeJson(manifestPath, {
        schema: 'hsl.video-5.complete-orchestration.v1',
        production_id: productionId,
        status: 'WAITING_FOR_HUMAN_START_FRAME_APPROVAL',
        run_root: runRoot,
        review_artifact_sha256: qa.review_artifact_sha256,
        required_approval_token: `APPROVE:${productionId}:${qa.review_artifact_sha256}`,
        updated_at: new Date().toISOString()
      });
      process.stdout.write(`${JSON.stringify({status: 'WAITING_FOR_HUMAN_START_FRAME_APPROVAL', review_artifact_sha256: qa.review_artifact_sha256}, null, 2)}\n`);
      return;
    }
    runStep('hsl:video-5-approve-and-prepare', env, runRoot);
    if (
      env.HSL_CONFIRMED_VIDEO_5_DISPATCH !== 'true'
      || env.HSL_ALLOW_PAID_FIREFLY_DISPATCH !== 'true'
      || env.FIREFLY_ALLOW_CREDIT_SPEND !== 'true'
    ) {
      writeJson(manifestPath, {
        schema: 'hsl.video-5.complete-orchestration.v1',
        production_id: productionId,
        status: 'WAITING_FOR_PAID_FIREFLY_AUTHORIZATION',
        run_root: runRoot,
        updated_at: new Date().toISOString()
      });
      process.stdout.write(`${JSON.stringify({status: 'WAITING_FOR_PAID_FIREFLY_AUTHORIZATION'}, null, 2)}\n`);
      return;
    }
    runStep('hsl:video-5-dispatch', env, runRoot);
    runStep('hsl:video-5-generated-qa', env, runRoot);
    runStep('hsl:video-5-narration', env, runRoot);
    runStep('hsl:video-5-finish', env, runRoot);
    runStep('hsl:video-5-youtube-package', env, runRoot);
    const finalManifestPath = path.join(runRoot, 'video-5-final-manifest.json');
    writeJson(manifestPath, {
      schema: 'hsl.video-5.complete-orchestration.v1',
      production_id: productionId,
      status: 'HSL_VIDEO_5_COMPLETE',
      run_root: runRoot,
      final_manifest_path: finalManifestPath,
      completed_at: new Date().toISOString()
    });
    process.stdout.write(`${JSON.stringify({status: 'HSL_VIDEO_5_COMPLETE', run_root: runRoot, final_manifest_path: finalManifestPath}, null, 2)}\n`);
  } catch (error) {
    writeJson(manifestPath, {
      schema: 'hsl.video-5.complete-orchestration.v1',
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
