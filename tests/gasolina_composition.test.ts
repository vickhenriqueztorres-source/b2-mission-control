import fs from 'fs';
import path from 'path';
import assert from 'assert';
import {
  EPISODE_GASOLINA_TOTAL_SECONDS,
  EPISODE_GASOLINA_TOTAL_FRAMES,
  EPISODE_GASOLINA_FPS,
  EPISODE_GASOLINA_TIMELINE,
  DOSSIER_SCENE_IDS,
  buildGasolinaTimeline
} from '../remotion/episodeGasolinaTimelineData';
import { validateRenderPreconditions } from '../scripts/renderGasolinaMaster';

console.log('══════════════════════════════════════════════════════════════════════════════════════');
console.log('🧪 EXECUTANDO SUÍTE DE TESTES DA COMPOSIÇÃO REMOTION (EPISODE GASOLINA)');
console.log('══════════════════════════════════════════════════════════════════════════════════════');

async function runTests() {
  let allPassed = true;

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 1: Timeline possui 30 cenas, 10800 frames (360s * 30 fps), GAS_001..030
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 1/5] Validando timeline da composição (30 cenas, 10800 frames, 30 fps)...');
  try {
    const timeline = buildGasolinaTimeline();
    const totalScenes = timeline.length;
    const firstScene = timeline[0];
    const lastScene = timeline[timeline.length - 1];

    const has30Scenes = totalScenes === 30;
    const isGas001First = firstScene.sceneId === 'GAS_001';
    const isGas030Last = lastScene.sceneId === 'GAS_030';
    const totalFramesMatch = EPISODE_GASOLINA_TOTAL_FRAMES === 10800;
    const totalSecondsMatch = EPISODE_GASOLINA_TOTAL_SECONDS === 360.0;
    const endFrameMatches = lastScene.endFrame === 10800;

    if (has30Scenes && isGas001First && isGas030Last && totalFramesMatch && totalSecondsMatch && endFrameMatches) {
      console.log(`✅ TESTE 1 PASSOU: Timeline contém exatamente 30 cenas sequenciais somando 10800 frames (360.0s a 30 fps).`);
    } else {
      console.error('❌ FALHA NO TESTE 1: Discrepância na timeline:', {
        totalScenes,
        firstSceneId: firstScene.sceneId,
        lastSceneId: lastScene.sceneId,
        lastEndFrame: lastScene.endFrame,
        totalFrames: EPISODE_GASOLINA_TOTAL_FRAMES
      });
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 1:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 2: Nenhuma exportação pública contém a duração legada de 84.03s
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 2/5] Validando erradicação do valor legado 84.03s na timeline data...');
  try {
    const timelineDataFile = path.join(process.cwd(), 'remotion', 'episodeGasolinaTimelineData.ts');
    const content = fs.readFileSync(timelineDataFile, 'utf8');

    const contains84 = content.includes('84.03') || content.includes('84.0');
    const exports360 = content.includes('EPISODE_GASOLINA_TOTAL_SECONDS = 360.0');

    if (!contains84 && exports360) {
      console.log(`✅ TESTE 2 PASSOU: 84.03s totalmente erradicado da timeline data (exporta 360.0s e 10800 frames).`);
    } else {
      console.error('❌ FALHA NO TESTE 2: Menção a 84.03s encontrada em episodeGasolinaTimelineData.ts.');
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 2:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 3: HUD allowlist é estritamente as 9 cenas de dossiê
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 3/5] Validando allowlist de HUDs nos 9 IDs canônicos de Dossiê...');
  try {
    const expectedDossier = [
      'GAS_004', 'GAS_005', 'GAS_008', 'GAS_013', 'GAS_015',
      'GAS_016', 'GAS_021', 'GAS_026', 'GAS_027'
    ];

    const isMatch = DOSSIER_SCENE_IDS.length === 9 &&
      expectedDossier.every(id => DOSSIER_SCENE_IDS.includes(id as any));

    const timeline = buildGasolinaTimeline();
    const dossierInTimeline = timeline.filter(s => s.take_type === 'KEYFRAME_DOSSIER').map(s => s.sceneId);

    const timelineMatchesDossier = dossierInTimeline.length === 9 &&
      expectedDossier.every(id => dossierInTimeline.includes(id));

    if (isMatch && timelineMatchesDossier) {
      console.log(`✅ TESTE 3 PASSOU: Allowlist de HUDs configurada com precisão cirúrgica para as 9 cenas de Dossiê.`);
    } else {
      console.error('❌ FALHA NO TESTE 3: Allowlist de dossiê incorreta:', { DOSSIER_SCENE_IDS, dossierInTimeline });
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 3:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 4: renderGasolinaMaster acusa RENDER_BLOCKED sem assets no disco
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 4/5] Validando pré-condição de render: bloqueio estrito com RENDER_BLOCKED...');
  try {
    const masterCheck = validateRenderPreconditions({ preview: false });
    const previewCheck = validateRenderPreconditions({ preview: true });

    const masterBlocked = !masterCheck.passed && masterCheck.reason?.startsWith('RENDER_BLOCKED:');
    const previewBlocked = !previewCheck.passed && previewCheck.reason?.startsWith('RENDER_BLOCKED:');

    if (masterBlocked && previewBlocked) {
      console.log(`✅ TESTE 4 PASSOU: Renderização master e preview bloqueadas com sucesso no gate (${masterCheck.reason}). Remotion protegido.`);
    } else {
      console.error('❌ FALHA NO TESTE 4: Renderização não foi bloqueada corretamente:', { masterCheck, previewCheck });
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 4:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 5: EpisodeGasolina.tsx 100% livre de Episode02SoundTrack
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 5/5] Validando isolamento total de áudio legado em EpisodeGasolina.tsx...');
  try {
    const componentFile = path.join(process.cwd(), 'remotion', 'EpisodeGasolina.tsx');
    const content = fs.readFileSync(componentFile, 'utf8');

    const hasLegacySoundtrack = content.includes('Episode02SoundTrack') || content.includes('Episode01SoundTrack');

    if (!hasLegacySoundtrack) {
      console.log(`✅ TESTE 5 PASSOU: EpisodeGasolina.tsx 100% isolado de trilhas de áudio legadas.`);
    } else {
      console.error('❌ FALHA NO TESTE 5: Importação de trilha legada detectada em EpisodeGasolina.tsx.');
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 5:', err.message);
    allPassed = false;
  }

  console.log('\n══════════════════════════════════════════════════════════════════════════════════════');
  if (allPassed) {
    console.log('🎉 TODOS OS TESTES DA COMPOSIÇÃO REMOTION PASSARAM COM SUCESSO DETERMINÍSTICO!');
    console.log('══════════════════════════════════════════════════════════════════════════════════════');
    process.exit(0);
  } else {
    console.error('❌ HOUVE FALHAS NA SUÍTE DE TESTES DA COMPOSIÇÃO!');
    console.log('══════════════════════════════════════════════════════════════════════════════════════');
    process.exit(1);
  }
}

runTests();
