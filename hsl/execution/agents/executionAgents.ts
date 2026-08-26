import {CinematicScenePlanV1} from '../../cinematic/types/cinematicPlans';
import {HslEditorialSceneContract, HslVisualFunction, HslVisualMode} from '../../editorial/types/editorial';
import {HslEnergy, HslExecutableScene, HslExecutableVisualShot, HslMicroEvent, HslRemotionCue, HslTransitionType, HslVisualShotVariant} from '../types/execution';
import {buildMotionDesign} from '../../motion/motionDesign';
import {MotionRouteDirectorAgent, VeoMotionDirectorAgent} from '../../motion/generatedMotion';
import {CinematicCoverageDirectorAgent} from '../cinematicCoveragePolicy';
import {
  assertHslStartFramePromptIdentity,
  buildHslStartFramePrompt,
  HSL_PREMIUM_MOTION_REFERENCE_SET,
  HSL_VISUAL_IDENTITY_CONTRACT_VERSION
} from '../../../config/hslVisualIdentity';

function words(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export class SceneChoreographyAgent {
  run(scene: Readonly<HslEditorialSceneContract>, cinematic: Readonly<CinematicScenePlanV1>): readonly HslMicroEvent[] {
    const focus = cinematic.direction.focus_target || scene.visual_subject;
    if (scene.visual_mode === 'generated_ai') {
      return [
        {at_percent: 18, action: 'establish_stable_system_state', subject: focus},
        {at_percent: 42, action: 'begin_single_physical_change', subject: focus},
        {at_percent: 82, action: 'settle_into_end_state', subject: focus}
      ];
    }
    if (scene.visual_mode === 'remotion') {
      return [
        {at_percent: 12, action: 'reveal_system_context', subject: focus},
        {at_percent: 44, action: 'trace_primary_relationship', subject: focus},
        {at_percent: 78, action: 'hold_conclusion_for_reading', subject: focus}
      ];
    }
    return [{at_percent: 50, action: 'redirect_attention_to_primary_subject', subject: focus}];
  }
}

export class EditRhythmDirectorAgent {
  run(scene: Readonly<HslEditorialSceneContract>): {energy: HslEnergy; plannedDurationSeconds: number} {
    const highAttention = ['HOOK', 'PAYOFF', 'REFRAME'].includes(scene.attention_role || 'NONE');
    const high = highAttention || /hook|failure|propagation|constraint|conclusion/i.test(`${scene.chapter_id} ${scene.narrative_function}`);
    const low = /context|limitation|establish/i.test(scene.narrative_function);
    const configuredWpm = Number(process.env.HSL_NARRATION_WPM || 145);
    const narrationWpm = Number.isFinite(configuredWpm) && configuredWpm >= 100 && configuredWpm <= 220 ? configuredWpm : 145;
    const duration = Math.max(4, Math.min(18, Math.round((words(scene.voiceover) / narrationWpm) * 60 * 10) / 10));
    return {energy: high ? 'HIGH' : low ? 'LOW' : 'MEDIUM', plannedDurationSeconds: duration};
  }
}

export class TransitionDirectorAgent {
  run(cinematic: Readonly<CinematicScenePlanV1>, isLast: boolean): {type: HslTransitionType; motivation: string} {
    if (isLast) return {type: 'DIP_TO_OBSIDIAN', motivation: 'close_episode'};
    const bridge = cinematic.continuity.outgoing?.bridge_candidate;
    if (bridge === 'MOTION_VECTOR' || bridge === 'LINE') return {type: 'MATCH_FLOW', motivation: `continue_${bridge.toLowerCase()}`};
    if (bridge === 'SHAPE' || bridge === 'OBJECT') return {type: 'MATCH_SHAPE', motivation: `continue_${bridge.toLowerCase()}`};
    if (bridge === 'SCALE') return {type: 'SCALE_BRIDGE', motivation: 'preserve_scale_relationship'};
    return {type: 'CUT', motivation: 'editorial_clarity'};
  }
}

export class RemotionChoreographyAgent {
  run(scene: Readonly<HslEditorialSceneContract>): readonly HslRemotionCue[] {
    const cues: HslRemotionCue[] = [
      {at_percent: 5, type: 'label', text: scene.chapter_title, color_role: 'yellow'},
      {at_percent: 88, type: 'source_note', text: scene.source_url || undefined, color_role: 'muted'}
    ];
    if (scene.visual_mode === 'remotion') cues.splice(1, 0, {at_percent: 34, type: 'flow_line', color_role: 'yellow'});
    if (scene.ai_disclosure_required) cues.push({at_percent: 0, type: 'ai_disclosure', text: 'AI VISUALIZATION', color_role: 'muted'});
    return cues;
  }
}

export class KlingMotionDirectorAgent {
  run(scene: Readonly<HslEditorialSceneContract>, cinematic: Readonly<CinematicScenePlanV1>): HslExecutableScene['motion'] {
    if (scene.visual_mode !== 'generated_ai') return null;
    const visualFunction: HslVisualFunction = scene.visual_function || 'reconstruction';
    const startState = `${scene.visual_subject} is physically stable and fully established`;
    const motionChange = visualFunction === 'invisible_process'
      ? `one controlled process becomes visible through continuous mechanical movement in ${scene.visual_subject}`
      : `the camera reveals the physical scale and spatial relationship of ${scene.visual_subject}`;
    const endState = `${scene.visual_subject} remains recognizable, with the declared change complete and no new objects introduced`;
    const cameraMotion = `${cinematic.camera.movement.toLowerCase().replace(/_/g, ' ')} at ${cinematic.camera.intensity.toLowerCase()} intensity, moving ${cinematic.camera.direction.toLowerCase().replace(/_/g, ' ')}`;
    return {
      start_state: startState,
      motion_change: motionChange,
      end_state: endState,
      camera_motion: cameraMotion,
      motion_prompt: `${motionChange}. Preserve exact geometry, materials, lighting direction and scale from the first frame. End with ${endState}.`
    };
  }
}

export class VisualShotDirectorAgent {
  readonly targetCadenceSeconds: number;
  private readonly generatedShotsPerScene: number;
  private readonly premiumMotionShotIds: ReadonlySet<string>;
  private readonly preserveExistingGeneratedKling: boolean;
  private readonly coverageDirector = new CinematicCoverageDirectorAgent();

  constructor() {
    const configuredCadence = Number(process.env.HSL_VISUAL_CADENCE_SECONDS || 4.2);
    this.targetCadenceSeconds = Number.isFinite(configuredCadence) && configuredCadence >= 3 && configuredCadence <= 8 ? configuredCadence : 4.2;
    const configuredGenerated = Number(process.env.HSL_GENERATED_SHOTS_PER_SCENE || 5);
    this.generatedShotsPerScene = Number.isInteger(configuredGenerated) && configuredGenerated >= 1 && configuredGenerated <= 5 ? configuredGenerated : 5;
    this.premiumMotionShotIds = new Set((process.env.HSL_PREMIUM_MOTION_SHOTS || '')
      .split(',').map((value) => value.trim()).filter(Boolean));
    this.preserveExistingGeneratedKling = process.env.HSL_PRESERVE_EXISTING_GENERATED_AS_KLING === 'true';
  }

  run(scene: Readonly<HslEditorialSceneContract>, source: Readonly<CinematicScenePlanV1>, durationSeconds: number): readonly HslExecutableVisualShot[] {
    const attentionCadence = ['HOOK', 'PAYOFF', 'REFRAME'].includes(scene.attention_role || 'NONE')
      ? Math.max(3.4, this.targetCadenceSeconds - .5)
      : this.targetCadenceSeconds;
    const shotCount = Math.max(2, Math.min(5, Math.round(durationSeconds / attentionCadence)));
    const baseDuration = Math.floor((durationSeconds / shotCount) * 1000) / 1000;
    const generatedIndexes = this.generatedIndexes(scene.visual_mode, shotCount);
    return Array.from({length: shotCount}, (_, index) => {
      const variant = this.variant(index, shotCount);
      const shotId = `${scene.scene_id}_V${String(index + 1).padStart(2, '0')}`;
      const plannedDuration = index === shotCount - 1
        ? Math.round((durationSeconds - baseDuration * (shotCount - 1)) * 1000) / 1000
        : baseDuration;
      const sourceGenerated = generatedIndexes.has(index);
      const decision = this.coverageDirector.run({scene, variant, index, shotCount, sourceGenerated});
      const manuallyPromoted = decision.visualMode === 'remotion' && this.premiumMotionShotIds.has(shotId);
      const visualMode = manuallyPromoted ? 'generated_ai' : decision.visualMode;
      const visualSubject = `${scene.visual_subject} - ${this.variantIntent(variant)}`;
      const generated = visualMode === 'generated_ai';
      const editorialVisualMode = scene.visual_mode as HslVisualMode;
      const promotedFromGraphics = generated && editorialVisualMode !== 'generated_ai';
      const promotionTarget = manuallyPromoted ? 'VEO' : decision.provider || undefined;
      const route = new MotionRouteDirectorAgent().run({
        visualMode: editorialVisualMode, visualFunction: generated ? scene.visual_function || 'reconstruction' : null,
        narrativeFunction: scene.narrative_function, visualSubject: scene.visual_subject, variant,
        promoteRemotion: promotedFromGraphics || manuallyPromoted,
        promotionTarget,
        promoteWithExactOverlay: manuallyPromoted || decision.requiresExactOverlay,
        forceKling: editorialVisualMode === 'generated_ai' && (
          decision.provider === 'KLING' || this.preserveExistingGeneratedKling
        )
      });
      const veoMotion = route.motion_family && (route.generation_strategy === 'VEO_MOTION_GRAPHIC' || route.generation_strategy === 'VEO_REMOTION_HYBRID')
        ? new VeoMotionDirectorAgent().run({
          family: route.motion_family, subject: visualSubject,
          durationSeconds: plannedDuration, audioStrategy: route.audio_strategy
        })
        : undefined;
      return {
        schema: 'hsl.execution.visual-shot.v1', schema_version: '1.0.0',
        episode_id: source.episode_id, parent_scene_id: scene.scene_id,
        shot_id: shotId, shot_index: index + 1,
        variant, visual_mode: visualMode, visual_subject: visualSubject,
        planned_duration_seconds: plannedDuration, evidence_status: scene.evidence_status,
        ai_disclosure_required: generated, visual_function: generated ? scene.visual_function || 'reconstruction' : null,
        visual_identity_contract_version: generated ? HSL_VISUAL_IDENTITY_CONTRACT_VERSION : undefined,
        required_visual_reference_set: generated ? HSL_PREMIUM_MOTION_REFERENCE_SET.name : undefined,
        start_frame_prompt: generated ? buildHslStartFramePrompt({
          subject: visualSubject,
          composition: this.composition(variant),
          lens: source.shot.lens_language.toLowerCase().replace(/_/g, ' '),
          subjectAnchor: source.shot.subject_anchor.toLowerCase().replace(/_/g, ' ')
        }) : null,
        motion: generated ? this.motion(scene, source, variant) : null,
        generation_strategy: route.generation_strategy, audio_strategy: route.audio_strategy,
        motion_family: route.motion_family, motion_route: route,
        ...(veoMotion ? {veo_motion: veoMotion} : {}),
        ...(visualMode === 'remotion' ? {motion_design: buildMotionDesign({
          narrativeFunction: scene.narrative_function, visualSubject, voiceover: scene.voiceover, variant
        })} : {}),
        ...(route.generation_strategy === 'VEO_REMOTION_HYBRID' ? {motion_design: buildMotionDesign({
          narrativeFunction: scene.narrative_function, visualSubject, voiceover: scene.voiceover, variant
        })} : {})
      };
    });
  }

  private generatedIndexes(mode: string, shotCount: number): Set<number> {
    if (mode !== 'generated_ai') return new Set();
    const count = Math.min(this.generatedShotsPerScene, shotCount);
    if (count === shotCount) return new Set(Array.from({length: count}, (_, index) => index));
    if (count === 3 && shotCount === 4) return new Set([0, 2, 3]);
    return new Set(Array.from({length: count}, (_, index) => index));
  }

  private variant(index: number, shotCount: number): HslVisualShotVariant {
    if (index === 0) return 'ESTABLISH';
    if (index === shotCount - 1) return 'CONSEQUENCE';
    return index === 1 ? 'PROCESS' : 'DETAIL';
  }

  private variantIntent(variant: HslVisualShotVariant): string {
    if (variant === 'ESTABLISH') return 'establish the system context and scale';
    if (variant === 'PROCESS') return 'isolate the active process and primary handoff';
    if (variant === 'DETAIL') return 'reveal the critical operational detail';
    return 'resolve into the stated consequence';
  }

  private composition(variant: HslVisualShotVariant): string {
    if (variant === 'ESTABLISH') return 'wide environmental composition with real locations, weather, scale and readable infrastructure relationships';
    if (variant === 'PROCESS') return 'medium photoreal process composition with a physical path visible through pipes, channels, valves, pumps or control-room screens';
    if (variant === 'DETAIL') return 'tight photoreal mechanical detail composition with wet metal, concrete, gauges, valve handles, filters or pipe joints as the visual anchor';
    return 'medium-wide photoreal consequence composition showing the completed state in a real street, plant, reservoir, pump room or household setting';
  }

  private motion(scene: Readonly<HslEditorialSceneContract>, source: Readonly<CinematicScenePlanV1>, variant: HslVisualShotVariant): NonNullable<HslExecutableVisualShot['motion']> {
    const subject = scene.visual_subject;
    const change = variant === 'ESTABLISH'
      ? `the camera slowly reveals the physical scale and spatial relationships of ${subject}`
      : variant === 'PROCESS'
        ? `one controlled process moves continuously through ${subject}`
        : variant === 'DETAIL'
          ? `one precise mechanical handoff completes inside ${subject}`
          : `the visible change settles into its operational consequence in ${subject}`;
    const cameraMotion = `${source.camera.movement.toLowerCase().replace(/_/g, ' ')} at ${source.camera.intensity.toLowerCase()} intensity, moving ${source.camera.direction.toLowerCase().replace(/_/g, ' ')}`;
    const endState = `${subject} remains geometrically consistent and the single declared change is complete`;
    return {
      start_state: `${subject} is stable, coherent and fully established`, motion_change: change,
      end_state: endState, camera_motion: cameraMotion,
      motion_prompt: `${change}. ${cameraMotion}. Preserve exact geometry, materials, lighting direction and scale from the provided first frame. No cuts, no morphing, no new objects. End with ${endState}.`
    };
  }
}

export class VisualCoverageQaAgent {
  validate(scene: Readonly<{scene_id: string; planned_duration_seconds: number; visual_shots: readonly HslExecutableVisualShot[]}>): void {
    if (scene.visual_shots.length < 2) throw new Error(`HSL_VISUAL_COVERAGE_TOO_SPARSE:${scene.scene_id}`);
    const ids = new Set(scene.visual_shots.map((shot) => shot.shot_id));
    if (ids.size !== scene.visual_shots.length) throw new Error(`HSL_VISUAL_SHOT_DUPLICATE:${scene.scene_id}`);
    const total = scene.visual_shots.reduce((sum, shot) => sum + shot.planned_duration_seconds, 0);
    if (Math.abs(total - scene.planned_duration_seconds) > 0.002) throw new Error(`HSL_VISUAL_DURATION_MISMATCH:${scene.scene_id}`);
    for (const shot of scene.visual_shots) {
      if (shot.planned_duration_seconds > 8 || shot.planned_duration_seconds < 2) throw new Error(`HSL_VISUAL_SHOT_DURATION_INVALID:${shot.shot_id}`);
      if (shot.visual_mode === 'generated_ai' && (!shot.start_frame_prompt || !shot.motion || !shot.ai_disclosure_required)) throw new Error(`HSL_GENERATED_SHOT_CONTRACT_INVALID:${shot.shot_id}`);
      if (shot.visual_mode === 'generated_ai') {
        if (shot.visual_identity_contract_version !== HSL_VISUAL_IDENTITY_CONTRACT_VERSION) throw new Error(`HSL_VISUAL_IDENTITY_CONTRACT_REQUIRED:${shot.shot_id}`);
        if (shot.required_visual_reference_set !== HSL_PREMIUM_MOTION_REFERENCE_SET.name) throw new Error(`HSL_VISUAL_REFERENCE_SET_REQUIRED:${shot.shot_id}`);
        assertHslStartFramePromptIdentity(shot.start_frame_prompt!, shot.shot_id);
      }
      if (shot.visual_mode !== 'generated_ai' && (shot.start_frame_prompt || shot.motion)) throw new Error(`HSL_NON_GENERATED_SHOT_HAS_MOTION:${shot.shot_id}`);
    }
  }
}

export class CinematicEditQaAgent {
  validate(scene: Readonly<Omit<HslExecutableScene, 'execution_revision'>>): void {
    if (!scene.voiceover.trim() || !scene.visual_subject.trim()) throw new Error(`HSL_EXECUTION_SCENE_INCOMPLETE:${scene.scene_id}`);
    if (scene.planned_duration_seconds < 3) throw new Error(`HSL_EXECUTION_DURATION_INVALID:${scene.scene_id}`);
    if (scene.visual_mode === 'generated_ai') {
      if (!scene.motion || !scene.start_frame_prompt || !scene.ai_disclosure_required) throw new Error(`HSL_GENERATED_SCENE_CONTRACT_INVALID:${scene.scene_id}`);
      if (!scene.visual_function) throw new Error(`HSL_VISUAL_FUNCTION_REQUIRED:${scene.scene_id}`);
    } else if (scene.motion || scene.start_frame_prompt) {
      throw new Error(`HSL_NON_GENERATED_SCENE_HAS_KLING_DIRECTIVE:${scene.scene_id}`);
    }
    new VisualCoverageQaAgent().validate(scene);
  }
}
