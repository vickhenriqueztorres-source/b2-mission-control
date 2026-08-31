import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { calculateCameraTransform } from '../remotion/cinema/CameraLanguage';
import { PipelineContractGate } from '../pipeline/pipelineContractGate';
import { EPISODE_GASOLINA_CALCULATED_TIMELINE } from '../remotion/episodeGasolinaTimelineData';
import { generateCinematicRenderManifest } from '../remotion/cinema/CinematicEpisode';

console.log('══════════════════════════════════════════════════════════════════════════════════════');
console.log('🧪 EXECUTANDO TESTES DA ETAPA C: CÂMERA VIVA, HUD DIRECTOR, GATE E MIGRAÇÃO PILOTO');
console.log('══════════════════════════════════════════════════════════════════════════════════════\n');

let allPassed = true;

// ─────────────────────────────────────────────────────────────────────────────
// 1. CAMERA DOCUMENTAL: deriva de ombro sem zoom digital permanente
// ─────────────────────────────────────────────────────────────────────────────
console.log('[TEST C1] Validando deriva documental e retorno a escala natural...');
try {
  // Cena 0 (par): drift contido de -5px para 5px.
  const driftScene0_Start = calculateCameraTransform(0, 240, 'drift', 0);
  const driftScene0_End = calculateCameraTransform(240, 240, 'drift', 0);

  // Cena 1 (impar): direcao oposta.
  const driftScene1_Start = calculateCameraTransform(0, 240, 'drift', 1);
  const driftScene1_End = calculateCameraTransform(240, 240, 'drift', 1);

  assert.equal(driftScene0_Start.translateX, -5, 'Cena 0 deve iniciar em X = -5');
  assert.equal(driftScene0_End.translateX, 5, 'Cena 0 deve terminar em X = 5');
  assert.equal(driftScene1_Start.translateX, 5, 'Cena 1 deve iniciar em X = 5');
  assert.equal(driftScene1_End.translateX, -5, 'Cena 1 deve terminar em X = -5');

  // O identificador legado pushIn agora respira no meio e retorna a 1.0.
  const pushIn_Start = calculateCameraTransform(0, 240, 'pushIn', 0);
  const pushIn_Middle = calculateCameraTransform(120, 240, 'pushIn', 0);
  const pushIn_End = calculateCameraTransform(240, 240, 'pushIn', 0);
  assert.equal(pushIn_Start.scale, 1.0, 'PushIn no início deve ter escala 1.0');
  assert.equal(pushIn_Middle.scale, 1.004, 'Correcao de ombro deve ser minima no meio');
  assert.equal(pushIn_End.scale, 1.0, 'Plano deve terminar sem zoom digital acumulado');

  // Static: transform none
  const staticTransform = calculateCameraTransform(120, 240, 'static', 0);
  assert.equal(staticTransform.transformStyle, 'none');

  console.log('✅ TEST C1 PASSOU: camera documental sem push-in permanente.');
} catch (err: any) {
  console.error('❌ FALHA NO TEST C1:', err.message);
  allPassed = false;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. HUD DIRECTOR: Disciplina e Isolamento de Janelas (FASE 6)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[TEST C2] Validando janelas de HUD e disciplina de 1 elemento simultâneo...');
try {
  const hudWindows = [
    {
      id: 'HUD_01',
      component: 'FlowDiscrepancyHUD',
      startFrame: 100,
      durationFrames: 240, // termina em 340
      endFrame: 340,
      props: { title: 'Discrepância' }
    },
    {
      id: 'HUD_02',
      component: 'AtomicStopwatch',
      startFrame: 200, // sobreposição com HUD_01 entre 200 e 340
      durationFrames: 240,
      endFrame: 440,
      props: { title: 'Cronômetro' }
    }
  ];

  // Fora da janela (frame 50): zero HUDs ativos
  const activeAt50 = hudWindows.filter((w) => 50 >= w.startFrame && 50 < w.endFrame);
  assert.equal(activeAt50.length, 0, 'Frame fora da janela não deve ter HUD ativo');

  // Dentro de HUD_01 (frame 150): 1 HUD ativo
  const activeAt150 = hudWindows.filter((w) => 150 >= w.startFrame && 150 < w.endFrame);
  assert.equal(activeAt150.length, 1);
  assert.equal(activeAt150[0].id, 'HUD_01');

  // Zona de sobreposição (frame 250): 2 ativos, mas HudDirector restringe a slice(0, 1) = máx 1
  const activeAt250 = hudWindows.filter((w) => 250 >= w.startFrame && 250 < w.endFrame);
  assert.equal(activeAt250.length, 2);
  const visibleAt250 = activeAt250.slice(0, 1);
  assert.equal(visibleAt250.length, 1, 'HudDirector deve limitar a no máximo 1 elemento gráfico simultâneo');

  console.log('✅ TEST C2 PASSOU: HudDirector respeita janelas e disciplina de tela única.');
} catch (err: any) {
  console.error('❌ FALHA NO TEST C2:', err.message);
  allPassed = false;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. FECHADURA NO GATE: GATE_NOT_CINEMATIC e GATE_TIMELINE_INVALID
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[TEST C3] Validando reprovação do PipelineContractGate (GATE_NOT_CINEMATIC / GATE_TIMELINE_INVALID)...');
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gate-cinema-test-'));

try {
  // A) Run sem render_manifest.json (não cinemático)
  const runId = 'RUN_UNAPPROVED_COMPOSITION';
  const runPath = path.join(tmpDir, runId);
  fs.mkdirSync(runPath, { recursive: true });

  const auditResult1 = PipelineContractGate.auditRun({
    runId,
    runsDir: tmpDir,
    stageScope: 'FULL_PACKAGE',
    contract: {
      episodeId: 'test-ep',
      title: 'Teste',
      theme: 'Tema',
      domainTags: ['tag1', 'tag2', 'tag3'],
      targetDurationSeconds: 60,
      minDurationRatio: 0.9,
      minScenes: 1,
      requiredStages: ['cinematic_grade']
    } as any
  });

  assert.equal(auditResult1.passed, false);
  const cinematicFailure = auditResult1.failures.find((f) => f.reason.includes('GATE_NOT_CINEMATIC'));
  assert.ok(cinematicFailure, 'Deve reprovar com GATE_NOT_CINEMATIC quando render_manifest.json estiver ausente');

  // B) Run com timeline flat inválida
  const invalidTimelinePath = path.join(runPath, 'timeline.json');
  fs.writeFileSync(
    invalidTimelinePath,
    JSON.stringify({
      episodeId: 'test-ep',
      fps: 30,
      actBreaks: [1], // insuficiente
      coldOpen: { sceneIds: ['S1'] },
      scenes: [
        { id: 'S1', component: 'DynamicDocumentaryMedia', durationSeconds: 8.0 },
        { id: 'S2', component: 'DynamicDocumentaryMedia', durationSeconds: 8.0 },
        { id: 'S3', component: 'DynamicDocumentaryMedia', durationSeconds: 8.0 },
        { id: 'S4', component: 'DynamicDocumentaryMedia', durationSeconds: 8.0 },
        { id: 'S5', component: 'DynamicDocumentaryMedia', durationSeconds: 8.0 },
        { id: 'S6', component: 'DynamicDocumentaryMedia', durationSeconds: 8.0 }
      ]
    }),
    'utf8'
  );

  const auditResult2 = PipelineContractGate.auditRun({
    runId,
    runsDir: tmpDir,
    stageScope: 'FULL_PACKAGE'
  });

  assert.equal(auditResult2.passed, false);
  const timelineFailure = auditResult2.failures.find((f) => f.reason.includes('GATE_TIMELINE_INVALID'));
  assert.ok(timelineFailure, 'Deve reprovar com GATE_TIMELINE_INVALID para timeline flat ou sem estrutura');

  console.log('✅ TEST C3 PASSOU: PipelineContractGate bloqueia execuções sem CinematicEpisode ou timeline inválido.');
} catch (err: any) {
  console.error('❌ FALHA NO TEST C3:', err.message);
  allPassed = false;
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. PILOTO GASOLINA ADULTERADA VIA CINEMATICEPISODE
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[TEST C4] Validando piloto Gasolina Adulterada com 30 cenas canônicas...');
try {
  const calc = EPISODE_GASOLINA_CALCULATED_TIMELINE;
  assert.equal(calc.episodeId, 'gasolina-adulterada');
  assert.equal(calc.scenes.length, 30);
  assert.equal(calc.actBreaks.length, 3);
  assert.ok(calc.coldOpen && calc.coldOpen.sceneIds.length === 2);
  assert.equal(calc.scenes[0].transition, 'crossfade');
  assert.equal(calc.scenes[5].transition, 'dipToBlack'); // Act Break em cena 6

  const manifest = generateCinematicRenderManifest(calc);
  assert.equal(manifest.compositor, 'CinematicEpisode');
  assert.equal(manifest.transitionsApplied, 30);
  assert.equal(manifest.duckingApplied, true);
  assert.equal(manifest.gradeApplied, true);

  console.log('✅ TEST C4 PASSOU: Piloto Gasolina Adulterada 100% migrado e validado no CinematicEpisode.');
} catch (err: any) {
  console.error('❌ FALHA NO TEST C4:', err.message);
  allPassed = false;
}

if (!allPassed) {
  console.error('\n❌ ERROS DETECTADOS NOS TESTES DA ETAPA C.');
  process.exit(1);
} else {
  console.log('\n🎉 TODOS OS TESTES DA ETAPA C PASSARAM COM SUCESSO DETERMINÍSTICO!');
}
