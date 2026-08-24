import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test, {after} from 'node:test';
import {AttentionArchitectureAgent, PhraseOriginalityGate} from '../hsl/editorial/attention/attentionArchitecture';
import {HSL_PILOT_EPISODE_SEED} from '../hsl/editorial/config/pilotEpisodeSeed';
import {
  buildReferenceInsightSnapshot,
  HslReferenceInsightSnapshot,
  phraseFingerprints,
  ReferenceInsightIngestAgent
} from '../hsl/editorial/reference/referenceInsightIngestAgent';

const roots: string[] = [];
after(() => roots.forEach((root) => fs.rmSync(root, {recursive: true, force: true})));

function temporaryRoot(): string {
  const value = fs.mkdtempSync(path.join(os.tmpdir(), 'hsl-reference-'));
  roots.push(value);
  return value;
}

const lessonFiles = [
  'aula_01_trabalhando_com_audio.json',
  'aula_02_va_na_contramao.json',
  'aula_03_psicologia_da_atencao.json',
  'aula_04_sobre_o_que_falar.json',
  'aula_05_criatividade_vs_produtividade.json'
];

test('reference ingestion rejects noisy ASR segments and stores fingerprints instead of transcript prose', () => {
  const root = temporaryRoot();
  for (const fileName of lessonFiles) {
    fs.writeFileSync(path.join(root, fileName), JSON.stringify({
      language: 'pt',
      text: 'must never be persisted in the snapshot',
      segments: [
        {text: 'one two three four five six seven eight nine ten eleven', no_speech_prob: 0.01, compression_ratio: 1, avg_logprob: -0.1},
        {text: 'repeated invalid audio', no_speech_prob: 0.8, compression_ratio: 3, avg_logprob: -2}
      ]
    }));
  }
  const snapshot = buildReferenceInsightSnapshot(root);
  assert.equal(snapshot.lessons.reduce((sum, lesson) => sum + lesson.accepted_segment_count, 0), 5);
  assert.equal(snapshot.lessons.reduce((sum, lesson) => sum + lesson.rejected_segment_count, 0), 5);
  assert.equal(snapshot.fingerprint_policy.stores_source_prose, false);
  assert.ok(snapshot.phrase_fingerprints.length > 0);
  assert.doesNotMatch(JSON.stringify(snapshot), /must never be persisted|one two three/);
});

test('attention architecture opens one loop, pays it off and ends with a reframe', () => {
  const references = new ReferenceInsightIngestAgent().run();
  const result = new AttentionArchitectureAgent().run(HSL_PILOT_EPISODE_SEED, references);
  assert.equal(result.status, 'ATTENTION_ARCHITECTURE_APPROVED');
  assert.equal(result.scene_roles[0].attention_role, 'HOOK');
  assert.equal(result.loops[0].open_scene_id, 'HSL_001');
  assert.equal(result.loops[0].payoff_scene_id, 'HSL_006');
  assert.equal(result.scene_roles.find((scene) => scene.scene_id === 'HSL_006')?.attention_role, 'PAYOFF');
  assert.equal(result.scene_roles.at(-1)?.attention_role, 'REFRAME');
  assert.match(result.original_phrase_patterns.reframe, /hidden product is synchronization/i);
});

test('phrase originality gate blocks an exact ten-word reference sequence', () => {
  const copiedPhrase = 'this exact source phrase contains ten distinct words for detection now';
  const references: HslReferenceInsightSnapshot = {
    schema: 'hsl.editorial.reference-insights.v1', schema_version: '1.0.0', reference_only: true,
    generated_at: '2026-08-20T00:00:00.000Z', source_directory_label: 'DOCS ABRAHAM/transcriptions',
    asr_quality_policy: {max_no_speech_probability_exclusive: 0.5, max_compression_ratio_inclusive: 2.4, min_average_log_probability_inclusive: -1},
    fingerprint_policy: {algorithm: 'sha256-normalized-word-shingle', shingle_words: 10, stores_source_prose: false},
    lessons: [{
      lesson_id: 'TEST', source_file: 'test.json', source_sha256: '0'.repeat(64), language: 'en', segment_count: 1,
      accepted_segment_count: 1, rejected_segment_count: 0, rejection_counts: {no_speech: 0, compression: 0, low_confidence: 0}, principles: []
    }],
    phrase_fingerprints: phraseFingerprints(copiedPhrase)
  };
  const seed = {
    ...HSL_PILOT_EPISODE_SEED,
    scenes: HSL_PILOT_EPISODE_SEED.scenes.map((scene, index) => index === 0 ? {...scene, voiceover: copiedPhrase} : scene)
  };
  assert.throws(() => new PhraseOriginalityGate().run(seed, references), /HSL_REFERENCE_PHRASE_MATCH:HSL_001/);
});

test('current pilot script passes the Abraham reference phrase gate', () => {
  const references = new ReferenceInsightIngestAgent().run();
  const result = new PhraseOriginalityGate().run(HSL_PILOT_EPISODE_SEED, references);
  assert.equal(result.status, 'PASS');
  assert.equal(result.matched_fingerprints.length, 0);
  assert.ok(result.scanned_shingles > 0);
});
