import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import {
  HSL_PREMIUM_MOTION_REFERENCE_SET,
  HSL_VISUAL_IDENTITY_CONTRACT_VERSION,
  HSL_VISUAL_IDENTITY_RULES
} from '../../config/hslVisualIdentity';

export type HslStartFrameSourceMode =
  | 'REFERENCE_CONDITIONED_GENERATION'
  | 'APPROVED_PHOTOGRAPHIC_BASE'
  | 'LICENSED_REAL_BASE'
  | 'PROCEDURAL_PREVIS'
  | 'FLAT_VECTOR_TEMPLATE'
  | 'PLACEHOLDER'
  | 'LOCAL_PROXY';

export interface HslStartFrameProvenanceItem {
  readonly shot_id: string;
  readonly frame_sha256: string;
  readonly prompt_sha256: string;
  readonly source_mode: HslStartFrameSourceMode;
  readonly generator: string;
  readonly identity_contract_version: string;
  readonly reference_asset_ids: readonly string[];
}

export interface HslStartFrameProvenanceManifest {
  readonly schema: 'hsl.start-frame.provenance.v2';
  readonly status: 'IDENTITY_LOCKED_START_FRAMES_READY' | 'PROCEDURAL_PREVIS_ONLY';
  readonly identity_contract_version: string;
  readonly reference_set_manifest_path: string;
  readonly reference_set_manifest_sha256: string;
  readonly items: readonly HslStartFrameProvenanceItem[];
}

export function sha256File(filePath: string): string {
  return `sha256_${crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex')}`;
}

export function sha256Text(value: string): string {
  return `sha256_${crypto.createHash('sha256').update(value, 'utf8').digest('hex')}`;
}

export interface HslStartFrameCandidateEligibility {
  readonly eligible: boolean;
  readonly reason: string;
  readonly provenance?: HslStartFrameProvenanceItem;
}

export function inspectHslStartFrameCandidateEligibility(input: Readonly<{
  provenanceManifestPath: string;
  shot: {shot_id: string; frame_path: string; start_frame_prompt: string};
  projectRoot?: string;
}>): HslStartFrameCandidateEligibility {
  const provenancePath = path.resolve(input.provenanceManifestPath);
  if (!fs.existsSync(input.shot.frame_path)) return {eligible: false, reason: 'FRAME_FILE_MISSING'};
  if (!fs.existsSync(provenancePath)) return {eligible: false, reason: 'PROVENANCE_MANIFEST_MISSING'};

  const manifest = JSON.parse(fs.readFileSync(provenancePath, 'utf8')) as HslStartFrameProvenanceManifest;
  if (manifest.schema !== 'hsl.start-frame.provenance.v2') return {eligible: false, reason: 'PROVENANCE_SCHEMA_INVALID'};
  if (manifest.status !== 'IDENTITY_LOCKED_START_FRAMES_READY') return {eligible: false, reason: manifest.status};
  if (manifest.identity_contract_version !== HSL_VISUAL_IDENTITY_CONTRACT_VERSION) {
    return {eligible: false, reason: 'IDENTITY_CONTRACT_MISMATCH'};
  }

  const projectRoot = path.resolve(input.projectRoot || process.cwd());
  const configuredReferencePath = path.resolve(projectRoot, HSL_PREMIUM_MOTION_REFERENCE_SET.manifestPath);
  const declaredReferencePath = path.resolve(projectRoot, manifest.reference_set_manifest_path);
  if (declaredReferencePath !== configuredReferencePath || !fs.existsSync(configuredReferencePath)) {
    return {eligible: false, reason: 'APPROVED_REFERENCE_SET_MISSING'};
  }
  if (sha256File(configuredReferencePath) !== manifest.reference_set_manifest_sha256) {
    return {eligible: false, reason: 'REFERENCE_SET_HASH_MISMATCH'};
  }

  const item = manifest.items.find((candidate) => candidate.shot_id === input.shot.shot_id);
  if (!item) return {eligible: false, reason: 'PROVENANCE_ITEM_MISSING'};
  if (!HSL_VISUAL_IDENTITY_RULES.allowedStartFrameSourceModes.includes(item.source_mode as never)) {
    return {eligible: false, reason: `SOURCE_MODE_FORBIDDEN:${item.source_mode}`, provenance: item};
  }
  if (item.identity_contract_version !== HSL_VISUAL_IDENTITY_CONTRACT_VERSION) {
    return {eligible: false, reason: 'ITEM_IDENTITY_CONTRACT_MISMATCH', provenance: item};
  }
  const approvedReferenceIds = new Set<string>(HSL_PREMIUM_MOTION_REFERENCE_SET.approvedAssetIds);
  if (!item.reference_asset_ids.length || item.reference_asset_ids.some((id) => !approvedReferenceIds.has(id))) {
    return {eligible: false, reason: 'REFERENCE_LINEAGE_INVALID', provenance: item};
  }
  if (item.frame_sha256 !== sha256File(input.shot.frame_path)) {
    return {eligible: false, reason: 'FRAME_HASH_MISMATCH', provenance: item};
  }
  if (item.prompt_sha256 !== sha256Text(input.shot.start_frame_prompt)) {
    return {eligible: false, reason: 'PROMPT_HASH_MISMATCH', provenance: item};
  }
  if (!item.generator.trim()) return {eligible: false, reason: 'GENERATOR_MISSING', provenance: item};
  return {eligible: true, reason: 'IDENTITY_PROVENANCE_VERIFIED', provenance: item};
}

export class StartFrameIdentityGate {
  validate(input: Readonly<{
    provenanceManifestPath: string;
    expectedShots: readonly {shot_id: string; frame_path: string; start_frame_prompt: string}[];
    projectRoot?: string;
  }>): HslStartFrameProvenanceManifest {
    const provenancePath = path.resolve(input.provenanceManifestPath);
    if (!fs.existsSync(provenancePath)) throw new Error(`HSL_START_FRAME_PROVENANCE_REQUIRED:${provenancePath}`);
    const manifest = JSON.parse(fs.readFileSync(provenancePath, 'utf8')) as HslStartFrameProvenanceManifest;
    if (manifest.schema !== 'hsl.start-frame.provenance.v2') throw new Error('HSL_START_FRAME_PROVENANCE_SCHEMA_INVALID');
    if (manifest.status !== 'IDENTITY_LOCKED_START_FRAMES_READY') {
      throw new Error(`HSL_START_FRAME_SOURCE_NOT_IDENTITY_ELIGIBLE:${manifest.status}`);
    }
    if (manifest.identity_contract_version !== HSL_VISUAL_IDENTITY_CONTRACT_VERSION) {
      throw new Error(`HSL_VISUAL_IDENTITY_CONTRACT_MISMATCH:${manifest.identity_contract_version}`);
    }

    const projectRoot = path.resolve(input.projectRoot || process.cwd());
    const configuredReferencePath = path.resolve(projectRoot, HSL_PREMIUM_MOTION_REFERENCE_SET.manifestPath);
    const declaredReferencePath = path.resolve(projectRoot, manifest.reference_set_manifest_path);
    if (declaredReferencePath !== configuredReferencePath || !fs.existsSync(configuredReferencePath)) {
      throw new Error(`HSL_APPROVED_REFERENCE_SET_REQUIRED:${configuredReferencePath}`);
    }
    if (sha256File(configuredReferencePath) !== manifest.reference_set_manifest_sha256) {
      throw new Error('HSL_REFERENCE_SET_HASH_MISMATCH');
    }

    const allowedModes = new Set<string>(HSL_VISUAL_IDENTITY_RULES.allowedStartFrameSourceModes);
    const approvedReferenceIds = new Set<string>(HSL_PREMIUM_MOTION_REFERENCE_SET.approvedAssetIds);
    const byShot = new Map(manifest.items.map((item) => [item.shot_id, item]));
    if (byShot.size !== input.expectedShots.length || manifest.items.length !== input.expectedShots.length) {
      throw new Error('HSL_START_FRAME_PROVENANCE_COVERAGE_MISMATCH');
    }
    for (const shot of input.expectedShots) {
      const item = byShot.get(shot.shot_id);
      const eligibility = inspectHslStartFrameCandidateEligibility({
        provenanceManifestPath: provenancePath,
        shot,
        projectRoot
      });
      if (!eligibility.eligible) {
        throw new Error(`HSL_START_FRAME_IDENTITY_ELIGIBILITY_FAILED:${shot.shot_id}:${eligibility.reason}`);
      }
      if (!item || !allowedModes.has(item.source_mode) || !item.reference_asset_ids.every((id) => approvedReferenceIds.has(id))) {
        throw new Error(`HSL_START_FRAME_PROVENANCE_ITEM_INVALID:${shot.shot_id}`);
      }
    }
    return manifest;
  }
}
