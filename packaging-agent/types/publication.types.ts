export type ThumbnailVariantId = 'A' | 'B' | 'C';

export type StrategicRole = 'MECHANISM' | 'CONSEQUENCE' | 'FINAL_HANDOFF';

export type GazeDirection = 'AT_CAMERA' | 'AT_EVIDENCE_RIGHT' | 'AT_EVIDENCE_LEFT' | 'DOWN_AT_DOCUMENT';

export type EmotionTrigger =
  | 'SURPRISE_DISCOVERY'
  | 'CONSEQUENCE_COLLAPSE'
  | 'CONTRADICTION_FRAUD'
  | 'TECH_CURIOSITY'
  | 'SYSTEMIC_SUSPICION';

export interface ThumbnailConcept {
  readonly variant_id: ThumbnailVariantId;
  readonly role: StrategicRole;
  readonly target_audience_intent: 'BROWSE' | 'SEARCH' | 'SUGGESTED' | 'HYBRID';
  readonly emotion_trigger: EmotionTrigger;
  readonly focal_subject: string;
  readonly gaze_direction: GazeDirection;
  readonly evidence_highlight: string;
  readonly headline_text: string;
  readonly headline_lines: readonly string[];
  readonly subheadline_text: string;
  readonly category_badge: string;
  readonly color_palette: {
    readonly background: string;
    readonly accent: string;
    readonly telemetry: string;
    readonly textPrimary: string;
  };
  readonly prompt_for_dalle: string;
  readonly composition_side: 'LEFT' | 'RIGHT';
  readonly rational: string;
}

export interface TitleCandidate {
  readonly variant_id: ThumbnailVariantId;
  readonly title: string;
  readonly type: 'SEARCH_INTENT' | 'BROWSE_CURIOSITY' | 'PARADOX_CONTRADICTION';
  readonly desire_driver: string;
  readonly target_ctr_goal: string;
}

export interface ChapterItem {
  readonly time_seconds: number;
  readonly timestamp: string;
  readonly title: string;
  readonly search_intent_topic: string;
}

export interface YouTubePublicationMetadata {
  readonly title_candidates: readonly TitleCandidate[];
  readonly recommended_title: string;
  readonly recommended_thumbnail_variant: ThumbnailVariantId;
  readonly hook_lines: readonly string[];
  readonly description_full: string;
  readonly chapters: readonly ChapterItem[];
  readonly tags: {
    readonly core_entities: readonly string[];
    readonly technical_mechanisms: readonly string[];
    readonly search_intent_queries: readonly string[];
    readonly channel_branding: readonly string[];
    readonly all_flat_tags: readonly string[];
  };
  readonly hashtags: readonly string[];
  readonly shorts_bridge: {
    readonly short_hook: string;
    readonly bridge_question: string;
    readonly pinned_comment: string;
  };
  readonly ab_test_matrix: {
    readonly hypothesis_a: string;
    readonly hypothesis_b: string;
    readonly hypothesis_c: string;
    readonly primary_decision_metric: 'WATCH_TIME_SHARE' | 'CTR_24H';
  };
}

export interface PublicationPackageOutput {
  readonly production_id: string;
  readonly episode_id: string;
  readonly generated_at: string;
  readonly thumbnails: readonly {
    readonly variant_id: ThumbnailVariantId;
    readonly role: StrategicRole;
    readonly headline: string;
    readonly full_4k_path: string;
    readonly mobile_preview_320x180_path: string;
  }[];
  readonly contact_sheet_960x180_path: string;
  readonly metadata: YouTubePublicationMetadata;
  readonly summary_md_path: string;
}
