import {HSL_CAMERA_BLACKLIST} from '../config/hslCinematicShotGrammar';
import {
  CinematicShotDirection,
  CinematicShotDirectorInput,
  HSL_CAMERA_DIRECTIONS,
  HSL_CAMERA_INTENSITIES,
  HSL_CAMERA_MOVEMENTS,
  HSL_COMPOSITIONS,
  HSL_DEPTH_DESIGNS,
  HSL_LENS_LANGUAGES,
  HSL_MOTION_MOTIVATIONS,
  HSL_NEGATIVE_SPACES,
  HSL_NEGATIVE_SPACE_MOTIVATIONS,
  HSL_SHOT_SIZES,
  HSL_SHOT_TYPES,
  HSL_SUBJECT_ANCHORS
} from '../types/cinematicPlans';
import {CinematicValidationError} from './cinematicValidationError';

function assertAllowed(value: unknown, allowed: readonly string[], field: string): void {
  if (typeof value !== 'string' || !allowed.includes(value)) {
    throw new CinematicValidationError('CINEMATIC_SHOT_ENUM_INVALID', `${field}:${String(value)}`);
  }
}

export function validateCinematicShotDirection(
  output: Readonly<CinematicShotDirection>,
  input: Readonly<CinematicShotDirectorInput>
): void {
  if (!output.focusTarget.trim() || !input.focusTargetCandidates.includes(output.focusTarget)) {
    throw new CinematicValidationError('CINEMATIC_SHOT_FOCUS_REQUIRED', output.focusTarget);
  }
  assertAllowed(output.shot.shot_type, HSL_SHOT_TYPES, 'shot_type');
  assertAllowed(output.shot.shot_size, HSL_SHOT_SIZES, 'shot_size');
  assertAllowed(output.shot.composition, HSL_COMPOSITIONS, 'composition');
  assertAllowed(output.shot.subject_anchor, HSL_SUBJECT_ANCHORS, 'subject_anchor');
  assertAllowed(output.shot.negative_space, HSL_NEGATIVE_SPACES, 'negative_space');
  assertAllowed(output.shot.depth_design, HSL_DEPTH_DESIGNS, 'depth_design');
  assertAllowed(output.shot.lens_language, HSL_LENS_LANGUAGES, 'lens_language');
  assertAllowed(output.camera.movement, HSL_CAMERA_MOVEMENTS, 'camera.movement');
  assertAllowed(output.camera.direction, HSL_CAMERA_DIRECTIONS, 'camera.direction');
  assertAllowed(output.camera.intensity, HSL_CAMERA_INTENSITIES, 'camera.intensity');

  if ((HSL_CAMERA_BLACKLIST as readonly string[]).includes(output.camera.movement)) {
    throw new CinematicValidationError('CINEMATIC_SHOT_ENUM_INVALID', output.camera.movement);
  }
  if (output.shot.negative_space === 'NONE') {
    if (output.shot.negative_space_motivation !== null) {
      throw new CinematicValidationError('CINEMATIC_SHOT_COMBINATION_INVALID', 'negative space motivation without space');
    }
  } else {
    assertAllowed(output.shot.negative_space_motivation, HSL_NEGATIVE_SPACE_MOTIVATIONS, 'negative_space_motivation');
  }

  if (output.camera.movement === 'STATIC') {
    if (output.camera.direction !== 'NONE' || output.camera.intensity !== 'NONE' || output.camera.motivation !== null) {
      throw new CinematicValidationError('CINEMATIC_CAMERA_COMBINATION_INVALID', 'STATIC requires NONE/NONE/null');
    }
  } else {
    if (output.camera.direction === 'NONE' || output.camera.intensity === 'NONE' || output.camera.motivation === null) {
      throw new CinematicValidationError('CINEMATIC_CAMERA_MOTIVATION_REQUIRED', output.camera.movement);
    }
    assertAllowed(output.camera.motivation, HSL_MOTION_MOTIVATIONS, 'camera.motivation');
  }

  if (output.shot.shot_type === 'MACRO_DETAIL' && output.shot.shot_size === 'EXTREME_WIDE') {
    throw new CinematicValidationError('CINEMATIC_SHOT_COMBINATION_INVALID', 'MACRO_DETAIL + EXTREME_WIDE');
  }
  if (output.shot.shot_type === 'AERIAL_NETWORK' && output.shot.shot_size === 'EXTREME_CLOSE') {
    throw new CinematicValidationError('CINEMATIC_SHOT_COMBINATION_INVALID', 'AERIAL_NETWORK + EXTREME_CLOSE');
  }
  if (
    output.shot.shot_type === 'MECHANICAL_DETAIL' &&
    !(['CLOSE', 'EXTREME_CLOSE', 'MEDIUM'] as const).includes(output.shot.shot_size as any)
  ) {
    throw new CinematicValidationError('CINEMATIC_SHOT_COMBINATION_INVALID', 'MECHANICAL_DETAIL size');
  }
  if (
    output.shot.shot_type === 'SYSTEM_WIDE' &&
    !(['WIDE', 'EXTREME_WIDE', 'MEDIUM_WIDE'] as const).includes(output.shot.shot_size as any)
  ) {
    throw new CinematicValidationError('CINEMATIC_SHOT_COMBINATION_INVALID', 'SYSTEM_WIDE size');
  }
  if (output.shot.shot_type === 'TRACKING_FLOW' && output.shot.lens_language === 'MACRO') {
    throw new CinematicValidationError('CINEMATIC_SHOT_COMBINATION_INVALID', 'TRACKING_FLOW + MACRO');
  }

  const beatIds = new Set(input.beats.map((beat) => beat.beat_id));
  if (
    !output.decisionReason.goal.trim() ||
    !output.decisionReason.based_on.includes('narrative_intent') ||
    !output.decisionReason.based_on.some((reference) => beatIds.has(reference)) ||
    output.decisionReason.based_on.some((reference) => reference !== 'narrative_intent' && !beatIds.has(reference))
  ) {
    throw new CinematicValidationError('CINEMATIC_SHOT_COMBINATION_INVALID', 'decision_reason');
  }
}
