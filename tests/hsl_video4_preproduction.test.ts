import fs from 'fs';
import os from 'os';
import path from 'path';
import {spawnSync} from 'child_process';

function run(command: string, args: readonly string[], env: NodeJS.ProcessEnv): void {
  const result = spawnSync(command, [...args], {
    cwd: path.resolve(__dirname, '..'),
    env,
    encoding: 'utf8',
    shell: process.platform === 'win32'
  });
  if (result.status !== 0) {
    throw new Error(`COMMAND_FAILED:${command} ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  }
}

function main(): void {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hsl-video4-'));
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    HSL_VIDEO_4_RUN_ID: 'HSL-VIDEO-004-TEST',
    HSL_VIDEO_4_OUTPUT: root,
    HSL_NARRATION_WPM: '157.7',
    HSL_VISUAL_CADENCE_SECONDS: '5.9',
    HSL_GENERATED_SHOTS_PER_SCENE: '2',
    HSL_PREMIUM_MOTION_SHOTS: 'HSL4_001_V03,HSL4_004_V03,HSL4_007_V03,HSL4_011_V03,HSL4_015_V03,HSL4_019_V03',
    HSL_CONFIRMED_HUMAN_APPROVAL: 'true',
    HSL_START_FRAME_REVIEWER: 'test'
  };
  run('npm', ['run', 'hsl:video-4-prepare'], env);
  run('npm', ['run', 'hsl:video-4-start-frame-plan'], env);
  run('npm', ['run', 'hsl:video-4-build-start-frames'], env);
  const coverage = JSON.parse(fs.readFileSync(path.join(root, 'editorial', 'execution', 'visual-coverage.json'), 'utf8')) as {
    generated_shot_count: number;
    mode_distribution: Record<string, number>;
    cinematic_coverage_policy: {generated_ratio: number; remotion_ratio: number; status: string};
  };
  if (coverage.generated_shot_count < 30 || coverage.generated_shot_count > 60) {
    throw new Error(`VIDEO_4_GENERATED_SHOT_COUNT_INVALID:${coverage.generated_shot_count}`);
  }
  if (coverage.cinematic_coverage_policy.generated_ratio < 0.7) {
    throw new Error(`VIDEO_4_GENERATED_RATIO_TOO_LOW:${coverage.cinematic_coverage_policy.generated_ratio}`);
  }
  if (coverage.cinematic_coverage_policy.remotion_ratio > 0.22) {
    throw new Error(`VIDEO_4_REMOTION_RATIO_TOO_HIGH:${coverage.cinematic_coverage_policy.remotion_ratio}`);
  }
  const build = JSON.parse(fs.readFileSync(path.join(root, 'start-frame-candidates', 'start-frame-build-manifest.json'), 'utf8')) as {
    status: string;
    production_eligible: boolean;
    generated_count: number;
    duplicate_sha256_count: number;
  };
  if (build.status !== 'PROCEDURAL_PREVIS_ONLY' || build.production_eligible) {
    throw new Error(`VIDEO_4_PROCEDURAL_PREVIS_NOT_QUARANTINED:${build.status}`);
  }
  if (build.generated_count !== coverage.generated_shot_count) throw new Error('VIDEO_4_PREVIS_COVERAGE_MISMATCH');
  if (build.duplicate_sha256_count !== 0) throw new Error(`VIDEO_4_DUPLICATE_PREVIS_FRAMES:${build.duplicate_sha256_count}`);
  process.stdout.write('hsl_video4_preproduction.test PASS\n');
}

main();
