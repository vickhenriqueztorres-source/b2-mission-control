import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import {
  parseAndCalculateTimeline,
  TimelineContractSchema,
  loadTimelineContract
} from '../contracts/timelineContract';
import {
  generateCinematicRenderManifest,
  writeCinematicRenderManifest
} from '../remotion/cinema/CinematicEpisode';
import { isRegisteredComponent, resolveSceneComponent } from '../remotion/cinema/componentRegistry';

console.log('══════════════════════════════════════════════════════════════════════════════════════');
console.log('🧪 EXECUTANDO TESTES DA ETAPA A: CONTRATO DE TIMELINE + COMPOSITOR CINEMATOGRÁFICO');
console.log('══════════════════════════════════════════════════════════════════════════════════════\n');

let allPassed = true;

// Helper de timeline válido
function createValidTimeline(overrides: Record<string, any> = {}) {
  return {
    episodeId: 'stage-a-dummy-episode',
    fps: 30,
    coldOpen: {
      sceneIds: ['SCENE_01', 'SCENE_02']
    },
    actBreaks: [2, 4],
    scenes: [
      { id: 'SCENE_01', component: 'DynamicDocumentaryMedia', durationSeconds: 8.0 },
      { id: 'SCENE_02', component: 'CinematicKeyframeDossier', durationSeconds: 8.0, take_type: 'KEYFRAME_DOSSIER' },
      { id: 'SCENE_03', component: 'TechnicalCutawaySchematic', durationSeconds: 5.0 },
      { id: 'SCENE_04', component: 'FlowDiscrepancyHUD', durationSeconds: 11.0 },
      { id: 'SCENE_05', component: 'AtomicStopwatch', durationSeconds: 7.0 },
      { id: 'SCENE_06', component: 'DynamicDocumentaryMedia', durationSeconds: 6.0 }
    ],
    hudWindows: [
      {
        componentName: 'AtomicStopwatch',
        appearances: [{ startScene: 1, seconds: 8 }]
      }
    ],
    audio: {
      musicBed: 'episodes/dummy/audio/bed.mp3',
      musicVolume: 0.22,
      voiceoverVolume: 1.0,
      sfxVolume: 0.45,
      ducking: true,
      duckedVolume: 0.12
    },
    ...overrides
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Validação de Component Registry
// ─────────────────────────────────────────────────────────────────────────────
console.log('[TEST A1] Validando registro e resolução de componentes...');
try {
  assert.equal(isRegisteredComponent('DynamicDocumentaryMedia'), true);
  assert.equal(isRegisteredComponent('FlowDiscrepancyHUD'), true);
  assert.equal(isRegisteredComponent('FakeAmateurComponent'), false);
  assert.doesNotThrow(() => resolveSceneComponent('DynamicDocumentaryMedia'));
  assert.throws(
    () => resolveSceneComponent('NonExistentComp'),
    /TIMELINE_UNKNOWN_COMPONENT/
  );
  console.log('✅ TEST A1 PASSOU: ComponentRegistry bloqueia componentes não registrados.');
} catch (err: any) {
  console.error('❌ FALHA NO TEST A1:', err.message);
  allPassed = false;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. TIMELINE_UNKNOWN_COMPONENT no Parse
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[TEST A2] Validando que componente desconhecido falha no parse com TIMELINE_UNKNOWN_COMPONENT...');
try {
  const invalidCompTimeline = createValidTimeline({
    scenes: [
      { id: 'SCENE_01', component: 'DynamicDocumentaryMedia', durationSeconds: 8.0 },
      { id: 'SCENE_02', component: 'AmateurHandmadeComponent', durationSeconds: 8.0 },
      { id: 'SCENE_03', component: 'TechnicalCutawaySchematic', durationSeconds: 5.0 },
      { id: 'SCENE_04', component: 'FlowDiscrepancyHUD', durationSeconds: 11.0 },
      { id: 'SCENE_05', component: 'AtomicStopwatch', durationSeconds: 7.0 },
      { id: 'SCENE_06', component: 'DynamicDocumentaryMedia', durationSeconds: 6.0 }
    ]
  });

  assert.throws(
    () => parseAndCalculateTimeline(invalidCompTimeline),
    /TIMELINE_UNKNOWN_COMPONENT/
  );
  console.log('✅ TEST A2 PASSOU: Componente desconhecido reprova estritamente no parse.');
} catch (err: any) {
  console.error('❌ FALHA NO TEST A2:', err.message);
  allPassed = false;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. TIMELINE_FLAT_PACING
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[TEST A3] Validando que cadência monótona flat reprova com TIMELINE_FLAT_PACING...');
try {
  const flatTimeline = createValidTimeline({
    scenes: [
      { id: 'SCENE_01', component: 'DynamicDocumentaryMedia', durationSeconds: 8.0 },
      { id: 'SCENE_02', component: 'CinematicKeyframeDossier', durationSeconds: 8.0 },
      { id: 'SCENE_03', component: 'TechnicalCutawaySchematic', durationSeconds: 8.1 },
      { id: 'SCENE_04', component: 'FlowDiscrepancyHUD', durationSeconds: 8.0 },
      { id: 'SCENE_05', component: 'AtomicStopwatch', durationSeconds: 8.2 },
      { id: 'SCENE_06', component: 'DynamicDocumentaryMedia', durationSeconds: 8.0 }
    ]
  });

  assert.throws(
    () => parseAndCalculateTimeline(flatTimeline),
    /TIMELINE_FLAT_PACING/
  );
  console.log('✅ TEST A3 PASSOU: TIMELINE_FLAT_PACING detecta e reprova monotonia >5 cenas consecutivas.');
} catch (err: any) {
  console.error('❌ FALHA NO TEST A3:', err.message);
  allPassed = false;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. TIMELINE_NO_ACT_STRUCTURE
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[TEST A4] Validando que ausência ou insuficiência de viradas de ato reprova com TIMELINE_NO_ACT_STRUCTURE...');
try {
  const noActsTimeline = createValidTimeline({
    actBreaks: [1] // apenas 1, mínimo é 2
  });

  assert.throws(
    () => parseAndCalculateTimeline(noActsTimeline),
    /TIMELINE_NO_ACT_STRUCTURE/
  );
  console.log('✅ TEST A4 PASSOU: TIMELINE_NO_ACT_STRUCTURE exige entre 2 e 4 actBreaks.');
} catch (err: any) {
  console.error('❌ FALHA NO TEST A4:', err.message);
  allPassed = false;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. TIMELINE_NO_COLD_OPEN
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[TEST A5] Validando que ausência de cold open (ou duração fora de 15-20s) reprova com TIMELINE_NO_COLD_OPEN...');
try {
  const noColdOpenTimeline = createValidTimeline({
    coldOpen: undefined
  });

  assert.throws(
    () => parseAndCalculateTimeline(noColdOpenTimeline),
    /TIMELINE_NO_COLD_OPEN/
  );

  const shortColdOpenTimeline = createValidTimeline({
    coldOpen: {
      sceneIds: ['SCENE_01'] // apenas 8s (<15s)
    }
  });

  assert.throws(
    () => parseAndCalculateTimeline(shortColdOpenTimeline),
    /TIMELINE_NO_COLD_OPEN/
  );
  console.log('✅ TEST A5 PASSOU: TIMELINE_NO_COLD_OPEN exige coldOpen estrito entre 15s e 20s.');
} catch (err: any) {
  console.error('❌ FALHA NO TEST A5:', err.message);
  allPassed = false;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. TIMELINE_NO_CLIMAX_BREATH
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[TEST A6] Validando que rajada <3s sem cena de respiro >=6s reprova com TIMELINE_NO_CLIMAX_BREATH...');
try {
  const noBreathTimeline = createValidTimeline({
    scenes: [
      { id: 'SCENE_01', component: 'DynamicDocumentaryMedia', durationSeconds: 8.0 },
      { id: 'SCENE_02', component: 'CinematicKeyframeDossier', durationSeconds: 8.0 },
      { id: 'SCENE_03', component: 'TechnicalCutawaySchematic', durationSeconds: 2.0 }, // rajada 1
      { id: 'SCENE_04', component: 'FlowDiscrepancyHUD', durationSeconds: 2.5 }, // rajada 2
      { id: 'SCENE_05', component: 'AtomicStopwatch', durationSeconds: 4.0 }, // FALHA: respiro de 4s (<6s)
      { id: 'SCENE_06', component: 'DynamicDocumentaryMedia', durationSeconds: 8.0 }
    ]
  });

  assert.throws(
    () => parseAndCalculateTimeline(noBreathTimeline),
    /TIMELINE_NO_CLIMAX_BREATH/
  );
  console.log('✅ TEST A6 PASSOU: TIMELINE_NO_CLIMAX_BREATH protege o ritmo após rajadas aceleradas.');
} catch (err: any) {
  console.error('❌ FALHA NO TEST A6:', err.message);
  allPassed = false;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Defaults Inteligentes: transition -> 'crossfade', camera inteligente
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[TEST A7] Validando defaults inteligentes de transição e câmera...');
try {
  const rawTimeline = createValidTimeline({
    scenes: [
      { id: 'SCENE_01', component: 'DynamicDocumentaryMedia', durationSeconds: 8.0, take_type: 'CINEMATIC_TAKE' },
      { id: 'SCENE_02', component: 'CinematicKeyframeDossier', durationSeconds: 8.0, take_type: 'KEYFRAME_DOSSIER' },
      { id: 'SCENE_03', component: 'TechnicalCutawaySchematic', durationSeconds: 5.0 },
      { id: 'SCENE_04', component: 'FlowDiscrepancyHUD', durationSeconds: 11.0 },
      { id: 'SCENE_05', component: 'AtomicStopwatch', durationSeconds: 7.0 },
      { id: 'SCENE_06', component: 'DynamicDocumentaryMedia', durationSeconds: 6.0 }
    ]
  });

  const calculated = parseAndCalculateTimeline(rawTimeline);
  assert.equal(calculated.scenes[0].transition, 'crossfade');
  assert.equal(calculated.scenes[0].camera, 'pushIn');
  assert.equal(calculated.scenes[1].camera, 'drift');
  // Cena 2 é actBreak ([2, 4]) -> ganha dipToBlack
  assert.equal(calculated.scenes[2].transition, 'dipToBlack');
  console.log('✅ TEST A7 PASSOU: Defaults inteligentes aplicados (crossfade, pushIn/drift, dipToBlack em actBreaks).');
} catch (err: any) {
  console.error('❌ FALHA NO TEST A7:', err.message);
  allPassed = false;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Render Manifest Generation
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[TEST A8] Validando geração e escrita de render_manifest.json...');
try {
  const validTimeline = createValidTimeline();
  const manifest = generateCinematicRenderManifest(validTimeline, 'test-run-001');
  assert.equal(manifest.compositor, 'CinematicEpisode');
  assert.equal(manifest.version, '3.0.0');
  assert.equal(manifest.duckingApplied, true);
  assert.equal(manifest.gradeApplied, true);
  assert.equal(manifest.transitionsApplied, 6);

  const manifestPath = writeCinematicRenderManifest(validTimeline, 'test-run-001');
  assert.equal(fs.existsSync(manifestPath), true);
  const written = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(written.compositor, 'CinematicEpisode');
  console.log(`✅ TEST A8 PASSOU: render_manifest.json gravado com sucesso em: ${manifestPath}`);
} catch (err: any) {
  console.error('❌ FALHA NO TEST A8:', err.message);
  allPassed = false;
}

if (!allPassed) {
  console.error('\n❌ ERROS DETECTADOS NOS TESTES DA ETAPA A.');
  process.exit(1);
} else {
  console.log('\n🎉 TODOS OS TESTES DA ETAPA A PASSARAM COM SUCESSO DETERMINÍSTICO!');
}
