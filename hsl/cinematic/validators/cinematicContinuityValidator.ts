import {
  CinematicContinuityDecision,
  CinematicContinuitySceneView,
  CinematicScenePlanV1,
  ContinuityDirectorEpisodeInput,
  ContinuityDirectorEpisodeResult,
  HSL_AXIS_STRATEGIES,
  HSL_BRIDGE_CANDIDATES,
  HSL_CONTINUITY_MOTIVATIONS,
  HSL_CONTINUITY_SEVERITIES,
  HSL_CONTINUITY_STATUSES,
  HSL_CONTINUITY_WARNING_CODES,
  HSL_CONTINUITY_WARNING_OWNERS,
  HSL_CROSS_MEDIA_CONTINUITIES,
  HSL_FOCUS_HANDOFFS,
  HSL_SCREEN_FLOW_DIRECTIONS,
  HSL_SCREEN_FLOW_SOURCES,
  HSL_SHOT_SCALE_RELATIONS
} from '../types/cinematicPlans';
import {CinematicValidationError} from './cinematicValidationError';

function assertAllowed(value: unknown, allowed: readonly string[], field: string): void {
  if (typeof value !== 'string' || !allowed.includes(value)) {
    throw new CinematicValidationError('CINEMATIC_CONTINUITY_ENUM_INVALID', `${field}:${String(value)}`);
  }
}

export function validateCinematicContinuityDecision(
  decision: Readonly<CinematicContinuityDecision>,
  context: Readonly<{
    currentScene: CinematicContinuitySceneView;
    previousScene: CinematicContinuitySceneView | null;
    nextScene: CinematicContinuitySceneView | null;
    existingSceneIds: ReadonlySet<string>;
  }>
): void {
  assertAllowed(decision.status, HSL_CONTINUITY_STATUSES, 'status');
  const expectedRelations = [
    {name: 'incoming', relation: decision.incoming, expected: context.previousScene},
    {name: 'outgoing', relation: decision.outgoing, expected: context.nextScene}
  ] as const;
  for (const {name, relation, expected} of expectedRelations) {
    if (!expected) {
      if (relation !== null) {
        throw new CinematicValidationError('CINEMATIC_CONTINUITY_RELATION_INVALID', `${name} invented`);
      }
      continue;
    }
    if (!relation || relation.scene_id !== expected.scene_id || !context.existingSceneIds.has(relation.scene_id)) {
      throw new CinematicValidationError('CINEMATIC_CONTINUITY_RELATION_INVALID', `${name}:${expected.scene_id}`);
    }
    assertAllowed(relation.screen_flow.direction, HSL_SCREEN_FLOW_DIRECTIONS, `${name}.screen_flow.direction`);
    assertAllowed(relation.screen_flow.source, HSL_SCREEN_FLOW_SOURCES, `${name}.screen_flow.source`);
    assertAllowed(relation.axis_strategy, HSL_AXIS_STRATEGIES, `${name}.axis_strategy`);
    assertAllowed(relation.shot_scale_relation, HSL_SHOT_SCALE_RELATIONS, `${name}.shot_scale_relation`);
    assertAllowed(relation.focus_handoff, HSL_FOCUS_HANDOFFS, `${name}.focus_handoff`);
    assertAllowed(relation.bridge_candidate, HSL_BRIDGE_CANDIDATES, `${name}.bridge_candidate`);
    assertAllowed(relation.cross_media_continuity, HSL_CROSS_MEDIA_CONTINUITIES, `${name}.cross_media_continuity`);
    if (relation.axis_strategy === 'REVERSE_MOTIVATED') {
      if (relation.axis_motivation === null) {
        throw new CinematicValidationError(
          'CINEMATIC_CONTINUITY_REVERSAL_MOTIVATION_REQUIRED',
          `${name}.axis_motivation`
        );
      }
      assertAllowed(relation.axis_motivation, HSL_CONTINUITY_MOTIVATIONS, `${name}.axis_motivation`);
    } else if (relation.axis_motivation !== null) {
      throw new CinematicValidationError(
        'CINEMATIC_CONTINUITY_RELATION_INVALID',
        `${name}.axis_motivation without reversal`
      );
    }
  }
  if (decision.sequence_memory.last_n_scenes < 1 || decision.sequence_memory.last_n_scenes > 6) {
    throw new CinematicValidationError('CINEMATIC_CONTINUITY_RELATION_INVALID', 'sequence memory window');
  }
  if (
    decision.sequence_memory.shot_size_sequence.at(-1) !== context.currentScene.shot.shot_size ||
    decision.sequence_memory.camera_sequence.at(-1) !== context.currentScene.camera.movement ||
    decision.sequence_memory.composition_sequence.at(-1) !== context.currentScene.shot.composition
  ) {
    throw new CinematicValidationError('CINEMATIC_CONTINUITY_ORDER_INVALID', context.currentScene.scene_id);
  }
  for (const warning of decision.warnings) {
    assertAllowed(warning.code, HSL_CONTINUITY_WARNING_CODES, 'warning.code');
    assertAllowed(warning.severity, HSL_CONTINUITY_SEVERITIES, 'warning.severity');
    assertAllowed(warning.owner, HSL_CONTINUITY_WARNING_OWNERS, 'warning.owner');
    if (warning.run_length !== null && (!Number.isInteger(warning.run_length) || warning.run_length < 1)) {
      throw new CinematicValidationError('CINEMATIC_CONTINUITY_RELATION_INVALID', 'warning.run_length');
    }
  }
}

export function validateContinuityEpisodeResult(
  result: Readonly<ContinuityDirectorEpisodeResult>,
  input: Readonly<ContinuityDirectorEpisodeInput>
): void {
  if (result.decisions.length !== input.scenes.length) {
    throw new CinematicValidationError('CINEMATIC_CONTINUITY_ORDER_INVALID', 'decision count');
  }
  const sceneIds = new Set(input.scenes.map((scene) => scene.scene_id));
  result.decisions.forEach((item, index) => {
    const current = input.scenes[index];
    if (item.sceneId !== current.scene_id) {
      throw new CinematicValidationError('CINEMATIC_CONTINUITY_ORDER_INVALID', item.sceneId);
    }
    validateCinematicContinuityDecision(item.continuity, {
      currentScene: current,
      previousScene: input.scenes[index - 1] || null,
      nextScene: input.scenes[index + 1] || null,
      existingSceneIds: sceneIds
    });
  });
}

export function validateContinuityOwnership(
  before: Readonly<Pick<CinematicScenePlanV1, 'scene_id' | 'beats' | 'direction' | 'shot' | 'camera'>>,
  after: Readonly<Pick<CinematicScenePlanV1, 'scene_id' | 'beats' | 'direction' | 'shot' | 'camera'>>
): void {
  const protectedBefore = {
    beats: before.beats,
    narrative_intent: before.direction.narrative_intent,
    focus_target: before.direction.focus_target,
    shot: before.shot,
    camera: before.camera
  };
  const protectedAfter = {
    beats: after.beats,
    narrative_intent: after.direction.narrative_intent,
    focus_target: after.direction.focus_target,
    shot: after.shot,
    camera: after.camera
  };
  if (JSON.stringify(protectedAfter) !== JSON.stringify(protectedBefore)) {
    throw new CinematicValidationError(
      'CINEMATIC_CONTINUITY_OWNERSHIP_VIOLATION',
      after.scene_id
    );
  }
}
