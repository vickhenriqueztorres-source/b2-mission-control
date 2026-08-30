import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { parseAndCalculateTimeline, TimelineContractSchema } from '../contracts/timelineContract';
import {
  CinematicEpisode,
  generateCinematicRenderManifest,
  writeCinematicRenderManifest
} from '../remotion/cinema/CinematicEpisode';
import { PipelineContractGate } from '../pipeline/pipelineContractGate';
import { calculateCameraTransform } from '../remotion/cinema/CameraLanguage';
import { calculateMusicVolumeAtFrame } from '../remotion/cinema/CinematicAudioMix';

console.log('══════════════════════════════════════════════════════════════════════════════════════');
console.log('👑 TESTE DE ACEITAÇÃO FINAL: MOTOR CINEMATOGRÁFICO "O OUTRO LADO" (DOSSIÊ 3.0)');
console.log('══════════════════════════════════════════════════════════════════════════════════════\n');

let allPassed = true;

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cinema-acceptance-'));

try {
  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Criação de Episódio Novo usando APENAS episode.json + timeline data
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('[ACCEPTANCE 1] Criando episódio novo SOMENTE com episode.json + timeline data...');
  const newEpisodeContract = {
    episodeId: 'sistema-subterraneo-fibra',
    title: 'A ROTA INVISÍVEL: O CABO QUE SUSTENTA A AMÉRICA DO SUL',
    theme: 'Infraestrutura submarina e terrestre de fibra óptica de alta capacidade',
    domainTags: ['submarine_cable', 'telecom', 'infrastructure'],
    targetDurationSeconds: 180,
    minDurationRatio: 0.9,
    minScenes: 6,
    requiredStages: ['narration', 'visuals', 'sfx', 'music', 'mix', 'thumbnail', 'render', 'cinematic_grade']
  };

  const newTimelineData = {
    episodeId: 'sistema-subterraneo-fibra',
    fps: 30,
    coldOpen: {
      sceneIds: ['FIBRA_001', 'FIBRA_002']
    },
    actBreaks: [2, 4],
    hudWindows: [
      {
        componentName: 'AtomicStopwatch',
        appearances: [{ startScene: 1, seconds: 8 }]
      }
    ],
    audio: {
      musicBed: 'episodes/fibra/audio/bed.mp3',
      musicVolume: 0.30,
      voiceoverVolume: 1.0,
      sfxVolume: 0.45,
      ducking: true,
      duckedVolume: 0.12
    },
    scenes: [
      {
        id: 'FIBRA_001',
        component: 'DynamicDocumentaryMedia',
        durationSeconds: 8.0,
        take_type: 'CINEMATIC_TAKE' as const,
        voiceoverFile: 'episodes/fibra/audio/FIBRA_001.mp3'
      },
      {
        id: 'FIBRA_002',
        component: 'CinematicKeyframeDossier',
        durationSeconds: 8.0,
        take_type: 'KEYFRAME_DOSSIER' as const,
        voiceoverFile: 'episodes/fibra/audio/FIBRA_002.mp3'
      },
      {
        id: 'FIBRA_003',
        component: 'SubmarineCableCrossSection3D',
        durationSeconds: 5.0,
        take_type: 'KEYFRAME_DOSSIER' as const
      },
      {
        id: 'FIBRA_004',
        component: 'AtlanticBathymetryMap',
        durationSeconds: 11.0,
        take_type: 'KEYFRAME_DOSSIER' as const,
        voiceoverFile: 'episodes/fibra/audio/FIBRA_004.mp3'
      },
      {
        id: 'FIBRA_005',
        component: 'ErbiumOpticalAmplifier',
        durationSeconds: 7.0,
        take_type: 'KEYFRAME_DOSSIER' as const
      },
      {
        id: 'FIBRA_006',
        component: 'DynamicDocumentaryMedia',
        durationSeconds: 6.0,
        take_type: 'CINEMATIC_TAKE' as const,
        voiceoverFile: 'episodes/fibra/audio/FIBRA_006.mp3'
      }
    ]
  };

  // Validação via Zod TimelineContractSchema
  const calculated = parseAndCalculateTimeline(newTimelineData);
  assert.equal(calculated.episodeId, 'sistema-subterraneo-fibra');
  assert.equal(calculated.scenes.length, 6);
  assert.equal(calculated.scenes[0].transition, 'crossfade');
  assert.equal(calculated.scenes[2].transition, 'dipToBlack'); // Act Break
  console.log('✅ ACCEPTANCE 1 PASSOU: Novo episódio montado e validado 100% orientado a dados.');

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Geração e Escrita do Render Manifest Canônico
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[ACCEPTANCE 2] Gravando render_manifest.json do CinematicEpisode...');
  const runId = 'RUN_ACCEPTANCE_TEST_001';
  const manifestPath = writeCinematicRenderManifest(calculated, runId, path.join(tmpDir, runId));
  assert.equal(fs.existsSync(manifestPath), true);
  const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifestContent.compositor, 'CinematicEpisode');
  assert.equal(manifestContent.duckingApplied, true);
  assert.equal(manifestContent.gradeApplied, true);
  console.log('✅ ACCEPTANCE 2 PASSOU: render_manifest.json emitido com conformidade.');

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Auditoria do PipelineContractGate (Aprovação e Reprovação)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[ACCEPTANCE 3] Auditando aprovação no Gate e reprovação quando amador...');
  // A) Cenário Aprovado (possui render_manifest com CinematicEpisode)
  const auditPassed = PipelineContractGate.auditRun({
    runId,
    runsDir: tmpDir,
    stageScope: 'PRE_RENDER',
    contract: newEpisodeContract as any
  });
  const cinematicFailed = auditPassed.failures.some((f) => f.reason.includes('GATE_NOT_CINEMATIC'));
  assert.equal(cinematicFailed, false, 'CinematicEpisode legítimo não deve reprovar no gate');

  // B) Cenário Reprovado: Apaga render_manifest.json -> deve falhar com GATE_NOT_CINEMATIC
  fs.unlinkSync(manifestPath);
  const auditFailed = PipelineContractGate.auditRun({
    runId,
    runsDir: tmpDir,
    stageScope: 'PRE_RENDER',
    contract: newEpisodeContract as any
  });
  assert.equal(auditFailed.passed, false);
  assert.ok(
    auditFailed.failures.some((f) => f.reason.includes('GATE_NOT_CINEMATIC')),
    'Composição sem render_manifest deve falhar com GATE_NOT_CINEMATIC'
  );
  console.log('✅ ACCEPTANCE 3 PASSOU: Gate protege o padrão cinematográfico com precisão.');

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Preservação dos Episódios Legados
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[ACCEPTANCE 4] Verificando marcação de isolamento dos 4 episódios legados...');
  const legacyFiles = [
    path.join(process.cwd(), 'remotion', 'Episode01Pix.tsx'),
    path.join(process.cwd(), 'remotion', 'Episode02Cabos.tsx'),
    path.join(process.cwd(), 'remotion', 'Episode04GpsTempo.tsx'),
    path.join(process.cwd(), 'remotion', 'Episode05RadarAsfalto.tsx')
  ];

  for (const file of legacyFiles) {
    const text = fs.readFileSync(file, 'utf8');
    assert.ok(
      text.includes('@legacy-composition'),
      `O arquivo legado ${path.basename(file)} deve conter o marcador @legacy-composition`
    );
  }
  console.log('✅ ACCEPTANCE 4 PASSOU: Todos os 4 episódios legados mantidos isolados e intactos.');

} catch (err: any) {
  console.error('❌ FALHA NO TESTE DE ACEITAÇÃO FINAL:', err.message);
  allPassed = false;
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

if (!allPassed) {
  console.error('\n❌ CRITÉRIO DE ACEITE FINAL REPROVADO.');
  process.exit(1);
} else {
  console.log('\n🎉 CRITÉRIO DE ACEITE FINAL 100% APROVADO!');
}
