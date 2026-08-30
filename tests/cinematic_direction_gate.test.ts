import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { runCinematicDirectionShadowHook } from '../hsl/cinematic/runners/cinematicShadowHook';
import { VideoRepositoryMatcher } from '../hsl/media/videoRepositoryMatcher';
import { PipelineContractGate } from '../pipeline/pipelineContractGate';
import { HybridVideoEngine } from '../pipeline/hybridVideoEngine';
import { assertCinematicPipelineActive } from '../config/hslCinematicFlags';

test('1. Cinematic Direction Gate: falha na direção bloqueia produção com erro fatal', async () => {
  await assert.rejects(
    runCinematicDirectionShadowHook({
      productionId: 'TEST_PROD_FAIL',
      editorialPackagePath: 'non-existent-package.json',
      flags: { pipelineV1Enabled: true, shadowModeEnabled: false, shouldRunShadow: false },
      runner: {
        run: async () => {
          throw new Error('CONTINUITY_TEMPO_COLLISION_DETECTED');
        }
      }
    }),
    /CINEMATIC_DIRECTION_GATE_FAILED: CONTINUITY_TEMPO_COLLISION_DETECTED/
  );
});

test('2. Master Production Guard: recusa renderizar master sem HSL_CINEMATIC_PIPELINE_V1 ativo', () => {
  assert.throws(
    () => assertCinematicPipelineActive(true, { HSL_CINEMATIC_PIPELINE_V1: '0', NODE_ENV: 'development' } as any),
    /HSL_CINEMATIC_PIPELINE_V1_REQUIRED/
  );
});

test('3. Strict Semantic Matcher: prompt genérico Villeneuve vs B-Roll desconexo retorna MISS', () => {
  // Simula requisição para bico de bomba de gasolina
  const request = {
    sceneId: 'GAS_001',
    chapterTitle: 'O Gatilho Cotidiano',
    visualSubject: 'Bico da bomba de gasolina travado no bocal do tanque com asfalto molhado',
    narrativeFunction: 'hook',
    requiredCategory: 'automotive_fuel',
    visualMustInclude: ['bico', 'bomba', 'gasolina', 'combustivel'],
    visualMustNot: ['porto', 'navio', 'esteira', 'turbina', 'container'],
    tags: ['bomba', 'combustivel', 'gasolina']
  };

  const result = VideoRepositoryMatcher.matchScene(request, 'smart');

  // Não pode casar com clips de porto, esteira ou água
  assert.equal(result.matched, false);
  assert.notEqual(result.recommendedAction, 'USE_MATCHED_VIDEO');
  assert.match(result.recommendedAction, /DISPATCH_FIREFLY_ON_DEMAND|STOP_UNMATCHED/);
});

test('4. Duration Gate: master de 84s com seed de 6 min (360s) falha no gatekeeper', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ool-gate-duration-test-'));
  const runId = 'OOL-TEST-DURATION-GATE';
  const runDir = path.join(tempDir, runId);
  const postDir = path.join(runDir, 'postproduction');
  const execDir = path.join(runDir, 'editorial', 'execution');
  fs.mkdirSync(postDir, { recursive: true });
  fs.mkdirSync(execDir, { recursive: true });

  // Cria pacote editorial simulando 1 cena
  fs.writeFileSync(path.join(execDir, 'documentary-edit-package.json'), JSON.stringify({
    episode_id: runId,
    scenes: [{ sceneId: 'SC_001', shotId: 'SHOT_001' }]
  }));

  // Simula narração de 84.03s
  const narrationPath = path.join(postDir, 'narration.mp3');
  // Cria dummy file
  fs.writeFileSync(narrationPath, Buffer.alloc(15000));

  // Simula scene_timings.json de 84.03s
  fs.writeFileSync(path.join(postDir, 'scene_timings.json'), JSON.stringify({
    totalDurationSeconds: 84.03,
    totalDurationFrames: 2521,
    scenes: [{ sceneId: 'SC_001', startFrame: 0, durationFrames: 2521 }]
  }));

  const report = PipelineContractGate.auditRun({
    runId,
    runsDir: tempDir,
    targetDurationMinutes: 6.0, // Meta de 6 min = 360s (84s desvia em ~76%, muito acima do limite de 15%)
    stageScope: 'PRE_RENDER'
  });

  assert.equal(report.passed, false);
  const durationFailure = report.failures.find(f => f.shotId === 'EPISODE_TARGET_DURATION');
  assert.ok(durationFailure, 'Deveria conter failure EPISODE_TARGET_DURATION');
  assert.match(durationFailure.reason, /DURATION_TARGET_MISMATCH/);

  // Limpeza
  fs.rmSync(tempDir, { recursive: true, force: true });
});

test('5. HybridVideoEngine: impede sorteio aleatório por hash quando start frame inexiste', async () => {
  const engine = new HybridVideoEngine();
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ool-engine-test-'));

  await assert.rejects(
    engine.processEpisodeScenes({
      runId: 'OOL-TEST-NO-RANDOM',
      runDirectory: tempDir,
      publicExecutionDirectory: path.join(tempDir, 'public'),
      scenes: [
        {
          scene_id: 'MISSING_FRAME_SCENE',
          chapter_id: 'CH01',
          chapter_title: 'Teste',
          name: 'Cena Sem Frame',
          voiceover_text: 'Texto de teste',
          visual_subject: 'Assunto qualquer',
          take_type: 'CINEMATIC_TAKE',
          visual_must_include: ['bico', 'combustivel'],
          required_category: 'fuel_dispenser_nozzle',
          allowed_sources: ['firefly']
        }
      ]
    }),
    /START_FRAME_NOT_FOUND.*Sorteio aleatório de vídeo do banco é estritamente proibido/
  );

  fs.rmSync(tempDir, { recursive: true, force: true });
});
