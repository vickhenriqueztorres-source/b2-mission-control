import assert from 'node:assert/strict';
import test from 'node:test';
import { abrahamRag, AbrahamRagService } from '../hsl/editorial/abraham';
import {
  AbrahamRagIngestAgent,
  AbrahamRagRetrievalAgent
} from '../hsl/editorial/abraham/abrahamRagRuntime';
import { HSL_FAIRLIGHT_AUDIO_STEMS, HSL_FAIRLIGHT_RESTORATION_RULES } from '../hsl/postproduction/audioDirectives';

test('Abraham RAG snapshot loads successfully with all 5 modules and chunks', () => {
  const snapshot = new AbrahamRagIngestAgent().run();
  assert.equal(snapshot.schema, 'hsl.editorial.abraham-rag-index.v1');
  assert.equal(snapshot.reference_only, true);
  assert.equal(snapshot.modules.length, 5);
  assert.ok(snapshot.total_chunks >= 40);
  assert.ok(snapshot.phrase_fingerprints.length > 10000);
});

test('Abraham RAG retrieves audio engineering directives with stems and Fairlight rules', () => {
  const result = abrahamRag.getDirectives('AUDIO_ENGINEERING', 3);
  assert.ok(result.total_matches > 0);
  assert.ok(result.principles.some((p) => p.includes('STEMS') || p.includes('AUDIO')));
  assert.ok(result.augmented_context.includes('Pista 1: Narrador') || result.augmented_context.includes('Fairlight'));
});

test('Abraham RAG retrieves attention psychology with the 7 levers and Zeigarnik loops', () => {
  const result = abrahamRag.query({
    query: 'alavancas psicologicas zeigarnik loops',
    domain: 'ATTENTION_PSYCHOLOGY',
    top_k: 3
  });
  assert.ok(result.total_matches > 0);
  assert.ok(result.principles.some((p) => p.includes('ZEIGARNIK') || p.includes('PATTERN') || p.includes('NUMERICAL')));
  assert.ok(result.augmented_context.includes('Especificidade Numérica') || result.augmented_context.includes('Zeigarnik'));
});

test('Abraham RAG retrieves contrarian strategy and YouTube long form directives', () => {
  const result = abrahamRag.query({
    query: 'youtube longo videos curtos contrariano',
    domain: 'CONTRARIAN_STRATEGY',
    top_k: 3
  });
  assert.ok(result.total_matches > 0);
  assert.ok(result.principles.some((p) => p.includes('YOUTUBE_LONG') || p.includes('CONTRARIAN')));
});

test('Abraham RAG prompt augmentation formats structured context and rules', () => {
  const basePrompt = 'Gere um roteiro para um documentário sobre inteligência artificial.';
  const augmented = abrahamRag.augmentPrompt(basePrompt, 'ATTENTION_PSYCHOLOGY');
  assert.ok(augmented.includes(basePrompt));
  assert.ok(augmented.includes('DIRETRIZES E HEURÍSTICAS DO CRIADOR ZEN'));
  assert.ok(augmented.includes('LEIS OBRIGATÓRIAS:'));
});

test('Abraham RAG provides ready-to-use audio, copywriting, content, and productivity directives', () => {
  const audio = abrahamRag.getAudioDirectives();
  assert.equal(audio.stems.length, 6);
  assert.equal(audio.stems[0].name, 'Narrador (Principal)');
  assert.equal(audio.stems[5].name, 'Trilha Sonora (Music Bed)');
  assert.equal(audio.lufsTarget, '-14 LUFS integrado para YouTube / Podcasts (-1.0 dB True Peak)');

  const copy = abrahamRag.getCopywritingDirectives();
  assert.equal(copy.levers.length, 7);
  assert.ok(copy.loopGuidance.includes('Zeigarnik'));

  const content = abrahamRag.getContentStrategyDirectives();
  assert.ok(content.videoZeroProtocol.includes('Vídeo Zero'));

  const productivity = abrahamRag.getProductivityDirectives();
  assert.ok(productivity.dualNetworks.includes('DMN'));
  assert.ok(productivity.mentalOffloading.includes('Tem-que'));
});

test('Abraham RAG script structure validator checks for hooks, loops, and duration', () => {
  const invalidScript = {
    title: 'Curto',
    duration_minutes: 5,
    loop_opened: false,
    hook: ''
  };
  const validationInvalid = abrahamRag.validateScriptStructure(invalidScript);
  assert.equal(validationInvalid.valid, false);
  assert.ok(validationInvalid.errors.length > 0);
  assert.ok(validationInvalid.warnings.length > 0);

  const validScript = {
    title: '8 Regras Ocultas do Algoritmo Que Ninguém Te Conta',
    duration_minutes: 22,
    loop_opened: true,
    hook: 'Se você criar mais um vídeo de 15 segundos, você está cavando a própria cova digital.'
  };
  const validationValid = abrahamRag.validateScriptStructure(validScript);
  assert.equal(validationValid.valid, true);
  assert.equal(validationValid.errors.length, 0);
});

test('Postproduction Fairlight audio directives match Abraham standards', () => {
  assert.equal(HSL_FAIRLIGHT_AUDIO_STEMS.length, 6);
  assert.equal(HSL_FAIRLIGHT_RESTORATION_RULES.deHummerFrequencies.americas, 60);
  assert.equal(HSL_FAIRLIGHT_RESTORATION_RULES.deHummerFrequencies.europeAsia, 50);
  assert.equal(HSL_FAIRLIGHT_RESTORATION_RULES.targetLoudness.integratedLufs, -14.0);
});
