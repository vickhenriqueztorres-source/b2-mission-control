import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { parseEpisodeContract } from '../contracts/episodeContract';
import { buildSceneContracts, RawSceneInput } from '../contracts/buildSceneContracts';
import { buildAudioBedPlan } from '../contracts/audioBedContract';
import { runAudioBedDispatch, validateAudioBed } from '../scripts/dispatchAudioBed';
import { PipelineContractGate } from '../pipeline/pipelineContractGate';

console.log('══════════════════════════════════════════════════════════════════════════════════════');
console.log('🧪 EXECUTANDO SUÍTE DE TESTES DO PLANO DE SFX, MÚSICA & MIX (AUDIO BED)');
console.log('══════════════════════════════════════════════════════════════════════════════════════');

async function runTests() {
  let allPassed = true;

  const contractPath = path.join(process.cwd(), 'contracts', 'episodes', 'gasolina-adulterada.episode.json');
  const scenesPath = path.join(process.cwd(), 'contracts', 'episodes', 'gasolina-adulterada.scenes.json');

  const episodeContract = parseEpisodeContract(contractPath);
  const rawScenes: RawSceneInput[] = JSON.parse(fs.readFileSync(scenesPath, 'utf8'));
  const sceneContracts = buildSceneContracts(episodeContract, rawScenes);

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 1: 30 cenas, music 360s, cine >= 2 cues, dossier >= 1 cue
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 1/6] Validando densidade e estrutura do plano de áudio (30 cenas, 360s)...');
  try {
    const plan = buildAudioBedPlan(episodeContract, sceneContracts, 'TEST_AUDIO_PLAN');

    const totalScenes = plan.totalScenes;
    const musicSeconds = plan.contract.music.targetSeconds;
    const sfxItems = plan.contract.sfx;

    const allDensityValid = sfxItems.every(item => {
      if (item.take_type === 'CINEMATIC_TAKE') return item.cues.length >= 2;
      if (item.take_type === 'KEYFRAME_DOSSIER') return item.cues.length >= 1;
      return false;
    });

    if (totalScenes === 30 && musicSeconds === 360.0 && allDensityValid && plan.totalSfxCues === 51) {
      console.log(`✅ TESTE 1 PASSOU: 30 cenas validadas com sucesso (${plan.totalSfxCues} cues substantivas, trilha ${musicSeconds}s).`);
    } else {
      console.error('❌ FALHA NO TESTE 1: Estrutura inválida:', { totalScenes, musicSeconds, allDensityValid });
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 1:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 2: GAS_001 e GAS_012 possuem termos substantivos do subject
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 2/6] Validando que descrições de SFX derivam dos elementos físicos da cena...');
  try {
    const plan = buildAudioBedPlan(episodeContract, sceneContracts, 'TEST_SUBJECT_TERMS');

    const gas001 = plan.contract.sfx.find(s => s.sceneId === 'GAS_001');
    const gas012 = plan.contract.sfx.find(s => s.sceneId === 'GAS_012');

    const gas001HasTerms = gas001?.cues.some(c => c.description.toLowerCase().includes('nozzle') || c.description.toLowerCase().includes('fuel'));
    const gas012HasTerms = gas012?.cues.some(c => c.description.toLowerCase().includes('microchip') || c.description.toLowerCase().includes('epoxy'));

    if (gas001HasTerms && gas012HasTerms) {
      console.log(`✅ TESTE 2 PASSOU: Descrições de SFX contêm termos substantivos dos objetos observados em cena.`);
    } else {
      console.error('❌ FALHA NO TESTE 2: Termos ausentes:', { gas001HasTerms, gas012HasTerms });
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 2:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 3: Dry-run NÃO cria arquivos .wav
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 3/6] Validando que dry-run de áudio não cria arquivos .wav...');
  try {
    const testRunId = 'TEST_DRY_AUDIO_NO_WAV';
    const testDir = path.join(process.cwd(), 'runs', 'gasolina-adulterada', testRunId);

    const { plan, wordStatus } = await runAudioBedDispatch({ runId: testRunId, forceDispatch: false });

    const sfxDir = path.join(testDir, 'audio', 'sfx');
    const musicDir = path.join(testDir, 'audio', 'music');
    const wavFiles = [
      ...(fs.existsSync(sfxDir) ? fs.readdirSync(sfxDir) : []),
      ...(fs.existsSync(musicDir) ? fs.readdirSync(musicDir) : [])
    ].filter(f => f.endsWith('.wav'));

    // Limpeza
    fs.rmSync(testDir, { recursive: true, force: true });

    if (wavFiles.length === 0 && wordStatus === 'AUDIO_DRY_ONLY') {
      console.log(`✅ TESTE 3 PASSOU: Dry-run de áudio executou sem criar arquivos físicos .wav (${wordStatus}).`);
    } else {
      console.error('❌ FALHA NO TESTE 3: Arquivos foram criados em dry-run:', wavFiles);
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 3:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 4: Gatekeeper sem stems acusa MISSING_STAGE: sfx, music e mix
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 4/6] Validando detecção de estágios de áudio ausentes no gatekeeper...');
  try {
    const testRunId = 'TEST_EMPTY_AUDIO_GATE';
    const testDir = path.join(process.cwd(), 'runs', 'gasolina-adulterada', testRunId);
    fs.mkdirSync(testDir, { recursive: true });

    const audit = PipelineContractGate.auditRun({
      runId: testRunId,
      runsDir: path.join(process.cwd(), 'runs', 'gasolina-adulterada'),
      contract: episodeContract,
      sceneContracts
    });

    // Limpeza
    fs.rmSync(testDir, { recursive: true, force: true });

    const hasMissingSfx = audit.failures.some(f => f.reason?.includes('MISSING_STAGE: sfx'));
    const hasMissingMusic = audit.failures.some(f => f.reason?.includes('MISSING_STAGE: music'));
    const hasMissingMix = audit.failures.some(f => f.reason?.includes('MISSING_STAGE: mix'));

    if (!audit.passed && hasMissingSfx && hasMissingMusic && hasMissingMix) {
      console.log(`✅ TESTE 4 PASSOU: Gatekeeper barrou com sucesso ausência de SFX, Trilha e Mix.`);
    } else {
      console.error('❌ FALHA NO TESTE 4: Falhas não detectadas:', { hasMissingSfx, hasMissingMusic, hasMissingMix, auditFailures: audit.failures });
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 4:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 5: AUDIO_DISPATCH=1 sem pack/engine lança STAGE_UNAVAILABLE
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 5/6] Validando proteção sem sound pack: STAGE_UNAVAILABLE e zero dummies...');
  try {
    let threw = false;
    try {
      await runAudioBedDispatch({ forceDispatch: true, runId: 'TEST_NO_AUDIO_PACK' });
    } catch (err: any) {
      threw = true;
      if (err.message.includes('STAGE_UNAVAILABLE: sfx / music')) {
        console.log(`✅ TESTE 5 PASSOU: Ausência de pack lançou STAGE_UNAVAILABLE com sucesso.`);
      } else {
        console.error('❌ FALHA NO TESTE 5: Mensagem de erro incorreta:', err.message);
        allPassed = false;
      }
    }

    if (!threw) {
      console.error('❌ FALHA NO TESTE 5: Disparo real sem sound pack não lançou erro!');
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 5:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 6: Mix sem narração bloqueia com MIX_BLOCKED: narration missing
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 6/6] Validando barreira de mixagem: bloqueio quando narração está ausente...');
  try {
    let threw = false;
    try {
      await runAudioBedDispatch({ stage: 'mix', forceDispatch: true, runId: 'TEST_MIX_WITHOUT_VO' });
    } catch (err: any) {
      threw = true;
      if (err.message.includes('MIX_BLOCKED: narration missing')) {
        console.log(`✅ TESTE 6 PASSOU: Mixagem bloqueada com sucesso por ausência de narração (MIX_BLOCKED).`);
      } else {
        console.error('❌ FALHA NO TESTE 6: Erro inesperado no bloqueio de mixagem:', err.message);
        allPassed = false;
      }
    }

    if (!threw) {
      console.error('❌ FALHA NO TESTE 6: Mixagem sem narração não foi bloqueada!');
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 6:', err.message);
    allPassed = false;
  }

  console.log('\n══════════════════════════════════════════════════════════════════════════════════════');
  if (allPassed) {
    console.log('🎉 TODOS OS TESTES DO PLANO DE SFX, MÚSICA & MIX PASSARAM COM SUCESSO DETERMINÍSTICO!');
    console.log('══════════════════════════════════════════════════════════════════════════════════════');
    process.exit(0);
  } else {
    console.error('❌ HOUVE FALHAS NA SUÍTE DE TESTES DE ÁUDIO!');
    console.log('══════════════════════════════════════════════════════════════════════════════════════');
    process.exit(1);
  }
}

runTests();
