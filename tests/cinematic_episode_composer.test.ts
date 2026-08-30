import path from 'path';
import fs from 'fs';
import {
  TimelineContractSchema,
  parseAndCalculateTimeline,
  loadTimelineContract
} from '../contracts/timelineContract';
import { parseEpisodeContract, RawEpisodeContractInputSchema } from '../contracts/episodeContract';
import { resolveSceneComponent, SCENE_COMPONENT_REGISTRY } from '../remotion/cinema/SceneRegistry';
import { EPISODE_GASOLINA_CALCULATED_TIMELINE } from '../remotion/episodeGasolinaTimelineData';

async function runCinematicEpisodeTests() {
  console.log('══════════════════════════════════════════════════════════════════════════════════════');
  console.log('🧪 SUÍTE DE TESTES: CAMADA CINEMATOGRÁFICA PADRÃO & COMPOSITOR GENÉRICO (REMOTION)');
  console.log('══════════════════════════════════════════════════════════════════════════════════════\n');

  let allPassed = true;

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 1: Regra de Ritmo Monótona (Reprova 6+ cenas com mesma duração +-10%)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('[TEST 1/8] Validando rejeição de timeline com cadência monótona (Regra de Ritmo)...');
  try {
    const monotonousTimeline = {
      episodeId: 'test-monotonous',
      scenes: [
        { id: 'SC_01', component: 'DynamicDocumentaryMedia', durationSeconds: 10 },
        { id: 'SC_02', component: 'DynamicDocumentaryMedia', durationSeconds: 10 },
        { id: 'SC_03', component: 'DynamicDocumentaryMedia', durationSeconds: 10 },
        { id: 'SC_04', component: 'DynamicDocumentaryMedia', durationSeconds: 10 },
        { id: 'SC_05', component: 'DynamicDocumentaryMedia', durationSeconds: 10 },
        { id: 'SC_06', component: 'DynamicDocumentaryMedia', durationSeconds: 10 }
      ]
    };

    let failedAsExpected = false;
    try {
      TimelineContractSchema.parse(monotonousTimeline);
    } catch (err: any) {
      if (err.message.includes('RHYTHM_VIOLATION_MONOTONOUS_CADENCE')) {
        failedAsExpected = true;
      }
    }

    if (failedAsExpected) {
      console.log('✅ TESTE 1 PASSOU: Timeline monótona foi rejeitada com RHYTHM_VIOLATION_MONOTONOUS_CADENCE.');
    } else {
      console.error('❌ FALHA NO TESTE 1: Timeline monótona foi aceita indevidamente!');
      allPassed = false;
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 1:', e.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 2: Aceitação de Timeline com Variação Rítmica Editorial
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 2/8] Validando aprovação de timeline com variação de ritmo dinâmico...');
  try {
    const variedTimeline = {
      episodeId: 'test-varied',
      scenes: [
        { id: 'SC_01', component: 'DynamicDocumentaryMedia', durationSeconds: 8 },
        { id: 'SC_02', component: 'DynamicDocumentaryMedia', durationSeconds: 15 },
        { id: 'SC_03', component: 'DynamicDocumentaryMedia', durationSeconds: 9 },
        { id: 'SC_04', component: 'DynamicDocumentaryMedia', durationSeconds: 16 },
        { id: 'SC_05', component: 'DynamicDocumentaryMedia', durationSeconds: 12 }
      ]
    };

    const parsed = TimelineContractSchema.parse(variedTimeline);
    if (parsed && parsed.scenes.length === 5) {
      console.log('✅ TESTE 2 PASSOU: Timeline com cadência dinâmica aprovada com sucesso.');
    } else {
      console.error('❌ FALHA NO TESTE 2: Timeline variada não foi processada corretamente.');
      allPassed = false;
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 2:', e.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 3: Fail-Safe Anti-Corte-Seco — Transição Padrão Crossfade
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 3/8] Validando default de transição (omissão de transição = crossfade, nunca corte seco)...');
  try {
    const rawSceneWithoutTransition = {
      episodeId: 'test-no-trans',
      scenes: [
        { id: 'SC_01', component: 'DynamicDocumentaryMedia', durationSeconds: 10 }
      ]
    };

    const calculated = parseAndCalculateTimeline(rawSceneWithoutTransition);
    const scene = calculated.scenes[0];

    if (scene.transition === 'crossfade') {
      console.log('✅ TESTE 3 PASSOU: Cena sem transição explícita ganhou "crossfade" por padrão.');
    } else {
      console.error('❌ FALHA NO TESTE 3: Transição padrão incorreta:', scene.transition);
      allPassed = false;
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 3:', e.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 4: Injeção Automática de dipToBlack nos actBreaks
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 4/8] Validando aplicação automática de dipToBlack em viradas de ato (actBreaks)...');
  try {
    const actBreakTimeline = {
      episodeId: 'test-act-breaks',
      actBreaks: [1], // Segunda cena é virada de ato
      scenes: [
        { id: 'SC_01', component: 'DynamicDocumentaryMedia', durationSeconds: 8 },
        { id: 'SC_02', component: 'DynamicDocumentaryMedia', durationSeconds: 14 }
      ]
    };

    const calculated = parseAndCalculateTimeline(actBreakTimeline);
    const scene0 = calculated.scenes[0];
    const scene1 = calculated.scenes[1];

    if (scene0.transition === 'crossfade' && scene1.transition === 'dipToBlack' && scene1.isActBreak) {
      console.log('✅ TESTE 4 PASSOU: Cena de virada de ato recebeu automaticamente dipToBlack.');
    } else {
      console.error('❌ FALHA NO TESTE 4: Transição de virada de ato incorreta:', scene1);
      allPassed = false;
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 4:', e.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 5: Câmera Padrão Inteligente por Tipo de Cena (PushIn vs Drift)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 5/8] Validando defaults de câmera (pushIn para vídeo, drift para dossiê)...');
  try {
    const cameraTimeline = {
      episodeId: 'test-camera',
      scenes: [
        { id: 'SC_TAKE', component: 'DynamicDocumentaryMedia', take_type: 'CINEMATIC_TAKE', durationSeconds: 8 },
        { id: 'SC_DOSSIER', component: 'FlowMeterPulserSchematicHUD', take_type: 'KEYFRAME_DOSSIER', durationSeconds: 12 }
      ]
    };

    const calculated = parseAndCalculateTimeline(cameraTimeline);
    const takeScene = calculated.scenes[0];
    const dossierScene = calculated.scenes[1];

    if (takeScene.camera === 'pushIn' && dossierScene.camera === 'drift') {
      console.log('✅ TESTE 5 PASSOU: Câmeras atribuídas corretamente (pushIn para take, drift para dossiê).');
    } else {
      console.error('❌ FALHA NO TESTE 5: Câmeras padrão incorretas:', { take: takeScene.camera, dossier: dossierScene.camera });
      allPassed = false;
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 5:', e.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 6: EpisodeContract Exige cinematic_grade em requiredStages
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 6/8] Validando exigência de "cinematic_grade" em EpisodeContract...');
  try {
    const invalidContractInput = {
      episodeId: 'test-no-cinema',
      title: 'Teste Sem Cinema',
      theme: 'Tema',
      domainTags: ['tag1', 'tag2', 'tag3'],
      targetDurationSeconds: 300,
      minScenes: 5,
      requiredStages: [
        'narration',
        'visuals',
        'sfx',
        'music',
        'mix',
        'thumbnail',
        'render'
        // Faltando 'cinematic_grade'
      ],
      voiceProfile: 'Chris',
      musicMood: 'dark',
      sfxDensity: 'high'
    };

    let rejectedWithoutCinematicGrade = false;
    try {
      RawEpisodeContractInputSchema.parse(invalidContractInput);
    } catch {
      rejectedWithoutCinematicGrade = true;
    }

    const validContractInput = {
      ...invalidContractInput,
      requiredStages: [
        'narration',
        'visuals',
        'sfx',
        'music',
        'mix',
        'thumbnail',
        'render',
        'cinematic_grade'
      ]
    };

    const parsedValid = RawEpisodeContractInputSchema.parse(validContractInput);

    if (rejectedWithoutCinematicGrade && parsedValid) {
      console.log('✅ TESTE 6 PASSOU: EpisodeContract exige obrigatoriamente "cinematic_grade".');
    } else {
      console.error('❌ FALHA NO TESTE 6: Validação de requiredStages falhou!');
      allPassed = false;
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 6:', e.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 7: Resolução Dinâmica de Componentes no SceneRegistry
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 7/8] Validando SceneRegistry e fallback seguro de componentes...');
  try {
    const registeredComp = resolveSceneComponent('FlowMeterPulserSchematicHUD');
    const fallbackComp = resolveSceneComponent('ComponenteInexistenteDesconhecido');

    if (registeredComp === SCENE_COMPONENT_REGISTRY.FlowMeterPulserSchematicHUD && fallbackComp === SCENE_COMPONENT_REGISTRY.DynamicDocumentaryMedia) {
      console.log('✅ TESTE 7 PASSOU: SceneRegistry resolveu componente específico e aplicou fallback seguro.');
    } else {
      console.error('❌ FALHA NO TESTE 7: SceneRegistry não resolveu os componentes esperados.');
      allPassed = false;
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 7:', e.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 8: Piloto Gasolina Adulterada & Episódio Dummy Orientado a Dados
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 8/8] Validando piloto Gasolina e episódio dummy orientados a dados...');
  try {
    // 1. Validar episódio dummy de teste
    const dummyTimelineFile = path.join(process.cwd(), 'contracts', 'episodes', 'test-cinema-pilot.timeline.json');
    const dummyCalculated = loadTimelineContract(dummyTimelineFile);

    if (dummyCalculated.scenes.length !== 5 || dummyCalculated.totalDurationFrames !== 1800) {
      throw new Error(`Dummy timeline com duração inesperada: ${dummyCalculated.totalDurationFrames} frames.`);
    }

    // 2. Validar piloto Gasolina
    if (EPISODE_GASOLINA_CALCULATED_TIMELINE.scenes.length !== 30) {
      throw new Error(`Piloto Gasolina com número incorreto de cenas: ${EPISODE_GASOLINA_CALCULATED_TIMELINE.scenes.length}`);
    }

    if (EPISODE_GASOLINA_CALCULATED_TIMELINE.totalDurationFrames !== 10800) {
      throw new Error(`Piloto Gasolina deve ter exatamente 10.800 frames (360s). Obtido: ${EPISODE_GASOLINA_CALCULATED_TIMELINE.totalDurationFrames}`);
    }

    console.log('✅ TESTE 8 PASSOU: Piloto Gasolina e episódio dummy orientados a dados 100% integrados.');
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 8:', e.message);
    allPassed = false;
  }

  console.log('\n══════════════════════════════════════════════════════════════════════════════════════');
  if (allPassed) {
    console.log('🎉 TODOS OS TESTES DA CAMADA CINEMATOGRÁFICA PASSARAM COM SUCESSO (8/8)!');
    console.log('══════════════════════════════════════════════════════════════════════════════════════\n');
    process.exit(0);
  } else {
    console.error('❌ HOUVE FALHAS NA SUÍTE DE TESTES CINEMATOGRÁFICOS!');
    console.log('══════════════════════════════════════════════════════════════════════════════════════\n');
    process.exit(1);
  }
}

runCinematicEpisodeTests();
