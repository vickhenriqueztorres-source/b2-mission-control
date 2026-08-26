import {HslAttentionRole, HslVisualFunction, HslVisualMode} from '../../editorial/types/editorial';
import {CinematicScenePlanV1} from '../../cinematic/types/cinematicPlans';
import {HslMotionDesign} from '../../motion/motionDesign';
import {HslAudioStrategy, HslGenerationStrategy, HslMotionRouteDecision, HslPremiumMotionFamily, HslVeoMotionContract} from '../../motion/generatedMotion';

export type HslEnergy = 'LOW' | 'MEDIUM' | 'HIGH';
export type HslTransitionType = 'CUT' | 'MATCH_FLOW' | 'MATCH_SHAPE' | 'SCALE_BRIDGE' | 'DIP_TO_OBSIDIAN';

export interface HslMicroEvent {
  readonly at_percent: number;
  readonly action: string;
  readonly subject: string;
}

export interface HslRemotionCue {
  readonly at_percent: number;
  readonly type: 'label' | 'flow_line' | 'callout' | 'metric' | 'source_note' | 'ai_disclosure';
  readonly text?: string;
  readonly color_role: 'primary' | 'yellow' | 'blue' | 'orange' | 'muted';
}

export type HslVisualShotVariant = 'ESTABLISH' | 'PROCESS' | 'DETAIL' | 'CONSEQUENCE';

export interface HslExecutableVisualShot {
  readonly schema: 'hsl.execution.visual-shot.v1';
  readonly schema_version: '1.0.0';
  readonly episode_id: string;
  readonly parent_scene_id: string;
  readonly shot_id: string;
  readonly shot_index: number;
  readonly variant: HslVisualShotVariant;
  readonly visual_mode: HslVisualMode;
  readonly visual_subject: string;
  readonly planned_duration_seconds: number;
  readonly evidence_status: string;
  readonly ai_disclosure_required: boolean;
  readonly visual_function: HslVisualFunction | null;
  readonly visual_identity_contract_version?: string;
  readonly required_visual_reference_set?: string;
  readonly start_frame_prompt: string | null;
  readonly motion: Readonly<{
    start_state: string;
    motion_change: string;
    end_state: string;
    camera_motion: string;
    motion_prompt: string;
  }> | null;
  readonly motion_design?: HslMotionDesign;
  readonly generation_strategy?: HslGenerationStrategy;
  readonly audio_strategy?: HslAudioStrategy;
  readonly motion_family?: HslPremiumMotionFamily | null;
  readonly motion_route?: HslMotionRouteDecision;
  readonly veo_motion?: HslVeoMotionContract;
}

export interface HslExecutableScene {
  readonly schema: 'hsl.execution.scene.v1';
  readonly schema_version: '1.0.0';
  readonly episode_id: string;
  readonly scene_id: string;
  readonly chapter_id: string;
  readonly narrative_function: string;
  readonly voiceover: string;
  readonly visual_mode: string;
  readonly visual_subject: string;
  readonly evidence_status: string;
  readonly ai_disclosure_required: boolean;
  readonly visual_function: HslVisualFunction | null;
  readonly attention_role?: HslAttentionRole;
  readonly attention_loop_id?: string | null;
  readonly pause_after_ms?: number;
  readonly cinematic_source_revision: string;
  readonly energy: HslEnergy;
  readonly planned_duration_seconds: number;
  readonly shot: CinematicScenePlanV1['shot'];
  readonly camera: CinematicScenePlanV1['camera'];
  readonly continuity: CinematicScenePlanV1['continuity'];
  readonly micro_events: readonly HslMicroEvent[];
  readonly transition: Readonly<{type: HslTransitionType; motivation: string}>;
  readonly remotion_choreography: readonly HslRemotionCue[];
  readonly start_frame_prompt: string | null;
  readonly motion: Readonly<{
    start_state: string;
    motion_change: string;
    end_state: string;
    camera_motion: string;
    motion_prompt: string;
  }> | null;
  readonly visual_shots: readonly HslExecutableVisualShot[];
  readonly execution_revision: string;
}

export interface HslExecutionPlan {
  readonly schema: 'hsl.execution.episode.v1';
  readonly schema_version: '1.0.0';
  readonly episode_id: string;
  readonly source_episode_package: string;
  readonly source_cinematic_plan: string;
  readonly status: 'EXECUTION_PLAN_APPROVED';
  readonly scenes: readonly string[];
  readonly generated_scene_ids: readonly string[];
  readonly generated_shot_ids: readonly string[];
  readonly total_visual_shots: number;
  readonly target_visual_cadence_seconds: number;
  readonly visual_coverage_report: string;
  readonly visual_identity_contract_version?: string;
  readonly required_visual_reference_set?: string;
  readonly execution_revision: string;
  readonly generated_at: string;
}
