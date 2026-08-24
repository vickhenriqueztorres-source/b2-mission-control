import fs from 'fs';
import path from 'path';
import {
  CinematicEditorialPackageView,
  CinematicEditorialSceneView,
  NarrationAlignmentWordView,
  NarrativeBeatSceneInput
} from '../types/cinematicPlans';
import {CinematicValidationError} from '../validators/cinematicValidationError';

const SCRIPT_FIELDS = ['voiceover', 'narration_text', 'script_text'] as const;

function textFromRecord(value: unknown, sceneId: string): string | null {
  if (Array.isArray(value)) {
    const match = value.find((item) => item && typeof item === 'object' && (item as any).scene_id === sceneId);
    return match ? textFromRecord(match, sceneId) : null;
  }
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (record[sceneId] !== undefined) return textFromRecord(record[sceneId], sceneId);
  if (Array.isArray(record.scenes)) return textFromRecord(record.scenes, sceneId);
  for (const field of SCRIPT_FIELDS) {
    if (typeof record[field] === 'string' && record[field].trim()) return record[field] as string;
  }
  if (typeof record.text === 'string' && record.text.trim()) return record.text;
  return null;
}

function scriptForScene(
  editorialPackage: CinematicEditorialPackageView,
  scene: CinematicEditorialSceneView,
  packageDirectory: string
): string {
  for (const field of SCRIPT_FIELDS) {
    if (typeof scene[field] === 'string' && String(scene[field]).trim()) return String(scene[field]);
  }

  const embedded = textFromRecord(editorialPackage.approved_script, scene.scene_id);
  if (embedded) return embedded;

  if (typeof editorialPackage.approved_script_path === 'string') {
    const scriptPath = path.isAbsolute(editorialPackage.approved_script_path)
      ? editorialPackage.approved_script_path
      : path.resolve(packageDirectory, editorialPackage.approved_script_path);
    if (!fs.existsSync(scriptPath)) {
      throw new CinematicValidationError(
        'CINEMATIC_APPROVED_SCRIPT_REQUIRED',
        `approved script path not found for ${scene.scene_id}`
      );
    }
    let external: unknown;
    try {
      external = JSON.parse(fs.readFileSync(scriptPath, 'utf8')) as unknown;
    } catch (error) {
      throw new CinematicValidationError(
        'CINEMATIC_APPROVED_SCRIPT_REQUIRED',
        `approved script is not valid JSON for ${scene.scene_id}: ${(error as Error).message}`
      );
    }
    const extracted = textFromRecord(external, scene.scene_id);
    if (extracted) return extracted;
  }

  throw new CinematicValidationError(
    'CINEMATIC_APPROVED_SCRIPT_REQUIRED',
    `approved script text not found for ${scene.scene_id}`
  );
}

function alignmentFromValue(value: unknown, sceneId: string): readonly NarrationAlignmentWordView[] | undefined {
  if (Array.isArray(value)) {
    if (value.every((item) => item && typeof item === 'object' && 'word' in item)) {
      return value as readonly NarrationAlignmentWordView[];
    }
    const sceneMatch = value.find((item) => item && typeof item === 'object' && (item as any).scene_id === sceneId);
    return sceneMatch ? alignmentFromValue(sceneMatch, sceneId) : undefined;
  }
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Record<string, unknown>;
  if (record[sceneId] !== undefined) return alignmentFromValue(record[sceneId], sceneId);
  if (record.words !== undefined) return alignmentFromValue(record.words, sceneId);
  return undefined;
}

function collectClaimIds(value: unknown, claims: Set<string>): void {
  if (Array.isArray(value)) {
    for (const item of value) collectClaimIds(item, claims);
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (key === 'claim_id' && typeof child === 'string' && child.trim()) claims.add(child);
    collectClaimIds(child, claims);
  }
}

export function existingClaimIds(editorialPackage: CinematicEditorialPackageView): ReadonlySet<string> {
  const claims = new Set<string>();
  for (const scene of editorialPackage.scenes) {
    if (typeof scene.claim_id === 'string' && scene.claim_id.trim()) claims.add(scene.claim_id);
  }
  collectClaimIds(editorialPackage.claim_registry, claims);
  return claims;
}

export function narrativeBeatInputForScene(
  productionId: string,
  editorialPackage: CinematicEditorialPackageView,
  scene: CinematicEditorialSceneView,
  packageDirectory: string,
  claimIds: ReadonlySet<string>
): NarrativeBeatSceneInput {
  const claimId = typeof scene.claim_id === 'string' && scene.claim_id.trim() ? scene.claim_id : null;
  if (claimId && !claimIds.has(claimId)) {
    throw new CinematicValidationError('CINEMATIC_BEAT_CLAIM_INVALID', claimId);
  }

  return {
    productionId,
    episodeId: editorialPackage.episode_id,
    sceneId: scene.scene_id,
    claimId,
    existingClaimIds: claimIds,
    narrativeFunction: typeof scene.narrative_function === 'string' ? scene.narrative_function : '',
    chapterId: typeof scene.chapter_id === 'string' ? scene.chapter_id : undefined,
    approvedScriptText: scriptForScene(editorialPackage, scene, packageDirectory),
    narrationAlignment: alignmentFromValue(
      scene.narration_alignment ?? editorialPackage.narration_alignment,
      scene.scene_id
    )
  };
}
