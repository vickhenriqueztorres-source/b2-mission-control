import crypto from 'crypto';
import {HslAttentionRole, HslEpisodeSeed} from '../types/editorial';
import {HslReferenceInsightSnapshot, phraseFingerprints} from '../reference/referenceInsightIngestAgent';
import type {HslAudienceStrategy} from '../eugene/eugeneRagRuntime';

export interface HslAttentionSceneRole {
  readonly scene_id: string;
  readonly attention_role: HslAttentionRole;
  readonly loop_id: string | null;
  readonly pause_after_ms: number;
}

export interface HslAttentionArchitecture {
  readonly schema: 'hsl.editorial.attention-architecture.v1';
  readonly schema_version: '1.0.0';
  readonly episode_id: string;
  readonly counterintuitive_angle: string;
  readonly hook: Readonly<{
    pattern: 'VISIBLE_VS_HIDDEN';
    viewer_question: string;
    scene_id: string;
    entry_strategy: 'FAMILIAR_SITUATION' | 'PROBLEM_OR_CONSEQUENCE' | 'MECHANISM' | 'NEW_EVIDENCE' | 'TECHNICAL_DETAIL';
  }>;
  readonly promised_payoff: string;
  readonly loops: readonly Readonly<{loop_id: string; open_scene_id: string; payoff_scene_id: string; question_role: 'REVEAL_CONSTRAINT'}>[];
  readonly ending_reframe: string;
  readonly original_phrase_patterns: Readonly<{
    hook: string;
    open_loop: string;
    mechanism: string;
    constraint: string;
    propagation: string;
    reframe: string;
  }>;
  readonly scene_roles: readonly HslAttentionSceneRole[];
  readonly reference_principle_ids: readonly string[];
  readonly eugene_retrieval_revisions: readonly string[];
  readonly status: 'ATTENTION_ARCHITECTURE_APPROVED';
}

export interface HslPhraseOriginalityResult {
  readonly schema: 'hsl.editorial.reference-originality-gate.v1';
  readonly schema_version: '1.0.0';
  readonly episode_id: string;
  readonly reference_only: true;
  readonly shingle_words: number;
  readonly scanned_shingles: number;
  readonly matched_fingerprints: readonly Readonly<{scene_id: string; fingerprint: string}>[];
  readonly status: 'PASS';
}

export class AttentionArchitectureAgent {
  run(seed: Readonly<HslEpisodeSeed>, references: Readonly<HslReferenceInsightSnapshot>, audience?: Readonly<HslAudienceStrategy>): HslAttentionArchitecture {
    if (seed.scenes.length < 2) throw new Error('HSL_ATTENTION_REQUIRES_MULTIPLE_SCENES');
    const opening = seed.scenes[0];
    const payoff = seed.scenes.find((scene, index) => index > 0 && /constraint|failure|bottleneck/i.test(`${scene.chapter_id} ${scene.narrative_function}`));
    if (!payoff) throw new Error('HSL_ATTENTION_PAYOFF_SCENE_REQUIRED');
    const ending = seed.scenes[seed.scenes.length - 1];
    const loopId = 'L001';
    const sceneRoles = seed.scenes.map((scene, index): HslAttentionSceneRole => {
      if (index === 0) return {scene_id: scene.scene_id, attention_role: 'HOOK', loop_id: loopId, pause_after_ms: 180};
      if (scene.scene_id === payoff.scene_id) return {scene_id: scene.scene_id, attention_role: 'PAYOFF', loop_id: loopId, pause_after_ms: 260};
      if (scene.scene_id === ending.scene_id) return {scene_id: scene.scene_id, attention_role: 'REFRAME', loop_id: null, pause_after_ms: 320};
      if (index === seed.scenes.length - 2) return {scene_id: scene.scene_id, attention_role: 'PARTIAL_PAYOFF', loop_id: loopId, pause_after_ms: 180};
      return {scene_id: scene.scene_id, attention_role: 'DEEPEN', loop_id: loopId, pause_after_ms: 100};
    });
    const principleIds = references.lessons.flatMap((lesson) => lesson.principles).filter((principle) =>
      ['OPEN_WITH_CONCRETE_CONTRAST', 'CREATE_A_VIEWER_QUESTION', 'TRACK_OPEN_LOOPS', 'DELIVER_EXPLICIT_PAYOFFS', 'PREFER_EVIDENCE_BACKED_COUNTERINTUITION'].includes(principle)
    );
    return {
      schema: 'hsl.editorial.attention-architecture.v1',
      schema_version: '1.0.0',
      episode_id: seed.episode_id,
      counterintuitive_angle: `The visible outcome depends less on a single final action than on the hidden constraint: ${seed.main_constraint}.`,
      hook: {
        pattern: 'VISIBLE_VS_HIDDEN', viewer_question: seed.central_question, scene_id: opening.scene_id,
        entry_strategy: audience ? this.entryStrategy(audience.awareness.level) : 'FAMILIAR_SITUATION'
      },
      promised_payoff: seed.original_interpretation,
      loops: [{loop_id: loopId, open_scene_id: opening.scene_id, payoff_scene_id: payoff.scene_id, question_role: 'REVEAL_CONSTRAINT'}],
      ending_reframe: seed.original_interpretation,
      original_phrase_patterns: {
        hook: 'What you see is [VISIBLE EVENT]. What makes it possible begins somewhere else.',
        open_loop: 'But where does the real constraint appear?',
        mechanism: '[OBJECT] changes custody, control and risk at every handoff.',
        constraint: 'Capacity exists on paper. Throughput is what the operation can actually use.',
        propagation: 'A local delay does not stay local.',
        reframe: 'The visible product is [RESULT]. The hidden product is synchronization.'
      },
      scene_roles: sceneRoles,
      reference_principle_ids: principleIds,
      eugene_retrieval_revisions: audience?.retrievals.filter((item) => item.stage === 'HOOK_AND_SCRIPT').map((item) => item.retrieval_revision) || [],
      status: 'ATTENTION_ARCHITECTURE_APPROVED'
    };
  }

  private entryStrategy(level: number): HslAttentionArchitecture['hook']['entry_strategy'] {
    if (level <= 1) return 'FAMILIAR_SITUATION';
    if (level === 2) return 'PROBLEM_OR_CONSEQUENCE';
    if (level === 3) return 'MECHANISM';
    if (level === 4) return 'NEW_EVIDENCE';
    return 'TECHNICAL_DETAIL';
  }
}

export class PhraseOriginalityGate {
  run(seed: Readonly<HslEpisodeSeed>, references: Readonly<HslReferenceInsightSnapshot>): HslPhraseOriginalityResult {
    const sourceFingerprints = new Set(references.phrase_fingerprints);
    const matches: Array<{scene_id: string; fingerprint: string}> = [];
    let scannedShingles = 0;
    for (const scene of seed.scenes) {
      const fingerprints = phraseFingerprints(scene.voiceover, references.fingerprint_policy.shingle_words);
      scannedShingles += fingerprints.length;
      fingerprints.filter((fingerprint) => sourceFingerprints.has(fingerprint)).forEach((fingerprint) => matches.push({scene_id: scene.scene_id, fingerprint}));
    }
    if (matches.length) {
      const evidence = crypto.createHash('sha256').update(matches.map((match) => `${match.scene_id}:${match.fingerprint}`).join('|')).digest('hex').slice(0, 16);
      throw new Error(`HSL_REFERENCE_PHRASE_MATCH:${matches.map((match) => match.scene_id).join(',')}:${evidence}`);
    }
    return {
      schema: 'hsl.editorial.reference-originality-gate.v1',
      schema_version: '1.0.0',
      episode_id: seed.episode_id,
      reference_only: true,
      shingle_words: references.fingerprint_policy.shingle_words,
      scanned_shingles: scannedShingles,
      matched_fingerprints: [],
      status: 'PASS'
    };
  }
}
