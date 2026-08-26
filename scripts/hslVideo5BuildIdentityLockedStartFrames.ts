import {spawnSync} from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import {
  HSL_PREMIUM_MOTION_REFERENCE_SET,
  HSL_VISUAL_IDENTITY_CONTRACT_VERSION
} from '../config/hslVisualIdentity';

type ShotPlanItem = {
  readonly shot_id: string;
  readonly parent_scene_id: string;
  readonly start_frame_prompt: string;
};

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function shaFile(filePath: string): string {
  return `sha256_${crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex')}`;
}

function shaText(value: string): string {
  return `sha256_${crypto.createHash('sha256').update(value, 'utf8').digest('hex')}`;
}

function dimensions(filePath: string): {width: number; height: number} {
  const result = spawnSync('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', filePath
  ], {encoding: 'utf8'});
  if (result.status !== 0) throw new Error(`HSL_VIDEO_5_MASTER_FFPROBE_FAILED:${filePath}:${result.stderr}`);
  const stream = (JSON.parse(result.stdout) as {streams?: Array<{width?: number; height?: number}>}).streams?.[0];
  const width = Number(stream?.width || 0);
  const height = Number(stream?.height || 0);
  if (!width || !height) throw new Error(`HSL_VIDEO_5_MASTER_DIMENSIONS_MISSING:${filePath}`);
  return {width, height};
}

function variantNumber(shotId: string): number {
  return Number((shotId.match(/_V(\d+)$/) || [])[1] || 1);
}

function renderVariant(source: string, destination: string, shotId: string, sceneIndex: number): void {
  const {width, height} = dimensions(source);
  const variant = variantNumber(shotId);
  const zoom = variant === 1 ? 1 : variant === 2 ? 0.9 : 0.82;
  const maxWidth = Math.min(width, Math.floor(height * 16 / 9));
  const cropWidth = Math.max(640, Math.floor(maxWidth * zoom));
  const cropHeight = Math.floor(cropWidth * 9 / 16);
  const maxX = Math.max(0, width - cropWidth);
  const maxY = Math.max(0, height - cropHeight);
  const sideBias = sceneIndex % 2 === 0 ? 0.28 : 0.72;
  const xBias = variant === 1 ? 0.5 : variant === 2 ? sideBias : 1 - sideBias;
  const yBias = variant === 1 ? 0.5 : variant === 2 ? 0.42 : 0.58;
  const x = Math.floor(maxX * xBias);
  const y = Math.floor(maxY * yBias);
  const contrast = variant === 1 ? '1.02' : variant === 2 ? '1.04' : '1.03';
  const saturation = variant === 1 ? '1.00' : variant === 2 ? '1.03' : '0.98';
  const gamma = sceneIndex === 17 ? '1.35' : '1.18';
  const brightness = sceneIndex === 17 ? '0.04' : '0.015';
  fs.mkdirSync(path.dirname(destination), {recursive: true});
  const result = spawnSync('ffmpeg', [
    '-y', '-hide_banner', '-loglevel', 'error', '-i', source, '-frames:v', '1',
    '-vf', `crop=${cropWidth}:${cropHeight}:${x}:${y},scale=1280:720:flags=lanczos,eq=contrast=${contrast}:saturation=${saturation}:gamma=${gamma}:brightness=${brightness},unsharp=5:5:0.28:3:3:0.12,format=rgb24`,
    destination
  ], {encoding: 'utf8'});
  if (result.status !== 0) throw new Error(`HSL_VIDEO_5_IDENTITY_FRAME_RENDER_FAILED:${shotId}:${result.stderr}`);
}

function main(): void {
  const productionId = process.env.HSL_VIDEO_5_RUN_ID || 'HSL-VIDEO-005';
  const runRoot = path.resolve(process.env.HSL_VIDEO_5_OUTPUT || path.join('runs', productionId));
  const candidatesRoot = path.join(runRoot, 'start-frame-candidates');
  const mastersRoot = path.join(runRoot, 'start-frame-source-masters');
  const planPath = path.join(candidatesRoot, 'start-frame-shot-plan.json');
  if (!fs.existsSync(planPath)) throw new Error(`HSL_VIDEO_5_START_FRAME_PLAN_REQUIRED:${planPath}`);
  const plan = JSON.parse(fs.readFileSync(planPath, 'utf8')) as {items: ShotPlanItem[]};
  const sceneIds = [...new Set(plan.items.map((item) => item.parent_scene_id))];
  if (sceneIds.length !== 24) throw new Error(`HSL_VIDEO_5_MASTER_SCENE_COUNT_INVALID:${sceneIds.length}`);

  const created = plan.items.map((item) => {
    const sceneIndex = sceneIds.indexOf(item.parent_scene_id);
    const masterPath = path.join(mastersRoot, `${item.parent_scene_id}.png`);
    if (!fs.existsSync(masterPath)) throw new Error(`HSL_VIDEO_5_IDENTITY_MASTER_REQUIRED:${masterPath}`);
    const outputPath = path.join(candidatesRoot, `${item.shot_id}.png`);
    renderVariant(masterPath, outputPath, item.shot_id, sceneIndex);
    return {
      shot_id: item.shot_id,
      parent_scene_id: item.parent_scene_id,
      master_path: masterPath,
      master_sha256: shaFile(masterPath),
      path: outputPath,
      sha256: shaFile(outputPath),
      width: 1280,
      height: 720,
      variant: variantNumber(item.shot_id),
      source_mode: 'REFERENCE_CONDITIONED_GENERATION' as const,
      identity_contract_version: HSL_VISUAL_IDENTITY_CONTRACT_VERSION
    };
  });
  const duplicateCount = created.length - new Set(created.map((item) => item.sha256)).size;
  if (duplicateCount > 0) throw new Error(`HSL_VIDEO_5_IDENTITY_FRAME_DUPLICATE_HASH:${duplicateCount}`);

  const referenceManifestPath = path.resolve(HSL_PREMIUM_MOTION_REFERENCE_SET.manifestPath);
  const provenancePath = path.join(candidatesRoot, 'start-frame-provenance.json');
  writeJson(provenancePath, {
    schema: 'hsl.start-frame.provenance.v2',
    status: 'IDENTITY_LOCKED_START_FRAMES_READY',
    identity_contract_version: HSL_VISUAL_IDENTITY_CONTRACT_VERSION,
    reference_set_manifest_path: HSL_PREMIUM_MOTION_REFERENCE_SET.manifestPath,
    reference_set_manifest_sha256: shaFile(referenceManifestPath),
    items: created.map((createdItem) => ({
      shot_id: createdItem.shot_id,
      frame_sha256: createdItem.sha256,
      prompt_sha256: shaText(plan.items.find((item) => item.shot_id === createdItem.shot_id)?.start_frame_prompt || ''),
      source_mode: createdItem.source_mode,
      generator: 'OpenAI built-in imagegen reference-conditioned master + ffmpeg shot-specific framing',
      identity_contract_version: HSL_VISUAL_IDENTITY_CONTRACT_VERSION,
      reference_asset_ids: HSL_PREMIUM_MOTION_REFERENCE_SET.approvedAssetIds
    }))
  });

  const manifestPath = path.join(candidatesRoot, 'identity-locked-start-frame-build-manifest.json');
  writeJson(manifestPath, {
    schema: 'hsl.video-5.identity-locked-start-frame-build.v1',
    schema_version: '1.0.0',
    production_id: productionId,
    status: 'IDENTITY_LOCKED_START_FRAMES_READY',
    identity_contract_version: HSL_VISUAL_IDENTITY_CONTRACT_VERSION,
    source_master_count: sceneIds.length,
    generated_count: created.length,
    duplicate_sha256_count: duplicateCount,
    items: created,
    provenance_path: provenancePath,
    created_at: new Date().toISOString()
  });

  process.stdout.write(`${JSON.stringify({
    status: 'IDENTITY_LOCKED_START_FRAMES_READY',
    source_master_count: sceneIds.length,
    generated_count: created.length,
    duplicate_sha256_count: duplicateCount,
    manifest_path: manifestPath,
    provenance_path: provenancePath
  }, null, 2)}\n`);
}

main();
