import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import {HslStartFrameRuntime} from '../hsl/startframe/startFrameRuntime';
import {HslFireflyGenerationRuntime} from '../production/hslFireflyGenerationRuntime';

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function main(): void {
  if (process.env.HSL_CONFIRMED_HUMAN_APPROVAL !== 'true') throw new Error('HSL_CONFIRMED_HUMAN_APPROVAL_REQUIRED');
  const reviewer = process.env.HSL_START_FRAME_REVIEWER?.trim();
  if (!reviewer) throw new Error('HSL_START_FRAME_REVIEWER_REQUIRED');
  const productionId = process.env.HSL_VIDEO_1_RUN_ID || 'HSL-VIDEO-001-VEO-TEST';
  const outputRoot = path.resolve(process.env.HSL_VIDEO_1_OUTPUT || path.join('runs', productionId));
  const candidatesRoot = path.join(outputRoot, 'start-frame-candidates');
  const qaPath = path.join(candidatesRoot, 'start-frame-technical-qa.json');
  const qa = JSON.parse(fs.readFileSync(qaPath, 'utf8')) as {
    episode_id: string; status: string;
    items: Array<{shot_id: string; sha256: string; status: string}>;
  };
  if (qa.status !== 'START_FRAME_SET_QA_PASS' || qa.items.some((item) => item.status !== 'START_FRAME_QA_PASS')) {
    throw new Error('HSL_START_FRAME_TECHNICAL_QA_REQUIRED');
  }
  const reviewedAt = new Date().toISOString();
  const approvalManifestPath = path.join(candidatesRoot, 'start-frame-approval-manifest.json');
  writeJson(approvalManifestPath, {
    schema: 'hsl.start-frame.approval.v1', schema_version: '1.0.0', episode_id: qa.episode_id,
    status: 'APPROVED', reviewer, reviewed_at: reviewedAt,
    approval_source: 'EXPLICIT_USER_AUTHORIZATION_FOR_VEO_TEST_IN_CODEX_TASK',
    items: qa.items.map((item) => ({
      shot_id: item.shot_id, status: 'APPROVED', approved_start_frame_sha256: item.sha256,
      reviewer, reviewed_at: reviewedAt
    }))
  });

  const startFrames = new HslStartFrameRuntime().run({
    productionId, executionPlanPath: path.join(outputRoot, 'editorial', 'execution', 'episode.execution.json'),
    sourceFramesDirectory: candidatesRoot, approvalManifestPath,
    outputDirectory: path.join(outputRoot, 'generation')
  });
  const veoHandoffs = startFrames.handoffs.filter((handoff) =>
    handoff.generation_strategy === 'VEO_MOTION_GRAPHIC' || handoff.generation_strategy === 'VEO_REMOTION_HYBRID'
  );
  if (veoHandoffs.length !== 12) throw new Error(`HSL_VEO_TEST_HANDOFF_COUNT_INVALID:${veoHandoffs.length}`);
  const selectedHandoffPath = path.join(outputRoot, 'generation', 'veo-test-handoffs.json');
  writeJson(selectedHandoffPath, {
    schema: 'hsl.firefly.handoff-set.v1', episode_id: productionId,
    handoffs: veoHandoffs, source_handoff_count: startFrames.handoffs.length
  });
  const prepared = new HslFireflyGenerationRuntime().prepare(veoHandoffs, path.join(outputRoot, 'firefly-veo-test'));
  const manifestPath = path.join(outputRoot, 'firefly-veo-test', 'veo-test-preparation.json');
  writeJson(manifestPath, {
    schema: 'hsl.video-1.veo-test-preparation.v1', production_id: productionId,
    status: 'VEO_TEST_GUIDE_READY', dispatch_authorized: false,
    approval_manifest_path: approvalManifestPath,
    selected_handoff_path: selectedHandoffPath,
    start_frame_manifest_path: startFrames.startFrameManifestPath,
    all_motion_package_count: startFrames.motionPackagePaths.length,
    veo_motion_package_count: veoHandoffs.length,
    firefly_guide_path: prepared.masterGuidePath,
    firefly_jobs: prepared.jobNames,
    prepared_at: new Date().toISOString()
  });
  process.stdout.write(`${JSON.stringify({
    status: 'VEO_TEST_GUIDE_READY', veo_job_count: veoHandoffs.length,
    firefly_guide_path: prepared.masterGuidePath, preparation_manifest_path: manifestPath
  }, null, 2)}\n`);
}

main();
