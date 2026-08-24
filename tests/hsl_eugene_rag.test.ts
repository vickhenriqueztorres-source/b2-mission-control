import assert from 'node:assert/strict';
import test from 'node:test';
import {AttentionArchitectureAgent} from '../hsl/editorial/attention/attentionArchitecture';
import {HSL_PILOT_EPISODE_SEED} from '../hsl/editorial/config/pilotEpisodeSeed';
import {
  AudienceStrategyAgent,
  EugeneRagIngestAgent,
  EugeneRagOriginalityGate,
  EugeneRagRetrievalAgent,
  eugenePhraseFingerprints,
  HslEugeneRagSnapshot,
  PromiseDeliveryGate
} from '../hsl/editorial/eugene/eugeneRagRuntime';
import {ReferenceInsightIngestAgent} from '../hsl/editorial/reference/referenceInsightIngestAgent';

test('Eugene index preserves Chroma lineage without storing source prose', () => {
  const snapshot = new EugeneRagIngestAgent().run();
  assert.equal(snapshot.reference_only, true);
  assert.equal(snapshot.collection.name, 'breakthrough_advertising_ptbr');
  assert.equal(snapshot.collection.dimension, 768);
  assert.equal(snapshot.collection.chunk_count, 285);
  assert.equal(snapshot.concepts.length, 9);
  assert.equal(snapshot.storage_policy.stores_source_prose, false);
  assert.equal(snapshot.storage_policy.source_is_factual_research, false);
  assert.ok(snapshot.phrase_fingerprints.length > 60000);
  assert.doesNotMatch(JSON.stringify(snapshot), /"chroma:document"|"document"\s*:|"page_content"/);
});

test('stage retrieval returns only required concepts, principles and hashed chunk receipts', () => {
  const snapshot = new EugeneRagIngestAgent().run();
  const result = new EugeneRagRetrievalAgent().retrieve(snapshot, 'ANGLE_TITLE_THUMBNAIL');
  assert.deepEqual(result.requested_concepts, ['headline_titulo', 'graus_de_sofisticacao', 'mecanismo_unico']);
  assert.ok(result.principles.includes('COMBINE_DESIRE_SPECIFICITY_AND_TENSION'));
  assert.ok(result.chunk_receipts.length > 0);
  assert.ok(result.chunk_receipts.every((receipt) => /^[a-f0-9]{64}$/.test(receipt.content_sha256)));
  assert.match(result.retrieval_revision, /^sha256_[a-f0-9]{32}$/);
});

test('audience strategy adapts pilot entry point, promise, title and thumbnail without replacing approval', () => {
  const snapshot = new EugeneRagIngestAgent().run();
  const result = new AudienceStrategyAgent().run(HSL_PILOT_EPISODE_SEED, snapshot);
  assert.equal(result.awareness.label, 'UNAWARE');
  assert.equal(result.topic_sophistication.label, 'FAMILIAR_TOPIC');
  assert.equal(result.title_strategy.selected_approved_title, HSL_PILOT_EPISODE_SEED.title);
  assert.equal(result.thumbnail_strategy.text, 'BEFORE TAKEOFF');
  assert.equal(result.hook_contract.early_evidence_scene_id, 'HSL_002');
  assert.equal(result.retrievals.length, 5);
  assert.equal(result.status, 'AUDIENCE_STRATEGY_APPROVED');
});

test('Eugene originality gate blocks a literal twelve-word sequence from the RAG source', () => {
  const copied = 'this exact source passage contains twelve words and must be blocked during production now';
  const base = new EugeneRagIngestAgent().run();
  const snapshot: HslEugeneRagSnapshot = {...base, phrase_fingerprints: eugenePhraseFingerprints(copied)};
  const seed = {
    ...HSL_PILOT_EPISODE_SEED,
    scenes: HSL_PILOT_EPISODE_SEED.scenes.map((scene, index) => index === 0 ? {...scene, voiceover: copied} : scene)
  };
  assert.throws(() => new EugeneRagOriginalityGate().run(seed, snapshot), /HSL_EUGENE_PHRASE_MATCH:HSL_001/);
});

test('Abraham attention and Eugene promise delivery operate together', () => {
  const abraham = new ReferenceInsightIngestAgent().run();
  const eugene = new EugeneRagIngestAgent().run();
  const audience = new AudienceStrategyAgent().run(HSL_PILOT_EPISODE_SEED, eugene);
  const attention = new AttentionArchitectureAgent().run(HSL_PILOT_EPISODE_SEED, abraham, audience);
  const result = new PromiseDeliveryGate().run(HSL_PILOT_EPISODE_SEED, audience, attention);
  assert.ok(attention.reference_principle_ids.length > 0);
  assert.ok(attention.eugene_retrieval_revisions.length > 0);
  assert.equal(attention.hook.entry_strategy, 'FAMILIAR_SITUATION');
  assert.equal(result.checks.early_evidence, true);
  assert.equal(result.checks.ending_fulfills_promise, true);
  assert.equal(result.status, 'PASS');
});
