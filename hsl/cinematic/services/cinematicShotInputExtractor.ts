import {HSL_CINEMATIC_BRAND_RULES} from '../config/hslCinematicShotGrammar';
import {
  CinematicEditorialSceneView,
  CinematicShotDirectorInput,
  NarrativeBeatDirectorResult
} from '../types/cinematicPlans';
import {CinematicValidationError} from '../validators/cinematicValidationError';

const EXPLICIT_FOCUS_FIELDS = [
  'focus_target', 'visual_subject', 'subject', 'object_or_flow', 'asset_subject'
] as const;

function cleanCandidate(value: string): string {
  return value.trim().replace(/\s+/g, ' ').slice(0, 120);
}

export function cinematicShotInputForScene(
  productionId: string,
  episodeId: string,
  scene: CinematicEditorialSceneView,
  beatResult: NarrativeBeatDirectorResult
): CinematicShotDirectorInput {
  if (typeof scene.visual_mode !== 'string' || !scene.visual_mode.trim()) {
    throw new CinematicValidationError('CINEMATIC_VISUAL_MODE_REQUIRED', scene.scene_id);
  }

  const candidates: string[] = [];
  for (const field of EXPLICIT_FOCUS_FIELDS) {
    if (typeof scene[field] === 'string' && cleanCandidate(String(scene[field]))) {
      candidates.push(cleanCandidate(String(scene[field])));
    }
  }
  for (const beat of beatResult.beats) {
    for (const emphasis of beat.emphasis) candidates.push(cleanCandidate(emphasis));
    candidates.push(cleanCandidate(beat.concept.replace(/_/g, ' ')));
  }
  const uniqueCandidates = [...new Set(candidates.filter(Boolean))];
  if (uniqueCandidates.length === 0) {
    throw new CinematicValidationError('CINEMATIC_SHOT_FOCUS_REQUIRED', scene.scene_id);
  }

  return {
    productionId,
    episodeId,
    sceneId: scene.scene_id,
    narrativeFunction: typeof scene.narrative_function === 'string' ? scene.narrative_function : '',
    visualMode: scene.visual_mode,
    narrativeIntent: beatResult.narrativeIntent,
    beats: beatResult.beats,
    focusTargetCandidates: uniqueCandidates,
    sceneContext: {
      chapterId: typeof scene.chapter_id === 'string' ? scene.chapter_id : undefined,
      chapterTitle: typeof scene.chapter_title === 'string' ? scene.chapter_title : undefined
    },
    brandRules: HSL_CINEMATIC_BRAND_RULES
  };
}
