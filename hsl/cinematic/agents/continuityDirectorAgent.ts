import {buildCinematicContinuityContexts} from '../services/cinematicContinuityContextBuilder';
import {CinematicTelemetryPort} from '../telemetry/cinematicTelemetry';
import {
  CinematicContinuityRelation,
  CinematicContinuitySceneView,
  CinematicContinuityWarning,
  ContinuityDirectorEpisodeInput,
  ContinuityDirectorEpisodeResult,
  HslContinuityMotivation,
  HslCrossMediaContinuity,
  HslFocusHandoff,
  HslScreenFlowDirection,
  HslScreenFlowSource,
  HslShotScaleRelation
} from '../types/cinematicPlans';
import {validateContinuityEpisodeResult} from '../validators/cinematicContinuityValidator';
import {CinematicValidationError} from '../validators/cinematicValidationError';

const SCALE_RANK = {
  EXTREME_WIDE: 0, WIDE: 1, MEDIUM_WIDE: 2, MEDIUM: 3, CLOSE: 4, EXTREME_CLOSE: 5
} as const;

const SYSTEM_SHOTS = new Set(['ESTABLISHING', 'SYSTEM_WIDE', 'AERIAL_NETWORK', 'TOPDOWN_PROCESS']);
const OBJECT_SHOTS = new Set(['MECHANICAL_DETAIL', 'MACRO_DETAIL', 'OPERATION']);
const OPPOSITE: Partial<Record<HslScreenFlowDirection, HslScreenFlowDirection>> = {
  LEFT_TO_RIGHT: 'RIGHT_TO_LEFT', RIGHT_TO_LEFT: 'LEFT_TO_RIGHT',
  FORWARD: 'BACKWARD', BACKWARD: 'FORWARD', UP: 'DOWN', DOWN: 'UP'
};

function mediaClass(mode: string): string {
  const normalized = mode.toLowerCase();
  if (normalized.includes('remotion') || normalized.includes('diagram') || normalized.includes('graphic')) return 'REMOTION';
  if (normalized.includes('kling') || normalized.includes('ai_') || normalized.includes('reconstruction')) return 'GENERATED';
  if (normalized.includes('typography') || normalized.includes('text')) return 'TYPOGRAPHY';
  if (normalized.includes('real') || normalized.includes('licensed') || normalized.includes('archive')) return 'REAL';
  return normalized;
}

function screenFlow(scene: CinematicContinuitySceneView): {
  direction: HslScreenFlowDirection;
  source: HslScreenFlowSource;
} {
  const mode = scene.visual_mode.toLowerCase();
  if (mode.includes('left_to_right')) return {direction: 'LEFT_TO_RIGHT', source: 'VISUAL_PLAN'};
  if (mode.includes('right_to_left')) return {direction: 'RIGHT_TO_LEFT', source: 'VISUAL_PLAN'};
  if (
    scene.camera.motivation === 'FOLLOW_FLOW' &&
    (scene.camera.direction === 'LEFT_TO_RIGHT' || scene.camera.direction === 'RIGHT_TO_LEFT')
  ) {
    return {direction: scene.camera.direction, source: 'CAMERA_INTENT'};
  }
  return {direction: 'UNKNOWN', source: 'NOT_AVAILABLE'};
}

function reversalMotivation(scene: CinematicContinuitySceneView): HslContinuityMotivation | null {
  const text = scene.narrative_intent.toLowerCase();
  if (/counter[- ]?flow/.test(text)) return 'COUNTER_FLOW';
  if (/return|back toward|back through/.test(text)) return 'RETURN_PATH';
  if (/failure|interrupt|propagat.*back|reverse failure/.test(text)) return 'FAILURE_REVERSAL';
  if (/earlier|previously|rewind|temporal reversal/.test(text)) return 'TEMPORAL_REVERSAL';
  if (/reorient|opposite side|other direction/.test(text)) return 'GEOGRAPHIC_REORIENTATION';
  if (/contrast|however|instead|but /.test(text)) return 'NARRATIVE_CONTRAST';
  return null;
}

function focusTokens(value: string): Set<string> {
  const ignored = new Set(['the', 'a', 'an', 'of', 'to', 'and', 'system', 'network']);
  return new Set(value.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 2 && !ignored.has(token)));
}

function relatedFocus(left: string, right: string): boolean {
  const leftTokens = focusTokens(left);
  return [...focusTokens(right)].some((token) => leftTokens.has(token));
}

function focusHandoff(from: CinematicContinuitySceneView, to: CinematicContinuitySceneView, reset: boolean): HslFocusHandoff {
  if (reset) return 'RESET';
  if (relatedFocus(from.focus_target, to.focus_target)) return 'DIRECT';
  if (OBJECT_SHOTS.has(from.shot.shot_type) && SYSTEM_SHOTS.has(to.shot.shot_type)) return 'OBJECT_TO_SYSTEM';
  if (SYSTEM_SHOTS.has(from.shot.shot_type) && OBJECT_SHOTS.has(to.shot.shot_type)) return 'SYSTEM_TO_OBJECT';
  if (
    from.beat_semantics.some((semantic) => ['cause', 'failure_trigger', 'reveal_constraint'].includes(semantic)) &&
    to.beat_semantics.some((semantic) => ['consequence', 'response', 'propagation'].includes(semantic))
  ) return 'CAUSE_TO_EFFECT';
  if (to.beat_semantics.some((semantic) => ['reveal_dependency', 'reveal_constraint'].includes(semantic))) return 'REVEAL';
  return 'NONE';
}

function scaleRelation(from: CinematicContinuitySceneView, to: CinematicContinuitySceneView, reset: boolean): HslShotScaleRelation {
  if (reset) return 'RESET';
  const delta = SCALE_RANK[to.shot.shot_size] - SCALE_RANK[from.shot.shot_size];
  if (delta > 0) return 'CONTRACT';
  if (delta < 0) return 'EXPAND';
  return 'HOLD';
}

function crossMedia(
  from: CinematicContinuitySceneView,
  to: CinematicContinuitySceneView,
  reset: boolean,
  fromFlow: HslScreenFlowDirection,
  toFlow: HslScreenFlowDirection
): HslCrossMediaContinuity {
  if (mediaClass(from.visual_mode) === mediaClass(to.visual_mode)) return 'NOT_APPLICABLE';
  if (reset) return 'RESET';
  if (fromFlow !== 'UNKNOWN' && fromFlow === toFlow) return 'PRESERVED';
  return 'UNKNOWN';
}

function pairAnalysis(from: CinematicContinuitySceneView, to: CinematicContinuitySceneView): {
  relation: Omit<CinematicContinuityRelation, 'scene_id'>;
  warnings: CinematicContinuityWarning[];
} {
  const fromFlow = screenFlow(from);
  const toFlow = screenFlow(to);
  const scaleDelta = Math.abs(SCALE_RANK[to.shot.shot_size] - SCALE_RANK[from.shot.shot_size]);
  const chapterChanged = Boolean(from.chapter_id && to.chapter_id && from.chapter_id !== to.chapter_id);
  const reset = chapterChanged && (mediaClass(from.visual_mode) !== mediaClass(to.visual_mode) || scaleDelta >= 3);
  const reversal = fromFlow.direction !== 'UNKNOWN' && OPPOSITE[fromFlow.direction] === toFlow.direction;
  const motivation = reversal ? reversalMotivation(to) : null;
  const warnings: CinematicContinuityWarning[] = [];
  let axisStrategy: CinematicContinuityRelation['axis_strategy'] = 'NOT_APPLICABLE';
  if (reset) axisStrategy = 'RESET';
  else if (reversal && motivation) axisStrategy = 'REVERSE_MOTIVATED';
  else if (reversal) {
    axisStrategy = 'PRESERVE';
    warnings.push({
      code: 'UNMOTIVATED_DIRECTION_REVERSAL', severity: 'HIGH', owner: 'CinematicShotDirectorAgent',
      run_length: null, detail: `${from.scene_id} -> ${to.scene_id}`
    });
    warnings.push({
      code: 'AXIS_DISCONTINUITY', severity: 'HIGH', owner: 'ContinuityDirectorAgent',
      run_length: null, detail: 'System-axis direction reverses without supported motivation.'
    });
  } else if (fromFlow.direction !== 'UNKNOWN' && fromFlow.direction === toFlow.direction) axisStrategy = 'PRESERVE';

  const handoff = focusHandoff(from, to, reset);
  const scale = scaleRelation(from, to, reset);
  const mediaContinuity = crossMedia(from, to, reset, fromFlow.direction, toFlow.direction);
  if (scaleDelta >= 4 && !reset) warnings.push({
    code: 'SCALE_JUMP', severity: 'LOW', owner: 'ContinuityDirectorAgent',
    run_length: null, detail: `${from.shot.shot_size} -> ${to.shot.shot_size}`
  });
  if (mediaContinuity === 'UNKNOWN') warnings.push({
    code: 'CROSS_MEDIA_DISCONTINUITY', severity: 'LOW', owner: 'VisualPlan',
    run_length: null, detail: `${mediaClass(from.visual_mode)} -> ${mediaClass(to.visual_mode)}`
  });

  const bridge = handoff === 'DIRECT' ? 'OBJECT'
    : handoff === 'CAUSE_TO_EFFECT' ? 'SEMANTIC'
      : scale === 'CONTRACT' || scale === 'EXPAND' ? 'SCALE'
        : fromFlow.direction !== 'UNKNOWN' && fromFlow.direction === toFlow.direction ? 'MOTION_VECTOR'
          : SYSTEM_SHOTS.has(to.shot.shot_type) ? 'GEOGRAPHIC'
            : 'NONE';
  return {
    relation: {
      screen_flow: fromFlow,
      axis_strategy: axisStrategy,
      axis_motivation: axisStrategy === 'REVERSE_MOTIVATED' ? motivation : null,
      shot_scale_relation: scale,
      focus_handoff: handoff,
      bridge_candidate: bridge,
      cross_media_continuity: mediaContinuity
    },
    warnings
  };
}

function repetitionWarnings(scene: CinematicContinuitySceneView, memory: ContinuityDirectorEpisodeResult['decisions'][number]['continuity']['sequence_memory']): CinematicContinuityWarning[] {
  const warnings: CinematicContinuityWarning[] = [];
  const add = (
    run: number,
    code: CinematicContinuityWarning['code'],
    owner: CinematicContinuityWarning['owner']
  ) => {
    if (run >= 4) warnings.push({code, severity: run >= 5 ? 'HIGH' : 'MEDIUM', owner, run_length: run, detail: null});
  };
  add(memory.same_shot_type_run, 'REPEATED_SHOT_TYPE', 'CinematicShotDirectorAgent');
  add(memory.same_shot_size_run, 'REPEATED_SHOT_SIZE', 'CinematicShotDirectorAgent');
  add(memory.same_composition_run, 'REPEATED_COMPOSITION', 'CinematicShotDirectorAgent');
  if (scene.camera.movement !== 'STATIC') {
    add(memory.same_camera_movement_run, 'REPEATED_CAMERA_MOVEMENT', 'CinematicShotDirectorAgent');
  }
  if (warnings.length >= 2) warnings.push({
    code: 'VISUAL_MONOTONY', severity: 'HIGH', owner: 'ContinuityDirectorAgent',
    run_length: Math.max(
      memory.same_shot_type_run, memory.same_shot_size_run,
      memory.same_camera_movement_run, memory.same_composition_run
    ),
    detail: 'Multiple visual dimensions repeat across the recent sequence.'
  });
  if (
    screenFlow(scene).direction === 'UNKNOWN' &&
    (scene.shot.shot_type === 'TRACKING_FLOW' || scene.beat_semantics.includes('follow_flow'))
  ) warnings.push({
    code: 'UNKNOWN_SCREEN_FLOW', severity: 'LOW', owner: 'VisualPlan', run_length: null,
    detail: 'Flow semantics exist without supported screen direction.'
  });
  return warnings;
}

export class ContinuityDirectorAgent {
  constructor(private readonly telemetry: CinematicTelemetryPort) {}

  public runEpisode(input: Readonly<ContinuityDirectorEpisodeInput>): ContinuityDirectorEpisodeResult {
    this.telemetry.emit('cinematic.continuity.started', {
      productionId: input.productionId, episodeId: input.episodeId,
      continuityMetrics: {sceneCount: input.scenes.length}
    });
    try {
      if (input.scenes.length === 0) {
        throw new CinematicValidationError('CINEMATIC_CONTINUITY_FAILED', 'ordered scenes are required');
      }
      const contexts = buildCinematicContinuityContexts(input.episodeId, input.scenes);
      const pairs = input.scenes.slice(0, -1).map((scene, index) => pairAnalysis(scene, input.scenes[index + 1]));
      const decisions = contexts.map((context) => {
        const incomingPair = pairs[context.currentIndex - 1];
        const outgoingPair = pairs[context.currentIndex];
        const warnings = [
          ...(incomingPair?.warnings || []),
          ...repetitionWarnings(context.currentScene, context.recentHistory)
        ];
        const status = input.scenes.length === 1 ? 'NOT_APPLICABLE'
          : warnings.some((warning) => warning.severity === 'HIGH') ? 'REVISION_RECOMMENDED'
            : warnings.length > 0 ? 'WARN' : 'PASS';
        const continuity = {
          status,
          incoming: incomingPair ? {...incomingPair.relation, scene_id: input.scenes[context.currentIndex - 1].scene_id} : null,
          outgoing: outgoingPair ? {...outgoingPair.relation, scene_id: input.scenes[context.currentIndex + 1].scene_id} : null,
          sequence_memory: context.recentHistory,
          warnings
        } as const;
        this.telemetry.emit('cinematic.continuity.scene_analyzed', {
          productionId: input.productionId,
          episodeId: input.episodeId,
          sceneId: context.currentScene.scene_id,
          continuitySceneMetrics: {
            previousSceneId: context.previousScenes.at(-1)?.scene_id,
            nextSceneId: context.nextScenes[0]?.scene_id,
            continuityStatus: status,
            axisStrategy: continuity.incoming?.axis_strategy || continuity.outgoing?.axis_strategy || 'NOT_APPLICABLE',
            shotScaleRelation: continuity.incoming?.shot_scale_relation || continuity.outgoing?.shot_scale_relation || 'NOT_APPLICABLE',
            focusHandoff: continuity.incoming?.focus_handoff || continuity.outgoing?.focus_handoff || 'NONE',
            bridgeCandidate: continuity.incoming?.bridge_candidate || continuity.outgoing?.bridge_candidate || 'NONE',
            warningCount: warnings.length
          }
        });
        return {sceneId: context.currentScene.scene_id, continuity};
      });
      const allWarnings = decisions.flatMap((decision) => decision.continuity.warnings);
      const metrics = {
        sceneCount: input.scenes.length,
        passCount: decisions.filter((decision) => decision.continuity.status === 'PASS').length,
        warnCount: allWarnings.length,
        revisionRecommendedCount: decisions.filter((decision) => decision.continuity.status === 'REVISION_RECOMMENDED').length,
        axisReversalCount: decisions.filter((decision) => decision.continuity.incoming?.axis_strategy === 'REVERSE_MOTIVATED').length,
        unknownFlowCount: decisions.filter((decision) => (
          decision.continuity.incoming?.screen_flow.direction === 'UNKNOWN' ||
          decision.continuity.outgoing?.screen_flow.direction === 'UNKNOWN'
        )).length,
        crossMediaContinuityCount: decisions.filter((decision) => decision.continuity.incoming?.cross_media_continuity === 'PRESERVED').length,
        repeatedCameraWarningCount: allWarnings.filter((warning) => warning.code === 'REPEATED_CAMERA_MOVEMENT').length,
        repeatedCompositionWarningCount: allWarnings.filter((warning) => warning.code === 'REPEATED_COMPOSITION').length
      };
      const result = {decisions, metrics};
      validateContinuityEpisodeResult(result, input);
      this.telemetry.emit('cinematic.continuity.completed', {
        productionId: input.productionId, episodeId: input.episodeId, continuityMetrics: metrics
      });
      return result;
    } catch (error) {
      if (error instanceof CinematicValidationError) {
        this.telemetry.emit('cinematic.continuity.validation_failed', {
          productionId: input.productionId, episodeId: input.episodeId,
          errorCode: error.code, message: error.message
        });
      }
      this.telemetry.emit('cinematic.continuity.failed', {
        productionId: input.productionId, episodeId: input.episodeId,
        errorCode: error instanceof CinematicValidationError ? error.code : 'CINEMATIC_CONTINUITY_FAILED',
        message: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
}
