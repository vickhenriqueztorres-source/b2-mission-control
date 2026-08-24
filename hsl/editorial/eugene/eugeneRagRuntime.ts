import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import type {HslAttentionArchitecture} from '../attention/attentionArchitecture';
import {
  HslAudienceAwarenessLevel,
  HslEpisodeSeed,
  HslTopicSophisticationLevel
} from '../types/editorial';
import {normalizeReferenceWords} from '../reference/referenceInsightIngestAgent';

export const HSL_EUGENE_SHINGLE_WORDS = 12;

export type HslEugeneConceptId =
  | 'desejo_de_massa'
  | 'canalizacao_do_desejo'
  | 'niveis_de_consciencia'
  | 'graus_de_sofisticacao'
  | 'mecanismo_unico'
  | 'identificacao'
  | 'crenca'
  | 'headline_titulo'
  | 'dimensoes_do_desejo';

export type HslEugeneRetrievalStage =
  | 'TOPIC_SELECTION'
  | 'AUDIENCE_DIAGNOSIS'
  | 'ANGLE_TITLE_THUMBNAIL'
  | 'HOOK_AND_SCRIPT'
  | 'PROMISE_DELIVERY';

export interface HslEugeneChunkReceipt {
  readonly chunk_receipt_id: string;
  readonly content_sha256: string;
  readonly part: string;
  readonly section: string;
  readonly page_start: number;
  readonly page_end: number;
  readonly concepts: readonly HslEugeneConceptId[];
}

export interface HslEugeneConceptIndex {
  readonly concept_id: HslEugeneConceptId;
  readonly chunk_count: number;
  readonly principles: readonly string[];
  readonly chunk_receipt_ids: readonly string[];
}

export interface HslEugeneRagSnapshot {
  readonly schema: 'hsl.editorial.eugene-rag-index.v1';
  readonly schema_version: '1.0.0';
  readonly reference_only: true;
  readonly generated_at: string;
  readonly source_directory_label: 'RAG EUGENE';
  readonly source_pdf_sha256: string;
  readonly source_chroma_sha256: string;
  readonly collection: Readonly<{name: 'breakthrough_advertising_ptbr'; dimension: number; chunk_count: number}>;
  readonly storage_policy: Readonly<{
    stores_source_prose: false;
    fingerprint_algorithm: 'sha256-normalized-12-word-shingle-128bit';
    source_is_factual_research: false;
  }>;
  readonly concepts: readonly HslEugeneConceptIndex[];
  readonly chunk_receipts: readonly HslEugeneChunkReceipt[];
  readonly phrase_fingerprints: readonly string[];
}

export interface HslEugeneRetrievalReceipt {
  readonly schema: 'hsl.editorial.eugene-retrieval.v1';
  readonly stage: HslEugeneRetrievalStage;
  readonly requested_concepts: readonly HslEugeneConceptId[];
  readonly principles: readonly string[];
  readonly chunk_receipts: readonly HslEugeneChunkReceipt[];
  readonly reference_only: true;
  readonly retrieval_revision: string;
}

export interface HslAudienceStrategy {
  readonly schema: 'hsl.editorial.audience-strategy.v1';
  readonly schema_version: '1.0.0';
  readonly episode_id: string;
  readonly primary_audience: string;
  readonly awareness: Readonly<{level: HslAudienceAwarenessLevel; label: string; what_they_know: string; knowledge_gap: string}>;
  readonly topic_sophistication: Readonly<{level: HslTopicSophisticationLevel; label: string; required_novelty: string}>;
  readonly desire: Readonly<{mass_desire: string; urgency: 'LOW' | 'MEDIUM' | 'HIGH'; persistence: 'LOW' | 'MEDIUM' | 'HIGH'; scope: 'NICHE' | 'BROAD'}>;
  readonly human_conflict: string;
  readonly angle: string;
  readonly mechanism: string;
  readonly belief_requirement: string;
  readonly promise: string;
  readonly title_strategy: Readonly<{
    formula: 'DESIRE_PLUS_SPECIFICITY_PLUS_TENSION';
    selected_approved_title: string;
    candidates: readonly Readonly<{title: string; role: 'APPROVED' | 'MECHANISM_VARIANT' | 'CONSEQUENCE_VARIANT'}>[];
  }>;
  readonly thumbnail_strategy: Readonly<{subject: string; tension: string; text: string; max_words: 4}>;
  readonly hook_contract: Readonly<{required_delivery: readonly string[]; first_scene_id: string; early_evidence_scene_id: string}>;
  readonly script_progression: readonly string[];
  readonly next_video_question: string;
  readonly retrievals: readonly HslEugeneRetrievalReceipt[];
  readonly status: 'AUDIENCE_STRATEGY_APPROVED';
}

interface MetadataRow {
  readonly id: number;
  readonly key: string;
  readonly string_value: string | null;
  readonly int_value: number | null;
}

const CONCEPT_PRINCIPLES: Readonly<Record<HslEugeneConceptId, readonly string[]>> = {
  desejo_de_massa: ['IDENTIFY_EXISTING_HUMAN_DESIRE', 'DO_NOT_MANUFACTURE_DESIRE'],
  canalizacao_do_desejo: ['CHANNEL_DESIRE_INTO_DOCUMENTARY_PROMISE'],
  niveis_de_consciencia: ['ADAPT_ENTRY_POINT_TO_AUDIENCE_KNOWLEDGE', 'MATCH_TECHNICAL_DEPTH_TO_AWARENESS'],
  graus_de_sofisticacao: ['INCREASE_SPECIFICITY_AS_TOPIC_SATURATES', 'USE_NEW_INTERPRETATION_FOR_FAMILIAR_TOPICS'],
  mecanismo_unico: ['NAME_THE_CAUSAL_MECHANISM', 'EXPLAIN_HOW_THE_HIDDEN_SYSTEM_PRODUCES_THE_VISIBLE_OUTCOME'],
  identificacao: ['CONNECT_SYSTEM_CONSEQUENCE_TO_VIEWER_VISIBLE_LIFE'],
  crenca: ['EARN_BELIEF_WITH_EARLY_EVIDENCE', 'SUPPORT_PROMISE_WITH_SOURCED_MECHANISM'],
  headline_titulo: ['COMBINE_DESIRE_SPECIFICITY_AND_TENSION', 'KEEP_TITLE_THUMBNAIL_HOOK_ON_ONE_PROMISE'],
  dimensoes_do_desejo: ['ASSESS_URGENCY_PERSISTENCE_AND_SCOPE']
};

const STAGE_CONCEPTS: Readonly<Record<HslEugeneRetrievalStage, readonly HslEugeneConceptId[]>> = {
  TOPIC_SELECTION: ['desejo_de_massa', 'dimensoes_do_desejo', 'graus_de_sofisticacao'],
  AUDIENCE_DIAGNOSIS: ['niveis_de_consciencia', 'identificacao', 'desejo_de_massa'],
  ANGLE_TITLE_THUMBNAIL: ['headline_titulo', 'graus_de_sofisticacao', 'mecanismo_unico'],
  HOOK_AND_SCRIPT: ['niveis_de_consciencia', 'mecanismo_unico', 'crenca'],
  PROMISE_DELIVERY: ['crenca', 'headline_titulo', 'canalizacao_do_desejo']
};

function sha256(value: string | Buffer): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function compactSha(value: string): string {
  return sha256(value).slice(0, 32);
}

export function eugenePhraseFingerprints(text: string): string[] {
  const words = normalizeReferenceWords(text);
  const values = new Set<string>();
  for (let index = 0; index + HSL_EUGENE_SHINGLE_WORDS <= words.length; index += 1) {
    values.add(compactSha(words.slice(index, index + HSL_EUGENE_SHINGLE_WORDS).join(' ')));
  }
  return [...values].sort();
}

function splitConcepts(value: string): HslEugeneConceptId[] {
  if (!value || value === 'geral') return [];
  return value.split(',').map((item) => item.trim()).filter((item): item is HslEugeneConceptId => item in CONCEPT_PRINCIPLES);
}

export function buildEugeneRagSnapshot(ragRoot: string): HslEugeneRagSnapshot {
  const pdfPath = path.join(ragRoot, 'BREAKTHROUGH ADVERTISING - PT-BR.pdf');
  const dbPath = path.join(ragRoot, 'rag_pipeline', 'chroma_db', 'chroma.sqlite3');
  if (!fs.existsSync(pdfPath)) throw new Error(`HSL_EUGENE_PDF_REQUIRED:${pdfPath}`);
  if (!fs.existsSync(dbPath)) throw new Error(`HSL_EUGENE_CHROMA_REQUIRED:${dbPath}`);
  const db = new Database(dbPath, {readonly: true, fileMustExist: true});
  try {
    const collection = db.prepare('SELECT name, dimension FROM collections WHERE name = ?').get('breakthrough_advertising_ptbr') as {name?: string; dimension?: number} | undefined;
    if (!collection || collection.name !== 'breakthrough_advertising_ptbr') throw new Error('HSL_EUGENE_COLLECTION_REQUIRED');
    const rows = db.prepare(`
      SELECT e.id, m.key, m.string_value, m.int_value
      FROM embeddings e
      JOIN embedding_metadata m ON m.id = e.id
      ORDER BY e.id, m.key
    `).all() as MetadataRow[];
    const byId = new Map<number, Map<string, string | number>>();
    for (const row of rows) {
      if (!byId.has(row.id)) byId.set(row.id, new Map());
      byId.get(row.id)!.set(row.key, row.string_value ?? row.int_value ?? '');
    }
    const allFingerprints = new Set<string>();
    const receipts: HslEugeneChunkReceipt[] = [];
    for (const [id, metadata] of byId) {
      const content = String(metadata.get('chroma:document') || '');
      if (!content.trim()) throw new Error(`HSL_EUGENE_CHUNK_DOCUMENT_REQUIRED:${id}`);
      const contentSha = sha256(content);
      const receipt: HslEugeneChunkReceipt = {
        chunk_receipt_id: `eugene_${compactSha(`${id}:${contentSha}`)}`,
        content_sha256: contentSha,
        part: String(metadata.get('parte') || 'UNKNOWN'),
        section: String(metadata.get('titulo_secao') || 'UNKNOWN'),
        page_start: Number(metadata.get('pagina_inicio') || 0),
        page_end: Number(metadata.get('pagina_fim') || 0),
        concepts: splitConcepts(String(metadata.get('conceito_principal') || 'geral'))
      };
      receipts.push(receipt);
      eugenePhraseFingerprints(content).forEach((fingerprint) => allFingerprints.add(fingerprint));
    }
    const concepts = (Object.keys(CONCEPT_PRINCIPLES) as HslEugeneConceptId[]).map((conceptId): HslEugeneConceptIndex => {
      const matching = receipts.filter((receipt) => receipt.concepts.includes(conceptId));
      if (!matching.length) throw new Error(`HSL_EUGENE_CONCEPT_COVERAGE_REQUIRED:${conceptId}`);
      return {concept_id: conceptId, chunk_count: matching.length, principles: CONCEPT_PRINCIPLES[conceptId], chunk_receipt_ids: matching.map((receipt) => receipt.chunk_receipt_id)};
    });
    const latest = Math.max(fs.statSync(pdfPath).mtimeMs, fs.statSync(dbPath).mtimeMs);
    return {
      schema: 'hsl.editorial.eugene-rag-index.v1', schema_version: '1.0.0', reference_only: true,
      generated_at: new Date(latest).toISOString(), source_directory_label: 'RAG EUGENE',
      source_pdf_sha256: sha256(fs.readFileSync(pdfPath)), source_chroma_sha256: sha256(fs.readFileSync(dbPath)),
      collection: {name: 'breakthrough_advertising_ptbr', dimension: Number(collection.dimension || 0), chunk_count: receipts.length},
      storage_policy: {stores_source_prose: false, fingerprint_algorithm: 'sha256-normalized-12-word-shingle-128bit', source_is_factual_research: false},
      concepts, chunk_receipts: receipts, phrase_fingerprints: [...allFingerprints].sort()
    };
  } finally {
    db.close();
  }
}

export function syncEugeneRagSnapshot(ragRoot: string, outputPath: string): HslEugeneRagSnapshot {
  const snapshot = buildEugeneRagSnapshot(ragRoot);
  fs.mkdirSync(path.dirname(outputPath), {recursive: true});
  const temporary = `${outputPath}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  fs.renameSync(temporary, outputPath);
  return snapshot;
}

export class EugeneRagIngestAgent {
  constructor(private readonly snapshotPath = path.resolve(process.cwd(), 'assets/editorial-references/eugene/eugene-rag-index.json')) {}

  run(): HslEugeneRagSnapshot {
    if (!fs.existsSync(this.snapshotPath)) throw new Error(`HSL_EUGENE_RAG_INDEX_REQUIRED:${this.snapshotPath}`);
    const snapshot = JSON.parse(fs.readFileSync(this.snapshotPath, 'utf8')) as HslEugeneRagSnapshot;
    if (snapshot.schema !== 'hsl.editorial.eugene-rag-index.v1' || snapshot.reference_only !== true) throw new Error('HSL_EUGENE_RAG_INDEX_INVALID');
    if (snapshot.storage_policy.stores_source_prose !== false || snapshot.storage_policy.source_is_factual_research !== false) throw new Error('HSL_EUGENE_STORAGE_POLICY_INVALID');
    if (snapshot.collection.name !== 'breakthrough_advertising_ptbr' || snapshot.collection.chunk_count !== snapshot.chunk_receipts.length) throw new Error('HSL_EUGENE_COLLECTION_INVALID');
    return snapshot;
  }
}

export class EugeneRagRetrievalAgent {
  retrieve(snapshot: Readonly<HslEugeneRagSnapshot>, stage: HslEugeneRetrievalStage): HslEugeneRetrievalReceipt {
    const requested = STAGE_CONCEPTS[stage];
    const indexes = requested.map((concept) => snapshot.concepts.find((item) => item.concept_id === concept));
    if (indexes.some((item) => !item)) throw new Error(`HSL_EUGENE_RETRIEVAL_CONCEPT_MISSING:${stage}`);
    const receiptById = new Map(snapshot.chunk_receipts.map((receipt) => [receipt.chunk_receipt_id, receipt]));
    const selectedIds = [...new Set(indexes.flatMap((index) => index!.chunk_receipt_ids.slice(0, 4)))];
    const selectedReceipts = selectedIds.map((id) => receiptById.get(id)).filter((item): item is HslEugeneChunkReceipt => Boolean(item));
    const principles = [...new Set(indexes.flatMap((index) => index!.principles))];
    const revision = compactSha(JSON.stringify({stage, requested, selectedIds, principles}));
    return {
      schema: 'hsl.editorial.eugene-retrieval.v1', stage, requested_concepts: requested,
      principles, chunk_receipts: selectedReceipts, reference_only: true, retrieval_revision: `sha256_${revision}`
    };
  }
}

function awarenessLabel(level: HslAudienceAwarenessLevel): string {
  return ['UNAWARE', 'PROBLEM_AWARE', 'SOLUTION_AWARE', 'TOPIC_AWARE', 'HIGHLY_AWARE'][level - 1];
}

function sophisticationLabel(level: HslTopicSophisticationLevel): string {
  return ['NEW_TOPIC', 'FAMILIAR_TOPIC', 'SATURATED_TOPIC', 'MECHANISM_SATURATED', 'EXPERT_OR_CYNICAL'][level - 1];
}

function novelty(level: HslTopicSophisticationLevel): string {
  if (level <= 1) return 'DIRECT_SUBJECT_PROMISE';
  if (level === 2) return 'SPECIFIC_CONSEQUENCE';
  if (level === 3) return 'NAMED_CAUSAL_MECHANISM';
  if (level === 4) return 'NEW_MECHANISM_OR_INTERPRETATION';
  return 'RARE_EVIDENCE_COMPARISON_OR_DEEP_ANALYSIS';
}

function progression(level: HslAudienceAwarenessLevel): string[] {
  if (level <= 2) return ['VISIBLE_HUMAN_SITUATION', 'PROBLEM_OR_CONSEQUENCE', 'HIDDEN_MECHANISM', 'SOURCED_EVIDENCE', 'PAYOFF_AND_REFRAME'];
  if (level <= 4) return ['CONTROVERSY_OR_CONTRADICTION', 'EARLY_EVIDENCE', 'MECHANISM', 'CONSEQUENCES', 'NEW_INTERPRETATION'];
  return ['RARE_DETAIL', 'KNOWN_VERSION_CONTRADICTION', 'TECHNICAL_EVIDENCE', 'COMPARISON', 'REVISED_INTERPRETATION'];
}

function limitedTitle(value: string): string {
  return value.length <= 100 ? value : `${value.slice(0, 97).trim()}...`;
}

export class AudienceStrategyAgent {
  run(seed: Readonly<HslEpisodeSeed>, snapshot: Readonly<HslEugeneRagSnapshot>): HslAudienceStrategy {
    const profile = seed.audience_strategy || {
      primary_audience: 'Curious general viewers', awareness_level: 2 as const, sophistication_level: 2 as const,
      what_they_know: `They recognize ${seed.object_or_flow}.`, knowledge_gap: `They do not see how ${seed.system_being_analyzed} works as one system.`,
      mass_desire: `Understand the hidden mechanism behind ${seed.object_or_flow}.`, human_conflict: seed.primary_consequence,
      thumbnail_text: 'HIDDEN SYSTEM', next_video_question: `What adjacent system changes the outcome of ${seed.object_or_flow}?`
    };
    if (profile.thumbnail_text.trim().split(/\s+/).length > 4) throw new Error('HSL_EUGENE_THUMBNAIL_TEXT_TOO_LONG');
    const retrieval = new EugeneRagRetrievalAgent();
    const retrievals = (Object.keys(STAGE_CONCEPTS) as HslEugeneRetrievalStage[]).map((stage) => retrieval.retrieve(snapshot, stage));
    const earlyEvidence = seed.scenes.find((scene) => scene.claim_source_ids.length)?.scene_id;
    if (!earlyEvidence) throw new Error('HSL_EUGENE_EARLY_EVIDENCE_SCENE_REQUIRED');
    return {
      schema: 'hsl.editorial.audience-strategy.v1', schema_version: '1.0.0', episode_id: seed.episode_id,
      primary_audience: profile.primary_audience,
      awareness: {level: profile.awareness_level, label: awarenessLabel(profile.awareness_level), what_they_know: profile.what_they_know, knowledge_gap: profile.knowledge_gap},
      topic_sophistication: {level: profile.sophistication_level, label: sophisticationLabel(profile.sophistication_level), required_novelty: novelty(profile.sophistication_level)},
      desire: {mass_desire: profile.mass_desire, urgency: 'MEDIUM', persistence: 'HIGH', scope: 'BROAD'},
      human_conflict: profile.human_conflict,
      angle: seed.original_interpretation,
      mechanism: seed.thesis,
      belief_requirement: `The promise must be supported by the approved source pack and an early scene that demonstrates ${seed.system_being_analyzed}.`,
      promise: seed.original_interpretation,
      title_strategy: {
        formula: 'DESIRE_PLUS_SPECIFICITY_PLUS_TENSION', selected_approved_title: seed.title,
        candidates: [
          {title: seed.title, role: 'APPROVED'},
          {title: limitedTitle(profile.title_candidates?.[0] || `How ${seed.object_or_flow} Actually Works`), role: 'MECHANISM_VARIANT'},
          {title: limitedTitle(profile.title_candidates?.[1] || `Why ${seed.primary_consequence}`), role: 'CONSEQUENCE_VARIANT'}
        ]
      },
      thumbnail_strategy: {subject: seed.hero_visual, tension: profile.human_conflict, text: profile.thumbnail_text, max_words: 4},
      hook_contract: {required_delivery: ['TITLE_PROMISE', 'CONCRETE_FIRST_PROOF', 'OPEN_QUESTION'], first_scene_id: seed.scenes[0].scene_id, early_evidence_scene_id: earlyEvidence},
      script_progression: progression(profile.awareness_level), next_video_question: profile.next_video_question,
      retrievals, status: 'AUDIENCE_STRATEGY_APPROVED'
    };
  }
}

export class EugeneRagOriginalityGate {
  run(seed: Readonly<HslEpisodeSeed>, snapshot: Readonly<HslEugeneRagSnapshot>) {
    const source = new Set(snapshot.phrase_fingerprints);
    const matches: Array<{field: string; fingerprint: string}> = [];
    const values = [{field: 'title', text: seed.title}, ...seed.scenes.map((scene) => ({field: scene.scene_id, text: scene.voiceover}))];
    let scanned = 0;
    for (const value of values) {
      const fingerprints = eugenePhraseFingerprints(value.text);
      scanned += fingerprints.length;
      fingerprints.filter((fingerprint) => source.has(fingerprint)).forEach((fingerprint) => matches.push({field: value.field, fingerprint}));
    }
    if (matches.length) throw new Error(`HSL_EUGENE_PHRASE_MATCH:${[...new Set(matches.map((match) => match.field))].join(',')}`);
    return {schema: 'hsl.editorial.eugene-originality-gate.v1', schema_version: '1.0.0', episode_id: seed.episode_id, reference_only: true, shingle_words: HSL_EUGENE_SHINGLE_WORDS, scanned_shingles: scanned, matched_fingerprints: [], status: 'PASS' as const};
  }
}

export class PromiseDeliveryGate {
  run(seed: Readonly<HslEpisodeSeed>, strategy: Readonly<HslAudienceStrategy>, attention: Readonly<HslAttentionArchitecture>) {
    const errors: string[] = [];
    if (strategy.title_strategy.selected_approved_title !== seed.title) errors.push('TITLE_NOT_APPROVED');
    if (strategy.promise !== seed.original_interpretation) errors.push('PROMISE_NOT_TIED_TO_APPROVED_INTERPRETATION');
    const evidenceIndex = seed.scenes.findIndex((scene) => scene.scene_id === strategy.hook_contract.early_evidence_scene_id);
    if (evidenceIndex < 0 || evidenceIndex > 2) errors.push('EARLY_EVIDENCE_NOT_DELIVERED');
    if (attention.hook.scene_id !== strategy.hook_contract.first_scene_id) errors.push('HOOK_SCENE_MISMATCH');
    if (!attention.loops.length || attention.loops.some((loop) => seed.scenes.findIndex((scene) => scene.scene_id === loop.payoff_scene_id) <= seed.scenes.findIndex((scene) => scene.scene_id === loop.open_scene_id))) errors.push('PROMISE_LOOP_NOT_CLOSED');
    if (attention.ending_reframe !== strategy.promise) errors.push('ENDING_DOES_NOT_FULFILL_PROMISE');
    if (errors.length) throw new Error(`HSL_PROMISE_DELIVERY_FAILED:${errors.join(',')}`);
    return {
      schema: 'hsl.editorial.promise-delivery-gate.v1', schema_version: '1.0.0', episode_id: seed.episode_id,
      checks: {approved_title: true, early_evidence: true, title_hook_alignment: true, loop_payoff: true, ending_fulfills_promise: true},
      next_video_question: strategy.next_video_question, status: 'PASS' as const
    };
  }
}
