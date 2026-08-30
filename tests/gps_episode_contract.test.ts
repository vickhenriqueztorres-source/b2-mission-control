import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { parseEpisodeContract } from '../contracts/episodeContract';
import { TimelineContractSchema, parseAndCalculateTimeline } from '../contracts/timelineContract';
import {
  GPS_TIMELINE_CONTRACT,
  EPISODE_GPS_CALCULATED_TIMELINE,
  EPISODE_GPS_TOTAL_FRAMES
} from '../remotion/episodeGpsTimelineData';
import { generateCinematicRenderManifest } from '../remotion/cinema/CinematicEpisode';

console.log('══════════════════════════════════════════════════════════════════════════════════════');
console.log('🧪 TESTE DE VALIDAÇÃO: EPISÓDIO GPS-TEMPO (A FÍSICA DO TEMPO // EINSTEIN)');
console.log('══════════════════════════════════════════════════════════════════════════════════════\n');

let allPassed = true;

// 1. Validação do Episode Contract
console.log('[TEST GPS-1] Validando contrato de episódio (gps-tempo.episode.json)...');
try {
  const contractPath = path.join(process.cwd(), 'contracts', 'episodes', 'gps-tempo.episode.json');
  const contract = parseEpisodeContract(contractPath);
  assert.equal(contract.episodeId, 'gps-tempo');
  assert.equal(contract.minScenes, 30);
  assert.equal(contract.targetDurationSeconds, 360);
  assert.ok(contract.requiredStages.includes('cinematic_grade'));
  console.log('✅ TEST GPS-1 PASSOU: Contrato de episódio válido com todos os estágios obrigatórios.');
} catch (err: any) {
  console.error('❌ FALHA NO TEST GPS-1:', err.message);
  allPassed = false;
}

// 2. Validação do Timeline Contract Schema
console.log('\n[TEST GPS-2] Validando TimelineContractSchema do episódio...');
try {
  const result = TimelineContractSchema.safeParse(GPS_TIMELINE_CONTRACT);
  assert.equal(result.success, true, 'GPS_TIMELINE_CONTRACT deve passar com 100% de conformidade no Zod schema');
  console.log('✅ TEST GPS-2 PASSOU: Timeline do GPS aprovado sem nenhuma violação de ritmo ou estrutura.');
} catch (err: any) {
  console.error('❌ FALHA NO TEST GPS-2:', err.message);
  allPassed = false;
}

// 3. Validação das 30 Cenas e Cálculos de Frame
console.log('\n[TEST GPS-3] Validando 30 cenas canônicas e limites de frame...');
try {
  const calc = EPISODE_GPS_CALCULATED_TIMELINE;
  assert.equal(calc.scenes.length, 30, 'Deve conter exatamente 30 cenas');
  assert.equal(calc.actBreaks.length, 3, 'Deve conter 3 actBreaks');
  assert.ok(calc.coldOpen, 'Deve ter coldOpen definido');
  assert.equal(calc.coldOpen.sceneIds.length, 2, 'Cold open composto por 2 cenas');

  // Cold open total seconds (8 + 9 = 17s)
  const coldOpenSeconds = calc.scenes
    .filter((s) => calc.coldOpen?.sceneIds.includes(s.id))
    .reduce((acc, s) => acc + s.durationSeconds, 0);
  assert.ok(coldOpenSeconds >= 15 && coldOpenSeconds <= 20, `Cold open (${coldOpenSeconds}s) deve estar entre 15s e 20s`);

  // Duração total em frames
  assert.equal(calc.totalDurationFrames, EPISODE_GPS_TOTAL_FRAMES, 'Total de frames deve ser 10.800 (360s * 30fps)');
  console.log('✅ TEST GPS-3 PASSOU: 30 cenas com 10.800 frames e cold open de 17.0s rigorosamente cravado.');
} catch (err: any) {
  console.error('❌ FALHA NO TEST GPS-3:', err.message);
  allPassed = false;
}

// 4. Validação de Geração do Render Manifest
console.log('\n[TEST GPS-4] Validando manifesto de renderização cinemático...');
try {
  const manifest = generateCinematicRenderManifest(EPISODE_GPS_CALCULATED_TIMELINE);
  assert.equal(manifest.compositor, 'CinematicEpisode');
  assert.equal(manifest.transitionsApplied, 30);
  assert.equal(manifest.duckingApplied, true);
  assert.equal(manifest.gradeApplied, true);
  console.log('✅ TEST GPS-4 PASSOU: Render manifest compatível com CinematicEpisode e Gatekeeper.');
} catch (err: any) {
  console.error('❌ FALHA NO TEST GPS-4:', err.message);
  allPassed = false;
}

if (!allPassed) {
  console.error('\n❌ ERROS DETECTADOS NO CONTRATO DO EPISÓDIO GPS-TEMPO.');
  process.exit(1);
} else {
  console.log('\n🎉 EPISÓDIO GPS-TEMPO TOTALMENTE CONFORME E PRONTO PARA O MOTOR CINEMATOGRÁFICO!');
}
